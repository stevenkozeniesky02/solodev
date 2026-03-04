// source/commands/run.ts
import { getProjectByPath, addProject, touchProject, markSessionStarted } from '../core/projects.js';
import { getPluginDirs } from '../core/plugins.js';
import { runClaude } from '../core/claude.js';

export async function runDirect(command: string, args: string[], projectPath: string): Promise<void> {
  let project = getProjectByPath(projectPath);
  if (!project) {
    const name = projectPath.split('/').pop() || 'project';
    project = addProject(name, projectPath);
  }

  const prompt = `/${command} ${args.join(' ')}`.trim();
  const pluginDirs = getPluginDirs();

  const { events, kill } = runClaude({
    prompt,
    sessionId: project.sessionId,
    isNewSession: !project.sessionStarted,
    pluginDirs,
    permissionMode: project.permissionMode,
  });

  return new Promise((resolve, reject) => {
    events.on('message', (msg: { type: string; content?: string }) => {
      if (msg.content) {
        process.stdout.write(msg.content + '\n');
      }
    });

    events.on('done', (code: number) => {
      touchProject(project!.id);
      if (code === 0) {
        markSessionStarted(project!.id);
        resolve();
      } else {
        reject(new Error(`Claude exited with code ${code}`));
      }
    });

    process.on('SIGINT', () => {
      kill();
      process.exit(130);
    });
  });
}
