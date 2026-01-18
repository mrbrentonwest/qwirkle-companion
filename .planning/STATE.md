# Project State

**Project:** Qwirkle Companion
**Milestone:** Game Persistence & History
**Last Updated:** 2026-01-18

## Current Status

**Phase:** 2 of 3 (Persistence) - COMPLETE
**Plan:** 3 of 3 complete
**Progress:** [########--] 80%
**Last activity:** 2026-01-18 - Completed 02-03-PLAN.md (Integration & Verification)

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-17)

**Core value:** Players can track their Qwirkle game scores easily and never lose their game progress, even when accessing via ngrok on mobile.

**Current focus:** Phase 2 complete. Ready for Phase 3 - Home & History.

## Phase Progress

| Phase | Status | Plans |
|-------|--------|-------|
| 1 - Identity | Complete | 2/2 |
| 2 - Persistence | Complete | 3/3 |
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
| Only set initialGame on first snapshot | 02-02 | Consumer manages state after initial load |
| 500ms debounce for Firestore saves | 02-02 | Prevent rate limit issues (1 write/sec) |
| Preserve createdAt by reading existing doc | 02-02 | Only updatedAt changes on subsequent saves |
| Security rules allow any auth user to any userId path | 02-03 | SHA-256 unguessability provides security |
| Game state initializes from Firestore before showing UI | 02-03 | Prevent flash of empty state |
| Save triggered on every gameState change via useEffect | 02-03 | Automatic persistence without manual save |

### Technical Notes

- Existing stack: Next.js 15, React 19, Firebase Genkit
- **Phase 1 complete:** Identity infrastructure + UI fully operational
  - useLocalStorage hook with SSR safety
  - hashPassphrase using Web Crypto SHA-256
  - IdentityContext/useIdentity for app-wide state
  - PassphraseDialog for first-time users
  - SettingsSheet for passphrase changes
  - UserAvatar in header
- **Phase 2 complete:** Game persistence fully operational
  - Firebase singleton: `import { db, auth } from '@/lib/firebase'`
  - Anonymous Auth integrated into IdentityContext
  - Context provides firebaseUid and isFirebaseReady
  - CRUD: `import { saveActiveGame, loadActiveGame, clearActiveGame } from '@/lib/firestore-game'`
  - Hook: `useGamePersistence({ userId, isFirebaseReady })` returns initialGame, saveGame, clearGame
  - Document path: `users/{userId}/activeGame/current`
  - page.tsx uses useGamePersistence for auto-save/load
  - Firestore security rules deployed

### Blockers

None - ready for Phase 3.

### TODOs

None.

## Session Continuity

**Last session:** 2026-01-18T01:16:45Z
**Stopped at:** Completed 02-03-PLAN.md (Integration & Verification) - Phase 2 COMPLETE
**Resume file:** None - Ready for Phase 3 planning

---
*State updated: 2026-01-18*
