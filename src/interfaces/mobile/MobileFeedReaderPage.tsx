import { RefreshCw } from 'lucide-react';

import { StoryCard } from '../../components/feed/StoryCard';
import { FeedSkeleton } from '../../components/ui/Skeleton';
import type { FeedStory } from '../../features/feed/useFeedPreferences';

type MobileFeedReaderPageProps = {
  stories: FeedStory[];
  isLoading: boolean;
  errorTexts: string[];
  onRefresh: () => void;
  canRefresh: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
  isSaved: (story: FeedStory) => boolean;
  onSaveToggle: (story: FeedStory) => void;
};

export function MobileFeedReaderPage(props: MobileFeedReaderPageProps) {
  return (
    <section className="flex flex-col gap-4 pt-4 pb-24 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="uppercase tracking-[0.14em] text-[0.72rem] text-primary font-extrabold m-0 opacity-60">
          Archive - {props.stories.length} stories
        </span>
        <button
          className="px-3 py-1.5 rounded-lg bg-surface-low text-primary text-[0.8rem] font-bold border border-panel-border flex items-center gap-2 active:scale-95 transition-transform"
          onClick={props.onRefresh}
          disabled={!props.canRefresh}
        >
          <RefreshCw
            size={14}
            className={props.isLoading ? 'animate-spin' : ''}
          />{' '}
          Refresh
        </button>
      </div>

      {props.isLoading ? <FeedSkeleton /> : null}
      {props.errorTexts.map((text, idx) => (
        <p
          key={`mobile-reader-error-${idx}`}
          className="text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-[0.9rem] font-bold"
        >
          {text}
        </p>
      ))}

      <div className="flex flex-col gap-3">
        {props.stories.length ? (
          props.stories.map((story, idx) => (
            <StoryCard
              story={story}
              compact={true}
              teaser={true}
              isSaved={props.isSaved(story)}
              onSaveToggle={props.onSaveToggle}
              key={`${story.entry.link ?? 'story'}-${idx}`}
            />
          ))
        ) : !props.isLoading ? (
          <div className="p-12 rounded-2xl bg-panel border border-dashed border-panel-border text-center flex flex-col items-center justify-center gap-2 shadow-sm">
            <p className="font-bold text-text/80">No stories yet.</p>
            <p className="text-muted text-[0.9rem]">
              Open Interests tab and add topics to begin.
            </p>
          </div>
        ) : null}

        {props.stories.length > 0 && props.hasMore ? (
          <button
            type="button"
            onClick={props.onLoadMore}
            disabled={props.loadingMore}
            className="mt-2 w-full px-4 py-2.5 rounded-xl border border-panel-border bg-surface-low text-primary text-[0.85rem] font-bold disabled:opacity-60"
          >
            {props.loadingMore ? 'Loading...' : 'Load more'}
          </button>
        ) : null}
      </div>
    </section>
  );
}
