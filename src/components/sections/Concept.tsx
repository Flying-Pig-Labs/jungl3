const ITEMS = [
  { k: "01", t: "Sandbox innovation environment", d: "Spin up. Break things. No prod blast radius." },
  { k: "02", t: "Dev + DMV (production-like)", d: "Mirror reality. Down to the latency and the chaos." },
  { k: "03", t: "Pre-wired infrastructure", d: "Auth, queues, telemetry, payments — already humming." },
  { k: "04", t: "Simulated traffic", d: "Synthetic users hammering your endpoints 24/7." },
  { k: "05", t: "Real-world experimentation", d: "Real beta customers. Real signal. Real consequences." },
];

export function ConceptSection() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:gap-20">
        <div>
          <div className="mb-4 font-mono text-xs tracking-[0.4em] text-neon">
            // 01 — WHAT THIS IS
          </div>
          <h2 className="font-display text-4xl font-black leading-tight text-foreground sm:text-5xl">
            Not a lab.
            <br />
            <span className="text-gradient-headline">A live ecosystem.</span>
          </h2>
          <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/80">
            <p>
              Most "innovation programs" are theater. Slide decks. Cardboard
              prototypes. A demo day with no consequences.
            </p>
            <p>
              <span className="text-gold">Jungl3 is the opposite.</span> A
              sandbox wired to behave like the real thing — pre-built infra,
              simulated traffic, and beta customers who'll actually use what
              you ship.
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              You don't pitch here. You build. And the jungle decides what
              survives.
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
