import { useMemo } from 'react';

import { api } from '../../lib/api';
import { useAuth } from '../auth/useAuth';
import { useBaseUrl } from '../useBaseURL';
import { useCustomFeeds } from './useCustomFeeds';
import { useFeedData } from './useFeedData';
import { useFeedPreferences } from './useFeedPreferences';
import { useFeedTree } from './useFeedTree';

export function useFeedExperience(defaultBaseUrl: string) {
  const base = useBaseUrl(defaultBaseUrl);
  const { token: authToken, isAuthMode } = useAuth();

  const client = useMemo(() => api(base.baseUrl), [base.baseUrl]);

  const prefs = useFeedPreferences(client, authToken, isAuthMode);
  const tree = useFeedTree(client, base.baseUrl);

  const feed = useFeedData({
    client,
    baseUrl: base.baseUrl,
    savedChoices: prefs.savedChoices,
    limit: base.limit,
    isAuthMode,
    authToken,
  });

  const customFeeds = useCustomFeeds({
    client,
    baseUrl: base.baseUrl,
    token: authToken,
  });

  return {
    ...base,
    ...tree,
    ...prefs,
    allStories: feed.allStories,
    feedLoading: feed.feedLoading,
    feedErrorTexts: feed.feedErrorTexts,
    refetch: feed.refetch,
    hasMore: feed.hasMore,
    loadNextPage: feed.loadNextPage,
    loadingMore: feed.loadingMore,
    ...customFeeds,
    isAuthMode,
  };
}
