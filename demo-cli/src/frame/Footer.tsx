import React from 'react';
import { Box, Text } from 'ink';
import { c } from '../theme.js';

/**
 * Keybind footer. Spaced, uppercase, dim — the site's label treatment.
 * We deliberately do not box or underline this; the divider above the log
 * pane already separates the stack.
 */
export function Footer(): React.ReactElement {
  return (
    <Box flexDirection="row" paddingX={2} justifyContent="space-between">
      <Text color={c.dim}>
        <Text color={c.muted}>SPACE</Text> STEP   <Text color={c.muted}>→</Text> FFWD   <Text color={c.muted}>←</Text> REPLAY   <Text color={c.muted}>R</Text> RESTART   <Text color={c.muted}>Q</Text> QUIT
      </Text>
    </Box>
  );
}
