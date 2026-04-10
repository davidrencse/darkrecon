import type { CountryStatMetric } from '../types/countryStats';
import { parseCsvRows } from './csv';

type IndicatorRow = {
  country: string;
  metric: string;
  value: string;
  unit: string;
  reference_year: string;
  source: string;
  source_url: string;
  method_note: string;
};

function parseGermanyBirthHealthCsv(raw: string): IndicatorRow[] {
  const rows = parseCsvRows(raw.trim());
  if (rows.length < 2) return [];
  const headers = rows[0]!.map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => {
      o[h] = (cells[i] ?? '').trim();
    });
    return o as unknown as IndicatorRow;
  });
}

function fmtInt(s: string): string {
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

function fmtDecimal(s: string, digits = 2): string {
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(n);
}

function normalizeSourceUrls(urlField: string): string {
  return urlField
    .split(';')
    .map((u) => u.trim())
    .filter(Boolean)
    .join(' | ');
}

function rowToTile(
  metric: string,
  value: string,
  row: IndicatorRow,
  notesExtra = '',
): CountryStatMetric {
  const notes = [row.method_note, notesExtra].filter(Boolean).join(' ');
  return {
    metric,
    value,
    reference_period: row.reference_year,
    geography_used: row.country || 'Germany',
    source_name: row.source,
    source_url: normalizeSourceUrls(row.source_url),
    source_publication_or_access_date: row.reference_year,
    notes,
  };
}

function formatValueByUnit(value: string, unit: string): string {
  switch (unit) {
    case 'live_births':
      return `${fmtInt(value)} live births`;
    case 'children_per_woman':
      return `${fmtDecimal(value, 2)} (TFR)`;
    case 'deaths_per_1000_live_births':
      return `${fmtDecimal(value, 1)} per 1,000 live births`;
    case 'percent':
      return `${fmtDecimal(value, 1)}%`;
    case 'abortions_per_1000_women_15_49':
      return `${fmtDecimal(value, 1)} per 1,000 women aged 15–49`;
    case 'births_per_1000_women_15_19':
      return `${fmtDecimal(value, 3)} per 1,000 women aged 15–19`;
    case 'years':
      return `${fmtDecimal(value, 1)} years`;
    default:
      return value;
  }
}

/** Dashboard metric names must match `METRIC_ORDER` / birth section for DEU. */
export function metricsFromGermanyBirthHealthCsv(raw: string): CountryStatMetric[] {
  const parsed = parseGermanyBirthHealthCsv(raw);
  const byKey = new Map(parsed.map((r) => [r.metric, r]));

  const out: CountryStatMetric[] = [];

  const foreignBorn = byKey.get('births_to_foreign_born_mothers');
  if (foreignBorn) {
    out.push(
      rowToTile(
        'Births to foreign-born mothers',
        formatValueByUnit(foreignBorn.value, foreignBorn.unit),
        foreignBorn,
      ),
    );
  }

  const infant = byKey.get('infant_mortality_rate');
  if (infant) {
    out.push(rowToTile('Infant mortality rate', formatValueByUnit(infant.value, infant.unit), infant));
  }

  const child = byKey.get('child_mortality_rate_under_5');
  if (child) {
    out.push(
      rowToTile(
        'Child mortality rate',
        `${formatValueByUnit(child.value, child.unit)} (under-5)`,
        child,
      ),
    );
  }

  const contra = byKey.get('contraceptive_use');
  if (contra) {
    out.push(rowToTile('Contraceptive use', formatValueByUnit(contra.value, contra.unit), contra));
  }

  const abort = byKey.get('abortion_rate');
  if (abort) {
    out.push(rowToTile('Abortion rate', formatValueByUnit(abort.value, abort.unit), abort));
  }

  const teen = byKey.get('teen_birth_rate');
  if (teen) {
    out.push(rowToTile('Teen birth rate', formatValueByUnit(teen.value, teen.unit), teen));
  }

  const meanAge = byKey.get('mean_age_of_mothers_at_childbirth');
  if (meanAge) {
    out.push(
      rowToTile('Mean age of mothers at childbirth', formatValueByUnit(meanAge.value, meanAge.unit), meanAge),
    );
  }

  return out;
}
