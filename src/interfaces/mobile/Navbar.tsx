import { Compass, Newspaper, Settings } from 'lucide-react';

import type { MobileTab } from './MobileApp';

export function Navbar({
  tab,
  setTab,
}: {
  tab: MobileTab;
  setTab: (tab: MobileTab) => void;
}) {
  const updateNavigation = (newTab: MobileTab) => {
    const current = window.history.state as { tab?: MobileTab } | null;

    if (newTab === 'feed') {
      const isAlreadyRootFeed = !current || current.tab === 'feed';
      if (isAlreadyRootFeed) {
        setTab('feed');
        return;
      }
    }

    setTab(newTab);
    window.history.pushState({ tab: newTab }, '');
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Bottom navigation">
      <button
        className={tab === 'feed' ? 'active' : ''}
        onClick={() => updateNavigation('feed')}
      >
        <Newspaper size={16} />
        <span>Library</span>
      </button>
      <button
        className={tab === 'discover' ? 'active' : ''}
        onClick={() => updateNavigation('discover')}
      >
        <Compass size={16} />
        <span>Discover</span>
      </button>
      <button
        className={tab === 'saved' ? 'active' : ''}
        onClick={() => updateNavigation('saved')}
      >
        <Newspaper size={16} />
        <span>Saved</span>
      </button>
      <button
        className={tab === 'setup' ? 'active' : ''}
        onClick={() => updateNavigation('setup')}
      >
        <Settings size={16} />
        <span>Settings</span>
      </button>
    </nav>
  );
}
