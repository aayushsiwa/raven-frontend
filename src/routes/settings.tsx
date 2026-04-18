import { createFileRoute } from '@tanstack/react-router';

import { SettingsRouteContent } from '../interfaces/shared/routes/SettingsRouteContent';

export const Route = createFileRoute('/settings')({
  component: SettingsRouteContent,
});
