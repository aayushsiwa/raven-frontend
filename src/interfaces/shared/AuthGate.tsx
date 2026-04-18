import type { ReactNode } from 'react';

import type { AuthState } from '../../features/auth/useAuth';
import type { FeedChoice } from '../../features/feed/useFeedPreferences';
import type { ThemePresetId, ThemeState } from '../../features/theme/useTheme';
import { OnboardingPage } from '../mobile/OnboardingPage';

type AuthGateProps = {
  auth: AuthState;
  defaultBaseUrl: string;
  allowGuest: boolean;
  theme: ThemeState;
  onContinueAsGuest: () => void;
  onApplyOnboardingChoices: (choices: FeedChoice[]) => void;
  onSelectOnboardingPreset: (presetId: ThemePresetId) => void;
  children: ReactNode;
};

export function AuthGate({
  auth,
  defaultBaseUrl,
  allowGuest,
  theme,
  onContinueAsGuest,
  onApplyOnboardingChoices,
  onSelectOnboardingPreset,
  children,
}: AuthGateProps) {
  if (auth.user || allowGuest) {
    return <>{children}</>;
  }

  return (
    <OnboardingPage
      loading={auth.loading}
      errorText={auth.errorText}
      onLogin={auth.login}
      onSignup={auth.signup}
      onOAuth={auth.oauthLogin}
      validateFields={auth.validateFields}
      defaultBaseUrl={defaultBaseUrl}
      themePresets={theme.presets}
      activeThemePresetId={theme.presetId}
      onSelectThemePreset={onSelectOnboardingPreset}
      onApplyChoices={onApplyOnboardingChoices}
      onContinueAsGuest={onContinueAsGuest}
    />
  );
}
