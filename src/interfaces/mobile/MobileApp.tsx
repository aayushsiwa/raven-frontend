import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { LocalSavedArticle } from '../../features/auth/useAuth';
import { useFeedExperience } from '../../features/feed/useFeedExperience';
import type { FeedStory } from '../../features/feed/useFeedPreferences';
import type { ThemeState } from '../../features/theme/useTheme';
import { DiscoverPage } from './DiscoverPage';
import { MobileFeedReaderPage } from './MobileFeedReaderPage';
import { Navbar } from './Navbar';
import { SavedArticlesPage } from './SavedArticlesPage';
import { SettingsPage } from './SettingsPage';

export type MobileTab = 'feed' | 'discover' | 'saved' | 'setup';

type MobileAppProps = {
  defaultBaseUrl: string;
  onLogout: () => void;
  savedArticles: LocalSavedArticle[];
  onSaveArticle: (article: Omit<LocalSavedArticle, 'id' | 'savedAt'>) => void;
  onRemoveSavedArticle: (id: string) => void;
  theme: ThemeState;
};

export function MobileApp({
  defaultBaseUrl,
  onLogout,
  savedArticles,
  onSaveArticle,
  onRemoveSavedArticle,
  theme,
}: MobileAppProps) {
  const feed = useFeedExperience(defaultBaseUrl);
  const [tab, setTab] = useState<MobileTab>('feed');

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        setTab(state.tab || 'feed');
      } else {
        setTab('feed');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const tabLabel = useMemo(() => {
    if (tab === 'feed') return 'Library';
    if (tab === 'discover') return 'Discover';
    if (tab === 'saved') return 'Saved';
    return 'Settings';
  }, [tab]);

  const findSavedByUrl = (url: string | undefined) => {
    if (!url) return null;
    return savedArticles.find((item) => item.url === url) ?? null;
  };

  const isSaved = (story: FeedStory) =>
    Boolean(
      findSavedByUrl(story.entry.link ? String(story.entry.link) : undefined)
    );

  const onSaveToggle = (story: FeedStory) => {
    const url = story.entry.link ? String(story.entry.link) : '';
    if (!url) return;
    const existing = findSavedByUrl(url);
    if (existing) {
      onRemoveSavedArticle(existing.id);
      return;
    }
    onSaveArticle({
      title: story.entry.title ?? 'Untitled entry',
      url,
      summary: story.entry.summary,
      source:
        story.entry.source ??
        `${story.provider}/${story.category}/${story.topic}`,
    });
  };

  return (
    <main className="mobile-shell">
      <header className="mobile-topbar">
        <p className="mobile-eyebrow">The Collector</p>
        <h1>{tabLabel}</h1>
        {tab === 'setup' ? (
          <button
            className="icon-btn"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        ) : null}
        {tab === 'setup' && (
          <button className="btn ghost" onClick={onLogout}>
            Logout
          </button>
        )}
      </header>

      <section className="mobile-content">
        {tab === 'feed' ? (
          <MobileFeedReaderPage
            stories={feed.allStories}
            isLoading={feed.feedLoading}
            errorTexts={feed.feedErrorTexts}
            onRefresh={() => {
              void feed.refetch();
            }}
            canRefresh={Boolean(feed.savedChoices.length)}
            isSaved={isSaved}
            onSaveToggle={onSaveToggle}
          />
        ) : null}

        {tab === 'saved' ? (
          <SavedArticlesPage
            savedArticles={savedArticles}
            onRemoveSavedArticle={onRemoveSavedArticle}
          />
        ) : null}

        {tab === 'setup' ? <SettingsPage feed={feed} theme={theme} /> : null}

        {tab === 'discover' ? <DiscoverPage feed={feed} /> : null}

        <Navbar tab={tab} setTab={setTab} />
      </section>
    </main>
  );
}
