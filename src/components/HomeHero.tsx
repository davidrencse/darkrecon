type HomeHeroProps = {
  onExplore: () => void;
};

export function HomeHero({ onExplore }: HomeHeroProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-neutral-100">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90 grayscale"
        style={{ backgroundImage: 'url(/hero/europe.png), url(/hero/europe.svg)' }}
        aria-hidden
      />
      {/* Vignette + split overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0.85)_70%)]" aria-hidden />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-14">
        <div className="w-full max-w-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-white/70 shadow-[0_0_24px_rgba(255,255,255,0.35)]" />
            <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-400">
              Travel journal
            </p>
          </div>

          <h1 className="select-none font-sans text-6xl font-semibold leading-[0.9] tracking-tight text-white sm:text-7xl">
            <span className="hero-title-pulse">Western</span>{' '}
            <span className="hero-title-pulse [animation-delay:120ms]">World</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-300">
            Explore country dashboards, demographics, and baseline-vs-latest crime comparisons across the Western world.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Explore
            </button>
            <p className="text-[11px] text-neutral-400">
              Opens the flag gallery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

