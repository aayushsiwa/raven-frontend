import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import React from 'react';

import { BackgroundBeams } from '../../components/aceternity/BackgroundBeams';
import { Spotlight } from '../../components/aceternity/Spotlight';
import type { LocalSavedArticle } from '../../features/auth/useAuth';
import type { ThemeState } from '../../features/theme/useTheme';

type WebAppProps = {
  defaultBaseUrl: string;
  onLogout: () => void;
  savedArticles: LocalSavedArticle[];
  onSaveArticle: (article: Omit<LocalSavedArticle, 'id' | 'savedAt'>) => void;
  onRemoveSavedArticle: (id: string) => void;
  theme: ThemeState;
  children: React.ReactNode;
};

export function WebApp({ onLogout, children }: WebAppProps) {
  return (
    <main className="relative max-w-[1140px] mx-auto px-4 py-8 pb-12 hidden md:block">
      <BackgroundBeams />
      <Spotlight className="absolute w-[400px] h-[400px] rounded-full blur-[60px] opacity-[0.24] pointer-events-none -z-10 top-2.5 -left-[120px] bg-primary" />
      <Spotlight className="absolute w-[400px] h-[400px] rounded-full blur-[60px] opacity-[0.24] pointer-events-none -z-10 top-[120px] -right-[140px] bg-tertiary" />

      <header className="mb-4 py-[1.2rem] px-[0.3rem] flex justify-between items-center mb-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
        <div className="max-w-[600px]">
          <span className="uppercase tracking-[0.2em] text-[0.72rem] text-primary font-extrabold mb-2 block">
            Raven
          </span>
          <h1 className="font-serif italic tracking-[-0.02em] leading-[1.1] text-[3.5rem] mb-2">
            Personal Archive
          </h1>
          <p className="text-muted text-[1.1rem]">
            Desktop command center for multi-interest personalized signal.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-[0.92rem] py-[0.6rem] rounded-[0.75rem] font-semibold transition-all duration-120 hover:brightness-110 active:scale-95 bg-surface-low text-primary border border-panel-border backdrop-blur-md"
          onClick={onLogout}
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-12 gap-8"
      >
        {children}
      </motion.section>
    </main>
  );
}
