import { useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { FlagGallery } from './components/FlagGallery';
import { HomeHero } from './components/HomeHero';
import { SelectedFlagView } from './components/SelectedFlagView';
import { usePrefetchFlagImages } from './hooks/usePrefetchFlagImages';
import { flagIdHasCountryStats } from './lib/flagIsoMapping';
import type { FlagEntry } from './types/flag';

function App() {
  const [stage, setStage] = useState<'home' | 'gallery'>('home');
  const [selected, setSelected] = useState<FlagEntry | null>(null);
  const statsView = selected ? flagIdHasCountryStats(selected.id) : false;

  usePrefetchFlagImages();

  return (
    <AppLayout showHeader={!statsView && stage !== 'home'}>
      {stage === 'home' && !selected ? (
        <HomeHero onExplore={() => setStage('gallery')} />
      ) : null}
      {/* Keep gallery mounted so flag <img> nodes stay in DOM and stay in the browser cache when viewing a country. */}
      <div
        className={selected || stage !== 'gallery' ? 'hidden' : undefined}
        aria-hidden={!!selected || stage !== 'gallery'}
      >
        <FlagGallery onSelectFlag={setSelected} />
      </div>
      {selected ? (
        <SelectedFlagView flag={selected} onBack={() => setSelected(null)} />
      ) : null}
    </AppLayout>
  );
}

export default App;
