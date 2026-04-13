const CACHE_PREFIX = 'darkrecon:germany-news-img:';

/** Serialize Microlink calls so we stay under typical free-tier burst limits when many thumbs load. */
let tail = Promise.resolve();

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Resolves og:image (and similar) for an article URL via Microlink's public API.
 * Reuters blocks direct browser/server HTML fetch; Microlink prerenders the page.
 */
export async function resolveGermanyNewsImageViaMicrolink(articleUrl: string): Promise<string | null> {
  try {
    const hit = sessionStorage.getItem(CACHE_PREFIX + articleUrl);
    if (hit) return hit;
  } catch {
    /* private mode */
  }

  const api = `https://api.microlink.io/?url=${encodeURIComponent(articleUrl)}`;
  try {
    const res = await fetch(api);
    const json: { status?: string; data?: { image?: { url?: string } }; message?: string } = await res.json();
    const u = json.data?.image?.url;
    if (json.status === 'success' && typeof u === 'string' && u.length > 0) {
      try {
        sessionStorage.setItem(CACHE_PREFIX + articleUrl, u);
      } catch {
        /* */
      }
      return u;
    }
  } catch {
    /* network / JSON */
  }
  return null;
}

/** Queue work with a gap between jobs. */
export function queueGermanyNewsMicrolink<T>(gapMs: number, fn: () => Promise<T>): Promise<T> {
  const job = tail.then(() => sleep(gapMs)).then(fn);
  tail = job.then(
    () => {},
    () => {},
  );
  return job;
}
