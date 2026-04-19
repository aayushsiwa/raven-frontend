import type { ReactNode } from 'react';

import { useAuth } from '../../features/auth/useAuth';
import type { FeedChoice } from '../../features/feed/useFeedPreferences';
import type { ThemePresetId, ThemeState } from '../../features/theme/useTheme';
import { OnboardingPage } from '../mobile/OnboardingPage';

type AuthGateProps = {
  defaultBaseUrl: string;
  theme: ThemeState;
  onApplyOnboardingChoices: (choices: FeedChoice[]) => void;
  onSelectOnboardingPreset: (presetId: ThemePresetId) => void;
  children: ReactNode;
};

export function AuthGate({
  defaultBaseUrl,
  theme,
  onApplyOnboardingChoices,
  onSelectOnboardingPreset,
  children,
}: AuthGateProps) {
  const auth = useAuth();

  if ((auth.user && !auth.needsOnboarding) || auth.allowGuest) {
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
      onContinueAsGuest={() => {
        auth.completeOnboarding();
        auth.continueAsGuest();
      }}
    />
  );
}
