/**
 * Event settings, v0: what an organizer passes in to vend one Jungle per team.
 * Names end up in CloudFormation stack names and resource tags, hence the strict patterns.
 */
export interface EventSettingsV0 {
  /** Tagged on every resource so the reaper can find them. */
  event_id: string;
  /** One Jungle per team. */
  teams: string[];
  /** ISO-8601 instant with an offset. Recorded as a tag in v0.1; enforced by the reaper schedule later. */
  ends_at: string;
  /** Seed for deterministic data: the same seed gives every team the same claims. */
  seed: string;
}

export const MAX_TEAMS = 20;
const EVENT_ID = /^[a-z][a-z0-9-]{1,30}$/;
const TEAM = /^[a-z][a-z0-9-]{0,19}$/;
const SEED = /^[A-Za-z0-9._-]{1,64}$/;
const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

export class SettingsError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Invalid event settings: ${problems.join('; ')}`);
    this.name = 'SettingsError';
  }
}

/** Parses untrusted input. Throws SettingsError listing every problem, not just the first. */
export function parseEventSettings(input: unknown, now: Date = new Date()): EventSettingsV0 {
  const problems: string[] = [];
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new SettingsError(['settings must be an object']);
  }
  const o = input as Record<string, unknown>;

  if (typeof o.event_id !== 'string' || !EVENT_ID.test(o.event_id)) {
    problems.push('event_id must be 2-31 chars: lowercase letter first, then lowercase letters, digits or hyphens');
  }
  if (!Array.isArray(o.teams) || o.teams.length < 1 || o.teams.length > MAX_TEAMS) {
    problems.push(`teams must be a list of 1 to ${MAX_TEAMS} names`);
  } else {
    const bad = o.teams.filter((t) => typeof t !== 'string' || !TEAM.test(t));
    if (bad.length > 0) {
      problems.push(`team names must be 1-20 chars, lowercase letter first, then lowercase letters, digits or hyphens (bad: ${JSON.stringify(bad)})`);
    }
    if (new Set(o.teams).size !== o.teams.length) problems.push('team names must be unique');
  }
  if (typeof o.ends_at !== 'string' || !ISO_WITH_OFFSET.test(o.ends_at) || Number.isNaN(Date.parse(o.ends_at))) {
    problems.push('ends_at must be an ISO-8601 time with an offset, e.g. 2027-03-28T18:00:00-04:00');
  } else if (Date.parse(o.ends_at) <= now.getTime()) {
    problems.push('ends_at must be in the future');
  }
  if (typeof o.seed !== 'string' || !SEED.test(o.seed)) {
    problems.push('seed must be 1-64 chars of letters, digits, dot, underscore or hyphen');
  }
  const extra = Object.keys(o).filter((k) => !['event_id', 'teams', 'ends_at', 'seed'].includes(k));
  if (extra.length > 0) problems.push(`unknown fields: ${extra.join(', ')}`);

  if (problems.length > 0) throw new SettingsError(problems);
  return { event_id: o.event_id as string, teams: o.teams as string[], ends_at: o.ends_at as string, seed: o.seed as string };
}

/** `<event_id>-<team>`: the Jungle id, also the prototype_id in v0.1. */
export function jungleId(eventId: string, team: string): string {
  return `${eventId}-${team}`;
}

/** CloudFormation stack name for one team's Jungle. */
export function jungleStackName(eventId: string, team: string): string {
  return `jungl3-${jungleId(eventId, team)}`;
}
