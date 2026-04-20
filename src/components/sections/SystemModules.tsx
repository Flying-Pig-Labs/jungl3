import { Boxes, Server, Plug, Activity, Radar } from "lucide-react";

const MODULES = [
  {
    icon: Boxes,
    title: "Sandbox Environments",
    desc: "Isolated, disposable, real. Spin a world up. Tear it down. Repeat.",
    tag: "ENV-01",
  },
  {
    icon: Server,
    title: "DMV — Production-like Layer",
    desc: "Mirrors prod topology, latencies, and failure modes. No surprises at launch.",
    tag: "ENV-02",
  },
  {
    icon: Plug,
    title: "Preloaded Integrations",
    desc: "Auth, payments, queues, observability — pre-wired so day one feels like day ninety.",
    tag: "INT-03",
  },
  {
    icon: Activity,
    title: "Traffic Simulation",
    desc: "Synthetic load that behaves like humans. Stress your assumptions, not your weekends.",
    tag: "SIM-04",
  },
  {
    icon: Radar,
    title: "Idea Engine — Fire Tower",
    desc: "Always scanning. Surfacing. Scoring. The bazaar of what to build next.",
    tag: "ENG-05",
  },
];

export function SystemModules() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
            // 02 — INSIDE THE JUNGLE
          </div>
          <h2 className="font-display text-4xl font-black text-gradient-headline glint sm:text-5xl">
            System Modules
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Each module is a primitive. Compose them however you want.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <article
              key={m.tag}
              className="module-card group relative overflow-hidden rounded-md border border-border bg-card/50 p-6 backdrop-blur-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="module-icon text-neon transition-all">
                  <m.icon className="h-7 w-7" strokeWidth={1.4} />
                </span>
                <span className="font-mono text-[10px] tracking-[0.3em] text-gold/70">
                  {m.tag}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {m.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {m.desc}
              </p>
              {/* tactical scan line accent */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
