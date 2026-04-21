import bgUrl from "@/assets/jungle-bg.jpg";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
    >
      {/* Static poster background */}
      <img
        src={bgUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
      />
      {/* Single dark overlay for legibility */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, oklch(0.05 0.01 320 / 0.85) 0%, oklch(0.08 0.02 320 / 0.4) 50%, oklch(0.05 0.01 320 / 0.6) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-2 py-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon/60 bg-black/40 px-4 py-1.5 font-mono text-[11px] tracking-[0.4em] text-neon">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon" />
          SUMMER 2026
        </div>
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-gradient-headline sm:text-6xl md:text-7xl" style={{ fontFamily: '"Monoton", serif', fontWeight: 400 }}>
          Welcome to
          <br />
          the Jungl3
        </h1>
        <p className="mx-auto mt-8 max-w-xl font-mono text-base font-light text-foreground/90 sm:text-lg">
          A DMZ sandbox where ideas enter raw and leave battle-tested.
        </p>
        <p className="mx-auto mt-3 max-w-md font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Base Camp · Outposts · DMZ · Rope Swing · Swarms · Streams
        </p>
      </div>
    </section>
  );
}
