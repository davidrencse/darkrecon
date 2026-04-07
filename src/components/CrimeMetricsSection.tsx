import type { CountryWideRow } from '../lib/parseCountriesWideCsv';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

type CrimeBoxConfig = {
  id: string;
  title: string;
  valueKey: keyof CountryWideRow;
  yearKey: keyof CountryWideRow;
  unitKey: keyof CountryWideRow;
  definitionKey: keyof CountryWideRow;
  sourceUrlKey: keyof CountryWideRow;
  sourceLabelKey: keyof CountryWideRow;
  methodNoteKey: keyof CountryWideRow;
  /** Latest-period cards: compare to the 2000-reference value in this column */
  baselineValueKey?: keyof CountryWideRow;
};

const CRIME_BOXES: CrimeBoxConfig[] = [
  {
    id: 'petty-2000s',
    title: 'Petty crime statistics (baseline)',
    valueKey: 'petty_2000s_value',
    yearKey: 'petty_2000s_year',
    unitKey: 'petty_2000s_unit',
    definitionKey: 'petty_2000s_definition',
    sourceUrlKey: 'petty_2000s_source_url',
    sourceLabelKey: 'petty_2000s_source_label',
    methodNoteKey: 'petty_2000s_method_note',
  },
  {
    id: 'petty-latest',
    title: 'Petty crime statistics (latest)',
    valueKey: 'petty_latest_value',
    yearKey: 'petty_latest_year',
    unitKey: 'petty_latest_unit',
    definitionKey: 'petty_latest_definition',
    sourceUrlKey: 'petty_latest_source_url',
    sourceLabelKey: 'petty_latest_source_label',
    methodNoteKey: 'petty_latest_method_note',
    baselineValueKey: 'petty_2000s_value',
  },
  {
    id: 'rape-2000s',
    title: 'Rape crime statistics (baseline)',
    valueKey: 'rape_2000s_value',
    yearKey: 'rape_2000s_year',
    unitKey: 'rape_2000s_unit',
    definitionKey: 'rape_2000s_definition',
    sourceUrlKey: 'rape_2000s_source_url',
    sourceLabelKey: 'rape_2000s_source_label',
    methodNoteKey: 'rape_2000s_method_note',
  },
  {
    id: 'rape-latest',
    title: 'Rape crime statistics (latest)',
    valueKey: 'rape_latest_value',
    yearKey: 'rape_latest_year',
    unitKey: 'rape_latest_unit',
    definitionKey: 'rape_latest_definition',
    sourceUrlKey: 'rape_latest_source_url',
    sourceLabelKey: 'rape_latest_source_label',
    methodNoteKey: 'rape_latest_method_note',
    baselineValueKey: 'rape_2000s_value',
  },
  {
    id: 'theft-2000s',
    title: 'Theft crime statistics (baseline)',
    valueKey: 'theft_2000s_value',
    yearKey: 'theft_2000s_year',
    unitKey: 'theft_2000s_unit',
    definitionKey: 'theft_2000s_definition',
    sourceUrlKey: 'theft_2000s_source_url',
    sourceLabelKey: 'theft_2000s_source_label',
    methodNoteKey: 'theft_2000s_method_note',
  },
  {
    id: 'theft-latest',
    title: 'Theft crime statistics (latest)',
    valueKey: 'theft_latest_value',
    yearKey: 'theft_latest_year',
    unitKey: 'theft_latest_unit',
    definitionKey: 'theft_latest_definition',
    sourceUrlKey: 'theft_latest_source_url',
    sourceLabelKey: 'theft_latest_source_label',
    methodNoteKey: 'theft_latest_method_note',
    baselineValueKey: 'theft_2000s_value',
  },
  {
    id: 'sexual-2000s',
    title: 'Sexual crime statistics (baseline)',
    valueKey: 'sexual_2000s_value',
    yearKey: 'sexual_2000s_year',
    unitKey: 'sexual_2000s_unit',
    definitionKey: 'sexual_2000s_definition',
    sourceUrlKey: 'sexual_2000s_source_url',
    sourceLabelKey: 'sexual_2000s_source_label',
    methodNoteKey: 'sexual_2000s_method_note',
  },
  {
    id: 'sexual-latest',
    title: 'Sexual crime statistics (latest)',
    valueKey: 'sexual_latest_value',
    yearKey: 'sexual_latest_year',
    unitKey: 'sexual_latest_unit',
    definitionKey: 'sexual_latest_definition',
    sourceUrlKey: 'sexual_latest_source_url',
    sourceLabelKey: 'sexual_latest_source_label',
    methodNoteKey: 'sexual_latest_method_note',
    baselineValueKey: 'sexual_2000s_value',
  },
];

function parseCount(s: string): number | null {
  if (!s?.trim() || s.trim().toUpperCase() === 'N/A') return null;
  const n = Number(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

type PctBadge = { label: string; variant: 'destructive' | 'success' | 'outline' };

function pctChangeVsBaseline(latest: number | null, baseline: number | null): PctBadge | null {
  if (latest == null || baseline == null) return null;
  if (baseline === 0) {
    if (latest === 0) return { label: '0% vs baseline', variant: 'outline' };
    return null;
  }
  const pct = ((latest - baseline) / baseline) * 100;
  const rounded = Math.round(pct * 10) / 10;
  if (Math.abs(rounded) < 0.05) {
    return { label: '0% vs baseline', variant: 'outline' };
  }
  const sign = rounded > 0 ? '+' : '';
  const label = `${sign}${rounded.toFixed(1)}% vs baseline`;
  if (rounded > 0) return { label, variant: 'destructive' };
  return { label, variant: 'success' };
}

function CrimeStatCard({ row, config }: { row: CountryWideRow; config: CrimeBoxConfig }) {
  const raw = String(row[config.valueKey] ?? '');
  const n = parseCount(raw);
  const year = String(row[config.yearKey] ?? '').trim();
  const unit = String(row[config.unitKey] ?? '').trim();
  const definition = String(row[config.definitionKey] ?? '').trim();
  const sourceUrl = String(row[config.sourceUrlKey] ?? '').trim();
  const sourceLabel = String(row[config.sourceLabelKey] ?? '').trim();
  const methodNote = String(row[config.methodNoteKey] ?? '').trim();

  let comparison: PctBadge | null = null;
  let comparisonNote: string | null = null;
  if (config.baselineValueKey) {
    const baselineRaw = String(row[config.baselineValueKey] ?? '');
    const baselineN = parseCount(baselineRaw);
    comparison = pctChangeVsBaseline(n, baselineN);
    if (n != null && baselineN === 0 && n > 0) {
      comparisonNote = 'Baseline was zero; percent change is not defined.';
    } else if (n == null || baselineN == null) {
      comparisonNote = 'Need both latest and baseline values to compute change.';
    }
  }

  const metaLine = [year ? `Year: ${year}` : null, unit || null].filter(Boolean).join(' · ');

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle>{config.title}</CardTitle>
        {metaLine ? <CardDescription>{metaLine}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-4">
        <div className="space-y-3">
          <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-white">
            {n != null ? formatCount(n) : 'N/A'}
          </p>
          {config.baselineValueKey ? (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-600">
                Change vs baseline
              </p>
              {comparison ? (
                <Badge variant={comparison.variant}>{comparison.label}</Badge>
              ) : comparisonNote ? (
                <p className="font-mono text-[11px] leading-relaxed text-neutral-500">{comparisonNote}</p>
              ) : (
                <Badge variant="secondary">—</Badge>
              )}
            </div>
          ) : null}
        </div>

        <Separator />

        {definition ? (
          <p className="font-mono text-[11px] leading-relaxed text-neutral-500">{definition}</p>
        ) : null}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-[var(--uk-accent)] hover:text-neutral-200"
          >
            {sourceLabel || 'Source'} ↗
          </a>
        ) : null}
        {methodNote ? (
          <details className="rounded-md border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500 hover:text-neutral-400">
              Method note
            </summary>
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-neutral-500">{methodNote}</p>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

type CrimeMetricsSectionProps = {
  crimeRow: CountryWideRow | null;
};

export function CrimeMetricsSection({ crimeRow }: CrimeMetricsSectionProps) {
  if (!crimeRow) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-neutral-400">No crime data</CardTitle>
          <CardDescription>
            No crime statistics columns were found for this country in the merged CSV.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const generalNote = String(crimeRow.crime_baseline_general_note ?? '').trim();

  return (
    <div className="flex flex-col gap-4">
      {generalNote ? (
        <p className="rounded-md border border-neutral-800 bg-neutral-950/40 p-3 font-mono text-[11px] leading-relaxed text-neutral-500">
          {generalNote}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CRIME_BOXES.map((cfg) => (
          <CrimeStatCard key={cfg.id} row={crimeRow} config={cfg} />
        ))}
      </div>
    </div>
  );
}

export function collectCrimeSourceUrls(row: CountryWideRow | null): { url: string; label: string }[] {
  if (!row) return [];
  const out: { url: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const cfg of CRIME_BOXES) {
    const u = String(row[cfg.sourceUrlKey] ?? '').trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    const label = String(row[cfg.sourceLabelKey] ?? '').trim();
    try {
      const host = new URL(u).hostname.replace(/^www\./, '');
      out.push({ url: u, label: label || host });
    } catch {
      out.push({ url: u, label: label || u.slice(0, 48) });
    }
  }
  return out;
}
