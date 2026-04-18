import { StoryCard } from '../../components/feed/StoryCard'
import { FeedSkeleton } from '../../components/ui/Skeleton'
import type { FeedStory } from '../../features/feed/useFeedExperience'

type MobileFeedReaderPageProps = {
  stories: FeedStory[]
  isLoading: boolean
  errorTexts: string[]
  onRefresh: () => void
  canRefresh: boolean
  isSaved: (story: FeedStory) => boolean
  onSaveToggle: (story: FeedStory) => void
}

export function MobileFeedReaderPage(props: MobileFeedReaderPageProps) {
  return (
    <section className="mobile-feed-reader">
      <div className="mobile-feed-head">
        <p>Library - {props.stories.length} stories</p>
        <button
          className="btn ghost"
          onClick={props.onRefresh}
          disabled={!props.canRefresh}
        >
          Refresh
        </button>
      </div>

      {props.isLoading ? <FeedSkeleton /> : null}
      {props.errorTexts.map((text, idx) => (
        <p key={`mobile-reader-error-${idx}`} className="error">
          {text}
        </p>
      ))}

      <div className="story-stack">
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
          <div className="mobile-empty">
            <p>No stories yet.</p>
            <p>Open Interests tab. Add topics.</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
