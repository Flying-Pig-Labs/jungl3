# 0003 — Jungl3 is distributed as an installable AWS Marketplace listing

**Status:** Accepted (rider terminology partly superseded by [ADR 0004](./0004-canonical-platform-vocabulary.md) and further revised by [ADR 0011](./0011-canopy-and-ai-first-dmz.md))
**Date:** 2026-04-21

> **Supersession note.** The primary decision of this ADR — installable via AWS Marketplace — stands unchanged. The rider at the bottom of *Decision* renamed the concept previously called *Marketplace* to *Gallery*. [ADR 0004](./0004-canonical-platform-vocabulary.md) retired *Gallery* and folded its role into *DMZ*. [ADR 0011](./0011-canopy-and-ai-first-dmz.md) re-split that surface: the human exposure role is now called **Canopy**, the AI evaluation role keeps the name **DMZ** (narrowed), and **Gallery** is reintroduced as the listing UI *inside* the Canopy. When this ADR's body says "DMZs, Gallery" it means, in current vocabulary: "DMZs and Canopies; Gallery lives inside each Canopy." The original text stands as historical record.

## Context

Jungl3's delivery model was implicit in early repo material. `doc.md` describes a hosted shape: a Jungl3-operated AWS sandbox account under Control Tower, with teams vended into per-service stacks behind a Jungl3-owned ALB and DNS apex. Refined docs (`docs/glossary.md`, `docs/architecture/system-context.md`) inherited that framing without ever making it a decision.

Third-party analysis ([`../research/research1-aws-installable-shape.md`](../research/research1-aws-installable-shape.md)) argued the delivery model should instead be an AWS Marketplace listing delivered via CloudFormation, installed into the customer's own AWS account. The two shapes have cascading, incompatible consequences for tenancy, control-plane location, DMZ topology, data-classification enforceability, and who the user of Jungl3 actually is. Leaving this implicit creates silent drift between docs.

Hosted and installable are not small variants of the same product. They are different companies.

## Decision

Jungl3 is distributed as an AWS Marketplace listing delivered via CloudFormation (directly, or compiled from CDK). A customer subscribes in AWS Marketplace, launches the template into their own AWS account, and from that point forward **operates their own Jungl3 instance** — Control Plane, Jungles, DMZs, Gallery, Synthetic Runtime, and Agent Layer all live inside the customer's account.

Jungl3 the company does not run a hosted multi-tenant platform. There is no Jungl3-operated control plane that vends Jungles across customers. Each install is isolated by AWS account boundary.

The repo-root website (Lovable-maintained, Cloudflare-hosted) is the sales funnel and documentation surface for the Marketplace listing, not the platform itself. This resolves the deploy-target question that was open in `CLAUDE.md` §11.

A companion terminology decision is embedded in this ADR: the Jungl3 concept previously named **Marketplace** (the judging/discovery front door inside a running Jungl3 instance) is renamed **Gallery**. The word "Marketplace" in Jungl3 docs henceforth refers exclusively to AWS Marketplace. Reason: customers will literally navigate from AWS Marketplace into a Jungl3 instance and then into its Gallery; the same word cannot mean both things in the same sentence. "Gallery" also fits the exhibition/persona-entry framing better than "Marketplace," which implies transaction.

## Consequences

**Enables:**

- Standard enterprise procurement path (AWS Marketplace private-offer, billing, entitlement).
- Per-customer isolation by default — AWS account boundary is the strongest isolation primitive AWS provides.
- A first shipped form that does not require Jungl3 to operate a multi-tenant SaaS (which would be a different company with different ops, security, and compliance obligations).
- Customer controls their own data, retention, and classification policy, which simplifies the Jungl3 data-policy story to "we advise; you enforce."

**Forecloses:**

- Hosted multi-tenant SaaS as the initial product. Revisiting this as a "Hybrid" later is possible but requires a new ADR.
- Cross-install visibility by default. A Gallery in Customer A's account cannot list prototypes from Customer B's account. Multi-company events (e.g. shared hackathons across companies) need a separate mechanism, not yet designed.
- The hosted-framing portions of `doc.md` (especially §§1–13 on sandbox account setup, Control Tower, shared ALB, per-team tagging with `TTL=...`) describe a world that is no longer the product. `doc.md` is raw source and not edited per repo policy; read those sections as pre-Jungl3-is-installable framing.
- Using "Marketplace" in Jungl3 documentation to refer to anything other than AWS Marketplace.

**Accepts:**

- Jungl3 cannot enforce data-classification, TTL teardown, or isolation policies inside a customer's account. It can provide defaults and tooling; the customer is the operator.
- Upgrades are the hard problem. CloudFormation stack updates must be backward-compatible, must not destroy customer data, and must not orphan resources. See `CLAUDE.md` §11.
- Jungl3's assumptions about the customer's AWS environment must be minimal. Account structure (single vs Control Tower), networking, IAM boundaries, and identity providers all vary per customer. The installable cannot assume any of them.
- Support responsibility extends into debugging customer AWS accounts within the limits of Marketplace product support.
- A rename cost: every reference to "Marketplace" as the judging/discovery layer must be updated to "Gallery."

## Alternatives considered

- **Hosted multi-tenant SaaS.** Jungl3 runs the platform; customers are tenants. Rejected for the first shipped form: makes Jungl3 an operator of a security-sensitive multi-tenant cloud service, which is a different company with a different cost structure, different compliance obligations, and a longer path to first revenue. May be revisited later as a complement to the installable, not a replacement.
- **Container or AMI listing on AWS Marketplace.** These deliver an application, not an environment. Jungl3 provisions infrastructure (VPC, DNS, IAM, storage, compute, Synthetic Runtime plumbing); a container image has no way to do that. Rejected as category mismatch.
- **SaaS-type Marketplace listing (vendor-hosted, subscription-triggered).** Vendor-hosted contradicts the hosted-vs-installable decision above. Rejected.
- **Direct sales / custom installs (no AWS Marketplace).** Possible in principle; forfeits Marketplace's discovery, procurement, billing, and entitlement mechanics — the reasons to be on it in the first place. Rejected for the initial form. Not foreclosed as a parallel channel later.
- **Hybrid (hosted control plane + customer-account workloads).** The research analysis tagged this as a later-phase possibility. Premature now; requires Jungl3 to operate production infrastructure before it has proven the installable shape. Deferred.
- **Keep "Marketplace" and qualify with "AWS Marketplace" in full every time.** Rejected. The ambiguity costs more than the rename; both names would appear in the same customer sentence constantly.
