import { useState } from 'react';

import { DEFAULT_BASE_URL } from '../lib/api';
import { normalizeBaseUrl, toInt } from '../lib/utils';

export function useBaseUrl(defaultBaseUrl: string = DEFAULT_BASE_URL) {
  const envUrl = import.meta.env.VITE_API_URL || defaultBaseUrl;

  const [baseUrlInput, setBaseUrlInput] = useState(envUrl);
  const [baseUrl, setBaseUrl] = useState(envUrl);
  const [limitInput, setLimitInput] = useState('12');

  const limit = toInt(limitInput, 12);

  const applyBaseUrl = () => {
    setBaseUrl(normalizeBaseUrl(baseUrlInput));
  };

  return {
    baseUrlInput,
    baseUrl,
    limitInput,
    limit,
    setBaseUrlInput,
    setLimitInput,
    applyBaseUrl,
  };
}
