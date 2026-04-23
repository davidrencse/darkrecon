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
            Information about First World Countries.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex items-center justify-center rounded-md border border-white/[0.18] bg-white/[0.08] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-white shadow-soft backdrop-blur-sm transition hover:border-white/25 hover:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Explore
            </button>
            <p className="text-[11px] text-neutral-400">
             
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

