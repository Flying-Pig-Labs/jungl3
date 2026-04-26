import React, { useMemo, useRef, useState } from 'react';
import { Box, Text } from 'ink';
import { SubtaskList, type Subtask } from '../components/Progress.js';
import { Gradient } from '../components/Gradient.js';
import { Typewriter } from '../components/Typewriter.js';
import { Tracked } from '../components/Tracking.js';
import { useActRunner, type Beat } from '../hooks/useActRunner.js';
import { useRegisterRunner } from '../hooks/useRunnerHandle.js';
import { useLog } from '../hooks/useLogStream.js';
import { act0Events } from '../fixtures/events.js';
import { c } from '../theme.js';

const INITIAL_TASKS: Subtask[] = [
  { label: 'AWS Marketplace subscribe', state: 'pending' },
  { label: 'Deploy CloudFormation stack', state: 'pending' },
  { label: 'Provision Control Plane VPC', state: 'pending' },
  { label: 'Start jungl3-cp ECS cluster', state: 'pending' },
  { label: 'Open API gateway', state: 'pending' },
];

const ACCOUNT_ID = '123456789012';

/**
 * Three vertically stacked boxes representing the install pipeline:
 * marketplace → cloudformation → control plane. Each box lights up as
 * its corresponding stage activates: marketplace is always on (the
 * customer is here because they subscribed), CFN lights once `pct > 0`,
 * the control plane lights once `payoff` fires.
 *
 * Single-line box characters throughout — mixing single/double-line
 * (as the v2 HTML does) renders inconsistently across terminal fonts.
 * Bold on the active box's label is the "live" tell.
 */
function InstallStackGlyph({ pct, payoff }: { pct: number; payoff: boolean }): React.ReactElement {
  const cfnLive = pct > 0;
  const cpLive = payoff;
  const cfnLabel = `jungl3-cp ${String(pct).padStart(3, ' ')}%`;
  return (
    <Box flexDirection="column">
      <Text color={c.dim}> your aws account</Text>
      {/* marketplace */}
      <Text color={c.done}>{'╭───────────────────╮'}</Text>
      <Text>
        <Text color={c.done}>{'│ '}</Text>
        <Text color={c.label} bold>
          {'aws marketplace   '}
        </Text>
        <Text color={c.done}>{'│'}</Text>
      </Text>
      <Text>
        <Text color={c.done}>{'│ '}</Text>
        <Text color={c.muted}>{'jungl3-cp listing'.padEnd(18)}</Text>
        <Text color={c.done}>{'│'}</Text>
      </Text>
      <Text color={c.done}>{'╰─────────┬─────────╯'}</Text>
      <Text>
        <Text color={c.live}>{'          │ '}</Text>
        <Text color={c.live}>subscribe</Text>
      </Text>
      <Text color={c.live}>{'          ▼'}</Text>
      {/* cloudformation */}
      <Text color={cfnLive ? c.done : c.dim}>{'╭───────────────────╮'}</Text>
      <Text>
        <Text color={cfnLive ? c.done : c.dim}>{'│ '}</Text>
        <Text color={cfnLive ? c.label : c.dim} bold={cfnLive}>
          {'cloudformation    '}
        </Text>
        <Text color={cfnLive ? c.done : c.dim}>{'│'}</Text>
      </Text>
      <Text>
        <Text color={cfnLive ? c.done : c.dim}>{'│ '}</Text>
        <Text color={c.muted}>{cfnLabel.padEnd(18)}</Text>
        <Text color={cfnLive ? c.done : c.dim}>{'│'}</Text>
      </Text>
      <Text color={cfnLive ? c.done : c.dim}>{'╰─────────┬─────────╯'}</Text>
      <Text color={pct >= 100 ? c.live : c.dim}>{'          │ provision'}</Text>
      <Text color={pct >= 100 ? c.live : c.dim}>{'          ▼'}</Text>
      {/* control plane */}
      <Text color={cpLive ? c.label : c.dim}>{'╭───────────────────╮'}</Text>
      <Text>
        <Text color={cpLive ? c.label : c.dim}>{'│ '}</Text>
        <Text color={cpLive ? c.done : c.dim} bold={cpLive}>
          {'control plane     '}
        </Text>
        <Text color={cpLive ? c.label : c.dim}>{'│'}</Text>
      </Text>
      <Text>
        <Text color={cpLive ? c.label : c.dim}>{'│ '}</Text>
        <Text color={cpLive ? c.done : c.dim}>{(cpLive ? '● online' : '○ pending').padEnd(18)}</Text>
        <Text color={cpLive ? c.label : c.dim}>{'│'}</Text>
      </Text>
      <Text color={cpLive ? c.label : c.dim}>{'╰───────────────────╯'}</Text>
    </Box>
  );
}

function CfnProgressBar({ pct }: { pct: number }): React.ReactElement {
  const W = 32;
  const filled = Math.floor((W * pct) / 100);
  return (
    <Box flexDirection="row">
      <Text color={c.dim}>cfn stack  </Text>
      <Text color={c.done}>{'█'.repeat(filled)}</Text>
      <Text color={c.dim}>{'░'.repeat(W - filled)}</Text>
      <Text color={c.muted}>{` ${String(pct).padStart(3, ' ')}%`}</Text>
    </Box>
  );
}

/**
 * Act 0 — Marketplace Install.
 *
 * The new opening beat: the customer subscribes to the AWS Marketplace
 * listing, CFN deploys the Control Plane into their account, and the CP
 * comes online ready to vend jungles. Sets up the rest of the demo by
 * showing where Jungl3 actually runs (in the customer's account, not as
 * a SaaS).
 */
export function Act0MarketplaceInstall({
  speedMultiplier,
  onComplete,
}: {
  speedMultiplier: number;
  onComplete?: () => void;
  // teamName accepted for prop-contract uniformity with the rest of the
  // acts; install runs before the Jungle is named.
  teamName?: string;
}): React.ReactElement {
  const log = useLog();
  const [tasks, setTasks] = useState<Subtask[]>(INITIAL_TASKS);
  const [pct, setPct] = useState<number>(0);
  const [showPayoff, setShowPayoff] = useState<boolean>(false);

  const setTaskState = (i: number, state: Subtask['state']) => {
    setTasks((prev) => prev.map((t, j) => (j === i ? { ...t, state } : t)));
  };

  const logCursor = useRef<number>(0);
  const emitNext = () => {
    const entry = act0Events[logCursor.current];
    if (!entry) return;
    logCursor.current += 1;
    const [text, tone] = entry;
    log.emit(text.replaceAll('{account}', ACCOUNT_ID), tone);
  };

  const beats: Beat[] = useMemo<Beat[]>(
    () => [
      { durationMs: 250, apply: () => setTaskState(0, 'active') },
      { durationMs: 280, apply: () => emitNext() }, // subscription confirmed
      { durationMs: 240, apply: () => setTaskState(0, 'done') },

      { durationMs: 200, apply: () => setTaskState(1, 'active') },
      { durationMs: 260, apply: () => emitNext() }, // creating cross-account role
      { durationMs: 220, apply: () => setPct(12) },
      { durationMs: 260, apply: () => emitNext() }, // CREATE_IN_PROGRESS
      { durationMs: 220, apply: () => setPct(28) },
      { durationMs: 260, apply: () => setTaskState(1, 'done') },

      { durationMs: 200, apply: () => setTaskState(2, 'active') },
      { durationMs: 260, apply: () => emitNext() }, // vpc + subnets created
      { durationMs: 240, apply: () => setPct(48) },
      { durationMs: 240, apply: () => setTaskState(2, 'done') },

      { durationMs: 200, apply: () => setTaskState(3, 'active') },
      { durationMs: 260, apply: () => emitNext() }, // ecs cluster online
      { durationMs: 220, apply: () => setPct(68) },
      { durationMs: 260, apply: () => emitNext() }, // api-gateway provisioned
      { durationMs: 220, apply: () => setPct(86) },
      { durationMs: 240, apply: () => setTaskState(3, 'done') },

      { durationMs: 200, apply: () => setTaskState(4, 'active') },
      { durationMs: 260, apply: () => emitNext() }, // rds accepting connections
      { durationMs: 220, apply: () => setPct(100) },
      { durationMs: 260, apply: () => emitNext() }, // CREATE_COMPLETE
      { durationMs: 240, apply: () => setTaskState(4, 'done') },

      { durationMs: 600, apply: () => undefined },
      { durationMs: 240, apply: () => setShowPayoff(true) },
      { durationMs: 280, apply: () => emitNext() }, // ready to vend (highlight)
      // The penultimate event is logged but not the final one ('control-plane:
      // healthy ...'). Emit it now so the log stream shows both the body line
      // and the highlight payoff.
      { durationMs: 260, apply: () => emitNext() }, // control-plane: healthy
      { durationMs: 1200, apply: () => undefined },
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

  return (
    <Box flexDirection="row" paddingX={2} paddingTop={1}>
      <Box width={24} flexDirection="column" flexShrink={0}>
        <InstallStackGlyph pct={pct} payoff={showPayoff} />
      </Box>
      <Box flexDirection="column" flexGrow={1} paddingLeft={3}>
        <Box marginBottom={1}>
          <Tracked color={c.label}>installing · jungl3 control plane</Tracked>
        </Box>
        <SubtaskList tasks={tasks} />
        <Box marginTop={1}>
          <CfnProgressBar pct={pct} />
        </Box>
        <Box marginTop={1} flexDirection="column">
          {showPayoff ? (
            <Gradient>
              <Typewriter
                text="Control Plane installed. Ready to vend jungles."
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
