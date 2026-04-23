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
