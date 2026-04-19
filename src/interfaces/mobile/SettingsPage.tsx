import { LogOut } from 'lucide-react';

import { InterestPicker } from '../../components/feed/InterestPicker';
import { useAuth } from '../../features/auth/useAuth';
import type { FeedChoice } from '../../features/feed/useFeedPreferences';
import type { ThemeState, ThemeVarKey } from '../../features/theme/useTheme';

type SettingsPageProps = {
  feed: {
    feedTree: Record<string, Record<string, string[]>>;
    savedChoices: FeedChoice[];
    mapRefreshing: boolean;
    providersErrorText?: string | null;
    feedTreeErrorText?: string | null;
    isAuthMode: boolean;
    preferencesSyncing: boolean;
    preferencesErrorText: string | null;
    addChoice: (choice: FeedChoice) => void;
    removeChoice: (choice: FeedChoice) => void;
    clearChoices: () => void;
  };
  theme: ThemeState;
};

export function SettingsPage(props: SettingsPageProps) {
  const auth = useAuth();
  const colorKeys: { key: ThemeVarKey; label: string }[] = [
    { key: 'bg', label: 'Background' },
    { key: 'text', label: 'Text' },
    { key: 'muted', label: 'Muted' },
    { key: 'primary', label: 'Primary' },
    { key: 'tertiary', label: 'Accent' },
  ];

  return (
    <section className="flex flex-col min-h-fit gap-4 pt-5 pb-5 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex flex-col gap-4">
        <details
          className="rounded-2xl bg-panel border border-panel-border backdrop-blur-3xl shadow-sm overflow-hidden group"
          // open
        >
          <summary className="px-5 py-4 font-semibold cursor-pointer list-none flex justify-between items-center hover:bg-white/5 transition-colors">
            Interests{' '}
            <span className="uppercase tracking-[0.14em] text-[0.7rem] text-primary font-bold opacity-50">
              Tuning
            </span>
          </summary>
          <div className="px-1 pb-4">
            <InterestPicker
              feedTree={props.feed.feedTree}
              savedChoices={props.feed.savedChoices}
              mapRefreshing={props.feed.mapRefreshing}
              isAuthMode={props.feed.isAuthMode}
              preferencesSyncing={props.feed.preferencesSyncing}
              preferencesErrorText={props.feed.preferencesErrorText}
              onAddChoice={props.feed.addChoice}
              onRemoveChoice={props.feed.removeChoice}
              onClearChoices={props.feed.clearChoices}
            />
          </div>
        </details>

        <details
          className="rounded-2xl bg-panel border border-panel-border backdrop-blur-3xl shadow-sm overflow-hidden group"
          // open
        >
          <summary className="px-5 py-4 font-semibold cursor-pointer list-none flex justify-between items-center hover:bg-white/5 transition-colors">
            Theme Presets{' '}
            <span className="uppercase tracking-[0.14em] text-[0.7rem] text-primary font-bold opacity-50">
              Visuals
            </span>
          </summary>
          <div className="p-5 grid grid-cols-2 gap-3">
            {props.theme.presets.map((preset) => (
              <button
                key={preset.id}
                className={`h-14 rounded-xl font-semibold text-[0.9rem] transition-all active:scale-95 flex items-center justify-center border shadow-sm ${
                  props.theme.presetId === preset.id
                    ? 'bg-primary text-white border-primary shadow-lg ring-2 ring-primary/20'
                    : 'bg-surface-low text-text border-panel-border hover:bg-surface-high'
                }`}
                onClick={() => props.theme.setPreset(preset.id)}
                type="button"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </details>

        <details className="rounded-2xl bg-panel border border-panel-border backdrop-blur-3xl shadow-sm overflow-hidden group">
          <summary className="px-5 py-4 font-semibold cursor-pointer list-none flex justify-between items-center hover:bg-white/5 transition-colors">
            Fine-tune Colors{' '}
            <span className="uppercase tracking-[0.14em] text-[0.7rem] text-primary font-bold opacity-50">
              Expert
            </span>
          </summary>
          <div className="p-5 grid gap-4">
            {colorKeys.map((item) => (
              <label
                key={item.key}
                className="flex justify-between items-center"
              >
                <span className="text-[0.95rem] font-medium text-text">
                  {item.label}
                </span>
                <div className="relative w-12 h-8 rounded-lg overflow-hidden border border-panel-border">
                  <input
                    type="color"
                    value={props.theme.resolvedVars[item.key]}
                    onChange={(event) =>
                      props.theme.setVar(item.key, event.currentTarget.value)
                    }
                    className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer bg-none border-none"
                  />
                </div>
              </label>
            ))}
            <button
              className="w-full mt-2 py-3 rounded-xl bg-surface-high/50 text-muted font-bold text-[0.85rem] border border-panel-border hover:bg-surface-high transition-colors active:scale-[0.98]"
              onClick={props.theme.resetOverrides}
              type="button"
            >
              Reset Custom Colors
            </button>
          </div>
        </details>
      </div>
      <div className="mt-auto pt-4">
        <button
          onClick={auth.logout}
          type="button"
          className="flex items-center justify-center gap-2
          w-full py-3 rounded-xl font-semibold text-[0.9rem]
          border border-panel-border
          bg-surface-low text-text
          hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/40
          active:scale-[0.98] transition-all shadow-sm"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </section>
  );
}
