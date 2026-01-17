'use client';

import { IdentityProvider } from '@/contexts/identity-context';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side providers wrapper.
 * Wraps children with all necessary context providers.
 */
export function Providers({ children }: ProvidersProps) {
  return <IdentityProvider>{children}</IdentityProvider>;
}
