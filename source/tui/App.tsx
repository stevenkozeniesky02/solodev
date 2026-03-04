// source/tui/App.tsx
import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';

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
        <Text>Auth screen — coming in Task 8</Text>
      )}
      {screen === 'projects' && (
        <Text>Projects screen — coming in Task 9</Text>
      )}
      {screen === 'dashboard' && (
        <Text>Dashboard screen — coming in Task 10</Text>
      )}
      {screen === 'run' && (
        <Text>Run screen — coming in Task 11</Text>
      )}
    </Box>
  );
};
