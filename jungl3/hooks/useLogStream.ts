import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface LogLine {
  id: number;
  text: string;
  /**
   * `body` → muted; `highlight` → neon (reserved for the key line of an act);
   * `warn` → ember (rare, for transient failures like a retry).
   * We restrict the set on purpose; more tones dilute the signal.
   */
  tone: 'body' | 'highlight' | 'warn';
  ts: string;
  /**
   * How many characters have been revealed so far. 0..text.length. Drives
   * the log-pane typewriter effect. When `revealed < text.length` and this
   * line is the most recent, the pane paints a trailing caret after it.
   */
  revealed: number;
}

export interface LogStream {
  lines: LogLine[];
  emit: (text: string, tone?: LogLine['tone']) => void;
  clear: () => void;
}

// Routine log lines reveal fast — CloudWatch-tail speed, not prose speed.
// 90 chars/sec at normal pace; collapsed under --fast.
const BASE_REVEAL_CPS = 90;
const REVEAL_TICK_MS = 28;
const FAST_THRESHOLD = 0.05;

/**
 * Log stream with a per-line character reveal. A single background ticker
 * advances the newest still-revealing line. If a new line arrives before
 * the previous has finished, the previous snaps to fully-revealed — only
 * one line ever types at a time, matching how a real terminal tail feels.
 *
 * Under --fast (speedMultiplier ≤ 0.05) reveal is disabled: emitted lines
 * land fully-revealed so the smoke test stays fast and deterministic.
 */
export function useLogStreamState(speedMultiplier: number = 1): LogStream {
  const [lines, setLines] = useState<LogLine[]>([]);
  const skipReveal = speedMultiplier <= FAST_THRESHOLD;

  const emit = useCallback<LogStream['emit']>(
    (text, tone = 'body') => {
      setLines((prev) => {
        const id = prev.length === 0 ? 1 : (prev[prev.length - 1]!.id + 1);
        const ts = fmtTs(new Date());
        // Snap any prior line to fully-revealed. Only one line reveals at
        // a time; older lines are settled by the time a new one arrives.
        const settled = prev.map((l) =>
          l.revealed < l.text.length ? { ...l, revealed: l.text.length } : l,
        );
        const next: LogLine = {
          id,
          text,
          tone,
          ts,
          revealed: skipReveal ? text.length : 0,
        };
        // Cap retention. The pane only shows the tail, but unbounded growth is
        // still a leak on long-running sessions.
        const capped = settled.length >= 200 ? settled.slice(settled.length - 199) : settled;
        return [...capped, next];
      });
    },
    [skipReveal],
  );

  const clear = useCallback(() => setLines([]), []);

  // Reveal ticker. Runs while the most recent line is still typing.
  // `charsPerTick` scales with speedMultiplier so --fast-ish modes still
  // feel proportional, but we don't run the ticker at all in the true
  // --fast path (skipReveal short-circuits emit to full-reveal).
  useEffect(() => {
    if (skipReveal) return;
    const charsPerTick = Math.max(1, Math.round((BASE_REVEAL_CPS * REVEAL_TICK_MS) / 1000));
    const id = setInterval(() => {
      setLines((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1]!;
        if (last.revealed >= last.text.length) return prev;
        const nextRevealed = Math.min(last.text.length, last.revealed + charsPerTick);
        const nextLast: LogLine = { ...last, revealed: nextRevealed };
        return [...prev.slice(0, -1), nextLast];
      });
    }, REVEAL_TICK_MS);
    return () => clearInterval(id);
  }, [skipReveal]);

  return { lines, emit, clear };
}

function fmtTs(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export const LogContext = createContext<LogStream | null>(null);

export function useLog(): LogStream {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error('useLog() must be used inside <App>');
  return ctx;
}
