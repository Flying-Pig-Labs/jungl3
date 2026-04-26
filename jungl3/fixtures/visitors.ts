export interface Visitor {
  /** Role. Short — has to fit a single column in the act canvas. */
  role: string;
  /** Display name shown in the row. */
  name: string;
  /** Session length as mm:ss string. Deterministic, not computed. */
  sessionTime: string;
  /** 1..5. */
  stars: number;
}

/**
 * Three visitors reach the Canopy. Their framing matches the glossary
 * (Canopy = judges, beta users, stakeholders). Session times and star
 * ratings are scripted and were chosen to read honestly — a real judge
 * panel does not award all fives.
 */
export const visitors: readonly Visitor[] = [
  { role: 'judge', name: 'judge-a', sessionTime: '04:12', stars: 4 },
  { role: 'beta user', name: 'beta-user-b', sessionTime: '07:38', stars: 5 },
  { role: 'stakeholder', name: 'stakeholder-c', sessionTime: '02:54', stars: 3 },
];
