import { ChevronUp } from "lucide-react";

const IDEAS = [
  { t: "Edge-AI form fillers", s: 87 },
  { t: "DMZ ↔ prod bridge service", s: 72 },
  { t: "Synthetic-user persona market", s: 91 },
  { t: "Latency-aware feature flags", s: 64 },
  { t: "Beta-customer matchmaker", s: 79 },
  { t: "Self-healing migration runner", s: 83 },
];

export function IdeaEngine() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
            // 03 — ROPE SWING
          </div>
          <h2 className="font-display text-4xl font-black text-gradient-headline sm:text-5xl">
            Where Ideas Emerge
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
            Continuously scanning the canopy. Surfacing signals worth chasing.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IDEAS.map((idea) => (
            <div
              key={idea.t}
              className="rounded-sm border border-border bg-background/80 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-tight text-foreground">
                  {idea.t}
                </p>
                <button
                  type="button"
                  className="flex flex-col items-center text-neon transition-colors hover:text-gold"
                  aria-label={`Upvote ${idea.t}`}
                >
                  <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
                  <span className="font-mono text-xs">{idea.s}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
