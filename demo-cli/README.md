# jungl3-demo

A scripted, cinematic terminal walkthrough of a Jungl3 sprint.

**What this is.** A live-demo pitch aid. Six scenes plus an interactive operator console, roughly two minutes end-to-end, replayable, keyboard-only. It plays out the loop from the Jungl3 homepage — Marketplace Install, multi-tenant Control Plane, Enter Jungle, Shape Understory, Refine in DMZ, Reach Canopy, Maker-Checker — as a terminal movie, then drops the operator into a `jungl3›` REPL.

**What this is not.** A real Jungl3 instance. A connection to AWS. A connection to anything. There are no network calls, no AWS SDK, no LLM calls, no credentials used, no files written. Every line of output is a hardcoded fixture; every transition is a local timer. Nothing shown on screen reflects real infrastructure state.

If you want to see the real product, subscribe to the AWS Marketplace listing and install it in your own account. This binary only pretends.

## Install

From this directory (Bun preferred, npm works too):

```bash
bun install     # or: npm install
bun run build   # or: npm run build
```

To make the binary available on your `PATH` during a demo:

```bash
bun link
# or: npm link
jungl3-demo
```

Or run it directly without linking:

```bash
node dist/bin/jungl3-demo.js
```

## Usage

```
jungl3-demo                       # full walkthrough at default speed (~140s)
                                  # opens by asking you to name your jungle
jungl3-demo --team aurora         # skip the prompt; use the given name
jungl3-demo --act <0|1|2|3|4|5>   # jump to a single act (skips the prompt)
                                  #   0 = Marketplace Install
                                  #   1 = Enter Jungle
                                  #   2 = Shape Understory
                                  #   3 = Refine in DMZ
                                  #   4 = Reach Canopy
                                  #   5 = Maker-Checker
jungl3-demo --fast                # collapse all timers (under 5s total; skips the prompt)
jungl3-demo --theme dark          # default (palette is tuned for dark backgrounds)
jungl3-demo --theme light         # accepted; current build renders identically
jungl3-demo --help
```

### After the last act

When the full walkthrough finishes (Act 5), the demo drops into the
interactive operator console — a `jungl3›` REPL with a banner, command
history, and a small set of fixture-backed commands:

| Command | Effect |
| --- | --- |
| `help` | List commands |
| `jungle list` | 4-row table of active jungles |
| `jungle status <name>` | KV block (state, region, tests, personas, visitors, uptime) |
| `jungle logs <name> --tail` | A few recent log lines |
| `jungle teardown <name>` | Confirms + acks teardown |
| `gallery list` | Three Canopy gallery ratings |
| `clear` | Wipe the history |

The console is reached only on a real TTY; under `--fast` (or any time
stdin isn't a TTY, e.g. CI) the demo exits cleanly after Act 5.

### First step: name your jungle

In the default flow the demo opens on an `ENTER JUNGLE` prompt. Type a name for your jungle and press `enter`. Names are sanitized to lowercase letters, digits, and hyphens (`[a-z0-9-]`), max 24 characters. Press `esc` at any point to accept the default (`aurora`). The name is threaded through the boot sequence, the operator console heading, the gallery tile, and the final summary — it's _your_ jungle for the rest of the run.

If you pass `--team <name>` the prompt is skipped. The same sanitization applies, so `--team "Team Aurora"` becomes `team-aurora`.

### Keybindings

During the team-name prompt:

| Key | Effect |
| --- | --- |
| `[a-z 0-9 -]` | Type your jungle name |
| `enter` | Confirm and start the show |
| `esc` | Accept the default (`aurora`) |
| `q` or `Ctrl+C` | Quit |

During playback:

| Key | Effect |
| --- | --- |
| `space` | Advance one beat |
| `→` | Fast-forward to end of current act |
| `←` | Replay current act from the start |
| `Ctrl+R` | Restart the full demo |
| `q` or `Ctrl+C` | Quit |

Once the name is submitted the acts play through without input. The playback keybindings are for live-demo interactivity.

In the operator console:

| Key | Effect |
| --- | --- |
| `[printable]` | Append to the current command line |
| `enter` | Run the command |
| `backspace` | Delete the last character |
| `↑` / `↓` | Walk command history |
| `Ctrl+R` | Restart the full demo |
| `Ctrl+C` | Quit |

`r` and `q` are passed through to the command line during console mode
so commands like `clear` and free-form input still work as typed.

## Terminal requirements

- Truecolor (24-bit) terminal. iTerm2, WezTerm, Kitty, Alacritty, modern Terminal.app, GNOME Terminal, Windows Terminal — all fine.
- Unicode box-drawing and braille support.
- At least 80 columns × 24 rows. The layout degrades gracefully above that; below it, text may truncate.

## Smoke test

```bash
bun run build && bun run smoke
# or: npm run build && npm run smoke
```

Runs `jungl3-demo --fast` end-to-end and exits non-zero if the walkthrough errors or hangs. The smoke test does not enter the operator console (no TTY available); see the recording produced by `vhs jungl3-demo.tape` for the full path including the console.
