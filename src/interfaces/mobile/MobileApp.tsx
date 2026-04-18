import { useMemo, useState, useEffect } from 'react'
import { Newspaper, Compass, Settings } from 'lucide-react'
import { InterestPicker } from '../../components/feed/InterestPicker'
import { useFeedExperience, type FeedStory } from '../../features/feed/useFeedExperience'
import { MobileFeedReaderPage } from './MobileFeedReaderPage'

type MobileTab = 'feed' | 'discover' | 'setup'

type MobileAppProps = {
  defaultBaseUrl: string
  username: string
  onLogout: () => void
}

export function MobileApp({ defaultBaseUrl, username, onLogout }: MobileAppProps) {
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
    if (tab === 'feed') return 'Library'
    if (tab === 'discover') return 'Discover'
    return 'Settings'
  }, [tab])

  return (
    <main className="mobile-shell">
      <header className="mobile-topbar">
        <p className="mobile-eyebrow">The Collector</p>
        <h1>{tabLabel}</h1>
        <p className="muted">@{username}</p>
        {tab === 'feed' && feedViewMode === 'full' && (
          <button className="btn ghost" onClick={handleBack}>
            Back
          </button>
        )}
        {tab === 'setup' && (
          <button className="btn ghost" onClick={onLogout}>
            Logout
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

        {tab === 'discover' ? (
          <section className="discover-panel">
            <p className="discover-title">Curated Topics</p>
            <p className="muted">Pick themes from setup. Feed adapts instantly.</p>
            <div className="discover-grid">
              {feed.savedChoices.length ? feed.savedChoices.slice(0, 8).map((choice) => {
                const key = `${choice.provider}/${choice.category}/${choice.topic}`
                return <span className="discover-chip" key={key}>{choice.topic}</span>
              }) : <p className="muted">No interests yet. Open Settings.</p>}
            </div>
          </section>
        ) : null}
      </section>

      <nav className="mobile-bottom-nav" aria-label="Bottom navigation">
        <button
          className={tab === 'feed' ? 'active' : ''}
          onClick={() => updateNavigation('feed', 'teaser')}
        >
          <Newspaper size={16} />
          <span>Library</span>
        </button>
        <button
          className={tab === 'discover' ? 'active' : ''}
          onClick={() => updateNavigation('discover', 'teaser')}
        >
          <Compass size={16} />
          <span>Discover</span>
        </button>
        <button
          className={tab === 'setup' ? 'active' : ''}
          onClick={() => updateNavigation('setup', 'teaser')}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </nav>
    </main>
  )
}
