export function CTASection({
  onRequestAccess,
}: {
  onRequestAccess: () => void;
}) {
  return (
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
          // 03 — NEXT STEP
        </div>
        <h2 className="font-display text-4xl font-black leading-tight sm:text-6xl">
          <span className="text-gradient-headline glint">
            See it in your account.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground">
          Tell us who you are and what you're trying to do. We'll get back to
          you.
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
