# Architecture

**Analysis Date:** 2026-01-17

## Pattern Overview

**Overall:** Client-side Single Page Application with AI-powered Server Actions

**Key Characteristics:**
- Next.js App Router with client-side state management
- No database - game state lives entirely in React component state
- AI features via Firebase Genkit server actions (image analysis)
- Mobile-first responsive design with playful UI patterns
- All game logic colocated in the main page component

## Layers

**Presentation Layer:**
- Purpose: Renders UI and handles user interactions
- Location: `src/components/`
- Contains: React components (game UI, dialogs, UI primitives)
- Depends on: Types, Utils, UI library (shadcn/ui + Radix)
- Used by: App pages

**Application Layer:**
- Purpose: Orchestrates game flow and state management
- Location: `src/app/page.tsx`
- Contains: Game state, event handlers, business logic
- Depends on: Components, Types
- Used by: End users

**AI/Server Layer:**
- Purpose: Processes images and provides AI-powered analysis
- Location: `src/ai/`
- Contains: Genkit flows for score calculation and move suggestions
- Depends on: Google Generative AI (Gemini 2.0 Flash)
- Used by: AI Helper Dialog component

**Infrastructure Layer:**
- Purpose: Shared utilities and type definitions
- Location: `src/lib/`
- Contains: Type definitions, utility functions
- Depends on: External utilities (clsx, tailwind-merge)
- Used by: All other layers

## Data Flow

**Score Entry Flow:**

1. User enters score in `CurrentTurn` component input
2. `handleAddScore` in `page.tsx` receives score and type
3. State update: new TurnScore added to current player
4. Player index rotates, round increments if needed
5. UI re-renders with updated scores

**AI Score Calculation Flow:**

1. User captures/uploads board photo in `AiHelperDialog`
2. Image resized client-side to max 800px width
3. `automatedScoreCalculation` server action called with base64 data URI
4. Genkit flow sends image to Gemini 2.0 Flash with scoring prompt
5. AI returns score and explanation
6. User can accept and apply score to game state

**AI Best Move Flow:**

1. User captures board photo AND hand photo
2. `getBestQwirkleOptions` server action receives both images
3. Genkit prompt asks AI to identify board lines and hand tiles
4. AI returns structured data: board lines, player tiles, top 3 suggestions
5. User can edit detected tiles (color/shape corrections)
6. User selects a suggestion to apply its score

**State Management:**
- Game state held in `useState` hook in `src/app/page.tsx`
- Undo/redo via separate history stacks (`gameHistory`, `futureHistory`)
- No persistence - state lost on page refresh
- State flows down via props to child components

## Key Abstractions

**GameState:**
- Purpose: Represents entire game at any point in time
- Definition: `src/lib/types.ts`
- Properties: players[], currentPlayerIndex, round, isGameActive, isGameOver

**Player:**
- Purpose: Represents a player with their score history
- Definition: `src/lib/types.ts`
- Properties: id, name, scores[], totalScore

**TurnScore:**
- Purpose: Records a single turn's scoring event
- Definition: `src/lib/types.ts`
- Properties: turnNumber, score, isQwirkle, type ('manual' | 'auto-score' | 'helper' | 'swap' | 'bonus')

**Tile:**
- Purpose: Represents a Qwirkle tile (used in AI flows)
- Definition: `src/ai/flows/best-option-helper.ts`
- Properties: color (enum), shape (enum)

**BoardLine:**
- Purpose: Represents a line of tiles on the board
- Definition: `src/ai/flows/best-option-helper.ts`
- Properties: direction ('horizontal' | 'vertical'), tiles[]

## Entry Points

**Main Application:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to `/`
- Responsibilities: Renders game setup or active game view, manages all game state

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page load
- Responsibilities: HTML structure, font loading, global styles, Toaster component

**AI Server Actions:**
- Location: `src/ai/flows/automated-score-calculation.ts`, `src/ai/flows/best-option-helper.ts`
- Triggers: Called from `AiHelperDialog` component
- Responsibilities: Process images via Genkit/Gemini, return structured scoring data

**Genkit Dev Server:**
- Location: `src/ai/dev.ts`
- Triggers: `npm run genkit:dev`
- Responsibilities: Local development server for testing AI flows

## Error Handling

**Strategy:** Minimal - toast notifications for user-facing errors, console logging for development

**Patterns:**
- Try/catch in async operations (AI flows, camera access)
- Toast notifications via `useToast` hook for user feedback
- AI score sanitization: clamped to 0-100, rounded to integers
- Camera errors show specific messages based on error type (NotAllowedError, NotFoundError, etc.)

## Cross-Cutting Concerns

**Logging:** Console logging only, no structured logging system

**Validation:**
- Zod schemas for AI flow inputs/outputs
- Basic form validation (player names required)
- Score input allows 0+ integers

**Authentication:** None - anonymous single-device use

**Styling:**
- Tailwind CSS with custom CSS variables for theming
- Radix UI primitives with shadcn/ui component patterns
- Custom "depth" styling system for raised/recessed effects
- Two font families: Poppins (headlines), PT Sans (body)

---

*Architecture analysis: 2026-01-17*
