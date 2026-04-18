import { createFileRoute } from '@tanstack/react-router';

import { StoryDetailRouteContent } from '../interfaces/shared/routes/StoryDetailRouteContent';

type StorySearch = {
  title: string;
  url: string;
  content: string;
  provider: string;
  category: string;
  topic: string;
  published?: string;
};

export const Route = createFileRoute('/story')({
  validateSearch: (search: Record<string, unknown>): StorySearch => {
    return {
      title: (search.title as string) || '',
      url: (search.url as string) || '',
      content: (search.content as string) || '',
      provider: (search.provider as string) || '',
      category: (search.category as string) || '',
      topic: (search.topic as string) || '',
      published: search.published as string | undefined,
    };
  },
  component: StoryDetailPage,
});

function StoryDetailPage() {
  const search = Route.useSearch();
  return <StoryDetailRouteContent {...search} />;
}
