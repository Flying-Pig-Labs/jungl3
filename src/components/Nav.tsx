import { Link, useRouterState } from "@tanstack/react-router";

type NavProps = {
  onRequestAccess: () => void;
};

const LINKS = [
  { to: "/", label: "Overview" },
] as const;

export function Nav({ onRequestAccess }: NavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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

        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={
                  "rounded-sm px-3 py-1.5 font-mono text-[10px] tracking-[0.3em] uppercase transition-colors " +
                  (active
                    ? "text-neon"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {l.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={onRequestAccess}
            className="ml-2 rounded-md border border-gold/50 bg-gradient-to-r from-neon/90 via-moss to-neon/90 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_0_18px_oklch(0.78_0.24_145_/_0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_28px_oklch(0.78_0.24_145_/_0.6)]"
          >
            Request access
          </button>
        </div>
      </nav>
    </header>
  );
}
