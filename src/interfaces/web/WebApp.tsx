import { useState } from 'react'
import { CardSpotlight } from '../../components/aceternity/CardSpotlight'
import { BackgroundBeams } from '../../components/aceternity/BackgroundBeams'
import { Spotlight } from '../../components/aceternity/Spotlight'
import { InterestPicker } from '../../components/feed/InterestPicker'
import { StoryCard } from '../../components/feed/StoryCard'
import { useFeedExperience, type FeedStory } from '../../features/feed/useFeedExperience'

type WebAppProps = {
  defaultBaseUrl: string
  username: string
  onLogout: () => void
}

export function WebApp({ defaultBaseUrl, username, onLogout }: WebAppProps) {
  const feed = useFeedExperience(defaultBaseUrl)
  const [feedViewMode, setFeedViewMode] = useState<'teaser' | 'full'>('teaser')
  const [selectedStory, setSelectedStory] = useState<FeedStory | null>(null)

  const handleTitleClick = (story: FeedStory) => {
    setSelectedStory(story)
    setFeedViewMode('full')
  }

  const handleBack = () => {
    setSelectedStory(null)
    setFeedViewMode('teaser')
  }

  return (
    <main className="page-shell web-only">
      <BackgroundBeams />
      <Spotlight className="spot-left" />
      <Spotlight className="spot-right" />

      <header className="hero">
        <p className="eyebrow">Feed Viewer</p>
        <h1>Raven Feed Viewer</h1>
        <p>Desktop web dashboard for multi-interest personalized feed. Signed in: @{username}</p>
        <button className="btn ghost" onClick={onLogout}>Logout</button>
        {feedViewMode === 'full' && (
          <button className="btn ghost" onClick={handleBack}>
            Back to teaser
          </button>
        )}
      </header>

      <section className="grid two-col">
        <CardSpotlight title="My Interests" subtitle="Select multiple topics for personalized feed">
          <InterestPicker
            feedTree={feed.feedTree}
            savedChoices={feed.savedChoices}
            mapRefreshing={feed.mapRefreshing}
            providersErrorText={feed.providersErrorText}
            feedTreeErrorText={feed.feedTreeErrorText}
            onAddChoice={feed.addChoice}
            onRemoveChoice={feed.removeChoice}
            onClearChoices={feed.clearChoices}
          />
        </CardSpotlight>

        <CardSpotlight
          title="For You"
          subtitle="Merged stories from selected interests"
          action={
            <button
              className="btn ghost"
              onClick={() => {
                void feed.refetchFeeds()
              }}
              disabled={!feed.savedChoices.length}
            >
              Refetch
            </button>
          }
        >
          {feed.feedLoading ? <p>Loading feed entries...</p> : null}
          {feed.feedErrorTexts.map((text, idx) => (
            <p key={`web-feed-error-${idx}`} className="error">
              {text}
            </p>
          ))}
          <div className="entries">
            {feedViewMode === 'full' && selectedStory ? (
              <StoryCard
                story={selectedStory}
                teaser={false}
                key={`${selectedStory.entry.link ?? 'story'}-full`}
              />
            ) : feed.allStories.length ? (
              feed.allStories.map((story, idx) => (
                <StoryCard
                  story={story}
                  teaser={true}
                  onTitleClick={handleTitleClick}
                  key={`${story.entry.link ?? 'story'}-${idx}`}
                />
              ))
            ) : (
              <p className="muted">No feed yet. Add interests to load stories.</p>
            )}
          </div>
        </CardSpotlight>
      </section>
    </main>
  )
}
