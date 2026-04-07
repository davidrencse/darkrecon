/**
 * Curated Muslim population estimates by ISO3 (display + optional note).
 * Not sourced from the main World Bank CSV.
 */
export type MuslimPopulationEntry = {
  value: string;
  referencePeriod: string;
  notes: string;
};

export const MUSLIM_POPULATION_BY_ISO3: Record<string, MuslimPopulationEntry> = {
  AUT: { value: '~720,000–800,000 (~8–8.3%)', referencePeriod: '', notes: '' },
  BLR: { value: '~45,000–100,000 (~0.5–1%)', referencePeriod: '', notes: '' },
  BEL: { value: '~780,000–880,000 (~6–7.6%)', referencePeriod: '', notes: '' },
  BIH: {
    value: '~1.8–2.0 million (~46–51%)',
    referencePeriod: '',
    notes: 'Large indigenous Bosniak community.',
  },
  BGR: {
    value: '~650,000–700,000 (~10–11%)',
    referencePeriod: '',
    notes: 'Mostly Turkish and Pomak heritage.',
  },
  HRV: { value: '~50,000–60,000 (~1.3%)', referencePeriod: '', notes: '' },
  CYP: {
    value: '~200,000–300,000',
    referencePeriod: '',
    notes:
      'Higher in the north; ~20–25% overall for the island, mostly in Turkish-controlled areas.',
  },
  CZE: { value: '~4,000–10,000 (<0.1%)', referencePeriod: '', notes: '' },
  DNK: { value: '~300,000–350,000 (~5–6%)', referencePeriod: '', notes: '' },
  EST: { value: '<2,000–5,000 (~0.1–0.3%)', referencePeriod: '', notes: '' },
  FIN: { value: '~100,000–150,000 (~2–2.5%)', referencePeriod: '', notes: '' },
  FRA: { value: '~5.7–6.5 million (~8–10%)', referencePeriod: '', notes: '' },
  DEU: { value: '~5.5–6.0 million (~6.5–7%)', referencePeriod: '', notes: '' },
  GRC: {
    value: '~400,000–600,000 (~4–5%)',
    referencePeriod: '',
    notes: 'Mostly historical minorities and recent migrants.',
  },
  HUN: { value: '~10,000–20,000 (~0.1–0.2%)', referencePeriod: '', notes: '' },
  ISL: { value: '<1,000–2,000 (~0.3%)', referencePeriod: '', notes: '' },
  IRL: { value: '~80,000–120,000 (~1.5–2%)', referencePeriod: '', notes: '' },
  ITA: {
    value: '~2.5–4.0 million (~4–7%)',
    referencePeriod: '',
    notes: 'Estimates vary with recent migration.',
  },
  LVA: { value: '~5,000–10,000 (~0.2–0.5%)', referencePeriod: '', notes: '' },
  LIE: { value: '~1,000–2,000 (~3–5%)', referencePeriod: '', notes: '' },
  LTU: { value: '<5,000 (~0.1–0.2%)', referencePeriod: '', notes: '' },
  LUX: { value: '~15,000–25,000 (~2.5–3%)', referencePeriod: '', notes: '' },
  MLT: { value: '<2,000 (~0.3–0.5%)', referencePeriod: '', notes: '' },
  MDA: { value: '~10,000–20,000 (~0.3–0.5%)', referencePeriod: '', notes: '' },
  MCO: { value: '<500 (~0.5–1%)', referencePeriod: '', notes: '' },
  MNE: {
    value: '~120,000–130,000 (~19–20%)',
    referencePeriod: '',
    notes: 'Indigenous Bosniak/Albanian communities.',
  },
  NLD: { value: '~900,000–1.1 million (~5–6%)', referencePeriod: '', notes: '' },
  NOR: { value: '~150,000–250,000 (~3–4.5%)', referencePeriod: '', notes: '' },
  POL: { value: '~20,000–50,000 (~0.1–0.2%)', referencePeriod: '', notes: '' },
  PRT: { value: '~30,000–60,000 (~0.3–0.6%)', referencePeriod: '', notes: '' },
  ROU: { value: '~60,000–100,000 (~0.3–0.5%)', referencePeriod: '', notes: '' },
  RUS: {
    value: '~14–20 million (~10–14%)',
    referencePeriod: '',
    notes: 'Large indigenous populations in Tatarstan, Caucasus, etc.',
  },
  SRB: {
    value: '~200,000–300,000 (~3–4.5%)',
    referencePeriod: '',
    notes: 'Mostly in Sandzak and Presevo areas.',
  },
  SVK: { value: '<5,000 (~0.1%)', referencePeriod: '', notes: '' },
  SVN: { value: '~40,000–60,000 (~2–2.5%)', referencePeriod: '', notes: '' },
  ESP: { value: '~2.0–2.6 million (~4.5–5.5%)', referencePeriod: '', notes: '' },
  SWE: {
    value: '~800,000–1.0 million (~8%)',
    referencePeriod: '',
    notes: 'Notable growth from migration.',
  },
  CHE: { value: '~400,000–500,000 (~5–6%)', referencePeriod: '', notes: '' },
  UKR: {
    value: '~300,000–500,000 (~0.7–1%)',
    referencePeriod: '',
    notes: 'Pre-war figures, affected by conflict.',
  },
  GBR: { value: '~3.8–4.5 million (~5.5–6.5%)', referencePeriod: '', notes: '' },
  AUS: {
    value: '~813,000 (~3.2%)',
    referencePeriod: '2021 census',
    notes:
      'Recent informal estimates suggest growth toward 900,000–1 million by 2024–2025 due to immigration.',
  },
  CAN: {
    value: '~1.8 million (~4.9%)',
    referencePeriod: '2021',
    notes: 'Modest growth since the 2021 census baseline.',
  },
  NZL: {
    value: '~57,000–70,000 (~1.1–1.3%)',
    referencePeriod: '',
    notes: '2018 census baseline with modest growth since.',
  },
  USA: {
    value: '~3.5–4.5 million (~1.1–1.3%)',
    referencePeriod: '2020–2024',
    notes: 'Estimate range from survey and religion-census sources.',
  },
};

export function getMuslimPopulation(iso3: string): MuslimPopulationEntry | null {
  return MUSLIM_POPULATION_BY_ISO3[iso3.toUpperCase()] ?? null;
}
