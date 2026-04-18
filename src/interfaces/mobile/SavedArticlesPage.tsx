import { Bookmark, ExternalLink, Trash2 } from 'lucide-react';

import type { LocalSavedArticle } from '../../features/auth/useAuth';

type SavedArticlesPageProps = {
  savedArticles: LocalSavedArticle[];
  onRemoveSavedArticle: (id: string) => void;
};

export function SavedArticlesPage(props: SavedArticlesPageProps) {
  return (
    <section className="flex flex-col gap-6 pt-5 pb-24 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-serif italic text-[1.8rem]">Archive</h3>
        <span className="uppercase tracking-widest text-[0.7rem] text-primary font-bold opacity-70">
          {props.savedArticles.length} items
        </span>
      </div>

      {props.savedArticles.length ? (
        <div className="flex flex-col gap-4">
          {props.savedArticles
            .slice()
            .sort((a, b) => b.savedAt - a.savedAt)
            .map((article) => (
              <article
                key={article.id}
                className="p-6 rounded-2xl bg-panel border border-panel-border backdrop-blur-md shadow-sm"
              >
                <div className="mb-4">
                  <h4 className="font-serif font-semibold text-[1.3rem] leading-tight mb-2 text-text">
                    {article.title}
                  </h4>
                  {article.source ? (
                    <p className="text-[0.75rem] uppercase tracking-widest text-muted font-bold">
                      {article.source}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <a
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-[0.9rem] font-semibold border border-panel-border hover:bg-primary/20 active:scale-95 transition-all"
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read <ExternalLink size={14} />
                  </a>
                  <button
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-500/10 text-red-500 active:scale-95 transition-all border border-red-500/20"
                    onClick={() => props.onRemoveSavedArticle(article.id)}
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-surface-low border border-dashed border-panel-border text-center flex flex-col items-center justify-center gap-4">
          <Bookmark size={48} className="text-muted opacity-20" />
          <p className="text-muted text-[0.95rem] leading-relaxed">
            Your archive is empty. Tap save on any story in the library to keep
            it for later.
          </p>
        </div>
      )}
    </section>
  );
}
