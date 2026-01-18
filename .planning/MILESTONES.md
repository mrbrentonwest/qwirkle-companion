# Project Milestones: Qwirkle Companion

## v1.0 Game Persistence & History (Shipped: 2026-01-18)

**Delivered:** Games now persist to cloud storage and players can view their game history with turn-by-turn breakdowns.

**Phases completed:** 1-3 (8 plans total)

**Key accomplishments:**

- Passphrase-based identity with SHA-256 hashing (no OAuth complexity)
- Firebase/Firestore integration with Anonymous Auth
- Auto-save on every score change with 500ms debounce
- Home screen as new app entry point with Continue/New Game
- Game history list with winner highlighting
- Turn-by-turn breakdown dialog for completed games
- Complete game lifecycle: start → play → end → archive → view

**Stats:**

- 44 files created/modified
- ~5,650 lines added
- 3 phases, 8 plans
- 2 days from start to ship

**Git range:** `feat(01-01)` → `feat(03-03)`

**What's next:** To be determined in next milestone planning.

---
