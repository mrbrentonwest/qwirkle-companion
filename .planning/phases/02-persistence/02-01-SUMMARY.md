---
phase: 02-persistence
plan: 01
subsystem: auth
tags: [firebase, anonymous-auth, firestore, singleton, ssr-safety]

# Dependency graph
requires:
  - phase: 01-identity
    provides: IdentityContext with passphrase-based userId
provides:
  - Firebase singleton with db and auth exports
  - Anonymous Auth integration in IdentityContext
  - firebaseUid and isFirebaseReady context values
  - env.example template for Firebase config
affects: [02-persistence/plan-02, game-sync, firestore-operations]

# Tech tracking
tech-stack:
  added: []  # firebase already installed
  patterns:
    - "Firebase singleton with getApps() hot reload guard"
    - "SSR-safe initialization with typeof window check"
    - "Anonymous Auth for Firestore security rules"

key-files:
  created:
    - src/lib/firebase.ts
    - env.example
  modified:
    - src/contexts/identity-context.tsx

key-decisions:
  - "Export db and auth only (not app) from firebase singleton"
  - "Use env.example (not .env.local.example) to avoid gitignore"
  - "Sign in anonymously only after passphrase is set"
  - "Capture auth in const for TypeScript closure narrowing"

patterns-established:
  - "Firebase imports: import { db, auth } from '@/lib/firebase'"
  - "Auth state: firebaseUid for debugging, isFirebaseReady for sync readiness"
  - "Error handling: Log Firebase errors but don't block app"

# Metrics
duration: 5min
completed: 2026-01-17
---

# Phase 2 Plan 1: Firebase Foundation Summary

**Firebase singleton with Anonymous Auth integration into existing IdentityContext for Firestore security rules**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-18T00:26:38Z
- **Completed:** 2026-01-18T00:31:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created Firebase singleton module with db and auth exports, guarded for SSR and hot reload
- Integrated Anonymous Auth into IdentityContext with proper onAuthStateChanged listener
- Added firebaseUid and isFirebaseReady to context for downstream consumption
- Created env.example template documenting required Firebase environment variables

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Firebase initialization singleton** - `823b7a0` (feat)
2. **Task 2: Integrate Anonymous Auth into IdentityContext** - `3b0a313` (feat)

## Files Created/Modified

- `src/lib/firebase.ts` - Firebase singleton with db and auth exports, SSR-safe with getApps() pattern
- `env.example` - Template for Firebase configuration environment variables
- `src/contexts/identity-context.tsx` - Added Anonymous Auth integration with firebaseUid and isFirebaseReady

## Decisions Made

- **Named file env.example instead of .env.local.example:** The gitignore has `.env*` pattern which would ignore `.env.local.example`. Used `env.example` instead to ensure template is tracked.
- **Sign in only when userId exists:** Don't sign in anonymously until passphrase is set, matching the existing identity flow.
- **Capture auth in const for TypeScript:** The async closure in onAuthStateChanged doesn't narrow the optional type, so we capture in a local const after the null check.
- **Mark isFirebaseReady true on error:** Firebase being unavailable shouldn't block the app - we mark ready anyway and log the error.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript narrowing for auth in async closure**
- **Found during:** Task 2 (Anonymous Auth integration)
- **Issue:** TypeScript error - `auth` may be undefined from firebase module export, and the `if (!auth) return` check doesn't narrow the type inside the async onAuthStateChanged callback
- **Fix:** Captured auth in a const after the null check: `const firebaseAuth = auth;` and used that in the closure
- **Files modified:** src/contexts/identity-context.tsx
- **Verification:** TypeScript compiles without errors
- **Committed in:** 3b0a313 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed gitignore conflict with .env.local.example filename**
- **Found during:** Task 1 (env template creation)
- **Issue:** Plan specified `.env.local.example` but gitignore has `.env*` pattern which would ignore it
- **Fix:** Named file `env.example` instead
- **Files modified:** env.example (created with different name)
- **Verification:** `git status --short` shows env.example as untracked (trackable)
- **Committed in:** 823b7a0 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary for functionality. No scope creep.

## Issues Encountered

None - other than the auto-fixed deviations noted above.

## User Setup Required

**External services require manual configuration.** The plan frontmatter specifies `user_setup` for Firebase:

1. **Firebase Console Configuration:**
   - Enable Anonymous Authentication: Firebase Console -> Authentication -> Sign-in method -> Anonymous -> Enable
   - Create Firestore database: Firebase Console -> Firestore Database -> Create database -> Start in test mode

2. **Environment Variables (copy from env.example to .env.local):**
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID

   Get values from: Firebase Console -> Project Settings -> General -> Your apps -> Web app -> Config

## Next Phase Readiness

- Firebase singleton ready for use in game persistence hooks
- Anonymous Auth ready to satisfy Firestore security rules
- Context provides isFirebaseReady for gating Firestore operations
- Plan 02 can implement game CRUD operations using db export

---
*Phase: 02-persistence*
*Completed: 2026-01-17*
