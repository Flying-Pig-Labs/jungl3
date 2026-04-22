# 0011 — Canopy is the human exposure surface; DMZ is the AI evaluation surface

**Status:** Accepted (supersedes the Gallery-into-DMZ rider of [ADR 0004](./0004-canonical-platform-vocabulary.md))
**Date:** 2026-04-22

> **Supersession note.** ADR 0004 retired *Gallery* and folded its meaning into *DMZ*, on the premise that judging and exposure were the same surface. Subsequent work on synthetic user testing (see [`../research/synthetic-user-testing/`](../research/synthetic-user-testing/)) made clear they are not: AI agents stress-testing a prototype and humans encountering it are two different surfaces with two different security postures, two different audiences, and two different failure modes. This ADR re-splits them cleanly, under different names than before.

## Context

Three forces made the one-surface-called-DMZ framing untenable.

First, the v1 domain is insurance claims ([ADR 0006](./0006-v1-domain-anchor-insurance-claims.md)). A claims-processing prototype written in a sprint, against a synthetic Understory, by an un-certified team, is a prototype whose UI text is untrusted — an AI agent clicking through it is exposed to prompt injection from the prototype's own rendered content (see [`../research/synthetic-user-testing/RISKS.md`](../research/synthetic-user-testing/RISKS.md) R1). An AI pre-pass and a human judge have incompatible threat models; they cannot safely share one surface.

Second, the synthetic-user-testing research surfaced a broader role for AI-driven probing: roast den, focus group, chaos monkey, pressure tester — a dense, cheap, fast evaluation loop that runs *before* humans see the prototype. That role is not listing or judging. It is evaluation under adversarial conditions.

Third, the Gallery-into-DMZ merge in [ADR 0004](./0004-canonical-platform-vocabulary.md) was a simplification that cost real explanatory power once these two roles existed. Collapsing them hid a sequence (AI first, humans after) and a posture difference (private hardened environment vs public-ish exposure) that both matter.

## Decision

Two exposure surfaces, named and ordered:

**1. DMZ (redefined): AI-first evaluation environment.** The **DMZ** is a secure, private environment where AI agents — acting as personas, fuzzers, pressure testers, chaos monkeys, focus-group facsimiles — interact with a prototype. Humans do not enter the DMZ. The DMZ is tightly isolated: no outside human traffic, no path to production, no shared data with the customer's enterprise. Its job is to surface defects, misuse paths, and persona-specific failures cheaply and at volume, before a prototype is shown to anyone.

**2. Canopy (new): human exposure surface.** The **Canopy** is the externally reachable surface where humans — judges, beta users, stakeholders, invited outsiders — find, try, and judge prototypes. The Canopy inherits the outward posture of the old DMZ: public-ish in access, private in blast radius, behind the customer's ALB, under the customer's DNS apex, carrying only synthetic or explicitly-scrubbed data. The listing/discovery surface inside the Canopy is called the **Gallery** — reintroduced as a sub-concept of the Canopy, not as a peer.

**Flow.** A prototype deploys from its Jungle to its DMZ first, passes whatever AI evaluation gates are configured, and is promoted from the DMZ to the Canopy for human interaction. The DMZ and the Canopy are different environments, not different views on one environment.

**Naming rationale (brief).** The forest metaphor already names the living application layer ([*Understory*](../glossary.md#understory)). *Canopy* names the outward-facing layer — what the forest shows to the sky. It is the surface outsiders see. It matches the shape.

## Consequences

**Enables:**

- A cheap, dense AI evaluation loop ahead of any human exposure. Prototypes get stress-tested by agents at a volume and speed no human panel can match.
- A clean security story for each surface. The DMZ can be hardened against an AI threat model (prompt-injection containment, tool-use scoping, credential isolation); the Canopy is hardened against a human-exposure threat model (WAF, auth, rate limiting). One surface trying to be both was always going to underserve one of them.
- A re-introduction of *Gallery* as useful, narrower vocabulary: the listing/discovery UI *inside* the Canopy.
- A sequence (DMZ → Canopy) that external-audience narratives can lean on: "we test with agents first, then humans." That maps cleanly onto enterprise expectations for staged promotion.

**Forecloses:**

- Using *DMZ* in its old sense (the single public-ish exposure surface). That meaning moves to *Canopy*.
- Using *Gallery* as a retired term. It returns, scoped to the Canopy.
- A single-surface model. Any future argument for collapsing DMZ and Canopy again has to overcome the threat-model separation established here.

**Accepts:**

- A cross-reference sweep across `docs/`, `CLAUDE.md`, and all author-owned research files. Frozen captures (`doc.md`, `doc2.md`, `docs/research/research*.md`, sideband captures) are not edited; readers substitute per this ADR.
- Two surfaces cost more to provision than one. The Control Plane must vend a DMZ and a Canopy per prototype (or per Jungle; concrete topology is a follow-on open question — see [`../../CLAUDE.md`](../../CLAUDE.md) §11). Teardown and lifecycle complexity roughly doubles.
- Part of [ADR 0004](./0004-canonical-platform-vocabulary.md) is superseded — specifically the "Retire Gallery; merge its meaning into DMZ" rider. ADR 0004's other two changes (Frankenstein App → Understory; promote Substrate) stand unchanged.
- The network-DMZ analogy that justified the old *DMZ* name is weaker for the new (AI-only) meaning. "DMZ" is kept anyway because the hardened-isolated-zone shape still fits, and because a fresh term would cost more than reusing the familiar one in a narrower role.

## Cross-references to update

Tracked here so the sweep is discoverable:

- [`../glossary.md`](../glossary.md) — rewrite the *DMZ* entry; add *Canopy*; add *Gallery* (scoped inside Canopy).
- [`../architecture/dmz.md`](../architecture/dmz.md) — rewrite around the AI-evaluation role; cite `synthetic-user-testing/` as evidence base; narrow the experience layer.
- `docs/architecture/canopy.md` — new file. Content inherits most of the old `dmz.md` (three-layer model, public-ish/private-blast-radius posture, seeded personas for humans, AWS-topology open questions, the Gallery sub-surface).
- [`../architecture/system-context.md`](../architecture/system-context.md) — diagram gains a *Canopy* node; the *DMZ* node narrows; add a DMZ→Canopy arrow for promotion.
- [`../product/judging.md`](../product/judging.md) — judging happens in the Canopy, not the DMZ.
- [`../product/positioning.md`](../product/positioning.md) — pillar table: "One exposure surface" becomes "Canopy for humans, DMZ for agents."
- [`../architecture/agent-layer.md`](../architecture/agent-layer.md) — the Listing specialist reads the Canopy's Gallery; the Environment specialist sees both surfaces.
- [`./0003-installable-via-aws-marketplace.md`](./0003-installable-via-aws-marketplace.md) — header note that the *DMZs, Gallery* phrasing is now superseded (DMZs and Canopies; Gallery is inside the Canopy).
- [`./0004-canonical-platform-vocabulary.md`](./0004-canonical-platform-vocabulary.md) — status line updated to reflect partial supersession by 0011.
- [`./README.md`](./README.md), [`./STATUS.md`](./STATUS.md), [`./BACKLOG.md`](./BACKLOG.md) — index + surface updates.
- [`../research/synthetic-user-testing/`](../research/synthetic-user-testing/) — SYNTHESIS, CANDIDATES, RISKS re-read in light of the new DMZ definition; UST-C1 (synthetic-user-tester placement) is partially resolved (DMZ, by definition).
- [`../research/README.md`](../research/README.md) — link to this ADR; note the vocabulary change.
- [`../research/findings.md`](../research/findings.md) — terminology sweep.
- [`../../CLAUDE.md`](../../CLAUDE.md) §2 (one-line summary), §4 (subdir table — `dmz/` joined by `canopy/`), §10 (skill candidates), §11 (open-question phrasings).
- Research captures (`doc.md`, `doc2.md`, `docs/research/research*.md`, `sideband-*/*.md`, pre-existing frozen files) — **not edited.** Readers substitute mentally.
- Website `src/` — Lovable-owned. Called out for the next Lovable prompt; not edited here.

## Alternatives considered

- **Keep one surface, call it DMZ.** The status quo before this ADR. Rejected because the AI-agent and human-judge threat models are incompatible on one surface, and because collapsing the two hides a real sequencing claim (agents first, humans after) that the product actually wants to make.
- **Introduce *Canopy* but keep the old DMZ meaning, and call the new AI surface something else ("Harness," "Sandbox," "Anvil").** Considered. Rejected: the AI surface genuinely is a hardened isolated zone, which is what "DMZ" names. The word already exists in the vocabulary; repurposing it is cheaper than introducing a new term for the hardened-zone role and finding a new name for the outward-facing role. The rename lands squarely on what changed.
- **Promote *Gallery* back to a first-class peer of DMZ and Canopy.** Rejected. Gallery is a surface *inside* the Canopy (a listing UI); it is not a separate environment. First-class status would re-introduce the three-noun confusion ADR 0004 was trying to solve.
- **Delete the DMZ concept entirely and put AI evaluation inside the Jungle.** Considered because a Jungle is already isolated. Rejected because a Jungle is a *build* surface with looser isolation (builders need broad access). An AI-evaluation surface needs tighter isolation than the Jungle provides and a different lifecycle (spun up per evaluation run, not held open for the sprint).
- **Skip the rename; land only the behavioral split.** Considered. Rejected because ADR 0004 explicitly names DMZ as "the single exposure surface" — continuing to call the AI surface "DMZ" while *also* calling the human surface "DMZ" would contradict 0004 in plain reading. The rename is the change.
