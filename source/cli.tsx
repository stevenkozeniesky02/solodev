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
  .action((command?: string, args?: string[], options?: { project?: string }) => {
    if (command) {
      // Direct mode — TODO: implement in Task 12
      console.log(`Direct mode: /${command} ${(args || []).join(' ')}`);
      process.exit(0);
    }

    // Interactive TUI mode
    const { waitUntilExit } = render(<App />);
    waitUntilExit().then(() => process.exit(0));
  });

program.parse();
