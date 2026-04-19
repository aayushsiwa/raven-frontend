import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type CustomFeed, type api } from '../../lib/api';
import { qk } from '../../lib/queryKeys';

type NewCustomFeedInput = {
  title: string;
  url: string;
  category?: string;
  topic?: string;
};

export function useCustomFeeds({
  client,
  baseUrl,
  token,
}: {
  client: ReturnType<typeof api>;
  baseUrl: string;
  token: string | null;
}) {
  const queryClient = useQueryClient();

  const customFeedsQuery = useQuery({
    queryKey: qk.customFeeds(baseUrl, token ?? 'none'),
    queryFn: () => client.getCustomFeeds(token as string),
    enabled: Boolean(token),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: qk.customFeeds(baseUrl, token ?? 'none'),
    });
    await queryClient.invalidateQueries({
      queryKey: ['user-feed', baseUrl, token ?? 'none'],
      exact: false,
    });
  };

  const createCustomFeed = useMutation({
    mutationFn: (payload: NewCustomFeedInput) =>
      client.createCustomFeed(token as string, payload),
    onSuccess: async () => {
      await invalidate();
    },
  });

  const toggleCustomFeed = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      client.updateCustomFeed(token as string, id, { is_active: isActive }),
    onSuccess: async () => {
      await invalidate();
    },
  });

  const deleteCustomFeed = useMutation({
    mutationFn: (feedId: number) =>
      client.deleteCustomFeed(token as string, feedId),
    onSuccess: async () => {
      await invalidate();
    },
  });

  return {
    customFeeds: (customFeedsQuery.data?.feeds ?? []) as CustomFeed[],
    loadingCustomFeeds: customFeedsQuery.isLoading,
    customFeedsError:
      customFeedsQuery.error instanceof Error
        ? customFeedsQuery.error.message
        : null,
    customFeedActionError:
      (createCustomFeed.error instanceof Error
        ? createCustomFeed.error.message
        : null) ||
      (toggleCustomFeed.error instanceof Error
        ? toggleCustomFeed.error.message
        : null) ||
      (deleteCustomFeed.error instanceof Error
        ? deleteCustomFeed.error.message
        : null),
    customFeedBusy:
      createCustomFeed.isPending ||
      toggleCustomFeed.isPending ||
      deleteCustomFeed.isPending,
    addCustomFeed: async (payload: NewCustomFeedInput) => {
      await createCustomFeed.mutateAsync(payload);
    },
    setCustomFeedActive: async (id: number, isActive: boolean) => {
      await toggleCustomFeed.mutateAsync({ id, isActive });
    },
    removeCustomFeed: async (feedId: number) => {
      await deleteCustomFeed.mutateAsync(feedId);
    },
  };
}
