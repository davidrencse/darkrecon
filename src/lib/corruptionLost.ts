import type { CountryStatMetric } from '../types/countryStats';
import type { CountryWideRow } from './parseCountriesWideCsv';

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Aligns merged-stats country labels with `corruption_money_lost_modeled_estimates.csv` `Country` names. */
const COUNTRY_ALIASES: Record<string, string> = {
  'bosnia herzegovina': 'bosnia and herzegovina',
  'united states': 'united states of america',
  usa: 'united states of america',
  'russian federation': 'russia',
  uk: 'united kingdom',
};

function extractHttpsUrls(text: string): string {
  const urls = text.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
  return [...new Set(urls)].join('|');
}

function fmtUsdBillions(value: number): string {
  const inBillions = value / 1_000_000_000;
  return `$${inBillions.toFixed(1)}B`;
}

export function findCorruptionLostRow(rows: CountryWideRow[], countryName: string): CountryWideRow | null {
  const targetNorm = norm(countryName);
  const target = COUNTRY_ALIASES[targetNorm] ?? targetNorm;
  for (const r of rows) {
    const c = norm(String(r.Country ?? r.country ?? ''));
    if (c === target) return r;
  }
  return null;
}

export function lostToCorruptionMetric(row: CountryWideRow | null, geographyLabel: string): CountryStatMetric {
  if (!row) {
    return {
      metric: 'Lost to Corruption',
      value: 'N/A',
      reference_period: '',
      geography_used: geographyLabel,
      source_name: '',
      source_url: '',
      source_publication_or_access_date: '',
      notes: 'No modeled estimate in corruption_money_lost_modeled_estimates.csv for this country.',
    };
  }
  const rawMoney = String(row['Money Lost in Dollars'] ?? '').replace(/,/g, '');
  const n = Number(rawMoney);
  const value = Number.isFinite(n) ? fmtUsdBillions(n) : 'N/A';
  const sourceText = String(row.Source ?? '').trim();
  return {
    metric: 'Lost to Corruption',
    value,
    reference_period: '2024 (modeled)',
    geography_used: String(row.Country ?? geographyLabel).trim(),
    source_name: '',
    source_url: extractHttpsUrls(sourceText),
    source_publication_or_access_date: '2024 (modeled)',
    notes: sourceText,
  };
}

/** Inserts before the expenditure pie so order matches GOVERNMENT_SPENDING_METRICS. */
export function insertLostToCorruptionMetric(
  metrics: CountryStatMetric[],
  corruptionRow: CountryWideRow | null,
  geographyLabel: string,
): void {
  const lost = lostToCorruptionMetric(corruptionRow, geographyLabel);
  const pieIdx = metrics.findIndex((m) => m.metric === 'Expenditure breakdown (pie)');
  if (pieIdx >= 0) metrics.splice(pieIdx, 0, lost);
  else metrics.push(lost);
}
