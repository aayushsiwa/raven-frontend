import type { FeedExperienceState } from '../../features/feed/useFeedPreferences';

type DiscoverPageProps = {
  feed: FeedExperienceState;
};

export function DiscoverPage(props: DiscoverPageProps) {
  return (
    <section className="discover-panel">
      <p className="discover-title">Curated Topics</p>
      <p className="muted">Pick themes from setup. Feed adapts instantly.</p>
      <div className="discover-grid">
        {props.feed.savedChoices.length ? (
          props.feed.savedChoices.slice(0, 8).map((choice) => {
            const key = `${choice.provider}/${choice.category}/${choice.topic}`;
            return (
              <span className="discover-chip" key={key}>
                {choice.topic}
              </span>
            );
          })
        ) : (
          <p className="muted">No interests yet. Open Settings.</p>
        )}
      </div>
    </section>
  );
}
