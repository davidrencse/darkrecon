import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import germanyGovernmentCsvRaw from '../../Assets/Data/Europe/Germany/Government Section/germany_government_politics.csv?raw';
import {
  clusterRowsByMetric,
  countGovernmentSectionStats,
  governmentRowsForGermany,
  type GermanyGovernmentPoliticsRow,
  parseGermanyGovernmentPoliticsCsv,
  rowsForSubsection,
} from '../lib/germanyGovernmentPolitics';
import { GermanyBundestagSeatsVisualization } from './GermanyBundestagSeatsVisualization';
import { GermanyPolicyCarousel } from './GermanyPolicyCarousel';
import {
  GOV_POLITICS_CARD_GRID,
  GovStatCard,
  renderMetricGroup,
  splitUrls,
} from './GermanyGovernmentPoliticsBlocks';
import { CollapsibleFlagSection } from './CollapsibleFlagSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const CSV_URL = '/data/germany_government_politics.csv';
const POLITICS_IMG_URL = '/germany/politics.png';

const SUBSECTIONS = [
  { id: 'parliament', title: 'Parliament', key: 'Parliament' as const },
  { id: 'policies', title: 'Policies', key: 'Policies' as const },
  { id: 'citizenship', title: 'Citizenship', key: 'Citizenship' as const },
];

const UC_TITLE = 'uppercase tracking-[0.05em]';
const UC_LABEL = 'uppercase tracking-[0.04em]';
const UC_META = 'uppercase tracking-[0.03em]';

function OverviewBlock({
  rows,
  coalitionSeatTotal,
}: {
  rows: GermanyGovernmentPoliticsRow[];
  coalitionSeatTotal?: GermanyGovernmentPoliticsRow;
}) {
  const [imageOpen, setImageOpen] = useState(false);
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

      <div className="rounded-md border border-line bg-surface-metric/80 p-3 shadow-inset">
        <h3 className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
          Government political chart
        </h3>
        <button
          type="button"
          onClick={() => setImageOpen(true)}
          className="mt-3 flex w-full justify-center rounded border border-transparent transition-colors hover:border-neutral-700"
          aria-label="Expand government political chart image"
        >
          <img
            src={POLITICS_IMG_URL}
            alt="Germany government and political context"
            className="w-full max-w-3xl rounded border border-line"
            loading="lazy"
          />
        </button>
        <p className="mt-2 font-sans text-[10px] text-neutral-600">Image: politics.png</p>
      </div>

      {imageOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md border border-white/[0.1] bg-card/95 px-3 py-1 font-sans text-xs text-neutral-200 shadow-sm backdrop-blur-sm transition hover:border-white/[0.18] hover:bg-card-hover"
            onClick={() => setImageOpen(false)}
          >
            Close
          </button>
          <img
            src={POLITICS_IMG_URL}
            alt="Germany government and political context expanded"
            className="max-h-[92vh] max-w-[96vw] rounded border border-neutral-700 shadow-2xl"
          />
        </div>
      ) : null}
    </div>
  );
}

function ParliamentGroups({ groups }: { groups: GermanyGovernmentPoliticsRow[][] }) {
  const totalSeatsGroup = groups.find((g) => g[0]!.metric.trim().toLowerCase() === 'total seats');
  const majorityThresholdGroup = groups.find((g) => g[0]!.metric.trim().toLowerCase() === 'majority threshold');

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
              <p className={`mt-2 font-sans text-[10px] leading-relaxed text-neutral-500 ${UC_META}`}>
                AfD 25-26%, CDU/CSU 25-26%, SPD 13-14%, Greens 13-15%, Die Linke 10-11%, Others 3-5% each.
              </p>
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
        {out}
      </div>
    </div>
  );
}

function CitizenshipGroups({ groups }: { groups: GermanyGovernmentPoliticsRow[][] }) {
  const naturalizationsGroup = groups.find((g) => g[0]!.metric.trim().toLowerCase() === 'naturalizations per year');
  const restGroups = groups.filter((g) => g[0]!.metric.trim().toLowerCase() !== 'naturalizations per year');
  const priorNationalityGroup = restGroups.find(
    (g) => g[0]!.metric.trim().toLowerCase() === 'naturalizations by prior nationality',
  );
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

  const ageGroupData = [
    { group: 'Under 20 years', count: 77590, fill: '#60a5fa' },
    { group: '20-45 years', count: 164235, fill: '#34d399' },
    { group: '45-65 years', count: 43325, fill: '#f59e0b' },
    { group: '65+ years', count: 6865, fill: '#f472b6' },
  ] as const;

  const ageGroupChartConfig = {
    count: { label: 'Naturalizations' },
    'Under 20 years': { label: 'Under 20 years', color: '#60a5fa' },
    '20-45 years': { label: '20-45 years', color: '#34d399' },
    '45-65 years': { label: '45-65 years', color: '#f59e0b' },
    '65+ years': { label: '65+ years', color: '#f472b6' },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-4">
      <div className={GOV_POLITICS_CARD_GRID}>
        {naturalizationsGroup ? (
          <GovStatCard
            row={{ ...naturalizationsGroup[0]!, breakdown: '', submetric: '' }}
            title="Naturalizations per year"
          />
        ) : null}
        <GovStatCard row={naturalizationRateRow} title="Naturalization Rate" />
        <GovStatCard row={avgProcessingTimeRow} title="Average Processing Time" />
      </div>

      <Card className="lg:col-span-1">
        <CardHeader className="space-y-1 p-3 pb-2">
          <CardTitle className={`text-sm text-neutral-100 ${UC_TITLE}`}>Naturalizations by Age Group (2024)</CardTitle>
          <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>
            Average age of new citizens: 30.4 years
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ChartContainer config={ageGroupChartConfig} className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ageGroupData} dataKey="count" nameKey="group" innerRadius={58} outerRadius={95} paddingAngle={2}>
                  {ageGroupData.map((entry) => (
                    <Cell key={entry.group} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => Number(value).toLocaleString('en-US')}
                      labelFormatter={(label) => String(label ?? '')}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            {ageGroupData.map((entry) => (
              <div key={entry.group} className="flex items-center justify-between gap-2 font-sans text-neutral-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: entry.fill }} />
                  <span>{entry.group}</span>
                </span>
                <span className="tabular-nums text-neutral-200">{entry.count.toLocaleString('en-US')}</span>
              </div>
            ))}
          </div>
          <div className="mt-1 font-sans text-[10px] text-neutral-500">
            <span className={UC_META}>Largest group: 20-45 years</span>
          </div>
        </CardContent>
      </Card>

      {priorNationalityGroup ? <div className={GOV_POLITICS_CARD_GRID}>{renderMetricGroup(priorNationalityGroup)}</div> : null}

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
          const subsectionCount = key === 'Citizenship' ? groups.length + 5 : groups.length;
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
                <GermanyPolicyCarousel policyRows={sorted} />
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
