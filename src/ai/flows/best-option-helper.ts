'use server';

/**
 * @fileOverview Analyzes the Qwirkle board and user's tiles to suggest the top 3 moves.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BestQwirkleOptionsInputSchema = z.object({
  boardPhotoDataUri: z
    .string()
    .describe("A photo of the current Qwirkle board as a data URI."),
  playerTilesPhotoDataUri: z
    .string()
    .describe("A photo of the player's current tiles as a data URI."),
});
export type BestQwirkleOptionsInput = z.infer<typeof BestQwirkleOptionsInputSchema>;

const TileSchema = z.object({
  color: z.enum(['red', 'orange', 'yellow', 'green', 'blue', 'purple']),
  shape: z.enum(['circle', 'square', 'diamond', 'star', 'clover', 'starburst']),
});

const BoardLineSchema = z.object({
  direction: z.enum(['horizontal', 'vertical']),
  tiles: z.array(TileSchema).describe('All tiles in this line, in order'),
});

const SuggestionSchema = z.object({
  tilesToPlay: z.array(TileSchema).describe('The exact tiles to play from the hand'),
  tilesToPlayText: z.string().describe('Human readable list, e.g., "GREEN SQUARE + GREEN STARBURST"'),
  placement: z.string().describe('Describe exactly where to place them, e.g., "Extend the green line to the LEFT of the existing green star"'),
  reasoning: z.string().describe('Explain why this is a good move and how the score is calculated'),
  score: z.number().describe('The calculated score for this move'),
});

const BestQwirkleOptionsOutputSchema = z.object({
  boardLines: z.array(BoardLineSchema).describe('All lines on the board - each horizontal and vertical line with 2+ tiles'),
  playerTiles: z.array(TileSchema).describe('All tiles identified in the player hand'),
  suggestions: z.array(SuggestionSchema).describe('The top 3 move suggestions, ordered by score (highest first).'),
});

export type Tile = z.infer<typeof TileSchema>;
export type BoardLine = z.infer<typeof BoardLineSchema>;
export type BestQwirkleOptionsOutput = z.infer<typeof BestQwirkleOptionsOutputSchema>;

const bestQwirkleOptionsPrompt = ai.definePrompt({
  name: 'bestQwirkleOptionsPrompt',
  input: {schema: BestQwirkleOptionsInputSchema},
  output: {schema: BestQwirkleOptionsOutputSchema},
  prompt: `You are an expert Qwirkle strategist helping a player find their best moves.

## QWIRKLE RULES

**Tiles:** 6 colors (red, orange, yellow, green, blue, purple) × 6 shapes

**SHAPE IDENTIFICATION (very important!):**
- **circle** = solid round dot
- **square** = 4-sided square/box shape
- **diamond** = 4-sided rotated square (stands on corner)
- **star** = 4-pointed star (looks like a plus with pointed ends)
- **clover** = 3-lobed clover/club shape (like playing card clubs)
- **starburst** = 8-pointed star (many spiky points radiating out)

**CRITICAL: star (4 points) and starburst (8 points) are DIFFERENT shapes!**

**Placement Rules:**
- Lines must be ALL the same color (with different shapes) OR ALL the same shape (with different colors)
- No duplicate tiles in a line (can't have two blue squares in the same line)
- Lines can be at most 6 tiles long
- New tiles must touch existing tiles, matching by color OR shape

**Scoring:**
- 1 point per tile in each line you create or extend (count ALL tiles in the line, not just new ones)
- A single tile can score for BOTH horizontal AND vertical lines if it connects to both
- QWIRKLE (completing a line of 6): 12 points total (6 for tiles + 6 bonus)

## CRITICAL: MULTI-TILE PLAYS

**You can and SHOULD play MULTIPLE tiles in one turn!** This is the key to high scores.

**Why multi-tile plays are better:**
- Playing 1 tile to extend a line of 2 → scores 3 points
- Playing 2 tiles to extend the same line → scores 4 points (33% more!)
- Playing 3 tiles that form a new line → scores 3 points minimum, often more with cross-scoring

**How to find multi-tile plays:**
1. Look for lines on the board you can extend with 2+ tiles from your hand
2. Look for spots where you can START a new line using 2+ matching tiles
3. Check if tiles can be placed in a row that scores in multiple directions

**ALWAYS check for multi-tile opportunities FIRST before suggesting single-tile plays.**

## IMAGES

**Current Board:**
{{media url=boardPhotoDataUri}}

**Player's Hand:**
{{media url=playerTilesPhotoDataUri}}

## YOUR TASK

1. **ANALYZE THE BOARD FIRST.** In "boardLines", return every line you see as structured data:
   - Each line has a "direction" (horizontal or vertical) and "tiles" array
   - Include lines with 2 or more tiles
   - This step is CRITICAL - you must understand the board before suggesting moves!

2. **Identify ALL tiles in the player's hand.** Return them in "playerTiles" array.

3. **Find the TOP 3 MOVES that score the most points.** For each existing line on the board, check if any tiles in the hand can extend it!

   For each move:

   **tilesToPlay**: Array of tiles to play (can be 1, 2, 3, or more tiles!)

   **tilesToPlayText**: Human readable format like "GREEN SQUARE + GREEN STARBURST" (use + between multiple tiles)

   **placement**: Describe EXACTLY where to put them. Be very specific:
   - Reference existing tiles by color AND shape
   - Use clear directions (LEFT of, RIGHT of, ABOVE, BELOW)
   - For multi-tile plays, explain where EACH tile goes
   - Example: "Place GREEN SQUARE to the LEFT of the green star, then GREEN STARBURST to the LEFT of that, extending the horizontal green line"

   **reasoning**: Explain the score calculation clearly:
   - "Playing 2 tiles extends the green line to 4 tiles = 4 points"
   - "The second tile also connects vertically to the star line = 3 more points. Total: 7 points"

   **score**: The total points for this move

## VALIDATION RULES

- ONLY suggest tiles that are ACTUALLY in the player's hand!
- ONLY suggest moves that are LEGAL:
  - Same-color lines must have ALL DIFFERENT shapes
  - Same-shape lines must have ALL DIFFERENT colors
- Multi-tile plays MUST all go in the SAME LINE (horizontal or vertical)
- Double-check your score calculations
- If a tile scores in two directions, count BOTH lines

## BEFORE YOU RESPOND - CHECKLIST

1. List each tile in the player's hand with EXACT color and shape
2. For EACH suggestion, verify the tiles exist in the hand you identified
3. For EACH suggestion, verify the move is legal (matching color OR shape line)
4. Do NOT confuse star (4-pointed) with starburst (8-pointed)
5. Score = total tiles in the line(s) created/extended, NOT just new tiles`,
  model: 'googleai/gemini-2.5-flash',
});

export async function getBestQwirkleOptions(input: BestQwirkleOptionsInput): Promise<BestQwirkleOptionsOutput> {
  const {output} = await bestQwirkleOptionsPrompt(input);

  // Sanitize scores
  const sanitizedSuggestions = output!.suggestions.map(s => ({
    ...s,
    score: Math.min(Math.max(Math.round(s.score), 0), 100),
  }));

  return {
    boardLines: output!.boardLines || [],
    playerTiles: output!.playerTiles || [],
    suggestions: sanitizedSuggestions,
  };
}
