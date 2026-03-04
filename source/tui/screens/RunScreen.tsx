// source/tui/screens/RunScreen.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { runClaude, type ClaudeRunOptions } from '../../core/claude.js';
import { getProject, touchProject } from '../../core/projects.js';
import { getPluginDir } from '../../core/plugins.js';
import { LiveStream } from '../components/LiveStream.js';
import type { PipelineStep } from '../../core/pipeline.js';

interface Props {
  projectId: string;
  step: PipelineStep;
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = 'running' | 'complete' | 'error';

export const RunScreen = ({ projectId, step, onComplete, onCancel }: Props) => {
  const [phase, setPhase] = useState<Phase>('running');
  const [lines, setLines] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [killFn, setKillFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    const project = getProject(projectId);
    if (!project) {
      setPhase('error');
      setLines(['Project not found']);
      return;
    }

    const pluginDir = getPluginDir();
    const isNew = !project.sessionId;

    const options: ClaudeRunOptions = {
      prompt: step.command,
      sessionId: project.sessionId,
      isNewSession: isNew,
      pluginDir,
      permissionMode: project.permissionMode,
    };

    const { events, kill } = runClaude(options);
    setKillFn(() => kill);

    events.on('message', (msg: { type: string; content?: string }) => {
      if (msg.content) {
        setLines(prev => [...prev, msg.content!]);
      }
    });

    events.on('done', (code: number) => {
      setExitCode(code);
      setPhase(code === 0 ? 'complete' : 'error');
      touchProject(projectId);
    });

    return () => {
      kill();
    };
  }, [projectId, step.command]);

  // Elapsed timer
  useEffect(() => {
    if (phase !== 'running') return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useInput((input, key) => {
    if (input === ' ') setExpanded(e => !e);
    if (input === 'c' && phase === 'running') {
      killFn?.();
      setPhase('error');
      setLines(prev => [...prev, 'Cancelled by user']);
    }
    if ((key.return || input === 'q') && phase !== 'running') {
      onComplete();
    }
  });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold>
          {'Running: '}<Text color="cyan">{step.command}</Text>
        </Text>
        <Text>
          {phase === 'running' && (
            <Text color="yellow"><Spinner type="dots" /> {formatTime(elapsed)}</Text>
          )}
          {phase === 'complete' && (
            <Text color="green">Done in {formatTime(elapsed)}</Text>
          )}
          {phase === 'error' && (
            <Text color="red">Failed after {formatTime(elapsed)}</Text>
          )}
        </Text>
      </Box>

      <LiveStream lines={lines} maxLines={expanded ? 20 : 0} expanded={expanded} />

      <Text>{' '}</Text>
      {phase === 'running' && (
        <Text dimColor>{'[Space] '}{expanded ? 'Collapse' : 'Expand'}{' output   [c] Cancel'}</Text>
      )}
      {phase !== 'running' && (
        <Text dimColor>{'[Enter] Back to dashboard   [Space] '}{expanded ? 'Collapse' : 'Expand'}{' output'}</Text>
      )}
    </Box>
  );
};
