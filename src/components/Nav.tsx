import { Link } from "@tanstack/react-router";

type NavProps = {
  onRequestAccess: () => void;
};

export function Nav({ onRequestAccess }: NavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        aria-hidden
        className="absolute inset-0 border-b border-border/60 bg-background/70 backdrop-blur-md"
      />
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          to="/"
          className="font-display text-lg tracking-[0.1em] text-gradient-headline"
          style={{ fontFamily: '"Monoton", serif', fontWeight: 400 }}
          aria-label="Jungl3 — home"
        >
          Jungl3
        </Link>

        <button
          type="button"
          onClick={onRequestAccess}
          className="rounded-md border border-gold/50 bg-gradient-to-r from-neon/90 via-moss to-neon/90 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_0_18px_oklch(0.78_0.24_145_/_0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_28px_oklch(0.78_0.24_145_/_0.6)]"
        >
          Request access
        </button>
      </nav>
    </header>
  );
}
