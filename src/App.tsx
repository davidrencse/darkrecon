import { useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { FlagGallery } from './components/FlagGallery';
import { SelectedFlagView } from './components/SelectedFlagView';
import { flagIdHasCountryStats } from './lib/flagIsoMapping';
import type { FlagEntry } from './types/flag';

function App() {
  const [selected, setSelected] = useState<FlagEntry | null>(null);
  const statsView = selected ? flagIdHasCountryStats(selected.id) : false;

  return (
    <AppLayout showHeader={!statsView}>
      {selected ? (
        <SelectedFlagView flag={selected} onBack={() => setSelected(null)} />
      ) : (
        <FlagGallery onSelectFlag={setSelected} />
      )}
    </AppLayout>
  );
}

export default App;
