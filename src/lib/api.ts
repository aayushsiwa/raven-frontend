export type HealthResponse = {
  status: string;
  timestamp: string;
  bot: {
    ready: boolean;
    user: string | null;
    latency_ms: number | null;
  };
  db: string;
  redis: string;
};

export const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080';

export type AuthUser = {
  id: number;
  username: string;
  email?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  auth_source: string;
  created_at: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type SignupBody = {
  username: string;
  password: string;
};

export type LoginBody = {
  username: string;
  password: string;
};

export type OAuthLoginBody = {
  provider: 'google' | 'github' | 'discord';
  provider_user_id: string;
  username: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
};

export type OAuthStartResponse = {
  url: string;
};

export type FeedPreferenceChoice = {
  provider: string;
  category: string;
  topic: string;
};

export type FeedPreferencesResponse = {
  choices: FeedPreferenceChoice[];
};

export type FeedPreferencesSyncResponse = FeedPreferencesResponse & {
  used: 'db' | 'local';
};

export type ProvidersResponse = {
  providers: string[];
};

export type CategoriesResponse = {
  provider: string;
  categories: string[];
};

export type TopicsResponse = {
  provider: string;
  category: string;
  topics: string[];
};

export type TreeResponse = {
  tree: Record<string, Record<string, string[]>>;
};

export type RssEntry = {
  title?: string;
  link?: string;
  published?: string;
  published_iso?: string | null;
  published_parsed?: string;
  summary?: string;
  content_text?: string;
  source?: string;
  [key: string]: unknown;
};

export type RssResponse = {
  provider: string;
  category: string;
  topic: string;
  generated_at?: string;
  count: number;
  entries: RssEntry[];
};

export type BatchRssResponse = {
  generated_at: string;
  results: RssResponse[];
  stories: {
    provider: string;
    category: string;
    topic: string;
    feed_url?: string;
    entry: RssEntry;
    rank_time: number;
  }[];
  next_cursor: number | null;
  has_more: boolean;
};

export type UserFeedResponse = BatchRssResponse;

export type Subscription = {
  channel_id: number;
  guild_id?: number | null;
  provider: string;
  category: string;
  topic: string;
};

export type SubscriptionsResponse = {
  channel_id?: number;
  subscriptions: Subscription[];
};

export type CreateSubscriptionBody = {
  channel_id: number;
  guild_id?: number | null;
  provider: string;
  category: string;
  topic: string;
};

export type DeleteSubscriptionBody = {
  channel_id: number;
  provider: string;
  category: string;
  topic: string;
};

export type SavedArticle = {
  id: number;
  title: string;
  url: string;
  summary?: string | null;
  source?: string | null;
  saved_at: string;
};

export type SavedArticlesResponse = {
  articles: SavedArticle[];
};

export type SaveArticleBody = {
  title: string;
  url: string;
  summary?: string;
  source?: string;
};

type ApiErrorPayload = {
  detail?: string | Record<string, unknown>;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;

  payload: ApiErrorPayload | null;

  constructor(
    message: string,
    status: number,
    payload: ApiErrorPayload | null = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const jsonHeaders = {
  'Content-Type': 'application/json',
};

async function request<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = (await res.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }
    const detail =
      typeof payload?.detail === 'string'
        ? payload.detail
        : `Request failed (${res.status})`;
    throw new ApiError(detail, res.status, payload);
  }

  return (await res.json()) as T;
}

function queryString(
  params: Record<string, string | number | undefined>
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

export function api(baseUrl: string) {
  return {
    signup: (payload: SignupBody) =>
      request<AuthResponse>(baseUrl, '/api/v1/auth/signup', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      }),
    login: (payload: LoginBody) =>
      request<AuthResponse>(baseUrl, '/api/v1/auth/login', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      }),
    oauthLogin: (payload: OAuthLoginBody) =>
      request<AuthResponse>(baseUrl, '/api/v1/auth/oauth', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      }),
    oauthStart: (provider: OAuthLoginBody['provider'], next: string = '/') =>
      request<OAuthStartResponse>(
        baseUrl,
        `/api/v1/auth/oauth/${encodeURIComponent(provider)}/start${queryString({ next })}`
      ),
    me: (token: string) =>
      request<{ user: AuthUser }>(baseUrl, '/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    getUserFeedPreferences: (token: string) =>
      request<FeedPreferencesResponse>(
        baseUrl,
        '/api/v1/user/feed-preferences',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    putUserFeedPreferences: (token: string, choices: FeedPreferenceChoice[]) =>
      request<FeedPreferencesResponse>(
        baseUrl,
        '/api/v1/user/feed-preferences',
        {
          method: 'PUT',
          headers: {
            ...jsonHeaders,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ choices }),
        }
      ),
    syncLocalPreferencesOnce: (
      token: string,
      choices: FeedPreferenceChoice[]
    ) =>
      request<FeedPreferencesSyncResponse>(
        baseUrl,
        '/api/v1/user/feed-preferences/sync-local',
        {
          method: 'POST',
          headers: {
            ...jsonHeaders,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ choices }),
        }
      ),
    userFeed: (
      token: string,
      params: { limit: number; cursor?: number; from_ts?: number; to_ts?: number }
    ) =>
      request<UserFeedResponse>(
        baseUrl,
        `/api/v1/user/feed${queryString({
          limit: params.limit,
          cursor: params.cursor,
          from_ts: params.from_ts,
          to_ts: params.to_ts,
        })}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    health: () => request<HealthResponse>(baseUrl, '/health'),
    providers: () => request<ProvidersResponse>(baseUrl, '/api/v1/providers'),
    categories: (provider: string) =>
      request<CategoriesResponse>(
        baseUrl,
        `/api/v1/providers/${encodeURIComponent(provider)}/categories`
      ),
    topics: (provider: string, category: string) =>
      request<TopicsResponse>(
        baseUrl,
        `/api/v1/providers/${encodeURIComponent(provider)}/categories/${encodeURIComponent(category)}/topics`
      ),
    tree: () => request<TreeResponse>(baseUrl, '/api/v1/tree'),
    rss: (params: {
      provider: string;
      category: string;
      topic: string;
      limit: number;
    }) =>
      request<RssResponse>(
        baseUrl,
        `/api/v1/rss${queryString({
          provider: params.provider,
          category: params.category,
          topic: params.topic,
          limit: params.limit,
        })}`
      ),
    batchRss: (params: {
      feeds: { provider: string; category: string; topic: string }[];
      limit: number;
      cursor?: number;
      from_ts?: number;
      to_ts?: number;
    }) =>
      request<BatchRssResponse>(baseUrl, '/api/v1/batch/rss', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(params),
      }),
    listSubscriptions: (channelId?: number) =>
      request<SubscriptionsResponse>(
        baseUrl,
        `/api/v1/subscriptions${queryString({ channel_id: channelId })}`
      ),
    createSubscription: (payload: CreateSubscriptionBody) =>
      request<{ status: string; subscription: Subscription }>(
        baseUrl,
        '/api/v1/subscriptions',
        {
          method: 'POST',
          headers: jsonHeaders,
          body: JSON.stringify(payload),
        }
      ),
    deleteSubscription: (payload: DeleteSubscriptionBody) =>
      request<{ status: string; subscription: Omit<Subscription, 'guild_id'> }>(
        baseUrl,
        '/api/v1/subscriptions',
        {
          method: 'DELETE',
          headers: jsonHeaders,
          body: JSON.stringify(payload),
        }
      ),
    logout: (token: string) =>
      request<{ status: string; user_id: number }>(
        baseUrl,
        '/api/v1/auth/logout',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    getSavedArticles: (token: string) =>
      request<SavedArticlesResponse>(baseUrl, '/api/v1/user/saved-articles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    saveArticle: (token: string, payload: SaveArticleBody) =>
      request<{ article: SavedArticle }>(
        baseUrl,
        '/api/v1/user/saved-articles',
        {
          method: 'POST',
          headers: {
            ...jsonHeaders,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      ),
    deleteSavedArticle: (token: string, articleId: number) =>
      request<{ status: string }>(
        baseUrl,
        `/api/v1/user/saved-articles/${articleId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    getCustomFeeds: (token: string) =>
      request<{ feeds: unknown[] }>(baseUrl, '/api/v1/user/custom-feeds', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    createCustomFeed: (
      token: string,
      payload: { title: string; url: string; category?: string; topic?: string }
    ) =>
      request<{ feed: unknown }>(baseUrl, '/api/v1/user/custom-feeds', {
        method: 'POST',
        headers: {
          ...jsonHeaders,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }),
    getLinkedAccounts: (token: string) =>
      request<{ accounts: unknown[] }>(
        baseUrl,
        '/api/v1/user/linked-accounts',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
  };
}
