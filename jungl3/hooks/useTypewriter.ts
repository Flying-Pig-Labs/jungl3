import { useEffect, useRef, useState } from 'react';

interface Options {
  cps?: number;
  jitterMs?: number;
  enabled?: boolean;
  speedMultiplier?: number;
}

/**
 * Character-by-character reveal with per-char jitter so the effect feels
 * typed rather than metronomic. Non-hero text should not use this; typewriter
 * everywhere is noise.
 *
 * When speedMultiplier is very small (--fast), we collapse to the full
 * string immediately.
 */
export function useTypewriter(
  text: string,
  { cps = 24, jitterMs = 20, enabled = true, speedMultiplier = 1 }: Options = {},
): string {
  const [shown, setShown] = useState<string>('');
  const indexRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    indexRef.current = 0;
    setShown('');
    if (!enabled) {
      setShown(text);
      return;
    }
    if (speedMultiplier <= 0.05) {
      setShown(text);
      return;
    }

    const base = 1000 / cps;
    const tick = () => {
      const i = indexRef.current;
      if (i >= text.length) return;
      setShown(text.slice(0, i + 1));
      indexRef.current = i + 1;
      if (indexRef.current >= text.length) return;
      const jitter = (Math.random() * 2 - 1) * jitterMs;
      const delay = Math.max(8, (base + jitter) * speedMultiplier);
      timeoutRef.current = setTimeout(tick, delay);
    };
    timeoutRef.current = setTimeout(tick, base * speedMultiplier);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, cps, jitterMs, enabled, speedMultiplier]);

  return shown;
}
