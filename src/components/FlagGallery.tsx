import { useMemo, useState } from 'react';
import { FLAGS } from '../data/flags';
import type { FlagEntry } from '../types/flag';
import { groupFlagsByViewMode, type GalleryViewMode } from '../lib/flagGrouping';
import { FlagButton } from './FlagButton';
import { FlagViewModeToggle } from './FlagViewModeToggle';
import { CollapsibleFlagSection } from './CollapsibleFlagSection';

const FLAG_GRID =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

type FlagGalleryProps = {
  onSelectFlag: (flag: FlagEntry) => void;
};

const FLAG_IMAGE_PRIORITY_FIRST = 24;

export function FlagGallery({ onSelectFlag }: FlagGalleryProps) {
  const [viewMode, setViewMode] = useState<GalleryViewMode>('continents');
  const sections = useMemo(() => groupFlagsByViewMode(FLAGS, viewMode), [viewMode]);

  const indexByFlagId = useMemo(() => {
    let i = 0;
    const m = new Map<string, number>();
    for (const sec of sections) {
      for (const f of sec.flags) {
        m.set(f.id, i++);
      }
    }
    return m;
  }, [sections]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-6">
      <div className="mb-6 space-y-4">
        <FlagViewModeToggle value={viewMode} onChange={setViewMode} />
        <p className="text-[13px] leading-relaxed text-neutral-500">
          {viewMode === 'continents' &&
            'Europe, North America, Africa, and Oceania — collapsible regions.'}
          {viewMode === 'eu' && 'European Union members and all other flags in this list.'}
          {viewMode === 'alphabet' && 'Grouped by the first letter of the country name.'}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <CollapsibleFlagSection
            key={section.id}
            title={section.title}
            count={section.flags.length}
            defaultOpen
          >
            <ul className={FLAG_GRID}>
              {section.flags.map((flag) => (
                <li key={flag.id} className="flex min-w-0">
                  <FlagButton
                    flag={flag}
                    onSelect={onSelectFlag}
                    priority={(indexByFlagId.get(flag.id) ?? 0) < FLAG_IMAGE_PRIORITY_FIRST}
                  />
                </li>
              ))}
            </ul>
          </CollapsibleFlagSection>
        ))}
      </div>
    </div>
  );
}
