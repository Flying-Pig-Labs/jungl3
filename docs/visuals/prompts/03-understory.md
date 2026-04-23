# 03 — Understory

A cross-section of what is already alive inside a Jungle on day one. This visual earns the forest metaphor: in a real forest, the *understory* is the active layer beneath the canopy — the part you don't see but where most of the life happens. On a dark canvas it also reads as a cross-section through night soil, which lands the "quiet substrate" feel well.

## Purpose

Teach that a Jungle doesn't start empty. It starts with a pre-wired, already-running application — services, data, users, events, integrations — that a team shapes rather than builds. The reader should leave with a concrete mental picture of *what's in the box on day one*.

For the canonical term and definition, see [`../../glossary.md#understory`](../../glossary.md#understory).

## Audience

Same as the others. Secondary audience: an engineer evaluating "is this real or is this hand-wavy?" — the density of the visible substrate should answer that.

## Size

`1024x1536` (vertical).

## Prompt

**Background: transparent.** The canvas must be fully transparent — no background fill of any kind. All shapes and lines sit directly on transparency, so the image can be composited over any dark surface. If the tool cannot produce a transparent background, fall back to a solid dark canvas in color `#1A1F2E` (deep near-black with blue undertone), but transparent is strongly preferred.

Design a vertical stacked-layer infographic viewed from the side, in the visual style of editorial product documentation (Stripe, Linear, Vercel) — modern, minimal, flat. The composition is a descending substrate: a thin horizon line near the top, with mostly empty space above it, and a dense five-stratum layer cake below it. Read from top to bottom like looking at a cross-section through soil.

**Palette — use only these colors:**
- `#3E7A4D` mid mossy green — primary shapes, silhouettes, most structural elements.
- `#9FC97C` lime green — event dots and flow arrows only.
- `#F5F1E8` warm off-white — text labels.
- `#E08844` signal orange — three or four rare audit accents in the Data stratum, nowhere else.
- No pure black, no pure white, no other colors.

**Along the left margin of the substrate:** a single vertical label **UNDERSTORY** rotated 90 degrees (reading bottom-to-top), rendered in warm off-white `#F5F1E8`, modern geometric sans-serif (Inter or similar) at medium-heavy weight with slightly increased letter-spacing.

**Top of the canvas, above a subtle horizon line:** mostly empty transparent space. A single faint ghosted outline of a rounded rectangle in mid mossy green `#3E7A4D` at 20% opacity, centered and small — representing the working surface where teams and agents operate. Just above this shape, the small label **Where teams shape** in warm off-white `#F5F1E8` at a lighter weight. The horizon line itself is a thin 1px stroke in `#3E7A4D` at 30% opacity, spanning the full width of the canvas.

**Beneath the horizon line — the Understory itself, a dense five-stratum layer cake.** Each stratum takes roughly equal vertical space, visually distinct but clearly part of a single living volume. Each stratum has a small left-margin label in warm off-white `#F5F1E8` at light weight.

1. **Services** — a row of six or seven small rounded-rectangle silhouettes in mid mossy green `#3E7A4D`, arranged horizontally, connected by thin 2px lines. Represents the microservices. Label: **Services**.

2. **Events** — small 6px lime green `#9FC97C` dots and short 20px arrows flowing horizontally across the stratum, suggesting live event traffic. Density varies — some clumps, some gaps — organic rather than uniform. Label: **Events**.

3. **Data + audit** — horizontal bands of varying opacity in mid mossy green `#3E7A4D`, thin horizontal lines stacked at opacities of 30%, 50%, and 70%, suggesting stored records. Scattered sparsely across the bands, three or four tiny accents in signal orange `#E08844` — representing maker-checker and audit entries, visible but rare. Label: **Data + audit**.

4. **Users + personas** — a row of eight small varied silhouette shapes (rounded rectangles at different aspect ratios to suggest different persona types), in mid mossy green `#3E7A4D`, spaced evenly across the stratum. Label: **Users + personas**.

5. **Integrations (stubbed)** — four small rounded-square shapes positioned near the left and right margins, each in mid mossy green `#3E7A4D`, connected by thin 2px lines reaching outward to the canvas edges and beyond, suggesting external systems wired in but stubbed. Label: **Integrations (stubbed)**.

**Unifying element:** a faint vertical 2px line in `#3E7A4D` at 20% opacity runs down the center of the substrate from just below the horizon line to the bottom of the last stratum, tying the five strata together as one living system.

**Overall feel:** dense but not chaotic. *There is a lot going on down here, and it is all already running.* Subtle variation in green opacities between strata so they don't blur together.

**Style rules:**
- Single consistent 2px line weight throughout (except the thinner 1px horizon line).
- Organic shapes — rounded rectangles, small rounded silhouettes, gentle curves.
- No icons of gears, cloud symbols, circuit traces, database cylinders, "AI" neural blobs.
- No illustrated characters — silhouettes are minimal abstract shapes.
- Hierarchy through size, density, and opacity.
- Feels like a Stripe documentation diagram, not a pitch deck, not whimsical illustration.

## Iteration notes

Likely follow-ups if the first generation is close but off:

- *If the strata blur together:* "Increase the vertical spacing between the five strata slightly, and vary the green opacity of each stratum more distinctly (e.g. 100%, 85%, 70%, 85%, 100%). The strata should read as five distinct layers."
- *If the substrate feels too dense and overwhelming:* "Reduce the number of elements in each stratum by about 25%; keep the overall impression of density but with more breathing room."
- *If the signal-orange audit accents are too prominent:* "Reduce the orange `#E08844` accents to just two or three across the entire data stratum, smaller in size."
- *If the top-of-canvas 'where teams shape' area feels out of proportion:* "Reduce the top empty area to about 15% of the total canvas height; expand the substrate below to fill the remaining 85%."
- *If the vertical UNDERSTORY label renders poorly:* "Remove the vertical side label; I will add it in post-production."

## Fallback (SVG / Figma build)

Strong Figma candidate. Stratified horizontal rows are precise to build directly.

In Figma:
- Canvas 1200×1600, background `#1A1F2E` (or transparent).
- Horizon line at y=240, 1px stroke `#3E7A4D` at 30% opacity, full width.
- Above horizon (y=60 to y=230):
  - A single 600×80 rounded rectangle at (x=300, y=130), fill none, stroke `#3E7A4D` 2px at 20% opacity.
  - Label `Where teams shape` at (x=600, y=100), Inter/Söhne 14px weight 400, fill `#F5F1E8`, centered.
- Below horizon, five strata y-ranges (each ~270px tall):
  - **Services (y=250–520):** left-margin label `Services` at (x=80, y=380), 14px weight 500, fill `#F5F1E8`. Seven 80×50 rounded rects in a horizontal row, fill `#3E7A4D`, connected by 2px lines.
  - **Events (y=520–790):** left-margin label `Events` at (x=80, y=650). Scattered 6px circles fill `#9FC97C` across the stratum, eight short 20px 2px arrows in lime `#9FC97C`.
  - **Data + audit (y=790–1060):** left-margin label `Data + audit` at (x=80, y=920). Alternating horizontal bands 6px tall at y=810, 830, 860, 890, 920, 960, 990, 1020, fills `#3E7A4D` at 30%/50%/70%. Three 10×10 squares `#E08844` scattered at (x=400, y=860), (x=800, y=920), (x=950, y=990).
  - **Users + personas (y=1060–1330):** left-margin label `Users + personas` at (x=80, y=1190). Eight silhouette shapes (various aspect rounded rectangles 20×24, 24×20, 22×22) in a row, fill `#3E7A4D`.
  - **Integrations (y=1330–1540):** left-margin label `Integrations (stubbed)` at (x=80, y=1430). Four 40×40 rounded squares at the left and right margins, fill `#3E7A4D`, connected by 2px lines extending to the canvas edges at y=1430.
- A faint vertical 2px line at x=600 from y=240 to y=1540, stroke `#3E7A4D` at 20% opacity.
- Rotated side label `UNDERSTORY` at (x=30, y=890), rotated -90°, Inter/Söhne 28px weight 600, letter-spacing 0.1em, fill `#F5F1E8`.

## Placement

Best home: a new section in [`../../architecture/system-context.md`](../../architecture/system-context.md) introducing the Understory concretely, or a future `docs/architecture/understory.md` if that file earns its place.

Secondary use: [`../../product/positioning.md`](../../product/positioning.md), right after visual #2 — #2 argues the principle, #3 shows what "living baseline" actually contains.

## Labels to add in post

Most labels are in the prompt and should render (stratum labels, side label, `Where teams shape`). Only the longer caption is post-production:

- Caption beneath the whole visual: *"Already running on day one. The team shapes from the top."*

Caption font: Inter or Söhne, weight 400, fill `#F5F1E8` at 80% opacity.
