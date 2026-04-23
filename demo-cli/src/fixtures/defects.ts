/**
 * Plausible, specifically-named defects surfaced in the DMZ pass. Six total
 * across four personas — matches the payoff line ("6 defects surfaced,
 * 0 critical"). Order is the order they get reported; it's not arbitrary.
 * The first defect per persona is the most resonant one for that persona's
 * angle.
 */

export interface Defect {
  /** Which persona surfaced it. */
  personaIndex: number;
  /** Short name. Reads as the header of a bug report. */
  name: string;
  /** One-line consequence. Keeps it concrete. */
  impact: string;
}

export const defects: readonly Defect[] = [
  {
    personaIndex: 0,
    name: 'payment retry loop on duplicate FNOL',
    impact: 'same claim paid twice under race condition',
  },
  {
    personaIndex: 0,
    name: 'confirmation screen shows raw event UUID',
    impact: 'analyst reads it as a claim number',
  },
  {
    personaIndex: 1,
    name: 'screen-reader skips field group headers',
    impact: 'form section context lost',
  },
  {
    personaIndex: 2,
    name: 'settlement approval above threshold missing checker',
    impact: 'maker can self-approve $25k+ settlements',
  },
  {
    personaIndex: 2,
    name: 'audit trail gap on status-change events',
    impact: 'who/when not captured for reassignment',
  },
  {
    personaIndex: 3,
    name: 'SIU flag cleared without requiring reason',
    impact: 'investigation outcome not recoverable',
  },
];
