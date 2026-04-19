import {
  GERMANY_IMMIGRATION_POLICY_AREAS,
  GERMANY_IMMIGRATION_POLICY_CONTEXT,
} from '../data/germanyImmigrationPolicies';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

const UC = 'uppercase tracking-[0.05em]';

export function GermanyImmigrationPoliciesSection() {
  const ctx = GERMANY_IMMIGRATION_POLICY_CONTEXT;
  return (
    <div className="flex flex-col gap-2">
      <Card className="border-line bg-surface-metric p-0 shadow-card ring-1 ring-white/[0.04]">
        <CardHeader className="space-y-1.5 p-3 pb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <CardTitle className={`font-sans text-xs text-neutral-100 ${UC}`}>{ctx.headline}</CardTitle>
            <Badge variant="outline" className="h-5 border-white/10 px-1.5 font-sans text-[9px] font-normal text-neutral-400">
              {ctx.period}
            </Badge>
          </div>
          <CardDescription className="font-sans text-[10px] leading-snug text-neutral-500">
            {ctx.government}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <p className="font-sans text-[11px] leading-snug text-neutral-300">{ctx.summary}</p>
        </CardContent>
      </Card>

      <Separator className="bg-line" />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {GERMANY_IMMIGRATION_POLICY_AREAS.map((a) => (
          <Card key={a.id} className="border-line bg-surface-metric p-0 shadow-card ring-1 ring-white/[0.04]">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className={`font-sans text-[11px] font-semibold leading-tight text-neutral-100 ${UC}`}>
                {a.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 px-2.5 pb-2.5 pt-0">
              <p className="font-sans text-[11px] leading-snug text-neutral-200">
                <span className="text-neutral-500">Now · </span>
                {a.current}
              </p>
              <p className="font-sans text-[10px] leading-snug text-neutral-400">{a.details}</p>
              <p className="font-sans text-[10px] leading-snug text-neutral-500">
                <span className="text-neutral-600">Effect · </span>
                {a.impact}
              </p>
              <p className="border-t border-white/[0.06] pt-1.5 font-sans text-[9px] leading-snug text-neutral-600">
                {a.source}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
