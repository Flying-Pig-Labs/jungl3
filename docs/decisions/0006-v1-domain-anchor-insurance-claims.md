# 0006 — v1 domain anchor: insurance claims processing

**Status:** Accepted
**Date:** 2026-04-22

## Context

Jungl3's v1 [Understory](../glossary.md#understory) has to be a specific domain. "A generic Frankenstein enterprise app" is not a thing you can seed, personas, stub, or demo — every realism cue is downstream of the domain choice.

The 2026-04-21 deep-research cluster left two candidates on the table ([findings.md §6.1](../research/findings.md#6.1-domain-anchor--resolved-insurance-claims-processing-claims-only)):

- **Report 02's recommendation:** a "claims-adjacent" family (warranty, returns, disputes, chargebacks) that is generic across retail/fintech.
- **Reports 10 and 11's assumption:** insurance-proper, with adjusters, supervisors, SIU investigators, and auditors as the persona cast and NAIC-shaped regulatory tone.

Reports 10 and 11 did the specific work — persona taxonomy, regulated cues, audit-trail design — assuming insurance. Switching to claims-adjacent retail would have required re-porting that work to e-commerce roles and payment-network regulation for no obvious gain.

Separately, underwriting is the hardest synthetic-data surface in insurance ([findings.md §6.1](../research/findings.md#6.1-domain-anchor--resolved-insurance-claims-processing-claims-only) citing report 02): synthetic applicants with income and credit profiles that a domain expert cannot immediately dismiss. Claims-only avoids that problem entirely — claims operate against a *given* population of already-bought policies, so the synthesis surface is claim events against stable reference data rather than the reference data itself.

This ADR pins the choice and, as a mechanical consequence, pins the service decomposition.

Resolves [`CLAUDE.md`](../../CLAUDE.md) §11 open questions #16 (v1 service set and decomposition) and #19 (Domain Starter anchor for v1).

## Decision

**v1 simulates a mid-sized regional P&C (property and casualty) insurer, scoped to claims processing only. Underwriting is explicitly out of scope.**

Claim types span auto (collision, comprehensive, liability), property (theft, water damage, fire), and a small number of disability/accident claims. No life, no health, no commercial lines.

Seeded state at install time:

- ~800 active policyholders.
- ~60 claims in flight across workflow stages.
- ~1,800 historical closed claims spanning 18 months.
- 8 personas with seeded history, owned workloads, and activity rhythms (adjuster × 2 seniority levels, supervisor, approver, admin, auditor, SIU investigator, external counterparty).

The Understory decomposes into **seven services**, each owning a bounded context in the claims domain:

1. **`policy-service`** — reference data: policyholders, policies, coverage terms. Read-heavy; mutated rarely.
2. **`claim-intake`** — receives new claim submissions, runs initial validation, mints `case_id`, emits `com.jungle3.claims.claim.submitted`.
3. **`claim-workflow`** — Step Functions orchestrator owning the claim lifecycle state machine. Routes to assessors, manages approvals, handles escalations.
4. **`assessment-service`** — damage assessment, fraud screening, SIU investigation triage. Mix of automated rules and human-task queues seeded against personas.
5. **`payment-service`** — issues settlements, handles reversals, integrates with the payment-gateway stub. Owns maker-checker enforcement for high-value payments.
6. **`notification-service`** — outbound claimant communication and internal notifications. Integrates with the notification stub.
7. **`audit-service`** — tamper-evident append-only trail. Subscribes to every domain event; queried by the admin agent.

Two external-system stubs ship alongside, both labeled as stubs in every interface:

- **Payment gateway stub** — synchronous auth + asynchronous webhook callbacks with realistic delays.
- **Notification stub** — email/SMS delivery simulator with delivery-status events.

The canonical maker-checker workflow (see [ADR 0005](./0005-event-envelope-and-correlation-identifiers.md) and [findings.md §5.4](../research/findings.md#5.4-maker-checker-four-eyes-is-the-single-highest-signal-regulated-cue)) is deferred: the specific workflow (settlement approval above a dollar threshold, policy exception, high-value payment issuance, or SIU investigation outcome) is chosen after the first design-partner conversation. Default if no input arrives first: settlement approval above a threshold.

## Consequences

**Enables:**

- The persona and regulated-cue work from reports 10 and 11 ports directly; no re-authoring for a different vertical.
- Seeded state is a tractable synthesis problem — claim events against stable policyholder reference data, not synthetic applicants.
- The 7-service shape fits within the MVR floor of 4 services and the upper end of report 03's 4–7 sweet spot, stays below report 01's 8–12 range, and keeps the install under the [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md) cost ceiling on serverless infrastructure.
- Every service has a clear maker-checker or audit role the domain already expects, which is what makes the regulated cues in [findings.md §5.4](../research/findings.md#5.4-maker-checker-four-eyes-is-the-single-highest-signal-regulated-cue) legible.
- Future vertical packs (retail returns, benefits enrollment, permit workflows) can be authored as add-ons without displacing v1's anchor.

**Forecloses:**

- Underwriting in v1. A later ADR may add it; an Understory pack may simulate it; the v1 shape does not.
- Life, health, and commercial-lines claims in v1. Same reasoning.
- "Claims-adjacent retail" (warranty / returns / disputes / chargebacks) as the v1 anchor. Available as a future pack; not the ship-first choice.
- A service decomposition that doesn't name the seven services above. Collapsing any of them (e.g. folding `audit-service` into a shared library) loses the audit-integrity property in [findings.md §6.5](../research/findings.md#6.5-microservice-count--resolved-7).

**Accepts:**

- v1 is opinionated about one vertical. A prospect whose interest is a different vertical sees a demo of insurance claims and has to do the translation mentally until a pack for their vertical exists.
- The specific maker-checker workflow is deferred to the first design-partner conversation. Until then, plan against the default (settlement approval above a threshold) but do not ship it as the canonical example.
- Reference data (policyholders, policies) is itself synthetic, and a domain-expert reviewer auditing policy-level specifics (rider language, state-by-state regulatory differences) will see gaps. The design target is adjuster-plausible, not DOI-auditor-plausible; closing the latter gap is future work.
- The seven-service count is a commitment, not a ceiling. Adding an eighth service in v1 requires an amending ADR; it is not a pull-request-level call.

## Alternatives considered

- **Claims-adjacent retail (report 02's primary recommendation).** More-generic, potentially broader market. Rejected — discards reports 10 and 11's insurance-specific work for no clear benefit now that insurance familiarity is not blocking, and the regulated cues of retail (PCI, chargeback networks) are a different (weaker) flavor of realism than P&C.
- **Insurance claims + underwriting.** More complete. Rejected — underwriting's synthetic-applicant surface is the hardest plausibility problem in insurance, and shipping it in v1 risks a plausibility-collapse vector that claims-only avoids entirely.
- **A smaller service count (4–5).** Within report 03's sweet spot, simpler install. Rejected — 7 is already the minimum that gives every service a clear bounded context (intake vs. workflow vs. assessment vs. payment vs. notification vs. audit vs. policy). Collapsing further merges concerns that real claims operations keep separate.
- **A larger service count (10+, closer to `research2-v1-service-build-plan.md`'s proposal).** More differentiated bounded contexts. Rejected — pushes against the [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md) cost ceiling, and the additional services (Identity, Work Item, Party/Account, Document, Stub, Simulation, Admin/Ops) are either platform concerns (handled outside the domain shape) or additive value that does not earn their v1 place.
- **Defer the domain decision until a first customer is signed.** Would let the domain track a concrete opportunity. Rejected — the v1 Understory has to be authorable and demonstrable before a first-customer conversation is possible, and insurance claims is the highest-signal default given the research on hand.
