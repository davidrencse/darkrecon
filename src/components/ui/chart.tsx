import * as React from 'react';
import { Tooltip } from 'recharts';
import { cn } from '../../lib/utils';

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

const ChartContext = React.createContext<{ config: ChartConfig }>({ config: {} });

export function ChartContainer({
  config,
  className,
  children,
}: React.PropsWithChildren<{ config: ChartConfig; className?: string }>) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn('h-[300px] w-full', className)}>{children}</div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip(props: Record<string, unknown>) {
  return <Tooltip {...(props as object)} />;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
}: {
  active?: boolean;
  payload?: Array<Record<string, unknown>>;
  label?: unknown;
  formatter?: (value: unknown, name?: unknown, item?: unknown, payload?: unknown) => React.ReactNode;
  labelFormatter?: (label: unknown, payload?: unknown) => React.ReactNode;
  className?: string;
}) {
  const { config } = React.useContext(ChartContext);

  if (!active || !payload || payload.length === 0) return null;

  const renderedLabel = labelFormatter ? labelFormatter(label, payload) : label;

  return (
    <div className={cn('min-w-[180px] border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs', className)}>
      {renderedLabel != null ? <p className="mb-1 font-mono text-neutral-300">{String(renderedLabel)}</p> : null}
      <div className="space-y-1">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? '');
          const cfg = config[key];
          const entryLabel = String(cfg?.label ?? item.name ?? key);
          const indicator = (item.color as string | undefined) ?? cfg?.color ?? '#8884d8';
          const value = item.value as number | string | undefined;
          return (
            <div key={`${key}-${entryLabel}`} className="flex items-center justify-between gap-2 font-mono">
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: indicator }} />
                <span>{entryLabel}</span>
              </div>
              <span className="text-neutral-100">
                {formatter ? formatter(value, entryLabel, item, payload) : String(value ?? '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
