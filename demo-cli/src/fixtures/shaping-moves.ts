export type MoveKind = 'remove' | 'substitute' | 'extend';

export interface ShapingMove {
  kind: MoveKind;
  /** Short verb phrase describing the move itself. */
  label: string;
  /** One-line context shown while the move is applying. */
  context: string;
  /**
   * Small diff summary rendered alongside the move once applied.
   * Kept minimal on purpose — the feel is "git status after a commit,"
   * not a full patch.
   */
  diff: readonly string[];
}

/**
 * The three canonical shaping motions (CLAUDE.md §1: "subtraction is the
 * primary motion"). Order matters: remove first, substitute second, extend
 * last. That's the order the site positions them and the order that reads
 * most naturally to a watcher — carve first, swap, then grow.
 */
export const shapingMoves: readonly ShapingMove[] = [
  {
    kind: 'remove',
    label: 'Remove generic customer-intake form',
    context: 'understory/intake/GenericForm.tsx',
    diff: ['- 1 component', '- 4 routes', '- 2 fixtures'],
  },
  {
    kind: 'substitute',
    label: 'Substitute claims-intake FNOL form',
    context: 'understory/intake/FnolForm.tsx',
    diff: ['+ 1 component', '+ 6 fields', '~ 1 event schema'],
  },
  {
    kind: 'extend',
    label: 'Extend with settlement-approval workflow',
    context: 'understory/workflows/settlement-approval',
    diff: ['+ 1 state machine', '+ 3 states', '+ 1 checker role'],
  },
];
