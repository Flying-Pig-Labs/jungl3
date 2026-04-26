#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from '../src/App.js';
import { sanitizeTeamName } from '../src/components/TeamNamePrompt.js';

interface Args {
  act: 0 | 1 | 2 | 3 | 4 | 5;
  actExplicit: boolean;
  fast: boolean;
  theme: 'light' | 'dark';
  team?: string;
  help: boolean;
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {
    act: 0,
    actExplicit: false,
    fast: false,
    theme: 'dark',
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    switch (a) {
      case '--help':
      case '-h':
        args.help = true;
        break;
      case '--fast':
        args.fast = true;
        break;
      case '--act': {
        const v = argv[++i];
        if (!v) fail('--act requires a value (0..5)');
        const n = Number(v);
        if (!Number.isInteger(n) || n < 0 || n > 5) fail(`--act must be 0..5 (got ${v})`);
        args.act = n as 0 | 1 | 2 | 3 | 4 | 5;
        args.actExplicit = true;
        break;
      }
      case '--theme': {
        const v = argv[++i];
        if (v !== 'light' && v !== 'dark') fail(`--theme must be light|dark (got ${v ?? ''})`);
        args.theme = v;
        break;
      }
      case '--team': {
        const v = argv[++i];
        if (!v) fail('--team requires a value');
        const cleaned = sanitizeTeamName(v);
        if (!cleaned) fail(`--team must contain at least one [a-z0-9-] character (got "${v}")`);
        args.team = cleaned;
        break;
      }
      default:
        fail(`Unknown argument: ${a}`);
    }
  }

  return args;
}

function fail(msg: string): never {
  process.stderr.write(`jungl3-demo: ${msg}\n`);
  process.stderr.write(`Try --help.\n`);
  process.exit(2);
}

function printHelp(): void {
  const help = `
jungl3-demo — scripted cinematic walkthrough of a Jungl3 sprint

This is a demo. No network calls. No AWS. No real infrastructure. Every line
of output is a hardcoded fixture; every transition is a local timer.

Usage:
  jungl3-demo                       Full walkthrough at default speed (~140s).
                                    Starts at Marketplace Install (Act 0) and
                                    runs through Maker-Checker (Act 5), then
                                    drops into the operator console.
  jungl3-demo --team <name>         Skip the prompt; use <name> as the jungle name.
                                    Name is sanitized to [a-z0-9-].
  jungl3-demo --act <0|1|2|3|4|5>   Jump to a single act and exit after it.
                                    0 = Marketplace Install, 1 = Enter Jungle,
                                    2 = Shape Understory, 3 = Refine in DMZ,
                                    4 = Reach Canopy, 5 = Maker-Checker.
                                    (Skips the prompt; uses 'aurora' or --team.)
  jungl3-demo --fast                Collapse all timers (under 5s total).
                                    Skips the prompt.
  jungl3-demo --theme <light|dark>  Default: dark.
  jungl3-demo --help                This message.

Keys during playback:
  space   Advance one beat
  →       Fast-forward to end of current act
  ←       Replay current act
  r       Restart the demo
  q       Quit

Keys during the team-name prompt:
  [a-z 0-9 -]   Type your jungle name
  enter         Confirm
  esc           Accept the default (aurora)
  q / Ctrl+C    Quit
`;
  process.stdout.write(help);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const speedMultiplier = args.fast ? 0.04 : 2.2;

  const exitOnComplete =
    args.fast || args.actExplicit || process.env.J3_EXIT_ON_COMPLETE === '1';

  // The prompt needs a real TTY to capture keystrokes and a real pace to
  // not feel frantic. If either is missing, skip it.
  const skipPrompt =
    args.fast || !process.stdin.isTTY || args.team !== undefined;

  const { waitUntilExit } = render(
    React.createElement(App, {
      startAct: args.act,
      singleAct: args.actExplicit,
      speedMultiplier,
      exitOnComplete,
      presetTeamName: args.team,
      skipPrompt,
    }),
    {
      exitOnCtrlC: true,
      patchConsole: process.env.J3_DEBUG !== '1',
    },
  );

  waitUntilExit().then(
    () => process.exit(0),
    (err) => {
      process.stderr.write(`jungl3-demo: ${String(err)}\n`);
      process.exit(1);
    },
  );
}

main();
