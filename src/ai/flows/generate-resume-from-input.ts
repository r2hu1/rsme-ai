// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview An AI agent that generates a resume from input text.
 *
 * - generateResumeFromInput - A function that handles the resume generation process.
 * - GenerateResumeInput - The input type for the generateResumeFromInput function.
 * - GenerateResumeOutput - The return type for the generateResumeFromInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeInputSchema = z.object({
  prompt: z.string().describe('A detailed prompt describing the desired resume content, skills, experience, and format.'),
});
export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

const GenerateResumeOutputSchema = z.object({
  resumeContent: z.string().describe('The generated resume content in a suitable format (e.g., text, markdown, or JSON).'),
});
export type GenerateResumeOutput = z.infer<typeof GenerateResumeOutputSchema>;

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
