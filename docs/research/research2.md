> **What this is:** A v1 architecture spec derived from [research1.md](./research1.md). Written as if it were a build plan.
> **Captured:** 2026-04-21.
> **Status:** **Not adopted as architecture.** No ADR has consumed it. It substantially overlaps open questions in `../../CLAUDE.md` §11 (stack structure, Control Plane runtime, AWS service set) and is a strong candidate for future ADRs, but until those ADRs exist, nothing here is repo policy.
> **How to read:** as a proposal. Do not cite this file as justification for a decision; cite an ADR or an open question.

---

Let’s turn the idea into something engineers can actually build instead of just admiring from a distance like a concept car. This is based on our research brief and the v1 architecture direction already established from it. 

# V1 architecture spec

## 1. Purpose

Build an AWS-first installable innovation environment that feels like a living regulated enterprise system on day one, without carrying real regulated data, real compliance burden, or an absurd operating footprint.

The environment should let teams:

* log in as believable personas,
* interact with a running operational application,
* inspect APIs, queues, events, logs, and stubs,
* modify workflows and UI,
* ship changes against a system that already has motion, history, and operational texture.

## 2. Product principles

### Must feel real

The system needs active records, state transitions, async processing, notifications, failures, and audit traces.

### Must stay small

V1 should be one operational domain slice, not a fake Fortune 50 super-platform.

### Must be inspectable

Teams should be able to see the state, the events, the queues, the stubs, and the knobs.

### Must be safe

Only synthetic data. No real regulated data. No unnecessary compliance-like controls pretending to be useful.

### Must be extensible

The domain should be replaceable later, but the platform skeleton should remain reusable.

## 3. Reference architecture

### Frontend

* React SPA
* CloudFront + S3 for hosting
* Authenticated via Cognito
* Calls API Gateway HTTP APIs
* Includes end-user app plus simple admin/ops views

### Backend

* API Gateway HTTP API
* Lambda functions for application endpoints
* DynamoDB for core operational storage
* S3 for document blobs, synthetic scenario packs, exports, and seed assets
* EventBridge for domain events and scheduled synthetic activity
* SQS for async work queues and DLQs
* Step Functions for a few visible multi-step workflows
* CloudWatch for logs, metrics, alarms, dashboards
* AppConfig for feature flags and simulation controls

## 4. Domain shape

The primary domain object should be generic enough to resemble insurance-style enterprise operations without hard-coding the whole product around insurance branding.

Recommended v1 anchor object:

**Work Item / Case**

This gives you:

* intake,
* review,
* document submission,
* routing,
* approvals,
* notifications,
* downstream lookups,
* payments/disbursements,
* audit history,
* queue management.

That is enough to feel enterprise-real.

## 5. Core actors

### Internal roles

* Builder Operator
* Supervisor
* Operations Admin
* Auditor Observer

### External-ish roles

* Partner User
* Customer User, optional in v1 if you want a lightweight self-service flow

These should be seeded and ready on day one.

## 6. Core v1 capabilities

### User auth and role-based access

Users can sign in, switch personas if allowed, and access role-appropriate views.

### Work item lifecycle

Users can view, create, update, assign, escalate, and complete work.

### Task management

Tasks are generated automatically or manually and routed to people or queues.

### Document handling

Users can upload fake documents, inspect metadata, and trigger verification.

### Event-driven processing

Background processors react to state changes and scheduled events.

### Stubbed downstream systems

The app can call inspectable fake services that behave like enterprise dependencies.

### Synthetic operations

The environment continues generating events and changing data even when no one is clicking around.

### Admin and observability

Teams can inspect events, queues, failures, configs, and synthetic job behavior.

# Service-by-service build plan

## 1. Identity service

### Purpose

Provide believable but simple enterprise auth.

### Responsibilities

* user authentication
* role/group assignment
* token issuance
* seeded users
* role claims for API access

### AWS pattern

* Cognito User Pool
* Cognito groups mapped to roles
* JWT validation at API Gateway

### V1 scope

* seeded users for each persona
* role-based route protection
* optional “switch user” helper in non-prod demo mode

### Defer

* SSO/SAML
* advanced ABAC
* enterprise federation complexity

---

## 2. Work item service

### Purpose

Core operational system of record.

### Responsibilities

* create/read/update work items
* status transitions
* priority/risk updates
* assignment metadata
* timeline/history exposure

### Core fields

* workItemId
* type
* status
* priority
* summary
* sourceChannel
* assignedUser
* assignedQueue
* createdAt
* updatedAt
* dueAt
* riskScore
* relatedPartyIds
* tags

### AWS pattern

* Lambda + DynamoDB
* EventBridge publish on changes

### V1 endpoints

* list work items
* get work item
* create work item
* patch work item
* assign work item
* change status
* get timeline

### Defer

* full-text search
* complex workflow engine
* huge reporting surface

---

## 3. Party and account service

### Purpose

Provide believable surrounding context for operational records.

### Responsibilities

* manage customer-like parties
* manage internal users and partner references
* associate parties to work items
* expose account/product context

### Core entities

* Party
* Account

### AWS pattern

* Lambda + DynamoDB

### V1 endpoints

* get party
* get account
* list related work items
* lookup by reference id

### Defer

* customer master data sophistication
* household/account hierarchy depth
* deduplication engine

---

## 4. Task and queue service

### Purpose

Make the system feel operational rather than just CRUD.

### Responsibilities

* generate tasks
* assign tasks to people or queues
* track due dates and escalations
* expose backlog views

### Core fields

* taskId
* workItemId
* taskType
* state
* assignee
* queue
* dueAt
* resolutionCode
* createdAt
* completedAt

### AWS pattern

* Lambda + DynamoDB
* SQS for async task generation
* EventBridge for lifecycle events

### V1 behavior

* task auto-creation on certain work item states
* overdue task aging
* queue escalation rules
* supervisor reassignment

### Defer

* workforce optimization
* advanced SLA engine
* calendar-aware routing

---

## 5. Document service

### Purpose

Introduce believable attachment and verification workflows.

### Responsibilities

* upload fake documents
* store document metadata
* expose document status
* trigger verification flow

### Core fields

* documentId
* workItemId
* docType
* storageUri
* verificationStatus
* uploadedBy
* checksum
* createdAt

### AWS pattern

* S3 for blobs
* DynamoDB for metadata
* Lambda for upload coordination
* EventBridge or SQS to kick off verification

### V1 behavior

* upload fake PDF/image docs
* mark documents pending verification
* send to verification stub
* generate pass/fail/manual-review result

### Defer

* OCR
* document classification ML
* retention/legal hold sophistication

---

## 6. Notification service

### Purpose

Make activity visible and enterprise-like.

### Responsibilities

* create outbound notifications
* track status
* log delivery outcomes
* simulate user-facing notices

### Channels

* in-app
* email stub
* SMS stub

### AWS pattern

* EventBridge consumer + SQS worker + DynamoDB
* optionally SNS later, but not required for v1

### V1 behavior

* send notification on assignment, escalation, approval, verification result
* show notification history in UI
* inject occasional failures

### Defer

* real provider integrations
* preference centers
* template management UI

---

## 7. Stub integration service

### Purpose

Represent external dependencies without making the product miserable to operate.

### Stub set for v1

* account/policy lookup stub
* document verification stub
* payment/disbursement stub
* messaging stub

### Required behaviors

* normal response
* transient failure
* permanent business-rule failure
* variable latency
* webhook/callback when useful

### AWS pattern

* small Lambda-backed endpoints behind API Gateway
* configurable by AppConfig
* every stub call logged to DynamoDB or CloudWatch for inspection

### UI support

Admin view should expose:

* recent stub calls
* status code patterns
* latency distribution
* failure injection settings

### Defer

* dozens of downstream systems
* real external network dependencies

---

## 8. Event and workflow service

### Purpose

Give the platform life, history, and inspectable async behavior.

### Responsibilities

* emit domain events
* route events
* trigger workflows
* support replay and failure inspection

### Event taxonomy

* workitem.created
* workitem.updated
* workitem.assigned
* workitem.status.changed
* task.created
* task.completed
* document.uploaded
* document.verified
* notification.requested
* notification.sent
* external.requested
* external.completed
* workflow.failed
* simulation.tick

### AWS pattern

* EventBridge for fanout
* SQS for retryable processing
* DLQs for exhausted retries
* Step Functions for a few inspectable orchestrations

### V1 workflows

* intake and triage
* document verification
* approval and disbursement
* escalation and supervisor override

### Defer

* event sourcing purism
* streaming analytics
* Kafka

---

## 9. Simulation service

### Purpose

Make the system feel alive even with no human users.

### Responsibilities

* seed deterministic baseline data
* generate ongoing activity
* mutate records
* trigger failures and recoveries
* load scenario packs

### Scenario packs

* normal operations
* backlog surge
* document outage
* downstream timeout
* notification failure burst

### Background jobs

* create new work items
* update queue aging
* run document verification
* generate notifications
* escalate overdue tasks
* inject controlled failures
* refresh dashboard summaries

### AWS pattern

* EventBridge Scheduler + Lambda
* AppConfig for rates and probabilities

### Defer

* sophisticated agent-based simulation
* predictive operational models
* multi-environment coordination

---

## 10. Admin and observability service

### Purpose

Let users and builders inspect how the system works.

### Responsibilities

* seed/reset environment
* run scenario pack
* view events
* inspect queue failures
* replay events
* inspect flags
* monitor synthetic job activity

### Core admin views

* recent domain events
* DLQ messages
* retry failures
* stub call log
* feature flags
* scenario control panel
* synthetic job history

### AWS pattern

* thin admin API + CloudWatch + DynamoDB-backed diagnostic views

### Defer

* enterprise observability suite integration
* advanced tracing stack
* full ops command center

# Canonical data model

## Core entities

* WorkItem
* Party
* Account
* Task
* Document
* Notification
* AuditEntry
* ExternalRequest
* EventRecord
* UserProfile
* QueueSummary, optional materialized view

## Data categories

### Mutable operational

* WorkItem
* Task
* Document
* Notification

### Reference

* status catalog
* task types
* teams
* queues
* product plans
* region codes
* reason codes

### Generated activity

* EventRecord
* AuditEntry
* ExternalRequest
* SyntheticJobRun

## Storage recommendation

### DynamoDB tables

* `core-operational`
* `event-log`
* `simulation-control`, optional
* `admin-diagnostics`, optional

### S3 buckets

* document objects
* scenario packs
* seed manifests
* exports

# API surface

## External app APIs

* `GET /me`
* `GET /work-items`
* `POST /work-items`
* `GET /work-items/{id}`
* `PATCH /work-items/{id}`
* `POST /work-items/{id}/assign`
* `POST /work-items/{id}/status-transition`
* `GET /work-items/{id}/tasks`
* `POST /tasks/{id}/complete`
* `GET /work-items/{id}/documents`
* `POST /documents/upload`
* `GET /notifications`

## Admin APIs

* `POST /admin/seed`
* `POST /admin/reset`
* `POST /admin/scenarios/run`
* `GET /admin/events`
* `GET /admin/queue-failures`
* `POST /admin/events/replay`
* `GET /admin/stub-calls`
* `PATCH /admin/flags`

## Stub APIs

* `GET /stub/account/{id}`
* `POST /stub/verification/check`
* `POST /stub/payment/disburse`
* `POST /stub/message/send`

# V1 implementation phases

## Phase 0: Skeleton

* Cognito setup
* React shell
* API Gateway + Lambda skeleton
* DynamoDB tables
* base infra deployment
* seeded users

## Phase 1: Core operations

* work item CRUD
* queue/task model
* timeline/history
* assignment flow
* basic dashboard

## Phase 2: Documents and async flow

* S3-backed document upload
* verification stub
* event routing
* SQS workers
* DLQ inspection

## Phase 3: Simulation and realism

* EventBridge scheduled activity
* scenario packs
* notification service
* overdue/escalation flows
* admin controls

## Phase 4: Polish for installable v1

* reset/seed flows
* starter data packs
* default dashboards
* stub observability
* packaging and documentation

# Concrete engineering planning checklist

## Infrastructure

* define deployable AWS stack boundaries
* choose ECS/Fargate packaging path vs pure serverless distribution shell
* create environment bootstrap script
* define seed asset loading pipeline

## Data

* finalize entity schemas
* define access patterns
* create deterministic seed set
* create scenario mutation rules

## Backend

* implement auth middleware
* implement core APIs
* implement event publishing
* implement SQS consumers and DLQs
* implement stubs
* implement scheduler jobs

## Frontend

* build operator dashboard
* build work item detail page
* build task views
* build document views
* build admin/ops views

## Simulation

* define baseline motion rates
* define failure injection knobs
* define scenario packs
* define reset semantics

## Packaging

* installation guide
* seed guide
* scenario guide
* extension guide
* stub replacement guide

# Deep research dives to avoid missing details

[Inference]

These are the research tracks I would run next so the design does not have blind spots.

## 1. Minimum believable regulated-environment cues

Research what specific signals make enterprise builders feel a system is “real enough.”
Focus on:

* audit patterns
* queueing and exception handling
* role separation
* approval semantics
* downstream dependency behavior
* stale data and reconciliation patterns

## 2. Synthetic data realism patterns

Research how to generate fake operational data that feels authentic without becoming overfitted or cartoonish.
Focus on:

* believable distributions
* lifecycle transitions
* time-based aging
* messy edge cases
* deterministic vs randomized seeding
* scenario pack design

## 3. Enterprise workflow simulation design

Research the smallest set of async patterns that consistently create enterprise realism.
Focus on:

* retries
* manual review
* escalations
* callbacks
* partial failures
* reprocessing and replay

## 4. Stub design best practices

Research how good platform teams design mocks/stubs that are useful for product development, not just testing.
Focus on:

* error realism
* latency injection
* contract stability
* callback simulation
* inspectability
* replacement path from stub to real integration

## 5. AWS installability and packaging models

Research the best current path for distributing an AWS-first installable product with the least friction.
Focus on:

* Marketplace packaging options
* ECS/Fargate vs serverless packaging strategies
* customer deployment friction
* upgrade model
* tenant or environment isolation patterns
* cost and support implications

## 6. Cost floor and operational footprint

Research the minimum cost shape for a credible always-on environment.
Focus on:

* idle costs
* scheduler/event costs
* Lambda concurrency patterns
* DynamoDB table sizing
* CloudWatch costs
* observability retention strategy

## 7. Observable system design for builders

Research what dashboards, traces, event views, and failure surfaces are most useful to engineers working in simulation environments.
Focus on:

* queue inspection UX
* event timeline design
* admin control surfaces
* debugging aids
* “why did this happen” explanations

## 8. Domain anchor selection

Research which enterprise domain anchor gives the most realism per unit of complexity.
Candidates:

* insurance-like case operations
* service request processing
* benefits enrollment/change processing
* order exception handling
* loan/application review
* permit/compliance workflow

The goal is to choose the domain shape with the best realism-to-complexity ratio.

## 9. Human persona realism

Research what mix of seeded users, roles, workload patterns, and conflicting objectives makes the environment feel used by actual people.
Focus on:

* supervisor overrides
* handoffs
* queue ownership
* backlog behavior
* external partner delay
* notifications and missed work

## 10. Extension model for future variants

Research how to keep the core reusable while swapping domains later.
Focus on:

* domain plugin boundaries
* seed pack replacement
* configurable status catalogs
* event taxonomy reuse
* stub catalog reuse

# Best next artifacts to produce

[Inference]

The next three documents worth creating are:

1. **One-page v1 architecture decision record**

   * final service set
   * AWS choices
   * what is explicitly excluded

2. **Service contract pack**

   * entity schemas
   * API routes
   * event contracts
   * stub contracts

3. **Simulation design spec**

   * baseline seed model
   * ongoing activity rules
   * failure injection controls
   * scenario packs
