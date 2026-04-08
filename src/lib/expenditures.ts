import type { CountryStatMetric } from '../types/countryStats';
import type { CountryWideRow } from './parseCountriesWideCsv';

type Slice = { label: string; value: number };

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

const COUNTRY_ALIASES: Record<string, string> = {
  'bosnia herzegovina': 'bosnia and herzegovina',
  'united states': 'united states of america',
  usa: 'united states of america',
};

function toUrlOrEmpty(text: string): string {
  const t = text.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return '';
}

/** Code-side figure when expenditures CSV has no immigration welfare cell for Germany. */
const GERMANY_IMMIGRATION_WELFARE_USD = '~$28.6B USD';

function immigrationWelfareDisplay(row: CountryWideRow, iso3?: string): string {
  const raw = String(row['Immigration Welfare Spending (latest estimate)'] ?? '').trim();
  const missing = !raw || raw.toUpperCase() === 'N/A';
  if (iso3 === 'DEU' && missing) return GERMANY_IMMIGRATION_WELFARE_USD;
  return raw || 'N/A';
}

function tile(metric: string, value: string, ref: string, geo: string, url: string, notes = ''): CountryStatMetric {
  return {
    metric,
    value,
    reference_period: ref,
    geography_used: geo,
    source_name: '',
    source_url: url,
    source_publication_or_access_date: ref,
    notes,
  };
}

export function findExpenditureRow(rows: CountryWideRow[], countryName: string): CountryWideRow | null {
  const targetNorm = norm(countryName);
  const target = COUNTRY_ALIASES[targetNorm] ?? targetNorm;
  for (const r of rows) {
    const c = norm(String(r.Country ?? r.country ?? ''));
    if (c === target) return r;
  }
  return null;
}

function parsePercentLoose(raw: string): number | null {
  const t = raw.trim();
  if (!t || t.toUpperCase() === 'N/A') return null;
  const range = t.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*%/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) return (a + b) / 2;
  }
  const single = t.match(/(\d+(?:\.\d+)?)\s*%/);
  if (single) {
    const n = Number(single[1]);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pieMetric(row: CountryWideRow, ref: string, geo: string, url: string, notes: string): CountryStatMetric {
  const slices: Slice[] = [
    { label: 'Social protection', value: parsePercentLoose(String(row['Social Protection (% of total exp)'] ?? '')) ?? 0 },
    { label: 'Health', value: parsePercentLoose(String(row['Health (% of total exp)'] ?? '')) ?? 0 },
    { label: 'Education', value: parsePercentLoose(String(row['Education (% of total exp)'] ?? '')) ?? 0 },
    { label: 'Defence', value: parsePercentLoose(String(row['Defence (% of total exp)'] ?? '')) ?? 0 },
    { label: 'Economic affairs', value: parsePercentLoose(String(row['Economic Affairs (% of total exp)'] ?? '')) ?? 0 },
  ].filter((s) => s.value > 0);

  if (slices.length === 0) {
    return tile('Expenditure breakdown (pie)', 'N/A', ref, geo, url, notes);
  }
  return tile('Expenditure breakdown (pie)', JSON.stringify(slices), ref, geo, url, notes);
}

export function metricsFromExpenditureRow(row: CountryWideRow, iso3?: string): CountryStatMetric[] {
  const geo = String(row.Country ?? '').trim();
  const ref = String(row['Latest Year'] ?? '').trim();
  const source = String(row['Spending Details & Source'] ?? '').trim();
  const sourceUrl = toUrlOrEmpty(source);

  return [
    tile(
      'Total government expenditure',
      String(row['Total Govt Expenditure (% of GDP or bn USD)'] ?? '').trim() || 'N/A',
      ref,
      geo,
      sourceUrl,
      source,
    ),
    tile('Social protection expenditure', String(row['Social Protection (% of total exp)'] ?? '').trim() || 'N/A', ref, geo, sourceUrl, source),
    tile('Health expenditure', String(row['Health (% of total exp)'] ?? '').trim() || 'N/A', ref, geo, sourceUrl, source),
    tile('Education expenditure', String(row['Education (% of total exp)'] ?? '').trim() || 'N/A', ref, geo, sourceUrl, source),
    tile('Defence expenditure', String(row['Defence (% of total exp)'] ?? '').trim() || 'N/A', ref, geo, sourceUrl, source),
    tile('Economic affairs expenditure', String(row['Economic Affairs (% of total exp)'] ?? '').trim() || 'N/A', ref, geo, sourceUrl, source),
    tile(
      'Immigration welfare spending',
      immigrationWelfareDisplay(row, iso3),
      ref,
      geo,
      sourceUrl,
      source,
    ),
    pieMetric(row, ref, geo, sourceUrl, source),
  ];
}

