import type { LocalSavedArticle } from '../../features/auth/useAuth';

type SavedArticlesPageProps = {
  savedArticles: LocalSavedArticle[];
  onRemoveSavedArticle: (id: string) => void;
};

export function SavedArticlesPage(props: SavedArticlesPageProps) {
  return (
    <section className="settings-panel">
      <p className="discover-title">Saved Articles</p>
      {props.savedArticles.length ? (
        <div className="saved-list mobile-saved-list">
          {props.savedArticles
            .slice()
            .sort((a, b) => b.savedAt - a.savedAt)
            .map((article) => (
              <article className="saved-item" key={article.id}>
                <div>
                  <h3>{article.title}</h3>
                  {article.source ? (
                    <p className="saved-meta">{article.source}</p>
                  ) : null}
                </div>
                <div className="saved-actions">
                  <a
                    className="story-link"
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                  <button
                    className="btn ghost"
                    onClick={() => props.onRemoveSavedArticle(article.id)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
        </div>
      ) : (
        <p className="muted">No saved articles yet. Save from Library tab.</p>
      )}
    </section>
  );
}
