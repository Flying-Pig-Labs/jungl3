# 0004 — Canonical platform vocabulary: Understory, Substrate, DMZ-absorbs-Gallery

**Status:** Accepted, with the *DMZ-absorbs-Gallery* rider superseded by [ADR 0011](./0011-canopy-and-ai-first-dmz.md). Supersedes part of [ADR 0003](./0003-installable-via-aws-marketplace.md).
**Date:** 2026-04-21

> **Partial supersession note.** This ADR landed three vocabulary changes together: (1) Frankenstein App → Understory, (2) promote *Substrate*, (3) retire *Gallery* and fold it into *DMZ*. Changes (1) and (2) stand unchanged. Change (3) is superseded by [ADR 0011](./0011-canopy-and-ai-first-dmz.md), which re-splits the single-exposure-surface model into a DMZ (AI evaluation, narrowed from the meaning below) and a Canopy (human exposure, inheriting the outward posture this ADR assigned to DMZ), and reintroduces Gallery as the listing UI *inside* the Canopy. Read the *DMZ* and *Gallery* discussions below as historical; current vocabulary is pinned in ADR 0011.

## Context

Three pressures converged on the platform's naming.

First, *Frankenstein App* — the canonical name for the pre-built operational slice inside a Jungle — reads as unserious on a CTO-facing surface. It is distinctive and memorable, and those properties are real assets. They are outweighed, on sales and diligence surfaces, by the tonal cost. A name that makes a buyer hesitate before asking their next question is a name that is costing the product money.

Second, the layer the Jungle sits on — the AWS primitives (networking, identity, storage, compute, observability) — has never had a first-class name. The glossary and the architecture docs refer to it only obliquely, which leaves a real concept un-named and forces each document to re-describe it. A CTO asks "what am I installing that my platform team has to operate, versus what sits inside the install as product?" and the current vocabulary answers only the second half.

Third, [ADR 0003](./0003-installable-via-aws-marketplace.md) separated **DMZ** (exposure runtime) from **Gallery** (discovery and judging surface). In practice the two are the same thing to anyone outside the team: the place where a prototype becomes visible is also the place where it gets tried and judged. Keeping them separate added a distinction without a use — one that every external-audience document then had to explain.

The three pressures resolve together, not separately. The Understory rename establishes a stratum pair (Substrate below, Understory above) that names the previously-implicit primitives layer on the way through. The Gallery-into-DMZ merge simplifies the external-audience story in the same pass. One ADR, three changes.

## Decision

Three vocabulary changes, landed together.

**1. Rename Frankenstein App → Understory.** The pre-built operational baseline inside a Jungle is now the **Understory**. The name reflects its role as the living layer that a team's own work grows on top of. The Understory ships complete enough to be useful on day one — real users, real data, real events, real audit trail, multiple integrations already wired — so that teams start from a living template rather than a blank scaffold. Teams shape it by addition, substitution, or selective removal; subtraction remains a primary motion but is no longer the only one.

**2. Promote Substrate as a new first-class noun.** **Substrate** names the AWS primitives the Jungle sits on: networking, identity, storage, compute, observability. Previously implicit in architecture docs; now named. Substrate is *what the customer's platform team operates*; Understory is *what ships inside the install as product*. The distinction is the one a CTO asks about before buying.

**3. Retire Gallery; merge its meaning into DMZ.** There is now one exposure surface, called the **DMZ**. A prototype is loaded into the DMZ and, by being there, is available for external judging, testing, and demo. Everything else — Jungle, Understory, Substrate, Agent Layer, Synthetic Runtime, Control Plane — stays hidden inside the customer's install. The DMZ is the one window out.

**Canopy** was considered as a fourth first-class noun and rejected. Every candidate role for it was already named by an existing concept. "Canopy" can still appear in voice copy ("your team's canopy grows on the Understory") as a metaphor without being promoted to a platform term.

## Consequences

**Enables:**

- A cleaner external-audience story. Sales, procurement, and diligence surfaces reference one exposure surface (DMZ) and one pre-built baseline (Understory), both of which land without explanation for the target audience.
- A first-class name (Substrate) for the operator-facing layer, which the CTO-persona procurement conversation needs.
- Stratum vocabulary (Substrate below, Understory above) that maps cleanly to how a CTO already thinks about cloud infrastructure — primitives underneath, application layer above.

**Forecloses:**

- Using *Frankenstein App* as canonical vocabulary in refined docs. The name remains in frozen research captures and in `doc.md` / `doc2.md`, which are historical source material; new writing uses *Understory*.
- Using *Gallery* as a canonical noun. The word still appears in frozen research captures and in ADR 0003 (which names it for historical reasons); new writing uses *DMZ*.
- Promoting Canopy to a first-class concept later without revisiting this ADR.

**Accepts:**

- A cross-reference sweep. Every occurrence of *Frankenstein App* and *Gallery* in refined docs (`docs/glossary.md`, `docs/architecture/`, `docs/product/`, `CLAUDE.md`, decision records) must be updated. Frozen captures (research files, `doc.md`, `doc2.md`) are not edited; a reader encountering old terms there should mentally substitute per this ADR.
- A minor softening of the repo's "subtraction over addition" principle. `CLAUDE.md` §1 previously stated that the primary development motion is subtraction. The Understory framing admits that teams also *add* and *substitute* — the Understory is a living template, not only an over-complete one to be trimmed. Subtraction remains a first-class motion; it is no longer the sole one. `CLAUDE.md` §1 gets a small companion edit in the same sweep.
- The stratum metaphor does not extend beyond Substrate / Understory. Other nouns (Jungle, DMZ, Agent Layer, Synthetic Runtime, Control Plane) stay flat. The forest-strata metaphor is a tool, not a system; it earns its place only where a layered concept was already there.
- Part of [ADR 0003](./0003-installable-via-aws-marketplace.md) is superseded. Specifically, 0003's paragraph introducing *Gallery* as a rename of *Marketplace* stands as historical record of the *Marketplace* retirement; the *Gallery* name it introduced is itself now retired. Both intermediate commits of work (the Marketplace → Gallery rename, and the Gallery-in-website edits) remain valid history and are not reverted.

## Cross-references to update

Tracked here so the sweep is discoverable:

- `docs/glossary.md` — rename the *Frankenstein app* entry to *Understory*, add a *Substrate* entry, expand the *DMZ* entry to absorb the judging/discovery role, remove the *Gallery* entry. Update all cross-references within the glossary.
- `docs/product/positioning.md` — update the pillar-to-concept mapping table (Gallery row, Frankenstein app rows).
- `docs/architecture/system-context.md` — acknowledge the Substrate / Understory strata inside the Jungle block, and remove the separate Gallery callout if present.
- `docs/architecture/dmz.md` — becomes the home for what was previously split between DMZ runtime and Gallery surface. The three-layer model (builder, pipeline, experience) is retained; the experience layer now explicitly includes the judging/discovery role.
- `docs/architecture/agent-layer.md` — terminology sweep.
- `docs/decisions/0003-installable-via-aws-marketplace.md` — add a header note that part of this ADR is superseded by 0004. Do not rewrite its body.
- `CLAUDE.md` — §1 principle softening, §11 items that reference Frankenstein App or Gallery, any section introducing the canonical nouns.
- Research captures (`docs/research-archive/first-generation/research1-aws-installable-shape.md`, `docs/research-archive/first-generation/research2-v1-service-build-plan.md`) — **not edited**. Captures are frozen. A reader should mentally substitute Understory for Frankenstein App and DMZ for Gallery per this ADR.
- `doc.md`, `doc2.md` — **not edited**. Historical transcripts. Already marked as pre-ADR-0003 in prior commits; the same mental substitution applies.
- Website `src/` — separate commit, after the doc sweep lands. Section components currently reference "DMZ Gallery," "Marketplace," and "Frankenstein App"-adjacent copy in places. Terminology will sweep to Understory / Substrate / DMZ.

## Alternatives considered

- **Keep Frankenstein App.** The name is distinctive and sticky, and the glossary genuinely likes it. Rejected because the CTO-audience cost is real and the product is now sold, not only built. Distinctiveness is not worth undermining a diligence surface.
- **Name Canopy as a first-class layer.** Considered for three candidate roles: *team's own services*, *networking layer*, *control plane*. The first is too soft to name (a team's own work is just "the team's work"); the second overlaps Substrate; the third would retire "Control Plane," a term every CTO already knows. All three rejected. Canopy stays as voice, not noun.
- **Keep Gallery separate from DMZ.** Defensible in theory — *inside-the-install discovery* vs *exposed runtime* is a real distinction. Rejected because the distinction costs more to explain than it earns on any current surface: sales, diligence, or implementation. If the distinction becomes load-bearing later, a new ADR can reintroduce it under a different name.
- **Do only the Understory rename, defer Substrate and Gallery.** Smaller change, safer. Rejected because the three changes share a theme (layered model, one exposure surface) and splitting them into three ADRs would fragment a single coherent move into three readers-have-to-assemble-this-themselves decisions. One ADR, three changes, one sweep.
- **Edit the frozen research captures to use new vocabulary.** Rejected. Captures are frozen per `docs/research/README.md`. A reader encountering old terms should use this ADR as the substitution key.
