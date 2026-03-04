// source/core/plugins.ts
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getPluginDir(): string {
  const config = loadConfig();

  // User-configured plugin dir takes priority
  if (config.pluginDir && fs.existsSync(config.pluginDir)) {
    return config.pluginDir;
  }

  // Bundled plugins (relative to dist/core/plugins.js -> ../../plugins)
  const bundled = path.resolve(__dirname, '../../plugins');
  if (fs.existsSync(bundled)) {
    return bundled;
  }

  throw new Error('No plugins found. Run solodev update-plugins or set pluginDir in config.');
}

export function listAvailablePlugins(): string[] {
  const dir = getPluginDir();
  return fs.readdirSync(dir).filter(f =>
    fs.statSync(path.join(dir, f)).isDirectory() &&
    fs.existsSync(path.join(dir, f, '.claude-plugin', 'plugin.json'))
  );
}
