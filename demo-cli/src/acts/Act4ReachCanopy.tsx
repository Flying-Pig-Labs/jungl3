import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Text } from 'ink';
import { GalleryTile } from '../components/GalleryTile.js';
import { Gradient } from '../components/Gradient.js';
import { Typewriter } from '../components/Typewriter.js';
import { Tracked } from '../components/Tracking.js';
import { Counter } from '../components/Counter.js';
import { useActRunner, type Beat } from '../hooks/useActRunner.js';
import { useRegisterRunner } from '../hooks/useRunnerHandle.js';
import { useLog } from '../hooks/useLogStream.js';
import { act4Events } from '../fixtures/events.js';
import { visitors } from '../fixtures/visitors.js';
import { c } from '../theme.js';

/**
 * Integration Contract — the artifact published when a Jungle reaches its
 * Canopy. Reveals row-by-row at ~140ms per row (matching the v2 web demo).
 *
 * Each row is a key/value pair the Canopy needs in order to host the
 * prototype: name, version, health probe, persona list, telemetry sink,
 * auth pool, SLA. The trailing "sealed" line includes a fake sha256 to
 * sell the artifact-of-record framing.
 *
 * Tight 9-row composite (header + 7 rows + sealed line) so it nests inside
 * the Sprint Summary card without displacing the payoff line.
 */
function IntegrationContract({
  teamName,
  speedMultiplier,
}: {
  teamName: string;
  speedMultiplier: number;
}): React.ReactElement {
  const rows: Array<readonly [string, string]> = [
    ['name', `jungle-${teamName}/claims-intake`],
    ['version', '0.1.0'],
    ['health', 'GET /health → 200 · <200ms p95'],
    ['personas', 'analyst · policyholder · auditor · adjuster'],
    ['telemetry', 'OTLP → canopy/observability'],
    ['auth', 'cognito-pool / jungl3-visitors'],
    ['sla', '99.5% · 30 days'],
  ];
  const [shown, setShown] = useState<number>(0);
  useEffect(() => {
    if (shown >= rows.length) return;
    const dwell = Math.max(8, Math.round(140 * speedMultiplier));
    const id = setTimeout(() => setShown((n) => n + 1), dwell);
    return () => clearTimeout(id);
  }, [shown, speedMultiplier, rows.length]);

  const sealed = shown >= rows.length;

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box flexDirection="row">
        <Tracked color={c.label}>integration contract</Tracked>
        <Text color={c.dim}>{'  v1'}</Text>
      </Box>
      {rows.slice(0, shown).map((entry, i) => {
        const [k, v] = entry;
        return (
          <Box key={i} flexDirection="row">
            <Box width={12}>
              <Text color={c.dim}>{k.toUpperCase()}</Text>
            </Box>
            <Text color={i === 0 ? c.body : c.muted} bold={i === 0}>
              {v}
            </Text>
          </Box>
        );
      })}
      {sealed ? (
        <Box flexDirection="row" marginTop={0}>
          <Text color={c.done}>◆ sealed</Text>
          <Text color={c.dim}>{'   sha256:'}</Text>
          <Text color={c.muted}>7e1a…b4c2</Text>
          <Text color={c.dim}>{'   '}</Text>
          <Text color={c.label}>published → canopy</Text>
        </Box>
      ) : null}
    </Box>
  );
}

function stars(count: number): string {
  return '★'.repeat(count) + '☆'.repeat(Math.max(0, 5 - count));
}

/**
 * Act 4 — Reach Canopy.
 *
 * Canvas composition (not the usual left-glyph/right-content split; the
 * glyph here is the Gallery tile itself):
 *   top row:    Gallery tile drawing itself stroke-by-stroke (~400ms)
 *   below:      visitor rows appending one-by-one with eased session counts
 *   finale:     "Sprint summary" card with totals, then the gradient hero
 *
 * The act uses useEasedNumber via <Counter/> for the final summary totals
 * so they land with weight.
 */
export function Act4ReachCanopy({
  speedMultiplier,
  onComplete,
  teamName,
}: {
  speedMultiplier: number;
  onComplete?: () => void;
  teamName: string;
}): React.ReactElement {
  const log = useLog();
  const [tileVisible, setTileVisible] = useState<boolean>(false);
  const [shownVisitors, setShownVisitors] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showPayoff, setShowPayoff] = useState<boolean>(false);

  const logCursor = useRef<number>(0);
  const emitNext = () => {
    const entry = act4Events[logCursor.current];
    if (!entry) return;
    logCursor.current += 1;
    const [text, tone] = entry;
    log.emit(text.replaceAll('{team}', teamName), tone);
  };

  const beats: Beat[] = useMemo<Beat[]>(() => {
    const b: Beat[] = [];

    // Register into the gallery, then draw the tile stroke-by-stroke. The
    // tile draws itself from the moment it mounts (its own useEffect); we
    // advance beats past the ~400ms draw window to align pacing.
    b.push({ durationMs: 340, apply: () => emitNext() }); // registering
    b.push({ durationMs: 320, apply: () => emitNext() }); // dns propagated
    b.push({ durationMs: 200, apply: () => setTileVisible(true) });
    b.push({ durationMs: 500, apply: () => undefined }); // tile draws here
    b.push({ durationMs: 280, apply: () => emitNext() }); // tile rendered

    // Visitor rows append one-by-one, with their scripted log line.
    visitors.forEach((_v, i) => {
      b.push({
        durationMs: 320,
        apply: () => {
          setShownVisitors(i + 1);
          emitNext(); // session opened
        },
      });
      b.push({
        durationMs: 340,
        apply: () => emitNext(), // rating
      });
      b.push({ durationMs: 360, apply: () => undefined });
    });

    // Summary card.
    b.push({ durationMs: 400, apply: () => setShowSummary(true) });
    b.push({ durationMs: 800, apply: () => undefined }); // eased totals settle
    b.push({ durationMs: 240, apply: () => setShowPayoff(true) });
    b.push({ durationMs: 320, apply: () => emitNext() }); // highlight summary line
    b.push({ durationMs: 1300, apply: () => undefined });
    b.push({ durationMs: 150, apply: () => undefined });

    return b;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runner = useActRunner(beats, {
    speedMultiplier,
    autoPlay: true,
    onComplete,
  });
  useRegisterRunner(runner);

  // Tile dimensions. Wider than tall; Unicode box chars render 1×1.
  const TILE_W = 34;
  const TILE_H = 5;
  // Interior widths must fit inside (width - 2 - paddingX*2) = width - 4. With
  // width=36 that's 32 chars. Anything longer wraps and breaks row alignment
  // because the border column stays 1 row while the content column grows.
  const interior: React.ReactNode[] = [
    <Text key="t" color={c.body} bold>
      Claims Intake · {teamName}
    </Text>,
    <Text key="s" color={c.muted}>
      FNOL → settlement · 3 flows
    </Text>,
    <Text key="m" color={c.label}>
      healthy · 47 tests passing
    </Text>,
  ];

  return (
    <Box flexDirection="column" paddingX={2} paddingTop={1}>
      <Box flexDirection="row" alignItems="flex-start">
        {/* Left column: the Gallery tile itself IS Act 4's glyph. */}
        <Box flexDirection="column" width={TILE_W + 2}>
          <Box marginBottom={1}>
            <Tracked color={c.label}>canopy · gallery</Tracked>
          </Box>
          {tileVisible ? (
            <GalleryTile
              width={TILE_W}
              height={TILE_H}
              interiorLines={interior}
              drawDurationMs={400}
              speedMultiplier={speedMultiplier}
              borderColor={c.done}
            />
          ) : (
            <Box height={TILE_H} />
          )}
        </Box>

        {/* Right column: visitor rows, then summary card. */}
        <Box flexDirection="column" flexGrow={1} paddingLeft={2}>
          <Box marginBottom={1}>
            <Tracked color={c.label}>visitors</Tracked>
          </Box>
          <Box flexDirection="column" height={4}>
            {visitors.slice(0, shownVisitors).map((v, i) => (
              <Box key={i} flexDirection="row">
                <Box width={12}>
                  <Text color={c.muted}>{v.role}</Text>
                </Box>
                <Box width={14}>
                  <Text color={c.body}>{v.name}</Text>
                </Box>
                <Box width={7}>
                  <Text color={c.muted}>{v.sessionTime}</Text>
                </Box>
                <Box width={6}>
                  <Text color={c.label}>{stars(v.stars)}</Text>
                </Box>
              </Box>
            ))}
          </Box>

          {showSummary ? (
            <Box flexDirection="column" marginTop={1}>
              <Box>
                <Gradient>
                  <Tracked>sprint summary</Tracked>
                </Gradient>
              </Box>
              <Box flexDirection="row">
                <SummaryStat label="moves" value={3} />
                <SummaryStat label="dmz" value={1} />
                <SummaryStat label="visits" value={3} />
              </Box>
              <IntegrationContract teamName={teamName} speedMultiplier={speedMultiplier} />
              {showPayoff ? (
                <Typewriter
                  text={`Jungle ${teamName} · sprint complete · contract published.`}
                  cps={26}
                  jitterMs={20}
                  speedMultiplier={speedMultiplier}
                  color={c.body}
                  bold
                />
              ) : null}
            </Box>
          ) : null}
        </Box>
      </Box>

      <Box height={0}>
        <Text>{runner.beatIndex < 0 ? '' : ''}</Text>
      </Box>
    </Box>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }): React.ReactElement {
  return (
    <Box flexDirection="column" width={12}>
      <Counter value={value} durationMs={700} color={c.done} bold />
      <Text color={c.dim}>{label}</Text>
    </Box>
  );
}
