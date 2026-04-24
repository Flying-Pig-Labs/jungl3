# Research context (cluster 2026-04-22)

You are producing a deep-research report for **Jungl3** (stylized `jungl3`), a product with the following characteristics.

## What Jungl3 is

Jungl3 generates, deploys, and vends pre-built, integrated, "Understory" enterprise applications so product teams can start from a living, working system rather than from a blank page. Teams shape the generated system — subtracting what doesn't belong, substituting components, adding where the baseline stops — into their real product.

Key properties:

- Distributed as an **AWS Marketplace** listing. Customers subscribe, launch a CloudFormation template into their own AWS account, and operate their own Jungl3 instance entirely inside that account. There is no hosted multi-tenant SaaS version of Jungl3 itself.
- Each "Jungle" is a synthetic but believable enterprise environment: microservices, queues, events, stubs, scheduled jobs, seed data, personas, workflows, audit trails, and background activity — all deployed, running, and interacting on day one.
- The central product thesis is "time to real": time from `subscribe` to the first click on running software that feels like a real enterprise system, not a demo.
- The central failure mode is **plausibility collapse**: the moment a user (builder, judge, buyer) spots that the data, workflows, personas, or system behavior are obviously fake, every other investment loses value.

## Where we are now

The 2026-04-21 deep-research cluster (twelve reports) and the subsequent review pass turned many open questions into decisions. The commitments are now on record as ADRs 0005–0009:

- **ADR 0005:** Event envelope is CloudEvents v1.0 with reverse-DNS typing; every event/log/audit record carries both `trace_id` (W3C Trace Context) and `case_id` (business-domain identifier).
- **ADR 0006:** v1 domain anchor is P&C insurance claims processing, claims-only (no underwriting). Seven services: `policy-service`, `claim-intake`, `claim-workflow`, `assessment-service`, `payment-service`, `notification-service`, `audit-service`. Two stubs: payment gateway, notification.
- **ADR 0007:** Infrastructure cost ceiling $100/month per install; LLM budget separately metered at $50/month default, hard cutoff, graceful degradation. Observability is CloudWatch Logs + Logs Insights + X-Ray only. LLMs are prominent via a single `llm-gateway` Lambda constrained to deterministic tool use.
- **ADR 0008:** Every multi-step business process is an AWS Step Functions state machine. Maker-checker is enforced at the state-machine level, not the UI.
- **ADR 0009:** The audit trail is a separate DynamoDB table (`jungle3-audit`), append-only, hash-chained with SHA-256 `prev_hash`, owned by `audit-service`, subscribed to every domain event.

The full findings document these derive from is at `docs/research/findings.md` in the repo; the reports that fed it are at `docs/research/deep-research-2026-04-21/results/`.

## Who the research audience is

Jungl3 engineering leadership. They want **actionable, decision-ready findings** that move the ADRs above from "decided" to "buildable" — concrete recommendations, real numbers, named failure modes, and named trade-offs. Assume they are technically sophisticated and have already read the ADRs. Prefer opinionated synthesis over neutral hedging. Cite named systems, companies, open-source projects, and specifications where useful.

## What this cluster is for

ADRs 0005–0009 are decisions. Now they have to be built. This cluster is about the **next layer of detail** — the specific data models, numeric distributions, library choices, calibration plans, and edge cases that each ADR exposed as still-unknown.

Do not re-argue the ADRs. They are settled. Accept their framing and go deeper.

## Output expectations for every research task

Every deep-research report should end with a section titled **"Decision-ready recommendations for Jungl3"** that states, in 5–10 bullets:

- What Jungl3 should do in the next implementation step for this topic.
- What Jungl3 should explicitly defer past v1.
- The single biggest risk if Jungl3 ignores this topic.
- Any cross-links to the other 9 topics in this cluster where this one has knock-on effects.

Treat this as a genuine advisory document. Be direct. Cite real systems, real pricing, real code where possible. It is better to be sharply opinionated and wrong in a named way than to be vaguely comprehensive.


---

# Topic 10: Synthetic timestamp distributions that survive forensic inspection

See `00-context.md` for product framing. [findings.md §8](../findings.md) commits to fresh-seed-per-install for ephemeral lifecycle reasons, and explicitly acknowledges the cost: a forensically-curious reviewer comparing DynamoDB `created_at` values against CloudWatch log emission times would spot the fresh install. The mitigations named are (a) deterministic-but-spread timestamps that *look* empirical, (b) in-flight claims distributed across workflow stages, and (c) that the typical reviewer doesn't look that closely. This topic is about how far the plausibility can actually be pushed — and at what cost.

## Research questions

1. **What's the forensic tell?** Concretely, what does a DynamoDB or CloudWatch forensic inspection of a "fresh seed with spread timestamps" install reveal that gives away the fake? Specific technical fingerprints: clustering around install time on internal metadata fields, CloudWatch log-group creation times, DynamoDB stream records, Step Functions execution-history creation times, IAM role last-used dates. Enumerate.

2. **Timestamp spreading, rigorously.** Best practices for generating a 18-month history of claim events with timestamps that match a real claims-operation temporal pattern. Distributions: arrival-time inhomogeneous Poisson, per-claim event spacing, end-of-business-day clustering, weekend dropoff, holiday closures. Cite specific libraries, academic papers (queueing theory, operations research), or published implementations (chaos-engineering data generators, fraud-detection synthetic datasets).

3. **Cross-field consistency.** A claim's `created_at` must precede its `first_assessed_at`, which must precede its `closed_at`. Its payment transaction timestamps must follow its approval timestamps. Notes must be timestamped within the claim's lifecycle. How do you enforce all of this in a generator without making the cross-field relationships themselves tells (no two fields exactly N minutes apart, for example)?

4. **Metadata that the seeder can't fake.** AWS services stamp their own creation timestamps: DynamoDB table creation, IAM role creation, CloudWatch log group creation, Step Functions state machine creation. These all land near install time. What's the blast radius of that — can a reviewer tell just from CloudWatch Logs metadata that this install is N minutes old? Which AWS service boundaries matter?

5. **Log-emission timestamps.** Even if domain event timestamps are spread, CloudWatch Logs emission timestamps are at install time. How much of the forensic gap comes from log-emit timestamps vs. application-layer `created_at`? Is there a pattern (bulk-write logs with custom timestamps, historical-log import) that closes this gap? What does it cost?

6. **Parallel to chaos engineering and security research.** Security honeypots and chaos-engineering frameworks have solved adjacent versions of "generate a convincing historical state quickly." What lessons port? Cite CanaryTokens, T-Pot, Gremlin-style platforms, any research on "believable backstory generation" in adversarial environments.

7. **Cost-benefit of closing the forensic gap.** ADR 0007's $100/month ceiling and findings.md §8's <10-minute install target are both load-bearing. How much do progressively-better forensic-plausibility mitigations cost in install time and in ongoing infra? Is there a natural threshold where the next mitigation costs more than the marginal plausibility it earns?

8. **Who cares?** Who is the forensically-curious reviewer, realistically? A prospective customer's security team, a specific class of AWS Marketplace reviewers, a DOI examiner (implausible), an adversarial demo attendee? For each audience, what's the actual evidence they would look at? This matters because plausibility beyond the audience's actual inspection is wasted effort.

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
