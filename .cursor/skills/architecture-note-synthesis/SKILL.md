---
name: architecture-note-synthesis
description: Turn a rough architecture fragment, transcript excerpt, or voice-note idea about Jungle3 into the right file(s) under docs/ — routed per CLAUDE.md §7, linked to the glossary, and without inventing detail. Use when the user drops in raw architectural thinking (a paragraph, a transcript, a research memo excerpt, a whiteboard-style idea) and it needs to land somewhere durable rather than stay in chat.
---

# architecture-note-synthesis

Synthesis pattern for taking raw Jungle3 architectural material and landing it in `docs/` without drift, duplication, or invention.

This skill exists because we've done this four times already: the positioning doc, the agent-layer doc, the DMZ doc + judging doc split, and the delivery-model capture that became ADR 0003. Each pass re-derived the same routing logic. Writing it down.

## When this skill applies

The user has given you:

- A transcript fragment or voice-note paragraph describing how some part of Jungle3 should work.
- A third-party research memo or analyst note (candidate for `docs/research/`).
- A half-formed architectural idea in chat that is actually load-bearing.
- An expansion of something that already lives in `doc.md` / `doc2.md` and is now ready to be refined.

Not applicable when:

- The material is a **decision** (closes off options, costly to reverse). That's `adr-author`.
- The material is a new **term** only. Glossary-only update; no synthesis needed.
- The material is repo-process guidance for agents. That belongs in `CLAUDE.md`, not `docs/`.

## The routing table (from CLAUDE.md §7)

Before writing, classify. Each fragment lands in exactly one destination; link from elsewhere rather than duplicating.

| Fragment shape | Destination |
| --- | --- |
| A noun / term definition | [`docs/glossary.md`](../../../docs/glossary.md) |
| How a layer, boundary, or interaction is shaped | `docs/architecture/<topic>.md` |
| How the product is framed (who, why, positioning) | `docs/product/<topic>.md` |
| A decision that closes off options | `docs/decisions/NNNN-slug.md` — use `adr-author` skill |
| An open question we haven't answered | `CLAUDE.md` §11 |
| Third-party analyst or research capture | `docs/research/researchN.md` with frontmatter |
| Raw strategic source material | Leave in `doc.md` / `doc2.md` — do not refine upward without purpose |

If a fragment spans multiple destinations, **split it** before writing. One concept per file.

## The workflow

Copy this checklist and work it top to bottom:

```
Synthesis progress:
- [ ] Step 1: Classify the fragment (term / architecture / product / decision / research / open question)
- [ ] Step 2: Check for existing coverage
- [ ] Step 3: Identify the glossary delta
- [ ] Step 4: Pick the target file (existing or new)
- [ ] Step 5: Draft — link, don't duplicate
- [ ] Step 6: Mark what the doc deliberately omits
- [ ] Step 7: Fix adjacent entropy
- [ ] Step 8: Confirm before writing new top-level files
```

### Step 1: Classify

Name the fragment's primary shape in one sentence before touching any file. If you cannot, the fragment is too raw — push back and ask the user for a narrower framing.

### Step 2: Check for existing coverage

Before creating anything, grep `docs/` for overlap. Existing refined docs to check against:

- [`docs/glossary.md`](../../../docs/glossary.md) — canonical terms
- [`docs/architecture/system-context.md`](../../../docs/architecture/system-context.md) — layer model
- [`docs/architecture/agent-layer.md`](../../../docs/architecture/agent-layer.md) — agent roles + response contract
- [`docs/architecture/dmz.md`](../../../docs/architecture/dmz.md) — DMZ three-layer model, security posture
- [`docs/product/positioning.md`](../../../docs/product/positioning.md) — product framing, subtraction principle
- [`docs/product/judging.md`](../../../docs/product/judging.md) — persona-driven judging

If the fragment **extends** an existing doc, edit in place. If it **contradicts** one, stop and raise it as an open question or ADR candidate — do not silently reconcile.

### Step 3: Identify the glossary delta

Every synthesis pass touches the glossary or proves it doesn't need to. Before writing prose, answer:

- Does this introduce a new term? → Add it to `glossary.md` in the same pass.
- Does this shift how an existing term is used? → Fix the glossary first, then propagate. This is the terminology-drift guard.
- Does it use a term the glossary doesn't yet name? → Add it. Do not write a paragraph that implicitly defines a new noun without defining it.

The glossary is the single source of truth. Other docs link to it; they do not redefine terms.

### Step 4: Pick the target file

Prefer editing an existing file over creating a new one. Create a new `docs/architecture/<topic>.md` or `docs/product/<topic>.md` only when:

1. The topic has enough substance to teach one clear thing on its own, AND
2. No existing doc is its natural home.

If uncertain between "extend existing" and "new file," extend existing. Splitting later is cheaper than consolidating scattered stubs.

Creating a new top-level file under `docs/architecture/` or `docs/product/` requires confirmation from the user per CLAUDE.md §13.

### Step 5: Draft — link, don't duplicate

Rules that keep synthesis from bloating the docs:

- **Link to the glossary** for any term on its first use in the doc, e.g. `[Understory](../glossary.md#understory)`.
- **Link across docs** instead of restating. `agent-layer.md` references the response contract in ADR 0002; it does not redefine it.
- **Short title + one-sentence purpose line** at the top. See the top of `agent-layer.md` for the shape.
- **Use the pattern** `## What this doc deliberately omits` at the bottom. This is where you park adjacent topics that don't belong here, so future readers don't mistake the doc for being incomplete.
- **Mermaid only when it teaches something prose can't** (CLAUDE.md §8). Decorative diagrams are worse than none.
- **No invented detail.** If the fragment doesn't say whether the Control Plane is Lambda or ECS, neither does your doc. Push it to `CLAUDE.md` §11 as an open question.

### Step 6: Mark what the doc deliberately omits

Every architecture doc in this repo ends with a `## What this doc deliberately omits` section. This is not boilerplate — it's the entropy-control mechanism. List adjacent topics, explain why they are not here, link to where they belong (or to `CLAUDE.md` §11 if they're not yet answered).

Examples from existing docs:

- `system-context.md` omits actors, AWS topology, agent specialists, Synthetic Runtime internals — each with a one-line why.
- `agent-layer.md` omits concrete tool implementations, operational agents, orchestrator internals, deployment diagrams.
- `dmz.md` omits AWS topology, auth mechanism, data-classification process, MVP scoping.

### Step 7: Fix adjacent entropy

While synthesizing, you'll notice drift. Fix it in the same pass, and tell the user:

- Terminology the glossary doesn't cover → add it.
- A stale reference to *Marketplace* (the Jungle3-concept sense), *Gallery*, or *Frankenstein app* → fix it per [ADR 0003](../../../docs/decisions/0003-installable-via-aws-marketplace.md) and [ADR 0004](../../../docs/decisions/0004-canonical-platform-vocabulary.md). Current canonical names: [DMZ](../../../docs/glossary.md#dmz) (exposure surface, absorbs former Gallery) and [Understory](../../../docs/glossary.md#understory) (baseline app, formerly Frankenstein).
- A concept defined in two places → collapse to one + links.
- An open question in `CLAUDE.md` §11 that your fragment just resolved → promote to an ADR (hand off to `adr-author`) or remove if the answer is already present in a doc.

### Step 8: Confirm before writing new top-level files

If your synthesis creates a new file under `docs/architecture/`, `docs/product/`, or `docs/decisions/`, surface the plan to the user first. Per CLAUDE.md §13 these are checkpoints.

Editing an existing file or adding to `docs/research/` does not require this checkpoint.

## Reference patterns

When the fragment is clearly product framing → model on `docs/product/positioning.md`: one-liner up top, product pillars mapped back to glossary terms near the bottom.

When the fragment is clearly an architectural layer or boundary → model on `docs/architecture/agent-layer.md` or `docs/architecture/dmz.md`: short purpose line, one core mental model, one Mermaid if it teaches, worked example if the contract is subtle, explicit omissions section.

When the fragment is product framing that hinges on an architectural affordance → likely two files: the product framing in `docs/product/`, the architectural affordance in `docs/architecture/`, each linking to the other. See `judging.md` ↔ `dmz.md`.

When the fragment is a third-party memo → `docs/research/researchN.md` with the frontmatter convention in [`docs/research/README.md`](../../../docs/research/README.md). Do not adopt its specific recommendations into refined docs until an ADR consumes them.

## Anti-patterns

- **Inventing architecture detail** to make a doc feel complete. Leave gaps; name them as omissions.
- **Duplicating a glossary entry** inside an architecture doc "for convenience." Link instead.
- **Creating empty scaffolding** (`docs/architecture/control-plane.md` as a stub) because the topic "should exist." Create the file the first time there is real material.
- **Editing `doc.md` or `doc2.md`** to fold synthesized content back in. They are raw source; refined material goes to `docs/`.
- **Burying a decision inside an architecture doc.** If the fragment is a decision, stop and use `adr-author` instead.

## Done criteria

A synthesis pass is complete when:

- [ ] The fragment lives in exactly one place in `docs/` (or is explicitly logged as an open question in `CLAUDE.md` §11).
- [ ] Glossary is consistent with the new prose — no new terms used without being defined there.
- [ ] All cross-references link to canonical locations rather than re-stating.
- [ ] The target doc has a `deliberately omits` section naming the nearby topics you did not cover.
- [ ] No invented architectural detail. Any gap is either linked to §11 or absent by choice.
- [ ] Adjacent entropy noticed during the pass is either fixed in the same commit or flagged to the user.
