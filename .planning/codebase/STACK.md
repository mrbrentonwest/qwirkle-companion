# Technology Stack

**Analysis Date:** 2026-01-17

## Languages

**Primary:**
- TypeScript 5.x - All application code (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- CSS - Styling via Tailwind (`src/app/globals.css`)

## Runtime

**Environment:**
- Node.js (version unspecified, ES2017 target in tsconfig)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 15.5.9 - React meta-framework with App Router
- React 19.2.1 - UI library
- React DOM 19.2.1 - DOM rendering

**Styling:**
- Tailwind CSS 3.4.1 - Utility-first CSS
- tailwindcss-animate 1.0.7 - Animation utilities
- PostCSS 8.x - CSS processing

**AI/ML:**
- Genkit 1.20.0 - Google's AI framework for building AI features
- @genkit-ai/google-genai 1.20.0 - Google Generative AI plugin for Genkit
- @genkit-ai/next 1.20.0 - Next.js integration for Genkit

**Forms & Validation:**
- React Hook Form 7.54.2 - Form management
- @hookform/resolvers 4.1.3 - Validation resolvers
- Zod 3.24.2 - Schema validation (also used by Genkit for AI schemas)

**UI Components:**
- shadcn/ui - Component library (via Radix primitives)
- Radix UI - Headless UI primitives (accordion, alert-dialog, avatar, checkbox, collapsible, dialog, dropdown-menu, label, menubar, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, tooltip)
- Lucide React 0.475.0 - Icon library

**Utilities:**
- class-variance-authority 0.7.1 - Variant management for components
- clsx 2.1.1 - Conditional class names
- tailwind-merge 3.0.1 - Merge Tailwind classes
- date-fns 3.6.0 - Date utilities

**Visualization:**
- Recharts 2.15.1 - Charting library
- react-day-picker 9.11.3 - Calendar/date picker
- embla-carousel-react 8.6.0 - Carousel component

**Build/Dev:**
- Next.js with Turbopack (`next dev --turbopack`)
- TypeScript compiler (`tsc`)
- Genkit CLI 1.20.0 - AI flow development tools
- dotenv 16.5.0 - Environment variable loading
- patch-package 8.0.0 - Package patching

## Key Dependencies

**Critical:**
- `next` 15.5.9 - Application framework, handles routing, SSR, API routes
- `genkit` 1.20.0 - Core AI functionality for move suggestions and score calculation
- `@genkit-ai/google-genai` 1.20.0 - Powers vision AI via Gemini 2.0 Flash model
- `firebase` 11.9.1 - Listed but not actively used in current codebase (potential hosting target)

**Infrastructure:**
- `zod` 3.24.2 - Schema definition for AI prompts and validation
- `react-hook-form` 7.54.2 - Game setup form handling

## Configuration

**Environment:**
- `.env.local` - Local environment variables
- `GOOGLE_GENAI_API_KEY` - Required for Genkit/Gemini AI features (implied by googleAI() plugin)

**Build:**
- `next.config.ts` - Next.js configuration
  - TypeScript errors ignored during build (`ignoreBuildErrors: true`)
  - ESLint ignored during build (`ignoreDuringBuilds: true`)
  - Remote image patterns: placehold.co, unsplash, picsum
- `tsconfig.json` - TypeScript configuration
  - Target: ES2017
  - Module: ESNext with bundler resolution
  - Path alias: `@/*` maps to `./src/*`
  - Strict mode enabled
- `tailwind.config.ts` - Tailwind configuration
  - Dark mode via class strategy
  - Custom font families: PT Sans (body), Poppins (headline)
  - CSS variables for theming (shadcn/ui pattern)
  - Custom animations: accordion-up, accordion-down
- `postcss.config.mjs` - PostCSS plugins
- `components.json` - shadcn/ui configuration
  - Style: default
  - RSC: enabled
  - Base color: neutral
  - Icon library: lucide

## Platform Requirements

**Development:**
- Node.js runtime
- npm package manager
- Camera/media access for AI helper feature (browser MediaDevices API)
- HTTPS required for camera in production (noted in code comments)

**Production:**
- Firebase App Hosting (`apphosting.yaml`)
  - Max instances: 1
- Requires `GOOGLE_GENAI_API_KEY` environment variable

**Browser Requirements:**
- Modern browser with MediaDevices API support
- Camera permissions for AI helper features

---

*Stack analysis: 2026-01-17*
