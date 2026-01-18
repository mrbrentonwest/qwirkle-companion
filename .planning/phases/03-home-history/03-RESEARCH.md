# Phase 3: Home & History - Research

**Researched:** 2026-01-17
**Domain:** Firestore game history, Next.js routing, home screen UI patterns
**Confidence:** HIGH

## Summary

This phase transforms the app from "straight to game" to a proper home screen with game history. The core challenges are: (1) storing completed games in Firestore alongside the existing active game, (2) creating a home screen that shows both the active game continuation option and past games, and (3) building the UI for listing games and viewing completed game details.

The existing infrastructure from Phase 2 provides a solid foundation. The `users/{userId}/activeGame/current` document path already exists - we need to add a sibling subcollection `users/{userId}/gameHistory/{gameId}` for completed games. When a game ends (`isGameOver: true`), it should be archived to gameHistory and the activeGame cleared.

**Primary recommendation:** Use conditional rendering in a refactored `page.tsx` to show Home vs Game views (no new routes needed). Store completed games in a `gameHistory` subcollection with auto-generated IDs. Query with `orderBy('completedAt', 'desc')` and `limit(10)` for the home screen list. Reuse the existing `ScoreHistoryDialog` pattern for viewing completed game details.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| firebase/firestore | 11.9.1 (bundled) | Game history CRUD | Already integrated in Phase 2 |
| react | 19.x | Conditional rendering, state | Already the foundation |
| next/link | 15.x | Navigation (if routes added) | Built-in, prefetching |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.x | Date formatting for "2 days ago" | Human-readable timestamps |
| lucide-react | (installed) | Icons for home screen | Already used throughout app |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Conditional rendering | App Router routes (`/`, `/game`) | Overkill - state already in page.tsx, would need to lift state to context |
| date-fns | Native Intl.RelativeTimeFormat | date-fns simpler API, more consistent |
| Auto-generated IDs | Timestamps as IDs | Auto IDs are simpler, avoid collisions |

**Installation:**
```bash
npm install date-fns
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── page.tsx              # Now shows Home or Game based on gameState
├── components/
│   ├── home/
│   │   ├── home-screen.tsx   # Main home component
│   │   ├── game-history-list.tsx  # List of past games
│   │   ├── game-history-item.tsx  # Single game card
│   │   └── empty-history.tsx # Empty state
│   └── game/
│       └── game-detail-dialog.tsx  # View completed game details
├── hooks/
│   └── use-game-history.ts   # Fetch game history from Firestore
└── lib/
    └── firestore-game.ts     # Add archiveGame, getGameHistory
```

### Pattern 1: Conditional View Rendering
**What:** Render Home or Game based on gameState presence
**When to use:** When the app has two main "modes" without needing separate routes
**Example:**
```typescript
// src/app/page.tsx
export default function Home() {
  const [view, setView] = useState<'home' | 'game'>('home');
  const [gameState, setGameState] = useState<GameState | null>(null);

  // If there's an active game, show game view
  // If user explicitly navigated to home, show home
  // Otherwise, determine from initialGame

  return view === 'home' ? (
    <HomeScreen
      onNewGame={handleStartNewGame}
      onContinueGame={() => setView('game')}
      hasActiveGame={!!initialGame}
    />
  ) : (
    <GameView gameState={gameState} /* ... */ />
  );
}
```

### Pattern 2: Firestore Subcollection for Game History
**What:** Store completed games in a subcollection parallel to activeGame
**When to use:** When storing many related documents per user
**Example:**
```typescript
// Firestore structure:
// users/{userId}/
//   ├── activeGame/
//   │   └── current (single active game)
//   └── gameHistory/
//       ├── {auto-id-1}
//       ├── {auto-id-2}
//       └── ...

// src/lib/firestore-game.ts
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

export async function archiveGame(userId: string, gameState: GameState): Promise<string> {
  const historyRef = collection(db, 'users', userId, 'gameHistory');
  const docRef = await addDoc(historyRef, {
    ...gameState,
    completedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getGameHistory(userId: string, maxGames = 10): Promise<StoredGameState[]> {
  const historyRef = collection(db, 'users', userId, 'gameHistory');
  const q = query(historyRef, orderBy('completedAt', 'desc'), limit(maxGames));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredGameState));
}
```

### Pattern 3: Game History Hook
**What:** React hook for fetching and managing game history
**When to use:** When multiple components need game history data
**Example:**
```typescript
// src/hooks/use-game-history.ts
import { useState, useEffect } from 'react';
import { getGameHistory } from '@/lib/firestore-game';

export function useGameHistory(userId: string | null, isFirebaseReady: boolean) {
  const [games, setGames] = useState<StoredGameState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !isFirebaseReady) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchHistory() {
      try {
        const history = await getGameHistory(userId);
        if (!cancelled) {
          setGames(history);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load history'));
          setIsLoading(false);
        }
      }
    }

    fetchHistory();
    return () => { cancelled = true; };
  }, [userId, isFirebaseReady]);

  return { games, isLoading, error };
}
```

### Pattern 4: Empty State Component
**What:** Dedicated component for when there's no game history
**When to use:** First-time users, users with no completed games
**Example:**
```typescript
// src/components/home/empty-history.tsx
export function EmptyHistory({ onNewGame }: { onNewGame: () => void }) {
  return (
    <div className="text-center py-12 space-y-4">
      <QwirkleShape shape="starburst" className="h-16 w-16 text-gray-300 mx-auto" />
      <div>
        <h3 className="font-headline text-lg font-bold text-gray-700">No games yet</h3>
        <p className="text-gray-500 text-sm">Start your first game and it will appear here</p>
      </div>
      <Button onClick={onNewGame}>Start Your First Game</Button>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Storing full game history in active game document:** Document size limits and unnecessary data duplication
- **Using real-time listener for game history:** One-time fetch is sufficient; history doesn't change often
- **Creating new routes for home/game:** Over-engineering; conditional rendering simpler given existing state
- **Fetching all games without limit:** Always use `limit()` for efficiency

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Relative dates | Custom "X days ago" logic | `date-fns/formatDistanceToNow` | Edge cases with months, years, localization |
| Query pagination | Manual offset tracking | Firestore cursors + `startAfter` | Efficient, consistent with Firestore patterns |
| Empty states | Ad-hoc conditional divs | Dedicated EmptyState component | Reusable, consistent UX |
| Optimistic UI | Manual state synchronization | Keep local state, sync async | Simpler than bidirectional sync |

**Key insight:** The game history read pattern is simple (fetch once on mount). Don't add complexity like real-time listeners or caching unless proven necessary.

## Common Pitfalls

### Pitfall 1: Forgetting to Archive Before Clear
**What goes wrong:** Game ends, activeGame cleared, but game never saved to history
**Why it happens:** `clearActiveGame` called before `archiveGame`
**How to avoid:** Always archive first, then clear:
```typescript
async function handleEndGame(bonusPlayerId: string | null) {
  // 1. First, finalize game state
  const finalState = { ...gameState, isGameOver: true, /* bonus applied */ };

  // 2. Archive to history
  await archiveGame(userId, finalState);

  // 3. THEN clear active game
  await clearActiveGame(userId);

  // 4. Navigate to home
  setView('home');
}
```
**Warning signs:** Completed games not appearing in history

### Pitfall 2: Missing `completedAt` Field
**What goes wrong:** `orderBy('completedAt')` query fails or returns no results
**Why it happens:** Archived games don't have completedAt timestamp
**How to avoid:** Always add completedAt when archiving:
```typescript
await addDoc(historyRef, {
  ...gameState,
  completedAt: new Date().toISOString(), // Critical for ordering
});
```
**Warning signs:** "Error: Invalid query" or empty history list

### Pitfall 3: Index Not Created
**What goes wrong:** Firestore query throws error about missing index
**Why it happens:** Queries with `orderBy` + `limit` need composite indexes
**How to avoid:**
- Check Firestore console for index suggestions
- For simple `orderBy` on single field, index is auto-created
- Click the error link in console to create index
**Warning signs:** "The query requires an index" error

### Pitfall 4: Hydration Mismatch on Date Formatting
**What goes wrong:** Server-rendered date differs from client-rendered date
**Why it happens:** Timezone differences between server and client
**How to avoid:** Use `'use client'` directive on components that format dates, or defer date formatting to client:
```typescript
// Safe pattern
const [formattedDate, setFormattedDate] = useState<string>('');
useEffect(() => {
  setFormattedDate(formatDistanceToNow(new Date(game.completedAt), { addSuffix: true }));
}, [game.completedAt]);
```
**Warning signs:** Hydration error, "Text content did not match"

### Pitfall 5: Winner Calculation Error on Ties
**What goes wrong:** No winner shown, or wrong winner when scores are tied
**Why it happens:** Simple `Math.max` or sort doesn't handle ties
**How to avoid:** Explicitly handle ties:
```typescript
function getWinner(players: Player[]): Player | null {
  if (players.length === 0) return null;
  const maxScore = Math.max(...players.map(p => p.totalScore));
  const winners = players.filter(p => p.totalScore === maxScore);
  // If tie, could return first, show "Tie", or all winners
  return winners.length === 1 ? winners[0] : null; // null indicates tie
}
```
**Warning signs:** Crown icon appearing on multiple players, or none

## Code Examples

Verified patterns from official sources:

### Firestore getDocs with orderBy and limit
```typescript
// Source: Firebase official docs
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

async function getRecentGames(userId: string): Promise<GameState[]> {
  const historyRef = collection(db, 'users', userId, 'gameHistory');
  const q = query(
    historyRef,
    orderBy('completedAt', 'desc'),  // Most recent first
    limit(10)                         // Only fetch 10
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as GameState));
}
```

### Firestore addDoc to Subcollection
```typescript
// Source: Firebase official docs
import { collection, addDoc } from 'firebase/firestore';

async function saveCompletedGame(userId: string, game: GameState): Promise<string> {
  const historyRef = collection(db, 'users', userId, 'gameHistory');

  const docRef = await addDoc(historyRef, {
    ...game,
    completedAt: new Date().toISOString(),
  });

  console.log('Game archived with ID:', docRef.id);
  return docRef.id;
}
```

### date-fns formatDistanceToNow
```typescript
// Source: date-fns official docs
import { formatDistanceToNow } from 'date-fns';

// Returns "2 days ago", "about 1 month ago", etc.
const relativeTime = formatDistanceToNow(new Date(game.completedAt), {
  addSuffix: true  // Adds "ago" suffix
});
```

### Next.js useRouter for Programmatic Navigation (if needed)
```typescript
// Source: Next.js official docs
'use client';
import { useRouter } from 'next/navigation';

export function GameHistoryItem({ game }: { game: GameState }) {
  const router = useRouter();

  return (
    <button onClick={() => router.push(`/game/${game.id}`)}>
      View Game
    </button>
  );
}
```

## Data Model

### Extended GameState for History
```typescript
// src/lib/types.ts - extend existing types

export interface StoredGameState extends GameState {
  id?: string;          // Firestore document ID (for history items)
  createdAt: string;    // ISO timestamp when game started
  updatedAt: string;    // ISO timestamp of last update
  completedAt?: string; // ISO timestamp when game ended (history only)
}
```

### Firestore Document Structure
```
firestore/
└── users/
    └── {userId}/
        ├── activeGame/
        │   └── current           # Single in-progress game
        │       ├── players: Player[]
        │       ├── currentPlayerIndex: number
        │       ├── round: number
        │       ├── isGameActive: boolean
        │       ├── isGameOver: boolean (always false for active)
        │       ├── createdAt: string
        │       └── updatedAt: string
        │
        └── gameHistory/
            └── {auto-generated-id}  # Completed games
                ├── players: Player[]
                ├── currentPlayerIndex: number (final)
                ├── round: number (final)
                ├── isGameActive: false
                ├── isGameOver: true
                ├── createdAt: string
                ├── updatedAt: string
                └── completedAt: string  # When archived
```

### Security Rules Update
```javascript
// firestore.rules - extend existing rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      // Allow authenticated users to access their own data
      // Covers both activeGame and gameHistory subcollections
      allow read, write: if request.auth != null;
    }
  }
}
```

Note: Existing security rules from Phase 2 already use `{document=**}` wildcard, so gameHistory subcollection is automatically covered.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate routes for each view | Conditional rendering for simple cases | Always valid | Less complexity when state is shared |
| `moment.js` for dates | `date-fns` (tree-shakeable) | 2020+ | Smaller bundle size |
| `onSnapshot` for everything | `getDocs` for read-once data | Always valid | Simpler, fewer listeners |
| Global state for view routing | Local component state | Context-dependent | Simpler for single-page apps |

**Deprecated/outdated:**
- `moment.js`: Use `date-fns` instead (tree-shakeable, smaller)
- `next/router`: Use `next/navigation` in App Router

## Open Questions

Things that couldn't be fully resolved:

1. **Pagination Strategy**
   - What we know: `limit(10)` is reasonable for initial load
   - What's unclear: Do we need "Load More" pagination, or is 10 games always enough?
   - Recommendation: Start with 10 games, add pagination if users request it

2. **Game Detail View: Dialog vs Page**
   - What we know: ScoreHistoryDialog already shows turn-by-turn breakdown
   - What's unclear: Should completed game details be a dialog (like current) or a separate page?
   - Recommendation: Use dialog for consistency with existing UX; easier implementation

3. **Active Game Synchronization**
   - What we know: useGamePersistence already handles active game sync
   - What's unclear: Should we refetch history when returning to home?
   - Recommendation: Refetch on home screen mount for simplicity

## Sources

### Primary (HIGH confidence)
- [Firebase Firestore Data Model](https://firebase.google.com/docs/firestore/data-model) - Subcollection patterns
- [Firebase Order and Limit Data](https://firebase.google.com/docs/firestore/query-data/order-limit-data) - Query patterns
- [Firebase Get Data](https://firebase.google.com/docs/firestore/query-data/get-data) - getDocs API
- [Next.js useRouter](https://nextjs.org/docs/app/api-reference/functions/use-router) - Navigation API
- [Next.js Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating) - Link component

### Secondary (MEDIUM confidence)
- [Fireship: Advanced Firestore Data Modeling](https://fireship.io/lessons/advanced-firestore-nosql-data-structure-examples/) - Subcollection best practices
- [LogRocket: UI best practices for loading, error, and empty states](https://blog.logrocket.com/ui-design-best-practices-loading-error-empty-state-react/) - Empty state patterns

### Tertiary (LOW confidence)
- [date-fns documentation](https://date-fns.org/) - formatDistanceToNow API (verify current syntax)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Building on existing Phase 2 infrastructure
- Architecture: HIGH - Patterns verified against Firebase and Next.js docs
- Data model: HIGH - Direct extension of existing Firestore structure
- Pitfalls: MEDIUM - Based on common patterns, some project-specific

**Research date:** 2026-01-17
**Valid until:** 30 days (Firebase SDK stable, patterns unlikely to change)
