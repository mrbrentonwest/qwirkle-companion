'use server';

/**
 * @fileOverview A flow for automatically calculating the score of a Qwirkle board from an image.
 *
 * - automatedScoreCalculation - A function that handles the automated score calculation process.
 * - AutomatedScoreCalculationInput - The input type for the automatedScoreCalculation function.
 * - AutomatedScoreCalculationOutput - The return type for the automatedScoreCalculation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedScoreCalculationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the Qwirkle board, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AutomatedScoreCalculationInput = z.infer<typeof AutomatedScoreCalculationInputSchema>;

const AutomatedScoreCalculationOutputSchema = z.object({
  score: z.number().describe('The calculated score of the Qwirkle board.'),
  details: z.string().describe('Details of how the score was calculated.'),
});
export type AutomatedScoreCalculationOutput = z.infer<typeof AutomatedScoreCalculationOutputSchema>;

export async function automatedScoreCalculation(input: AutomatedScoreCalculationInput): Promise<AutomatedScoreCalculationOutput> {
  return automatedScoreCalculationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedScoreCalculationPrompt',
  input: {schema: AutomatedScoreCalculationInputSchema},
  output: {schema: AutomatedScoreCalculationOutputSchema},
  prompt: `You are an expert Qwirkle score calculator.

## QWIRKLE SCORING RULES

**Tiles:** 6 shapes (circle, star, diamond, square, clover, starburst) × 6 colors (red, orange, yellow, green, blue, purple).

**Line Rules:**
- Lines must contain tiles that are either ALL the same color OR ALL the same shape
- No duplicate tiles allowed in a line
- A line can NEVER be longer than 6 tiles

**Scoring Rules:**
- Score 1 point for EACH tile in every line you create or add to
- A single tile can score points for TWO lines if it's part of both a horizontal and vertical line
- **QWIRKLE BONUS:** Completing a line of all 6 different colors OR all 6 different shapes scores 6 points for the tiles PLUS 6 bonus points = 12 points total

## YOUR TASK

Look at the board image and identify the tiles that were MOST RECENTLY PLAYED (the current turn's move). Calculate the score for ONLY those newly placed tiles based on the lines they create or extend.

Board Image: {{media url=photoDataUri}}

IMPORTANT: You are calculating the score for a SINGLE TURN, not the entire board. Identify which tiles appear to be the newest placement and score only those tiles' contribution to lines.

Respond with:
- The calculated score for this turn
- Details explaining which tiles were scored and how (e.g., "Blue star added to a line of 4 blues = 4 points, also created vertical line of 3 stars = 3 points, total = 7 points")
`,
  model: 'googleai/gemini-2.0-flash',
});

const automatedScoreCalculationFlow = ai.defineFlow(
  {
    name: 'automatedScoreCalculationFlow',
    inputSchema: AutomatedScoreCalculationInputSchema,
    outputSchema: AutomatedScoreCalculationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    // Sanitize score to prevent floating point bugs and unrealistic values
    return {
      ...output!,
      score: Math.min(Math.max(Math.round(output!.score), 0), 100),
    };
  }
);
