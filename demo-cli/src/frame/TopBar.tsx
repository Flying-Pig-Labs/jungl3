import React from 'react';
import { Box, Text } from 'ink';
import { c } from '../theme.js';

/**
 * v2 chip style: `jungl3 · <tag> · <Title>` left, `mm:ss` right.
 *
 * `tag` is `act N` for numbered acts (0..5), `plane` for the multi-jungle
 * interstitial, `shell` for the operator console. The dot separators are dim,
 * the tag is the act-color (neon), the title is body. This replaces the older
 * `// ACT 01 — ENTER JUNGLE` line — the new shape reads as the live HUD of a
 * running tool, not as a chapter heading.
 */
export type TopBarMode =
  | { kind: 'act'; act: number; title: string }
  | { kind: 'multi'; title: string }
  | { kind: 'console'; title: string };

export function TopBar({
  mode,
  elapsedSec,
}: {
  mode: TopBarMode;
  elapsedSec: number;
}): React.ReactElement {
  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
  const ss = String(elapsedSec % 60).padStart(2, '0');

  const tag =
    mode.kind === 'act' ? `act ${mode.act}` : mode.kind === 'multi' ? 'plane' : 'shell';

  return (
    <Box flexDirection="row" justifyContent="space-between" paddingX={2}>
      <Box flexDirection="row">
        <Text color={c.label} bold>
          jungl3
        </Text>
        <Text color={c.dim}> · </Text>
        <Text color={c.done}>{tag}</Text>
        <Text color={c.dim}> · </Text>
        <Text color={c.body}>{mode.title}</Text>
      </Box>
      <Text color={c.dim}>{`${mm}:${ss}`}</Text>
    </Box>
  );
}
