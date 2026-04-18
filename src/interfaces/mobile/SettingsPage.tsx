import { InterestPicker } from '../../components/feed/InterestPicker';
import type { FeedChoice } from '../../features/feed/useFeedPreferences';
import type { ThemeState, ThemeVarKey } from '../../features/theme/useTheme';

type SettingsPageProps = {
  feed: {
    feedTree: Record<string, Record<string, string[]>>;
    savedChoices: FeedChoice[];
    mapRefreshing: boolean;
    providersErrorText: string | null;
    feedTreeErrorText: string | null;
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
  const colorKeys: { key: ThemeVarKey; label: string }[] = [
    { key: 'bg', label: 'Background' },
    { key: 'text', label: 'Text' },
    { key: 'muted', label: 'Muted' },
    { key: 'primary', label: 'Primary' },
    { key: 'tertiary', label: 'Accent' },
  ];

  return (
    <section className="settings-accordion">
      <details className="settings-section" open>
        <summary>Interests</summary>
        <div className="settings-section-body">
          <InterestPicker
            feedTree={props.feed.feedTree}
            savedChoices={props.feed.savedChoices}
            mapRefreshing={props.feed.mapRefreshing}
            providersErrorText={props.feed.providersErrorText}
            feedTreeErrorText={props.feed.feedTreeErrorText}
            isAuthMode={props.feed.isAuthMode}
            preferencesSyncing={props.feed.preferencesSyncing}
            preferencesErrorText={props.feed.preferencesErrorText}
            onAddChoice={props.feed.addChoice}
            onRemoveChoice={props.feed.removeChoice}
            onClearChoices={props.feed.clearChoices}
          />
        </div>
      </details>

      <details className="settings-section" open>
        <summary>Theme Presets</summary>
        <div className="settings-section-body theme-presets-grid">
          {props.theme.presets.map((preset) => (
            <button
              key={preset.id}
              className={`btn ghost theme-preset-btn ${props.theme.presetId === preset.id ? 'active' : ''}`.trim()}
              onClick={() => props.theme.setPreset(preset.id)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </details>

      <details className="settings-section">
        <summary>Theme Colors</summary>
        <div className="settings-section-body theme-vars-grid">
          {colorKeys.map((item) => (
            <label key={item.key} className="theme-var-field">
              <span>{item.label}</span>
              <input
                type="color"
                value={props.theme.resolvedVars[item.key]}
                onChange={(event) =>
                  props.theme.setVar(item.key, event.currentTarget.value)
                }
              />
            </label>
          ))}
          <button
            className="btn ghost"
            onClick={props.theme.resetOverrides}
            type="button"
          >
            Reset custom colors
          </button>
        </div>
      </details>
    </section>
  );
}
