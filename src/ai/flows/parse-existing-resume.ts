'use server';

/**
 * @fileOverview This flow parses an existing resume and extracts key information.
 *
 * - parseExistingResume - A function that handles the resume parsing process.
 * - ParseExistingResumeInput - The input type for the parseExistingResume function.
 * - ParseExistingResumeOutput - The return type for the parseExistingResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseExistingResumeInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be parsed.'),
});
export type ParseExistingResumeInput = z.infer<typeof ParseExistingResumeInputSchema>;

const ParseExistingResumeOutputSchema = z.object({
  name: z.string().optional().describe('The name of the resume owner.'),
  email: z.string().email().optional().describe('The email address of the resume owner.'),
  phone: z.string().optional().describe('The phone number of the resume owner.'),
  summary: z.string().optional().describe('A brief summary or objective statement.'),
  experience: z
    .array(
      z.object({
        title: z.string().optional().describe('The job title.'),
        company: z.string().optional().describe('The company name.'),
        dates: z.string().optional().describe('The dates of employment.'),
        description: z.string().optional().describe('A description of the job responsibilities.'),
      })
    )
    .optional()
    .describe('A list of work experiences.'),
  education: z
    .array(
      z.object({
        institution: z.string().optional().describe('The name of the educational institution.'),
        degree: z.string().optional().describe('The degree obtained.'),
        dates: z.string().optional().describe('The dates of attendance.'),
      })
    )
    .optional()
    .describe('A list of educational experiences.'),
  skills: z.array(z.string()).optional().describe('A list of skills.'),
  projects: z
    .array(
      z.object({
        name: z.string().optional().describe('The project name.'),
        description: z.string().optional().describe('A description of the project.'),
        dates: z.string().optional().describe('The dates of the project.'),
        url: z.string().optional().describe('A URL for the project.'),
      })
    )
    .optional()
    .describe('A list of projects.'),
});
export type ParseExistingResumeOutput = z.infer<typeof ParseExistingResumeOutputSchema>;

export async function parseExistingResume(input: ParseExistingResumeInput): Promise<ParseExistingResumeOutput> {
  return parseExistingResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseExistingResumePrompt',
  input: {schema: ParseExistingResumeInputSchema},
  output: {schema: ParseExistingResumeOutputSchema},
  prompt: `You are an expert resume parser. Extract the following information from the resume text provided.

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
    const {output} = await prompt(input);
    return output!;
  }
);
