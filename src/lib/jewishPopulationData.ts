/**
 * Curated Jewish population estimates by ISO3 (display + optional note).
 * Not sourced from the main World Bank CSV.
 */
export type JewishPopulationEntry = {
  value: string;
  referencePeriod: string;
  notes: string;
};

export const JEWISH_POPULATION_BY_ISO3: Record<string, JewishPopulationEntry> = {
  AUT: { value: '~10,300', referencePeriod: '2024', notes: '' },
  BLR: {
    value: '~5,400–6,000',
    referencePeriod: '',
    notes:
      'Recent estimates; older figures around 8,500–9,200, with ongoing decline.',
  },
  BEL: { value: '~29,000–30,000', referencePeriod: '', notes: '' },
  BIH: { value: '~500 or fewer', referencePeriod: '', notes: 'Very small community.' },
  BGR: { value: '~1,000–2,000', referencePeriod: '', notes: 'Small and declining.' },
  HRV: { value: '~1,700', referencePeriod: '', notes: '' },
  CYP: { value: '<100–200', referencePeriod: '', notes: 'Tiny community.' },
  CZE: { value: '~3,000–4,000', referencePeriod: '', notes: '' },
  DNK: { value: '~6,400', referencePeriod: '', notes: '' },
  EST: { value: '<500–1,000', referencePeriod: '', notes: '' },
  FIN: { value: '~1,000–1,500', referencePeriod: '', notes: '' },
  FRA: { value: '~440,000–500,000', referencePeriod: '', notes: '' },
  DEU: {
    value: '125,000',
    referencePeriod: '',
    notes: 'One of the larger European communities, partly due to post-Soviet immigration.',
  },
  GRC: { value: '~4,000–5,000', referencePeriod: '', notes: '' },
  HUN: {
    value: '~46,000–50,000',
    referencePeriod: '',
    notes: 'Significant community, though with emigration pressures.',
  },
  ISL: { value: '<100', referencePeriod: '', notes: '' },
  IRL: { value: '~2,500–3,000', referencePeriod: '', notes: '' },
  ITA: { value: '~26,800–28,000', referencePeriod: '', notes: '' },
  LVA: { value: '~1,000–2,000', referencePeriod: '', notes: '' },
  LIE: { value: '<100', referencePeriod: '', notes: '' },
  LTU: { value: '~2,000–3,000', referencePeriod: '', notes: '' },
  LUX: { value: '~500–1,000', referencePeriod: '', notes: '' },
  MLT: { value: '<100', referencePeriod: '', notes: '' },
  MDA: { value: '~1,500–3,400', referencePeriod: '', notes: 'Declining due to emigration.' },
  MCO: { value: '<100–200', referencePeriod: '', notes: '' },
  MNE: { value: '<100', referencePeriod: '', notes: '' },
  NLD: { value: '~35,000', referencePeriod: '', notes: '' },
  NOR: { value: '~1,000–2,000', referencePeriod: '', notes: '' },
  POL: {
    value: '~5,000–10,000',
    referencePeriod: '',
    notes: 'Historically large, now very small after Holocaust and emigration.',
  },
  PRT: {
    value: '~1,000–3,000',
    referencePeriod: '',
    notes: 'Small but with some recent growth from returns.',
  },
  ROU: { value: '~8,700', referencePeriod: '', notes: '' },
  RUS: {
    value: '123,000–132,000',
    referencePeriod: '',
    notes: 'Estimates vary; significant post-2022 emigration.',
  },
  SRB: { value: '~1,000–2,000', referencePeriod: '', notes: '' },
  SVK: { value: '~2,000–3,000', referencePeriod: '', notes: '' },
  SVN: { value: '<500', referencePeriod: '', notes: '' },
  ESP: { value: '~13,000–15,000', referencePeriod: '', notes: '' },
  SWE: { value: '~14,900–15,000', referencePeriod: '', notes: '' },
  CHE: { value: '~20,500', referencePeriod: '', notes: '' },
  UKR: {
    value: '~32,000–33,000',
    referencePeriod: '',
    notes: 'Sharp decline due to war and prior emigration; some estimates higher pre-2022.',
  },
  GBR: { value: '312,000–313,000', referencePeriod: '', notes: '' },
  AUS: { value: '117,000–118,000', referencePeriod: '', notes: '' },
  CAN: { value: '~398,000–410,000', referencePeriod: '2024', notes: '' },
  NZL: { value: '~7,500', referencePeriod: '', notes: '' },
  USA: { value: '~7.5–7.7 million', referencePeriod: '2024', notes: '' },
};

export function getJewishPopulation(iso3: string): JewishPopulationEntry | null {
  return JEWISH_POPULATION_BY_ISO3[iso3.toUpperCase()] ?? null;
}
