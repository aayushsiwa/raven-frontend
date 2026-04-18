import { useEffect, useMemo, useState } from 'react';

import { ApiError, type AuthUser, type SavedArticle, api } from '../../lib/api';

const AUTH_STORE_KEY = 'raven.auth.v1';
const SAVED_ARTICLES_KEY = 'raven.saved.articles.v1';

type AuthStore = {
  token: string;
  user: AuthUser;
};

type OAuthProvider = 'google' | 'github' | 'discord';

export type LocalSavedArticle = {
  id: string;
  remoteId?: number;
  title: string;
  url: string;
  summary?: string;
  source?: string;
  savedAt: number;
};

export type FieldValidation = {
  username: string | null;
  password: string | null;
};

type ValidationMode = 'login' | 'signup';

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  errorText: string | null;
  savedArticles: LocalSavedArticle[];
  validateFields: (
    username: string,
    password: string,
    mode: ValidationMode
  ) => FieldValidation;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  oauthLogin: (provider: OAuthProvider, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  saveArticleLocally: (
    article: Omit<LocalSavedArticle, 'id' | 'savedAt'>
  ) => void;
  removeLocalArticle: (id: string) => void;
};

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

function validateFields(
  username: string,
  password: string,
  mode: ValidationMode
): FieldValidation {
  const uname = username.trim();
  let usernameErr: string | null = null;
  let passwordErr: string | null = null;

  if (!USERNAME_RE.test(uname)) {
    usernameErr = 'Username must be 3-32 chars: letters, digits, _, -, .';
  }

  if (password.length < 8 || password.length > 128) {
    passwordErr = 'Password must be 8-128 chars';
  } else if (/\s/.test(password)) {
    passwordErr = 'Password must not contain spaces';
  } else if (mode === 'signup' && !/[A-Z]/.test(password)) {
    passwordErr = 'Password needs uppercase letter';
  } else if (mode === 'signup' && !/[a-z]/.test(password)) {
    passwordErr = 'Password needs lowercase letter';
  } else if (mode === 'signup' && !/\d/.test(password)) {
    passwordErr = 'Password needs digit';
  } else if (mode === 'signup' && !/[^A-Za-z0-9]/.test(password)) {
    passwordErr = 'Password needs symbol';
  }

  return { username: usernameErr, password: passwordErr };
}

function readAuthStore(): AuthStore | null {
  try {
    const raw = localStorage.getItem(AUTH_STORE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as AuthStore;
    if (!parsed?.token || !parsed?.user) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeAuthStore(value: AuthStore | null) {
  if (!value) {
    localStorage.removeItem(AUTH_STORE_KEY);
    return;
  }
  localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(value));
}

function readLocalSavedArticles(): LocalSavedArticle[] {
  try {
    const raw = localStorage.getItem(SAVED_ARTICLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalSavedArticles(articles: LocalSavedArticle[]) {
  localStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(articles));
}

function mapDbSavedArticle(article: SavedArticle): LocalSavedArticle {
  const ts = new Date(article.saved_at).getTime();
  return {
    id: `db:${article.id}`,
    remoteId: article.id,
    title: article.title,
    url: article.url,
    summary: article.summary ?? undefined,
    source: article.source ?? undefined,
    savedAt: Number.isNaN(ts) ? Date.now() : ts,
  };
}

function toErrorText(err: unknown): string {
  if (err instanceof ApiError) {
    return `${err.message} [${err.status}]`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown auth error';
}

export function useAuth(baseUrl: string): AuthState {
  const [session, setSession] = useState<AuthStore | null>(readAuthStore);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const client = useMemo(() => api(baseUrl), [baseUrl]);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const token = search.get('token');
    if (!token) {
      return;
    }

    const hydrate = async () => {
      setLoading(true);
      setErrorText(null);
      try {
        const me = await client.me(token);
        setSessionAndPersist({ token, user: me.user });
      } catch (err) {
        setErrorText(toErrorText(err));
      } finally {
        setLoading(false);
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());
      }
    };

    void hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const setSessionAndPersist = (value: AuthStore | null) => {
    setSession(value);
    writeAuthStore(value);
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    setErrorText(null);
    try {
      const res = await client.login({ username, password });
      setSessionAndPersist({ token: res.token, user: res.user });
      return true;
    } catch (err) {
      setErrorText(toErrorText(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, password: string) => {
    setLoading(true);
    setErrorText(null);
    try {
      const res = await client.signup({ username, password });
      setSessionAndPersist({ token: res.token, user: res.user });
      return true;
    } catch (err) {
      setErrorText(toErrorText(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const oauthLogin = async (provider: OAuthProvider, _username: string) => {
    setLoading(true);
    setErrorText(null);
    try {
      const res = await client.oauthStart(
        provider,
        window.location.pathname || '/'
      );
      window.location.assign(res.url);
      return true;
    } catch (err) {
      setErrorText(toErrorText(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setErrorText(null);
    if (session?.token) {
      try {
        await client.logout(session.token);
      } catch {
        // ignore
      }
    }
    setSessionAndPersist(null);
  };

  const [savedArticles, setSavedArticles] = useState<LocalSavedArticle[]>(
    readLocalSavedArticles
  );

  useEffect(() => {
    let mounted = true;

    const token = session?.token;
    if (!token) {
      setSavedArticles(readLocalSavedArticles());
      return () => {
        mounted = false;
      };
    }

    const pullSaved = async () => {
      try {
        const res = await client.getSavedArticles(token);
        if (!mounted) return;
        setSavedArticles(
          res.articles
            .map(mapDbSavedArticle)
            .sort((a, b) => b.savedAt - a.savedAt)
        );
      } catch (err) {
        if (!mounted) return;
        setErrorText(toErrorText(err));
      }
    };

    void pullSaved();

    return () => {
      mounted = false;
    };
  }, [client, session?.token]);

  const saveArticleLocally = (
    article: Omit<LocalSavedArticle, 'id' | 'savedAt'>
  ) => {
    const token = session?.token;

    if (token) {
      if (savedArticles.some((a) => a.url === article.url)) {
        return;
      }

      void (async () => {
        try {
          const res = await client.saveArticle(token, {
            title: article.title,
            url: article.url,
            summary: article.summary,
            source: article.source,
          });
          setSavedArticles((prev) => {
            if (prev.some((a) => a.url === article.url)) return prev;
            const next = [mapDbSavedArticle(res.article), ...prev];
            return next.sort((a, b) => b.savedAt - a.savedAt);
          });
        } catch (err) {
          setErrorText(toErrorText(err));
        }
      })();
      return;
    }

    const newArticle: LocalSavedArticle = {
      ...article,
      id: crypto.randomUUID(),
      savedAt: Date.now(),
    };
    setSavedArticles((prev) => {
      const exists = prev.some((a) => a.url === article.url);
      if (exists) return prev;
      const next = [...prev, newArticle];
      writeLocalSavedArticles(next);
      return next;
    });
  };

  const removeLocalArticle = (id: string) => {
    const token = session?.token;
    const target = savedArticles.find((a) => a.id === id);
    if (!target) {
      return;
    }

    if (token && target.remoteId) {
      void (async () => {
        try {
          await client.deleteSavedArticle(token, target.remoteId as number);
          setSavedArticles((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
          setErrorText(toErrorText(err));
        }
      })();
      return;
    }

    setSavedArticles((prev) => {
      const next = prev.filter((a) => a.id !== id);
      writeLocalSavedArticles(next);
      return next;
    });
  };

  return {
    user: session?.user ?? null,
    token: session?.token ?? null,
    loading,
    errorText,
    savedArticles,
    validateFields,
    login,
    signup,
    oauthLogin,
    logout,
    saveArticleLocally,
    removeLocalArticle,
  };
}
