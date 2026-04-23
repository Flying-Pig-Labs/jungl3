import { useEffect, useRef, useState } from 'react';

/**
 * Counts from the current value toward `target` with cubic-out easing.
 * Used for defect counts in Act 3 and visitor-session counts in Act 4 so
 * numbers arrive with weight instead of linear ticks.
 *
 * The 50ms tick frequency matches the shared app-wide motion cadence.
 */
export function useEasedNumber(target: number, durationMs: number): number {
  const [value, setValue] = useState<number>(target);
  const startRef = useRef<number>(0);
  const fromRef = useRef<number>(0);
  const toRef = useRef<number>(target);

  useEffect(() => {
    fromRef.current = value;
    toRef.current = target;
    startRef.current = Date.now();
    if (durationMs <= 0 || fromRef.current === target) {
      setValue(target);
      return;
    }
    const id = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = fromRef.current + (toRef.current - fromRef.current) * eased;
      setValue(next);
      if (t >= 1) {
        setValue(toRef.current);
        clearInterval(id);
      }
    }, 50);
    return () => clearInterval(id);
    // value intentionally omitted: we only restart when the target changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return Math.round(value);
}
