export function DemoVideo() {
  return (
    <section id="demo" className="relative px-6 py-12">
      <div className="relative mx-auto max-w-6xl">
        <div className="group relative overflow-hidden rounded-md border border-gold/60 shadow-[0_0_0_1px_oklch(0.78_0.18_85_/_0.2)] transition-all duration-300 hover:shadow-[0_0_40px_oklch(0.78_0.24_145_/_0.55)]">
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
      </div>
    </section>
  );
}
