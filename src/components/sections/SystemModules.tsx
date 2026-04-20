import { Tent, Server, ShieldCheck, Sparkles, Bot, Database } from "lucide-react";

const MODULES = [
  {
    icon: Tent,
    title: "Base Camp",
    desc: "Your workspace. Login state, projects, kit. Every adventure starts here.",
    tag: "NODE-00",
  },
  {
    icon: Server,
    title: "Outposts",
    desc: "Your cloud stacks. Infrastructure, integrations, deployments — pre-wired and humming.",
    tag: "NODE-01",
  },
  {
    icon: ShieldCheck,
    title: "DMZ Marketplace",
    desc: "Push a build over the trail. Real beta customers walk in and stress-test it for you.",
    tag: "NODE-02",
  },
  {
    icon: Sparkles,
    title: "Rope Swing",
    desc: "Research and ideation signals. Where ideas emerge before they have names.",
    tag: "NODE-03",
  },
  {
    icon: Bot,
    title: "Swarms",
    desc: "Automated AI builders. Agent clusters and pre-built systems for rapid prototyping.",
    tag: "NODE-04",
  },
  {
    icon: Database,
    title: "Streams",
    desc: "Fake data and full system replicas. Feed your build until it learns to swim.",
    tag: "NODE-05",
  },
];

export function SystemModules() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
            // 02 — THE MAP
          </div>
          <h2 className="font-display text-4xl font-black text-gradient-headline glint sm:text-5xl">
            Nodes of the Jungl3
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Six locations on the map. Connected by trails. Compose your route.
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
              <h3 className="font-display text-xl font-bold text-foreground">
                {m.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {m.desc}
              </p>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
