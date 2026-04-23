import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import germanyGovernmentCsvRaw from '../../Assets/Data/Europe/Germany/Government Section/germany_government_politics.csv?raw';
import { GERMANY_IMMIGRATION_POLICIES_SUBSECTION_COUNT } from '../data/germanyImmigrationPolicies';
import {
  clusterRowsByMetric,
  countGovernmentSectionStats,
  governmentRowsForGermany,
  type GermanyGovernmentPoliticsRow,
  parseGermanyGovernmentPoliticsCsv,
  rowsForSubsection,
} from '../lib/germanyGovernmentPolitics';
import { GermanyBundestagSeatsVisualization } from './GermanyBundestagSeatsVisualization';
import { GermanyJewishGovernmentCarousel } from './GermanyJewishGovernmentCarousel';
import { GermanyImmigrationPoliciesSection } from './GermanyImmigrationPoliciesSection';
import { GermanyPolicyCarousel } from './GermanyPolicyCarousel';
import {
  GOV_POLITICS_CARD_GRID,
  GovStatCard,
  NaturalizationsPriorNationalityDataGrid,
  renderMetricGroup,
  splitUrls,
} from './GermanyGovernmentPoliticsBlocks';
import { CollapsibleFlagSection } from './CollapsibleFlagSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const CSV_URL = '/data/germany_government_politics.csv';
const SUBSECTIONS = [
  { id: 'parliament', title: 'Parliament', key: 'Parliament' as const },
  { id: 'policies', title: 'Policies', key: 'Policies' as const },
  { id: 'citizenship', title: 'Citizenship', key: 'Citizenship' as const },
];

const UC_TITLE = 'uppercase tracking-[0.05em]';
const UC_LABEL = 'uppercase tracking-[0.04em]';
const UC_META = 'uppercase tracking-[0.03em]';

const PARTY_MEMBERSHIP_SERIES = [
  { key: 'CDU', label: 'CDU', color: '#2563eb' },
  { key: 'SPD', label: 'SPD', color: '#ef4444' },
  { key: 'CSU', label: 'CSU', color: '#f59e0b' },
  { key: 'FDP', label: 'FDP', color: '#facc15' },
  { key: 'Greens', label: 'Greens', color: '#22c55e' },
  { key: 'DieLinke', label: 'Die Linke', color: '#e11d48' },
  { key: 'AfD', label: 'AfD', color: '#06b6d4' },
] as const;

type PartySeriesKey = (typeof PARTY_MEMBERSHIP_SERIES)[number]['key'];
type PartyMembershipPoint = {
  year: number;
} & Partial<Record<PartySeriesKey, number | null>>;

const PARTY_MEMBERSHIP_DATA: PartyMembershipPoint[] = [
  { year: 1950, CDU: 360000, SPD: 320000, CSU: 80000, FDP: 65000 },
  { year: 1955, CDU: 210000, SPD: 130000, CSU: 65000, FDP: 70000 },
  { year: 1960, CDU: 250000, SPD: 80000, CSU: 70000, FDP: 60000 },
  { year: 1965, CDU: 250000, SPD: 650000, CSU: 65000, FDP: 70000, Greens: null, DieLinke: null, AfD: null },
  { year: 1970, CDU: 300000, SPD: 800000, CSU: 75000, FDP: 80000, Greens: 0, DieLinke: null, AfD: null },
  { year: 1975, CDU: 660000, SPD: 980000, CSU: 85000, FDP: 90000, Greens: 10000, DieLinke: null, AfD: null },
  { year: 1980, CDU: 720000, SPD: 920000, CSU: 70000, FDP: 70000, Greens: 22000, DieLinke: null, AfD: null },
  { year: 1985, CDU: 690000, SPD: 900000, CSU: 70000, FDP: 70000, Greens: 35000, DieLinke: null, AfD: null },
  { year: 1990, CDU: 790000, SPD: 940000, CSU: 170000, FDP: 170000, Greens: 48000, DieLinke: 280000, AfD: null },
  { year: 1995, CDU: 660000, SPD: 820000, CSU: 100000, FDP: 100000, Greens: 55000, DieLinke: 150000, AfD: null },
  { year: 2000, CDU: 630000, SPD: 760000, CSU: 90000, FDP: 85000, Greens: 50000, DieLinke: 100000, AfD: null },
  { year: 2005, CDU: 580000, SPD: 610000, CSU: 75000, FDP: 65000, Greens: 50000, DieLinke: 70000, AfD: null },
  { year: 2010, CDU: 520000, SPD: 510000, CSU: 70000, FDP: 65000, Greens: 55000, DieLinke: 76000, AfD: null },
  { year: 2015, CDU: 450000, SPD: 450000, CSU: 60000, FDP: 55000, Greens: 60000, DieLinke: 63000, AfD: 20000 },
  { year: 2020, CDU: 400000, SPD: 400000, CSU: 70000, FDP: 65000, Greens: 90000, DieLinke: 60000, AfD: 33000 },
  { year: 2022, CDU: 384000, SPD: 380000, CSU: 76000, FDP: 78000, Greens: 125000, DieLinke: 58000, AfD: 35000 },
];

function formatMembers(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function GovernmentPartyMembershipChart() {
  const [focusedParty, setFocusedParty] = useState<PartySeriesKey | null>(null);

  const chartConfig = PARTY_MEMBERSHIP_SERIES.reduce(
    (acc, series) => {
      acc[series.key] = { label: series.label, color: series.color };
      return acc;
    },
    { members: { label: 'Members' } } as ChartConfig,
  );

  return (
    <Card className="border-line bg-surface-metric/80 shadow-inset">
      <CardHeader className="space-y-1 p-3 pb-2">
        <CardTitle className={`text-sm text-neutral-100 ${UC_TITLE}`}>Party Membership Trends</CardTitle>
        <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>
          Major German parties, 1950-2022. Hover a line or legend item to focus it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PARTY_MEMBERSHIP_DATA} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickMargin={8}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `Year ${String(label)}`}
                    formatter={(value) => formatMembers(Number(value))}
                  />
                }
              />
              {PARTY_MEMBERSHIP_SERIES.map((series) => {
                const isFocused = focusedParty === null || focusedParty === series.key;
                return (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label}
                    connectNulls
                    stroke={isFocused ? series.color : '#6b7280'}
                    strokeWidth={isFocused ? 2.3 : 1.8}
                    strokeOpacity={isFocused ? 1 : 0.45}
                    dot={false}
                    activeDot={{ r: 3.5 }}
                    isAnimationActive={false}
                    onMouseEnter={() => setFocusedParty(series.key)}
                    onMouseLeave={() => setFocusedParty(null)}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {PARTY_MEMBERSHIP_SERIES.map((series) => {
            const isFocused = focusedParty === null || focusedParty === series.key;
            return (
              <button
                key={series.key}
                type="button"
                className={`inline-flex items-center justify-between rounded-md border px-2 py-1.5 text-left transition-colors ${
                  isFocused
                    ? 'border-white/[0.22] bg-white/[0.06] text-neutral-200'
                    : 'border-white/[0.08] bg-white/[0.02] text-neutral-500'
                }`}
                onMouseEnter={() => setFocusedParty(series.key)}
                onMouseLeave={() => setFocusedParty(null)}
                aria-label={`Highlight ${series.label} line`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: series.color }} />
                  <span className={`font-sans text-[10px] ${UC_META}`}>{series.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewBlock({
  rows,
  coalitionSeatTotal,
}: {
  rows: GermanyGovernmentPoliticsRow[];
  coalitionSeatTotal?: GermanyGovernmentPoliticsRow;
}) {
  const byMetric = useMemo(() => {
    const m = new Map<string, GermanyGovernmentPoliticsRow>();
    for (const r of rows) m.set(r.metric.trim().toLowerCase(), r);
    return m;
  }, [rows]);

  const name = byMetric.get('head of government')?.value ?? '';
  const party = byMetric.get('head of government political party')?.value ?? '';
  const ideology = byMetric.get('head of government political ideology')?.value ?? '';
  const coalition = byMetric.get('governing coalition');

  const headNotes = [byMetric.get('head of government')?.notes, byMetric.get('head of government political party')?.notes, byMetric.get('head of government political ideology')?.notes]
    .filter(Boolean)
    .join('\n\n');

  const headUrls = splitUrls(
    [byMetric.get('head of government')?.sourceUrl, byMetric.get('head of government political party')?.sourceUrl]
      .filter(Boolean)
      .join('|'),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className={GOV_POLITICS_CARD_GRID}>
        <Card className="border-line bg-surface-metric">
          <CardHeader className="p-3">
            <CardTitle className={`text-sm text-neutral-100 ${UC_TITLE}`}>Head of government</CardTitle>
            <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>
              Chancellor, party, and ideology (from dataset)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0 font-sans text-sm text-neutral-200">
            <p>
              <span className={`text-neutral-500 ${UC_LABEL}`}>Name:</span> {name || '—'}
            </p>
            <p>
              <span className={`text-neutral-500 ${UC_LABEL}`}>Party:</span> {party || '—'}
            </p>
            <p>
              <span className={`text-neutral-500 ${UC_LABEL}`}>Ideology:</span> {ideology || '—'}
            </p>
            {headUrls.length > 0 ? (
              <div className="pt-1">
                {headUrls.slice(0, 2).map((u, i) => (
                  <a
                    key={u}
                    href={u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mr-3 inline-block text-[10px] text-[var(--uk-accent)] hover:text-neutral-200 ${UC_META}`}
                  >
                    Source {i + 1} ↗
                  </a>
                ))}
              </div>
            ) : null}
            {headNotes ? (
              <details className="mt-2 rounded border border-white/[0.06] bg-neutral-950/40 px-2 py-1.5">
                <summary className="cursor-pointer text-[9px] uppercase tracking-[0.12em] text-neutral-500">Note</summary>
                <pre className="mt-1.5 whitespace-pre-wrap text-[10px] leading-relaxed text-neutral-500">{headNotes}</pre>
              </details>
            ) : null}
          </CardContent>
        </Card>

        {coalition ? <GovStatCard row={coalition} title="Governing coalition" /> : null}
        {coalitionSeatTotal ? (
          <GovStatCard
            row={{ ...coalitionSeatTotal, breakdown: '', submetric: '' }}
            title="Coalition seat total"
          />
        ) : null}
      </div>

      <GovernmentPartyMembershipChart />
    </div>
  );
}

function ParliamentGroups({ groups }: { groups: GermanyGovernmentPoliticsRow[][] }) {
  const totalSeatsGroup = groups.find((g) => g[0]!.metric.trim().toLowerCase() === 'total seats');
  const majorityThresholdGroup = groups.find((g) => g[0]!.metric.trim().toLowerCase() === 'majority threshold');
  const trustInCivilServiceRow: GermanyGovernmentPoliticsRow = {
    section: 'Government',
    subsection: 'Parliament',
    metric: 'Trust in Civil Service',
    submetric: '',
    breakdown: '',
    value: '45',
    unit: 'percent',
    referenceYear: '2023',
    sourceName: 'OECD Survey on Drivers of Trust in Public Institutions',
    sourceUrl: '',
    notes: '2024 - Germany',
  };
  const trustInLocalGovernmentRow: GermanyGovernmentPoliticsRow = {
    section: 'Government',
    subsection: 'Parliament',
    metric: 'Trust in Local Government',
    submetric: '',
    breakdown: '',
    value: '45',
    unit: 'percent',
    referenceYear: '2023',
    sourceName: 'OECD Survey on Drivers of Trust in Public Institutions',
    sourceUrl: '',
    notes: '2024 - Germany',
  };

  const pollingData = [
    { party: 'AfD', percent: 26, fill: '#3b82f6' },
    { party: 'CDU/CSU', percent: 25, fill: '#111827' },
    { party: 'SPD', percent: 14, fill: '#ef4444' },
    { party: 'Greens', percent: 14, fill: '#22c55e' },
    { party: 'Die Linke', percent: 11, fill: '#ec4899' },
    { party: 'Others', percent: 5, fill: '#6b7280' },
  ] as const;

  const pollingConfig = {
    percent: { label: 'Polling share (%)' },
    AfD: { label: 'AfD', color: '#3b82f6' },
    'CDU/CSU': { label: 'CDU/CSU', color: '#111827' },
    SPD: { label: 'SPD', color: '#ef4444' },
    Greens: { label: 'Greens', color: '#22c55e' },
    'Die Linke': { label: 'Die Linke', color: '#ec4899' },
    Others: { label: 'Others', color: '#6b7280' },
  } satisfies ChartConfig;

  const out: ReactNode[] = [];
  let insertedTrust = false;
  for (const g of groups) {
    const m = g[0]!.metric.trim().toLowerCase();
    if (m === 'total seats' || m === 'majority threshold' || m === 'coalition seat total') continue;
    if (m === 'seats by party') {
      out.push(
        <div key="seats-by-party" className="col-span-1 sm:col-span-2 lg:col-span-3">
          <GermanyBundestagSeatsVisualization rows={g} />
        </div>,
      );
      continue;
    }
    if (!insertedTrust && m === 'trust in parliament') {
      insertedTrust = true;
      out.push(
        <div
          key="trust-divider"
          className="col-span-1 border-t border-line pt-4 sm:col-span-2 lg:col-span-3"
        >
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Public trust and integrity
          </p>
          <p className={`mt-1 font-sans text-[10px] leading-relaxed text-neutral-500 ${UC_META}`}>
            Trust in parliament, government, parties, courts, police; democracy satisfaction; perceived corruption (CPI
            proxy).
          </p>
        </div>,
      );
    }
    out.push(<Fragment key={g[0]!.metric}>{renderMetricGroup(g)}</Fragment>);
    if (m === 'perceived corruption') {
      out.push(
        <GovStatCard key="trust-in-civil-service" row={trustInCivilServiceRow} title="Trust in Civil Service" />,
        <GovStatCard
          key="trust-in-local-government"
          row={trustInLocalGovernmentRow}
          title="Trust in Local Government"
        />,
      );
    }
  }
  return (
    <div className="flex flex-col gap-4">
      {totalSeatsGroup || majorityThresholdGroup ? (
        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-3">
          <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2">
            {totalSeatsGroup ? (
              <GovStatCard
                key={totalSeatsGroup[0]!.metric}
                row={{ ...totalSeatsGroup[0]!, breakdown: '', submetric: '' }}
                title="Total seats"
              />
            ) : null}
            <Card className="h-full">
              <CardHeader className="space-y-1 p-3 pb-2">
                <CardTitle className={`text-sm text-neutral-100 ${UC_TITLE}`}>Voter turnout</CardTitle>
                <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>
                  Latest federal election context
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="font-sans text-2xl font-semibold text-white">82.5%</p>
                <p className={`mt-2 font-sans text-[10px] leading-relaxed text-neutral-500 ${UC_META}`}>
                  Highest since German reunification in 1990; +6.2 percentage points from 2021.
                </p>
              </CardContent>
            </Card>
            {majorityThresholdGroup ? (
              <GovStatCard
                key={majorityThresholdGroup[0]!.metric}
                row={{ ...majorityThresholdGroup[0]!, breakdown: '', submetric: '' }}
                title="Majority threshold"
              />
            ) : null}
            <Card className="h-full">
              <CardHeader className="space-y-1 p-3 pb-2">
                <CardTitle className={`text-sm text-neutral-100 ${UC_TITLE}`}>Registered voters</CardTitle>
                <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>Eligible electorate</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="font-sans text-2xl font-semibold text-white">60,510,631</p>
              </CardContent>
            </Card>
          </div>

          <Card className="h-full self-stretch">
            <CardHeader className="space-y-1 p-3 pb-2">
              <CardTitle className={`text-sm text-neutral-100 ${UC_TITLE}`}>Current polling trends</CardTitle>
              <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>
                Tight national race (INSA, FG Wahlen, Verian)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ChartContainer config={pollingConfig} className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pollingData} dataKey="percent" nameKey="party" innerRadius={58} outerRadius={88} paddingAngle={2}>
                      {pollingData.map((entry) => (
                        <Cell key={entry.party} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => `${Number(value).toFixed(0)}%`}
                          labelFormatter={(label) => String(label ?? '')}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                {pollingData.map((entry) => (
                  <div key={entry.party} className="flex items-center justify-between gap-2 font-sans text-neutral-400">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: entry.fill }} />
                      <span className={UC_META}>{entry.party}</span>
                    </span>
                    <span className="tabular-nums text-neutral-200">
                      {entry.party === 'AfD' || entry.party === 'CDU/CSU'
                        ? '25-26%'
                        : entry.party === 'SPD'
                          ? '13-14%'
                          : entry.party === 'Greens'
                            ? '13-15%'
                            : entry.party === 'Die Linke'
                              ? '10-11%'
                              : '3-5%'}
                    </span>
                  </div>
                ))}
              </div>
              <details className="mt-2 rounded border border-white/[0.06] bg-neutral-950/40 px-2 py-1.5">
                <summary className="cursor-pointer text-[9px] uppercase tracking-[0.12em] text-neutral-500">Note</summary>
                <p className="mt-1.5 font-sans text-[10px] leading-relaxed text-neutral-500">
                  AfD has made notable gains even in western states (e.g., historic ~19% in Baden-Württemberg state
                  election in March 2026).
                </p>
              </details>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className={GOV_POLITICS_CARD_GRID}>
      </div>

      <div className={GOV_POLITICS_CARD_GRID}>
        <GermanyJewishGovernmentCarousel />
      </div>

      <div className={GOV_POLITICS_CARD_GRID}>
        {out}
      </div>
    </div>
  );
}

function CitizenshipGroups({ groups }: { groups: GermanyGovernmentPoliticsRow[][] }) {
  const ageGroupChartRef = useRef<HTMLDivElement>(null);
  const ageGroupTooltipRef = useRef<HTMLDivElement>(null);
  const ageTooltipRafRef = useRef<number | null>(null);
  const ageTooltipPosRef = useRef<{ x: number; y: number } | null>(null);
  const [ageGroupHover, setAgeGroupHover] = useState<{
    group: string;
    count: number;
    percentage: string;
    color: string;
  } | null>(null);
  const naturalizationsGroup = groups.find((g) => g[0]!.metric.trim().toLowerCase() === 'naturalizations per year');
  const restGroups = groups.filter((g) => g[0]!.metric.trim().toLowerCase() !== 'naturalizations per year');
  const applicationsGroup = restGroups.find(
    (g) => g[0]!.metric.trim().toLowerCase() === 'applications for naturalization',
  );
  const remainingGroups = restGroups.filter((g) => {
    const metric = g[0]!.metric.trim().toLowerCase();
    return metric !== 'naturalizations by prior nationality' && metric !== 'applications for naturalization';
  });

  const avgAgeRow: GermanyGovernmentPoliticsRow = {
    section: 'Government',
    subsection: 'Citizenship',
    metric: 'Average Age of New Citizens',
    submetric: '',
    breakdown: '',
    value: '30.4',
    unit: 'years',
    referenceYear: '2024',
    sourceName: 'Destatis – 291 955 Einbürgerungen im Jahr 2024',
    sourceUrl: 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/06/PD25_204_125.html',
    notes: 'Overall average in 2024.',
  };

  const naturalizationRateRow: GermanyGovernmentPoliticsRow = {
    section: 'Government',
    subsection: 'Citizenship',
    metric: 'Naturalization Rate',
    submetric: '',
    breakdown: '',
    value: '3.3',
    unit: 'percent',
    referenceYear: '2024',
    sourceName: 'Destatis',
    sourceUrl: 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/06/PD25_204_125.html',
    notes: '',
  };

  const naturalizationRefusalRateRow: GermanyGovernmentPoliticsRow = {
    section: 'Government',
    subsection: 'Citizenship',
    metric: 'Naturalization Refusal Rate',
    submetric: '',
    breakdown: '',
    value: '28.4',
    unit: 'percent',
    referenceYear: '',
    sourceName: '',
    sourceUrl: '',
    notes: '',
  };

  const avgProcessingTimeRow: GermanyGovernmentPoliticsRow = {
    section: 'Government',
    subsection: 'Citizenship',
    metric: 'Average Processing Time',
    submetric: '',
    breakdown: '',
    value: '21',
    unit: 'months',
    referenceYear: '',
    sourceName: '',
    sourceUrl: '',
    notes: '',
  };

  const naturalizationsPerYearData = [
    { year: 2000, applications: 186672 },
    { year: 2001, applications: 178098 },
    { year: 2002, applications: 154547 },
    { year: 2003, applications: 140000 },
    { year: 2004, applications: 127000 },
    { year: 2005, applications: 117000 },
    { year: 2006, applications: 124000 },
    { year: 2007, applications: 113000 },
    { year: 2008, applications: 94500 },
    { year: 2009, applications: 96122 },
    { year: 2010, applications: 101570 },
    { year: 2011, applications: 106897 },
    { year: 2012, applications: 112348 },
    { year: 2013, applications: 112353 },
    { year: 2014, applications: 108422 },
    { year: 2015, applications: 107317 },
    { year: 2016, applications: 110383 },
    { year: 2017, applications: 112211 },
    { year: 2018, applications: 112340 },
    { year: 2019, applications: 128905 },
    { year: 2020, applications: 109880 },
    { year: 2021, applications: 131595 },
    { year: 2022, applications: 168775 },
    { year: 2023, applications: 200095 },
    { year: 2024, applications: 292020 },
    { year: 2025, applications: 310000 },
  ] as const;
  const totalNaturalizations = naturalizationsPerYearData.reduce((sum, row) => sum + row.applications, 0);
  const totalNaturalizationsRow: GermanyGovernmentPoliticsRow = {
    section: 'Government',
    subsection: 'Citizenship',
    metric: 'Total Naturalizations',
    submetric: '',
    breakdown: '',
    value: String(totalNaturalizations),
    unit: 'applications',
    referenceYear: '2000-2025',
    sourceName: naturalizationsGroup?.[0]?.sourceName ?? 'Manual yearly dataset',
    sourceUrl: naturalizationsGroup?.[0]?.sourceUrl ?? '',
    notes: 'Sum of yearly applications for naturalization from 2000 through 2025.',
  };
  const naturalizationsPerYearConfig = {
    applications: { label: 'Applications for Naturalization', color: '#60a5fa' },
  } satisfies ChartConfig;

  const ageGroupData = [
    { group: 'Under 20 years', count: 912000, percentage: '24.95%', fill: '#60a5fa' },
    { group: '20-45 years', count: 2085000, percentage: '57.03%', fill: '#34d399' },
    { group: '45-65 years', count: 558000, percentage: '15.26%', fill: '#f59e0b' },
    { group: '65+ years', count: 101050, percentage: '2.76%', fill: '#f472b6' },
  ] as const;

  const ageGroupChartConfig = {
    count: { label: 'Naturalizations' },
    'Under 20 years': { label: 'Under 20 years', color: '#60a5fa' },
    '20-45 years': { label: '20-45 years', color: '#34d399' },
    '45-65 years': { label: '45-65 years', color: '#f59e0b' },
    '65+ years': { label: '65+ years', color: '#f472b6' },
  } satisfies ChartConfig;

  function getLocalChartPosition(eventLike: unknown): { x: number; y: number } | null {
    const e = eventLike as {
      chartX?: number;
      chartY?: number;
      x?: number;
      y?: number;
      clientX?: number;
      clientY?: number;
      pageX?: number;
      pageY?: number;
      nativeEvent?: { clientX?: number; clientY?: number };
    };
    if (typeof e.chartX === 'number' && typeof e.chartY === 'number') return { x: e.chartX, y: e.chartY };
    if (typeof e.x === 'number' && typeof e.y === 'number') return { x: e.x, y: e.y };
    const rect = ageGroupChartRef.current?.getBoundingClientRect();
    const clientX = e.nativeEvent?.clientX ?? e.clientX ?? e.pageX;
    const clientY = e.nativeEvent?.clientY ?? e.clientY ?? e.pageY;
    if (!rect || typeof clientX !== 'number' || typeof clientY !== 'number') return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function moveAgeTooltip(pos: { x: number; y: number }) {
    ageTooltipPosRef.current = pos;
    if (ageTooltipRafRef.current !== null) return;
    ageTooltipRafRef.current = requestAnimationFrame(() => {
      ageTooltipRafRef.current = null;
      const el = ageGroupTooltipRef.current;
      const p = ageTooltipPosRef.current;
      if (!el || !p) return;
      el.style.left = `${p.x + 10}px`;
      el.style.top = `${p.y + 10}px`;
    });
  }

  useEffect(() => {
    return () => {
      if (ageTooltipRafRef.current !== null) cancelAnimationFrame(ageTooltipRafRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className={GOV_POLITICS_CARD_GRID}>
        <GovStatCard row={totalNaturalizationsRow} title="Total Naturalizations" />
        <GovStatCard row={naturalizationRateRow} title="Naturalization Rate" />
        <GovStatCard row={avgProcessingTimeRow} title="Average Processing Time" />
      </div>

      <Card className="lg:col-span-1">
        <CardHeader className="space-y-1 p-3 pb-2">
          <CardTitle className={`text-sm text-neutral-100 ${UC_TITLE}`}>Naturalizations per year</CardTitle>
          <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>
            Applications for Naturalization (2000-2025)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ChartContainer config={naturalizationsPerYearConfig} className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={naturalizationsPerYearData} margin={{ top: 10, right: 10, left: 8, bottom: 6 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={70}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickFormatter={(value) => Number(value).toLocaleString('en-US')}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#60a5fa"
                  strokeWidth={2.3}
                  dot={false}
                  activeDot={{ r: 3.5 }}
                  name="Applications for Naturalization"
                  isAnimationActive={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `Year ${String(label ?? '')}`}
                      formatter={(value) => Number(value).toLocaleString('en-US')}
                    />
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader className="space-y-1 p-3 pb-2">
          <CardTitle className={`text-sm text-neutral-100 ${UC_TITLE}`}>Naturalizations by Age Group</CardTitle>
          <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>
            Average age of new citizens: 30.4 years
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div ref={ageGroupChartRef} className="relative" onMouseLeave={() => setAgeGroupHover(null)}>
            <ChartContainer config={ageGroupChartConfig} className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart onMouseLeave={() => setAgeGroupHover(null)}>
                  <Pie
                    data={ageGroupData}
                    dataKey="count"
                    nameKey="group"
                    innerRadius={58}
                    outerRadius={95}
                    paddingAngle={2}
                    onMouseEnter={(sliceData: unknown, _idx: number, event: unknown) => {
                      const d = sliceData as { group?: string; count?: number; percentage?: string; fill?: string };
                      const pos = getLocalChartPosition(event);
                      if (!pos || typeof d.group !== 'string' || typeof d.count !== 'number') return;
                      moveAgeTooltip(pos);
                      setAgeGroupHover({
                        group: d.group,
                        count: d.count,
                        percentage: d.percentage ?? '',
                        color: d.fill ?? '#60a5fa',
                      });
                    }}
                    onMouseMove={(sliceData: unknown, _idx: number, event: unknown) => {
                      const d = sliceData as { group?: string; count?: number; percentage?: string; fill?: string };
                      const pos = getLocalChartPosition(event);
                      if (!pos || typeof d.group !== 'string' || typeof d.count !== 'number') return;
                      moveAgeTooltip(pos);
                      setAgeGroupHover((prev) => {
                        if (
                          prev &&
                          prev.group === d.group &&
                          prev.count === d.count &&
                          prev.percentage === (d.percentage ?? '') &&
                          prev.color === (d.fill ?? '#60a5fa')
                        ) {
                          return prev;
                        }
                        return {
                          group: d.group,
                          count: d.count,
                          percentage: d.percentage ?? '',
                          color: d.fill ?? '#60a5fa',
                        };
                      });
                    }}
                  >
                    {ageGroupData.map((entry) => (
                      <Cell key={entry.group} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            {ageGroupHover ? (
              <div
                ref={ageGroupTooltipRef}
                className="pointer-events-none absolute z-20 min-w-[220px] rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs shadow-lg"
                style={{ left: 0, top: 0 }}
              >
                <p className="mb-1 font-sans text-neutral-200">{ageGroupHover.group}</p>
                <div className="flex items-center justify-between gap-2 font-sans">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: ageGroupHover.color }} />
                    <span>Naturalizations</span>
                  </div>
                  <span className="text-neutral-100">
                    {ageGroupHover.count.toLocaleString('en-US')} ({ageGroupHover.percentage})
                  </span>
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            {ageGroupData.map((entry) => (
              <div key={entry.group} className="flex items-center justify-between gap-2 font-sans text-neutral-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: entry.fill }} />
                  <span>{entry.group}</span>
                </span>
                <span className="tabular-nums text-neutral-200">
                  {entry.count.toLocaleString('en-US')} ({entry.percentage})
                </span>
              </div>
            ))}
          </div>
          <div className="mt-1 font-sans text-[10px] text-neutral-500">
            <span className={UC_META}>Largest group: 20-45 years</span>
          </div>
        </CardContent>
      </Card>

      <div className={GOV_POLITICS_CARD_GRID}>
        <NaturalizationsPriorNationalityDataGrid />
      </div>

      <div className={GOV_POLITICS_CARD_GRID}>
        {applicationsGroup ? (
          <GovStatCard
            row={{ ...applicationsGroup[0]!, breakdown: '', submetric: '' }}
            title="Applications for naturalization"
          />
        ) : null}
        <GovStatCard row={avgAgeRow} title="Average Age of New Citizens" />
        <GovStatCard row={naturalizationRefusalRateRow} title="Naturalization Refusal Rate" />
      </div>

      <div className={GOV_POLITICS_CARD_GRID}>{remainingGroups.map((g) => renderMetricGroup(g))}</div>
    </div>
  );
}

export function GermanyGovernmentSection({
  collapseSignal,
  expandSignal,
  headerControls,
}: {
  collapseSignal?: number;
  expandSignal?: number;
  headerControls?: ReactNode;
}) {
  const [raw, setRaw] = useState(germanyGovernmentCsvRaw);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(CSV_URL);
        const text = res.ok ? await res.text() : '';
        if (!cancelled && text.trim()) {
          setRaw(text);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load government data.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allRows = useMemo(() => parseGermanyGovernmentPoliticsCsv(raw), [raw]);
  const germanyRows = useMemo(() => governmentRowsForGermany(allRows), [allRows]);
  const overviewRows = useMemo(() => rowsForSubsection(germanyRows, 'Overview'), [germanyRows]);
  const coalitionSeatTotalOverviewRow = useMemo(
    () =>
      rowsForSubsection(germanyRows, 'Parliament').find(
        (r) => r.metric.trim().toLowerCase() === 'coalition seat total',
      ),
    [germanyRows],
  );

  const outerCount = useMemo(() => countGovernmentSectionStats(allRows), [allRows]);

  const sanity = useMemo(() => {
    if (allRows.length === 0) return 'CSV parsed 0 rows — check file and headers.';
    if (germanyRows.length === 0) return 'No rows with Section=Government.';
    return null;
  }, [allRows.length, germanyRows.length]);

  return (
    <CollapsibleFlagSection
      title="Government"
      count={outerCount}
      defaultOpen
      headerControls={headerControls}
      collapseSignal={collapseSignal}
      expandSignal={expandSignal}
    >
      <div className="flex flex-col gap-4">
        {loadError ? <p className="font-sans text-xs text-amber-500/90">{loadError}</p> : null}
        {sanity ? <p className="font-sans text-xs text-neutral-500">{sanity}</p> : null}
        <OverviewBlock rows={overviewRows} coalitionSeatTotal={coalitionSeatTotalOverviewRow} />

        {SUBSECTIONS.map(({ id, title, key }) => {
          const sorted = rowsForSubsection(germanyRows, key);
          const groups = clusterRowsByMetric(sorted);
          if (groups.length === 0) return null;
          const subsectionCount =
            key === 'Citizenship'
              ? groups.length + 5
              : key === 'Parliament'
                ? groups.length + 1
                : key === 'Policies'
                  ? groups.length + GERMANY_IMMIGRATION_POLICIES_SUBSECTION_COUNT
                  : groups.length;
          return (
            <CollapsibleFlagSection
              key={id}
              title={title}
              count={subsectionCount}
              defaultOpen
              uppercaseTitle
              collapseSignal={collapseSignal}
              expandSignal={expandSignal}
            >
              {key === 'Parliament' ? (
                <ParliamentGroups groups={groups} />
              ) : key === 'Policies' ? (
                <div className="flex flex-col gap-3">
                  <GermanyPolicyCarousel policyRows={sorted} />
                  <CollapsibleFlagSection
                    title="Immigration Policies"
                    count={GERMANY_IMMIGRATION_POLICIES_SUBSECTION_COUNT}
                    defaultOpen
                    uppercaseTitle
                    collapseSignal={collapseSignal}
                    expandSignal={expandSignal}
                  >
                    <GermanyImmigrationPoliciesSection />
                  </CollapsibleFlagSection>
                </div>
              ) : key === 'Citizenship' ? (
                <CitizenshipGroups groups={groups} />
              ) : (
                <div className={GOV_POLITICS_CARD_GRID}>{groups.map((g) => renderMetricGroup(g))}</div>
              )}
            </CollapsibleFlagSection>
          );
        })}

        <p className={`font-sans text-[10px] leading-relaxed text-neutral-600 ${UC_META}`}>
          Primary table:{' '}
          <code className="text-neutral-500">germany_government_politics.csv</code> (Government and Economic labor rows).
          Values, years, and notes follow that file.
        </p>
      </div>
    </CollapsibleFlagSection>
  );
}
