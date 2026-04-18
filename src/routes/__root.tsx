import { createRootRoute } from '@tanstack/react-router';

import { RootLayout } from '../interfaces/shared/routes/RootLayout';

export const Route = createRootRoute({
  component: RootLayout,
});
