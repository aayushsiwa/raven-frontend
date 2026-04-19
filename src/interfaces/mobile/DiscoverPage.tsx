import { Compass, Sparkles } from 'lucide-react';

import { CustomFeedManager } from '../../components/feed/CustomFeedManager';
import type { FeedChoice } from '../../features/feed/useFeedPreferences';
import type { CustomFeed } from '../../lib/api';

type DiscoverPageProps = {
  feed: {
    isAuthMode: boolean;
    savedChoices: FeedChoice[];
    customFeeds: CustomFeed[];
    loadingCustomFeeds: boolean;
    customFeedsError: string | null;
    customFeedActionError: string | null;
    customFeedBusy: boolean;
    addCustomFeed: (payload: {
      title: string;
      url: string;
      category?: string;
      topic?: string;
    }) => Promise<void>;
    setCustomFeedActive: (id: number, isActive: boolean) => Promise<void>;
    removeCustomFeed: (id: number) => Promise<void>;
  };
};

export function DiscoverPage(props: DiscoverPageProps) {
  return (
    <section className="grid gap-6 pt-5 pb-24 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-3xl shadow-premium mb-2">
        <h3 className="font-serif italic text-[1.8rem] flex items-center gap-3">
          <Sparkles size={24} className="text-primary" /> Curated Signal
        </h3>
        <p className="text-muted mt-2 text-[0.95rem] leading-relaxed">
          Explore topics in{' '}
          <strong className="text-primary font-bold underline decoration-primary/20 underline-offset-4">
            Settings
          </strong>{' '}
          to refine your personal feed.
        </p>
      </div>

      <div className="mb-[-0.5rem]">
        <span className="uppercase tracking-[0.14em] text-[0.72rem] text-primary font-bold flex items-center gap-2">
          <Compass size={14} /> Active Subscriptions
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {props.feed.savedChoices.length ? (
          props.feed.savedChoices.map((choice) => {
            const key = `${choice.provider}/${choice.category}/${choice.topic}`;
            return (
              <div
                key={key}
                className="p-5 rounded-xl bg-panel border border-panel-border backdrop-blur-md shadow-sm active:scale-95 transition-transform flex flex-col gap-1"
              >
                <span className="text-[0.65rem] uppercase tracking-wider font-bold opacity-40">
                  {choice.provider}
                </span>
                <span className="font-semibold text-[1rem] leading-tight text-text">
                  {choice.topic}
                </span>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 p-10 rounded-2xl bg-surface-low border border-dashed border-panel-border text-center flex flex-col items-center justify-center gap-3">
            <Compass size={32} className="opacity-20 text-muted" />
            <p className="text-muted text-[0.9rem]">
              Your library is empty. Open Settings to start collecting.
            </p>
          </div>
        )}
      </div>

      <CustomFeedManager
        isAuthMode={props.feed.isAuthMode}
        customFeeds={props.feed.customFeeds}
        loadingCustomFeeds={props.feed.loadingCustomFeeds}
        customFeedsError={props.feed.customFeedsError}
        customFeedActionError={props.feed.customFeedActionError}
        customFeedBusy={props.feed.customFeedBusy}
        onAddCustomFeed={props.feed.addCustomFeed}
        onToggleCustomFeed={props.feed.setCustomFeedActive}
        onDeleteCustomFeed={props.feed.removeCustomFeed}
      />
    </section>
  );
}
