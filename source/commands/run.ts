// source/commands/run.ts
import { getProjectByPath, addProject, touchProject } from '../core/projects.js';
import { getPluginDir } from '../core/plugins.js';
import { runClaude } from '../core/claude.js';

export async function runDirect(command: string, args: string[], projectPath: string): Promise<void> {
  let project = getProjectByPath(projectPath);
  if (!project) {
    const name = projectPath.split('/').pop() || 'project';
    project = addProject(name, projectPath);
  }

  const prompt = `/${command} ${args.join(' ')}`.trim();
  const pluginDir = getPluginDir();

  const { events, kill } = runClaude({
    prompt,
    sessionId: project.sessionId,
    isNewSession: false,
    pluginDir,
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
      if (code === 0) resolve();
      else reject(new Error(`Claude exited with code ${code}`));
    });

    process.on('SIGINT', () => {
      kill();
      process.exit(130);
    });
  });
}
