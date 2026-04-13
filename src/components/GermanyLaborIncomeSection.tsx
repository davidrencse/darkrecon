import { Fragment, useEffect, useMemo, useState } from 'react';
import germanyGovernmentCsvRaw from '../../Assets/Data/Europe/Germany/Government Section/germany_government_politics.csv?raw';
import germanyLaborStatsCsvRaw from '../../Assets/Data/Europe/Germany/germany_labor_statistics.csv?raw';
import {
  clusterRowsByMetric,
  laborIncomeDistributionRows,
  parseGermanyGovernmentPoliticsCsv,
} from '../lib/germanyGovernmentPolitics';
import {
  laborStatisticsClusteredGroups,
  parseGermanyLaborStatisticsCsv,
} from '../lib/germanyLaborStatistics';
import { GOV_POLITICS_CARD_GRID, renderMetricGroup } from './GermanyGovernmentPoliticsBlocks';

const GOV_CSV_URL = '/data/germany_government_politics.csv';
const LABOR_STATS_CSV_URL = '/data/germany_labor_statistics.csv';

/** One row, left → right: Minimum wage, Long-term unemployment, Average annual hours. */
const LABOR_TRIPLE_ROW_METRICS = [
  'Minimum wage',
  'Long-term unemployment rate',
  'Average annual working hours per worker',
] as const;

export function GermanyLaborIncomeSection() {
  const [govRaw, setGovRaw] = useState(germanyGovernmentCsvRaw);
  const [laborRaw, setLaborRaw] = useState(germanyLaborStatsCsvRaw);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [govRes, laborRes] = await Promise.all([fetch(GOV_CSV_URL), fetch(LABOR_STATS_CSV_URL)]);
        const govText = govRes.ok ? await govRes.text() : '';
        const laborText = laborRes.ok ? await laborRes.text() : '';
        if (!cancelled) {
          if (govText.trim()) setGovRaw(govText);
          if (laborText.trim()) setLaborRaw(laborText);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load labor & income data.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const govGroups = useMemo(() => {
    const all = parseGermanyGovernmentPoliticsCsv(govRaw);
    const sorted = laborIncomeDistributionRows(all);
    return clusterRowsByMetric(sorted);
  }, [govRaw]);

  const laborFileGroups = useMemo(() => {
    const parsed = parseGermanyLaborStatisticsCsv(laborRaw);
    return laborStatisticsClusteredGroups(parsed);
  }, [laborRaw]);

  const { laborYouthGroups, laborLfprGroups, laborTripleRowGroups } = useMemo(() => {
    const byMetric = new Map(laborFileGroups.map((g) => [g[0]!.metric.trim(), g] as const));
    const youth = ['Youth unemployment rate' as const]
      .map((m) => byMetric.get(m))
      .filter((g): g is (typeof laborFileGroups)[number] => g != null);
    const lfpr = ['Labour force participation rate' as const]
      .map((m) => byMetric.get(m))
      .filter((g): g is (typeof laborFileGroups)[number] => g != null);
    const triple = LABOR_TRIPLE_ROW_METRICS.map((m) => byMetric.get(m)).filter(
      (g): g is (typeof laborFileGroups)[number] => g != null,
    );
    return { laborYouthGroups: youth, laborLfprGroups: lfpr, laborTripleRowGroups: triple };
  }, [laborFileGroups]);

  if (loadError) {
    return <p className="font-mono text-xs text-amber-500/90">{loadError}</p>;
  }

  const hasGov = govGroups.length > 0;
  const hasLaborFile = laborFileGroups.length > 0;

  if (!hasGov && !hasLaborFile) {
    return (
      <p className="font-mono text-xs text-neutral-500">
        No labor / income rows in <code className="text-neutral-400">germany_government_politics.csv</code> (Government /
        Labor law or Economic / Labor &amp; Income Distribution) and no rows in{' '}
        <code className="text-neutral-400">germany_labor_statistics.csv</code>.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {hasGov ? (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Labor market &amp; migration enforcement (government dataset)
          </p>
          <div className={GOV_POLITICS_CARD_GRID}>
            {govGroups.map((g) => (
              <Fragment key={`gov-${g[0]!.metric}`}>{renderMetricGroup(g)}</Fragment>
            ))}
          </div>
          <p className="font-mono text-[10px] leading-relaxed text-neutral-600 uppercase tracking-[0.03em]">
            Source: <code className="text-neutral-500">germany_government_politics.csv</code> — Government / Labor law or
            Economic / Labor &amp; Income Distribution.
          </p>
        </div>
      ) : null}

      {hasLaborFile ? (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Labor market indicators
          </p>
          {laborYouthGroups.length > 0 ? (
            <div className={GOV_POLITICS_CARD_GRID}>
              {laborYouthGroups.map((g) => (
                <Fragment key={`lab-${g[0]!.metric}`}>{renderMetricGroup(g)}</Fragment>
              ))}
            </div>
          ) : null}
          {laborLfprGroups.length > 0 ? (
            <div className={GOV_POLITICS_CARD_GRID}>
              {laborLfprGroups.map((g) => (
                <Fragment key={`lab-${g[0]!.metric}`}>{renderMetricGroup(g)}</Fragment>
              ))}
            </div>
          ) : null}
          {laborTripleRowGroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {laborTripleRowGroups.map((g) => (
                <Fragment key={`lab-triple-${g[0]!.metric}`}>{renderMetricGroup(g)}</Fragment>
              ))}
            </div>
          ) : null}
          <p className="font-mono text-[10px] leading-relaxed text-neutral-600 uppercase tracking-[0.03em]">
            Source: <code className="text-neutral-500">germany_labor_statistics.csv</code>
          </p>
        </div>
      ) : null}
    </div>
  );
}
