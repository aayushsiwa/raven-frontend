import { type FormEvent, useMemo, useState } from 'react';

import { InterestPicker } from '../../components/feed/InterestPicker';
import type { FieldValidation } from '../../features/auth/useAuth';
import { useFeedExperience } from '../../features/feed/useFeedExperience';
import type { FeedChoice } from '../../features/feed/useFeedPreferences';
import type { ThemePreset, ThemePresetId } from '../../features/theme/useTheme';

type AuthMode = 'login' | 'signup';
type OAuthProvider = 'google' | 'github' | 'discord';
type OnboardingStep = 'account' | 'preferences';

type OnboardingPageProps = {
  defaultBaseUrl: string;
  loading: boolean;
  errorText: string | null;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onSignup: (username: string, password: string) => Promise<boolean>;
  onOAuth: (provider: OAuthProvider) => Promise<boolean>;
  validateFields: (
    username: string,
    password: string,
    mode: AuthMode
  ) => FieldValidation;
  themePresets: ThemePreset[];
  activeThemePresetId: ThemePresetId;
  onSelectThemePreset: (presetId: ThemePresetId) => void;
  onApplyChoices: (choices: FeedChoice[]) => void;
  onContinueAsGuest: () => void;
};

export function OnboardingPage(props: OnboardingPageProps) {
  const [step, setStep] = useState<OnboardingStep>('account');
  const [showGuestModal, setShowGuestModal] = useState(false);

  const [mode, setMode] = useState<AuthMode>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const feed = useFeedExperience(props.defaultBaseUrl);
  const isPreferencesStep = step === 'preferences';

  const validation = useMemo(
    () => props.validateFields(username, password, mode),
    [mode, password, props, username]
  );
  const canSubmit = !validation.username && !validation.password;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!canSubmit) {
      return;
    }

    if (mode === 'login') {
      await props.onLogin(username, password);
      return;
    }
    await props.onSignup(username, password);
  };

  const applyPreferencesAndContinue = () => {
    props.onApplyChoices(feed.savedChoices);
    props.onContinueAsGuest();
  };

  return (
    <section className="onboarding-wrap">
      <div className="onboarding-card">
        <p className="mobile-eyebrow onboarding-brand">The Collector</p>
        <h1>Curate signal. Ignore noise.</h1>
        <p className="muted">
          Create account for cloud sync, or continue local mode. Settings always
          available later.
        </p>

        <div className="onboarding-stepper">
          <button
            className={`btn ghost ${!isPreferencesStep ? 'onboarding-step-active' : ''}`.trim()}
            onClick={() => setStep('account')}
            type="button"
          >
            Account
          </button>
          <button
            className={`btn ghost ${isPreferencesStep ? 'onboarding-step-active' : ''}`.trim()}
            onClick={() => setStep('preferences')}
            type="button"
          >
            Preferences
          </button>
        </div>

        <div className="onboarding-dot-row" aria-hidden="true">
          <span className={`onboarding-dot ${!isPreferencesStep ? 'active' : ''}`} />
          <span className={`onboarding-dot ${isPreferencesStep ? 'active' : ''}`} />
        </div>

        <div className="onboarding-stage">
          <div
            className={`onboarding-track ${isPreferencesStep ? 'is-preferences' : 'is-account'}`.trim()}
          >
            <section className="onboarding-screen" aria-hidden={isPreferencesStep}>
              <div className="onboarding-screen-head">
                <h2>Account setup</h2>
                <p className="muted">Sign in for cloud sync, or skip to local mode.</p>
              </div>

              <div className="onboarding-switch">
                <button
                  className={
                    mode === 'signup' ? 'btn onboarding-primary' : 'btn ghost'
                  }
                  onClick={() => setMode('signup')}
                  type="button"
                >
                  Sign up
                </button>
                <button
                  className={
                    mode === 'login' ? 'btn onboarding-primary' : 'btn ghost'
                  }
                  onClick={() => setMode('login')}
                  type="button"
                >
                  Log in
                </button>
              </div>

              <form className="onboarding-form" onSubmit={submit}>
                <label>
                  Username
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="neo_reader"
                    autoComplete="username"
                  />
                  {submitted && validation.username ? (
                    <small className="field-error">{validation.username}</small>
                  ) : null}
                </label>

                {mode === 'signup' ? (
                  <small className="muted">
                    Use uppercase, lowercase, digit, symbol in password.
                  </small>
                ) : null}

                <label>
                  Password
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="Minimum 8 chars"
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                  />
                  {submitted && validation.password ? (
                    <small className="field-error">{validation.password}</small>
                  ) : null}
                </label>

                <button
                  className="btn onboarding-primary"
                  type="submit"
                  disabled={props.loading || !canSubmit}
                >
                  {mode === 'login' ? 'Log in' : 'Create account'}
                </button>
              </form>

              <div className="oauth-grid">
                <button
                  type="button"
                  className="btn ghost onboarding-oauth"
                  disabled={props.loading}
                  onClick={() => {
                    void props.onOAuth('google');
                  }}
                >
                  Continue with Google
                </button>
                <button
                  type="button"
                  className="btn ghost onboarding-oauth"
                  disabled={props.loading}
                  onClick={() => {
                    void props.onOAuth('github');
                  }}
                >
                  Continue with GitHub
                </button>
                <button
                  type="button"
                  className="btn ghost onboarding-oauth"
                  disabled={props.loading}
                  onClick={() => {
                    void props.onOAuth('discord');
                  }}
                >
                  Continue with Discord
                </button>
              </div>

              <div className="onboarding-aux-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setStep('preferences')}
                >
                  Next: preferences
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setShowGuestModal(true)}
                >
                  Skip for now
                </button>
              </div>
            </section>

            <section className="onboarding-screen" aria-hidden={!isPreferencesStep}>
              <div className="onboarding-screen-head">
                <h2>Choose preferences</h2>
                <p className="muted">All controls available later in Settings.</p>
              </div>

              <section className="onboarding-preferences">
                <div className="settings-section-body theme-presets-grid">
                  {props.themePresets.map((preset) => (
                    <button
                      key={preset.id}
                      className={`btn ghost theme-preset-btn ${props.activeThemePresetId === preset.id ? 'active' : ''}`.trim()}
                      onClick={() => props.onSelectThemePreset(preset.id)}
                      type="button"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <InterestPicker
                  feedTree={feed.feedTree}
                  savedChoices={feed.savedChoices}
                  mapRefreshing={feed.mapRefreshing}
                  providersErrorText={feed.providersErrorText}
                  feedTreeErrorText={feed.feedTreeErrorText}
                  isAuthMode={false}
                  preferencesSyncing={false}
                  preferencesErrorText={null}
                  onAddChoice={feed.addChoice}
                  onRemoveChoice={feed.removeChoice}
                  onClearChoices={feed.clearChoices}
                />

                <div className="onboarding-aux-actions">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setStep('account')}
                  >
                    Back to account
                  </button>
                  <button
                    type="button"
                    className="btn onboarding-primary"
                    onClick={applyPreferencesAndContinue}
                  >
                    Continue in local mode
                  </button>
                </div>
              </section>
            </section>
          </div>
        </div>

        {props.errorText ? <p className="error">{props.errorText}</p> : null}
      </div>

      {showGuestModal ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>Continue without account?</h2>
            <p className="muted">
              App still works. Feed choices, saved stories, theme stay local on
              this device. No cloud sync.
            </p>
            <p className="muted">
              You can sign in later from onboarding. Settings always available.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => setShowGuestModal(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn onboarding-primary"
                onClick={props.onContinueAsGuest}
              >
                Continue local
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
