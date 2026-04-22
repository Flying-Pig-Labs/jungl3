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
          "Jungl3 is a hackathon platform where teams start with a system that's already alive. A private overview for prospective angel investors.",
      },
      { property: "og:title", content: "Jungl3 — Investors" },
      {
        property: "og:description",
        content:
          "A hackathon platform where teams start with a system that's already alive.",
      },
    ],
  }),
  component: InvestorsPage,
});

const PRIVATE_NOTE = "Private overview · Not an offer to sell securities";

const WHY_NOW = [
  {
    k: "01",
    t: "AI moved the bottleneck",
    d: "Authoring collapsed. The remaining drag is environment — identity, data, integrations, deploy target, feedback capture — and that drag is now the whole reason hackathons don't produce usable work.",
  },
  {
    k: "02",
    t: "Marketplace distribution is real",
    d: "AWS Marketplace lets a vendor's software install into a customer's own account under their security posture. Regulated buyers — banks, insurers, healthcare — can now host a hackathon on software they'd never otherwise let near their data.",
  },
  {
    k: "03",
    t: "Enterprise hackathons have no product",
    d: "Innovation programs, devrel teams, and corporate sprints run hackathons every year. They're stitched together from generic cloud accounts, scratch repos, and someone's laptop. There is no purpose-built software underneath them.",
  },
];

const TODAY = [
  "Product shape pinned in architecture decision records.",
  "First candidate domain chosen: property & casualty insurance claims.",
  "Two deep-research passes converted into design inputs.",
  "Public landing live. AWS Marketplace path identified.",
  "Pre-revenue, pre-install. Design-partner conversations in progress.",
];

function InvestorsPage() {
  const [requestOpen, setRequestOpen] = useState(false);
  const openRequest = () => setRequestOpen(true);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Nav onRequestAccess={openRequest} />

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6 pt-24">
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

          <div className="relative z-10 mx-auto max-w-3xl py-16 text-center">
            <div className="mb-4 font-mono text-[10px] tracking-[0.4em] text-neon uppercase">
              // For angels — private overview
            </div>
            <h1
              className="font-display text-4xl leading-[1.1] tracking-tight text-gradient-headline sm:text-5xl md:text-6xl"
              style={{ fontFamily: '"Monoton", serif', fontWeight: 400 }}
            >
              Welcome to the Jungl3
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-foreground/90 sm:text-lg">
              Teams enter an environment that is already running — seeded
              data, real integrations, working auth, a reachable front door
              — and spend the sprint shaping it. Judges and beta users try
              the result in the same week.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Installs into the customer's own AWS account through AWS
              Marketplace, so regulated enterprises can host hackathons on
              software they'd never let near their data as a hosted SaaS.
            </p>

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={openRequest}
                className="rounded-md border border-gold/60 bg-gradient-to-r from-neon via-moss to-neon px-7 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_0_24px_oklch(0.78_0.24_145_/_0.45)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_oklch(0.78_0.24_145_/_0.75)]"
              >
                Get in touch →
              </button>
            </div>

            <p className="mx-auto mt-10 max-w-xl font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              {PRIVATE_NOTE}
            </p>
          </div>
        </section>

        {/* The problem */}
        <section className="relative overflow-hidden px-6 py-32">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 font-mono text-xs tracking-[0.4em] text-neon">
              // 01 — THE PROBLEM
            </div>
            <h2 className="font-display text-3xl font-black leading-tight text-foreground sm:text-4xl">
              Day zero is setup.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-foreground/85">
              Before a hackathon team writes a line of code that matters,
              they spend a day — often more — on cloud accounts, repo
              scaffolds, auth, fake data, and someone's laptop. The sprint
              is already half over by the time the idea meets anything
              real.
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground/85">
              That lost day is the product. A hackathon platform that
              starts teams inside a running system gives the sprint back to
              the work.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="relative overflow-hidden px-6 py-32">
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at top, oklch(0.2 0.08 150 / 0.4), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-6 font-mono text-xs tracking-[0.4em] text-neon">
              // 02 — HOW IT WORKS
            </div>
            <h2 className="font-display text-3xl font-black leading-tight text-foreground sm:text-4xl">
              Four steps, one sprint.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-foreground/85">
              A team <span className="text-neon">enters their Jungle</span> —
              a private environment vended for them, already running. They{" "}
              <span className="text-neon">shape the Understory</span>: remove
              what doesn't fit, substitute what does, extend where the
              baseline stops. They{" "}
              <span className="text-neon">refine in the DMZ</span>, where AI
              agents probe the prototype as seeded personas before any human
              does. Finally it{" "}
              <span className="text-neon">reaches the Canopy</span>, where
              judges and beta users find it, try it, and give feedback the
              team can actually act on.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Everything runs inside the customer's AWS account. Nothing a
              bank's security team has to approve externally.
            </p>
          </div>
        </section>

        {/* Why now */}
        <section className="relative overflow-hidden px-6 py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
                // 03 — WHY NOW
              </div>
              <h2 className="font-display text-3xl font-black leading-tight text-foreground sm:text-4xl">
                Three shifts at once.
              </h2>
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

        {/* Where we are */}
        <section className="relative overflow-hidden px-6 py-32">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 font-mono text-xs tracking-[0.4em] text-neon">
              // 04 — WHERE WE ARE
            </div>
            <h2 className="font-display text-3xl font-black leading-tight text-foreground sm:text-4xl">
              Pre-revenue. Not pre-work.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-foreground/85">
              No paid customers, no invented traction. What does exist:
            </p>
            <ul className="mt-6 space-y-3">
              {TODAY.map((x) => (
                <li
                  key={x}
                  className="flex gap-3 text-sm leading-relaxed text-foreground/85"
                >
                  <span className="mt-[0.45rem] inline-block h-1.5 w-1.5 flex-none rounded-full bg-neon shadow-[0_0_8px_oklch(0.78_0.24_145_/_0.8)]" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Let's talk */}
        <section className="relative overflow-hidden px-6 py-32">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, oklch(0.2 0.08 150 / 0.6), transparent 60%), linear-gradient(to bottom, transparent, oklch(0.06 0.02 150) 90%)",
            }}
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
              // 05 — LET'S TALK
            </div>
            <h2 className="font-display text-4xl font-black leading-tight sm:text-5xl">
              <span className="text-gradient-headline glint">
                Get in touch.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              No deck, no data room. A conversation is the right shape for
              where we are.
            </p>

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={openRequest}
                className="rounded-md border border-gold/60 bg-gradient-to-r from-neon via-moss to-neon px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_0_24px_oklch(0.78_0.24_145_/_0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_oklch(0.78_0.24_145_/_0.8)]"
              >
                Get in touch →
              </button>
            </div>
            <p className="mx-auto mt-10 max-w-md font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
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
