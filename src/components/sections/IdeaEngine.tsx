import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const IDEAS = [
  { t: "Edge-AI form fillers", s: 87 },
  { t: "DMZ ↔ prod bridge service", s: 72 },
  { t: "Synthetic-user persona market", s: 91 },
  { t: "Latency-aware feature flags", s: 64 },
  { t: "Beta-customer matchmaker", s: 79 },
  { t: "Self-healing migration runner", s: 83 },
];

const POSITIONS = [
  { top: "8%", left: "8%" },
  { top: "12%", right: "6%" },
  { top: "55%", left: "2%" },
  { top: "62%", right: "4%" },
  { bottom: "8%", left: "20%" },
  { bottom: "10%", right: "18%" },
];

export function IdeaEngine() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 3500);
    return () => clearInterval(i);
  }, []);

  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
            // 03 — IDEA ENGINE
          </div>
          <h2 className="font-display text-4xl font-black text-gradient-headline glint sm:text-5xl">
            Fire Tower / Bazaar
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
            Continuously scanning the noise. Surfacing what survives.
          </p>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[640px]">
          {/* Concentric rings */}
          {[0.35, 0.55, 0.75, 0.95].map((scale, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/20"
              style={{
                width: `${scale * 100}%`,
                height: `${scale * 100}%`,
              }}
            />
          ))}
          {/* Crosshairs */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-neon/15 to-transparent" />
          <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-neon/15 to-transparent" />

          {/* Radar sweep */}
          <div className="absolute left-1/2 top-1/2 h-[95%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full radar-sweep opacity-70" />

          {/* Center node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-4 w-4 rounded-full bg-neon shadow-[0_0_20px_oklch(0.68_0.27_350)] pulse-glow" />
          </div>

          {/* Random blips */}
          {[...Array(4)].map((_, i) => {
            const seed = (tick * 7 + i * 53) % 100;
            const angle = (seed / 100) * Math.PI * 2;
            const radius = 25 + ((seed * 3) % 35);
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            return (
              <div
                key={`${tick}-${i}`}
                className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold blip-ping"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            );
          })}

          {/* Floating idea cards */}
          {IDEAS.map((idea, i) => {
            const pos = POSITIONS[i] ?? POSITIONS[0];
            return (
              <div
                key={idea.t}
                className="absolute w-44 float-idea"
                style={{ ...pos, animationDelay: `${i * 0.4}s` }}
              >
                <div className="hud-corners rounded-sm border border-border bg-background/80 p-3 backdrop-blur-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium leading-tight text-foreground">
                      {idea.t}
                    </p>
                    <button
                      type="button"
                      className="flex flex-col items-center text-neon transition hover:text-gold"
                      aria-label={`Upvote ${idea.t}`}
                    >
                      <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                      <span className="font-mono text-[10px]">{idea.s}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
