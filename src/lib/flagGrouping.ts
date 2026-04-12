import type { FlagEntry } from '../types/flag';

export type GalleryViewMode = 'continents' | 'eu' | 'alphabet';

export type FlagSection = {
  id: string;
  title: string;
  flags: FlagEntry[];
};

/** EU member states (27) — matches `flag-of-*.png` ids present in the app. */
const EU_MEMBER_FLAG_IDS = new Set([
  'flag-of-Austria.png',
  'flag-of-Belgium.png',
  'flag-of-Bulgaria.png',
  'flag-of-Croatia.png',
  'flag-of-Cyprus.png',
  'flag-of-Czech-Republic.png',
  'flag-of-Denmark.png',
  'flag-of-Estonia.png',
  'flag-of-Finland.png',
  'flag-of-Germany.png',
  'flag-of-Greece.png',
  'flag-of-Hungary.png',
  'flag-of-Ireland.png',
  'flag-of-Italy.png',
  'flag-of-Latvia.png',
  'flag-of-Lithuania.png',
  'flag-of-Luxembourg.png',
  'flag-of-Malta.png',
  'flag-of-Netherlands.png',
  'flag-of-Poland.png',
  'flag-of-Portugal.png',
  'flag-of-Romania.png',
  'flag-of-Slovakia.png',
  'flag-of-Slovenia.png',
  'flag-of-Spain.png',
  'flag-of-Sweden.png',
]);

const OCEANIA_FLAG_IDS = new Set(['flag-of-Australia.png', 'flag-of-New-Zealand.png']);

const AFRICA_FLAG_IDS = new Set(['flag-of-South-Africa.png']);

const NORTH_AMERICA_FLAG_IDS = new Set([
  'flag-of-Canada.png',
  'flag-of-United-States.png',
  'flag-of-United-States-of-America.png',
  'flag-of-USA.png',
]);

/** Flags shown under Oceania, Africa, or North America instead of the Europe section. */
function otherContinentSectionFlagIds(): Set<string> {
  return new Set([...OCEANIA_FLAG_IDS, ...AFRICA_FLAG_IDS, ...NORTH_AMERICA_FLAG_IDS]);
}

function sortByLabel(flags: FlagEntry[]): FlagEntry[] {
  return [...flags].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}

function nonEmptySections(sections: FlagSection[]): FlagSection[] {
  return sections.filter((s) => s.flags.length > 0);
}

export function groupFlagsByViewMode(flags: FlagEntry[], mode: GalleryViewMode): FlagSection[] {
  if (mode === 'continents') {
    const outsideEuropeSection = otherContinentSectionFlagIds();
    const europe = sortByLabel(flags.filter((f) => !outsideEuropeSection.has(f.id)));
    const northAmerica = sortByLabel(flags.filter((f) => NORTH_AMERICA_FLAG_IDS.has(f.id)));
    const africa = sortByLabel(flags.filter((f) => AFRICA_FLAG_IDS.has(f.id)));
    const oceania = sortByLabel(flags.filter((f) => OCEANIA_FLAG_IDS.has(f.id)));
    return nonEmptySections([
      { id: 'europe', title: 'Europe', flags: europe },
      { id: 'north-america', title: 'North America', flags: northAmerica },
      { id: 'africa', title: 'Africa', flags: africa },
      { id: 'oceania', title: 'Oceania', flags: oceania },
    ]);
  }

  if (mode === 'eu') {
    const eu = sortByLabel(flags.filter((f) => EU_MEMBER_FLAG_IDS.has(f.id)));
    const nonEu = sortByLabel(flags.filter((f) => !EU_MEMBER_FLAG_IDS.has(f.id)));
    return nonEmptySections([
      { id: 'eu', title: 'EU member states', flags: eu },
      { id: 'non-eu', title: 'Non-EU', flags: nonEu },
    ]);
  }

  const sorted = sortByLabel(flags);
  const byLetter = new Map<string, FlagEntry[]>();
  for (const f of sorted) {
    const raw = f.label.charAt(0).toLocaleUpperCase(undefined);
    const letter = /^[A-Z]$/i.test(raw) ? raw.toUpperCase() : '#';
    const list = byLetter.get(letter);
    if (list) list.push(f);
    else byLetter.set(letter, [f]);
  }
  const letters = [...byLetter.keys()].sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });
  return letters.map((letter) => ({
    id: `letter-${letter}`,
    title: letter === '#' ? 'Other' : letter,
    flags: byLetter.get(letter)!,
  }));
}

export const VIEW_MODE_META: Record<
  GalleryViewMode,
  { title: string; subtitle: string }
> = {
  continents: { title: 'Continents', subtitle: 'Europe · North America · Africa · Oceania' },
  eu: { title: 'EU membership', subtitle: 'Member states · Non-EU' },
  alphabet: { title: 'Alphabetical', subtitle: 'A–Z by name' },
};
