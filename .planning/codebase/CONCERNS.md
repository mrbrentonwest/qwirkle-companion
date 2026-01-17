# Codebase Concerns

**Analysis Date:** 2025-01-17

## Tech Debt

**TypeScript Checks Disabled in Build:**
- Issue: `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` for both TypeScript and ESLint
- Files: `next.config.ts`
- Impact: Type errors and linting issues are silently ignored during builds, masking potential bugs
- Fix approach: Remove these flags and fix all TypeScript/ESLint errors, then enable strict checks

**`any` Type Usage:**
- Issue: Explicit `any` types bypass TypeScript's type checking
- Files:
  - `src/components/game/ai-helper-dialog.tsx:153` - `MoveVisualizer({ tiles }: { tiles: any[] })`
  - `src/components/game/ai-helper-dialog.tsx:237` - `catch (error: any)`
- Impact: Loss of type safety, potential runtime errors
- Fix approach: Replace with proper types from AI flow output schemas (`Tile[]` for tiles, `Error` or custom error type for catch blocks)

**No State Persistence:**
- Issue: Game state is only stored in React state with no persistence layer
- Files: `src/app/page.tsx` - `useState<GameState | null>(null)`
- Impact: Refreshing the page loses all game progress, scores, and player data
- Fix approach: Add localStorage persistence using a useEffect to save/restore game state, or use a proper state management solution with persistence middleware

**Large Monolithic Component:**
- Issue: `ai-helper-dialog.tsx` at 817 lines is far too large
- Files: `src/components/game/ai-helper-dialog.tsx`
- Impact: Hard to maintain, test, and understand; slow to load
- Fix approach: Extract into smaller components:
  - `FileUpload` (already defined inline, should be separate file)
  - `EditableTileChip` (already defined inline, should be separate file)
  - `MoveVisualizer` (already defined inline, should be separate file)
  - `AutoScoreTab` and `BestMoveTab` as separate files

**Duplicated Color-to-Hex Mapping:**
- Issue: Color conversion logic repeated in multiple places
- Files:
  - `src/components/game/ai-helper-dialog.tsx:100` (in EditableTileChip)
  - `src/components/game/ai-helper-dialog.tsx:114` (in EditableTileChip)
  - `src/components/game/ai-helper-dialog.tsx:146-147` (in EditableTileChip render)
  - `src/components/game/ai-helper-dialog.tsx:182-185` (in MoveVisualizer)
  - `src/components/game/ai-helper-dialog.tsx:739` (in suggestion render)
- Impact: Error-prone maintenance; inconsistency risk
- Fix approach: Create a `getColorHex(color: string): string` utility function in `src/lib/utils.ts`

**Undo/Redo Grows Unbounded:**
- Issue: History arrays can grow indefinitely during long games
- Files: `src/app/page.tsx:15-16` - `gameHistory` and `futureHistory` state
- Impact: Memory consumption grows linearly with game length; potential performance degradation
- Fix approach: Limit history to a reasonable depth (e.g., 20 entries) with oldest entries dropped

## Known Bugs

**EndGameDialog TypeScript Interface Mismatch:**
- Symptoms: Component has two different parameter signatures
- Files: `src/components/game/end-game-dialog.tsx:19-27`
- Trigger: Interface defines `EndGameDialogProps`, but the component destructures `isGameOver` which is not in the interface
- Workaround: Component still works but relies on TypeScript being disabled

**Unused MoveVisualizer Component:**
- Symptoms: Component defined but never used in the AI helper dialog
- Files: `src/components/game/ai-helper-dialog.tsx:153-195`
- Trigger: Dead code that was presumably planned for move visualization
- Workaround: None needed, just dead code

## Security Considerations

**Exposed API Key in Environment File:**
- Risk: Google API key is stored in `.env.local` and was detected in grep search
- Files: `.env.local:1`
- Current mitigation: `.env*` is in `.gitignore`, so it should not be committed
- Recommendations:
  - Verify the key was never committed to git history
  - Rotate the API key if it was ever exposed
  - Use environment variables from hosting platform for production

**No Rate Limiting on AI Calls:**
- Risk: Users can spam AI helper/auto-score buttons, potentially exhausting API quota or incurring costs
- Files:
  - `src/components/game/ai-helper-dialog.tsx:503` - `handleAutoScore`
  - `src/components/game/ai-helper-dialog.tsx:521` - `handleBestMove`
- Current mitigation: Button disabled during loading state
- Recommendations: Add client-side throttling/debounce and server-side rate limiting per session

**No Input Validation on AI Responses:**
- Risk: Malformed AI responses could cause runtime errors or unexpected UI behavior
- Files:
  - `src/ai/flows/best-option-helper.ts:152-166`
  - `src/ai/flows/automated-score-calculation.ts:74-82`
- Current mitigation: Non-null assertions (`output!`) assume valid responses
- Recommendations: Add proper null checks and response validation; handle partial/malformed responses gracefully

## Performance Bottlenecks

**Image Processing on Main Thread:**
- Problem: Image resizing done synchronously in FileReader callback
- Files: `src/components/game/ai-helper-dialog.tsx:28-54` - `resizeImageAndGetDataUri`
- Cause: Canvas operations and FileReader blocking UI during large image processing
- Improvement path: Move image processing to a Web Worker or use OffscreenCanvas

**Large Base64 Data URIs in State:**
- Problem: Images stored as base64 strings in React state
- Files: `src/components/game/ai-helper-dialog.tsx:436-437` - `boardPhotoDataUri`, `tilesPhotoDataUri`
- Cause: 800px JPEG at 0.7 quality can be 50-200KB of base64 text per image
- Improvement path: Consider using object URLs (`URL.createObjectURL`) instead of data URIs, or compress images more aggressively

**No Lazy Loading for AI Dialog:**
- Problem: AI helper dialog imports and code loads with main bundle
- Files: `src/components/game/game-view.tsx:7` - static import
- Cause: Dialog component with AI flows loaded even when not used
- Improvement path: Use `dynamic()` from Next.js with `ssr: false` to lazy load the dialog

## Fragile Areas

**AI Response Parsing:**
- Files:
  - `src/ai/flows/best-option-helper.ts:152-166`
  - `src/ai/flows/automated-score-calculation.ts:74-82`
- Why fragile: Relies on AI returning valid structured data matching Zod schemas
- Safe modification: Always test with various image inputs; AI responses can be unpredictable
- Test coverage: No automated tests for AI flows

**Qwirkle Detection Logic:**
- Files: `src/app/page.tsx:47-49`
- Why fragile: Hardcoded `score >= 12` to detect Qwirkle, but Qwirkle is specifically 6 tiles completing a line
- Safe modification: A player could manually enter 12+ points for non-Qwirkle moves
- Test coverage: None

**Player ID Generation:**
- Files: `src/app/page.tsx:33-34` - `id: \`${name}-${index}\``
- Why fragile: IDs are based on name and position, so renaming players or changing order could cause issues
- Safe modification: Use UUID or incrementing counter for stable IDs
- Test coverage: None

## Scaling Limits

**Player Count:**
- Current capacity: 2-4 players (enforced in UI)
- Limit: UI layout assumes max 4 players for grid display
- Scaling path: Would need responsive grid for more players

**History Dialog Performance:**
- Current capacity: Works for short games
- Limit: Rendering all turns for long games (100+ turns) could be slow
- Scaling path: Virtualize the turn list or add pagination

## Dependencies at Risk

**Firebase Dependency Unused:**
- Risk: `firebase` (11.9.1) is installed but appears unused in the codebase
- Impact: Unnecessary 500KB+ bundle size increase
- Migration plan: Remove from `package.json` if not planned for future use

**Genkit Version:**
- Risk: Using `genkit` ^1.20.0 which is relatively new
- Impact: API may change, limited community support
- Migration plan: Pin version more strictly, monitor for breaking changes

## Missing Critical Features

**No Offline Support:**
- Problem: App requires network for AI features
- Blocks: Cannot use AI helper without internet connection

**No Game Save/Load:**
- Problem: Cannot save a game and resume later
- Blocks: Must complete games in one session or lose progress

**No Score Edit/Delete:**
- Problem: Once a score is added, it cannot be corrected except via undo
- Blocks: Fixing typos in manual score entry requires multiple undos

## Test Coverage Gaps

**Zero Test Files in Source:**
- What's not tested: Entire application has no test files
- Files: No `*.test.ts`, `*.test.tsx`, or `*.spec.*` files in `src/`
- Risk: Any code changes could introduce regressions undetected
- Priority: High - at minimum add tests for:
  - Score calculation logic
  - Game state transitions
  - Player turn rotation
  - Undo/redo functionality

**AI Flow Output Validation:**
- What's not tested: AI response parsing and sanitization
- Files: `src/ai/flows/*.ts`
- Risk: Malformed AI responses could crash the app
- Priority: Medium

---

*Concerns audit: 2025-01-17*
