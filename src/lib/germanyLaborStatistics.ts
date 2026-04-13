import { parseCsvRows } from './csv';
import type { GermanyGovernmentPoliticsRow } from './germanyGovernmentPolitics';
import { clusterRowsByMetric } from './germanyGovernmentPolitics';

export type GermanyLaborCsvRow = {
  country: string;
  metric: string;
  submetric: string;
  breakdown: string;
  value: string;
  unit: string;
  referenceYear: string;
  sourceName: string;
  sourceUrl: string;
  notes: string;
};

/** Display order for Labor & Income subsection (matches germany_labor_statistics.csv metric names). */
export const GERMANY_LABOR_FILE_METRIC_ORDER = [
  'Youth unemployment rate',
  'Long-term unemployment rate',
  'Labour force participation rate',
  'Minimum wage',
  'Average annual working hours per worker',
] as const;

/** Cluster groups from germany_labor_statistics.csv (5 metric groups; LFP is one multi-row table). */
export const GERMANY_LABOR_STATISTICS_FILE_GROUP_COUNT = GERMANY_LABOR_FILE_METRIC_ORDER.length;

function headerIndexMap(headerRow: string[]): Map<string, number> {
  const m = new Map<string, number>();
  headerRow.forEach((h, i) => {
    const k = h.replace(/\uFEFF/g, '').trim().toLowerCase();
    if (k) m.set(k, i);
  });
  return m;
}

function cell(row: string[], idx: Map<string, number>, ...names: string[]): string {
  for (const n of names) {
    const i = idx.get(n.toLowerCase());
    if (i !== undefined) return (row[i] ?? '').trim();
  }
  return '';
}

export function parseGermanyLaborStatisticsCsv(raw: string): GermanyLaborCsvRow[] {
  const rows = parseCsvRows(raw.replace(/^\uFEFF/, '').trim());
  if (rows.length < 2) return [];
  const idx = headerIndexMap(rows[0]!);
  const out: GermanyLaborCsvRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r]!;
    const country = cell(cells, idx, 'country');
    if (country && country.toLowerCase() !== 'germany') continue;
    const metric = cell(cells, idx, 'metric');
    if (!metric) continue;
    out.push({
      country: country || 'Germany',
      metric,
      submetric: cell(cells, idx, 'submetric'),
      breakdown: cell(cells, idx, 'breakdown'),
      value: cell(cells, idx, 'value'),
      unit: cell(cells, idx, 'unit'),
      referenceYear: cell(cells, idx, 'reference year', 'reference_year'),
      sourceName: cell(cells, idx, 'source name', 'source_name'),
      sourceUrl: cell(cells, idx, 'source url', 'source_url'),
      notes: cell(cells, idx, 'notes'),
    });
  }
  return out;
}

function metricOrderIndex(metric: string): number {
  const m = metric.trim();
  const i = (GERMANY_LABOR_FILE_METRIC_ORDER as readonly string[]).indexOf(m);
  return i === -1 ? 999 + m.localeCompare('') : i;
}

/** Map CSV rows to the shared government-politics row shape for GovStatCard / GovMetricTable. */
export function laborStatisticsToPoliticsRows(rows: GermanyLaborCsvRow[]): GermanyGovernmentPoliticsRow[] {
  const sorted = [...rows].sort((a, b) => {
    const d = metricOrderIndex(a.metric) - metricOrderIndex(b.metric);
    if (d !== 0) return d;
    const s = (a.submetric || '').localeCompare(b.submetric || '', undefined, { sensitivity: 'base' });
    if (s !== 0) return s;
    return (a.breakdown || '').localeCompare(b.breakdown || '', undefined, { sensitivity: 'base' });
  });
  return sorted.map(
    (r): GermanyGovernmentPoliticsRow => ({
      section: 'Labor statistics',
      subsection: '',
      metric: r.metric,
      submetric: r.submetric,
      breakdown: r.breakdown,
      value: r.value,
      unit: r.unit,
      referenceYear: r.referenceYear,
      sourceName: r.sourceName,
      sourceUrl: r.sourceUrl,
      notes: r.notes,
    }),
  );
}

export function laborStatisticsClusteredGroups(rows: GermanyLaborCsvRow[]): GermanyGovernmentPoliticsRow[][] {
  const politics = laborStatisticsToPoliticsRows(rows);
  return clusterRowsByMetric(politics);
}
