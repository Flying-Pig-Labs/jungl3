import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { Gradient } from './Gradient.js';
import { Typewriter } from './Typewriter.js';
import { Tracked } from './Tracking.js';
import { c } from '../theme.js';

/**
 * MultiJungle — interstitial that flashes the Control Plane's view of all
 * jungles in flight, locating "your" jungle in a queued state about to
 * be vended. This sells the multi-tenant story before Act 1 begins
 * vending one specific jungle.
 *
 * Auto-advances after ~3.2s. Pure timer; no beat runner.
 */

type JungleStatus = 'queued' | 'vending' | 'shaping' | 'probing';

interface JungleRow {
  name: string;
  act: number; // 0 = queued / not yet started
  status: JungleStatus;
  pct: number;
}

const OTHER_TEAMS: JungleRow[] = [
  { name: 'nova', act: 1, status: 'vending', pct: 34 },
  { name: 'delta', act: 3, status: 'probing', pct: 72 },
  { name: 'ember', act: 2, status: 'shaping', pct: 51 },
];

function statusColor(s: JungleStatus): string {
  switch (s) {
    case 'queued':
      return c.dim;
    case 'vending':
      return c.live;
    case 'shaping':
      return c.label;
    case 'probing':
      return c.done;
  }
}

/**
 * Single-row 5-cell badge per jungle status. The v2 web version draws a 3×5
 * art glyph; the terminal port collapses each to a 5-character pattern so
 * MultiJungle's 4 rows fit inside the 14-line act-area budget. The pattern
 * itself still carries state info (sparse · for queued, blocky ▓ for
 * vending, etc.), and the row stays single-line to align with the rest of
 * the columns.
 */
function JungleGlyph({ status }: { status: JungleStatus }): React.ReactElement {
  const col = statusColor(status);
  const pat =
    status === 'queued'
      ? '· · ·'
      : status === 'vending'
        ? '▓ ▓ ▓'
        : status === 'shaping'
          ? '╌ ╎ ╌'
          : '○ ▲ ○';
  return <Text color={col}>{pat}</Text>;
}

function ProgressBar({ pct }: { pct: number }): React.ReactElement {
  const W = 18;
  const filled = Math.floor((W * pct) / 100);
  return (
    <Box flexDirection="row">
      <Text color={c.done}>{'█'.repeat(filled)}</Text>
      <Text color={c.dim}>{'░'.repeat(W - filled)}</Text>
      <Text color={c.muted}>{` ${String(pct).padStart(3, ' ')}%`}</Text>
    </Box>
  );
}

export function MultiJungle({
  teamName,
  speedMultiplier,
  onContinue,
}: {
  teamName: string;
  speedMultiplier: number;
  onContinue?: () => void;
}): React.ReactElement {
  const [phase, setPhase] = useState<0 | 1>(0);

  useEffect(() => {
    // Two timers: phase flips at ~1.4s (real time, scaled by multiplier),
    // continue fires at ~3.2s. Speed multiplier scales both so --fast
    // doesn't dwell here.
    const t1 = setTimeout(() => setPhase(1), Math.max(40, Math.round(1400 * speedMultiplier)));
    const t2 = setTimeout(() => onContinue?.(), Math.max(80, Math.round(3200 * speedMultiplier)));
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // onContinue may be a fresh closure on every render; re-running this effect
    // would re-arm the timers and never finish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speedMultiplier]);

  const mine: JungleRow = { name: teamName, act: 0, status: 'queued', pct: 0 };
  const rows: Array<JungleRow & { mine?: boolean }> = [
    { ...mine, mine: true },
    ...OTHER_TEAMS,
  ];

  return (
    <Box flexDirection="column" paddingX={2} paddingTop={1}>
      <Box flexDirection="row" marginBottom={1}>
        <Tracked color={c.label}>control plane · us-east-1</Tracked>
        <Text color={c.dim}>{'  ·  '}</Text>
        <Text color={c.muted}>{`${rows.length} active jungles · 1 queued`}</Text>
        <Box flexGrow={1} />
        <Text color={c.done}>●</Text>
        <Text color={c.dim}> healthy</Text>
      </Box>

      {/* Header row */}
      <Box flexDirection="row">
        <Box width={3} />
        <Box width={8}>
          <Text color={c.dim}>GLYPH</Text>
        </Box>
        <Box width={18}>
          <Text color={c.dim}>JUNGLE</Text>
        </Box>
        <Box width={8}>
          <Text color={c.dim}>ACT</Text>
        </Box>
        <Box width={11}>
          <Text color={c.dim}>STATUS</Text>
        </Box>
        <Box>
          <Text color={c.dim}>PROGRESS</Text>
        </Box>
      </Box>
      <Text color={c.dim}>{'─'.repeat(60)}</Text>

      {rows.map((r, i) => (
        <Box key={i} flexDirection="row">
          <Box width={3}>
            {r.mine ? (
              <Text color={c.label} bold>
                {'▸ '}
              </Text>
            ) : (
              <Text color={c.dim}>{'  '}</Text>
            )}
          </Box>
          <Box width={8}>
            <JungleGlyph status={r.status} />
          </Box>
          <Box width={18}>
            <Text color={r.mine ? c.body : c.muted} bold={r.mine}>
              {`jungle-${r.name}`}
            </Text>
          </Box>
          <Box width={8}>
            <Text color={c.dim}>{r.act === 0 ? '—' : `act ${r.act}`}</Text>
          </Box>
          <Box width={11}>
            <Text color={statusColor(r.status)}>{r.status}</Text>
          </Box>
          <ProgressBar pct={r.pct} />
        </Box>
      ))}

      <Box marginTop={1}>
        {phase === 1 ? (
          <Gradient>
            <Typewriter
              text={`› vending jungle-${teamName} on control plane…`}
              cps={28}
              jitterMs={20}
              speedMultiplier={speedMultiplier}
              bold
            />
          </Gradient>
        ) : (
          <Text color={c.dim}>{'█ initializing control plane view…'}</Text>
        )}
      </Box>
    </Box>
  );
}
