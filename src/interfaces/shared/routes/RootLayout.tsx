import { Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useEffect, useState } from 'react';

import { useAuth } from '../../../features/auth/useAuth';
import type { FeedChoice } from '../../../features/feed/useFeedPreferences';
import { useTheme } from '../../../features/theme/useTheme';
import type { ThemePresetId } from '../../../features/theme/useTheme';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { MobileApp } from '../../mobile/MobileApp';
import { WebApp } from '../../web/WebApp';
import { AuthGate } from '../AuthGate';

const DEFAULT_BASE_URL = 'http://localhost:8080';
const GUEST_MODE_KEY = 'raven.guest.mode.v1';
const FEED_PREFS_KEY = 'raven.feed.preferences.v1';

function readGuestMode(): boolean {
  try {
    return localStorage.getItem(GUEST_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

export function RootLayout() {
  const auth = useAuth(DEFAULT_BASE_URL);
  const theme = useTheme();
  const [allowGuest, setAllowGuest] = useState<boolean>(readGuestMode);
  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      localStorage.setItem(GUEST_MODE_KEY, allowGuest ? '1' : '0');
    } catch {
      return;
    }
  }, [allowGuest]);

  const allowGuestMode = !auth.user && allowGuest;

  const applyOnboardingChoices = (choices: FeedChoice[]) => {
    localStorage.setItem(FEED_PREFS_KEY, JSON.stringify(choices));
  };

  const handleSelectOnboardingPreset = (presetId: ThemePresetId) => {
    theme.setPreset(presetId);
  };

  const handleContinueAsGuest = () => {
    setAllowGuest(true);
  };

  const handleLogout = async () => {
    // 1. Handle auth service logout (clears token/user and notifies server)
    await auth.logout();

    // 2. Comprehensive local storage wipe for all app keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('raven.')) {
        localStorage.removeItem(key);
      }
    });

    // 3. Reset in-memory states to factory defaults
    setAllowGuest(false);
    theme.setPreset('dawn');
    theme.resetOverrides();
  };

  return (
    <AuthGate
      auth={auth}
      defaultBaseUrl={DEFAULT_BASE_URL}
      allowGuest={allowGuestMode}
      theme={theme}
      onContinueAsGuest={handleContinueAsGuest}
      onApplyOnboardingChoices={applyOnboardingChoices}
      onSelectOnboardingPreset={handleSelectOnboardingPreset}
    >
      {isMobile ? (
        <MobileApp onLogout={handleLogout}>
          <Outlet />
        </MobileApp>
      ) : (
        <WebApp
          defaultBaseUrl={DEFAULT_BASE_URL}
          onLogout={handleLogout}
          savedArticles={auth.savedArticles}
          onSaveArticle={auth.saveArticleLocally}
          onRemoveSavedArticle={auth.removeLocalArticle}
          theme={theme}
        >
          <Outlet />
        </WebApp>
      )}
      <TanStackRouterDevtools position="top-right" />
    </AuthGate>
  );
}
