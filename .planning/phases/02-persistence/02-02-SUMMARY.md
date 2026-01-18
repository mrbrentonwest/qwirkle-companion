---
phase: 02-persistence
plan: 02
subsystem: database
tags: [firestore, crud, real-time-sync, debounce, react-hooks]

# Dependency graph
requires:
  - phase: 02-persistence/plan-01
    provides: Firebase singleton with db and auth exports, isFirebaseReady context
provides:
  - Firestore game CRUD operations (saveActiveGame, loadActiveGame, clearActiveGame)
  - useGamePersistence hook with auto-save and real-time loading
  - StoredGameState interface with timestamps
affects: [02-persistence/plan-03, game-integration, page-tsx-refactor]

# Tech tracking
tech-stack:
  added: []  # Uses existing firebase package
  patterns:
    - "onSnapshot listener with useEffect cleanup"
    - "setTimeout debounce pattern for Firestore writes"
    - "useRef for timeout persistence across renders"
    - "setDoc with { merge: true } for upsert"

key-files:
  created:
    - src/lib/firestore-game.ts
    - src/hooks/use-game-persistence.ts
  modified: []

key-decisions:
  - "Only update initialGame on first snapshot (let consumer manage state)"
  - "500ms debounce delay for saves per research guidance"
  - "Read existing doc before save to preserve createdAt timestamp"
  - "Clear pending save timeout on clearGame"

patterns-established:
  - "Firestore CRUD: import { saveActiveGame, loadActiveGame, clearActiveGame } from '@/lib/firestore-game'"
  - "Game persistence: useGamePersistence({ userId, isFirebaseReady })"
  - "Document path: users/{userId}/activeGame/current"

# Metrics
duration: 2min
completed: 2026-01-17
---

# Phase 2 Plan 2: Game CRUD & Persistence Hook Summary

**Firestore CRUD operations with debounced auto-save and real-time loading via onSnapshot listener**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-18T00:33:19Z
- **Completed:** 2026-01-18T00:35:29Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created Firestore CRUD module with save, load, and clear operations for active game documents
- Created useGamePersistence hook with real-time onSnapshot listener and debounced saves
- Implemented proper cleanup on unmount/userId change to prevent memory leaks
- Added StoredGameState interface extending GameState with createdAt/updatedAt timestamps

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Firestore game CRUD operations** - `13c12cd` (feat)
2. **Task 2: Create useGamePersistence hook** - `2c2eb73` (feat)

## Files Created/Modified

- `src/lib/firestore-game.ts` - CRUD operations: saveActiveGame (upsert with merge), loadActiveGame (one-time read), clearActiveGame (delete)
- `src/hooks/use-game-persistence.ts` - Hook providing initialGame, isLoading, saveGame (debounced), clearGame, and error state

## Decisions Made

- **Only set initialGame on first snapshot:** The hook provides initial state for the consumer to hydrate from. Subsequent snapshots are ignored to prevent conflicts between local edits and server updates. The consumer manages their own state after initial load.
- **Preserve createdAt on save:** Read existing document before save to preserve original createdAt timestamp, only updating updatedAt on subsequent saves.
- **Clear pending timeout on clearGame:** When clearing the game, cancel any pending debounced save to prevent orphan writes.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Requires Firebase configuration from Plan 01.** See 02-01-SUMMARY.md for:
- Firebase Console setup (Anonymous Auth, Firestore database)
- Environment variables (.env.local)

## Next Phase Readiness

- CRUD operations and persistence hook ready for integration with page.tsx
- Plan 03 can wire useGamePersistence into the game UI
- Hook provides all necessary methods: load initial state, auto-save on changes, clear on reset

---
*Phase: 02-persistence*
*Completed: 2026-01-17*
