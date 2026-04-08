import type { CountryStatMetric } from '../types/countryStats';
import type { CountryWideRow } from './parseCountriesWideCsv';

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

const COUNTRY_ALIASES: Record<string, string> = {
  'bosnia herzegovina': 'bosnia and herzegovina',
  'united states of america': 'united states',
  usa: 'united states',
};

function tile(metric: string, value: string, ref: string, geo: string, sourceUrl: string, notes: string): CountryStatMetric {
  return {
    metric,
    value,
    reference_period: ref,
    geography_used: geo,
    source_name: '',
    source_url: sourceUrl.trim(),
    source_publication_or_access_date: ref,
    notes,
  };
}

function fmtPercent(raw: string): string {
  const t = raw.trim();
  if (!t || t.toUpperCase() === 'N/A') return 'N/A';
  return t.endsWith('%') ? t : `${t}%`;
}

function fmtUsd(raw: string): string {
  const t = raw.replace(/,/g, '').trim();
  const n = Number(t);
  if (!Number.isFinite(n)) return 'N/A';
  return `$${n.toLocaleString('en-US')}`;
}

export function findMacroIndicatorsRow(rows: CountryWideRow[], countryName: string): CountryWideRow | null {
  const targetNorm = norm(countryName);
  const target = COUNTRY_ALIASES[targetNorm] ?? targetNorm;
  for (const r of rows) {
    const c = norm(String(r.country ?? r.Country ?? ''));
    if (c === target) return r;
  }
  return null;
}

export function metricsFromMacroIndicatorsRow(row: CountryWideRow | null, geographyLabel: string): CountryStatMetric[] {
  if (!row) {
    return [
      tile('Inflation', 'N/A', '', geographyLabel, '', ''),
      tile('Unemployment', 'N/A', '', geographyLabel, '', ''),
      tile('Interest', 'N/A', '', geographyLabel, '', ''),
      tile('Real Median Wage', 'N/A', '', geographyLabel, '', ''),
    ];
  }

  const geo = String(row.country ?? row.Country ?? geographyLabel).trim();
  const note = String(row.note ?? '').trim();

  return [
    tile(
      'Inflation',
      fmtPercent(String(row.inflation_rate_pct ?? '')),
      String(row.inflation_reference ?? '').trim(),
      geo,
      String(row.inflation_source ?? '').trim(),
      note,
    ),
    tile(
      'Unemployment',
      fmtPercent(String(row.unemployment_rate_pct ?? '')),
      String(row.unemployment_reference ?? '').trim(),
      geo,
      String(row.unemployment_source ?? '').trim(),
      note,
    ),
    tile(
      'Interest',
      fmtPercent(String(row.interest_rate_pct ?? '')),
      String(row.interest_rate_reference ?? '').trim(),
      geo,
      String(row.interest_rate_source ?? '').trim(),
      note,
    ),
    tile(
      'Real Median Wage',
      fmtUsd(String(row.real_median_wage_usd ?? '')),
      String(row.real_median_wage_reference ?? '').trim(),
      geo,
      String(row.real_median_wage_source ?? '').trim(),
      note,
    ),
  ];
}
