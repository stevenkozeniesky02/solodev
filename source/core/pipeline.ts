// source/core/pipeline.ts

export interface PipelineStep {
  index: number;
  name: string;
  command: string;
  dotDir: string;
  pluginName: string;
  status: 'not_started' | 'in_progress' | 'complete';
  category: 'validate' | 'build' | 'harden' | 'ship';
}

const PIPELINE_STEPS: Omit<PipelineStep, 'status'>[] = [
  { index: 1,  name: 'Idea Validation',      command: '/idea-spark:spark',          dotDir: '.spark',       pluginName: 'idea-spark',       category: 'validate' },
  { index: 2,  name: 'Tech Stack',           command: '/stack-pick:stack',          dotDir: '.stack',       pluginName: 'stack-pick',       category: 'validate' },
  { index: 3,  name: 'Scaffold',             command: '/scaffold-kit:scaffold',     dotDir: '.scaffold',    pluginName: 'scaffold-kit',     category: 'validate' },
  { index: 4,  name: 'Roadmap',              command: '/codebase-roadmap:generate', dotDir: '.roadmap',     pluginName: 'codebase-roadmap', category: 'build' },
  { index: 5,  name: 'Build',                command: '/build-engine:build',        dotDir: '.build',       pluginName: 'build-engine',     category: 'build' },
  { index: 6,  name: 'Test Coverage',        command: '/test-gap:coverage',         dotDir: '.testgap',     pluginName: 'test-gap',         category: 'harden' },
  { index: 7,  name: 'Dependencies',         command: '/dep-doctor:checkup',        dotDir: '.depdoctor',   pluginName: 'dep-doctor',       category: 'harden' },
  { index: 8,  name: 'Production Readiness', command: '/launch-check:preflight',    dotDir: '.preflight',   pluginName: 'launch-check',     category: 'harden' },
  { index: 9,  name: 'Cost Forecast',        command: '/cost-forecast:estimate',    dotDir: '.costforecast', pluginName: 'cost-forecast',   category: 'harden' },
  { index: 10, name: 'Scale Analysis',       command: '/scale-sim:simulate',        dotDir: '.scalesim',    pluginName: 'scale-sim',        category: 'harden' },
  { index: 11, name: 'Incident Runbooks',    command: '/incident-planner:runbook',  dotDir: '.runbook',     pluginName: 'incident-planner', category: 'harden' },
  { index: 12, name: 'Landing Page',         command: '/ship-page:landing',         dotDir: '.shippage',    pluginName: 'ship-page',        category: 'ship' },
  { index: 13, name: 'Pricing Strategy',     command: '/price-model:pricing',       dotDir: '.pricing',     pluginName: 'price-model',      category: 'ship' },
  { index: 14, name: 'Pitch Deck',           command: '/pitch-craft:pitch',         dotDir: '.pitch',       pluginName: 'pitch-craft',      category: 'ship' },
  { index: 15, name: 'Legal & Compliance',   command: '/legal-kit:comply',          dotDir: '.legalkit',    pluginName: 'legal-kit',        category: 'ship' },
];

import fs from 'fs';
import path from 'path';

function detectStatus(projectPath: string, dotDir: string): PipelineStep['status'] {
  const dirPath = path.join(projectPath, dotDir);
  if (!fs.existsSync(dirPath)) return 'not_started';

  const statePath = path.join(dirPath, 'state.json');
  if (!fs.existsSync(statePath)) return 'complete'; // dir exists but no state = assume done

  try {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    if (state.status === 'in_progress') return 'in_progress';
    return 'complete';
  } catch {
    return 'complete'; // malformed state = assume done
  }
}

export function scanPipeline(projectPath: string): PipelineStep[] {
  return PIPELINE_STEPS.map(step => ({
    ...step,
    status: detectStatus(projectPath, step.dotDir),
  }));
}

export function suggestNext(steps: PipelineStep[]): PipelineStep | null {
  // First: any in-progress step
  const inProgress = steps.find(s => s.status === 'in_progress');
  if (inProgress) return inProgress;

  // Then: first not-started step
  const notStarted = steps.find(s => s.status === 'not_started');
  return notStarted || null;
}

export function countCompleted(steps: PipelineStep[]): number {
  return steps.filter(s => s.status === 'complete').length;
}

export { PIPELINE_STEPS };
