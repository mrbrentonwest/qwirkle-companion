'use client';

import { createContext, useContext, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { hashPassphrase } from '@/lib/identity';
import type { UserIdentity } from '@/lib/types';

interface IdentityContextValue {
  userId: string | null;
  passphrase: string | null;
  isLoading: boolean;
  isIdentified: boolean;
  setPassphrase: (passphrase: string) => Promise<void>;
  clearIdentity: () => void;
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
 */
export function IdentityProvider({ children }: IdentityProviderProps) {
  const [identity, setIdentity, removeIdentity, isHydrated] = useLocalStorage<UserIdentity | null>(
    'qwirkle-identity',
    null
  );

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
  }), [identity, isHydrated, setPassphrase, clearIdentity]);

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}
