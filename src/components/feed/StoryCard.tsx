import { formatDate, sanitizeHTML } from '../../lib/utils'
import type { FeedStory } from '../../features/feed/useFeedExperience'

type StoryCardProps = {
  story: FeedStory
  compact?: boolean
  teaser?: boolean
  onTitleClick?: (story: FeedStory) => void
  isSaved?: boolean
  onSaveToggle?: (story: FeedStory) => void
}

export function StoryCard({
  story,
  compact = false,
  teaser = false,
  onTitleClick,
  isSaved = false,
  onSaveToggle,
}: StoryCardProps) {
  const publishedDate =
    story.entry.published_iso ??
    story.entry.published ??
    story.entry.published_parsed
  const bodyText =
    story.entry.content_text ?? story.entry.summary

  // Handle duplicate "Read more" links often found in RSS feeds
  const cleanBodyText = bodyText
    ? String(bodyText).replace(/<a[^>]*>Read the full story at[^<]*<\/a>/gi, '').trim()
    : ''

  const hasHTML = cleanBodyText && /<[a-z][\s\S]*>/i.test(cleanBodyText)

  const teaserText = cleanBodyText ? String(cleanBodyText).replace(/<[^>]*>?/gm, '').slice(0, 150) + '...' : ''

  const fullViewClass = !teaser ? 'full-view' : ''

  return (
    <article className={`story-card ${compact ? 'compact' : ''} ${teaser ? 'teaser' : ''} ${fullViewClass}`.trim()}>
      <div className="story-headline-wrap">
        <p className="story-tag">
          {story.provider} / {story.category} / {story.topic}
        </p>
        {onTitleClick ? (
          <h3 className="story-title" onClick={() => onTitleClick(story)} style={{ cursor: 'pointer' }}>
            {story.entry.title ?? 'Untitled entry'}
          </h3>
        ) : (
          <h3 className="story-title">{story.entry.title ?? 'Untitled entry'}</h3>
        )}
      </div>

      {onSaveToggle ? (
        <div className="story-actions">
          <button
            className={`btn ghost save-btn ${isSaved ? 'saved' : ''}`.trim()}
            onClick={() => onSaveToggle(story)}
            type="button"
          >
            {isSaved ? 'Unsave' : 'Save'}
          </button>
        </div>
      ) : null}

      {publishedDate ? <p className="story-time">{formatDate(publishedDate)}</p> : <p className="story-time">No date</p>}

      {cleanBodyText
        ? teaser
          ? <div className="story-summary teaser-summary">{teaserText}</div>
          : hasHTML
            ? (
                <div
                  className="story-summary"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(cleanBodyText) }}
                />
              )
            : <p className="story-summary">{String(cleanBodyText).slice(0, 480)}</p>
        : null}

      {!teaser && story.entry.link ? (
        <a className="story-link" href={String(story.entry.link)} target="_blank" rel="noreferrer">
          Open original
        </a>
      ) : null}
    </article>
  )
}
