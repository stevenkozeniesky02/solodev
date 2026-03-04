// source/core/config.ts
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface SolodevConfig {
  version: number;
  pluginDir: string | null;
  defaultPermissionMode: 'default' | 'acceptEdits' | 'bypassPermissions';
  editor: string | null;
}

const DEFAULT_CONFIG: SolodevConfig = {
  version: 1,
  pluginDir: null,
  defaultPermissionMode: 'default',
  editor: null,
};

export function getConfigDir(): string {
  const xdgConfig = process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
  return path.join(xdgConfig, 'solodev');
}

function getConfigPath(): string {
  return path.join(getConfigDir(), 'config.json');
}

export function loadConfig(): SolodevConfig {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }
  const raw = fs.readFileSync(configPath, 'utf-8');
  return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
}

export function saveConfig(config: SolodevConfig): void {
  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}
