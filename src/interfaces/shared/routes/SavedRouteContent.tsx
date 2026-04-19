import { LogOut } from 'lucide-react';

import { useAuth } from '../../../features/auth/useAuth';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { SavedArticlesPage as MobileSavedPage } from '../../mobile/SavedArticlesPage';

export function SavedRouteContent() {
  const isMobile = useIsMobile();
  const auth = useAuth();

  if (isMobile) {
    return (
      <MobileSavedPage
        savedArticles={auth.savedArticles}
        onRemoveSavedArticle={auth.removeLocalArticle}
      />
    );
  }

  // Desktop view: Just the archive part of the dashboard
  return (
    <div className="col-span-12 md:col-span-3">
      <div className="p-8 rounded-2xl bg-panel border border-panel-border backdrop-blur-3xl shadow-premium">
        <h3 className="font-serif italic text-[1.8rem] mb-6">Archive</h3>
        <div className="flex flex-col max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-panel-border/30">
          {auth.savedArticles.length ? (
            auth.savedArticles
              .slice()
              .sort((a, b) => b.savedAt - a.savedAt)
              .map((article) => (
                <div
                  key={article.id}
                  className="py-3 border-b border-panel-border/20 last:border-0 flex justify-between items-center group"
                >
                  <div className="max-w-[80%]">
                    <p className="m-0 font-medium whitespace-nowrap overflow-hidden text-ellipsis text-text">
                      {article.title}
                    </p>
                    <p className="text-[0.7rem] uppercase tracking-widest text-muted m-0 font-bold">
                      {article.source}
                    </p>
                  </div>
                  <button
                    onClick={() => auth.removeLocalArticle(article.id)}
                    className="text-red-500 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity p-1 cursor-pointer bg-transparent border-none"
                    title="Remove from archive"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ))
          ) : (
            <p className="text-muted italic opacity-60">
              No articles archived yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
