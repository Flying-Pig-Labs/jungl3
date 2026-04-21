const STRATA = [
  {
    k: "01",
    t: "Substrate",
    role: "What your platform team operates",
    d: "The AWS primitives the install sits on — networking, identity, storage, compute, observability. Provisioned by the CloudFormation template at install time. Everything above is pre-operated.",
  },
  {
    k: "02",
    t: "Understory",
    role: "What arrives pre-built and running",
    d: "A baseline application already deployed, integrated, emitting, rendering. Real users, real data, real events, multiple integrations wired. Teams shape it by removing, substituting, and extending — not by scaffolding from zero.",
  },
  {
    k: "03",
    t: "DMZ",
    role: "The one exposure surface",
    d: "Where external visitors — judges, beta users, stakeholders — find prototypes, enter as personas, and actually use them. Everything else stays hidden inside the install. Public-ish in access, private in blast radius.",
  },
];

export function ConceptSection() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
            // 01 — WHAT YOU INSTALL
          </div>
          <h2 className="font-display text-4xl font-black leading-tight text-foreground sm:text-5xl">
            Three layers. One install.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/80">
            The install lands in your AWS account as a single CloudFormation
            stack. Inside, three layers your team will care about for different
            reasons.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {STRATA.map((s) => (
            <article
              key={s.k}
              className="hud-corners relative border border-border bg-card/40 p-6 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <span className="font-mono text-xs text-gold/80">{s.k}</span>
                <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                  {s.role}
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                {s.t}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.d}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
