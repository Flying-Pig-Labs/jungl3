import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Tracked } from './Tracking.js';
import { Gradient } from './Gradient.js';
import { c } from '../theme.js';

/**
 * First beat of the demo: the user names their Jungle. This is Act 1's
 * opening moment ("Enter Jungle") made literal — you type what you're
 * entering.
 *
 * The input is deliberately narrow-feeling: only [a-z0-9-] characters are
 * accepted, backspace deletes, enter submits. That matches how real jungle
 * names would be generated in-product (DNS-safe, slug-shaped) and sidesteps
 * the can-of-worms of supporting arbitrary Unicode with correct width
 * measurement under terminal rendering.
 *
 * A gentle pulsing caret sits at the insertion point so the field reads as
 * "awaiting input" without adding any chrome.
 */

const MAX_LEN = 24;
const DEFAULT_NAME = 'aurora';

/** Strip to the allowed character set and clamp length. */
function sanitize(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned.slice(0, MAX_LEN);
}

export function TeamNamePrompt({
  onSubmit,
}: {
  onSubmit: (teamName: string) => void;
}): React.ReactElement {
  const [value, setValue] = useState<string>('');
  const [caretOn, setCaretOn] = useState<boolean>(true);

  // Caret blink. A 500ms cadence reads as "alive"; faster looks frantic,
  // slower looks dead.
  React.useEffect(() => {
    const id = setInterval(() => setCaretOn((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  useInput((input, key) => {
    if (key.return) {
      const finalName = sanitize(value) || DEFAULT_NAME;
      onSubmit(finalName);
      return;
    }
    if (key.backspace || key.delete) {
      setValue((v) => v.slice(0, -1));
      return;
    }
    if (key.escape) {
      // Accept the default so the user is never trapped.
      onSubmit(DEFAULT_NAME);
      return;
    }
    // Only accept printable keystrokes we can render. Ink gives us the raw
    // char in `input`; we filter after composing so paste-of-"Team Aurora"
    // still works (→ "team-aurora").
    if (input && !key.ctrl && !key.meta) {
      setValue((v) => {
        const next = sanitize(v + input);
        return next;
      });
    }
  });

  // What we show in the field: the sanitized value so the user sees exactly
  // what will be submitted. If empty, we show a dim placeholder.
  const displayValue = value;
  const isEmpty = displayValue.length === 0;
  const caret = caretOn ? '▌' : ' ';

  return (
    <Box flexDirection="column" alignItems="center" paddingY={2}>
      <Box marginBottom={1}>
        <Gradient>
          <Tracked>enter jungle</Tracked>
        </Gradient>
      </Box>

      <Box marginBottom={2}>
        <Tracked color={c.muted}>name your jungle</Tracked>
      </Box>

      <Box flexDirection="row">
        <Text color={c.label}>jungle-</Text>
        {isEmpty ? (
          <>
            <Text color={c.dim} dimColor>
              {DEFAULT_NAME}
            </Text>
            <Text color={c.label}>{caret}</Text>
          </>
        ) : (
          <>
            <Text color={c.body} bold>
              {displayValue}
            </Text>
            <Text color={c.label}>{caret}</Text>
          </>
        )}
      </Box>

      <Box marginTop={2}>
        <Text color={c.dim} dimColor>
          [a-z 0-9 -]   ·   enter to confirm   ·   esc for default ({DEFAULT_NAME})
        </Text>
      </Box>
    </Box>
  );
}

export { sanitize as sanitizeTeamName, DEFAULT_NAME as DEFAULT_TEAM_NAME };
