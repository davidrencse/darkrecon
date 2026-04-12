import { parseCsvRows } from './csv';

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

const SUBSECTION_ORDER = ['Overview', 'Parliament', 'Policies', 'Polarization', 'Citizenship', 'Labor law'] as const;

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
  'Labor law': [
    'employment rates by nationality',
    'welfare dependency by nationality/status',
    'social assistance recipients by citizenship',
    'benefit fraud cases',
    'illegal employment cases',
    'minimum wage enforcement cases',
    'work-permit grants',
    'Blue Card approvals',
    'student visa conversions to work permits',
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
