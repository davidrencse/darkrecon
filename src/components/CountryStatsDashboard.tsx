import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { FlagEntry } from '../types/flag';
import type { CountryStatMetric } from '../types/countryStats';
import { wideRowToStatMetrics } from '../lib/countryStatsMetrics';
import type { CountryWideRow } from '../lib/parseCountriesWideCsv';
import {
  indexCountriesByCountryCode,
  indexCountriesByIso3,
  parseCountriesWideCsv,
} from '../lib/parseCountriesWideCsv';

const CSV_URL = '/data/countries_screenshot_stats_latest.csv';
const PROXY_CSV_URL = '/data/countries_proxy_demographics_births.csv';

const METRIC_ORDER = [
  'GDP',
  'GDP per capita',
  'White (native) population',
  'Non-European population',
  'Immigrants',
  'Total birth rate',
  'White (native) birth rate',
  'Immigrant birth rate',
  'Top immigrant countries',
] as const;

function extractLeadingPercent(value: string): number | null {
  const m = value.trim().match(/^([\d.]+)\s*%/);
  if (!m) return null;
  const n = parseFloat(m[1]!);
  return Number.isFinite(n) ? n : null;
}

function isUnavailable(value: string): boolean {
  const v = value.trim();
  return v === '' || v.toUpperCase() === 'N/A';
}

function PercentRing({ percent }: { percent: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, percent));
  const dash = (p / 100) * c;
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 text-[var(--uk-accent)]" aria-hidden>
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        className="text-neutral-800"
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 50 50)"
        className="text-[var(--uk-accent)]"
      />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        className="fill-neutral-200 font-mono text-[15px] font-semibold"
      >
        {percent.toFixed(1)}%
      </text>
    </svg>
  );
}

function SourceLinks({ url, className }: { url: string; className: string }) {
  const urls = url
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
  if (urls.length === 0) return null;
  if (urls.length === 1) {
    return (
      <a href={urls[0]} target="_blank" rel="noopener noreferrer" className={className}>
        Source ↗
      </a>
    );
  }
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {urls.map((u, i) => (
        <li key={u}>
          <a href={u} target="_blank" rel="noopener noreferrer" className={className}>
            Source {i + 1} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

function MetaLine({ row }: { row: CountryStatMetric }) {
  const parts = [row.reference_period, row.geography_used].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className="mt-3 font-mono text-[10px] leading-relaxed text-neutral-500">
      {parts.join(' · ')}
    </p>
  );
}

function NoteBlock({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <details className="mt-3 border-t border-neutral-800/80 pt-2">
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-neutral-600 hover:text-neutral-400">
        Note
      </summary>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-neutral-500">{text}</p>
    </details>
  );
}

function MetricTile({
  row,
  largeValue,
  accent,
  extra,
}: {
  row: CountryStatMetric;
  largeValue?: boolean;
  accent?: boolean;
  extra?: ReactNode;
}) {
  const na = isUnavailable(row.value);
  return (
    <article
      className={
        accent
          ? 'flex min-h-[148px] flex-col border border-[var(--uk-accent-border)] bg-[var(--uk-accent-surface)] p-4 sm:p-5'
          : 'flex min-h-[148px] flex-col border border-neutral-800 bg-[#121212] p-4 sm:p-5'
      }
    >
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
        {row.metric}
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={
            largeValue
              ? `min-w-0 flex-1 font-mono text-2xl font-semibold leading-none tracking-tight sm:text-3xl lg:text-4xl ${na ? 'text-neutral-600' : 'text-neutral-100'}`
              : `min-w-0 flex-1 font-mono text-lg font-medium leading-snug sm:text-xl ${na ? 'text-neutral-600' : 'text-neutral-100'}`
          }
        >
          {na ? 'N/A' : row.value}
        </p>
        {extra ? <div className="shrink-0">{extra}</div> : null}
      </div>
      <MetaLine row={row} />
      {row.source_url ? (
        <div className="mt-2">
          <SourceLinks
            url={row.source_url}
            className="inline-flex w-fit items-center gap-1 font-mono text-[10px] text-[var(--uk-accent)] hover:text-neutral-200"
          />
        </div>
      ) : null}
      <NoteBlock text={row.notes} />
    </article>
  );
}

function TopCountriesTile({ row }: { row: CountryStatMetric }) {
  const items = row.value
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <article className="border border-neutral-800 bg-[#121212] p-4 sm:p-5 lg:col-span-3">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
        {row.metric}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((name) => (
          <li
            key={name}
            className="border border-neutral-800 bg-black/40 px-3 py-1.5 font-mono text-xs text-neutral-300"
          >
            {name}
          </li>
        ))}
      </ul>
      <MetaLine row={row} />
      {row.source_url ? (
        <div className="mt-3">
          <SourceLinks
            url={row.source_url}
            className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--uk-accent)] hover:text-neutral-200"
          />
        </div>
      ) : null}
      <NoteBlock text={row.notes} />
    </article>
  );
}

function orderMetrics(rows: CountryStatMetric[]): CountryStatMetric[] {
  const byMetric = new Map(rows.map((r) => [r.metric, r]));
  const ordered: CountryStatMetric[] = [];
  for (const m of METRIC_ORDER) {
    const hit = byMetric.get(m);
    if (hit) ordered.push(hit);
  }
  const known = new Set<string>(METRIC_ORDER);
  for (const r of rows) {
    if (!known.has(r.metric)) ordered.push(r);
  }
  return ordered;
}

type CountryStatsDashboardProps = {
  flag: FlagEntry;
  iso3: string;
  onBack: () => void;
};

export function CountryStatsDashboard({ flag, iso3, onBack }: CountryStatsDashboardProps) {
  const [ordered, setOrdered] = useState<CountryStatMetric[] | null>(null);
  const [datasetNote, setDatasetNote] = useState('');
  const [proxyDatasetNote, setProxyDatasetNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mainRes, proxyRes] = await Promise.all([
          fetch(CSV_URL),
          fetch(PROXY_CSV_URL),
        ]);
        if (!mainRes.ok) throw new Error(`Could not load main data (${mainRes.status})`);
        const mainText = await mainRes.text();
        const parsedMain = parseCountriesWideCsv(mainText);
        const byIso = indexCountriesByIso3(parsedMain);
        const row = byIso.get(iso3.toUpperCase());
        if (cancelled) return;
        if (!row) {
          setError(`No statistics row for ISO3 “${iso3}”.`);
          setOrdered(null);
          return;
        }

        let proxyRow: CountryWideRow | null = null;
        if (proxyRes.ok) {
          const proxyText = await proxyRes.text();
          const parsedProxy = parseCountriesWideCsv(proxyText);
          proxyRow = indexCountriesByCountryCode(parsedProxy).get(iso3.toUpperCase()) ?? null;
        }

        if (cancelled) return;
        setDatasetNote(row.notes?.trim() || '');
        setProxyDatasetNote(proxyRow?.notes?.trim() || '');
        setOrdered(orderMetrics(wideRowToStatMetrics(row, iso3.toUpperCase(), proxyRow)));
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load data.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [iso3]);

  const sources = useMemo(() => {
    if (!ordered) return [];
    const map = new Map<string, { name: string; url: string; date: string }>();
    for (const r of ordered) {
      const urls = r.source_url
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const u of urls) {
        if (map.has(u)) continue;
        let name = r.source_name.trim();
        if (!name) {
          try {
            name = new URL(u).hostname.replace(/^www\./, '');
          } catch {
            name = 'Source';
          }
        }
        map.set(u, {
          name,
          url: u,
          date: r.source_publication_or_access_date.trim(),
        });
      }
    }
    return [...map.values()];
  }, [ordered]);

  const displayTitle = flag.label.toUpperCase();

  return (
    <div className="min-h-full bg-[#0a0a0a] font-mono text-neutral-200">
      <div className="border-b border-neutral-800 bg-[#0c0c0c]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 transition-colors hover:text-white"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="hidden h-10 w-14 border border-neutral-800 bg-black/50 sm:flex sm:items-center sm:justify-center sm:px-2">
              <img src={flag.src} alt="" className="max-h-7 max-w-full object-contain" decoding="async" />
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Country stats</p>
              <h1 className="text-sm font-semibold uppercase tracking-[0.12em] text-white sm:text-base">
                {displayTitle}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {error ? (
          <p className="border border-neutral-800 bg-[#121212] p-6 font-mono text-sm text-red-400/90">
            {error}
          </p>
        ) : null}

        {!error && ordered === null ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse border border-neutral-800 bg-[#121212]"
              />
            ))}
          </div>
        ) : null}

        {ordered && ordered.length > 0 ? (
          <>
            <p className="mb-4 max-w-2xl font-mono text-[11px] leading-relaxed text-neutral-500">
              Main file: World Bank Data360 (GDP, overall TFR, migrant stock, corridors). Proxy file: native /
              foreign-born population and birth metrics (TFR split or % births by mother nativity). Open card
              notes and methodology sections below for definitions.
            </p>
            {datasetNote ? (
              <details className="mb-3 max-w-2xl border border-neutral-800 bg-[#121212] p-3 font-mono text-[10px] text-neutral-500">
                <summary className="cursor-pointer text-neutral-400 hover:text-neutral-200">
                  Main CSV methodology note
                </summary>
                <p className="mt-2 leading-relaxed">{datasetNote}</p>
              </details>
            ) : null}
            {proxyDatasetNote ? (
              <details className="mb-6 max-w-2xl border border-neutral-800 bg-[#121212] p-3 font-mono text-[10px] text-neutral-500">
                <summary className="cursor-pointer text-neutral-400 hover:text-neutral-200">
                  Proxy demographics &amp; births CSV note
                </summary>
                <p className="mt-2 leading-relaxed">{proxyDatasetNote}</p>
              </details>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ordered.map((row) => {
                if (row.metric === 'Top immigrant countries') {
                  if (isUnavailable(row.value)) {
                    return <MetricTile key={row.metric} row={row} />;
                  }
                  return <TopCountriesTile key={row.metric} row={row} />;
                }
                if (row.metric === 'GDP') {
                  return <MetricTile key={row.metric} row={row} largeValue accent />;
                }
                if (row.metric === 'GDP per capita') {
                  return <MetricTile key={row.metric} row={row} largeValue />;
                }
                if (row.metric === 'Immigrant birth rate') {
                  const p = extractLeadingPercent(row.value);
                  return (
                    <MetricTile
                      key={row.metric}
                      row={row}
                      extra={p !== null ? <PercentRing percent={p} /> : undefined}
                    />
                  );
                }
                if (row.metric === 'White (native) birth rate') {
                  const p = extractLeadingPercent(row.value);
                  return (
                    <MetricTile
                      key={row.metric}
                      row={row}
                      extra={p !== null ? <PercentRing percent={p} /> : undefined}
                    />
                  );
                }
                return <MetricTile key={row.metric} row={row} />;
              })}
            </div>

            <section className="mt-10 border border-neutral-800 bg-[#121212] p-4 sm:p-6">
              <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                Sources
              </h2>
              <ul className="mt-4 space-y-3">
                {sources.map((s) => (
                  <li
                    key={s.url}
                    className="flex flex-col gap-1 border-b border-neutral-800/80 pb-3 last:border-0 last:pb-0"
                  >
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-[var(--uk-accent)] hover:text-neutral-200"
                    >
                      {s.name}
                    </a>
                    {s.date ? (
                      <span className="font-mono text-[10px] text-neutral-600">{s.date}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
