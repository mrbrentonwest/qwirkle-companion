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

You will use the image to calculate the score based on the rules of Qwirkle.

Use the following image of the Qwirkle board to calculate the score.

Board Image: {{media url=photoDataUri}}

Respond with the score and details of how the score was calculated.
`,
  model: 'googleai/gemini-1.0-pro-vision-latest',
});

const automatedScoreCalculationFlow = ai.defineFlow(
  {
    name: 'automatedScoreCalculationFlow',
    inputSchema: AutomatedScoreCalculationInputSchema,
    outputSchema: AutomatedScoreCalculationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    