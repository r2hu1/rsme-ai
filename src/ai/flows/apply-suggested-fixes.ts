'use server';

/**
 * @fileOverview This file defines a Genkit flow for applying suggested fixes to a resume.
 *
 * - applySuggestedFixes - Applies suggested fixes to the resume content.
 */

import {ai} from '@/ai/genkit';
import { ApplySuggestedFixesInput, ApplySuggestedFixesInputSchema, ApplySuggestedFixesOutput, ApplySuggestedFixesOutputSchema } from '@/lib/types';


export async function applySuggestedFixes(input: ApplySuggestedFixesInput): Promise<ApplySuggestedFixesOutput> {
  return applySuggestedFixesFlow(input);
}

const applyFixesPrompt = ai.definePrompt({
  name: 'applyFixesPrompt',
  input: {schema: ApplySuggestedFixesInputSchema},
  output: {schema: ApplySuggestedFixesOutputSchema},
  prompt: `You are an expert resume editor. Your task is to apply a list of suggested fixes to the provided resume content.

Analyze the resume content and the list of fixes. Modify the resume content to incorporate all the suggested changes. Ensure the final output is a complete, well-formed JSON object that adheres to the output schema. Do not just return the changed parts; return the entire, updated resume object.

Original Resume Content (JSON):
{{{resumeContent}}}

Suggested Fixes to Apply:
{{#each suggestedFixes}}- {{{this}}}
{{/each}}

Apply the fixes and return the full, updated resume as a JSON object.
`,
});

const applySuggestedFixesFlow = ai.defineFlow(
  {
    name: 'applySuggestedFixesFlow',
    inputSchema: ApplySuggestedFixesInputSchema,
    outputSchema: ApplySuggestedFixesOutputSchema,
  },
  async input => {
    const {output} = await applyFixesPrompt(input);
    return output!;
  }
);
