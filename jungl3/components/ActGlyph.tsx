import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInterval } from '../hooks/useInterval.js';
import { c } from '../theme.js';

/**
 * Per-act stylized mark, ~6–10 rows tall. One element on each glyph breathes
 * (600ms color alternation) so the canvas never feels static.
 *
 * We render row-by-row as <Text> so individual cells can carry different
 * colors without needing to manage cursor positioning.
 */

type Cell = { ch: string; color: string };

function row(cells: Cell[]): React.ReactElement {
  return (
    <Text>
      {cells.map((cell, i) => (
        <Text key={i} color={cell.color}>
          {cell.ch}
        </Text>
      ))}
    </Text>
  );
}

/**
 * Act 2 — three horizontal strata, the shaping layers.
 * The middle band breathes (the layer currently being shaped).
 * Compact: 5 rows, ~16 cols. Reads top-down as canopy / understory (live) /
 * substrate. The wider strata would interleave with the right-column move
 * list in awkward ways, so we keep the glyph small and let the moves lead.
 */
export function Act2Glyph(): React.ReactElement {
  const [pulse, setPulse] = useState(false);
  useInterval(() => setPulse((p) => !p), 600);
  const liveBand = pulse ? c.done : c.live;

  return (
    <Box flexDirection="column">
      {row([{ ch: '  ╌╌╌╌╌╌╌╌╌╌╌╌╌', color: c.dim }])}
      {row([{ ch: '  ━━━━━━━━━━━━━', color: c.label }])}
      {row([{ ch: '  ▓▓▓▓▓▓▓▓▓▓▓▓▓', color: liveBand }])}
      {row([{ ch: '  ▒▒▒▒▒▒▒▒▒▒▒▒▒', color: c.live }])}
      {row([{ ch: '  ░░░░░░░░░░░░░', color: c.muted }])}
    </Box>
  );
}

/**
 * Act 3 — a 2×2 persona grid. The four cells are the four seeded personas.
 * One cell pulses at any given time (the "currently probing" persona).
 * In a real run the pulse tracks persona state; here it's tied to the
 * breath cycle for visual consistency.
 */
export function Act3Glyph({ activeIndex }: { activeIndex: number }): React.ReactElement {
  const [pulse, setPulse] = useState(false);
  useInterval(() => setPulse((p) => !p), 600);

  const cellColor = (i: number): string => {
    if (i === activeIndex) return pulse ? c.done : c.label;
    if (i < activeIndex) return c.done;
    return c.dim;
  };

  const glyphs = ['◆', '●', '▲', '■'];
  const getGlyph = (i: number): string => glyphs[i] ?? '·';

  return (
    <Box flexDirection="column">
      {row([{ ch: '                    ', color: c.dim }])}
      {row([
        { ch: '   ', color: c.dim },
        { ch: '╭─────╮', color: cellColor(0) },
        { ch: '  ', color: c.dim },
        { ch: '╭─────╮', color: cellColor(1) },
      ])}
      {row([
        { ch: '   ', color: c.dim },
        { ch: '│  ', color: cellColor(0) },
        { ch: getGlyph(0), color: cellColor(0) },
        { ch: '  │', color: cellColor(0) },
        { ch: '  ', color: c.dim },
        { ch: '│  ', color: cellColor(1) },
        { ch: getGlyph(1), color: cellColor(1) },
        { ch: '  │', color: cellColor(1) },
      ])}
      {row([
        { ch: '   ', color: c.dim },
        { ch: '╰─────╯', color: cellColor(0) },
        { ch: '  ', color: c.dim },
        { ch: '╰─────╯', color: cellColor(1) },
      ])}
      {row([{ ch: '                    ', color: c.dim }])}
      {row([
        { ch: '   ', color: c.dim },
        { ch: '╭─────╮', color: cellColor(2) },
        { ch: '  ', color: c.dim },
        { ch: '╭─────╮', color: cellColor(3) },
      ])}
      {row([
        { ch: '   ', color: c.dim },
        { ch: '│  ', color: cellColor(2) },
        { ch: getGlyph(2), color: cellColor(2) },
        { ch: '  │', color: cellColor(2) },
        { ch: '  ', color: c.dim },
        { ch: '│  ', color: cellColor(3) },
        { ch: getGlyph(3), color: cellColor(3) },
        { ch: '  │', color: cellColor(3) },
      ])}
      {row([
        { ch: '   ', color: c.dim },
        { ch: '╰─────╯', color: cellColor(2) },
        { ch: '  ', color: c.dim },
        { ch: '╰─────╯', color: cellColor(3) },
      ])}
    </Box>
  );
}

/**
 * Act 4 — a canopy tile: stylized listing card from above.
 * One star in the tile's lower-right corner pulses gold↔neon — the "found it"
 * tell that a visitor is interacting.
 */
export function Act4Glyph(): React.ReactElement {
  const [pulse, setPulse] = useState(false);
  useInterval(() => setPulse((p) => !p), 600);
  const star = pulse ? c.done : c.label;

  return (
    <Box flexDirection="column">
      {row([{ ch: '                   ', color: c.dim }])}
      {row([
        { ch: '  ', color: c.dim },
        { ch: '╭───────────────╮', color: c.done },
      ])}
      {row([
        { ch: '  ', color: c.dim },
        { ch: '│ ', color: c.done },
        { ch: '▓▓▓▓▓▓▓▓▓▓▓▓▓', color: c.live },
        { ch: ' │', color: c.done },
      ])}
      {row([
        { ch: '  ', color: c.dim },
        { ch: '│ ', color: c.done },
        { ch: '▓▓▓▓▓▓▓▓▓▓▓▓▓', color: c.live },
        { ch: ' │', color: c.done },
      ])}
      {row([
        { ch: '  ', color: c.dim },
        { ch: '│               │', color: c.done },
      ])}
      {row([
        { ch: '  ', color: c.dim },
        { ch: '│ ', color: c.done },
        { ch: '────────', color: c.muted },
        { ch: '  ', color: c.done },
        { ch: '★', color: star },
        { ch: ' │', color: c.done },
      ])}
      {row([
        { ch: '  ', color: c.dim },
        { ch: '╰───────────────╯', color: c.done },
      ])}
    </Box>
  );
}

export function Act1Glyph(): React.ReactElement {
  // The glyph: a tightening spiral suggesting a canopy seen from above.
  // The centermost dot pulses neon↔gold on a 600ms cycle — the "alive" tell.
  const [pulse, setPulse] = useState(false);
  useInterval(() => setPulse((p) => !p), 600);
  const dot = pulse ? c.done : c.label;
  const green = c.live;
  const dim = c.dim;

  //      ╭─────────────╮
  //     ╱  ╭───────╮    ╲
  //    │  ╱ ╭───╮    ╲   │
  //    │ │ │  ●   │   │  │
  //    │  ╲ ╰───╯    ╱   │
  //     ╲  ╰───────╯    ╱
  //      ╰─────────────╯

  return (
    <Box flexDirection="column">
      {row([
        { ch: '     ', color: dim },
        { ch: '╭─────────────╮', color: green },
      ])}
      {row([
        { ch: '    ', color: dim },
        { ch: '╱ ', color: green },
        { ch: '╭─────────╮', color: c.done },
        { ch: ' ╲', color: green },
      ])}
      {row([
        { ch: '   ', color: dim },
        { ch: '│ ', color: green },
        { ch: '╱ ', color: c.done },
        { ch: '╭─────╮', color: c.label },
        { ch: ' ╲ ', color: c.done },
        { ch: '│', color: green },
      ])}
      {row([
        { ch: '   ', color: dim },
        { ch: '│ ', color: green },
        { ch: '│ ', color: c.done },
        { ch: '│  ', color: c.label },
        { ch: '●', color: dot },
        { ch: '  │', color: c.label },
        { ch: ' │ ', color: c.done },
        { ch: '│', color: green },
      ])}
      {row([
        { ch: '   ', color: dim },
        { ch: '│ ', color: green },
        { ch: '╲ ', color: c.done },
        { ch: '╰─────╯', color: c.label },
        { ch: ' ╱ ', color: c.done },
        { ch: '│', color: green },
      ])}
      {row([
        { ch: '    ', color: dim },
        { ch: '╲ ', color: green },
        { ch: '╰─────────╯', color: c.done },
        { ch: ' ╱', color: green },
      ])}
      {row([
        { ch: '     ', color: dim },
        { ch: '╰─────────────╯', color: green },
      ])}
    </Box>
  );
}
