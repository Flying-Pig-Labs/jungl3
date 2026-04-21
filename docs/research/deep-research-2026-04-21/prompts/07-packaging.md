# Topic 7: Packaging and deployment strategy on AWS

See `00-context.md` for product framing. Jungle3 ships via AWS Marketplace into a customer's own AWS account — not as hosted SaaS.

## Research questions

Investigate the concrete packaging and deployment choices that would let Jungle3 be genuinely *installable* — one subscribe-click by a customer, landing in their AWS account as a working Jungle — without creating a long-term operational tax for Jungle3 the company or the customer.

Research:

1. **ECS/Fargate-first vs serverless-first.** For a Frankenstein app that must feel like "microservices + queues + schedulers + admin UIs" on day one, which packaging approach wins on:
   - Idle cost (customer-borne)
   - Cold-start perception
   - Install complexity
   - Upgrade path (see below)
   - Inspectability for the customer
   - Maintenance burden for Jungle3 the company
   
   Consider hybrids and "mostly serverless with one ECS service for persistent UI/admin."

2. **AWS Marketplace mechanics.** What does a well-designed Marketplace SaaS or CloudFormation listing look like today in 2026? What's new since the SaaS quick-launch templates? Contract negotiation, metering, entitlement checks, upgrade flows, cancellation / teardown. Cite live listings that do this well.

3. **Customer-owned-account deployment patterns.** Best-practice patterns for installing into a customer account without needing Jungle3 cross-account access: CloudFormation, CDK-bootstrapped stacks, Terraform modules, custom launcher. Pros/cons.

4. **One-click install vs guided install.** When is one-click the right UX and when is it a trap (customer has not made critical config choices)? Is there a middle path — "one click, with a post-launch guided setup"?

5. **Upgrade mechanics.** How should a Jungle instance receive updates to the Frankenstein app, control plane, stubs, and scenario packs after install? Blue/green? Sidecar? Customer-triggered? Hands-off? What does each imply for data continuity?

6. **Reset / reseed semantics.** Because this is a *synthetic* environment, a customer may want to reset the Jungle to pristine, reseed with a different scenario pack, or roll back to an earlier state. What patterns support this cleanly without losing the customer's own work?

7. **What "installable" really means.** Dissect the term. Installable by whom (a platform engineer, a product manager, a CTO signing a Marketplace agreement)? Installable in how long (target elapsed time)? Installable with what permissions? Installable into what AWS-account topologies (solo account, Control Tower, Organizations)?

8. **Known Marketplace failure modes.** Survey listings that failed to gain traction despite good underlying products — often due to install pain, unclear entitlements, brittle CFN templates, or hidden ongoing costs.

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
