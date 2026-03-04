// source/core/__tests__/pipeline.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('pipeline', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'solodev-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should return all steps as not_started for empty directory', async () => {
    const { scanPipeline } = await import('../pipeline.js');
    const steps = scanPipeline(tmpDir);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.every(s => s.status === 'not_started')).toBe(true);
  });

  it('should detect a completed step', async () => {
    const { scanPipeline } = await import('../pipeline.js');
    const sparkDir = path.join(tmpDir, '.spark');
    fs.mkdirSync(sparkDir);
    fs.writeFileSync(path.join(sparkDir, 'state.json'), JSON.stringify({ status: 'complete' }));
    const steps = scanPipeline(tmpDir);
    const spark = steps.find(s => s.pluginName === 'idea-spark');
    expect(spark!.status).toBe('complete');
  });

  it('should detect an in-progress step', async () => {
    const { scanPipeline } = await import('../pipeline.js');
    const buildDir = path.join(tmpDir, '.build');
    fs.mkdirSync(buildDir);
    fs.writeFileSync(path.join(buildDir, 'state.json'), JSON.stringify({ status: 'in_progress' }));
    const steps = scanPipeline(tmpDir);
    const build = steps.find(s => s.pluginName === 'build-engine');
    expect(build!.status).toBe('in_progress');
  });

  it('should detect directory without state.json as complete', async () => {
    const { scanPipeline } = await import('../pipeline.js');
    const sparkDir = path.join(tmpDir, '.spark');
    fs.mkdirSync(sparkDir);
    // No state.json — directory exists, assume complete
    const steps = scanPipeline(tmpDir);
    const spark = steps.find(s => s.pluginName === 'idea-spark');
    expect(spark!.status).toBe('complete');
  });

  it('should suggest next step', async () => {
    const { scanPipeline, suggestNext } = await import('../pipeline.js');
    const steps = scanPipeline(tmpDir);
    const next = suggestNext(steps);
    expect(next).toBeTruthy();
    expect(next!.pluginName).toBe('idea-spark'); // first step when nothing done
  });

  it('should count completed steps', async () => {
    const { scanPipeline, countCompleted } = await import('../pipeline.js');
    fs.mkdirSync(path.join(tmpDir, '.spark'));
    fs.mkdirSync(path.join(tmpDir, '.stack'));
    const steps = scanPipeline(tmpDir);
    expect(countCompleted(steps)).toBe(2);
  });
});
