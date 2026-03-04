// source/tui/screens/AuthScreen.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { checkAuth } from '../../core/claude.js';

interface Props {
  onComplete: () => void;
}

type AuthState = 'checking' | 'authenticated' | 'not_authenticated' | 'error';

export const AuthScreen = ({ onComplete }: Props) => {
  const [state, setState] = useState<AuthState>('checking');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth().then(status => {
      if (status.loggedIn) {
        setEmail(status.email || 'unknown');
        setPlan(status.subscriptionType || 'unknown');
        setState('authenticated');
        // Auto-advance after 1.5s
        setTimeout(onComplete, 1500);
      } else {
        setState('not_authenticated');
      }
    }).catch(err => {
      setError(err.message);
      setState('error');
    });
  }, []);

  useInput((input, key) => {
    if (state === 'authenticated' && (key.return || input === ' ')) {
      onComplete();
    }
    if (state === 'not_authenticated' && key.return) {
      setState('checking');
      // Trigger login
      import('child_process').then(({ execSync }) => {
        try {
          execSync('claude auth login', { stdio: 'inherit' });
          // Re-check after login
          checkAuth().then(status => {
            if (status.loggedIn) {
              setEmail(status.email || 'unknown');
              setPlan(status.subscriptionType || 'unknown');
              setState('authenticated');
              setTimeout(onComplete, 1500);
            } else {
              setState('not_authenticated');
            }
          });
        } catch {
          setState('error');
          setError('Login failed');
        }
      });
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" height={process.stdout.rows}>
      <Text bold color="cyan">
        {`\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557      \u2588\u2588\u2588\u2588\u2588\u2588\u2557 `}
      </Text>
      <Text bold color="cyan">
        {`\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557`}
      </Text>
      <Text bold color="cyan">
        {`\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551`}
      </Text>
      <Text bold color="cyan">
        {`\u255a\u2550\u2550\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551`}
      </Text>
      <Text bold color="cyan">
        {`\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d`}
      </Text>
      <Text bold color="cyan">
        {`\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u255d  DEV`}
      </Text>
      <Text>{' '}</Text>

      {state === 'checking' && (
        <Text>
          <Text color="yellow"><Spinner type="dots" /></Text>
          {' Checking Claude connection...'}
        </Text>
      )}

      {state === 'authenticated' && (
        <Box flexDirection="column" alignItems="center">
          <Text color="green">{'\u2705'} {email} ({plan} plan)</Text>
          <Text>{' '}</Text>
          <Text dimColor>Press Enter to continue</Text>
        </Box>
      )}

      {state === 'not_authenticated' && (
        <Box flexDirection="column" alignItems="center">
          <Text color="yellow">{'\u26A0'}  Not connected to Claude</Text>
          <Text>{' '}</Text>
          <Text dimColor>[Enter] Log in (opens browser)   [q] Quit</Text>
        </Box>
      )}

      {state === 'error' && (
        <Box flexDirection="column" alignItems="center">
          <Text color="red">{'\u2717'} Error: {error}</Text>
          <Text>{' '}</Text>
          <Text dimColor>Is Claude Code installed? Run: npm install -g @anthropic-ai/claude-code</Text>
        </Box>
      )}
    </Box>
  );
};
