import { Link } from '@tanstack/react-router';
import { Bookmark, Compass, Newspaper, Settings } from 'lucide-react';

export function Navbar() {
  return (
    <nav
      className="fixed left-1/2 bottom-[calc(10px+env(safe-area-inset-bottom))] -translate-x-1/2 w-[min(94vw,430px)] grid grid-cols-4 gap-[0.45rem] p-[0.45rem] rounded-2xl bg-panel border border-panel-border backdrop-blur-lg shadow-premium z-50"
      aria-label="Bottom navigation"
    >
      <Link
        to="/"
        activeProps={{ className: 'bg-primary/10 text-primary' }}
        activeOptions={{ exact: true }}
        className="flex flex-col items-center justify-center gap-1 border-0 rounded-[0.78rem] py-[0.62rem] px-[0.4rem] bg-transparent text-[#5a6072] font-semibold text-[0.76rem] no-underline transition-colors"
      >
        <Newspaper size={16} />
        <span>Library</span>
      </Link>
      <Link
        to="/discover"
        activeProps={{ className: 'bg-primary/10 text-primary' }}
        className="flex flex-col items-center justify-center gap-1 border-0 rounded-[0.78rem] py-[0.62rem] px-[0.4rem] bg-transparent text-[#5a6072] font-semibold text-[0.76rem] no-underline transition-colors"
      >
        <Compass size={16} />
        <span>Discover</span>
      </Link>
      <Link
        to="/saved"
        activeProps={{ className: 'bg-primary/10 text-primary' }}
        className="flex flex-col items-center justify-center gap-1 border-0 rounded-[0.78rem] py-[0.62rem] px-[0.4rem] bg-transparent text-[#5a6072] font-semibold text-[0.76rem] no-underline transition-colors"
      >
        <Bookmark size={16} />
        <span>Saved</span>
      </Link>
      <Link
        to="/settings"
        activeProps={{ className: 'bg-primary/10 text-primary' }}
        className="flex flex-col items-center justify-center gap-1 border-0 rounded-[0.78rem] py-[0.62rem] px-[0.4rem] bg-transparent text-[#5a6072] font-semibold text-[0.76rem] no-underline transition-colors"
      >
        <Settings size={16} />
        <span>Settings</span>
      </Link>
    </nav>
  );
}
