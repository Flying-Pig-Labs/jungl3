import React, { useMemo, useRef, useState } from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';
import { Act3Glyph } from '../components/ActGlyph.js';
import { Gradient } from '../components/Gradient.js';
import { Typewriter } from '../components/Typewriter.js';
import { Tracked } from '../components/Tracking.js';
import { Spinner } from '../components/Progress.js';
import { useActRunner, type Beat } from '../hooks/useActRunner.js';
import { useRegisterRunner } from '../hooks/useRunnerHandle.js';
import { useLog } from '../hooks/useLogStream.js';
import { useEasedNumber } from '../hooks/useEasedNumber.js';
import { act3Events } from '../fixtures/events.js';
import { personas } from '../fixtures/personas.js';
import { c } from '../theme.js';

type PersonaState = 'idle' | 'probing' | 'reporting' | 'done';

interface PersonaRow {
  state: PersonaState;
  sessionsTarget: number;
  defectsTarget: number;
}

const INITIAL_ROWS: PersonaRow[] = personas.map(() => ({
  state: 'idle',
  sessionsTarget: 0,
  defectsTarget: 0,
}));

function stateLabel(s: PersonaState): string {
  switch (s) {
    case 'idle':
      return 'idle';
    case 'probing':
      return 'probing';
    case 'reporting':
      return 'reporting';
    case 'done':
      return 'done';
  }
}

function stateColor(s: PersonaState): string {
  switch (s) {
    case 'idle':
      return c.dim;
    case 'probing':
      return c.live;
    case 'reporting':
      return c.label;
    case 'done':
      return c.done;
  }
}

/**
 * The sole ember moment in the full 90s run is the *first* defect surfaced
 * across the whole DMZ pass. When rowIndex === emberTriggerRow and the
 * defect count transitions from 0 to >0, we flash ember for one tick.
 */
function PersonaLine({
  personaIndex,
  row,
  emberFlash,
  speedMultiplier,
}: {
  personaIndex: number;
  row: PersonaRow;
  emberFlash: boolean;
  speedMultiplier: number;
}): React.ReactElement {
  const p = personas[personaIndex]!;
  // Counter ease duration scales with speed so --fast doesn't stretch.
  const easeMs = Math.max(60, Math.round(600 * speedMultiplier));
  const sessions = useEasedNumber(row.sessionsTarget, easeMs);
  const defects = useEasedNumber(row.defectsTarget, easeMs);

  const defectColor = emberFlash ? c.rare : defects > 0 ? c.label : c.dim;

  return (
    <Box flexDirection="row">
      <Box width={3}>
        {row.state === 'idle' && <Text color={c.dim}>{figures.circleDotted}</Text>}
        {row.state === 'probing' && <Spinner color={c.live} />}
        {row.state === 'reporting' && <Text color={c.label}>{figures.pointer}</Text>}
        {row.state === 'done' && <Text color={c.done}>{figures.tick}</Text>}
      </Box>
      <Box width={16}>
        <Text color={row.state === 'idle' ? c.dim : c.body} dimColor={row.state === 'idle'}>
          {p.role}
        </Text>
      </Box>
      <Box width={13}>
        <Text color={stateColor(row.state)} dimColor={row.state === 'idle'}>
          {stateLabel(row.state)}
        </Text>
      </Box>
      <Box width={9}>
        <Text color={c.muted}>
          {String(sessions).padStart(2, ' ')} sess
        </Text>
      </Box>
      <Box width={10}>
        <Text color={defectColor} bold={emberFlash}>
          {String(defects).padStart(2, ' ')} defect{defects === 1 ? '' : 's'}
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Act 3 — Refine in DMZ. Four personas cycle through probe/report in order.
 * Each persona:
 *   idle → probing (ramp sessions count, ease ~600ms) → reporting (ramp
 *   defect count) → done.
 *
 * The first defect-surface across the whole act flashes ember for one
 * beat — the single ember accent in the full 90s run.
 *
 * Ends with the gate line emission as a highlight, then the gradient
 * hero line.
 */
export function Act3RefineInDmz({
  speedMultiplier,
  onComplete,
  teamName: _teamName,
}: {
  speedMultiplier: number;
  onComplete?: () => void;
  teamName: string;
}): React.ReactElement {
  // teamName accepted for prop-contract uniformity; the DMZ persona logs
  // don't currently reference the team name.
  const log = useLog();
  const [rows, setRows] = useState<PersonaRow[]>(INITIAL_ROWS);
  const [activePersona, setActivePersona] = useState<number>(-1);
  const [emberRow, setEmberRow] = useState<number>(-1);
  const [showPayoff, setShowPayoff] = useState<boolean>(false);

  const logCursor = useRef<number>(0);
  const emitNext = () => {
    const entry = act3Events[logCursor.current];
    if (!entry) return;
    logCursor.current += 1;
    const [text, tone] = entry;
    log.emit(text, tone);
  };

  const setRow = (i: number, patch: Partial<PersonaRow>) => {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  };

  const beats: Beat[] = useMemo<Beat[]>(() => {
    const out: Beat[] = [];

    // DMZ preamble
    out.push({ durationMs: 300, apply: () => emitNext() }); // provisioning
    out.push({ durationMs: 360, apply: () => emitNext() }); // agent-runtime attached
    out.push({ durationMs: 400, apply: () => undefined });

    personas.forEach((p, i) => {
      // Persona starts probing
      out.push({
        durationMs: 280,
        apply: () => {
          setActivePersona(i);
          setRow(i, { state: 'probing', sessionsTarget: p.sessions });
        },
      });
      out.push({ durationMs: 340, apply: () => emitNext() }); // session 1 / ...
      out.push({ durationMs: 600, apply: () => undefined }); // let sessions count ease
      // Persona reports defects. First persona's first defect = ember flash.
      out.push({
        durationMs: 280,
        apply: () => {
          setRow(i, { state: 'reporting', defectsTarget: p.defects });
          if (i === 0) setEmberRow(0);
        },
      });
      out.push({ durationMs: 340, apply: () => emitNext() }); // defect surfaced
      // Clear the ember flash one beat after.
      out.push({
        durationMs: 280,
        apply: () => {
          if (i === 0) setEmberRow(-1);
        },
      });
      // Done.
      out.push({
        durationMs: 320,
        apply: () => setRow(i, { state: 'done' }),
      });
      out.push({ durationMs: 280, apply: () => undefined });
    });

    // Roll-up + payoff
    out.push({
      durationMs: 360,
      apply: () => {
        setActivePersona(-1);
        emitNext();
      },
    }); // session roll-up
    out.push({ durationMs: 500, apply: () => undefined });
    out.push({ durationMs: 240, apply: () => setShowPayoff(true) });
    out.push({ durationMs: 320, apply: () => emitNext() }); // highlight gate line
    out.push({ durationMs: 1300, apply: () => undefined }); // hold hero
    out.push({ durationMs: 150, apply: () => undefined }); // paint settle

    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runner = useActRunner(beats, {
    speedMultiplier,
    autoPlay: true,
    onComplete,
  });
  useRegisterRunner(runner);

  return (
    <Box flexDirection="column" paddingX={2}>
      <Box flexDirection="row">
        <Box width={26} flexDirection="column" paddingTop={1}>
          <Act3Glyph activeIndex={activePersona} />
        </Box>

        <Box flexDirection="column" flexGrow={1} paddingLeft={3} paddingTop={1}>
          <Box marginBottom={1}>
            <Tracked color={c.label}>dmz evaluation · 4 seeded personas</Tracked>
          </Box>

          <Box flexDirection="column">
            {rows.map((row, i) => (
              <PersonaLine
                key={i}
                personaIndex={i}
                row={row}
                emberFlash={emberRow === i}
                speedMultiplier={speedMultiplier}
              />
            ))}
          </Box>

          <Box marginTop={2} flexDirection="column">
            {showPayoff ? (
              <Gradient>
                <Typewriter
                  text="DMZ gates: 2 of 2 passed · 6 defects · 0 critical."
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
