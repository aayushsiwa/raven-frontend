import { useMemo, useState, useEffect } from 'react'
import { InterestPicker } from '../../components/feed/InterestPicker'
import { useFeedExperience, type FeedStory } from '../../features/feed/useFeedExperience'
import { MobileFeedReaderPage } from './MobileFeedReaderPage'

type MobileTab = 'feed' | 'setup'

type MobileAppProps = {
  defaultBaseUrl: string
}

export function MobileApp({ defaultBaseUrl }: MobileAppProps) {
  const feed = useFeedExperience(defaultBaseUrl)
  const [tab, setTab] = useState<MobileTab>('feed')
  const [feedViewMode, setFeedViewMode] = useState<'teaser' | 'full'>('teaser')
  const [selectedStory, setSelectedStory] = useState<FeedStory | null>(null)

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state
      if (state) {
        setTab(state.tab || 'feed')
        setFeedViewMode(state.viewMode || 'teaser')
        setSelectedStory(state.story || null)
      } else {
        setTab('feed')
        setFeedViewMode('teaser')
        setSelectedStory(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const updateNavigation = (newTab: MobileTab, newMode: 'teaser' | 'full', story: FeedStory | null = null) => {
    setTab(newTab)
    setFeedViewMode(newMode)
    setSelectedStory(story)
    window.history.pushState({ tab: newTab, viewMode: newMode, story }, '')
  }

  const handleTitleClick = (story: FeedStory) => {
    updateNavigation('feed', 'full', story)
  }

  const handleBack = () => {
    window.history.back()
  }

  const tabLabel = useMemo(() => {
    if (tab === 'feed') return 'For You'
    return 'Setup'
  }, [tab])

  return (
    <main className="mobile-shell">
      <header className="mobile-topbar">
        <p className="mobile-eyebrow">Raven</p>
        <h1>{tabLabel}</h1>
        {tab === 'feed' && feedViewMode === 'full' && (
          <button className="btn ghost" onClick={handleBack}>
            Back
          </button>
        )}
      </header>

      <section className="mobile-content">
        {tab === 'feed' ? (
          <MobileFeedReaderPage
            stories={selectedStory ? [selectedStory] : feed.allStories}
            isLoading={feed.feedLoading}
            errorTexts={feed.feedErrorTexts}
            onRefresh={() => {
              void feed.refetchFeeds()
            }}
            canRefresh={Boolean(feed.savedChoices.length)}
            teaser={feedViewMode === 'teaser'}
            onTitleClick={handleTitleClick}
          />
        ) : null}

        {tab === 'setup' ? (
          <div className="setup-container">
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
          </div>
        ) : null}
      </section>

      <nav className="mobile-bottom-nav" aria-label="Bottom navigation">
        <button
          className={tab === 'feed' ? 'active' : ''}
          onClick={() => updateNavigation('feed', 'teaser')}
        >
          Feed
        </button>
        <button
          className={tab === 'setup' ? 'active' : ''}
          onClick={() => updateNavigation('setup', 'teaser')}
        >
          Setup
        </button>
      </nav>
    </main>
  )
}
