import React from 'react';
import { Text } from 'ink';
import { useEasedNumber } from '../hooks/useEasedNumber.js';

/**
 * Thin wrapper around useEasedNumber so act code doesn't need to manage the
 * eased value and the render call separately. The number arrives with weight
 * (cubic-out easing); that's what keeps it from feeling like a progress
 * printout.
 */
export function Counter({
  value,
  durationMs = 600,
  width,
  color,
  bold,
  padChar = ' ',
}: {
  value: number;
  durationMs?: number;
  width?: number;
  color?: string;
  bold?: boolean;
  padChar?: string;
}): React.ReactElement {
  const shown = useEasedNumber(value, durationMs);
  const text = width ? String(shown).padStart(width, padChar) : String(shown);
  return (
    <Text color={color} bold={bold}>
      {text}
    </Text>
  );
}
