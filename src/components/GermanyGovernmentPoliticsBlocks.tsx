import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import type { GermanyGovernmentPoliticsRow } from '../lib/germanyGovernmentPolitics';

/** Metric titles and primary labels: all caps for government / economic politics data cards. */
const UC_TITLE = 'uppercase tracking-[0.05em]';
const UC_LABEL = 'uppercase tracking-[0.04em]';
const UC_META = 'uppercase tracking-[0.03em]';

export const GOV_POLITICS_CARD_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3';
const METRIC_SUBTITLES: Record<string, string> = {
  'Concurrent mental health comorbidities in youth referred for care':
    'When a young person is referred to a gender clinic in Germany, there is a very high chance (around 70%) they are already struggling with depression, anxiety, autism, trauma, or other serious mental health conditions at the same time.',
};

export function splitUrls(urlField: string): string[] {
  return String(urlField ?? '')
    .split('|')
    .map((u) => u.trim())
    .filter(Boolean);
}

export function formatValueDisplay(row: GermanyGovernmentPoliticsRow): string {
  const v = row.value.trim();
  if (!v) return 'N/A';
  const unit = row.unit.trim().toLowerCase();
  if (unit === 'percent' || unit.endsWith('percent')) {
    const n = parseFloat(v.replace(/,/g, ''));
    return Number.isFinite(n) ? `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}%` : v;
  }
  const asNum = Number(v.replace(/,/g, ''));
  if (Number.isFinite(asNum) && String(v).includes(',')) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(asNum);
  }
  if (Number.isFinite(asNum) && /^[\d.]+$/.test(v)) {
    return asNum % 1 !== 0 ? asNum.toLocaleString('en-US', { maximumFractionDigits: 4 }) : asNum.toLocaleString('en-US');
  }
  return v;
}

export function metaParts(row: GermanyGovernmentPoliticsRow): string {
  return [row.referenceYear ? `Year: ${row.referenceYear}` : null, row.unit ? `Unit: ${row.unit}` : null]
    .filter(Boolean)
    .join(' · ');
}

export function GovStatCard({ row, title }: { row: GermanyGovernmentPoliticsRow; title?: string }) {
  const urls = splitUrls(row.sourceUrl);
  const label = title ?? row.metric;
  const extra = [row.breakdown, row.submetric].filter(Boolean).join(' · ');
  return (
    <Card className="flex flex-col overflow-hidden border-line bg-surface-metric">
      <CardHeader className="space-y-0.5 p-3 pb-0">
        <CardTitle className={`text-sm font-semibold leading-tight text-neutral-100 ${UC_TITLE}`}>{label}</CardTitle>
        {extra ? (
          <CardDescription className={`text-[10px] leading-snug text-neutral-300 ${UC_META}`}>{extra}</CardDescription>
        ) : null}
        <CardDescription className={`text-[10px] leading-snug text-neutral-500 ${UC_META}`}>{metaParts(row)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-3 pt-2">
        <p className="font-sans text-xl font-semibold tabular-nums tracking-tight text-white sm:text-2xl">
          {formatValueDisplay(row)}
        </p>
        {urls.length > 0 ? (
          <div className="space-y-0.5">
            {urls.map((u, i) => (
              <a
                key={`${u}-${i}`}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className={`block font-sans text-[10px] leading-snug text-[var(--uk-accent)] hover:text-neutral-200 ${UC_META}`}
              >
                {row.sourceName ? (urls.length > 1 ? `${row.sourceName} (${i + 1})` : row.sourceName) : `Source ${i + 1}`}{' '}
                ↗
              </a>
            ))}
          </div>
        ) : null}
        {row.notes ? (
          <details className="rounded-md border border-white/[0.06] bg-neutral-950/40 px-2 py-1.5">
            <summary className="cursor-pointer font-sans text-[9px] uppercase tracking-[0.12em] text-neutral-500 hover:text-neutral-400">
              Note
            </summary>
            <pre className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap font-sans text-[10px] leading-relaxed text-neutral-500">
              {row.notes}
            </pre>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function GovMetricTable({ metric, rows }: { metric: string; rows: GermanyGovernmentPoliticsRow[] }) {
  const urls = splitUrls(rows[0]?.sourceUrl ?? '');
  const sourceName = rows[0]?.sourceName ?? '';
  const notes = rows.map((r) => r.notes).filter(Boolean);
  const subtitle = METRIC_SUBTITLES[metric];
  return (
    <Card className="overflow-hidden border-line bg-surface-metric sm:col-span-2 lg:col-span-3">
      <CardHeader className="p-3 pb-2">
        <CardTitle className={`text-sm font-semibold text-neutral-100 ${UC_TITLE}`}>{metric}</CardTitle>
        {subtitle ? <CardDescription className="text-[11px] normal-case text-neutral-300">{subtitle}</CardDescription> : null}
        {rows[0]?.referenceYear ? (
          <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>
            Reference year: {rows[0].referenceYear}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        <div className="overflow-x-auto rounded border border-line">
          <table className="w-full min-w-[280px] border-collapse font-sans text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03] text-left text-[10px] uppercase tracking-[0.1em] text-neutral-500">
                <th className="px-3 py-2 font-medium">Breakdown</th>
                <th className="px-3 py-2 font-medium text-right">Value</th>
                <th className="px-3 py-2 font-medium">Unit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-white/[0.06] last:border-0">
                  <td className={`px-3 py-2 text-neutral-200 ${UC_LABEL}`}>
                    {(r.breakdown || r.submetric || '—').trim() || '—'}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-white">{formatValueDisplay(r)}</td>
                  <td className={`px-3 py-2 text-neutral-400 ${UC_META}`}>{r.unit || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {urls.length > 0 ? (
          <div className="space-y-0.5">
            {urls.map((u, i) => (
              <a
                key={`${u}-${i}`}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className={`block font-sans text-[10px] text-[var(--uk-accent)] hover:text-neutral-200 ${UC_META}`}
              >
                {sourceName ? (urls.length > 1 ? `${sourceName} (${i + 1})` : sourceName) : `Source ${i + 1}`} ↗
              </a>
            ))}
          </div>
        ) : null}
        {notes.length > 0 ? (
          <details className="rounded-md border border-white/[0.06] bg-neutral-950/40 px-2 py-1.5">
            <summary className="cursor-pointer font-sans text-[9px] uppercase tracking-[0.12em] text-neutral-500">
              Notes
            </summary>
            <pre className="mt-1.5 max-h-36 overflow-y-auto whitespace-pre-wrap font-sans text-[10px] leading-relaxed text-neutral-500">
              {notes.join('\n\n')}
            </pre>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function renderMetricGroup(rows: GermanyGovernmentPoliticsRow[]) {
  const first = rows[0]!;
  const multi =
    rows.length > 1 || Boolean(first.breakdown?.trim()) || Boolean(first.submetric?.trim());
  if (multi) return <GovMetricTable key={first.metric} metric={first.metric} rows={rows} />;
  return <GovStatCard key={first.metric} row={first} />;
}
