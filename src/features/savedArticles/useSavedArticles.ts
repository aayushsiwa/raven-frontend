import { useCallback } from 'react';

import type { LocalSavedArticle } from '../auth/useAuth';
import type { FeedStory } from '../feed/useFeedPreferences';
import { findSavedByUrl, storyUrl, toSaveArticleInput } from './utils';

type UseSavedArticlesParams = {
  savedArticles: LocalSavedArticle[];
  onSaveArticle: (article: Omit<LocalSavedArticle, 'id' | 'savedAt'>) => void;
  onRemoveSavedArticle: (id: string) => void;
};

export function useSavedArticles({
  savedArticles,
  onSaveArticle,
  onRemoveSavedArticle,
}: UseSavedArticlesParams) {
  const isSaved = useCallback(
    (story: FeedStory) =>
      Boolean(findSavedByUrl(savedArticles, storyUrl(story))),
    [savedArticles]
  );

  const toggleSaved = useCallback(
    (story: FeedStory) => {
      const payload = toSaveArticleInput(story);
      if (!payload) {
        return;
      }

      const existing = findSavedByUrl(savedArticles, payload.url);
      if (existing) {
        onRemoveSavedArticle(existing.id);
        return;
      }

      onSaveArticle(payload);
    },
    [onRemoveSavedArticle, onSaveArticle, savedArticles]
  );

  return {
    isSaved,
    toggleSaved,
  };
}
