import { createContext } from 'react';

import type { AuthUser } from '../../lib/api';

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

export type ValidationMode = 'login' | 'signup';
export type OAuthProvider = 'google' | 'github' | 'discord';

export type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  errorText: string | null;
  allowGuest: boolean;
  savedArticles: LocalSavedArticle[];
  isAuthMode: boolean;
  isGuestMode: boolean;
  validateFields: (
    username: string,
    password: string,
    mode: ValidationMode
  ) => FieldValidation;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  oauthLogin: (provider: OAuthProvider) => Promise<boolean>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  saveArticleLocally: (
    article: Omit<LocalSavedArticle, 'id' | 'savedAt'>
  ) => void;
  removeLocalArticle: (id: string) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
