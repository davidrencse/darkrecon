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
import { CollapsibleFlagSection } from './CollapsibleFlagSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const CSV_URL = '/data/germany_government_politics.csv';
const POLITICS_IMG_URL = '/germany/politics.png';

const SUBSECTIONS = [
  { id: 'parliament', title: 'Parliament', key: 'Parliament' as const },
  { id: 'policies', title: 'Policies', key: 'Policies' as const },
  { id: 'polarization', title: 'Polarization', key: 'Polarization' as const },
  { id: 'citizenship', title: 'Citizenship', key: 'Citizenship' as const },
  { id: 'labor-law', title: 'Labor law', key: 'Labor law' as const },
];

const CARD_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3';

/** Metric titles and primary labels: all caps for government data cards. */
const UC_TITLE = 'uppercase tracking-[0.05em]';
const UC_LABEL = 'uppercase tracking-[0.04em]';
const UC_META = 'uppercase tracking-[0.03em]';

function splitUrls(urlField: string): string[] {
  return String(urlField ?? '')
    .split('|')
    .map((u) => u.trim())
    .filter(Boolean);
}

function formatValueDisplay(row: GermanyGovernmentPoliticsRow): string {
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

function metaParts(row: GermanyGovernmentPoliticsRow): string {
  return [row.referenceYear ? `Year: ${row.referenceYear}` : null, row.unit ? `Unit: ${row.unit}` : null]
    .filter(Boolean)
    .join(' · ');
}

function GovStatCard({ row, title }: { row: GermanyGovernmentPoliticsRow; title?: string }) {
  const urls = splitUrls(row.sourceUrl);
  const label = title ?? row.metric;
  const extra = [row.breakdown, row.submetric].filter(Boolean).join(' · ');
  return (
    <Card className="flex flex-col overflow-hidden border-neutral-800 bg-[#121212]">
      <CardHeader className="space-y-0.5 p-3 pb-0">
        <CardTitle className={`text-sm font-semibold leading-tight text-neutral-100 ${UC_TITLE}`}>{label}</CardTitle>
        {extra ? (
          <CardDescription className={`text-[10px] leading-snug text-neutral-300 ${UC_META}`}>{extra}</CardDescription>
        ) : null}
        <CardDescription className={`text-[10px] leading-snug text-neutral-500 ${UC_META}`}>{metaParts(row)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-3 pt-2">
        <p className="font-mono text-xl font-semibold tabular-nums tracking-tight text-white sm:text-2xl">
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
                className={`block font-mono text-[10px] leading-snug text-[var(--uk-accent)] hover:text-neutral-200 ${UC_META}`}
              >
                {row.sourceName ? (urls.length > 1 ? `${row.sourceName} (${i + 1})` : row.sourceName) : `Source ${i + 1}`}{' '}
                ↗
              </a>
            ))}
          </div>
        ) : null}
        {row.notes ? (
          <details className="rounded-md border border-neutral-800/80 bg-neutral-950/40 px-2 py-1.5">
            <summary className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500 hover:text-neutral-400">
              Note
            </summary>
            <pre className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-neutral-500">
              {row.notes}
            </pre>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

function GovMetricTable({ metric, rows }: { metric: string; rows: GermanyGovernmentPoliticsRow[] }) {
  const urls = splitUrls(rows[0]?.sourceUrl ?? '');
  const sourceName = rows[0]?.sourceName ?? '';
  const notes = rows.map((r) => r.notes).filter(Boolean);
  return (
    <Card className="overflow-hidden border-neutral-800 bg-[#121212] sm:col-span-2 lg:col-span-3">
      <CardHeader className="p-3 pb-2">
        <CardTitle className={`text-sm font-semibold text-neutral-100 ${UC_TITLE}`}>{metric}</CardTitle>
        {rows[0]?.referenceYear ? (
          <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>
            Reference year: {rows[0].referenceYear}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        <div className="overflow-x-auto rounded border border-neutral-800">
          <table className="w-full min-w-[280px] border-collapse font-mono text-[11px]">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-left text-[10px] uppercase tracking-[0.1em] text-neutral-500">
                <th className="px-3 py-2 font-medium">Breakdown</th>
                <th className="px-3 py-2 font-medium text-right">Value</th>
                <th className="px-3 py-2 font-medium">Unit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-neutral-800/80 last:border-0">
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
                className={`block font-mono text-[10px] text-[var(--uk-accent)] hover:text-neutral-200 ${UC_META}`}
              >
                {sourceName ? (urls.length > 1 ? `${sourceName} (${i + 1})` : sourceName) : `Source ${i + 1}`} ↗
              </a>
            ))}
          </div>
        ) : null}
        {notes.length > 0 ? (
          <details className="rounded-md border border-neutral-800/80 bg-neutral-950/40 px-2 py-1.5">
            <summary className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500">
              Notes
            </summary>
            <pre className="mt-1.5 max-h-36 overflow-y-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-neutral-500">
              {notes.join('\n\n')}
            </pre>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

function renderMetricGroup(rows: GermanyGovernmentPoliticsRow[]) {
  const first = rows[0]!;
  const multi =
    rows.length > 1 ||
    Boolean(first.breakdown?.trim()) ||
    Boolean(first.submetric?.trim());
  if (multi) return <GovMetricTable key={first.metric} metric={first.metric} rows={rows} />;
  return <GovStatCard key={first.metric} row={first} />;
}

function OverviewBlock({ rows }: { rows: GermanyGovernmentPoliticsRow[] }) {
  const byMetric = useMemo(() => {
    const m = new Map<string, GermanyGovernmentPoliticsRow>();
    for (const r of rows) m.set(r.metric.trim().toLowerCase(), r);
    return m;
  }, [rows]);

  const name = byMetric.get('head of government')?.value ?? '';
  const party = byMetric.get('head of government political party')?.value ?? '';
  const ideology = byMetric.get('head of government political ideology')?.value ?? '';
  const coalition = byMetric.get('governing coalition');
  const numParties = byMetric.get('number of coalition parties');

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
      <Card className="border-neutral-800 bg-[#121212]">
        <CardHeader className="p-3">
          <CardTitle className={`text-sm text-neutral-100 ${UC_TITLE}`}>Head of government</CardTitle>
          <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>
            Chancellor, party, and ideology (from dataset)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0 font-mono text-sm text-neutral-200">
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
            <details className="mt-2 rounded border border-neutral-800/80 bg-neutral-950/40 px-2 py-1.5">
              <summary className="cursor-pointer text-[9px] uppercase tracking-[0.12em] text-neutral-500">Note</summary>
              <pre className="mt-1.5 whitespace-pre-wrap text-[10px] leading-relaxed text-neutral-500">{headNotes}</pre>
            </details>
          ) : null}
        </CardContent>
      </Card>

      {coalition ? <GovStatCard row={coalition} title="Governing coalition" /> : null}
      {numParties ? <GovStatCard row={numParties} title="Number of coalition parties" /> : null}

      <div className="rounded border border-neutral-800 bg-neutral-950/30 p-3">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
          Government political chart
        </h3>
        <img
          src={POLITICS_IMG_URL}
          alt="Germany government and political context"
          className="mt-3 w-full max-w-3xl rounded border border-neutral-800"
          loading="lazy"
        />
        <p className="mt-2 font-mono text-[10px] text-neutral-600">Image: politics.png</p>
      </div>
    </div>
  );
}

function ParliamentGroups({ groups }: { groups: GermanyGovernmentPoliticsRow[][] }) {
  const out: ReactNode[] = [];
  let insertedTrust = false;
  for (const g of groups) {
    const m = g[0]!.metric.trim().toLowerCase();
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
          className="col-span-1 border-t border-neutral-800 pt-4 sm:col-span-2 lg:col-span-3"
        >
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Public trust and integrity
          </p>
          <p className={`mt-1 font-mono text-[10px] leading-relaxed text-neutral-500 ${UC_META}`}>
            Trust in parliament, government, parties, courts, police; democracy satisfaction; perceived corruption (CPI
            proxy).
          </p>
        </div>,
      );
    }
    out.push(<Fragment key={g[0]!.metric}>{renderMetricGroup(g)}</Fragment>);
  }
  return <div className={CARD_GRID}>{out}</div>;
}

export function GermanyGovernmentSection() {
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

  const outerCount = useMemo(() => countGovernmentSectionStats(allRows), [allRows]);

  const sanity = useMemo(() => {
    if (allRows.length === 0) return 'CSV parsed 0 rows — check file and headers.';
    if (germanyRows.length === 0) return 'No rows with Section=Government.';
    return null;
  }, [allRows.length, germanyRows.length]);

  return (
    <CollapsibleFlagSection title="Government" count={outerCount} defaultOpen uppercaseTitle>
      <div className="flex flex-col gap-4">
        {loadError ? <p className="font-mono text-xs text-amber-500/90">{loadError}</p> : null}
        {sanity ? <p className="font-mono text-xs text-neutral-500">{sanity}</p> : null}
        <OverviewBlock rows={overviewRows} />

        {SUBSECTIONS.map(({ id, title, key }) => {
          const sorted = rowsForSubsection(germanyRows, key);
          const groups = clusterRowsByMetric(sorted);
          if (groups.length === 0) return null;
          return (
            <CollapsibleFlagSection key={id} title={title} count={groups.length} defaultOpen uppercaseTitle>
              {key === 'Parliament' ? (
                <ParliamentGroups groups={groups} />
              ) : (
                <div className={CARD_GRID}>{groups.map((g) => renderMetricGroup(g))}</div>
              )}
            </CollapsibleFlagSection>
          );
        })}

        <p className={`font-mono text-[10px] leading-relaxed text-neutral-600 ${UC_META}`}>
          Primary table:{' '}
          <code className="text-neutral-500">germany_government_politics.csv</code> (Government Section). Values,
          years, and notes follow that file.
        </p>
      </div>
    </CollapsibleFlagSection>
  );
}
