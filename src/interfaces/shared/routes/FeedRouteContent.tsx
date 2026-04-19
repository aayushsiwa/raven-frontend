import { useEffect, useRef } from 'react';

import { StoryCard } from '../../../components/feed/StoryCard';
import { FeedSkeleton } from '../../../components/ui/Skeleton';
import { useAuth } from '../../../features/auth/useAuth';
import { useFeedExperience } from '../../../features/feed/useFeedExperience';
import { useSavedArticles } from '../../../features/savedArticles/useSavedArticles';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { DEFAULT_BASE_URL } from '../../../lib/api';
import { MobileFeedReaderPage } from '../../mobile/MobileFeedReaderPage';

export function FeedRouteContent() {
  const isMobile = useIsMobile();
  const auth = useAuth();
  const feed = useFeedExperience(DEFAULT_BASE_URL);

  const { isSaved, toggleSaved } = useSavedArticles({
    savedArticles: auth.savedArticles,
    onSaveArticle: auth.saveArticleLocally,
    onRemoveSavedArticle: auth.removeLocalArticle,
  });

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !feed.hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !feed.loadingMore) {
          void feed.loadNextPage();
        }
      },
      {
        rootMargin: '220px',
      }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [feed]);

  if (isMobile) {
    return (
      <MobileFeedReaderPage
        stories={feed.allStories}
        isLoading={feed.feedLoading}
        errorTexts={feed.feedErrorTexts}
        onRefresh={() => {
          void feed.refetch();
        }}
        canRefresh={Boolean(feed.savedChoices.length)}
        hasMore={feed.hasMore}
        onLoadMore={() => {
          void feed.loadNextPage();
        }}
        loadingMore={feed.loadingMore}
        isSaved={isSaved}
        onSaveToggle={toggleSaved}
      />
    );
  }

  // Desktop view: Just the main feed part of the dashboard
  return (
    <div className="col-span-12 md:col-span-6 space-y-6">
      <div className="flex flex-col gap-6">
        {feed.feedLoading ? <FeedSkeleton /> : null}
        {feed.allStories.length ? (
          feed.allStories.map((story, idx) => (
            <StoryCard
              story={story}
              isSaved={isSaved(story)}
              onSaveToggle={toggleSaved}
              key={`${story.entry.link ?? 'story'}-${idx}`}
            />
          ))
        ) : !feed.feedLoading ? (
          <div className="p-16 rounded-2xl bg-panel border border-panel-border backdrop-blur-3xl shadow-premium text-center flex flex-col items-center justify-center gap-4">
            <p className="text-muted text-[1.2rem] max-w-[400px]">
              Your signal is empty. Add interests to begin collecting.
            </p>
          </div>
        ) : null}

        {feed.hasMore ? (
          <div
            ref={loadMoreRef}
            className="h-16 flex items-center justify-center text-muted text-[0.85rem]"
          >
            {feed.loadingMore ? 'Loading more stories...' : 'Scroll for more'}
          </div>
        ) : null}
      </div>
    </div>
  );
}
