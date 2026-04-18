import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';

import { formatCategory, formatProvider } from '../../features/feed/constants';
import type { FeedStory } from '../../features/feed/useFeedPreferences';
import { formatDate, sanitizeHTML } from '../../lib/utils';

type StoryCardProps = {
  story: FeedStory;
  compact?: boolean;
  teaser?: boolean;
  onTitleClick?: (story: FeedStory) => void;
  isSaved?: boolean;
  onSaveToggle?: (story: FeedStory) => void;
};

export function StoryCard({
  story,
  compact = false,
  teaser = false,
  onTitleClick,
  isSaved = false,
  onSaveToggle,
}: StoryCardProps) {
  const navigate = useNavigate();
  const publishedDate =
    story.entry.published_iso ??
    story.entry.published ??
    story.entry.published_parsed;
  const bodyText = story.entry.content_text ?? story.entry.summary;

  // Handle duplicate "Read more" links often found in RSS feeds
  const cleanBodyText = bodyText
    ? String(bodyText)
        .replace(/<a[^>]*>Read the full story at[^<]*<\/a>/gi, '')
        .trim()
    : '';

  const hasHTML = cleanBodyText && /<[a-z][\s\S]*>/i.test(cleanBodyText);

  const teaserText = cleanBodyText
    ? String(cleanBodyText)
        .replace(/<[^>]*>?/gm, '')
        .slice(0, 150) + (cleanBodyText.length > 150 ? '...' : '')
    : '';

  const fullViewClass = !teaser
    ? 'shadow-none bg-transparent p-0 rounded-none'
    : '';

  const handleCardClick = (e: React.MouseEvent) => {
    // If user is selecting text, don't navigate
    if (window.getSelection()?.toString()) return;

    // Don't navigate if clicking on buttons or links
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }

    void navigate({
      to: '/story',
      search: {
        title: story.entry.title ?? '',
        url: story.entry.link ?? '',
        content: String(story.entry.content_text ?? story.entry.summary ?? ''),
        provider: story.provider,
        category: story.category,
        topic: story.topic,
        rankTime: story.rankTime,
        published: publishedDate,
      },
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={handleCardClick}
      className={`relative p-6 bg-panel border border-panel-border rounded-[1rem] shadow-premium transition-all duration-200 cursor-pointer ${compact ? 'rounded-[1rem] p-4 shadow-md' : ''} ${teaser ? 'mb-4' : ''} ${fullViewClass}`.trim()}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className="text-[0.65rem] uppercase tracking-wider text-tertiary font-bold mb-2">
            {formatProvider(story.provider)}{' '}
            <span className="opacity-40 mx-1">•</span>{' '}
            {formatCategory(story.category)}{' '}
            <span className="opacity-40 mx-1">•</span> {story.topic}
          </p>
          {onTitleClick ? (
            <h3
              className="font-serif font-semibold text-[1.4rem] leading-[1.25] tracking-tight cursor-pointer hover:text-primary transition-colors"
              onClick={() => onTitleClick(story)}
            >
              {story.entry.title ?? 'Untitled entry'}
            </h3>
          ) : (
            <h3 className="font-serif font-semibold text-[1.4rem] leading-[1.25] tracking-tight hover:text-primary transition-colors">
              {story.entry.title ?? 'Untitled entry'}
            </h3>
          )}
        </div>

        {onSaveToggle && (
          <button
            className={`flex items-center justify-center w-8 h-8 rounded-full border border-panel-border transition-colors ${isSaved ? 'bg-primary-soft text-primary' : 'bg-transparent text-muted hover:bg-surface-high'}`}
            onClick={() => onSaveToggle(story)}
            type="button"
            title={isSaved ? 'Remove from saved' : 'Save for later'}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      <div className="mt-2 mb-3">
        {publishedDate ? (
          <p className="text-[0.78rem] tracking-wider uppercase text-muted font-medium">
            {formatDate(publishedDate)}
          </p>
        ) : (
          <p className="text-[0.78rem] tracking-wider uppercase text-muted font-medium">
            No date
          </p>
        )}
      </div>

      {cleanBodyText ? (
        teaser ? (
          <div className="text-[0.9rem] text-muted leading-[1.6] line-clamp-3">
            {teaserText}
          </div>
        ) : (
          <div className="mt-4">
            {hasHTML ? (
              <div
                className="prose prose-sm max-w-none text-muted leading-[1.7] story-summary-custom"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(cleanBodyText),
                }}
              />
            ) : (
              <p className="text-muted leading-[1.7]">
                {String(cleanBodyText).slice(0, 1000)}
              </p>
            )}
          </div>
        )
      ) : null}

      {!teaser && story.entry.link ? (
        <a
          className="inline-flex items-center gap-2 mt-6 text-[0.74rem] uppercase tracking-widest font-bold text-primary hover:underline transition-all"
          href={String(story.entry.link)}
          target="_blank"
          rel="noreferrer"
        >
          Open original <ExternalLink size={14} />
        </a>
      ) : null}
    </motion.article>
  );
}
