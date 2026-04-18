import { useEffect, useMemo, useState } from 'react';

import { ApiError, type RssEntry, type api } from '../../lib/api';

const FEED_PREFS_KEY = 'raven.feed.preferences.v1';
const FEED_PREFS_MIGRATED_KEY = 'raven.feed.preferences.migrated.v1';

export type FeedChoice = {
  provider: string;
  category: string;
  topic: string;
};

export type FeedStory = {
  provider: string;
  category: string;
  topic: string;
  entry: RssEntry;
  rankTime: number;
};

export function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    return `${err.message} [${err.status}]`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown error';
}

function normalizeChoice(value: unknown): FeedChoice | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const item = value as Record<string, unknown>;
  if (
    typeof item.provider !== 'string' ||
    typeof item.category !== 'string' ||
    typeof item.topic !== 'string'
  ) {
    return null;
  }

  const provider = item.provider.toLowerCase();
  const category = item.category.toLowerCase();
  const topic = item.topic.toLowerCase();
  if (!provider || !category || !topic) {
    return null;
  }

  return { provider, category, topic };
}

function readSavedChoices(): FeedChoice[] {
  try {
    const raw = localStorage.getItem(FEED_PREFS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeChoice)
      .filter((choice): choice is FeedChoice => Boolean(choice));
  } catch {
    return [];
  }
}

function saveLocalChoices(savedChoices: FeedChoice[]) {
  localStorage.setItem(FEED_PREFS_KEY, JSON.stringify(savedChoices));
}

export function useFeedPreferences(
  client: ReturnType<typeof api>,
  authToken: string | null,
  isAuthMode: boolean
) {
  const [savedChoices, setSavedChoices] =
    useState<FeedChoice[]>(readSavedChoices);
  const [preferencesSyncing, setPreferencesSyncing] = useState(false);
  const [preferencesErrorText, setPreferencesErrorText] = useState<
    string | null
  >(null);
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  const preferencesLoaded = useMemo(
    () => (!isAuthMode ? true : remoteLoaded),
    [isAuthMode, remoteLoaded]
  );

  useEffect(() => {
    if (isAuthMode) {
      return;
    }
    saveLocalChoices(savedChoices);
  }, [isAuthMode, savedChoices]);

  useEffect(() => {
    if (!isAuthMode || !authToken) {
      return;
    }

    let mounted = true;
    const pull = async () => {
      setPreferencesSyncing(true);
      setPreferencesErrorText(null);
      try {
        const migrationDone =
          localStorage.getItem(FEED_PREFS_MIGRATED_KEY) === '1';
        const response = migrationDone
          ? await client.getUserFeedPreferences(authToken)
          : await client.syncLocalPreferencesOnce(
              authToken,
              readSavedChoices()
            );

        if (!migrationDone) {
          localStorage.setItem(FEED_PREFS_MIGRATED_KEY, '1');
        }

        if (!mounted) {
          return;
        }

        setSavedChoices(response.choices);
      } catch (err) {
        if (mounted) {
          setPreferencesErrorText(errorText(err));
        }
      } finally {
        if (mounted) {
          setRemoteLoaded(true);
          setPreferencesSyncing(false);
        }
      }
    };

    void pull();
    return () => {
      mounted = false;
    };
  }, [authToken, client, isAuthMode]);

  useEffect(() => {
    if (!isAuthMode || !authToken || !preferencesLoaded) {
      return;
    }

    const sync = async () => {
      setPreferencesSyncing(true);
      setPreferencesErrorText(null);
      try {
        await client.putUserFeedPreferences(authToken, savedChoices);
      } catch (err) {
        setPreferencesErrorText(errorText(err));
      } finally {
        setPreferencesSyncing(false);
      }
    };

    void sync();
  }, [authToken, client, isAuthMode, preferencesLoaded, savedChoices]);

  const addChoice = (choice: FeedChoice) => {
    setSavedChoices((prev) => {
      const exists = prev.some(
        (item) =>
          item.provider === choice.provider &&
          item.category === choice.category &&
          item.topic === choice.topic
      );
      return exists ? prev : [...prev, choice];
    });
  };

  const removeChoice = (target: FeedChoice) => {
    setSavedChoices((prev) =>
      prev.filter(
        (item) =>
          !(
            item.provider === target.provider &&
            item.category === target.category &&
            item.topic === target.topic
          )
      )
    );
  };

  const clearChoices = () => {
    setSavedChoices([]);
  };

  return {
    savedChoices,
    setSavedChoices,
    preferencesSyncing,
    preferencesErrorText,
    addChoice,
    removeChoice,
    clearChoices,
  };
}
