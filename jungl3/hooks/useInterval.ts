import { useEffect, useRef } from 'react';

/**
 * Classic Dan-Abramov useInterval. Keeps the callback ref current so the
 * interval sees the latest closure without resetting the timer.
 *
 * Pass `delay = null` to pause.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const saved = useRef<() => void>(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
