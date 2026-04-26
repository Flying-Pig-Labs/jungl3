# Port notes — v2 demo → demo-cli

Working notes for porting `jungl3 CLI v2.html` (browser React demo) into
`demo-cli/src/` (Ink terminal program) so VHS can record it.

This file is a scratchpad. Delete it after the port lands.

## Confirmed facts (verified 2026-04-25)

- The unzipped folder at the repo root (`jungl3/`) is **not** new source.
  Every `.ts`/`.tsx` file under it is **byte-identical** to the matching
  file in `demo-cli/src/`. Verified via `diff -rq demo-cli/src jungl3` —
  only differences are `jungl3 CLI v2.html`, `jungl3 CLI.html`, and a
  `screenshots/` directory.

- The only file with new content is `jungl3 CLI v2.html` at the repo
  root (1646 lines). It's React + JSX inlined, compiled in-browser by
  Babel-standalone. Same structure as `demo-cli/src/`, plus four
  net-new sections.

- The existing `demo-cli` is **already** Ink-based React with the same
  component names (`App.tsx`, `Act1-4.tsx`, `Frame/TopBar.tsx`,
  `frame/LogPane.tsx`, `frame/Footer.tsx`, `theme.ts`, identical
  fixtures). Nothing to invent — translate browser idioms to Ink
  idioms.

- VHS is the recorder. Tape is at repo root: `jungl3-demo.tape`. Output
  goes to `demo-cli/recordings/jungl3-demo.mp4`. Recordings folder is
  gitignored (see `demo-cli/.gitignore`).

- Build toolchain: Bun. `cd demo-cli && bun install && bun run build`.
  Smoke test: `bun run smoke`.

## Net-new content in v2 HTML — line ranges

Read these from `jungl3 CLI v2.html`:

| Section            | Lines       | Becomes                                          |
|--------------------|-------------|--------------------------------------------------|
| `Act0` (Marketplace Install) | 825–941    | `demo-cli/src/acts/Act0MarketplaceInstall.tsx` |
| `MultiJungle` (interstitial) | 942–1065   | `demo-cli/src/components/MultiJungle.tsx` (or `acts/Interstitial.tsx`) |
| `Act5` (Maker-Checker) | 1066–1216  | `demo-cli/src/acts/Act5MakerChecker.tsx`        |
| `OperatorConsole` (interactive REPL) | 1217–1441 | `demo-cli/src/components/OperatorConsole.tsx`   |
| Updated phase machine | 1554–1641 | merge into `demo-cli/src/App.tsx`                |
| Updated `TopBar`   | 1449–1465  | merge into `demo-cli/src/frame/TopBar.tsx`      |
| Updated `LogPane`  | 1467–1487  | merge into `demo-cli/src/frame/LogPane.tsx`     |
| Updated `Footer`   | 1489–1503  | merge into `demo-cli/src/frame/Footer.tsx`      |

`Act1-4` themselves and the glyphs at lines 327–375 *might* be modified
versions of the existing `demo-cli/src/acts/*.tsx`. **Verify before
touching.** Recommended check:

```bash
# Extract each Act function from the HTML to a temp file and diff
# against the existing TSX. Anywhere they differ is a real change to
# carry over; anywhere they match (in semantics, not in JSX vs Ink
# syntax) skip.
```

## Phase machine (from v2 App.tsx, lines 1554–1641)

```
prompt
  ↓ (user types team name → Enter, or Esc for default 'aurora')
play
  act 0  Marketplace Install
   ↓
  multi  MultiJungle interstitial
   ↓
  act 1  Enter Jungle
   ↓
  act 2  Shape Understory
   ↓
  act 3  Refine in DMZ
   ↓
  act 4  Reach Canopy
   ↓
  act 5  Maker-Checker
   ↓
console  OperatorConsole (interactive jungl3› REPL)
```

Existing `demo-cli` ends at act 4. Two new states (`act 0`, `multi`,
`act 5`, `console`) need adding to `App.tsx`. The keyboard shortcuts
during play (`space` advance, `→` ff, `←` replay act, `r` restart,
`q` quit) already exist — extend rather than replace.

## OperatorConsole — special handling

It's interactive in the browser (typed commands, history with ↑/↓,
banner, sidebar of quick refs, `help`, `jungle list`, `jungle status
<name>`, `jungle logs <name>`, `gallery list`, `clear`).

For the recording, the tape needs to **drive** the console:

```
# After act 5 completes, the console phase opens.
Type "help"
Sleep 800ms
Enter
Sleep 1.5s
Type "jungle list"
Enter
Sleep 1.5s
Type "jungle status aurora"
Enter
Sleep 2s
Type "gallery list"
Enter
Sleep 2s
```

So `OperatorConsole` needs to accept real terminal input via Ink's
`useInput`. No scripted-mode flag needed — VHS types into the PTY for
real, and Ink reads it like any keystroke.

## Browser → Ink translation table

| v2 (browser)                                | Ink                                                       |
|---------------------------------------------|-----------------------------------------------------------|
| CSS `linear-gradient` text                  | `ink-gradient` (already used in `Logo.tsx`, `Gradient.tsx`) |
| `box-shadow` glow on terminal frame         | Drop. Acceptable loss.                                    |
| `@keyframes blink`                          | `useInterval` toggle (existing `usePulse`-style hook)     |
| Pixel widths (`width: 200`)                 | Character cells. Eyeball ~24–28 cols for `200px`, tune.   |
| `flex` row/column                           | `<Box flexDirection="row|column">`                        |
| `useEasedNumber` (rAF)                      | Already in `demo-cli/src/hooks/useEasedNumber.ts`.        |
| `useTypewriter`                             | Already in `demo-cli/src/hooks/useTypewriter.ts`.         |
| `<input>` for OperatorConsole               | `useInput` + controlled state                             |
| `c.rare` (#E8468E pink, etc.)               | Truecolor passes through Ink — use as-is.                 |
| `<pre>` ASCII glyphs                        | `<Text>` with `\n` — already done in `ActGlyph.tsx`.     |
| `setTimeout`-based beats                    | Already abstracted by `useActRunner` — re-use.            |

## Tape budget update

Current `jungl3-demo.tape` waits 95s after Enter. v2 adds:

- Act 0 (Marketplace Install): ~10–15s
- MultiJungle interstitial: ~5–10s
- Act 5 (Maker-Checker): ~12–18s
- OperatorConsole scripted commands: ~10–15s

Add ~50s of `Sleep` budget. Safe over-estimate: 95s → 150s. Watch the
PlaybackSpeed=0.75 — it stretches the *output*, not the recorded
duration, so the tape's `Sleep` is still real seconds.

## Decisions I'd defer to the user

- **Where Act 5 visualizes the maker-checker step.** The HTML has a
  specific layout (settlement-approval workflow with maker → checker
  → above-threshold escalation). Read the HTML's Act 5 carefully; if
  any of it doesn't read well in a terminal, propose two alternatives
  before settling.

- **MultiJungle column count.** The interstitial shows multiple teams'
  installs in parallel. In a terminal, the column-budget is tight at
  the demo's recorded resolution. Default to 3 columns; ask if the
  HTML shows more.

- **OperatorConsole sidebar.** The 200px "quick reference" sidebar is
  cosmetic. Drop it for the recording (saves ~25 cols), or keep it
  narrow (16 cols max). Ask before deciding.

## Smoke test sequence (before recording)

```bash
cd demo-cli
bun install
bun run build
bun run smoke                      # must pass
node dist/bin/jungl3-demo.js --act 0
node dist/bin/jungl3-demo.js --act 5
node dist/bin/jungl3-demo.js --fast   # full run under 5s
cd .. && vhs jungl3-demo.tape          # produces the new MP4
```

## Files NOT to touch

- Anything Lovable-owned at repo root (see `CLAUDE.md` §3): `src/`,
  `package.json`, `vite.config.ts`, `wrangler.jsonc`, etc.
- Existing fixtures in `demo-cli/src/fixtures/` — verified
  byte-identical to v2.
- Existing hooks in `demo-cli/src/hooks/` — verified byte-identical.
- `demo-cli/recordings/jungl3-demo.mp4` until the new run replaces it
  (the tape writes to that path).
