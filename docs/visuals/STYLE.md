# Visual style baseline

The shared style guide every visual in this directory references. Keep this short; long style guides don't survive.

Jungl3's visuals exist to teach one idea at a time to a reader who is not already inside the project. They are not pitch-deck ornament. They are not hero illustrations. They are **infographics that argue a point**.

---

## The through-line

The product vocabulary (*Understory*, *Jungle*, *Canopy*) already carries a forest metaphor. The visuals should **evoke** that metaphor, not illustrate it.

**Evoke, good:** layered composition (something below, something above), an organic curve or two, a green-leaning palette, a sense of "living system" rather than "assembled blocks."

**Illustrate, bad:** cartoon trees, leaves everywhere, monkeys, rainforest backdrops, literal canopy foliage rendering. The moment a visual looks like it could be a children's book illustration, it has lost the audience.

The test: *a smart enterprise reader skims this and thinks "clear." If they think "cute" or "whimsical," we've failed.*

---

## Canvas

**Every visual has a transparent canvas, always.** If the generation tool cannot produce transparent backgrounds, solid `#1A1F2E` (deep near-black with blue undertone) is the fallback, but transparent is the default. Visuals composite over any dark surface in the docs; they never assume a specific background color.

Never a light background. The forest-floor-at-night feel is intentional: the visuals are about things that *glow from within* a living system, not things painted on a bright page.

Empty space is welcome and expected. Emptiness reads as *quiet substrate*, not void. A visual that is 60% empty is close to right.

---

## Palette

A tight palette. Every visual uses this and only this.

| Role | Name | Hex | Notes |
| --- | --- | --- | --- |
| Canvas | Substrate | `#1A1F2E` | Solid, or transparent, never a light alternative. |
| Canvas-deeper | Substrate-deep | `#0F1320` | Slightly darker; for inset containers (e.g. the DMZ enclosure) that need to read as "inside" on an already-dark canvas. |
| Primary green | Understory | `#3E7A4D` | Mid mossy green. On dark it reads clearly; a deeper green vanishes. Used for shape fills that represent the living system. |
| Deep green | Understory-deep | `#2F5D3A` | The deeper green; reserved for low-contrast accents and subtle layering. Do not use for a primary shape on dark. |
| Accent lime | Canopy-light | `#9FC97C` | Brighter green, used sparingly for emphasis and "alive" signals. High contrast on dark. |
| Warm light | Clearing | `#F5F1E8` | Warm off-white. On dark it reads as *daylight* — used for labels, highlights, and low-opacity glows in the Canopy region. Never as a full background. |
| Signal orange | Alert | `#E08844` | Used *only* for things the reader should notice (a promotion gate, a risk, the key bit). Never decorative. Reads well on dark. |

**Notes on use:**

- When a visual needs a "brighter green alive thing," reach for `#9FC97C`, not `#3E7A4D`.
- When a visual needs a bounded-darker region (DMZ enclosure), fill with `#0F1320`, not black.
- `#F5F1E8` at 10–20% opacity gives a soft daylight-glow effect, useful in the Canopy.
- Avoid pure black, pure white, corporate blue, Figma purple, any gradient that crosses more than two palette colors.

---

## Typography

Short labels rendered by ChatGPT Images 2.0 are reliable — panel titles, stratum labels, 1–3 word tags. Captions longer than a short phrase, or anywhere typography really matters, get composited in post (Figma / Keynote).

When type is in-image:

- **Headline / node labels:** a modern geometric sans-serif. Think Inter, Söhne, or GT America. Not Helvetica, not Montserrat, not Poppins (too soft).
- **Body:** same family, lighter weight.
- **Color on dark:** `#F5F1E8` for primary text. `#9FC97C` for accent text. Never pure white.
- **Never:** script, serif (too editorial), condensed (too industrial), all-caps decorative.
- **Weight range:** 400–600 only. No 700+ black weights, no hairline 200s.

---

## Composition

Every visual follows one of two layouts:

1. **Left-to-right flow** — when teaching a sequence (Jungle → DMZ → Canopy).
2. **Stacked layers** — when teaching a substrate (Understory beneath, Canopy above).

No radial layouts, no isometric 3D stacks, no exploded-view "platform diagrams."

Whitespace (on dark: *dark-space*) is the dominant element.

---

## Shape language

- **Organic primitives:** rounded rectangles, soft blobs, gentle curves.
- **No hard tech iconography:** no gears, no clouds-with-lightning, no "AI brain" pictograms, no circuit traces, no blockchains-as-chain-links, no lock icons.
- **Hierarchy through size, fill, and subtle glow**, not borders. Containers rarely need outlines on a dark canvas; a fill difference usually suffices.
- **A single consistent line weight** across a visual (think 2px at final export).
- **Subtle inner glow is OK** on shapes representing "alive" elements — a soft `#9FC97C` at low opacity around a filled shape. Don't overdo it; two or three glows per visual, not everywhere.

---

## What every visual must do

- Teach **one** thing. If a reader would have to ask "which of these three ideas is this showing?", it's failed.
- Be legible at **two sizes**: viewed at 400px wide on a screen, and viewed full-screen on a laptop.
- Use color **semantically**, not decoratively. Green = living system. Lime = emphasis. Orange = pay attention here. Warm light = daylight / human-facing.
- Leave room for labels added in post-production when they're longer than 3 words or when typography matters. Don't pack the frame.

## What every visual must not do

- No stock-photo vibes.
- No corporate handshake / team-with-laptops imagery.
- No "futuristic" hex grids, glowing lines, or "AI" neural blobs.
- No scale violations (a giant user icon next to a tiny server icon).
- No pure-black or pure-white elements.
- No light-background fallback. Dark canvas or transparent, always.

---

## Working with ChatGPT Images 2.0

These prompts target ChatGPT Images 2.0 (GPT-Image-1). A few practical notes that shape how prompts are written:

- **Prose, not keyword fragments.** The model responds to descriptive sentences. Midjourney-style comma-separated keyword lists work worse.
- **Size via the tool, not the prompt.** No `--ar` flag. Use the size selector:
  - `1536x1024` for horizontal visuals (most here — #1, #2, #4).
  - `1024x1536` for vertical visuals (e.g. #3 Understory cross-section).
  - `1024x1024` square rarely.
- **Short in-image text is reliable.** Labels of 1–3 words can be specified directly in the prompt ("with the label `DMZ` at the top of the enclosure"). Longer captions still belong in post-production — typography control is the limiting factor, not rendering capability.
- **Transparent backgrounds are supported.** When the placement needs it, ask explicitly: "transparent background" or "on a transparent canvas." Otherwise default to `#1A1F2E` solid.
- **Iteration works.** After a first generation, follow up with specific deltas ("keep everything but make the right panel's glow fainter"). The prompts below include an *Iteration notes* section with the most likely follow-ups.
- **Reference images help.** If you've built a version in Figma you want to stylistically match, upload it as a reference. Mention it as a reference, not as "copy this."

---

## How prompts in this directory work

Each prompt file in `prompts/` has the same shape:

1. **Purpose** — what the visual teaches.
2. **Audience** — who is reading it.
3. **Size** — the ChatGPT Images 2.0 size to use.
4. **Prompt** — the generation prompt, prose. **Self-contained**: every prompt inlines the palette, composition rules, shape language, and anti-patterns it needs. You can copy any prompt and paste it into the model with no external context. This duplicates material across prompts on purpose — each one is meant to stand alone.
5. **Iteration notes** — likely follow-up deltas to improve the first generation.
6. **Fallback (SVG / Figma build)** — exact specs if image-gen doesn't land. None of these visuals depend on image generation.
7. **Placement** — where the final rendered visual lives in the repo / docs.
8. **Labels to add in post** — longer text that should be composited on after generation (short labels go directly in the prompt).

**This style guide is a reference for humans, not a dependency for prompts.** It's where I document *why* the palette and composition rules are what they are, and where a new contributor learns the visual language. The prompts themselves don't read it.

---

## Related

- [`./prompts/README.md`](./prompts/README.md) — index of visuals.
- [`../glossary.md`](../glossary.md) — canonical term definitions (source of truth for labels).
- [`../../CLAUDE.md`](../../CLAUDE.md) §8 — Mermaid style rules (for text-only diagrams).
