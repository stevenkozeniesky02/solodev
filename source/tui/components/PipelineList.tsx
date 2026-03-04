// source/tui/components/PipelineList.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { PipelineStep } from '../../core/pipeline.js';

interface Props {
  steps: PipelineStep[];
  selectedIndex: number;
}

function statusIcon(status: PipelineStep['status']): string {
  switch (status) {
    case 'complete': return '✅';
    case 'in_progress': return '🔨';
    case 'not_started': return '⬚ ';
  }
}

export const PipelineList = ({ steps, selectedIndex }: Props) => {
  return (
    <Box flexDirection="column">
      {steps.map((step, i) => {
        const isSelected = i === selectedIndex;
        const icon = statusIcon(step.status);
        const indexStr = step.index.toString().padStart(2, ' ');
        const nameStr = step.name.padEnd(22);
        const cmdStr = step.command.padEnd(12);
        const dirStr = step.status !== 'not_started' ? step.dotDir : '';

        return (
          <Box key={step.command}>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {isSelected ? '>' : ' '} {icon} {indexStr}. {nameStr} {cmdStr} {dirStr}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};
