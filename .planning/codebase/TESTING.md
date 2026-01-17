# Testing Patterns

**Analysis Date:** 2026-01-17

## Test Framework

**Runner:**
- **Not configured** - No test framework present in project
- No jest, vitest, or other test runner in dependencies
- No test configuration files in project root

**Package.json Scripts:**
```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 9002 -H 0.0.0.0",
    "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
    "build": "NODE_ENV=production next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

**No test script exists.**

## Test File Organization

**Location:**
- No test files present in `src/` directory
- No `__tests__` directories
- No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files

**Current State:**
- Project has **zero test coverage**
- No unit tests
- No integration tests
- No E2E tests

## Recommended Test Setup

If adding tests to this project, follow these patterns:

### Recommended Framework: Vitest

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/dom jsdom @vitejs/plugin-react
```

**Configuration (vitest.config.ts):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

### Recommended Test Structure

**File Organization:**
```
src/
├── components/
│   └── game/
│       ├── game-view.tsx
│       └── game-view.test.tsx    # Co-located test
├── hooks/
│   ├── use-toast.ts
│   └── use-toast.test.ts         # Co-located test
├── lib/
│   ├── utils.ts
│   └── utils.test.ts             # Co-located test
└── test/
    └── setup.ts                   # Test setup file
```

**Naming Convention:**
- `{filename}.test.tsx` for component tests
- `{filename}.test.ts` for utility/hook tests

### Suggested Test Patterns

**Component Test Pattern:**
```typescript
// Example: game-setup.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GameSetup } from './game-setup'

describe('GameSetup', () => {
  it('renders player inputs', () => {
    const onStartGame = vi.fn()
    render(<GameSetup onStartGame={onStartGame} />)

    expect(screen.getByPlaceholderText('Player 1')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Player 2')).toBeInTheDocument()
  })

  it('disables start button when names are empty', () => {
    const onStartGame = vi.fn()
    render(<GameSetup onStartGame={onStartGame} />)

    const startButton = screen.getByText('START THE GAME!')
    expect(startButton).toBeDisabled()
  })

  it('calls onStartGame with player names', async () => {
    const onStartGame = vi.fn()
    render(<GameSetup onStartGame={onStartGame} />)

    fireEvent.change(screen.getByPlaceholderText('Player 1'), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByPlaceholderText('Player 2'), { target: { value: 'Bob' } })
    fireEvent.click(screen.getByText('START THE GAME!'))

    expect(onStartGame).toHaveBeenCalledWith(['Alice', 'Bob'])
  })
})
```

**Hook Test Pattern:**
```typescript
// Example: use-toast.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useToast, toast } from './use-toast'

describe('useToast', () => {
  it('adds toast to state', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      toast({ title: 'Test Toast' })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Test Toast')
  })
})
```

**Utility Test Pattern:**
```typescript
// Example: utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })
})
```

### Mocking Patterns

**Framework:** Vitest `vi.fn()` and `vi.mock()`

**Mocking AI Flows:**
```typescript
// Mock server actions for testing
vi.mock('@/ai/flows/automated-score-calculation', () => ({
  automatedScoreCalculation: vi.fn().mockResolvedValue({
    score: 7,
    details: 'Test score details'
  })
}))
```

**What to Mock:**
- AI flow functions (`automatedScoreCalculation`, `getBestQwirkleOptions`)
- External API calls
- Browser APIs (FileReader, canvas)
- Toast notifications

**What NOT to Mock:**
- React components under test
- Pure utility functions
- Type definitions

### Test Data Fixtures

**Recommended Location:** `src/test/fixtures/`

**Game State Fixture:**
```typescript
// src/test/fixtures/game-state.ts
import type { GameState, Player, TurnScore } from '@/lib/types'

export const mockPlayer: Player = {
  id: 'player-1',
  name: 'Alice',
  scores: [],
  totalScore: 0,
}

export const mockTurnScore: TurnScore = {
  turnNumber: 1,
  score: 5,
  isQwirkle: false,
  type: 'manual',
}

export const mockGameState: GameState = {
  players: [
    { id: 'player-1', name: 'Alice', scores: [], totalScore: 0 },
    { id: 'player-2', name: 'Bob', scores: [], totalScore: 0 },
  ],
  currentPlayerIndex: 0,
  round: 1,
  isGameActive: true,
  isGameOver: false,
}
```

## Coverage

**Requirements:** None enforced (no tests exist)

**Recommended Coverage Targets:**
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

**Vitest Coverage Setup:**
```bash
npm install -D @vitest/coverage-v8
```

**Package.json Scripts (recommended):**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Priority Test Areas

**High Priority (Core Logic):**
1. `src/app/page.tsx` - Game state management logic
   - `handleAddScore` function
   - `handleEndGame` function
   - `handleUndo`/`handleRedo` functions
   - Score calculation (Qwirkle detection)

2. `src/lib/utils.ts` - Utility functions
   - `cn()` class merging
   - `fileToDataUri()` file handling

3. `src/lib/types.ts` - Type validation (Zod schema tests)

**Medium Priority (Components):**
1. `src/components/game/game-setup.tsx` - Player input handling
2. `src/components/game/current-turn.tsx` - Score input flow
3. `src/components/game/player-scores.tsx` - Score display

**Lower Priority (UI Components):**
- Shadcn/ui components (pre-tested by library)
- Visual/styling components

## E2E Testing

**Current State:** Not implemented

**Recommended Framework:** Playwright

**Setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Example Test:**
```typescript
// e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test'

test('complete game flow', async ({ page }) => {
  await page.goto('/')

  // Setup game
  await page.fill('[placeholder="Player 1"]', 'Alice')
  await page.fill('[placeholder="Player 2"]', 'Bob')
  await page.click('text=START THE GAME!')

  // Verify game started
  await expect(page.getByText("It's Alice's Turn!")).toBeVisible()

  // Add score
  await page.fill('[placeholder="0"]', '5')
  await page.click('[aria-label="Submit score"]')

  // Verify turn changed
  await expect(page.getByText("It's Bob's Turn!")).toBeVisible()
})
```

## Testing Guidelines

**Before Adding Tests:**
1. Install test dependencies (vitest, testing-library)
2. Create `vitest.config.ts` in project root
3. Add test scripts to `package.json`
4. Create setup file at `src/test/setup.ts`

**Test Naming:**
- Use `describe` blocks for grouping related tests
- Use `it` with descriptive action phrases
- Pattern: `it('does something when condition')`

**Async Testing:**
```typescript
it('handles async operations', async () => {
  const result = await someAsyncFunction()
  expect(result).toBe(expected)
})
```

**Error Testing:**
```typescript
it('handles errors gracefully', async () => {
  vi.mocked(aiFlow).mockRejectedValueOnce(new Error('API error'))

  render(<Component />)
  await triggerAction()

  expect(screen.getByText('Error message')).toBeInTheDocument()
})
```

---

*Testing analysis: 2026-01-17*
