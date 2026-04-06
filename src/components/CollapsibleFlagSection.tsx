import { useState, type ReactNode } from 'react';

type CollapsibleFlagSectionProps = {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleFlagSection({
  title,
  count,
  defaultOpen = true,
  children,
}: CollapsibleFlagSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group border border-[var(--line)] bg-[var(--card)]"
    >
      <summary className="flag-section-summary flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-[var(--card-hover)]">
        <span className="min-w-0 truncate">{title}</span>
        <span className="flex shrink-0 items-center gap-2 text-[13px] font-normal text-neutral-500">
          <span>{count}</span>
          <span
            className="text-neutral-400 transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          >
            ▾
          </span>
        </span>
      </summary>
      <div className="border-t border-[var(--line)] p-4">{children}</div>
    </details>
  );
}
