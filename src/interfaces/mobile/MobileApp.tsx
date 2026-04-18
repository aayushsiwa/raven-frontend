import { useMemo, useState, useEffect } from 'react'
import { ArrowLeft, Newspaper, Compass, Settings } from 'lucide-react'
import { InterestPicker } from '../../components/feed/InterestPicker'
import { useFeedExperience, type FeedStory } from '../../features/feed/useFeedExperience'
import type { LocalSavedArticle } from '../../features/auth/useAuth'
import type { ThemeState, ThemeVarKey } from '../../features/theme/useTheme'
import { MobileFeedReaderPage } from './MobileFeedReaderPage'

type MobileTab = 'feed' | 'discover' | 'saved' | 'setup'

type MobileAppProps = {
  defaultBaseUrl: string
  onLogout: () => void
  savedArticles: LocalSavedArticle[]
  onSaveArticle: (article: Omit<LocalSavedArticle, 'id' | 'savedAt'>) => void
  onRemoveSavedArticle: (id: string) => void
  theme: ThemeState
}

const colorKeys: { key: ThemeVarKey; label: string }[] = [
  { key: 'bg', label: 'Background' },
  { key: 'text', label: 'Text' },
  { key: 'muted', label: 'Muted' },
  { key: 'primary', label: 'Primary' },
  { key: 'tertiary', label: 'Accent' },
]

export function MobileApp({
  defaultBaseUrl,
  onLogout,
  savedArticles,
  onSaveArticle,
  onRemoveSavedArticle,
  theme,
}: MobileAppProps) {
  const feed = useFeedExperience(defaultBaseUrl)
  const [tab, setTab] = useState<MobileTab>('feed')

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state
      if (state) {
        setTab(state.tab || 'feed')
      } else {
        setTab('feed')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const updateNavigation = (newTab: MobileTab) => {
    const current = window.history.state as { tab?: MobileTab } | null

    if (newTab === 'feed') {
      const isAlreadyRootFeed = !current || current.tab === 'feed'
      if (isAlreadyRootFeed) {
        setTab('feed')
        return
      }
    }

    setTab(newTab)
    window.history.pushState({ tab: newTab }, '')
  }

  const handleBack = () => {
    window.history.back()
  }

  const tabLabel = useMemo(() => {
    if (tab === 'feed') return 'Library'
    if (tab === 'discover') return 'Discover'
    if (tab === 'saved') return 'Saved'
    return 'Settings'
  }, [tab])

  const findSavedByUrl = (url: string | undefined) => {
    if (!url) return null
    return savedArticles.find((item) => item.url === url) ?? null
  }

  const isSaved = (story: FeedStory) => Boolean(findSavedByUrl(story.entry.link ? String(story.entry.link) : undefined))

  const onSaveToggle = (story: FeedStory) => {
    const url = story.entry.link ? String(story.entry.link) : ''
    if (!url) return
    const existing = findSavedByUrl(url)
    if (existing) {
      onRemoveSavedArticle(existing.id)
      return
    }
    onSaveArticle({
      title: story.entry.title ?? 'Untitled entry',
      url,
      summary: story.entry.summary,
      source: story.entry.source ?? `${story.provider}/${story.category}/${story.topic}`,
    })
  }

  return (
    <main className="mobile-shell">
      <header className="mobile-topbar">
        <p className="mobile-eyebrow">The Collector</p>
        <h1>{tabLabel}</h1>
        {tab === 'setup' ? (
          <button className="icon-btn" onClick={handleBack} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
        ) : null}
        {tab === 'setup' && (
          <button className="btn ghost" onClick={onLogout}>
            Logout
          </button>
        )}
      </header>

      <section className="mobile-content">
        {tab === 'feed' ? (
          <MobileFeedReaderPage
            stories={feed.allStories}
            isLoading={feed.feedLoading}
            errorTexts={feed.feedErrorTexts}
            onRefresh={() => {
              void feed.refetchFeeds()
            }}
            canRefresh={Boolean(feed.savedChoices.length)}
            isSaved={isSaved}
            onSaveToggle={onSaveToggle}
          />
        ) : null}

        {tab === 'saved' ? (
          <section className="settings-panel">
            <p className="discover-title">Saved Articles</p>
            {savedArticles.length ? (
              <div className="saved-list mobile-saved-list">
                {savedArticles.slice().sort((a, b) => b.savedAt - a.savedAt).map((article) => (
                  <article className="saved-item" key={article.id}>
                    <div>
                      <h3>{article.title}</h3>
                      {article.source ? <p className="saved-meta">{article.source}</p> : null}
                    </div>
                    <div className="saved-actions">
                      <a className="story-link" href={article.url} target="_blank" rel="noreferrer">Open</a>
                      <button className="btn ghost" onClick={() => onRemoveSavedArticle(article.id)} type="button">
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">No saved articles yet. Save from Library tab.</p>
            )}
          </section>
        ) : null}

        {tab === 'setup' ? (
          <section className="settings-accordion">
            <details className="settings-section" open>
              <summary>Interests</summary>
              <div className="settings-section-body">
                <InterestPicker
                  feedTree={feed.feedTree}
                  savedChoices={feed.savedChoices}
                  mapRefreshing={feed.mapRefreshing}
                  providersErrorText={feed.providersErrorText}
                  feedTreeErrorText={feed.feedTreeErrorText}
                  isAuthMode={feed.isAuthMode}
                  preferencesSyncing={feed.preferencesSyncing}
                  preferencesErrorText={feed.preferencesErrorText}
                  onAddChoice={feed.addChoice}
                  onRemoveChoice={feed.removeChoice}
                  onClearChoices={feed.clearChoices}
                />
              </div>
            </details>

            <details className="settings-section" open>
              <summary>Theme Presets</summary>
              <div className="settings-section-body theme-presets-grid">
                {theme.presets.map((preset) => (
                  <button
                    key={preset.id}
                    className={`btn ghost theme-preset-btn ${theme.presetId === preset.id ? 'active' : ''}`.trim()}
                    onClick={() => theme.setPreset(preset.id)}
                    type="button"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </details>

            <details className="settings-section">
              <summary>Theme Colors</summary>
              <div className="settings-section-body theme-vars-grid">
                {colorKeys.map((item) => (
                  <label key={item.key} className="theme-var-field">
                    <span>{item.label}</span>
                    <input
                      type="color"
                      value={theme.resolvedVars[item.key]}
                      onChange={(event) => theme.setVar(item.key, event.currentTarget.value)}
                    />
                  </label>
                ))}
                <button className="btn ghost" onClick={theme.resetOverrides} type="button">
                  Reset custom colors
                </button>
              </div>
            </details>
          </section>
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
          onClick={() => updateNavigation('feed')}
        >
          <Newspaper size={16} />
          <span>Library</span>
        </button>
        <button
          className={tab === 'discover' ? 'active' : ''}
          onClick={() => updateNavigation('discover')}
        >
          <Compass size={16} />
          <span>Discover</span>
        </button>
        <button
          className={tab === 'saved' ? 'active' : ''}
          onClick={() => updateNavigation('saved')}
        >
          <Newspaper size={16} />
          <span>Saved</span>
        </button>
        <button
          className={tab === 'setup' ? 'active' : ''}
          onClick={() => updateNavigation('setup')}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </nav>
    </main>
  )
}
