'use client';

import { useCallback, useState, useEffect } from 'react';
import { produce } from 'immer';
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
  Printer,
} from 'lucide-react';

import { parseExistingResume } from '@/ai/flows/parse-existing-resume';
import { scoreSkills } from '@/ai/flows/score-skills-based-on-relevance';
import { evaluateResumeContent } from '@/ai/flows/evaluate-resume-content';

import type {
  ResumeData,
  SkillScore,
  ContentEvaluation,
  SectionType,
} from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ResumePreview } from '@/components/resume-preview';
import { ControlPanel } from '@/components/control-panel';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const initialResume: ResumeData = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  phone: '123-456-7890',
  summary: 'Innovative and deadline-driven Software Engineer with 5+ years of experience designing and developing user-centered digital products from initial concept to final, polished deliverable.',
  experience: [
    {
      id: 'exp1',
      title: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      dates: '2020 - Present',
      description: 'Lead development of a new microservices-based architecture, improving system scalability by 40%.',
    },
    {
      id: 'exp2',
      title: 'Software Engineer',
      company: 'Innovate LLC',
      dates: '2018 - 2020',
      description: 'Developed and maintained front-end features for a large-scale e-commerce platform using React and Redux.',
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'State University',
      degree: 'B.S. in Computer Science',
      dates: '2014 - 2018',
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL'],
  projects: [
    {
      id: 'proj1',
      name: 'E-commerce Search Platform',
      description: 'Built a high-performance search engine for an e-commerce site using Elasticsearch, resulting in a 30% increase in conversion rates.',
      dates: '2022',
      url: 'project-search.example.com',
    },
    {
      id: 'proj2',
      name: 'Data Visualization Dashboard',
      description: 'Designed and developed a real-time data visualization dashboard with D3.js and React.',
      dates: '2021',
      url: 'project-dashboard.example.com',
    },
  ],
  sections: [
    { id: 'summary', type: 'summary', title: 'Professional Summary', enabled: true },
    { id: 'experience', type: 'experience', title: 'Work Experience', enabled: true },
    { id: 'projects', type: 'projects', title: 'Projects', enabled: true },
    { id: 'education', type: 'education', title: 'Education', enabled: true },
    { id: 'skills', type: 'skills', title: 'Skills', enabled: true },
  ],
  theme: {
    primaryColor: 'hsl(210 86% 53%)',
    accentColor: 'hsl(180 55% 46%)',
    textColor: 'hsl(210 10% 23%)',
    mutedTextColor: 'hsl(210 20% 45%)',
  },
};

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResume);
  const [loading, setLoading] = useState<string | null>(null);
  const [skillScores, setSkillScores] = useState<SkillScore[] | null>(null);
  const [contentEvaluation, setContentEvaluation] =
    useState<ContentEvaluation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This function converts HSL string to just the numbers for the CSS variables
    const setCssVar = (name: string, value: string) => {
      const hslValues = value.match(/(\d+\s*%?\s*){3}/)?.[0];
      if (hslValues) {
        document.documentElement.style.setProperty(name, hslValues);
      }
    };
    
    setCssVar('--primary', resumeData.theme.primaryColor);
    setCssVar('--accent', resumeData.theme.accentColor);
    setCssVar('--foreground', resumeData.theme.textColor);
    setCssVar('--muted-foreground', resumeData.theme.mutedTextColor);
  }, [resumeData.theme]);

  const handleResumeUpdate = useCallback((newData: Partial<ResumeData>) => {
    setResumeData(produce(draft => {
      Object.assign(draft, newData);
    }));
  }, []);

  const handleParseResume = async (text: string) => {
    setLoading('parse');
    try {
      const parsedData = await parseExistingResume({ resumeText: text });
      
      setResumeData(produce(draft => {
        Object.assign(draft, parsedData);
        // Ensure standard sections are present and typed correctly after parsing
        draft.sections = initialResume.sections.map(s => {
          const existingSection = draft.sections?.find(ds => ds.id === s.id);
          return existingSection ? { ...s, ...existingSection } : s;
        });

        if (!draft.theme) draft.theme = initialResume.theme;
      }));

      toast({
        title: 'Resume Parsed',
        description: 'Your resume has been successfully imported.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Parsing Failed',
        description: 'Could not parse the resume. Please try again.',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleScoreSkills = async (jobDescription: string) => {
    if (!resumeData.skills || resumeData.skills.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Skills Found',
        description: 'Please add skills to your resume before scoring.',
      });
      return;
    }
    setLoading('score');
    setSkillScores(null);
    try {
      const { scores } = await scoreSkills({
        skills: resumeData.skills.join(', '),
        jobDescription,
      });
      const sortedScores = scores.sort((a, b) => b.score - a.score);
      setSkillScores(sortedScores);
      toast({
        title: 'Skills Scored',
        description: 'Your skills have been scored against the job description.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Scoring Failed',
        description: 'Could not score skills. Please try again.',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleAnalyzeContent = async () => {
    const resumeContent = JSON.stringify(resumeData);
    if (resumeContent.length < 50) {
      toast({
        variant: 'destructive',
        title: 'Not Enough Content',
        description: 'Your resume is too short to analyze effectively.',
      });
      return;
    }
    setLoading('analyze');
    setContentEvaluation(null);
    try {
      const evaluation = await evaluateResumeContent({ resumeContent });
      setContentEvaluation(evaluation);
      toast({
        title: 'Analysis Complete',
        description: 'Your resume content has been evaluated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze content. Please try again.',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleThemeChange = (colorType: keyof ResumeData['theme'], value: string) => {
    handleResumeUpdate({
      theme: { ...resumeData.theme, [colorType]: value }
    });
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


  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6 no-print">
        <Logo />
        <div className="flex items-center gap-2">
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Palette className="mr-2 h-4 w-4" />
                Theme
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Customize Theme</h4>
                  <p className="text-sm text-muted-foreground">
                    Adjust the colors of your resume.
                  </p>
                </div>
                <div className="grid gap-2">
                  {(Object.keys(resumeData.theme) as (keyof ResumeData['theme'])[]).map(key => (
                     <div key={key} className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={key} className="capitalize">{key.replace('Color', '')}</Label>
                      <Input
                        id={key}
                        type="color"
                        value={hslToHex(resumeData.theme[key])}
                        onChange={(e) => handleThemeChange(key, hexToHsl(e.target.value))}
                        className="col-span-2 h-8 p-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print / Export PDF
          </Button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-full max-w-md border-r no-print xl:max-w-lg">
          <ScrollArea className="h-full">
            <div className="p-4 lg:p-6">
              <ControlPanel
                resumeData={resumeData}
                onResumeUpdate={handleResumeUpdate}
                onParse={handleParseResume}
                onScoreSkills={handleScoreSkills}
                onAnalyzeContent={handleAnalyzeContent}
                loading={loading}
                skillScores={skillScores}
                contentEvaluation={contentEvaluation}
              />
            </div>
          </ScrollArea>
        </aside>

        <section className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-8 print-container">
          <ResumePreview resume={resumeData} onUpdate={handleResumeUpdate} />
        </section>
      </main>
    </div>
  );
}

    