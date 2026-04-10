import { useEffect, useMemo, useState } from 'react';
import germanyMigrantCrimeRaw from '../../Assets/Data/Europe/Germany/germany_migrant_crime_requested_metrics.csv?raw';
import { parseCsvRows } from '../lib/csv';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const CSV_URL = '/data/germany_migrant_crime_requested_metrics.csv';

type MigrantCrimeRow = {
  country: string;
  requested_metric: string;
  value: string;
  unit: string;
  year: string;
  what_this_number_is: string;
  best_official_substitute: string;
  source: string;
  source_url: string;
  note: string;
};

type TileDef = { requestedMetric: string; title: string };

const TILES: TileDef[] = [
  { requestedMetric: 'Total Crime committed by migrants', title: 'Total crime' },
  { requestedMetric: 'Sex crime committed by migrants', title: 'Sex crime' },
  { requestedMetric: 'Rape committed by migrants', title: 'Rape' },
  { requestedMetric: 'Theft committed by migrants', title: 'Theft' },
  { requestedMetric: 'Murder committed by migrants', title: 'Murder' },
  { requestedMetric: 'drug_offenses_committed_by_migrants', title: 'Drug offences' },
];

function norm(s: string): string {
  return String(s ?? '')
    .replace(/\uFEFF/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRows(raw: string): MigrantCrimeRow[] {
  const rows = parseCsvRows(raw.trim());
  if (rows.length < 2) return [];
  const headers = rows[0]!.map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => {
      o[h] = (cells[i] ?? '').trim();
    });
    return o as unknown as MigrantCrimeRow;
  });
}

function parseCount(s: string): number | null {
  const v = String(s ?? '').trim();
  if (!v || v.toUpperCase() === 'N/A') return null;
  const n = Number(v.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function fmtCount(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

function normalizeSourceUrls(urlField: string): string[] {
  return String(urlField ?? '')
    .split('|')
    .map((u) => u.trim())
    .filter(Boolean);
}

function combineNotes(row: MigrantCrimeRow): string {
  return [
    row.what_this_number_is ? `What this is: ${row.what_this_number_is}` : '',
    row.best_official_substitute ? `Best official substitute: ${row.best_official_substitute}` : '',
    row.note ? `Note: ${row.note}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function GermanyMigrantCrimeSection() {
  const [raw, setRaw] = useState<string>(germanyMigrantCrimeRaw);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error(`Failed to load migrant crime CSV (${res.status})`);
        const text = await res.text();
        if (!cancelled && text.trim()) {
          setRaw(text);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load migrant crime data.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => parseRows(raw), [raw]);
  const byRequested = useMemo(() => {
    const m = new Map<string, MigrantCrimeRow>();
    for (const r of rows) {
      const k = norm(r.requested_metric);
      if (k) m.set(k, r);
    }
    return m;
  }, [rows]);

  return (
    <div className="flex flex-col gap-4">
      {loadError ? <p className="font-mono text-xs text-amber-500/90">{loadError}</p> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TILES.map((t) => {
          const r = byRequested.get(norm(t.requestedMetric));
          const n = r ? parseCount(r.value) : null;
          const unit = r?.unit?.trim() ?? '';
          const year = r?.year?.trim() ?? '';
          const meta = [year ? `Year: ${year}` : null, unit || null].filter(Boolean).join(' · ');
          const urls = r ? normalizeSourceUrls(r.source_url) : [];
          const notes = r ? combineNotes(r) : '';
          return (
            <Card key={t.title} className="flex flex-col overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle>{t.title}</CardTitle>
                {meta ? <CardDescription>{meta}</CardDescription> : null}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3 pt-4">
                <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-white">
                  {n != null ? fmtCount(n) : r?.value?.trim() ? r.value.trim() : 'N/A'}
                </p>
                {urls.length > 0 ? (
                  <div className="space-y-1">
                    {urls.map((u, i) => (
                      <a
                        key={`${u}-${i}`}
                        href={u}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-mono text-[11px] text-[var(--uk-accent)] hover:text-neutral-200"
                      >
                        {r?.source?.trim() ? (urls.length > 1 ? `${r.source.trim()} (${i + 1})` : r.source.trim()) : `Source ${i + 1}`} ↗
                      </a>
                    ))}
                  </div>
                ) : null}
                {notes ? (
                  <details className="rounded-md border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
                    <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500 hover:text-neutral-400">
                      Note
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-neutral-500">
                      {notes}
                    </pre>
                  </details>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

