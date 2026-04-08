import { parseCountriesWideCsv } from './parseCountriesWideCsv';

export type GermanyImmigrationTreemapItem = {
  country: string;
  population: number;
  malePct: number | null;
  shareOfTotalPct: number;
  sourceUrl: string;
};

export function parseGermanyTreemapCsv(raw: string): GermanyImmigrationTreemapItem[] {
  const rows = parseCountriesWideCsv(raw);
  const out: GermanyImmigrationTreemapItem[] = [];
  for (const r of rows) {
    const flow = String(r.flow_type ?? '').trim();
    if (flow.toLowerCase() !== 'immigrants') continue;
    const country = String(r.country ?? '').trim();
    if (!country) continue;
    const pop = Number(String(r.population ?? '').replace(/,/g, ''));
    const maleRaw = String(r.male_share_percent ?? '').trim();
    const malePct = maleRaw === '' ? null : Number(maleRaw);
    const share = Number(String(r.share_of_total_flow_percent ?? '').replace(/,/g, ''));
    out.push({
      country,
      population: Number.isFinite(pop) ? pop : 0,
      malePct: maleRaw === '' || !Number.isFinite(malePct!) ? null : malePct,
      shareOfTotalPct: Number.isFinite(share) ? share : 0,
      sourceUrl: String(r.source_url ?? '').trim(),
    });
  }
  return out.sort((a, b) => b.population - a.population);
}
