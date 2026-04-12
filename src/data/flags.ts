import type { FlagEntry } from '../types/flag';
import { FLAG_FILENAMES } from 'virtual:flag-filenames';

/**
 * Always merged into the gallery (PNG must exist under `Assets/Flags` → `/flags/`).
 * Covers Vite caching the virtual module before these files existed — restart or HMR
 * still worked inconsistently without this merge.
 */
const ALWAYS_INCLUDE_FLAGS = [
  'flag-of-Australia.png',
  'flag-of-New-Zealand.png',
  'flag-of-South-Africa.png',
] as const;

function mergedFlagFilenames(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const f of [...FLAG_FILENAMES, ...ALWAYS_INCLUDE_FLAGS]) {
    if (seen.has(f)) continue;
    seen.add(f);
    out.push(f);
  }
  return out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

/** Shown in the gallery only if present under `Assets/Flags` (synced to `/flags/`). */
const EXCLUDED_FLAG_FILES = new Set([
  'flag-of-Albania.png',
  'flag-of-Andorra.png',
  'flag-of-Armenia.png',
  'flag-of-Azerbaijan.png',
  'flag-of-Georgia.png',
  'flag-of-North-Macedonia.png',
  'flag-of-San-Marino.png',
]);

/**
 * Label derived only from the filename (e.g. `flag-of-Czech-Republic.png` → "Czech Republic").
 */
export function labelFromFlagFilename(filename: string): string {
  const base = filename.replace(/^flag-of-/i, '').replace(/\.png$/i, '');
  return base.replace(/-/g, ' ');
}

/**
 * Filenames come from `Assets/Flags` via `vite.config.ts` (virtual module).
 * Files are synced to `public/flags`, so URLs are `/flags/<filename>` in dev and production.
 */
export const FLAGS: FlagEntry[] = mergedFlagFilenames()
  .filter((filename) => !EXCLUDED_FLAG_FILES.has(filename))
  .map((filename) => ({
    id: filename,
    src: `/flags/${encodeURIComponent(filename)}`,
    label: labelFromFlagFilename(filename),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
