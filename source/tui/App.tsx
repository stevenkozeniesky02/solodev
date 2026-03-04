// source/tui/App.tsx
import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { AuthScreen } from './screens/AuthScreen.js';
import { ProjectScreen } from './screens/ProjectScreen.js';
import { DashboardScreen } from './screens/DashboardScreen.js';
import { RunScreen } from './screens/RunScreen.js';
import type { PipelineStep } from '../core/pipeline.js';

export type Screen = 'auth' | 'projects' | 'dashboard' | 'run';

export interface AppState {
  projectId: string | null;
  projectPath: string | null;
}

export const App = () => {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('auth');
  const [appState, setAppState] = useState<AppState>({
    projectId: null,
    projectPath: null,
  });
  const [runStep, setRunStep] = useState<PipelineStep | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Global quit handler
  useInput((input, key) => {
    if (input === 'q' && screen !== 'run') {
      if (screen === 'auth' || screen === 'projects') {
        exit();
      } else {
        setScreen('projects');
      }
    }
  });

  return (
    <Box flexDirection="column" height={process.stdout.rows}>
      {screen === 'auth' && (
        <AuthScreen onComplete={() => setScreen('projects')} />
      )}
      {screen === 'projects' && (
        <ProjectScreen onSelect={(id, path) => {
          setAppState({ projectId: id, projectPath: path });
          setScreen('dashboard');
        }} />
      )}
      {screen === 'dashboard' && appState.projectId && appState.projectPath && (
        <DashboardScreen
          key={refreshKey}
          projectId={appState.projectId}
          projectPath={appState.projectPath}
          onRun={(step) => {
            setRunStep(step);
            setScreen('run');
          }}
          onBack={() => setScreen('projects')}
        />
      )}
      {screen === 'run' && appState.projectId && runStep && (
        <RunScreen
          projectId={appState.projectId}
          step={runStep}
          onComplete={() => {
            setRunStep(null);
            setRefreshKey(k => k + 1);
            setScreen('dashboard');
          }}
          onCancel={() => {
            setRunStep(null);
            setScreen('dashboard');
          }}
        />
      )}
    </Box>
  );
};
