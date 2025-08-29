
import { z } from 'zod';

// Base Schemas
export const ExperienceSchema = z.object({
  id: z.string().describe('Unique identifier for the experience entry'),
  title: z.string().optional().describe('The job title.'),
  company: z.string().optional().describe('The company name.'),
  dates: z.string().optional().describe('The dates of employment.'),
  description: z.string().optional().describe('A description of the job responsibilities.'),
});

export const EducationSchema = z.object({
  id: z.string().describe('Unique identifier for the education entry'),
  institution: z.string().optional().describe('The name of the educational institution.'),
  degree: z.string().optional().describe('The degree obtained.'),
  dates: z.string().optional().describe('The dates of attendance.'),
});

export const ProjectSchema = z.object({
  id: z.string().describe('Unique identifier for the project entry'),
  name: z.string().optional().describe('The project name.'),
  description: z.string().optional().describe('A description of the project.'),
  dates: z.string().optional().describe('The dates of the project.'),
  url: z.string().optional().describe('A URL for the project.'),
});


// ParseExistingResume Schemas and Types
export const ParseExistingResumeInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be parsed.'),
});
export type ParseExistingResumeInput = z.infer<typeof ParseExistingResumeInputSchema>;

export const ParseExistingResumeOutputSchema = z.object({
  name: z.string().optional().describe('The name of the resume owner.'),
  email: z.string().email().optional().describe('The email address of the resume owner.'),
  phone: z.string().optional().describe('The phone number of the resume owner.'),
  summary: z.string().optional().describe('A brief summary or objective statement.'),
  experience: z.array(ExperienceSchema).optional().describe('A list of work experiences.'),
  education: z.array(EducationSchema).optional().describe('A list of educational experiences.'),
  skills: z.array(z.string()).optional().describe('A list of skills.'),
  projects: z.array(ProjectSchema).optional().describe('A list of projects.'),
});
export type ParseExistingResumeOutput = z.infer<typeof ParseExistingResumeOutputSchema>;


// EvaluateResumeContent Schemas and Types
export const EvaluateResumeContentInputSchema = z.object({
  resumeContent: z.string().describe('The content of the resume to evaluate.'),
});
export type EvaluateResumeContentInput = z.infer<typeof EvaluateResumeContentInputSchema>;

export const EvaluateResumeContentOutputSchema = z.object({
  clarityScore: z.number().describe('A score indicating the clarity of the resume content (0-100).'),
  grammarScore: z.number().describe('A score indicating the quality of the grammar in the resume (0-100).'),
  atsScore: z.number().describe('An estimated Applicant Tracking System (ATS) compatibility score (0-100).'),
  effectivenessFeedback: z.string().describe('General feedback on the overall effectiveness of the resume content.'),
  suggestedFixes: z.array(z.string()).describe('A list of specific, actionable suggestions for improvement.'),
});
export type ContentEvaluation = z.infer<typeof EvaluateResumeContentOutputSchema>;


// ApplySuggestedFixes Schemas and Types
export const ApplySuggestedFixesInputSchema = z.object({
  resumeContent: z.string().describe('The JSON string content of the resume to be updated.'),
  suggestedFixes: z.array(z.string()).describe('A list of suggestions to apply to the resume.'),
});
export type ApplySuggestedFixesInput = z.infer<typeof ApplySuggestedFixesInputSchema>;

// The output will be the same as the parsed resume structure
export const ApplySuggestedFixesOutputSchema = ParseExistingResumeOutputSchema;
export type ApplySuggestedFixesOutput = z.infer<typeof ApplySuggestedFixesOutputSchema>;


// GenerateResumeFromInput Schemas and Types
export const GenerateResumeInputSchema = z.object({
  prompt: z.string().describe('A detailed prompt describing the desired resume content, skills, experience, and format.'),
});
export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

export const GenerateResumeOutputSchema = ParseExistingResumeOutputSchema;
export type GenerateResumeOutput = z.infer<typeof GenerateResumeOutputSchema>;


// ScoreSkillsBasedOnRelevance Schemas and Types
export const ScoreSkillsInputSchema = z.object({
  skills: z
    .string()
    .describe('A list of skills to be scored, separated by commas.'),
  jobDescription: z.string().describe('The description of the job market.'),
});
export type ScoreSkillsInput = z.infer<typeof ScoreSkillsInputSchema>;

export const ScoreSkillsOutputSchema = z.object({
  scores: z
    .array(
      z.object({
        skill: z.string(),
        score: z.number().min(0).max(100),
      })
    )
    .describe('A list of skills and their relevance scores (0-100).'),
});
export type SkillScore = NonNullable<z.infer<typeof ScoreSkillsOutputSchema>['scores']>[0];


// UI-facing Types
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
    headingColor: string;
    sectionTitleColor: string;
    itemTitleColor: string;
    itemDescriptionColor: string;
    linkColor: string;
    secondaryColor: string;
  };
}

export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
