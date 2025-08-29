'use server';

/**
 * @fileOverview This flow parses an existing resume and extracts key information.
 *
 * - parseExistingResume - A function that handles the resume parsing process.
 */

import {ai} from '@/ai/genkit';
import { ParseExistingResumeInput, ParseExistingResumeInputSchema, ParseExistingResumeOutput, ParseExistingResumeOutputSchema } from '@/lib/types';


export async function parseExistingResume(input: ParseExistingResumeInput): Promise<ParseExistingResumeOutput> {
  return parseExistingResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseExistingResumePrompt',
  input: {schema: ParseExistingResumeInputSchema},
  output: {schema: ParseExistingResumeOutputSchema},
  prompt: `You are an expert resume parser. Extract the following information from the resume text provided. For each item in experience, education, and projects arrays, generate a unique id.

Resume Text: {{{resumeText}}}

Output the extracted information in JSON format. If a field cannot be extracted, leave it blank but do not omit it from the JSON.
`,
});

const parseExistingResumeFlow = ai.defineFlow(
  {
    name: 'parseExistingResumeFlow',
    inputSchema: ParseExistingResumeInputSchema,
    outputSchema: ParseExistingResumeOutputSchema,
  },
  async input => {
    const response = await prompt(input);
    const output = response.output!;

    // Ensure IDs are present
    if (output.experience) {
        output.experience.forEach(item => {
            if (!item.id) item.id = crypto.randomUUID();
        });
    }
    if (output.education) {
        output.education.forEach(item => {
            if (!item.id) item.id = crypto.randomUUID();
        });
    }
     if (output.projects) {
        output.projects.forEach(item => {
            if (!item.id) item.id = crypto.randomUUID();
        });
    }
    
    return output;
  }
);
