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
# Topic 7: Packaging and deployment strategy on AWS

See `00-context.md` for product framing. Jungl3 ships via AWS Marketplace into a customer's own AWS account — not as hosted SaaS.

## Research questions

Investigate the concrete packaging and deployment choices that would let Jungl3 be genuinely *installable* — one subscribe-click by a customer, landing in their AWS account as a working Jungle — without creating a long-term operational tax for Jungl3 the company or the customer.

Research:

1. **ECS/Fargate-first vs serverless-first.** For a Frankenstein app that must feel like "microservices + queues + schedulers + admin UIs" on day one, which packaging approach wins on:
   - Idle cost (customer-borne)
   - Cold-start perception
   - Install complexity
   - Upgrade path (see below)
   - Inspectability for the customer
   - Maintenance burden for Jungl3 the company
   
   Consider hybrids and "mostly serverless with one ECS service for persistent UI/admin."

2. **AWS Marketplace mechanics.** What does a well-designed Marketplace SaaS or CloudFormation listing look like today in 2026? What's new since the SaaS quick-launch templates? Contract negotiation, metering, entitlement checks, upgrade flows, cancellation / teardown. Cite live listings that do this well.

3. **Customer-owned-account deployment patterns.** Best-practice patterns for installing into a customer account without needing Jungl3 cross-account access: CloudFormation, CDK-bootstrapped stacks, Terraform modules, custom launcher. Pros/cons.

4. **One-click install vs guided install.** When is one-click the right UX and when is it a trap (customer has not made critical config choices)? Is there a middle path — "one click, with a post-launch guided setup"?

5. **Upgrade mechanics.** How should a Jungle instance receive updates to the Frankenstein app, control plane, stubs, and scenario packs after install? Blue/green? Sidecar? Customer-triggered? Hands-off? What does each imply for data continuity?

6. **Reset / reseed semantics.** Because this is a *synthetic* environment, a customer may want to reset the Jungle to pristine, reseed with a different scenario pack, or roll back to an earlier state. What patterns support this cleanly without losing the customer's own work?

7. **What "installable" really means.** Dissect the term. Installable by whom (a platform engineer, a product manager, a CTO signing a Marketplace agreement)? Installable in how long (target elapsed time)? Installable with what permissions? Installable into what AWS-account topologies (solo account, Control Tower, Organizations)?

8. **Known Marketplace failure modes.** Survey listings that failed to gain traction despite good underlying products — often due to install pain, unclear entitlements, brittle CFN templates, or hidden ongoing costs.

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
