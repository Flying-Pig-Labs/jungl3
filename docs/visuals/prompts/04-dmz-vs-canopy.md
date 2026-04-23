# 04 — DMZ vs Canopy

The visual that resolves the question a reader will have after seeing visual #1: "wait, why are those two separate things?"

## Purpose

Teach the distinction between the [DMZ](../../glossary.md#dmz) and the [Canopy](../../glossary.md#canopy) side by side. Same prototype, two different surfaces, two different audiences, two different security postures, two different jobs. The split was pinned in [ADR 0011](../../decisions/0011-canopy-and-ai-first-dmz.md); this visual is the picture version of that ADR's core argument.

On a dark canvas, the DMZ's distinctiveness comes from a **hard-edged, even-darker enclosure**, and the Canopy's distinctiveness comes from a **soft warm-light glow of daylight** on the dark substrate. The contrast is enclosed-vs-exposed and private-vs-lit.

## Audience

Same as the others, plus: anyone who encounters the vocabulary (DMZ, Canopy) and needs a quick grounding. This visual is likely to be reused in onboarding, in the glossary, and in architecture docs.

## Size

`1536x1024` (horizontal).

## Prompt

**Background: transparent.** The canvas must be fully transparent — no background fill of any kind. All shapes and lines sit directly on transparency, so the image can be composited over any dark surface. If the tool cannot produce a transparent background, fall back to a solid dark canvas in color `#1A1F2E` (deep near-black with blue undertone), but transparent is strongly preferred.

Design a horizontal two-panel comparison infographic in the visual style of editorial product documentation (Stripe, Linear, Vercel) — modern, minimal, flat. The two panels are split by a thin vertical divider line in mid mossy green `#3E7A4D` at about 25% opacity at the horizontal center of the canvas. Both panels are the same size. The same abstract prototype silhouette — a 120×80 rounded-rectangle abstract form representing an application — sits at the exact center of both panels, identical in size, shape, color, and position. Everything around the prototype differs between the two panels; the prototype itself is the constant.

**Palette — use only these colors:**
- `#3E7A4D` mid mossy green — prototype silhouettes, human silhouettes, Gallery tiles.
- `#9FC97C` lime green — the AI agents in the DMZ, their arrows, half the Gallery tiles.
- `#F5F1E8` warm off-white — text labels and the soft Canopy daylight glow.
- `#E08844` signal orange — one single accent only, the promotion dot.
- `#0F1320` very dark blue-black — the DMZ enclosure's inset interior fill.
- No pure black, no pure white, no other colors.

**Left panel — DMZ (enclosed, AI-only):**

At the top of the panel, the label **DMZ** in warm off-white `#F5F1E8`, modern geometric sans-serif (Inter or similar), medium weight. Just beneath the title, in a smaller lighter weight, the tag **AI evaluation**.

At the vertical center of the panel, the prototype silhouette: a 120×80 rounded rectangle in mid mossy green `#3E7A4D`. Around the prototype, a bounded enclosure: a larger rounded rectangle container (roughly 500×500) with an interior fill of `#0F1320` (darker than the surrounding transparent canvas would appear on any dark surface), and a thin 2px border in `#3E7A4D` at 50% opacity. The enclosure reads as a contained, hardened, inset space with no opening to the outside.

*Inside the enclosure*, around the prototype: four small abstract geometric shapes, each in lime green `#9FC97C` — a diamond rotated 45°, a small triangle, a cluster of five small dots, and a hexagon — positioned around the prototype from different angles. Each shape connects to the prototype by a thin 2px arrow in `#9FC97C` at 60% opacity, suggesting probing. These represent AI agents.

**No human silhouettes in the left panel.**

At the top-right corner of the enclosure, a single small 8px signal-orange `#E08844` dot, with the tiny label **promotion** in warm off-white `#F5F1E8` just above it.

**Right panel — Canopy (open, human-facing):**

At the top of the panel, the label **Canopy** in warm off-white `#F5F1E8`, same font treatment as the DMZ title. Just beneath, in a smaller lighter weight, the tag **Human exposure**.

At the vertical center of the panel, the prototype silhouette: identical to the one in the left panel — a 120×80 rounded rectangle in mid mossy green `#3E7A4D`, same size, same position, same color. There is no enclosure.

Behind the prototype, a soft warm-light radial glow: warm off-white `#F5F1E8` at about 20% opacity at the center, fading smoothly to transparent over a radius of roughly 300px. The glow gives a daylight-through-leaves feel.

Around the prototype, three or four minimal human silhouette figures in mid mossy green `#3E7A4D`, approaching from different margins of the panel. From each silhouette, a thin 2px connector line in `#3E7A4D` at 50% opacity extends to the prototype, suggesting interaction.

To one side of the prototype (within the glow), a small 2×2 grid of four tiles — each a 50×50 rounded square, fills alternating between `#3E7A4D` and `#9FC97C` at 70% opacity, with small gaps between them. Beneath the grid, the small label **Gallery** in warm off-white `#F5F1E8` at a lighter weight.

**The asymmetry is the point.** Left panel reads as enclosed, dense inside, hard-edged, no humans. Right panel reads as open, lit, airy, no hard edge, humans present, a Gallery visible. The prototype at the center of both is identical — only its surroundings change.

**Style rules:**
- Single consistent 2px line weight throughout.
- Organic shapes — rounded rectangles, soft silhouettes, gentle curves.
- The geometric shapes inside the DMZ (diamond, triangle, hexagon, dot cluster) are the *only* non-organic forms in the visual — and they're there specifically to read as "not-human" AI probes.
- Human silhouettes are minimal abstract rounded forms — no facial features, no limbs.
- No icons of gears, clouds, locks, circuit traces, database cylinders, "AI" neural blobs, network topology diagrams.
- Feels like a Stripe documentation diagram, not a network-security diagram, not whimsical illustration.

## Iteration notes

Likely follow-ups if the first generation is close but off:

- *If the DMZ enclosure doesn't read as clearly contained:* "Make the DMZ container's border more visible — 2.5px `#3E7A4D` at 70% opacity — and deepen the interior fill contrast. The enclosure should obviously read as an isolated space."
- *If the Canopy glow is too soft or invisible:* "Strengthen the warm off-white radial glow behind the Canopy prototype to about 30% opacity at center; keep the fade gentle."
- *If the Canopy glow is too strong and washes out the prototype:* "Reduce the warm glow to about 12% opacity at center; keep the prototype silhouette sharply visible against it."
- *If the two prototypes look slightly different:* "The prototype silhouettes in both panels must be identical in size, shape, position, and color. Only their surroundings differ."
- *If the right panel's human silhouettes feel illustrated:* "Make the human silhouettes simpler — minimal rounded forms, no facial features, no limbs."
- *If the overall dark canvas reads as too flat:* "Add a very subtle large-radius vignette to darken the panel edges slightly; keep the canvas reading as depth rather than a flat plane."

## Fallback (SVG / Figma build)

Strong Figma build candidate. The symmetry (same prototype, different environments) is easy to get exactly right in Figma.

In Figma:
- Canvas 1600×900, background `#1A1F2E` (or transparent).
- Vertical divider at x=800, 2px stroke `#3E7A4D` at 25% opacity.
- Both panels share an identical 120×80 rounded-rectangle prototype silhouette, fill `#3E7A4D`, centered vertically at y=450, at x=400 (left) and x=1200 (right).
- Left panel:
  - Title `DMZ` at (x=400, y=60), Inter/Söhne 28px weight 600, fill `#F5F1E8`, centered.
  - Tag `AI evaluation` at (x=400, y=95), Inter/Söhne 14px weight 400, fill `#F5F1E8` at 70% opacity.
  - A 500×500 rounded rectangle enclosure centered on the prototype at (x=400, y=450), fill `#0F1320`, stroke `#3E7A4D` 2px at 50% opacity.
  - Four small shapes around the prototype (inside the enclosure): a 30×30 diamond rotated 45° at (x=280, y=390), a 30×30 triangle at (x=520, y=390), a cluster of five 6px dots at (x=280, y=540), a 30×30 hexagon at (x=520, y=540). All fill `#9FC97C`. Each connected to the prototype by a 2px arrow `#9FC97C` at 60% opacity.
  - An 8px circle `#E08844` at (x=620, y=220).
  - Label `promotion` at (x=620, y=200), Inter/Söhne 11px weight 400, fill `#F5F1E8`.
- Right panel:
  - Title `Canopy` at (x=1200, y=60), same font treatment as the left title.
  - Tag `Human exposure` at (x=1200, y=95), same font treatment as the left tag.
  - No enclosure. A radial gradient centered at (x=1200, y=450), 300px radius: `#F5F1E8` at 20% opacity at center, fading to 0% at the edge.
  - Four 24px silhouette circles at approximate positions around the prototype at varying distances: (x=1050, y=300), (x=1380, y=350), (x=1050, y=600), (x=1380, y=580). Fill `#3E7A4D`.
  - 2px connector lines from each silhouette to the prototype, stroke `#3E7A4D` at 50% opacity.
  - A 2×2 grid of 50×50 rounded squares at (x=1400, y=500) with 8px gaps, alternating fills `#3E7A4D` and `#9FC97C` at 70% opacity.
  - Label `Gallery` beneath the grid at (x=1455, y=625), Inter/Söhne 12px weight 400, fill `#F5F1E8`.

## Placement

Primary: [`../../architecture/canopy.md`](../../architecture/canopy.md) — both surfaces defined in contrast.
Secondary: [`../../architecture/dmz.md`](../../architecture/dmz.md) — same visual, same point.
Tertiary: as a thumbnail beside each glossary entry ([`../../glossary.md#dmz`](../../glossary.md#dmz) and [`../../glossary.md#canopy`](../../glossary.md#canopy)).

Also a candidate for [`../../product/where-we-are.md`](../../product/where-we-are.md) if the two-surface distinction is not landing from prose alone.

## Labels to add in post

Short labels (`DMZ`, `Canopy`, `AI evaluation`, `Human exposure`, `Gallery`, `promotion`) are in the prompt and should render. Longer annotations go in post:

- Subtitle beneath the left panel's title, second line only: *"AI agents probe. No humans."*
- Subtitle beneath the right panel's title, second line only: *"Humans interact. Judges judge."*
- Optional overall caption below both panels: *"Same prototype. Two surfaces. The AI agents go first."*

Note: the prompt includes the short `AI evaluation` / `Human exposure` tags in-image; the longer "probe / interact" sentences are the post-production additions. If the in-image tags render poorly, drop them from the prompt in the next iteration and move them to post.

Caption font: Inter or Söhne, weight 400, fill `#F5F1E8` at 80% opacity.
