import { useEffect, useState } from 'react';

import { useAuth } from './features/auth/useAuth';
import type { FeedChoice } from './features/feed/useFeedPreferences';
import { useTheme } from './features/theme/useTheme';
import type { ThemePresetId } from './features/theme/useTheme';
import { MobileApp } from './interfaces/mobile/MobileApp';
import { AuthGate } from './interfaces/shared/AuthGate';
import { WebApp } from './interfaces/web/WebApp';

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

function App() {
  const auth = useAuth(DEFAULT_BASE_URL);
  const theme = useTheme();
  const [allowGuest, setAllowGuest] = useState<boolean>(readGuestMode);

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

  return (
    <>
      <div className="web-shell">
        <AuthGate
          auth={auth}
          defaultBaseUrl={DEFAULT_BASE_URL}
          allowGuest={allowGuestMode}
          theme={theme}
          onContinueAsGuest={handleContinueAsGuest}
          onApplyOnboardingChoices={applyOnboardingChoices}
          onSelectOnboardingPreset={handleSelectOnboardingPreset}
        >
          <WebApp
            defaultBaseUrl={DEFAULT_BASE_URL}
            onLogout={auth.logout}
            savedArticles={auth.savedArticles}
            onSaveArticle={auth.saveArticleLocally}
            onRemoveSavedArticle={auth.removeLocalArticle}
            theme={theme}
          />
        </AuthGate>
      </div>
      <div className="mobile-shell-wrap">
        <AuthGate
          auth={auth}
          defaultBaseUrl={DEFAULT_BASE_URL}
          allowGuest={allowGuestMode}
          theme={theme}
          onContinueAsGuest={handleContinueAsGuest}
          onApplyOnboardingChoices={applyOnboardingChoices}
          onSelectOnboardingPreset={handleSelectOnboardingPreset}
        >
          <MobileApp
            defaultBaseUrl={DEFAULT_BASE_URL}
            onLogout={auth.logout}
            savedArticles={auth.savedArticles}
            onSaveArticle={auth.saveArticleLocally}
            onRemoveSavedArticle={auth.removeLocalArticle}
            theme={theme}
          />
        </AuthGate>
      </div>
    </>
  );
}

export default App;
