# Requirements: Qwirkle Companion

**Defined:** 2026-01-17
**Core Value:** Players can track their Qwirkle game scores easily and never lose their game progress

## v1 Requirements

Requirements for game persistence and history milestone.

### Identity

- [ ] **IDEN-01**: User can enter a passphrase to identify themselves
- [ ] **IDEN-02**: Passphrase is remembered on the device (localStorage)
- [ ] **IDEN-03**: User can change their passphrase from settings

### Persistence

- [ ] **PERS-01**: Game state auto-saves to Firestore on every score change
- [ ] **PERS-02**: Game state includes all players, scores, current turn, round
- [ ] **PERS-03**: Game loads from Firestore on app open (if in-progress game exists)

### History

- [ ] **HIST-01**: Home screen shows list of past games
- [ ] **HIST-02**: Each game shows players, final scores, and winner
- [ ] **HIST-03**: User can tap a completed game to see turn-by-turn breakdown
- [ ] **HIST-04**: In-progress game shows "Continue" option prominently

### Home Screen

- [ ] **HOME-01**: Home screen displays before game setup
- [ ] **HOME-02**: "New Game" button to start fresh game
- [ ] **HOME-03**: "Continue Game" shown when unfinished game exists

## v2 Requirements

Deferred to future milestones.

### Statistics

- **STAT-01**: View win/loss record per player
- **STAT-02**: See average score trends over time
- **STAT-03**: Track personal best scores

### Social

- **SOCL-01**: Share game results with friends
- **SOCL-02**: Compare stats with other players

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth/social login | Passphrase simpler, no account management needed |
| Real-time multi-device sync | One device runs game at a time |
| Offline mode with sync | Requires connectivity, adds complexity |
| Game deletion | Not requested, can add later if needed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| IDEN-01 | Phase 1 | Pending |
| IDEN-02 | Phase 1 | Pending |
| IDEN-03 | Phase 1 | Pending |
| PERS-01 | Phase 2 | Pending |
| PERS-02 | Phase 2 | Pending |
| PERS-03 | Phase 2 | Pending |
| HIST-01 | Phase 3 | Pending |
| HIST-02 | Phase 3 | Pending |
| HIST-03 | Phase 3 | Pending |
| HIST-04 | Phase 3 | Pending |
| HOME-01 | Phase 3 | Pending |
| HOME-02 | Phase 3 | Pending |
| HOME-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-01-17*
*Last updated: 2026-01-17 after roadmap creation*
