

# Wire in the Real Poster

Replace the AI-generated placeholder (`src/assets/jungle-poster.jpg`) with the real poster you just uploaded, and tune the surrounding visuals so the poster reads as the visual anchor — not just a faded backdrop.

## Changes

### 1. Asset swap
- Copy `user-uploads://228CE6BD-BD4A-4C0B-B2FB-732683537FF6.PNG` → `src/assets/jungle-poster.png`.
- Update both imports (`PasswordGate.tsx`, `Hero.tsx`) to point at the new `.png` file. Delete the stale `jungle-poster.jpg`.

### 2. Password Gate — let the poster breathe
- Raise background opacity from `0.4` → `~0.65` and soften the `saturate(0.7)` filter to `saturate(0.95)` so the gold/pink hand-lettering is recognizable behind the form.
- Use `object-cover object-center` and add a vertical gradient mask so the poster fades toward the center where the input sits (keeps the passphrase legible without flattening the art).
- Slightly tighten the radial vignette so the corners stay dark but the poster's monstera leaves remain visible.

### 3. Hero — recreate the poster's composition in UI form
- Increase poster opacity from `0.55` → `~0.7` and recenter it (`object-center`) so the brushstroke "Welcome / To The / Jungle" lockup is partially visible behind our typeset headline.
- Add a subtle bottom-to-top dark gradient so the bottom subhead/CTA area stays high-contrast.
- Keep the parallax SVG leaves but reduce their opacity (`0.4` → `0.25`) so they layer with — not fight — the poster's real palm fronds.
- Keep our typeset "Welcome to the Jungl3" headline on top (the poster says "Jungle" with an "e"; our product is "Jungl3"), so the poster acts as atmosphere while our headline carries the brand spelling.

### 4. No other changes
- Concept, System Modules, Idea Engine, CTA, Footer, and global effects (grain, fog, scanlines) are untouched.
- `localStorage` gate behavior, passphrase, and CTA scroll behavior all remain as previously approved.

## Technical notes
- Vite handles `.png` imports identically to `.jpg`, so the `import posterUrl from "@/assets/jungle-poster.png"` swap is a one-line change in two files.
- Image is ~1040×1480 portrait; `object-cover` will crop sides on wide viewports — `object-center` keeps the headline lockup centered. On mobile portrait the full poster will show through naturally.
- No new dependencies, no route changes, no schema work.

