import { createHmac } from 'node:crypto';
import type { Claim } from './workflow';

/**
 * The business scenario teams build against. Every number here is ILLUSTRATIVE:
 * invented for the sprint, not taken from any insurer, statute or regulator.
 */
export const LINES = ['auto', 'homeowners'] as const;
export type LineOfBusiness = (typeof LINES)[number];
export const SCENARIO = {
  illustrative: true,
  note: 'Synthetic scenario. Deadlines, limits and fraud flags are invented for the sprint.',
  lines_of_business: LINES,
  acknowledge_within_days: 10,
  second_approval_above_cents: 1_000_000,
} as const;
export const DAY_MS = 86_400_000;
export const MAX_SURGE = 500;

const SURGE_CLAIMANTS = ['Harper Voss', 'Emery Castillo', 'Rowan Adeyemi', 'Finley Marsh', 'Tatum Ibarra', 'Blake Sorensen'];
const SURGE_LOSSES = ['Roof torn open by wind', 'Tree fell on parked car', 'Storm surge flooded ground floor', 'Car submerged in street flooding', 'Siding and windows broken by debris', 'Fence and shed destroyed'];

export const acknowledgeBy = (createdAt: string): string => new Date(Date.parse(createdAt) + SCENARIO.acknowledge_within_days * DAY_MS).toISOString();

/**
 * A surge: a burst of new claims, as after a storm. Content is deterministic per
 * (seed, wave, n), so every team gets the same burst and a re-run adds nothing.
 */
export function surgeClaims(seed: string, wave: string, count: number, now: string): Claim[] {
  if (!/^[a-z0-9-]{1,20}$/.test(wave)) throw new Error('wave must be 1-20 lowercase letters, digits or hyphens');
  if (!Number.isInteger(count) || count < 1 || count > MAX_SURGE) throw new Error(`count must be a whole number from 1 to ${MAX_SURGE}`);
  return Array.from({ length: count }, (_, i) => {
    const claim_id = `SRG-${wave}-${String(i + 1).padStart(3, '0')}`;
    const h = createHmac('sha256', seed).update(claim_id).digest();
    return {
      claim_id,
      status: 'submitted' as const,
      claimant: SURGE_CLAIMANTS[h[0] % SURGE_CLAIMANTS.length],
      description: SURGE_LOSSES[h[1] % SURGE_LOSSES.length],
      amount_cents: 50_000 + (h.readUInt32BE(10) % 4_950_000),
      line_of_business: LINES[h[4] % LINES.length],
      suspected_fraud: h[5] % 8 === 0,
      acknowledge_by: acknowledgeBy(now),
      created_at: now,
      updated_at: now,
    };
  });
}
