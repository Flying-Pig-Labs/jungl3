import { Lock } from "lucide-react";
import { clearAccess } from "../PasswordGate";

export function Footer({ onLockOut }: { onLockOut: () => void }) {
  const lockOut = () => {
    clearAccess();
    onLockOut();
  };
  return (
    <footer className="relative border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase sm:flex-row">
        <span>JUNGL3 // SUMMER 2026 // CLASSIFIED</span>
        <button
          type="button"
          onClick={lockOut}
          className="inline-flex items-center gap-2 transition hover:text-neon"
          aria-label="Lock out and clear access"
        >
          <Lock className="h-3 w-3" />
          Lock out
        </button>
      </div>
    </footer>
  );
}
