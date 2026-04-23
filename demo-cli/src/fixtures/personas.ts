export interface Persona {
  /** One-line framing, spoken of them, not by them. */
  label: string;
  /** Short role marker that fits a tight column. */
  role: string;
  /** Total sessions this persona runs in the DMZ pass. */
  sessions: number;
  /** How many defects this persona surfaces by the end of the run. */
  defects: number;
}

/**
 * The four seeded DMZ personas. Names echo the synthetic-user-testing
 * research (docs/research/synthetic-user-testing/). Each one targets a
 * different failure shape: low-tech-literacy, accessibility, ops oversight,
 * fraud pressure.
 */
export const personas: readonly Persona[] = [
  { label: 'low-tech claims analyst', role: 'analyst', sessions: 14, defects: 2 },
  { label: 'accessibility policyholder', role: 'policyholder', sessions: 11, defects: 1 },
  { label: 'ops auditor', role: 'auditor', sessions: 9, defects: 2 },
  { label: 'fraud adjuster', role: 'adjuster', sessions: 12, defects: 1 },
];
