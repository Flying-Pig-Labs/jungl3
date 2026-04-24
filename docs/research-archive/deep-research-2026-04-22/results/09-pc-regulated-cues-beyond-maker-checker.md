# Jungl3 P&C Claims Compliance: Architecting the Regulatory Surface for In-Account AWS Deployments

## Executive Summary: The Regulatory Surface of P&C Claims

For Jungl3, plausibility collapse is the ultimate failure mode. If a domain-expert reviewer—such as an insurance VP or a former state Department of Insurance (DOI) examiner—tests the system and finds generic, unregulated workflows, the illusion of a "real" enterprise system shatters. To survive a 15-minute plausibility gauntlet, Jungl3 must natively exhibit the regulatory cues mandated by state DOIs, the NAIC Market Regulation Handbook, and privacy frameworks like GLBA and NYDFS Part 500. 

This report translates these complex regulatory requirements into buildable, cost-aware AWS architectures aligned with ADRs 0005–0009. By implementing state-specific SLA timers via AWS Step Functions, cryptographically immutable reserve ledgers in DynamoDB, and segregated Special Investigations Unit (SIU) data models, Jungl3 will project deep domain authenticity out of the box.

### The 15-Minute Plausibility Gauntlet
If an insurance executive tests Jungl3, they will look for specific artifacts to validate the system. Jungl3 must successfully demonstrate:
1. **Jurisdictional Awareness:** Timers and notices that adapt to specific state laws (e.g., California vs. Florida).
2. **Financial Immutability:** A reserve history that never overwrites past values, showing exact authority levels and timestamps.
3. **Fraud Segregation:** An SIU referral mechanism that restricts access and logs chain-of-custody.
4. **Treaty Compliance:** Automated large-loss reinsurance notifications triggered by reserve thresholds.
5. **Examiner Readiness:** The ability to instantly export a structured claim file and MCAS-like compliance summary.

## State-Specific Timing and Notice Requirements

State insurance codes dictate strict timelines for acknowledging, investigating, and paying claims. Failing to meet these SLAs constitutes an Unfair Claims Settlement Practice [1]. Jungl3 must use AWS Step Functions (ADR 0008) to orchestrate these timers, utilizing the `Wait` state and callback patterns to manage long-running executions [2] [3].

### SLA Timer Configurations by Jurisdiction

The following table outlines the baseline configurations Jungl3 must seed for its v1 deployment across four major jurisdictions:

| Jurisdiction | Acknowledgment SLA | Accept/Deny Decision SLA | Payment SLA | Statutory Citation |
| :--- | :--- | :--- | :--- | :--- |
| **California (CA)** | 15 calendar days | 40 calendar days (after proof of claim) | 30 calendar days | 10 CCR § 2695.5, § 2695.7 [4] [5] |
| **Texas (TX)** | 15 business days | 15 business days | 5 business days | Tex. Ins. Code § 542.055, § 542.056, § 542.057 [6] [7] [8] |
| **Florida (FL)** | 7 calendar days | 60 calendar days | Included in 60-day decision window | Fla. Stat. § 627.70131 [9] [10] |
| **New York (NY)** | 15 business days | 30 working days (after proof of loss) | N/A (Promptly) | 11 NYCRR 216.4, ISC § 2601 [11] [12] |

*Takeaway: Jungl3 cannot use a hardcoded global timer. The Step Functions state machine must dynamically read the `jurisdiction` field from the claim object to set the appropriate `SecondsPath` or `TimestampPath` for its `Wait` states.*

### Catastrophe Tolling and Step Functions Implementation
During major disasters, DOIs frequently issue emergency orders extending these deadlines. For example, Florida's OIR extended grace periods following Hurricane Helene [13], and Texas allows a 15-day extension for weather-related catastrophes [14]. Jungl3 should implement a global "Catastrophe Mode" toggle in the admin UI. When active, the Step Functions execution should catch a specific event or check a configuration flag to dynamically add 15–30 days to the `decision_timer`.

## Reserve Ledgers and Financial Auditability

Reserves represent the money set aside for a claim's eventual payout. Market conduct examiners scrutinize reserve histories to ensure insurers are not artificially deflating reserves to manipulate financial reporting [15]. 

### Examiner Expectations for Reserve Movements
Examiners expect to see a chronological ledger of all reserve entries. Overwriting a `current_reserve` field is a massive red flag. The NAIC Market Regulation Handbook explicitly directs examiners to review data for changes in reserves and verify that claim files are reserved in accordance with established procedures [15].

### Implementing ADR 0009: Hash-Chained DynamoDB Ledger
Jungl3 must implement an append-only reserve ledger using the `jungle3-audit` DynamoDB table (ADR 0009). Every reserve adjustment must be a distinct item containing:
* `case_id` and `trace_id`
* `old_value` and `new_value`
* `reason_code` (e.g., `INITIAL`, `DEVELOPMENT`, `LITIGATION`)
* `authority_level` (e.g., `ADJUSTER`, `SUPERVISOR`, `MANAGER`)
* `changed_by` (User ID)
* `timestamp`
* `prev_hash` (SHA-256 hash of the previous ledger entry to guarantee cryptographic immutability) [16] [17].

## Special Investigations Unit (SIU) and Fraud Reporting

SIU workflows handle suspected fraud. To pass the plausibility gauntlet, Jungl3 does not need a full investigative case management system, but it *must* demonstrate proper data segregation and referral capabilities.

### Regulatory Mandates and Data Segregation
State laws mandate the reporting of suspected fraud. California requires insurers to report suspected fraud to the Fraud Division within 60 days of an SIU determination [18]. New York requires reporting within 30 days [19]. 

Because SIU investigations often involve sensitive surveillance or legal work product, SIU data must be strictly segregated from the main claim file. Jungl3 should implement a separate `siu_case` object. When an adjuster clicks "Refer to SIU," the system should take a snapshot of the claim data and pass it to the `siu_case`, applying strict Role-Based Access Control (RBAC) so standard adjusters cannot view the ongoing investigation notes.

### Minimal SIU Referral Payload
The referral payload must capture specific "red flags" (e.g., `staged_accident`, `inflated_medicals`) [20] [21]. The system should generate a mock export payload formatted similarly to the National Insurance Crime Bureau (NICB) or state eFD-1 forms [22] [23].

## Reinsurance and Subrogation Cues

### Large-Loss Reinsurance Notifications
Excess of Loss (XoL) reinsurance treaties require ceding insurers to notify reinsurers when a claim exceeds a specific financial threshold, typically within 24 to 72 hours [24]. Jungl3 should include an EventBridge rule that listens to reserve updates. If `total_incurred` breaches a seeded threshold (e.g., $250,000), it triggers a `reinsurance_notify_event`. This event should generate a mock PDF/CSV notice containing the date of loss, insured name, current gross reserve, and a brief summary [25].

### Subrogation Seed Data
To simulate subrogation (recovery from an at-fault third party), Jungl3 should seed specific claims (e.g., rear-end collisions) with minimal fields: `at_fault_indicator: false`, `third_party_contact`, and `police_report_ref`. The UI should display a "Subrogation Potential: High" badge and include a mock Arbitration Forums demand letter in the document repository [26] [27].

## Compliance Reporting and Examiner Exports

During a market conduct exam, regulators request specific data files. Jungl3 must be capable of generating these on demand to prove its enterprise readiness.

### Core Reports and The 'Examiner Export' Package
Jungl3 should provide an admin-agent prompt to generate an "Examiner Export" ZIP file. This package must include:
1. **Closed Claim Counts:** CSV matching Market Conduct Annual Statement (MCAS) data elements [28].
2. **Reserve Movement Logs:** Extracted from the hash-chained DynamoDB table.
3. **SIU Referral Counts:** Dispositions of all fraud referrals.
4. **Claim File Exhibits:** A structured directory containing PDFs of all notices, adjuster notes, and proof-of-loss documents [29].

## Privacy, Security, and Retention (GLBA, NYDFS 500, CPRA)

Operating within a customer's AWS account requires strict adherence to privacy regulations like the GLBA Safeguards Rule and NYDFS 23 NYCRR 500, while staying within the $100/month ADR 0007 budget.

### Encryption, Access Control, and Log Masking
* **Encryption:** All customer information must be encrypted at rest and in transit [30]. Jungl3 should use AWS KMS with Customer Managed Keys (CMKs) for DynamoDB and S3 [31].
* **Access Control:** Implement Multi-Factor Authentication (MFA) and strict RBAC [32] [30].
* **Log Masking:** To prevent PII/PHI leakage into CloudWatch Logs, Jungl3 must utilize CloudWatch Logs data protection policies to automatically mask sensitive data (e.g., SSNs, credit cards) at ingestion [33].

### Data Retention Constraints

| Jurisdiction / Regulation | Retention Requirement | Citation |
| :--- | :--- | :--- |
| **California (Workers Comp)** | 5 years from date of injury or last benefit payment | 8 CCR § 15400.2 [34] |
| **New York (General Claims)** | 6 calendar years after claim is resolved/closed | 11 NYCRR 243.2 [35] |
| **GLBA Safeguards Rule** | Secure disposal no later than 2 years after last use (unless legally required to retain) | 16 CFR § 314.4 [30] |
| **CPRA** | Retain no longer than reasonably necessary for disclosed purpose | Cal. Civ. Code § 1798.100 [36] |

*Takeaway: Jungl3 must balance CPRA deletion requests with statutory insurance retention laws. S3 Object Lock in Governance mode can be used to enforce WORM (Write-Once-Read-Many) storage for the required 5-6 year statutory periods, preventing premature deletion [37].*

## Decision-Ready Recommendations for Jungl3

* **Implement State-Aware Step Functions:** Build `acknowledge_timer` and `decision_timer` in Step Functions that dynamically read the claim's jurisdiction to set the correct SLA (e.g., 15 days for CA, 7 days for FL).
* **Deploy Hash-Chained Reserves:** Use the `jungle3-audit` DynamoDB table to store append-only reserve transactions with a `prev_hash` field to guarantee cryptographic immutability for examiners.
* **Create a Segregated SIU Object:** Implement a minimal `siu_case` object with strict RBAC to demonstrate fraud referral capabilities without building a full investigative workflow.
* **Enable CloudWatch Log Masking:** Activate CloudWatch data protection policies by default to mask PII/PHI, ensuring compliance with NYDFS 500 and GLBA without exceeding the observability budget.
* **Defer Full Subrogation/Arbitration Workflows:** Seed the UI with subrogation indicators and mock demand letters, but explicitly defer building the actual multi-party recovery and payment gateway integrations past v1.
* **Biggest Risk:** Failing to implement the append-only reserve ledger. If an examiner sees that a `current_reserve` field can be overwritten without an audit trail, plausibility collapses immediately.
* **Cross-Links:** This directly impacts ADR 0008 (Step Functions) for timer orchestration and ADR 0009 (Audit Trail) for the reserve ledger and SIU chain-of-custody.

## References

1. *[PDF] MO-900-1 UNFAIR CLAIMS SETTLEMENT PRACTICES ACT ... - NAIC*. https://content.naic.org/sites/default/files/model-law-900.pdf
2. *Discover service integration patterns in Step Functions*. https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html
3. *Choosing workflow type in Step Functions - AWS Step Functions*. https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html
4. *Cal. Code Regs. Tit. 10, § 2695.5 - Duties upon Receipt of Communications | State Regulations | US Law | LII / Legal Information Institute*. https://www.law.cornell.edu/regulations/california/10-CCR-2695.5
5. *Cal. Code Regs. Tit. 10, § 2695.7 - Standards for Prompt, Fair ...*. https://www.law.cornell.edu/regulations/california/10-CCR-2695.7
6. *Texas Insurance Code Section 542.055 (2025) - Receipt of ...*. https://law.justia.com/codes/texas/insurance-code/title-5/subtitle-c/chapter-542/subchapter-b/section-542-055/
7. *Texas Insurance Code Section 542.056 – Notice of Acceptance ...*. https://texas.public.law/statutes/tex._ins._code_section_542.056
8. *Fetched web page*. https://texas.public.law/statutes/tex._ins._code_section_542.057
9. *Statutes & Constitution :View Statutes : Online Sunshine*. http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70131.html
10. *Chapter 627 Section 70131 - 2025 Florida Statutes - The ...*. https://www.flsenate.gov/Laws/Statutes/2025/627.70131
11. *N.Y. Comp. Codes R. & Regs. Tit. 11 § 216.4 | State Regulations*. https://www.law.cornell.edu/regulations/new-york/11-NYCRR-216.4
12. *NYS Open Legislation | NYSenate.gov*. https://www.nysenate.gov/legislation/laws/ISC/2601
13. *Hurricane Helene OIR Emergency Order: Extension of Grace ...*. https://floir.gov/home/2024/09/30/hurricane-helene-oir-emergency-order-extension-of-grace-periods-limitations-on-cancellations-and-nonrenewals
14. *Texas Insurance Code Section 542.059 (2025) - Extension of ...*. https://law.justia.com/codes/texas/insurance-code/title-5/subtitle-c/chapter-542/subchapter-b/section-542-059/
15. *Market Regulation - content.naic.org*. https://content.naic.org/sites/default/files/publication-market-reg-hb.pdf
16. *Hash chain*. https://en.wikipedia.org/wiki/Hash_chain
17. *Audit logs security: cryptographically signed tamper-proof ...*. https://www.cossacklabs.com/blog/audit-logs-security
18. *Insurance Code - 1872.4.*. https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=INS&sectionNum=1872.4
19. *NYS Open Legislation | NYSenate.gov - The New York State Senate*. https://www.nysenate.gov/legislation/laws/ISC/405
20. *icw-group-risk-management-siu-indicators-of-insurance-fraud*. https://icwgroup.com/workers-compensation/library/icw-group-risk-management-siu-indicators-of-insurance-fraud.pdf
21. *5 Red Flags That Should Trigger SIU Investigations*. https://ethosrisk.com/blog/5-red-flags-that-should-trigger-siu-investigations/
22. *Consumer Insurance Fraud Reporting Form · Basic Portal*. https://cdiapps.insurance.ca.gov/CRIMS/publicform/
23. *Report Fraud | National Insurance Crime Bureau - NICB*. https://www.nicb.org/how-we-help/report-fraud
24. *Pet Insurance Reinsurance Claim Reporting: Process and ...*. https://insurnest.com/blog/pet-insurance-mga-reinsurance-claim-reporting/
25. *Fetched web page*. https://www.munichre.com/content/dam/munichre/contentlounge/website-pieces/documents/Claim%20Training_Santam_March-2023.pdf
26. *Reference uide to Arbitration orums, Inc.’s Agreements and Rul*. https://home.arbfile.org/getmedia/1ae0b5d0-d3f7-464f-ba98-a0d7d0154015/ReferenceGuide.pdf
27. *Medical Payment*. https://home.arbfile.org/programs/medical-payment
28. *MCAS 2025 - Market Conduct Annual Statement | NAIC*. https://content.naic.org/mcas-2025.htm
29. *MO910 - National Association of Insurance Commissioners*. https://content.naic.org/sites/default/files/model-law-910.pdf
30. *16 CFR Part 314 -- Standards for Safeguarding Customer Information*. https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-314
31. *Amazon ElastiCache for Redis adds support for customer ...*. https://aws.amazon.com/about-aws/whats-new/2019/08/amazon-elasticache-for-redis-adds-support-for-customer-managed-keys-in-aws-key-management-service-for-encryption-at-rest
32. *23 NYCRR 500: Cybersecurity Requirements for Financial ...*. https://www.dfs.ny.gov/system/files/documents/2023/03/23NYCRR500_0.pdf
33. *Help protect sensitive log data with masking - Amazon ...*. https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/mask-sensitive-log-data.html
34. *§15400.2. Maintenance of Records. - California Department of ...*. https://www.dir.ca.gov/t8/15400_2.html
35. *N.Y. Comp. Codes R. & Regs. Tit. 11 § 243.2 - Records ...*. https://www.law.cornell.edu/regulations/new-york/11-NYCRR-243.2
36. *California Code, Civil Code - CIV § 1798.100 - Codes - FindLaw*. https://codes.findlaw.com/ca/civil-code/civ-sect-1798-100
37. *Locking objects with Object Lock - Amazon Simple Storage Service*. https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html