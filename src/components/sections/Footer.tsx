export function Footer({
  onRequestAccess,
}: {
  onRequestAccess: () => void;
}) {
  return (
    <footer className="relative border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase sm:flex-row">
        <span>Jungl3</span>
        <button
          type="button"
          onClick={onRequestAccess}
          className="transition hover:text-neon"
        >
          Contact
        </button>
      </div>
    </footer>
  );
}
