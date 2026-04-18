export const qk = {
  health: (baseUrl: string) => ['health', baseUrl] as const,
  tree: (baseUrl: string) => ['tree', baseUrl] as const,
  providers: (baseUrl: string) => ['providers', baseUrl] as const,
  categories: (baseUrl: string, provider: string) => ['categories', baseUrl, provider] as const,
  topics: (baseUrl: string, provider: string, category: string) =>
    ['topics', baseUrl, provider, category] as const,
  rss: (baseUrl: string, provider: string, category: string, topic: string, limit: number) =>
    ['rss', baseUrl, provider, category, topic, limit] as const,
  batchRss: (baseUrl: string, feeds: any[], limit: number) =>
    ['batch-rss', baseUrl, feeds, limit] as const,
  subscriptions: (baseUrl: string, channelId?: number) =>
    ['subscriptions', baseUrl, channelId ?? 'all'] as const,
}
