import type { CountryWideRow } from './parseCountriesWideCsv';

/**
 * `centralized_merged_country_stats.csv` embeds former proxy + crime columns with `proxy_*` and `crime_*` prefixes.
 */

function val(row: CountryWideRow, key: string): string {
  return String(row[key] ?? '').trim();
}

/** Whether the merged row includes proxy population / birth fields. */
export function mergedRowHasProxy(row: CountryWideRow): boolean {
  return Boolean(val(row, 'proxy_white_native_population') || val(row, 'proxy_non_european_population'));
}

/**
 * Maps merged `proxy_*` columns into the shape expected by `wideRowToStatMetrics` (same as old proxy CSV).
 */
export function proxyFromMergedRow(row: CountryWideRow): CountryWideRow | null {
  if (!mergedRowHasProxy(row)) return null;
  return {
    country: val(row, 'country') || row.country || '',
    white_native_population: val(row, 'proxy_white_native_population'),
    white_native_population_metric: val(row, 'proxy_white_native_population_metric'),
    white_native_population_is_proxy: val(row, 'proxy_white_native_population_is_proxy'),
    non_european_population: val(row, 'proxy_non_european_population'),
    non_european_population_metric: val(row, 'proxy_non_european_population_metric'),
    non_european_population_is_proxy: val(row, 'proxy_non_european_population_is_proxy'),
    white_native_birth_rate: val(row, 'proxy_white_native_birth_rate'),
    immigrant_birth_rate: val(row, 'proxy_immigrant_birth_rate'),
    birth_metric: val(row, 'proxy_birth_metric'),
    birth_method: val(row, 'proxy_birth_method'),
    population_source_url: val(row, 'proxy_population_source_url'),
    population_data_year: val(row, 'proxy_population_data_year'),
    migrant_source_url: val(row, 'proxy_migrant_source_url'),
    migrant_data_year: val(row, 'proxy_migrant_data_year'),
    birth_source_url: val(row, 'proxy_birth_source_url'),
    birth_data_year: val(row, 'proxy_birth_data_year'),
    notes: val(row, 'proxy_notes'),
  };
}

/**
 * Maps merged `crime_*` columns into the shape expected by `CrimeMetricsSection` (legacy `petty_2000s_*` / `petty_latest_*` keys).
 */
export function crimeFromMergedRow(row: CountryWideRow): CountryWideRow | null {
  if (!val(row, 'crime_petty_baseline_value') && !val(row, 'crime_petty_latest_value')) {
    return null;
  }
  const out: CountryWideRow = {
    petty_2000s_value: val(row, 'crime_petty_baseline_value'),
    petty_2000s_year: val(row, 'crime_petty_baseline_year'),
    petty_2000s_unit: val(row, 'crime_petty_baseline_unit'),
    petty_2000s_definition: val(row, 'crime_petty_baseline_definition'),
    petty_2000s_source_label: val(row, 'crime_petty_baseline_source_label'),
    petty_2000s_source_url: val(row, 'crime_petty_baseline_source_url'),
    petty_2000s_method_note: val(row, 'crime_petty_baseline_method_note'),
    petty_latest_value: val(row, 'crime_petty_latest_value'),
    petty_latest_year: val(row, 'crime_petty_latest_year'),
    petty_latest_unit: val(row, 'crime_petty_latest_unit'),
    petty_latest_definition: val(row, 'crime_petty_latest_definition'),
    petty_latest_source_label: val(row, 'crime_petty_latest_source_label'),
    petty_latest_source_url: val(row, 'crime_petty_latest_source_url'),
    petty_latest_method_note: val(row, 'crime_petty_latest_method_note'),
    rape_2000s_value: val(row, 'crime_rape_baseline_value'),
    rape_2000s_year: val(row, 'crime_rape_baseline_year'),
    rape_2000s_unit: val(row, 'crime_rape_baseline_unit'),
    rape_2000s_definition: val(row, 'crime_rape_baseline_definition'),
    rape_2000s_source_label: val(row, 'crime_rape_baseline_source_label'),
    rape_2000s_source_url: val(row, 'crime_rape_baseline_source_url'),
    rape_2000s_method_note: val(row, 'crime_rape_baseline_method_note'),
    rape_latest_value: val(row, 'crime_rape_latest_value'),
    rape_latest_year: val(row, 'crime_rape_latest_year'),
    rape_latest_unit: val(row, 'crime_rape_latest_unit'),
    rape_latest_definition: val(row, 'crime_rape_latest_definition'),
    rape_latest_source_label: val(row, 'crime_rape_latest_source_label'),
    rape_latest_source_url: val(row, 'crime_rape_latest_source_url'),
    rape_latest_method_note: val(row, 'crime_rape_latest_method_note'),
    theft_2000s_value: val(row, 'crime_theft_baseline_value'),
    theft_2000s_year: val(row, 'crime_theft_baseline_year'),
    theft_2000s_unit: val(row, 'crime_theft_baseline_unit'),
    theft_2000s_definition: val(row, 'crime_theft_baseline_definition'),
    theft_2000s_source_label: val(row, 'crime_theft_baseline_source_label'),
    theft_2000s_source_url: val(row, 'crime_theft_baseline_source_url'),
    theft_2000s_method_note: val(row, 'crime_theft_baseline_method_note'),
    theft_latest_value: val(row, 'crime_theft_latest_value'),
    theft_latest_year: val(row, 'crime_theft_latest_year'),
    theft_latest_unit: val(row, 'crime_theft_latest_unit'),
    theft_latest_definition: val(row, 'crime_theft_latest_definition'),
    theft_latest_source_label: val(row, 'crime_theft_latest_source_label'),
    theft_latest_source_url: val(row, 'crime_theft_latest_source_url'),
    theft_latest_method_note: val(row, 'crime_theft_latest_method_note'),
    sexual_2000s_value: val(row, 'crime_sexual_baseline_value'),
    sexual_2000s_year: val(row, 'crime_sexual_baseline_year'),
    sexual_2000s_unit: val(row, 'crime_sexual_baseline_unit'),
    sexual_2000s_definition: val(row, 'crime_sexual_baseline_definition'),
    sexual_2000s_source_label: val(row, 'crime_sexual_baseline_source_label'),
    sexual_2000s_source_url: val(row, 'crime_sexual_baseline_source_url'),
    sexual_2000s_method_note: val(row, 'crime_sexual_baseline_method_note'),
    sexual_latest_value: val(row, 'crime_sexual_latest_value'),
    sexual_latest_year: val(row, 'crime_sexual_latest_year'),
    sexual_latest_unit: val(row, 'crime_sexual_latest_unit'),
    sexual_latest_definition: val(row, 'crime_sexual_latest_definition'),
    sexual_latest_source_label: val(row, 'crime_sexual_latest_source_label'),
    sexual_latest_source_url: val(row, 'crime_sexual_latest_source_url'),
    sexual_latest_method_note: val(row, 'crime_sexual_latest_method_note'),
    crime_baseline_general_note: val(row, 'crime_baseline_general_note'),
    crime_baseline_target_requested_year: val(row, 'crime_baseline_target_requested_year'),
  };
  return out;
}

export type CrimeAuditRow = {
  country: string;
  metric: string;
  oldYear: string;
  newYear: string;
  replaced: string;
};

/** Parse `crime_baseline_replacement_audit.csv` and return rows for a country (name match). */
export function filterCrimeAuditForCountry(
  rows: CountryWideRow[],
  countryName: string,
): CrimeAuditRow[] {
  const target = countryName.trim().toLowerCase();
  const out: CrimeAuditRow[] = [];
  for (const r of rows) {
    const c = val(r, 'country');
    if (c.toLowerCase() !== target) continue;
    out.push({
      country: c,
      metric: val(r, 'metric'),
      oldYear: val(r, 'old_year'),
      newYear: val(r, 'new_year'),
      replaced: val(r, 'replaced'),
    });
  }
  return out;
}
