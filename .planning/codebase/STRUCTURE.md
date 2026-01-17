# Codebase Structure

**Analysis Date:** 2026-01-17

## Directory Layout

```
qwirkle-companion/
├── .planning/              # Planning and analysis documents
│   └── codebase/          # Architecture documentation
├── docs/                   # Documentation files
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── design-preview/# Design preview page
│   │   ├── globals.css    # Global styles and CSS variables
│   │   ├── layout.tsx     # Root layout component
│   │   └── page.tsx       # Main game page (all game logic)
│   ├── ai/                # AI/Genkit integration
│   │   ├── flows/         # Genkit flow definitions
│   │   ├── dev.ts         # Genkit dev server entry
│   │   └── genkit.ts      # Genkit configuration
│   ├── components/        # React components
│   │   ├── game/          # Game-specific components
│   │   ├── ui/            # UI primitives (shadcn/ui)
│   │   └── icons.tsx      # SVG icon components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and types
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router pages and layouts
- Contains: Page components, CSS, metadata
- Key files: `page.tsx` (main game), `layout.tsx` (root layout), `globals.css` (theme)

**`src/ai/`:**
- Purpose: AI-powered features using Firebase Genkit
- Contains: Flow definitions, Genkit configuration
- Key files: `genkit.ts` (AI client setup), `flows/*.ts` (server actions)

**`src/ai/flows/`:**
- Purpose: Individual AI flow definitions as server actions
- Contains: Zod schemas, prompts, flow logic
- Key files: `automated-score-calculation.ts`, `best-option-helper.ts`

**`src/components/`:**
- Purpose: Reusable React components
- Contains: Game UI components, UI primitives
- Key files: `icons.tsx` (QwirkleShape component)

**`src/components/game/`:**
- Purpose: Game-specific UI components
- Contains: Game views, dialogs, score displays
- Key files: `game-view.tsx`, `ai-helper-dialog.tsx`, `player-scores.tsx`

**`src/components/ui/`:**
- Purpose: Base UI components (shadcn/ui pattern)
- Contains: Button, Dialog, Input, Card, etc.
- Key files: All standard shadcn/ui components with Radix primitives

**`src/hooks/`:**
- Purpose: Custom React hooks
- Contains: Toast hook, mobile detection hook
- Key files: `use-toast.ts`, `use-mobile.tsx`

**`src/lib/`:**
- Purpose: Shared utilities and type definitions
- Contains: Types, helper functions
- Key files: `types.ts` (game types), `utils.ts` (cn helper, fileToDataUri)

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Main application entry, all game state management
- `src/app/layout.tsx`: Root HTML layout, font loading, Toaster

**Configuration:**
- `next.config.ts`: Next.js settings, image domains, build options
- `tailwind.config.ts`: Theme colors, fonts, animations
- `src/app/globals.css`: CSS custom properties, base styles

**Core Logic:**
- `src/app/page.tsx`: Game state, scoring logic, undo/redo
- `src/ai/flows/automated-score-calculation.ts`: Board image → score
- `src/ai/flows/best-option-helper.ts`: Board + hand images → move suggestions

**Testing:**
- No test files present

## Naming Conventions

**Files:**
- Components: `kebab-case.tsx` (e.g., `game-view.tsx`, `player-scores.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-toast.ts`)
- Types/Utils: `kebab-case.ts` (e.g., `types.ts`, `utils.ts`)
- AI flows: `kebab-case.ts` (e.g., `automated-score-calculation.ts`)

**Directories:**
- All lowercase, hyphenated (e.g., `design-preview`)

**Components:**
- PascalCase exports (e.g., `GameView`, `PlayerScores`)
- Props interfaces: `{ComponentName}Props` (e.g., `GameViewProps`)

**Functions:**
- camelCase (e.g., `handleAddScore`, `resizeImageAndGetDataUri`)

**Types:**
- PascalCase interfaces (e.g., `GameState`, `Player`, `TurnScore`)
- Zod schemas: `{Name}Schema` suffix (e.g., `BestQwirkleOptionsInputSchema`)

## Where to Add New Code

**New Game Feature:**
- State changes: Add to `src/app/page.tsx` (handlers and state)
- UI component: Add to `src/components/game/`
- Types: Extend `src/lib/types.ts`

**New AI Feature:**
- Create new flow: `src/ai/flows/{feature-name}.ts`
- Export server action function from the flow file
- Import and call from component (remember `'use server'` directive)

**New UI Component:**
- Primitive (reusable): `src/components/ui/{component-name}.tsx`
- Game-specific: `src/components/game/{component-name}.tsx`
- Follow shadcn/ui patterns for primitives

**New Page:**
- Create directory: `src/app/{route-name}/`
- Add `page.tsx` inside the directory

**New Hook:**
- Add to `src/hooks/use-{hook-name}.ts`
- Export from the file

**New Utility:**
- Add function to `src/lib/utils.ts`
- Or create new file in `src/lib/` if substantial

## Special Directories

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No (gitignored)

**`.planning/`:**
- Purpose: Project planning and architecture docs
- Generated: No (manually created)
- Committed: Yes

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No (gitignored)

**`.idx/`:**
- Purpose: Project IDX (Google Cloud IDE) configuration
- Generated: Yes
- Committed: May vary

**`.gemini-clipboard/`:**
- Purpose: Gemini AI clipboard integration
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-01-17*
