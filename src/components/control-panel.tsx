'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileText,
  Trash2,
  PlusCircle,
  Loader2,
  Wand2,
  BarChart,
  ClipboardCheck,
  Star,
  Palette,
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type {
  ResumeData,
  SkillScore,
  ContentEvaluation,
} from '@/lib/types';
import { Progress } from './ui/progress';

interface ControlPanelProps {
  resumeData: ResumeData;
  onResumeUpdate: (data: Partial<ResumeData>) => void;
  onParse: (text: string) => Promise<void>;
  onScoreSkills: (jobDescription: string) => Promise<void>;
  onAnalyzeContent: () => Promise<void>;
  loading: string | null;
  skillScores: SkillScore[] | null;
  contentEvaluation: ContentEvaluation | null;
}

const resumeSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  summary: z.string().optional(),
  experience: z.array(z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    dates: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  education: z.array(z.object({
    id: z.string().optional(),
    institution: z.string().optional(),
    degree: z.string().optional(),
    dates: z.string().optional(),
  })).optional(),
  skills: z.array(z.string()).optional(),
  projects: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    dates: z.string().optional(),
    url: z.string().optional(),
  })).optional(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    enabled: z.boolean(),
  })).optional(),
  theme: z.object({
    primaryColor: z.string(),
  }).optional(),
});

const colorOptions = [
  { name: 'Default Blue', value: '210 86% 53%' },
  { name: 'Forest Green', value: '158 64% 35%' },
  { name: 'Charcoal Gray', value: '220 9% 46%' },
  { name: 'Royal Purple', value: '260 52% 47%' },
  { name: 'Crimson Red', value: '348 83% 47%' },
];

export function ControlPanel({
  resumeData,
  onResumeUpdate,
  onParse,
  onScoreSkills,
  onAnalyzeContent,
  loading,
  skillScores,
  contentEvaluation,
}: ControlPanelProps) {
  const [importText, setImportText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    values: resumeData,
    mode: 'onBlur',
  });

  React.useEffect(() => {
    form.reset(resumeData);
  }, [resumeData, form]);

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: "education",
  });
  
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const handleBlur = () => {
    form.handleSubmit(d => onResumeUpdate(d))();
  };

  return (
    <Accordion type="multiple" defaultValue={['import', 'content', 'customize']} className="w-full">
      <AccordionItem value="import">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" /> Import Resume
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste your existing resume here to get started. Our AI will parse it and fill in the fields for you.
            </p>
            <Textarea
              placeholder="Paste your resume text..."
              rows={10}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <Button onClick={() => onParse(importText)} disabled={loading === 'parse' || !importText} className="w-full">
              {loading === 'parse' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Parse with AI
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="customize">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5" /> Customize
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
           <Form {...form}>
            <form onBlur={handleBlur} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Theme Color</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map(color => (
                      <Button
                        key={color.name}
                        type="button"
                        variant={resumeData.theme.primaryColor === color.value ? 'default' : 'outline'}
                        className="h-12 w-12 rounded-full p-0 border-2"
                        style={{ backgroundColor: `hsl(${color.value})`}}
                        onClick={() => onResumeUpdate({ theme: { primaryColor: color.value } })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Section Titles</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.sections.map((section, index) => (
                    <FormField
                      key={section.id}
                      control={form.control}
                      name={`sections.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{section.id.charAt(0).toUpperCase() + section.id.slice(1)}</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="content">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" /> Resume Content
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <Form {...form}>
            <form onBlur={handleBlur} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                  <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                  <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                <CardContent>
                   <FormField control={form.control} name="summary" render={({ field }) => ( <FormItem> <FormControl><Textarea {...field} rows={5} /></FormControl> </FormItem> )} />
                </CardContent>
              </Card>

              <Card>
                 <CardHeader><CardTitle className="flex justify-between items-center"><span>Experience</span><Button type="button" size="sm" variant="ghost" onClick={() => appendExp({ id: crypto.randomUUID() })}><PlusCircle className="mr-2 h-4 w-4" />Add</Button></CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {expFields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeExp(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        <div className="space-y-2">
                            <FormField control={form.control} name={`experience.${index}.title`} render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                            <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => ( <FormItem> <FormLabel>Company</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                            <FormField control={form.control} name={`experience.${index}.dates`} render={({ field }) => ( <FormItem> <FormLabel>Dates</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                            <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} /></FormControl> </FormItem> )} />
                        </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                 <CardHeader><CardTitle className="flex justify-between items-center"><span>Education</span><Button type="button" size="sm" variant="ghost" onClick={() => appendEdu({ id: crypto.randomUUID() })}><PlusCircle className="mr-2 h-4 w-4" />Add</Button></CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                  {eduFields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeEdu(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        <div className="space-y-2">
                           <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => ( <FormItem> <FormLabel>Institution</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                           <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => ( <FormItem> <FormLabel>Degree</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                           <FormField control={form.control} name={`education.${index}.dates`} render={({ field }) => ( <FormItem> <FormLabel>Dates</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                        </div>
                    </Card>
                  ))}
                 </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex justify-between items-center"><span>Projects</span><Button type="button" size="sm" variant="ghost" onClick={() => appendProject({ id: crypto.randomUUID() })}><PlusCircle className="mr-2 h-4 w-4" />Add</Button></CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {projectFields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeProject(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      <div className="space-y-2">
                        <FormField control={form.control} name={`projects.${index}.name`} render={({ field }) => ( <FormItem> <FormLabel>Project Name</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                        <FormField control={form.control} name={`projects.${index}.dates`} render={({ field }) => ( <FormItem> <FormLabel>Dates</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                        <FormField control={form.control} name={`projects.${index}.url`} render={({ field }) => ( <FormItem> <FormLabel>URL</FormLabel> <FormControl><Input {...field} /></FormControl> </FormItem> )} />
                        <FormField control={form.control} name={`projects.${index}.description`} render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} /></FormControl> </FormItem> )} />
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex justify-between items-center"><span>Skills</span><Button type="button" size="sm" variant="ghost" onClick={() => appendSkill("")}><PlusCircle className="mr-2 h-4 w-4" />Add</Button></CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                  {skillFields.map((field, index) => (
                     <div key={field.id} className="flex items-center gap-1 bg-secondary rounded-full">
                        <Controller name={`skills.${index}`} control={form.control} render={({ field }) => (<Input {...field} className="h-8 bg-transparent border-none focus-visible:ring-0 w-32" />)} />
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => removeSkill(index)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                     </div>
                  ))}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="score">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-3">
            <BarChart className="h-5 w-5" /> Skill Scorer
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste a job description to score your skills based on market relevance.
            </p>
            <Textarea
              placeholder="Paste job description here..."
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <Button onClick={() => onScoreSkills(jobDescription)} disabled={loading === 'score' || !jobDescription} className="w-full">
              {loading === 'score' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart className="mr-2 h-4 w-4" />}
              Score My Skills
            </Button>
            {skillScores && (
              <Card>
                <CardHeader><CardTitle>Skill Relevance</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {skillScores.map(({ skill, score }) => (
                    <div key={skill}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{skill}</span>
                        <span className="text-sm font-medium text-primary">{score}/100</span>
                      </div>
                      <Progress value={score} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="analyze">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5" /> Content Analysis
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <div className="space-y-4">
             <p className="text-sm text-muted-foreground">
              Let our AI analyze your resume for clarity, grammar, and overall effectiveness.
            </p>
            <Button onClick={onAnalyzeContent} disabled={loading === 'analyze'} className="w-full">
              {loading === 'analyze' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
              Analyze Resume
            </Button>
            {contentEvaluation && (
              <Card>
                <CardHeader><CardTitle>Analysis Results</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label>Clarity Score</Label>
                      <span className="text-sm font-medium text-primary">{contentEvaluation.clarityScore}/100</span>
                    </div>
                    <Progress value={contentEvaluation.clarityScore} />
                  </div>
                   <div>
                    <div className="flex justify-between mb-1">
                      <Label>Grammar Score</Label>
                       <span className="text-sm font-medium text-primary">{contentEvaluation.grammarScore}/100</span>
                    </div>
                    <Progress value={contentEvaluation.grammarScore} />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-2"><Star className="h-4 w-4 text-primary" />AI Feedback</Label>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border">{contentEvaluation.effectivenessFeedback}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
