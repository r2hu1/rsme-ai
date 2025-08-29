'use server';

/**
 * @fileOverview This file defines a Genkit flow for evaluating resume content.
 *
 * - evaluateResumeContent - Evaluates resume content for clarity, grammar, and overall effectiveness.
 * - EvaluateResumeContentInput - The input type for the evaluateResumeContent function.
 * - EvaluateResumeContentOutput - The return type for the evaluateResumeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateResumeContentInputSchema = z.object({
  resumeContent: z.string().describe('The content of the resume to evaluate.'),
});
export type EvaluateResumeContentInput = z.infer<typeof EvaluateResumeContentInputSchema>;

const EvaluateResumeContentOutputSchema = z.object({
  clarityScore: z.number().describe('A score indicating the clarity of the resume content (0-100).'),
  grammarScore: z.number().describe('A score indicating the quality of the grammar in the resume (0-100).'),
  effectivenessFeedback: z.string().describe('Feedback on the overall effectiveness of the resume content.'),
});
export type EvaluateResumeContentOutput = z.infer<typeof EvaluateResumeContentOutputSchema>;

export async function evaluateResumeContent(input: EvaluateResumeContentInput): Promise<EvaluateResumeContentOutput> {
  return evaluateResumeContentFlow(input);
}

const evaluateResumeContentPrompt = ai.definePrompt({
  name: 'evaluateResumeContentPrompt',
  input: {schema: EvaluateResumeContentInputSchema},
  output: {schema: EvaluateResumeContentOutputSchema},
  prompt: `You are an expert resume evaluator. Analyze the following resume content for clarity, grammar, and overall effectiveness.

Resume Content:
{{{resumeContent}}}

Provide a clarity score (0-100), a grammar score (0-100), and feedback on the overall effectiveness of the resume content.

Please adhere to the following format:
{
  "clarityScore": <clarity score>,
  "grammarScore": <grammar score>,
  "effectivenessFeedback": <effectiveness feedback>
}
`,
});

const evaluateResumeContentFlow = ai.defineFlow(
  {
    name: 'evaluateResumeContentFlow',
    inputSchema: EvaluateResumeContentInputSchema,
    outputSchema: EvaluateResumeContentOutputSchema,
  },
  async input => {
    const {output} = await evaluateResumeContentPrompt(input);
    return output!;
  }
);
