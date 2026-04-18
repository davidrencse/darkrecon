import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { GERMANY_STATIC_MARKET_STRIP, type GermanyStockStripRow } from '../data/germanyStaticMarketStrip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from './ui/chart';

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
  const stroke = positive ? '#34d399' : '#fb7185';
  const chartConfig = {
    close: { label: 'Schluss', color: stroke },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="font-sans h-[32px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 1, right: 1, left: 1, bottom: 0 }}>
          <XAxis dataKey="idx" type="number" domain={[0, 6]} hide />
          <YAxis domain={['auto', 'auto']} hide width={0} />
          <ChartTooltip
            cursor={{ stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const arr = payload as Array<{ payload?: { idx?: number } }> | undefined;
                  const i = typeof arr?.[0]?.payload?.idx === 'number' ? arr[0]!.payload!.idx! : 0;
                  return `Tag −${6 - i}`;
                }}
                formatter={(value) => [formatEur(Number(value)), '']}
              />
            }
          />
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
  const pctClass = up ? 'text-emerald-400' : 'text-rose-400';
  const chartData = item.history.map((h, i) => ({ idx: i, close: h.close }));

  return (
    <Card className="w-[128px] shrink-0 overflow-hidden border-white/[0.07] bg-gradient-to-b from-[#131313] to-[#0c0c0c] font-sans shadow-card ring-1 ring-white/[0.03]">
      <CardHeader className="space-y-0.5 p-2 pb-1.5">
        <CardTitle className={`font-sans text-[9px] font-semibold tabular-nums leading-tight text-white ${UC_TITLE}`}>
          {item.ticker}
        </CardTitle>
        <CardDescription className={`font-sans line-clamp-2 min-h-[1.75rem] text-[8px] leading-snug text-neutral-500 ${UC_META}`}>
          {item.companyName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 px-2 pb-2 pt-0">
        <div className="flex flex-col gap-0">
          <span className="font-sans text-[13px] font-semibold tabular-nums leading-none tracking-tight text-neutral-100">
            {formatEur(item.priceEur)}
          </span>
          <div className="flex flex-wrap items-baseline gap-x-1 font-sans text-[8px] tabular-nums">
            <span className={pctClass}>{formatSignedEur(item.changeEur)}</span>
            <span className={pctClass}>{formatPct(item.changePercent)}</span>
          </div>
        </div>
        <StockMiniChart data={chartData} positive={up} />
        {item.highlight ? (
          <p className={`line-clamp-2 font-sans text-[7px] leading-snug text-neutral-600 ${UC_META}`} title={item.highlight}>
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
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2 px-0.5">
        <div>
          <h2 className={`font-sans text-xs font-semibold text-neutral-200 ${UC_TITLE}`}>Germany markets</h2>
        </div>
        <p className={`font-sans text-[10px] text-neutral-600 ${UC_META}`}>Hover to pause</p>
      </div>

      <div
        ref={scrollerRef}
        className="max-w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(90deg,transparent,black_20px,black_calc(100%-20px),transparent)]"
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
    </section>
  );
}
