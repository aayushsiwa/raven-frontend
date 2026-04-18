import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiError, api, type FeedPreferenceChoice, type RssEntry } from '../../lib/api'
import { qk } from '../../lib/queryKeys'
import { normalizeBaseUrl, toInt } from '../../lib/utils'

const FEED_PREFS_KEY = 'raven.feed.preferences.v1'

export type FeedChoice = {
  provider: string
  category: string
  topic: string
}

export type FeedStory = {
  provider: string
  category: string
  topic: string
  entry: RssEntry
  rankTime: number
}

export type FeedExperienceState = {
  baseUrlInput: string
  baseUrl: string
  limitInput: string
  limit: number
  providers: string[]
  feedTree: Record<string, Record<string, string[]>>
  savedChoices: FeedChoice[]
  allStories: FeedStory[]
  feedLoading: boolean
  feedErrorTexts: string[]
  mapRefreshing: boolean
  providersErrorText: string | null
  feedTreeErrorText: string | null
  isAuthMode: boolean
  preferencesSyncing: boolean
  preferencesErrorText: string | null
  setBaseUrlInput: (value: string) => void
  setLimitInput: (value: string) => void
  addChoice: (choice?: FeedChoice) => void
  removeChoice: (target: FeedChoice) => void
  clearChoices: () => void
  applyBaseUrl: () => void
  refetchFeeds: () => Promise<void>
}

function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    return `${err.message} [${err.status}]`
  }
  if (err instanceof Error) {
    return err.message
  }
  return 'Unknown error'
}

function readSavedChoices(): FeedChoice[] {
  try {
    const raw = localStorage.getItem(FEED_PREFS_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((item): item is FeedChoice => {
        if (!item || typeof item !== 'object') {
          return false
        }

        const value = item as Record<string, unknown>
        return (
          typeof value.provider === 'string' &&
          typeof value.category === 'string' &&
          typeof value.topic === 'string' &&
          Boolean(value.provider && value.category && value.topic)
        )
      })
      .map((item) => ({
        provider: item.provider.toLowerCase(),
        category: item.category.toLowerCase(),
        topic: item.topic.toLowerCase(),
      }))
  } catch {
    return []
  }
}

function storyTimestamp(entry: RssEntry): number {
  const published =
    (entry.published as string | undefined) ?? (entry.published_parsed as string | undefined)
  if (!published) {
    return 0
  }

  const ts = new Date(published).getTime()
  return Number.isNaN(ts) ? 0 : ts
}

export function useFeedExperience(defaultBaseUrl: string): FeedExperienceState {
  const envUrl = import.meta.env.VITE_API_URL || defaultBaseUrl
  const [baseUrlInput, setBaseUrlInputState] = useState(envUrl)
  const [baseUrl, setBaseUrl] = useState(envUrl)
  const [limitInput, setLimitInputState] = useState('12')

  const [savedChoices, setSavedChoices] = useState<FeedChoice[]>(readSavedChoices)
  const authToken = (() => {
    try {
      const raw = localStorage.getItem('raven.auth.v1')
      if (!raw) return null
      const parsed = JSON.parse(raw) as { token?: string }
      return parsed?.token ?? null
    } catch {
      return null
    }
  })()
  const isAuthMode = Boolean(authToken)
  const [preferencesSyncing, setPreferencesSyncing] = useState(false)
  const [preferencesErrorText, setPreferencesErrorText] = useState<string | null>(null)
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)

  const limit = toInt(limitInput, 12)
  const client = useMemo(() => api(baseUrl), [baseUrl])

  const treeQuery = useQuery({
    queryKey: qk.tree(baseUrl),
    queryFn: client.tree,
  })

  const providers = useMemo(() => Object.keys(treeQuery.data?.tree ?? {}), [treeQuery.data])
  const feedTree = useMemo(() => treeQuery.data?.tree ?? {}, [treeQuery.data])

  useEffect(() => {
    if (isAuthMode) {
      return
    }

    setPreferencesLoaded(true)
  }, [isAuthMode])

  useEffect(() => {
    if (!isAuthMode) {
      localStorage.setItem(FEED_PREFS_KEY, JSON.stringify(savedChoices))
      return
    }

    if (!authToken || !preferencesLoaded) return

    const sync = async () => {
      setPreferencesSyncing(true)
      setPreferencesErrorText(null)
      try {
        const body: FeedPreferenceChoice[] = savedChoices.map((choice) => ({
          provider: choice.provider,
          category: choice.category,
          topic: choice.topic,
        }))
        await client.putUserFeedPreferences(authToken, body)
      } catch (err) {
        setPreferencesErrorText(errorText(err))
      } finally {
        setPreferencesSyncing(false)
      }
    }

    void sync()
  }, [authToken, client, isAuthMode, preferencesLoaded, savedChoices])

  useEffect(() => {
    if (!isAuthMode || !authToken) {
      return
    }

    let mounted = true
    const pull = async () => {
      setPreferencesSyncing(true)
      setPreferencesErrorText(null)
      try {
        const res = await client.getUserFeedPreferences(authToken)
        if (!mounted) return
        setSavedChoices(
          res.choices.map((choice) => ({
            provider: choice.provider,
            category: choice.category,
            topic: choice.topic,
          })),
        )
        setPreferencesLoaded(true)
      } catch (err) {
        if (!mounted) return
        setPreferencesErrorText(errorText(err))
        setPreferencesLoaded(true)
      } finally {
        if (mounted) {
          setPreferencesSyncing(false)
        }
      }
    }

    void pull()
    return () => {
      mounted = false
    }
  }, [authToken, client, isAuthMode])

  const batchQuery = useQuery({
    queryKey: qk.batchRss(baseUrl, savedChoices, limit),
    queryFn: () => client.batchRss({ feeds: savedChoices, limit }),
    enabled: savedChoices.length > 0 && limit >= 1 && limit <= 30,
  })

  const allStories = useMemo(() => {
    const stories: FeedStory[] = []
    const seen = new Set<string>()

    const results = batchQuery.data?.results ?? []

    results.forEach((res) => {
      res.entries.forEach((entry, entryIdx) => {
        const dedupeId = `${String(entry.link ?? '')}|${String(entry.title ?? '')}`
        if (seen.has(dedupeId)) return
        seen.add(dedupeId)

        stories.push({
          provider: res.provider,
          category: res.category,
          topic: res.topic,
          entry,
          rankTime: storyTimestamp(entry) || Date.now() - entryIdx,
        })
      })
    })

    return stories.sort((a, b) => b.rankTime - a.rankTime)
  }, [batchQuery.data])

  const feedLoading = batchQuery.isLoading
  const feedErrorTexts = batchQuery.error ? [errorText(batchQuery.error)] : []
  const mapRefreshing = treeQuery.isFetching

  const addChoice = (choice?: FeedChoice) => {
    const nextChoice: FeedChoice = choice ?? {
      provider: '',
      category: '',
      topic: '',
    }

    if (!nextChoice.provider || !nextChoice.category || !nextChoice.topic) {
      return
    }

    setSavedChoices((prev) => {
      const exists = prev.some(
        (item) =>
          item.provider === nextChoice.provider &&
          item.category === nextChoice.category &&
          item.topic === nextChoice.topic,
      )

      if (exists) {
        return prev
      }

      return [...prev, nextChoice]
    })
  }

  const removeChoice = (target: FeedChoice) => {
    setSavedChoices((prev) =>
      prev.filter(
        (item) =>
          !(
            item.provider === target.provider &&
            item.category === target.category &&
            item.topic === target.topic
          ),
      ),
    )
  }

  const clearChoices = () => {
    setSavedChoices([])
  }

  const applyBaseUrl = () => {
    setBaseUrl(normalizeBaseUrl(baseUrlInput))
  }

  return {
    baseUrlInput,
    baseUrl,
    limitInput,
    limit,
    providers,
    feedTree,
    savedChoices,
    allStories,
    feedLoading,
    feedErrorTexts,
    mapRefreshing,
    providersErrorText: treeQuery.error ? errorText(treeQuery.error) : null,
    feedTreeErrorText: treeQuery.error ? 'Failed loading provider tree' : null,
    isAuthMode,
    preferencesSyncing,
    preferencesErrorText,
    setBaseUrlInput: setBaseUrlInputState,
    setLimitInput: setLimitInputState,
    addChoice,
    removeChoice,
    clearChoices,
    applyBaseUrl,
    refetchFeeds: async () => {
      await batchQuery.refetch()
    },
  }
}
