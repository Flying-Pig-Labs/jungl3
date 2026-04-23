> **What this is:** Third-party analyst memo arguing Jungl3's v1 should be a single installable operational slice delivered via AWS Marketplace, with a specific AWS service set.
> **Captured:** 2026-04-21.
> **What it argued:** v1 is a single installable operational slice delivered via AWS Marketplace (CloudFormation, ECS/Fargate packaging), with a specific recommended AWS service set (React + API Gateway + Lambda + DynamoDB + S3 + EventBridge + SQS + Step Functions + Cognito + CloudWatch + AppConfig).
> **Status:** Its load-bearing conclusion — installable rather than hosted — informed and was accepted by [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md). Its specific AWS service recommendations, packaging path, feature-vs-complexity trade-offs, and v1 scoping are **not** adopted as repo policy — they are open questions tracked in `CLAUDE.md` §11.
> **How to read:** as input, not as canon. Specific recommendations do not become decisions until they go through the normal ADR path.

---

Requirements source.

**Bottom line**

The best v1 is not “mini enterprise everything.” It is a **single installable operational slice** with one believable business domain, a handful of real services, a few intentionally visible stubs, seeded users and records, and background activity that continuously changes system state. On AWS, the most practical shape is **React app + API Gateway + Lambda + DynamoDB + S3 + EventBridge + SQS + Step Functions + Cognito + CloudWatch**, with **AppConfig** for flags and tunable behavior. That gives you a credible async enterprise feel without dragging in a whole platform religion. AWS Marketplace container products support ECS, EKS, and Fargate, but AWS has discontinued Quick Launch for Helm chart deployments on EKS as of March 1, 2026, which makes an **ECS/Fargate-first distribution path** the cleaner v1 choice for packaging and launch. ([AWS Documentation][1])

## Recommended v1 operating model

[Inference] The environment should feel like a regulated enterprise because it has:

1. authenticated users with roles,
2. domain records already in motion,
3. async workflows and retries,
4. visible integrations and failures,
5. audit-style state changes,
6. dashboards and logs,
7. safe fake data.

It does **not** need full policy engines, real compliance controls, real third-party dependencies, or a sprawling microservice zoo. Those things impress architects for seven minutes and then bankrupt the prototype in complexity.

## Minimum viable realism

[Inference] The “minimum viable realism” threshold is:

* a **working line-of-business app shell** with seeded records
* **5 to 8 core domain entities**
* **3 to 5 user roles**
* **4 to 6 async event types**
* **2 to 4 visible downstream stubs**
* **scheduled background activity**
* **observable queues, failures, and state transitions**
* **basic authz/authn and audit history**
* **feature flags/config knobs**
* **logs and simple operational dashboards**

Anything below that feels like a toy. Anything far above that starts becoming a fake enterprise theme park.

## Proposed reference architecture

[Inference] Use this shape for v1:

**Frontend**

* React SPA hosted on S3 + CloudFront, or containerized web app on ECS if you want a single packaged runtime.

**Auth**

* Amazon Cognito User Pools for app auth.
* Use Cognito groups for role mapping such as adjuster, supervisor, operations, admin, partner.
* Put JWT authorizers on API Gateway HTTP API routes. Cognito user pools are an OIDC IdP, and API Gateway HTTP APIs support JWT authorizers with scopes. ([AWS Documentation][2])

**API**

* API Gateway HTTP API in front of Lambda.
* Keep external-facing APIs separate from internal admin/simulator APIs by route namespace, not by separate gateways, in v1. ([AWS Documentation][3])

**Application compute**

* Lambda for synchronous CRUD and lightweight orchestration.
* Step Functions only for the handful of long-running or multi-step workflows that users should visibly inspect.
* EventBridge for domain events and scheduled synthetic activity.
* SQS queues between services that need retry, buffering, or failure visibility.
* Use DLQs and partial batch response patterns for SQS-driven Lambdas. EventBridge Scheduler also supports DLQs. ([AWS Documentation][4])

**Data**

* DynamoDB as system of record for operational entities.
* S3 for documents, attachments, export artifacts, simulation payloads, and large blobs because DynamoDB item size is capped at 400 KB and AWS recommends storing blobs in S3 with references in DynamoDB. ([AWS Documentation][5])

**Configuration**

* AWS AppConfig for feature flags, simulator rates, failure injection percentages, and scenario toggles. AppConfig supports feature flags and multi-variant flags and can be deployed gradually. ([AWS Documentation][6])

**Observability**

* CloudWatch Logs, metrics, alarms, and dashboards.
* CloudWatch dashboards are enough for v1. QuickSight is optional later if you want polished business analytics or embedded exec dashboards. ([AWS Documentation][7])

## Proposed service catalog

### Must-have for v1

[Inference]

1. **Identity service**

   * Cognito user pool
   * seeded users and groups
   * role claims in tokens

2. **Work item service**

   * canonical record lifecycle
   * search/list/detail/update
   * comments, notes, attachments

3. **Party service**

   * customers, internal users, external partners
   * contact preferences
   * relationship links to work items

4. **Task and queue service**

   * manual review tasks
   * assignment, reassignment, SLA clock
   * status transitions

5. **Document service**

   * upload/download fake documents
   * metadata only in DynamoDB, blobs in S3

6. **Event and notification service**

   * domain events on EventBridge
   * user notifications table + email/webhook stubs

7. **Simulation service**

   * scheduled record creation
   * state mutation jobs
   * failure injection
   * backfill/refresh

8. **Integration stub service**

   * policy/account lookup stub
   * payment/disbursement stub
   * document verification stub
   * messaging/email/SMS stub

9. **Ops/admin service**

   * seed/reset environment
   * replay event
   * inspect queue failures
   * toggle flags
   * inspect stub calls

### Nice to have later

* embedded analytics with QuickSight
* GenAI summary assistant on fake records
* workflow designer
* rules engine
* full-text search/OpenSearch
* partner portal
* synthetic voice calls/chat interactions
* multi-tenant tenant isolation model

### Avoid for now

* EKS-first control plane
* service mesh
* Kafka/MSK
* real payment processors
* real external claims/policy systems
* heavy MDM
* full ABAC or policy-as-code engine
* lakehouse/data mesh theater
* real secrets-heavy B2B integrations

## Natural service boundaries

[Inference] The right boundaries for v1 are functional, not aspirational:

* **Identity**
* **Work items**
* **Parties**
* **Tasks**
* **Documents**
* **Events/notifications**
* **Simulation**
* **Integrations**
* **Admin/ops**

That is enough to feel like an enterprise ecosystem. More than that and you’re mostly simulating Conway’s Law for sport.

## Canonical data model

[Inference] Use a small canonical model centered on one operational object. If you want the environment to feel insurance-adjacent without dragging in actual regulated data, the primary object can be a generic **Case** or **Work Item**.

### Core entities

1. **WorkItem**

   * workItemId
   * type
   * status
   * priority
   * createdAt
   * updatedAt
   * assignedTeam
   * assignedUser
   * queue
   * sourceChannel
   * summary
   * riskScore
   * dueAt
   * tags

2. **Party**

   * partyId
   * partyType: customer, internal_user, partner, vendor
   * displayName
   * contactMethods
   * preferences
   * addressRegion
   * linkedWorkItems

3. **Account**

   * accountId
   * accountType
   * status
   * ownerPartyId
   * coveragePlan or productPlan
   * inceptionDate
   * renewalDate

4. **Task**

   * taskId
   * workItemId
   * taskType
   * state
   * assignee
   * dueAt
   * resolutionCode

5. **Document**

   * documentId
   * workItemId
   * docType
   * storageUri
   * uploadedBy
   * checksum
   * verificationStatus

6. **Event**

   * eventId
   * eventType
   * aggregateType
   * aggregateId
   * timestamp
   * source
   * correlationId
   * payloadRef

7. **Notification**

   * notificationId
   * recipientId
   * channel
   * templateId
   * sendStatus
   * sentAt

8. **AuditEntry**

   * auditId
   * actorType
   * actorId
   * action
   * targetType
   * targetId
   * beforeRef
   * afterRef
   * timestamp

9. **ExternalRequest**

   * requestId
   * stubSystem
   * requestType
   * latencyMs
   * outcome
   * responseCode
   * correlationId

### Data classes

[Inference]

* **Mutable operational entities:** WorkItem, Task, Document, Notification
* **Reference entities:** product plans, status catalogs, reason codes, regions, teams
* **Generated activity data:** events, audits, stub calls, job runs, queue failures, synthetic user actions

### Storage pattern

[Inference] Use a **small-number-of-tables design**, not dogmatic single-table cosplay. AWS documents say single-table design is useful when access patterns benefit from locality, but it is not mandatory. For v1, I’d use:

* `core-operational` table for WorkItem, Task, Party, Account, Notification, Audit
* `event-log` table if you want easy event exploration
* S3 for documents and bulk scenario data ([AWS Documentation][5])

That keeps the model comprehensible for builders, which matters more than impressing DynamoDB purists on LinkedIn.

## API surface

[Inference] Default APIs should be boring and obvious.

### External-facing app APIs

* `POST /auth/login` handled by Cognito client flow
* `GET /me`
* `GET /work-items`
* `GET /work-items/{id}`
* `POST /work-items`
* `PATCH /work-items/{id}`
* `POST /work-items/{id}/assign`
* `POST /work-items/{id}/status-transition`
* `GET /work-items/{id}/tasks`
* `POST /tasks/{id}/complete`
* `GET /work-items/{id}/documents`
* `POST /documents/upload`
* `GET /notifications`
* `POST /feedback`

### Internal/admin APIs

* `POST /admin/seed`
* `POST /admin/reset`
* `POST /admin/simulations/run`
* `PATCH /admin/flags`
* `GET /admin/events`
* `GET /admin/queue-failures`
* `POST /admin/replay-event`
* `GET /admin/stub-calls`

### Stub APIs

* `GET /stub/account/{id}`
* `POST /stub/verification/check`
* `POST /stub/payment/disburse`
* `POST /stub/messaging/send`

### Auth model

Use Cognito user pools with groups for roles, and JWT authorizers on HTTP API routes with scopes where needed. That is a believable simplified enterprise model without dragging in identity pools unless users need direct AWS resource access from the client. ([AWS Documentation][2])

## Event taxonomy

[Inference] You want just enough events to show async life.

### Domain events

* `workitem.created`
* `workitem.updated`
* `workitem.assigned`
* `workitem.status.changed`
* `task.created`
* `task.completed`
* `document.uploaded`
* `document.verified`
* `notification.requested`
* `notification.sent`
* `external.requested`
* `external.completed`

### Operational events

* `simulation.tick`
* `seed.completed`
* `workflow.failed`
* `queue.retry.exhausted`
* `dlq.message.arrived`
* `featureflag.changed`

### Async flows to include

1. New work item created
2. Assignment task generated
3. Background verification call to stub
4. Status advances or manual-review task created
5. Notification sent
6. Audit written

### Failure patterns to include

* retryable stub timeout
* validation failure
* poison message to DLQ
* partial batch failure on SQS consumer
* delayed reprocessing

EventBridge for domain fan-out and SQS for work queues is the right split. Step Functions should be used only for workflows users actually benefit from visualizing. AWS recommends Step Functions for orchestrated multi-step workflows and supports EventBridge integration for workflow events. ([AWS Documentation][4])

## Stubbed integration list

[Inference] These should be visible, inspectable, and replaceable.

### Must-have stubs

* **Account/Policy system stub**

  * lookup by account number
  * return plan, status, holder, effective dates
  * configurable stale data or mismatch responses

* **Document verification stub**

  * accepts document metadata
  * returns pass, fail, manual review
  * configurable latency and random failure rate

* **Payment/disbursement stub**

  * accepts approval requests
  * returns pending, approved, failed
  * delayed callbacks supported

* **Messaging stub**

  * email/SMS/web notification simulation
  * delivery success/failure events

### Nice later

* fraud/risk scoring stub
* CRM stub
* reporting warehouse feed
* partner API gateway stub

### Realism level for stubs

[Inference]
Each stub should support:

* normal response
* slow response
* malformed response
* transient 5xx
* permanent business-rule failure
* callback/webhook where relevant

That is enough realism to force builders to think like adults without actually giving them adult problems.

## Seeded user and persona model

[Inference]

### Roles

* **BuilderUser**: standard front-line operator
* **SupervisorUser**: reassign, override, approve
* **OpsAdmin**: flags, replay, seed, inspect
* **PartnerUser**: limited external view
* **AuditorObserver**: read-only audit/log views

### Seeded personas

* 25 to 100 fake customers
* 10 to 20 internal users across teams
* 3 to 5 partner/vendor identities
* 200 to 1,000 work items with mixed states
* 500 to 5,000 event records
* 50 to 200 notifications
* 25 to 100 “problem cases” intentionally seeded

### Day-one realism

The environment should already contain:

* open queues
* aging tasks
* overdue items
* recent notifications
* failed verifications
* retryable stub failures
* work items changed overnight by scheduled jobs

## Synthetic data and background activity

[Inference] The system feels alive when data keeps moving.

### Seed strategy

* baseline deterministic seed set for demos
* optional randomized expansion pack
* scenario packs: “normal,” “backlog spike,” “partner outage,” “verification errors”

### Continuous background behaviors

* every 5 minutes: create a few new work items
* every 10 minutes: run verification on pending docs
* every 15 minutes: send notifications
* hourly: mutate SLA risk, age queues, trigger some escalations
* daily: generate summary stats and dashboard tiles

EventBridge Scheduler plus Lambda is enough here, and Scheduler supports DLQs if scheduled targets fail. ([AWS Documentation][8])

## AWS implementation choices

### Best fit for v1

* **CloudFront + S3** for SPA hosting
* **API Gateway HTTP API** for APIs
* **Cognito User Pools** for auth
* **Lambda** for business logic
* **DynamoDB** for operational store
* **S3** for docs/exports/scenario packs
* **EventBridge** for domain events and schedules
* **SQS + DLQ** for async work
* **Step Functions** for 1 to 3 visible workflows
* **CloudWatch** for logs, metrics, dashboards
* **AppConfig** for flags and simulation tuning

### Avoid to keep packaging sane

* EKS as primary runtime
* MSK/Kafka
* Neptune
* OpenSearch on day one
* QuickSight as a dependency for core UX
* Cognito Identity Pools unless direct AWS creds are required
* multi-account landing-zone complexity in v1

### Marketplace guidance

[Inference] Package the app as a **container-based product with ECS/Fargate deployment instructions/templates** or as a simple CloudFormation-driven install path if you distribute outside Marketplace. Current AWS Marketplace guidance supports container products across ECS, EKS, and Fargate, but the EKS Quick Launch path has gotten less friendly in 2026, so ECS/Fargate is the least annoying path for a broadly installable v1. ([AWS Documentation][1])

## Realism value vs implementation complexity

[Inference]

| Component                        | Realism value | Complexity | Recommendation |
| -------------------------------- | ------------: | ---------: | -------------- |
| Auth with roles/groups           |          High |        Low | Must-have      |
| Seeded operational records       |          High |        Low | Must-have      |
| Async queues + retries + DLQ     |          High |     Medium | Must-have      |
| Event bus + event log view       |          High |     Medium | Must-have      |
| Visible integration stubs        |          High |     Medium | Must-have      |
| Background schedulers            |          High |        Low | Must-have      |
| Document handling                |        Medium |        Low | Must-have      |
| Audit trail                      |          High |        Low | Must-have      |
| Feature flags/AppConfig          |        Medium |        Low | Must-have      |
| Step Functions for 2-3 workflows |        Medium |     Medium | Must-have      |
| Embedded analytics/QuickSight    |        Medium |     Medium | Later          |
| Search/OpenSearch                |        Medium |       High | Later          |
| Real-time websockets             |       Low-Med |     Medium | Later          |
| Rules engine                     |        Medium |       High | Later          |
| Multi-tenant isolation           |        Medium |       High | Later          |
| EKS/service mesh                 |    Low for v1 |       High | Avoid now      |
| Kafka/event streaming platform   |    Low for v1 |       High | Avoid now      |

## Concrete v1 blueprint

[Inference]

### Service set

* web-app
* identity
* work-item-api
* task-api
* document-api
* notification-service
* simulation-service
* stub-service
* admin-ops-api
* event-router

### Initial workflows

1. **Create and triage work item**
2. **Upload and verify document**
3. **Assign or escalate task**
4. **Approve and trigger fake disbursement**
5. **Notify customer/partner**
6. **Replay failed external interaction**

### Initial dashboards

* queue depth by status
* overdue tasks
* verification pass/fail
* stub latency/error rate
* notifications sent/failed
* event volume by type
* daily synthetic activity

### Initial scenario packs

* happy path
* backlog surge
* document outage
* partner timeout
* supervisor override burst

## Defer to later

[Inference]
Do not build these in v1:

* real policy engine
* full regulatory controls framework
* detailed document OCR/intelligence
* advanced search and semantic retrieval
* real billing or payment rails
* external partner onboarding workflows
* data lake, warehouse, or lakehouse
* fine-grained entitlements beyond role + scope
* cross-account tenant-per-team model
* Kubernetes-native deployment as the default path

## Final recommendation

[Inference] The right v1 is a **single-domain operational sandbox** with:

* one real app
* one real auth model
* one real operational store
* one real event backbone
* one visible async queue pattern
* one document model
* 3 to 4 integration stubs
* seeded users and records
* scheduled background motion
* admin controls and dashboards

That is the point where teams stop feeling like they are editing a demo and start feeling like they are changing a living system. Everything beyond that should earn its keep.

[1]: https://docs.aws.amazon.com/marketplace/latest/userguide/container-based-products.html?utm_source=chatgpt.com "Container-based products on AWS Marketplace - AWS Marketplace"
[2]: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html?utm_source=chatgpt.com "Amazon Cognito user pools - Amazon Cognito"
[3]: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html?utm_source=chatgpt.com "Control access to HTTP APIs with JWT authorizers in API Gateway - Amazon API Gateway"
[4]: https://docs.aws.amazon.com/step-functions/latest/dg/eventbridge-integration.html?utm_source=chatgpt.com "Automating Step Functions event delivery with EventBridge - AWS Step Functions"
[5]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-table-design.html?utm_source=chatgpt.com "Best practices for DynamoDB table design - Amazon DynamoDB"
[6]: https://docs.aws.amazon.com/appconfig/latest/userguide/what-is-appconfig.html?utm_source=chatgpt.com "What is AWS AppConfig? - AWS AppConfig"
[7]: https://docs.aws.amazon.com/prescriptive-guidance/latest/implementing-logging-monitoring-cloudwatch/cloudwatch-dashboards-visualizations.html?utm_source=chatgpt.com "Dashboards and visualizations with CloudWatch - AWS Prescriptive Guidance"
[8]: https://docs.aws.amazon.com/scheduler/latest/UserGuide/configuring-schedule-dlq.html?utm_source=chatgpt.com "Configuring a schedule's dead-letter queue in EventBridge Scheduler - EventBridge Scheduler"
