import type { CountryStatMetric } from '../types/countryStats';
import type { CountryWideRow } from './parseCountriesWideCsv';

function isBlankOrNa(v: string): boolean {
  return !v.trim() || v.trim().toUpperCase() === 'N/A';
}

/** Nominal GDP in current USD, stored as full dollars in CSV → displayed in billions. */
function fmtGdpBillions(s: string): string {
  if (isBlankOrNa(s)) return 'N/A';
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  const billions = n / 1e9;
  const digits = billions >= 100 ? 1 : 2;
  const num = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(billions);
  return `$${num} billion`;
}

function fmtUsd2(s: string): string {
  if (isBlankOrNa(s)) return 'N/A';
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtCount(s: string): string {
  if (isBlankOrNa(s)) return 'N/A';
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

function tile(
  metric: string,
  value: string,
  ref: string,
  geo: string,
  url: string,
  notes = '',
): CountryStatMetric {
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

function joinUrls(...parts: (string | undefined)[]): string {
  return parts
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
    .join(' | ');
}

/** Proxy CSV: TFR vs share of live births by mother nativity. */
function formatProxyBirthDisplay(value: string, birthMetric: string): string {
  if (isBlankOrNa(value)) return 'N/A';
  const bm = birthMetric.trim();
  if (bm.includes('% of live births')) {
    const n = parseFloat(value);
    if (!Number.isFinite(n)) return value;
    const rounded = Math.abs(n - Math.round(n)) < 1e-6 ? String(Math.round(n)) : n.toFixed(1);
    return `${rounded}%`;
  }
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return value;
  const rounded = Math.round(n * 1000) / 1000;
  return `${rounded} (TFR)`;
}

function proxyPopulationNote(p: CountryWideRow): string {
  const bits: string[] = [];
  if (p.white_native_population_metric)
    bits.push(`Definition: ${p.white_native_population_metric}`);
  if (p.white_native_population_is_proxy === 'yes') bits.push('Marked as proxy in source CSV.');
  return bits.join(' ');
}

function proxyNonEuropeanNote(p: CountryWideRow): string {
  const bits: string[] = [];
  if (p.non_european_population_metric) bits.push(`Definition: ${p.non_european_population_metric}`);
  if (p.non_european_population_is_proxy === 'yes') bits.push('Marked as proxy in source CSV.');
  return bits.join(' ');
}

function proxyBirthNote(p: CountryWideRow): string {
  const bits: string[] = [];
  if (p.birth_method) bits.push(`Method: ${p.birth_method}`);
  if (p.birth_metric) bits.push(`Metric type: ${p.birth_metric}`);
  return bits.join(' ');
}

/**
 * Merges main Data360 row with optional `countries_proxy_demographics_births.csv` row.
 * UK (GBR): white (native) birth rate stays **54% (2024)** per dashboard spec; immigrant birth from proxy when present.
 */
export function wideRowToStatMetrics(
  row: CountryWideRow,
  iso3: string,
  proxy: CountryWideRow | null,
): CountryStatMetric[] {
  const geo = row.country || proxy?.country || '';
  const isUk = iso3 === 'GBR';
  const p = proxy;

  const whiteNativePop = p?.white_native_population ?? row.white_population;
  const whiteNativePopYear = p?.population_data_year ?? row.white_population_year;
  const whiteNativePopUrl = p
    ? joinUrls(p.population_source_url, p.migrant_source_url)
    : row.white_population_source_url;
  const whiteNativePopNotes = p ? proxyPopulationNote(p) : '';

  const nonEuroPop = p?.non_european_population ?? row.non_european_population;
  const nonEuroYear = p?.migrant_data_year ?? row.non_european_population_year;
  const nonEuroUrl = p
    ? joinUrls(p.migrant_source_url, p.population_source_url)
    : row.non_european_population_source_url;
  const nonEuroNotes = p ? proxyNonEuropeanNote(p) : '';

  let whiteNativeBirthValue: string;
  let whiteNativeBirthYear: string;
  let whiteNativeBirthUrl: string;
  let whiteNativeBirthNotes: string;

  if (isUk) {
    whiteNativeBirthValue = '54%';
    whiteNativeBirthYear = '2024';
    whiteNativeBirthUrl = '';
    whiteNativeBirthNotes =
      'Dashboard value for the United Kingdom: 54% — White (native) births share, 2024 (user-specified for this view).';
  } else if (p) {
    whiteNativeBirthValue = formatProxyBirthDisplay(p.white_native_birth_rate, p.birth_metric);
    whiteNativeBirthYear = p.birth_data_year;
    whiteNativeBirthUrl = p.birth_source_url || '';
    whiteNativeBirthNotes = proxyBirthNote(p);
  } else {
    whiteNativeBirthValue = row.white_birth_rate;
    whiteNativeBirthYear = row.white_birth_rate_year;
    whiteNativeBirthUrl = row.white_birth_rate_source_url;
    whiteNativeBirthNotes = '';
  }

  let immigrantBirthValue: string;
  let immigrantBirthYear: string;
  let immigrantBirthUrl: string;
  let immigrantBirthNotes: string;

  if (p) {
    immigrantBirthValue = formatProxyBirthDisplay(p.immigrant_birth_rate, p.birth_metric);
    immigrantBirthYear = p.birth_data_year;
    immigrantBirthUrl = p.birth_source_url || '';
    immigrantBirthNotes = proxyBirthNote(p);
  } else {
    immigrantBirthValue = row.immigrant_birth_rate;
    immigrantBirthYear = row.immigrant_birth_rate_year;
    immigrantBirthUrl = row.immigrant_birth_rate_source_url;
    immigrantBirthNotes = '';
  }

  return [
    tile('GDP', fmtGdpBillions(row.gdp_current_usd), row.gdp_year, geo, row.gdp_source_url),
    tile(
      'GDP per capita',
      fmtUsd2(row.gdp_per_capita_current_usd),
      row.gdp_per_capita_year,
      geo,
      row.gdp_per_capita_source_url,
    ),
    tile(
      'White (native) population',
      isBlankOrNa(whiteNativePop) ? 'N/A' : fmtCount(whiteNativePop),
      whiteNativePopYear,
      geo,
      whiteNativePopUrl,
      whiteNativePopNotes,
    ),
    tile(
      'Non-European population',
      isBlankOrNa(nonEuroPop) ? 'N/A' : fmtCount(nonEuroPop),
      nonEuroYear,
      geo,
      nonEuroUrl,
      nonEuroNotes,
    ),
    tile(
      'Immigrants',
      fmtCount(row.immigrants_stock_total),
      row.immigrants_stock_year,
      geo,
      row.immigrants_stock_source_url,
    ),
    tile(
      'Total birth rate',
      isBlankOrNa(row.total_birth_rate) ? 'N/A' : `${row.total_birth_rate} (TFR)`,
      row.total_birth_rate_year,
      geo,
      row.total_birth_rate_source_url,
    ),
    tile(
      'White (native) birth rate',
      isBlankOrNa(whiteNativeBirthValue) ? 'N/A' : whiteNativeBirthValue,
      whiteNativeBirthYear,
      geo,
      whiteNativeBirthUrl,
      whiteNativeBirthNotes,
    ),
    tile(
      'Immigrant birth rate',
      isBlankOrNa(immigrantBirthValue) ? 'N/A' : immigrantBirthValue,
      immigrantBirthYear,
      geo,
      immigrantBirthUrl,
      immigrantBirthNotes,
    ),
    tile(
      'Top immigrant countries',
      row.top_immigrant_countries?.trim() ? row.top_immigrant_countries : 'N/A',
      row.top_immigrant_countries_year,
      geo,
      row.top_immigrant_countries_source_url,
    ),
  ];
}

export function collectSourceUrlsFromWideRow(row: CountryWideRow): { url: string; label: string }[] {
  const out: { url: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const [k, v] of Object.entries(row)) {
    if (!k.endsWith('_source_url')) continue;
    if (!v?.trim()) continue;
    const urls = v
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const u of urls) {
      if (seen.has(u)) continue;
      seen.add(u);
      try {
        const host = new URL(u).hostname.replace(/^www\./, '');
        out.push({ url: u, label: host });
      } catch {
        out.push({ url: u, label: u.length > 48 ? `${u.slice(0, 48)}…` : u });
      }
    }
  }
  return out;
}
