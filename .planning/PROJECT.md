# Qwirkle Companion

## What This Is

A mobile-friendly score-keeping companion app for the board game Qwirkle. Players use it to track scores during physical games, with AI-powered features that can analyze board photos to calculate scores and suggest optimal moves. v1.0 adds game persistence and history so games survive page refreshes and players can review past games.

## Core Value

Players can track their Qwirkle game scores easily and never lose their game progress, even when accessing via ngrok on mobile.

## Current State

**Version:** v1.0 (shipped 2026-01-18)
**LOC:** ~7,700 TypeScript/TSX
**Tech Stack:** Next.js 15, React 19, Firebase (Firestore + Anonymous Auth), Genkit (Gemini 2.0 Flash)

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
- ✓ Passphrase-based user identity (enter once per device) — v1.0
- ✓ Cloud persistence of game state (Firestore) — v1.0
- ✓ Game history list on home screen (players, scores, winner) — v1.0
- ✓ Game detail view with turn-by-turn breakdown — v1.0
- ✓ Resume incomplete games from home screen — v1.0
- ✓ "Continue game" prompt when opening app with unfinished game — v1.0
- ✓ Auto-save game state on every score change — v1.0

### Active

(None — next milestone requirements to be defined)

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
- Firebase (Firestore for persistence, Anonymous Auth for user isolation)
- Home screen as default entry point with game history

**Access pattern:**
- Primarily accessed via ngrok on mobile phone during physical Qwirkle games
- Cloud storage ensures games persist across sessions and devices

**User flow:**
1. Open app → see home screen with recent games and "Continue" if game in progress
2. Enter passphrase once (stored in localStorage as device identifier)
3. Start new game or continue existing one
4. Play game, scores auto-save to Firestore
5. End game → archived to history, return to home screen
6. View past games with turn-by-turn breakdown

## Constraints

- **Storage**: Firestore — already in Firebase ecosystem, natural fit
- **Identity**: Passphrase-hashed user ID — no OAuth complexity
- **Platform**: Must work on mobile via ngrok — reason for cloud storage choice
- **UX**: Home screen must show history immediately — no navigation to find past games

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cloud over local storage | ngrok URLs change, local storage unreliable | ✓ Good — games persist reliably |
| Passphrase over OAuth | Simpler UX, no account management, fits casual use | ✓ Good — zero friction identity |
| History on home screen | Quick access to recent games and resume option | ✓ Good — immediate context |
| Firestore for persistence | Already have Firebase SDK, Genkit uses Firebase ecosystem | ✓ Good — seamless integration |
| SHA-256 userId as security | Passphrase hash is unguessable, simplifies security rules | ✓ Good — works for personal use |
| Single active game | One game at a time simplifies state management | ✓ Good — matches use case |
| 500ms save debounce | Prevent Firestore rate limits on rapid score entry | ✓ Good — no issues observed |

---
*Last updated: 2026-01-18 after v1.0 milestone*
