import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type GermanyImmigrationTreemapItem } from '../lib/germanyImmigrationTreemapData';

type TreemapLeaf = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  data: { name: string; value: number };
};

const TREEMAP_GUTTER = '#737373';

function displayCountryName(name: string): string {
  return name === 'Viet Nam' ? 'Vietnam' : name;
}

function computeLeaves(
  items: GermanyImmigrationTreemapItem[],
  width: number,
  height: number,
): TreemapLeaf[] {
  const root = hierarchy<{ name: string; value?: number; children?: { name: string; value: number }[] }>({
    name: 'root',
    children: items.map((i) => ({
      name: i.country,
      value: Math.max(1, i.population),
    })),
  })
    .sum((d) => (d.children ? 0 : Number(d.value ?? 0)))
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const tm = treemap<{ name: string; value?: number; children?: { name: string; value: number }[] }>()
    .tile(treemapSquarify)
    .size([width, height])
    .paddingOuter(3)
    .paddingInner(3)
    .round(true);

  return tm(root).leaves() as unknown as TreemapLeaf[];
}

/** Font size (px) from cell area so tiny leaves still get legible type once the SVG scales to full width. */
function fontSizeForCell(area: number, cellW: number, cellH: number): number {
  const base = Math.sqrt(area);
  const tight = Math.min(cellW, cellH);
  return Math.max(6.5, Math.min(11.5, base / 28 + tight / 85));
}

export function GermanyImmigrationTreemap({ items }: { items: GermanyImmigrationTreemapItem[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1100);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(Math.max(280, el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    if (items.length === 0) {
      return { w: 0, h: 0, leaves: [] as TreemapLeaf[] };
    }

    // Single layout in "user units": width matches the container — the SVG scales down with viewBox (no horizontal scroll).
    const w = Math.max(300, containerWidth);
    // Taller plot gives squarify more vertical room so the smallest countries stay less "razor thin".
    const h = Math.min(1400, Math.max(560, Math.round(w * 0.88)));

    const leaves = computeLeaves(items, w, h);
    return { w, h, leaves };
  }, [items, containerWidth]);

  const byCountry = useMemo(() => new Map(items.map((i) => [i.country, i])), [items]);

  if (items.length === 0) {
    return (
      <p className="font-mono text-sm text-neutral-500">No immigration treemap rows loaded.</p>
    );
  }

  const { w: svgW, h: svgH, leaves } = layout;

  return (
    <div ref={wrapRef} className="w-full min-w-0">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        height="auto"
        className="block h-auto w-full max-w-full"
        style={{ aspectRatio: `${svgW} / ${svgH}`, background: TREEMAP_GUTTER }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Germany immigrant population by country, treemap"
      >
        {leaves.map((leaf, idx) => {
          const w = leaf.x1 - leaf.x0;
          const h = leaf.y1 - leaf.y0;
          const name = leaf.data.name;
          const label = displayCountryName(name);
          const row = byCountry.get(name);
          const pop = row?.population ?? leaf.data.value;
          const male = row?.malePct;
          const maleLine =
            male != null && Number.isFinite(male) ? `(${male.toFixed(1)}% ♂)` : '(N/A ♂)';
          const area = Math.max(1, w * h);
          const fontPx = fontSizeForCell(area, w, h);
          const stripe = idx % 2 === 0;

          return (
            <g key={`${name}-${idx}`} transform={`translate(${leaf.x0},${leaf.y0})`}>
              <foreignObject width={w} height={h} style={{ overflow: 'hidden' }}>
                <div
                  className={`box-border flex h-full min-h-0 w-full flex-col justify-start border-0 p-1 font-sans leading-tight text-neutral-950 ${
                    stripe ? 'bg-neutral-100' : 'bg-white'
                  }`}
                  style={{
                    fontSize: `${fontPx}px`,
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                  }}
                >
                  <div className="min-w-0 shrink-0 font-semibold" title={label}>
                    {label}
                  </div>
                  <div className="mt-0.5 shrink-0 font-mono tabular-nums leading-none">{pop.toLocaleString('en-US')}</div>
                  <div className="mt-0.5 shrink-0 font-mono text-[0.92em] leading-none opacity-90 tabular-nums">
                    {maleLine}
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
