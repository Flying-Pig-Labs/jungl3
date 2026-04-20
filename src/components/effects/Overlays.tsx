export function GrainOverlay() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 grain z-[60]" />;
}

export function ScanlinesOverlay() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 scanlines z-[55] opacity-60" />;
}

export function FogLayer({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`fog ${className}`} />;
}

export function Vignette() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[50]"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 40%, oklch(0 0 0 / 0.55) 100%)",
      }}
    />
  );
}
