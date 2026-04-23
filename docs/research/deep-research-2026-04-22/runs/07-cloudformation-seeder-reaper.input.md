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

# Topic 7: CloudFormation seeder and reaper Lambda patterns

See `00-context.md` for product framing. [findings.md §8](../findings.md) commits to ephemeral-capable lifecycle targets: install in under 10 minutes from stack creation to first CloudEvent flowing, teardown in under 5 minutes with no orphaned S3 objects, CloudWatch log groups, or Step Functions execution history. Fresh seed per install, deterministic from a seed value. This topic is about whether those targets survive contact with CloudFormation's actual behavior, and what patterns hit them reliably.

## Research questions

1. **Install time budget, realistic.** A CloudFormation stack that creates ~7 Lambda functions, ~6 DynamoDB tables, ~6 SQS queues, ~3 EventBridge buses, ~4 Step Functions state machines, IAM roles, a small Fargate task for the chat UI, plus a post-deploy seeder Lambda. Empirically, how long does that actually take on `cloudformation create-stack`? Cite real benchmarks or worked examples. Where are the serial bottlenecks (IAM propagation, DynamoDB table creation, ALB provisioning)?

2. **Custom-resource patterns for seeder.** The seeder runs via a CloudFormation custom resource post-deploy. Survey patterns: `AWS::CloudFormation::CustomResource` with a Lambda backing, `AWS::Lambda::Function` invoked by a custom resource, CDK's `AwsCustomResource`, Provider framework. Which pattern is most reliable for long-running (seconds-to-minutes) seeders? What are the known timeout and retry pitfalls (15-minute Lambda limit, 1-hour CloudFormation timeout)?

3. **Deterministic seed distribution.** The seeder has to generate 800 policyholders, 1,800 closed claims over 18 months, 60 in-flight claims, and 8 personas, deterministic from a seed value. Production patterns for deterministic fake-data generation at this scale — seeded RNG, stable hashing, ordered insertion. Cite libraries (Faker with a seed, Mimesis, Chance.js) and their determinism guarantees.

4. **Timestamp spreading.** Historical claim timestamps need to follow a realistic distribution over 18 months (denser recent, sparser earlier, business-hour bias, annual seasonality) — deterministic, but *looking* empirical. What open-source tooling or published patterns solve this well? This intersects with topic 10.

5. **In-flight Step Functions executions started by the seeder.** The seeder has to kick off 60 Step Functions executions in mid-workflow states (10 in intake, 15 in assessment, 20 awaiting approval, 10 in payment, 5 escalated). What is the right pattern — start the execution with initial input and use `SendTaskSuccess`/`SendTaskFailure` to advance to the target state, or seed the state machine with "start-at" support, or run the execution and pause it at a human-task state? Pros and cons of each.

6. **Reaper patterns.** On `delete-stack`, a reaper Lambda runs to empty S3 buckets, delete log groups, clear EventBridge rules and Step Functions execution history. What is the most reliable pattern? Survey: `UpdateReplacePolicy: Delete`, custom resources on delete, AWS Lambda destinations, Step Functions waiting for confirmations. What happens if the reaper itself fails?

7. **Orphan sources in practice.** What AWS resources commonly outlive a CloudFormation stack deletion? Log groups created by Lambda functions (not by the stack), Step Functions execution history, CloudWatch custom metrics, DynamoDB backups, S3 objects in non-empty buckets, ENIs from VPC Lambdas. Give the full checklist and the pattern to clean each.

8. **Teardown time budget.** Under <5 minutes, with no orphans. Is this achievable for the stack shape above? What is the realistic lower bound, and what trade-offs shorten it (pre-built AMIs, fewer VPC-attached Lambdas, skipping Fargate)?

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
