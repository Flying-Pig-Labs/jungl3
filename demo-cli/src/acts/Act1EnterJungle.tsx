import React, { useMemo, useRef, useState } from 'react';
import { Box, Text } from 'ink';
import { Act1Glyph } from '../components/ActGlyph.js';
import { Logo } from '../components/Logo.js';
import { SubtaskList, type Subtask } from '../components/Progress.js';
import { Gradient } from '../components/Gradient.js';
import { Typewriter } from '../components/Typewriter.js';
import { Tracked } from '../components/Tracking.js';
import { useActRunner, type Beat } from '../hooks/useActRunner.js';
import { useRegisterRunner } from '../hooks/useRunnerHandle.js';
import { useLog } from '../hooks/useLogStream.js';
import { act1Events } from '../fixtures/events.js';
import { c } from '../theme.js';

const INITIAL_TASKS: Subtask[] = [
  { label: 'Vending Jungle', state: 'pending' },
  { label: 'Provisioning Substrate', state: 'pending' },
  { label: 'Seeding Understory', state: 'pending' },
  { label: 'Wiring integrations', state: 'pending' },
  { label: 'Opening operator console', state: 'pending' },
];

type Phase = 'logo' | 'scene';

/**
 * Act 1 — Enter Jungle.
 *
 * Two phases:
 *   1. Boot logo. Renders <Logo/>, which owns its own reveal timers and
 *      fires onDone when finished. This phase is off the beat runner on
 *      purpose — ink-big-text's reveal is character-count driven, not
 *      apply()-at-time driven, and stuffing it into a beat adds no clarity.
 *   2. Scene. The beat runner walks the scripted sequence: subtasks tick
 *      active→done with log emissions interleaved, then the payoff line
 *      types itself in gradient.
 *
 * onComplete fires exactly once, after the payoff hold. The scene-phase
 * beat list includes a trailing dwell so the final frame paints before the
 * parent tears down (matters under --fast; without it, exit races render).
 */
export function Act1EnterJungle({
  speedMultiplier,
  onComplete,
  teamName,
}: {
  speedMultiplier: number;
  onComplete?: () => void;
  teamName: string;
}): React.ReactElement {
  const log = useLog();
  const [phase, setPhase] = useState<Phase>('logo');
  const [tasks, setTasks] = useState<Subtask[]>(INITIAL_TASKS);
  const [showPayoff, setShowPayoff] = useState<boolean>(false);

  const setTaskState = (i: number, state: Subtask['state']) => {
    setTasks((prev) => prev.map((t, j) => (j === i ? { ...t, state } : t)));
  };

  // Log cursor must survive re-renders; a mutable ref is the honest shape
  // here. A state-based cursor would re-run apply() and duplicate emissions.
  const logCursor = useRef<number>(0);
  const emitNext = () => {
    const entry = act1Events[logCursor.current];
    if (!entry) return;
    logCursor.current += 1;
    const [text, tone] = entry;
    // Log fixtures use {team} as a placeholder wherever the team name
    // should appear. Interpolating at emit time keeps the fixtures static.
    log.emit(text.replaceAll('{team}', teamName), tone);
  };

  const sceneBeats: Beat[] = useMemo<Beat[]>(
    () => [
      { durationMs: 200, apply: () => setTaskState(0, 'active') },
      { durationMs: 220, apply: () => emitNext() },
      { durationMs: 220, apply: () => emitNext() },
      { durationMs: 260, apply: () => setTaskState(0, 'done') },

      { durationMs: 180, apply: () => setTaskState(1, 'active') },
      { durationMs: 200, apply: () => emitNext() },
      { durationMs: 220, apply: () => emitNext() },
      { durationMs: 260, apply: () => setTaskState(1, 'done') },

      { durationMs: 180, apply: () => setTaskState(2, 'active') },
      { durationMs: 220, apply: () => emitNext() },
      { durationMs: 220, apply: () => emitNext() },
      { durationMs: 220, apply: () => emitNext() },
      { durationMs: 240, apply: () => emitNext() },
      { durationMs: 260, apply: () => setTaskState(2, 'done') },

      { durationMs: 180, apply: () => setTaskState(3, 'active') },
      // Transient failure + recovery. The single moment of friction in
      // the whole 90s run — without it, the operator console reads as
      // suspiciously perfect. Warn-tone line lingers (540ms) so the
      // viewer's eye catches the ember color before "stub online" lands.
      { durationMs: 260, apply: () => emitNext() }, // retrying (1/3)  [warn]
      { durationMs: 540, apply: () => undefined },
      { durationMs: 200, apply: () => emitNext() }, // policy-api stub online
      { durationMs: 200, apply: () => emitNext() }, // payments-api stub online
      { durationMs: 220, apply: () => emitNext() }, // document-store stub online
      { durationMs: 260, apply: () => setTaskState(3, 'done') },

      { durationMs: 180, apply: () => setTaskState(4, 'active') },
      { durationMs: 200, apply: () => emitNext() },
      { durationMs: 200, apply: () => emitNext() },
      { durationMs: 220, apply: () => emitNext() },
      { durationMs: 240, apply: () => emitNext() },
      { durationMs: 260, apply: () => setTaskState(4, 'done') },

      // Breathe, then payoff.
      { durationMs: 600, apply: () => undefined },
      { durationMs: 200, apply: () => setShowPayoff(true) },
      { durationMs: 260, apply: () => emitNext() }, // highlight line
      { durationMs: 1300, apply: () => undefined },
      // Trailing paint-settle so exitOnComplete does not race the last frame.
      { durationMs: 150, apply: () => undefined },
    ],
    // Beats are created once when the scene phase mounts. Recreating would
    // reset the runner; we don't want that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // The runner exists only when we're in the scene phase. An empty beats
  // array in the logo phase would fire onComplete immediately.
  const isScene = phase === 'scene';
  const runner = useActRunner(isScene ? sceneBeats : NO_BEATS, {
    speedMultiplier,
    autoPlay: isScene,
    onComplete: isScene ? onComplete : undefined,
  });
  useRegisterRunner(runner);

  if (phase === 'logo') {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center">
        <Box marginTop={2} />
        <Logo speedMultiplier={speedMultiplier} onDone={() => setPhase('scene')} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2}>
      <Box flexDirection="row">
        <Box width={28} flexDirection="column" paddingTop={1}>
          <Act1Glyph />
        </Box>

        <Box flexDirection="column" flexGrow={1} paddingLeft={4} paddingTop={1}>
          <Box marginBottom={1}>
            <Tracked color={c.label}>{`vending jungle · team ${teamName}`}</Tracked>
          </Box>

          <SubtaskList tasks={tasks} />

          <Box marginTop={2} flexDirection="column">
            {showPayoff ? (
              <Gradient>
                <Typewriter
                  text={`Jungle ${teamName} is alive.`}
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

      {/* Keep the runner reference live without rendering anything for it. */}
      <Box height={0}>
        <Text>{runner.beatIndex < 0 ? '' : ''}</Text>
      </Box>
    </Box>
  );
}

const NO_BEATS: Beat[] = [];
