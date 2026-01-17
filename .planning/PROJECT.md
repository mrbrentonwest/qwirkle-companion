# Qwirkle Companion

## What This Is

A mobile-friendly score-keeping companion app for the board game Qwirkle. Players use it to track scores during physical games, with AI-powered features that can analyze board photos to calculate scores and suggest optimal moves. This milestone adds game persistence and history so games survive page refreshes and players can review past games.

## Core Value

Players can track their Qwirkle game scores easily and never lose their game progress, even when accessing via ngrok on mobile.

## Requirements

### Validated

- ✓ Manual score entry with turn tracking — existing
- ✓ Player management (add 2-4 players with names) — existing
- ✓ Running totals and current player indication — existing
- ✓ Qwirkle bonus detection and scoring — existing
- ✓ AI-powered score calculation from board photos — existing
- ✓ AI-powered best move suggestions from board + hand photos — existing
- ✓ Undo/redo for score entries — existing
- ✓ End game with final scores display — existing

### Active

- [ ] Passphrase-based user identity (enter once per device)
- [ ] Cloud persistence of game state (Firestore)
- [ ] Game history list on home screen (players, scores, winner)
- [ ] Game detail view with turn-by-turn breakdown
- [ ] Resume incomplete games from home screen
- [ ] "Continue game" prompt when opening app with unfinished game
- [ ] Auto-save game state on every score change

### Out of Scope

- OAuth/social login — passphrase is simpler, no account management needed
- Multi-device real-time sync during a game — one device runs the game at a time
- Sharing games with other users — personal history only
- Game statistics/analytics — just history for now
- Offline mode with sync — requires connectivity

## Context

**Existing codebase:**
- Next.js 15 with App Router, React 19, TypeScript
- Firebase Genkit for AI features (Gemini 2.0 Flash)
- shadcn/ui + Radix for components, Tailwind for styling
- All game state currently in React useState (no persistence)
- Firebase SDK installed but not actively used

**Access pattern:**
- Primarily accessed via ngrok on mobile phone during physical Qwirkle games
- Local storage unreliable due to changing ngrok URLs
- Cloud storage ensures games persist across sessions

**User flow:**
1. Open app → see home screen with recent games and "Continue" if game in progress
2. Enter passphrase once (stored in localStorage as device identifier)
3. Start new game or continue existing one
4. Play game, scores auto-save to Firestore
5. End game or close app → game saved, can resume or view later

## Constraints

- **Storage**: Firestore — already in Firebase ecosystem, natural fit
- **Identity**: Passphrase-hashed user ID — no OAuth complexity
- **Platform**: Must work on mobile via ngrok — reason for cloud storage choice
- **UX**: Home screen must show history immediately — no navigation to find past games

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cloud over local storage | ngrok URLs change, local storage unreliable | — Pending |
| Passphrase over OAuth | Simpler UX, no account management, fits casual use | — Pending |
| History on home screen | Quick access to recent games and resume option | — Pending |
| Firestore for persistence | Already have Firebase SDK, Genkit uses Firebase ecosystem | — Pending |

---
*Last updated: 2026-01-17 after initialization*
