import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../../../features/auth/useAuth';
import { useSavedArticles } from '../../../features/savedArticles/useSavedArticles';
import { formatProvider, formatCategory } from '../../../features/feed/constants';
import { formatDate, sanitizeHTML } from '../../../lib/utils';

const DEFAULT_BASE_URL = 'http://localhost:8080';

type StoryDetailRouteContentProps = {
  title: string;
  url: string;
  content: string;
  provider: string;
  category: string;
  topic: string;
  published?: string;
};

export function StoryDetailRouteContent(props: StoryDetailRouteContentProps) {
  const navigate = useNavigate();
  const auth = useAuth(DEFAULT_BASE_URL);
  
  const { isSaved, toggleSaved } = useSavedArticles({
    savedArticles: auth.savedArticles,
    onSaveArticle: auth.saveArticleLocally,
    onRemoveSavedArticle: auth.removeLocalArticle,
  });

  const storyObj = {
    provider: props.provider,
    category: props.category,
    topic: props.topic,
    entry: {
      title: props.title,
      link: props.url,
      summary: props.content,
      published: props.published,
    },
    rankTime: Date.now(),
  };

  const saved = isSaved(storyObj);
  const cleanBodyText = props.content
    ? String(props.content)
        .replace(/<a[^>]*>Read the full story at[^<]*<\/a>/gi, '')
        .trim()
    : '';

  const hasHTML = cleanBodyText && /<[a-z][\s\S]*>/i.test(cleanBodyText);

  return (
    <div className="col-span-12 md:col-start-3 md:col-span-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: '..' })}
          className="flex items-center gap-2 text-muted hover:text-primary transition-colors font-bold text-[0.9rem] p-2 -ml-2 rounded-xl hover:bg-surface-low"
        >
          <ArrowLeft size={18} /> Back to feed
        </button>

        <div className="flex items-center gap-3">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-panel-border transition-all active:scale-95 ${
              saved ? 'bg-primary-soft text-primary' : 'bg-panel text-muted hover:bg-surface-high'
            }`}
            onClick={() => toggleSaved(storyObj)}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            <span className="font-bold text-[0.85rem]">{saved ? 'Saved' : 'Save'}</span>
          </button>
          
          <a
            href={props.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-panel-border bg-panel text-muted hover:bg-surface-high transition-all active:scale-95"
          >
            <ExternalLink size={18} />
            <span className="font-bold text-[0.85rem]">Original</span>
          </a>
        </div>
      </div>

      <header className="mb-10 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[0.65rem] font-black uppercase tracking-widest">
            {formatProvider(props.provider)}
          </span>
          <span className="opacity-30">•</span>
          <span className="text-muted text-[0.7rem] font-bold uppercase tracking-widest">
            {formatCategory(props.category)} / {props.topic}
          </span>
        </div>
        
        <h1 className="font-serif italic tracking-tight text-[2.5rem] md:text-[3.5rem] leading-[1.1] mb-6">
          {props.title}
        </h1>
        
        <div className="flex items-center justify-center md:justify-start gap-4 text-muted/60">
          <p className="text-[0.85rem] font-semibold uppercase tracking-wide">
            {formatDate(props.published)}
          </p>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent hidden md:block rounded-full" />
        
        <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted prose-p:leading-[1.8] prose-p:mb-6 prose-headings:font-serif prose-headings:italic prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-premium">
          {hasHTML ? (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(cleanBodyText),
              }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{cleanBodyText}</p>
          )}
        </div>
      </motion.div>
      
      <footer className="mt-16 pt-8 border-t border-panel-border text-center">
        <p className="text-muted/40 text-[0.8rem] font-bold uppercase tracking-[0.2em] mb-4">
          End of Dispatch
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="text-primary font-bold hover:underline"
          >
            Explore more signals
          </Link>
        </div>
      </footer>
    </div>
  );
}
