import { getIso3ForFlagId, flagIdHasCountryStats } from '../lib/flagIsoMapping';
import type { FlagEntry } from '../types/flag';
import { CountryStatsDashboard } from './CountryStatsDashboard';

type SelectedFlagViewProps = {
  flag: FlagEntry;
  onBack: () => void;
};

export function SelectedFlagView({ flag, onBack }: SelectedFlagViewProps) {
  if (flagIdHasCountryStats(flag.id)) {
    const iso3 = getIso3ForFlagId(flag.id);
    if (iso3) {
      return <CountryStatsDashboard flag={flag} iso3={iso3} onBack={onBack} />;
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-10 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-10 text-sm text-neutral-500 transition-colors hover:text-white"
      >
        Back
      </button>

      <div className="border border-[var(--line)] bg-[var(--card)]">
        <div className="flex aspect-[3/2] items-center justify-center bg-black/50 px-8 py-10">
          <img src={flag.src} alt="" className="max-h-full max-w-full object-contain" decoding="async" />
        </div>
        <div className="border-t border-[var(--line)] px-6 py-6">
          <h2 className="text-center text-xl font-medium tracking-tight text-white">{flag.label}</h2>
        </div>
      </div>
    </div>
  );
}
