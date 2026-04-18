import { useFeedExperience } from '../../../features/feed/useFeedExperience';
import { useTheme } from '../../../features/theme/useTheme';
import type { ThemeVarKey } from '../../../features/theme/useTheme';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { DEFAULT_BASE_URL } from '../../../lib/api';
import { SettingsPage as MobileSettingsPage } from '../../mobile/SettingsPage';

export function SettingsRouteContent() {
  const isMobile = useIsMobile();
  const theme = useTheme();
  const feed = useFeedExperience(DEFAULT_BASE_URL);

  if (isMobile) {
    return <MobileSettingsPage feed={feed} theme={theme} />;
  }

  const colorKeys: { key: ThemeVarKey; label: string }[] = [
    { key: 'bg', label: 'Background' },
    { key: 'text', label: 'Text' },
    { key: 'muted', label: 'Muted' },
    { key: 'primary', label: 'Primary' },
    { key: 'tertiary', label: 'Accent' },
  ];

  // Desktop view: Just the settings part of the dashboard
  return (
    <div className="col-span-12 md:col-span-3">
      <div className="p-8 rounded-2xl bg-panel border border-panel-border backdrop-blur-3xl shadow-premium">
        <h3 className="font-serif italic text-[1.8rem] mb-6">Display</h3>
        <div className="grid gap-4">
          {colorKeys.map((item) => (
            <label key={item.key} className="flex justify-between items-center">
              <span className="text-[0.9rem] font-bold text-muted uppercase tracking-wider">
                {item.label}
              </span>
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-panel-border shadow-sm">
                <input
                  type="color"
                  value={theme.resolvedVars[item.key]}
                  onChange={(event) =>
                    theme.setVar(item.key, event.currentTarget.value)
                  }
                  className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer bg-none border-none"
                />
              </div>
            </label>
          ))}
          <button
            className="w-full mt-4 py-2.5 rounded-xl bg-surface-low text-muted font-bold text-[0.85rem] border border-panel-border hover:bg-surface-high transition-colors active:scale-[0.98]"
            onClick={theme.resetOverrides}
            type="button"
          >
            Reset Overrides
          </button>
        </div>
      </div>
    </div>
  );
}
