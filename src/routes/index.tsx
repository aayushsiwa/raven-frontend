import { createFileRoute } from '@tanstack/react-router';

import { FeedRouteContent } from '../interfaces/shared/routes/FeedRouteContent';

export const Route = createFileRoute('/')({
  component: FeedRouteContent,
});
