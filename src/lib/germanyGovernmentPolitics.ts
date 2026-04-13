import { parseCsvRows } from './csv';
import { GERMANY_LABOR_STATISTICS_FILE_GROUP_COUNT } from './germanyLaborStatistics';

export type GermanyGovernmentPoliticsRow = {
  section: string;
  subsection: string;
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

const SUBSECTION_ORDER = ['Overview', 'Parliament', 'Policies', 'Polarization', 'Citizenship'] as const;

/** Newer CSV layout (moved under economic stats). */
export const ECONOMIC_STATS_SECTION = 'Economic';
export const LABOR_INCOME_SUBSECTION = 'Labor & Income Distribution';

/** Original CSV layout — many `/data/` copies still use this; we match both. */
export const LEGACY_LABOR_GOVERNMENT_SECTION = 'Government';
export const LEGACY_LABOR_SUBSECTION = 'Labor law';

export function isLaborIncomeDistributionRow(r: GermanyGovernmentPoliticsRow): boolean {
  const sec = r.section.trim().toLowerCase();
  const sub = r.subsection.trim();
  if (sec === ECONOMIC_STATS_SECTION.toLowerCase() && sub === LABOR_INCOME_SUBSECTION) return true;
  if (sec === LEGACY_LABOR_GOVERNMENT_SECTION.toLowerCase() && sub.toLowerCase() === LEGACY_LABOR_SUBSECTION.toLowerCase()) {
    return true;
  }
  return false;
}

export const LABOR_INCOME_METRIC_ORDER = [
  'employment rates by nationality',
  'welfare dependency by nationality/status',
  'social assistance recipients by citizenship',
  'benefit fraud cases',
  'illegal employment cases',
  'minimum wage enforcement cases',
  'work-permit grants',
  'Blue Card approvals',
  'student visa conversions to work permits',
] as const;

/**
 * Collapsible section count: government-politics labor rows (clustered) + germany_labor_statistics.csv groups.
 */
export const GERMANY_LABOR_INCOME_GROUP_COUNT =
  LABOR_INCOME_METRIC_ORDER.length + GERMANY_LABOR_STATISTICS_FILE_GROUP_COUNT;

export const GOVERNMENT_METRIC_ORDER: Record<(typeof SUBSECTION_ORDER)[number], string[]> = {
  Overview: [
    'head of government',
    'head of government political party',
    'head of government political ideology',
    'governing coalition',
    'number of coalition parties',
  ],
  Parliament: [
    'total seats',
    'seats by party',
    'majority threshold',
    'coalition seat total',
    'opposition seat total',
    'number of parties represented',
    'party fragmentation index',
    'trust in parliament',
    'trust in government',
    'trust in political parties',
    'trust in courts',
    'trust in police',
    'satisfaction with democracy',
    'perceived corruption',
  ],
  Policies: [
    'immigration law changes',
    'asylum law changes',
    'citizenship law changes',
    'criminal justice reforms',
    'education reforms',
    'family policy reforms',
    'free speech / assembly restrictions',
    'constitutional court rulings',
    'emergency powers usage',
  ],
  Polarization: [
    'far-right vote share',
    'far-left vote share',
    'center-right vote share',
    'center-left vote share',
    'anti-establishment party vote share',
    'number of effective parties',
    'coalition instability',
    'vote swing from previous election',
  ],
  Citizenship: [
    'naturalizations per year',
    'naturalizations by prior nationality',
    'average years of residence before naturalization',
    'dual-citizenship cases',
    'denaturalization / loss of citizenship counts where applicable',
    'applications for naturalization',
    'approval / rejection rates',
  ],
};

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

export function parseGermanyGovernmentPoliticsCsv(raw: string): GermanyGovernmentPoliticsRow[] {
  const rows = parseCsvRows(raw.replace(/^\uFEFF/, '').trim());
  if (rows.length < 2) return [];
  const idx = headerIndexMap(rows[0]!);
  const out: GermanyGovernmentPoliticsRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r]!;
    const section = cell(cells, idx, 'section');
    if (!section) continue;
    out.push({
      section,
      subsection: cell(cells, idx, 'subsection'),
      metric: cell(cells, idx, 'metric'),
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

export function governmentRowsForGermany(rows: GermanyGovernmentPoliticsRow[]): GermanyGovernmentPoliticsRow[] {
  return rows.filter((r) => r.section.trim().toLowerCase() === 'government');
}

function laborIncomeMetricOrderIndex(metric: string): number {
  const m = metric.trim();
  const i = (LABOR_INCOME_METRIC_ORDER as readonly string[]).indexOf(m);
  return i === -1 ? 999 + m.localeCompare('') : i;
}

/** Labor & Income Distribution UI: same metrics, whether CSV uses legacy Government/Labor law or Economic/Labor & Income Distribution. */
export function laborIncomeDistributionRows(rows: GermanyGovernmentPoliticsRow[]): GermanyGovernmentPoliticsRow[] {
  const filtered = rows.filter(isLaborIncomeDistributionRow);
  return filtered.sort((a, b) => {
    const d = laborIncomeMetricOrderIndex(a.metric) - laborIncomeMetricOrderIndex(b.metric);
    if (d !== 0) return d;
    const bl = (a.breakdown || a.submetric || '').localeCompare(b.breakdown || b.submetric || '', undefined, {
      sensitivity: 'base',
    });
    if (bl !== 0) return bl;
    return a.value.localeCompare(b.value);
  });
}

function metricOrderIndex(subsection: string, metric: string): number {
  const sub = subsection as (typeof SUBSECTION_ORDER)[number];
  const order = GOVERNMENT_METRIC_ORDER[sub] ?? [];
  const i = order.indexOf(metric.trim());
  return i === -1 ? 999 + metric.localeCompare('') : i;
}

export function rowsForSubsection(
  rows: GermanyGovernmentPoliticsRow[],
  subsection: (typeof SUBSECTION_ORDER)[number],
): GermanyGovernmentPoliticsRow[] {
  const filtered = rows.filter((r) => r.subsection.trim() === subsection);
  return filtered.sort((a, b) => {
      const d = metricOrderIndex(subsection, a.metric) - metricOrderIndex(subsection, b.metric);
      if (d !== 0) return d;
      const bl = (a.breakdown || a.submetric || '').localeCompare(b.breakdown || b.submetric || '', undefined, {
        sensitivity: 'base',
      });
      if (bl !== 0) return bl;
      return a.value.localeCompare(b.value);
    });
}

/** Consecutive rows with the same metric become one visual group (e.g. seats by party, prior nationality). */
export function clusterRowsByMetric(sorted: GermanyGovernmentPoliticsRow[]): GermanyGovernmentPoliticsRow[][] {
  const groups: GermanyGovernmentPoliticsRow[][] = [];
  for (const row of sorted) {
    const last = groups[groups.length - 1];
    if (last && last[0]!.metric === row.metric) last.push(row);
    else groups.push([row]);
  }
  return groups;
}

export function countGovernmentSectionStats(rows: GermanyGovernmentPoliticsRow[]): number {
  const g = governmentRowsForGermany(rows);
  let n = 4; // overview: head + coalition + party count + chart
  for (const sub of SUBSECTION_ORDER) {
    if (sub === 'Overview') continue;
    n += clusterRowsByMetric(rowsForSubsection(g, sub)).length;
  }
  return n;
}
