import { useState } from 'react'
import { StoryCard } from '../../components/feed/StoryCard'
import { FeedSkeleton } from '../../components/ui/Skeleton'
import type { FeedStory } from '../../features/feed/useFeedExperience'

type MobileFeedReaderPageProps = {
  stories: FeedStory[]
  isLoading: boolean
  errorTexts: string[]
  onRefresh: () => void
  canRefresh: boolean
  teaser?: boolean
  onTitleClick?: (story: FeedStory) => void
}

export function MobileFeedReaderPage(props: MobileFeedReaderPageProps) {
  const { teaser = false, onTitleClick } = props
  const [expandedStoryLink, setExpandedStoryLink] = useState<string | null>(null)

  const handleTitleClick = (story: FeedStory) => {
    const link = story.entry.link ?? ''
    if (teaser) {
      setExpandedStoryLink(prev => (prev === link ? null : link))
    }
    onTitleClick?.(story)
  }

  return (
    <section className="mobile-feed-reader">
      <div className="mobile-feed-head">
        <p>{props.stories.length} stories</p>
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
          props.stories.map((story, idx) => {
            const isExpanded = expandedStoryLink === (story.entry.link ?? '')
            return (
              <StoryCard
                story={story}
                compact
                teaser={teaser && !isExpanded}
                onTitleClick={handleTitleClick}
                key={`${story.entry.link ?? 'story'}-${idx}`}
              />
            )
          })
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
