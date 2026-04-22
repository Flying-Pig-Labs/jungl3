# Decision status — one-page view

**Purpose.** A single page that answers: *What has Jungle3 decided? What's next? What's open?*

**Audience.** Investor appendix, new contributor onboarding, reviewer context-setting.

**Format.** Three tables. Total length intentionally kept short; everything cross-links to authoritative docs.

**Last updated.** 2026-04-22.

---

## Accepted — 10 ADRs

Decisions we have made and will not casually revisit.

| # | Title | What it commits to |
|---|---|---|
| [0001](./0001-lovable-owns-repo-root.md) | Lovable owns repo root | Website stays at repo root; platform domains live in subdirs. |
| [0002](./0002-sub-agent-response-contract.md) | Sub-agent response contract | Every Agent-Layer specialist returns `{status, summary, evidence, recommended_action}`. |
| [0003](./0003-installable-via-aws-marketplace.md) | Installable via AWS Marketplace | Jungle3 ships as a Marketplace listing; no hosted control plane. |
| [0004](./0004-canonical-platform-vocabulary.md) | Canonical vocabulary | Understory, Substrate, DMZ-absorbs-Gallery. |
| [0005](./0005-event-envelope-and-correlation-identifiers.md) | Event envelope + correlation IDs | CloudEvents v1.0, reverse-DNS typing, `{trace_id, case_id}` dual correlation. |
| [0006](./0006-v1-domain-anchor-insurance-claims.md) | v1 domain = insurance claims | P&C claims processing; 7 services; 2 stubs. |
| [0007](./0007-v1-cost-profile-and-llm-metering.md) | v1 cost profile + LLM metering | $100/month infra ceiling, $50/month metered LLM, CloudWatch/X-Ray, LLM-agent-over-tools for admin. |
| [0008](./0008-workflows-are-state-machines.md) | Workflows are state machines | Step Functions for multi-step business processes; no implicit event chains. |
| [0009](./0009-audit-trail-is-append-only-hash-chained.md) | Audit trail is hash-chained | Append-only DynamoDB with per-event hash chaining; separate from operational data. |
| [0010](./0010-seeder-and-reaper-patterns.md) | Seeder + Reaper patterns | Async Step Functions seeder, HMAC-SHA256 per-entity seeding, dedicated Reaper Lambda; no ALBs, no VPC Lambdas in v1. |

**Status distribution:** 10 accepted, 0 superseded, 0 deprecated.

**Coverage.** The 10 accepted ADRs cover: packaging model, vocabulary, event shape, v1 domain choice, cost posture, workflow orchestration, audit architecture, install/teardown patterns, and agent response shape. They do *not* yet cover: extension architecture, admin-UI view set, regulatory-cue surface, seed-data generation mechanics, retention tiering, document integrity, or any synthetic-user-testing decisions.

---

## Next up — top 5 pending candidates

Ordered by the recommendation in [`BACKLOG.md`](./BACKLOG.md). Each has a named source, a bounded decision, and concrete dependencies.

| Order | ID | Title | Readiness | Why now |
|---|---|---|---|---|
| 1 | [C2-C](../research/deep-research-2026-04-22/CANDIDATES.md#c--retention-tiering-cloudwatch--s3--glacier-deep-archive) | Retention tiering (CloudWatch → S3 → Glacier) | High | Closes an active cost-compound risk ([R-C2-4](../research/deep-research-2026-04-22/RISKS.md#r-c2-4--cloudwatch-retention-default-compounds-past-cost-ceiling)). Short ADR. |
| 2 | [C2-B](../research/deep-research-2026-04-22/CANDIDATES.md#b--seed-data-generation-pre-generated-shipped-as-immutable-artifact) | Pre-generated seed artifact | High | Unblocks Marketplace-listing build pipeline; resolves [R-C2-3](../research/deep-research-2026-04-22/RISKS.md#r-c2-3--live-llm-seed-generation-breaks-budget--determinism). |
| 3 | [UST-C1 / UST-C2](../research/synthetic-user-testing/CANDIDATES.md) | Synthetic-user-tester placement / pre-human framing | Medium / High | Gates an entire new product surface. Either is a valid entry point. |
| 4 | [C2-E](../research/deep-research-2026-04-22/CANDIDATES.md#e--regulatory-surface-for-v1-insurance-claims) | Regulatory surface for v1 insurance | Medium | Highest product-credibility payoff; closes [§11 #22](../../CLAUDE.md). |
| 5 | [C1-E + UST-C7](../research/deep-research-2026-04-21/CANDIDATES.md#e--extension-architecture-minimal-core--versioned-packs) | Extension architecture + Marketplace stack structure | Medium | Draft as a pair. Closes [§11 #2](../../CLAUDE.md). |

**Full backlog of 17 pending candidates:** [`BACKLOG.md`](./BACKLOG.md).

---

## Open questions — not yet candidate-shaped

Tracked in [`../../CLAUDE.md`](../../CLAUDE.md) §11. These are either business/context (not research-gated), future infrastructure (wait for the relevant ADR), or narrow implementation details (become design docs, not ADRs). Total: 15 open, of 22 total in §11.

| § | Title | Shape |
|---|---|---|
| 4 | Minimum IAM permissions | Security-review-driven; becomes concrete when Marketplace listing is built. |
| 5 | Supported AWS regions | Business call; waits on first customer. |
| 6 | Supported customer account scenarios | Single-account vs Control Tower; interacts with C1-E. |
| 7 | IaC authoring tool | CFN / CDK / SAM / Pulumi — decide when Marketplace listing build starts. |
| 8 | CI/CD for the listing | GitHub Actions + OIDC; deferred until listing pipeline starts. |
| 9 | DMZ authentication | Magic link + guest + role-based. Design call; needs a first DMZ build. |
| 10 | DMZ AWS topology | VPC shape, routing. Needs a first DMZ build. |
| 11 | Control Plane runtime | Lambda vs Fargate — not yet needed. |
| 12 | DMZ prototype lifespan | Retention/extension/teardown. Becomes concrete with first sprint use. |
| 13 | DMZ telemetry requirements | Becomes concrete when judging surface is built. |
| 14 | Data classification rules | Advisory doc; becomes concrete with first customer. |
| 15 | Cross-install discoverability | Default: no. Future federation is a separate design. |
| 18 | LLM budget enforcement details | Design doc when `llm-gateway` is implemented. |
| 20 | Kiro CLI vs custom CLI | Undecided; not blocking. |
| 21 | First-sponsor context | Accumulates when relevant. |
| 23 | Mid-execution LLM budget exhaustion signaling | Design doc when first LLM-using state machine is built. |

§11 items that **are** candidate-shaped (and thus tracked in [`BACKLOG.md`](./BACKLOG.md) instead): #1, #2, #3, #16, #17, #22, #24.

---

## Risks worth naming for an investor conversation

Top 5 named risks across the research clusters. Each has a mitigation that is known — not blocked on research, only on drafting.

| Risk | Severity | Mitigated by |
|---|---|---|
| [Plausibility collapse via operational thinness](../research/deep-research-2026-04-21/RISKS.md#r-c1-1--plausibility-collapse-via-operational-thinness) | Existential | 5 accepted ADRs + Candidate C1-B |
| [First plausibility test finds no regulatory surface](../research/deep-research-2026-04-22/RISKS.md#r-c2-5--first-plausibility-test-finds-no-regulatory-surface) | High | Candidate C2-E |
| [Live LLM seed generation breaks budget + determinism](../research/deep-research-2026-04-22/RISKS.md#r-c2-3--live-llm-seed-generation-breaks-budget--determinism) | High | Candidate C2-B |
| [Kinesis Firehose PUT cost cliff](../research/deep-research-2026-04-22/RISKS.md#r-c2-2--kinesis-firehose-put-request-cost-cliff) | High | Candidate C2-C |
| [Prompt injection from untrusted prototype UI](../research/synthetic-user-testing/RISKS.md#r1--prompt-injection-from-untrusted-prototype-ui) | High (if UST-C1 lands) | Candidate UST-C3 |

**Full risk inventory:** per-cluster [`RISKS.md`](../research/) files and [`BACKLOG.md` candidate-to-risk map](./BACKLOG.md#candidate-to-risk-map).

---

## Reading guide by role

**For an investor / first-time reader:** this file, then [`../research/findings.md`](../research/findings.md).

**For a reviewer / architect:** this file, [`BACKLOG.md`](./BACKLOG.md), then the cluster syntheses in [`../research/`](../research/).

**For a contributor picking up work:** [`BACKLOG.md`](./BACKLOG.md), then the specific candidate file in [`../research/*/CANDIDATES.md`](../research/).

**For the full ADR authoring convention:** [`README.md`](./README.md) and the [`adr-author` skill](../../.cursor/skills/adr-author/SKILL.md).
