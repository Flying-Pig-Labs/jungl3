/**
 * Scripted log-line fixtures, keyed by act. Each entry is a pair of
 * [text, tone]. One line per act is marked 'highlight' — that's the line
 * that lights up in neon. All others are body/dim.
 *
 * Lines are written in an understated CloudWatch/systemd voice on purpose:
 * short, declarative, lowercase verbs, real-ish resource names. No emoji.
 */

export type LogTone = 'body' | 'highlight' | 'warn';
export type LogFixture = readonly [string, LogTone];

// Act 0 — Marketplace Install. The customer subscribes via AWS Marketplace,
// CFN deploys the Control Plane stack into their account, the CP comes online.
// {account} is interpolated to a fixed dummy ID at emit time.
export const act0Events: readonly LogFixture[] = [
  ['aws-marketplace: subscription confirmed · product=jungl3-control-plane', 'body'],
  ['iam: creating cross-account role JungleControlPlaneRole', 'body'],
  ['cfn: jungl3-cp stack CREATE_IN_PROGRESS', 'body'],
  ['cfn: vpc + private subnets created', 'body'],
  ['cfn: ecs cluster jungl3-cp online', 'body'],
  ['cfn: api-gateway endpoint provisioned', 'body'],
  ['cfn: rds postgres (cp-state) accepting connections', 'body'],
  ['cfn: stack CREATE_COMPLETE · 4m 18s', 'body'],
  ['control-plane: healthy · region us-east-1 · account {account}', 'body'],
  ['control-plane: ready to vend jungles', 'highlight'],
];

export const act2Events: readonly LogFixture[] = [
  // remove
  ['shaper: evaluating removal set for intake/GenericForm', 'body'],
  ['understory: unmounting 4 routes; 0 in-flight requests', 'body'],
  ['hot-reload: understory reloaded in 412ms (1/3)', 'body'],
  ['test-runner: 38 passed · 0 failed · 2 skipped', 'body'],
  // substitute
  ['shaper: writing intake/FnolForm.tsx (6 fields)', 'body'],
  ['schema-migrator: claim_events.v1 → claim_events.v2 (additive)', 'body'],
  ['hot-reload: understory reloaded in 389ms (2/3)', 'body'],
  ['test-runner: 41 passed · 0 failed · 2 skipped', 'body'],
  // extend
  ['shaper: generating state machine settlement-approval', 'body'],
  ['iam: creating role CheckerAboveThreshold', 'body'],
  ['hot-reload: understory reloaded in 451ms (3/3)', 'body'],
  ['test-runner: 47 passed · 0 failed · 2 skipped', 'body'],
  // payoff
  ['system stayed alive through 3 hot reloads', 'highlight'],
];

export const act3Events: readonly LogFixture[] = [
  ['dmz: provisioning isolated evaluation environment', 'body'],
  ['dmz: agent-runtime attached to 4 seeded personas', 'body'],
  ['analyst: session 1 / exploring claim-intake workflow', 'body'],
  ['analyst: defect surfaced · payment retry loop on duplicate FNOL', 'body'],
  ['policyholder: session 1 / screen-reader traversal', 'body'],
  ['policyholder: defect surfaced · skipped field group headers', 'body'],
  ['auditor: session 1 / scanning approvals above threshold', 'body'],
  ['auditor: defect surfaced · maker self-approval path', 'body'],
  ['adjuster: session 1 / probing SIU fraud flag lifecycle', 'body'],
  ['adjuster: defect surfaced · flag cleared without reason', 'body'],
  ['dmz: session roll-up complete · 46 sessions · 6 defects', 'body'],
  ['dmz: gates 2/2 passed · 0 critical', 'highlight'],
];

export const act4Events: readonly LogFixture[] = [
  ['canopy: registering prototype under gallery namespace', 'body'],
  ['canopy: dns + route53 record propagated', 'body'],
  ['canopy: tile rendered in gallery · prototype discoverable', 'body'],
  ['canopy: judge-a session opened · claim-intake flow', 'body'],
  ['canopy: judge-a rated 4/5 · "fast, clear, missed one label"', 'body'],
  ['canopy: beta-user-b session opened · adjustment workflow', 'body'],
  ['canopy: beta-user-b rated 5/5 · "this already feels shipped"', 'body'],
  ['canopy: stakeholder-c session opened · full end-to-end', 'body'],
  ['canopy: stakeholder-c rated 3/5 · "needs more reporting"', 'body'],
  ['sprint summary · 1 jungle · 3 moves · 1 dmz run · 3 visitors', 'highlight'],
];

// Lines that mention the team name use a {team} placeholder. Act code
// interpolates it at emit time via text.replaceAll('{team}', teamName).
export const act1Events: readonly LogFixture[] = [
  ['control-plane: vend request received (team={team})', 'body'],
  ['substrate: allocating namespace jungle-{team}', 'body'],
  ['substrate: vpc/private-subnet/route-table ready', 'body'],
  ['understory: pulling baseline image sha256:8f4a…', 'body'],
  ['understory: 14 services starting in dependency order', 'body'],
  ['understory: postgres accepting connections', 'body'],
  ['understory: redis accepting connections', 'body'],
  ['understory: synthetic-runtime spinning up emitters', 'body'],
  ['synthetic: seeding 2,400 fnol records across 30 days', 'body'],
  ['synthetic: claim-events queue depth 148 and climbing', 'body'],
  ['integrations: policy-api handshake timeout · retrying (1/3)', 'warn'],
  ['integrations: policy-api stub online', 'body'],
  ['integrations: payments-api stub online', 'body'],
  ['integrations: document-store stub online', 'body'],
  ['auth: seeded 6 personas, 3 admin users', 'body'],
  ['operator-console: session opened for jungle-{team}', 'body'],
  ['jungle-{team}: alive', 'highlight'],
];

// Act 5 — Maker-Checker. A claim settlement crosses the $10k threshold and
// requires a checker to approve before payment is queued. Demonstrates that
// the maker-checker control is non-bypassable.
export const act5Events: readonly LogFixture[] = [
  ['intake: FNOL-2024-0917 received · auto total $7,420', 'body'],
  ['policy-api: coverage verified · comprehensive · limit $25,000', 'body'],
  ['adjuster: casey assigned · triage complete', 'body'],
  ['adjuster: settlement proposed · $12,450 (parts + labor)', 'body'],
  ['workflow: threshold $10,000 exceeded · checker required', 'highlight'],
  ['iam: CheckerAboveThreshold evaluated for user casey → deny (maker)', 'body'],
  ['notify: jordan paged as checker · 18s response', 'body'],
  ['checker: jordan reviewing · parts quote validated', 'body'],
  ['checker: approval granted · rationale logged', 'body'],
  ['payments-api: disbursement queued · $12,450 to policyholder', 'body'],
  ['claim FNOL-2024-0917 · settled under maker-checker · audit trail sealed', 'highlight'],
];
