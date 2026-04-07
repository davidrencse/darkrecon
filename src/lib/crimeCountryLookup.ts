import type { CountryWideRow } from './parseCountriesWideCsv';

function normCountry(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Flag label → exact `country` cell in `countries_crime_2000s_latest.csv`. */
const FLAG_LABEL_TO_CRIME_COUNTRY: Record<string, string> = {
  'Bosnia Herzegovina': 'Bosnia and Herzegovina',
  'United States of America': 'United States',
};

/**
 * Match a flag’s display label to a row in the crime CSV (`country` column).
 */
export function findCrimeRow(rows: CountryWideRow[], flagLabel: string): CountryWideRow | null {
  const target =
    FLAG_LABEL_TO_CRIME_COUNTRY[flagLabel.trim()] ?? flagLabel.trim();
  const byNorm = new Map(rows.map((r) => [normCountry(r.country ?? ''), r]));
  return byNorm.get(normCountry(target)) ?? null;
}
