const ITEMS = [
  { k: "00", t: "Base Camp", d: "Your workspace, login, and kit. Adventure starts here." },
  { k: "01", t: "Outposts", d: "Cloud stacks, integrations, deployments — pre-wired." },
  { k: "02", t: "DMZ", d: "Export builds. Real beta customers walk in and use them." },
  { k: "03", t: "Rope Swing", d: "Research and ideation signals. Where ideas emerge." },
  { k: "04", t: "Swarms", d: "Automated AI builders and agent clusters." },
  { k: "05", t: "Streams", d: "Fake data and full system replicas to feed the build." },
];

export function ConceptSection() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:gap-20">
        <div>
          <div className="mb-4 font-mono text-xs tracking-[0.4em] text-neon">
            // 01 — THE TERRITORY
          </div>
          <h2 className="font-display text-4xl font-black leading-tight text-foreground sm:text-5xl">
            A DMZ sandbox
            <br />
            <span className="text-gradient-headline">where ideas enter raw</span>
            <br />
            <span className="text-foreground/80">and leave battle-tested.</span>
          </h2>
          <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/80">
            <p>
              Most "innovation programs" are theater. Slide decks, cardboard
              prototypes, demo days with no consequences.
            </p>
            <p>
              <span className="text-gold">Jungl3 is a map.</span> Trails connect
              your Base Camp to Outposts, the DMZ, the Rope Swing, Swarms, and
              Streams. You move between them. You ship between them.
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              You don't pitch here. You build. The jungle decides what survives.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map((item) => (
            <div
              key={item.k}
              className="hud-corners group relative border border-border bg-card/40 p-5 backdrop-blur-sm transition-colors hover:border-gold/60"
            >
              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-gold/80">{item.k}</span>
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {item.t}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
