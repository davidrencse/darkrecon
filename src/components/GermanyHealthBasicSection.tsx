import { Fragment, useEffect, useMemo, useState } from 'react';
import healthBasicCsvRaw from '../../Assets/Data/Europe/Germany/Health Section/germany_health_statistics_basic.csv?raw';
import type { GermanyGovernmentPoliticsRow } from '../lib/germanyGovernmentPolitics';
import {
  clusterMetricTable,
  GERMANY_HEALTH_BASIC_METRIC_ORDER,
  parseGermanyMetricTableCsv,
} from '../lib/germanyHealthCsv';
import { GOV_POLITICS_CARD_GRID, GovStatCard, renderMetricGroup } from './GermanyGovernmentPoliticsBlocks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const CSV_URL = '/data/germany_health_statistics_basic.csv';

/** These Overview metrics use stat cards; Healthcare expenditure stays a multi-row table. */
const HEALTH_OVERVIEW_BOX_METRICS = new Set([
  'Obesity rate',
  'Smoking prevalence',
  'Suicide Rate',
  'Physicians per 1,000 people',
  'Total number of doctors',
  'Healthy life expectancy',
  'Preventable mortality rate',
  'Alcohol consumption',
]);

const OECD_HAAG_GERMANY_HTML =
  'https://www.oecd.org/en/publications/health-at-a-glance-2025_15a55280-en/germany_99d672fb-en.html';
const OECD_HAAG_GERMANY_PDF =
  'https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/11/health-at-a-glance-2025-country-notes_2f94481e/germany_461a6f3f/99d672fb-en.pdf';

/** OECD Health at a Glance 2025 – Germany (supplementary to CSV). */
const HEALTH_OVERVIEW_OECD_EXTRA_ROWS: GermanyGovernmentPoliticsRow[] = [
  {
    section: 'Health overview',
    subsection: '',
    metric: 'Life expectancy',
    submetric: '',
    breakdown: '',
    value: '81.1',
    unit: 'years',
    referenceYear: '2025',
    sourceName: 'OECD Health at a Glance 2025 – Germany',
    sourceUrl: OECD_HAAG_GERMANY_HTML,
    notes: '',
  },
  {
    section: 'Health overview',
    subsection: '',
    metric: 'Self-reported poor health',
    submetric: 'Population aged 15+',
    breakdown: 'Bad or very bad self-rated health',
    value: '10.9',
    unit: 'percent',
    referenceYear: '2025',
    sourceName: 'OECD Health at a Glance 2025 – Germany Country Note',
    sourceUrl: OECD_HAAG_GERMANY_PDF,
    notes: 'Share of the population aged 15+ rating their health as bad or very bad.',
  },
  {
    section: 'Health overview',
    subsection: '',
    metric: 'Insufficient physical activity',
    submetric: 'Adults',
    breakdown: '',
    value: '15',
    unit: 'percent',
    referenceYear: '2025',
    sourceName: 'OECD Health at a Glance 2025 – Germany Country Note',
    sourceUrl: OECD_HAAG_GERMANY_HTML,
    notes: 'Share of adults with insufficient physical activity (better than OECD average).',
  },
  {
    section: 'Health overview',
    subsection: '',
    metric: 'Healthy life expectancy (OECD country note)',
    submetric: 'At birth',
    breakdown: '',
    value: '57',
    unit: 'years',
    referenceYear: '2025',
    sourceName: 'OECD Health at a Glance 2025 – Germany Country Note (OECD Health Statistics 2025)',
    sourceUrl: OECD_HAAG_GERMANY_PDF,
    notes: 'Approximate HALE at birth in OECD country note; women slightly higher than men.',
  },
];

function formatValue(row: GermanyGovernmentPoliticsRow | undefined): string {
  if (!row) return 'N/A';
  const n = Number(row.value);
  if (Number.isFinite(n)) return n.toLocaleString('en-US');
  return row.value || 'N/A';
}

function HealthcareExpenditureStyledCard({ rows }: { rows: GermanyGovernmentPoliticsRow[] }) {
  const perCapitaTotal = rows.find((r) => r.submetric.toLowerCase().includes('per capita') && r.breakdown === 'Total');
  const shareGdpTotal = rows.find((r) => r.submetric.toLowerCase().includes('share of gdp') && r.breakdown === 'Total');
  const privateShare = rows.find((r) => r.breakdown === 'Private financing share');
  const publicShare = rows.find((r) => r.breakdown === 'Public financing share');
  const referenceYear = rows.find((r) => r.referenceYear)?.referenceYear || '2024';
  const sourceRow =
    rows.find((r) => r.sourceName.toLowerCase().includes('destatis')) ??
    rows.find((r) => r.sourceUrl.trim()) ??
    rows[0];

  const publicPct = Number(publicShare?.value) || 0;
  const privatePct = Number(privateShare?.value) || 0;
  const gdpPct = Number(shareGdpTotal?.value) || 0;

  return (
    <Card className="overflow-hidden border-white/[0.1] bg-black shadow-card sm:col-span-2 lg:col-span-3">
      <CardHeader className="space-y-1 p-4 pb-3 sm:p-5 sm:pb-4">
        <CardTitle className="text-xl font-semibold text-neutral-100">Healthcare expenditure</CardTitle>
        <CardDescription className="text-sm text-neutral-400">Reference year: {referenceYear}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-5 sm:pt-0">
        <div className="rounded-md border border-white/[0.08] bg-black p-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 gap-y-2 text-sm">
            <p className="text-neutral-300">Total</p>
            <p className="text-right font-semibold text-neutral-100">{formatValue(perCapitaTotal)}</p>
            <p className="text-right text-neutral-400">EUR per person</p>

            <p className="text-neutral-300">Private financing share</p>
            <p className="text-right font-semibold text-neutral-100">{formatValue(privateShare)}</p>
            <p className="text-right text-neutral-400">percent of current health expenditure</p>

            <p className="text-neutral-300">Public financing share</p>
            <p className="text-right font-semibold text-neutral-100">{formatValue(publicShare)}</p>
            <p className="text-right text-neutral-400">percent of current health expenditure</p>

            <p className="text-neutral-300">Total</p>
            <p className="text-right font-semibold text-neutral-100">{formatValue(shareGdpTotal)}</p>
            <p className="text-right text-neutral-400">percent of GDP</p>
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-white/[0.08] bg-black p-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-neutral-300">Public financing share</span>
              <span className="font-semibold text-neutral-100">{publicPct.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.08]">
              <div className="h-full rounded-full bg-[#3b82f6]" style={{ width: `${Math.max(2, Math.min(100, publicPct))}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-neutral-300">Private financing share</span>
              <span className="font-semibold text-neutral-100">{privatePct.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.08]">
              <div className="h-full rounded-full bg-[#fb923c]" style={{ width: `${Math.max(2, Math.min(100, privatePct))}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-neutral-300">Share of GDP</span>
              <span className="font-semibold text-neutral-100">{gdpPct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.08]">
              <div className="h-full rounded-full bg-[#a3e635]" style={{ width: `${Math.max(2, Math.min(100, gdpPct * 4))}%` }} />
            </div>
          </div>
        </div>

        {sourceRow?.sourceUrl ? (
          <a
            href={sourceRow.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md border border-white/[0.1] bg-emerald-900/20 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-800/20"
          >
            {sourceRow.sourceName} ↗
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function GermanyHealthBasicSection() {
  const [raw, setRaw] = useState(healthBasicCsvRaw);
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
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load health statistics.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    const parsed = parseGermanyMetricTableCsv(raw);
    return clusterMetricTable(parsed, 'Health overview', GERMANY_HEALTH_BASIC_METRIC_ORDER);
  }, [raw]);

  if (loadError) {
    return <p className="font-sans text-xs text-amber-500/90">{loadError}</p>;
  }

  if (groups.length === 0) {
    return (
      <p className="font-sans text-xs text-neutral-500">
        No rows in <code className="text-neutral-400">germany_health_statistics_basic.csv</code>.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={GOV_POLITICS_CARD_GRID}>
        {groups.map((g) => {
          const metric = g[0]!.metric;
          if (metric === 'Healthcare expenditure') {
            return <HealthcareExpenditureStyledCard key={metric} rows={g} />;
          }
          if (HEALTH_OVERVIEW_BOX_METRICS.has(metric)) {
            return (
              <Fragment key={metric}>
                {g.map((row, i) => (
                  <GovStatCard key={`${metric}-${i}-${row.breakdown}-${row.submetric}`} row={row} />
                ))}
              </Fragment>
            );
          }
          return <Fragment key={metric}>{renderMetricGroup(g)}</Fragment>;
        })}
        {HEALTH_OVERVIEW_OECD_EXTRA_ROWS.map((row, i) => (
          <GovStatCard key={`health-overview-oecd-${i}-${row.metric}`} row={row} />
        ))}
      </div>
    </div>
  );
}
