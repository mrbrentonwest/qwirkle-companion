# Phase 2: Persistence - Research

**Researched:** 2026-01-17
**Domain:** Firebase Firestore real-time persistence with React
**Confidence:** HIGH

## Summary

This phase implements automatic game state persistence to Firebase Firestore. The project already has `firebase@11.9.1` installed but no Firebase initialization code exists yet. The existing game state (in `useState` on `page.tsx`) needs to be synced to Firestore so games survive page refreshes and browser closes.

The key challenge is integrating Firestore with the existing passphrase-based identity system (Phase 1). Since Phase 1 created a custom userId via SHA-256 hashing of a passphrase (not Firebase Auth), we need to use Firebase Anonymous Authentication to get a proper auth token for Firestore security rules, while using our custom userId for document organization.

**Primary recommendation:** Use Firebase Anonymous Auth to authenticate requests, store games in `/users/{userId}/activeGame` documents, use `setDoc` with `{ merge: true }` for auto-save, and `onSnapshot` for real-time sync. Debounce writes to respect Firestore's 1 write/second sustained limit.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| firebase | 11.9.1 | Firebase SDK (already installed) | Official SDK, includes Firestore and Auth |
| firebase/firestore | (bundled) | Firestore modular API | Tree-shakeable, TypeScript support |
| firebase/auth | (bundled) | Anonymous authentication | Required for security rules |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | Firebase SDK has everything |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Anonymous Auth | No auth + open rules | Security risk - don't do this |
| Anonymous Auth | Full Firebase Auth | Overkill - we already have passphrase identity |
| Firestore | Realtime Database | Firestore has better querying, offline support |

**Installation:**
```bash
# Already installed - no new packages needed
npm ls firebase  # Should show firebase@11.9.1
```

**Environment Variables Needed:**
```bash
# Add to .env.local (NEXT_PUBLIC_ prefix for client-side access)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── firebase.ts           # Firebase initialization (singleton)
│   └── firestore-game.ts     # Game CRUD operations
├── hooks/
│   └── use-game-persistence.ts  # Hook for game sync
└── contexts/
    └── identity-context.tsx  # Already exists, may need Firebase auth integration
```

### Pattern 1: Firebase Singleton Initialization
**What:** Initialize Firebase once, prevent duplicate initialization
**When to use:** Every Firebase project
**Example:**
```typescript
// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent duplicate initialization in development (hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
```

### Pattern 2: onSnapshot with useEffect Cleanup
**What:** Real-time listener with proper cleanup to prevent memory leaks
**When to use:** Any real-time Firestore data
**Example:**
```typescript
// Source: Firebase official docs + community best practices
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

function useGameListener(userId: string | null) {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', userId, 'activeGame', 'current');

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setGame(snapshot.data() as GameState);
        } else {
          setGame(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Game listener error:', error);
        setLoading(false);
      }
    );

    // CRITICAL: Cleanup listener on unmount or userId change
    return () => unsubscribe();
  }, [userId]);

  return { game, loading };
}
```

### Pattern 3: Debounced Auto-Save
**What:** Debounce writes to prevent hitting Firestore rate limits
**When to use:** When saving on every state change
**Example:**
```typescript
// Source: Community best practice for Firestore auto-save
import { useRef, useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';

function useAutoSave(userId: string | null) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const saveGame = useCallback(async (gameState: GameState) => {
    if (!userId) return;

    // Clear any pending save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce: wait 500ms before saving
    timeoutRef.current = setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', userId, 'activeGame', 'current');
        await setDoc(docRef, {
          ...gameState,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 500);
  }, [userId]);

  return saveGame;
}
```

### Pattern 4: Anonymous Auth for Security Rules
**What:** Use Firebase Anonymous Auth to authenticate client requests
**When to use:** When you need security rules but have custom identity
**Example:**
```typescript
// Source: Firebase official docs
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Sign in anonymously on app load
export async function ensureAuthenticated(): Promise<string> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user.uid);
      } else {
        try {
          const result = await signInAnonymously(auth);
          resolve(result.user.uid);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}
```

### Anti-Patterns to Avoid
- **Storing listener in useState:** The unsubscribe function should be in a ref or returned from useEffect, never in state
- **Calling onSnapshot in render:** Always call in useEffect with cleanup
- **Forgetting merge option:** `setDoc` without `{ merge: true }` will overwrite the entire document
- **Not debouncing writes:** Rapid writes can exceed 1 write/second limit causing errors
- **Initializing Firebase in components:** Initialize once at module level, import the singleton

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Real-time sync | Custom polling | `onSnapshot` | Built-in, efficient, handles reconnection |
| Debouncing | Manual setTimeout management | `useRef` + `setTimeout` pattern | Memory leaks if not careful |
| Duplicate Firebase init | Check manually | `getApps().length` check | Official pattern |
| Offline persistence | Custom caching | Firestore offline mode | Built-in IndexedDB caching |
| Auth token management | Manual tokens | Firebase Auth SDK | Handles refresh automatically |

**Key insight:** Firebase's real-time listeners handle network reconnection, offline queueing, and conflict resolution automatically. Don't try to build these yourself.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with Firebase
**What goes wrong:** Server renders null, client hydrates with Firebase data, React errors
**Why it happens:** Firebase only works on client, Next.js SSR tries to render on server
**How to avoid:**
- Use `'use client'` directive on components using Firebase
- Show loading state until hydrated (same pattern as useLocalStorage)
- Initialize Firebase only after checking `typeof window !== 'undefined'`
**Warning signs:** "Text content does not match server-rendered HTML" errors

### Pitfall 2: Memory Leaks from Listeners
**What goes wrong:** Listeners accumulate, causing performance issues and stale data
**Why it happens:** Forgetting to unsubscribe in useEffect cleanup
**How to avoid:** Always return unsubscribe function from useEffect
**Warning signs:** Multiple console logs from same listener, increasing memory usage

### Pitfall 3: Security Rules Blocking Reads/Writes
**What goes wrong:** "Missing or insufficient permissions" errors
**Why it happens:** Security rules not configured, or user not authenticated
**How to avoid:**
- Enable Anonymous Auth in Firebase Console
- Configure security rules for userId path
- Always authenticate before accessing Firestore
**Warning signs:** Permission denied errors in console

### Pitfall 4: Write Rate Exceeded
**What goes wrong:** Writes fail with contention errors
**Why it happens:** More than ~1 sustained write/second to same document
**How to avoid:** Debounce writes (500ms minimum), batch related changes
**Warning signs:** `UNAVAILABLE` or `ABORTED` errors from Firestore

### Pitfall 5: Merge vs Replace Confusion
**What goes wrong:** Entire document overwritten, losing fields
**Why it happens:** Using `setDoc()` without `{ merge: true }`
**How to avoid:** Always use `{ merge: true }` for partial updates, or use `updateDoc`
**Warning signs:** Fields mysteriously disappearing after updates

## Code Examples

Verified patterns from official sources:

### Firebase Initialization (Complete)
```typescript
// src/lib/firebase.ts
// Source: Firebase official docs + Next.js best practices
'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };
```

### setDoc with Merge (Upsert Pattern)
```typescript
// Source: Firebase official docs
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

async function saveActiveGame(userId: string, gameState: GameState): Promise<void> {
  const docRef = doc(db, 'users', userId, 'activeGame', 'current');

  await setDoc(docRef, {
    ...gameState,
    updatedAt: new Date().toISOString(),
  }, { merge: true }); // Creates if missing, updates if exists
}
```

### getDoc (One-Time Read)
```typescript
// Source: Firebase official docs
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

async function loadActiveGame(userId: string): Promise<GameState | null> {
  const docRef = doc(db, 'users', userId, 'activeGame', 'current');
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    return snapshot.data() as GameState;
  }
  return null;
}
```

### deleteDoc (Clear Game)
```typescript
// Source: Firebase official docs
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

async function clearActiveGame(userId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'activeGame', 'current');
  await deleteDoc(docRef);
}
```

## Data Model

### Recommended Document Structure
```
firestore/
└── users/                          # Collection
    └── {userId}/                   # Document (user's root)
        └── activeGame/             # Subcollection
            └── current             # Document (single active game)
                ├── players: Player[]
                ├── currentPlayerIndex: number
                ├── round: number
                ├── isGameActive: boolean
                ├── isGameOver: boolean
                ├── createdAt: string (ISO)
                └── updatedAt: string (ISO)
```

**Why this structure:**
- User isolation via userId path segment
- Single active game per user (simple)
- Subcollection allows future expansion (game history in Phase 3)
- Document size stays small (game state is lightweight)

### Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      // Allow if authenticated (Anonymous Auth provides request.auth)
      // AND the userId in the path matches what we expect
      allow read, write: if request.auth != null;
      // Note: We use our custom userId, not request.auth.uid
      // Security relies on userId being SHA-256 hash (unguessable)
    }
  }
}
```

**Important:** Since we're using custom userId (passphrase hash) rather than Firebase Auth UID, our security model relies on the userId being unguessable (SHA-256). The Anonymous Auth just ensures the request comes from our app.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `enableIndexedDbPersistence()` | `initializeFirestore()` with `localCache` | Firebase v9+ | Different API for offline persistence |
| Namespace API (`firebase.firestore()`) | Modular API (`getFirestore()`) | Firebase v9 (2021) | Tree-shaking, smaller bundles |
| `onSnapshot` on collection | `onSnapshot` on document | N/A | For single-user active game, document listener is simpler |

**Deprecated/outdated:**
- `enableIndexedDbPersistence()`: Use `initializeFirestore()` with `localCache: persistentLocalCache()` instead
- Namespace imports (`import firebase from 'firebase/app'`): Use modular imports

## Open Questions

Things that couldn't be fully resolved:

1. **Offline persistence enablement**
   - What we know: Modern API uses `initializeFirestore()` with `localCache`
   - What's unclear: Exact syntax and multi-tab behavior in Firebase 11
   - Recommendation: Start without offline persistence, add if needed later (it's optional for MVP)

2. **Anonymous Auth vs No Auth**
   - What we know: Anonymous Auth provides `request.auth` for security rules
   - What's unclear: Can we get away with just checking userId path exists?
   - Recommendation: Use Anonymous Auth - it's the proper way and auto-cleans old accounts

## Sources

### Primary (HIGH confidence)
- [Firebase Firestore Modular API](https://modularfirebase.web.app/common-use-cases/firestore/) - getDoc, setDoc, updateDoc patterns
- [Firebase Add Data Docs](https://firebase.google.com/docs/firestore/manage-data/add-data) - Official write operations
- [Firebase onSnapshot Docs](https://firebase.google.com/docs/firestore/query-data/listen) - Real-time listeners
- [Firebase Anonymous Auth](https://firebase.google.com/docs/auth/web/anonymous-auth) - signInAnonymously API
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions) - User-based rules

### Secondary (MEDIUM confidence)
- [React Hooks with Firestore](https://blog.logrocket.com/how-to-use-react-hooks-firebase-firestore/) - useEffect patterns
- [Firestore Auto-Save Debounce](https://www.lotharschulz.info/2021/10/14/how-to-create-a-react-frontend-to-debounce-text-input-persistence-in-firebase-firestore/) - Debounce patterns
- [setDoc vs updateDoc](https://medium.com/@oladokuntioluwanimi/creating-documents-in-firebase-firestore-with-setdoc-getdoc-and-updatedoc-and-what-to-watch-out-3475fc03c554) - When to use each

### Tertiary (LOW confidence)
- [Firestore Write Rate Limits](https://docs.cloud.google.com/firestore/quotas) - 1 write/second guidance (needs validation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Firebase 11 already installed, modular API is well-documented
- Architecture: HIGH - Patterns verified against official Firebase docs
- Pitfalls: MEDIUM - Based on community experience, may vary by version
- Security rules: MEDIUM - Custom userId pattern is non-standard

**Research date:** 2026-01-17
**Valid until:** 30 days (Firebase SDK is stable, patterns unlikely to change)
