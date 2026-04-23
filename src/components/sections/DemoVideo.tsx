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
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
            // DEMO
          </div>
          <h2 className="font-display text-3xl font-black leading-tight text-foreground sm:text-4xl">
            See it in motion.
          </h2>
        </div>

        <div className="hud-corners relative overflow-hidden rounded-lg border border-border bg-card/40 shadow-[0_0_40px_oklch(0.78_0.24_145_/_0.15)] backdrop-blur-sm">
          <video
            src="/jungl3-demo.mp4"
            controls
            playsInline
            preload="metadata"
            className="block h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
