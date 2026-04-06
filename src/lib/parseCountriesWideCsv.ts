import { parseCsvRows } from './csv';

export type CountryWideRow = Record<string, string>;

export function parseCountriesWideCsv(raw: string): CountryWideRow[] {
  const rows = parseCsvRows(raw.trim());
  if (rows.length < 2) return [];

  const headers = rows[0]!.map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const o: CountryWideRow = {};
    headers.forEach((h, i) => {
      o[h] = (cells[i] ?? '').trim();
    });
    return o;
  });
}

export function indexCountriesByIso3(rows: CountryWideRow[]): Map<string, CountryWideRow> {
  const m = new Map<string, CountryWideRow>();
  for (const r of rows) {
    const iso = r.iso3?.trim().toUpperCase();
    if (iso) m.set(iso, r);
  }
  return m;
}

/** For `countries_proxy_demographics_births.csv` rows keyed by `country_code`. */
export function indexCountriesByCountryCode(rows: CountryWideRow[]): Map<string, CountryWideRow> {
  const m = new Map<string, CountryWideRow>();
  for (const r of rows) {
    const code = r.country_code?.trim().toUpperCase();
    if (code) m.set(code, r);
  }
  return m;
}
