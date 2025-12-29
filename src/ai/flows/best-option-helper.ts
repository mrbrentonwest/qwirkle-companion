'use server';

/**
 * @fileOverview Analyzes the Qwirkle board and user's tiles to suggest the top 3 moves.
 *
 * - getBestQwirkleOptions - A function that suggests the best possible moves in Qwirkle.
 * - BestQwirkleOptionsInput - The input type for the getBestQwirkleOptions function.
 * - BestQwirkleOptionsOutput - The return type for the getBestQwirkleOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BestQwirkleOptionsInputSchema = z.object({
  boardPhotoDataUri: z
    .string()
    .describe(
      "A photo of the current Qwirkle board, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  playerTilesPhotoDataUri: z
    .string()
    .describe(
      "A photo of the player's current tiles, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type BestQwirkleOptionsInput = z.infer<typeof BestQwirkleOptionsInputSchema>;

const BestQwirkleOptionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      moveDescription: z.string().describe('A description of the suggested move.'),
      score: z.number().describe('The potential score for this move.'),
    })
  ).describe('The top 3 suggested moves, with descriptions and potential scores.'),
});
export type BestQwirkleOptionsOutput = z.infer<typeof BestQwirkleOptionsOutputSchema>;

export async function getBestQwirkleOptions(input: BestQwirkleOptionsInput): Promise<BestQwirkleOptionsOutput> {
  return bestQwirkleOptionsFlow(input);
}

const bestQwirkleOptionsPrompt = ai.definePrompt({
  name: 'bestQwirkleOptionsPrompt',
  input: {schema: BestQwirkleOptionsInputSchema},
  output: {schema: BestQwirkleOptionsOutputSchema},
  model: 'gemini-pro',
  prompt: `You are an expert Qwirkle player and strategist. Given the current state of the board and the player's tiles, you will analyze the possibilities and suggest the top 3 moves that would yield the highest scores.

Board Image: {{media url=boardPhotoDataUri}}
Player's Tiles Image: {{media url=playerTilesPhotoDataUri}}

Analyze the board and tiles, and provide 3 move suggestions, detailing the move and its potential score. Format each suggestion clearly.

Ensure that the move descriptions are easy to understand and provide strategic insights.

Output the suggestions in JSON format.`,
});

const bestQwirkleOptionsFlow = ai.defineFlow(
  {
    name: 'bestQwirkleOptionsFlow',
    inputSchema: BestQwirkleOptionsInputSchema,
    outputSchema: BestQwirkleOptionsOutputSchema,
  },
  async input => {
    const {output} = await bestQwirkleOptionsPrompt(input);
    return output!;
  }
);
