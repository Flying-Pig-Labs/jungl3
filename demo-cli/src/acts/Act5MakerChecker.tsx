import React, { useMemo, useRef, useState } from 'react';
import { Box, Text } from 'ink';
import { Gradient } from '../components/Gradient.js';
import { Typewriter } from '../components/Typewriter.js';
import { Tracked } from '../components/Tracking.js';
import { useActRunner, type Beat } from '../hooks/useActRunner.js';
import { useRegisterRunner } from '../hooks/useRunnerHandle.js';
import { useLog } from '../hooks/useLogStream.js';
import { useEasedNumber } from '../hooks/useEasedNumber.js';
import { act5Events } from '../fixtures/events.js';
import { c } from '../theme.js';

/**
 * Act 5 — Maker-Checker.
 *
 * Stage progression:
 *   0 intake     — initial inert state
 *   1 maker      — casey is assigned, proposes a settlement
 *   2 threshold  — proposed amount > $10k, the threshold edge flashes ember
 *                  for one beat (the single rare-color tell of this act)
 *   3 checker    — jordan is paged and reviews
 *   4 settled    — disbursement queued, audit trail sealed
 *
 * Visual: vertical workflow glyph on the left (maker box → threshold edge →
 * checker box), kv table on the right with the proposed amount easing into
 * place. Anchors the demo's regulated-domain credibility — the only act
 * that exists to show a control behaving correctly under pressure.
 */

type Stage = 0 | 1 | 2 | 3 | 4;

function WorkflowGlyph({
  stage,
  thresholdFlash,
}: {
  stage: Stage;
  thresholdFlash: boolean;
}): React.ReactElement {
  const makerLive = stage >= 1;
  const checkerLive = stage >= 3;
  // The maker box loses its label color once we move on to the checker
  // (stage 3+) — same in v2; the active role is highlighted, prior roles
  // recede.
  const makerHi = stage >= 1 && stage <= 2;
  const checkerHi = stage >= 3;

  return (
    <Box flexDirection="column">
      <Text color={makerLive ? c.done : c.dim}>{'  ┌──────────┐'}</Text>
      <Text>
        <Text color={makerLive ? c.done : c.dim}>{'  │ '}</Text>
        <Text color={makerHi ? c.label : c.dim} bold={makerHi}>
          {'maker    '}
        </Text>
        <Text color={makerLive ? c.done : c.dim}>{'│'}</Text>
      </Text>
      <Text>
        <Text color={makerLive ? c.done : c.dim}>{'  │ '}</Text>
        <Text color={c.muted}>{'casey    '}</Text>
        <Text color={makerLive ? c.done : c.dim}>{'│'}</Text>
      </Text>
      <Text color={makerLive ? c.done : c.dim}>{'  └────┬─────┘'}</Text>
      <Text>
        <Text color={stage >= 2 ? c.rare : c.dim}>{'       │ '}</Text>
        <Text
          color={thresholdFlash ? c.rare : stage >= 2 ? c.label : c.dim}
          bold={thresholdFlash}
        >
          {'> $10k'}
        </Text>
      </Text>
      <Text color={checkerLive ? c.done : c.dim}>{'  ┌────┴─────┐'}</Text>
      <Text>
        <Text color={checkerLive ? c.done : c.dim}>{'  │ '}</Text>
        <Text color={checkerHi ? c.label : c.dim} bold={checkerHi}>
          {'checker  '}
        </Text>
        <Text color={checkerLive ? c.done : c.dim}>{'│'}</Text>
      </Text>
      <Text>
        <Text color={checkerLive ? c.done : c.dim}>{'  │ '}</Text>
        <Text color={c.muted}>{'jordan   '}</Text>
        <Text color={checkerLive ? c.done : c.dim}>{'│'}</Text>
      </Text>
      <Text color={checkerLive ? c.done : c.dim}>{'  └──────────┘'}</Text>
    </Box>
  );
}

export function Act5MakerChecker({
  speedMultiplier,
  onComplete,
  teamName: _teamName,
}: {
  speedMultiplier: number;
  onComplete?: () => void;
  teamName: string;
}): React.ReactElement {
  const log = useLog();
  const [stage, setStage] = useState<Stage>(0);
  const [amountTarget, setAmountTarget] = useState<number>(0);
  const [thresholdFlash, setThresholdFlash] = useState<boolean>(false);
  const [showPayoff, setShowPayoff] = useState<boolean>(false);

  // Eased dollar amount, scales ease duration with multiplier so --fast
  // doesn't stretch.
  const easeMs = Math.max(60, Math.round(700 * speedMultiplier));
  const amount = useEasedNumber(amountTarget, easeMs);

  const logCursor = useRef<number>(0);
  const emitNext = () => {
    const entry = act5Events[logCursor.current];
    if (!entry) return;
    logCursor.current += 1;
    const [text, tone] = entry;
    log.emit(text, tone);
  };

  const beats: Beat[] = useMemo<Beat[]>(
    () => [
      { durationMs: 300, apply: () => setStage(1) },
      { durationMs: 320, apply: () => emitNext() }, // intake: FNOL
      { durationMs: 320, apply: () => emitNext() }, // policy-api: coverage verified
      { durationMs: 280, apply: () => emitNext() }, // adjuster: casey assigned
      {
        durationMs: 280,
        apply: () => {
          setAmountTarget(12450);
          emitNext(); // adjuster: settlement proposed
        },
      },
      { durationMs: 500, apply: () => undefined },

      {
        durationMs: 240,
        apply: () => {
          setStage(2);
          setThresholdFlash(true);
          emitNext(); // workflow: threshold exceeded (highlight)
        },
      },
      { durationMs: 400, apply: () => setThresholdFlash(false) },
      { durationMs: 280, apply: () => emitNext() }, // iam: deny (maker)

      {
        durationMs: 320,
        apply: () => {
          setStage(3);
          emitNext(); // notify: jordan paged
        },
      },
      { durationMs: 320, apply: () => emitNext() }, // checker: reviewing
      { durationMs: 360, apply: () => emitNext() }, // checker: approval granted

      {
        durationMs: 320,
        apply: () => {
          setStage(4);
          emitNext(); // payments-api: disbursement queued
        },
      },
      { durationMs: 600, apply: () => undefined },
      { durationMs: 240, apply: () => setShowPayoff(true) },
      { durationMs: 320, apply: () => emitNext() }, // settled (highlight)
      { durationMs: 1300, apply: () => undefined },
      { durationMs: 150, apply: () => undefined },
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

  const proposedColor = stage >= 1 ? c.body : c.dim;

  return (
    <Box flexDirection="row" paddingX={2} paddingTop={1}>
      <Box width={18} flexDirection="column" flexShrink={0}>
        <WorkflowGlyph stage={stage} thresholdFlash={thresholdFlash} />
      </Box>

      <Box flexDirection="column" flexGrow={1} paddingLeft={3}>
        <Box marginBottom={1}>
          <Tracked color={c.label}>claim FNOL-2024-0917 · settlement workflow</Tracked>
        </Box>

        <Box flexDirection="row">
          <Box width={14}>
            <Text color={c.dim}>policy</Text>
          </Box>
          <Text color={stage >= 1 ? c.body : c.dim}>comprehensive · limit $25,000</Text>
        </Box>

        <Box flexDirection="row">
          <Box width={14}>
            <Text color={c.dim}>proposed</Text>
          </Box>
          <Text color={proposedColor} bold>
            ${amount.toLocaleString()}
          </Text>
        </Box>

        <Box flexDirection="row">
          <Box width={14}>
            <Text color={c.dim}>threshold</Text>
          </Box>
          <Text
            color={thresholdFlash ? c.rare : stage >= 2 ? c.label : c.dim}
            bold={thresholdFlash}
          >
            {`$10,000${stage >= 2 ? ' · EXCEEDED' : ''}`}
          </Text>
        </Box>

        <Box flexDirection="row">
          <Box width={14}>
            <Text color={c.dim}>checker</Text>
          </Box>
          <Text color={stage >= 3 ? c.body : c.dim}>
            {stage >= 4 ? 'jordan · approved (18s)' : stage >= 3 ? 'jordan · reviewing' : '—'}
          </Text>
        </Box>

        <Box flexDirection="row">
          <Box width={14}>
            <Text color={c.dim}>status</Text>
          </Box>
          <Text color={stage >= 4 ? c.done : c.dim} bold={stage >= 4}>
            {stage >= 4 ? 'SETTLED · audit sealed' : 'pending'}
          </Text>
        </Box>

        <Box marginTop={1} flexDirection="column">
          {showPayoff ? (
            <Gradient>
              <Typewriter
                text="Maker-checker: non-bypassable. Audit trail sealed."
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

      <Box height={0}>
        <Text>{runner.beatIndex < 0 ? '' : ''}</Text>
      </Box>
    </Box>
  );
}
