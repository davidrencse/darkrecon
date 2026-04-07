/**
 * Curated Christian population estimates by ISO3 (display + optional note).
 * Not sourced from the main World Bank CSV.
 */
export type ChristianPopulationEntry = {
  value: string;
  referencePeriod: string;
  notes: string;
};

export const CHRISTIAN_POPULATION_BY_ISO3: Record<string, ChristianPopulationEntry> = {
  AUT: { value: '~6.1 million (~68%)', referencePeriod: '', notes: '' },
  BLR: {
    value: '~5.3–7.7 million (55–85%)',
    referencePeriod: '',
    notes: 'Estimates vary by source due to post-Soviet secular trends.',
  },
  BEL: { value: '~4.0–5.8 million (34–51%)', referencePeriod: '', notes: '' },
  BIH: { value: '~1.6 million (~45%)', referencePeriod: '', notes: '' },
  BGR: { value: '~4.2–5.3 million (65–80%)', referencePeriod: '', notes: '' },
  HRV: { value: '~3.4 million (~87–91%)', referencePeriod: '', notes: '' },
  CYP: {
    value: '~0.7–1.0 million (~68–94%)',
    referencePeriod: '',
    notes: 'Primarily Greek Orthodox in the Republic of Cyprus.',
  },
  CZE: {
    value: '~1.7–2.8 million (~16–26%)',
    referencePeriod: '',
    notes: 'One of the most secular countries in Europe.',
  },
  DNK: { value: '~4.5 million (~77%)', referencePeriod: '', notes: '' },
  EST: { value: '~0.4–0.7 million (~31–53%)', referencePeriod: '', notes: '' },
  FIN: { value: '~3.6 million (~64–72%)', referencePeriod: '', notes: '' },
  FRA: { value: '~36–41 million (~55–63%)', referencePeriod: '', notes: '' },
  DEU: { value: '~39.8–42 million (~48–56%)', referencePeriod: '', notes: '' },
  GRC: { value: '~9.5–10 million (~89–93%)', referencePeriod: '', notes: '' },
  HUN: { value: '~5.3 million (~53–72%)', referencePeriod: '', notes: '' },
  ISL: { value: '~0.27 million (~68–75%)', referencePeriod: '', notes: '' },
  IRL: { value: '~3.9 million (~81%)', referencePeriod: '', notes: '' },
  ITA: { value: '~48–53 million (~80–83%)', referencePeriod: '', notes: '' },
  LVA: { value: '~1.6 million (~70–77%)', referencePeriod: '', notes: '' },
  LIE: { value: '~31,000–32,000 (~82%)', referencePeriod: '', notes: '' },
  LTU: { value: '~2.2 million (~92%)', referencePeriod: '', notes: '' },
  LUX: { value: '~0.36 million (~66–72%)', referencePeriod: '', notes: '' },
  MLT: { value: '~0.4 million (~88–90%)', referencePeriod: '', notes: '' },
  MDA: { value: '~2.6 million (~93–99.5%)', referencePeriod: '', notes: '' },
  MCO: { value: '~30,000–32,000 (~83%)', referencePeriod: '', notes: '' },
  MNE: { value: '~0.47 million (~76%)', referencePeriod: '', notes: '' },
  NLD: {
    value: '~5.4 million (~30–35%)',
    referencePeriod: '',
    notes: 'Sharp decline in recent years.',
  },
  NOR: { value: '~3.8 million (~71–77%)', referencePeriod: '', notes: '' },
  POL: { value: '~27.6 million (~72–91%)', referencePeriod: '', notes: '' },
  PRT: { value: '~7.4–8.5 million (~85%)', referencePeriod: '', notes: '' },
  ROU: { value: '~16–18 million (~98.5%)', referencePeriod: '', notes: '' },
  RUS: { value: '~102 million (~70%)', referencePeriod: '', notes: '' },
  SRB: { value: '~5.8 million (~87–91%)', referencePeriod: '', notes: '' },
  SVK: { value: '~3.8 million (~69–74%)', referencePeriod: '', notes: '' },
  SVN: { value: '~1.6 million (~65–68%)', referencePeriod: '', notes: '' },
  ESP: { value: '~28 million (~59–70%)', referencePeriod: '', notes: '' },
  SWE: { value: '~6.6 million (~61–64%)', referencePeriod: '', notes: '' },
  CHE: { value: '~5.7 million (~62–67%)', referencePeriod: '', notes: '' },
  UKR: {
    value: '~34–35 million (~83%)',
    referencePeriod: '',
    notes: 'Pre-2022 figures higher; war-related displacement affects counts.',
  },
  GBR: { value: '~25.6–31.9 million (~39–49%)', referencePeriod: '', notes: '' },
  AUS: {
    value: '~11.1 million (43.9%)',
    referencePeriod: '2021 census',
    notes: 'Continued decline since.',
  },
  CAN: {
    value: '~17–22 million (~42–53%)',
    referencePeriod: '2021–2025 surveys',
    notes: 'Canada census and surveys show faster secularization.',
  },
  NZL: {
    value: '~1.6–1.7 million (~32–37%)',
    referencePeriod: '',
    notes: '2023 census shows further drop to around 32%.',
  },
  USA: {
    value: '~210–235 million (~62–69%)',
    referencePeriod: '2024',
    notes: 'US decline has slowed but continues over time.',
  },
};

export function getChristianPopulation(iso3: string): ChristianPopulationEntry | null {
  return CHRISTIAN_POPULATION_BY_ISO3[iso3.toUpperCase()] ?? null;
}
