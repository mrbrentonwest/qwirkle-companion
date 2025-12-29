# **App Name**: Qwirkle Companion

## Core Features:

- Manual Score Keeping: Allows users to manually input player names, set turn order, and enter scores each turn.
- Score Totals and History: Displays score totals for each player and a detailed table of scores per turn, with special formatting for Qwirkles (12+ points).
- Automated Score Calculation: Enables users to capture images of the board and automatically calculate the score for each turn. Offers a camera button for direct image capture.  Allows users to tap a tile to correct its color/shape if the AI misidentifies it before finalizing the score. Stores the game board state to score each turn and track differences.
- Best Option Helper: The AI tool analyzes the current board and user's pieces from captured images to suggest the top 3 possible moves with the highest potential scores. Hybrid AI approach uses vision AI and deterministic algorithms.  Gemini is used to explain the move to the user.
- Score Application from Helper: Allows users to apply a suggested move from the helper directly to their score, streamlining the score-keeping process.
- Turn Tracking with Helper Use: The system will remember when the helper feature was used to allow for full details within the score total and history reports.
- Swap Tiles Tracking: Adds a button for swapping tiles for 0 points, skipping score entry but updating the turn log.
- End-Game Bonus Prompt: Automatically prompts for the 6-point bonus when the game ends.
- Player Profiles & History: Saves active games, tracks stats like 'Most Qwirkles' and 'Highest Single Turn Score'.

## Style Guidelines:

- Primary color: Deep Purple (#673AB7) inspired by the rich, strategic nature of the game.
- Background color: Very light grey (#F0F0F0), a desaturated tint of the primary, will provide a neutral backdrop.
- Accent color: Soft Lavender (#B39DDB) for interactive elements and highlights, analogous to the primary purple.
- Headline font: 'Poppins' sans-serif for a modern, precise feel
- Body font: 'PT Sans' sans-serif complements 'Poppins' headlines with a balance of modern and traditional characteristics.
- Use clear and intuitive icons for score input, camera, and helper features.
- Subtle animations and transitions to indicate turn changes and scoring updates.