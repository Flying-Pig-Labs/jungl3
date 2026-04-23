import bgUrl from "@/assets/jungle-bg.jpg";

export function Hero({ onRequestAccess }: { onRequestAccess: () => void }) {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
    >
      <img
        src={bgUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, oklch(0.05 0.01 320 / 0.85) 0%, oklch(0.08 0.02 320 / 0.4) 50%, oklch(0.05 0.01 320 / 0.6) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-2 py-16 text-center">
        <h1
          className="font-display text-5xl leading-[1.05] tracking-tight text-gradient-headline sm:text-6xl md:text-7xl"
          style={{ fontFamily: '"Monoton", serif', fontWeight: 400 }}
        >
          Welcome to the Jungl3
        </h1>
        <p className="mx-auto mt-8 max-w-2xl font-mono text-base font-light text-foreground/90 sm:text-lg">
          A zero-touch on-demand hackathon platform for forward-deployed
          innovation.
        </p>
        <p className="mx-auto mt-4 max-w-xl font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Deploys directly from AWS Marketplace into your VPC
        </p>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={onRequestAccess}
            className="rounded-md border border-gold/60 bg-gradient-to-r from-neon via-moss to-neon px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_0_24px_oklch(0.78_0.24_145_/_0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_oklch(0.78_0.24_145_/_0.8)]"
          >
            Request access →
          </button>
        </div>
      </div>
    </section>
  );
}
