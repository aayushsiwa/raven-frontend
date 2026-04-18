import type { LocalSavedArticle } from '../auth/useAuth';
import type { FeedStory } from '../feed/useFeedPreferences';

export type SaveArticleInput = Omit<LocalSavedArticle, 'id' | 'savedAt'>;

export function storyUrl(story: FeedStory): string {
  return story.entry.link ? String(story.entry.link) : '';
}

export function storySource(story: FeedStory): string {
  return (
    story.entry.source ?? `${story.provider}/${story.category}/${story.topic}`
  );
}

export function findSavedByUrl(
  savedArticles: LocalSavedArticle[],
  url: string | undefined
): LocalSavedArticle | null {
  if (!url) {
    return null;
  }
  return savedArticles.find((item) => item.url === url) ?? null;
}

export function toSaveArticleInput(story: FeedStory): SaveArticleInput | null {
  const url = storyUrl(story);
  if (!url) {
    return null;
  }

  return {
    title: story.entry.title ?? 'Untitled entry',
    url,
    summary: story.entry.summary,
    source: storySource(story),
  };
}
