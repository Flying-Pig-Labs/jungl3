# 02 — Shaping, not scaffolding

The core product principle, argued visually. This is the visual that most earns its place: it doesn't *describe* the product, it *makes the case for it*.

## Purpose

Teach that Jungl3's distinctive choice is starting from a living baseline, not a blank scaffold. Two side-by-side panels argue:

- **Left:** the conventional approach. A team starts from zero. A lot of ceremony, not much that's alive. Slow.
- **Right:** the Jungl3 approach. A team shapes something that is already running. Less ceremony, more product. Fast.

The asymmetry between the panels *is* the argument. The left side should feel empty and pre-construction. The right side should feel alive and already productive. On a dark canvas, this reads as *unlit substrate* (left) vs *glowing life* (right).

## Audience

Same as visual #1. A smart reader in 20–30 seconds.

## Size

`1536x1024` (horizontal).

## Prompt

**Background: transparent.** The canvas must be fully transparent — no background fill of any kind. All shapes and lines sit directly on transparency, so the image can be composited over any dark surface. If the tool cannot produce a transparent background, fall back to a solid dark canvas in color `#1A1F2E` (deep near-black with blue undertone), but transparent is strongly preferred.

Design a two-panel comparison infographic in the visual style of editorial product documentation (Stripe, Linear, Vercel) — modern, minimal, flat. Two panels of equal size arranged side by side, separated by a thin vertical divider line in mid mossy green `#3E7A4D` at about 25% opacity, positioned exactly at the horizontal center of the canvas. The entire argument is the *asymmetry* between the two panels: left reads as empty and pre-construction, right reads as dense and alive.

**Palette — use only these colors:**
- `#3E7A4D` mid mossy green — primary shapes, silhouettes, the living form.
- `#9FC97C` lime green — small elements of activity inside the living form.
- `#F5F1E8` warm off-white — text labels and a soft inner glow on the living form.
- `#E08844` signal orange — one single accent only, where the hand meets the form.
- No pure black, no pure white, no other colors.

**Left panel — "Starting from zero":**
At the top of the panel, the label **Starting from zero** in warm off-white `#F5F1E8`, modern geometric sans-serif (Inter or similar), medium weight.

The interior of this panel is *intentionally sparse* — at least half of its area is empty, untouched transparent space.

At the bottom of the panel, three small minimal human silhouette figures in mid mossy green `#3E7A4D`, facing forward.

Above them, floating in empty space, a single ghostly rounded rectangle outline in `#3E7A4D` at 30% opacity — a blank sheet, almost invisible. Scattered around the blank sheet, five or six tiny disconnected fragments: small empty rounded rectangle outlines at very low opacity, two or three short stub connector lines that don't reach anything, a couple of isolated dots. No glow. No lime green anywhere in this panel. No warm highlights. The panel feels *pre-construction* — organized effort, little alive yet.

**Right panel — "Shaping a living thing":**
At the top of the panel, the label **Shaping a living thing** in warm off-white `#F5F1E8`, same font and weight as the left panel's label.

At the bottom of the panel, three identical small human silhouette figures in mid mossy green `#3E7A4D`, at the same vertical position as the left panel's figures.

Above them, a large rich organic living form — a soft-edged blob occupying the center of the panel — filled with mid mossy green `#3E7A4D` as the base color, with a subtle inner radial glow of warm off-white `#F5F1E8` at about 15% opacity giving a living-daylight feel from within. Inside the form, twelve to fifteen small shapes (circles, short lines, small rounded rectangles) in lime green `#9FC97C` at varying opacities (30%–80%), suggesting events and data already in flight. From the form, thin 2px connector lines in `#3E7A4D` at 50% opacity reach outward to four small satellite shapes (rounded squares, mid green) near the panel edges — suggesting pre-wired integrations. At the point where one human silhouette's gesture line meets the living form, a single small 6px signal-orange `#E08844` dot — the point where shaping happens.

The panel feels *alive and already productive*: dense inside the form, the system visibly running.

**The asymmetry is the point.** Left panel reads as mostly empty, cool, static. Right panel reads as glowing, warm, alive with activity. The three silhouettes at the base of each panel are the only constant — same figures, same positions, dramatically different state of what they're standing next to.

**Style rules:**
- Single consistent 2px line weight throughout.
- Organic shapes only — rounded rectangles, soft blobs, gentle curves.
- Silhouettes are minimal abstract rounded forms — no facial features, no limbs, no stock-photo "team with laptops" vibe.
- No icons of gears, clouds, laptops, circuit traces, database cylinders, "AI" neural blobs.
- Hierarchy through density and opacity, not through heavy outlines or labels.
- Feels like a Stripe documentation diagram, not a whimsical illustration, not a corporate pitch deck.

## Iteration notes

Likely follow-ups if the first generation is close but off:

- *If the left panel still feels too busy:* "Reduce the fragments around the blank sheet to just three or four, and lower their opacity to about 25%. Make the left panel feel more empty."
- *If the right panel's living form feels cluttered:* "Reduce the small lime-green shapes inside the living form to eight or nine; keep only the most prominent. Preserve the sense of activity without crowding."
- *If the asymmetry between panels is not strong enough:* "Increase the density of activity in the right panel by 30%, and decrease the density of elements in the left panel by 50%. The contrast between the two is the main point of the visual."
- *If the silhouettes look too illustrated:* "Make the human silhouettes simpler — rounded minimal shapes, not detailed figures."
- *If the warm inner glow on the right is lost in the dark canvas:* "Strengthen the warm off-white inner glow on the right panel's living form to about 25% opacity; keep it centered and soft."

## Fallback (SVG / Figma build)

Strong Figma build candidate — the asymmetric density is easier to control precisely in Figma than through image-gen.

In Figma:
- Canvas 1600×900, background `#1A1F2E` (or transparent).
- Vertical divider at x=800, 2px stroke `#3E7A4D` at 25% opacity.
- Left half:
  - Title at top (x=400, y=60): `Starting from zero`, Inter/Söhne 24px weight 500, fill `#F5F1E8`.
  - Three 24px silhouette circles at the bottom (y=800), fill `#3E7A4D`.
  - A large centered rounded rectangle at (x=400, y=450), 300×400, fill none, stroke `#3E7A4D` 2px at 30% opacity.
  - Five or six 20×20 rounded rectangles scattered around it, fill `#3E7A4D` at 15% opacity.
  - Three short disconnected 2px stub lines, stroke `#3E7A4D` at 30% opacity.
- Right half:
  - Title at top (x=1200, y=60): `Shaping a living thing`, same font.
  - Three identical 24px silhouette circles at the bottom (y=800), fill `#3E7A4D`.
  - A large centered organic blob (pen-tool curve) at (x=1200, y=450), ~350×450, fill `#3E7A4D`.
  - A radial gradient overlay on the blob: `#F5F1E8` at 15% opacity at the center, fading to transparent at the edges.
  - Twelve to fifteen small shapes inside the blob, fills `#9FC97C` at varying opacities (30%–80%).
  - Four satellite shapes around the blob, each a 30×30 rounded square, fill `#3E7A4D`, connected by 2px lines at 50% opacity.
  - One 6px circle `#E08844` at the point where a silhouette's gesture line meets the blob.

## Placement

[`../../product/positioning.md`](../../product/positioning.md), near the opening. The document argues this in prose ("start with a living baseline, shape it"); the visual makes the argument stick before the prose starts.

## Labels to add in post

Short panel titles (`Starting from zero`, `Shaping a living thing`) are in the prompt and should render. Longer annotations go in post:

- Subtitle beneath the left panel's title: *"weeks of setup before anything runs"*
- Subtitle beneath the right panel's title: *"alive on day one, editable from the first hour"*
- Optional overall caption below both panels, centered: *"The difference is not speed of typing. It's what you start next to."*

Subtitle and caption font: Inter or Söhne, weight 400, fill `#F5F1E8` at 80% opacity.
