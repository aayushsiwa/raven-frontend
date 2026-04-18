export type HealthResponse = {
  status: string
  timestamp: string
  bot: {
    ready: boolean
    user: string | null
    latency_ms: number | null
  }
  db: string
  redis: string
}

export type ProvidersResponse = {
  providers: string[]
}

export type CategoriesResponse = {
  provider: string
  categories: string[]
}

export type TopicsResponse = {
  provider: string
  category: string
  topics: string[]
}

export type TreeResponse = {
  tree: Record<string, Record<string, string[]>>
}

export type RssEntry = {
  title?: string
  link?: string
  published?: string
  published_iso?: string | null
  published_parsed?: string
  summary?: string
  content_text?: string
  source?: string
  [key: string]: unknown
}

export type RssResponse = {
  provider: string
  category: string
  topic: string
  generated_at?: string
  count: number
  entries: RssEntry[]
}

export type BatchRssResponse = {
  generated_at: string
  results: RssResponse[]
}

export type Subscription = {
  channel_id: number
  guild_id?: number | null
  provider: string
  category: string
  topic: string
}

export type SubscriptionsResponse = {
  channel_id?: number
  subscriptions: Subscription[]
}

export type CreateSubscriptionBody = {
  channel_id: number
  guild_id?: number | null
  provider: string
  category: string
  topic: string
}

export type DeleteSubscriptionBody = {
  channel_id: number
  provider: string
  category: string
  topic: string
}

type ApiErrorPayload = {
  detail?: string | Record<string, unknown>
  [key: string]: unknown
}

export class ApiError extends Error {
  status: number

  payload: ApiErrorPayload | null

  constructor(message: string, status: number, payload: ApiErrorPayload | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

const jsonHeaders = {
  'Content-Type': 'application/json',
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    let payload: ApiErrorPayload | null = null
    try {
      payload = (await res.json()) as ApiErrorPayload
    } catch {
      payload = null
    }
    const detail = typeof payload?.detail === 'string' ? payload.detail : `Request failed (${res.status})`
    throw new ApiError(detail, res.status, payload)
  }

  return (await res.json()) as T
}

function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  })
  const encoded = search.toString()
  return encoded ? `?${encoded}` : ''
}

export function api(baseUrl: string) {
  return {
    health: () => request<HealthResponse>(baseUrl, '/health'),
    providers: () => request<ProvidersResponse>(baseUrl, '/api/v1/providers'),
    categories: (provider: string) =>
      request<CategoriesResponse>(
        baseUrl,
        `/api/v1/providers/${encodeURIComponent(provider)}/categories`,
      ),
    topics: (provider: string, category: string) =>
      request<TopicsResponse>(
        baseUrl,
        `/api/v1/providers/${encodeURIComponent(provider)}/categories/${encodeURIComponent(category)}/topics`,
      ),
    tree: () => request<TreeResponse>(baseUrl, '/api/v1/tree'),
    rss: (params: { provider: string; category: string; topic: string; limit: number }) =>
      request<RssResponse>(
        baseUrl,
        `/api/v1/rss${queryString({
          provider: params.provider,
          category: params.category,
          topic: params.topic,
          limit: params.limit,
        })}`,
      ),
    batchRss: (params: { feeds: { provider: string; category: string; topic: string }[]; limit: number }) =>
      request<BatchRssResponse>(baseUrl, '/api/v1/batch/rss', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(params),
      }),
    listSubscriptions: (channelId?: number) =>
      request<SubscriptionsResponse>(
        baseUrl,
        `/api/v1/subscriptions${queryString({ channel_id: channelId })}`,
      ),
    createSubscription: (payload: CreateSubscriptionBody) =>
      request<{ status: string; subscription: Subscription }>(baseUrl, '/api/v1/subscriptions', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      }),
    deleteSubscription: (payload: DeleteSubscriptionBody) =>
      request<{ status: string; subscription: Omit<Subscription, 'guild_id'> }>(
        baseUrl,
        '/api/v1/subscriptions',
        {
          method: 'DELETE',
          headers: jsonHeaders,
          body: JSON.stringify(payload),
        },
      ),
  }
}
