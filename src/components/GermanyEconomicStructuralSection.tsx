import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useMemo, useState } from 'react';

type EconomicIndicator = {
  id: string;
  title: string;
  valueMain: string;
  valueSub: string;
  details: string;
  source: string;
};

const UC = 'uppercase tracking-[0.05em]';

export const GERMANY_ECONOMIC_STRUCTURAL_GROUP_COUNT = 9;

type OilSupplierRow = {
  rank: number;
  country: string;
  share: string;
  notes: string;
};

function OilSuppliersWidget({ onClose }: { onClose: () => void }) {
  const rows: OilSupplierRow[] = useMemo(
    () => [
      { rank: 1, country: 'Norway', share: '~18–20%', notes: 'Largest supplier after Russia ban' },
      { rank: 2, country: 'United States', share: '~15–18%', notes: 'Rose sharply after 2022' },
      { rank: 3, country: 'Kazakhstan', share: '~12–13%', notes: 'Significant increase via pipelines' },
      { rank: 4, country: 'Libya', share: '~8–9%', notes: 'Important North African supplier' },
      { rank: 5, country: 'Saudi Arabia', share: '~6–7%', notes: 'Stable OPEC supplier' },
      { rank: 6, country: 'Nigeria', share: '~6%', notes: 'West African crude' },
      { rank: 7, country: 'Iraq', share: '~5–6%', notes: 'Growing share' },
      { rank: 8, country: 'United Kingdom', share: '~4–5%', notes: 'North Sea oil' },
      { rank: 9, country: 'Azerbaijan', share: '~3–4%', notes: 'Caspian region' },
      { rank: 10, country: 'Angola / Algeria', share: '~2–3% each', notes: 'Smaller but consistent suppliers' },
    ],
    [],
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Oil exporters to Germany"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-2 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-3 pb-2">
          <div className="min-w-0">
            <CardTitle className={`font-sans text-xs text-neutral-100 ${UC}`}>
              Oil exporters to Germany (crude)
            </CardTitle>
            <p className="mt-1 font-sans text-[10px] leading-snug text-neutral-500">
              Approximate shares of Germany&apos;s crude oil imports (post-2022 supplier mix)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-white/[0.1] bg-card px-2 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-neutral-200 shadow-sm transition hover:border-white/[0.16] hover:bg-card-hover"
          >
            Close
          </button>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="overflow-hidden rounded-md border border-white/[0.08]">
            <Table className="font-sans text-[11px]">
              <TableHeader>
                <TableRow className="bg-white/[0.03]">
                  <TableHead className="h-9 px-2 text-[10px] uppercase tracking-[0.1em]">Rank</TableHead>
                  <TableHead className="h-9 px-2 text-[10px] uppercase tracking-[0.1em]">Country</TableHead>
                  <TableHead className="h-9 px-2 text-[10px] uppercase tracking-[0.1em]">Share</TableHead>
                  <TableHead className="h-9 px-2 text-[10px] uppercase tracking-[0.1em]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.rank}>
                    <TableCell className="px-2 py-2 tabular-nums text-neutral-300">{r.rank}</TableCell>
                    <TableCell className="px-2 py-2">{r.country}</TableCell>
                    <TableCell className="px-2 py-2 tabular-nums text-neutral-200">{r.share}</TableCell>
                    <TableCell className="px-2 py-2 text-neutral-400">{r.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const INDICATORS: readonly EconomicIndicator[] = [
  {
    id: 'public-debt-gdp',
    title: 'Public debt (% of GDP)',
    valueMain: '63.5%',
    valueSub: '(end 2025) → 65–67% expected (end 2026)',
    details:
      'Debt rose by about EUR 144B in 2025, driven by defense, infrastructure, and special funds. Fiscal stance is less conservative than prior years.',
    source: 'Deutsche Bundesbank, 31 Mar 2026.',
  },
  {
    id: 'budget-deficit',
    title: 'Government budget deficit',
    valueMain: '4.0%',
    valueSub: 'of GDP (2026 forecast)',
    details:
      'Highest in decades, linked to defense, infrastructure, and energy-relief spending, with heavier use of special funds.',
    source: 'European Commission forecast (Nov 2025) and German budget plans.',
  },
  {
    id: 'productivity',
    title: 'Labour productivity',
    valueMain: 'Stagnant',
    valueSub: 'near-zero 10+ years; ~-0.3% early 2025',
    details:
      'Germany remains among the weakest productivity-growth performers in major economies, weighing on medium-term growth.',
    source: 'Eurostat and Trading Economics (2025 data).',
  },
  {
    id: 'youth-unemployment',
    title: 'Youth unemployment (15-24)',
    valueMain: '10.2%',
    valueSub: '(2025 to early 2026 avg)',
    details:
      'Well above overall unemployment (~6.3%); youth transition and migrant integration remain pressure points.',
    source: 'Destatis and Eurostat.',
  },
  {
    id: 'current-account',
    title: 'Current account surplus',
    valueMain: '+4.5%',
    valueSub: 'of GDP (2025)',
    details:
      'Still globally large but narrowing; approx EUR 251B (2024) down to EUR 197B (2025), reflecting strong exports and weaker domestic demand.',
    source: 'Deutsche Bundesbank balance-of-payments data (2025).',
  },
  {
    id: 'public-debt-total',
    title: 'Total public debt (absolute)',
    valueMain: '€2.84T',
    valueSub: '(end 2025)',
    details:
      'General government total (federal, states, local, and social funds); annual increase was about EUR 144B.',
    source: 'Deutsche Bundesbank, 31 Mar 2026.',
  },
  {
    id: 'oil-dependency',
    title: 'Oil dependency',
    valueMain: '98%',
    valueSub: 'imported',
    details:
      'Domestic output is very small (~1.6M tonnes in 2024); major suppliers now include Norway, the US, and Kazakhstan.',
    source: 'BGR and Clean Energy Wire (2025 data).',
  },
  {
    id: 'gold-reserves',
    title: 'Gold reserves',
    valueMain: '3,350',
    valueSub: 'tonnes',
    details:
      'Among the largest official holdings worldwide; roughly 37% (~1,236 tonnes) remains stored in New York.',
    source: 'Deutsche Bundesbank and World Gold Council (Q4 2025).',
  },
  {
    id: 'credit-rating',
    title: 'Credit rating',
    valueMain: 'AAA',
    valueSub: '(stable) — S&P, Moody’s, Fitch',
    details:
      'Top sovereign rating retained despite rising debt due to export capacity and institutional strength.',
    source: 'S&P, Moodys, and Fitch (2025 to early 2026).',
  },
];

export function GermanyEconomicStructuralSection() {
  const [oilWidgetOpen, setOilWidgetOpen] = useState(false);

  return (
    <>
      {oilWidgetOpen ? <OilSuppliersWidget onClose={() => setOilWidgetOpen(false)} /> : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {INDICATORS.map((item) => (
          <Card key={item.id}>
            <CardHeader className="space-y-1 p-3 pb-2">
              <CardTitle className={`font-sans text-[11px] leading-tight text-neutral-100 ${UC}`}>
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 p-3 pt-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-sans text-xl font-semibold leading-none text-neutral-100 tabular-nums">
                  {item.valueMain}
                </span>
                <span className="font-sans text-[10px] font-medium leading-snug text-neutral-500">
                  {item.valueSub}
                </span>
              </div>
              <p className="font-sans text-[10px] leading-snug text-neutral-400">{item.details}</p>

              {item.id === 'oil-dependency' ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setOilWidgetOpen(true)}
                    className="mt-1 rounded-md border border-white/[0.1] bg-card px-2 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-neutral-200 shadow-sm transition hover:border-white/[0.16] hover:bg-card-hover"
                  >
                    Top suppliers
                  </button>
                </div>
              ) : null}

              <p className="border-t border-white/[0.06] pt-1.5 font-sans text-[9px] leading-snug text-neutral-600">
                {item.source}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
