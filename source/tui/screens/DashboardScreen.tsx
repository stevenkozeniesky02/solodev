// source/tui/screens/DashboardScreen.tsx
import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { scanPipeline, suggestNext, type PipelineStep } from '../../core/pipeline.js';
import { getProject } from '../../core/projects.js';
import { PipelineList } from '../components/PipelineList.js';

interface Props {
  projectId: string;
  projectPath: string;
  onRun: (step: PipelineStep) => void;
  onBack: () => void;
}

export const DashboardScreen = ({ projectId, projectPath, onRun, onBack }: Props) => {
  const project = getProject(projectId);
  const steps = useMemo(() => scanPipeline(projectPath), [projectPath]);
  const suggested = useMemo(() => suggestNext(steps), [steps]);
  const suggestedIndex = suggested ? steps.findIndex(s => s.command === suggested.command) : 0;
  const [selectedIndex, setSelectedIndex] = useState(suggestedIndex);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(i => Math.max(0, i - 1));
    }
    if (key.downArrow) {
      setSelectedIndex(i => Math.min(steps.length - 1, i + 1));
    }
    if (key.return) {
      onRun(steps[selectedIndex]!);
    }
    if (input === 'v' && steps[selectedIndex]!.status !== 'not_started') {
      // Open output — TODO: implement viewer
    }
    if (input === 'p') {
      onBack();
    }
  });

  const selectedStep = steps[selectedIndex];
  const suggestion = suggested
    ? suggested.status === 'in_progress'
      ? `Continue ${suggested.name.toLowerCase()}?`
      : `Run ${suggested.name.toLowerCase()}?`
    : 'All steps complete!';

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} justifyContent="space-between">
        <Text bold color="cyan">{project?.name || 'Project'}</Text>
        <Text dimColor>{projectPath}</Text>
      </Box>

      <Text bold>Pipeline:</Text>
      <Text> </Text>

      <PipelineList steps={steps} selectedIndex={selectedIndex} />

      <Text> </Text>
      <Text color="yellow">{'→'} {suggestion}</Text>
      <Text> </Text>
      <Text dimColor>[Enter] Run  [↑↓] Select  [v] View output  [p] Projects  [q] Quit</Text>
    </Box>
  );
};
