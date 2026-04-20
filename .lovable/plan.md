

# Welcome to the Jungl3 — Immersive Gated Experience

A cinematic, password-gated single-page experience styled like a hidden tactical system buried in neon jungle.

## 1. Password Gate (full-screen, route: `/`)
- Dark, layered hero: poster image (once you re-upload) as a desaturated, vignetted background with grain + faint scanlines + drifting fog (CSS-animated radial gradients).
- Centered terminal-meets-neon password input with pink/purple glow ring, blinking caret, label `> ENTER PASSPHRASE`.
- Submit triggers check against `Welcome to the Jungl3`.
  - **Wrong** → glitch shake + RGB-split distortion on the input + message "Access denied. You're not ready for the jungle."
  - **Correct** → scanline sweep + jungle reveal transition (1.2s), then mounts the main experience.
- Access persists in `localStorage` (`jungl3_access=granted`) so returning users skip the gate. Small "lock out" link in corner to clear it.

## 2. Hero — "Welcome to the Jungl3"
- Full-viewport section. Poster art layered behind with parallax leaves (SVG silhouettes) drifting on mouse-move.
- Headline in a bold metallic display face (Cinzel / Unbounded) with a pink→gold gradient text-fill, animated glint sweep every few seconds, subtle sparkle particles.
- Subheadline: *Hack in a DMZ with real beta customers.*
- Tagline tag: `SUMMER 2026` in a thin neon-pink outlined pill.
- Scroll indicator (animated chevron + "descend" label).

## 3. "What This Is" — Concept
- Two-column: left = stylized manifesto copy (confident, slightly rebellious tone); right = stacked translucent panels listing: sandbox innovation environment, dev + DMV, pre-wired infrastructure, simulated traffic, real-world experimentation.
- Faint scanline texture, gold corner brackets on panels (tactical HUD feel).

## 4. "Inside the Jungle" — System Modules
- 5 cards as tactical/radar overlays:
  1. Sandbox Environments
  2. DMV (Production-like Layer)
  3. Preloaded Integrations
  4. Traffic Simulation
  5. Idea Engine (Fire Tower / Bazaar)
- Each card: dark glass, neon-pink border on hover, pulse glow, slight RGB-split distortion on hover, custom monoline icon, short tactical-tone description.

## 5. Idea Engine — Fire Tower / Bazaar
- Centerpiece: animated **radar sweep** (SVG circle with rotating conic gradient + concentric rings).
- Random "blips" appear on the radar and resolve into floating idea cards around it (title + score + upvote arrow). 4–6 sample ideas cycle in/out.
- Caption: "Continuously scanning the noise. Surfacing what survives."

## 6. CTA Section
- Headline: *Enter the system. Build something that survives.*
- Two buttons:
  - **Enter Your Sandbox** — primary, neon-pink fill with gold edge, smooth-scrolls back to hero.
  - **Request Access** — secondary, ghost outline, smooth-scrolls to hero (placeholder for backend later).
- Background: dense jungle silhouette + heavy vignette.

## 7. Footer
- Minimal: `JUNGL3 // SUMMER 2026 // CLASSIFIED` in monospaced muted text + tiny lock icon to clear access.

## Design System
- **Palette**: near-black `#0a0608` base, deep purple `#1a0b2e`, neon pink `#ff2d87`, electric magenta glow, gold `#d4a437`, off-white text.
- **Type**: Display = Unbounded/Cinzel (heavy, metallic feel); Body = Inter; Mono accents = JetBrains Mono.
- **Effects (subtle, not noisy)**: global grain overlay, faint scanlines, ambient drifting fog layer, hover-glow on interactive elements, glint sweep on key headlines.
- **Motion**: respect `prefers-reduced-motion` — disables fog, glints, radar rotation.

## Architecture
- TanStack Start routes:
  - `/` — gate + experience (gate overlays the page; once unlocked, full site renders).
- Components: `PasswordGate`, `Hero`, `ConceptSection`, `SystemModules`, `IdeaEngineRadar`, `CTASection`, `Footer`, plus shared `GrainOverlay`, `FogLayer`, `ScanlineOverlay`.
- State: simple `useState` + `localStorage` for unlock; no backend yet.
- Desktop-first layout, gracefully collapses to single column on mobile; radar scales down.

**Note**: Re-upload the poster image when ready and I'll wire it into the gate + hero backgrounds. If it's not attached at implementation time, I'll use a layered SVG/gradient stand-in you can swap later.

