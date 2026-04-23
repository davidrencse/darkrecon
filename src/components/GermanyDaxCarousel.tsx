import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { GERMANY_STATIC_MARKET_STRIP, type GermanyStockStripRow } from '../data/germanyStaticMarketStrip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, type ChartConfig } from './ui/chart';

const UC_TITLE = 'uppercase tracking-[0.05em]';
const UC_META = 'uppercase tracking-[0.03em]';

export type { GermanyStockStripRow };

function formatEur(n: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatSignedEur(n: number): string {
  const fmt = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (n > 0) return `+${fmt.format(n)}`;
  return fmt.format(n);
}

function formatPct(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function StockMiniChart({ data, positive }: { data: { idx: number; close: number }[]; positive: boolean }) {
  const stroke = positive ? '#fafafa' : '#9ca3af';
  const chartConfig = {
    close: { label: 'Schluss', color: stroke },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="font-sans h-[34px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 1, right: 1, left: 1, bottom: 0 }}>
          <XAxis dataKey="idx" type="number" domain={[0, 6]} hide />
          <YAxis domain={['auto', 'auto']} hide width={0} />
          <Line
            type="monotone"
            dataKey="close"
            name="close"
            stroke={stroke}
            strokeWidth={1.35}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 2.5, fill: stroke }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

function StockCard({ item }: { item: GermanyStockStripRow }) {
  const up = item.changePercent >= 0;
  const pctClass = up ? 'text-emerald-400' : 'text-red-400';
  const chartData = item.history.map((h, i) => ({ idx: i, close: h.close }));

  return (
    <Card className="w-[152px] shrink-0 overflow-hidden rounded-sm border border-white/[0.14] bg-black font-sans shadow-card ring-1 ring-white/[0.06]">
      <CardHeader className="space-y-0.5 border-b border-white/[0.12] bg-white/[0.03] p-2.5 pb-1.5">
        <CardTitle className={`font-sans text-[9px] font-semibold tabular-nums leading-tight text-neutral-100 ${UC_TITLE}`}>
          {item.ticker}
        </CardTitle>
        <CardDescription className={`font-sans line-clamp-2 min-h-[1.75rem] text-[8px] leading-snug text-neutral-400 ${UC_META}`}>
          {item.companyName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_45%)] px-2.5 pb-2.5 pt-1.5">
        <div className="flex flex-col gap-0">
          <span className="font-sans text-[15px] font-semibold tabular-nums leading-none tracking-tight text-white">
            {formatEur(item.priceEur)}
          </span>
          <div className="flex flex-wrap items-baseline gap-x-1 font-sans text-[8px] tabular-nums">
            <span className={pctClass}>{formatSignedEur(item.changeEur)}</span>
            <span className={pctClass}>{formatPct(item.changePercent)}</span>
          </div>
        </div>
        <StockMiniChart data={chartData} positive={up} />
        {item.highlight ? (
          <p className={`line-clamp-2 border-t border-white/[0.08] pt-1.5 font-sans text-[7px] leading-snug text-neutral-600 ${UC_META}`} title={item.highlight}>
            {item.highlight}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function GermanyDaxCarousel() {
  const items = useMemo(() => GERMANY_STATIC_MARKET_STRIP, []);
  const [paused, setPaused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const tick = useCallback(() => {
    const el = scrollerRef.current;
    const inner = innerRef.current;
    if (!el || !inner || items.length === 0 || paused) return;
    const half = inner.scrollWidth / 2;
    if (half <= 0) return;
    el.scrollLeft += 0.55;
    if (el.scrollLeft >= half) el.scrollLeft -= half;
  }, [items.length, paused]);

  useEffect(() => {
    let id = 0;
    const run = () => {
      tick();
      id = requestAnimationFrame(run);
    };
    id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [tick]);

  return (
    <section
      className="relative font-sans"
      aria-label="German equities and bond ETF (static snapshot)"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="rounded-sm border border-white/[0.14] bg-black p-2.5 shadow-card ring-1 ring-white/[0.06]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="inline-flex items-center border border-white/[0.16] bg-neutral-900 p-0.5">
            <span className="bg-white px-2 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-black">
              Germany
            </span>
            <span className="px-2 py-1 font-sans text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-300">
              Market Console
            </span>
          </div>
          <p className={`font-sans text-[10px] text-neutral-400 ${UC_META}`}>{paused ? 'Stream paused' : 'Live strip'}</p>
        </div>

        <div
          ref={scrollerRef}
          className="max-w-full overflow-x-auto overflow-y-hidden border border-white/[0.12] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:22px_22px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(90deg,transparent,black_18px,black_calc(100%-18px),transparent)]"
        >
          <div ref={innerRef} className="flex w-max gap-2 pb-1">
            {items.map((item) => (
              <StockCard key={item.ticker} item={item} />
            ))}
            {items.map((item) => (
              <StockCard key={`${item.ticker}-dup`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
