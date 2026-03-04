// source/core/projects.ts
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getConfigDir } from './config.js';

export interface Project {
  id: string;
  name: string;
  path: string;
  sessionId: string;
  permissionMode: 'default' | 'acceptEdits' | 'bypassPermissions';
  createdAt: string;
  lastOpenedAt: string;
}

interface ProjectStore {
  projects: Project[];
}

function getProjectsPath(): string {
  return path.join(getConfigDir(), 'projects.json');
}

function loadStore(): ProjectStore {
  const filePath = getProjectsPath();
  if (!fs.existsSync(filePath)) {
    return { projects: [] };
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveStore(store: ProjectStore): void {
  const filePath = getProjectsPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2) + '\n');
}

export function listProjects(): Project[] {
  return loadStore().projects.sort(
    (a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime()
  );
}

export function getProject(id: string): Project | undefined {
  return loadStore().projects.find(p => p.id === id);
}

export function getProjectByPath(projectPath: string): Project | undefined {
  return loadStore().projects.find(p => p.path === projectPath);
}

export function addProject(name: string, projectPath: string): Project {
  const store = loadStore();
  const now = new Date().toISOString();
  const project: Project = {
    id: uuidv4().slice(0, 8),
    name,
    path: projectPath,
    sessionId: uuidv4(),
    permissionMode: 'default',
    createdAt: now,
    lastOpenedAt: now,
  };
  store.projects.push(project);
  saveStore(store);
  return project;
}

export function removeProject(id: string): void {
  const store = loadStore();
  store.projects = store.projects.filter(p => p.id !== id);
  saveStore(store);
}

export function touchProject(id: string): void {
  const store = loadStore();
  const project = store.projects.find(p => p.id === id);
  if (project) {
    project.lastOpenedAt = new Date().toISOString();
    saveStore(store);
  }
}

export function updateProjectSession(id: string, sessionId: string): void {
  const store = loadStore();
  const project = store.projects.find(p => p.id === id);
  if (project) {
    project.sessionId = sessionId;
    saveStore(store);
  }
}

export { getConfigDir };
