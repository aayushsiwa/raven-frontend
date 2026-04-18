import { createFileRoute } from '@tanstack/react-router';

import { DiscoverRouteContent } from '../interfaces/shared/routes/DiscoverRouteContent';

export const Route = createFileRoute('/discover')({
  component: DiscoverRouteContent,
});
