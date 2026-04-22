# Candidate ADRs — cluster 2 (2026-04-22)

Lifted out of [`SYNTHESIS.md` §4](./SYNTHESIS.md) for use. Each entry is a candidate ADR this cluster identified as a follow-on to the five ADRs (0005–0009) it was commissioned to pressure-test. One of the seven has since been drafted; six remain.

Readiness legend:

- **Resolved** — an accepted ADR now closes this candidate.
- **High** — ready to draft; evidence complete, shape clear.
- **Medium** — ready after a short scoping pass.
- **Low** — better as an amendment to an existing ADR than a new one.

---

## Index

| ID | Title | Readiness | Resolved by / Depends on |
|---|---|---|---|
| [A](#a--seeder-and-reaper-patterns-for-10m-install-and-5m-teardown) | Seeder and Reaper patterns | **Resolved** | [ADR 0010](../../decisions/0010-seeder-and-reaper-patterns.md) |
| [B](#b--seed-data-generation-pre-generated-shipped-as-immutable-artifact) | Seed-data generation: pre-generated, shipped as immutable artifact | High | [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md), [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) |
| [C](#c--retention-tiering-cloudwatch--s3--glacier-deep-archive) | Retention tiering (CloudWatch → S3 → Glacier Deep Archive) | High | [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) |
| [D](#d--document-integrity-application-layer-sha-256-hashing-of-supporting-documents) | Document integrity (application-layer SHA-256) | Medium | [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) |
| [E](#e--regulatory-surface-for-v1-insurance-claims) | Regulatory surface for v1 insurance claims | Medium | [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md), [ADR 0008](../../decisions/0008-workflows-are-state-machines.md), [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) |
| [F](#f--canonical-v1-maker-checker-workflow) | Canonical v1 maker-checker workflow ($47,500 settlement) | Medium | [ADR 0008](../../decisions/0008-workflows-are-state-machines.md) |
| [G](#g--adr-0009-amendments-chain-on-write-document-hashes-extension-schemas) | ADR 0009 amendments (chain-on-write, doc hashes, extension schemas) | Low (amendment) | [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) |

One resolved (A via ADR 0010). Six open: two High, three Medium, one Low-as-amendment.

**Originally recommended drafting order** (from [SYNTHESIS.md §4](./SYNTHESIS.md)): A, C, B, E, F, D, G. A is done. Next in order: C, B, E, F, D, G.

---

## A — Seeder and Reaper patterns for <10m install and <5m teardown

**Status: Resolved by [ADR 0010](../../decisions/0010-seeder-and-reaper-patterns.md).**

**Original frame.** Pin the seeder/reaper pattern to hit the <10-minute install and <5-minute teardown SLAs from [`findings.md`](../findings.md) §1.

**How it resolved.** ADR 0010 mandated async Step Functions seeder handoff, HMAC-SHA256 per-entity deterministic seeding, `.waitForTaskToken` workflow seeding discipline, a dedicated Reaper Lambda on stack Delete, and architectural bans on ALBs and VPC-attached Lambdas in v1.

**Cluster-2 source.** [SYNTHESIS.md §3.1, §4 Candidate A](./SYNTHESIS.md), derived from report 07.

---

## B — Seed-data generation: pre-generated, shipped as immutable artifact

**Status: High — ready to draft.**

**Frame.** Generate the canonical seed corpus (claim notes, adjuster communications, persona writing-style samples) **once** during the Marketplace-listing build phase. Ship as an immutable JSON bundle via S3 or AMI. Install-time LLM cost = $0, with byte-for-byte determinism across installs.

**Source.** [SYNTHESIS.md §3.2, §4 Candidate B](./SYNTHESIS.md), derived from report 08.

**Forces.**

- **Claude has no `seed` parameter.** Even at `temperature=0`, floating-point and GPU-parallelism variation make install-time LLM generation inherently non-deterministic. Two customer installs running the same CloudFormation template would produce different seed corpora, breaking [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md)'s hash-chain integrity across installs. (Report 08.)
- **Live Sonnet generation of the 7.5M-token seed corpus costs ~$154.** Against [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md)'s $50/month LLM budget, live generation is structurally incompatible.
- **Live LLM style generation without deterministic post-processing produces "bureaucratese"** — uniformly polished prose that fails a blind read against a real insurance claim note.
- **Legal posture:** scraping FEMA/PACER datasets for style exemplars is toxic for an AWS Marketplace product. Report 08 recommends commissioning 24 SME-authored synthetic exemplars (8 personas × 3 each) under work-for-hire copyright assignment.

**The decision you'd be making.**

- Commit to build-time seed generation as the pattern.
- Pin the hybrid LLM + deterministic-post-processor approach: LLM for semantics, HMAC-SHA256-seeded Python post-processor for abbreviations, fragments, sparse typos.
- Adopt work-for-hire SME commissioning as the exemplar-sourcing posture.

**What's *not* decided by this ADR.** Whether v1 gates on the 24-exemplar commission happening first, or ships with placeholder exemplars and swaps them later. That's [CLAUDE.md §11 #24](../../../CLAUDE.md), resolves in the ADR draft.

**Dependencies.** Reinforces [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) (install-time LLM cost = $0 becomes enforceable) and [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) (install seeds chain cleanly because byte-stable). No upstream blockers.

**Related accepted ADRs.** [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md), [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md), [ADR 0010](../../decisions/0010-seeder-and-reaper-patterns.md).

**Closes.** [CLAUDE.md §11 #24](../../../CLAUDE.md) during the ADR draft.

---

## C — Retention tiering: CloudWatch → S3 → Glacier Deep Archive

**Status: High — ready to draft.**

**Frame.** Pin a three-tier retention lifecycle: CloudWatch Logs 7-day retention → S3 Standard 30-day → Glacier Deep Archive for long-term. Applies to application logs, Step Functions execution history exports, and audit-stream exports.

**Source.** [SYNTHESIS.md §2.3, §4 Candidate C](./SYNTHESIS.md), derived from reports 01 and 02.

**Forces.**

- **CloudWatch retention left at default silently eats the cost ceiling.** Report 01: CloudWatch ingestion is $0.50/GB and storage compounds continuously if retention is "Never Expire." At 5 GB/month the Medium-scenario infra cost is ~$49/month over 24 months; at 20 GB/month it breaches [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md)'s $100 ceiling outright.
- **Step Functions history retention is 90 days, hard.** Report 01: Standard workflows retain execution history for 90 days; Express retains nothing. Enterprise examiners expect multi-year audit availability. Mitigation: log execution history to CloudWatch, then export to S3 via the same tiering.
- **The Firehose PUT-request cliff** (see [RISKS.md R-C2-2](./RISKS.md)) requires 64 MB / 15-minute buffer hints — this interacts with the S3 tier of the retention pipeline.
- **Enterprise expectation** is multi-year audit availability. Glacier Deep Archive at $0.00099/GB-month is the cheapest compliant storage tier.

**The decision you'd be making.**

- CloudWatch Logs: 7-day default retention.
- S3 Standard: 30-day via S3 Lifecycle rule.
- Glacier Deep Archive: indefinite, with a documented retrieval SLA (hours, not minutes).
- Firehose: 64 MB / 15-minute buffer hints.
- Step Functions: log execution history to CloudWatch by default.

**Dependencies.** None upstream. Downstream: any future retention-sensitive feature (examiner exports, SIU case history) assumes this.

**Related accepted ADRs.** [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md), [ADR 0008](../../decisions/0008-workflows-are-state-machines.md), [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md).

**Why High.** Evidence is numeric and concrete. No scoping call left; just write it.

---

## D — Document integrity: application-layer SHA-256 hashing of supporting documents

**Status: Medium — needs a scoping decision on "what counts as a supporting document."**

**Frame.** Every supporting document (claim estimate, photo, report) is SHA-256 hashed at upload time at the application layer. The hash is embedded in the CloudEvents extension attributes and chained through the audit record.

**Source.** [SYNTHESIS.md §2.5, §4 Candidate D](./SYNTHESIS.md), derived from report 03.

**Forces.**

- **S3 ETags do not hash multipart uploads as plain MD5.** Report 03: if we rely on S3 ETags to prove document integrity, the integrity claim silently fails for any document larger than the multipart threshold — the ETag becomes a composite hash, not a standard MD5. Anyone verifying the hash externally gets the wrong answer.
- **Document-level integrity is load-bearing for the examiner-export story** ([SYNTHESIS.md §2.2](./SYNTHESIS.md)).

**The open scoping question.** What counts as a "supporting document" in v1? Clearly: estimates, photos. Unclear: adjuster notes, email bodies, SIU case files. Each answer changes the hashing-pipeline cost profile. This is [#1 in the cluster-2 new-questions list](./SYNTHESIS.md#5-new-open-questions-for-claudemd-11-candidacy) (not to be confused with repo-level §11 #1).

**Dependencies.** Reinforces [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md). No upstream blockers.

**Related accepted ADRs.** [ADR 0005](../../decisions/0005-event-envelope-and-correlation-identifiers.md) (where the hash lives in the envelope), [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) (the chain).

**Why Medium.** Scoping call before drafting. Shape of the ADR is clear once scope is pinned.

---

## E — Regulatory surface for v1 insurance claims

**Status: Medium — needs scoping pass on "how many cues are minimum-viable?"**

**Frame.** Pin the minimum regulatory-cue surface the insurance-claims v1 must exhibit to pass a 15-minute plausibility test by a former DOI examiner. Candidate cues: state-specific acknowledgment SLAs, append-only reserve ledger, segregated SIU case data, large-loss reinsurance notifications at $250K thresholds, MCAS-style examiner exports.

**Source.** [SYNTHESIS.md §2.2, §4 Candidate E](./SYNTHESIS.md), derived from report 09.

**Forces.**

- **ADR 0006 named the seven services but did not name the regulatory surface.** A demo with no jurisdiction field on claims, no reserve ledger, and no SIU referral is not credible insurance — it's "a claims-shaped app."
- **State-aware SLAs are materially more credible than a generic `jurisdiction` field.** Specific timelines in real state codes: CA 15 calendar days, TX 15 business days, FL 7 calendar days, NY 15 business days. Report 09.
- **Reserve ledger shape.** Every reserve adjustment as a distinct audit item with `old_value`, `new_value`, `reason_code`, `authority_level`, `changed_by`, `prev_hash`. [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) supports this; no ADR pins the reserve-ledger as a required surface yet.
- **SIU segregation.** A separate data model / table / access-control boundary for SIU cases, because examiners look for it.

**Open scoping sub-questions (from [SYNTHESIS.md §5](./SYNTHESIS.md)).**

- Do we ship state-specific SLA timers in v1, or a single generic SLA with a `jurisdiction` field that doesn't drive behavior? ([CLAUDE.md §11 #22](../../../CLAUDE.md).)
- What's the default install's jurisdiction? (Single-state or multi-state seed.)
- Does the reserve ledger live in `jungle3-audit` directly, or in a dedicated `reserve-ledger` table that writes through to `jungle3-audit`?

**The decision you'd be making.** How many of the cues are minimum-viable. Pick from {state-aware SLAs, reserve ledger, SIU segregation, reinsurance notify, examiner export}.

**Dependencies.** [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md) (amends or extends), [ADR 0008](../../decisions/0008-workflows-are-state-machines.md) (state-aware SLAs are state-machine `Wait` states), [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) (reserve ledger uses the chain).

**Closes.** [CLAUDE.md §11 #22](../../../CLAUDE.md) during the ADR draft.

**Why Medium.** Highest product-credibility payoff among the open candidates, but the scoping call matters — ship too much, cost ceiling pressure; ship too little, examiner sees through it.

---

## F — Canonical v1 maker-checker workflow

**Status: Medium — the specific workflow shape is strong; scope decision is about generalization.**

**Frame.** Pin the canonical v1 maker-checker as: settlement approvals above $25,000, demoed with a $47,500 claim that gets rejected (pre-existing damage), revised down to $32,000, then approved.

**Source.** [SYNTHESIS.md §2.4, §4 Candidate F](./SYNTHESIS.md), derived from report 03.

**Forces.**

- **[CLAUDE.md §11 #16](../../../CLAUDE.md) explicitly leaves this open.** ADR 0006 named the canonical workflow as a deferred sub-question.
- **This is the best canonical workflow candidate in the set.** Real stakes, forced escalation path, iterative rejection loop, plausible reason code. Demoes cleanly in five minutes.
- **[ADR 0008](../../decisions/0008-workflows-are-state-machines.md)** already mandates state-machine enforcement; Candidate F chooses *which* state machine to build first.

**The decision you'd be making.**

- Accept the $47,500-revised-to-$32,000 shape as canonical.
- Define the specific state machine: submit → review → reject (reason code) → revise → re-review → approve.
- Pin the authority levels: adjuster (makes), senior adjuster (checks above $25K), approver (checks above $100K) — numbers TBD by the ADR.

**Dependencies.** [ADR 0008](../../decisions/0008-workflows-are-state-machines.md). Benefits from a real design-partner voice before drafting — cluster-2 synthesis [SYNTHESIS.md §7](./SYNTHESIS.md) recommended deferring until a design partner was available.

**Related accepted ADRs.** [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md), [ADR 0008](../../decisions/0008-workflows-are-state-machines.md), [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md).

**Closes.** [CLAUDE.md §11 #16](../../../CLAUDE.md) during the ADR draft.

**Why Medium.** Shape is concrete; cluster-2 synthesis flagged "wait for a design-partner voice" as the main reason to defer.

---

## G — ADR 0009 amendments: chain-on-write, document hashes, extension schemas

**Status: Low — better as an amendment PR than a new ADR.**

**Frame.** Amend [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) with three clarifications the cluster surfaced:

1. **Chain on write sequence, not event time.** Install-time backfill writes 18 months of domain events in write-order in a few minutes. Chaining on `event_time` breaks (out-of-order arrivals); chaining on `write_time` stays cryptographically sound but must be stated. Hash `event_time` inside the payload. (Report 10.)
2. **Document hashes.** Supporting-document SHA-256 hashes are embedded in CloudEvents extension attributes and chained through the audit record. Cross-references Candidate D.
3. **Extension schemas for specific event types.**
   - `agent_invoked_tool` carries `{trace_id, case_id, tool_call_id}` (report 05).
   - Reserve-change events carry `{old_value, new_value, reason_code, authority_level, changed_by}` (report 09).

**Source.** [SYNTHESIS.md §2.5, §4 Candidate G](./SYNTHESIS.md), derived from reports 03, 05, 09, 10.

**Why Low / amendment rather than new ADR.** Each of the three is a narrow clarification of ADR 0009, not a new decision. A supersession ADR would be heavier than the change warrants. The `docs/decisions/README.md` supersession pattern supports amendment via an "Amended by" status line.

**Dependencies.** Partial dependency on Candidate D (document hashing): if D is drafted, the document-hash piece of G is subsumed. Chain-on-write and extension-schemas are independent.

**The decision.** Either draft as a sibling ADR, or amend ADR 0009 directly with a dated "Amendments" section. Recommendation: sibling ADR only if Candidate D is deferred; otherwise amend.

---

## Suggested drafting order (minus the resolved A)

The synthesis originally recommended **A, C, B, E, F, D, G**. With A done, the remaining order is:

1. **C** (retention tiering) — short, high-confidence, closes an active cost-compound risk.
2. **B** (pre-generated seed artifact) — unblocks the Marketplace-listing build pipeline.
3. **E** (regulatory surface) — highest product-credibility payoff, needs scoping first.
4. **F** (canonical maker-checker workflow) — best with a design-partner voice in the room.
5. **D** (document hashing) — scope call first, then straightforward.
6. **G** (ADR 0009 amendment) — fold in whichever pieces are not subsumed by D.

See [`../../decisions/BACKLOG.md`](../../decisions/BACKLOG.md) for the cross-cluster view.
