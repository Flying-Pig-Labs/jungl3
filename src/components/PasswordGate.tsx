import { useState } from "react";
import posterUrl from "@/assets/jungle-poster.png";
import { FogLayer } from "./effects/Overlays";

const STORAGE_KEY = "jungl3_access";

export function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [sweeping, setSweeping] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSweeping(true);
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, "granted");
      } catch {}
      onUnlock();
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-background">
      {/* Background poster */}
      <img
        src={posterUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center opacity-65"
        style={{ filter: "saturate(0.95) contrast(1.05)" }}
      />
      {/* Vertical fade so the input area stays legible against the artwork */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.05 0.01 320 / 0.4) 0%, oklch(0.08 0.02 320 / 0.78) 45%, oklch(0.08 0.02 320 / 0.78) 60%, oklch(0.05 0.01 320 / 0.5) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, oklch(0.05 0.01 320 / 0.7) 80%, oklch(0.03 0.01 320) 100%)",
        }}
      />
      <FogLayer />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-50" />

      {/* Top brand bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.4em] text-gold/80 uppercase z-10">
        Jungl3 // Classified Access
      </div>

      {/* Center form */}
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-3 font-mono text-[11px] tracking-[0.5em] text-neon/80">
              [ SECURE NODE ]
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight text-gradient-headline glint sm:text-5xl">
              Welcome to the Jungl3
            </h1>
            <p className="mt-3 font-mono text-xs tracking-widest text-muted-foreground">
              Step into the proving ground
            </p>
          </div>

          <button
            type="submit"
            autoFocus
            className="group mt-4 w-full rounded-md border border-gold/50 bg-gradient-to-r from-neon/90 via-moss/90 to-neon/90 px-6 py-4 font-mono text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_0_20px_oklch(0.78_0.24_145_/_0.5)] transition-all hover:shadow-[0_0_36px_oklch(0.78_0.24_145_/_0.8)] hover:scale-[1.01] active:scale-[0.99]"
          >
            Enter the Jungl3 &rarr;
          </button>

          <p className="mt-6 text-center font-mono text-[10px] tracking-[0.3em] text-muted-foreground/60 uppercase">
            No badge required
          </p>
        </form>
      </div>

      {sweeping && <div className="scan-sweep" />}
    </div>
  );
}

export function hasAccess(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "granted";
  } catch {
    return false;
  }
}

export function clearAccess() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
