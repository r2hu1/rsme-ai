'use server';
/**
 * @fileOverview An AI agent that generates a resume from input text.
 *
 * - generateResumeFromInput - A function that handles the resume generation process.
 */

import {ai} from '@/ai/genkit';
import { GenerateResumeInput, GenerateResumeInputSchema, GenerateResumeOutput, GenerateResumeOutputSchema } from '@/lib/types';


export async function generateResumeFromInput(input: GenerateResumeInput): Promise<GenerateResumeOutput> {
  return generateResumeFromInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeFromInputPrompt',
  input: {schema: GenerateResumeInputSchema},
  output: {schema: GenerateResumeOutputSchema},
  prompt: `You are an expert resume writer. Generate a resume based on the following prompt:\n\n{{{prompt}}}`,
});

const generateResumeFromInputFlow = ai.defineFlow(
  {
    name: 'generateResumeFromInputFlow',
    inputSchema: GenerateResumeInputSchema,
    outputSchema: GenerateResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
