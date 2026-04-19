import { formatLabel } from '../../lib/utils';

export const Provider = {
  VERGE: 'verge',
  HN: 'hn',
  XDA: 'xda',
  HOWTOGEEK: 'howtogeek',
  INDIAN_EXPRESS: 'indian_express',
  INDIAN_NEWS: 'indian_news',
} as const;

export type Provider = (typeof Provider)[keyof typeof Provider];

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  [Provider.VERGE]: 'The Verge',
  [Provider.HN]: 'Hacker News',
  [Provider.XDA]: 'XDA',
  [Provider.HOWTOGEEK]: 'How-To Geek',
  [Provider.INDIAN_EXPRESS]: 'The Indian Express',
  [Provider.INDIAN_NEWS]: 'Indian News Feed',
};

/**
 * Formats a provider slug into a polished display name.
 */
export function formatProvider(slug: string): string {
  const normalized = slug.toLowerCase();
  return PROVIDER_DISPLAY_NAMES[normalized] || slug;
}

/**
 * Common category formatting (optional convenience)
 */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  tech: 'Technology',
  gaming: 'Gaming',
  news: 'News',
  science: 'Science',
  business: 'Business',
  entertainment: 'Entertainment',
  lifestyle: 'Lifestyle',
};

export function formatCategory(slug: string): string {
  const normalized = slug.toLowerCase();
  return CATEGORY_DISPLAY_NAMES[normalized] || formatLabel(slug);
}

export function formatTopic(slug: string): string {
  return formatLabel(slug);
}
