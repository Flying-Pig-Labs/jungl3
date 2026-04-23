import React from 'react';
import { Box, Text } from 'ink';
import { Tracked } from '../components/Tracking.js';
import { c } from '../theme.js';

/**
 * Signature line from the site: `// 02 — THE LOOP`.
 * We carry that pattern here: `// ACT 01 — ENTER JUNGLE`.
 */
export function TopBar({
  actNumber,
  actTitle,
  elapsedSec,
}: {
  actNumber: number;
  actTitle: string;
  elapsedSec: number;
}): React.ReactElement {
  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
  const ss = String(elapsedSec % 60).padStart(2, '0');
  const actLabel = `// ACT ${String(actNumber).padStart(2, '0')} — ${actTitle.toUpperCase()}`;
  return (
    <Box flexDirection="row" justifyContent="space-between" paddingX={2}>
      <Text color={c.label}>{actLabel}</Text>
      <Tracked color={c.dim}>{`${mm}:${ss}`}</Tracked>
    </Box>
  );
}
