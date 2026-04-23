import shapingUrl from "@/assets/visuals/02-shaping-not-scaffolding.png";
import understoryUrl from "@/assets/visuals/03-understory.png";

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
    t: "Canopy",
    role: "The human exposure surface",
    d: "Where judges, beta users, and stakeholders find prototypes via the Gallery and actually use them. A prototype reaches the Canopy only after passing through the DMZ — a private, AI-first evaluation environment that agents probe first. Two surfaces, sequenced: DMZ for AI, Canopy for humans.",
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

        <figure className="hud-corners mb-16 rounded-md border border-border bg-card/40 p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold">
              THE DIFFERENCE
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
              ZERO vs ALIVE ON DAY ONE
            </span>
          </div>
          <div className="rounded-sm bg-background/40 p-4">
            <img
              src={shapingUrl}
              alt="Two panels compared: starting from zero versus shaping a living thing"
              className="mx-auto h-auto w-full max-w-4xl"
              loading="lazy"
            />
          </div>
          <figcaption className="mx-auto mt-5 max-w-2xl text-center text-sm italic leading-relaxed text-muted-foreground">
            The difference is not speed of typing. It&apos;s what you start next
            to.
          </figcaption>
        </figure>

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

        <figure className="hud-corners mt-16 rounded-md border border-border bg-card/40 p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold">
              UNDERSTORY · CROSS-SECTION
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
              SERVICES · EVENTS · DATA · PERSONAS · INTEGRATIONS
            </span>
          </div>
          <div className="rounded-sm bg-background/40 p-4">
            <img
              src={understoryUrl}
              alt="Cross-section of the Understory: five strata already running on day one"
              className="mx-auto h-auto w-full max-w-4xl"
              loading="lazy"
            />
          </div>
          <figcaption className="mx-auto mt-5 max-w-2xl text-center text-sm italic leading-relaxed text-muted-foreground">
            Already running on day one. The team shapes from the top.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
