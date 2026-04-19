import { CustomFeedManager } from '../../../components/feed/CustomFeedManager';
import { InterestPicker } from '../../../components/feed/InterestPicker';
import { useFeedExperience } from '../../../features/feed/useFeedExperience';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { DEFAULT_BASE_URL } from '../../../lib/api';
import { DiscoverPage as MobileDiscoverPage } from '../../mobile/DiscoverPage';

export function DiscoverRouteContent() {
  const isMobile = useIsMobile();
  const feed = useFeedExperience(DEFAULT_BASE_URL);

  if (isMobile) {
    return <MobileDiscoverPage feed={feed} />;
  }

  // Desktop view: Just the interests part of the dashboard
  return (
    <div className="col-span-12 md:col-span-3">
      <div className="p-8 rounded-2xl bg-panel border border-panel-border backdrop-blur-3xl shadow-premium">
        <header className="mb-6">
          <span className="uppercase tracking-[0.2em] text-[0.72rem] text-primary font-extrabold mb-1 block">
            Navigation
          </span>
          <h2 className="font-serif italic tracking-[-0.02em] leading-tight text-[2rem]">
            My Interests
          </h2>
        </header>
        <InterestPicker
          feedTree={feed.feedTree}
          savedChoices={feed.savedChoices}
          mapRefreshing={feed.mapRefreshing}
          isAuthMode={feed.isAuthMode}
          preferencesSyncing={feed.preferencesSyncing}
          preferencesErrorText={feed.preferencesErrorText}
          onAddChoice={feed.addChoice}
          onRemoveChoice={feed.removeChoice}
          onClearChoices={feed.clearChoices}
          className="p-0 max-h-none overflow-visible"
        />

        <div className="mt-6 pt-6 border-t border-panel-border">
          <CustomFeedManager
            isAuthMode={feed.isAuthMode}
            customFeeds={feed.customFeeds}
            loadingCustomFeeds={feed.loadingCustomFeeds}
            customFeedsError={feed.customFeedsError}
            customFeedActionError={feed.customFeedActionError}
            customFeedBusy={feed.customFeedBusy}
            onAddCustomFeed={feed.addCustomFeed}
            onToggleCustomFeed={feed.setCustomFeedActive}
            onDeleteCustomFeed={feed.removeCustomFeed}
          />
        </div>
      </div>
    </div>
  );
}
