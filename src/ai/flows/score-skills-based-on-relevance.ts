'use server';
/**
 * @fileOverview A skill scoring AI agent.
 *
 * - scoreSkills - A function that handles the skill scoring process.
 * - ScoreSkillsInput - The input type for the scoreSkills function.
 * - ScoreSkillsOutput - The return type for the scoreSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreSkillsInputSchema = z.object({
  skills: z
    .string()
    .describe('A list of skills to be scored, separated by commas.'),
  jobDescription: z.string().describe('The description of the job market.'),
});
export type ScoreSkillsInput = z.infer<typeof ScoreSkillsInputSchema>;

const ScoreSkillsOutputSchema = z.object({
  scores: z
    .array(
      z.object({
        skill: z.string(),
        score: z.number().min(0).max(100),
      })
    )
    .describe('A list of skills and their relevance scores (0-100).'),
});
export type ScoreSkillsOutput = z.infer<typeof ScoreSkillsOutputSchema>;

export async function scoreSkills(input: ScoreSkillsInput): Promise<ScoreSkillsOutput> {
  return scoreSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreSkillsPrompt',
  input: {schema: ScoreSkillsInputSchema},
  output: {schema: ScoreSkillsOutputSchema},
  prompt: `You are an expert career coach specializing in resume optimization.

You will use this information to score the skills based on their relevance to the job market, and return a JSON object mapping each skill to a score between 0 and 100. 100 means the skill is extremely relevant to the job market and valuable for the user to have, and 0 means the skill is not relevant at all.

Job market description: {{{jobDescription}}}
Skills: {{{skills}}}`,
});

const scoreSkillsFlow = ai.defineFlow(
  {
    name: 'scoreSkillsFlow',
    inputSchema: ScoreSkillsInputSchema,
    outputSchema: ScoreSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
