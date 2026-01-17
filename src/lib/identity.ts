/**
 * Identity utilities for passphrase-based user identification.
 * Uses Web Crypto API for SHA-256 hashing.
 */

/**
 * Hash a passphrase to create a deterministic user ID.
 * Normalizes input by trimming whitespace and converting to lowercase.
 *
 * @param passphrase - The user's passphrase
 * @returns A hex string of the SHA-256 hash
 */
export async function hashPassphrase(passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Check if localStorage is available and writable.
 * Handles Safari private mode which throws QUOTA_EXCEEDED_ERR.
 *
 * @returns true if localStorage can be used
 */
export function isLocalStorageAvailable(): boolean {
  const testKey = '__storage_test__';
  try {
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
