// source/commands/status.ts
import { scanPipeline, suggestNext, countCompleted } from '../core/pipeline.js';
import { getProjectByPath } from '../core/projects.js';

export function showStatus(projectPath: string): void {
  const project = getProjectByPath(projectPath);
  const steps = scanPipeline(projectPath);
  const completed = countCompleted(steps);
  const suggested = suggestNext(steps);

  console.log(`\nProject: ${project?.name || projectPath}`);
  console.log(`Progress: ${completed}/${steps.length} steps\n`);

  for (const step of steps) {
    const icon = step.status === 'complete' ? '✅' :
                 step.status === 'in_progress' ? '🔨' : '  ';
    const idx = step.index.toString().padStart(2);
    console.log(`  ${icon} ${idx}. ${step.name.padEnd(22)} ${step.command}`);
  }

  if (suggested) {
    console.log(`\nNext: ${suggested.command} (${suggested.name})`);
  } else {
    console.log('\nAll steps complete!');
  }
  console.log('');
}
