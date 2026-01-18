'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { saveActiveGame, clearActiveGame } from '@/lib/firestore-game';
import type { GameState } from '@/lib/types';

export interface UseGamePersistenceOptions {
  userId: string | null;
  isFirebaseReady: boolean;
}

export interface UseGamePersistenceReturn {
  /** Initial game loaded from Firestore (null if none exists) */
  initialGame: GameState | null;
  /** Loading state - true until first snapshot received */
  isLoading: boolean;
  /** Save function (debounced internally) */
  saveGame: (gameState: GameState) => void;
  /** Clear function (for game reset) */
  clearGame: () => Promise<void>;
  /** Error state */
  error: Error | null;
}

/** Debounce delay in milliseconds */
const DEBOUNCE_MS = 500;

/**
 * Hook for game state synchronization with Firestore
 *
 * - Sets up real-time listener via onSnapshot when userId and Firebase are ready
 * - Debounces saves to prevent hitting Firestore rate limits
 * - Cleans up listener on unmount or userId change
 */
export function useGamePersistence(
  options: UseGamePersistenceOptions
): UseGamePersistenceReturn {
  const { userId, isFirebaseReady } = options;

  const [initialGame, setInitialGame] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track if we've received the first snapshot
  const hasReceivedFirstSnapshot = useRef(false);

  // Ref for debounce timeout to persist across renders
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up onSnapshot listener
  useEffect(() => {
    // Reset state when userId changes
    hasReceivedFirstSnapshot.current = false;
    setIsLoading(true);
    setInitialGame(null);
    setError(null);

    // Don't set up listener if userId or Firebase not ready
    if (!userId || !isFirebaseReady || !db) {
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, 'users', userId, 'activeGame', 'current');

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        // Only set initialGame on first snapshot
        if (!hasReceivedFirstSnapshot.current) {
          hasReceivedFirstSnapshot.current = true;
          if (snapshot.exists()) {
            setInitialGame(snapshot.data() as GameState);
          } else {
            setInitialGame(null);
          }
          setIsLoading(false);
        }
        // Note: We don't update state on subsequent snapshots
        // The consumer manages their own game state after initial load
        // This prevents conflicts between local edits and server updates
      },
      (err) => {
        console.error('Game listener error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    // CRITICAL: Cleanup listener on unmount or userId change
    return () => {
      unsubscribe();
      // Clear any pending save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [userId, isFirebaseReady]);

  // Debounced save function
  const saveGame = useCallback(
    (gameState: GameState) => {
      // Don't save if no userId
      if (!userId) {
        return;
      }

      // Clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce: wait before saving
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await saveActiveGame(userId, gameState);
        } catch (err) {
          console.error('Auto-save failed:', err);
          setError(err instanceof Error ? err : new Error('Save failed'));
        }
      }, DEBOUNCE_MS);
    },
    [userId]
  );

  // Clear function for game reset
  const clearGame = useCallback(async () => {
    if (!userId) {
      return;
    }

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    try {
      await clearActiveGame(userId);
      setInitialGame(null);
    } catch (err) {
      console.error('Clear game failed:', err);
      setError(err instanceof Error ? err : new Error('Clear failed'));
      throw err;
    }
  }, [userId]);

  return {
    initialGame,
    isLoading,
    saveGame,
    clearGame,
    error,
  };
}
