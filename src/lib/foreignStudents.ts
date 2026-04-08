import type { CountryStatMetric } from '../types/countryStats';
import type { CountryWideRow } from './parseCountriesWideCsv';
import { parseCsvRows } from './csv';

type Origin = { country: string; count: number | null; sharePct: number | null };
type AidPayload = { totalAid: number; origins: { country: string; aidCount: number; sharePct: number }[] };

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

const COUNTRY_ALIASES: Record<string, string> = {
  'bosnia herzegovina': 'bosnia and herzegovina',
  'united states': 'united states of america',
  usa: 'united states of america',
};

function toNumOrNull(raw: string): number | null {
  const t = raw.trim().replace(/,/g, '');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function tile(metric: string, value: string, ref: string, geo: string, url: string, notes = ''): CountryStatMetric {
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

export function findForeignStudentsRow(rows: CountryWideRow[], countryName: string): CountryWideRow | null {
  const targetNorm = norm(countryName);
  const target = COUNTRY_ALIASES[targetNorm] ?? targetNorm;
  for (const r of rows) {
    const c = norm(String(r.country ?? r.Country ?? ''));
    if (c === target) return r;
  }
  return null;
}

export function metricsFromForeignStudentsRow(row: CountryWideRow): CountryStatMetric[] {
  const geo = String(row.country ?? '').trim();
  const ref = String(row.population_year ?? '').trim();
  const total = String(row.foreign_student_population ?? '').trim() || 'N/A';
  const scope = String(row.population_scope ?? '').trim();
  const note = String(row.note ?? '').trim();
  const popUrl = String(row.source_population_url ?? '').trim();
  const breakdownUrl = String(row.source_breakdown_url ?? '').trim();
  const sourceUrl = [popUrl, breakdownUrl].filter(Boolean).join(' | ');

  const origins: Origin[] = [1, 2, 3]
    .map((i) => ({
      country: String(row[`top_origin_${i}_country`] ?? '').trim(),
      count: toNumOrNull(String(row[`top_origin_${i}_count`] ?? '')),
      sharePct: toNumOrNull(String(row[`top_origin_${i}_share_pct`] ?? '')),
    }))
    .filter((o) => o.country);

  const breakdownPayload = JSON.stringify(origins);
  const detailBits = [scope, String(row.origin_breakdown_scope ?? '').trim(), String(row.origin_breakdown_quality ?? '').trim()]
    .filter(Boolean)
    .join(' · ');
  const notes = [detailBits, note].filter(Boolean).join(' | ');

  return [
    tile('Foreign students (total)', total, ref, geo, popUrl, notes),
    tile('Foreign students by origin (pie)', breakdownPayload || 'N/A', ref, geo, sourceUrl, notes),
  ];
}

export function metricsFromGermanyForeignStudentsCsv(raw: string): CountryStatMetric[] {
  const rows = parseCsvRows(raw.trim());
  if (rows.length < 2) return [];

  const header = rows[0]!.map((h) => h.replace(/^\uFEFF/, '').trim().toLowerCase());
  const originIdx = header.indexOf('country of origin');
  const totalIdx = header.indexOf('total students');
  const semesterIdx = header.indexOf('semester');
  if (originIdx < 0 || totalIdx < 0) return [];

  const dataRows = rows.slice(1);
  const semester = (dataRows.find((r) => (r[semesterIdx] ?? '').trim())?.[semesterIdx] ?? '').trim();
  const aidIdx = header.indexOf('how many on student aid');

  let totalCount: number | null = null;
  let totalAid: number | null = null;
  const origins: Origin[] = [];
  const aidOrigins: { country: string; aidCount: number }[] = [];
  for (const r of dataRows) {
    const origin = (r[originIdx] ?? '').trim();
    const total = toNumOrNull(String(r[totalIdx] ?? ''));
    const aid = aidIdx >= 0 ? toNumOrNull(String(r[aidIdx] ?? '')) : null;
    if (!origin) continue;
    if (origin.toUpperCase() === '**TOTAL**') {
      totalCount = total;
      if (aid != null) totalAid = aid;
      continue;
    }
    origins.push({ country: origin, count: total, sharePct: null });
    if (origin.toLowerCase() !== 'all other countries' && aid != null && aid > 0) {
      aidOrigins.push({ country: origin, aidCount: aid });
    }
  }

  const ranked = origins
    .filter((o) => o.country.toLowerCase() !== 'all other countries')
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 6);
  const denominator = totalCount ?? ranked.reduce((s, o) => s + (o.count ?? 0), 0);
  const withShares: Origin[] = ranked.map((o) => ({
    ...o,
    sharePct: denominator > 0 && o.count != null ? (o.count / denominator) * 100 : null,
  }));

  const notes =
    'Germany-specific source: Assets/Data/Europe/Germany/foreign_students.csv (WS 2024/25).';
  const payload = JSON.stringify(withShares);
  const aidDenominator = totalAid ?? aidOrigins.reduce((s, o) => s + o.aidCount, 0);
  const aidPayload: AidPayload = {
    totalAid: totalAid ?? 0,
    origins: aidOrigins
      .sort((a, b) => b.aidCount - a.aidCount)
      .slice(0, 10)
      .map((o) => ({
        country: o.country,
        aidCount: o.aidCount,
        sharePct: aidDenominator > 0 ? (o.aidCount / aidDenominator) * 100 : 0,
      })),
  };
  return [
    tile(
      'Foreign students (total)',
      totalCount != null ? totalCount.toLocaleString('en-US') : 'N/A',
      semester || 'WS 2024/25',
      'Germany',
      '',
      notes,
    ),
    tile(
      'Foreign students by origin (pie)',
      payload || 'N/A',
      semester || 'WS 2024/25',
      'Germany',
      '',
      notes,
    ),
    tile(
      'How Many on Student Aid',
      JSON.stringify(aidPayload),
      semester || 'WS 2024/25',
      'Germany',
      '',
      notes,
    ),
  ];
}

export function fallbackGermanyForeignStudentsMetrics(): CountryStatMetric[] {
  const origins: Origin[] = [
    { country: 'India', count: 58833, sharePct: (58833 / 402083) * 100 },
    { country: 'China', count: 38580, sharePct: (38580 / 402083) * 100 },
    { country: 'Turkey', count: 20900, sharePct: (20900 / 402083) * 100 },
    { country: 'Iran', count: 17248, sharePct: (17248 / 402083) * 100 },
    { country: 'Austria', count: 15732, sharePct: (15732 / 402083) * 100 },
    { country: 'Syria', count: 13800, sharePct: (13800 / 402083) * 100 },
  ];
  const notes =
    'Guaranteed fallback from Assets/Data/Europe/Germany/foreign_students.csv (WS 2024/25).';
  return [
    tile('Foreign students (total)', '402,083', 'WS 2024/25', 'Germany', '', notes),
    tile(
      'Foreign students by origin (pie)',
      JSON.stringify(origins),
      'WS 2024/25',
      'Germany',
      '',
      notes,
    ),
    tile(
      'How Many on Student Aid',
      JSON.stringify({
        totalAid: 20000,
        origins: [
          { country: 'India', aidCount: 2920, sharePct: (2920 / 20000) * 100 },
          { country: 'China', aidCount: 1920, sharePct: (1920 / 20000) * 100 },
          { country: 'Turkey', aidCount: 1040, sharePct: (1040 / 20000) * 100 },
          { country: 'Iran', aidCount: 860, sharePct: (860 / 20000) * 100 },
          { country: 'Austria', aidCount: 780, sharePct: (780 / 20000) * 100 },
          { country: 'Syria', aidCount: 690, sharePct: (690 / 20000) * 100 },
          { country: 'Russia', aidCount: 530, sharePct: (530 / 20000) * 100 },
          { country: 'Italy', aidCount: 510, sharePct: (510 / 20000) * 100 },
          { country: 'Ukraine', aidCount: 500, sharePct: (500 / 20000) * 100 },
          { country: 'Pakistan', aidCount: 490, sharePct: (490 / 20000) * 100 },
        ],
      }),
      'WS 2024/25',
      'Germany',
      '',
      notes,
    ),
  ];
}

