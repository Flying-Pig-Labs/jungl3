import { useEffect, useRef } from "react";
import posterUrl from "@/assets/jungle-poster.png";
import { FogLayer } from "../effects/Overlays";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--px", `${x * 14}px`);
      el.style.setProperty("--py", `${y * 14}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
    >
      {/* Poster background with parallax */}
      <div
        aria-hidden
        className="absolute inset-0 will-change-transform"
        style={{
          transform: "translate3d(var(--px,0), var(--py,0), 0) scale(1.05)",
          transition: "transform 0.2s ease-out",
        }}
      >
        <img
          src={posterUrl}
          alt=""
          className="h-full w-full object-cover object-center opacity-70"
          style={{ filter: "saturate(0.9) contrast(1.05)" }}
        />
      </div>

      {/* Atmospheric layers */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, oklch(0.08 0.02 320 / 0.6) 75%, oklch(0.05 0.01 320) 100%)",
        }}
      />
      {/* Bottom-up dark gradient for subhead/CTA legibility */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, oklch(0.05 0.01 320 / 0.85) 0%, transparent 45%)",
        }}
      />
      <FogLayer />

      {/* SVG leaf parallax accents */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -left-10 top-1/4 h-[60%] w-auto opacity-25"
        viewBox="0 0 200 400"
        style={{
          transform: "translate3d(calc(var(--px,0) * -1.5), calc(var(--py,0) * -1.5), 0)",
        }}
      >
        <path
          d="M100 0 C 60 80, 20 160, 40 260 S 90 380, 100 400 C 110 380, 160 320, 160 260 S 140 80, 100 0 Z"
          fill="oklch(0.18 0.06 150)"
          stroke="oklch(0.78 0.16 85 / 0.5)"
          strokeWidth="1.5"
        />
      </svg>
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-0 h-[55%] w-auto opacity-25"
        viewBox="0 0 200 400"
        style={{
          transform: "translate3d(calc(var(--px,0) * 1.5), calc(var(--py,0) * 1.5), 0) scaleX(-1)",
        }}
      >
        <path
          d="M100 0 C 60 80, 20 160, 40 260 S 90 380, 100 400 C 110 380, 160 320, 160 260 S 140 80, 100 0 Z"
          fill="oklch(0.18 0.06 150)"
          stroke="oklch(0.78 0.24 145 / 0.5)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon/60 bg-black/40 px-4 py-1.5 font-mono text-[11px] tracking-[0.4em] text-neon backdrop-blur-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_oklch(0.78_0.24_145)]" />
          SUMMER 2026
        </div>
        <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-gradient-headline glint sm:text-7xl md:text-8xl">
          Welcome to
          <br />
          the Jungl3
        </h1>
        <p className="mx-auto mt-8 max-w-xl font-display text-lg font-light text-foreground/90 sm:text-xl">
          A DMZ sandbox where ideas enter raw and leave battle-tested.
        </p>
        <p className="mx-auto mt-3 max-w-md font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Base Camp · Outposts · DMZ · Rope Swing · Swarms · Streams
        </p>

        <div className="mt-14 flex flex-col items-center gap-2 font-mono text-[10px] tracking-[0.4em] text-muted-foreground">
          <span>DESCEND</span>
          <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-neon to-transparent" />
        </div>
      </div>
    </section>
  );
}
