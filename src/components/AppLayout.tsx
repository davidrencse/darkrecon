import type { ReactNode } from 'react';
import { Header } from './Header';

type AppLayoutProps = {
  children: ReactNode;
  /** Hide main gallery header (e.g. full-screen country data view). */
  showHeader?: boolean;
};

export function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {showHeader ? <Header /> : null}
      <main className={showHeader ? '' : 'min-h-screen'}>{children}</main>
    </div>
  );
}
