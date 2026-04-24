# Executive Summary

To achieve persona and workload realism and prevent 'plausibility collapse' in Jungl3, a multi-dimensional strategy is essential. The core finding is that realism emerges not just from named user accounts, but from the rich interplay of identity, owned work, activity rhythms, and contextual artifacts. The recommended approach is built on several key pillars. First, a minimal yet sufficient role taxonomy of 8-10 distinct personas (e.g., Intake Clerk, Triage Analyst, Adjuster, Approver, Fraud Reviewer) must be implemented, with each persona being pre-seeded with a realistic portfolio of owned artifacts—active cases, pending approvals, draft documents—to make the environment feel inhabited from the moment of launch. Second, the system must simulate 'useful role tension' through tunable friction (e.g., approval delays, evidence gaps, misroutes) and generate non-flat, statistically plausible backlogs that follow a Pareto-style distribution of effort (i.e., 20% of cases consume 80% of effort), using models like Nonhomogeneous Poisson Processes for arrivals and Lognormal/Pareto distributions for service times. Third, handoffs between personas must be modeled on established enterprise patterns (from ServiceNow, Jira), utilizing assignment queues, SLA timers, and automated escalations, all operating according to persona-specific calendars that account for work hours, time zones, and breaks. Fourth, a hybrid simulation architecture is recommended, combining deterministic, scripted 'golden path' narratives for reproducible demos with a background stochastic engine that drives organic, agent-based activity, ensuring the system feels continuously alive. Finally, this realism must be observable; Jungl3 should ship with 'first-look' dashboards displaying key metrics like case aging histograms, SLA breach rates, and recent activity feeds, with drill-downs into detailed case timelines and audit trails to convince users of the system's authenticity.

# Persona Realism Pillars

The core thesis on achieving believable persona realism rests on four multi-dimensional pillars, moving beyond simple user accounts to create a sense of a truly inhabited system. The first pillar is **Named Identities**, where each persona has a unique, generated identity including a name, contact details (synthetic email/phone), and demographic attributes, all managed to avoid collision with real individuals and control for bias. The second is **Owned Workloads**, meaning each persona is pre-seeded with a realistic portfolio of work items such as assigned cases, pending approvals, draft documents, and in-progress comments, creating an immediate sense of history and responsibility. The third pillar is **Activity Rhythms**, which involves modeling plausible work patterns, including defined work hours, time zones, lunch breaks, reply-latency distributions, and after-hours behavior, making their interactions feel human. The final pillar is **Contextual Artifacts**, which are the rich, interlinked pieces of evidence that imply prior human engagement, such as email threads with consistent subjects, timestamped audit trail entries, and attachments with logical naming conventions.

# V1 Internal Role Taxonomy

## Role Name

Intake / FNOL Representative

## Responsibilities

Creates the initial claim record, captures reporter details, performs basic coverage lookups, ingests initial evidence like photos and documents, issues acknowledgements, and routes the new claim to the appropriate triage queue.

## Ownership Boundary

Owns the claim only during the initial creation phase. Ownership is transient and transfers immediately upon successful routing and assignment by the triage process.

## Handoff Points

Routes the completed claim record to the Triage queue. This action is recorded as an assignable queue event in the audit log, including a timestamp and the agent's ID.

## Authority Limits

No financial authority. Operational authority is limited to creating new claim records and routing them to the initial triage queue.

## Role Name

Triage Analyst

## Responsibilities

Executes automated and manual rules to determine claim severity and coverage. Checks for duplicate claims, assigns a severity level and an initial reserve band, classifies the claim type (e.g., simple, complex, potential fraud), and routes it to the appropriate adjuster or specialist queue.

## Ownership Boundary

Acts as a transient owner solely for the purpose of making the assignment decision. The analyst must document the triage rationale before transferring ownership.

## Handoff Points

Routes the classified claim to an assigned adjuster's personal queue or a specialist queue (e.g., SIU). This generates an `assignableQueue` change event and a triage note in the claim's history.

## Authority Limits

No direct financial authority, but has operational authority to set initial reserve bands and severity levels which influence downstream financial decisions.

## Role Name

Adjuster (Junior/Mid-level)

## Responsibilities

Manages the full lifecycle of assigned claims within their authority limits. This includes conducting investigations, contacting claimants, securing vendor estimates, issuing payments, and documenting liability and reserve recommendations.

## Ownership Boundary

Acts as the primary owner of the assigned claim from assignment to closure or escalation. They are accountable for the claim's progression and meeting all associated Service Level Agreements (SLAs).

## Handoff Points

Escalates to a Senior Adjuster or Approver if financial limits are exceeded. Refers the claim to the Special Investigations Unit (SIU) if fraud is suspected. Moves the claim to closure or payment status if it is resolved within their authority.

## Authority Limits

Financial authority to issue payments and set reserves up to a specified limit, for example, <$2,500 or <$10,000 depending on seniority.

## Role Name

Senior Adjuster / Examiner

## Responsibilities

Handles highly complex or high-value claims, makes technical coverage determinations, authorizes larger payments and reserve changes, supervises junior adjusters, and prepares files for potential litigation.

## Ownership Boundary

Acts as the final reviewer and decision-maker for claims escalated due to complexity or value. Can reassign claims to other specialists as needed.

## Handoff Points

Escalates to a Manager/Approver for financial amounts exceeding their own authority limit. Can also refer cases to Legal or the Special Investigations Unit (SIU).

## Authority Limits

Higher financial authority than a junior adjuster, for example, up to $25,000. Can approve transactions requested by lower-level adjusters.

## Role Name

Approver / Manager

## Responsibilities

Provides final approval for payments and reserves that exceed all lower authority limits. Signs off on sensitive settlements, rebalances workloads across teams and queues, and handles systemic exceptions and SLA oversight.

## Ownership Boundary

Primarily acts as a transactional approver and does not typically handle routine claim adjustments. May take temporary ownership to manage critical escalations or resolve bottlenecks.

## Handoff Points

Returns the claim to the assigned adjuster after an approval or rejection action. Can also move the claim directly to a closed or payment state.

## Authority Limits

Highest level of financial authority in the standard workflow, for example, approving all transactions greater than $25,000. Possesses override capabilities.

## Role Name

Special Investigations Unit / Fraud Reviewer (SIU)

## Responsibilities

Investigates suspicious claims referred by other roles. Conducts forensic analysis, interviews relevant parties, flags evidence, and provides recommendations to deny the claim or refer it to legal counsel.

## Ownership Boundary

Assumes separate, investigative ownership of a flagged claim. The claim remains in the custody of the SIU until the investigation is cleared or resolved, at which point ownership is transferred back.

## Handoff Points

Receives claims from Triage or Adjusters via a 'flag for fraud' event. Returns the claim to the original adjuster upon clearance or refers it to a Legal or Recovery team.

## Authority Limits

No direct financial authority to pay claims. Has operational authority to place holds on claims, restricting other actions, and to recommend denial.

## Role Name

Customer Service Representative (CSR)

## Responsibilities

Manages all inbound and outbound communications with policyholders. Provides status updates on claims, helps schedule payments, and adds detailed communication notes to the claim file. Escalates issues that require action to the appropriate claim owner.

## Ownership Boundary

Does not have ownership of the claim itself or authority to make settlement or coverage decisions. Ownership is limited to managing communication threads and creating tasks for claim owners.

## Handoff Points

Creates tasks or generates alerts for the assigned Adjuster or Triage analyst when a customer inquiry requires their action or decision.

## Authority Limits

No financial authority. Operational authority is limited to communicating with customers and creating tasks for other roles.

## Role Name

SysAdmin / On-call / Compliance Auditor

## Responsibilities

Manages user accounts, role assignments, and system configurations. Handles on-call incident response for system issues and performs compliance reviews by examining audit trails and security logs.

## Ownership Boundary

Has no claim-editing permissions as part of their standard duties. Possesses separate, privileged visibility into system-wide audit trails and has emergency override capabilities that are strictly logged.

## Handoff Points

Does not participate in the standard claim handoff flow. Interacts with the system at a meta-level, for configuration or emergency intervention.

## Authority Limits

No claim-related financial authority. Possesses the highest level of system administrative authority, including the ability to perform logged, justified, privileged actions like emergency overrides.


# Simulated Role Tension Framework

## Friction Types

The simulation incorporates several types of realistic friction to create believable role tension. These include: Approval Bottlenecks, caused by single-point-of-failure approvers or missing documentation; Evidence Gaps or Requests for Information (RFI), arising from low-quality initial intake; Queueing and SLA Lags, which simulate the effects of limited human capacity and standard working hours; Misroutes, where cases are assigned to the wrong team due to incorrect metadata; Conflicting Reviews, where parallel reviews result in different judgments; and Escalation Loops, where cases bounce between roles due to ambiguous ownership.

## Quantitative Targets

The framework proposes specific default quantitative targets with safe bounds to ensure friction is present but not overwhelming. Recommended defaults include: an `evidence_gap_rate` of 25% (bounds: 10-40%), an `approval_delay_rate` of 30% (bounds: 10-50%), a `misroute_rate` of 2% (bounds: 0.2-8%), a `reopen_rate` of 12% (bounds: 5-30%), and a `conflict_rate` of 8% (bounds: 1-25%). Arrival processes are modeled with a Poisson distribution, while service times use Gamma or LogNormal distributions to create realistic skew and heavy tails for delays.

## Stochastic Mechanisms

Friction is generated through several underlying stochastic mechanisms. Per-case probabilistic triggers are used to introduce issues like evidence gaps or misroutes based on a random number check against a configured rate (e.g., `if rnd < misroute_rate`). Arrival and service processes use statistical distributions (Poisson for arrivals, Gamma/LogNormal for service times) to model natural variation. Time-to-Live (TTL) timers are used to track SLAs, and upon expiry, they can trigger escalation loops with a certain probability. Events can also be correlated, where one issue (like an evidence gap) increases the probability of another (like an approval delay).

## Tuning Knobs

A comprehensive set of configuration parameters, or 'tuning knobs', is exposed to users to control friction levels. These include global toggles like `friction_enabled` and `friction_intensity` (low/medium/high). Users can also adjust the specific numeric rates for each friction type (e.g., `approval_delay_rate`). Parameters for the statistical distributions, such as `mean_service_time_hours`, are also configurable. Finally, the system includes pre-packaged presets like `demo_safe_mode` (disables friction), `training_mode` (low intensity), and `stress_test_mode` (high intensity) for common use cases.

## Excessive Friction Signals

To prevent dysfunctional levels of friction, the system monitors key telemetry signals against defined alert thresholds. These signals include: Case Stall Rate (alert if >20% of cases are stalled), Average Time to First Action (alert if >2x baseline), Approval Backlog size, and Misroute Correction Overhead. A conservative rollback rule is defined: if the case stall rate exceeds 40% or the conflict rate exceeds 20%, the system can automatically revert to a lower friction setting or disable friction entirely (`demo_safe_mode`) to maintain a usable environment for demonstrations.


# Pre Seeded Ownership Specifications

## Role Name

FNOL / Intake Clerk

## Owned Portfolios

Assigned First Notice of Loss (FNOLs), intake drafts, items in the triage queue, customer follow-up tasks, referral tickets for adjusters, and FNOL-related email threads.

## Target Counts And State Mix

Target Counts: 40–120 seeded FNOL records, a backlog of 5–15 items from the last 72 hours, and 0–10 drafts. State Mix: New/Untriaged (20–30%), In Triage (40–50%), Routed/Assigned to Adjuster (20–35%), Closed/Duplicate (5–10%).

## Activity Rhythm And Timestamps

Work during business hours (08:00–17:00 local time). FNOL arrivals peak between 09:00–11:00 and at 14:00. The median time from intake to assignment is 30–90 minutes. Timestamps are seeded across the last 7–30 days, with about 5–8% of FNOLs occurring on weekends.

## Prior Activity Traces

Each FNOL should have 1–3 short comments. Expect one email thread for every 40–60 FNOLs and occasional reassignment entries in the audit log.

## Role Name

Claims Adjuster — Junior

## Owned Portfolios

Active claims, estimates, vendor orders, field visit tasks, customer communications, notes, and requested approvals.

## Target Counts And State Mix

Target Counts: 40–100 active claims, with 5–15 marked as urgent/high-priority, and 5–25 having open vendor interactions. State Mix: New (10–20%), In-Progress (55–65%), Awaiting Vendor/Estimate (10–20%), Pending Approval/Payment (5–10%), Recently Closed (3–8%).

## Activity Rhythm And Timestamps

Active from 09:00–17:30. Commenting activity bursts in the morning and after lunch. The median time between comments is approximately 8 hours. Field visits are required for 10–25% of claims.

## Prior Activity Traces

Each claim should have at least three event types in its history (e.g., intake, contact, vendor estimate), notes on SLA touches, and 10–25% should show examples of reassignment.

## Role Name

Claims Adjuster — Senior / Complex

## Owned Portfolios

Complex or litigated claims, high-value claims, escalations, and approvals that have been escalated to a manager.

## Target Counts And State Mix

Target Counts: 25–60 active complex claims, 5–12 pending legal or investigation, and 1–5 in the settlement pipeline. State Mix: In-Progress (60–75%), Pending Legal/Fraud/3rd-Party (10–25%), Near-Settlement (5–15%).

## Activity Rhythm And Timestamps

Works 09:00–18:00, with more frequent evening/weekend notes (10–15%). These claims have longer lifecycles and histories involving multiple parties.

## Prior Activity Traces

Each claim should show 5–12 state transitions, with multi-party communication threads involving the adjuster, manager, vendor, and legal counsel.

## Role Name

Claims Manager / Supervisor

## Owned Portfolios

Team rosters, escalations, pending approvals, team KPIs, and tasks for rebalancing workloads.

## Target Counts And State Mix

Target Counts: An aggregated view of 8–20 direct reports, 10–40 pending approval requests, and 15–60 escalations within the last 30 days. State Mix: Approvals Pending (40–60%), Escalations In-Progress (30–50%), Resolved (10–30%).

## Activity Rhythm And Timestamps

Activity spikes in the morning and at the end of the day. Approvals are typically processed within a median time of 4–48 hours.

## Prior Activity Traces

Ownership is demonstrated through a rich approval audit trail, reassignment logs, weekly summary notes, and post-mortem comments on resolved issues.

## Role Name

Fraud Investigator

## Owned Portfolios

Flagged claims, active reviews, evidence items, external referrals, and interview notes.

## Target Counts And State Mix

Target Counts: 20–60 active investigations, 10–25 cases flagged but not pursued, and 3–10 high-likelihood fraud cases with extensive artifacts. State Mix: New Review (20–40%), Investigation In-Progress (40–55%), Closed/No-Fraud (10–25%), Referred to Authorities (1–5%).

## Activity Rhythm And Timestamps

Active from 09:00–18:00. Evidence arrives over multiple days, leading to longer latency with a median of 5–12 days per investigation.

## Prior Activity Traces

Prior activity includes evidence logs with chain-of-custody notes, 1–3 interview transcripts for high-priority cases, and cross-links to related claims and vendor reports.

## Role Name

Payment Specialist / Disbursement

## Owned Portfolios

Pending payments, draft disbursements, reconciliation tickets, check/EFT history, and vendor invoices.

## Target Counts And State Mix

Target Counts: 30–150 payment records, 10–50 pending approvals, and 5–25 reconciliation exceptions. State Mix: Draft/Pending (20–35%), Approved Awaiting Payment (30–45%), Paid (20–40%), Exceptions (5–15%).

## Activity Rhythm And Timestamps

Payments are processed in batches (daily/weekly). Approvals mostly occur between 09:00–11:00. Data should include settlement times and bank trace numbers.

## Prior Activity Traces

Traces include payment memos that reference claim IDs and attached invoice PDFs named with the corresponding claim ID.


# Handoff Modeling Blueprint

## Core Objects And States

The foundation of the handoff model consists of core objects including Case, Assignment Group, User, SLA Policy, SLA Instance, Approval, Escalation, Notification, and an immutable Case History/Audit Log. The Case object transitions through a defined state model: New, Assigned, In Progress, Pending (which pauses SLAs), Resolved, and Closed. This structure provides a clear framework for tracking a work item's lifecycle and the actors involved.

## Routing And Assignment Mechanics

Inspired by Jira Service Management, the recommended mechanic is a user-friendly 'Automation Rule' engine based on an 'If-This-Then-That' paradigm. This allows users to define workflows for routing and notifications without requiring complex scripting. For example, a rule could state: 'IF Priority is Critical AND Case is created, THEN assign to Major Incidents Group AND send notification'. This approach balances power with accessibility for v1.

## Sla Tiers And Calendars

The system must support multiple SLA metrics, including Time to First Action (TTFA), Time to Acknowledgment (TTA), and Time to Resolution (TTR). Default SLA tiers are based on priority (Critical, High, Medium, Low), with progressively longer targets (e.g., Critical TTR of 4 business hours vs. Low TTR of 5 business days). A critical, non-deferrable requirement is support for Business Calendars (defining work hours like Mon-Fri, 9-5) and Holiday Schedules, as SLA timers must pause during non-working periods to be realistic.

## Inactivity And Reassignment Policy

To maintain case velocity and simulate realistic workload management, a configurable two-stage inactivity policy is recommended. First, a 'Warning' notification is sent to the assignee and their manager if a case is inactive for a set period (e.g., 75% of its TTA SLA). Second, if inactivity persists to a second threshold (e.g., 125% of TTA SLA), the case is automatically 'Re-queued' to its parent assignment group, making it available for another team member. This entire process must be logged in the case history.

## Auditability Requirements

For the insurance-adjacent domain, an immutable, append-only audit trail is a non-negotiable requirement for compliance and realism. The `Case History` object must automatically capture every significant event, including creation, status changes, priority changes, assignments/reassignments, comments, SLA breaches, and any field modifications. Each audit entry must be timestamped and attributed to the user or system that initiated the action, providing a defensible record of the case's entire lifecycle.


# Backlog Shape Generation Model

## Arrival Process Model

Case arrivals are modeled using a Nonhomogeneous Poisson Process (NHPP) to capture realistic time-varying rates. The model incorporates a diurnal cycle (e.g., peaking mid-day), weekday patterns (e.g., higher on Mondays), and a supplemental burst/cluster process (like a Hawkes process) to simulate surges from events like storms or system outages. The baseline arrival rate is configurable based on the desired scale of the organization (e.g., 20 cases/day for a small pilot, 2000/day for a large one).

## Service Time And Effort Model

To create a realistic heavy tail where a minority of cases consume a majority of effort (the 80/20 rule), a two or three-component mixture model is used for service times. The bulk of simple cases (80%) follow a Lognormal distribution with a short mean time. The remaining complex cases (20%) are drawn from a heavy-tailed Pareto distribution. This ensures that the mean effort for complex cases is significantly higher (e.g., 16 times longer) than for simple cases, achieving the desired Pareto-style concentration of effort.

## Priority Queuing And Aging

The system uses a multi-class, nonpreemptive priority queue (M/G/1) to manage the backlog. Cases are assigned a priority (e.g., Urgent, High, Medium, Low) upon arrival. To prevent low-priority items from being starved or indefinitely deferred, an aging-based priority escalation mechanism is included. This rule automatically increases a case's priority after it has been waiting in the queue beyond a configurable time threshold (e.g., 7 days).

## Target Aging Distribution

To ensure the backlog queue is not flat and reflects a real operational state, the generation model targets a specific distribution of cases across age buckets. A recommended baseline proportion for open cases is: 40-55% aged 0-7 days, 25-35% aged 8-30 days, 10-20% aged 31-90 days, and a crucial 3-8% aged 91+ days. This long tail of older cases is predominantly populated by the complex cases from the service time model.

## Validation Dashboards And Metrics

To validate the realism of the generated backlog, the system should provide key dashboards and metrics. Essential visualizations include: an age histogram (stacked area chart showing proportions over time), a Lorenz curve to visually confirm the 80/20 effort concentration, a list of the top N highest-effort cases, SLA breach trends, and a Work-in-Progress (WIP) heatmap by age and priority. Key KPIs include the percentage of cases in each aging bucket and the median handle time per priority class.


# V1 External Actor Simulation Plan

## Actor Type

Policyholder/Customer

## Rationale

This is the most critical external actor, as they initiate the primary workflow by filing a First Notice of Loss (FNOL). Their actions, from submitting the initial claim and providing documentation to communicating with adjusters and receiving payment, form the core interactive loop of the entire simulation. No claims-like process can be plausibly simulated without them.

## Interaction Channels And Payloads

Interacts via a simulated Web Intake Form (submitting structured JSON based on FNOL fields), Email/SMS (for status updates and simple commands like 'PAY'), and S3 File Drops (for uploading supporting documents like photos and reports as dummy PDF/JPG files).

## Behavioral Simulation Model

A hybrid model is used. The initial FNOL submission follows a scripted schedule with stochastic frequency (e.g., a Poisson process peaking during waking hours). Subsequent actions, like document uploads and email replies, have a variable response latency modeled with a log-normal distribution to create a realistic long tail of slow responders.

## Simulated Exception Patterns

Simulates late replies that test SLA tracking and reminder systems; submission of incomplete information (e.g., an FNOL without required photos); and uploading corrupted or incorrect file formats to test input validation and error handling.

## Actor Type

Vendor (Repair Shop/Medical Provider)

## Rationale

This actor is essential for introducing realistic B2B interactions and testing the system's ability to manage third-party service fulfillment and financial transactions. Their involvement includes submitting estimates, scheduling services, sending invoices, and receiving payments, which are crucial steps in many claims processes.

## Interaction Channels And Payloads

Interacts primarily through S3 File Drops (for submitting PDF invoices and estimates) and a simulated B2B endpoint that accepts EDI/X12 messages. For v1, these can be static, templated files based on standards like the `837` (Health Care Claim) and `835` (Payment/Advice) to test the processing pipeline.

## Behavioral Simulation Model

Primarily scripted. A vendor action (e.g., submitting an invoice) is triggered deterministically when a case reaches a specific stage in the workflow. Stochastic variation is applied to the latency between the trigger and the action to simulate processing delays on the vendor's side.

## Simulated Exception Patterns

Simulates submission of non-compliant or malformed EDI files; sending invoices that don't match approved estimates, triggering a reconciliation exception; and out-of-sequence actions, such as submitting an invoice before the work has been authorized.

## Actor Type

Regulator (Implicit)

## Rationale

This actor is not an active persona but is simulated as a set of environmental rules and constraints that govern the simulation's timing. This is essential for adding realistic pressure and testing the system's compliance and SLA management features against industry standards, such as those defined by the NAIC Model Unfair Claim Settlement Practices Act.

## Interaction Channels And Payloads

This actor does not directly interact via channels. Its influence is manifested as hard deadlines and constraints within the SLA engine. For example, a rule stating that a claim must be acknowledged within 15 days of receipt.

## Behavioral Simulation Model

Purely deterministic. The regulatory rules are encoded as fixed, non-negotiable deadlines in the SLA policies. The simulation engine tracks case progress against these deadlines and flags breaches, which then appear on compliance dashboards.

## Simulated Exception Patterns

The primary 'exception' is the system's failure to meet a regulatory deadline, resulting in a logged SLA breach. This tests the system's escalation logic, alerting mechanisms, and the visibility of compliance failures to the simulated 'Auditor' role.


# Hybrid Simulation Architecture

## Orchestration Pattern

A hybrid orchestration pattern is recommended, combining two distinct AWS services. For deterministic 'golden-path' demo narratives and scripted user flows, AWS Step Functions will serve as the central state machine, providing clear, auditable states and built-in error handling. In parallel, a stochastic background event engine, driven by Amazon EventBridge rules and scheduled AWS Lambda workers, will inject random events and persona-driven activities. This engine publishes events representing persona actions (e.g., arrivals, comments, approvals) based on parameterized distributions. State management is handled by a single source of truth, such as Amazon DynamoDB with versioning or an event-sourcing model using Amazon S3, ensuring both deterministic and stochastic layers operate on consistent data.

## Reproducibility And Time Control

Reproducibility is ensured through three key levers. First, every simulation run is assigned a canonical `run_seed`, which is used to deterministically derive seeds for all pseudo-random number generators (PRNGs) in the system, ensuring that stochastic choices are identical on replay. Second, a virtual clock abstraction is implemented, allowing the simulation to control its own sense of time, which is critical for replaying long-running scenarios quickly and deterministically. Third, an event-sourcing pattern is used where all actions and state changes are persisted as immutable events to a log (e.g., in Amazon S3 or Kinesis). A simulation can be perfectly reconstructed by replaying this event log, with periodic state snapshots used to accelerate the process.

## Llm Usage Boundaries And Safety

For v1, Large Language Model (LLM) usage is strictly contained to non-sensitive, templated text generation, such as synthetic customer messages or brief summaries. LLMs are explicitly forbidden from generating sensitive claims details, policy determinations, or any personally identifiable information (PII). A centralized LLM Gateway service is a critical component, enforcing safety through pre-call filters (to redact sensitive data) and post-call filters (to scan outputs for PII or policy violations, with a fallback to a safe template). This gateway also manages cost control by selecting cheaper models where possible, enforcing strict token budgets per call and per run, and using circuit breakers to halt LLM calls if a budget is exceeded. Services like Amazon Bedrock Guardrails are recommended for enforcing content policies.

## Observability And Tracing Model

A deep observability strategy is implemented to provide detailed views of simulation behavior. Every event and API call is tagged with a `run_id`, `trace_id`, and `event_id`. Structured JSON telemetry is emitted for each action, including metadata like `persona_id` and `prng_seed`. This data is integrated with specialized tooling: Honeycomb for high-cardinality event data and exploratory analysis, Arize for LLM-specific metadata (prompts, responses, token usage) to detect drift and hallucinations, and standard distributed tracing tools like AWS X-Ray or Datadog. This allows users to drill down from high-level dashboards to individual case timelines and audit trails, which is crucial for establishing plausibility.

## Failure Modes And Mitigations

Potential failure modes are identified with corresponding mitigation strategies. For LLM hallucinations, mitigation includes strict templating, pre/post-call filters, guardrails, and monitoring via Arize/Honeycomb. For state drift between original runs and replays, mitigation involves using an event-sourcing architecture, deterministic seeding, run-level locking, and state checksums. For cost overruns, the LLM Gateway's token budgets, circuit breakers, and AWS Budgets alarms are the primary mitigations. For non-determinism, external dependencies are mocked or their interactions are managed using record-and-replay techniques. Finally, for replay mismatches, diagnostic tools are provided to compare event-by-event PRNG states and isolate the source of divergence.


# Content And Document Realism Strategy

The strategy for generating believable content and documents for Jungl3 v1 is a multi-faceted approach focused on realism, consistency, and privacy-by-default. It begins by defining essential artifact types for each workflow stage, such as FNOL forms, triage summaries, adjuster notes, inspection reports, estimates, invoices, and correspondence. Content generation uses a hybrid templating strategy: parametric text templates (e.g., Jinja-style) for notes and emails to ensure variety; a curated set of semi-structured, fillable PDF templates (AcroForm) for formal documents like estimates and invoices; and synthetic attachments like blurred photos or CSVs. To ensure plausibility, all artifacts are governed by strict synthetic metadata rules, including readable ID conventions (e.g., `CLAIM: JNG-2026-XXXX`), enforced chronological date logic, and arithmetically validated financial calculations. Privacy is paramount, achieved through mandatory pseudonymization of all PII/PHI, stripping of all document metadata (e.g., EXIF, author fields), and the application of visible watermarks and machine-readable metadata disclaimers (e.g., 'SYNTHETIC DATA — FOR TESTING/DEMONSTRATION ONLY'). To create a sense of history, artifacts are interlinked, with every artifact containing the `claim_id` and an average of 2-5 explicit cross-references per claim. The entire generation pipeline is validated by automated acceptance tests that check for referential integrity, chronological consistency, and PII leakage.

# Identity Generation And Communication Strategy

The strategy for creating believable personas is built on a foundation of generating synthetic identities from public, aggregated census data to ensure realistic names, demographics, and geographic distributions. This is coupled with robust, configurable diversity controls that allow customers to model specific demographic targets and test for bias. To minimize legal risk and avoid collisions with real individuals, the system generates contact artifacts using strict safety protocols: email addresses use fictional, owned domains (e.g., `@jungle3-casework.net`); phone numbers use designated non-routable area codes (e.g., 555); and physical addresses combine real cities with non-existent street numbers. A 'do-not-generate' list for public figures provides an additional layer of protection. To make communication feel authentic, distinct writing style profiles are created for each role (e.g., Claimant, Adjuster, Manager), defining attributes like formality, verbosity, sentiment, and jargon usage. These profiles guide a fine-tuned LLM to generate in-character text for notes and emails, with simulated communication latency and failure rates (e.g., email bounces) adding to the realism. The system also models evolving relationships, where communication styles can shift from formal to informal or frustrated over the course of a case. Finally, a governance module provides a representation dashboard for customers to audit the demographic makeup of their synthetic population and monitor workload and outcome distribution to identify and analyze potential biases in the simulated workflow.

# Access Control And Regulated Feel Framework

To create a 'regulated feel' suitable for enterprise buyers, Jungl3 implements a framework covering access control, approvals, and auditability. The foundation is a Role-Based Access Control (RBAC) model with a minimal set of roles (e.g., FNOL Clerk, Claims Adjuster, Manager, Auditor, Admin) and granular permissions. This enforces Segregation of Duties (SoD) through rules like the 'Four-eyes principle,' where the creator of a financial request cannot also be its approver. Maker-checker flows are managed via a dedicated `ApprovalRequest` object and multi-step workflows with configurable monetary thresholds (e.g., Senior Adjuster approves up to $5k, Manager up to $50k). Sensitive fields (like PII) are masked by default in the UI and API, with the full data stored encrypted. Access to unmasked data requires a 'Just-In-Time (JIT) reveal' permission, a mandatory justification, and generates a detailed audit event. Finally, all significant actions generate an immutable, append-only audit log stored in a WORM-compliant store like Amazon S3 with Object Lock. These logs include before/after diffs and are accessible to a dedicated, read-only Auditor role, ensuring a defensible and transparent system history.

# Plausibility Observability And Metrics

To signal plausibility and achieve 'time to real' on day one, Jungl3 should present users with a 'Mission Control' dashboard that makes the system feel inhabited and active. This includes several key components: 

1. **First-Look Dashboards:** These provide a high-level overview of the synthetic business's health. Key widgets include a **Case Aging Histogram** showing the distribution of open cases by age (e.g., 0-3 days, 4-7 days, 15+ days); a color-coded **SLA Breaches by Queue** panel highlighting performance issues; a **Workload by Complexity & Persona** chart visualizing work distribution; a KPI card for **Pending Approvals** showing the number and value of items awaiting sign-off; and a **Recent Activity Feed** streaming events like 'New Case created' or 'Persona added comment' to provide a tangible 'heartbeat'.

2. **Target Densities:** The system must be pre-seeded with a believable volume of data, including several hundred to a few thousand cases distributed realistically across queues and aging buckets. On day one, there should be a baseline of breached (5-10%) and at-risk (15-20%) SLAs, and synthetic personas should have a history of varied activity.

3. **Drill-Down Capabilities:** Believability is cemented by allowing users to investigate metrics and find coherent stories. This requires: 
    - **Case Timelines:** Clickable case IDs that resolve to a distributed trace view, showing the entire case lifecycle across services with metadata for each step.
    - **Actor Interactions:** A 'Persona View' that pivots from a case to show all activities performed by a synthetic persona, built by correlating traces and logs for a specific `user_id`.
    - **Audit Trails:** Access to the raw, structured, immutable log data for any case or transaction.

4. **Anomaly Sprinkles and Freshness:** To enhance realism, the data generator should include rare but plausible exceptions, such as a high-value claim stuck in an approval loop or a re-opened case. Freshness is conveyed through the live activity feed and 'last updated' timestamps that are clearly in the last few seconds or minutes. This entire observability experience is powered by a comprehensive instrumentation strategy based on OpenTelemetry, deployed via a sidecar pattern, and feeding data into a backend like Amazon CloudWatch.

# Customer Facing Configuration Presets

## Preset Name

Demo-friendly

## Use Case

Sales demos and product tours. Low-cost and safe for live presentations.

## Parameter Summary

This preset bundles parameters for a smooth, fast-flowing demonstration. It includes low friction (level 1), low workload intensity (0.05 cases/min), a small backlog (50 cases), an aging mix skewed to new items, a minimal role roster (1 of each role), short latencies (10-20 min intake), a very low failure rate (0.1%), and a steady load ramp.

## Expected Behavior

The system will exhibit a smooth, fast-flowing workflow with minimal delays, errors, or backlogs. This allows presenters to showcase core features efficiently without getting bogged down by realistic operational friction. It is optimized for clarity and speed over deep realism.

## Preset Name

Realistic Ops

## Use Case

Proof-of-Concept (PoC) or evaluations mimicking steady-state operations. This is the recommended default preset for v1.

## Parameter Summary

This preset bundles parameters to simulate a typical operational environment. It includes medium friction (level 5), moderate workload intensity (1–3 cases/min), a significant backlog (800–2,000 cases), a balanced aging mix, a standard operational team roster, realistic latencies (e.g., adjuster median reply of 12-48 hours), a moderate failure rate (1–2%), and a 10-20 minute ramp-up to a steady load.

## Expected Behavior

The system will behave like a functioning, moderately busy enterprise environment. Users will observe a persistent backlog, realistic processing delays caused by queues and handoffs, and occasional exceptions or SLA breaches. This preset is ideal for evaluating system performance and features under normal conditions.

## Preset Name

Stress Surge

## Use Case

Capacity and resilience testing. This preset requires explicit opt-in and a cost warning due to high resource consumption.

## Parameter Summary

This preset bundles parameters for high-load scenarios. It includes medium-high friction (level 6), a configurable workload spike (20–100 cases/min) or sustained high load, a large backlog (5,000–50,000+ cases), an under-provisioned role roster to force backlog growth, intentionally longer latencies, a high failure rate (3–10%), and a custom ramp shape (e.g., spike, soak).

## Expected Behavior

The system will be pushed to its limits, forcing backlogs to grow rapidly and SLAs to be breached. This preset is designed to reveal performance bottlenecks, test auto-scaling capabilities, and measure the system's resilience and recovery dynamics under extreme load. It is not intended for demonstrating typical workflows.

## Preset Name

Auditor View

## Use Case

QA, compliance demonstrations, and audit-readiness testing.

## Parameter Summary

This preset bundles parameters to focus on historical data and compliance. It includes high friction with many checks (level 8), low workload intensity (0.1–1 cases/min), a very large backlog (10k–100k cases), an aging mix skewed heavily toward old and aged cases, and a role roster with many supervisors/auditors and minimal active adjuster activity.

## Expected Behavior

The system will appear as a mature, heavily audited environment with a deep history. The focus is on the large, aged backlog and the visibility of audit trails and compliance checks, rather than the flow of new work. This preset is ideal for demonstrating reporting, analytics, and compliance features.


# Domain Portability Analysis

## Core Abstractions

The reusable, platform-level components that are domain-agnostic include: the **Persona Model** (a generic definition of an identity with roles, workload, and activity rhythm), the **Case Lifecycle State Machine** (a generic state model like Intake → Triage → Review → Decision → Closed), **Queueing & Assignment Primitives** (named queues with configurable routing), a **Generic Artifact Model** (for documents, notes, and evidence with audit metadata), **Rules Engine Hooks** for plugging in domain logic, and core **Observability & Metrics** like time-to-decision and SLA breach counts.

## Domain Specific Adapters

The pluggable, domain-specific entities that must be configured for each vertical include: **Data/Terminology Schemas** (e.g., FHIR resources in healthcare, network reason codes for fintech chargebacks, benefit program codes for public sector), **Regulated SLAs** (immutable timelines like chargeback windows or CMS prior authorization deadlines), **Privacy/Regulatory Controls** (specific controls for PHI/HIPAA, PCI tokenization, or government audit policies), and **Specialized Workflows** (unique process steps like peer-to-peer physician reviews in healthcare or arbitration in fintech disputes).

## Retargeting Configuration Layer

A proposed declarative manifest, likely in YAML or JSON format, that allows operators to re-target Jungl3 to a new domain without requiring code changes. This manifest would define the entire domain configuration, including metadata (domain ID, compliance profile), role definitions and permissions, persona templates (work hours, latency), queue definitions and SLA policies, artifact schemas with PII levels and retention rules, decision templates with outcome codes, and configurations for any external adapters.

## Plausibility Collapse Risks

Key triggers for plausibility collapse when porting to new domains include: 1) **Incorrect SLAs**: Applying generic insurance SLAs to a domain with hard, regulated deadlines like fintech chargebacks or healthcare prior authorization. 2) **Data Privacy Breaches**: Reusing artifact templates with sensitive data fields (e.g., PHI, PCI) without implementing the correct domain-specific privacy controls and adapters. 3) **Ignoring Domain Codes**: Treating domain-specific identifiers like chargeback reason codes or medical billing codes as generic text, which breaks automation and compliance. 4) **Lacking Provenance**: Failing to model the required chain-of-custody and evidence provenance needed for audits or legal challenges. 5) **Omitting Mandatory Steps**: Not modeling required, domain-specific process steps like arbitration windows or peer-to-peer consults.

## Prioritized Second Domain

The recommended second target domain is **Healthcare Prior Authorization (PA)**. This choice is driven by its strong structural similarity to claims processing, the increasing market demand and standardization being driven by regulations like the CMS 2026 ePA rule and FHIR adoption. A phased rollout plan is recommended: **Phase 0 (Prep)** to implement a read-only FHIR adapter stub and HIPAA-safe defaults; **Phase 1 (MVP)** to build a basic PA workflow with intake, routing, and decision templates; and **Phase 2 (Harden & Scale)** to integrate with an EHR sandbox and implement more complex flows like peer-to-peer reviews and appeals.


# Plausibility Collapse Validation Plan

## Ux Validation Protocols

A qualitative research plan centered on moderated Concurrent Think-Aloud (CTA) studies with two distinct participant groups: internal product builders and external enterprise buyers/SMEs. The primary goal is to measure 'Time-to-Suspicion' (TTS), the time until a participant expresses doubt about the authenticity of a synthetic artifact. The protocol involves 45-60 minute remote sessions where participants perform scenario-based tasks mirroring real-world workflows (e.g., reviewing a First Notice of Loss). All sessions are transcribed and analyzed to categorize suspicion signals using a defined taxonomy (e.g., logical contradiction, timing oddity).

## Diagnostic Heuristics And Red Teaming

A checklist of plausibility signals for internal red teams to use for auditing synthetic environments. The heuristics cover several dimensions of realism: 1) **Consistency & Provenance**: Verifying that facts like names, dates, and amounts remain stable across the system and have plausible sources. 2) **Temporal Realism**: Ensuring reply latencies follow a human-like, heavy-tailed distribution and that activity aligns with normal work hours. 3) **Workload Realism**: Comparing task allocation per persona against industry baselines and checking for unrealistic handoffs or simultaneous contradictory edits. 4) **Textual Realism**: Measuring lexical diversity and n-gram repetition to flag excessive template reuse and checking for stylistic consistency. 5) **Data Integrity**: Validating the formats of synthetic PII.

## Quantitative Telemetry Plan

A plan to monitor realism using core telemetry metrics captured via OpenTelemetry traces that monitor the entire claims lifecycle. The core metrics include per-claim metrics like `total_processing_days` and `claims.sla.breaches_total`, and per-persona metrics such as `prior_activity_density`, `workload_share`, `reply_latency_distribution`, `lexical_diversity_index`, `template_reuse_rate`, `contradiction_count`, and `conflict_frequency`. The plan defines acceptable ranges to maintain believability, such as a contradiction rate below 0.1 per 100 events, a concurrent conflicting edit frequency below 0.5% of claim events, and a p50 reply latency between 1-3 hours during workdays.

## Experimentation And Calibration

A plan to tune and calibrate behavioral parameters like friction and latency using a multi-stage experimental architecture. The process begins with **Offline Simulation**, where agent variants are run through scenario suites for reproducible testing. This is followed by **Shadow Traffic**, where live requests are routed to candidate generator variants in parallel (hidden from users) to compare performance without user impact. Finally, **Canary A/B Testing** allocates a small percentage (1-5%) of production traffic to a new variant after it passes the preceding gates. This process is used to test variables like reply-latency parameters, escalation heuristics, and template diversity.

## Release Quality Gates

A proposed multi-stage go/no-go process to ensure the quality and plausibility of releases. The process includes: **Gate 0 (Pre-merge)** for static checks and unit tests. **Gate 1 (Offline Validation)**, where a release candidate must pass a scenario-suite with key metrics (e.g., contradiction rate) below predefined thresholds. **Gate 2 (Shadow & Canary Validation)**, where the candidate model's output distributions must stay within a defined KL divergence from the baseline, and no safety metrics can be breached during the canary window. **Gate 3 (Release)**, which requires formal business signoff, a clear rollout plan, and the availability of runtime safeguards like an immediate rollback switch.


# Cross Topic References

Persona and workload realism (Topic 10) has significant and direct knock-on effects on several other critical research topics for Jungl3. It is not an isolated concern but a central hub that connects to the following areas:

*   **Topic 2 (Domain Anchor):** The choice of domain anchor fundamentally determines the required set of personas, roles, artifacts, and compliance constraints. The 'insurance-adjacent' anchor necessitates roles like Adjuster and Fraud Reviewer. Shifting to another domain, such as 'healthcare prior authorization' as explored in portability research, would require a completely different set of personas (e.g., Clinical Reviewer, Medical Director) and regulatory constraints (e.g., HIPAA, CMS timelines).

*   **Topic 4 (Synthetic Data):** Personas are brought to life by the data they own and interact with. The realism of synthetic documents, such as claim files, estimates, and invoices, is crucial. The content, metadata, and inter-linking of these artifacts must be believable to support the persona's role and history. A persona's workload is, in essence, a curated collection of synthetic data artifacts.

*   **Topic 5 (Event Generation):** The activity rhythms of personas—their work hours, reply latencies, and interaction patterns—are driven by and contribute to the system's event stream. The event generation engine must be capable of producing human-like, non-uniform event patterns (e.g., diurnal cycles, weekend lulls) to make persona behavior feel authentic rather than robotic.

*   **Topic 11 (Regulated Feel):** The separation of duties between different roles (e.g., an adjuster cannot approve their own high-value payment), the visibility of immutable audit trails, and the structure of multi-step approval workflows are all core components of both persona realism and creating the 'regulated feel' that enterprise buyers expect. The role taxonomy and handoff models defined for persona realism are the foundational building blocks for achieving a defensible, auditable system.

# Recommendations V1 Actions

- Implement a minimal viable role taxonomy of 8 core roles (Intake, Triage, Adjuster, Senior Adjuster, Approver, Fraud Reviewer, Customer Service, SysAdmin/Auditor) and seed each Jungl3 instance with a 10-persona roster to create plausible handoffs and ownership boundaries without overpopulation.
- Pre-seed each persona's workspace with a realistic portfolio of owned artifacts (e.g., 40-100 active claims for an adjuster, 10-40 pending approvals for a manager) with varied states, timestamps, and prior activity traces to make the system feel inhabited from day one.
- Model 'useful role tension' by implementing tunable, probabilistic friction with clear cause codes. Target default rates such as a 30% approval delay rate and a 25% evidence gap rate, with conservative bounds to avoid demo-hostile dysfunction.
- Generate realistic, non-flat backlog shapes using a Nonhomogeneous Poisson Process for arrivals (with diurnal cycles) and a Lognormal-Pareto mixture model for service times to achieve an 80/20 Pareto-style effort concentration.
- Adopt a handoff model inspired by Jira Service Management and ServiceNow, using an automation rule engine for routing, granular SLA milestones for tracking, and business calendars (a day-one feature) to govern timers.
- Build a hybrid simulation architecture using AWS Step Functions for deterministic 'golden path' demo scripts and a parallel Amazon EventBridge/Lambda engine for stochastic background activity. Strictly contain all LLM usage within a gateway that enforces safety, cost, and reproducibility.
- Simulate essential external actors, primarily the 'Policyholder/Customer' and 'Vendor'. Model their interactions through defined channels like web intake forms for FNOLs, S3 file drops for documents, and static EDI/X12 stubs for vendor invoices.
- Generate believable content and documents using a combination of parametric text templates and semi-structured, fillable PDFs. Enforce privacy-by-default with mandatory pseudonymization, metadata stripping, and visible watermarks on all generated artifacts.
- Create a 'regulated feel' by implementing a core Role-Based Access Control (RBAC) model, simple maker-checker approval flows for financial actions, append-only audit logging to Amazon S3 with Object Lock, and default masking for sensitive fields with a just-in-time reveal mechanism.
- Ship with pre-configured 'Mission Control' dashboards in Amazon CloudWatch that display day-one plausibility signals like case aging histograms, SLA breach rates by queue, and a recent activity feed. Provide trace-driven drill-downs for case timelines.
- Expose customer-facing configuration knobs for friction level, workload intensity, and backlog size, and package them into presets like 'Demo-friendly', 'Realistic Ops', and 'Stress Surge' to support different use cases.
- Establish a UX validation program with scripted think-aloud tasks for product builders and enterprise buyers to measure 'time-to-suspicion' and use telemetry (e.g., contradiction rates, latency distributions) to create quantitative go/no-go quality gates for releases.

# Recommendations V1 Deferrals

- Full, dedicated workflows for specialized roles such as Legal Counsel, Subrogation/Recovery teams, and Actuarial integration. These can be simulated with placeholder tasks in v1.
- Fully autonomous LLM agents capable of making independent financial decisions, changing policy terms, or executing un-templated actions. LLM usage in v1 must be strictly confined to generating non-sensitive, templated content within a safety gateway.
- Deep, real-time integrations with external third-party systems, such as live vendor portals for repair shops or medical providers. Represent these interactions with simple notes and document uploads in v1.
- Complex multi-region, 'follow-the-sun' handoff models for persona coverage. The v1 model should focus on single-region, business-hours personas complemented by a 24/7 synthetic intake mechanism.
- Full legal-hold and e-discovery compliance workflows. While auditability is key for v1, the specific, rigid processes for legal holds should be deferred.
- Formal compliance attestations like SOC 2 Type II or HIPAA certification. The v1 architecture should be 'readiness-focused' and well-documented, but the formal audit and certification process is a post-v1 activity.
- Advanced, pluggable Attribute-Based Access Control (ABAC) policy engines. A simpler, effective Role-Based Access Control (RBAC) model is sufficient for v1.
- The full implementation and release of domain-specific 'kits' for adjacent verticals like Healthcare Prior Authorization or Fintech Chargebacks. The v1 architecture should be designed for portability, but the actual retargeting is a post-v1 initiative.

# Recommendations Biggest Risk

The single biggest risk if Jungl3 ignores the topic of persona and workload realism is 'plausibility collapse'. This is the moment a user—whether a product builder, an enterprise buyer, or a stakeholder—detects that the data, workflows, or system behavior are obviously fake. Once this suspension of disbelief is broken, all other investments in the product lose their value. The core thesis of Jungl3 is 'time to real,' and a shallow, unconvincing simulation directly undermines this promise, leading to a loss of user trust and likely product rejection. Persona realism is not a cosmetic feature; it is a critical gating metric for the product's success.
