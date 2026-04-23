import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import cliTruncate from 'cli-truncate';
import { useLog } from '../hooks/useLogStream.js';
import { c } from '../theme.js';

const ROWS = 7;
const CARET_BLINK_MS = 420;

/**
 * Tail-view of the scripted log stream. The divider above is a subtle
 * em-dash rule (the site's visual vocabulary) rather than a hard border —
 * heavy borders are not how the site frames sections.
 *
 * Lines are truncated to the frame width with cli-truncate; we never wrap,
 * so the log pane's row count stays deterministic.
 *
 * Each line carries a `revealed` count (0..text.length). We render
 * `text.slice(0, revealed)`. The most recent line, while still typing,
 * gets a blinking ▋ caret appended — this is the single "alive" cue that
 * turns the pane from captions into output. Older lines have no caret.
 */
export function LogPane({ width }: { width: number }): React.ReactElement {
  const { lines } = useLog();
  const tail = lines.slice(Math.max(0, lines.length - ROWS));
  const padded: (typeof tail[number] | null)[] = [...tail];
  while (padded.length < ROWS) padded.push(null);

  // Inner text width: two columns of paddingX, two columns for timestamp gutter.
  // Leave one extra column for the trailing caret so truncation doesn't
  // eat the last character when we append '▋'.
  const innerWidth = Math.max(20, width - 15);

  const [caretOn, setCaretOn] = useState<boolean>(true);
  useEffect(() => {
    const id = setInterval(() => setCaretOn((v) => !v), CARET_BLINK_MS);
    return () => clearInterval(id);
  }, []);

  // Index of the single "actively typing" line (the newest line whose
  // revealed < text.length). There is at most one; older lines are snapped
  // to fully-revealed in the stream hook.
  const typingIndex = padded.findIndex(
    (l) => l !== null && l.revealed < l.text.length,
  );

  return (
    <Box flexDirection="column">
      <Box paddingX={2}>
        <Text color={c.dim}>{'─ '.repeat(Math.max(1, Math.floor((width - 4) / 2)))}</Text>
      </Box>
      <Box flexDirection="column" paddingX={2}>
        {padded.map((line, i) => {
          const isTyping = i === typingIndex;
          const shownText = line ? line.text.slice(0, line.revealed) : '';
          const truncated = line ? cliTruncate(shownText, innerWidth) : '';
          const toneColor = !line
            ? c.dim
            : line.tone === 'highlight'
              ? c.done
              : line.tone === 'warn'
                ? c.rare
                : c.muted;

          return (
            <Box key={i} flexDirection="row">
              <Box width={10}>
                <Text color={c.dim}>{line ? line.ts : '        '}</Text>
              </Box>
              <Box>
                <Text
                  color={toneColor}
                  dimColor={!line || line.tone === 'body'}
                >
                  {truncated}
                </Text>
                {isTyping ? (
                  <Text color={c.live}>{caretOn ? '▋' : ' '}</Text>
                ) : null}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
