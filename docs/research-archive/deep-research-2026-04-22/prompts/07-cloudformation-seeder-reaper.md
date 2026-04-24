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
