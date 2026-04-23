import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { TopBar } from './frame/TopBar.js';
import { LogPane } from './frame/LogPane.js';
import { Footer } from './frame/Footer.js';
import { LogContext, useLogStreamState } from './hooks/useLogStream.js';
import {
  RunnerHandleContext,
  useRunnerHandleHost,
} from './hooks/useRunnerHandle.js';
import { useInterval } from './hooks/useInterval.js';
import { Act1EnterJungle } from './acts/Act1EnterJungle.js';
import { Act2ShapeUnderstory } from './acts/Act2ShapeUnderstory.js';
import { Act3RefineInDmz } from './acts/Act3RefineInDmz.js';
import { Act4ReachCanopy } from './acts/Act4ReachCanopy.js';
import {
  TeamNamePrompt,
  DEFAULT_TEAM_NAME,
  sanitizeTeamName,
} from './components/TeamNamePrompt.js';
import { c } from './theme.js';

export interface AppOptions {
  /**
   * If set, play only this act and exit (when exitOnComplete). If not set,
   * play all four acts in order.
   */
  startAct?: 1 | 2 | 3 | 4;
  singleAct: boolean;
  speedMultiplier: number;
  exitOnComplete: boolean;
  /**
   * Team name supplied non-interactively (via --team flag). When present,
   * the prompt is skipped and the demo jumps straight to Act 1 / the chosen
   * act. When absent and the starting act is 1 AND stdin is a TTY AND we're
   * not in --fast mode, the TeamNamePrompt collects it.
   */
  presetTeamName?: string;
  /**
   * If true, the interactive prompt is bypassed no matter what (used by
   * --fast and by non-TTY invocations like smoke tests).
   */
  skipPrompt: boolean;
}

type ActNum = 1 | 2 | 3 | 4;
type Phase = 'prompt' | 'play';

const ACT_TITLES: Record<ActNum, string> = {
  1: 'Enter Jungle',
  2: 'Shape Understory',
  3: 'Refine in DMZ',
  4: 'Reach Canopy',
};

export function App({
  startAct,
  singleAct,
  speedMultiplier,
  exitOnComplete,
  presetTeamName,
  skipPrompt,
}: AppOptions): React.ReactElement {
  const { exit } = useApp();
  const logStream = useLogStreamState(speedMultiplier);
  const runnerHandle = useRunnerHandleHost();
  const initialAct: ActNum = startAct ?? 1;

  // Team name comes from one of three places, in priority order:
  //   1. --team flag (presetTeamName) — sanitized at parse time
  //   2. the interactive TeamNamePrompt (only when starting at Act 1, in a
  //      TTY, and not --fast)
  //   3. DEFAULT_TEAM_NAME fallback
  const initialTeam = presetTeamName && presetTeamName.length > 0
    ? sanitizeTeamName(presetTeamName) || DEFAULT_TEAM_NAME
    : DEFAULT_TEAM_NAME;
  const [teamName, setTeamName] = useState<string>(initialTeam);

  // Show the prompt only when all of:
  //   - we're starting at Act 1 (Acts 2+ wouldn't have context for naming)
  //   - prompts aren't explicitly suppressed (--fast, non-TTY, --team)
  //   - no preset was supplied
  const shouldPrompt =
    !skipPrompt && initialAct === 1 && !presetTeamName;
  const [phase, setPhase] = useState<Phase>(shouldPrompt ? 'prompt' : 'play');

  const [act, setAct] = useState<ActNum>(initialAct);
  const [actKey, setActKey] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const startRef = useRef<number>(Date.now());

  useInterval(() => {
    setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
  }, 1000);

  const [width, setWidth] = useState<number>(process.stdout.columns || 80);
  useEffect(() => {
    const onResize = () => setWidth(process.stdout.columns || 80);
    process.stdout.on('resize', onResize);
    return () => {
      process.stdout.off('resize', onResize);
    };
  }, []);

  const inputEnabled = Boolean(process.stdin.isTTY);

  // Global keybindings — active only during play phase so typing in the
  // prompt doesn't trigger them (the prompt owns its own useInput).
  //
  // space / → / ← go through the currently-mounted act's registered
  // ActRunner (via runnerHandle). r is a full demo restart — it clears
  // the log stream and resets the session clock, which act-level replay
  // doesn't (and shouldn't).
  useInput(
    (input, key) => {
      if (input === 'q' || (key.ctrl && input === 'c')) {
        exit();
        return;
      }
      if (input === 'r') {
        logStream.clear();
        startRef.current = Date.now();
        setElapsed(0);
        setAct(initialAct);
        setActKey((k) => k + 1);
        return;
      }
      if (input === ' ') {
        runnerHandle.current?.step();
        return;
      }
      if (key.rightArrow) {
        runnerHandle.current?.fastForward();
        return;
      }
      if (key.leftArrow) {
        // Remount the current act. This resets the act's own local state
        // (tasks, rows, payoff flags, log cursor) so the scene plays from
        // beat 0. Log history is preserved on purpose — a live demo
        // replay should look like "we ran it again," not like amnesia.
        setActKey((k) => k + 1);
        return;
      }
    },
    { isActive: inputEnabled && phase === 'play' },
  );

  // Quit hotkey needs to work during the prompt too, but we don't want `r`
  // or arrows to interfere with typing. A dedicated narrow listener handles
  // just quit during the prompt phase.
  useInput(
    (input, key) => {
      if (input === 'q' || (key.ctrl && input === 'c')) {
        exit();
      }
    },
    { isActive: inputEnabled && phase === 'prompt' },
  );

  const handleActComplete = () => {
    if (singleAct) {
      if (exitOnComplete) {
        setTimeout(() => exit(), Math.max(10, Math.round(150 * speedMultiplier)));
      }
      return;
    }
    if (act >= 4) {
      if (exitOnComplete) {
        setTimeout(() => exit(), Math.max(10, Math.round(200 * speedMultiplier)));
      }
      return;
    }
    const next = (act + 1) as ActNum;
    setAct(next);
    setActKey((k) => k + 1);
  };

  const handleTeamSubmit = (name: string) => {
    setTeamName(name);
    // Reset the session clock so the timer reflects wall time from when the
    // story actually begins, not from when the user was staring at a prompt.
    startRef.current = Date.now();
    setElapsed(0);
    setPhase('play');
  };

  const actEl = useMemo(() => {
    const key = `${act}-${actKey}`;
    const shared = { speedMultiplier, onComplete: handleActComplete, teamName };
    switch (act) {
      case 1:
        return <Act1EnterJungle key={key} {...shared} />;
      case 2:
        return <Act2ShapeUnderstory key={key} {...shared} />;
      case 3:
        return <Act3RefineInDmz key={key} {...shared} />;
      case 4:
        return <Act4ReachCanopy key={key} {...shared} />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [act, actKey, speedMultiplier, teamName]);

  if (phase === 'prompt') {
    // Full-screen prompt: no top bar, no log pane. Those appear once the
    // story starts; during naming, the frame itself would be noise.
    return (
      <LogContext.Provider value={logStream}>
        <RunnerHandleContext.Provider value={runnerHandle}>
          <Box flexDirection="column" height={22} justifyContent="center">
            <TeamNamePrompt onSubmit={handleTeamSubmit} />
          </Box>
        </RunnerHandleContext.Provider>
      </LogContext.Provider>
    );
  }

  return (
    <LogContext.Provider value={logStream}>
      <RunnerHandleContext.Provider value={runnerHandle}>
        <Box flexDirection="column">
          <TopBar actNumber={act} actTitle={ACT_TITLES[act]} elapsedSec={elapsed} />
          <Box flexDirection="column" height={14}>
            {actEl ?? <Text color={c.dim}> </Text>}
          </Box>
          <LogPane width={width} />
          <Footer />
        </Box>
      </RunnerHandleContext.Provider>
    </LogContext.Provider>
  );
}
