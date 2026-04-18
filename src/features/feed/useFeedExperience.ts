import { useMemo } from 'react';

import { api } from '../../lib/api';
import { useAuth } from '../useAuth';
import { useBaseUrl } from '../useBaseURL';
import { useFeedData } from './useFeedData';
import { useFeedPreferences } from './useFeedPreferences';
import { useFeedTree } from './useFeedTree';

export function useFeedExperience(defaultBaseUrl: string) {
  const base = useBaseUrl(defaultBaseUrl);
  const { authToken, isAuthMode } = useAuth();

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

  return {
    ...base,
    ...tree,
    ...prefs,
    ...feed,
    isAuthMode,
  };
}
