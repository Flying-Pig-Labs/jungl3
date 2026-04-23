# Jungl3 Seeder & Reaper Architecture: Achieving <10m Install and <5m Teardown SLAs

## Executive Summary

* **INSTALL BOTTLENECKS**: Fargate ENI attachment and IAM eventual consistency routinely push CloudFormation stack creation past the 10-minute SLA. → **Action**: Drop ALBs in favor of Lambda Function URLs for the chat UI, and use `DependsOn` strategically to mask IAM propagation delays during other resource provisioning.
* **SEEDER TIMEOUT RISKS**: A synchronous Lambda-backed custom resource risks hitting the 15-minute hard limit, causing CloudFormation to hang for its default 1-hour timeout and fail the install. → **Action**: Implement an asynchronous seeder using the CloudFormation Provider Framework or an async Step Functions handoff that explicitly signals the pre-signed S3 `ResponseURL` upon completion.
* **DETERMINISM COLLAPSE**: Relying on a single global PRNG seed (e.g., `Faker.seed()`) causes cascading data drift if the insertion order of entities changes, destroying reproducibility. → **Action**: Derive stable, per-entity seeds using `HMAC-SHA256(global_seed || entity_id)` to guarantee stable generation regardless of execution concurrency.
* **PLAUSIBILITY IN TIMESTAMPS**: Uniformly distributed random timestamps immediately trigger plausibility collapse by ignoring business hours and seasonality. → **Action**: Implement a Non-Homogeneous Poisson Process (NHPP) using the Lewis-Shedler thinning algorithm, applying exponential recency, diurnal (9-to-5), and monthly multipliers.
* **IN-FLIGHT WORKFLOW SEEDING**: Step Functions does not natively support starting executions at arbitrary mid-workflow states, and branching logic pollutes the ASL definition. → **Action**: Start executions from the initial state with deterministic inputs and programmatically fast-forward them using `SendTaskSuccess` / `SendTaskFailure` against callback-waiting tasks (TaskTokens).
* **ORPHAN RESOURCE PROLIFERATION**: CloudFormation natively abandons non-empty S3 buckets, implicitly created Lambda CloudWatch Log Groups, and running Step Functions executions, violating the zero-orphan teardown SLA. → **Action**: Deploy a dedicated Reaper Lambda custom resource triggered on stack `Delete` that executes a parallelized, idempotent cleanup of these specific stragglers before the stack deletion proceeds.
* **TEARDOWN SLA VIOLATIONS**: Sequential deletion of 10,000+ S3 objects or waiting for VPC ENI detachment easily breaches the 5-minute teardown budget. → **Action**: Use S3 `DeleteObjects` in batches of 1,000 with high concurrency (e.g., 50 workers) and aggressively terminate all running Step Functions executions via `StopExecution` before attempting state machine deletion.

## 1. Install Time Budget & Critical Path Analysis

Achieving a sub-10-minute install for a stack containing ~7 Lambdas, ~6 DynamoDB tables, ~6 SQS queues, ~3 EventBridge buses, ~4 Step Functions, and a Fargate task requires strict management of CloudFormation's serial bottlenecks.

### IAM Eventual Consistency Delays
IAM role creation and policy attachment suffer from eventual consistency. Any change made in IAM takes time to become visible across all endpoints [1]. If a resource attempts to assume a newly created role too quickly, it will fail. To mitigate this, use the `DependsOn` attribute to explicitly specify dependencies, forcing CloudFormation to operate in a specific order [2]. By creating IAM roles first and making slower resources (like DynamoDB tables) depend on them, the propagation delay is absorbed into the provisioning time of other resources.

### Fargate and ENI Attachment Latency
Fargate tasks require Elastic Network Interfaces (ENIs) to be attached within the VPC. This process, combined with image pulling from ECR, introduces significant latency. A 2GB image over a congested network can take up to 60 seconds to pull [3]. Using `zstd` compression for container images can reduce Fargate startup times by up to 27% [4]. 

### Eliminating the ALB/NLB Provisioning Bottleneck
Application Load Balancers (ALBs) take several minutes to provision and register targets. To hit the <10-minute SLA, Jungl3 must avoid ALBs entirely. Instead, the Fargate chat UI should utilize AWS Cloud Map or be fronted by API Gateway/Lambda Function URLs to eliminate the load balancer provisioning and draining delays.

## 2. Seeder Custom Resource Architecture

The seeder must generate thousands of records post-deploy. A standard Lambda-backed custom resource is dangerous here due to strict timeouts.

### The 15-Minute Lambda vs. 1-Hour CloudFormation Trap
AWS Lambda has a hard maximum execution timeout of 15 minutes [5]. However, CloudFormation waits up to 1 hour for a response from a custom resource by default [6]. If the seeder Lambda times out at 15 minutes without sending a `FAILED` signal to the pre-signed S3 `ResponseURL`, CloudFormation will hang for the remaining 45 minutes before rolling back [5].

### Pattern Comparison: Provider Framework vs. Async Step Functions

| Pattern | Execution Semantics | Timeout Handling | Recommendation for Jungl3 |
| :--- | :--- | :--- | :--- |
| **Standard Lambda** | Synchronous | Fails hard at 15m; causes 1h CFN hang if unhandled. | **Avoid**. Too risky for bulk data generation. |
| **CDK Provider Framework** | Asynchronous (Waiter) | Uses `isCompleteHandler` to poll for completion, bypassing 15m limit. | **Acceptable**, but introduces CDK framework overhead [7]. |
| **Async Step Functions** | Asynchronous | Lambda starts Step Function and immediately returns `SUCCESS`. | **Recommended**. Step Functions handles retries, backoff, and long-running generation safely. |

### Idempotency and Safe Retries via DynamoDB Conditional Writes
If CloudFormation retries the seeder, it must not duplicate data. The seeder must use DynamoDB conditional expressions (e.g., `attribute_not_exists(PK)`) to ensure that writes are idempotent [8] [9].

## 3. Deterministic Data & Timestamp Synthesis

Plausibility collapse occurs if the generated data looks random rather than organic.

### Preventing Drift with HMAC-SHA256 Per-Entity Seeding
Using a global seed (e.g., `Faker.seed(1234)`) is brittle; if the order of entity generation changes due to parallel processing, the generated data shifts entirely [10]. Instead, derive a stable, per-entity seed using `HMAC-SHA256(global_seed || entity_id)` [11] [12]. This guarantees that Policyholder #45 always gets the same name and address, regardless of when or how they are generated.

### NHPP Thinning Algorithm for Realistic Timestamp Spreading
Randomly distributing timestamps over 18 months creates a flat, unrealistic distribution. Jungl3 must use a Non-Homogeneous Poisson Process (NHPP) with the Lewis-Shedler thinning algorithm [13] [14]. The intensity function must combine:
1. **Exponential Recency**: More claims recently, fewer 18 months ago.
2. **Diurnal Bias**: Gaussian bump during business hours (9 AM - 5 PM).
3. **Seasonality**: Multipliers for winter vs. summer months.

## 4. Seeding In-Flight Step Functions

Jungl3 must seed 60 in-flight claims at specific mid-workflow states.

### Fast-Forwarding via TaskTokens and SendTaskSuccess
Step Functions does not support starting an execution at an arbitrary mid-point. Modifying the Amazon States Language (ASL) to include "resume-at" branching logic pollutes the production code. 
The correct pattern is to design the workflow using the Wait for Callback pattern (`.waitForTaskToken`) [15]. The seeder starts the execution from the beginning with deterministic inputs, captures the `taskToken`, and programmatically fast-forwards the state machine to the desired state by calling `SendTaskSuccess` or `SendTaskFailure` [16] [17].

### Rate Limits and StartExecution Quota Management
The `StartExecution` API has a bucket size of 1,300 and a refill rate of 300 per second in major regions (Standard workflows) [18]. Seeding 60 executions is well within this limit, but the seeder must use unique execution names (e.g., `<case_id>-<timestamp>`) to enforce idempotency and prevent duplicate executions during retries [19] [20].

## 5. Reaper Patterns & Orphan Eradication

CloudFormation will fail to delete a stack if certain resources are not in a clean state [21]. A dedicated Reaper Lambda must run on the `Delete` event.

### High-Throughput S3 Emptying
CloudFormation cannot delete a non-empty S3 bucket [22]. The Reaper must list and delete all objects, including noncurrent versions and delete markers [23]. To meet the 5-minute SLA, use the `DeleteObjects` API, which can delete up to 1,000 objects per request [24]. For 10,000 objects, this requires parallelizing the requests across multiple threads. The Reaper must also call `AbortMultipartUpload` to clear incomplete uploads [25].

### Terminating Running Step Functions Executions
A state machine cannot be deleted if it has running executions [26]. The Reaper must call `ListExecutions` [27] and issue `StopExecution` for all `RUNNING` executions before CloudFormation attempts to delete the state machine resource.

### Orphan Resource Checklist

| Resource Type | Orphan Risk | Reaper Action Required |
| :--- | :--- | :--- |
| **S3 Buckets** | Fails deletion if not empty [22]. | Call `DeleteObjects` (up to 1000/req) for all versions/markers [24]. |
| **Step Functions** | Fails deletion if executions are running [26]. | Call `ListExecutions` and `StopExecution` on all active runs. |
| **CloudWatch Logs** | Implicitly created by Lambdas; left behind. | Call `DeleteLogGroup` for all `/aws/lambda/jungle3-*` groups [28]. |
| **VPC ENIs** | Blocks subnet/VPC deletion [29]. | Detach and delete ENIs associated with Lambda security groups [30]. |

## 6. Teardown Time Budget & Optimization

To achieve a <5-minute teardown, the Reaper must execute its tasks in parallel.

### Handling VPC ENI Detachment Delays
When deleting a Lambda attached to a VPC, it can take up to 20 minutes for the ENIs to detach in the background, blocking the deletion of associated Security Groups and Subnets [31]. 
**Optimization**: The Reaper should proactively detach the VPC configuration from the Lambda functions and forcefully delete the ENIs in parallel [32]. If possible, avoid attaching the Lambdas to a VPC entirely unless strictly required for RDS/ElastiCache access.

## Decision-ready recommendations for Jungl3

* **Implement an Async Step Functions Seeder**: Do not use a synchronous Lambda for the custom resource. Have the Lambda trigger a Step Function that handles the data generation and signals the S3 `ResponseURL` upon completion.
* **Use HMAC-SHA256 for Deterministic Seeding**: Abandon global PRNG seeds. Derive all entity attributes using a hash of the global seed and the specific entity ID to ensure order-independent determinism.
* **Fast-Forward Workflows via Task Tokens**: Seed in-flight claims by starting them normally and using `SendTaskSuccess` to advance them to the target state, preserving the purity of the ADR 0008 ASL definitions.
* **Deploy a Parallelized Reaper Lambda**: Triggered on stack deletion, this Lambda must aggressively batch-delete S3 objects (1,000 per call), stop all Step Functions executions, and delete implicit CloudWatch Log Groups.
* **Avoid ALBs and VPC Lambdas**: To hit the <10m install and <5m teardown SLAs, use Lambda Function URLs instead of ALBs, and keep Lambdas out of the VPC to avoid 20-minute ENI detachment delays.
* **Biggest Risk**: Failing to handle the 15-minute Lambda timeout in the custom resource will result in a 1-hour CloudFormation hang, completely destroying the "time to real" product thesis.
* **Cross-Links**: This directly impacts the observability strategy (Topic 11) as the Reaper must clean up the logs, and the Step Functions design (Topic 5) which must utilize `.waitForTaskToken` for the seeder to work.

## References

1. *Implementing “sleep” in CloudFormation | Medium*. https://medium.com/@oleksii.bebych/implementing-sleep-in-the-cloudformation-stack-for-the-delay-caused-by-iam-eventual-consistency-349eae87f8e7
2. *DependsOn attribute - AWS CloudFormation*. https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-attribute-dependson.html
3. *Taming Cold Starts on AWS Fargate: The Architecture Behind ...*. https://aws.plainenglish.io/taming-cold-starts-on-aws-fargate-the-architecture-behind-sub-5-second-task-launches-622ebd73b051
4. *http://faun.pub/improving-aws-fargate-task-startup-times-1d348601c46d*. http://faun.pub/improving-aws-fargate-task-startup-times-1d348601c46d
5. *Troubleshoot custom resource failures in CloudFormation*. https://repost.aws/knowledge-center/cfn-troubleshoot-custom-resource-failures
6. *Create custom provisioning logic with custom resources*. https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html
7. *aws-cdk-lib.custom_resources module*. https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources-readme.html
8. *Idempotency - Powertools for AWS Lambda (TypeScript)*. https://docs.aws.amazon.com/powertools/typescript/2.1.1/utilities/idempotency
9. *DynamoDB condition expression CLI example - Amazon DynamoDB*. https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
10. *Seeding the generator in Python's "faker" module not ...*. https://stackoverflow.com/questions/41619709/seeding-the-generator-in-pythons-faker-module-not-working-as-expected
11. *hmac — Keyed-Hashing for Message Authentication*. https://docs.python.org/3/library/hmac.html
12. *HMAC - Wikipedia*. https://en.wikipedia.org/wiki/HMAC
13. *7.6 Simulation and Prediction | A Very Short Course on Time ...*. https://bookdown.org/rdpeng/timeseriesbook/simulation-and-prediction.html
14. *thinning: Thinning Algorithm Visualization in simEd ...*. https://rdrr.io/cran/simEd/man/thinning.html
15. *What is Step Functions? - AWS Step Functions*. https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-redrive-executions.html
16. *SendTaskSuccess - AWS Step Functions*. https://docs.aws.amazon.com/step-functions/latest/apireference/API_SendTaskSuccess.html
17. *SendTaskFailure - AWS Step Functions*. https://docs.aws.amazon.com/step-functions/latest/apireference/API_SendTaskFailure.html
18. *Step Functions service quotas - AWS Documentation*. https://docs.aws.amazon.com/step-functions/latest/dg/service-quotas.html
19. *StartExecution - AWS Step Functions*. https://docs.aws.amazon.com/step-functions/latest/apireference/API_StartExecution.html
20. *Avoiding Duplicate Executions in AWS Step Functions — My ...*. https://medium.com/@vigneshwar.vicky.war/avoiding-duplicate-executions-in-aws-step-functions-my-favorite-idempotency-trick-6097a612b4ea
21. *How to Handle CloudFormation Stack Deletion Failures*. https://oneuptime.com/blog/post/2026-02-12-cloudformation-stack-deletion-failures/view
22. *Emptying a general purpose bucket - Amazon Simple Storage Service*. https://docs.aws.amazon.com/AmazonS3/latest/userguide/empty-bucket.html
23. *Deleting object versions from a versioning-enabled bucket*. https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html
24. *DeleteObjects - Amazon Simple Storage Service*. https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjects.html
25. *abort-multipart-upload — AWS CLI 2.9.6 Command Reference*. https://awscli.amazonaws.com/v2/documentation/api/2.9.6/reference/s3api/abort-multipart-upload.html
26. *DeleteStateMachine - AWS Step Functions*. https://docs.aws.amazon.com/step-functions/latest/apireference/API_DeleteStateMachine.html
27. *ListExecutions - AWS Step Functions*. https://docs.aws.amazon.com/step-functions/latest/apireference/API_ListExecutions.html
28. *DeleteLogGroup - Amazon CloudWatch Logs*. https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DeleteLogGroup.html
29. *CloudFormation Stuck Deleting Stack? Fix Lambda ENI Cleanup ...*. https://www.codegenes.net/blog/cloudformation-is-waiting-for-networkinterfaces-associated-with-the-lambda-function-to-be-cleaned-up/
30. *Delete a network interface - Amazon Elastic Compute Cloud*. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/delete_eni.html
31. *when deleting lambdas in a VPC, detach security group ...*. https://github.com/pulumi/pulumi-aws/issues/2642
32. *A CLI tool to force delete CloudFormation Stacks*. https://dev.to/k_goto/a-cli-tool-to-force-delete-cloudformation-stacks-3808