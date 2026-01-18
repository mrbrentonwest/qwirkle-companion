'use client';

import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GameState } from '@/lib/types';

/**
 * Extends GameState with timestamp fields for Firestore storage
 */
export interface StoredGameState extends GameState {
  createdAt: string;
  updatedAt: string;
}

/**
 * Document path: users/{userId}/activeGame/current
 * Single active game per user as specified in research
 */
function getActiveGameRef(userId: string) {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return doc(db, 'users', userId, 'activeGame', 'current');
}

/**
 * Save game state to Firestore (upsert with merge)
 * Creates document if missing, updates if exists
 */
export async function saveActiveGame(userId: string, gameState: GameState): Promise<void> {
  const docRef = getActiveGameRef(userId);

  // Get existing doc to check for createdAt
  const existing = await getDoc(docRef);
  const now = new Date().toISOString();

  const dataToSave: StoredGameState = {
    ...gameState,
    createdAt: existing.exists() ? (existing.data() as StoredGameState).createdAt : now,
    updatedAt: now,
  };

  await setDoc(docRef, dataToSave, { merge: true });
}

/**
 * Load game state from Firestore (one-time read)
 * Returns null if document doesn't exist
 */
export async function loadActiveGame(userId: string): Promise<GameState | null> {
  const docRef = getActiveGameRef(userId);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    return snapshot.data() as GameState;
  }
  return null;
}

/**
 * Delete active game from Firestore
 * Used for game reset/clear operations
 */
export async function clearActiveGame(userId: string): Promise<void> {
  const docRef = getActiveGameRef(userId);
  await deleteDoc(docRef);
}
