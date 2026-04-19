import React, { useEffect, useMemo, useState } from 'react';

import { ApiError, type AuthUser, type SavedArticle, api } from '../../lib/api';
import { useTheme } from '../theme/useTheme';
import {
  AuthContext,
  type AuthContextType,
  type FieldValidation,
  type LocalSavedArticle,
  type OAuthProvider,
  type ValidationMode,
} from './context';

const AUTH_STORE_KEY = 'raven.auth.v1';
const GUEST_MODE_KEY = 'raven.guest.mode.v1';
const SAVED_ARTICLES_KEY = 'raven.saved.articles.v1';
const AUTH_TOKEN_COOKIE = 'raven_auth_token';

type AuthStore = {
  token: string;
  user: AuthUser;
};

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

function validateFieldsInternal(
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
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthStore;
    const token = getCookie(AUTH_TOKEN_COOKIE);
    if (!token || !parsed?.user) return null;
    parsed.token = token;
    return parsed;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  const target = `${name}=`;
  const parts = document.cookie.split(';');
  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (part.startsWith(target)) {
      return decodeURIComponent(part.slice(target.length));
    }
  }
  return null;
}

function clearCookie(name: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
}

function readGuestMode(): boolean {
  try {
    return localStorage.getItem(GUEST_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

function readLocalSavedArticles(): LocalSavedArticle[] {
  try {
    const raw = localStorage.getItem(SAVED_ARTICLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalSavedArticle[]) : [];
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
  if (err instanceof ApiError) return `${err.message} [${err.status}]`;
  if (err instanceof Error) return err.message;
  return 'Unknown auth error';
}

export function AuthProvider({
  children,
  baseUrl,
}: {
  children: React.ReactNode;
  baseUrl: string;
}) {
  const [session, setSession] = useState<AuthStore | null>(readAuthStore);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [allowGuest, setAllowGuest] = useState<boolean>(readGuestMode);
  const [savedArticles, setSavedArticles] = useState<LocalSavedArticle[]>(
    readLocalSavedArticles
  );

  const theme = useTheme();
  const client = useMemo(() => api(baseUrl), [baseUrl]);

  // Persist session
  useEffect(() => {
    if (session) {
      localStorage.setItem(
        AUTH_STORE_KEY,
        JSON.stringify({
          user: session.user,
        })
      );
      setCookie(AUTH_TOKEN_COOKIE, session.token, 60 * 60 * 24 * 7);
    } else {
      localStorage.removeItem(AUTH_STORE_KEY);
      clearCookie(AUTH_TOKEN_COOKIE);
    }
  }, [session]);

  // Persist guest mode
  useEffect(() => {
    localStorage.setItem(GUEST_MODE_KEY, allowGuest ? '1' : '0');
  }, [allowGuest]);

  // Sync saved articles with DB if logged in
  useEffect(() => {
    let mounted = true;
    const token = session?.token;
    if (!token) {
      return;
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

  // Handle OAuth callback hydration from URL
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) return;

    const hydrate = async () => {
      setLoading(true);
      setErrorText(null);
      try {
        const me = await client.me(token);
        setSession({ token, user: me.user });
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
  }, [client]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setErrorText(null);
    try {
      const res = await client.login({ username, password });
      setSession({ token: res.token, user: res.user });
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
      setSession({ token: res.token, user: res.user });
      return true;
    } catch (err) {
      setErrorText(toErrorText(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const oauthLogin = async (provider: OAuthProvider) => {
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

    // Reset all state
    setSession(null);
    setAllowGuest(false);
    setSavedArticles([]);

    // Clear raven keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('raven.')) {
        localStorage.removeItem(key);
      }
    });
    clearCookie(AUTH_TOKEN_COOKIE);

    // Reset theme via theme hook (accessed in provider)
    theme.setPreset('dawn');
    theme.resetOverrides();
  };

  const continueAsGuest = () => setAllowGuest(true);

  const saveArticleLocally = (
    article: Omit<LocalSavedArticle, 'id' | 'savedAt'>
  ) => {
    const token = session?.token;

    if (token) {
      if (savedArticles.some((a) => a.url === article.url)) return;

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

    // Guest save
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
    if (!target) return;

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

    // Guest remove
    setSavedArticles((prev) => {
      const next = prev.filter((a) => a.id !== id);
      writeLocalSavedArticles(next);
      return next;
    });
  };

  const value: AuthContextType = {
    user: session?.user ?? null,
    token: session?.token ?? null,
    loading,
    errorText,
    allowGuest,
    savedArticles,
    isAuthMode: !!session?.token,
    isGuestMode: !session?.token && allowGuest,
    validateFields: validateFieldsInternal,
    login,
    signup,
    oauthLogin,
    logout,
    continueAsGuest,
    saveArticleLocally,
    removeLocalArticle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
