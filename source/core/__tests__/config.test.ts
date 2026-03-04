// source/core/__tests__/config.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import os from 'os';

// We'll test getConfigDir, loadConfig, saveConfig
describe('config', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'solodev-test-'));
    process.env['XDG_CONFIG_HOME'] = tmpDir;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env['XDG_CONFIG_HOME'];
  });

  it('should return config dir under XDG_CONFIG_HOME', async () => {
    const { getConfigDir } = await import('../config.js');
    const dir = getConfigDir();
    expect(dir).toBe(path.join(tmpDir, 'solodev'));
  });

  it('should return default config when no file exists', async () => {
    const { loadConfig } = await import('../config.js');
    const config = loadConfig();
    expect(config).toEqual({
      version: 1,
      pluginDir: null,
      defaultPermissionMode: 'default',
      editor: null,
    });
  });

  it('should save and load config', async () => {
    const { saveConfig, loadConfig, getConfigDir } = await import('../config.js');
    fs.mkdirSync(getConfigDir(), { recursive: true });
    saveConfig({ version: 1, pluginDir: '/custom', defaultPermissionMode: 'acceptEdits', editor: 'vim' });
    const loaded = loadConfig();
    expect(loaded.pluginDir).toBe('/custom');
    expect(loaded.defaultPermissionMode).toBe('acceptEdits');
  });
});
