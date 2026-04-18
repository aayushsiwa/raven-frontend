import { createFileRoute } from '@tanstack/react-router';

import { StoryRoutePage } from '../interfaces/shared/routes/StoryRoutePage';

type StorySearch = {
  title: string;
  url: string;
  content: string;
  provider: string;
  category: string;
  topic: string;
  rankTime: number;
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
      rankTime: (search.rankTime as number) || Date.now(),
      published: search.published as string | undefined,
    };
  },
  component: StoryRoutePage,
});
