// source/commands/reset.ts
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getProjectByPath, updateProjectSession } from '../core/projects.js';
import { scanPipeline } from '../core/pipeline.js';

export function resetProject(projectPath: string, hard: boolean): void {
  const project = getProjectByPath(projectPath);
  if (!project) {
    console.log('No solodev project found for this directory.');
    return;
  }

  // Reset session
  const newSessionId = uuidv4();
  updateProjectSession(project.id, newSessionId);
  console.log(`Session reset for ${project.name}`);

  if (hard) {
    const steps = scanPipeline(projectPath);
    for (const step of steps) {
      const dirPath = path.join(projectPath, step.dotDir);
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`  Removed ${step.dotDir}/`);
      }
    }
    console.log('All plugin outputs removed.');
  }
}
