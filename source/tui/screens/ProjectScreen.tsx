// source/tui/screens/ProjectScreen.tsx
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { listProjects, addProject, removeProject, type Project } from '../../core/projects.js';
import { countCompleted, scanPipeline } from '../../core/pipeline.js';

interface Props {
  onSelect: (projectId: string, projectPath: string) => void;
}

type Mode = 'list' | 'new_name' | 'new_path' | 'open_path';

export const ProjectScreen = ({ onSelect }: Props) => {
  const [mode, setMode] = useState<Mode>('list');
  const [newName, setNewName] = useState('');
  const [newPath, setNewPath] = useState('');
  const projects = listProjects();

  useInput((input) => {
    if (mode === 'list') {
      if (input === 'n') setMode('new_name');
      if (input === 'o') setMode('open_path');
    }
  }, { isActive: mode === 'list' });

  const items = projects.map(p => {
    const steps = scanPipeline(p.path);
    const completed = countCompleted(steps);
    const label = completed > 0 ? `${p.name}  ${completed} steps` : `${p.name}  new`;
    return { label, value: p.id, key: p.id };
  });

  const handleSelect = (item: { value: string }) => {
    const project = projects.find(p => p.id === item.value);
    if (project) {
      onSelect(project.id, project.path);
    }
  };

  const handleNewName = (name: string) => {
    setNewName(name);
    setMode('new_path');
  };

  const handleNewPath = (projectPath: string) => {
    const resolved = projectPath.startsWith('~')
      ? projectPath.replace('~', process.env['HOME'] || '')
      : projectPath;
    const project = addProject(newName, resolved);
    onSelect(project.id, project.path);
  };

  const handleOpenPath = (projectPath: string) => {
    const resolved = projectPath.startsWith('~')
      ? projectPath.replace('~', process.env['HOME'] || '')
      : projectPath;
    const project = addProject(
      resolved.split('/').pop() || 'project',
      resolved
    );
    onSelect(project.id, project.path);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">SOLODEV</Text>
        <Text>                              v0.1.0</Text>
      </Box>

      {mode === 'list' && (
        <>
          {projects.length > 0 ? (
            <>
              <Text bold>Your Projects:</Text>
              <Text> </Text>
              <SelectInput items={items} onSelect={handleSelect} />
            </>
          ) : (
            <Text dimColor>No projects yet. Create one to get started.</Text>
          )}
          <Text> </Text>
          <Text dimColor>[n] New project   [o] Open existing directory   [q] Quit</Text>
        </>
      )}

      {mode === 'new_name' && (
        <Box flexDirection="column">
          <Text bold>New Project</Text>
          <Text> </Text>
          <Box>
            <Text color="cyan">Project name: </Text>
            <TextInput value={newName} onChange={setNewName} onSubmit={handleNewName} placeholder="my-saas-app" />
          </Box>
        </Box>
      )}

      {mode === 'new_path' && (
        <Box flexDirection="column">
          <Text bold>New Project: {newName}</Text>
          <Text> </Text>
          <Box>
            <Text color="cyan">Directory: </Text>
            <TextInput value={newPath} onChange={setNewPath} onSubmit={handleNewPath} placeholder="~/projects/my-app" />
          </Box>
        </Box>
      )}

      {mode === 'open_path' && (
        <Box flexDirection="column">
          <Text bold>Open Existing Project</Text>
          <Text> </Text>
          <Box>
            <Text color="cyan">Path: </Text>
            <TextInput value={newPath} onChange={setNewPath} onSubmit={handleOpenPath} placeholder="~/existing-project" />
          </Box>
        </Box>
      )}
    </Box>
  );
};
