import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { TopBar, type TopBarMode } from './frame/TopBar.js';
import { LogPane } from './frame/LogPane.js';
import { Footer } from './frame/Footer.js';
import { LogContext, useLogStreamState } from './hooks/useLogStream.js';
import {
  RunnerHandleContext,
  useRunnerHandleHost,
} from './hooks/useRunnerHandle.js';
import { useInterval } from './hooks/useInterval.js';
import { Act0MarketplaceInstall } from './acts/Act0MarketplaceInstall.js';
import { Act1EnterJungle } from './acts/Act1EnterJungle.js';
import { Act2ShapeUnderstory } from './acts/Act2ShapeUnderstory.js';
import { Act3RefineInDmz } from './acts/Act3RefineInDmz.js';
import { Act4ReachCanopy } from './acts/Act4ReachCanopy.js';
import { Act5MakerChecker } from './acts/Act5MakerChecker.js';
import { MultiJungle } from './components/MultiJungle.js';
import { OperatorConsole } from './components/OperatorConsole.js';
import {
  TeamNamePrompt,
  DEFAULT_TEAM_NAME,
  sanitizeTeamName,
} from './components/TeamNamePrompt.js';
import { c } from './theme.js';

/**
 * Demo phase machine (v2 port):
 *
 *   prompt → play (act 0 → multi → act 1 → 2 → 3 → 4 → 5) → console
 *
 * The prompt collects a Jungle name. play walks the seven scenes; the
 * MultiJungle interstitial sits between Act 0 (install) and Act 1
 * (vending) to surface the multi-tenant story. console is an
 * interactive operator REPL — the only phase with live keyboard input
 * apart from the prompt.
 */

export interface AppOptions {
  /**
   * If set, play only this act and exit (when exitOnComplete). 0 starts
   * at Marketplace Install, 5 at Maker-Checker, etc. If unset, runs the
   * full sequence starting at Act 0.
   */
  startAct?: 0 | 1 | 2 | 3 | 4 | 5;
  singleAct: boolean;
  speedMultiplier: number;
  exitOnComplete: boolean;
  presetTeamName?: string;
  skipPrompt: boolean;
}

type ActNum = 0 | 1 | 2 | 3 | 4 | 5;
type Scene = ActNum | 'multi';
type Phase = 'prompt' | 'play' | 'console';

const ACT_TITLES: Record<ActNum, string> = {
  0: 'Marketplace Install',
  1: 'Enter Jungle',
  2: 'Shape Understory',
  3: 'Refine in DMZ',
  4: 'Reach Canopy',
  5: 'Maker-Checker',
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
  const initialAct: ActNum = startAct ?? 0;

  const initialTeam = presetTeamName && presetTeamName.length > 0
    ? sanitizeTeamName(presetTeamName) || DEFAULT_TEAM_NAME
    : DEFAULT_TEAM_NAME;
  const [teamName, setTeamName] = useState<string>(initialTeam);

  // Show the prompt only when starting from the very beginning (Act 0)
  // with no preset, in a TTY, and not --fast. Any --act jump skips it
  // because there's nothing to name about a single-act test fixture.
  const shouldPrompt = !skipPrompt && initialAct === 0 && !presetTeamName;
  const [phase, setPhase] = useState<Phase>(shouldPrompt ? 'prompt' : 'play');

  const [scene, setScene] = useState<Scene>(initialAct);
  const [sceneKey, setSceneKey] = useState<number>(0);
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

  // Playback keybindings: only active during play, not console (the
  // console owns all keystrokes via its own useInput) or prompt.
  useInput(
    (input, key) => {
      if (input === 'q' || (key.ctrl && input === 'c')) {
        exit();
        return;
      }
      // Ctrl+R restarts. Bare 'r' is reserved as a typeable character so
      // VHS-driven tapes can prefix-type the next phase's commands while
      // playback is still finishing — typing 'r' during play would
      // otherwise terminate the demo unexpectedly.
      if (key.ctrl && input === 'r') {
        logStream.clear();
        startRef.current = Date.now();
        setElapsed(0);
        setScene(initialAct);
        setSceneKey((k) => k + 1);
        setPhase('play');
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
        setSceneKey((k) => k + 1);
        return;
      }
    },
    { isActive: inputEnabled && phase === 'play' },
  );

  // Quit during prompt
  useInput(
    (input, key) => {
      if (input === 'q' || (key.ctrl && input === 'c')) exit();
    },
    { isActive: inputEnabled && phase === 'prompt' },
  );

  // Quit + restart during console (other keystrokes belong to the REPL).
  useInput(
    (input, key) => {
      if (key.ctrl && input === 'c') {
        exit();
        return;
      }
      if (input === 'r' && key.ctrl) {
        // Only Ctrl+R triggers restart in console mode; bare 'r' is a
        // legitimate keystroke for typing commands like `clear`.
        logStream.clear();
        startRef.current = Date.now();
        setElapsed(0);
        setScene(initialAct);
        setSceneKey((k) => k + 1);
        setPhase('play');
      }
    },
    { isActive: inputEnabled && phase === 'console' },
  );

  // Scene completion advances through the full sequence unless we're
  // pinned to a single act (--act flag). The MultiJungle interstitial
  // is woven in between Act 0 and Act 1.
  const handleSceneComplete = () => {
    if (singleAct) {
      if (exitOnComplete) {
        setTimeout(() => exit(), Math.max(10, Math.round(150 * speedMultiplier)));
      }
      return;
    }
    if (scene === 0) {
      setScene('multi');
      setSceneKey((k) => k + 1);
      return;
    }
    if (scene === 'multi') {
      setScene(1);
      setSceneKey((k) => k + 1);
      return;
    }
    if (scene === 5) {
      // Last act: drop into the operator console for live use. Under
      // --fast / smoke we *don't* enter console, since the console
      // requires a TTY for useInput; entering it would throw raw-mode
      // errors on first render. Instead, exit cleanly.
      if (exitOnComplete) {
        setTimeout(() => exit(), Math.max(10, Math.round(150 * speedMultiplier)));
      } else {
        setPhase('console');
      }
      return;
    }
    // 1, 2, 3, 4 → next act
    const next = (scene + 1) as ActNum;
    setScene(next);
    setSceneKey((k) => k + 1);
  };

  const handleTeamSubmit = (name: string) => {
    setTeamName(name);
    startRef.current = Date.now();
    setElapsed(0);
    setPhase('play');
  };

  const sceneEl = useMemo(() => {
    const key = `${scene}-${sceneKey}`;
    const shared = { speedMultiplier, onComplete: handleSceneComplete, teamName };
    if (scene === 'multi') {
      return (
        <MultiJungle
          key={key}
          teamName={teamName}
          speedMultiplier={speedMultiplier}
          onContinue={handleSceneComplete}
        />
      );
    }
    switch (scene) {
      case 0:
        return <Act0MarketplaceInstall key={key} {...shared} />;
      case 1:
        return <Act1EnterJungle key={key} {...shared} />;
      case 2:
        return <Act2ShapeUnderstory key={key} {...shared} />;
      case 3:
        return <Act3RefineInDmz key={key} {...shared} />;
      case 4:
        return <Act4ReachCanopy key={key} {...shared} />;
      case 5:
        return <Act5MakerChecker key={key} {...shared} />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, sceneKey, speedMultiplier, teamName]);

  const topBarMode: TopBarMode =
    phase === 'console'
      ? { kind: 'console', title: 'Operator Console' }
      : scene === 'multi'
        ? { kind: 'multi', title: 'Control Plane' }
        : { kind: 'act', act: scene, title: ACT_TITLES[scene] };

  if (phase === 'prompt') {
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

  if (phase === 'console') {
    // Console phase keeps the TopBar and Footer but drops the LogPane —
    // the operator is driving the system now, so the act-area expands.
    return (
      <LogContext.Provider value={logStream}>
        <RunnerHandleContext.Provider value={runnerHandle}>
          <Box flexDirection="column">
            <TopBar mode={topBarMode} elapsedSec={elapsed} />
            <Box flexDirection="column" minHeight={20}>
              <OperatorConsole teamName={teamName} speedMultiplier={speedMultiplier} />
            </Box>
            <Footer console />
          </Box>
        </RunnerHandleContext.Provider>
      </LogContext.Provider>
    );
  }

  return (
    <LogContext.Provider value={logStream}>
      <RunnerHandleContext.Provider value={runnerHandle}>
        <Box flexDirection="column">
          <TopBar mode={topBarMode} elapsedSec={elapsed} />
          <Box flexDirection="column" height={14}>
            {sceneEl ?? <Text color={c.dim}> </Text>}
          </Box>
          <LogPane width={width} />
          <Footer />
        </Box>
      </RunnerHandleContext.Provider>
    </LogContext.Provider>
  );
}
