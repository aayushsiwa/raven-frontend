export const qk = {
  health: (baseUrl: string) => ['health', baseUrl] as const,
  tree: (baseUrl: string) => ['tree', baseUrl] as const,
  providers: (baseUrl: string) => ['providers', baseUrl] as const,
  categories: (baseUrl: string, provider: string) =>
    ['categories', baseUrl, provider] as const,
  topics: (baseUrl: string, provider: string, category: string) =>
    ['topics', baseUrl, provider, category] as const,
  rss: (
    baseUrl: string,
    provider: string,
    category: string,
    topic: string,
    limit: number
  ) => ['rss', baseUrl, provider, category, topic, limit] as const,
  batchRss: (
    baseUrl: string,
    feeds: { provider: string; category: string; topic: string }[],
    limit: number,
    cursor?: number
  ) => {
    const feedKey = feeds
      .map((f) => `${f.provider}:${f.category}:${f.topic}`)
      .sort()
      .join('|');
    return ['batch-rss', baseUrl, feedKey, limit, cursor ?? null] as const;
  },
  userFeed: (baseUrl: string, token: string, limit: number, cursor?: number) =>
    ['user-feed', baseUrl, token, limit, cursor ?? null] as const,
  customFeeds: (baseUrl: string, token: string) =>
    ['custom-feeds', baseUrl, token] as const,
  subscriptions: (baseUrl: string, channelId?: number) =>
    ['subscriptions', baseUrl, channelId ?? 'all'] as const,
};
