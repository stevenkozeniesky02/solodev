// source/core/__tests__/projects.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('projects', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'solodev-test-'));
    process.env['XDG_CONFIG_HOME'] = tmpDir;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env['XDG_CONFIG_HOME'];
  });

  it('should return empty list when no projects file exists', async () => {
    const { listProjects } = await import('../projects.js');
    const projects = listProjects();
    expect(projects).toEqual([]);
  });

  it('should add and retrieve a project', async () => {
    const { addProject, listProjects } = await import('../projects.js');
    fs.mkdirSync(path.join(tmpDir, 'solodev'), { recursive: true });
    const project = addProject('test-app', '/tmp/test-app');
    expect(project.name).toBe('test-app');
    expect(project.path).toBe('/tmp/test-app');
    expect(project.sessionId).toBeTruthy();
    expect(project.permissionMode).toBe('default');
    const all = listProjects();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('test-app');
  });

  it('should get a project by id', async () => {
    const { addProject, getProject } = await import('../projects.js');
    fs.mkdirSync(path.join(tmpDir, 'solodev'), { recursive: true });
    const added = addProject('test-app', '/tmp/test-app');
    const found = getProject(added.id);
    expect(found).toBeTruthy();
    expect(found!.name).toBe('test-app');
  });

  it('should remove a project', async () => {
    const { addProject, removeProject, listProjects } = await import('../projects.js');
    fs.mkdirSync(path.join(tmpDir, 'solodev'), { recursive: true });
    const added = addProject('test-app', '/tmp/test-app');
    removeProject(added.id);
    expect(listProjects()).toHaveLength(0);
  });

  it('should update lastOpenedAt', async () => {
    const { addProject, touchProject, getProject } = await import('../projects.js');
    fs.mkdirSync(path.join(tmpDir, 'solodev'), { recursive: true });
    const added = addProject('test-app', '/tmp/test-app');
    const before = added.lastOpenedAt;
    // Small delay to ensure timestamp differs
    await new Promise(r => setTimeout(r, 10));
    touchProject(added.id);
    const updated = getProject(added.id);
    expect(updated!.lastOpenedAt >= before).toBe(true);
  });
});
