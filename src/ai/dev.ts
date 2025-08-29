import { config } from 'dotenv';
config();

import '@/ai/flows/parse-existing-resume.ts';
import '@/ai/flows/evaluate-resume-content.ts';
import '@/ai/flows/generate-resume-from-input.ts';
import '@/ai/flows/score-skills-based-on-relevance.ts';