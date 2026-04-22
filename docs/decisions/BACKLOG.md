# Candidate ADR backlog

**Purpose.** Single, decision-oriented view of every candidate ADR across the three research clusters. Investors, reviewers, and future maintainers can read this file and know exactly what's decided, what's next, and what's parked.

**This is not policy.** Candidates become policy only through ADRs accepted in [`./`](./). The clusters in [`../research/`](../research/) produced these candidates; this file lifts them into one place.

**Companion files.**

- [`STATUS.md`](./STATUS.md) — one-page accepted + pending + open view (investor appendix).
- [`README.md`](./README.md) — ADR format, filename convention, index of accepted ADRs.
- Per-cluster candidate and risk files linked below.

---

## At a glance

**Accepted ADRs:** 10 (0001–0010).
**Candidates across clusters:** 21 total — 4 resolved (promoted to accepted ADRs), 17 pending.
**Pending breakdown by readiness:** 5 High / 6 Medium / 6 Low-or-scoping.
**Open decisions tracked in [`../../CLAUDE.md`](../../CLAUDE.md) §11:** 22.

---

## Pending candidates, by readiness

### High readiness (ready to draft next)

Drafting these is not blocked on new research. Each has a concrete shape, named sources, and a bounded decision.

| # | ID | Title | Origin | Depends on | Closes §11 |
|---|---|---|---|---|---|
| 1 | [C2-C](../research/deep-research-2026-04-22/CANDIDATES.md#c--retention-tiering-cloudwatch--s3--glacier-deep-archive) | Retention tiering (CloudWatch → S3 → Glacier Deep Archive) | Cluster 2, reports 01 + 02 | [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md) | — |
| 2 | [C2-B](../research/deep-research-2026-04-22/CANDIDATES.md#b--seed-data-generation-pre-generated-shipped-as-immutable-artifact) | Seed-data generation: pre-generated, shipped as immutable artifact | Cluster 2, report 08 | [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md), [ADR 0009](./0009-audit-trail-is-append-only-hash-chained.md) | #24 |
| 3 | [UST-C2](../research/synthetic-user-testing/CANDIDATES.md#c2--pre-human-pass-framing) | Pre-human pass vs. replacement framing | Cluster 4, report 03 | — | — |
| 4 | [UST-C3](../research/synthetic-user-testing/CANDIDATES.md#c3--planner-executor-split-for-browser-capable-agents) | Planner-Executor split for browser-capable agents | Cluster 4, reports 02 + 04 | UST-C1 | — |
| 5 | [UST-C4](../research/synthetic-user-testing/CANDIDATES.md#c4--persona-schema-pinned) | Persona schema pinned (6-point) | Cluster 4, report 03 | UST-C1 | — |

### Medium readiness (scoping call first, then drafting)

Each has a real scope decision to make before the ADR can be written. Scope is typically a single named question.

| # | ID | Title | Scope question | Origin | Closes §11 |
|---|---|---|---|---|---|
| 6 | [C1-E](../research/deep-research-2026-04-21/CANDIDATES.md#e--extension-architecture-minimal-core--versioned-packs) | Extension architecture (minimal core + versioned packs) | Pack-boundary shape: service-level vs data-and-workflow-level | Cluster 1, report 12 | informs #2, #3 |
| 7 | [C2-D](../research/deep-research-2026-04-22/CANDIDATES.md#d--document-integrity-application-layer-sha-256-hashing-of-supporting-documents) | Document integrity (application-layer SHA-256) | What counts as a "supporting document" in v1 | Cluster 2, report 03 | — |
| 8 | [C2-E](../research/deep-research-2026-04-22/CANDIDATES.md#e--regulatory-surface-for-v1-insurance-claims) | Regulatory surface for v1 insurance claims | How many of the 5 cues are minimum-viable | Cluster 2, report 09 | #22 |
| 9 | [C2-F](../research/deep-research-2026-04-22/CANDIDATES.md#f--canonical-v1-maker-checker-workflow) | Canonical v1 maker-checker workflow ($47,500 settlement) | Authority-level thresholds; best drafted with a design partner | Cluster 2, report 03 | #16 |
| 10 | [UST-C1](../research/synthetic-user-testing/CANDIDATES.md#c1--synthetic-user-tester-placement) | Synthetic-user-tester placement | Agent-Layer specialist vs top-level domain vs DMZ primitive; also: do we do this at all in v1 | Cluster 4, reports 03 + 04 | informs #18 |
| 11 | [UST-C5](../research/synthetic-user-testing/CANDIDATES.md#c5--persona-reasoning-traces-as-audit-events) | Persona reasoning traces as audit events | Do reasoning traces chain through the audit; PII-leakage-via-CoT posture | Cluster 4, report 03 | — |

### Low-readiness (scoping, amendment, or deferral)

These are either refinements of existing ADRs, blocked on scoping that other candidates would resolve, or explicit deferrals.

| # | ID | Title | Why low | Origin |
|---|---|---|---|---|
| 12 | [C1-B](../research/deep-research-2026-04-21/CANDIDATES.md#b--minimum-viable-realism-threshold) | Minimum viable realism threshold | Needs stress-test pass against [ADR 0006](./0006-v1-domain-anchor-insurance-claims.md) shape | Cluster 1, reports 01 + 03 + 10 |
| 13 | [C1-D](../research/deep-research-2026-04-21/CANDIDATES.md#d--v1-custom-admin-surface-scope) | v1 custom admin surface scope | Partially resolved by [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md); remaining: view set, Agent-Layer relationship | Cluster 1, reports 08 + 09 |
| 14 | [C2-G](../research/deep-research-2026-04-22/CANDIDATES.md#g--adr-0009-amendments-chain-on-write-document-hashes-extension-schemas) | ADR 0009 amendments (chain-on-write, doc hashes, extension schemas) | Better as amendment than new ADR; partially subsumed if C2-D lands | Cluster 2, reports 03 + 05 + 09 + 10 |
| 15 | [UST-C6](../research/synthetic-user-testing/CANDIDATES.md#c6--marketplace-pricing-model-v1) | Marketplace pricing model v1 | Business decision, not research-gated; closes §11 #1 | Cluster 4, Marketplace guide |
| 16 | [UST-C7](../research/synthetic-user-testing/CANDIDATES.md#c7--marketplace-stack-structure) | Marketplace stack structure | Entangled with C1-E (extension architecture); closes §11 #2 | Cluster 4, Marketplace guide |

**Note on 16 (UST-C7).** C1-E (extension architecture) and UST-C7 (Marketplace stack structure) should be drafted together or in sequence; the pack boundary answer and the CloudFormation stack structure answer are the same decision in two venues.

---

## Resolved candidates (archive)

For completeness. These were named as candidates by a cluster and have since been promoted to accepted ADRs.

| ID | Title | Resolved by |
|---|---|---|
| [C1-A](../research/deep-research-2026-04-21/CANDIDATES.md#a--v1-domain-anchor) | v1 domain anchor (insurance vs chargebacks) | [ADR 0006](./0006-v1-domain-anchor-insurance-claims.md) |
| [C1-C](../research/deep-research-2026-04-21/CANDIDATES.md#c--event-envelope-and-correlation-id-model) | Event envelope and correlation-ID model | [ADR 0005](./0005-event-envelope-and-correlation-identifiers.md) |
| [C1-F](../research/deep-research-2026-04-21/CANDIDATES.md#f--v1-cost-profile-and-default-cost-controls) | v1 cost profile and default cost controls | [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md) |
| [C2-A](../research/deep-research-2026-04-22/CANDIDATES.md#a--seeder-and-reaper-patterns-for-10m-install-and-5m-teardown) | Seeder and Reaper patterns | [ADR 0010](./0010-seeder-and-reaper-patterns.md) |

---

## Suggested drafting order

The research itself suggested an order for cluster 2's follow-ons and the synthetic-user-testing drop left the order open. Combined across clusters, the recommended next-up sequence:

1. **C2-C (retention tiering).** Short, high-confidence, closes an active cost-compound risk ([R-C2-4](../research/deep-research-2026-04-22/RISKS.md#r-c2-4--cloudwatch-retention-default-compounds-past-cost-ceiling)) before it compounds in real installs.
2. **C2-B (pre-generated seed artifact).** Unblocks the Marketplace-listing build pipeline; resolves [R-C2-3](../research/deep-research-2026-04-22/RISKS.md#r-c2-3--live-llm-seed-generation-breaks-budget--determinism) and closes [§11 #24](../../CLAUDE.md).
3. **UST-C2 (pre-human pass framing)** **or** **UST-C1 (synthetic-user-tester placement).** These are the gating decisions for the synthetic-user-testing thread. Pick UST-C2 first if you want to answer the product framing question; UST-C1 if you want to answer the "where does the code live" question. They're coupled but either is a valid entry point.
4. **C2-E (regulatory surface).** Scoping pass first ([§11 #22](../../CLAUDE.md)). Highest product-credibility payoff among the remaining open candidates.
5. **C1-E (extension architecture) + UST-C7 (Marketplace stack structure).** Draft as a pair. Together they close [§11 #2](../../CLAUDE.md) and position Marketplace upgrade strategy ([§11 #3](../../CLAUDE.md)).
6. **UST-C6 (Marketplace pricing).** Closes [§11 #1](../../CLAUDE.md). Business call; needs investor/partner input more than research.
7. **C2-F (canonical maker-checker workflow).** Best drafted with a design-partner voice in the room; closes [§11 #16](../../CLAUDE.md).
8. **C2-D (document integrity).** Scope call first ("what counts as a supporting document"), then straightforward.
9. **UST-C3 + UST-C4 (Planner-Executor split + persona schema).** Draft together once UST-C1 has landed.
10. **C2-G (ADR 0009 amendments)** and **UST-C5 (persona reasoning as audit events).** Fold in whichever pieces aren't subsumed by earlier decisions.
11. **C1-B (minimum viable realism threshold).** After enough of the above have firmed, stress-test against ADR 0006 and ratify a gate.
12. **C1-D (admin surface remaining scope).** Fill in the view set and Agent-Layer relationship once the Agent Layer itself has more shape.

This is a recommendation, not a commitment. Drafting order is ultimately driven by whatever's about to ship next or whatever's blocking a conversation.

---

## Candidate-to-risk map

Each risk links to the candidate whose drafting would resolve it. Risks without a candidate are documented warnings or architecture-doc-shaped.

| Risk | Severity | Resolved by |
|---|---|---|
| [R-C1-1: Plausibility collapse via operational thinness](../research/deep-research-2026-04-21/RISKS.md#r-c1-1--plausibility-collapse-via-operational-thinness) | Existential | C1-B (partial), already mitigated by ADRs 0005/0006/0008/0009 |
| [R-C1-4: Scope creep into enterprise WORM/PKI/RBAC](../research/deep-research-2026-04-21/RISKS.md#r-c1-4--scope-creep-into-enterprise-wormpkirbac) | Medium | C1-E (becomes ADR constraint) |
| [R-C1-5: LLM scope creep beyond templated text](../research/deep-research-2026-04-21/RISKS.md#r-c1-5--llm-scope-creeps-beyond-templated-text-behind-gateway) | Medium | C1-D |
| [R-C1-6: Admin UI idle cost dominates default install](../research/deep-research-2026-04-21/RISKS.md#r-c1-6--admin-ui-idle-cost-dominates-default-install) | Medium | C1-D |
| [R-C2-2: Kinesis Firehose PUT cost cliff](../research/deep-research-2026-04-22/RISKS.md#r-c2-2--kinesis-firehose-put-request-cost-cliff) | High | C2-C |
| [R-C2-3: Live LLM seed generation breaks budget + determinism](../research/deep-research-2026-04-22/RISKS.md#r-c2-3--live-llm-seed-generation-breaks-budget--determinism) | High | C2-B |
| [R-C2-4: CloudWatch retention compounds past ceiling](../research/deep-research-2026-04-22/RISKS.md#r-c2-4--cloudwatch-retention-default-compounds-past-cost-ceiling) | High | C2-C |
| [R-C2-5: First plausibility test finds no regulatory surface](../research/deep-research-2026-04-22/RISKS.md#r-c2-5--first-plausibility-test-finds-no-regulatory-surface) | High | C2-E |
| [R-C2-6: Step Functions history capped at 90 days](../research/deep-research-2026-04-22/RISKS.md#r-c2-6--step-functions-history-retention-capped-at-90-days) | Medium | C2-C (partial) + ADR 0008 cross-link |
| [R-C2-7: S3 ETag not plain MD5 for multipart](../research/deep-research-2026-04-22/RISKS.md#r-c2-7--s3-etag-not-plain-md5-for-multipart-uploads-silent-integrity-break) | Medium | C2-D |
| [R-C2-8: Install age visible via AWS metadata APIs](../research/deep-research-2026-04-22/RISKS.md#r-c2-8--install-age-visible-via-aws-metadata-apis-forensic-exposure) | Medium | Architecture-doc-shaped (not yet written) |
| [UST-R1: Prompt injection from untrusted prototype UI](../research/synthetic-user-testing/RISKS.md#r1--prompt-injection-from-untrusted-prototype-ui) | High (if UST-C1 lands) | UST-C3 (becomes requirement) |
| [UST-R2: Think-Aloud CoT PII leakage](../research/synthetic-user-testing/RISKS.md#r2--think-aloud--pii-leakage-863) | High (if UST-C1 lands) | UST-C5 |
| [UST-R3: "OK" bias in synthetic SUS scores](../research/synthetic-user-testing/RISKS.md#r3--ok-bias-masks-functional-failure) | Medium (if UST-C1 lands) | UST-C2 (positions it correctly) |

Resolved risks omitted from this table: [R-C1-2, R-C1-3, R-C1-7](../research/deep-research-2026-04-21/RISKS.md), [R-C2-1](../research/deep-research-2026-04-22/RISKS.md).

---

## CLAUDE.md §11 crosswalk

Which candidate resolves which open decision. Items without a candidate are tracked in §11 directly.

| §11 # | Title | Resolved by candidate |
|---|---|---|
| 1 | Pricing model | UST-C6 |
| 2 | Stack structure | UST-C7 (+ C1-E informs) |
| 3 | Update/upgrade strategy | C1-E informs |
| 16 | Canonical maker-checker workflow for v1 | C2-F |
| 17 | Realism threshold for a first Jungle | C1-B |
| 18 | LLM budget enforcement details | (separate from Agent-Layer overlap, which UST-C1 informs) |
| 22 | State-aware SLA timers vs. generic | C2-E |
| 24 | SME exemplar commission timing | C2-B |

§11 items not addressed by any current candidate: #4, #5, #6, #7, #8, #9, #10, #11, #12, #13, #14, #15, #20, #21, #23. These are either future work (infrastructure, DMZ topology) or business/context (first customer, tool choice) — not research-gated.

---

## Provenance

- Cluster 1 candidates: [`../research/deep-research-2026-04-21/CANDIDATES.md`](../research/deep-research-2026-04-21/CANDIDATES.md), lifted from [`SYNTHESIS.md` §4](../research/deep-research-2026-04-21/SYNTHESIS.md).
- Cluster 1 risks: [`../research/deep-research-2026-04-21/RISKS.md`](../research/deep-research-2026-04-21/RISKS.md).
- Cluster 2 candidates: [`../research/deep-research-2026-04-22/CANDIDATES.md`](../research/deep-research-2026-04-22/CANDIDATES.md), lifted from [`SYNTHESIS.md` §4](../research/deep-research-2026-04-22/SYNTHESIS.md).
- Cluster 2 risks: [`../research/deep-research-2026-04-22/RISKS.md`](../research/deep-research-2026-04-22/RISKS.md), lifted from [`SYNTHESIS.md` §6](../research/deep-research-2026-04-22/SYNTHESIS.md).
- Cluster 4 candidates: [`../research/synthetic-user-testing/CANDIDATES.md`](../research/synthetic-user-testing/CANDIDATES.md).
- Cluster 4 risks: [`../research/synthetic-user-testing/RISKS.md`](../research/synthetic-user-testing/RISKS.md).
- Open decisions: [`../../CLAUDE.md`](../../CLAUDE.md) §11.
- Accepted ADRs: [`./README.md`](./README.md) index.
