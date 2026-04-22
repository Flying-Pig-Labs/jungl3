import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import bgUrl from "@/assets/jungle-bg.jpg";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections/Footer";
import { RequestAccessModal } from "@/components/RequestAccessModal";

export const Route = createFileRoute("/investors")({
  head: () => ({
    meta: [
      { title: "Jungl3 — Investors" },
      {
        name: "description",
        content:
          "Jungl3 is a pre-built, operational application delivered as an AWS Marketplace listing. Investor overview: thesis, wedge, and where we are today.",
      },
      { property: "og:title", content: "Jungl3 — Investors" },
      {
        property: "og:description",
        content:
          "Thesis, wedge, and current stage. A private overview for prospective investors.",
      },
    ],
  }),
  component: InvestorsPage,
});

// The "raise size" and scheduling link are intentionally unresolved.
// Leaving a visible placeholder here is safer than inventing a number.
// Update these two strings when they are real.
const RAISE_LINE = "[raise size TBD]";
const PRIVATE_NOTE = "Private overview · Not an offer to sell securities";

const WHY_NOW = [
  {
    k: "01",
    t: "Time-to-first-feedback is the bottleneck",
    d: "Enterprise teams spend weeks on scaffolding before a prototype meets a real user. The interesting work — shaping a system that already runs — starts far too late.",
  },
  {
    k: "02",
    t: "AI-native teams expect alive-on-day-one",
    d: "Agent-assisted development compresses authoring. The remaining drag is environment: identity, data, integrations, deploy targets, feedback capture. That drag is now the product.",
  },
  {
    k: "03",
    t: "AWS Marketplace removed the distribution problem",
    d: "Regulated buyers can install a vendor's application into their own account in hours, under their security posture. The hard part is no longer getting in — it is what you install.",
  },
];

const LAYERS = [
  {
    k: "Substrate",
    d: "AWS primitives provisioned at install time. Networking, identity, storage, compute, observability — already wired.",
  },
  {
    k: "Understory",
    d: "A baseline application that is already deployed and running. Real users, real events, multiple integrations. Teams shape it by removing, substituting, and extending.",
  },
  {
    k: "Canopy",
    d: "The human exposure surface. Judges, beta users, and stakeholders find prototypes in the Gallery and use them. A prototype only reaches the Canopy after passing through the DMZ — a private, AI-first evaluation environment where agents probe it as seeded personas.",
  },
];

const TODAY = [
  {
    k: "Shape",
    d: "Product shape pinned in architecture decision records. AWS Marketplace installable, control plane owns vending, DMZ for AI evaluation and Canopy for human exposure as two sequenced surfaces.",
  },
  {
    k: "Wedge",
    d: "First domain chosen: property & casualty insurance claims. Regulated, event-heavy, maker-checker workflows — a credible first Understory.",
  },
  {
    k: "Research",
    d: "Two deep-research passes on the hard questions — realism floor, cost envelope, regulated cues, synthetic data distributions — converted into design inputs.",
  },
  {
    k: "Distribution",
    d: "Public landing live. AWS Marketplace listing path identified. Pre-sales posture: design-partner conversations, no paid installs yet.",
  },
];

function InvestorsPage() {
  const [requestOpen, setRequestOpen] = useState(false);
  const openRequest = () => setRequestOpen(true);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Nav onRequestAccess={openRequest} />

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6 pt-24">
          <img
            src={bgUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-center opacity-50"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.05 0.01 320 / 0.9) 0%, oklch(0.08 0.02 320 / 0.5) 50%, oklch(0.05 0.01 320 / 0.8) 100%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-4xl py-16 text-center">
            <div className="mb-4 font-mono text-[10px] tracking-[0.4em] text-neon uppercase">
              // Investors — Private overview
            </div>
            <h1
              className="font-display text-5xl leading-[1.05] tracking-tight text-gradient-headline sm:text-6xl md:text-7xl"
              style={{ fontFamily: '"Monoton", serif', fontWeight: 400 }}
            >
              Shape, don't scaffold.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl font-mono text-base font-light text-foreground/90 sm:text-lg">
              Jungl3 is a pre-built, operational application that installs into
              a customer's AWS account. Teams start with a system that is
              already alive — and shape it toward the work they actually care
              about.
            </p>
            <p className="mx-auto mt-6 max-w-xl font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              {PRIVATE_NOTE}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={openRequest}
                className="rounded-md border border-gold/60 bg-gradient-to-r from-neon via-moss to-neon px-7 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_0_24px_oklch(0.78_0.24_145_/_0.45)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_oklch(0.78_0.24_145_/_0.75)]"
              >
                Request a conversation →
              </button>
              <a
                href="#thesis"
                className="rounded-md border border-border px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/90 transition-colors hover:border-neon/60 hover:text-neon"
              >
                Read the thesis
              </a>
            </div>
          </div>
        </section>

        {/* Thesis / Why now */}
        <section id="thesis" className="relative overflow-hidden px-6 py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
                // 01 — WHY NOW
              </div>
              <h2 className="font-display text-4xl font-black leading-tight text-foreground sm:text-5xl">
                The scaffolding phase is the prototype tax.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/80">
                AI collapsed authoring. The remaining cost — environment,
                integrations, deploy target, feedback surface — is what keeps
                real prototypes from meeting real users in the same week the
                idea was had.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {WHY_NOW.map((s) => (
                <article
                  key={s.k}
                  className="hud-corners relative border border-border bg-card/40 p-6 backdrop-blur-sm"
                >
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="font-mono text-xs text-gold/80">
                      {s.k}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
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

        {/* What it is */}
        <section className="relative overflow-hidden px-6 py-32">
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at top, oklch(0.2 0.08 150 / 0.4), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
                // 02 — WHAT IT IS
              </div>
              <h2 className="font-display text-4xl font-black text-gradient-headline sm:text-5xl">
                A living baseline, installed.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                One CloudFormation stack. Three layers the team will care about
                for different reasons. Everything above the substrate arrives
                pre-operated.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {LAYERS.map((l, i) => (
                <article
                  key={l.k}
                  className="module-card relative overflow-hidden rounded-md border border-border bg-card/50 p-6 backdrop-blur-sm"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="font-mono text-xs tracking-[0.3em] text-neon">
                      LAYER {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {l.k}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {l.d}
                  </p>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent opacity-0 transition-opacity hover:opacity-100" />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Wedge */}
        <section className="relative overflow-hidden px-6 py-32">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
                // 03 — WEDGE
              </div>
              <h2 className="font-display text-4xl font-black leading-tight text-foreground sm:text-5xl">
                First domain: <span className="text-gradient-headline">P&amp;C claims.</span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-foreground/80">
                Property &amp; casualty insurance claims give the first
                Understory a concrete shape: regulated, event-heavy,
                maker-checker workflows, state-level SLA cues, and a synthetic
                data distribution that is testable.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                It is a credible "feels real" environment for the first design
                partners, and the specific cues — jurisdictional timelines,
                settlement-above-threshold approval, append-only audit — are
                exactly what differentiates a toy baseline from a usable one.
              </p>
            </div>

            <div className="hud-corners relative border border-border bg-card/40 p-8 backdrop-blur-sm">
              <div className="mb-6 font-mono text-[10px] tracking-[0.4em] text-gold/80 uppercase">
                What the first Understory includes
              </div>
              <ul className="space-y-4">
                {[
                  "A running claims system with seeded policies, claims, payments, and audit chain",
                  "Maker-checker approval on settlements above a threshold",
                  "State-aware SLA timers as a regulated cue",
                  "Synthetic event streams — FNOL, adjuster assignment, reserve changes, payment issuance",
                  "An LLM gateway with a default per-install budget and graceful degradation",
                ].map((x) => (
                  <li
                    key={x}
                    className="flex gap-3 text-sm leading-relaxed text-foreground/85"
                  >
                    <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-neon shadow-[0_0_8px_oklch(0.78_0.24_145_/_0.8)]" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Where we are today */}
        <section className="relative overflow-hidden px-6 py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
                // 04 — WHERE WE ARE TODAY
              </div>
              <h2 className="font-display text-4xl font-black text-foreground sm:text-5xl">
                Pre-install, post-hand-waving.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                No paid customers. No invented traction. The shape is pinned in
                decision records, the first wedge is chosen, and the research
                needed to build credibly has been done.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TODAY.map((s, i) => (
                <article
                  key={s.k}
                  className="module-card relative overflow-hidden rounded-md border border-border bg-card/50 p-6 backdrop-blur-sm"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="font-mono text-xs tracking-[0.3em] text-neon">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {s.k}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.d}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* The ask */}
        <section className="relative overflow-hidden px-6 py-32">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, oklch(0.2 0.08 150 / 0.6), transparent 60%), linear-gradient(to bottom, transparent, oklch(0.06 0.02 150) 90%)",
            }}
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
              // 05 — THE ASK
            </div>
            <h2 className="font-display text-4xl font-black leading-tight sm:text-6xl">
              <span className="text-foreground">Fund the first</span>
              <br />
              <span className="text-gradient-headline glint">
                design-partner cohort.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Raising{" "}
              <span className="font-mono text-foreground/90">{RAISE_LINE}</span>{" "}
              to publish the AWS Marketplace listing, complete the first
              Understory (P&amp;C claims), and run paid design-partner installs
              with two to three insurers.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={openRequest}
                className="rounded-md border border-gold/60 bg-gradient-to-r from-neon via-moss to-neon px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_0_24px_oklch(0.78_0.24_145_/_0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_oklch(0.78_0.24_145_/_0.8)]"
              >
                Request a conversation →
              </button>
              <button
                type="button"
                onClick={openRequest}
                className="rounded-md border border-border px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-foreground/90 transition-colors hover:border-neon/60 hover:text-neon"
              >
                Request the deck
              </button>
            </div>
            <p className="mx-auto mt-8 max-w-md font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              {PRIVATE_NOTE}
            </p>
          </div>
        </section>

        <Footer onRequestAccess={openRequest} />
      </main>

      <RequestAccessModal open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
