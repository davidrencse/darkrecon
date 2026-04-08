import { useEffect, useState } from 'react';
import germanyTreemapCsvRaw from '../../Assets/Data/Europe/Germany/germany_populationpyramid_2024_treemap_labeled_items.csv?raw';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from './ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
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

export function GermanyImmigrationSection() {
  const [items, setItems] = useState<GermanyImmigrationTreemapItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        <article className="flex min-h-[148px] flex-col border border-neutral-800 bg-[#121212] p-4 sm:p-5">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">Refugees</p>
          <p className="mt-4 font-mono text-2xl font-semibold leading-none tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            {REFUGEE_TOTAL_2024.toLocaleString('en-US')}
          </p>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-neutral-500">Germany, 2024.</p>
        </article>

        <article className="flex min-h-[148px] flex-col border border-neutral-800 bg-[#121212] p-4 sm:p-5">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Work Visas
          </p>
          <p className="mt-4 font-mono text-2xl font-semibold leading-none tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            {WORK_VISAS_2021_2025.toLocaleString('en-US')}
          </p>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-neutral-500">Issued from 2021 to 2025.</p>
        </article>

        <article className="flex min-h-[148px] flex-col border border-neutral-800 bg-[#121212] p-4 sm:p-5">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Migrant Background
          </p>
          <p className="mt-4 font-mono text-2xl font-semibold leading-none tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            {MIGRANT_BACKGROUND_2024_2025.toLocaleString('en-US')}
          </p>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-neutral-500">Germany, 2024–2025.</p>
        </article>
      </div>

      {loadError ? (
        <p className="font-mono text-xs text-amber-500/90">{loadError}</p>
      ) : null}

      <div className="w-full min-w-0 rounded-sm border border-neutral-800 bg-neutral-950 p-3">
        <GermanyImmigrationTreemap items={items} />
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-neutral-500">
        Immigrant counts by country of origin (2024 flow). Source metadata in CSV: PopulationPyramid.net Germany
        Immigration Statistics; underlying migrant stock reference UN DESA International Migrant Stock 2024. Chart scales
        to the panel width so the full treemap is visible without horizontal scrolling.
      </p>

      <Card className="rounded-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs uppercase tracking-[0.18em]">Refugee origins in Germany (2024)</CardTitle>
          <CardDescription>Breakdown by country of origin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto border border-neutral-800">
            <table className="min-w-full border-collapse text-left font-mono text-xs">
              <thead className="bg-neutral-900 text-neutral-300">
                <tr>
                  <th className="px-3 py-2 font-medium">Country of origin</th>
                  <th className="px-3 py-2 text-right font-medium">Number in Germany</th>
                </tr>
              </thead>
              <tbody>
                {REFUGEE_BREAKDOWN_2024.map((row) => (
                  <tr key={row.country} className="border-t border-neutral-800">
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
      </Card>

      <Card className="rounded-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs uppercase tracking-[0.18em]">Asylum applications [note for 2025]</CardTitle>
          <CardDescription>
            Applicants by country of origin, includes &quot;Other&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={asylumChartConfig} className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ASYLUM_APPLICATIONS_2025} margin={{ top: 8, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" vertical={false} />
                <XAxis
                  dataKey="country"
                  stroke="#8a8a8a"
                  tick={{ fontSize: 11, fill: '#cfcfcf' }}
                  angle={-30}
                  height={70}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#8a8a8a" tick={{ fontSize: 11, fill: '#8a8a8a' }} tickFormatter={(v: number) => v.toLocaleString('en-US')} />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.06)' }}
                  content={<ChartTooltipContent formatter={(value) => Number(value).toLocaleString('en-US')} />}
                />
                <Bar dataKey="applications" name="Asylum applications" fill="var(--uk-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
