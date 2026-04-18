import { CardSpotlight } from '../../components/aceternity/CardSpotlight'
import { BackgroundBeams } from '../../components/aceternity/BackgroundBeams'
import { Spotlight } from '../../components/aceternity/Spotlight'
import { InterestPicker } from '../../components/feed/InterestPicker'
import { StoryCard } from '../../components/feed/StoryCard'
import { useFeedExperience, type FeedStory } from '../../features/feed/useFeedExperience'
import type { LocalSavedArticle } from '../../features/auth/useAuth'
import type { ThemeState, ThemeVarKey } from '../../features/theme/useTheme'

type WebAppProps = {
  defaultBaseUrl: string
  onLogout: () => void
  savedArticles: LocalSavedArticle[]
  onSaveArticle: (article: Omit<LocalSavedArticle, 'id' | 'savedAt'>) => void
  onRemoveSavedArticle: (id: string) => void
  theme: ThemeState
}

export function WebApp({
  defaultBaseUrl,
  onLogout,
  savedArticles,
  onSaveArticle,
  onRemoveSavedArticle,
  theme,
}: WebAppProps) {
  const feed = useFeedExperience(defaultBaseUrl)

  const colorKeys: { key: ThemeVarKey; label: string }[] = [
    { key: 'bg', label: 'Background' },
    { key: 'text', label: 'Text' },
    { key: 'muted', label: 'Muted' },
    { key: 'primary', label: 'Primary' },
    { key: 'tertiary', label: 'Accent' },
  ]

  const findSavedByUrl = (url: string | undefined) => {
    if (!url) return null
    return savedArticles.find((item) => item.url === url) ?? null
  }

  const handleSaveToggle = (story: FeedStory) => {
    const link = story.entry.link ? String(story.entry.link) : ''
    if (!link) return
    const existing = findSavedByUrl(link)
    if (existing) {
      onRemoveSavedArticle(existing.id)
      return
    }
    onSaveArticle({
      title: story.entry.title ?? 'Untitled entry',
      url: link,
      summary: story.entry.summary,
      source: story.entry.source ?? `${story.provider}/${story.category}/${story.topic}`,
    })
  }

  return (
    <main className="page-shell web-only">
      <BackgroundBeams />
      <Spotlight className="spot-left" />
      <Spotlight className="spot-right" />

      <header className="hero">
        <p className="eyebrow">Feed Viewer</p>
        <h1>Raven Feed Viewer</h1>
        <p>Desktop web dashboard for multi-interest personalized feed.</p>
        <button className="btn ghost" onClick={onLogout}>Logout</button>
      </header>

      <section className="grid two-col">
        <CardSpotlight title="My Interests" subtitle="Select multiple topics for personalized feed">
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
            {feed.allStories.length ? (
              feed.allStories.map((story, idx) => (
                <StoryCard
                  story={story}
                  teaser={true}
                  isSaved={Boolean(findSavedByUrl(story.entry.link ? String(story.entry.link) : undefined))}
                  onSaveToggle={handleSaveToggle}
                  key={`${story.entry.link ?? 'story'}-${idx}`}
                />
              ))
            ) : (
              <p className="muted">No feed yet. Add interests to load stories.</p>
            )}
          </div>
        </CardSpotlight>

        <CardSpotlight title="Saved Articles" subtitle="Stories you bookmarked for later">
          <div className="saved-list">
            {savedArticles.length ? (
              savedArticles
                .slice()
                .sort((a, b) => b.savedAt - a.savedAt)
                .map((article) => (
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
                ))
            ) : (
              <p className="muted">No saved articles yet. Tap Save on any story.</p>
            )}
          </div>
        </CardSpotlight>

        <CardSpotlight title="Theme Settings" subtitle="Pick preset, then tweak core colors">
          <section className="settings-accordion web-settings-accordion">
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
        </CardSpotlight>
      </section>
    </main>
  )
}
