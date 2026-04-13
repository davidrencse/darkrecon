import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import newsCsvRaw from '../../Assets/Data/Europe/Germany/news.csv?raw';
import {
  GERMANY_NEWS_TOPIC_LABEL,
  faviconUrlForHostname,
  parseGermanyNewsCsv,
  wordpressMshotsImageUrl,
  type GermanyNewsItem,
} from '../lib/germanyNews';
import {
  queueGermanyNewsMicrolink,
  resolveGermanyNewsImageViaMicrolink,
} from '../lib/germanyNewsPreviewImage';

export type GermanyNewsRailSection = {
  heading: string;
  items: GermanyNewsItem[];
};

function readCachedMicrolink(url: string): string | null {
  try {
    return sessionStorage.getItem(`darkrecon:germany-news-img:${url}`);
  } catch {
    return null;
  }
}

function NewsThumb({ item }: { item: GermanyNewsItem }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const favicon = faviconUrlForHostname(item.hostname);
  const mshots = useMemo(() => wordpressMshotsImageUrl(item.url), [item.url]);
  const hasBundledImage = Boolean(item.imageUrl?.trim());

  const [microlinkImg, setMicrolinkImg] = useState<string | null>(() =>
    hasBundledImage ? null : readCachedMicrolink(item.url),
  );

  useEffect(() => {
    setMicrolinkImg(hasBundledImage ? null : readCachedMicrolink(item.url));
  }, [hasBundledImage, item.url]);

  useEffect(() => {
    if (hasBundledImage) return;
    if (microlinkImg) return;
    const el = imgRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        obs.disconnect();
        void queueGermanyNewsMicrolink(4000, () => resolveGermanyNewsImageViaMicrolink(item.url)).then((u) => {
          if (u) setMicrolinkImg(u);
        });
      },
      { root: null, rootMargin: '120px', threshold: 0.01 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasBundledImage, item.url, microlinkImg]);

  const candidates = useMemo(() => {
    const list: string[] = [];
    const csv = item.imageUrl?.trim();
    if (csv) list.push(csv);
    if (microlinkImg) list.push(microlinkImg);
    list.push(mshots);
    list.push(favicon);
    return list.filter(Boolean);
  }, [item.imageUrl, microlinkImg, mshots, favicon]);

  const candidateKey = candidates.join('\0');
  const [tier, setTier] = useState(0);

  useLayoutEffect(() => {
    setTier(0);
  }, [candidateKey]);

  const src = candidates[Math.min(tier, candidates.length - 1)]!;
  const isFavicon = tier >= candidates.length - 1;

  const handleError = () => {
    setTier((t) => (t < candidates.length - 1 ? t + 1 : t));
  };

  return (
    <img
      ref={imgRef}
      src={src}
      alt=""
      width={56}
      height={56}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={`size-14 shrink-0 rounded-md bg-neutral-900 object-cover ${isFavicon ? 'grayscale contrast-[1.05]' : ''}`}
      onError={handleError}
    />
  );
}

function NewsRow({ item }: { item: GermanyNewsItem }) {
  const tag = GERMANY_NEWS_TOPIC_LABEL[item.topic];
  return (
    <li className="border-b border-neutral-800/90">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-2 px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
      >
        <NewsThumb item={item} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold leading-snug text-white group-hover:text-neutral-100">
            {item.title}
          </p>
          <p className="mt-1 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-500">
            {tag}
          </p>
        </div>
      </a>
    </li>
  );
}

export function useBundledGermanyNews(enabled: boolean): GermanyNewsItem[] {
  return useMemo(() => {
    if (!enabled) return [];
    return parseGermanyNewsCsv(newsCsvRaw);
  }, [enabled]);
}

function CollapsibleNewsSection({ section }: { section: GermanyNewsRailSection }) {
  const [open, setOpen] = useState(true);
  const id = useId();
  const panelId = `${id}-panel`;

  return (
    <div className="border-b border-neutral-800/80 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 border-b border-neutral-800 bg-[#0a0a0a] px-2 py-1.5 text-left font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:bg-white/[0.04]"
      >
        <span className="min-w-0 truncate">{section.heading}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="text-[9px] font-normal normal-case tracking-normal text-neutral-600">
            {section.items.length}
          </span>
          <span
            className={`text-neutral-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden
          >
            ▾
          </span>
        </span>
      </button>
      <ul id={panelId} hidden={!open} className="m-0 list-none p-0">
        {section.items.map((item) => (
          <NewsRow key={item.url} item={item} />
        ))}
      </ul>
    </div>
  );
}

type GermanyNewsRailProps = {
  side: 'left' | 'right';
  sections: GermanyNewsRailSection[];
};

export function GermanyNewsRail({ side, sections }: GermanyNewsRailProps) {
  const border = side === 'left' ? 'border-r border-neutral-800' : 'border-l border-neutral-800';
  const edge = side === 'left' ? 'left-0' : 'right-0';
  const nonEmpty = sections.filter((s) => s.items.length > 0);

  return (
    <aside
      className={`fixed ${edge} top-16 bottom-0 z-40 flex w-[13rem] shrink-0 flex-col overflow-hidden bg-[#080808] ${border}`}
      aria-label={side === 'left' ? 'Germany news, economy and immigration' : 'Germany news, crime and health'}
    >
      <div className="shrink-0 border-b border-neutral-800 px-2 py-2">
        <h2 className="text-[12px] font-bold leading-tight tracking-tight text-white">Related articles</h2>
        <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-neutral-600">Germany</p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        {nonEmpty.length === 0 ? (
          <p className="px-2 py-3 font-mono text-[10px] text-neutral-600">No articles.</p>
        ) : (
          nonEmpty.map((section) => <CollapsibleNewsSection key={section.heading} section={section} />)
        )}
      </nav>
    </aside>
  );
}
