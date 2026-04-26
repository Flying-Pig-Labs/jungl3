import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A beat is one discrete dramatic unit. `apply` fires once when the beat
 * starts and should be idempotent — we may re-run it on replay. `durationMs`
 * is how long we hold before advancing to the next beat.
 *
 * Heroes want 1000–1400ms holds; routine ticks want 150–300ms. Pacing is
 * what separates a print script from a film.
 */
export interface Beat {
  durationMs: number;
  apply: () => void;
}

export interface ActRunner {
  /** 0..beats.length. Equal to beats.length when the act has finished. */
  beatIndex: number;
  isPlaying: boolean;
  isComplete: boolean;
  /** Pause at the current beat. */
  pause: () => void;
  /** Resume auto-play from the current beat. */
  play: () => void;
  /** Advance exactly one beat, regardless of pause state. */
  step: () => void;
  /** Collapse all remaining beats in this act immediately. */
  fastForward: () => void;
  /** Reset to beat 0 and start auto-playing. */
  replay: () => void;
}

export interface ActRunnerOptions {
  /**
   * Global speed multiplier applied to every beat's durationMs. 1 = normal.
   * 0.02 under --fast collapses a 90s run to ~1.8s.
   */
  speedMultiplier?: number;
  /**
   * Auto-play on mount. Default true. Set false when wiring up a paused
   * initial state (we don't currently use this, but it's useful for live
   * debugging.)
   */
  autoPlay?: boolean;
  /** Called once when the last beat completes. */
  onComplete?: () => void;
}

export function useActRunner(
  beats: Beat[],
  { speedMultiplier = 1, autoPlay = true, onComplete }: ActRunnerOptions = {},
): ActRunner {
  const [beatIndex, setBeatIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatsRef = useRef<Beat[]>(beats);
  const completedRef = useRef<boolean>(false);
  const onCompleteRef = useRef<typeof onComplete>(onComplete);

  useEffect(() => {
    beatsRef.current = beats;
  }, [beats]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Keep play/pause in sync with the autoPlay prop when it changes. The
  // common case that needs this: a parent component flips a phase gate
  // (logo → scene) and swaps the beat list from [] to [...], expecting the
  // runner to start. useState's initial-value semantics wouldn't catch
  // that on its own.
  useEffect(() => {
    setIsPlaying(autoPlay);
  }, [autoPlay]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const runBeat = useCallback((i: number) => {
    const list = beatsRef.current;
    if (i >= list.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }
    const beat = list[i]!;
    try {
      beat.apply();
    } catch (err) {
      // Swallow — the demo should never crash mid-movie. Log to stderr so
      // developers see it, but don't surface it on the demo canvas.
      // eslint-disable-next-line no-console
      console.error('[act-runner] beat apply threw:', err);
    }
  }, []);

  // Auto-advance loop. Each beat schedules the next via a single setTimeout.
  useEffect(() => {
    if (!isPlaying) return;
    if (beatsRef.current.length === 0) return;
    if (beatIndex >= beatsRef.current.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    runBeat(beatIndex);

    const beat = beatsRef.current[beatIndex]!;
    // ±15% dwell jitter so the cadence doesn't feel like a metronome.
    // Suppressed under --fast (speedMultiplier <= 0.05) so smoke tests stay
    // deterministic and the collapsed run doesn't vary in length.
    const JITTER_PCT = 0.15;
    const jitter = speedMultiplier > 0.05
      ? 1 + (Math.random() * 2 - 1) * JITTER_PCT
      : 1;
    const dwell = Math.max(1, Math.round(beat.durationMs * speedMultiplier * jitter));
    timeoutRef.current = setTimeout(() => {
      setBeatIndex((i) => i + 1);
    }, dwell);

    return clearTimer;
  }, [beatIndex, isPlaying, speedMultiplier, runBeat, clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const step = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setBeatIndex((i) => {
      const next = i + 1;
      if (next <= beatsRef.current.length) runBeat(i);
      return next;
    });
  }, [clearTimer, runBeat]);

  const fastForward = useCallback(() => {
    clearTimer();
    const list = beatsRef.current;
    setBeatIndex((i) => {
      // Fire remaining apply() calls so side effects (log emits, state
      // updates) accumulate as if the act had played through.
      for (let j = i; j < list.length; j++) {
        try {
          list[j]!.apply();
        } catch {
          /* already logged above */
        }
      }
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return list.length;
    });
  }, [clearTimer]);

  const replay = useCallback(() => {
    clearTimer();
    completedRef.current = false;
    setBeatIndex(0);
    setIsPlaying(true);
  }, [clearTimer]);

  return {
    beatIndex,
    isPlaying,
    isComplete: beatIndex >= beats.length,
    pause,
    play,
    step,
    fastForward,
    replay,
  };
}
