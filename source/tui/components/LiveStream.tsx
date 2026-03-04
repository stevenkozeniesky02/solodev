// source/tui/components/LiveStream.tsx
import React from 'react';
import { Box, Text } from 'ink';

interface Props {
  lines: string[];
  maxLines: number;
  expanded: boolean;
}

export const LiveStream = ({ lines, maxLines, expanded }: Props) => {
  if (!expanded) return null;

  const visible = lines.slice(-maxLines);

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
      <Text bold dimColor>Live Output</Text>
      {visible.map((line, i) => (
        <Text key={i} dimColor>{line}</Text>
      ))}
      {lines.length === 0 && <Text dimColor>Waiting for output...</Text>}
    </Box>
  );
};
