# 0010 — Seeder and Reaper patterns for install and teardown

**Status:** Accepted
**Date:** 2026-04-22

## Context

The v1 [Understory](../glossary.md#understory) ships as an AWS Marketplace listing ([ADR 0003](./0003-installable-via-aws-marketplace.md)) that must install in under 10 minutes and tear down in under 5 ([findings.md §1](../research/findings.md)). The ephemeral-capable lifecycle is not a nice-to-have: it is what makes the "time to real" product thesis credible, what lets teams spin up and tear down freely, and what lets a reviewer inspect an install without worrying about residue.

Those SLAs are not free. The 2026-04-22 research cluster — specifically [Report 07](../research/deep-research-2026-04-22/results/07-cloudformation-seeder-reaper.md) — surfaces a set of concrete AWS walls that make a naive implementation fail on day one:

- **The 15-minute Lambda / 1-hour CloudFormation trap.** A synchronous Lambda-backed custom resource that times out at 15 minutes without signaling the pre-signed S3 `ResponseURL` causes CloudFormation to hang for 45 more minutes before rolling back. The first serious seed attempt will hit this.
- **Global PRNG seeds break the moment concurrency changes.** `Faker.seed(1234)` produces different data when insertion order shifts. [ADR 0009](./0009-audit-trail-is-append-only-hash-chained.md)'s hash chain assumes byte-stable seed state; a global seed silently breaks it.
- **Step Functions does not natively start executions mid-workflow.** Seeding the 60 in-flight claims required by [ADR 0006](./0006-v1-domain-anchor-insurance-claims.md) requires a specific authoring pattern (`.waitForTaskToken`) from day one, or seeding becomes impossible retroactively.
- **CloudFormation will not delete non-empty S3 buckets, running Step Functions executions, or Lambda-created CloudWatch Log Groups.** Without a dedicated Reaper, teardown either breaches the 5-minute SLA or fails outright.
- **ALBs and VPC-attached Lambdas are incompatible with these SLAs.** ALB provisioning eats minutes; VPC-attached Lambdas can take up to 20 minutes to release ENIs on teardown.

These are implementation constraints that must be decided structurally. Leaving them ambient invites each service's build to re-derive the pattern — or worse, to pick an incompatible one. [SYNTHESIS.md §3.1](../research/deep-research-2026-04-22/SYNTHESIS.md) names this as the highest-priority follow-on ADR of the seven candidates surfaced by the second research cluster.

## Decision

**The Understory's install-time seeder and teardown-time reaper follow a fixed pattern, and v1 adopts specific architectural bans to meet the <10-minute install and <5-minute teardown SLAs.**

1. **Seeder — async Step Functions handoff.** The CloudFormation custom resource is a thin Lambda that immediately starts a Step Functions execution and returns `SUCCESS` to the CloudFormation `ResponseURL`. The Step Functions execution performs the actual data generation, invokes `.waitForTaskToken` handoffs for in-flight workflow seeding, and signals the `ResponseURL` only on completion (success or failure). The custom-resource Lambda never blocks on data generation.

2. **Per-entity deterministic seeds.** Every seeded entity's attributes are derived from `HMAC-SHA256(install_seed, entity_id)`. No global `Faker.seed()`, `random.seed()`, or `numpy.random.seed()` at module scope. This guarantees byte-stable output regardless of concurrency, which is what [ADR 0009](./0009-audit-trail-is-append-only-hash-chained.md)'s hash chain requires to stay sound across installs.

3. **Workflow seed pattern — `.waitForTaskToken`.** Every state machine authored under [ADR 0008](./0008-workflows-are-state-machines.md) that may need seedable in-flight instances must be authored with callback-token tasks at its major state boundaries. The seeder starts executions from the beginning with deterministic inputs and uses `SendTaskSuccess` / `SendTaskFailure` to fast-forward each execution to the target seeded state. No `seed_mode` branches inside production ASL.

4. **Reaper — dedicated Lambda on stack Delete.** A `reaper-service` Lambda is registered as a custom resource triggered on stack deletion. It executes in parallel:
   - `DeleteObjects` batched at 1,000 per request across all S3 buckets the install owns, including noncurrent versions and delete markers.
   - `ListExecutions` + `StopExecution` on every state machine before CloudFormation attempts state-machine deletion.
   - `DeleteLogGroup` on every `/aws/lambda/jungle3-*` and `/aws/vendedlogs/states/jungle3-*` log group.
   - `AbortMultipartUpload` on any incomplete uploads.

5. **Architectural bans for v1:**
   - **No Application Load Balancers in the install-time critical path.** The admin UI and any public-facing surface use Lambda Function URLs or API Gateway. ALB provisioning is incompatible with the 10-minute install SLA.
   - **No VPC-attached Lambdas in v1.** ENI detachment delays on teardown can reach 20 minutes. Services that would traditionally sit in a VPC (e.g., for RDS access) either do not ship in v1, or access their dependencies through VPC endpoints that do not attach to the Lambda.

6. **Idempotency throughout.** Every seeder write is a DynamoDB conditional write (`attribute_not_exists`). Every state machine execution name is deterministic (`<case_id>-<install_seed_prefix>`) so CloudFormation retries do not create duplicates.

## Consequences

**Enables:**

- The <10-minute install and <5-minute teardown SLAs become mechanically achievable, not aspirational.
- Every service's build inherits a single seeder/reaper pattern rather than re-deriving one per service. The seven v1 services ([ADR 0006](./0006-v1-domain-anchor-insurance-claims.md)) slot into the existing pattern.
- Concurrent seeding stays deterministic because per-entity HMAC seeds are order-independent. [ADR 0009](./0009-audit-trail-is-append-only-hash-chained.md)'s cross-install hash-chain integrity is preserved.
- Seeding in-flight workflow state is possible without leaking seed-only branches into production ASL. [ADR 0008](./0008-workflows-are-state-machines.md) state machines stay clean.
- Teardown is complete. No orphaned S3 objects, no orphaned log groups, no stuck Step Functions executions. Repeated install/teardown cycles leave no residue.

**Forecloses:**

- Synchronous Lambda-backed custom resources for seeding. Even if an initial data volume is small, the pattern is banned so no service accidentally sets the 15-minute-timeout trap later.
- ALBs and VPC-attached Lambdas in v1. Services that need either cannot ship in v1 without an ADR amendment or supersession.
- Global PRNG seeding (`random.seed`, `Faker.seed`, `numpy.random.seed` at module scope). Per-entity HMAC is the only sanctioned determinism primitive.
- State machines authored without callback-token handoffs at major state boundaries. Retrofitting is possible but costly; the authoring discipline belongs at day one.

**Accepts:**

- Authoring `.waitForTaskToken` at every major state-machine boundary is more work than a synchronous inline state machine. The cost is paid once per state machine and returned every time we want to seed, test, or demo mid-workflow state.
- The Reaper is a dedicated service with its own IAM role spanning S3 delete, Step Functions stop, and CloudWatch Logs delete. Its permissions are broad by necessity and must be scoped to the install's own resources via resource-name prefixes.
- HMAC-SHA256 seed derivation adds a small CPU cost per entity at install time. Negligible at the v1 seed scale (thousands of entities).
- No ALB and no VPC Lambda closes off service shapes a future v2 may want. Reopening either requires a new ADR (or an amendment), and must address the install/teardown SLA impact explicitly.
- The seeder Step Functions execution itself is subject to the orphan-eradication rules. The Reaper must stop it during teardown if it is still running.

## Alternatives considered

- **Synchronous Lambda custom resource.** Simple, one component. Rejected — the 15-minute hard cap plus the 1-hour CloudFormation wait on a non-signaled response is a silent-failure trap that destroys the install SLA the first time a seed exceeds 15 minutes.
- **CDK Provider Framework `isCompleteHandler` polling.** A clean async pattern that bypasses the 15-minute cap. Rejected for v1 because it adds CDK as a framework dependency for seeding specifically, and the async Step Functions pattern provides the same property with components we already use for everything else.
- **Global seed with single-threaded seeding.** Preserves determinism by forcing serialized writes. Rejected — multiplies install time by the entity count and blows the 10-minute SLA on any non-trivial seed.
- **Seed-only branches inside production state machines.** A `seed_mode` parameter that fast-forwards state. Rejected — pollutes ASL with test-path branching, degrades auditability, and the callback-token pattern gives the same capability without touching the production definition.
- **Rely on CloudFormation's native resource-deletion order for teardown.** No dedicated Reaper. Rejected — documented behavior is that CloudFormation will not delete non-empty S3 buckets, will not stop running Step Functions executions, and leaves Lambda-created log groups in place. Teardown either fails or takes tens of minutes.
- **Allow ALBs in v1 behind a warm-up pattern.** Possible in principle. Rejected — the 5-minute teardown SLA cannot coexist with ALB target-deregistration delays in our observed worst case. Deferring this to v2 keeps v1 honest.
- **Allow VPC Lambdas with hyperplane ENI pre-provisioning.** AWS has improved VPC Lambda cold starts significantly, but teardown ENI release remains variable. Rejected — occasional 20-minute teardowns destroy the ephemeral-capable lifecycle the product is built on.
