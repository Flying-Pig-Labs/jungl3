# Executive Summary

The recommended packaging and deployment strategy for Jungle3 is a customer-centric, secure, and cost-optimized approach designed to deliver on the 'time to real' promise while preventing 'plausibility collapse' and hidden costs. The strategy is built on several key pillars:

1.  **Hybrid Compute Architecture:** A 'Targeted Hybrid' model is recommended, utilizing AWS Fargate for persistent, latency-sensitive components like the UI and admin consoles to ensure a responsive, 'always-on' user experience. This is complemented by a serverless architecture (AWS Lambda, Step Functions, EventBridge) for all event-driven microservices, background jobs, and synthetic activity, which minimizes the customer's idle cost footprint.

2.  **Dual Infrastructure-as-Code (IaC) Delivery:** The primary distribution method via AWS Marketplace will be native AWS CloudFormation, which is essential for seamless integration. To cater to sophisticated enterprise customers, a first-class, verified Terraform module will be offered in parallel, supporting modern GitOps workflows.

3.  **Two-Stage Guided Installation:** To avoid the trap of a brittle 'one-click' install, a two-stage process is advised. The initial Marketplace click deploys a minimal, temporary 'installer' environment. This environment then presents a guided setup UI to the customer, allowing them to configure critical parameters like VPC networking, identity providers, and initial scenario packs before the main Jungle3 stack is programmatically deployed. This balances simplicity with the robustness required for diverse customer accounts.

4.  **Secure, Customer-Owned Lifecycle Management:** The entire lifecycle—installation, upgrades, and resets—is designed to be customer-triggered and operate entirely within the customer's account without vendor access. Upgrades will use blue/green deployment patterns to ensure zero downtime. Resets and reseeding of synthetic data are enabled by a strict data partitioning model that separates ephemeral synthetic data from persistent customer configurations, using mechanisms like RDS snapshots and pointer-swapping.

5.  **Cost Transparency and Security by Default:** The strategy aggressively mitigates the primary failure mode of hidden costs by using low-cost defaults, providing a TCO estimator, and shipping optional, deployable budget alerts. The security posture is built on least-privilege IAM roles, permission boundaries, customer-managed KMS keys, and VPC endpoints, ensuring the customer retains full control and ownership.

# Compute Platform Analysis

## Recommended Architecture

The recommended compute architecture for Jungle3 is a 'Targeted Hybrid' model. This approach strategically combines AWS Fargate for persistent, latency-sensitive components with a serverless architecture for event-driven and background tasks. Specifically, it advocates for using a small, persistent ECS/Fargate service (running 1-2 tasks) to host the main user interface and admin consoles, ensuring they are always warm and responsive to avoid 'plausibility collapse'. All other components, including APIs, background jobs, synthetic event generation, and complex workflows, should be built using serverless technologies like API Gateway (HTTP APIs to save costs), AWS Lambda, AWS Step Functions, and Amazon EventBridge. This hybrid model provides the optimal balance between delivering a low-latency user experience from day one ('time to real') and minimizing the customer's idle cost footprint, which is a critical factor for a product deployed into a customer's own account.

## Architecture Comparison Summary

A comparative analysis of three models—ECS/Fargate-first, Serverless-first, and a Targeted Hybrid—revealed clear trade-offs. The ECS/Fargate-first model offers the most predictable performance and highest inspectability due to its traditional container-based nature, but it incurs the highest idle costs because of its always-on tasks, ALBs, and NAT Gateways. The Serverless-first model is unequivocally the cheapest at idle, with costs approaching zero, but it introduces the risk of cold-start latency, which could compromise the 'time to real' user experience and lead to 'plausibility collapse'. The Targeted Hybrid model emerged as the superior choice by balancing these factors. It uses a small, persistent Fargate service for the UI to guarantee responsiveness where it matters most, while leveraging the cost-efficiency of serverless components for all non-interactive, event-driven background processing. All three architectures can be deployed via CloudFormation and support modern upgrade mechanics like blue/green deployments, but the hybrid model best aligns with Jungle3's specific product goals.

## Idle Cost Analysis

The analysis of Total Cost of Ownership (TCO) at idle is a critical factor, as these costs are borne by the customer. The primary cost drivers for a Fargate-first architecture are the continuously running Fargate tasks (billed per vCPU-second and GB-second), the fixed hourly charge for Application Load Balancers (ALB), and the significant cost of NAT Gateways (~$32.85/month each). For a serverless architecture, the main idle cost driver is the use of Lambda Provisioned Concurrency (PC) to mitigate cold starts; without it, idle costs are near-zero. A comparative monthly idle cost model (US-East-1) showed that for a 'Small' workload, a Fargate-first approach would cost ~$68.76, while a serverless approach would be ~$21.43. The recommended Targeted Hybrid model provides a middle ground, estimated at ~$73.76 for a small setup (ALB, NAT, 1 Fargate task), offering a balance by incurring fixed costs for a responsive UI while saving significantly on background processing. A key recommendation is to avoid multi-AZ NAT Gateways by default and prefer VPC Endpoints to dramatically reduce idle costs.

## Performance Analysis

Performance analysis focused on minimizing cold-start perception to achieve the 'time-to-real' goal. AWS Lambda functions suffer from cold starts, with a non-trivial Java application showing a startup latency of around 6.1 seconds. This can be mitigated in several ways: using Provisioned Concurrency (PC) to keep environments warm and ready, reducing latency to double-digit milliseconds at a continuous cost; or using Lambda SnapStart for Java runtimes, which can reduce startup time by over 4x (e.g., to 1.4 seconds) at a lower cost than PC. AWS Fargate tasks do not have 'cold starts' in the same way, but their startup latency is dependent on container image size, pull time, and application initialization. The only way to guarantee low latency with Fargate is to keep at least one task running 24/7, which directly contributes to higher idle costs. The recommended strategy is to use a minimal always-on Fargate task for the UI and apply targeted Provisioned Concurrency or SnapStart for critical backend Lambda functions, ensuring a responsive system without the high cost of a fully containerized architecture. The entire data seeding process should also be orchestrated during CloudFormation deployment using Custom Resources to ensure the environment is populated with believable data from the moment the user first interacts with it.

## Complexity And Maintenance Analysis

The assessment of complexity and maintenance concluded that while both serverless and container-based architectures can be managed with Infrastructure as Code, their operational profiles differ. Installation complexity is primarily driven by networking; Fargate-based architectures often require a VPC, subnets, an ALB, and NAT Gateways, increasing the number of CloudFormation parameters and the scope of IAM permissions needed. A serverless approach can sometimes reduce this networking complexity. For upgrades, both architectures support safe, modern deployment practices like blue/green deployments via AWS CodeDeploy, making the choice of compute less of a factor in upgrade safety. Customer inspectability is high for both, as they integrate natively with AWS observability tools like CloudWatch (Logs, Metrics, Dashboards) and AWS X-Ray for tracing. The maintenance burden for the Jungle3 team is higher with a Fargate-based architecture due to the need to build, scan, store, and version container images. Lambda deployment packages are generally simpler to manage. The recommended hybrid model balances this by limiting the container pipeline to just the UI components while leveraging the simpler deployment model of Lambda for the majority of the services.


# Aws Marketplace Strategy

## Recommended Listing Type

The optimal listing type for Jungle3 is an AMI-with-CloudFormation (CFN-first) product, also described as a SaaS product delivered via a CloudFormation template. This model is the cleanest, most AWS-supported path for a product that runs entirely within the customer's AWS account. It directly supports Jungle3's core value proposition of creating a realistic, isolated, and inspectable synthetic environment. This approach enables a seamless customer journey, transitioning them from the Marketplace subscription page directly to the CloudFormation console to launch the stack. It provides a trusted, low-friction path from purchase to deployment, which is critical for the 'time to real' thesis. Furthermore, this listing type allows for integrated commerce and management, supporting SaaS contracts for predictable subscription tiers (e.g., Small, Medium, Large Jungle) and enabling entitlement management through AWS Marketplace APIs. The use of CloudFormation provides a standardized model for lifecycle management, including versioned updates and, crucially, a clean teardown process to avoid leaving orphaned resources.

## Metering And Entitlement Integration Flow

The recommended integration flow is adapted from the AWS serverless SaaS reference pattern, ensuring no vendor cross-account access is required. The flow is as follows:
1.  **Subscription and Registration**: When a customer subscribes, AWS Marketplace redirects them to a seller-provided registration URL with a temporary token (`x-amzn-marketplace-token`). The seller's backend service calls the `ResolveCustomer` API with this token to retrieve the permanent `CustomerAWSAccountId` and `ProductCode`, storing this mapping.
2.  **Instance-Side Entitlement Check**: Once the Jungle3 environment is deployed in the customer's account, a bootstrap resource (e.g., a Lambda function) performs a local entitlement check. It first calls `sts:GetCallerIdentity` to get its own account ID. It then calls the `GetEntitlements` API, filtering by the `ProductCode` and the retrieved `CustomerAWSAccountId`, to verify the subscription is active.
3.  **Usage Reporting (Phone-Home)**: For metered dimensions, the running application in the customer's account sends minimal, privacy-preserving usage data (e.g., aggregated counters) to a secure seller ingestion endpoint (ideally via AWS PrivateLink). This data does not contain PII.
4.  **Metering (`BatchMeterUsage`)**: The seller's backend receives this usage data, associates it with the customer's subscription via the stored mapping, and makes idempotent calls to the `BatchMeterUsage` API. Each usage record includes a unique `usageRecordId` (e.g., a hash of account, dimension, and hour) to prevent double-billing on retries.

## Contract And Private Offer Strategy

For its initial launch (v1), Jungle3 should adopt a simple, predictable, tiered subscription model to avoid the complexity of fine-grained metering and prevent 'hidden cost' failures. This aligns with the goal of providing a clear value proposition.

**Public Offerings (Subscription Tiers):**
*   **Tiers:** Offer distinct tiers like 'Small', 'Medium', and 'Large' that correspond to the size of the deployed environment (e.g., Fargate instance size, data volume, number of personas). This provides predictable monthly costs.
*   **Entitlement Dimensions:** The subscription can be based on dimensions such as the number of concurrent 'Jungle' environments, bundled environment-hours for ephemeral use cases, or data-seed tiers (e.g., small vs. large datasets).

**Private Offer Strategy:**
*   **Enterprise Deals:** Leverage AWS Marketplace Private Offers for enterprise customers to negotiate custom discounts, upfront annual/multi-year contracts, and region-specific pricing.
*   **Trials and POCs:** Use private offers to create free or low-cost, time-limited, and capacity-capped entitlements to encourage evaluation and Proof-of-Concepts (POCs).
*   **Offline/Air-Gapped Environments:** For customers in restricted environments where metering is not possible, use a contract-based private offer (Bring Your Own License - BYOL) where billing is based on the upfront contract, eliminating the need for any 'phone-home' communication.

## Cancellation And Teardown Mechanics

A clean and reliable teardown process is critical to prevent customer frustration, orphaned resources, and unexpected costs. The process must be centered around CloudFormation as the lifecycle control plane.

**Primary Teardown Path:**
*   The canonical and documented method for teardown must be the deletion of the root CloudFormation stack that was launched from the Marketplace.

**Template Design for Clean Deletion:**
*   **Deletion Policies:** Ephemeral resources (e.g., EC2 instances, Fargate tasks) must have a `DeletionPolicy` of `Delete`. Stateful resources like databases (RDS) or S3 buckets must default to `DeletionPolicy: Snapshot` or `Retain`, respectively, but this must be clearly documented. The customer should be given the option to override this to `Delete` for a complete wipe.
*   **Custom Resource Safety:** Any Lambda-backed custom resources must have robust logic in their `Delete` handler to ensure they clean up properly and don't cause the stack to get stuck in a `DELETE_FAILED` state.
*   **Robust Tagging and Cleanup Scripts:** All resources created by the stack must be tagged with a unique, run-specific identifier (e.g., `Jungle3-run-ID`). Jungle3 should ship a dedicated 'Jungle3-Cleanup' CloudFormation change-set or a script that can find and force-delete all resources with that tag, serving as a fallback for stuck deletions.

**Subscription Cancellation Handling:**
*   The seller's backend must subscribe to `License Updated` events via Amazon EventBridge. When a cancellation event is received, it should trigger a reconciliation process to post any final, unreported metering data to `BatchMeterUsage` within the required 1-hour window.

## Exemplary Listings To Emulate

To achieve a best-in-class Marketplace experience, Jungle3 should emulate practices from the following listings and resources:

*   **Fortinet FortiGate:** Emulate their clear, step-by-step deployment documentation and post-subscribe configuration guides. Their emphasis on secure defaults (e.g., not opening SSH to 0.0.0.0/0) is a key practice to adopt.
*   **Palo Alto VM-Series (via GitHub CFN templates):** Follow their model of using modular, nested stacks. This improves maintainability and allows customers to understand the architecture in logical chunks. Also, emulate their practice of providing lab scenarios and playbooks to help users get hands-on experience immediately after deployment.
*   **Trend Micro Deep Security (via CloudFormation templates repo):** Emulate their use of nested templates that can also be run standalone. This supports more flexible, staged deployments and simplifies upgrades for specific components.
*   **AWS Serverless SaaS Integration Sample (GitHub):** This is the canonical reference and blueprint for implementing the backend services. It provides the correct patterns for handling `ResolveCustomer` for registration, `GetEntitlements` for license checks, and `BatchMeterUsage` for billing.
*   **Fr0ntierX Polaris:** An example of an advanced infrastructure product. Emulate their explicit constraints on instance types and their clear attestation guidance for buyers, which helps manage expectations and prevent deployment failures.

**Pitfalls to Avoid:**
*   Do not ship templates that open sensitive ports like SSH/RDP to the internet.
*   Do not hardcode AMI IDs; use dynamic SSM parameters or mappings.
*   Do not leave resources with a `Retain` policy without providing explicit, documented cleanup instructions.
*   Do not require customers to share long-lived credentials or create cross-account roles for the vendor.


# Customer Account Deployment Patterns

## Recommended Provisioning Approach

The unequivocally recommended approach for provisioning resources in a customer's account is using AWS CloudFormation with a nested stack architecture. This method is chosen because it is the only one that provides native, seamless integration with the AWS Marketplace subscription and launch process. When a customer subscribes, they are automatically redirected to the CloudFormation console to launch the stack, creating a low-friction 'click-to-launch' experience that directly supports Jungle3's 'time to real' thesis. This approach ensures resilience, idempotence, and provides robust features like Change Sets for safe updates and drift detection. To manage complexity, a 'one-click to start, then guided setup' model is advised, where the initial click deploys a minimal installer environment that then guides the user through configuring and launching the main, more complex stack.

## Deployment Tool Comparison

A comparative analysis of CloudFormation (CFN), AWS Cloud Development Kit (CDK), and Terraform revealed significant differences in the context of AWS Marketplace. CloudFormation is the clear winner due to its native integration; it is the standard and expected mechanism for Marketplace products that deploy infrastructure. AWS CDK, while offering powerful abstractions, ultimately synthesizes a CFN template. Its main drawback is the requirement for a `cdk bootstrap` process in the target account, a manual CLI step that introduces friction and undermines the simple subscription model. Terraform has no native integration with the Marketplace launch flow at all. A customer would need to manually download modules and use the Terraform CLI, completely breaking the integrated experience and placing a high technical burden on them. Therefore, for a product aiming for rapid, easy installation, CloudFormation is the only suitable primary choice, though a supplementary Terraform module could be offered for enterprise customers with existing Terraform workflows.

## Recommended Template Structure

The proposed structure for the CloudFormation templates is a modular, nested stack architecture designed to manage complexity and improve maintainability. It consists of a single `root.yaml` template, which is the entry point for the AWS Marketplace launch. This root template handles all customer-facing parameters, Marketplace subscription validation, and orchestrates the deployment of several logical nested stacks. The recommended nested stacks include: `nested-networking.yaml` for provisioning the VPC, subnets, and related networking resources; `nested-iam.yaml` for creating fine-grained IAM roles and policies for the application's services; `nested-data.yaml` for provisioning stateful resources like databases and queues; and `nested-compute.yaml` for deploying the actual application microservices and jobs (ECS services, Lambda functions). This structure allows for independent updates and better organization of the infrastructure code.

## Networking And Security Patterns

To accommodate diverse customer environments, the CloudFormation templates must be flexible. For networking, the template should offer a parameter to either 'Create New VPC' for a simple, isolated deployment or 'Use Existing VPC' (BYO VPC), which would then require the customer to provide existing VPC and subnet IDs. This caters to both simple setups and enterprise environments with established network topologies. To manage costs and enhance security, the templates should prefer VPC Endpoints over NAT Gateways where possible. For security, the deployment must adhere to the principle of least privilege. This is achieved by defining a master IAM Execution Role in the root stack and attaching a Permission Boundary to it. This boundary defines the absolute maximum permissions the Jungle3 application can ever have, preventing any potential privilege escalation and providing a critical security guarantee for the customer.


# Installation User Experience

## Recommended Ux Model

A pure 'one-click install' is a trap that would lead to high installation failure rates. The recommended model is a two-stage 'one-click to start, then guided setup' experience. This approach balances the 'time to real' thesis with the need for robust configuration.

*   **Stage 1: One-Click Baseline Deployment:** The customer's initial action from the AWS Marketplace launches a minimal, low-cost CloudFormation stack. The sole purpose of this stack is to provision a temporary, secure 'installer' environment (e.g., a small Fargate task with a web UI).
*   **Stage 2: Guided Post-Launch Setup:** The customer is then directed to the installer UI. This guided wizard inspects their AWS environment and walks them through critical configuration choices (networking, identity, scenario packs). Once the choices are confirmed, the installer UI programmatically constructs and launches the main, fully-configured Jungle3 CloudFormation stack. This mandatory onboarding process ensures a much higher probability of a successful and secure deployment.

## Stage 1 One Click Baseline

The initial one-click deployment from the AWS Marketplace should require a minimal set of safe parameters to reduce friction while preventing insecure assumptions. The CloudFormation template for this stage should only ask for:

*   **AWS Region:** Defaults to the user's current region but allows override.
*   **VPC Mode:** Defaults to the safest option: 'Create new isolated VPC'. An advanced option to 'Use Existing VPC' would be available, which would trigger more questions in the guided setup.
*   **Admin Contact Email:** Required for sending the post-launch setup link and initial notifications. Prefilled with the buyer's account email but must be confirmed.
*   **Deployment Footprint Tier:** Defaults to 'Small' to minimize initial costs and resource footprint. Options for 'Medium' and 'Large' would be available.
*   **Scenario Pack:** Defaults to a conservative, low-data-volume 'Starter' pack.
*   **Cost Guardrails Opt-in:** A checkbox, defaulted to ON, which deploys a basic AWS Budget and alert for the created resources.

## Stage 2 Guided Setup

Following the baseline deployment, the customer is directed to a mandatory, in-app guided setup wizard. This onboarding process gates access to the full environment until critical configurations are completed, preventing plausibility and security issues. The wizard includes checklists for:

*   **Identity Configuration:** Guides the user through setting up the default Cognito user pool with MFA or integrating with an enterprise Identity Provider (e.g., Okta, Azure AD) via SAML/OIDC. This step is blocking; the environment is not fully accessible until identity is configured.
*   **Data & Scenario Packs:** Allows the user to select from a library of available scenario packs, clearly detailing the impact of each on cost, data volume, and data sensitivity. Requires explicit approval for larger or more complex packs.
*   **Network Configuration:** If 'Use Existing VPC' was chosen, this step requires the user to select the specific VPC and subnets for deployment and validates their configuration.
*   **Cost Guardrails:** Confirms the AWS Budget settings and allows the user to set more specific thresholds or automated actions (e.g., notifications, throttles via SSM Automation).
*   **Data Retention & Governance:** Sets conservative default retention policies for logs and data (e.g., 30 days) and requires explicit confirmation to extend them.

## Validation And Ux Patterns

To ensure a safe and accessible installation, a multi-layered validation strategy and a combination of UX patterns are recommended:

*   **Pre-Provisioning Validation:**
    *   **CloudFormation Guard (cfn-guard):** Use policy-as-code rules in the CI/CD pipeline to prevent insecure configurations (e.g., public S3 buckets, wildcard IAM permissions, open security groups) from ever being shipped.
    *   **CloudFormation Hooks & Parameter Constraints:** Use native CloudFormation features to proactively validate user inputs (e.g., `AllowedPattern`, AWS-specific types) before any resources are created.

*   **Post-Provisioning Validation & UX Patterns:**
    *   **In-App Onboarding Wizard:** This is the primary UX pattern for the guided setup. It offers the best control, contextual explanations, and is most accessible to non-technical personas like Product Managers or CTOs.
    *   **AWS Systems Manager (SSM) Automation:** Supplement the wizard with SSM Automation runbooks for complex operational tasks that require AWS account-level access (e.g., applying IAM policies, rotating secrets, running security checks). These can be triggered from the in-app wizard.
    *   **CloudWatch Synthetics Canaries:** After deployment, automated canaries should run to simulate user workflows, verifying the 'time-to-real' SLO and ensuring the environment is fully functional before handing off to the user.


# Upgrade Mechanics Strategy

## Versioning Scheme

A multi-level versioning scheme is recommended to ensure clarity and enable deterministic rollbacks. The global product will use semantic versioning (MAJOR.MINOR.PATCH). Individual components will also be versioned: container images will be immutable, identified by both a semantic version tag and a digest; Lambda functions will use new, immutable versions for each deployment, with aliases pointing to specific versions. Scenario packs are treated as versioned data artifacts with their own semantic version and a content checksum. Every product release will be accompanied by a machine-readable 'Release Manifest', which serves as the single source of truth, listing the exact artifacts to be deployed, including container image digests, Lambda version ARNs, scenario pack S3 keys, and the required database migration version.

## Database Migration Strategy

To ensure data integrity and high availability, an online migration strategy executed within the customer's account is essential. The recommended approach is the 'expand-and-contract' pattern for online migrations, which involves additive, backward-compatible schema changes followed by idempotent backfill jobs. A standardized migration engine like Flyway is recommended, packaged into a dedicated 'migration-runner' container that runs securely within the customer's account. The entire process should be orchestrated by an AWS Step Functions state machine to provide visibility, error handling, retry logic, and manual approval steps. Before any potentially destructive changes, an RDS snapshot or equivalent database backup must be created to facilitate rollbacks.

## Deployment Strategy

The choice of deployment strategy is based on the risk and nature of the release. The default recommendation is to use Blue/Green deployments for major releases or any update involving schema changes to ensure maximum safety and minimal downtime. For low-risk, backward-compatible patch releases, Canary or Rolling deployments can be used. For Amazon ECS, blue/green involves creating a new task set and ALB target group, shifting traffic via AWS CodeDeploy, and keeping the old task set for fast rollback. For AWS Lambda, the strategy leverages Lambda Versions and Aliases, with AWS CodeDeploy automating a gradual traffic shift (Canary or Linear) to the new version, complete with alarms to trigger automatic rollbacks if health checks fail. A comprehensive set of health signals, including synthetic business scenarios, must be monitored before, during, and after the cutover.

## Upgrade Approval Process

Given that Jungle3 runs in the customer's account and contains their data, control over upgrades must reside with the customer. The default model is that all upgrades are customer-triggered; an explicit action is required to initiate an update. An opt-in auto-upgrade program can be offered for non-breaking patches but must have strict guardrails. To facilitate informed approvals, the process leverages native AWS tools. CloudFormation Change Sets must be used to allow customers to preview all proposed changes to their AWS infrastructure before execution. For application-level changes, a mechanism to launch a sandboxed 'shadow' stack should be provided, allowing customers to run tests against the new version before committing to the upgrade in their primary environment.


# Environment Reset And Reseed Strategy

## Data Partitioning Model

A strict data partitioning model is essential to enable safe resets. The model separates the data into two primary domains: a 'preserved' domain and a 'resettable' domain. The preserved domain includes all customer-owned configurations, integration credentials, API keys, IAM mappings, and environment-level settings; this data is never overwritten by a standard reset. The resettable domain contains all ephemeral, synthetic business data, such as cases, claims, transactions, seeded personas, and test audit trails. This partitioning is implemented through physical separation where feasible, using separate RDS instances or databases, dedicated DynamoDB tables, and distinct S3 buckets for each domain. A lightweight metadata 'pointer' in the preserved domain points to the currently active set of resettable resources, enabling atomic swaps.

## Reset And Reseed Patterns

Specific AWS service patterns are recommended for reset and reseed operations. For relational synthetic data in RDS, the primary pattern is to use automated snapshots. A pristine reset involves restoring from a baseline snapshot to a new DB instance and then updating the environment's pointer. Point-in-Time Recovery (PITR) is used for rollbacks to a specific time. For NoSQL data in DynamoDB, the pattern involves using the Export-to-S3 and Import-from-S3 features. Reseeding involves creating a new table by importing data from a scenario pack stored in S3, verifying it, and then swapping the environment pointer to the new table. For scenario assets in S3, versioning and per-scenario prefixes are used, with reseeds involving copying or switching prefixes. Event replay from an authoritative log in S3 can be used to reconstruct synthetic activity in event streams.

## User Controls And Safety

User-visible controls must be clear and include multiple safety confirmations. Three distinct operations should be exposed: 'Pristine Reset', 'Reseed with Scenario Pack', and 'Rollback to Snapshot'. Each operation must require a multi-step confirmation, such as typing the environment name, to prevent accidental execution. To ensure safety, reseed jobs must be idempotent, using stable, deterministic IDs for all seeded items to prevent data duplication. A critical guardrail is a version compatibility check: the reseed pipeline must validate that the seed pack version is compatible with the running application code version, rejecting or quarantining mixed-version seeds by default. A 'dry-run' mode should also be offered to show a summary of expected changes before execution.

## Auditing And Cost Implications

Every reset and reseed action must be recorded as an immutable audit event in a preserved audit store (e.g., a dedicated DynamoDB table or append-only S3 bucket). This audit record should capture the user identity, IAM role, timestamp, seed pack ID and checksum, and links to the underlying AWS API calls in CloudTrail (e.g., `RestoreDBInstanceFromDBSnapshot`). The cost and time implications vary by pattern: RDS restores depend on DB size and instance class; DynamoDB imports depend on data size and can incur on-demand capacity costs during seeding. These implications should be made transparent to the user, potentially by offering different tiers like a 'fast-reset' (using pre-warmed clones at a higher storage cost) versus a 'cold-reset' (cheaper but slower).


# Definition Of Installable

## Definition By Persona

For Jungle3, 'installable' is a multi-faceted term defined by the stakeholder's role and objectives:

*   **For a Platform Engineer:** 'Installable' means the product can be deployed reproducibly using a provided CloudFormation Stack or StackSet with well-documented inputs. The deployment must adhere to organizational policy guardrails (like SCPs), require no manual vendor intervention, and result in a `CREATE_COMPLETE` status with all health checks passing. The engineer expects to manage the Jungle3 instance via standard IaC and GitOps workflows, treating it as a first-class citizen in their environment.

*   **For a Product Manager (PM):** 'Installable' is achieved when a full product demo can be executed within the promised 'time-to-real' SLO. This means a scripted scenario, like a synthetic insurance claim processing through its entire workflow, completes successfully, and the pre-built dashboards reflect the expected activity and state transitions, proving the system is alive and plausible from day one.

*   **For a CTO/Security Officer:** 'Installable' means the entire process can be completed securely under the principle of least privilege and within established governance frameworks. This requires that the installation uses customer-owned encryption keys (CMKs) and telemetry data stores, attaches permission boundaries to all created IAM roles to prevent privilege escalation, and involves no default vendor access to the customer's AWS account.

## Target Time Slos

The target Service Level Objectives (SLOs) for elapsed installation time, measured from the initial CloudFormation launch to a fully functional and interactive environment, are tailored to the deployment context:

*   **Solo Account (Developer/PoC):** 15–45 minutes. This rapid turnaround is crucial for individual developers or small teams evaluating the product, supporting the 'time-to-real' thesis.

*   **Single-Account Production (Platform Engineer):** 30–90 minutes. This longer window accounts for pre-flight checks and the provisioning of more robust, production-grade resources.

*   **Control Tower / AWS Organizations (Multi-Account):** 10–40 minutes per account after the initial StackSet operation begins, with a target of deploying to an entire Organizational Unit (OU) within 4 hours. This accommodates the sequential or batched nature of large-scale deployments.

*   **Overall Goal:** The universal goal is to enable a user to log into a running, interactive Jungle3 UI in under 60 minutes from the initial Marketplace launch click.

## Preflight Checklist And Permissions

A successful installation requires a comprehensive pre-flight check and a clearly defined, least-privilege IAM model.

**Pre-Installation Checklist:**
1.  **Regions & Marketplace:** Confirm the AWS Marketplace listing supports the target AWS Region.
2.  **Service Quotas:** Verify account limits for EC2 vCPUs, VPCs, NAT Gateways, Load Balancers, and RDS instances.
3.  **Networking:** Validate VPC and subnet requirements, ensuring CIDR blocks do not overlap and routing is correctly configured.
4.  **IAM & Identity:** The principal launching the stack must have `cloudformation:CreateStack` and `iam:PassRole` permissions. For StackSets, trusted access with AWS Organizations must be enabled.
5.  **Encryption (KMS):** Decide on using a customer-managed KMS key (CMK), which is the recommended approach for full customer control.
6.  **Service Control Policies (SCPs):** Ensure SCPs in AWS Organizations do not block required services like ECS, IAM, or KMS.
7.  **Secrets Management:** Determine if secrets will be provided as parameters or generated and stored in a customer-owned AWS Secrets Manager.

**Least-Privilege IAM Implementation:**
*   **Deployment Role:** The installation must use a narrowly-scoped CloudFormation service role (e.g., `Jungle3-CFN-Role`) that CloudFormation assumes. The user only needs `iam:PassRole` permission on this specific role, not broad administrative rights.
*   **Permission Boundaries:** A customer-defined permission boundary must be attached to all IAM roles created by the Jungle3 template. This sets a maximum permission ceiling, preventing any potential privilege escalation.
*   **Runtime Roles:** Each microservice within the Jungle3 environment must run with its own fine-grained IAM role (e.g., using IRSA for EKS or Task Roles for ECS), granting only the permissions necessary for its function.

## Failure And Telemetry Semantics

The installation process must include robust semantics for handling failures and collecting telemetry in a secure, customer-owned manner.

**Failure and Rollback:**
*   **Default Behavior:** The installation must leverage CloudFormation's default behavior to automatically roll back the entire stack to its previous stable state upon failure. The `DisableRollback=false` setting should be maintained for all production deployments.
*   **Change Previews:** For updates, the process must use CloudFormation Change Sets, allowing customers to preview all proposed infrastructure changes before execution.
*   **Recovery Playbook:** Jungle3 must ship with a documented recovery guide that helps customers review CloudFormation events, pinpoint the failing component, and re-run the deployment after fixing the root cause (e.g., a parameter or quota issue).

**Customer-Owned Telemetry:**
*   **Design Principle:** All telemetry (logs, metrics, traces) must be written to customer-owned and controlled destinations by default. There should be no default vendor access to this data.
*   **Implementation:** The CloudFormation template should create resources like CloudWatch Log Groups, Metrics namespaces, and potentially an OpenTelemetry exporter that sends data to a customer-controlled destination (e.g., Kinesis Data Firehose, S3). All data must be encrypted with customer-managed KMS keys.
*   **Vendor Access:** Any vendor access for support purposes must be an explicit, opt-in, time-limited process managed by the customer, typically via a temporary, auditable IAM role assumption.


# Marketplace Failure Modes And Mitigations

## Failure Mode Analysis

An analysis of public signals reveals several common failure modes for complex CloudFormation-based products on AWS Marketplace, which Jungle3 must proactively mitigate:

*   **Installation Friction & Brittle Templates:** This is the most common failure. Root causes include oversized default resources that hit service quotas, long-running initialization scripts that time out, fragile nested stack dependencies (e.g., `TemplateBody` vs. `TemplateURL` issues), and non-idempotent custom resources. The impact is a failed deployment, a long time-to-value, and an immediate erosion of customer trust.
*   **Hidden Ongoing Costs:** Customers receive surprise AWS bills from resources they didn't realize were so expensive. Root causes are production-sized defaults for components like RDS, OpenSearch, and multi-AZ NAT Gateways, as well as background jobs that generate significant usage. The impact is customer churn, negative reviews, and refund requests.
*   **Weak Teardown Flows:** The product installs but cannot be cleanly removed. This is caused by resources with `DeletionPolicy: Retain` (like S3 buckets or EBS volumes), custom resources without proper delete logic, or cross-stack dependencies. The impact is 'zombie' infrastructure that continues to incur costs and poses a security risk, leading to extreme customer dissatisfaction.
*   **Unclear Entitlements:** Customers are confused about what their subscription actually provides. This stems from a mismatch between the Marketplace subscription UX and the product's internal licensing checks. The impact is functional surprise, where a customer believes a product is active but is blocked by an entitlement check.
*   **Plausibility Collapse:** A failure mode specific to Jungle3. The synthetic environment is so obviously fake (e.g., inconsistent data, unrealistic timelines, developer artifacts in the UI) that it loses all value as a realistic starting point.

## Case Studies

A synthesis of public signals from forums like StackOverflow, AWS documentation, and GitHub issues reveals several illustrative case studies of these failures:

*   **Case A: The Stuck Stack (`DELETE_FAILED`):** A user tries to delete a failed installation, but the CloudFormation stack gets stuck in `DELETE_FAILED` because a resource (like a non-empty S3 bucket or a network interface) cannot be deleted. This requires manual, often complex, CLI intervention to resolve.
*   **Case B: The Hanging Custom Resource:** A Lambda-backed custom resource fails to send a success/failure signal back to CloudFormation during a create or delete operation, causing the entire stack operation to hang for hours before timing out and failing.
*   **Case C: The Surprise Bill:** A user launches a product in a 'free trial' from the Marketplace, only to discover it provisioned a large, multi-AZ RDS cluster and NAT Gateways, resulting in hundreds of dollars in AWS infrastructure charges they were not expecting.
*   **Case D: The Brittle Nested Stack:** A product's main template fails because a nested stack's S3 URL is inaccessible or the parameters wired between the parent and child stacks are incorrect, leading to a cryptic deployment error.
*   **Case E: The Entitlement Mismatch:** A user subscribes to a product, but the application itself fails to launch or function, reporting an invalid license because the in-account software couldn't correctly validate the Marketplace subscription status.

## Detection And Testing Strategy

A multi-layered testing strategy is required to detect and prevent these failures before launch.

**1. Pre-Launch Static Analysis (CI/CD Pipeline):**
*   **Linting:** Use `cfn-lint` and `cfn_nag` to check for syntax errors, security vulnerabilities, and AWS best practices.
*   **Policy-as-Code:** Use CloudFormation Guard (`cfn-guard`) to enforce custom policies, such as disallowing expensive instance types in the default 'demo' profile or ensuring all S3 buckets have `PublicAccessBlock` enabled.

**2. Automated Deployment Testing (CI/CD Pipeline):**
*   **Matrix Testing with TaskCat:** Use TaskCat to automate the deployment and deletion of the CloudFormation templates across a matrix of permutations, including different AWS regions, VPC modes (new vs. existing), and resource profiles ('demo', 'prod'). This is critical for catching environment-specific bugs.
*   **Idempotent Create/Delete Cycle Test:** The pipeline must automate a full create-update-delete cycle, asserting that no resources are orphaned after deletion.
*   **Fault Injection:** Intentionally simulate failures (e.g., network timeouts for custom resources, permission denials) to test the resilience and rollback capabilities of the templates.

**3. Post-Deployment Canary Testing:**
*   **Synthetic Canaries:** After a successful deployment in the test environment, run CloudWatch Synthetics canaries that simulate end-to-end user workflows. These canaries measure the 'time-to-real' SLO and verify that the synthetic environment is behaving plausibly.

**4. Manual and Runtime Checks:**
*   **New Account Launch Test:** Manually perform the entire buyer journey in a completely fresh AWS account to catch any unstated dependencies.
*   **Cost Smoke Test:** Deploy the default profile, let it run for 24 hours, and verify that the actual cost aligns with the projected cost.

## Direct Mitigations For Jungle3

Jungle3 must implement specific mitigations across its product, documentation, and user experience:

*   **Listing and Procurement UX:**
    *   **Cost Transparency:** The Marketplace listing must feature a prominent 'Cost to Run' section with a detailed, itemized cost table for 'demo', 'eval', and 'production' profiles. The default launch option must be the lowest-cost 'demo' profile.
    *   **Clarity:** Explicitly state that the product is 'CloudFormation-launched' and not a hosted SaaS offering.

*   **CloudFormation Template and Runtime:**
    *   **Resource Profiles:** Ship with distinct 'demo', 'eval', and 'production' profiles. The 'demo' profile must use minimal resources (e.g., small instance types, serverless components where possible) to keep idle costs low.
    *   **Robust Tagging & Cleanup:** Enforce a unique `Jungle3-run-ID` tag on every single resource created. Ship a dedicated 'Jungle3-Cleanup' script or change-set that finds and deletes all resources with that tag, providing a reliable uninstall path.
    *   **Pre-Flight Checks:** Implement an early-running Lambda function in the template that checks for necessary permissions and active entitlements, failing fast with a clear error message before provisioning expensive resources.

*   **Documentation and Support:**
    *   **Quickstart & Cleanup Guides:** Provide a 10-minute quickstart guide for the entire flow. Have a dedicated troubleshooting section for common CloudFormation failures (`DELETE_FAILED`, etc.) and a clear runbook for the cleanup script.

*   **In-App User Experience:**
    *   **Post-Install Cost Banner:** Display a banner in the UI after installation showing the estimated monthly run cost of the deployed environment.
    *   **Safe Uninstall Button:** Provide a button in the UI that triggers the 'Jungle3-Cleanup' process and monitors its progress.


# Cost Transparency And Guardrails

## Tco Estimator Strategy

Jungle3 will provide a dynamic, parameterized Total Cost of Ownership (TCO) estimator to ensure customers have clear visibility into potential AWS infrastructure costs before deployment. This will be implemented as a microservice using AWS Lambda and API Gateway, leveraging the AWS Price List Query API for accurate, up-to-date pricing. The estimator will be embedded in two key locations: as a 'launch cost preview' link on the AWS Marketplace product page and directly within the CloudFormation launch console, where it will automatically run with the selected parameters to provide a final cost preview before the user commits to launching the stack. To further empower customers, Jungle3 will also provide pre-filled AWS Pricing Calculator links and an Infracost configuration file with a sample GitHub Action script, allowing them to run cost checks independently within their own CI/CD pipelines.

## Low Cost Defaults Strategy

To prevent bill shock and align with a 'cost-aware' posture, Jungle3's default deployment configurations will be aggressively optimized for low cost, with more expensive components being explicit, documented opt-ins. For small or development profiles, the UI and static content will be served via Amazon S3 and CloudFront, avoiding the fixed hourly cost of an Application Load Balancer (ALB). The API layer will default to a pay-per-use model with API Gateway and Lambda, and any containerized components on AWS Fargate will autoscale to a minimum of zero tasks. To minimize data transfer costs, internet egress will be controlled by prioritizing VPC Endpoints (PrivateLink) for AWS service traffic. Expensive services like multi-AZ NAT Gateways and dedicated OpenSearch domains will be opt-in, with defaults favoring lower-cost alternatives like a single NAT instance for dev/test, OpenSearch Serverless, or Aurora Serverless v2 with auto-pause capabilities.

## Deployable Cost Guardrails

Jungle3 will empower customers to manage their costs from day one by providing optional, deployable nested CloudFormation stacks that establish immediate cost guardrails. These include: 1) An `AWS::Budgets::Budget` resource to create monthly actual and forecasted budgets with notifications sent to the purchaser's email. 2) An `AWS::Budgets::BudgetsAction` resource to define automated actions when a budget threshold is breached, such as attaching a restrictive IAM policy to limit further resource creation. 3) A CloudFormation custom resource that calls the Cost Explorer API to create `AnomalyMonitor` and `AnomalySubscription` resources, enabling AWS Cost Anomaly Detection to provide early warnings of unexpected spending spikes. All destructive actions, such as stopping services, will be strictly opt-in to prevent disruption.

## Auto Suspend And Cost Regression Testing

To minimize costs for non-production environments, Jungle3 will provide a well-documented 'Suspend/Resume' mechanism. The 'Suspend' action, triggerable manually or on a schedule, will scale down resources by updating ECS services' desired count to zero, pausing Aurora Serverless databases or stopping provisioned RDS instances, and pausing EventBridge schedules. To prevent cost increases in new product versions, a cost regression test matrix will be integrated into the CI/CD pipeline. This matrix will cover permutations of regions, deployment sizes (Small, Medium, Large), and optional components. The open-source tool Infracost will be used in pull requests to generate cost difference reports, and a nightly job will calculate baseline costs for each permutation, with automated checks to block any PR that introduces a significant cost increase for a given profile.


# Security And Compliance Posture

## Iam And Permissions Design

Jungle3's IAM design is founded on the principle of least privilege within a customer-owned account. Deployment will be initiated using a customer-owned CloudFormation execution/service role, not by granting the vendor a cross-account role. This execution role will be scoped with minimal permissions and, crucially, will have a customer-defined IAM Permission Boundary attached. This boundary acts as a cap, preventing any role created by the Jungle3 stack from escalating privileges beyond what the customer explicitly allows. At runtime, each microservice will operate with its own dedicated, fine-grained IAM role (using IRSA for EKS or Task Roles for Fargate), granting access only to the specific resources it needs. All human operator access must be through temporary credentials via IAM Identity Center or a federated IdP with mandatory MFA.

## Encryption And Secrets Management

The strategy mandates a 'secure by default' posture for all data. All sensitive data at rest (in EBS, RDS, S3, etc.) will be encrypted using customer-managed KMS keys (CMKs) that reside in the customer's account, with key policies narrowly scoped to the specific service roles that require access. Encryption in transit will be enforced end-to-end using TLS 1.2+. For secrets management, AWS Secrets Manager is the designated store for all credentials, such as database passwords and API keys. The system will leverage Secrets Manager's built-in capability for automatic rotation via Lambda functions, with rotation schedules aligned to customer security policies (e.g., every 30-90 days).

## Supply Chain Security

Jungle3 will implement a secure software supply chain to ensure the integrity of all deployed artifacts. The CI/CD pipeline will cryptographically sign all container images using tools like Sigstore's `cosign` or `Notation`. At runtime, an admission controller (e.g., Kyverno, Gatekeeper) in the customer's cluster will verify these signatures before allowing any pod to run. The build process will also generate and attach comprehensive supply-chain metadata, including Software Bill of Materials (SBOMs) in a standard format (SPDX/CycloneDX) and build provenance attestations. Continuous vulnerability scanning will be enforced both in the CI pipeline (blocking builds with critical vulnerabilities) and within the customer's ECR repository using Amazon Inspector.

## Network Security And Auditing

Jungle3 workloads must be deployed into a customer-owned VPC with a secure topology, featuring segregated private subnets for application and data tiers. All outbound internet access will be routed through controlled egress points like a NAT Gateway or a central firewall, allowing for logging and filtering. To enhance security and reduce costs, communication with other AWS services will be forced through VPC Endpoints (PrivateLink), keeping traffic off the public internet. For compliance, the deployment will facilitate customer evidence collection by enabling AWS CloudTrail, AWS Config, GuardDuty, and Security Hub by default. The documentation will guide customers on using AWS Audit Manager to map these controls to frameworks like SOC2 and ISO 27001, streamlining their audit processes.


# Observability And Inspectability Package

## Recommended Observability Stack

The recommended day-one observability stack for Jungle3 is a minimal, secure-by-default, and customer-owned package centered on AWS-native services to reduce friction and cost. The stack includes:

*   **Core Stack:** AWS CloudWatch for metrics, logs (via Logs Insights), and alarms, combined with the AWS Distro for OpenTelemetry (ADOT) collector for standardized telemetry collection.
*   **Tracing:** The ADOT collector will be configured to export traces to AWS X-Ray by default, providing low-friction, end-to-end visibility across microservices. The configuration will allow optional exporting in OTLP format to other backends if the customer chooses.
*   **Visualization (Optional):** To enhance the user experience without high mandatory costs, the package will offer an optional, pre-provisioned, viewer-only Amazon Managed Grafana workspace. This provides richer visualization capabilities by connecting to the customer's CloudWatch data.
*   **Advanced Search (Opt-In):** OpenSearch/Kibana will be avoided by default due to its significant fixed cost and operational burden. It will be offered as an optional, opt-in nested CloudFormation stack for customers who require advanced, long-term log search capabilities.
*   **Prometheus Compatibility (Opt-In):** For customers standardized on Prometheus, Amazon Managed Service for Prometheus (AMP) will be available as an optional, CloudFormation-launched workspace.

## Default Dashboards And Traces

To prevent 'plausibility collapse' and demonstrate a living system, Jungle3 will ship with a set of minimal yet credible dashboards and pre-instrumented traces, all provisioned via CloudFormation.

**Default Dashboards (CloudWatch & Grafana Templates):**
*   **System Summary:** An overview dashboard showing service health, request/error rates, p50/p95 latency, active workflow counts, and key metrics for background activity (e.g., jobs executed, messages processed).
*   **Queue Health:** Panels displaying SQS/SNS queue depth, age of the oldest message, and dead-letter queue (DLQ) counts to visualize background processing.
*   **Workflow State View:** A timeline or table illustrating the state transitions of synthetic cases, showing counts of items in each state (e.g., 'Pending Review', 'Approved', 'Failed').
*   **Logs & Traces:** A panel with saved CloudWatch Logs Insights queries to show recent errors and a list of recent traces linking directly to the X-Ray console.

**Default Traces:**
*   Using ADOT auto-instrumentation, key workflows like 'Case Processing' will be traced end-to-end. Traces will include explicit spans for critical events such as API request entry, orchestration start, queue enqueue/dequeue operations, and state transitions, ensuring a clear visual flow of activity.

## Log Correlation And Security

A secure and correlated logging strategy is essential for making the distributed system diagnosable.

**Log and Trace Correlation:**
*   **Correlation ID:** A single W3C `traceparent` ID will be generated at the edge and propagated across all services. This `trace_id` will be included in HTTP headers, SQS message attributes, and as a structured field in every log line.
*   **Standardized Logging:** All services will use a standardized JSON logging format that includes fields for `timestamp`, `level`, `service`, `trace_id`, `span_id`, and `case_id`. This structure enables powerful filtering and grouping in CloudWatch Logs Insights and allows for direct click-through from logs to corresponding traces in X-Ray.

**Secure-by-Default Data Handling:**
*   **PII Masking:** Application log formatters and the ADOT collector will be configured to automatically redact sensitive patterns (e.g., email, SSN) from logs and traces before they are persisted, preventing accidental PII exposure.
*   **Defined Retention:** The CloudFormation templates will enforce conservative default data retention periods (e.g., 7 days for verbose application logs, 30 days for error logs) to manage costs and limit data exposure. Customers can override these defaults.
*   **Encryption:** All logs, traces, and any exported data will be encrypted at rest by default, using a customer-managed KMS key created and controlled by the main CloudFormation stack.

## Customer Runbooks

To empower customers to diagnose common issues independently, Jungle3 will ship with pre-built, step-by-step runbooks in Markdown format. Initial runbooks will include:

1.  **Runbook: “Trace a Failed Case Processing Run”**
    *   **Step 1:** Identify a failed workflow from the main dashboard.
    *   **Step 2:** Find the `trace_id` associated with the failed `case_id` in the workflow view.
    *   **Step 3:** Paste the `trace_id` into the AWS X-Ray console to visualize the entire transaction, pinpointing the service that returned an error and its latency.
    *   **Step 4:** Use the same `trace_id` in a pre-saved CloudWatch Logs Insights query to retrieve all correlated logs for deep-dive analysis.

2.  **Runbook: “Investigate High API Latency”**
    *   **Step 1:** Observe the p95 latency spike on the API gateway dashboard.
    *   **Step 2:** Use the trace sampler view to find a representative slow trace.
    *   **Step 3:** Analyze the trace in X-Ray to identify the specific downstream service or database call contributing the most to the latency.
    *   **Step 4:** Inspect the resource metrics (CPU, Memory) for the implicated service to check for resource contention.


# Artifact Packaging And Distribution Strategy

## Primary Delivery Mechanism

The recommended primary delivery mechanism is a container-first approach, where all application components are packaged as OCI (Open Container Initiative) images. These images must be identified and deployed using their immutable digests (e.g., `repositoryUri@sha256:...`) rather than mutable tags. This ensures that every deployment is deterministic, repeatable, and secure. The use of AMIs (Amazon Machine Images) should be strictly avoided unless there is an unavoidable OS-level dependency that cannot be containerized. For AWS Lambda components, the preference is to package them as container images or as versioned zip artifacts stored in Amazon S3, pinned by their specific `versionId`, rather than relying solely on the Serverless Application Repository (SAR).

## Build And Release Pipeline

A secure build and release pipeline is essential for establishing a trusted software supply chain. This pipeline must be designed to produce a set of immutable artifacts for every release. Key outputs include: the OCI container image, a Software Bill of Materials (SBOM) in a standard format like CycloneDX or SPDX, a signed in-toto attestation verifying the build process, and a cryptographic signature for the image using a tool like `cosign` (from the Sigstore project) or `Notation`. A signed JSON release manifest should be published for each release, acting as the single source of truth by listing the exact digests and versions of all components. This allows for verifiable provenance and automated, deterministic rollbacks.

## Regional Replication Strategy

To support a global AWS Marketplace listing, artifacts must be available in all targeted AWS Regions. The recommended strategy is for the seller to host images in their own private Amazon ECR (Elastic Container Registry) repositories and configure ECR's cross-region replication rules. This will automatically copy images to all commercial AWS regions where the product is listed. For separate AWS partitions like GovCloud or China, which are isolated, a distinct CI/CD pipeline must be established to push artifacts directly into a registry within that partition. If AMIs are used, an automated `copy-AMI` workflow is required for each region, and a mapping of Region-to-AMI-ID must be maintained in the CloudFormation templates.

## Support For Regulated Environments

To cater to customers in regulated, air-gapped, or high-security environments, the distribution strategy must include several options for controlled artifact consumption. These include: providing guidance for customers to set up ECR pull-through cache rules to control ingress; offering scripts and documentation for private mirroring, allowing customers to copy Jungle3 images into their own private ECR registries; supporting cross-account ECR replication for a more integrated mirroring experience; and for fully disconnected environments, providing a downloadable, signed tarball bundle containing the container images, SBOMs, signatures, and import scripts. The templates should also support deployment in private-only networks using VPC endpoints for all AWS service communications.


# Telemetry And Licensing Architecture

## Entitlement Validation Architecture

To validate a customer's AWS Marketplace subscription without requiring any cross-account access, Jungle3 will use a secure, in-account verification pattern. Upon startup, a component within the deployed Jungle3 instance will perform two local API calls: first, it will call `sts:GetCallerIdentity` to retrieve the AWS Account ID in which it is running. Second, it will call the AWS Marketplace Entitlement Service's `GetEntitlements` API, filtering the request by Jungle3's unique `ProductCode` and the `CustomerAWSAccountId` obtained from the first call. The instance then inspects the returned entitlements to confirm an active subscription. This entire process is executed by an IAM role within the customer's account, ensuring that the vendor never needs direct access or credentials.

## Privacy Preserving Telemetry Policy

Jungle3 will adopt a strict privacy-first telemetry policy with a tiered, opt-in model. By default, the system will operate in a 'minimal' mode, collecting only what is absolutely necessary for billing (high-level usage counters for metered dimensions) and a basic health heartbeat. All richer telemetry for product improvement—such as aggregated performance metrics or feature usage counters—will require an explicit customer opt-in. The system will never collect PII by default. Any collected identifiers will be pseudonymized using a per-deployment, non-reversible hash. Metrics will be aggregated locally before being sent to avoid transmitting raw data. A clear Data Processing Notice (DPN) and a machine-readable telemetry schema will be published in the documentation for full transparency.

## Secure Outbound Communication Design

To accommodate diverse customer network security postures, Jungle3 will support multiple secure 'phone-home' communication patterns for telemetry and metering. The primary and most secure recommended method is for the vendor to expose ingestion endpoints via an AWS PrivateLink Endpoint Service. This allows customers to create an Interface VPC Endpoint in their own VPC, ensuring all communication remains on the AWS private network. As alternatives, the application will respect standard proxy environment variables (e.g., `HTTPS_PROXY`) to route traffic through customer-managed inspection infrastructure, and as a fallback, will use standard HTTPS (TLS 1.2+) to a set of well-documented public IP ranges that customers can add to firewall allowlists.

## Offline Environment Strategy

Jungle3 will treat offline and air-gapped environments as a first-class use case. The preferred solution for these customers is to use AWS Marketplace Private Offers to establish a contract-based pricing model (e.g., annual subscription) or a Bring Your Own License (BYOL) model. This eliminates the need for any real-time metering calls. As an alternative, the product will support a signed offline license file mechanism. In this flow, the customer receives a cryptographically signed JSON file containing their entitlement details, which the deployed instance can verify locally using a bundled public key, removing the need for any network-based entitlement checks.


# Multi Region And Partition Strategy

## V1 Regional Rollout Plan

The regional rollout for Jungle3 will be sequenced to balance market coverage with engineering complexity, prioritizing stability and service availability.

*   **v1 Target Commercial Regions:** The initial launch will target a core set of high-demand, full-featured commercial AWS regions. The recommended list includes:
    *   `us-east-1` (N. Virginia)
    *   `us-west-2` (Oregon)
    *   `eu-west-1` (Ireland)
    *   `ap-northeast-1` (Tokyo)
    *   `ap-southeast-1` (Singapore)
    This selection provides broad geographic coverage and ensures all key dependent AWS services are available.

*   **Deferred Regions (Post-v1):** Support for other commercial regions (e.g., in Canada, Europe, and APAC) will be deferred past the initial launch and prioritized based on customer demand signals and telemetry.

*   **GovCloud (Deferred to v1.1 or later):** Support for AWS GovCloud (`us-gov-west-1`, `us-gov-east-1`) will be explicitly deferred. Due to the significant operational overhead and compliance complexities, GovCloud support will only be pursued when driven by a signed contract or a clear, committed sales pipeline from a federal or ITAR-regulated customer.

## Service Availability And Artifact Replication

A successful multi-region strategy depends on understanding AWS service availability and implementing a robust artifact replication process that respects partition boundaries.

*   **Service Availability Analysis:** While most core services (ECS, Fargate, Step Functions, EventBridge) are broadly available, newer or more advanced services like Amazon Managed Grafana and certain Cognito features have only recently become available in GovCloud. The deployment templates must account for potential feature discrepancies and quota differences between regions.

*   **Artifact Replication Strategy:**
    *   **Container Images (ECR):** For commercial regions, a seller-managed Amazon ECR repository will be configured with cross-region replication rules to automatically copy images to all target regions. However, this replication does not cross the partition boundary into GovCloud. A separate CI/CD pipeline job will be required to push images directly to a dedicated ECR repository within the GovCloud partition.
    *   **AMIs:** As AMIs are region-specific, an automated workflow using the `CopyImage` API will replicate the base AMI across all target commercial regions. Copying an AMI into GovCloud is a more complex process that requires exporting the VM and importing it into the GovCloud partition, necessitating a separate, dedicated automation script.
    *   **KMS Keys:** AWS KMS multi-Region keys can only be replicated within a single partition. Jungle3 will not bundle keys; instead, the CloudFormation templates will require customers to provide the ARN of a customer-managed key in the target region.

## Risk Mitigation Strategy

To protect the core product values of 'plausibility' and 'time-to-real' in regions with limited or absent AWS services, a strategy of graceful degradation using feature flags and fallback components is essential.

*   **Feature Flags:** The CloudFormation templates and application code will use feature flags to conditionally enable or disable functionality based on the deployment region. This allows the same codebase to adapt to different environments.

*   **Fallback Components:**
    *   **For Missing Cognito:** In a region without Cognito, the deployment will include a lightweight, container-based identity stub to handle persona authentication and maintain the user experience.
    *   **For Missing EventBridge:** If EventBridge is unavailable or throttled, a fallback local event bus (e.g., a containerized RabbitMQ or an SQS-based shim) will be deployed to maintain inter-service communication and background activity.
    *   **For Missing Managed Grafana:** To ensure observability is never compromised, the deployment will bundle a self-hosted, open-source Grafana instance if the managed service is not available.

*   **Pre-flight Checks:** The installation process will begin with a pre-flight check that validates the availability of all required artifacts (AMIs, container images) and services in the target region, failing fast with a clear error message if a prerequisite is not met.

## Govcloud Support Considerations

Supporting AWS GovCloud is a significant strategic decision with substantial operational and engineering implications, and should not be undertaken lightly.

*   **Operational Overhead:** GovCloud is an isolated AWS partition. Supporting it requires:
    *   A completely separate artifact management pipeline to build, sign, and push container images and AMIs into GovCloud-specific registries and accounts.
    *   Distinct AWS Marketplace listing management and potentially a separate product entry.
    *   An expanded testing matrix to validate functionality in a more constrained environment.
    *   Increased support and operational costs to manage infrastructure across partitions.

*   **Engineering and Compliance Complexity:** GovCloud often has different API endpoints, service limitations, and a stricter compliance posture (e.g., FedRAMP, ITAR). The engineering team must account for these differences, and the company may need to undergo additional compliance audits.

*   **Recommendation:** Due to this high overhead, GovCloud support should be a demand-driven initiative. It should only be prioritized after securing a contractual commitment from a customer who explicitly requires deployment in a GovCloud environment. Without such a commitment, the engineering effort is better spent on enhancing the product in commercial regions.


# Automated Validation And Test Harness

## Testing Strategy Overview

The automated test harness is designed to validate install, upgrade, and reset flows across a wide matrix of configurations to ensure robustness. The test matrix dimensions include: provisioning mode (new VPC vs. existing VPC), network topology (2-AZ, 3-AZ), AWS regions (a representative set), account modes (single-account, multi-account with StackSets, Control Tower), and identity variants (minimal IAM vs. admin). The harness must also cover upgrade paths (minor in-place, major with migration) and reset paths (soft reseed, hard redeployment). This comprehensive matrix ensures that the CloudFormation templates are tested against the diverse and complex environments that customers will use, preventing 'it works on my machine' failures.

## Preflight And Policy Validation

To catch errors early and enforce standards, a series of pre-deployment checks are integrated into the CI/CD pipeline. This 'shift-left' approach uses policy-as-code tools for static validation before any resources are deployed. The key tools are `cfn-lint` for checking template syntax and best practices, and CloudFormation Guard (`cfn-guard`) for enforcing product-specific and security-related policies. These policies can include rules for allowed instance types, mandatory encryption, proper tagging, and restrictions on IAM statements. These checks act as a mandatory CI gate, failing pull requests that introduce non-compliant or insecure configurations and providing developers with immediate, actionable feedback.

## Deployment And Canary Testing

For dynamic testing, the harness uses TaskCat to orchestrate the deployment of CloudFormation templates across the defined matrix of regions and parameter sets. TaskCat automates the creation and deletion of test stacks, capturing logs and generating reports. After a successful deployment, the 'time-to-real' SLO is verified using synthetic canaries. These canaries, implemented with CloudWatch Synthetics, are scripts that simulate end-to-end user workflows, such as authenticating, validating seed data, and executing a core business process. The canaries emit custom CloudWatch metrics for `time-to-real-ms` and workflow success rates, with alarms configured to detect SLO breaches and block CI promotions if the environment is not fully functional within the target timeframe.

## Release Criteria And Troubleshooting

Clear, automated gates are defined to ensure only high-quality releases are published. Hard release gates include: 100% pass rate on all preflight checks, successful deployment of all critical TaskCat permutations, successful upgrade tests from previous versions, and meeting the 'time-to-real' canary SLOs. The CI pipeline is configured with automated rollback triggers if any of these gates fail. For troubleshooting, all test artifacts—including CloudFormation event streams, TaskCat reports, and canary logs—are retained in a central S3 bucket. To aid customer support, an optional 'support-integration' nested stack is provided, which customers can deploy to securely share a standardized troubleshooting bundle (logs, events) with the Jungle3 support team with their explicit consent.


# Decision Ready Recommendations

## V1 Actions

1.  **Adopt a Hybrid Compute Model:** Build v1 with a small, persistent AWS Fargate service for the core UI/API to guarantee responsiveness and a feeling of being 'always on'. Implement all background, scheduled, and event-driven processes as AWS Lambda functions to minimize customer-borne idle costs.

2.  **Implement a Guided Install UX:** The AWS Marketplace listing should launch a minimal CloudFormation template that deploys a temporary 'installer' UI. This UI will guide the customer through network, security, and scenario configuration before programmatically launching the main application stack.

3.  **Ship Dual IaC Options:** The primary Marketplace offering will be based on AWS CloudFormation. Simultaneously, develop and maintain a first-class, verified Terraform module to cater to enterprise customers standardized on Terraform and GitOps workflows.

4.  **Design for Enterprise Accounts:** From day one, parameterize all templates to deploy into existing VPCs and work within AWS Organizations and Control Tower environments. Test against common Service Control Policies (SCPs).

5.  **Implement Customer-Triggered, Blue/Green Upgrades:** Upgrades must be initiated by the customer. Use blue/green deployments for the Fargate services to ensure zero downtime, and ensure strict separation of application state to preserve data continuity.

6.  **Prioritize Cost Transparency:** Ship with low-cost defaults, provide a TCO estimator in the Marketplace listing, and include an optional nested stack for customers to deploy AWS Budgets and cost alerts.

7.  **Establish Secure Lifecycle Mechanics:** Implement a robust data partitioning model to enable safe reset/reseed operations. Enforce a secure-by-default posture with least-privilege IAM roles, permission boundaries, and customer-managed KMS keys.

8.  **Automate Comprehensive Testing:** Build a CI/CD pipeline that uses tools like TaskCat and CloudFormation Guard to continuously test install, upgrade, and reset flows across a matrix of regions and account configurations.

## Deferred Actions

1.  **Complex Usage-Based Metering:** Start with a simple, predictable, tiered subscription model (e.g., based on instance size). Defer fine-grained, usage-based metering via `BatchMeterUsage` until customer usage patterns are better understood.

2.  **Fully Automated, 'Hands-Off' Upgrades:** Always require customer consent and initiation for updates pushed into their account. Avoid any forced update mechanisms in early versions.

3.  **Broad Multi-Region and GovCloud Support:** Launch v1 in a limited set of core commercial AWS regions (e.g., us-east-1, us-west-2, eu-west-1). Defer support for specialized partitions like GovCloud and other lower-demand regions until there is clear, contract-driven customer demand.

4.  **Heavyweight Observability by Default:** Avoid deploying costly components like a dedicated OpenSearch cluster by default. Instead, ship with a lightweight CloudWatch-native observability package and make advanced tools an explicit, documented opt-in for the customer.

## Single Biggest Risk

The single biggest risk to Jungle3's success is **hidden ongoing costs**. If a customer subscribes, launches a 'Jungle' for evaluation, and then receives a surprisingly large AWS bill for idle resources (e.g., from NAT Gateways, ALBs, or oversized Fargate tasks), they will immediately churn, lose trust in the product, and damage its reputation. This directly undermines the goal of providing a low-friction, high-value evaluation experience and is the most common failure mode for complex Marketplace products.

## Cross Links To Other Topics

This packaging and deployment strategy is foundational and has significant knock-on effects on several other research topics:

*   **Cost Modeling:** The choice of a hybrid compute model and low-cost defaults directly determines the customer-borne cost structure.
*   **Data & State Management:** The strategy for upgrades (blue/green) and resets (data partitioning, snapshots) is fundamentally a data and state management problem.
*   **Developer Experience:** The decision to support both CloudFormation and Terraform defines the primary IaC interfaces for customers who will build on top of Jungle3.
*   **Security & Compliance:** The entire customer-owned deployment model, including IAM role design and network posture, is the core of the security and compliance story.
*   **Observability & Inspectability:** The packaging must include a default, customer-owned observability stack to make the synthetic environment feel real and be diagnosable.
*   **Testing & Validation:** The deployment strategy's complexity necessitates a comprehensive, automated test harness to ensure reliability across different customer environments.

