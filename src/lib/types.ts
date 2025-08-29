import type { ParseExistingResumeOutput } from '@/ai/flows/parse-existing-resume';
import type { EvaluateResumeContentOutput } from '@/ai/flows/evaluate-resume-content';

export type ResumeData = ParseExistingResumeOutput;

export type Experience = NonNullable<ResumeData['experience']>[0];
export type Education = NonNullable<ResumeData['education']>[0];

export type SkillScore = {
  skill: string;
  score: number;
};

export type ContentEvaluation = EvaluateResumeContentOutput;
