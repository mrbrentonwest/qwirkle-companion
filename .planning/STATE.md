# Project State

**Project:** Qwirkle Companion
**Milestone:** Game Persistence & History
**Last Updated:** 2026-01-17

## Current Status

**Phase:** 3 of 3 (Home & History) - COMPLETE
**Plan:** 3 of 3 complete
**Progress:** [##########] 100%
**Last activity:** 2026-01-17 - Completed 03-03-PLAN.md (Integration)

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-17)

**Core value:** Players can track their Qwirkle game scores easily and never lose their game progress, even when accessing via ngrok on mobile.

**Current focus:** All phases complete. Project milestone achieved.

## Phase Progress

| Phase | Status | Plans |
|-------|--------|-------|
| 1 - Identity | Complete | 2/2 |
| 2 - Persistence | Complete | 3/3 |
| 3 - Home & History | Complete | 3/3 |

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
| StoredGameState type in types.ts (not firestore-game.ts) | 03-01 | Single shared type definition |
| archiveGame sets all timestamps to now on archive | 03-01 | Fresh timestamps for archived games |
| getGameHistory defaults to 10, ordered by completedAt desc | 03-01 | Recent games first |
| useGameHistory uses fetchTrigger state for manual refetch | 03-02 | Simple, reliable refetch pattern |
| GameHistoryItem shows tie badge when multiple winners | 03-02 | Clear tie indication |
| HomeScreen shows Continue Game prominently when active | 03-02 | Primary action gets visual priority |
| View state controls home vs game display | 03-03 | Clean navigation between app sections |
| Archive game before clearing active state | 03-03 | Ensure game data preserved before deletion |
| handleEndGame is async for archiveGame | 03-03 | Proper async handling for Firestore |
| Home button only in game view | 03-03 | Clean navigation without redundancy |

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
- **Phase 3 complete:** Home and history features fully operational
  - Type: `import type { StoredGameState } from '@/lib/types'`
  - CRUD: `import { archiveGame, getGameHistory } from '@/lib/firestore-game'`
  - History path: `users/{userId}/gameHistory/{auto-id}`
  - Hook: `import { useGameHistory } from '@/hooks/use-game-history'`
  - Components: HomeScreen, GameHistoryList, GameHistoryItem, EmptyHistory, GameDetailDialog
  - page.tsx: View switching (home/game), game archiving on end, home button in header
  - Complete lifecycle: start -> play -> end -> archive -> view in history

### Blockers

None.

### TODOs

None - milestone complete.

## Session Continuity

**Last session:** 2026-01-17T21:30:00Z
**Stopped at:** Completed 03-03-PLAN.md (Integration) - Project milestone complete
**Resume file:** None

---
*State updated: 2026-01-17*
