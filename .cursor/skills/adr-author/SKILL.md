---
name: adr-author
description: Write a new Architecture Decision Record for Jungle3 under docs/decisions/, matching the Nygard-trimmed format established by ADRs 0001–0003. Use when a decision has been made that closes off options, resolves an open question from CLAUDE.md §11, or makes a choice costly to reverse — and the decision is ready to be pinned rather than left ambient in chat.
---

# adr-author

Pattern for writing a new ADR in this repo. Calibrated to the voice and shape of ADRs 0001 (Lovable owns repo root), 0002 (sub-agent response contract), and 0003 (installable via AWS Marketplace).

## When this skill applies

Write an ADR when a choice:

- shapes the system in a way that would be costly to reverse,
- closes off a set of future options,
- resolves an open question from [`CLAUDE.md`](../../../CLAUDE.md) §11, or
- encodes a convention that future contributors (human or agent) need to discover by reading — not by archaeology.

Do **not** write an ADR for:

- implementation details that will change weekly,
- style preferences,
- things that haven't actually been decided (those stay in §11),
- a synthesis of existing architecture (that's `architecture-note-synthesis`).

If unsure whether the material is a decision, ask the user: "Is this decided, or is it a recommendation?" A recommendation goes to `docs/research/` or §11; a decision goes here.

## Required reading before drafting

- [`docs/decisions/README.md`](../../../docs/decisions/README.md) — the format spec, filename convention, and supersession rules.
- The three existing ADRs, for voice:
  - [`0001-lovable-owns-repo-root.md`](../../../docs/decisions/0001-lovable-owns-repo-root.md)
  - [`0002-sub-agent-response-contract.md`](../../../docs/decisions/0002-sub-agent-response-contract.md)
  - [`0003-installable-via-aws-marketplace.md`](../../../docs/decisions/0003-installable-via-aws-marketplace.md)

Do not deviate from the established shape. ADRs are boring on purpose.

## The workflow

```
ADR progress:
- [ ] Step 1: Confirm this is a decision, not a recommendation
- [ ] Step 2: Draft the ADR text and surface for user approval BEFORE writing the file
- [ ] Step 3: Pick the next number + slug
- [ ] Step 4: Write the file
- [ ] Step 5: Update docs/decisions/README.md index
- [ ] Step 6: Resolve the §11 open question (if any)
- [ ] Step 7: Propagate terminology / consequence edits across docs
- [ ] Step 8: Supersede any ADR this one overrides
```

### Step 1: Confirm this is a decision

One sentence: what is being decided? If you can't say it, it's not ready.

Decisions that are foundational (delivery model, response contracts, tenancy shape, the Lovable boundary) **must be drafted for user approval before the file is written.** This is a repo rule, not an optional courtesy.

### Step 2: Draft the ADR text first; surface for approval

Draft the full ADR body in chat using the template below. Get explicit user approval on the wording before creating the file. The user has corrected drafts in previous ADR passes; building in that checkpoint is cheaper than rewriting committed text.

### Step 3: Number and slug

- Number is `NNNN`, zero-padded, monotonic. Check `docs/decisions/` for the current max and add one. Never reuse a number.
- Slug is kebab-case, ≤ 6 words, names the **decision** not the topic. Examples:
  - Good: `installable-via-aws-marketplace` — names what was decided.
  - Bad: `delivery-model` — names the topic, not the choice.
  - Good: `sub-agent-response-contract` — names the artifact the decision pins.
  - Bad: `agents` — too vague.

### Step 4: Write the file

Filename: `docs/decisions/NNNN-short-slug.md`. Use this template exactly — sections in this order, no extras:

```markdown
# NNNN — Title

**Status:** Accepted
**Date:** YYYY-MM-DD

## Context

What situation forced a decision? What constraints mattered? Include links
to the open question in CLAUDE.md §11 (if any) and any research or docs
that informed the decision.

## Decision

What did we choose? Stated plainly. Short. A reader should be able to tell
someone else the decision in one sentence after reading this section.

## Consequences

**Enables:**
- Bullet. What becomes possible or easier.

**Forecloses:**
- Bullet. What options this rules out.

**Accepts:**
- Bullet. Pain or constraint the decision carries. Be honest.

## Alternatives considered

- **Alternative name.** One-to-three sentences on what it was and why rejected.
- **Alternative name.** Same.
```

Voice rules distilled from 0001–0003:

- **Short sections.** If it reads like an essay, it's wrong. An ADR under a page is a good ADR.
- **Plain statement in Decision.** "Each platform domain lives in its own top-level subdirectory of the repo — except the website." Not "We have chosen, after deliberation, to adopt a convention whereby…"
- **Enables / Forecloses / Accepts** — use these exact three sub-headings under Consequences. They are the discipline of the format.
- **No headings like "Background," "Rationale," "Discussion," "Implementation notes."** If it doesn't fit Context / Decision / Consequences / Alternatives, it's in the wrong section.
- **One decision per ADR.** If the draft contains two, split it. (ADR 0003's terminology rename rides along because it's a direct mechanical consequence of the primary decision; that's the bar for a rider, not the norm.)
- **Link to canonical locations** — glossary terms, architecture docs, `CLAUDE.md` §11. Do not restate material that lives elsewhere.

### Step 5: Update the index

Add one row to the index table at the bottom of [`docs/decisions/README.md`](../../../docs/decisions/README.md):

```markdown
| [NNNN](./NNNN-short-slug.md) | Accepted | Title phrase |
```

Keep rows in numeric order. Do not reorganize the table.

### Step 6: Resolve the §11 open question

If the ADR resolved an item in `CLAUDE.md` §11:

- Remove the item from §11.
- If the ADR happens to open new sub-questions (as ADR 0003 did), add them to §11 in the same pass under the appropriate heading.

Never leave a §11 item that a new ADR has resolved — that is exactly the drift the file is supposed to prevent.

### Step 7: Propagate consequences

An ADR often requires edits elsewhere to stay consistent with the decision:

- **Terminology renames** (e.g. ADR 0003: Marketplace → Gallery; ADR 0004: Frankenstein app → Understory, Gallery → folded into DMZ, Substrate promoted) → sweep `docs/`, `CLAUDE.md`, and cross-reference the Lovable-owned website paths separately under the §3 boundary.
- **New constraints on agents or skills** → update `CLAUDE.md` §10 watchlist or existing skills.
- **New authoritative reference** → link from the glossary entry or architecture doc it pins. ADR 0002 is linked from `glossary.md#agent-layer` and from `architecture/agent-layer.md`.
- **Follow-on open questions** → add to `CLAUDE.md` §11.

Do all of this in the same commit as the ADR so the tree is coherent at every SHA.

### Step 8: Supersede, don't delete

If the new ADR overrides an older one:

1. Leave the old ADR's body untouched.
2. Edit only its `**Status:**` line to `Superseded by NNNN`.
3. Add a note at the top of the new ADR's Context linking back to the superseded one.

History matters. Never delete an ADR.

## Anti-patterns

- **Writing the file before getting approval on the text.** Foundational decisions require draft-first-then-write. See CLAUDE.md and prior-session pattern.
- **Padding the ADR with synthesis.** If the Context section is teaching architecture, that architecture belongs in `docs/architecture/` first; the ADR should link to it.
- **Hedged Decision sections.** "We will probably…" or "We are leaning toward…" means it is not a decision yet. Put it back in §11.
- **Skipping Alternatives considered.** Future readers need to know what you ruled out; otherwise they'll re-propose it. Even a one-liner per alternative is fine.
- **Multi-decision ADRs.** Split them. A rider (like the terminology rename in 0003) is only acceptable when it is a mechanical, unavoidable consequence of the primary decision.
- **Updating the index without the file, or the file without the index.** Both in the same commit.
- **Forgetting to sweep §11 and the glossary.** An ADR that doesn't propagate is inviting drift.

## Done criteria

An ADR pass is complete when:

- [ ] User explicitly approved the draft text before file creation (for foundational decisions).
- [ ] File exists at `docs/decisions/NNNN-short-slug.md` with all four sections.
- [ ] Status line reads `Accepted` and the date is filled.
- [ ] The index in `docs/decisions/README.md` has a new row.
- [ ] The resolved §11 item (if any) is removed; new open sub-questions are added.
- [ ] Terminology, glossary, and cross-references are consistent with the new decision across `docs/` and `CLAUDE.md`.
- [ ] Any superseded ADR has its status line updated; its body is untouched.
- [ ] Changes are accumulated, not committed, until the user says so.
