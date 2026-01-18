'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGameHistory } from '@/lib/firestore-game';
import type { StoredGameState } from '@/lib/types';

interface UseGameHistoryResult {
  games: StoredGameState[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useGameHistory(
  userId: string | null,
  isFirebaseReady: boolean
): UseGameHistoryResult {
  const [games, setGames] = useState<StoredGameState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setFetchTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!userId || !isFirebaseReady) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function fetchHistory() {
      try {
        const history = await getGameHistory(userId!);
        if (!cancelled) {
          setGames(history);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load history'));
          setIsLoading(false);
        }
      }
    }

    fetchHistory();
    return () => { cancelled = true; };
  }, [userId, isFirebaseReady, fetchTrigger]);

  return { games, isLoading, error, refetch };
}
