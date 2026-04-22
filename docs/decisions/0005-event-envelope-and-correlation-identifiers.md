# 0005 — Event envelope and correlation identifiers

**Status:** Accepted
**Date:** 2026-04-22

## Context

The v1 [Understory](../glossary.md#understory) is a network of services that communicate by emitting and consuming events across SQS, EventBridge, Step Functions, and scheduled jobs. Two questions had to be answered before any service is written: what shape is on the wire, and how is a single unit of work traced through it.

Five independent deep-research reports in the 2026-04-21 cluster converged on the same answer (see [findings.md §5.1–5.2](../research/findings.md#5.1-every-business-event-and-every-log-line-carries-two-ids-trace_id-and-case_id)). Operational observability ("which spans belong to this request across service hops") and business observability ("what happened to this specific claim") are distinct questions; one identifier cannot serve both. And the envelope itself needs to be a known thing, not a Jungle3 invention, so that customer auditors, SDKs, and downstream tooling all recognize it.

This ADR pins both.

## Decision

**1. Envelope.** Every event crossing a service boundary — SQS message, EventBridge event, Step Functions input/output, scheduled-job payload — is a [CloudEvents v1.0](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md) structured envelope. No Jungle3-proprietary envelope.

**2. Type naming.** The CloudEvents `type` attribute follows reverse-DNS:

```
com.jungle3.<domain>.<entity>.<verb_past_tense>
```

Examples: `com.jungle3.claims.claim.submitted`, `com.jungle3.claims.payment.issued`.

**3. Verb vocabulary is closed.** Verbs are drawn from a fixed list: `created`, `updated`, `deleted`, `submitted`, `assigned`, `approved`, `rejected`, `escalated`, `completed`, `failed`, `issued`. Extending the list is an ADR-level change, not a pull-request-level one. This prevents the classic drift where three services emit `opened`, `started`, and `initiated` for the same transition.

**4. Two correlation identifiers, always both.** Every event, every log line, and every audit entry carries:

- `trace_id` — [W3C Trace Context](https://www.w3.org/TR/trace-context/) identifier, propagated via the `traceparent` header on HTTP calls and as a CloudEvents extension (`traceparent`) on async events. Threads through AWS X-Ray. Operational.
- `case_id` — the business-domain identifier for the unit of work (for claims: `CLM-YYYY-MM-NNNNNN`). Human-readable. Carried as a CloudEvents extension (`caseid`) on every domain event and as a top-level structured field in every log line. Domain-layer.

**5. Propagation is mandatory across every async hop.** SQS message attributes carry both IDs. Step Functions executions carry both in state. EventBridge events carry both in the envelope. Scheduled jobs that initiate work mint a new `trace_id` and, where the job targets a specific case, carry the existing `case_id`. Jobs that operate across cases emit per-case events downstream, each with its own `case_id`.

The audit-service (see [findings.md §6.5](../research/findings.md#6.5-microservice-count--resolved-7)) subscribes to every domain event and persists both IDs alongside the event body.

## Consequences

**Enables:**

- The admin-agent tool set in [findings.md §6.2](../research/findings.md#6.2-admin-ui--resolved-llm-agent-over-deterministic-cloudwatchx-ray-tools) becomes tractable. "Show me everything that ever touched case CLM-2026-04-002137" is one CloudWatch Logs Insights query against a structured `case_id` field — not archaeology across traces.
- CloudEvents-native tooling (EventBridge, OpenTelemetry, most log aggregators) recognizes the envelope without translation.
- Customer auditors reviewing the install see a standard envelope with a published spec, not a Jungle3-specific schema they have to learn.
- Future domain packs (e.g. a retail pack emitting `com.jungle3.retail.return.requested`) share namespace rules without collision.

**Forecloses:**

- Custom event envelopes in any Jungle3 service.
- A single-identifier correlation scheme (trace-only or case-only).
- Free-form verbs. A service that needs a transition not in the verb list must amend this ADR or the glossary, not invent one locally.
- Using log lines without `trace_id` and `case_id` as top-level structured fields.

**Accepts:**

- Slight envelope overhead: CloudEvents' required fields plus both IDs add bytes to every message. This is the cost of observability-from-day-one and is vastly cheaper than retrofitting.
- `case_id` must be minted before the first cross-service emission for any new unit of work. Services that initiate work (e.g. `claim-intake`) own minting; downstream services propagate but never re-mint.
- Scheduled jobs and stubs have to be disciplined about propagation too. A stub webhook callback that drops `case_id` breaks the per-case view.

## Alternatives considered

- **Custom Jungle3 envelope.** Smaller, exactly what we need, no CloudEvents overhead. Rejected — NIH syndrome. CloudEvents solves this problem and is the spec customers' auditors recognize.
- **One identifier (either `trace_id` or `case_id`).** Simpler. Rejected — the research convergence is specifically that one ID cannot serve both operational and business observability. Picking one forces the other's queries to become reconstruction.
- **Forward-DNS or flat type names (`claim.submitted`).** Shorter. Rejected — collides once a second domain exists; reverse-DNS is the JVM/Java-world convention and sorts hierarchically in log queries.
- **Open verb vocabulary.** Lets teams name transitions precisely. Rejected — guarantees drift across services. The MVR floor is too small for bespoke verbs to earn their place; if a transition genuinely doesn't fit the closed list, the ADR gets amended.
- **OpenTelemetry semantic conventions without CloudEvents.** OTel defines span attributes; it does not define an event envelope on the wire. Rejected — these are complementary, not alternatives. `trace_id` via OTel Trace Context is part of this decision; the envelope is CloudEvents.
