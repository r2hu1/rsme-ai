
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Settings,
  Palette,
  Sparkles,
  Upload,
} from 'lucide-react';
import { produce } from 'immer';
import * as pdfjs from 'pdfjs-dist';

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
} from '@/lib/types';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ControlPanelProps {
  resumeData: ResumeData;
  onResumeUpdate: (data: Partial<ResumeData>) => void;
  onParse: (text: string) => Promise<void>;
  onGenerate: (prompt: string) => Promise<void>;
  onScoreSkills: (jobDescription: string) => Promise<void>;
  loading: string | null;
  skillScores: SkillScore[] | null;
}

const resumeSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  summary: z.string().optional(),
  experience: z.array(z.object({
    id: z.string(),
    title: z.string().optional(),
    company: z.string().optional(),
    dates: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  education: z.array(z.object({
    id: z.string(),
    institution: z.string().optional(),
    degree: z.string().optional(),
    dates: z.string().optional(),
  })).optional(),
  skills: z.array(z.string()).optional(),
  projects: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    dates: z.string().optional(),
    url: z.string().optional(),
  })).optional(),
  sections: z.array(z.object({
    id: z.string(),
    type: z.enum(['summary', 'experience', 'projects', 'education', 'skills', 'custom']),
    title: z.string(),
    enabled: z.boolean(),
    content: z.string().optional(),
  })),
  theme: z.object({
    headingColor: z.string(),
    sectionTitleColor: z.string(),
    itemTitleColor: z.string(),
    itemDescriptionColor: z.string(),
    linkColor: z.string(),
    secondaryColor: z.string(),
  }),
});


export function ControlPanel({
  resumeData,
  onResumeUpdate,
  onParse,
  onGenerate,
  onScoreSkills,
  loading,
  skillScores,
}: ControlPanelProps) {
  const [importText, setImportText] = useState('');
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: resumeData,
  });

  useEffect(() => {
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

  const handleBlur = (fieldName: keyof ResumeData) => {
    const value = form.getValues(fieldName as any);
    onResumeUpdate({ [fieldName]: value });
  };

  const handleThemeChange = (field: keyof ResumeData['theme'], value: string) => {
    const currentTheme = form.getValues('theme');
    const newTheme = { ...currentTheme, [field]: value };
    onResumeUpdate({ theme: newTheme });
  };
  
  const handleItemRemove = (remover: (index: number) => void, index: number, fieldName: keyof ResumeData) => {
    const currentValues = form.getValues();
    const updatedArray = (currentValues[fieldName] as any[]).filter((_, i) => i !== index);
    onResumeUpdate({ [fieldName]: updatedArray });
  };

  const addCustomSection = () => {
    const newSection = {
      id: crypto.randomUUID(),
      type: 'custom' as const,
      title: 'New Section',
      enabled: true,
      content: 'This is a new custom section. Click to edit!'
    };
    onResumeUpdate({ sections: [...resumeData.sections, newSection] });
  };
  
  const handleSectionToggle = (sectionId: string, enabled: boolean) => {
    const updatedSections = produce(resumeData.sections, draft => {
      const section = draft.find(s => s.id === sectionId);
      if (section) {
        section.enabled = enabled;
      }
    });
    onResumeUpdate({ sections: updatedSections });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result;
      if (arrayBuffer instanceof ArrayBuffer) {
        try {
          const pdf = await pdfjs.getDocument(new Uint8Array(arrayBuffer)).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
          }
          await onParse(fullText);
        } catch (error) {
          console.error('Failed to parse PDF:', error);
          // You might want to show a toast notification to the user here
        }
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input
    event.target.value = '';
  };

  const hexToHsl = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return `hsl(${h} ${s}% ${l}%)`;
  }
  
  const hslToHex = (hsl: string): string => {
    if (!hsl) return '#000000';
    const hslValues = hsl.match(/(\d+)/g);
    if (!hslValues || hslValues.length < 3) return '#000000';

    let h = parseInt(hslValues[0]);
    let s = parseInt(hslValues[1]);
    let l = parseInt(hslValues[2]);

    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c/2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; } 
    else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; } 
    else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
    else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
    else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
    else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  const themeFields = [
    { name: 'headingColor', label: 'Heading' },
    { name: 'sectionTitleColor', label: 'Section Title' },
    { name: 'itemTitleColor', label: 'Item Title' },
    { name: 'secondaryColor', label: 'Secondary Text' },
    { name: 'linkColor', label: 'Link' },
    { name: 'itemDescriptionColor', label: 'Description' },
  ] as const;

  return (
    <Form {...form}>
      <Accordion type="multiple" defaultValue={['import', 'content', 'customize']} className="w-full">
        <AccordionItem value="import">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" /> Import or Generate
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                   <Button onClick={() => fileInputRef.current?.click()} disabled={loading === 'parse'} className="w-full">
                     {loading === 'parse' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Import from PDF
                   </Button>
                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">OR</span>
                  </div>
                  <Label>Paste from Existing Resume</Label>
                  <Textarea
                    placeholder="Paste your resume text..."
                    rows={6}
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
                </CardContent>
              </Card>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-sm text-muted-foreground">OR</span>
              </div>
              
              <Card>
                <CardContent className="p-4 space-y-3">
                   <Label>Generate with a Prompt</Label>
                   <Textarea
                    placeholder="e.g., 'Generate a resume for a senior product manager at a SaaS company...'"
                    rows={5}
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                  />
                   <Button onClick={() => onGenerate(generatePrompt)} disabled={loading === 'generate' || !generatePrompt} className="w-full">
                    {loading === 'generate' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate with AI
                  </Button>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="customize">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5" /> Customize
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-4">
            <Card>
              <CardHeader><CardTitle>Sections</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Toggle sections on or off.</p>
                
                  <div className="space-y-4">
                    {resumeData.sections.map((section) => (
                      <div key={section.id} className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor={`section-toggle-${section.id}`} className="cursor-pointer">{section.title}</Label>
                        <Switch
                          id={`section-toggle-${section.id}`}
                          checked={section.enabled}
                          onCheckedChange={(checked) => handleSectionToggle(section.id, checked)}
                        />
                      </div>
                    ))}
                  </div>
        
                <Button onClick={addCustomSection} className="w-full mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Section
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Palette/> Theme (PDF &amp; Print)</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                 {themeFields.map((fieldItem) => (
                    <FormField
                      key={fieldItem.name}
                      control={form.control}
                      name={`theme.${fieldItem.name}`}
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-3 items-center gap-4">
                          <FormLabel>{fieldItem.label}</FormLabel>
                          <FormControl>
                            <Input
                              type="color"
                              value={hslToHex(field.value)}
                              onChange={(e) => handleThemeChange(fieldItem.name, hexToHsl(e.target.value))}
                              className="col-span-2 h-8 p-1"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="content">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" /> Resume Content
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
              <form className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem> <FormLabel>Full Name</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('name')} /></FormControl> </FormItem>)} />
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem> <FormLabel>Email</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('email')} /></FormControl> </FormItem>)} />
                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem> <FormLabel>Phone</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('phone')} /></FormControl> </FormItem>)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                  <CardContent>
                    <FormField control={form.control} name="summary" render={({ field }) => (<FormItem> <FormControl><Textarea {...field} rows={5} onBlur={() => handleBlur('summary')} /></FormControl> </FormItem>)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex justify-between items-center"><span>Experience</span><Button type="button" size="sm" variant="ghost" onClick={() => appendExp({ id: crypto.randomUUID(), title: '', company: '', dates: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add</Button></CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {expFields.map((field, index) => (
                      <Card key={field.id} className="p-4 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleItemRemove(removeExp, index, 'experience')}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        <div className="space-y-2">
                          <FormField control={form.control} name={`experience.${index}.title`} render={({ field }) => (<FormItem> <FormLabel>Title</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('experience')} /></FormControl> </FormItem>)} />
                          <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (<FormItem> <FormLabel>Company</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('experience')} /></FormControl> </FormItem>)} />
                          <FormField control={form.control} name={`experience.${index}.dates`} render={({ field }) => (<FormItem> <FormLabel>Dates</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('experience')} /></FormControl> </FormItem>)} />
                          <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => (<FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} onBlur={() => handleBlur('experience')} /></FormControl> </FormItem>)} />
                        </div>
                      </Card>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex justify-between items-center"><span>Education</span><Button type="button" size="sm" variant="ghost" onClick={() => appendEdu({ id: crypto.randomUUID(), institution: '', degree: '', dates: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add</Button></CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {eduFields.map((field, index) => (
                      <Card key={field.id} className="p-4 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleItemRemove(removeEdu, index, 'education')}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        <div className="space-y-2">
                          <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (<FormItem> <FormLabel>Institution</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('education')} /></FormControl> </FormItem>)} />
                          <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (<FormItem> <FormLabel>Degree</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('education')} /></FormControl> </FormItem>)} />
                          <FormField control={form.control} name={`education.${index}.dates`} render={({ field }) => (<FormItem> <FormLabel>Dates</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('education')} /></FormControl> </FormItem>)} />
                        </div>
                      </Card>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex justify-between items-center"><span>Projects</span><Button type="button" size="sm" variant="ghost" onClick={() => appendProject({ id: crypto.randomUUID(), name: '', dates: '', url: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add</Button></CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {projectFields.map((field, index) => (
                      <Card key={field.id} className="p-4 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleItemRemove(removeProject, index, 'projects')}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        <div className="space-y-2">
                          <FormField control={form.control} name={`projects.${index}.name`} render={({ field }) => (<FormItem> <FormLabel>Project Name</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('projects')} /></FormControl> </FormItem>)} />
                          <FormField control={form.control} name={`projects.${index}.dates`} render={({ field }) => (<FormItem> <FormLabel>Dates</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('projects')} /></FormControl> </FormItem>)} />
                          <FormField control={form.control} name={`projects.${index}.url`} render={({ field }) => (<FormItem> <FormLabel>URL</FormLabel> <FormControl><Input {...field} onBlur={() => handleBlur('projects')} /></FormControl> </FormItem>)} />
                          <FormField control={form.control} name={`projects.${index}.description`} render={({ field }) => (<FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} onBlur={() => handleBlur('projects')} /></FormControl> </FormItem>)} />
                        </div>
                      </Card>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Skills</span>
                      <Button type="button" size="sm" variant="ghost" onClick={() => appendSkill("")}><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skillFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-1 bg-secondary rounded-full">
                          <Controller name={`skills.${index}`} control={form.control} render={({ field }) => (<Input {...field} onBlur={() => handleBlur('skills')} className="h-8 bg-transparent border-none focus-visible:ring-0 w-32" />)} />
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleItemRemove(removeSkill, index, 'skills')}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </form>
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
      </Accordion>
    </Form>
  );
}
