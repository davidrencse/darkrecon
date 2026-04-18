import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { FlagEntry } from '../types/flag';
import type { CountryStatMetric } from '../types/countryStats';
import { collectSourceUrlsFromWideRow, wideRowToStatMetrics } from '../lib/countryStatsMetrics';
import { findCorruptionLostRow, insertLostToCorruptionMetric } from '../lib/corruptionLost';
import {
  findExpenditureRow,
  metricsFromExpenditureRow,
  metricsGermanyGovernmentSpendingWithoutExpenditureCsv,
} from '../lib/expenditures';
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
import { ChartContainer, type ChartConfig } from './ui/chart';
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
import {
  GERMANY_ABORTION_SECTION_GROUP_COUNT,
  GERMANY_HEALTH_BASIC_GROUP_COUNT,
  GERMANY_LGBT_SECTION_GROUP_COUNT,
} from '../lib/germanyHealthCsv';
import { GermanyAbortionStatisticsSection } from './GermanyAbortionStatisticsSection';
import { GermanyHealthBasicSection } from './GermanyHealthBasicSection';
import { GermanyLgbtSection } from './GermanyLgbtSection';
import {
  GermanyPoliticsLeftismSection,
  GERMANY_POLITICS_LEFTISM_GROUP_COUNT,
} from './GermanyPoliticsLeftismSection';
import { GermanyLaborIncomeSection } from './GermanyLaborIncomeSection';
import { GermanyPopulationPyramid } from './GermanyPopulationPyramid';
import { GermanyDaxCarousel } from './GermanyDaxCarousel';
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
  'Immigration welfare spending',
  'Lost to Corruption',
  'Foreign Aid',
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
  'Military-aged males (migrant background)',
  'Median age',
  'Total birth rate',
  'White (native) birth rate',
  'Immigrant birth rate',
  'Migrant background M:F ratio',
  'Births to foreign-born mothers',
  'Infant mortality rate',
  'Child mortality rate',
  'Contraceptive use',
  'Abortion rate',
  'Teen birth rate',
  'Mean age of mothers at childbirth',
  'Childhood overweight and obesity (Germany)',
] as const;

/** Former standalone “Birth rates” section; now nested under Health → Birth rates (Germany). */
const BIRTH_RATES_SUBSECTION_METRICS_DEU = [
  'Total birth rate',
  'White (native) birth rate',
  'Immigrant birth rate',
  'Migrant background M:F ratio',
  'Births to foreign-born mothers',
  'Infant mortality rate',
  'Child mortality rate',
  'Contraceptive use',
  'Abortion rate',
  'Teen birth rate',
  'Mean age of mothers at childbirth',
  'Childhood overweight and obesity (Germany)',
] as const;

const BIRTH_RATES_SUBSECTION_METRICS_DEFAULT = [
  'Total birth rate',
  'White (native) birth rate',
  'Immigrant birth rate',
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
        className="fill-neutral-200 font-sans text-[15px] font-semibold"
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
    <p className="mt-3 font-sans text-[10px] leading-relaxed text-neutral-500">
      {parts.join(' · ')}
    </p>
  );
}

function NoteBlock({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <details className="mt-3 border-t border-white/[0.06] pt-2">
      <summary className="cursor-pointer font-sans text-[10px] uppercase tracking-wider text-neutral-600 hover:text-neutral-400">
        Note
      </summary>
      <p className="mt-2 font-sans text-[10px] leading-relaxed text-neutral-500">{text}</p>
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
          ? 'flex min-h-[148px] flex-col rounded-md border border-[var(--uk-accent-border)] bg-[var(--uk-accent-surface)] p-4 shadow-card ring-1 ring-[var(--uk-accent-dim)] sm:p-5'
          : 'flex min-h-[148px] flex-col rounded-md border border-line bg-surface-metric p-4 shadow-card sm:p-5'
      }
    >
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
        {row.metric}
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={
            largeValue
              ? `min-w-0 flex-1 font-sans tabular-nums text-2xl font-semibold leading-none tracking-tight sm:text-3xl lg:text-4xl ${na ? 'text-neutral-600' : 'text-neutral-100'}`
              : `min-w-0 flex-1 font-sans tabular-nums text-lg font-medium leading-snug sm:text-xl ${na ? 'text-neutral-600' : 'text-neutral-100'}`
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
            className="inline-flex w-fit items-center gap-1 font-sans text-[10px] text-[var(--uk-accent)] hover:text-neutral-200"
          />
        </div>
      ) : null}
      <NoteBlock text={row.notes} />
    </article>
  );
}

/** Germany: one card, three stacked breakdown rows (Government spending). */
function ImmigrationWelfareGermanyTile({ row }: { row: CountryStatMetric }) {
  return (
    <article className="flex min-h-[148px] flex-col rounded-md border border-line bg-surface-metric shadow-card p-4 sm:p-5">
      <div className="divide-y divide-white/[0.06]">
        <div className="pb-3">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Immigration welfare spending
          </p>
          <p className="mt-2 font-sans text-lg font-semibold leading-tight text-neutral-100 sm:text-xl">
            $28.6B USD
          </p>
          <p className="mt-1 font-sans text-[10px] leading-relaxed text-neutral-500">2023 · Germany</p>
        </div>
        <div className="py-3">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Money Given to Immigrant Families
          </p>
          <p className="mt-1.5 font-sans text-base font-medium text-neutral-100 sm:text-lg">€21.7 billion</p>
        </div>
        <div className="pt-3">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Money Spent on Immigrants/Refugees
          </p>
          <p className="mt-1.5 font-sans text-base font-medium text-neutral-100 sm:text-lg">€46.6 billion (2025)</p>
        </div>
      </div>
      {row.source_url ? (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <SourceLinks
            url={row.source_url}
            className="inline-flex w-fit items-center gap-1 font-sans text-[10px] text-[var(--uk-accent)] hover:text-neutral-200"
          />
        </div>
      ) : null}
      <NoteBlock text={row.notes} />
    </article>
  );
}

/** Health → Birth rates: Destatis / OECD-style childhood weight metrics (DE). */
function ChildhoodObesityBirthRatesTile({ row }: { row: CountryStatMetric }) {
  return (
    <article className="flex min-h-[148px] flex-col rounded-md border border-line bg-surface-metric shadow-card p-4 sm:p-5">
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
        Childhood overweight and obesity
      </p>
      <div className="mt-3 divide-y divide-white/[0.06]">
        <div className="pb-3">
          <p className="font-sans text-[10px] leading-relaxed text-neutral-400">
            Overweight (incl. obesity) among children aged 7–9
          </p>
          <p className="mt-1.5 font-sans text-sm leading-snug text-neutral-100 sm:text-base">
            25.7% (boys 27.7%, girls 23.3%).
          </p>
        </div>
        <div className="py-3">
          <p className="font-sans text-[10px] leading-relaxed text-neutral-400">Obesity among children aged 7–9</p>
          <p className="mt-1.5 font-sans text-sm leading-snug text-neutral-100 sm:text-base">
            ~11% overall (boys higher at ~13%, girls ~9%).
          </p>
        </div>
        <div className="pt-3">
          <p className="font-sans text-[10px] leading-relaxed text-neutral-400">
            Overweight/obesity among children and adolescents (3–17 years)
          </p>
          <p className="mt-1.5 font-sans text-sm leading-snug text-neutral-100 sm:text-base">
            ~15% overweight, ~6% obese (older national data; rising trend).
          </p>
        </div>
      </div>
      {row.notes.trim() ? (
        <p className="mt-3 border-t border-white/[0.06] pt-3 font-sans text-[10px] leading-relaxed text-neutral-500">
          Source: {row.notes}
        </p>
      ) : null}
    </article>
  );
}

/** Distinct saturated hues (no greys) for expenditure pie + legend swatches. */
const EXPENDITURE_PIE_PALETTE = [
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#a855f7',
  '#f43f5e',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#8b5cf6',
  '#14b8a6',
  '#eab308',
  '#ec4899',
  '#6366f1',
  '#22d3ee',
  '#4ade80',
  '#fb7185',
];

type PieSlice = { label: string; value: number; detailEurBn?: number };

function ExpenditurePieTile({ row }: { row: CountryStatMetric }) {
  let slices: PieSlice[] = [];
  try {
    if (row.value.trim() && row.value.trim() !== 'N/A') {
      const parsed = JSON.parse(row.value) as PieSlice[];
      if (Array.isArray(parsed))
        slices = parsed.filter((s) => s && Number.isFinite(s.value) && s.value > 0);
    }
  } catch {
    slices = [];
  }

  /** Germany combined pie: weight slices by €bn (`detailEurBn`). Legacy OECD pie: `value` is already %. */
  const useEurBnWeights =
    slices.length > 0 &&
    slices.every((s) => typeof s.detailEurBn === 'number' && Number.isFinite(s.detailEurBn) && s.detailEurBn > 0);

  const chartData = slices.map((s, i) => ({
    name: s.label,
    pieValue: useEurBnWeights ? (s.detailEurBn as number) : s.value,
    pctOfTotal: s.value,
    detailEurBn: s.detailEurBn,
    fill: EXPENDITURE_PIE_PALETTE[i % EXPENDITURE_PIE_PALETTE.length],
  }));

  const chartConfig: ChartConfig = slices.reduce((acc, s, i) => {
    const key = `slice_${i}`;
    acc[key] = { label: s.label, color: EXPENDITURE_PIE_PALETTE[i % EXPENDITURE_PIE_PALETTE.length] };
    return acc;
  }, {} as ChartConfig);

  return (
    <article className="col-span-full w-full rounded-md border border-line bg-surface-metric shadow-card p-4 sm:p-5">
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
        {row.metric}
      </p>
      {slices.length > 0 ? (
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
          <ChartContainer config={chartConfig} className="mx-auto h-[280px] w-full max-w-[340px] shrink-0 sm:max-w-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="pieValue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  paddingAngle={0.4}
                  stroke="none"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={`cell-${entry.name}-${i}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #404040',
                    borderRadius: '4px',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '11px',
                  }}
                  formatter={(value, _name, item) => {
                    const payload = item?.payload as
                      | (PieSlice & { fill: string; pieValue?: number; pctOfTotal?: number })
                      | undefined;
                    const pct = payload?.pctOfTotal;
                    const d = payload?.detailEurBn;
                    if (typeof pct === 'number' && Number.isFinite(pct)) {
                      if (typeof d === 'number' && Number.isFinite(d)) {
                        return [`${pct.toFixed(2)}% of combined (~${d.toFixed(1)} €bn)`, 'Share'];
                      }
                      return [`${pct.toFixed(2)}%`, 'Share'];
                    }
                    const v = typeof value === 'number' ? value : Number(value);
                    return [`${Number.isFinite(v) ? v.toFixed(2) : '—'}%`, 'Share'];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <ul className="min-w-0 flex-1 space-y-1.5">
            {slices.map((s, i) => (
              <li key={s.label} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-sans text-[11px] text-neutral-300">
                <span
                  className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: EXPENDITURE_PIE_PALETTE[i % EXPENDITURE_PIE_PALETTE.length] }}
                />
                <span className="min-w-0 flex-1 break-words">{s.label}</span>
                <span className="shrink-0 text-neutral-500">{s.value.toFixed(1)}%</span>
                {typeof s.detailEurBn === 'number' && Number.isFinite(s.detailEurBn) ? (
                  <span className="w-full pl-5 font-sans text-[10px] text-neutral-600 sm:pl-0 sm:w-auto sm:pl-2">
                    ~{s.detailEurBn.toFixed(0)} €bn
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 font-sans text-sm text-neutral-500">No percentage split available.</p>
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
      <article className="flex min-h-[148px] flex-col rounded-md border border-line bg-surface-metric shadow-card p-4 sm:p-5">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">{row.metric}</p>
        {origins.length > 0 ? (
          <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
            <div
              className="mx-auto h-16 w-16 shrink-0 self-center rounded-full border border-neutral-700 sm:self-start"
              style={{ background: bg }}
            />
            <ul className="scrollbar-none max-h-[7rem] min-h-0 w-full space-y-0.5 overflow-y-auto overflow-x-hidden overscroll-contain pr-0.5">
              {origins.map((o, i) => (
                <li key={o.country} className="break-words font-sans text-[10px] leading-snug text-neutral-300">
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
          <p className="mt-3 font-sans text-xs text-neutral-500">No country breakdown available.</p>
        )}
        <MetaLine row={row} />
        <NoteBlock text={row.notes} />
      </article>
    );
  }

  return (
    <article className="rounded-md border border-line bg-surface-metric shadow-card p-4 sm:p-5 lg:col-span-3">
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">{row.metric}</p>
      {origins.length > 0 ? (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-28 w-28 rounded-full border border-neutral-700" style={{ background: bg }} />
          <ul className="space-y-2">
            {origins.map((o, i) => (
              <li key={o.country} className="font-sans text-xs text-neutral-300">
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
        <p className="mt-4 font-sans text-sm text-neutral-500">No country breakdown available.</p>
      )}
      <MetaLine row={row} />
      <NoteBlock text={row.notes} />
    </article>
  );
}

/** Body of a metric card (no outer `article`); used inside merged tiles. */
function MetricTileColumn({
  row,
  largeValue,
}: {
  row: CountryStatMetric;
  largeValue?: boolean;
}) {
  const na = isUnavailable(row.value);
  return (
    <>
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">{row.metric}</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={
            largeValue
              ? `min-w-0 flex-1 font-sans tabular-nums text-xl font-semibold leading-none tracking-tight sm:text-2xl ${na ? 'text-neutral-600' : 'text-neutral-100'}`
              : `min-w-0 flex-1 font-sans tabular-nums text-base font-medium leading-snug sm:text-lg ${na ? 'text-neutral-600' : 'text-neutral-100'}`
          }
        >
          {na ? 'N/A' : row.value}
        </p>
      </div>
      <MetaLine row={row} />
      {row.source_url ? (
        <div className="mt-2">
          <SourceLinks
            url={row.source_url}
            className="inline-flex w-fit items-center gap-1 font-sans text-[10px] text-[var(--uk-accent)] hover:text-neutral-200"
          />
        </div>
      ) : null}
      <NoteBlock text={row.notes} />
    </>
  );
}

function MedianAgeGermanyTile({ row }: { row: CountryStatMetric }) {
  const na = isUnavailable(row.value);
  return (
    <article className="flex min-h-[148px] flex-col rounded-md border border-line bg-surface-metric shadow-card p-4 sm:p-5">
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">{row.metric}</p>
      <p
        className={`mt-4 font-sans tabular-nums text-2xl font-semibold leading-none tracking-tight sm:text-3xl lg:text-4xl ${na ? 'text-neutral-600' : 'text-neutral-100'}`}
      >
        {na ? 'N/A' : row.value}
      </p>
      <p className="mt-2 font-sans text-sm leading-snug text-neutral-400">
        (one of the oldest populations in Europe)
      </p>
      <MetaLine row={row} />
      {row.source_url ? (
        <div className="mt-2">
          <SourceLinks
            url={row.source_url}
            className="inline-flex w-fit items-center gap-1 font-sans text-[10px] text-[var(--uk-accent)] hover:text-neutral-200"
          />
        </div>
      ) : null}
      <NoteBlock text={row.notes} />
    </article>
  );
}

function ReligionPopulationTriTile({
  christian,
  muslim,
  jewish,
}: {
  christian: CountryStatMetric;
  muslim: CountryStatMetric;
  jewish: CountryStatMetric;
}) {
  const rows = [christian, muslim, jewish];
  return (
    <article className="flex min-h-[148px] flex-col rounded-md border border-line bg-surface-metric shadow-card">
      {rows.map((row, index) => {
        const na = isUnavailable(row.value);
        const cleanedGeography = row.geography_used.replace(/\bGermany\b/gi, '').replace(/\s{2,}/g, ' ').trim();
        const rowMetaParts = [row.reference_period, cleanedGeography].filter(Boolean);
        return (
          <div
            key={row.metric}
            className={`p-4 sm:p-5 ${index > 0 ? 'border-t border-white/[0.06]' : ''}`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                {row.metric}
              </p>
              <p
                className={`font-sans text-base font-semibold leading-snug sm:text-lg ${
                  na ? 'text-neutral-600' : 'text-neutral-100'
                }`}
              >
                {na ? 'N/A' : row.value}
              </p>
            </div>
            {rowMetaParts.length > 0 ? (
              <p className="mt-3 font-sans text-[10px] leading-relaxed text-neutral-500">{rowMetaParts.join(' · ')}</p>
            ) : null}
            {row.source_url ? (
              <div className="mt-2">
                <SourceLinks
                  url={row.source_url}
                  className="inline-flex w-fit items-center gap-1 font-sans text-[10px] text-[var(--uk-accent)] hover:text-neutral-200"
                />
              </div>
            ) : null}
            <NoteBlock text={row.notes} />
          </div>
        );
      })}
    </article>
  );
}

function StudentAidTileInner({ row }: { row: CountryStatMetric }) {
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
    <>
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">{row.metric}</p>
      <p className="mt-4 font-sans tabular-nums text-2xl font-semibold leading-none tracking-tight text-neutral-100 sm:text-3xl">
        {totalAid.toLocaleString('en-US')}
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex w-fit items-center rounded-md border border-white/[0.1] bg-card px-3 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-200 shadow-sm transition hover:border-white/[0.18] hover:bg-card-hover"
      >
        View aid pie chart
      </button>
      <MetaLine row={row} />
      <NoteBlock text={row.notes} />

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-md border border-line bg-card p-4 shadow-soft ring-1 ring-white/[0.04] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-sans text-sm font-semibold text-neutral-100">Student Aid Breakdown</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-white/[0.1] bg-surface-metric px-2 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-300 shadow-sm transition hover:border-white/[0.18] hover:bg-card-hover"
              >
                Close
              </button>
            </div>
            {slices.length > 0 ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="h-36 w-36 rounded-full border border-neutral-700" style={{ background: bg }} />
                <ul className="scrollbar-none max-h-72 flex-1 space-y-1 overflow-auto pr-1">
                  {slices.map((s, i) => (
                    <li key={s.country} className="flex items-center gap-2 font-sans text-xs text-neutral-300">
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
              <p className="font-sans text-sm text-neutral-500">No student aid breakdown available.</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function ForeignStudentsAndStudentAidSplitTile({
  foreign,
  studentAid,
}: {
  foreign: CountryStatMetric;
  studentAid: CountryStatMetric;
}) {
  return (
    <article className="flex min-h-[148px] flex-col rounded-md border border-line bg-surface-metric shadow-card sm:flex-row sm:divide-x sm:divide-white/[0.06]">
      <div className="flex flex-1 flex-col p-4 sm:w-1/2 sm:min-w-0 sm:p-5">
        <MetricTileColumn row={foreign} largeValue />
      </div>
      <div className="flex flex-1 flex-col border-t border-white/[0.06] p-4 sm:w-1/2 sm:min-w-0 sm:border-t-0 sm:p-5">
        <StudentAidTileInner row={studentAid} />
      </div>
    </article>
  );
}

function StudentAidTile({ row }: { row: CountryStatMetric }) {
  return (
    <article className="rounded-md border border-line bg-surface-metric shadow-card p-4 sm:p-5">
      <StudentAidTileInner row={row} />
    </article>
  );
}

function germanyPopulationLeadingTileCount(rows: CountryStatMetric[]): number {
  const byMetric = new Map(rows.map((r) => [r.metric, r]));
  let skip = 0;
  if (
    byMetric.has('Christian population') &&
    byMetric.has('Muslim population') &&
    byMetric.has('Jewish population')
  ) {
    skip += 2;
  }
  if (byMetric.has('Foreign students (total)') && byMetric.has('How Many on Student Aid')) {
    skip += 1;
  }
  return rows.length - skip;
}

function renderGermanyPopulationLeadingTiles(leadingRows: CountryStatMetric[], iso3: string): ReactNode[] {
  const byMetric = new Map(leadingRows.map((r) => [r.metric, r]));
  const skip = new Set<string>();
  const out: ReactNode[] = [];
  for (const row of leadingRows) {
    if (skip.has(row.metric)) continue;
    if (row.metric === 'Christian population') {
      const m = byMetric.get('Muslim population');
      const j = byMetric.get('Jewish population');
      if (m && j) {
        skip.add('Muslim population');
        skip.add('Jewish population');
        out.push(
          <ReligionPopulationTriTile key="religion-tri" christian={row} muslim={m} jewish={j} />,
        );
        continue;
      }
    }
    if (row.metric === 'Foreign students (total)') {
      const aid = byMetric.get('How Many on Student Aid');
      if (aid) {
        skip.add('How Many on Student Aid');
        out.push(
          <ForeignStudentsAndStudentAidSplitTile key="foreign-student-aid" foreign={row} studentAid={aid} />,
        );
        continue;
      }
    }
    if (row.metric === 'Median age') {
      out.push(<MedianAgeGermanyTile key={row.metric} row={row} />);
      continue;
    }
    out.push(<Fragment key={row.metric}>{renderStatTile(row, { iso3 })}</Fragment>);
  }
  return out;
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
  'Immigration welfare spending',
  'Lost to Corruption',
  'Foreign Aid',
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
  'Military-aged males (migrant background)',
  'Median age',
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
  | { id: string; title: string; kind: 'germany_labor_income' }
  | { id: string; title: string; kind: 'germany_health_basic' }
  | { id: string; title: string; kind: 'germany_lgbt_stats' }
  | { id: string; title: string; kind: 'germany_politics_leftism' }
  | { id: string; title: string; kind: 'germany_abortion_stats' };
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
      title: 'Economy',
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
      id: 'politics',
      title: 'Politics',
      metrics: [],
      subsections: isDeu
        ? [{ id: 'leftism', title: 'Leftism', kind: 'germany_politics_leftism' as const }]
        : undefined,
    },
    {
      id: 'population',
      title: 'Demographics',
      metrics: getPopulationSectionMetrics(iso3),
      subsections: isDeu
        ? [{ id: 'germany_immigration', title: 'Immigration', kind: 'germany_immigration' as const }]
        : undefined,
    },
    {
      id: 'health',
      title: 'Health',
      metrics: [],
      subsections:
        iso3.toUpperCase() === 'DEU'
          ? [
              { id: 'health_basic', title: 'Overview', kind: 'germany_health_basic' as const },
              {
                id: 'birth_rates',
                title: 'Birth rates',
                metrics: [...BIRTH_RATES_SUBSECTION_METRICS_DEU],
              },
              { id: 'lgbt', title: 'LGBT', kind: 'germany_lgbt_stats' as const },
              { id: 'abortions', title: 'Abortions', kind: 'germany_abortion_stats' as const },
            ]
          : [
              {
                id: 'birth_rates',
                title: 'Birth rates',
                metrics: [...BIRTH_RATES_SUBSECTION_METRICS_DEFAULT],
              },
            ],
    },
  ];
}

const STAT_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3';

type RenderStatTileOpts = { foreignStudentsPieCompact?: boolean; iso3?: string };

function renderStatTile(row: CountryStatMetric, opts?: RenderStatTileOpts): ReactNode {
  if (row.metric === 'Immigration welfare spending' && opts?.iso3?.toUpperCase() === 'DEU') {
    return <ImmigrationWelfareGermanyTile row={row} />;
  }
  if (row.metric === 'Childhood overweight and obesity (Germany)' && opts?.iso3?.toUpperCase() === 'DEU') {
    return <ChildhoodObesityBirthRatesTile row={row} />;
  }
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
  if (row.metric === 'Foreign Aid') {
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

const DRAGGABLE_TOP_SECTION_ORDER = ['economic', 'politics', 'population', 'health', 'crime', 'government'] as const;

export function CountryStatsDashboard({ flag, iso3, onBack }: CountryStatsDashboardProps) {
  const [ordered, setOrdered] = useState<CountryStatMetric[] | null>(null);
  const [statsRow, setStatsRow] = useState<CountryWideRow | null>(null);
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

        const countryLabel = row.country || flag.label;

        let corruptionRow: CountryWideRow | null = null;
        if (corruptionRes.ok) {
          const corruptionText = await corruptionRes.text();
          const corruptionRows = parseCountriesWideCsv(corruptionText);
          corruptionRow = findCorruptionLostRow(corruptionRows, countryLabel);
        }

        let expenditureMetrics: CountryStatMetric[] = [];
        if (expendituresRes.ok) {
          const expendituresText = await expendituresRes.text();
          const expendituresRows = parseCountriesWideCsv(expendituresText);
          const eRow = findExpenditureRow(expendituresRows, row.country || flag.label);
          if (iso3.toUpperCase() === 'DEU') {
            if (eRow) {
              expenditureMetrics = metricsFromExpenditureRow(eRow, iso3.toUpperCase(), corruptionRow);
            } else {
              expenditureMetrics = metricsGermanyGovernmentSpendingWithoutExpenditureCsv(corruptionRow, countryLabel);
            }
          } else if (eRow) {
            expenditureMetrics = metricsFromExpenditureRow(eRow, iso3.toUpperCase(), corruptionRow);
          }
        } else if (iso3.toUpperCase() === 'DEU') {
          expenditureMetrics = metricsGermanyGovernmentSpendingWithoutExpenditureCsv(corruptionRow, countryLabel);
        }
        insertLostToCorruptionMetric(expenditureMetrics, corruptionRow, countryLabel);

        let macroMetrics: CountryStatMetric[] = metricsFromMacroIndicatorsRow(null, countryLabel);
        if (macroIndicatorsRes.ok) {
          const macroText = await macroIndicatorsRes.text();
          const macroRows = parseCountriesWideCsv(macroText);
          const macroRow = findMacroIndicatorsRow(macroRows, countryLabel);
          macroMetrics = metricsFromMacroIndicatorsRow(macroRow, countryLabel);
        }

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
  const [sectionOrder, setSectionOrder] = useState<string[]>([...DRAGGABLE_TOP_SECTION_ORDER]);
  const [allExpanded, setAllExpanded] = useState(false);
  const [collapseSignal, setCollapseSignal] = useState(1);
  const [expandSignal, setExpandSignal] = useState(0);
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

  function sectionOrderIndex(id: string): number {
    const i = sectionOrder.indexOf(id);
    return i === -1 ? 999 : i;
  }

  function moveSection(id: string, direction: 'up' | 'down') {
    const active = [...statSections.map((s) => s.id), 'crime', ...(isGermany ? ['government'] : [])];
    setSectionOrder((prev) => {
      const orderedActive = active
        .map((sid) => ({ sid, idx: prev.indexOf(sid) }))
        .filter((x) => x.idx !== -1)
        .sort((a, b) => a.idx - b.idx)
        .map((x) => x.sid);
      const pos = orderedActive.indexOf(id);
      if (pos === -1) return prev;
      const targetPos = direction === 'up' ? pos - 1 : pos + 1;
      if (targetPos < 0 || targetPos >= orderedActive.length) return prev;
      const other = orderedActive[targetPos]!;
      const ia = prev.indexOf(id);
      const ib = prev.indexOf(other);
      if (ia === -1 || ib === -1) return prev;
      const next = [...prev];
      [next[ia], next[ib]] = [next[ib]!, next[ia]!];
      return next;
    });
  }

  function sectionControls(id: string) {
    const active = [...statSections.map((s) => s.id), 'crime', ...(isGermany ? ['government'] : [])]
      .map((sid) => ({ sid, idx: sectionOrderIndex(sid) }))
      .sort((a, b) => a.idx - b.idx)
      .map((x) => x.sid);
    const pos = active.indexOf(id);
    const disableUp = pos <= 0;
    const disableDown = pos === -1 || pos >= active.length - 1;
    return (
      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => moveSection(id, 'up')}
          disabled={disableUp}
          className="rounded-md border border-white/[0.1] bg-card px-1.5 py-0.5 font-sans text-[10px] text-neutral-200 shadow-sm transition hover:border-white/[0.16] hover:bg-card-hover disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Move ${id} section up`}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => moveSection(id, 'down')}
          disabled={disableDown}
          className="rounded-md border border-white/[0.1] bg-card px-1.5 py-0.5 font-sans text-[10px] text-neutral-200 shadow-sm transition hover:border-white/[0.16] hover:bg-card-hover disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Move ${id} section down`}
        >
          ↓
        </button>
      </span>
    );
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-surface-app font-sans text-neutral-200 antialiased">
      <div className="sticky top-0 z-50 border-b border-line bg-[var(--shell-header)] shadow-header backdrop-blur-md supports-[backdrop-filter]:bg-[var(--shell-header)]">
        <div className="grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="justify-self-start font-sans text-[11px] uppercase tracking-wider text-neutral-500 transition-colors hover:text-white"
          >
            ← Back
          </button>
          <div className="justify-self-center text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Watch Tower</p>
          </div>
          <div className="flex items-center justify-self-end gap-3">
            <div className="hidden h-10 w-14 rounded-md border border-line bg-black/45 shadow-inset sm:flex sm:items-center sm:justify-center sm:px-2">
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
        {isGermany ? (
          <div className="mb-8">
            <GermanyDaxCarousel />
          </div>
        ) : null}

        {error ? (
          <p className="rounded-md border border-line bg-surface-metric shadow-card p-6 font-sans text-sm text-red-400/90">
            {error}
          </p>
        ) : null}

        {!error && ordered === null ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-md border border-line bg-surface-metric shadow-card"
              />
            ))}
          </div>
        ) : null}

        {ordered && ordered.length > 0 ? (
          <>
            {/* Removed top dataset/methodology notes to reduce visual density while preserving behavior. */}

            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (allExpanded) {
                    setCollapseSignal((n) => n + 1);
                    setAllExpanded(false);
                  } else {
                    setExpandSignal((n) => n + 1);
                    setAllExpanded(true);
                  }
                }}
                className="rounded-md border border-white/[0.1] bg-card px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-neutral-200 shadow-sm transition hover:border-white/[0.16] hover:bg-card-hover"
              >
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {statSections.map((section) => {
                const leadingRows = section.metrics
                  .map((name) => metricsByName.get(name))
                  .filter((r): r is CountryStatMetric => r != null);

                type NestedBlock =
                  | { type: 'metrics'; sub: MetricSubsection; subRows: CountryStatMetric[] }
                  | { type: 'germany_immigration'; sub: CustomSubsection }
                  | { type: 'germany_labor_income'; sub: CustomSubsection }
                  | { type: 'germany_health_basic'; sub: CustomSubsection }
                  | { type: 'germany_lgbt_stats'; sub: CustomSubsection }
                  | { type: 'germany_politics_leftism'; sub: CustomSubsection }
                  | { type: 'germany_abortion_stats'; sub: CustomSubsection };

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
                  if ('kind' in sub && sub.kind === 'germany_health_basic') {
                    if (iso3.toUpperCase() === 'DEU') {
                      nestedBlocks.push({ type: 'germany_health_basic', sub });
                    }
                    continue;
                  }
                  if ('kind' in sub && sub.kind === 'germany_lgbt_stats') {
                    if (iso3.toUpperCase() === 'DEU') {
                      nestedBlocks.push({ type: 'germany_lgbt_stats', sub });
                    }
                    continue;
                  }
                  if ('kind' in sub && sub.kind === 'germany_politics_leftism') {
                    if (iso3.toUpperCase() === 'DEU') {
                      nestedBlocks.push({ type: 'germany_politics_leftism', sub });
                    }
                    continue;
                  }
                  if ('kind' in sub && sub.kind === 'germany_abortion_stats') {
                    if (iso3.toUpperCase() === 'DEU') {
                      nestedBlocks.push({ type: 'germany_abortion_stats', sub });
                    }
                    continue;
                  }
                  const metricSub = sub as MetricSubsection;
                  const subRows = metricSub.metrics
                    .map((name: string) => metricsByName.get(name))
                    .filter((r): r is CountryStatMetric => r != null);
                  if (subRows.length > 0) nestedBlocks.push({ type: 'metrics', sub: metricSub, subRows });
                }

                if (leadingRows.length === 0 && nestedBlocks.length === 0) return null;

                const leadingTileCount =
                  section.id === 'population' && iso3.toUpperCase() === 'DEU'
                    ? germanyPopulationLeadingTileCount(leadingRows)
                    : leadingRows.length;

                const sectionCount =
                  leadingTileCount +
                  nestedBlocks.reduce((acc, b) => {
                    if (b.type === 'germany_immigration') return acc + GERMANY_IMMIGRATION_SUBSECTION_COUNT;
                    if (b.type === 'germany_labor_income') return acc + GERMANY_LABOR_INCOME_GROUP_COUNT;
                    if (b.type === 'germany_health_basic') return acc + GERMANY_HEALTH_BASIC_GROUP_COUNT;
                    if (b.type === 'germany_lgbt_stats') return acc + GERMANY_LGBT_SECTION_GROUP_COUNT;
                    if (b.type === 'germany_politics_leftism') return acc + GERMANY_POLITICS_LEFTISM_GROUP_COUNT;
                    if (b.type === 'germany_abortion_stats') return acc + GERMANY_ABORTION_SECTION_GROUP_COUNT;
                    if (b.type === 'metrics' && b.sub.id === 'birth_rates' && iso3.toUpperCase() === 'DEU') {
                      return acc + b.subRows.length + 1;
                    }
                    if (b.type === 'metrics') return acc + b.subRows.length;
                    return acc;
                  }, 0);

                return (
                  <div
                    key={section.id}
                    style={{ order: sectionOrderIndex(section.id) }}
                  >
                    <CollapsibleFlagSection
                      title={section.title}
                      count={sectionCount}
                      defaultOpen
                      headerControls={sectionControls(section.id)}
                      collapseSignal={collapseSignal}
                      expandSignal={expandSignal}
                    >
                    <div className="flex flex-col gap-4">
                      {leadingRows.length > 0 ? (
                        <div className={STAT_GRID}>
                          {section.id === 'population' && iso3.toUpperCase() === 'DEU'
                            ? renderGermanyPopulationLeadingTiles(leadingRows, iso3)
                            : leadingRows.map((row) => (
                                <Fragment key={row.metric}>{renderStatTile(row, { iso3 })}</Fragment>
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
                            collapseSignal={collapseSignal}
                              expandSignal={expandSignal}
                          >
                            <div className="flex flex-col gap-4">
                              <div className={STAT_GRID}>
                                {GERMANY_IMMIGRATION_TOP_METRICS.map((metric) => {
                                  const row = metricsByName.get(metric);
                                  return row ? (
                                    <Fragment key={metric}>
                                      {renderStatTile(row, {
                                        foreignStudentsPieCompact: metric === 'Foreign students by origin (pie)',
                                        iso3,
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
                            collapseSignal={collapseSignal}
                              expandSignal={expandSignal}
                          >
                            <GermanyLaborIncomeSection />
                          </CollapsibleFlagSection>
                        ) : block.type === 'germany_health_basic' ? (
                          <CollapsibleFlagSection
                            key={block.sub.id}
                            title={block.sub.title}
                            count={GERMANY_HEALTH_BASIC_GROUP_COUNT}
                            defaultOpen
                            collapseSignal={collapseSignal}
                              expandSignal={expandSignal}
                          >
                            <GermanyHealthBasicSection />
                          </CollapsibleFlagSection>
                        ) : block.type === 'germany_lgbt_stats' ? (
                          <CollapsibleFlagSection
                            key={block.sub.id}
                            title={block.sub.title}
                            count={GERMANY_LGBT_SECTION_GROUP_COUNT}
                            defaultOpen
                            collapseSignal={collapseSignal}
                              expandSignal={expandSignal}
                          >
                            <GermanyLgbtSection />
                          </CollapsibleFlagSection>
                        ) : block.type === 'germany_politics_leftism' ? (
                          <CollapsibleFlagSection
                            key={block.sub.id}
                            title={block.sub.title}
                            count={GERMANY_POLITICS_LEFTISM_GROUP_COUNT}
                            defaultOpen
                            collapseSignal={collapseSignal}
                              expandSignal={expandSignal}
                          >
                            <GermanyPoliticsLeftismSection />
                          </CollapsibleFlagSection>
                        ) : block.type === 'germany_abortion_stats' ? (
                          <CollapsibleFlagSection
                            key={block.sub.id}
                            title={block.sub.title}
                            count={GERMANY_ABORTION_SECTION_GROUP_COUNT}
                            defaultOpen
                            collapseSignal={collapseSignal}
                              expandSignal={expandSignal}
                          >
                            <GermanyAbortionStatisticsSection />
                          </CollapsibleFlagSection>
                        ) : (
                          <CollapsibleFlagSection
                            key={block.sub.id}
                            title={block.sub.title}
                            count={
                              block.subRows.length +
                              (block.sub.id === 'birth_rates' && iso3.toUpperCase() === 'DEU' ? 1 : 0)
                            }
                            defaultOpen
                            collapseSignal={collapseSignal}
                            expandSignal={expandSignal}
                          >
                            <div className="flex flex-col gap-4">
                              {block.sub.id === 'birth_rates' && iso3.toUpperCase() === 'DEU' ? (
                                <GermanyPopulationPyramid />
                              ) : null}
                              <div className={STAT_GRID}>
                                {block.subRows.map((row) => (
                                  <Fragment key={row.metric}>{renderStatTile(row, { iso3 })}</Fragment>
                                ))}
                              </div>
                            </div>
                          </CollapsibleFlagSection>
                        ),
                      )}
                    </div>
                    </CollapsibleFlagSection>
                  </div>
                );
              })}

            <div
              style={{ order: sectionOrderIndex('crime') }}
            >
              <CollapsibleFlagSection
                title="Crime"
                count={crimeRow ? (iso3.toUpperCase() === 'DEU' ? 14 : 8) : 0}
                defaultOpen
                headerControls={sectionControls('crime')}
                collapseSignal={collapseSignal}
                expandSignal={expandSignal}
              >
                <div className="flex flex-col gap-4">
                  <CollapsibleFlagSection
                    title="Crime Comparison"
                    count={crimeRow ? 8 : 0}
                    defaultOpen
                    collapseSignal={collapseSignal}
                    expandSignal={expandSignal}
                  >
                    <CrimeMetricsSection crimeRow={crimeRow} />
                  </CollapsibleFlagSection>
                  {iso3.toUpperCase() === 'DEU' ? (
                    <CollapsibleFlagSection
                      title="Migrant data"
                      count={15}
                      defaultOpen
                      collapseSignal={collapseSignal}
                      expandSignal={expandSignal}
                    >
                      <GermanyMigrantCrimeSection />
                    </CollapsibleFlagSection>
                  ) : null}
                </div>
              </CollapsibleFlagSection>
            </div>

            {iso3.toUpperCase() === 'DEU' ? (
              <div
                style={{ order: sectionOrderIndex('government') }}
              >
                <GermanyGovernmentSection
                  collapseSignal={collapseSignal}
                  expandSignal={expandSignal}
                  headerControls={sectionControls('government')}
                />
              </div>
            ) : null}
            </div>

            <section className="mt-10 rounded-md border border-line bg-surface-metric p-4 shadow-card ring-1 ring-white/[0.03] sm:p-6">
              <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Sources
              </h2>
              <ul className="mt-4 space-y-3">
                {sources.map((s) => (
                  <li
                    key={s.url}
                    className="flex flex-col gap-1 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                  >
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-xs text-[var(--uk-accent)] hover:text-neutral-200"
                    >
                      {s.name}
                    </a>
                    {s.date ? (
                      <span className="font-sans text-[10px] text-neutral-600">{s.date}</span>
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
