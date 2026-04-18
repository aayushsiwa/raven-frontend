import { useInfiniteQuery } from '@tanstack/react-query';
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

  const batchQuery = useInfiniteQuery({
    queryKey: qk.batchRss(baseUrl, savedChoices, limit),
    queryFn: ({ pageParam }) =>
      client.batchRss({
        feeds: savedChoices,
        limit,
        cursor: typeof pageParam === 'number' ? pageParam : undefined,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? (lastPage.next_cursor ?? undefined) : undefined,
    enabled: !isAuthMode && savedChoices.length > 0,
  });

  const userFeedQuery = useInfiniteQuery({
    queryKey: qk.userFeed(baseUrl, authToken ?? 'none', limit),
    queryFn: ({ pageParam }) =>
      client.userFeed(authToken as string, {
        limit,
        cursor: typeof pageParam === 'number' ? pageParam : undefined,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? (lastPage.next_cursor ?? undefined) : undefined,
    enabled: isAuthMode && Boolean(authToken),
  });

  const allStories = useMemo(() => {
    const pages = isAuthMode
      ? (userFeedQuery.data?.pages ?? [])
      : (batchQuery.data?.pages ?? []);

    const storiesFromApi = pages.flatMap((page) =>
      (page.stories ?? []).map((story) => ({
        provider: story.provider,
        category: story.category,
        topic: story.topic,
        entry: story.entry,
        rankTime: story.rank_time,
      }))
    );

    if (storiesFromApi.length > 0) {
      return storiesFromApi;
    }

    const results = pages.flatMap((page) => page.results ?? []);
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

  const activeQuery = isAuthMode ? userFeedQuery : batchQuery;

  return {
    allStories,
    feedLoading: activeQuery.isLoading,
    feedErrorTexts: isAuthMode
      ? userFeedQuery.error
        ? [errorText(userFeedQuery.error)]
        : []
      : batchQuery.error
        ? [errorText(batchQuery.error)]
        : [],
    refetch: activeQuery.refetch,
    hasMore: Boolean(activeQuery.hasNextPage),
    loadNextPage: () => activeQuery.fetchNextPage(),
    loadingMore: activeQuery.isFetchingNextPage,
  };
}
