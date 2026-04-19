import { useState } from 'react';

import type { CustomFeed } from '../../lib/api';

type CustomFeedManagerProps = {
  isAuthMode: boolean;
  customFeeds: CustomFeed[];
  loadingCustomFeeds: boolean;
  customFeedsError: string | null;
  customFeedActionError: string | null;
  customFeedBusy: boolean;
  onAddCustomFeed: (payload: {
    title: string;
    url: string;
    category?: string;
    topic?: string;
  }) => Promise<void>;
  onToggleCustomFeed: (id: number, isActive: boolean) => Promise<void>;
  onDeleteCustomFeed: (id: number) => Promise<void>;
};

const URL_RE = /^https?:\/\//i;

export function CustomFeedManager(props: CustomFeedManagerProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('custom');
  const [topic, setTopic] = useState('user');
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextTitle = title.trim();
    const nextUrl = url.trim();
    const nextCategory = category.trim().toLowerCase() || 'custom';
    const nextTopic = topic.trim().toLowerCase() || 'user';

    if (!nextTitle) {
      setFormError('Title required');
      return;
    }

    if (!URL_RE.test(nextUrl)) {
      setFormError('URL must start with http:// or https://');
      return;
    }

    setFormError(null);
    await props.onAddCustomFeed({
      title: nextTitle,
      url: nextUrl,
      category: nextCategory,
      topic: nextTopic,
    });

    setTitle('');
    setUrl('');
    setCategory('custom');
    setTopic('user');
  };

  if (!props.isAuthMode) {
    return (
      <section className="p-4 rounded-2xl bg-surface-low border border-panel-border text-muted text-[0.88rem]">
        Login required for custom feed URLs.
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <form
        onSubmit={submit}
        className="grid gap-3 p-4 rounded-2xl bg-surface-low border border-panel-border"
      >
        <p className="uppercase tracking-[0.14em] text-[0.72rem] text-primary font-bold">
          Add Custom Feed
        </p>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Feed title"
          className="w-full px-3 py-2 rounded-xl bg-panel border border-panel-border text-text"
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/rss"
          className="w-full px-3 py-2 rounded-xl bg-panel border border-panel-border text-text"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="category"
            className="w-full px-3 py-2 rounded-xl bg-panel border border-panel-border text-text"
          />
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="topic"
            className="w-full px-3 py-2 rounded-xl bg-panel border border-panel-border text-text"
          />
        </div>
        <button
          type="submit"
          disabled={props.customFeedBusy}
          className="w-full px-4 py-2.5 rounded-xl bg-primary text-white font-bold disabled:opacity-60"
        >
          {props.customFeedBusy ? 'Saving...' : 'Add feed'}
        </button>
        {formError ? (
          <p className="text-[0.8rem] text-red-500 font-bold">{formError}</p>
        ) : null}
        {props.customFeedActionError ? (
          <p className="text-[0.8rem] text-red-500 font-bold">
            {props.customFeedActionError}
          </p>
        ) : null}
      </form>

      <div className="grid gap-2">
        <p className="uppercase tracking-[0.14em] text-[0.72rem] text-primary font-bold">
          My Custom Feeds
        </p>

        {props.loadingCustomFeeds ? (
          <p className="text-[0.85rem] text-muted">Loading custom feeds...</p>
        ) : null}
        {props.customFeedsError ? (
          <p className="text-[0.85rem] text-red-500 font-bold">
            {props.customFeedsError}
          </p>
        ) : null}

        {props.customFeeds.map((feed) => (
          <div
            key={feed.id}
            className="p-3 rounded-xl bg-panel border border-panel-border grid gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-[0.95rem] truncate">{feed.title}</p>
                <p className="text-[0.75rem] text-muted truncate">{feed.url}</p>
              </div>
              <span
                className={`text-[0.7rem] font-bold uppercase ${feed.is_active ? 'text-primary' : 'text-muted'}`}
              >
                {feed.is_active ? 'active' : 'paused'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={props.customFeedBusy}
                onClick={() => {
                  void props.onToggleCustomFeed(feed.id, !feed.is_active);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-surface-low border border-panel-border text-[0.78rem] font-bold"
              >
                {feed.is_active ? 'Pause' : 'Activate'}
              </button>
              <button
                type="button"
                disabled={props.customFeedBusy}
                onClick={() => {
                  void props.onDeleteCustomFeed(feed.id);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[0.78rem] font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {!props.loadingCustomFeeds && props.customFeeds.length === 0 ? (
          <p className="text-[0.85rem] text-muted">No custom feeds yet.</p>
        ) : null}
      </div>
    </section>
  );
}
