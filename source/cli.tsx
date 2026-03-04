#!/usr/bin/env node
// source/cli.tsx
import React from 'react';
import { render } from 'ink';
import { program } from 'commander';
import { App } from './tui/App.js';

const pkg = { version: '0.1.0' };

program
  .name('solodev')
  .version(pkg.version)
  .description('Solo Dev Toolbox — 18 plugins, one pipeline, persistent context')
  .argument('[command]', 'Plugin command to run directly (e.g., spark, coverage)')
  .argument('[args...]', 'Arguments for the command')
  .option('--project <path>', 'Project directory (defaults to cwd)')
  .action(async (command?: string, args?: string[], options?: { project?: string }) => {
    const projectPath = options?.project || process.cwd();

    if (command === 'status') {
      const { showStatus } = await import('./commands/status.js');
      showStatus(projectPath);
      return;
    }

    if (command === 'reset') {
      const { resetProject } = await import('./commands/reset.js');
      resetProject(projectPath, args?.includes('--hard') || false);
      return;
    }

    if (command) {
      const { runDirect } = await import('./commands/run.js');
      try {
        await runDirect(command, args || [], projectPath);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
      return;
    }

    // Interactive TUI mode
    const { waitUntilExit } = render(<App />);
    await waitUntilExit();
  });

program.parse();
