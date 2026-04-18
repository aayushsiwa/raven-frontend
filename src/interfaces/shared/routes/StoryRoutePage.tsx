import { useSearch } from '@tanstack/react-router';

import { StoryDetailRouteContent } from './StoryDetailRouteContent';

export function StoryRoutePage() {
  const search = useSearch({ from: '/story' });
  return <StoryDetailRouteContent {...search} />;
}
