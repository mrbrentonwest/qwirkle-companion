# Coding Conventions

**Analysis Date:** 2026-01-17

## Naming Patterns

**Files:**
- React components: `PascalCase.tsx` (e.g., `game-view.tsx` uses kebab-case, but component exports are PascalCase)
- Hooks: `use-{name}.ts` or `use-{name}.tsx` (e.g., `use-toast.ts`, `use-mobile.tsx`)
- Utilities: `kebab-case.ts` (e.g., `utils.ts`, `placeholder-images.ts`)
- Type definitions: `types.ts` in `src/lib/`
- AI flows: `kebab-case.ts` in `src/ai/flows/` (e.g., `best-option-helper.ts`)

**Functions:**
- camelCase for all functions and handlers
- Event handlers prefixed with `handle` (e.g., `handleAddScore`, `handleStartGame`, `handleKeyDown`)
- Callback props prefixed with `on` (e.g., `onAddScore`, `onStartGame`, `onOpenChange`)
- Custom hooks prefixed with `use` (e.g., `useToast`, `useIsMobile`)

**Variables:**
- camelCase for all variables
- Constants in UPPER_SNAKE_CASE (e.g., `TOAST_LIMIT`, `MAX_IMAGE_WIDTH`, `PLAYER_COLORS`)
- State variables use descriptive names (e.g., `gameState`, `showCelebration`, `isAiHelperOpen`)
- Boolean state often prefixed with `is`, `can`, `show` (e.g., `isGameOver`, `canUndo`, `showCelebration`)

**Types:**
- PascalCase for all types and interfaces
- Interface names describe the entity (e.g., `Player`, `GameState`, `TurnScore`)
- Props interfaces suffixed with `Props` (e.g., `GameViewProps`, `CurrentTurnProps`, `GameSetupProps`)
- Schema types exported alongside their Zod schemas (e.g., `BestQwirkleOptionsInput`, `AutomatedScoreCalculationOutput`)

## Code Style

**Formatting:**
- No dedicated Prettier or ESLint configuration in project root
- TypeScript strict mode enabled in `tsconfig.json`
- Next.js built-in linting via `next lint` (but `ignoreDuringBuilds: true` in `next.config.ts`)
- 2-space indentation (consistent across files)
- Single quotes for strings in most files
- No semicolons enforced (mixed usage observed)

**Linting:**
- ESLint: Using Next.js default rules via `next lint` script
- TypeScript errors ignored during builds (`ignoreBuildErrors: true`)
- No explicit linting configuration files in project root

## Import Organization

**Order:**
1. React and React hooks (`import { useState, useCallback } from 'react'`)
2. External libraries (`import { z } from 'genkit'`, `import Image from 'next/image'`)
3. Internal components using path aliases (`import { Button } from '@/components/ui/button'`)
4. Types (`import type { GameState, TurnScore } from '@/lib/types'`)
5. Relative imports for sibling components (`import { PlayerScores } from './player-scores'`)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Use for all non-relative imports within `src/`
- Examples: `@/lib/utils`, `@/components/ui/button`, `@/hooks/use-toast`

## Error Handling

**Patterns:**
- Try-catch in async AI flow calls (see `src/components/game/ai-helper-dialog.tsx`)
- Toast notifications for user-facing errors via `useToast` hook
- Promise rejection handling in utility functions (e.g., `fileToDataUri` in `src/lib/utils.ts`)
- Null checks with early returns (`if (!prev) return null;`)
- Optional chaining for potentially undefined values

**AI Flow Error Handling:**
```typescript
// Pattern from ai-helper-dialog.tsx
try {
  const result = await automatedScoreCalculation(input);
  // handle success
} catch (error) {
  toast({ title: 'Error', description: 'Something went wrong' });
}
```

**State Validation:**
```typescript
// Pattern from page.tsx
const handleAddScore = (score: number, type: TurnScore['type']) => {
  setGameState((prev) => {
    if (!prev) return null;  // Guard clause
    // ... state update logic
  });
};
```

## Logging

**Framework:** Console (no dedicated logging library)

**Patterns:**
- No structured logging observed in codebase
- Debug logging not present in production code
- AI flows use server-side execution (`'use server'`) without explicit logging

## Comments

**When to Comment:**
- File-level JSDoc comments for AI flow files (e.g., `@fileOverview` in `src/ai/flows/`)
- Inline comments for complex logic sections
- No extensive commenting throughout components

**JSDoc/TSDoc:**
```typescript
// Pattern from automated-score-calculation.ts
/**
 * @fileOverview A flow for automatically calculating the score of a Qwirkle board from an image.
 *
 * - automatedScoreCalculation - A function that handles the automated score calculation process.
 * - AutomatedScoreCalculationInput - The input type for the automatedScoreCalculation function.
 * - AutomatedScoreCalculationOutput - The return type for the automatedScoreCalculation function.
 */
```

**Zod Schema Descriptions:**
```typescript
// Pattern used for AI schema documentation
z.string().describe("A photo of the current Qwirkle board as a data URI.")
z.number().describe('The calculated score of the Qwirkle board.')
```

## Function Design

**Size:**
- Small, focused functions preferred
- Component functions typically under 100 lines
- Complex UI components may be larger (e.g., `ai-helper-dialog.tsx` is a notable exception)

**Parameters:**
- Destructured props in component signatures
- Single object parameter for complex inputs
- TypeScript interfaces for all props

**Pattern:**
```typescript
// Component function pattern
interface ComponentProps {
  prop1: Type1;
  prop2: Type2;
  onCallback: (arg: ArgType) => void;
}

export function Component({ prop1, prop2, onCallback }: ComponentProps) {
  // implementation
}
```

**Return Values:**
- Components return JSX.Element
- Hooks return objects or tuples with named values
- Async functions return Promise with typed output

## Module Design

**Exports:**
- Named exports for components and utilities
- Default export for page components (Next.js convention)
- Types exported alongside their implementations
- UI components export both component and variants (e.g., `Button, buttonVariants`)

**Pattern:**
```typescript
// UI component export pattern (from button.tsx)
export { Button, buttonVariants }

// Type export pattern (from types.ts)
export interface Player { ... }
export interface GameState { ... }
```

**Barrel Files:**
- Not used - direct imports to specific files
- Each component file exports its own contents

## Component Patterns

**Client Components:**
- Marked with `'use client'` directive at top of file
- Used for all interactive components with hooks

**Server Actions:**
- Marked with `'use server'` directive
- Used for AI flows (`src/ai/flows/`)

**State Management:**
- Local React state with `useState`
- No global state management library
- State lifting to parent components (game state in `page.tsx`)

**UI Components:**
- Shadcn/ui component library (`src/components/ui/`)
- Components wrap Radix UI primitives
- Use `cn()` utility for className merging
- Forward refs for all UI primitives
- Class Variance Authority (CVA) for component variants

**Component Structure:**
```typescript
// UI component pattern (from card.tsx)
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("base-classes", className)}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
```

## Styling Patterns

**Tailwind CSS:**
- Primary styling approach
- CSS variables for theming (defined in `globals.css`)
- Custom color palette using HSL values
- Responsive utilities used sparingly (mobile-first app)

**Class Merging:**
```typescript
// Always use cn() from @/lib/utils for conditional classes
import { cn } from '@/lib/utils';

className={cn(
  "base-classes",
  condition && "conditional-classes",
  className  // Allow override from props
)}
```

**Custom CSS Classes:**
- `.btn-chunky` - custom button style in `globals.css`
- CSS variables for design tokens (colors, radius, etc.)

**Depth/Shadow System:**
```typescript
// Pattern from ai-helper-dialog.tsx
const depthStyles = {
  raised: "bg-white shadow-[inset_0_1px_0_0_rgba(255,255,255,1.0),0_4px_6px_-1px_rgba(0,0,0,0.1)]...",
  recessed: "bg-gray-100 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)]...",
  buttonPrimary: "bg-orange-600 shadow-[...]..."
};
```

---

*Convention analysis: 2026-01-17*
