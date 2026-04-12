import { useMemo } from 'react';
import type { GermanyGovernmentPoliticsRow } from '../lib/germanyGovernmentPolitics';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const UC_TITLE = 'uppercase tracking-[0.05em]';
const UC_META = 'uppercase tracking-[0.03em]';

/** Display order (left → right in hemicycle). */
const SEAT_CHART_PARTY_ORDER = [
  'SPD',
  'CDU',
  'GRÜNE',
  'AfD',
  'CSU',
  'Die Linke',
  'SSW',
] as const;

/** Party colors and seat change vs 2021 — only these stay chromatic. */
const PARTY_CHART_META: Record<string, { color: string; deltaVs2021: number }> = {
  spd: { color: '#E3000F', deltaVs2021: -86 },
  cdu: { color: '#1a1a1a', deltaVs2021: 12 },
  grüne: { color: '#46962B', deltaVs2021: -33 },
  gruene: { color: '#46962B', deltaVs2021: -33 },
  grune: { color: '#46962B', deltaVs2021: -33 },
  afd: { color: '#009EE0', deltaVs2021: 69 },
  csu: { color: '#008AC5', deltaVs2021: -1 },
  'die linke': { color: '#BE3075', deltaVs2021: 25 },
  linke: { color: '#BE3075', deltaVs2021: 25 },
  ssw: { color: '#C9A000', deltaVs2021: 0 },
};

function normPartyKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function wedgePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  t0: number,
  t1: number,
): string {
  const pt = (r: number, t: number) => ({
    x: cx + r * Math.cos(t),
    y: cy - r * Math.sin(t),
  });
  const o0 = pt(rOuter, t0);
  const o1 = pt(rOuter, t1);
  const i1 = pt(rInner, t1);
  const i0 = pt(rInner, t0);
  const large = Math.abs(t1 - t0) > Math.PI ? 1 : 0;
  const sweepOuter = t0 > t1 ? 1 : 0;
  const sweepInner = t0 > t1 ? 0 : 1;
  return [
    `M ${i0.x} ${i0.y}`,
    `L ${o0.x} ${o0.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} ${sweepOuter} ${o1.x} ${o1.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${large} ${sweepInner} ${i0.x} ${i0.y}`,
    'Z',
  ].join(' ');
}

export type BundestagSeatRow = {
  label: string;
  seats: number;
  color: string;
  deltaVs2021: number | null;
};

function buildSeatRows(rows: GermanyGovernmentPoliticsRow[]): BundestagSeatRow[] {
  const byLabel = new Map<string, number>();
  for (const r of rows) {
    const label = (r.breakdown || r.submetric || '').trim();
    if (!label) continue;
    const n = Number(String(r.value).replace(/,/g, ''));
    if (!Number.isFinite(n)) continue;
    byLabel.set(label, n);
  }

  const ordered: BundestagSeatRow[] = [];
  const used = new Set<string>();

  for (const key of SEAT_CHART_PARTY_ORDER) {
    const seats = byLabel.get(key);
    if (seats == null) continue;
    const meta = PARTY_CHART_META[normPartyKey(key)] ?? { color: '#525252', deltaVs2021: null };
    ordered.push({ label: key, seats, color: meta.color, deltaVs2021: meta.deltaVs2021 });
    used.add(key);
  }

  const rest = [...byLabel.keys()]
    .filter((k) => !used.has(k))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  for (const label of rest) {
    const seats = byLabel.get(label)!;
    const meta = PARTY_CHART_META[normPartyKey(label)] ?? { color: '#525252', deltaVs2021: null };
    ordered.push({ label, seats, color: meta.color, deltaVs2021: meta.deltaVs2021 });
  }

  return ordered;
}

function formatDelta(d: number | null): string {
  if (d === null) return '—';
  if (d === 0) return '±0';
  return d > 0 ? `+${d}` : `${d}`;
}

type Props = {
  rows: GermanyGovernmentPoliticsRow[];
};

export function GermanyBundestagSeatsVisualization({ rows }: Props) {
  const parties = useMemo(() => buildSeatRows(rows), [rows]);
  const total = useMemo(() => parties.reduce((s, p) => s + p.seats, 0), [parties]);
  const refYear = rows[0]?.referenceYear?.trim() ?? '2025';
  const sourceUrl = rows[0]?.sourceUrl?.trim() ?? '';
  const sourceName = rows[0]?.sourceName?.trim() ?? 'Bundeswahlleiterin';

  const slices = useMemo(() => {
    if (total <= 0) return [];
    let cum = 0;
    return parties.map((p) => {
      const t0 = Math.PI * (1 - (2 * cum) / total);
      cum += p.seats;
      const t1 = Math.PI * (1 - (2 * cum) / total);
      return { ...p, t0, t1 };
    });
  }, [parties, total]);

  const cx = 200;
  const cy = 198;
  const rOuter = 175;
  const rInner = 108;

  return (
    <Card className="overflow-hidden border-neutral-800 bg-neutral-950 text-neutral-200 shadow-none ring-1 ring-neutral-800/60 sm:col-span-2 lg:col-span-3">
      <CardHeader className="space-y-3 border-b border-neutral-800 bg-black/40 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className={`text-lg font-semibold tracking-tight text-white sm:text-xl ${UC_TITLE}`}>
              Seat distribution
            </CardTitle>
            <CardDescription className={`font-mono text-[11px] text-neutral-500 ${UC_META}`}>
              {refYear} Federal Election, Germany
            </CardDescription>
          </div>
          <Badge variant="outline" className={`w-fit shrink-0 border-neutral-600 text-neutral-400 ${UC_META}`}>
            Final Result
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)]">
          {/* Chart column */}
          <div className="flex flex-col items-center justify-center border-b border-neutral-800 bg-black px-6 py-8 lg:border-b-0 lg:border-r">
            <div className="relative w-full max-w-[400px]">
              <svg viewBox="0 0 400 210" className="h-auto w-full" role="img" aria-label="Seat distribution hemicycle chart">
                {/* faint ground line */}
                <line
                  x1={cx - rOuter}
                  y1={cy}
                  x2={cx + rOuter}
                  y2={cy}
                  stroke="currentColor"
                  className="text-neutral-800"
                  strokeWidth={1}
                />
                {slices.map((p) => {
                  const d = wedgePath(cx, cy, rInner, rOuter, p.t0, p.t1);
                  return (
                    <path
                      key={p.label}
                      d={d}
                      fill={p.color}
                      stroke="#0a0a0a"
                      strokeWidth={1.5}
                      className="outline-none transition-[filter] duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/30"
                    >
                      <title>{`${p.label}: ${p.seats} seats`}</title>
                    </path>
                  );
                })}
                <text
                  x={cx}
                  y={cy - rInner + 6}
                  textAnchor="middle"
                  className="fill-white font-mono text-[21px] font-semibold tabular-nums"
                >
                  {total.toLocaleString('de-DE')}
                </text>
                <text
                  x={cx}
                  y={cy - rInner + 26}
                  textAnchor="middle"
                  className={`fill-neutral-400 font-mono text-[11px] font-medium tracking-[0.14em] ${UC_META}`}
                >
                  Seats
                </text>
              </svg>
            </div>
            <p className={`mt-4 max-w-sm text-center font-mono text-[10px] leading-relaxed text-neutral-600 ${UC_META}`}>
              Hover a segment for a short summary. Colors follow usual German party colors.
            </p>
          </div>

          {/* Table column */}
          <div className="flex flex-col bg-neutral-950 px-4 py-6 sm:px-6">
            <Separator className="mb-4 bg-neutral-800 lg:hidden" />
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800 hover:bg-transparent">
                  <TableHead
                    className={`h-11 w-[42%] pl-0 font-mono text-[10px] font-semibold tracking-[0.12em] text-neutral-500 ${UC_TITLE}`}
                  >
                    Party
                  </TableHead>
                  <TableHead
                    className={`h-11 w-[29%] text-right font-mono text-[10px] font-semibold tracking-[0.12em] text-neutral-500 ${UC_TITLE}`}
                  >
                    Seats
                  </TableHead>
                  <TableHead
                    className={`h-11 w-[29%] pr-0 text-right font-mono text-[10px] font-semibold tracking-[0.12em] text-neutral-500 ${UC_TITLE}`}
                    title="Difference vs 2021"
                  >
                    Δ 2021
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parties.map((p) => (
                  <TableRow key={p.label} className="border-neutral-800/90">
                    <TableCell className="pl-0">
                      <span className="inline-flex items-center gap-3">
                        <span
                          className="size-2.5 shrink-0 rounded-full ring-1 ring-black/40"
                          style={{ backgroundColor: p.color }}
                          aria-hidden
                        />
                        <span className={`font-medium text-neutral-100 ${UC_TITLE}`}>{p.label}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-white">
                      {p.seats.toLocaleString('de-DE')}
                    </TableCell>
                    <TableCell className="pr-0 text-right font-mono text-sm tabular-nums text-neutral-400">
                      {formatDelta(p.deltaVs2021)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className={`font-mono text-[10px] leading-relaxed text-neutral-600 ${UC_META}`}>
            © Die Bundeswahlleiterin, Wiesbaden {refYear}
          </p>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-mono text-[10px] text-neutral-500 underline-offset-4 transition-colors hover:text-white hover:underline ${UC_META}`}
            >
              {sourceName} ↗
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
