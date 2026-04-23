export function DemoVideo() {
  return (
    <section
      id="demo"
      className="relative overflow-hidden px-6 py-24 sm:py-32"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.2 0.08 150 / 0.35), transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
          // DEMO
        </div>
        <h2
          className="font-display text-4xl leading-[1.05] tracking-tight text-gradient-headline sm:text-5xl"
          style={{ fontFamily: '"Monoton", serif', fontWeight: 400 }}
        >
          See a sprint in 90 seconds
        </h2>

        <div className="group relative mt-10 overflow-hidden rounded-md border border-gold/60 shadow-[0_0_0_1px_oklch(0.78_0.18_85_/_0.2)] transition-all duration-300 hover:shadow-[0_0_40px_oklch(0.78_0.24_145_/_0.55)]">
          <video
            src="/jungl3-demo.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            controls
            className="block h-auto w-full"
          />
        </div>

        <p className="mt-4 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Scripted walkthrough — no AWS required to watch.
        </p>
      </div>
    </section>
  );
}
