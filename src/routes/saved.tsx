import { createFileRoute } from '@tanstack/react-router';

import { SavedRouteContent } from '../interfaces/shared/routes/SavedRouteContent';

export const Route = createFileRoute('/saved')({
  component: SavedRouteContent,
});
