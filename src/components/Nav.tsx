import { Link } from "@tanstack/react-router";

type NavProps = {
  onRequestAccess?: () => void;
};

export function Nav(_props: NavProps) {
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
      </nav>
    </header>
  );
}
