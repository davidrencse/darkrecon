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
          <CardTitle className="font-mono text-xs uppercase tracking-[0.18em]">Contribution</CardTitle>
          <CardDescription>Tax contribution per group.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="scrollbar-none overflow-x-auto border border-neutral-800">
            <table className="min-w-full border-collapse text-left font-mono text-xs">
              <thead className="bg-neutral-900 text-neutral-300">
                <tr>
                  <th className="px-3 py-2 font-medium">Group</th>
                  <th className="px-3 py-2 text-right font-medium">Taxes + Social Contributions Paid (from work)</th>
                  <th className="px-3 py-2 text-right font-medium">Other Transfers Received</th>
                  <th className="px-3 py-2 text-right font-medium">Net Contribution (Taxes Paid - Transfers Received)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-200">Natives</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 819</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 74</td>
                  <td className="px-3 py-2 text-right text-neutral-100">+EUR 745</td>
                </tr>
                <tr className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-200">1st-generation migrants</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 692</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 211</td>
                  <td className="px-3 py-2 text-right text-neutral-100">+EUR 481</td>
                </tr>
                <tr className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-200">2nd-generation migrants</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 504</td>
                  <td className="px-3 py-2 text-right text-neutral-100">EUR 94</td>
                  <td className="px-3 py-2 text-right text-neutral-100">+EUR 410</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <article className="border border-neutral-800 bg-[#121212] p-3">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">Welfare Usage (2025)</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-200">
                Foreigners (~14.8% of population) received 46.6% of all Burgergeld (main welfare benefit) spending,
                approximately EUR 21.7 billion.
              </p>
            </article>
            <article className="border border-neutral-800 bg-[#121212] p-3">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">Age-Controlled View</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-200">
                When controlling for age and demographics, 1st-generation migrants become less positive or net
                negative, while natives and 2nd-generation migrants perform similarly.
              </p>
            </article>
            <article className="border border-neutral-800 bg-[#121212] p-3">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">Raw View (No Age Control)</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-200">
                Without controlling for age, migrants (especially 1st generation) appear as net contributors mainly
                because they are younger on average and receive far less in pensions.
              </p>
            </article>
          </div>

          <p className="font-mono text-[10px] leading-relaxed text-neutral-500">
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
          <CardTitle className="font-mono text-xs uppercase tracking-[0.18em]">
            2025 Burgergeld (Main Welfare Benefit) - How Much They Take
          </CardTitle>
          <CardDescription>Total Burgergeld paid: approximately EUR 47 billion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="scrollbar-none overflow-x-auto border border-neutral-800">
            <table className="min-w-full border-collapse text-left font-mono text-xs">
              <thead className="bg-neutral-900 text-neutral-300">
                <tr>
                  <th className="px-3 py-2 font-medium">Nationality</th>
                  <th className="px-3 py-2 text-right font-medium">Number of Burgergeld Recipients</th>
                  <th className="px-3 py-2 text-right font-medium">% of All Foreign Recipients</th>
                  <th className="px-3 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-200">All Foreigners</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~2.57 - 2.81 million</td>
                  <td className="px-3 py-2 text-right text-neutral-100">100%</td>
                  <td className="px-3 py-2 text-neutral-100">46.6% of total Burgergeld budget</td>
                </tr>
                <tr className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-200">Ukrainians</td>
                  <td className="px-3 py-2 text-right text-neutral-100">678,539 - 705,932</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~26-27%</td>
                  <td className="px-3 py-2 text-neutral-100">EUR 6.0 - 6.5 billion (published)</td>
                </tr>
                <tr className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-200">Syrians</td>
                  <td className="px-3 py-2 text-right text-neutral-100">485,240 - 512,161</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~19%</td>
                  <td className="px-3 py-2 text-neutral-100">EUR 3.9 - 4.2 billion (published)</td>
                </tr>
                <tr className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-200">Afghans</td>
                  <td className="px-3 py-2 text-right text-neutral-100">200,779</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~7.8%</td>
                  <td className="px-3 py-2 text-neutral-100">Not published individually</td>
                </tr>
                <tr className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-200">Turks</td>
                  <td className="px-3 py-2 text-right text-neutral-100">189,595 - 192,077</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~7.4%</td>
                  <td className="px-3 py-2 text-neutral-100">Not published individually</td>
                </tr>
                <tr className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-200">Iraqis</td>
                  <td className="px-3 py-2 text-right text-neutral-100">93,516 - 101,000</td>
                  <td className="px-3 py-2 text-right text-neutral-100">~3.6-3.9%</td>
                  <td className="px-3 py-2 text-neutral-100">Not published individually</td>
                </tr>
                <tr className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-200">Others (Bulgarians, Romanians, Poles, etc.)</td>
                  <td className="px-3 py-2 text-right text-neutral-100">Remaining ~800,000+</td>
                  <td className="px-3 py-2 text-right text-neutral-100">-</td>
                  <td className="px-3 py-2 text-neutral-100">Combined in foreign total</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2 font-mono text-[10px] leading-relaxed text-neutral-500">
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
              <CardTitle className="font-mono text-xs uppercase tracking-[0.18em]">
                Refugee origins in Germany (2024)
              </CardTitle>
              <CardDescription>Breakdown by country of origin.</CardDescription>
            </div>
            <span className="font-mono text-[11px] text-neutral-400" aria-hidden>
              {isRefugeeSectionOpen ? '▾' : '▸'}
            </span>
          </div>
        </CardHeader>
        {isRefugeeSectionOpen ? (
          <CardContent className="space-y-4">
            <div className="scrollbar-none overflow-x-auto border border-neutral-800">
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
        ) : null}
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
