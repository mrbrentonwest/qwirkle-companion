'use client';

import { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { hashPassphrase } from '@/lib/identity';
import { auth } from '@/lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import type { UserIdentity } from '@/lib/types';

interface IdentityContextValue {
  userId: string | null;
  passphrase: string | null;
  isLoading: boolean;
  isIdentified: boolean;
  setPassphrase: (passphrase: string) => Promise<void>;
  clearIdentity: () => void;
  /** Firebase Anonymous Auth UID (for debugging, not used for data paths) */
  firebaseUid: string | null;
  /** True once Firebase Auth has completed */
  isFirebaseReady: boolean;
}

const IdentityContext = createContext<IdentityContextValue | undefined>(undefined);

/**
 * Hook to access identity state. Must be used within an IdentityProvider.
 *
 * @throws Error if used outside of IdentityProvider
 * @returns IdentityContextValue
 */
export function useIdentity(): IdentityContextValue {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error('useIdentity must be used within an IdentityProvider');
  }
  return context;
}

interface IdentityProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for identity state management.
 * Persists identity to localStorage and provides passphrase hashing.
 * Integrates Firebase Anonymous Auth for Firestore security rules.
 */
export function IdentityProvider({ children }: IdentityProviderProps) {
  const [identity, setIdentity, removeIdentity, isHydrated] = useLocalStorage<UserIdentity | null>(
    'qwirkle-identity',
    null
  );

  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Sign in anonymously with Firebase when identity is established
  useEffect(() => {
    // Don't do anything until localStorage is hydrated
    if (!isHydrated) return;

    // Don't sign in if no identity established (user hasn't set passphrase yet)
    if (!identity?.userId) {
      setIsFirebaseReady(true); // Firebase is "ready" in the sense that we don't need it yet
      return;
    }

    // Don't run on server (auth is undefined in SSR)
    if (!auth) return;

    // Capture auth in const for closure (TypeScript narrowing)
    const firebaseAuth = auth;

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        // Already signed in (Firebase caches anonymous sessions)
        setFirebaseUid(user.uid);
        setIsFirebaseReady(true);
      } else {
        // Not signed in, sign in anonymously
        try {
          const result = await signInAnonymously(firebaseAuth);
          setFirebaseUid(result.user.uid);
          setIsFirebaseReady(true);
        } catch (error) {
          // Log but don't crash - Firebase being unavailable shouldn't break the app
          console.error('Firebase anonymous sign-in failed:', error);
          setIsFirebaseReady(true); // Mark ready anyway so app isn't blocked
        }
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [isHydrated, identity?.userId]);

  const setPassphrase = useCallback(async (passphrase: string) => {
    const userId = await hashPassphrase(passphrase);
    setIdentity({ passphrase, userId });
  }, [setIdentity]);

  const clearIdentity = useCallback(() => {
    removeIdentity();
  }, [removeIdentity]);

  const value = useMemo<IdentityContextValue>(() => ({
    userId: identity?.userId ?? null,
    passphrase: identity?.passphrase ?? null,
    isLoading: !isHydrated,
    isIdentified: identity?.userId !== null && identity?.userId !== undefined,
    setPassphrase,
    clearIdentity,
    firebaseUid,
    isFirebaseReady,
  }), [identity, isHydrated, setPassphrase, clearIdentity, firebaseUid, isFirebaseReady]);

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}
