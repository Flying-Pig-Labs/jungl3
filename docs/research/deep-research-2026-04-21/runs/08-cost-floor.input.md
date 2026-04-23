# Research context

You are producing a deep-research report for **Jungl3** (stylized `jungl3`), a product with the following characteristics.

## What Jungl3 is

Jungl3 generates, deploys, and vends pre-built, integrated, "Frankenstein" enterprise applications so product teams can start from a living, working system rather than from a blank page. Teams then **subtract** and reshape the generated system into their real product, instead of additively building from scratch.

Key properties:

- Distributed as an **AWS Marketplace** listing. Customers subscribe, launch a CloudFormation template into their own AWS account, and operate their own Jungl3 instance entirely inside that account. There is no hosted multi-tenant SaaS version of Jungl3 itself.
- Each "Jungle" is a synthetic but believable enterprise environment: microservices, queues, events, stubs, scheduled jobs, seed data, personas, dashboards, audit trails, workflow state transitions, and background activity — all deployed, running, and interacting on day one.
- The v1 domain anchor is loosely **insurance-adjacent case processing** (claims, reviews, approvals, exception handling), but this is explicitly up for pressure-testing.
- The central product thesis is "time to real": time from `subscribe` to the first click on running software that feels like a real enterprise system, not a demo.
- The central failure mode is **plausibility collapse**: the moment a user (builder, judge, buyer) spots that the data, workflows, personas, or system behavior are obviously fake, every other investment loses value.

## Who the research audience is

Jungl3 engineering and product leadership. They want **actionable, decision-ready findings** — concrete recommendations, named trade-offs, and named failure modes — not a survey. Assume they are technically sophisticated. Prefer opinionated synthesis over neutral hedging. Cite named systems, companies, and patterns where useful.

## Output expectations for every research task

Every deep-research report should end with a section titled **"Decision-ready recommendations for Jungl3"** that states, in 5–10 bullets:

- What Jungl3 should do in v1.
- What Jungl3 should explicitly defer past v1.
- The single biggest risk if Jungl3 ignores this topic.
- Any cross-links to the other 11 research topics where this one has knock-on effects.

Treat this as a genuine advisory document. Be direct. It is better to be sharply opinionated and wrong in a named way than to be vaguely comprehensive.
# Topic 8: Cost floor and operational footprint

See `00-context.md` for product framing. Jungl3 runs in the customer's AWS account.

## Research questions

Produce concrete, numbers-based research on the idle-cost and active-cost profile of a synthetic enterprise environment running 24/7 in a customer AWS account. Vibes-based estimates are not useful.

Research:

1. **Idle-cost floor.** For a Jungle with always-on baseline activity — a handful of Lambdas firing on schedule, EventBridge rules, SQS queues polled, DynamoDB tables on demand, a single small ECS/Fargate task for UI, CloudWatch logs — what is the floor in $/month in 2026? Break out by service. Use current AWS pricing.

2. **Cost drivers, ranked.** Which services quietly dominate the bill for a demo-scale enterprise simulation: CloudWatch Logs ingestion and storage, NAT gateway, ALB/CLB, DynamoDB on-demand read/write, Lambda duration, EventBridge scheduler invocations, Step Functions transitions, S3 Put/Get, KMS decrypts, VPC endpoints? Rank and cite per-unit pricing.

3. **"Alive on day one" cost.** What does it cost, per month, to sustain observable background activity — queues moving, events flowing, jobs running, dashboards refreshing, audit logs accumulating — at a level that passes the realism bar from Topic 1? Provide a range.

4. **Sizing for DynamoDB and Lambda.** For believable but cheap activity, what are reasonable DynamoDB provisioning choices (on-demand vs provisioned, GSI counts), Lambda memory/duration targets, and EventBridge rule rates? Cite real benchmarks.

5. **Expensive-by-default choices.** Which observability, security, or architectural defaults quietly become expensive? Specifically call out: CloudWatch Container Insights, X-Ray traces, VPC flow logs, detailed monitoring, NAT Gateways, inter-AZ data transfer, OpenSearch for logs, RDS Multi-AZ when not needed.

6. **Cost-control patterns.** How do comparable "always-on synthetic environment" products (LocalStack Pro, Ephemeral environments, AWS workshop templates, Gruntwork reference architectures) control idle cost? Patterns: scheduled teardowns, aggressive log retention, single-AZ defaults, Fargate Spot, serverless-first, explicit "demo mode" toggles.

7. **A concrete reference bill.** Produce a plausible monthly bill breakdown for a single Jungle instance, at three sizes: minimum-realism, default-realism, maximum-realism. Identify what scales linearly, what steps.

8. **Customer-perception threshold.** Anecdotally, what is the $/month ceiling above which an AWS-native product installed by "labs" teams gets killed in internal cost reviews? Cite industry benchmarks where possible.

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
