import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { RssEntry, api } from '../../lib/api';
import { qk } from '../../lib/queryKeys';
import { type FeedChoice, errorText } from './useFeedPreferences';

export function useFeedData({
  client,
  baseUrl,
  savedChoices,
  limit,
  isAuthMode,
  authToken,
}: {
  client: ReturnType<typeof api>;
  baseUrl: string;
  savedChoices: FeedChoice[];
  limit: number;
  isAuthMode: boolean;
  authToken: string | null;
}) {
  function storyTimestamp(entry: RssEntry): number {
    const published =
      (entry.published as string | undefined) ??
      (entry.published_parsed as string | undefined);
    if (!published) {
      return 0;
    }

    const ts = new Date(published).getTime();
    return Number.isNaN(ts) ? 0 : ts;
  }
  const batchQuery = useQuery({
    queryKey: qk.batchRss(baseUrl, savedChoices, limit),
    queryFn: () => client.batchRss({ feeds: savedChoices, limit }),
    enabled: !isAuthMode && savedChoices.length > 0,
  });

  const userFeedQuery = useQuery({
    queryKey: qk.userFeed(baseUrl, authToken ?? 'none', limit),
    queryFn: () => client.userFeed(authToken as string, limit),
    enabled: isAuthMode && Boolean(authToken),
  });

  const allStories = useMemo(() => {
    const results = isAuthMode
      ? (userFeedQuery.data?.results ?? [])
      : (batchQuery.data?.results ?? []);
    const seen = new Set<string>();

    return results
      .flatMap((res) =>
        res.entries.map((entry, idx) => ({
          provider: res.provider,
          category: res.category,
          topic: res.topic,
          entry,
          rankTime: storyTimestamp(entry) || Date.now() - idx,
        }))
      )
      .filter((story) => {
        const key = `${story.entry.link}|${story.entry.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.rankTime - a.rankTime);
  }, [batchQuery.data, isAuthMode, userFeedQuery.data]);

  return {
    allStories,
    feedLoading: isAuthMode ? userFeedQuery.isLoading : batchQuery.isLoading,
    feedErrorTexts: isAuthMode
      ? userFeedQuery.error
        ? [errorText(userFeedQuery.error)]
        : []
      : batchQuery.error
        ? [errorText(batchQuery.error)]
        : [],
    refetch: isAuthMode ? userFeedQuery.refetch : batchQuery.refetch,
  };
}
