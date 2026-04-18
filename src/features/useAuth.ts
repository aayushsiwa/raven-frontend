import { useMemo } from 'react';

export function useAuth() {
  const authToken = useMemo(() => {
    try {
      const raw = localStorage.getItem('raven.auth.v1');
      if (!raw) return null;
      return JSON.parse(raw)?.token ?? null;
    } catch {
      return null;
    }
  }, []);

  return {
    authToken,
    isAuthMode: Boolean(authToken),
  };
}
