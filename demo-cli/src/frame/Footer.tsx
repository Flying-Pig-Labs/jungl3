import React from 'react';
import { Box, Text } from 'ink';
import { c } from '../theme.js';

/**
 * Keybind footer. The console phase swaps to a different binding set since
 * `space`/`←`/`→` belong to the playback runner and the operator console
 * consumes typed input directly.
 */
export function Footer({
  console: isConsole = false,
}: { console?: boolean } = {}): React.ReactElement {
  const keys: Array<readonly [string, string]> = isConsole
    ? [
        ['type', 'jungle list · help'],
        ['enter', 'run'],
        ['r', 'restart demo'],
        ['q', 'quit'],
      ]
    : [
        ['space', 'advance'],
        ['→', 'fast-forward'],
        ['←', 'replay act'],
        ['^R', 'restart'],
        ['q', 'quit'],
      ];

  return (
    <Box flexDirection="row" paddingX={2}>
      {keys.map(([k, label], i) => (
        <Box key={k} flexDirection="row">
          <Text color={c.label} bold>
            [{k}]
          </Text>
          <Text color={c.dim}> {label}</Text>
          {i < keys.length - 1 ? <Text color={c.dim}>{'   '}</Text> : null}
        </Box>
      ))}
    </Box>
  );
}
