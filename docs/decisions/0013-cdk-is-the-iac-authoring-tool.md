# 0013 — CDK (TypeScript) is the IaC authoring tool

**Status:** Accepted
**Date:** 2026-11-25

## Context

[`CLAUDE.md`](../../CLAUDE.md) §11 #7 left the infrastructure authoring tool open: CloudFormation directly, CDK, SAM or Pulumi. The [v0.1 plan](../reviews/2026-04-24-v0.1-plan.md) scheduled a comparison exercise (B2) and defaulted to raw CloudFormation in the meantime.

The founder chose CDK on 2026-11-25, when `control-plane/` started, without running the B2 comparison. The [2026-04-25 hypothesis revision](../reviews/2026-04-25-product-hypothesis-revision.md) had already leaned toward CDK because `cdk synth` gives an agent a fast feedback loop.

## Decision

Jungl3 infrastructure is authored in **AWS CDK, in TypeScript**. Each domain subdir that owns infrastructure carries its own CDK app.

One rule follows from [ADR 0003](./0003-installable-via-aws-marketplace.md): **anything launched inside the install at run time must be a plain CloudFormation template with no dependency on the CDK bootstrap stack or CDK assets.** The Jungle stack is the first case. It is written in CDK, synthesized with `BootstraplessSynthesizer` into a parameterized template, and launched by the vend Lambda through the CloudFormation API (`control-plane/lib/jungle-template.ts`). A test asserts that the template is self-contained.

## Consequences

- The B2 comparison in the v0.1 plan is closed without being run. No raw-CloudFormation version of the vend flow exists to compare against.
- `cdk deploy` of the Control Plane requires a bootstrapped account. That is acceptable for the dev account. It is **not** settled for customers: the Marketplace template must install without `cdk bootstrap`, which stays open under §11 #2 and #8.
- Lambda code reaches a Jungle as S3 objects passed by parameter, published as assets of the Control Plane stack.
- Tests assert on synthesized templates (`aws-cdk-lib/assertions`), so guardrails such as permission boundaries and rate caps are checked without an AWS account.

## Related

- [`../../control-plane/README.md`](../../control-plane/README.md)
- [ADR 0010](./0010-seeder-and-reaper-patterns.md) — seeder and reaper patterns the stacks follow in part.
