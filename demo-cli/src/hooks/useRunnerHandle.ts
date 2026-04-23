import { createContext, useContext, useRef } from 'react';
import type { ActRunner } from './useActRunner.js';

/**
 * Plumbing that lets <App/> drive the currently-playing act's runner via
 * keyboard. Each act registers its ActRunner on mount and unregisters on
 * unmount. Only one act is mounted at a time, so the handle always points
 * at the active runner (or null during the team-name prompt).
 *
 * A mutable ref rather than state: the handle changes on every render
 * inside an act (callbacks are fresh each time), and we don't want those
 * renders to re-render App. App only reads the handle when a key fires.
 */
export type RunnerHandleRef = { current: ActRunner | null };

export const RunnerHandleContext = createContext<RunnerHandleRef | null>(null);

export function useRunnerHandleRef(): RunnerHandleRef {
  const ctx = useContext(RunnerHandleContext);
  if (!ctx) {
    throw new Error('RunnerHandleContext missing; wrap with the provider in App');
  }
  return ctx;
}

/** Acts call this with their live runner on every render. */
export function useRegisterRunner(runner: ActRunner): void {
  const ref = useRunnerHandleRef();
  ref.current = runner;
}

/** App creates this once at mount and provides it downward. */
export function useRunnerHandleHost(): RunnerHandleRef {
  // Keep a stable ref across renders; acts mutate .current directly.
  const ref = useRef<ActRunner | null>(null);
  return ref;
}
