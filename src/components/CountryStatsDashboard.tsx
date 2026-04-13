import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { FlagEntry } from '../types/flag';
import type { CountryStatMetric } from '../types/countryStats';
import { collectSourceUrlsFromWideRow, wideRowToStatMetrics } from '../lib/countryStatsMetrics';
import { findCorruptionLostRow, insertLostToCorruptionMetric } from '../lib/corruptionLost';
import { findExpenditureRow, metricsFromExpenditureRow } from '../lib/expenditures';
import { findMacroIndicatorsRow, metricsFromMacroIndicatorsRow } from '../lib/macroIndicators';
import {
  fallbackGermanyForeignStudentsMetrics,
  findForeignStudentsRow,
  metricsFromForeignStudentsRow,
  metricsFromGermanyForeignStudentsCsv,
} from '../lib/foreignStudents';
import { metricsFromGermanyBirthHealthCsv } from '../lib/germanyBirthHealthIndicators';
import { crimeFromMergedRow, proxyFromMergedRow } from '../lib/mergedCountryStats';
import type { CountryWideRow } from '../lib/parseCountriesWideCsv';
import { indexCountriesByIso3, parseCountriesWideCsv } from '../lib/parseCountriesWideCsv';
import { collectCrimeSourceUrls, CrimeMetricsSection } from './CrimeMetricsSection';
import { CollapsibleFlagSection } from './CollapsibleFlagSection';
import { GermanyImmigrationSection } from './GermanyImmigrationSection';
import { GermanyGovernmentSection } from './GermanyGovernmentSection';
import { GermanyMigrantCrimeSection } from './GermanyMigrantCrimeSection';
import {
  GermanyNewsRail,
  useBundledGermanyNews,
  type GermanyNewsRailSection,
} from './GermanyNewsSidebar';
import { bucketGermanyNewsItems } from '../lib/germanyNews';
import { GERMANY_LABOR_INCOME_GROUP_COUNT } from '../lib/germanyGovernmentPolitics';
import { GermanyLaborIncomeSection } from './GermanyLaborIncomeSection';
import { GermanyPopulationPyramid } from './GermanyPopulationPyramid';
import germanyForeignStudentsRaw from '../../Assets/Data/Europe/Germany/foreign_students.csv?raw';
import germanyBirthHealthRaw from '../../Assets/Data/Europe/Germany/germany_birth_health_indicators.csv?raw';
import fallbackForeignStudentsRaw from '../../Assets/Data/foreign_student_population_screenshot_countries.csv?raw';

const MERGED_CSV_URL = '/data/centralized_merged_country_stats.csv';
const EXPENDITURES_CSV_URL = '/data/expenditures.csv';
const FOREIGN_STUDENTS_CSV_URL = '/data/foreign_student_population_screenshot_countries.csv';
const FOREIGN_STUDENTS_GERMANY_CSV_URL = '/data/germany_foreign_students.csv';
const GERMANY_BIRTH_HEALTH_CSV_URL = '/data/germany_birth_health_indicators.csv';
const CORRUPTION_LOST_CSV_URL = '/data/corruption_money_lost_modeled_estimates.csv';
const MACRO_INDICATORS_CSV_URL = '/data/countries_latest_inflation_unemployment_interest_with_real_median_wage.csv';

const METRIC_ORDER = [
  'GDP',
  'GDP per capita',
  'Inflation',
  'Unemployment',
  'Interest',
  'Real Median Wage',
  'Total government expenditure',
  'Social protection expenditure',
  'Health expenditure',
  'Education expenditure',
  'Defence expenditure',
  'Economic affairs expenditure',
  'Immigration welfare spending',
  'Lost to Corruption',
  'Expenditure breakdown (pie)',
  'White (native) population',
  'Foreign Population',
  'Christian population',
  'Muslim population',
  'Jewish population',
  'Foreign students (total)',
  'Foreign students by origin (pie)',
  'How Many on Student Aid',
  'Immigrants',
  'Total birth rate',
  'White (native) birth rate',
  'Immigrant birth rate',
  'Migrant background M:F ratio',
  'Military-aged males (migrant background)',
  'Births to foreign-born mothers',
  'Infant mortality rate',
  'Child mortality rate',
  'Contraceptive use',
  'Abortion rate',
  'Teen birth rate',
  'Mean age of mothers at childbirth',
] as const;

function extractLeadingPercent(value: string): number | null {
  const m = value.trim().match(/^([\d.]+)\s*%/);
  if (!m) return null;
  const n = parseFloat(m[1]!);
  return Number.isFinite(n) ? n : null;
}

function isUnavailable(value: string): boolean {
  const v = value.trim();
  return v === '' || v.toUpperCase() === 'N/A';
}

function PercentRing({ percent }: { percent: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, percent));
  const dash = (p / 100) * c;
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 text-[var(--uk-accent)]" aria-hidden>
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        className="text-neutral-800"
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 50 50)"
        className="text-[var(--uk-accent)]"
      />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        className="fill-neutral-200 font-mono text-[15px] font-semibold"
      >
        {percent.toFixed(1)}%
      </text>
    </svg>
  );
}

function SourceLinks({ url, className }: { url: string; className: string }) {
  const urls = url
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
  if (urls.length === 0) return null;
  if (urls.length === 1) {
    return (
      <a href={urls[0]} target="_blank" rel="noopener noreferrer" className={className}>
        Source ↗
      </a>
    );
  }
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {urls.map((u, i) => (
        <li key={u}>
          <a href={u} target="_blank" rel="noopener noreferrer" className={className}>
            Source {i + 1} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

function MetaLine({ row }: { row: CountryStatMetric }) {
  const parts = [row.reference_period, row.geography_used].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className="mt-3 font-mono text-[10px] leading-relaxed text-neutral-500">
      {parts.join(' · ')}
    </p>
  );
}

function NoteBlock({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <details className="mt-3 border-t border-neutral-800/80 pt-2">
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-neutral-600 hover:text-neutral-400">
        Note
      </summary>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-neutral-500">{text}</p>
    </details>
  );
}

function MetricTile({
  row,
  largeValue,
  accent,
  extra,
}: {
  row: CountryStatMetric;
  largeValue?: boolean;
  accent?: boolean;
  extra?: ReactNode;
}) {
  const na = isUnavailable(row.value);
  return (
    <article
      className={
        accent
          ? 'flex min-h-[148px] flex-col border border-[var(--uk-accent-border)] bg-[var(--uk-accent-surface)] p-4 sm:p-5'
          : 'flex min-h-[148px] flex-col border border-neutral-800 bg-[#121212] p-4 sm:p-5'
      }
    >
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
        {row.metric}
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={
            largeValue
              ? `min-w-0 flex-1 font-mono text-2xl font-semibold leading-none tracking-tight sm:text-3xl lg:text-4xl ${na ? 'text-neutral-600' : 'text-neutral-100'}`
              : `min-w-0 flex-1 font-mono text-lg font-medium leading-snug sm:text-xl ${na ? 'text-neutral-600' : 'text-neutral-100'}`
          }
        >
          {na ? 'N/A' : row.value}
        </p>
        {extra ? <div className="shrink-0">{extra}</div> : null}
      </div>
      <MetaLine row={row} />
      {row.source_url ? (
        <div className="mt-2">
          <SourceLinks
            url={row.source_url}
            className="inline-flex w-fit items-center gap-1 font-mono text-[10px] text-[var(--uk-accent)] hover:text-neutral-200"
          />
        </div>
      ) : null}
      <NoteBlock text={row.notes} />
    </article>
  );
}

function ExpenditurePieTile({ row }: { row: CountryStatMetric }) {
  let slices: { label: string; value: number }[] = [];
  try {
    if (row.value.trim() && row.value.trim() !== 'N/A') {
      const parsed = JSON.parse(row.value) as { label: string; value: number }[];
      if (Array.isArray(parsed)) slices = parsed.filter((s) => Number.isFinite(s.value) && s.value > 0);
    }
  } catch {
    slices = [];
  }
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const palette = ['#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040'];
  let acc = 0;
  const stops = slices.map((s, i) => {
    const start = total > 0 ? (acc / total) * 100 : 0;
    acc += s.value;
    const end = total > 0 ? (acc / total) * 100 : 0;
    return `${palette[i % palette.length]} ${start}% ${end}%`;
  });
  const bg = stops.length > 0 ? `conic-gradient(${stops.join(', ')})` : 'none';
  return (
    <article className="border border-neutral-800 bg-[#121212] p-4 sm:p-5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
        {row.metric}
      </p>
      {slices.length > 0 ? (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-28 w-28 rounded-full border border-neutral-700" style={{ background: bg }} />
          <ul className="space-y-1">
            {slices.map((s, i) => (
              <li key={s.label} className="flex items-center gap-2 font-mono text-[11px] text-neutral-300">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: palette[i % palette.length] }} />
                <span>{s.label}</span>
                <span className="text-neutral-500">{s.value.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 font-mono text-sm text-neutral-500">No percentage split available.</p>
      )}
      <MetaLine row={row} />
      <NoteBlock text={row.notes} />
    </article>
  );
}

function ForeignStudentsOriginTile({ row, compact }: { row: CountryStatMetric; compact?: boolean }) {
  let origins: { country: string; count: number | null; sharePct: number | null }[] = [];
  try {
    const parsed = JSON.parse(row.value) as { country: string; count: number | null; sharePct: number | null }[];
    if (Array.isArray(parsed)) origins = parsed.filter((o) => o.country);
  } catch {
    origins = [];
  }
  const palette = ['#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626'];
  const pieValues = origins.map((o) => (o.count && o.count > 0 ? o.count : (o.sharePct ?? 0)));
  const total = pieValues.reduce((a, b) => a + b, 0);
  let acc = 0;
  const stops = pieValues.map((v, i) => {
    const start = total > 0 ? (acc / total) * 100 : 0;
    acc += v;
    const end = total > 0 ? (acc / total) * 100 : 0;
    return `${palette[i % palette.length]} ${start}% ${end}%`;
  });
  const bg = stops.length > 0 ? `conic-gradient(${stops.join(', ')})` : 'none';

  if (compact) {
    return (
      <article className="flex min-h-[148px] flex-col border border-neutral-800 bg-[#121212] p-4 sm:p-5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">{row.metric}</p>
        {origins.length > 0 ? (
          <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
            <div
              className="mx-auto h-16 w-16 shrink-0 self-center rounded-full border border-neutral-700 sm:self-start"
              style={{ background: bg }}
            />
            <ul className="max-h-[7rem] min-h-0 w-full space-y-0.5 overflow-y-auto overflow-x-hidden overscroll-contain pr-0.5">
              {origins.map((o, i) => (
                <li key={o.country} className="break-words font-mono text-[10px] leading-snug text-neutral-300">
                  <span className="mr-1 inline-block h-2 w-2 shrink-0 rounded-sm align-middle" style={{ backgroundColor: palette[i % palette.length] }} />
                  <span className="font-medium">{o.country}</span>
                  {' — '}
                  <span>
                    {o.count != null ? o.count.toLocaleString('en-US') : 'N/A'}
                    {o.sharePct != null ? ` (${o.sharePct.toFixed(2)}%)` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 font-mono text-xs text-neutral-500">No country breakdown available.</p>
        )}
        <MetaLine row={row} />
        <NoteBlock text={row.notes} />
      </article>
    );
  }

  return (
    <article className="border border-neutral-800 bg-[#121212] p-4 sm:p-5 lg:col-span-3">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">{row.metric}</p>
      {origins.length > 0 ? (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-28 w-28 rounded-full border border-neutral-700" style={{ background: bg }} />
          <ul className="space-y-2">
            {origins.map((o, i) => (
              <li key={o.country} className="font-mono text-xs text-neutral-300">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: palette[i % palette.length] }} />
                <span className="font-medium">{o.country}</span>
                {' — '}
                <span>
                  {o.count != null ? o.count.toLocaleString('en-US') : 'N/A'}
                  {o.sharePct != null ? ` (${o.sharePct.toFixed(2)}%)` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 font-mono text-sm text-neutral-500">No country breakdown available.</p>
      )}
      <MetaLine row={row} />
      <NoteBlock text={row.notes} />
    </article>
  );
}

function StudentAidTile({ row }: { row: CountryStatMetric }) {
  const [open, setOpen] = useState(false);
  let totalAid = 0;
  let slices: { country: string; aidCount: number; sharePct: number }[] = [];
  try {
    const parsed = JSON.parse(row.value) as {
      totalAid: number;
      origins: { country: string; aidCount: number; sharePct: number }[];
    };
    totalAid = Number(parsed.totalAid ?? 0);
    slices = Array.isArray(parsed.origins) ? parsed.origins.filter((s) => s.country && s.aidCount > 0) : [];
  } catch {
    totalAid = 0;
    slices = [];
  }
  const palette = ['#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626'];
  const total = slices.reduce((sum, s) => sum + s.aidCount, 0);
  let acc = 0;
  const stops = slices.map((s, i) => {
    const start = total > 0 ? (acc / total) * 100 : 0;
    acc += s.aidCount;
    const end = total > 0 ? (acc / total) * 100 : 0;
    return `${palette[i % palette.length]} ${start}% ${end}%`;
  });
  const bg = stops.length ? `conic-gradient(${stops.join(', ')})` : 'none';

  return (
    <article className="border border-neutral-800 bg-[#121212] p-4 sm:p-5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">{row.metric}</p>
      <p className="mt-4 font-mono text-2xl font-semibold leading-none tracking-tight text-neutral-100 sm:text-3xl">
        {totalAid.toLocaleString('en-US')}
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex w-fit items-center border border-neutral-700 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-200 hover:border-neutral-500"
      >
        View aid pie chart
      </button>
      <MetaLine row={row} />
      <NoteBlock text={row.notes} />

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl border border-neutral-700 bg-[#101010] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-mono text-sm font-semibold text-neutral-100">Student Aid Breakdown</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-neutral-700 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-300 hover:border-neutral-500"
              >
                Close
              </button>
            </div>
            {slices.length > 0 ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="h-36 w-36 rounded-full border border-neutral-700" style={{ background: bg }} />
                <ul className="max-h-72 flex-1 space-y-1 overflow-auto pr-1">
                  {slices.map((s, i) => (
                    <li key={s.country} className="flex items-center gap-2 font-mono text-xs text-neutral-300">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: palette[i % palette.length] }} />
                      <span>{s.country}</span>
                      <span className="text-neutral-500">
                        {s.aidCount.toLocaleString('en-US')} ({s.sharePct.toFixed(2)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="font-mono text-sm text-neutral-500">No student aid breakdown available.</p>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function orderMetrics(rows: CountryStatMetric[]): CountryStatMetric[] {
  const byMetric = new Map(rows.map((r) => [r.metric, r]));
  const ordered: CountryStatMetric[] = [];
  for (const m of METRIC_ORDER) {
    const hit = byMetric.get(m);
    if (hit) ordered.push(hit);
  }
  const known = new Set<string>(METRIC_ORDER);
  for (const r of rows) {
    if (!known.has(r.metric)) ordered.push(r);
  }
  return ordered;
}

/** Expenditure tiles + pie (nested under Economic → Government spending). */
const GOVERNMENT_SPENDING_METRICS = [
  'Total government expenditure',
  'Social protection expenditure',
  'Health expenditure',
  'Education expenditure',
  'Defence expenditure',
  'Economic affairs expenditure',
  'Immigration welfare spending',
  'Lost to Corruption',
  'Expenditure breakdown (pie)',
] as const;

/** Population tiles (Germany moves some into Immigration subsection). */
const POPULATION_SECTION_METRICS = [
  'White (native) population',
  'Foreign Population',
  'Christian population',
  'Muslim population',
  'Jewish population',
  'Foreign students (total)',
  'Foreign students by origin (pie)',
  'How Many on Student Aid',
  'Immigrants',
] as const;

/** Shown at top of Germany Immigration (same order as in population elsewhere). */
const GERMANY_IMMIGRATION_TOP_METRICS = [
  'Immigrants',
  'Foreign students (total)',
  'Foreign students by origin (pie)',
] as const;

const GERMANY_IMMIGRATION_METRICS_SET = new Set<string>(GERMANY_IMMIGRATION_TOP_METRICS);

const GERMANY_IMMIGRATION_TREEMAP_COUNTRIES = 27;
const GERMANY_IMMIGRATION_SUBSECTION_COUNT =
  GERMANY_IMMIGRATION_TREEMAP_COUNTRIES + GERMANY_IMMIGRATION_TOP_METRICS.length;

function getPopulationSectionMetrics(iso3: string): string[] {
  if (iso3.toUpperCase() !== 'DEU') return [...POPULATION_SECTION_METRICS];
  return POPULATION_SECTION_METRICS.filter((m) => !GERMANY_IMMIGRATION_METRICS_SET.has(m));
}

type MetricSubsection = { id: string; title: string; metrics: readonly string[] };
type CustomSubsection =
  | { id: string; title: string; kind: 'germany_immigration' }
  | { id: string; title: string; kind: 'germany_labor_income' };
type SubsectionDef = MetricSubsection | CustomSubsection;

type StatSectionDef = {
  id: string;
  title: string;
  metrics: readonly string[];
  subsections?: readonly SubsectionDef[];
};

function getStatSections(iso3: string): StatSectionDef[] {
  const isDeu = iso3.toUpperCase() === 'DEU';
  return [
    {
      id: 'economic',
      title: 'Economic statistics',
      metrics: ['GDP', 'GDP per capita', 'Inflation', 'Unemployment', 'Interest', 'Real Median Wage'],
      subsections: [
        {
          id: 'government_spending',
          title: 'Government spending',
          metrics: GOVERNMENT_SPENDING_METRICS,
        },
        ...(isDeu
          ? [
              {
                id: 'labor_income_distribution',
                title: 'Labor & Income Distribution',
                kind: 'germany_labor_income' as const,
              },
            ]
          : []),
      ],
    },
    {
      id: 'population',
      title: 'Population',
      metrics: getPopulationSectionMetrics(iso3),
      subsections: isDeu
        ? [{ id: 'germany_immigration', title: 'Immigration', kind: 'germany_immigration' as const }]
        : undefined,
    },
    {
      id: 'birth',
      title: 'Birth rates',
      metrics:
        iso3.toUpperCase() === 'DEU'
          ? [
              'Total birth rate',
              'White (native) birth rate',
              'Immigrant birth rate',
              'Migrant background M:F ratio',
              'Military-aged males (migrant background)',
              'Births to foreign-born mothers',
              'Infant mortality rate',
              'Child mortality rate',
              'Contraceptive use',
              'Abortion rate',
              'Teen birth rate',
              'Mean age of mothers at childbirth',
            ]
          : ['Total birth rate', 'White (native) birth rate', 'Immigrant birth rate'],
    },
  ];
}

const STAT_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3';

type RenderStatTileOpts = { foreignStudentsPieCompact?: boolean };

function renderStatTile(row: CountryStatMetric, opts?: RenderStatTileOpts): ReactNode {
  if (row.metric === 'Expenditure breakdown (pie)') {
    return <ExpenditurePieTile row={row} />;
  }
  if (row.metric === 'Foreign students by origin (pie)') {
    return <ForeignStudentsOriginTile row={row} compact={opts?.foreignStudentsPieCompact} />;
  }
  if (row.metric === 'How Many on Student Aid') {
    return <StudentAidTile row={row} />;
  }
  if (row.metric === 'Lost to Corruption') {
    return <MetricTile row={row} largeValue />;
  }
  if (row.metric === 'GDP') {
    return <MetricTile row={row} largeValue accent />;
  }
  if (row.metric === 'GDP per capita') {
    return <MetricTile row={row} largeValue />;
  }
  if (row.metric === 'Immigrant birth rate') {
    const p = extractLeadingPercent(row.value);
    return <MetricTile row={row} extra={p !== null ? <PercentRing percent={p} /> : undefined} />;
  }
  if (row.metric === 'White (native) birth rate') {
    const p = extractLeadingPercent(row.value);
    return <MetricTile row={row} extra={p !== null ? <PercentRing percent={p} /> : undefined} />;
  }
  return <MetricTile row={row} />;
}

type CountryStatsDashboardProps = {
  flag: FlagEntry;
  iso3: string;
  onBack: () => void;
};

export function CountryStatsDashboard({ flag, iso3, onBack }: CountryStatsDashboardProps) {
  const [ordered, setOrdered] = useState<CountryStatMetric[] | null>(null);
  const [statsRow, setStatsRow] = useState<CountryWideRow | null>(null);
  const [datasetNote, setDatasetNote] = useState('');
  const [proxyDatasetNote, setProxyDatasetNote] = useState('');
  const [crimeRow, setCrimeRow] = useState<CountryWideRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mergedRes, expendituresRes, foreignStudentsRes, corruptionRes, macroIndicatorsRes] = await Promise.all([
          fetch(MERGED_CSV_URL),
          fetch(EXPENDITURES_CSV_URL),
          fetch(FOREIGN_STUDENTS_CSV_URL),
          fetch(CORRUPTION_LOST_CSV_URL),
          fetch(MACRO_INDICATORS_CSV_URL),
        ]);
        if (!mergedRes.ok) throw new Error(`Could not load merged country data (${mergedRes.status})`);
        const mergedText = await mergedRes.text();
        const parsedMerged = parseCountriesWideCsv(mergedText);
        const byIso = indexCountriesByIso3(parsedMerged);
        const row = byIso.get(iso3.toUpperCase());
        if (cancelled) return;
        if (!row) {
          setError(`No statistics row for ISO3 “${iso3}”.`);
          setOrdered(null);
          setStatsRow(null);
          setCrimeRow(null);
          return;
        }

        let expenditureMetrics: CountryStatMetric[] = [];
        if (expendituresRes.ok) {
          const expendituresText = await expendituresRes.text();
          const expendituresRows = parseCountriesWideCsv(expendituresText);
          const eRow = findExpenditureRow(expendituresRows, row.country || flag.label);
          if (eRow) expenditureMetrics = metricsFromExpenditureRow(eRow, iso3.toUpperCase());
        }

        const countryLabel = row.country || flag.label;
        let macroMetrics: CountryStatMetric[] = metricsFromMacroIndicatorsRow(null, countryLabel);
        if (macroIndicatorsRes.ok) {
          const macroText = await macroIndicatorsRes.text();
          const macroRows = parseCountriesWideCsv(macroText);
          const macroRow = findMacroIndicatorsRow(macroRows, countryLabel);
          macroMetrics = metricsFromMacroIndicatorsRow(macroRow, countryLabel);
        }

        let corruptionRow: CountryWideRow | null = null;
        if (corruptionRes.ok) {
          const corruptionText = await corruptionRes.text();
          const corruptionRows = parseCountriesWideCsv(corruptionText);
          corruptionRow = findCorruptionLostRow(corruptionRows, countryLabel);
        }
        insertLostToCorruptionMetric(expenditureMetrics, corruptionRow, countryLabel);

        let foreignStudentMetrics: CountryStatMetric[] = [];
        if (iso3.toUpperCase() === 'DEU') {
          let deText = '';
          const deRes = await fetch(FOREIGN_STUDENTS_GERMANY_CSV_URL);
          if (deRes.ok) deText = await deRes.text();
          if (!deText.trim()) deText = germanyForeignStudentsRaw;
          foreignStudentMetrics = metricsFromGermanyForeignStudentsCsv(deText);
          if (foreignStudentMetrics.length === 0) {
            foreignStudentMetrics = fallbackGermanyForeignStudentsMetrics();
          }
        } else {
          let fsText = '';
          if (foreignStudentsRes.ok) fsText = await foreignStudentsRes.text();
          if (!fsText.trim()) fsText = fallbackForeignStudentsRaw;
          const fsRows = parseCountriesWideCsv(fsText);
          const fsRow = findForeignStudentsRow(fsRows, row.country || flag.label);
          if (fsRow) foreignStudentMetrics = metricsFromForeignStudentsRow(fsRow);
        }

        let birthHealthMetrics: CountryStatMetric[] = [];
        if (iso3.toUpperCase() === 'DEU') {
          let bhText = '';
          try {
            const bhRes = await fetch(GERMANY_BIRTH_HEALTH_CSV_URL);
            if (bhRes.ok) bhText = await bhRes.text();
          } catch {
            bhText = '';
          }
          if (!bhText.trim()) bhText = germanyBirthHealthRaw;
          birthHealthMetrics = metricsFromGermanyBirthHealthCsv(bhText);
        }

        if (cancelled) return;
        const proxy = proxyFromMergedRow(row);
        setStatsRow(row);
        setDatasetNote(row.notes?.trim() || '');
        setProxyDatasetNote(row.proxy_notes?.trim() || '');
        setCrimeRow(crimeFromMergedRow(row));
        setOrdered(
          orderMetrics([
            ...wideRowToStatMetrics(row, iso3.toUpperCase(), proxy),
            ...macroMetrics,
            ...expenditureMetrics,
            ...foreignStudentMetrics,
            ...birthHealthMetrics,
          ]),
        );
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load data.');
          setOrdered(null);
          setStatsRow(null);
          setCrimeRow(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [iso3, flag.label]);

  const sources = useMemo(() => {
    if (!ordered) return [];
    const map = new Map<string, { name: string; url: string; date: string }>();
    for (const r of ordered) {
      const urls = r.source_url
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const u of urls) {
        if (map.has(u)) continue;
        let name = r.source_name.trim();
        if (!name) {
          try {
            name = new URL(u).hostname.replace(/^www\./, '');
          } catch {
            name = 'Source';
          }
        }
        map.set(u, {
          name,
          url: u,
          date: r.source_publication_or_access_date.trim(),
        });
      }
    }
    if (statsRow) {
      for (const c of collectSourceUrlsFromWideRow(statsRow)) {
        if (map.has(c.url)) continue;
        map.set(c.url, { name: c.label, url: c.url, date: '' });
      }
    }
    for (const c of collectCrimeSourceUrls(crimeRow)) {
      if (map.has(c.url)) continue;
      map.set(c.url, { name: c.label, url: c.url, date: '' });
    }
    return [...map.values()];
  }, [ordered, statsRow, crimeRow]);

  const displayTitle = flag.label.toUpperCase();

  const metricsByName = useMemo(() => {
    if (!ordered) return new Map<string, CountryStatMetric>();
    return new Map(ordered.map((r) => [r.metric, r]));
  }, [ordered]);

  const statSections = useMemo(() => getStatSections(iso3), [iso3]);

  const isGermany = iso3.toUpperCase() === 'DEU';
  const germanyNewsItems = useBundledGermanyNews(isGermany);
  const { germanyLeftNewsSections, germanyRightNewsSections } = useMemo(() => {
    const b = bucketGermanyNewsItems(germanyNewsItems);
    const left: GermanyNewsRailSection[] = [
      { heading: 'Economy', items: b.economy },
      { heading: 'Immigration', items: b.immigration },
    ];
    const right: GermanyNewsRailSection[] = [
      { heading: 'Crime', items: b.crime },
      { heading: 'Health', items: b.health },
    ];
    return { germanyLeftNewsSections: left, germanyRightNewsSections: right };
  }, [germanyNewsItems]);
  const germanyLeftRailVisible = germanyLeftNewsSections.some((s) => s.items.length > 0);
  const germanyRightRailVisible = germanyRightNewsSections.some((s) => s.items.length > 0);

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-[#0a0a0a] font-mono text-neutral-200">
      <div className="sticky top-0 z-50 border-b border-neutral-800 bg-[#0c0c0c]/95 backdrop-blur">
        <div className="grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="justify-self-start font-mono text-[11px] uppercase tracking-wider text-neutral-500 transition-colors hover:text-white"
          >
            ← Back
          </button>
          <div className="justify-self-center text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Watch Tower</p>
          </div>
          <div className="flex items-center justify-self-end gap-3">
            <div className="hidden h-10 w-14 border border-neutral-800 bg-black/50 sm:flex sm:items-center sm:justify-center sm:px-2">
              <img src={flag.src} alt="" className="max-h-7 max-w-full object-contain" decoding="async" />
            </div>
            <h1 className="text-right text-sm font-semibold uppercase tracking-[0.12em] text-white sm:text-base">
              {displayTitle}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 w-full flex-1 gap-0">
        {isGermany && germanyLeftRailVisible ? (
          <GermanyNewsRail side="left" sections={germanyLeftNewsSections} />
        ) : null}
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden">
          <div
            className={
              isGermany
                ? [
                    'w-full max-w-none py-8 sm:py-10',
                    germanyLeftRailVisible ? 'pl-[13rem]' : 'pl-2 sm:pl-3',
                    germanyRightRailVisible ? 'pr-[13rem]' : 'pr-2 sm:pr-3',
                  ].join(' ')
                : 'mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10'
            }
          >
        {error ? (
          <p className="border border-neutral-800 bg-[#121212] p-6 font-mono text-sm text-red-400/90">
            {error}
          </p>
        ) : null}

        {!error && ordered === null ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse border border-neutral-800 bg-[#121212]"
              />
            ))}
          </div>
        ) : null}

        {ordered && ordered.length > 0 ? (
          <>
            <p className="mb-4 max-w-2xl font-mono text-[11px] leading-relaxed text-neutral-500">
              Data: <code className="text-neutral-400">centralized_merged_country_stats.csv</code> (economics,
              demographics proxies, and crime baselines in one file). Crime baseline audit:{' '}
              <code className="text-neutral-400">crime_baseline_replacement_audit.csv</code>. Open card notes for
              definitions.
            </p>
            {datasetNote ? (
              <details className="mb-3 max-w-2xl border border-neutral-800 bg-[#121212] p-3 font-mono text-[10px] text-neutral-500">
                <summary className="cursor-pointer text-neutral-400 hover:text-neutral-200">
                  Main CSV methodology note
                </summary>
                <p className="mt-2 leading-relaxed">{datasetNote}</p>
              </details>
            ) : null}
            {proxyDatasetNote ? (
              <details className="mb-6 max-w-2xl border border-neutral-800 bg-[#121212] p-3 font-mono text-[10px] text-neutral-500">
                <summary className="cursor-pointer text-neutral-400 hover:text-neutral-200">
                  Proxy demographics &amp; births note (merged CSV)
                </summary>
                <p className="mt-2 leading-relaxed">{proxyDatasetNote}</p>
              </details>
            ) : null}

            <div className="flex flex-col gap-4">
              {statSections.map((section) => {
                const leadingRows = section.metrics
                  .map((name) => metricsByName.get(name))
                  .filter((r): r is CountryStatMetric => r != null);

                type NestedBlock =
                  | { type: 'metrics'; sub: MetricSubsection; subRows: CountryStatMetric[] }
                  | { type: 'germany_immigration'; sub: CustomSubsection }
                  | { type: 'germany_labor_income'; sub: CustomSubsection };

                const nestedBlocks: NestedBlock[] = [];
                for (const sub of section.subsections ?? []) {
                  if ('kind' in sub && sub.kind === 'germany_immigration') {
                    if (iso3.toUpperCase() === 'DEU') {
                      nestedBlocks.push({ type: 'germany_immigration', sub });
                    }
                    continue;
                  }
                  if ('kind' in sub && sub.kind === 'germany_labor_income') {
                    if (iso3.toUpperCase() === 'DEU') {
                      nestedBlocks.push({ type: 'germany_labor_income', sub });
                    }
                    continue;
                  }
                  const metricSub = sub as MetricSubsection;
                  const subRows = metricSub.metrics
                    .map((name: string) => metricsByName.get(name))
                    .filter((r): r is CountryStatMetric => r != null);
                  if (subRows.length > 0) nestedBlocks.push({ type: 'metrics', sub: metricSub, subRows });
                }

                const showGermanyBirthPyramid = section.id === 'birth' && iso3.toUpperCase() === 'DEU';

                if (leadingRows.length === 0 && nestedBlocks.length === 0 && !showGermanyBirthPyramid) return null;

                const sectionCount =
                  leadingRows.length +
                  nestedBlocks.reduce((acc, b) => {
                    if (b.type === 'germany_immigration') return acc + GERMANY_IMMIGRATION_SUBSECTION_COUNT;
                    if (b.type === 'germany_labor_income') return acc + GERMANY_LABOR_INCOME_GROUP_COUNT;
                    return acc + b.subRows.length;
                  }, 0) +
                  (showGermanyBirthPyramid ? 1 : 0);

                return (
                  <CollapsibleFlagSection
                    key={section.id}
                    title={section.title}
                    count={sectionCount}
                    defaultOpen
                  >
                    <div className="flex flex-col gap-4">
                      {showGermanyBirthPyramid ? (
                        <GermanyPopulationPyramid />
                      ) : null}
                      {leadingRows.length > 0 ? (
                        <div className={STAT_GRID}>
                          {leadingRows.map((row) => (
                            <Fragment key={row.metric}>{renderStatTile(row)}</Fragment>
                          ))}
                        </div>
                      ) : null}
                      {nestedBlocks.map((block) =>
                        block.type === 'germany_immigration' ? (
                          <CollapsibleFlagSection
                            key={block.sub.id}
                            title={block.sub.title}
                            count={GERMANY_IMMIGRATION_SUBSECTION_COUNT}
                            defaultOpen
                          >
                            <div className="flex flex-col gap-4">
                              <div className={STAT_GRID}>
                                {GERMANY_IMMIGRATION_TOP_METRICS.map((metric) => {
                                  const row = metricsByName.get(metric);
                                  return row ? (
                                    <Fragment key={metric}>
                                      {renderStatTile(row, {
                                        foreignStudentsPieCompact: metric === 'Foreign students by origin (pie)',
                                      })}
                                    </Fragment>
                                  ) : null;
                                })}
                              </div>
                              <GermanyImmigrationSection />
                            </div>
                          </CollapsibleFlagSection>
                        ) : block.type === 'germany_labor_income' ? (
                          <CollapsibleFlagSection
                            key={block.sub.id}
                            title={block.sub.title}
                            count={GERMANY_LABOR_INCOME_GROUP_COUNT}
                            defaultOpen
                          >
                            <GermanyLaborIncomeSection />
                          </CollapsibleFlagSection>
                        ) : (
                          <CollapsibleFlagSection
                            key={block.sub.id}
                            title={block.sub.title}
                            count={block.subRows.length}
                            defaultOpen
                          >
                            <div className={STAT_GRID}>
                              {block.subRows.map((row) => (
                                <Fragment key={row.metric}>{renderStatTile(row)}</Fragment>
                              ))}
                            </div>
                          </CollapsibleFlagSection>
                        ),
                      )}
                    </div>
                  </CollapsibleFlagSection>
                );
              })}
            </div>

            <div className="mt-4">
              <CollapsibleFlagSection
                title="Crime statistics"
                count={crimeRow ? (iso3.toUpperCase() === 'DEU' ? 14 : 8) : 0}
                defaultOpen
              >
                <div className="flex flex-col gap-4">
                  <CollapsibleFlagSection title="Crime Comparison" count={crimeRow ? 8 : 0} defaultOpen>
                    <CrimeMetricsSection crimeRow={crimeRow} />
                  </CollapsibleFlagSection>
                  {iso3.toUpperCase() === 'DEU' ? (
                    <CollapsibleFlagSection title="Migrant data" count={15} defaultOpen>
                      <GermanyMigrantCrimeSection />
                    </CollapsibleFlagSection>
                  ) : null}
                </div>
              </CollapsibleFlagSection>
            </div>

            {iso3.toUpperCase() === 'DEU' ? (
              <div className="mt-4">
                <GermanyGovernmentSection />
              </div>
            ) : null}

            <section className="mt-10 border border-neutral-800 bg-[#121212] p-4 sm:p-6">
              <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                Sources
              </h2>
              <ul className="mt-4 space-y-3">
                {sources.map((s) => (
                  <li
                    key={s.url}
                    className="flex flex-col gap-1 border-b border-neutral-800/80 pb-3 last:border-0 last:pb-0"
                  >
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-[var(--uk-accent)] hover:text-neutral-200"
                    >
                      {s.name}
                    </a>
                    {s.date ? (
                      <span className="font-mono text-[10px] text-neutral-600">{s.date}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
          </div>
        </div>
        {isGermany && germanyRightRailVisible ? (
          <GermanyNewsRail side="right" sections={germanyRightNewsSections} />
        ) : null}
      </div>
    </div>
  );
}
