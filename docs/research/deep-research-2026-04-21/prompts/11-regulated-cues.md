# Topic 11: Regulated-environment cues — real vs ceremony

See `00-context.md` for product framing.

## Research questions

Jungle3 wants the *atmosphere* of a regulated environment (audit trails, approvals, separation of duties, retention, immutability, compliance-adjacent behavior) without committing to the cost and complexity of actual regulatory compliance in v1. Research which regulated-environment cues meaningfully improve realism and which are pure drag.

Investigate:

1. **Audit trail expectations.** What does an engineer or auditor expect to see in a regulated system: append-only event log, actor attribution, before/after diffs, timestamps at minute resolution, correlation IDs? What is high-signal vs ceremony?

2. **Approval semantics.** Single-approver, dual-approver, N-of-M, delegated approval, automatic-on-timeout. Which are common across industries? What minimum set communicates "this is a regulated shop"?

3. **Separation-of-duties cues.** What role-based-access patterns are recognizable as SoD without modeling the full RBAC complexity (e.g., "maker/checker," "initiator cannot approve their own case," "four-eyes principle")? How to surface these without fully enforcing them technically?

4. **Record immutability.** What immutability cues matter — write-once fields, version history, tombstone-on-delete, retention timers? Cite how SOC 2, HIPAA, SOX, PCI, and banking regulations show up in product UX.

5. **Document handling expectations.** How do regulated systems handle documents — checksums, versioned storage, redaction, access logs, watermarks, export controls? What low-cost cues convey this?

6. **Retention and versioning.** Retention schedules (e.g., 7-year, 10-year), legal-hold flags, automatic archival. Which are useful in a synthetic environment vs pure theater?

7. **Which compliance-adjacent behaviors meaningfully improve realism.** Rank: audit log, actor attribution, approvals, SoD, immutability, retention, access logs, signed exports, change management tickets, break-glass flows.

8. **Which are pure drag in v1.** Which commonly-included regulated-system behaviors add maintenance burden without improving plausibility for Jungle3's target audience?

9. **Cross-industry patterns.** Are there cues that are recognizable across many regulated industries (healthcare, finance, insurance, government) vs industry-specific? Favor cross-industry cues for v1.

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
