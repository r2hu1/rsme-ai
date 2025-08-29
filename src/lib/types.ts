import type { ParseExistingResumeOutput } from '@/ai/flows/parse-existing-resume';
import type { ScoreSkillsOutput } from '@/ai/flows/score-skills-based-on-relevance';
import type { EvaluateResumeContentOutput } from '@/ai/flows/evaluate-resume-content';

export type ResumeData = ParseExistingResumeOutput;

export type Experience = NonNullable<ResumeData['experience']>[0];
export type Education = NonNullable<ResumeData['education']>[0];
export type Project = NonNullable<ResumeData['projects']>[0];

export type SkillScore = NonNullable<ScoreSkillsOutput['scores']>[0];

export type ContentEvaluation = EvaluateResumeContentOutput;
