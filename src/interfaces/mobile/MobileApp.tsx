import { useLocation } from '@tanstack/react-router';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useMemo } from 'react';

import { Navbar } from './Navbar';

type MobileAppProps = {
  onLogout: () => void;
  children: React.ReactNode;
};

export type MobileTab = 'feed' | 'discover' | 'saved' | 'setup';

export function MobileApp({ onLogout, children }: MobileAppProps) {
  const location = useLocation();
  const handleBack = () => {
    window.history.back();
  };

  const currentPath = location.pathname;

  const tabLabel = useMemo(() => {
    if (currentPath === '/') return 'Library';
    if (currentPath === '/discover') return 'Discover';
    if (currentPath === '/saved') return 'Saved';
    if (currentPath === '/settings') return 'Settings';
    return 'The Collector';
  }, [currentPath]);

  const isSettings = currentPath === '/settings';

  return (
    <main className="relative min-h-[100dvh] max-w-[500px] mx-auto pb-[calc(86px+env(safe-area-inset-bottom))] flex flex-col gap-3 overflow-x-hidden bg-bg text-text">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-50">
        <div className="absolute w-[180px] h-[1000px] top-[-280px] left-[8%] rounded-full blur-[44px] opacity-[0.18] bg-primary animate-[drift_13s_ease-in-out_infinite]" />
        <div className="absolute w-[180px] h-[1000px] top-[-280px] left-[46%] rounded-full blur-[44px] opacity-[0.18] bg-blue-600 animate-[drift_13s_ease-in-out_infinite] delay-[-4s]" />
        <div className="absolute w-[180px] h-[1000px] top-[-280px] left-[82%] rounded-full blur-[44px] opacity-[0.18] bg-tertiary animate-[drift_13s_ease-in-out_infinite] delay-[-8s]" />

        <div className="absolute w-[400px] h-[400px] rounded-full blur-[60px] opacity-[0.24] pointer-events-none top-[10px] -left-[120px] bg-primary" />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[60px] opacity-[0.24] pointer-events-none top-[120px] -right-[140px] bg-tertiary" />
      </div>

      <header className="sticky top-0 z-50 flex justify-between items-center px-4 py-6 backdrop-blur-3xl bg-panel border-b border-panel-border/20">
        <div className="flex items-center">
          <img
            src="/logo.svg"
            alt="Raven Logo"
            className="w-12 h-12 drop-shadow-sm"
          />
          <div>
            <p className="uppercase tracking-[0.14em] text-[0.72rem] text-primary font-bold m-0">
              Raven
            </p>
            <h1 className="font-serif italic tracking-[-0.02em] text-[2.2rem] m-0 leading-tight">
              {tabLabel}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          {isSettings && (
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-low text-primary border border-panel-border backdrop-blur-md active:scale-90 transition-transform"
              onClick={onLogout}
            >
              <LogOut size={18} />
            </button>
          )}
          {isSettings ? (
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-low text-text border border-panel-border backdrop-blur-md active:scale-90 transition-transform"
              onClick={handleBack}
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          ) : null}
        </div>
      </header>

      <section className="flex-1 px-4 grid gap-3 relative">
        {children}
        <Navbar />
      </section>
    </main>
  );
}
