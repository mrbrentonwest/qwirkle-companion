# Roadmap: Qwirkle Companion

**Created:** 2026-01-17
**Milestone:** Game Persistence & History
**Phases:** 3

## Overview

| # | Phase | Goal | Requirements |
|---|-------|------|--------------|
| 1 | Identity | Users can identify themselves with a passphrase | IDEN-01, IDEN-02, IDEN-03 |
| 2 | Persistence | Games auto-save and survive page refreshes | PERS-01, PERS-02, PERS-03 |
| 3 | Home & History | Users see game history and navigate from home screen | HOME-01, HOME-02, HOME-03, HIST-01, HIST-02, HIST-03, HIST-04 |

## Phases

### Phase 1: Identity

**Goal:** Users can identify themselves with a passphrase that persists on their device

**Requirements:**
- IDEN-01: User can enter a passphrase to identify themselves
- IDEN-02: Passphrase is remembered on the device (localStorage)
- IDEN-03: User can change their passphrase from settings

**Success Criteria:**
1. User sees passphrase prompt on first visit to the app
2. User enters passphrase and is not prompted again on subsequent visits
3. User can access settings and change their passphrase
4. Changed passphrase persists after page refresh

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Foundation & Context (localStorage hook, hashing, identity context)
- [x] 01-02-PLAN.md — UI & Integration (passphrase dialog, settings sheet, avatar, wiring)

**Status:** Complete (2026-01-17)

**Dependencies:** None (foundation phase)

---

### Phase 2: Persistence

**Goal:** Games auto-save to Firestore and survive page refreshes

**Requirements:**
- PERS-01: Game state auto-saves to Firestore on every score change
- PERS-02: Game state includes all players, scores, current turn, round
- PERS-03: Game loads from Firestore on app open (if in-progress game exists)

**Success Criteria:**
1. User adds a score and refreshes the page - game state is preserved
2. User closes browser, reopens app - in-progress game is exactly where they left off
3. User can see all player scores, current turn, and round after refresh
4. Score changes appear saved within 2 seconds (no manual save needed)

**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Firebase Infrastructure (initialization, anonymous auth)
- [x] 02-02-PLAN.md — Firestore Game Operations (CRUD, useGamePersistence hook)
- [x] 02-03-PLAN.md — Integration & Verification (wire into page.tsx, security rules, user verification)

**Status:** Complete (2026-01-18)

**Dependencies:** Phase 1 (need user identity to associate games)

---

### Phase 3: Home & History

**Goal:** Users can see their game history and navigate to games from a home screen

**Requirements:**
- HOME-01: Home screen displays before game setup
- HOME-02: "New Game" button to start fresh game
- HOME-03: "Continue Game" shown when unfinished game exists
- HIST-01: Home screen shows list of past games
- HIST-02: Each game shows players, final scores, and winner
- HIST-03: User can tap a completed game to see turn-by-turn breakdown
- HIST-04: In-progress game shows "Continue" option prominently

**Success Criteria:**
1. User opens app and sees home screen with recent games listed (not game setup)
2. User can tap "New Game" to start a fresh game
3. User with in-progress game sees prominent "Continue Game" option
4. User can see past games with player names, scores, and winner highlighted
5. User can tap a completed game and see every turn's score breakdown

**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Firestore Game History Operations (types extension, archiveGame, getGameHistory)
- [x] 03-02-PLAN.md — Home Screen Components (useGameHistory hook, HomeScreen, GameHistoryList, GameHistoryItem, EmptyHistory)
- [x] 03-03-PLAN.md — Integration & Verification (view switching, game archiving, GameDetailDialog, user verification)

**Status:** Complete (2026-01-18)

**Dependencies:** Phase 2 (need persisted games to display history)

---

## Dependency Graph

```
Phase 1: Identity
    |
    v
Phase 2: Persistence
    |
    v
Phase 3: Home & History
```

Linear dependency chain - each phase builds on the previous.

---
*Roadmap created: 2026-01-17*
*Phase 1 planned: 2026-01-17*
*Phase 2 planned: 2026-01-17*
*Phase 3 planned: 2026-01-18*
