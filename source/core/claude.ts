// source/core/claude.ts
import { spawn, execSync } from 'child_process';
import { EventEmitter } from 'events';

export interface ClaudeRunOptions {
  prompt: string;
  sessionId: string;
  isNewSession: boolean;
  pluginDir: string;
  permissionMode: 'default' | 'acceptEdits' | 'bypassPermissions';
}

export interface AuthStatus {
  loggedIn: boolean;
  email: string | null;
  subscriptionType: string | null;
}

export interface ClaudeStreamEvent {
  type: string;
  subtype?: string;
  message?: {
    content?: Array<{ type: string; text?: string; name?: string }>;
  };
  content?: string;
  result?: string;
}

/** Build a clean env with CLAUDECODE removed (not just empty). */
function cleanEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.CLAUDECODE;
  return env;
}

export function buildClaudeArgs(options: ClaudeRunOptions): string[] {
  const args: string[] = ['-p', options.prompt];

  if (options.isNewSession) {
    args.push('--session-id', options.sessionId);
  } else {
    args.push('--resume', options.sessionId);
  }

  args.push('--plugin-dir', options.pluginDir);
  args.push('--output-format', 'stream-json');
  args.push('--verbose');
  args.push('--permission-mode', options.permissionMode);

  return args;
}

export async function checkAuth(): Promise<AuthStatus> {
  try {
    const output = execSync('claude auth status --json', {
      encoding: 'utf-8',
      timeout: 10000,
      env: cleanEnv(),
    });
    const parsed = JSON.parse(output.trim());
    return {
      loggedIn: parsed.loggedIn ?? false,
      email: parsed.email ?? null,
      subscriptionType: parsed.subscriptionType ?? null,
    };
  } catch {
    return { loggedIn: false, email: null, subscriptionType: null };
  }
}

/** Extract displayable text from a stream-json event. */
function extractContent(event: ClaudeStreamEvent): string | null {
  // Assistant messages with text content
  if (event.type === 'assistant' && event.message?.content) {
    const texts = event.message.content
      .filter(c => c.type === 'text' && c.text)
      .map(c => c.text!);
    if (texts.length > 0) return texts.join('');

    // Tool use — show which tool is being called
    const tools = event.message.content
      .filter(c => c.type === 'tool_use' && c.name)
      .map(c => c.name!);
    if (tools.length > 0) return `> Using ${tools.join(', ')}`;
  }

  // Result messages
  if (event.type === 'result' && event.result) {
    return event.result;
  }

  // System init
  if (event.type === 'system' && event.subtype === 'init') {
    return '> Session initialized';
  }

  return null;
}

export function runClaude(options: ClaudeRunOptions): {
  events: EventEmitter;
  kill: () => void;
} {
  const args = buildClaudeArgs(options);
  const emitter = new EventEmitter();

  const child = spawn('claude', args, {
    env: cleanEnv(),
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let buffer = '';

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line) as ClaudeStreamEvent;
        const content = extractContent(parsed);
        emitter.emit('message', {
          type: parsed.type,
          subtype: parsed.subtype,
          content,
          raw: parsed,
        });
      } catch {
        emitter.emit('message', { type: 'text', content: line });
      }
    }
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk: string) => {
    emitter.emit('message', { type: 'error', content: chunk });
  });

  child.on('close', (code) => {
    if (buffer.trim()) {
      emitter.emit('message', { type: 'text', content: buffer });
    }
    emitter.emit('done', code);
  });

  child.on('error', (err) => {
    emitter.emit('message', { type: 'error', content: err.message });
    emitter.emit('done', 1);
  });

  return {
    events: emitter,
    kill: () => child.kill(),
  };
}
