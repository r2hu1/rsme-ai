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
  atsScore: z.number().describe('An estimated Applicant Tracking System (ATS) compatibility score (0-100).'),
  effectivenessFeedback: z.string().describe('General feedback on the overall effectiveness of the resume content.'),
  suggestedFixes: z.array(z.string()).describe('A list of specific, actionable suggestions for improvement.'),
});
export type EvaluateResumeContentOutput = z.infer<typeof EvaluateResumeContentOutputSchema>;

export async function evaluateResumeContent(input: EvaluateResumeContentInput): Promise<EvaluateResumeContentOutput> {
  return evaluateResumeContentFlow(input);
}

const evaluateResumeContentPrompt = ai.definePrompt({
  name: 'evaluateResumeContentPrompt',
  input: {schema: EvaluateResumeContentInputSchema},
  output: {schema: EvaluateResumeContentOutputSchema},
  prompt: `You are an expert resume evaluator and career coach. Analyze the following resume content for clarity, grammar, ATS compatibility, and overall effectiveness.

Resume Content:
{{{resumeContent}}}

Provide the following:
1.  A clarity score (0-100).
2.  A grammar score (0-100).
3.  An estimated ATS score (0-100), considering keyword optimization and formatting.
4.  General feedback on the overall effectiveness of the resume content.
5.  A list of specific, actionable suggested fixes to improve the resume.
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
