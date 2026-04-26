import React, { useMemo, useRef, useState } from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';
import { Act2Glyph } from '../components/ActGlyph.js';
import { Gradient } from '../components/Gradient.js';
import { Typewriter } from '../components/Typewriter.js';
import { Tracked } from '../components/Tracking.js';
import { Spinner } from '../components/Progress.js';
import { useActRunner, type Beat } from '../hooks/useActRunner.js';
import { useRegisterRunner } from '../hooks/useRunnerHandle.js';
import { useLog } from '../hooks/useLogStream.js';
import { act2Events } from '../fixtures/events.js';
import { shapingMoves, type ShapingMove } from '../fixtures/shaping-moves.js';
import { c } from '../theme.js';

type MoveState = 'pending' | 'applying' | 'applied';

interface Row {
  move: ShapingMove;
  state: MoveState;
}

const INITIAL_ROWS: Row[] = shapingMoves.map((m) => ({ move: m, state: 'pending' }));

/**
 * Kind gets encoded as a single colored symbol — a minus / tilde / plus —
 * in place of a wordy tag. The label carries the verb already.
 */
const KIND_SYMBOL: Record<ShapingMove['kind'], string> = {
  remove: '−',
  substitute: '~',
  extend: '+',
};

function MoveRow({ row }: { row: Row }): React.ReactElement {
  const { move, state } = row;
  const kindColor =
    move.kind === 'remove' ? c.rare : move.kind === 'substitute' ? c.label : c.done;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box flexDirection="row">
        <Box width={3}>
          {state === 'pending' && <Text color={c.dim}>{figures.circleDotted}</Text>}
          {state === 'applying' && <Spinner color={c.live} />}
          {state === 'applied' && <Text color={c.done}>{figures.tick}</Text>}
        </Box>
        <Box width={3}>
          <Text color={kindColor} bold>
            {KIND_SYMBOL[move.kind]}
          </Text>
        </Box>
        <Box flexGrow={1}>
          <Text color={state === 'pending' ? c.dim : c.body} dimColor={state === 'pending'}>
            {move.label}
          </Text>
        </Box>
      </Box>

      {state === 'applied' && (
        <Box flexDirection="row" paddingLeft={6}>
          <Text>
            {move.diff.map((d, i) => {
              const sign = d[0];
              const color =
                sign === '+' ? c.done : sign === '-' ? c.rare : c.label;
              return (
                <React.Fragment key={i}>
                  <Text color={color}>{d}</Text>
                  {i < move.diff.length - 1 ? <Text color={c.dim}>  ·  </Text> : null}
                </React.Fragment>
              );
            })}
          </Text>
        </Box>
      )}
    </Box>
  );
}

/**
 * Act 2 — Shape Understory.
 *
 * Three moves in sequence. Each takes ~4 beats:
 *   applying (180) → log emit (220) → log emit (220) → applied + log emit (260)
 * Plus a small dwell between moves so the viewer sees the diff land before
 * the next one starts.
 *
 * Payoff: highlight log line + gradient hero line. Total target ~25s.
 */
export function Act2ShapeUnderstory({
  speedMultiplier,
  onComplete,
  teamName: _teamName,
}: {
  speedMultiplier: number;
  onComplete?: () => void;
  teamName: string;
}): React.ReactElement {
  // teamName is currently unused in Act 2's visible surface — the moves and
  // hot-reload logs read identically across teams — but accepting it keeps
  // the prop contract uniform across all four acts.
  const log = useLog();
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [showPayoff, setShowPayoff] = useState<boolean>(false);

  const logCursor = useRef<number>(0);
  const emitNext = () => {
    const entry = act2Events[logCursor.current];
    if (!entry) return;
    logCursor.current += 1;
    const [text, tone] = entry;
    log.emit(text, tone);
  };

  const setRowState = (i: number, state: MoveState) => {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, state } : r)));
  };

  const beats: Beat[] = useMemo<Beat[]>(
    () => [
      // Move 1: remove
      { durationMs: 260, apply: () => setRowState(0, 'applying') },
      { durationMs: 260, apply: () => emitNext() }, // evaluating removal
      { durationMs: 320, apply: () => emitNext() }, // unmounting routes
      { durationMs: 260, apply: () => setRowState(0, 'applied') },
      { durationMs: 320, apply: () => emitNext() }, // hot-reload
      { durationMs: 360, apply: () => emitNext() }, // test-runner
      { durationMs: 500, apply: () => undefined }, // breathe

      // Move 2: substitute
      { durationMs: 260, apply: () => setRowState(1, 'applying') },
      { durationMs: 260, apply: () => emitNext() }, // writing FnolForm
      { durationMs: 320, apply: () => emitNext() }, // schema migrator
      { durationMs: 260, apply: () => setRowState(1, 'applied') },
      { durationMs: 320, apply: () => emitNext() }, // hot-reload
      { durationMs: 360, apply: () => emitNext() }, // test-runner
      { durationMs: 500, apply: () => undefined }, // breathe

      // Move 3: extend
      { durationMs: 260, apply: () => setRowState(2, 'applying') },
      { durationMs: 260, apply: () => emitNext() }, // generating state machine
      { durationMs: 320, apply: () => emitNext() }, // iam role
      { durationMs: 260, apply: () => setRowState(2, 'applied') },
      { durationMs: 320, apply: () => emitNext() }, // hot-reload
      { durationMs: 360, apply: () => emitNext() }, // test-runner
      { durationMs: 600, apply: () => undefined }, // breathe

      // Payoff
      { durationMs: 240, apply: () => setShowPayoff(true) },
      { durationMs: 280, apply: () => emitNext() }, // highlight line
      { durationMs: 1300, apply: () => undefined }, // hold on the hero line
      { durationMs: 150, apply: () => undefined }, // paint settle
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const runner = useActRunner(beats, {
    speedMultiplier,
    autoPlay: true,
    onComplete,
  });
  useRegisterRunner(runner);

  return (
    <Box flexDirection="column" paddingX={2}>
      <Box flexDirection="row">
        <Box width={18} flexDirection="column" paddingTop={2}>
          <Act2Glyph />
        </Box>

        <Box flexDirection="column" flexGrow={1} paddingLeft={2} paddingTop={1}>
          <Box marginBottom={1}>
            <Tracked color={c.label}>shaping understory</Tracked>
          </Box>

          <Box flexDirection="column">
            {rows.map((row, i) => (
              <MoveRow key={i} row={row} />
            ))}
          </Box>

          <Box marginTop={1} flexDirection="column">
            {showPayoff ? (
              <Gradient>
                <Typewriter
                  text="System stayed alive through 3 hot reloads."
                  cps={26}
                  jitterMs={20}
                  speedMultiplier={speedMultiplier}
                  bold
                />
              </Gradient>
            ) : (
              <Text color={c.dim}> </Text>
            )}
          </Box>
        </Box>
      </Box>

      <Box height={0}>
        <Text>{runner.beatIndex < 0 ? '' : ''}</Text>
      </Box>
    </Box>
  );
}
