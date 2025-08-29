import type { ParseExistingResumeOutput } from '@/ai/flows/parse-existing-resume';
import type { ScoreSkillsOutput } from '@/ai/flows/score-skills-based-on-relevance';
import type { EvaluateResumeContentOutput } from '@/ai/flows/evaluate-resume-content';

export type SectionType = 'summary' | 'experience' | 'projects' | 'education' | 'skills' | 'custom';

export interface Section {
  id: string; // Can be standard type or a UUID for custom sections
  type: SectionType;
  title: string;
  enabled: boolean;
  content?: string; // For custom sections
}

export interface ResumeData extends Omit<ParseExistingResumeOutput, 'experience' | 'education' | 'projects'> {
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  sections: Section[];
  theme: {
    primaryColor: string;
    accentColor: string;
    textColor: string;
    mutedTextColor: string;
    borderWidth: number;
  };
}

export type Experience = NonNullable<ParseExistingResumeOutput['experience']>[0] & { id: string };
export type Education = NonNullable<ParseExistingResumeOutput['education']>[0] & { id: string };
export type Project = NonNullable<ParseExistingResumeOutput['projects']>[0] & { id: string };


export type SkillScore = NonNullable<ScoreSkillsOutput['scores']>[0];

export type ContentEvaluation = EvaluateResumeContentOutput;
