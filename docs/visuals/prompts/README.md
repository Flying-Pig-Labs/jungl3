# Visual prompts

Index of prompts for the four baseline visuals. Each teaches one idea at the center of Jungl3. Each follows the shared style in [`../STYLE.md`](../STYLE.md).

## The four

| # | File | Teaches |
| --- | --- | --- |
| 1 | [`01-shape.md`](./01-shape.md) | The end-to-end flow: Jungle → DMZ → Canopy. The "one-picture shape." |
| 2 | [`02-shaping-not-scaffolding.md`](./02-shaping-not-scaffolding.md) | The core product principle. Starting from a living baseline beats starting from zero. |
| 3 | [`03-understory.md`](./03-understory.md) | What is already running on day one, beneath what a team touches. |
| 4 | [`04-dmz-vs-canopy.md`](./04-dmz-vs-canopy.md) | Why the two exposure surfaces exist, and who interacts with each. |

Read them in order. They build on each other: visual #1 introduces the three surfaces; #2 argues *why* the platform is shaped this way; #3 zooms into the living baseline under a Jungle; #4 zooms into the two surfaces after a Jungle.

## Using these

**Each prompt is self-contained.** You can copy the `Prompt` section of any file and paste it directly into ChatGPT Images 2.0 with no external context — palette, composition rules, shape language, style constraints, and anti-patterns are all inlined. [`../STYLE.md`](../STYLE.md) exists as a reference for humans (me, future contributors), not as a dependency for the model. Duplication across prompts is intentional.

1. Pick a visual. Open its file.
2. Copy the full `Prompt` section (everything under `## Prompt` up to the next `##` heading).
3. Paste into ChatGPT Images 2.0. Use the size specified in the file's `Size` section (`1536x1024` for horizontal, `1024x1536` for vertical).
4. Every prompt requests **transparent background**. If the tool falls back to a solid `#1A1F2E` canvas, that's acceptable but transparent is preferred — it lets the visual composite cleanly over any dark surface in the docs.
5. If the first generation is close but not quite right, use the *Iteration notes* section in the same file. It has 4–6 specific follow-up deltas for likely problems.
6. Composite any **longer captions** (anything more than 3 words) in Figma / Keynote per the "Labels to add in post" section. Short in-image labels are already baked into the prompt itself and should render.
7. Export as transparent PNG at 2× for docs embedding.
8. Save into `../renders/` (create the directory when you have something worth keeping).

If a prompt doesn't produce anything usable after two rounds of iteration, fall back to the SVG / Figma build described in the prompt's "Fallback" section. None of these visuals depend on image generation working — the fallback specs are exact enough to build directly.

## Placement of final renders

Each prompt says where the visual should live in the docs once rendered. Generally:

- Visual #1 goes at the top of [`../../product/where-we-are.md`](../../product/where-we-are.md) in place of the current Mermaid sketch.
- Visual #2 goes in [`../../product/positioning.md`](../../product/positioning.md).
- Visual #3 goes in [`../../architecture/system-context.md`](../../architecture/system-context.md) or a new `understory.md` when it earns its keep.
- Visual #4 goes in [`../../architecture/canopy.md`](../../architecture/canopy.md) and [`../../architecture/dmz.md`](../../architecture/dmz.md).

## Not included (deliberately)

Four more visuals were considered (install model, cost ceiling, sprint timeline, agent layer topology). They drifted toward pitch-deck territory. Add them when there's a concrete reason, not speculatively.
