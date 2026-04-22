# Topic 10: Synthetic timestamp distributions that survive forensic inspection

See `00-context.md` for product framing. [findings.md §8](../findings.md) commits to fresh-seed-per-install for ephemeral lifecycle reasons, and explicitly acknowledges the cost: a forensically-curious reviewer comparing DynamoDB `created_at` values against CloudWatch log emission times would spot the fresh install. The mitigations named are (a) deterministic-but-spread timestamps that *look* empirical, (b) in-flight claims distributed across workflow stages, and (c) that the typical reviewer doesn't look that closely. This topic is about how far the plausibility can actually be pushed — and at what cost.

## Research questions

1. **What's the forensic tell?** Concretely, what does a DynamoDB or CloudWatch forensic inspection of a "fresh seed with spread timestamps" install reveal that gives away the fake? Specific technical fingerprints: clustering around install time on internal metadata fields, CloudWatch log-group creation times, DynamoDB stream records, Step Functions execution-history creation times, IAM role last-used dates. Enumerate.

2. **Timestamp spreading, rigorously.** Best practices for generating a 18-month history of claim events with timestamps that match a real claims-operation temporal pattern. Distributions: arrival-time inhomogeneous Poisson, per-claim event spacing, end-of-business-day clustering, weekend dropoff, holiday closures. Cite specific libraries, academic papers (queueing theory, operations research), or published implementations (chaos-engineering data generators, fraud-detection synthetic datasets).

3. **Cross-field consistency.** A claim's `created_at` must precede its `first_assessed_at`, which must precede its `closed_at`. Its payment transaction timestamps must follow its approval timestamps. Notes must be timestamped within the claim's lifecycle. How do you enforce all of this in a generator without making the cross-field relationships themselves tells (no two fields exactly N minutes apart, for example)?

4. **Metadata that the seeder can't fake.** AWS services stamp their own creation timestamps: DynamoDB table creation, IAM role creation, CloudWatch log group creation, Step Functions state machine creation. These all land near install time. What's the blast radius of that — can a reviewer tell just from CloudWatch Logs metadata that this install is N minutes old? Which AWS service boundaries matter?

5. **Log-emission timestamps.** Even if domain event timestamps are spread, CloudWatch Logs emission timestamps are at install time. How much of the forensic gap comes from log-emit timestamps vs. application-layer `created_at`? Is there a pattern (bulk-write logs with custom timestamps, historical-log import) that closes this gap? What does it cost?

6. **Parallel to chaos engineering and security research.** Security honeypots and chaos-engineering frameworks have solved adjacent versions of "generate a convincing historical state quickly." What lessons port? Cite CanaryTokens, T-Pot, Gremlin-style platforms, any research on "believable backstory generation" in adversarial environments.

7. **Cost-benefit of closing the forensic gap.** ADR 0007's $100/month ceiling and findings.md §8's <10-minute install target are both load-bearing. How much do progressively-better forensic-plausibility mitigations cost in install time and in ongoing infra? Is there a natural threshold where the next mitigation costs more than the marginal plausibility it earns?

8. **Who cares?** Who is the forensically-curious reviewer, realistically? A prospective customer's security team, a specific class of AWS Marketplace reviewers, a DOI examiner (implausible), an adversarial demo attendee? For each audience, what's the actual evidence they would look at? This matters because plausibility beyond the audience's actual inspection is wasted effort.

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
