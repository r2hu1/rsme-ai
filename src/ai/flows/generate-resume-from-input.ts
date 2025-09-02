'use server';

import { getConfiguredAI } from '@/ai/genkit';
import { GenerateResumeInput, GenerateResumeInputSchema, GenerateResumeOutput, GenerateResumeOutputSchema } from '@/lib/types';

export async function generateResumeFromInput(
  input: GenerateResumeInput,
  apiKey?: string,
  model?: string
): Promise<GenerateResumeOutput> {
  const ai = getConfiguredAI(apiKey, model);
  return generateResumeFromInputFlow(input, ai);
}

function generateResumeFromInputFlow(input: GenerateResumeInput, ai: any): Promise<GenerateResumeOutput> {
  const prompt = ai.definePrompt({
    name: 'generateResumeFromInputPrompt',
    input: { schema: GenerateResumeInputSchema },
    output: { schema: GenerateResumeOutputSchema },
    prompt: `You are an expert resume writer. Generate a complete resume in JSON format based on the following prompt. For each item in experience, education, and projects arrays, generate a unique id.

Prompt:
{{{prompt}}}`,
  });

  const flow = ai.defineFlow(
    {
      name: 'generateResumeFromInputFlow',
      inputSchema: GenerateResumeInputSchema,
      outputSchema: GenerateResumeOutputSchema,
    },
    async (flowInput: GenerateResumeInput) => {
      const { output } = await prompt(flowInput);
      const resume = output!;
      
      // Ensure IDs are present
      if (resume.experience) {
        resume.experience.forEach((item: any) => {
          if (!item.id) item.id = crypto.randomUUID();
        });
      }
      
      if (resume.education) {
        resume.education.forEach((item: any) => {
          if (!item.id) item.id = crypto.randomUUID();
        });
      }
      
      if (resume.projects) {
        resume.projects.forEach((item: any) => {
          if (!item.id) item.id = crypto.randomUUID();
        });
      }
      
      return resume;
    }
  );
  
  return flow(input);
}
