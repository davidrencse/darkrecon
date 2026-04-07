import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PluginContext } from 'rollup';
import type { ViteDevServer } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VIRTUAL_FLAG_FILENAMES = 'virtual:flag-filenames';
const RESOLVED_VIRTUAL = '\0' + VIRTUAL_FLAG_FILENAMES;

function listFlagFilenames(srcDir: string): string[] {
  if (!fs.existsSync(srcDir)) return [];
  return fs
    .readdirSync(srcDir)
    .filter((name) => name.toLowerCase().endsWith('.png'))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

/**
 * Copy PNGs from `Assets/Flags` → `public/flags` so they are served at `/flags/<file>.png`
 * in dev and copied to `dist/flags` in production (no bundler glob / gitignore edge cases).
 */
function syncDataCsvToPublic() {
  return {
    name: 'sync-data-csv-to-public',
    enforce: 'pre' as const,
    buildStart() {
      const srcDir = path.join(__dirname, 'Assets', 'Data');
      const destDir = path.join(__dirname, 'public', 'data');
      if (!fs.existsSync(srcDir)) {
        if (fs.existsSync(destDir)) {
          for (const name of fs.readdirSync(destDir)) {
            if (name.toLowerCase().endsWith('.csv')) fs.unlinkSync(path.join(destDir, name));
          }
        }
        return;
      }
      fs.mkdirSync(destDir, { recursive: true });
      for (const name of fs.readdirSync(destDir)) {
        if (name.toLowerCase().endsWith('.csv')) fs.unlinkSync(path.join(destDir, name));
      }
      for (const name of fs.readdirSync(srcDir)) {
        if (!name.toLowerCase().endsWith('.csv')) continue;
        fs.copyFileSync(path.join(srcDir, name), path.join(destDir, name));
      }
    },
  };
}

function syncFlagsToPublic() {
  return {
    name: 'sync-flags-to-public',
    enforce: 'pre' as const,
    buildStart() {
      const srcDir = path.join(__dirname, 'Assets', 'Flags');
      const destDir = path.join(__dirname, 'public', 'flags');
      if (!fs.existsSync(srcDir)) {
        console.warn(`[vite] No flags at ${srcDir} — place PNGs in Assets/Flags.`);
        if (fs.existsSync(destDir)) {
          for (const name of fs.readdirSync(destDir)) {
            if (name.endsWith('.png')) fs.unlinkSync(path.join(destDir, name));
          }
        }
        return;
      }
      fs.mkdirSync(destDir, { recursive: true });
      for (const name of fs.readdirSync(destDir)) {
        if (name.endsWith('.png')) fs.unlinkSync(path.join(destDir, name));
      }
      for (const name of fs.readdirSync(srcDir)) {
        if (!name.toLowerCase().endsWith('.png')) continue;
        fs.copyFileSync(path.join(srcDir, name), path.join(destDir, name));
      }
    },
  };
}

function syncHeroAssetsToPublic() {
  return {
    name: 'sync-hero-assets-to-public',
    enforce: 'pre' as const,
    buildStart() {
      const destDir = path.join(__dirname, 'public', 'hero');
      fs.mkdirSync(destDir, { recursive: true });

      const candidates = [
        { src: path.join(__dirname, 'Assets', 'europe.png'), dest: 'europe.png' },
        { src: path.join(__dirname, 'Assets', 'europe_countries.svg'), dest: 'europe.svg' },
        { src: path.join(__dirname, 'Assets', 'eu.svg'), dest: 'europe.svg' },
      ];

      for (const c of candidates) {
        if (!fs.existsSync(c.src)) continue;
        fs.copyFileSync(c.src, path.join(destDir, c.dest));
        break;
      }
    },
  };
}

function virtualFlagFilenames() {
  const flagsDir = path.join(__dirname, 'Assets', 'Flags');

  return {
    name: 'virtual-flag-filenames',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (id === VIRTUAL_FLAG_FILENAMES) return RESOLVED_VIRTUAL;
    },
    load(this: PluginContext, id: string) {
      if (id !== RESOLVED_VIRTUAL) return;
      const names = listFlagFilenames(flagsDir);
      for (const n of names) {
        this.addWatchFile(path.join(flagsDir, n));
      }
      // Do not addWatchFile(flagsDir): Vite import-analysis treats that path like an import and crashes.
      return `export const FLAG_FILENAMES = ${JSON.stringify(names)};`;
    },
    configureServer(server: ViteDevServer) {
      server.watcher.add(flagsDir);
      const invalidateVirtual = () => {
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL);
        if (mod) server.moduleGraph.invalidateModule(mod, new Set(), Date.now(), true);
      };
      server.watcher.on('all', (_event: string, file: string | null) => {
        if (typeof file !== 'string') return;
        const rel = path.relative(flagsDir, file);
        if (!rel.startsWith('..') && !path.isAbsolute(rel)) {
          invalidateVirtual();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), syncDataCsvToPublic(), syncFlagsToPublic(), syncHeroAssetsToPublic(), virtualFlagFilenames()],
});
