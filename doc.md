> Historical. Captured before the delivery model was decided.
> Read as design transcript, not as current architecture.
> Current architecture: see docs/decisions/0003-installable-via-aws-marketplace.md.
> AWS security-posture reasoning (synthetic-only data, private subnets,
> egress controls, TTL teardown, least-privilege IAM) still translates
> to the installable model. The account-structure and hosted-platform
> recommendations do not.

---

This is for the **“Welcome to the Jungle” innovation sprint** and the goal is a **safe-but-fast AWS sandbox** where teams can build in a less restrictive environment, demo to real beta customers, and not contaminate production.

## AWS setup plan

### 1. Account model

Create a **separate AWS account** just for the sprint, ideally under AWS Organizations or Control Tower if you already have that machinery. That gives you the cleanest blast-radius boundary for cost, IAM, logs, and cleanup. AWS guidance calls out multi-account isolation as a best practice, especially when sandbox controls differ from production. ([AWS Documentation][1])

Use this structure:

* **Management / shared services account**: optional, only if you already have one
* **Jungle Sandbox account**: all sprint workloads live here
* **Optional Demo account**: only if you want an extra separation between “builders” and “beta-customer-facing demos”

For your event, one account is probably enough unless legal/security people start twitching.

### 2. Network shape

Inside the sandbox account, deploy one VPC across at least two AZs:

* **Public subnets**

  * Application Load Balancer
  * NAT Gateway
  * Optional WAF association point
* **Private app subnets**

  * ECS Fargate services or EC2 workloads
  * Lambda in VPC only if truly needed
* **Private data subnets**

  * RDS, ElastiCache, internal services

AWS recommends private subnets for protected workloads, with NAT for outbound internet access when needed. For ECS/Fargate, tasks can run in private subnets and still reach the internet through NAT for image pulls and package access. ([AWS Documentation][2])

### 3. Runtime choice

Use **ECS on Fargate** as the default runtime for team apps.

Why:

* No servers to babysit
* Fast deploys
* Easy per-team isolation
* Good enough for scrappy prototypes without turning the event into an infrastructure cosplay session

Pattern:

* One ECS cluster for the event
* One service per team
* One ALB with path-based or host-based routing
* One ECR repo namespace per team or one shared repo with team tags

If some teams need static frontends, host those in **S3 + CloudFront** and point them at backend APIs in ECS or API Gateway. For small demos, humans adore building six stacks when two would do. Resist that urge.

### 4. Access model for builders

Use **IAM Identity Center** or at least federated roles. Avoid long-lived IAM users if you can.

Create roles like:

* `Jungle-Admin` for organizers
* `Jungle-Team-Builder` for team leads
* `Jungle-ReadOnly` for judges or support staff

Permissions boundaries should:

* allow ECS, ECR, CloudWatch Logs, S3, Lambda, API Gateway, DynamoDB, Bedrock if you want AI features
* block dangerous and expensive stuff unless approved
* deny IAM role creation except through approved templates
* deny opening random internet-facing ports except through the shared ALB path

AWS sandbox best-practice material explicitly talks about sandboxes giving broad access, but still with governance guardrails around what services and spend are allowed. ([AWS Documentation][3])

### 5. Ingress and beta customer access

For real beta customers, expose only the front door:

* **Route 53** for subdomains like `team1.jungle.yourdomain.com`
* **Application Load Balancer** in public subnets
* **AWS WAF** on the ALB
* TLS via **ACM**
* Backends stay in **private subnets**

That gives you a clean shared ingress point while keeping app containers non-public. AWS’s ECS networking guidance supports this shape cleanly. ([AWS Documentation][4])

If you want a stricter setup for internal-only demos, another AWS pattern is private container apps behind NLB and PrivateLink, but that is probably overkill for a fast-moving innovation sprint unless your beta users are internal enterprise users on a private network. ([AWS Documentation][5])

### 6. Egress controls

This part matters more than people think, because “sandbox” quickly becomes “accidental data exfil carnival.”

Baseline:

* Private subnets route outbound through **NAT Gateway**
* Add **VPC endpoints** for S3, ECR, CloudWatch Logs, Secrets Manager, STS where possible to reduce public internet dependency
* Use **security groups** tightly
* Turn on **VPC Flow Logs**
* If you need deeper filtering, use **AWS Network Firewall**

AWS VPC security guidance specifically recommends tools like Flow Logs, Network Access Analyzer, and Network Firewall for visibility and control. ([AWS Documentation][6])

### 7. Secrets and config

Use:

* **Secrets Manager** for API keys and credentials
* **SSM Parameter Store** for non-secret config
* Team-specific prefixes like `/jungle/team-7/*`

Never put secrets in GitHub Actions secrets per team if you can centralize them in the sandbox account with role-based retrieval. People love recreating credential leaks as a team sport.

### 8. Data policy

The event should default to **synthetic, public, or scrubbed data only**.

Make this explicit:

* No production PII
* No real customer data
* No live internal data unless pre-approved and masked
* Every dataset bucket tagged with classification

Use separate S3 buckets:

* `jungle-public-assets`
* `jungle-team-artifacts`
* `jungle-approved-datasets`

Enable versioning and basic lifecycle policies. If teams need relational storage, provide a small **Aurora Serverless v2** or **RDS** instance only for approved cases, otherwise push them toward DynamoDB.

### 9. Team isolation pattern

Each team gets:

* one ECS service or app stack
* one IAM role
* one S3 prefix or bucket
* one DynamoDB table namespace or separate table
* one subdomain
* one CloudWatch log group
* tagging: `Event=Jungle`, `Team=7`, `TTL=2026-08-15`

This makes support, billing, and cleanup dramatically easier.

### 10. CI/CD

Keep it brutally simple:

* GitHub org or repos per team
* GitHub Actions deploy into sandbox account via **OIDC**
* Reusable workflow template
* Deploy target: ECS, S3/CloudFront, Lambda, or API Gateway

That gives teams autonomy without handing them root access and a flamethrower.

### 11. Observability

Minimum stack:

* CloudWatch Logs for all services
* CloudWatch dashboards for team health
* ALB access logs to S3
* VPC Flow Logs
* Budgets + cost anomaly alerts
* Optional X-Ray if you want tracing

Organizers should have a single “war room” dashboard showing:

* per-team app status
* 4xx/5xx by team
* container restarts
* spend by tag
* top WAF blocks

### 12. Cost controls

This matters because innovation sprints have a weird talent for burning money on forgotten GPUs and NAT traffic.

Set:

* AWS Budgets alerts at event, team, and service levels
* Service quotas where possible
* SCPs or permissions boundaries to block:

  * massive EC2 instance families
  * SageMaker unless explicitly needed
  * public RDS
  * unmanaged load balancers
  * multi-region sprawl

Use TTL tags and an automatic cleanup Lambda or Step Function that deletes stale stacks after the event.

### 13. Temporary environment lifecycle

Best version of this:

* All infra deployed from CDK or Terraform
* Every team stack created from a template
* Nightly cleanup for orphaned resources
* Full teardown 24-72 hours after the sprint unless marked for retention

AWS even has an “Innovation Sandbox on AWS” solution focused on temporary sandbox lifecycle management, which is very aligned with the kind of short-lived environment you’re describing. ([AWS Documentation][7])

---

## Recommended target architecture for your event

This is the version I’d actually run:

**Shared platform**

* 1 sandbox AWS account
* 1 VPC
* 2 public subnets
* 2 private app subnets
* 2 private data subnets
* 1 ALB + WAF
* 1 ECS Fargate cluster
* 1 ECR namespace
* CloudWatch, Secrets Manager, S3, DynamoDB
* GitHub Actions with OIDC

**Per team**

* 1 service
* 1 route/subdomain
* 1 IAM role
* 1 log group
* 1 storage namespace
* optional DynamoDB table

**Access**

* builders authenticate through federated roles
* customers only hit ALB-hosted demo URLs
* no direct SSH/RDP
* no bastion unless absolutely necessary

### Why this is the right compromise

It gives you:

* real internet-facing demos for beta customers
* private backends
* fast team onboarding
* decent security posture
* easy teardown
* low operator overhead

It does **not** give you perfect enterprise segregation, but that is not the point of a two-day sprint. The point is to remove friction without creating a clown car of unbounded risk.

---

## Governance rules I’d put in the one-pager

1. **Build fast, but only in the sandbox account**
2. **Only synthetic/public/approved data**
3. **All public traffic enters through shared ALB**
4. **No public databases**
5. **No manual IAM creation by teams**
6. **Everything tagged with team and TTL**
7. **Everything destroyed after the event unless approved**
8. **Beta users only access demo URLs, not AWS consoles or internal services**

---

## Add this to your event language

**DMZ on AWS**
We will provision a dedicated AWS sandbox environment for the sprint that behaves like a modern cloud DMZ: public demo entry points at the edge, private workloads behind them, isolated team resources, short-lived infrastructure, and strict separation from production systems. Teams will build quickly inside this environment using preloaded AWS services, templates, and deploy pipelines, while real beta customers test solutions through secure internet-facing demo URLs. The goal is to maximize speed and realism without exposing production assets or sensitive data.

If you want the next step, I can turn this into a **diagram + concrete AWS service inventory + CDK stack outline**.

[1]: https://docs.aws.amazon.com/prescriptive-guidance/latest/designing-control-tower-landing-zone/account-structure.html?utm_source=chatgpt.com "Configuring account structure and OUs"
[2]: https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html?utm_source=chatgpt.com "Subnets for your VPC - Amazon Virtual Private Cloud"
[3]: https://docs.aws.amazon.com/prescriptive-guidance/latest/choosing-git-branch-approach/sandbox-environment.html?utm_source=chatgpt.com "Sandbox environment - AWS Prescriptive Guidance"
[4]: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-task-networking.html?utm_source=chatgpt.com "Amazon ECS task networking options for Fargate"
[5]: https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/access-container-applications-privately-on-amazon-ecs-by-using-aws-fargate-aws-privatelink-and-a-network-load-balancer.html?utm_source=chatgpt.com "Access container applications privately on Amazon ECS by ..."
[6]: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-best-practices.html?utm_source=chatgpt.com "Security best practices for your VPC"
[7]: https://docs.aws.amazon.com/solutions/innovation-sandbox-on-aws/?utm_source=chatgpt.com "Innovation Sandbox on AWS"
