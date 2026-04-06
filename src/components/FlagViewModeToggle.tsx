import type { GalleryViewMode } from '../lib/flagGrouping';
import { VIEW_MODE_META } from '../lib/flagGrouping';

const MODES: GalleryViewMode[] = ['continents', 'eu', 'alphabet'];

type FlagViewModeToggleProps = {
  value: GalleryViewMode;
  onChange: (mode: GalleryViewMode) => void;
};

export function FlagViewModeToggle({ value, onChange }: FlagViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="How flags are organized"
      className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-4"
    >
      {MODES.map((mode) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={active}
            className={
              active
                ? 'border border-white/20 bg-[var(--card-hover)] px-3 py-2 text-left transition-colors'
                : 'border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-left transition-colors hover:border-neutral-600'
            }
          >
            <span
              className={
                active ? 'block text-[13px] font-medium text-white' : 'block text-[13px] font-medium text-neutral-300'
              }
            >
              {VIEW_MODE_META[mode].title}
            </span>
            <span
              className={
                active ? 'mt-0.5 block text-[11px] text-neutral-400' : 'mt-0.5 block text-[11px] text-neutral-500'
              }
            >
              {VIEW_MODE_META[mode].subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
