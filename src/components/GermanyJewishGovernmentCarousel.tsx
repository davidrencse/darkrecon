import { useMemo, useState } from 'react';
import jewishGovernmentCsvRaw from '../../Assets/Data/Europe/Germany/jewish.csv?raw';
import starImage from '../../Assets/star.png';
import {
  parseGermanyJewishGovernmentCsv,
  type GermanyJewishGovernmentPerson,
} from '../lib/germanyJewishGovernment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const UC_TITLE = 'uppercase tracking-[0.05em]';
const UC_META = 'uppercase tracking-[0.03em]';

function ProfileCard({ person }: { person: GermanyJewishGovernmentPerson }) {
  return (
    <Card className="h-full border-line bg-surface-metric">
      <CardHeader className="space-y-1 p-3 pb-2">
        <CardTitle className={`text-sm text-neutral-100 ${UC_TITLE}`}>{person.name}</CardTitle>
        <CardDescription className={`text-[10px] text-neutral-500 ${UC_META}`}>{person.office || 'Office not listed'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        <p className="font-sans text-[11px] leading-relaxed text-neutral-300">{person.exactWikipediaWording || '—'}</p>
        <div className="grid grid-cols-1 gap-1 text-[10px] text-neutral-500 sm:grid-cols-[120px_1fr]">
          <p className={UC_META}>Language</p>
          <p className="text-neutral-300">{person.language || '—'}</p>
          <p className={UC_META}>Match type</p>
          <p className="text-neutral-300">{person.matchType || '—'}</p>
          <p className={UC_META}>Scope</p>
          <p className="text-neutral-300">{person.scopeNote || '—'}</p>
        </div>
        {person.wikipediaPage ? (
          <a
            href={person.wikipediaPage}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block text-[10px] text-[var(--uk-accent)] hover:text-neutral-200 ${UC_META}`}
          >
            Wikipedia source ↗
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function GermanyJewishGovernmentCarousel() {
  const people = useMemo(() => parseGermanyJewishGovernmentCsv(jewishGovernmentCsvRaw), []);
  const [active, setActive] = useState(0);

  if (people.length === 0) return null;

  const clampedActive = Math.max(0, Math.min(active, people.length - 1));
  const current = people[clampedActive]!;

  return (
    <Card className="col-span-1 border-line bg-card/40 sm:col-span-2 lg:col-span-3">
      <CardContent className="p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[180px]">
          <p className={`font-sans text-[10px] font-medium text-neutral-500 ${UC_TITLE}`}>Jewish people in government</p>
          <p className={`font-sans text-[10px] text-neutral-500 ${UC_META}`}>
            {clampedActive + 1} / {people.length}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActive((prev) => Math.max(0, prev - 1))}
            disabled={clampedActive <= 0}
            className="inline-flex h-8 w-10 items-center justify-center rounded-md border border-white/[0.1] bg-card text-xs text-white transition-colors hover:border-white/[0.18] hover:bg-card-hover disabled:pointer-events-none disabled:opacity-25"
          >
            {'<-'}
          </button>
          <button
            type="button"
            onClick={() => setActive((prev) => Math.min(people.length - 1, prev + 1))}
            disabled={clampedActive >= people.length - 1}
            className="inline-flex h-8 w-10 items-center justify-center rounded-md border border-white/[0.1] bg-card text-xs text-white transition-colors hover:border-white/[0.18] hover:bg-card-hover disabled:pointer-events-none disabled:opacity-25"
          >
            {'->'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
        <div className="md:min-w-0 md:flex-1">
          <ProfileCard person={current} />
        </div>
        <div className="flex items-center justify-center rounded-md border border-white/[0.08] bg-black/20 p-2 md:w-[168px] md:flex-none">
          <img src={starImage} alt="Star icon" className="h-20 w-auto object-contain opacity-95" loading="lazy" />
        </div>
      </div>
      <p className={`mt-2 font-sans text-[10px] text-neutral-600 ${UC_META}`}>
        Source: <code className="text-neutral-500">Assets/Data/Europe/Germany/jewish.csv</code>
      </p>
      </CardContent>
    </Card>
  );
}
