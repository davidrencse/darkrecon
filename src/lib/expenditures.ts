import type { CountryStatMetric } from '../types/countryStats';
import type { CountryWideRow } from './parseCountriesWideCsv';
import germanyEconomicTableCsv from '../../Assets/Data/Europe/Germany/Economic Statistics Section/table.csv?raw';
import { buildGermanyCombinedExpenditurePie } from './germanyEconomicExpenditureTable';

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

function immigrationWelfareDisplay(row: CountryWideRow | null, iso3?: string): string {
  const raw = row ? String(row['Immigration Welfare Spending (latest estimate)'] ?? '').trim() : '';
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

function legacyExpenditurePieMetric(row: CountryWideRow, ref: string, geo: string, url: string, notes: string): CountryStatMetric {
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

/** CSV stores full USD; pie/table use **billions** on the same scale as €bn column. */
function corruptionMoneyUsdBillionsFromRow(corruptionRow: CountryWideRow | null): number | null {
  if (!corruptionRow) return null;
  const raw = String(corruptionRow['Money Lost in Dollars'] ?? '').replace(/,/g, '');
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n / 1_000_000_000;
}

function germanyExpenditurePieMetric(
  row: CountryWideRow | null,
  ref: string,
  geo: string,
  url: string,
  notes: string,
  corruptionRow: CountryWideRow | null,
  iso3: string,
): CountryStatMetric {
  const slices = buildGermanyCombinedExpenditurePie(
    germanyEconomicTableCsv,
    immigrationWelfareDisplay(row, iso3),
    corruptionMoneyUsdBillionsFromRow(corruptionRow),
  );
  if (slices.length === 0) {
    return tile('Expenditure breakdown (pie)', 'N/A', ref, geo, url, notes);
  }
  const pieNote =
    'Combined pie: categories from Economic Statistics table.csv (2025 est., €bn); immigration welfare slice uses €46.6bn (2025 spend line); lost to corruption (modeled, USD bn→EUR bn). Slice sizes use the same €bn scale.';
  return tile(
    'Expenditure breakdown (pie)',
    JSON.stringify(slices),
    ref,
    geo,
    url,
    notes.trim() ? `${notes}\n\n${pieNote}` : pieNote,
  );
}

function foreignAidMetricGermany(): CountryStatMetric {
  return {
    metric: 'Foreign Aid',
    value: '€126 billion',
    value_subtitle: "0.67% of Germany's GNI",
    reference_period: 'OECD development co-operation profile',
    geography_used: 'Germany',
    source_name: '',
    source_url:
      'https://www.oecd.org/en/publications/development-co-operation-profiles_04b376d7-en/germany_460a37b1-en.html|https://www.bundesregierung.de/breg-en/news/germany-aid-for-ukraine-2192480',
    source_publication_or_access_date: 'OECD / Federal Government',
    notes:
      'OECD: official development assistance and GNI share. Federal Government: context on support including Ukraine (humanitarian, financial, military, and related programmes).',
  };
}

/** When `expenditures.csv` has no row for Germany, still show immigration + pie from `table.csv`. */
export function metricsGermanyGovernmentSpendingWithoutExpenditureCsv(
  corruptionRow: CountryWideRow | null,
  countryLabel: string,
): CountryStatMetric[] {
  const ref = '2025 (est.)';
  const geo = countryLabel;
  const source = 'Germany Economic Statistics table.csv (2025 est.)';
  const sourceUrl = '';
  return [
    tile('Immigration welfare spending', immigrationWelfareDisplay(null, 'DEU'), ref, geo, sourceUrl, source),
    foreignAidMetricGermany(),
    germanyExpenditurePieMetric(null, ref, geo, sourceUrl, source, corruptionRow, 'DEU'),
  ];
}

export function metricsFromExpenditureRow(
  row: CountryWideRow,
  iso3?: string,
  corruptionRow?: CountryWideRow | null,
): CountryStatMetric[] {
  const geo = String(row.Country ?? '').trim();
  const ref = String(row['Latest Year'] ?? '').trim();
  const source = String(row['Spending Details & Source'] ?? '').trim();
  const sourceUrl = toUrlOrEmpty(source);

  const pie =
    iso3?.toUpperCase() === 'DEU'
      ? germanyExpenditurePieMetric(row, ref, geo, sourceUrl, source, corruptionRow ?? null, iso3 ?? '')
      : legacyExpenditurePieMetric(row, ref, geo, sourceUrl, source);

  const out: CountryStatMetric[] = [
    tile(
      'Immigration welfare spending',
      immigrationWelfareDisplay(row, iso3),
      ref,
      geo,
      sourceUrl,
      source,
    ),
  ];
  if (iso3?.toUpperCase() === 'DEU') {
    out.push(foreignAidMetricGermany());
  }
  out.push(pie);
  return out;
}

