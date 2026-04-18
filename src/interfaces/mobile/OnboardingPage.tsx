import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  Globe,
  LogIn,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

import { InterestPicker } from '../../components/feed/InterestPicker';
import type { FieldValidation } from '../../features/auth/useAuth';
import { useFeedExperience } from '../../features/feed/useFeedExperience';
import type { FeedChoice } from '../../features/feed/useFeedPreferences';
import type { ThemePreset, ThemePresetId } from '../../features/theme/useTheme';

type AuthMode = 'login' | 'signup';
type OAuthProvider = 'google' | 'github' | 'discord';
type OnboardingStep = 'WELCOME' | 'AUTH' | 'THEME' | 'TOPICS';

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

const slideVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -500 : 500,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  }),
};

export function OnboardingPage(props: OnboardingPageProps) {
  const [step, setStep] = useState<OnboardingStep>('WELCOME');
  const [direction, setDirection] = useState(0);
  const [mode, setMode] = useState<AuthMode>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const feed = useFeedExperience(props.defaultBaseUrl);

  const validation = useMemo(
    () => props.validateFields(username, password, mode),
    [mode, password, props, username]
  );

  const canSubmit = !validation.username && !validation.password;

  const handleNext = (nextStep: OnboardingStep) => {
    setDirection(1);
    setStep(nextStep);
  };

  const handleBack = (prevStep: OnboardingStep) => {
    setDirection(-1);
    setStep(prevStep);
  };

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;

    let success = false;
    if (mode === 'login') {
      success = await props.onLogin(username, password);
    } else {
      success = await props.onSignup(username, password);
    }

    if (success) {
      handleNext('THEME');
    }
  };

  const finishOnboarding = () => {
    props.onApplyChoices(feed.savedChoices);
    props.onContinueAsGuest();
  };

  // Step Indicators
  const steps: OnboardingStep[] = ['WELCOME', 'AUTH', 'THEME', 'TOPICS'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="fixed inset-0 z-[100] bg-bg flex flex-col overflow-hidden">
      {/* Background Beams */}
      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden opacity-50">
        <div className="absolute w-[180px] h-[1000px] top-[-280px] left-[8%] rounded-full blur-[44px] opacity-[0.18] bg-primary animate-[drift_13s_ease-in-out_infinite]" />
        <div className="absolute w-[180px] h-[1000px] top-[-280px] left-[46%] rounded-full blur-[44px] opacity-[0.18] bg-blue-600 animate-[drift_13s_ease-in-out_infinite] delay-[-4s]" />
        <div className="absolute w-[180px] h-[1000px] top-[-280px] left-[82%] rounded-full blur-[44px] opacity-[0.18] bg-tertiary animate-[drift_13s_ease-in-out_infinite] delay-[-8s]" />
      </div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {steps.map((s, idx) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx <= currentStepIndex ? 'w-12 bg-primary' : 'w-8 bg-surface-high'}`}
          />
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-[480px] flex flex-col gap-6"
          >
            {step === 'WELCOME' && (
              <div className="text-center">
                <span className="text-[0.9rem] font-extrabold tracking-[0.3em] uppercase text-primary mb-4 block">
                  Raven
                </span>
                <h1 className="font-serif font-bold text-[clamp(2.5rem,8vw,4rem)] leading-[1.05] tracking-tight mb-2 text-text">
                  Curate signal.
                  <br />
                  Ignore noise.
                </h1>
                <p className="text-[1.1rem] text-muted mt-4 leading-relaxed">
                  The ultimate reading workspace for thinkers. Choose how you
                  want to experience your data.
                </p>
                <div className="flex flex-col gap-3 mt-8 w-full">
                  <button
                    className="w-full py-4 px-6 rounded-2xl bg-primary text-white font-bold text-[1rem] flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                    onClick={() => handleNext('AUTH')}
                  >
                    Get Started <Sparkles size={18} />
                  </button>
                  <button
                    className="w-full py-4 px-6 rounded-2xl bg-surface-low text-primary font-bold text-[1rem] flex items-center justify-center gap-2 border border-panel-border hover:bg-surface-high transition-all active:scale-[0.98]"
                    onClick={() => handleNext('THEME')}
                  >
                    Continue Offline <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 'AUTH' && (
              <div className="p-8 rounded-[1.5rem] bg-panel border border-panel-border backdrop-blur-3xl shadow-premium">
                <div className="mb-8">
                  <span className="uppercase tracking-[0.2em] text-[0.72rem] text-primary font-extrabold mb-2 block">
                    Cloud Sync
                  </span>
                  <h2 className="font-serif italic text-[2rem] leading-tight mb-2 text-text">
                    Set up your sanctuary
                  </h2>
                  <p className="text-muted text-[0.95rem]">
                    Sync your library, themes, and interests across all devices.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 bg-surface-low p-1.5 rounded-2xl border border-panel-border">
                  <button
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${mode === 'signup' ? 'bg-panel shadow-sm text-text border border-panel-border' : 'text-muted hover:text-text'}`}
                    onClick={() => setMode('signup')}
                    type="button"
                  >
                    <UserPlus size={16} /> Create
                  </button>
                  <button
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${mode === 'login' ? 'bg-panel shadow-sm text-text border border-panel-border' : 'text-muted hover:text-text'}`}
                    onClick={() => setMode('login')}
                    type="button"
                  >
                    <LogIn size={16} /> Login
                  </button>
                </div>

                <form className="grid gap-5" onSubmit={submitAuth}>
                  <label className="grid gap-2">
                    <span className="text-[0.85rem] font-bold text-muted uppercase tracking-wider">
                      Username
                    </span>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. raven_reader"
                      autoComplete="username"
                      className="w-full px-4 py-3 rounded-xl bg-surface-low border border-panel-border text-text focus:outline-primary/30 font-sans"
                    />
                    {submitted && validation.username && (
                      <small className="text-red-500 font-bold text-[0.75rem] font-sans">
                        {validation.username}
                      </small>
                    )}
                  </label>

                  <label className="grid gap-2">
                    <span className="text-[0.85rem] font-bold text-muted uppercase tracking-wider">
                      Password
                    </span>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="Minimum 8 characters"
                      autoComplete={
                        mode === 'login' ? 'current-password' : 'new-password'
                      }
                      className="w-full px-4 py-3 rounded-xl bg-surface-low border border-panel-border text-text focus:outline-primary/30 font-sans"
                    />
                    {submitted && validation.password && (
                      <small className="text-red-500 font-bold text-[0.75rem] font-sans">
                        {validation.password}
                      </small>
                    )}
                  </label>

                  <button
                    className="w-full py-4 px-6 rounded-2xl bg-primary text-white font-bold text-[1rem] shadow-lg disabled:opacity-50 transition-all active:scale-[0.98]"
                    type="submit"
                    disabled={props.loading || !canSubmit}
                  >
                    {props.loading
                      ? 'Processing...'
                      : mode === 'login'
                        ? 'Sign In'
                        : 'Create Account'}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-6 py-2">
                  <div className="flex-1 h-px bg-panel-border" />
                  <span className="text-[0.7rem] uppercase font-bold text-muted tracking-widest">
                    or continue with
                  </span>
                  <div className="flex-1 h-px bg-panel-border" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-low border border-panel-border font-bold text-[0.9rem] hover:bg-surface-high transition-colors text-text"
                    onClick={() => props.onOAuth('github')}
                  >
                    <Cpu size={20} /> GitHub
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-low border border-panel-border font-bold text-[0.9rem] hover:bg-surface-high transition-colors text-text"
                    onClick={() => props.onOAuth('google')}
                  >
                    <Globe size={20} /> Google
                  </button>
                </div>

                <button
                  className="w-full mt-6 py-3 rounded-xl bg-transparent text-muted font-bold text-[0.9rem] flex items-center justify-center gap-2 hover:bg-surface-high transition-colors"
                  onClick={() => handleBack('WELCOME')}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              </div>
            )}

            {step === 'THEME' && (
              <div className="text-center">
                <span className="uppercase tracking-[0.2em] text-[0.72rem] text-primary font-extrabold mb-2 block">
                  Personalization
                </span>
                <h2 className="font-serif italic text-[3rem] tracking-tight leading-tight mb-2 text-text">
                  Pick your vibe
                </h2>
                <p className="text-muted mb-8">
                  Choose a look that matches your reading style.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {props.themePresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 active:scale-95 ${props.activeThemePresetId === preset.id ? 'border-primary bg-panel shadow-xl translate-y-[-2px]' : 'border-transparent bg-surface-low hover:bg-surface-high'}`}
                      onClick={() => props.onSelectThemePreset(preset.id)}
                    >
                      <div
                        className="h-20 rounded-xl grid grid-cols-3 gap-1 p-2 shadow-inner"
                        style={{ background: preset.vars.bg }}
                      >
                        <div
                          className="rounded-sm"
                          style={{ background: preset.vars.primary }}
                        />
                        <div
                          className="rounded-sm"
                          style={{ background: preset.vars.tertiary }}
                        />
                        <div
                          className="rounded-sm"
                          style={{ background: preset.vars['surface-high'] }}
                        />
                      </div>
                      <span className="font-bold text-[0.9rem] text-text">
                        {preset.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 mt-10">
                  <button
                    className="w-full py-4 px-6 rounded-2xl bg-primary text-white font-bold text-[1rem] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    onClick={() => handleNext('TOPICS')}
                  >
                    Looks Good <ArrowRight size={18} />
                  </button>
                  <button
                    className="w-full py-3 px-6 rounded-2xl bg-transparent text-muted font-bold text-[0.9rem] flex items-center justify-center gap-2 hover:bg-surface-high transition-all"
                    onClick={() => handleBack('WELCOME')}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                </div>
              </div>
            )}

            {step === 'TOPICS' && (
              <div className="p-8 rounded-[1.5rem] bg-panel border border-panel-border backdrop-blur-3xl shadow-premium w-full max-w-[600px] mx-auto h-fit-content">
                <div className="mb-6">
                  <span className="uppercase tracking-[0.2em] text-[0.72rem] text-primary font-extrabold mb-2 block">
                    Curation
                  </span>
                  <h2 className="font-serif italic text-[2rem] leading-tight mb-2 text-text">
                    What sparks your mind?
                  </h2>
                  <p className="text-muted text-[0.95rem]">
                    Select at least 3 topics to personalize your signal.
                  </p>
                </div>

                <InterestPicker
                  feedTree={feed.feedTree}
                  savedChoices={feed.savedChoices}
                  mapRefreshing={feed.mapRefreshing}
                  onAddChoice={feed.addChoice}
                  onRemoveChoice={feed.removeChoice}
                  onClearChoices={feed.clearChoices}
                  className="p-0 max-h-[50vh]"
                />

                <div className="flex flex-col gap-3 mt-8">
                  <button
                    className="w-full py-4 px-6 rounded-2xl bg-primary text-white font-bold text-[1rem] shadow-lg disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center"
                    onClick={finishOnboarding}
                    disabled={feed.savedChoices.length < 3}
                  >
                    {feed.savedChoices.length < 3
                      ? `Select ${3 - feed.savedChoices.length} more...`
                      : 'Enter Raven'}
                  </button>
                  <button
                    className="w-full py-3 px-6 rounded-2xl bg-transparent text-muted font-bold text-[0.9rem] flex items-center justify-center gap-2 hover:bg-surface-high transition-all"
                    onClick={() => handleBack('THEME')}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {props.errorText && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]">
          <p className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-[0.85rem] shadow-xl animate-in fade-in slide-in-from-bottom-2">
            {props.errorText}
          </p>
        </div>
      )}
    </div>
  );
}
