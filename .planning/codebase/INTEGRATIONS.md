# External Integrations

**Analysis Date:** 2026-01-17

## APIs & External Services

**AI/Vision:**
- Google Generative AI (Gemini) - Board analysis and move suggestions
  - SDK/Client: `genkit`, `@genkit-ai/google-genai`
  - Model: `googleai/gemini-2.0-flash`
  - Auth: `GOOGLE_GENAI_API_KEY` environment variable
  - Configuration: `src/ai/genkit.ts`
  - Usage:
    - `src/ai/flows/best-option-helper.ts` - Analyzes board photos and player tiles to suggest optimal moves
    - `src/ai/flows/automated-score-calculation.ts` - Calculates turn score from board photo

**External Image Sources:**
- placehold.co - Placeholder images (configured in `next.config.ts`)
- unsplash.com - Stock photos (configured in `next.config.ts`)
- picsum.photos - Random photos (configured in `next.config.ts`)

**Google Fonts:**
- fonts.googleapis.com - Font loading
  - Poppins (headline font)
  - PT Sans (body font)
  - Loaded via `<link>` tags in `src/app/layout.tsx`

## Data Storage

**Databases:**
- None - Application uses client-side state only (React useState)

**File Storage:**
- Local filesystem only - No cloud storage
- Images processed as base64 data URIs in browser memory

**Caching:**
- None - No explicit caching layer

**State Management:**
- React useState hooks - Game state managed entirely client-side
- No persistence - Game data lost on page refresh

## Authentication & Identity

**Auth Provider:**
- None - No authentication implemented
- `firebase` package is listed as dependency but not actively used for auth

## Monitoring & Observability

**Error Tracking:**
- None - No error tracking service

**Logs:**
- console.log/console.error - Standard browser console logging

**Analytics:**
- None - No analytics implemented

## CI/CD & Deployment

**Hosting:**
- Firebase App Hosting (target platform)
  - Configuration: `apphosting.yaml`
  - Max instances: 1

**CI Pipeline:**
- None detected - No GitHub Actions or CI configuration files

**Build:**
- Next.js build (`npm run build`)
- Turbopack for development

## Environment Configuration

**Required env vars:**
- `GOOGLE_GENAI_API_KEY` - Required for Gemini AI features

**Optional env vars:**
- None detected

**Secrets location:**
- `.env.local` - Local development (gitignored)
- Firebase App Hosting environment variables (production)

## Webhooks & Callbacks

**Incoming:**
- None - No webhook endpoints

**Outgoing:**
- None - No outbound webhooks

## Browser APIs Used

**MediaDevices API:**
- Camera access for capturing board/tile photos
- Location: `src/components/game/ai-helper-dialog.tsx`
- Permissions: Requires user consent
- Fallback: File upload if camera denied

**Canvas API:**
- Image resizing and compression
- Converts captured images to JPEG at 0.7 quality
- Max width: 800px

**FileReader API:**
- Reading uploaded images as data URIs

## AI Flow Details

**Best Option Helper (`src/ai/flows/best-option-helper.ts`):**
- Input: Board photo (data URI), Player tiles photo (data URI)
- Output: Board lines analysis, Player tiles, Top 3 move suggestions with scores
- Model: `googleai/gemini-2.0-flash`
- Uses vision capabilities to analyze game state

**Automated Score Calculation (`src/ai/flows/automated-score-calculation.ts`):**
- Input: Board photo (data URI)
- Output: Score (number), Calculation details (string)
- Model: `googleai/gemini-2.0-flash`
- Identifies most recently played tiles and calculates turn score

## Integration Notes

**Firebase Package:**
- `firebase` 11.9.1 is installed but not imported anywhere in `src/`
- Likely intended for future features or hosting configuration
- No Firestore, Auth, or other Firebase services currently used

**Genkit Development:**
- `npm run genkit:dev` - Starts Genkit dev server
- `npm run genkit:watch` - Starts Genkit with watch mode
- Dev entry point: `src/ai/dev.ts`

---

*Integration audit: 2026-01-17*
