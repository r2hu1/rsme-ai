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
  prompt: `You are an expert resume writer. Generate a complete resume in JSON format based on the following prompt. For each item in experience, education, and projects arrays, generate a unique id.

Prompt:
{{{prompt}}}`,
});

const generateResumeFromInputFlow = ai.defineFlow(
  {
    name: 'generateResumeFromInputFlow',
    inputSchema: GenerateResumeInputSchema,
    outputSchema: GenerateResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    const resume = output!;

    // Ensure IDs are present
    if (resume.experience) {
        resume.experience.forEach(item => {
            if (!item.id) item.id = crypto.randomUUID();
        });
    }
    if (resume.education) {
        resume.education.forEach(item => {
            if (!item.id) item.id = crypto.randomUUID();
        });
    }
     if (resume.projects) {
        resume.projects.forEach(item => {
            if (!item.id) item.id = crypto.randomUUID();
        });
    }
    
    return resume;
  }
);
