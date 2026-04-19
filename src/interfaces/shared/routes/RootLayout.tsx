import { Outlet } from '@tanstack/react-router';

import { AuthProvider } from '../../../features/auth/useAuth';
import type { FeedChoice } from '../../../features/feed/useFeedPreferences';
import { type ThemeState, useTheme } from '../../../features/theme/useTheme';
import type { ThemePresetId } from '../../../features/theme/useTheme';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { DEFAULT_BASE_URL } from '../../../lib/api';
import { MobileApp } from '../../mobile/MobileApp';
import { WebApp } from '../../web/WebApp';
import { AuthGate } from '../AuthGate';

const FEED_PREFS_KEY = 'raven.feed.preferences.v1';

export function RootLayout() {
  const isMobile = useIsMobile();
  const theme = useTheme();

  return (
    <AuthProvider baseUrl={DEFAULT_BASE_URL}>
      <RootLayoutContent isMobile={isMobile} theme={theme} />
    </AuthProvider>
  );
}

function RootLayoutContent({
  isMobile,
  theme,
}: {
  isMobile: boolean;
  theme: ThemeState;
}) {
  const applyOnboardingChoices = (choices: FeedChoice[]) => {
    localStorage.setItem(FEED_PREFS_KEY, JSON.stringify(choices));
  };

  const handleSelectOnboardingPreset = (presetId: ThemePresetId) => {
    theme.setPreset(presetId);
  };

  return (
    <AuthGate
      defaultBaseUrl={DEFAULT_BASE_URL}
      theme={theme}
      onSelectOnboardingPreset={handleSelectOnboardingPreset}
      onApplyOnboardingChoices={applyOnboardingChoices}
    >
      {isMobile ? (
        <MobileApp>
          <Outlet />
        </MobileApp>
      ) : (
        <WebApp>
          <Outlet />
        </WebApp>
      )}
    </AuthGate>
  );
}
