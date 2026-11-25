/** The Claim entity and its three-state workflow: submitted -> assigned -> approved | denied. Pure; no I/O. */
export type ClaimStatus = 'submitted' | 'assigned' | 'approved' | 'denied';

export interface Claim {
  claim_id: string;
  status: ClaimStatus;
  claimant: string;
  description: string;
  amount_cents: number;
  adjuster?: string;
  created_at: string;
  updated_at: string;
}

export type ClaimAction = { action: 'assign'; adjuster: string } | { action: 'approve' } | { action: 'deny' };

export class WorkflowError extends Error {}

export const MAX_AMOUNT_CENTS = 100_000_000;

export function validateNewClaim(input: unknown): Pick<Claim, 'claimant' | 'description' | 'amount_cents'> {
  const o = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const text = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
  if (!text(o.claimant, 80)) throw new WorkflowError('claimant is required (80 chars max)');
  if (!text(o.description, 500)) throw new WorkflowError('description is required (500 chars max)');
  if (!Number.isInteger(o.amount_cents) || (o.amount_cents as number) <= 0 || (o.amount_cents as number) > MAX_AMOUNT_CENTS) {
    throw new WorkflowError(`amount_cents must be a whole number from 1 to ${MAX_AMOUNT_CENTS}`);
  }
  return { claimant: (o.claimant as string).trim(), description: (o.description as string).trim(), amount_cents: o.amount_cents as number };
}

export function parseAction(input: unknown): ClaimAction {
  const o = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  if (o.action === 'approve' || o.action === 'deny') return { action: o.action };
  if (o.action === 'assign') {
    if (typeof o.adjuster !== 'string' || o.adjuster.trim().length === 0 || o.adjuster.length > 80) {
      throw new WorkflowError('assign needs an adjuster (80 chars max)');
    }
    return { action: 'assign', adjuster: o.adjuster.trim() };
  }
  throw new WorkflowError('action must be assign, approve or deny');
}

/** Returns the claim after the action. Throws WorkflowError when the action is not allowed from the current state. */
export function transition(claim: Claim, a: ClaimAction, now: string): Claim {
  if (a.action === 'assign') {
    if (claim.status !== 'submitted') throw new WorkflowError(`cannot assign a claim that is ${claim.status}`);
    return { ...claim, status: 'assigned', adjuster: a.adjuster, updated_at: now };
  }
  if (claim.status !== 'assigned') {
    throw new WorkflowError(`cannot ${a.action} a claim that is ${claim.status}; it must be assigned first`);
  }
  return { ...claim, status: a.action === 'approve' ? 'approved' : 'denied', updated_at: now };
}
