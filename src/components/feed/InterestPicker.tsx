import { useState } from 'react';

import {
  formatCategory,
  formatProvider,
  formatTopic,
} from '../../features/feed/constants';
import type { FeedChoice } from '../../features/feed/useFeedPreferences';

type InterestPickerProps = {
  feedTree: Record<string, Record<string, string[]>>;
  savedChoices: FeedChoice[];
  mapRefreshing: boolean;
  providersErrorText?: string | null;
  feedTreeErrorText?: string | null;
  isAuthMode?: boolean;
  preferencesSyncing?: boolean;
  preferencesErrorText?: string | null;
  onAddChoice: (choice: FeedChoice) => void;
  onRemoveChoice: (choice: FeedChoice) => void;
  onClearChoices: () => void;
  className?: string;
};

export function InterestPicker(props: InterestPickerProps) {
  const [openPath, setOpenPath] = useState<string | null>(null);

  const providers = Object.keys(props.feedTree);

  return (
    <section
      className={`max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-panel-border ${props.className ?? ''}`.trim()}
    >
      <div className="flex justify-between items-center mb-4">
        <p className="uppercase tracking-[0.14em] text-[0.72rem] text-primary font-bold m-0 px-4">
          Your Selection
        </p>
        <button
          className="text-[0.8rem] px-3 py-1.5 rounded-lg bg-surface-low text-muted hover:bg-surface-high transition-colors font-bold disabled:opacity-30 active:scale-95"
          onClick={props.onClearChoices}
          disabled={!props.savedChoices.length}
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 px-4">
        {props.savedChoices.length ? (
          props.savedChoices.map((choice) => {
            const key = `${choice.provider}/${choice.category}/${choice.topic}`;
            return (
              <button
                key={key}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[0.85rem] font-bold flex items-center gap-1.5 transition-all hover:bg-primary/20 animate-in zoom-in-95 duration-200"
                onClick={() => props.onRemoveChoice(choice)}
              >
                {formatTopic(choice.topic)}{' '}
                <span className="opacity-40 text-[1.1rem] leading-none">×</span>
              </button>
            );
          })
        ) : (
          <p className="text-[0.9rem] text-muted italic opacity-60">
            No interests yet. Explore below.
          </p>
        )}
      </div>

      <div className="grid gap-3 px-0">
        {providers.map((provider) => {
          const categories = Object.keys(props.feedTree[provider] ?? {});

          return (
            <details
              key={provider}
              className="rounded-xl border border-panel-border bg-panel overflow-hidden group"
              open={
                openPath === provider || openPath?.startsWith(`${provider}/`)
              }
              onToggle={(event) => {
                const isOpen = (event.currentTarget as HTMLDetailsElement).open;
                setOpenPath(isOpen ? provider : null);
              }}
            >
              <summary className="px-4 py-3 font-bold text-[1rem] cursor-pointer list-none flex justify-between items-center hover:bg-surface-low transition-colors">
                {formatProvider(provider)}
              </summary>
              <div className="p-3 grid gap-2 bg-surface-low/30">
                {categories.map((category) => {
                  const categoryKey = `${provider}/${category}`;
                  const topics = props.feedTree[provider][category] ?? [];

                  return (
                    <details
                      key={categoryKey}
                      className="rounded-lg border border-panel-border bg-panel overflow-hidden group/cat"
                      open={openPath === categoryKey}
                      onToggle={(event) => {
                        const isOpen = (
                          event.currentTarget as HTMLDetailsElement
                        ).open;
                        setOpenPath(isOpen ? categoryKey : provider);
                      }}
                    >
                      <summary className="px-3 py-2.5 font-semibold text-[0.9rem] cursor-pointer list-none flex justify-between items-center hover:bg-surface-low transition-colors">
                        {formatCategory(category)}
                      </summary>
                      <div className="p-3 flex flex-wrap gap-2 bg-surface-low/20">
                        {topics.map((topic) => {
                          const choice: FeedChoice = {
                            provider,
                            category,
                            topic,
                          };
                          const exists = props.savedChoices.some(
                            (item) =>
                              item.provider === provider &&
                              item.category === category &&
                              item.topic === topic
                          );

                          return (
                            <button
                              key={`${categoryKey}/${topic}`}
                              className={`px-3.5 py-1.5 rounded-full border text-[0.82rem] font-bold transition-all active:scale-95 ${
                                exists
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'border-panel-border bg-surface-low text-text hover:bg-surface-high'
                              }`.trim()}
                              onClick={() => {
                                if (exists) {
                                  props.onRemoveChoice(choice);
                                  return;
                                }
                                props.onAddChoice(choice);
                              }}
                            >
                              {formatTopic(topic)}
                            </button>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-panel-border px-4">
        <p className="text-[0.8rem] font-bold text-primary/60 m-0">
          {props.mapRefreshing
            ? 'Refreshing hierarchy...'
            : props.preferencesSyncing
              ? 'Syncing preferences...'
              : `${props.savedChoices.length} interests selected`}
        </p>

        {props.providersErrorText && (
          <p className="mt-2 text-[0.85rem] text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20 font-bold">
            {props.providersErrorText}
          </p>
        )}
        {props.feedTreeErrorText && (
          <p className="mt-2 text-[0.85rem] text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20 font-bold">
            {props.feedTreeErrorText}
          </p>
        )}
        {props.preferencesErrorText && (
          <p className="mt-2 text-[0.85rem] text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20 font-bold">
            {props.preferencesErrorText}
          </p>
        )}
      </div>
    </section>
  );
}
