# 01 — The shape

The one-picture summary of how a prototype moves through Jungl3. This is the visual a reader should be able to recall a week later.

## Purpose

Teach, in one image, the end-to-end flow: a team (with agents) shapes an [Understory](../../glossary.md#understory) inside a [Jungle](../../glossary.md#jungle); the prototype deploys to a [DMZ](../../glossary.md#dmz) where AI agents probe it; it is promoted to a [Canopy](../../glossary.md#canopy) where humans meet it (browsing through the [Gallery](../../glossary.md#gallery)).

The three surface distinctions — *build surface*, *AI evaluation surface*, *human exposure surface* — are the load-bearing idea.

## Audience

A smart reader encountering Jungl3 for the first time (investor, advisor, future hire). They have 20 seconds.

## Size

`1536x1024` (horizontal).

## Prompt

**Background: transparent.** The canvas must be fully transparent — no background fill of any kind. All shapes and lines sit directly on transparency, so the image can be composited over any dark surface. If the tool cannot produce a transparent background, fall back to a solid dark canvas in color `#1A1F2E` (deep near-black with blue undertone), but transparent is strongly preferred.

Design a clean, horizontal infographic diagram, read left to right, in the visual style of editorial product documentation (Stripe, Linear, Vercel) — modern, minimal, flat, information-dense where it earns it, otherwise breathing. Four distinct regions arranged left-to-right, separated by generous empty space, connected by a single continuous flowing line.

**Palette — use only these colors:**
- `#3E7A4D` mid mossy green — living-system shapes.
- `#9FC97C` lime green — emphasis, "alive" signals, movement.
- `#F5F1E8` warm off-white — text labels and soft daylight glow.
- `#E08844` signal orange — one single accent only, for the promotion point.
- `#0F1320` very dark blue-black — reserved for the DMZ inset container interior.
- No pure black, no pure white, no other colors.

**Region one, leftmost — Jungle:** a small cluster of three simple rounded silhouette figures (two human-shaped, one abstract geometric — representing a team and their AI agents) working on a larger soft-edged organic form. The organic form is a living volume, not a box — blob-like, organic curves. Rendered in mid mossy green `#3E7A4D` with several small lime green `#9FC97C` dots inside at varying opacities, suggesting movement. Above this region, the label **Jungle** in warm off-white `#F5F1E8`, modern geometric sans-serif (Inter or similar), medium weight.

**Region two — DMZ:** a rounded-rectangle container with an interior fill of `#0F1320` (darker than the surrounding transparent canvas would be on any dark surface), with a thin 2px border in `#3E7A4D` at about 50% opacity. The container reads as an inset, enclosed, hardened space with no opening. Inside it: a small prototype silhouette (rounded rectangle, mid green `#3E7A4D`) at the center, and three or four small geometric abstract shapes in lime green `#9FC97C` — a diamond rotated 45°, a triangle, a cluster of five small dots, a hexagon — each connected to the prototype by a thin 2px arrow in lime at about 60% opacity, probing it. No human figures in this region. Above this region, the label **DMZ** in warm off-white `#F5F1E8`, same font treatment as Jungle.

**Region three — Canopy:** an open, airy region with a soft warm-light glow at its center — a large radial wash of warm off-white `#F5F1E8` at about 15% opacity, fading to transparent, suggesting daylight through leaves. No hard boundary. Two or three minimal human silhouette figures in mid mossy green `#3E7A4D` enter from the region's margins. At the center of the glow sits a prototype silhouette (identical shape to the one in the DMZ) in lime green `#9FC97C`. Above this region, the label **Canopy** in warm off-white `#F5F1E8`.

**Region four — Gallery, rightmost and smaller:** a clean 2×2 grid of four small tiles inside the Canopy region's glow. Each tile is a rounded square with alternating fills of `#3E7A4D` and `#9FC97C` at about 70% opacity, small gaps between them. Beneath the grid, the small label **Gallery** in warm off-white `#F5F1E8` at a lighter weight.

**Connecting flow:** a single 2px line passes through all four regions horizontally, with a smooth gradient from mid green `#3E7A4D` on the left to lime green `#9FC97C` on the right. At the exact transition point between region two (DMZ) and region three (Canopy), a single small 8px signal-orange `#E08844` dot sits on the line, with the tiny label **promotion** in warm off-white `#F5F1E8` just above it.

**Style rules:**
- Single consistent 2px line weight throughout.
- Organic shapes only — rounded rectangles, soft blobs, gentle curves.
- No icons of gears, clouds, locks, circuit traces, database cylinders, "AI" neural blobs, hex grids, or glowing sci-fi lines.
- No illustrated characters — all human figures are minimal abstract silhouettes.
- Hierarchy through size, fill, and opacity; avoid heavy outlines.
- At least 40% of the canvas is empty transparent space.
- Feels like a Stripe documentation diagram, not a Gartner slide, not a children's book.

## Iteration notes

Likely follow-ups if the first generation is close but off:

- *If the four regions feel cramped:* "Increase the spacing between the four regions by 30%; let more dark canvas show between them."
- *If the Canopy glow is too strong and drowns the prototype silhouette:* "Reduce the warm daylight glow in the third region to about 10% opacity; keep the prototype silhouette crisply visible."
- *If the DMZ enclosure doesn't read as a contained space:* "Make the DMZ container's interior fill darker and add a subtle 2px border in `#3E7A4D` to emphasize its enclosure."
- *If the flowing line is too prominent:* "Reduce the flowing line to 1.5px and make its opacity about 70% so it reads as connective tissue rather than a main element."
- *If labels render poorly:* "Remove all text; I will add labels in post-production."

## Fallback (SVG / Figma build)

If image-gen doesn't land after two rounds, build in Figma:

- Canvas 1600×900, background `#1A1F2E` (or transparent).
- Four horizontally-arranged zones, each ~350px wide, 120px apart.
- Zone 1 (Jungle): three small 24px circles (team) next to a larger organic blob, fill `#3E7A4D`, with small `#9FC97C` dots inside at varying opacities.
- Zone 2 (DMZ): a 400×500 rounded rectangle fill `#0F1320`, 2px stroke `#3E7A4D` at 40% opacity. Inside: a small 80×60 prototype rounded rect fill `#3E7A4D`, surrounded by four small 24×24 geometric shapes (diamond, triangle, hexagon, dot cluster) fill `#9FC97C`.
- Zone 3 (Canopy): a 500px radial gradient from center, `#F5F1E8` at 15% opacity fading to transparent. Three 24px silhouette circles fill `#3E7A4D` entering from margins. A 100×80 prototype rounded rect fill `#9FC97C` at center.
- Zone 4 (Gallery): a 2×2 grid of 60×60 rounded squares inside Zone 3's glow, alternating fills `#3E7A4D` and `#9FC97C`.
- A single 2px stroke line connecting all four zones, gradient `#3E7A4D` → `#9FC97C`.
- One 8px orange `#E08844` circle on the line between Zone 2 and Zone 3.
- Zone labels (`Jungle`, `DMZ`, `Canopy`) at top of each zone in Inter/Söhne 18px weight 500, fill `#F5F1E8`.
- `Gallery` beneath the tile grid, 14px weight 400, fill `#F5F1E8`.
- `promotion` above the orange dot, 11px weight 400, fill `#F5F1E8`.

## Placement

Top of [`../../product/where-we-are.md`](../../product/where-we-are.md), replacing the current Mermaid sketch.

Also usable in [`../../architecture/system-context.md`](../../architecture/system-context.md) if it reads well at smaller sizes.

## Labels to add in post

Short labels (`Jungle`, `DMZ`, `Canopy`, `Gallery`, `promotion`) are in the prompt and should render. The longer caption below is post-production:

- Caption beneath the whole visual: *"A prototype moves left to right. AI agents test before humans see."*

Caption font: Inter or Söhne, weight 400, fill `#F5F1E8` at 80% opacity.
