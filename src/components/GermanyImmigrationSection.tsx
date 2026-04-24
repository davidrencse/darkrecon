import { useEffect, useState } from 'react';
import germanyTreemapCsvRaw from '../../Assets/Data/Europe/Germany/germany_populationpyramid_2024_treemap_labeled_items.csv?raw';
import { cn } from '../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from './ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  type GermanyImmigrationTreemapItem,
  parseGermanyTreemapCsv,
} from '../lib/germanyImmigrationTreemapData';
import { GermanyImmigrationTreemap } from './GermanyImmigrationTreemap';

const TREEMAP_CSV_URL = '/data/germany_immigration_treemap_labeled_items.csv';
const REFUGEE_TOTAL_2024 = 3_304_000;
const WORK_VISAS_2021_2025 = 579_000;
const MIGRANT_BACKGROUND_2024_2025 = 25_000_000;

const REFUGEE_BREAKDOWN_2024 = [
  { country: 'Ukraine', count: 1_098_760 },
  { country: 'Syria', count: 712_985 },
  { country: 'Afghanistan', count: 347_550 },
  { country: 'Iraq', count: 189_545 },
  { country: 'Turkey', count: 157_290 },
  { country: 'Iran', count: 72_510 },
  { country: 'Russian Federation', count: 69_400 },
  { country: 'Eritrea', count: 67_445 },
  { country: 'Somalia', count: 49_195 },
  { country: 'Kosovo', count: 40_820 },
  { country: 'Nigeria', count: 34_140 },
  { country: 'Serbia', count: 32_000 },
  { country: 'Pakistan', count: 20_460 },
  { country: 'Bosnia and Herzegovina', count: 18_445 },
  { country: 'Azerbaijan', count: 17_440 },
  { country: 'Armenia', count: 17_055 },
  { country: 'Guinea', count: 16_670 },
  { country: 'Stateless', count: 16_255 },
  { country: 'Lebanon', count: 16_005 },
  { country: 'Georgia', count: 15_400 },
  { country: 'Vietnam', count: 15_400 },
  { country: 'Ethiopia', count: 12_765 },
  { country: 'North Macedonia', count: 12_050 },
  { country: 'Albania', count: 11_810 },
  { country: 'Venezuela', count: 9_375 },
  { country: 'Colombia', count: 8_555 },
  { country: 'Moldova', count: 8_350 },
  { country: 'Sri Lanka', count: 7_395 },
  { country: 'Egypt', count: 7_330 },
  { country: 'Cameroon', count: 7_220 },
] as const;

const ASYLUM_APPLICATIONS_2025 = [
  { country: 'Afghanistan', applications: 64_104 },
  { country: 'Syria', applications: 24_240 },
  { country: 'Turkey', applications: 14_686 },
  { country: 'Somalia', applications: 4_713 },
  { country: 'Iraq', applications: 4_907 },
  { country: 'Russia', applications: 3_943 },
  { country: 'Eritrea', applications: 2_572 },
  { country: 'Iran', applications: 2_873 },
  { country: 'Guinea', applications: 2_238 },
  { country: 'Vietnam', applications: 1_993 },
  { country: 'Other', applications: 42_274 },
] as const;

const ASYLUM_PIE_COLORS = [
  '#f59e0b',
  '#22c55e',
  '#60a5fa',
  '#c084fc',
  '#f43f5e',
  '#38bdf8',
  '#84cc16',
  '#fb7185',
  '#14b8a6',
  '#eab308',
  '#a3a3a3',
];

const ASYLUM_TOTAL_2025 = ASYLUM_APPLICATIONS_2025.reduce((sum, row) => sum + row.applications, 0);

const ASYLUM_APPLICATIONS_2025_PIE = ASYLUM_APPLICATIONS_2025.map((row, index) => ({
  ...row,
  sharePct: ASYLUM_TOTAL_2025 > 0 ? (row.applications / ASYLUM_TOTAL_2025) * 100 : 0,
  fill: ASYLUM_PIE_COLORS[index % ASYLUM_PIE_COLORS.length],
}));

const ASYLUM_SHARE_BY_COUNTRY: Record<string, number> = Object.fromEntries(
  ASYLUM_APPLICATIONS_2025_PIE.map((row) => [row.country, row.sharePct]),
);

const refugeesChartConfig: ChartConfig = {
  count: {
    label: 'Refugees',
    color: 'var(--uk-accent)',
  },
};

const asylumChartConfig: ChartConfig = {
  applications: {
    label: 'Asylum applications',
    color: 'var(--uk-accent)',
  },
};

type MigrantArrivalsSeriesKey = 'total' | 'europe' | 'nonEurope' | 'africa';

type MigrantArrivalsRow = {
  year: string;
  total: number;
  totalDisplay: string;
  europe: number;
  europeDisplay: string;
  nonEurope: number;
  nonEuropeDisplay: string;
  africa: number;
  africaDisplay: string;
};

const MIGRANT_ARRIVALS_SERIES: readonly MigrantArrivalsRow[] = [
  {
    year: '2000',
    total: 841158,
    totalDisplay: '841,158',
    europe: 649249,
    europeDisplay: '649,249',
    nonEurope: 191909,
    nonEuropeDisplay: '191,909',
    africa: 25000,
    africaDisplay: '~25,000',
  },
  {
    year: '2001',
    total: 879217,
    totalDisplay: '879,217',
    europe: 685259,
    europeDisplay: '685,259',
    nonEurope: 193958,
    nonEuropeDisplay: '193,958',
    africa: 26000,
    africaDisplay: '~26,000',
  },
  {
    year: '2002',
    total: 842543,
    totalDisplay: '842,543',
    europe: 658341,
    europeDisplay: '658,341',
    nonEurope: 184202,
    nonEuropeDisplay: '184,202',
    africa: 27000,
    africaDisplay: '~27,000',
  },
  {
    year: '2003',
    total: 768975,
    totalDisplay: '768,975',
    europe: 601759,
    europeDisplay: '601,759',
    nonEurope: 167216,
    nonEuropeDisplay: '167,216',
    africa: 28000,
    africaDisplay: '~28,000',
  },
  {
    year: '2004',
    total: 780175,
    totalDisplay: '780,175',
    europe: 602182,
    europeDisplay: '602,182',
    nonEurope: 177993,
    nonEuropeDisplay: '177,993',
    africa: 29000,
    africaDisplay: '~29,000',
  },
  {
    year: '2005',
    total: 707352,
    totalDisplay: '707,352',
    europe: 550000,
    europeDisplay: '~550,000',
    nonEurope: 157000,
    nonEuropeDisplay: '~157,000',
    africa: 30000,
    africaDisplay: '~30,000',
  },
  {
    year: '2006',
    total: 680000,
    totalDisplay: '~680,000',
    europe: 520000,
    europeDisplay: '~520,000',
    nonEurope: 160000,
    nonEuropeDisplay: '~160,000',
    africa: 32000,
    africaDisplay: '~32,000',
  },
  {
    year: '2007',
    total: 670000,
    totalDisplay: '~670,000',
    europe: 510000,
    europeDisplay: '~510,000',
    nonEurope: 160000,
    nonEuropeDisplay: '~160,000',
    africa: 33000,
    africaDisplay: '~33,000',
  },
  {
    year: '2008',
    total: 680000,
    totalDisplay: '~680,000',
    europe: 500000,
    europeDisplay: '~500,000',
    nonEurope: 180000,
    nonEuropeDisplay: '~180,000',
    africa: 35000,
    africaDisplay: '~35,000',
  },
  {
    year: '2009',
    total: 650000,
    totalDisplay: '~650,000',
    europe: 480000,
    europeDisplay: '~480,000',
    nonEurope: 170000,
    nonEuropeDisplay: '~170,000',
    africa: 36000,
    africaDisplay: '~36,000',
  },
  {
    year: '2010',
    total: 640000,
    totalDisplay: '~640,000',
    europe: 470000,
    europeDisplay: '~470,000',
    nonEurope: 170000,
    nonEuropeDisplay: '~170,000',
    africa: 37000,
    africaDisplay: '~37,000',
  },
  {
    year: '2011',
    total: 680000,
    totalDisplay: '~680,000',
    europe: 480000,
    europeDisplay: '~480,000',
    nonEurope: 200000,
    nonEuropeDisplay: '~200,000',
    africa: 40000,
    africaDisplay: '~40,000',
  },
  {
    year: '2012',
    total: 720000,
    totalDisplay: '~720,000',
    europe: 490000,
    europeDisplay: '~490,000',
    nonEurope: 230000,
    nonEuropeDisplay: '~230,000',
    africa: 42000,
    africaDisplay: '~42,000',
  },
  {
    year: '2013',
    total: 780000,
    totalDisplay: '~780,000',
    europe: 520000,
    europeDisplay: '~520,000',
    nonEurope: 260000,
    nonEuropeDisplay: '~260,000',
    africa: 45000,
    africaDisplay: '~45,000',
  },
  {
    year: '2014',
    total: 950000,
    totalDisplay: '~950,000',
    europe: 650000,
    europeDisplay: '~650,000',
    nonEurope: 300000,
    nonEuropeDisplay: '~300,000',
    africa: 50000,
    africaDisplay: '~50,000',
  },
  {
    year: '2015',
    total: 2136954,
    totalDisplay: '2,136,954',
    europe: 1036000,
    europeDisplay: '~1,036,000',
    nonEurope: 1100000,
    nonEuropeDisplay: '~1,100,000+',
    africa: 80000,
    africaDisplay: '~80,000+',
  },
  {
    year: '2016',
    total: 1900000,
    totalDisplay: '~1,900,000',
    europe: 1050000,
    europeDisplay: '~1,050,000',
    nonEurope: 850000,
    nonEuropeDisplay: '~850,000',
    africa: 90000,
    africaDisplay: '~90,000',
  },
  {
    year: '2017',
    total: 1550000,
    totalDisplay: '~1,550,000',
    europe: 850000,
    europeDisplay: '~850,000',
    nonEurope: 700000,
    nonEuropeDisplay: '~700,000',
    africa: 85000,
    africaDisplay: '~85,000',
  },
  {
    year: '2018',
    total: 1400000,
    totalDisplay: '~1,400,000',
    europe: 750000,
    europeDisplay: '~750,000',
    nonEurope: 650000,
    nonEuropeDisplay: '~650,000',
    africa: 80000,
    africaDisplay: '~80,000',
  },
  {
    year: '2019',
    total: 1300000,
    totalDisplay: '~1,300,000',
    europe: 680000,
    europeDisplay: '~680,000',
    nonEurope: 620000,
    nonEuropeDisplay: '~620,000',
    africa: 75000,
    africaDisplay: '~75,000',
  },
  {
    year: '2020',
    total: 995938,
    totalDisplay: '995,938',
    europe: 546000,
    europeDisplay: '~546,000',
    nonEurope: 450000,
    nonEuropeDisplay: '~450,000',
    africa: 45000,
    africaDisplay: '~45,000',
  },
  {
    year: '2021',
    total: 1186702,
    totalDisplay: '1,186,702',
    europe: 636000,
    europeDisplay: '~636,000',
    nonEurope: 550000,
    nonEuropeDisplay: '~550,000',
    africa: 60000,
    africaDisplay: '~60,000',
  },
  {
    year: '2022',
    total: 2665772,
    totalDisplay: '2,665,772',
    europe: 2010890,
    europeDisplay: '2,010,890',
    nonEurope: 655000,
    nonEuropeDisplay: '~655,000',
    africa: 90000,
    africaDisplay: '~90,000',
  },
  {
    year: '2023',
    total: 1932509,
    totalDisplay: '1,932,509',
    europe: 1299997,
    europeDisplay: '1,299,997 (incl. Ukraine heavy)',
    nonEurope: 632512,
    nonEuropeDisplay: '~632,512',
    africa: 95000,
    africaDisplay: '~95,000',
  },
  {
    year: '2024',
    total: 1694192,
    totalDisplay: '1,694,192',
    europe: 1131103,
    europeDisplay: '~1,131,103',
    nonEurope: 563089,
    nonEuropeDisplay: '~563,089',
    africa: 85000,
    africaDisplay: '~85,000',
  },
  {
    year: '2025',
    total: 1481299,
    totalDisplay: '1,481,299',
    europe: 972578,
    europeDisplay: '~972,578',
    nonEurope: 508721,
    nonEuropeDisplay: '~508,721',
    africa: 80000,
    africaDisplay: '~80,000',
  },
];

const migrantArrivalsChartConfig = {
  total: { label: 'Total migrants (arrivals)', color: '#f59e0b' },
  europe: { label: 'Migrants from European countries', color: '#22c55e' },
  nonEurope: { label: 'Migrants from non-European countries', color: '#38bdf8' },
  africa: { label: 'Migrants from Africa', color: '#c084fc' },
} satisfies ChartConfig;

const SERIES_ORDER: readonly { key: MigrantArrivalsSeriesKey; label: string }[] = [
  { key: 'total', label: 'Total migrants (arrivals)' },
  { key: 'europe', label: 'European countries' },
  { key: 'nonEurope', label: 'Non-European countries' },
  { key: 'africa', label: 'Africa' },
];

function GermanyMigrantArrivalsInteractiveChart() {
  const [hoveredKey, setHoveredKey] = useState<MigrantArrivalsSeriesKey | null>(null);

  const dim = (key: MigrantArrivalsSeriesKey) =>
    hoveredKey !== null && hoveredKey !== key ? 'dimmed' : 'focus';

  const strokeFor = (key: MigrantArrivalsSeriesKey) => {
    const grey = '#737373';
    const colors = {
      total: '#f59e0b',
      europe: '#22c55e',
      nonEurope: '#38bdf8',
      africa: '#c084fc',
    } as const;
    return dim(key) === 'dimmed' ? grey : colors[key];
  };

  const opacityFor = (key: MigrantArrivalsSeriesKey) => (dim(key) === 'dimmed' ? 0.28 : 1);

  const widthFor = (key: MigrantArrivalsSeriesKey) =>
    hoveredKey === key || hoveredKey === null ? (hoveredKey === key ? 3.25 : 2.5) : 2;

  return (
    <div className="space-y-3" onMouseLeave={() => setHoveredKey(null)}>
      <ChartContainer config={migrantArrivalsChartConfig} className="h-[380px] w-full font-sans">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={MIGRANT_ARRIVALS_SERIES} margin={{ top: 8, right: 8, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: 'rgba(163,163,163,0.9)', fontSize: 10, fontFamily: 'ui-sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value))
              }
              tick={{ fill: 'rgba(163,163,163,0.9)', fontSize: 10, fontFamily: 'ui-sans-serif' }}
              axisLine={false}
              tickLine={false}
              width={48}
              domain={[0, 'auto']}
              label={{
                value: 'Arrivals',
                angle: -90,
                position: 'insideLeft',
                fill: 'rgba(163,163,163,0.65)',
                fontSize: 9,
              }}
            />
            <ChartTooltip
              cursor={{ stroke: 'rgba(255,255,255,0.12)' }}
              content={
                <ChartTooltipContent
                  className="rounded-md max-w-[min(100vw-2rem,320px)]"
                  labelFormatter={(_, payload) => {
                    const row = (payload as { payload?: MigrantArrivalsRow }[] | undefined)?.[0]?.payload;
                    return row ? `Year ${row.year}` : '';
                  }}
                  formatter={(_v, _entryLabel, item) => {
                    const entry = item as { payload?: MigrantArrivalsRow; dataKey?: unknown };
                    const row = entry.payload;
                    const dk = String(entry.dataKey ?? '');
                    if (!row) return '—';
                    if (dk === 'total') return row.totalDisplay;
                    if (dk === 'europe') return row.europeDisplay;
                    if (dk === 'nonEurope') return row.nonEuropeDisplay;
                    if (dk === 'africa') return row.africaDisplay;
                    return '—';
                  }}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total migrants (arrivals)"
              stroke={strokeFor('total')}
              strokeOpacity={opacityFor('total')}
              strokeWidth={widthFor('total')}
              dot={{ r: hoveredKey === 'total' ? 3 : 2 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
              onMouseEnter={() => setHoveredKey('total')}
            />
            <Line
              type="monotone"
              dataKey="europe"
              name="Migrants from European countries"
              stroke={strokeFor('europe')}
              strokeOpacity={opacityFor('europe')}
              strokeWidth={widthFor('europe')}
              dot={{ r: hoveredKey === 'europe' ? 3 : 2 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
              onMouseEnter={() => setHoveredKey('europe')}
            />
            <Line
              type="monotone"
              dataKey="nonEurope"
              name="Migrants from non-European countries"
              stroke={strokeFor('nonEurope')}
              strokeOpacity={opacityFor('nonEurope')}
              strokeWidth={widthFor('nonEurope')}
              dot={{ r: hoveredKey === 'nonEurope' ? 3 : 2 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
              onMouseEnter={() => setHoveredKey('nonEurope')}
            />
            <Line
              type="monotone"
              dataKey="africa"
              name="Migrants from Africa"
              stroke={strokeFor('africa')}
              strokeOpacity={opacityFor('africa')}
              strokeWidth={widthFor('africa')}
              dot={{ r: hoveredKey === 'africa' ? 3 : 2 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
              onMouseEnter={() => setHoveredKey('africa')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-1">
        {SERIES_ORDER.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1 font-sans text-[11px] text-neutral-300 transition-colors',
              hoveredKey === key ? 'bg-white/[0.08] text-neutral-100' : 'hover:bg-white/[0.05]',
            )}
            onMouseEnter={() => setHoveredKey(key)}
          >
            <span
              className="h-0.5 w-6 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  hoveredKey !== null && hoveredKey !== key ? '#737373' : migrantArrivalsChartConfig[key].color,
                opacity: hoveredKey !== null && hoveredKey !== key ? 0.35 : 1,
              }}
              aria-hidden
            />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="text-center font-sans text-[10px] leading-relaxed text-neutral-600">
        Hover a line or legend item to emphasize that series; others fade to grey. All series share one arrivals scale
        (Africa sits lower; use hover or the tooltip for exact values).
      </p>
    </div>
  );
}

export function GermanyImmigrationSection() {
  const [items, setItems] = useState<GermanyImmigrationTreemapItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefugeeSectionOpen, setIsRefugeeSectionOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let text = '';
        const res = await fetch(TREEMAP_CSV_URL);
        if (res.ok) {
          text = await res.text();
        }
        if (!text.trim()) text = germanyTreemapCsvRaw;
        if (!text.trim()) {
          if (!cancelled) setLoadError('Immigration treemap CSV is empty.');
          return;
        }
        const parsed = parseGermanyTreemapCsv(text);
        if (!cancelled) {
          setItems(parsed);
          setLoadError(null);
        }
      } catch {
        try {
          const parsed = parseGermanyTreemapCsv(germanyTreemapCsvRaw);
          if (!cancelled) {
            setItems(parsed);
            setLoadError(null);
          }
        } catch (e) {
          if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load treemap data.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article className="flex min-h-[148px] flex-col rounded-md border border-line bg-surface-metric shadow-card p-4 sm:p-5">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">Refugees</p>
          <p className="mt-4 font-sans text-2xl font-semibold leading-none tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            {REFUGEE_TOTAL_2024.toLocaleString('en-US')}
          </p>
          <p className="mt-3 font-sans text-[10px] leading-relaxed text-neutral-500">Germany, 2024.</p>
        </article>

        <article className="flex min-h-[148px] flex-col rounded-md border border-line bg-surface-metric shadow-card p-4 sm:p-5">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Work Visas
          </p>
          <p className="mt-4 font-sans text-2xl font-semibold leading-none tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            {WORK_VISAS_2021_2025.toLocaleString('en-US')}
          </p>
          <p className="mt-3 font-sans text-[10px] leading-relaxed text-neutral-500">Issued from 2021 to 2025.</p>
        </article>

        <article className="flex min-h-[148px] flex-col rounded-md border border-line bg-surface-metric shadow-card p-4 sm:p-5">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Migrant Background
          </p>
          <p className="mt-4 font-sans text-2xl font-semibold leading-none tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            {MIGRANT_BACKGROUND_2024_2025.toLocaleString('en-US')}
          </p>
          <p className="mt-3 font-sans text-[10px] leading-relaxed text-neutral-500">Germany, 2024–2025.</p>
        </article>
      </div>

      <Card className="col-span-full border-line bg-surface-metric shadow-card">
        <CardHeader className="space-y-1 p-4 pb-2 sm:p-5 sm:pb-3">
          <CardTitle className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Migrant arrivals by origin (Germany)
          </CardTitle>
          <CardDescription className="font-sans text-[10px] leading-snug text-neutral-500">
            Four series on a single arrivals axis (compact ticks). Approximate labels keep ~ / + in tooltips; lines use
            rounded numeric values.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0 sm:p-5 sm:pt-0">
          <GermanyMigrantArrivalsInteractiveChart />
        </CardContent>
      </Card>

      {loadError ? (
        <p className="font-sans text-xs text-amber-500/90">{loadError}</p>
      ) : null}

      <div className="w-full min-w-0 rounded-md border border-line bg-surface-metric shadow-inset p-3">
        <GermanyImmigrationTreemap items={items} />
      </div>

      <p className="font-sans text-[10px] leading-relaxed text-neutral-500">
        Immigrant counts by country of origin (2024 flow). Source metadata in CSV: PopulationPyramid.net Germany
        Immigration Statistics; underlying migrant stock reference UN DESA International Migrant Stock 2024. Chart scales
        to the panel width so the full treemap is visible without horizontal scrolling.
      </p>

      <Card className="rounded-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-sans text-xs uppercase tracking-[0.18em]">Contribution</CardTitle>
          <CardDescription>Tax contribution per group.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="scrollbar-none overflow-x-auto border border-line">
            <table className="min-w-full border-collapse text-left font-sans text-xs">
              <thead className="bg-neutral-900 text-neutral-300">
                <tr>
                  <th className="px-3 py-2 font-medium">Group</th>
                  <th className="px-3 py-2 text-right font-medium">Taxes + Social Contributions Paid (from work)</th>
                  <th className="px-3 py-2 text-right font-medium">Other Transfers Received</th>
                  <th className="px-3 py-2 text-right font-medium">Net Contribution (Taxes Paid - Transfers Received)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 text-neutral-200">Natives</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 819</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 74</td>
                  <td className="px-3 py-2 text-right text-neutral-100">+EUR 745</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 text-neutral-200">1st-generation migrants</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 692</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 211</td>
                  <td className="px-3 py-2 text-right text-neutral-100">+EUR 481</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 text-neutral-200">2nd-generation migrants</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 504</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 94</td>
                  <td className="px-3 py-2 text-right text-neutral-100">+EUR 410</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <article className="rounded-md border border-line bg-surface-metric shadow-card p-3">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">Welfare Usage (2025)</p>
              <p className="mt-2 font-sans text-xs leading-relaxed text-neutral-200">
                Foreigners (~14.8% of population) received 46.6% of all Burgergeld (main welfare benefit) spending,
                approximately EUR 21.7 billion.
              </p>
            </article>
            <article className="rounded-md border border-line bg-surface-metric shadow-card p-3">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">Age-Controlled View</p>
              <p className="mt-2 font-sans text-xs leading-relaxed text-neutral-200">
                When controlling for age and demographics, 1st-generation migrants become less positive or net
                negative, while natives and 2nd-generation migrants perform similarly.
              </p>
            </article>
            <article className="rounded-md border border-line bg-surface-metric shadow-card p-3">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">Raw View (No Age Control)</p>
              <p className="mt-2 font-sans text-xs leading-relaxed text-neutral-200">
                Without controlling for age, migrants (especially 1st generation) appear as net contributors mainly
                because they are younger on average and receive far less in pensions.
              </p>
            </article>
          </div>

          <p className="font-sans text-[10px] leading-relaxed text-neutral-500">
            Source:{' '}
            <a
              className="underline underline-offset-2 hover:text-neutral-300"
              href="https://www.econstor.eu/bitstream/10419/306683/1/GLO-DP-1530.pdf"
              target="_blank"
              rel="noreferrer"
            >
              econstor.eu GLO-DP-1530
            </a>
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-sans text-xs uppercase tracking-[0.18em]">
            2025 Burgergeld (Main Welfare Benefit) - How Much They Take
          </CardTitle>
          <CardDescription>Total Burgergeld paid: approximately EUR 47 billion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="scrollbar-none overflow-x-auto border border-line">
            <table className="min-w-full border-collapse text-left font-sans text-xs">
              <thead className="bg-neutral-900 text-neutral-300">
                <tr>
                  <th className="px-3 py-2 font-medium">Nationality</th>
                  <th className="px-3 py-2 text-right font-medium">Number of Burgergeld Recipients</th>
                  <th className="px-3 py-2 text-right font-medium">% of All Foreign Recipients</th>
                  <th className="px-3 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 text-neutral-200">All Foreigners</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~2.57 - 2.81 million</td>
                  <td className="px-3 py-2 text-right text-neutral-100">100%</td>
                  <td className="px-3 py-2 text-neutral-100">46.6% of total Burgergeld budget</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 text-neutral-200">Ukrainians</td>
                  <td className="px-3 py-2 text-right text-neutral-100">678,539 - 705,932</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~26-27%</td>
                  <td className="px-3 py-2 text-neutral-100">EUR 6.0 - 6.5 billion (published)</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 text-neutral-200">Syrians</td>
                  <td className="px-3 py-2 text-right text-neutral-100">485,240 - 512,161</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~19%</td>
                  <td className="px-3 py-2 text-neutral-100">EUR 3.9 - 4.2 billion (published)</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 text-neutral-200">Afghans</td>
                  <td className="px-3 py-2 text-right text-neutral-100">200,779</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~7.8%</td>
                  <td className="px-3 py-2 text-neutral-100">Not published individually</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 text-neutral-200">Turks</td>
                  <td className="px-3 py-2 text-right text-neutral-100">189,595 - 192,077</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~7.4%</td>
                  <td className="px-3 py-2 text-neutral-100">Not published individually</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 text-neutral-200">Iraqis</td>
                  <td className="px-3 py-2 text-right text-neutral-100">93,516 - 101,000</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~3.6-3.9%</td>
                  <td className="px-3 py-2 text-neutral-100">Not published individually</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="px-3 py-2 text-neutral-200">Others (Bulgarians, Romanians, Poles, etc.)</td>
                  <td className="px-3 py-2 text-right text-neutral-100">Remaining ~800,000+</td>
                  <td className="px-3 py-2 text-right text-neutral-100">-</td>
                  <td className="px-3 py-2 text-neutral-100">Combined in foreign total</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2 font-sans text-[10px] leading-relaxed text-neutral-500">
            <p>
              Source (Statista / Bundesagentur fur Arbeit, June 2025):{' '}
              <a
                className="underline underline-offset-2 hover:text-neutral-300"
                href="https://de.statista.com/statistik/daten/studie/1622726/umfrage/empfaenger-von-buergergeld-in-deutschland-nach-staatsangehoerigkeiten/"
                target="_blank"
                rel="noreferrer"
              >
                de.statista.com recipient statistics
              </a>
            </p>
            <p>
              Source (Fremdeninfo.de BA summary, July 2025):{' '}
              <a
                className="underline underline-offset-2 hover:text-neutral-300"
                href="https://fremdeninfo.de/statistik-buergergeld-bezieher-nach-nationalitaeten-stand-anfang-2025/"
                target="_blank"
                rel="noreferrer"
              >
                fremdeninfo.de BA summary
              </a>
            </p>
            <p>Source: Tagesschau / Federal Ministry reports confirming the EUR 21.7-22 billion total for foreigners.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm">
        <CardHeader
          role="button"
          tabIndex={0}
          onClick={() => setIsRefugeeSectionOpen((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsRefugeeSectionOpen((prev) => !prev);
            }
          }}
          aria-expanded={isRefugeeSectionOpen}
          className="cursor-pointer pb-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="font-sans text-xs uppercase tracking-[0.18em]">
                Refugee origins in Germany (2024)
              </CardTitle>
              <CardDescription>Breakdown by country of origin.</CardDescription>
            </div>
            <span className="font-sans text-[11px] text-neutral-400" aria-hidden>
              {isRefugeeSectionOpen ? '▾' : '▸'}
            </span>
          </div>
        </CardHeader>
        {isRefugeeSectionOpen ? (
          <CardContent className="space-y-4">
            <div className="scrollbar-none overflow-x-auto border border-line">
              <table className="min-w-full border-collapse text-left font-sans text-xs">
                <thead className="bg-neutral-900 text-neutral-300">
                  <tr>
                    <th className="px-3 py-2 font-medium">Country of origin</th>
                    <th className="px-3 py-2 text-right font-medium">Number in Germany</th>
                  </tr>
                </thead>
                <tbody>
                  {REFUGEE_BREAKDOWN_2024.map((row) => (
                    <tr key={row.country} className="border-t border-line">
                      <td className="px-3 py-2 text-neutral-200">{row.country}</td>
                      <td className="px-3 py-2 text-right text-neutral-100">{row.count.toLocaleString('en-US')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ChartContainer config={refugeesChartConfig} className="h-[780px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...REFUGEE_BREAKDOWN_2024].reverse()} layout="vertical" margin={{ top: 8, right: 20, left: 80, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" horizontal={false} />
                  <XAxis type="number" stroke="#8a8a8a" tick={{ fontSize: 11, fill: '#8a8a8a' }} tickFormatter={(v: number) => v.toLocaleString('en-US')} />
                  <YAxis
                    type="category"
                    dataKey="country"
                    stroke="#8a8a8a"
                    width={150}
                    tick={{ fontSize: 11, fill: '#cfcfcf' }}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'rgba(255,255,255,0.06)' }}
                    content={<ChartTooltipContent formatter={(value) => Number(value).toLocaleString('en-US')} />}
                  />
                  <Bar dataKey="count" name="Refugees" fill="var(--uk-accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        ) : null}
      </Card>

      <Card className="rounded-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-sans text-xs uppercase tracking-[0.18em]">Asylum applications [note for 2025]</CardTitle>
          <CardDescription>
            Applicants by country of origin, includes &quot;Other&quot; (counts + share %).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={asylumChartConfig} className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <Pie
                  data={ASYLUM_APPLICATIONS_2025_PIE}
                  dataKey="applications"
                  nameKey="country"
                  cx="50%"
                  cy="50%"
                  outerRadius={112}
                  stroke="none"
                  labelLine={false}
                >
                  {ASYLUM_APPLICATIONS_2025_PIE.map((entry) => (
                    <Cell key={entry.country} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => {
                        const payload = item as { payload?: { sharePct?: number } } | undefined;
                        const pct = payload?.payload?.sharePct ?? 0;
                        return `${Number(value).toLocaleString('en-US')} (${pct.toFixed(2)}%)`;
                      }}
                    />
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: 'rgba(212,212,212,0.9)' }}
                  formatter={(value) => {
                    const country = String(value);
                    const pct = ASYLUM_SHARE_BY_COUNTRY[country] ?? 0;
                    return `${country} (${pct.toFixed(2)}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
