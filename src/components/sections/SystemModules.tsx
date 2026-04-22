const STEPS = [
  {
    k: "01",
    t: "Enter Jungle",
    d: "Their Jungle is already vended. The Understory is already running. There is no scaffolding phase.",
  },
  {
    k: "02",
    t: "Shape Understory",
    d: "Remove what doesn't belong. Substitute what does. Extend where the baseline stops. The system stays alive the whole time.",
  },
  {
    k: "03",
    t: "Refine in DMZ",
    d: "One command moves a prototype from Jungle to DMZ — a private, AI-first evaluation environment. Agents probe it as seeded personas before any human does. Standardized hosting, auth, routing — not a deploy project.",
  },
  {
    k: "04",
    t: "Reach Canopy",
    d: "Once the DMZ gates pass, the prototype reaches the Canopy. Judges, beta customers, and stakeholders find it in the Gallery and use it. Feedback is captured in-place. Scores come from what they actually experienced.",
  },
];

export function SystemModules() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
            // 02 — THE LOOP
          </div>
          <h2 className="font-display text-4xl font-black text-gradient-headline sm:text-5xl">
            A hackathon environment that's already alive.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Four steps. Weeks compressed into hours.
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.k}
              className="module-card relative overflow-hidden rounded-md border border-border bg-card/50 p-6 backdrop-blur-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.3em] text-neon">
                  STEP {s.k}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {s.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.d}
              </p>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent opacity-0 transition-opacity hover:opacity-100" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
