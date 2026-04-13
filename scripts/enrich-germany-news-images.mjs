/**
 * Fetches preview images for Germany news.csv via Microlink (og:image extraction).
 * Reuters and similar sites block naive HTTP scrapes; Microlink prerenders the page.
 *
 * Usage: node scripts/enrich-germany-news-images.mjs
 * Free tier: ~50 requests/day per IP — re-run next day if you hit the limit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '..', 'Assets', 'Data', 'Europe', 'Germany', 'news.csv');

const DELAY_MS = 2200;

function parseCsvRows(raw) {
  const rows = [];
  let row = [];
  let cell = '';
  let i = 0;
  let inQuotes = false;
  const text = raw.replace(/^\uFEFF/, '').trimEnd();

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ',') {
      row.push(cell);
      cell = '';
      i += 1;
      continue;
    }
    if (c === '\r') {
      i += 1;
      continue;
    }
    if (c === '\n') {
      row.push(cell);
      if (row.some((x) => x.length > 0)) rows.push(row);
      row = [];
      cell = '';
      i += 1;
      continue;
    }
    cell += c;
    i += 1;
  }
  row.push(cell);
  if (row.some((x) => x.length > 0)) rows.push(row);
  return rows;
}

function escapeCell(s) {
  const x = String(s ?? '');
  if (/[",\n\r]/.test(x)) return `"${x.replace(/"/g, '""')}"`;
  return x;
}

function rowsToCsv(rows) {
  return rows.map((r) => r.map(escapeCell).join(',')).join('\n') + '\n';
}

async function microlinkImageUrl(pageUrl) {
  const api = `https://api.microlink.io/?url=${encodeURIComponent(pageUrl)}`;
  let lastErr = 'Unknown error';
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(api);
    let json;
    try {
      json = await res.json();
    } catch {
      lastErr = `Microlink HTTP ${res.status} (invalid JSON)`;
      await sleep(3000 * (attempt + 1));
      continue;
    }
    const url = json.data?.image?.url;
    if (json.status === 'success' && url && typeof url === 'string') return url.trim();
    lastErr = json.message || json.status || `HTTP ${res.status}`;
    if (res.status === 429 || /limit|rate/i.test(String(lastErr))) {
      await sleep(8000 * (attempt + 1));
      continue;
    }
    if (attempt < 2) await sleep(4000 * (attempt + 1));
  }
  throw new Error(lastErr);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parseCsvRows(raw);
  if (rows.length < 2) {
    console.error('CSV too short');
    process.exit(1);
  }

  const headers = rows[0].map((h) => h.trim());
  let imageIdx = headers.findIndex((h) => h.toLowerCase() === 'image');
  if (imageIdx < 0) {
    imageIdx = headers.length;
    rows[0].push('Image');
    for (let r = 1; r < rows.length; r++) {
      rows[r].push('');
    }
  }

  const urlIdx = headers.findIndex((h) => h.toLowerCase() === 'url');
  if (urlIdx < 0) {
    console.error('No URL column');
    process.exit(1);
  }

  let filled = 0;
  let skipped = 0;
  let failed = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    while (row.length <= imageIdx) row.push('');
    const existing = (row[imageIdx] ?? '').trim();
    const url = (row[urlIdx] ?? '').trim();
    if (!url) continue;
    if (existing) {
      skipped += 1;
      continue;
    }
    try {
      const img = await microlinkImageUrl(url);
      row[imageIdx] = img;
      filled += 1;
      console.log(`OK ${r}: ${url.slice(0, 72)}…`);
    } catch (e) {
      failed += 1;
      console.warn(`FAIL ${r} ${url}: ${e.message}`);
    }
    if (r < rows.length - 1) await sleep(DELAY_MS);
  }

  fs.writeFileSync(CSV_PATH, rowsToCsv(rows), 'utf8');
  console.log(`Done. Filled ${filled}, skipped (had image) ${skipped}, failed ${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
