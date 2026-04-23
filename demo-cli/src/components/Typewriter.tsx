import React from 'react';
import { Text } from 'ink';
import { useTypewriter } from '../hooks/useTypewriter.js';

export function Typewriter({
  text,
  cps = 24,
  jitterMs = 20,
  color,
  bold,
  speedMultiplier = 1,
}: {
  text: string;
  cps?: number;
  jitterMs?: number;
  color?: string;
  bold?: boolean;
  speedMultiplier?: number;
}): React.ReactElement {
  const shown = useTypewriter(text, { cps, jitterMs, speedMultiplier });
  return (
    <Text color={color} bold={bold}>
      {shown}
    </Text>
  );
}
