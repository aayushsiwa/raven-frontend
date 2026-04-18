import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { api } from '../../lib/api';
import { qk } from '../../lib/queryKeys';

export function useFeedTree(client: ReturnType<typeof api>, baseUrl: string) {
  const treeQuery = useQuery({
    queryKey: qk.tree(baseUrl),
    queryFn: client.tree,
  });

  const providers = useMemo(
    () => Object.keys(treeQuery.data?.tree ?? {}),
    [treeQuery.data]
  );

  return {
    providers,
    feedTree: treeQuery.data?.tree ?? {},
    mapRefreshing: treeQuery.isFetching,
    error: treeQuery.error,
  };
}
