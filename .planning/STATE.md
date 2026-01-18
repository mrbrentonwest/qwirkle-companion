# Project State

**Project:** Qwirkle Companion
**Milestone:** Game Persistence & History
**Last Updated:** 2026-01-17

## Current Status

**Phase:** 2 of 3 (Persistence) - IN PROGRESS
**Plan:** 1 of 3 complete
**Progress:** [#####-----] 50%
**Last activity:** 2026-01-17 - Completed 02-01-PLAN.md (Firebase Foundation)

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-17)

**Core value:** Players can track their Qwirkle game scores easily and never lose their game progress, even when accessing via ngrok on mobile.

**Current focus:** Phase 2 - Persistence. Firebase initialized, Anonymous Auth integrated. Ready for game CRUD operations.

## Phase Progress

| Phase | Status | Plans |
|-------|--------|-------|
| 1 - Identity | Complete | 2/2 |
| 2 - Persistence | In Progress | 1/3 |
| 3 - Home & History | Pending | 0/? |

## Accumulated Context

### Decisions Made

| Decision | Phase | Rationale |
|----------|-------|-----------|
| useLocalStorage returns 4-tuple with isHydrated | 01-01 | Expose hydration state for loading UI |
| Passphrase normalized (trim + lowercase) before hashing | 01-01 | Ensure consistent userId generation |
| Context uses undefined default with throw pattern | 01-01 | Better error messages when used outside provider |
| Providers component pattern for server/client boundary | 01-02 | Keep layout.tsx server-friendly |
| Passphrase dialog controlled via open prop | 01-02 | Parent decides visibility with !isIdentified && !isLoading |
| Settings confirmation requires typing twice | 01-02 | Prevent accidental passphrase changes |
| Export db and auth only from firebase singleton | 02-01 | Clean API, app not needed externally |
| Use env.example (not .env.local.example) | 02-01 | Avoid gitignore .env* pattern |
| Sign in anonymously only after passphrase set | 02-01 | Match existing identity flow |
| Mark isFirebaseReady true on error | 02-01 | Firebase unavailable shouldn't block app |

### Technical Notes

- Existing stack: Next.js 15, React 19, Firebase Genkit
- Current state: All game state in useState (no persistence)
- Target: Firestore for cloud persistence
- Identity: Passphrase-hashed user ID (no OAuth)
- **Phase 1 complete:** Identity infrastructure + UI fully operational
  - useLocalStorage hook with SSR safety
  - hashPassphrase using Web Crypto SHA-256
  - IdentityContext/useIdentity for app-wide state
  - PassphraseDialog for first-time users
  - SettingsSheet for passphrase changes
  - UserAvatar in header
- **Phase 2 progress:** Firebase foundation established
  - Firebase singleton: `import { db, auth } from '@/lib/firebase'`
  - Anonymous Auth integrated into IdentityContext
  - Context provides firebaseUid and isFirebaseReady
  - env.example documents required environment variables

### Blockers

**User setup required for Firebase:**
- Enable Anonymous Auth in Firebase Console
- Create Firestore database in Firebase Console
- Add Firebase config to .env.local (see env.example)

### TODOs

None.

## Session Continuity

**Last session:** 2026-01-18T00:31:30Z
**Stopped at:** Completed 02-01-PLAN.md (Firebase Foundation)
**Resume file:** None - Ready for 02-02-PLAN.md

---
*State updated: 2026-01-17*
