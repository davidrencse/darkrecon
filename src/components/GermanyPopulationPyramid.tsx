import { useMemo } from 'react';
import germanyPopulationByAgeCsvRaw from '../../Assets/Data/Europe/Germany/germany_2025_population_by_age_and_gender.csv?raw';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

type PyramidRow = {
  ageGroup: string;
  male: number;
  female: number;
  total: number;
};

function parseGermanyPopulationCsv(text: string): PyramidRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const rows: PyramidRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i]!.split(',');
    if (parts.length < 6) continue;
    const ageGroup = parts[2]?.trim() ?? '';
    const male = Number(parts[3]);
    const female = Number(parts[4]);
    const total = Number(parts[5]);
    if (!ageGroup || !Number.isFinite(male) || !Number.isFinite(female)) continue;
    rows.push({ ageGroup, male, female, total: Number.isFinite(total) ? total : male + female });
  }
  return rows;
}

const chartConfig: ChartConfig = {
  male: { label: 'Male', color: '#3b82f6' },
  female: { label: 'Female', color: '#ec4899' },
};

export function GermanyPopulationPyramid() {
  const rows = useMemo(() => parseGermanyPopulationCsv(germanyPopulationByAgeCsvRaw), []);

  const data = useMemo(
    () =>
      [...rows]
        .reverse()
        .map((r) => ({ ...r, maleLeft: -Math.abs(r.male), femaleRight: Math.abs(r.female) })),
    [rows],
  );

  const maxSide = useMemo(() => {
    let max = 0;
    for (const row of rows) {
      max = Math.max(max, row.male, row.female);
    }
    return max > 0 ? Math.ceil(max / 100_000) * 100_000 : 1_000_000;
  }, [rows]);

  return (
    <Card className="rounded-sm border-neutral-800 bg-[#121212]">
      <CardHeader className="pb-2">
        <CardTitle className="font-mono text-xs uppercase tracking-[0.18em]">Germany population pyramid (2025)</CardTitle>
        <CardDescription>Hover any age bar to view male and female population counts.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[560px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 24, bottom: 20 }}
              barCategoryGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" horizontal={false} />
              <ReferenceLine x={0} stroke="#595959" />
              <XAxis
                type="number"
                domain={[-maxSide, maxSide]}
                allowDataOverflow
                stroke="#8a8a8a"
                tick={{ fontSize: 11, fill: '#8a8a8a' }}
                tickFormatter={(v: number) => Math.abs(v).toLocaleString('en-US')}
              />
              <YAxis
                type="category"
                dataKey="ageGroup"
                stroke="#8a8a8a"
                width={48}
                tick={{ fontSize: 10, fill: '#d4d4d4' }}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `Age group: ${String(label)}`}
                    formatter={(_, name, item) => {
                      const payload = (item as { payload?: { male?: number; female?: number; total?: number } }).payload;
                      if (!payload) return '';
                      if (String(name).toLowerCase().includes('male')) return payload.male?.toLocaleString('en-US') ?? '';
                      if (String(name).toLowerCase().includes('female')) return payload.female?.toLocaleString('en-US') ?? '';
                      return payload.total?.toLocaleString('en-US') ?? '';
                    }}
                  />
                }
              />
              <Bar dataKey="maleLeft" name="Male" fill="#3b82f6" radius={[3, 0, 0, 3]} />
              <Bar dataKey="femaleRight" name="Female" fill="#ec4899" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-3 flex items-center gap-4 font-mono text-[10px] text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-[#3b82f6]" />
            Male
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-[#ec4899]" />
            Female
          </span>
        </div>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-neutral-500">
          Source data: germany_2025_population_by_age_and_gender.csv (Germany, 2025 age-group population by sex).
        </p>
      </CardContent>
    </Card>
  );
}
