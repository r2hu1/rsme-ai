
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
  Sparkles,
  Check,
} from 'lucide-react';

import { parseExistingResume } from '@/ai/flows/parse-existing-resume';
import { scoreSkills } from '@/ai/flows/score-skills-based-on-relevance';
import { evaluateResumeContent } from '@/ai/flows/evaluate-resume-content';
import { applySuggestedFixes } from '@/ai/flows/apply-suggested-fixes';

import type {
  ResumeData,
  SkillScore,
  ContentEvaluation,
} from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ResumePreview } from '@/components/resume-preview';
import { ControlPanel } from '@/components/control-panel';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';


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
    borderWidth: 2,
  },
};

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResume);
  const [loading, setLoading] = useState<string | null>(null);
  const [skillScores, setSkillScores] = useState<SkillScore[] | null>(null);
  const [contentEvaluation, setContentEvaluation] =
    useState<ContentEvaluation | null>(null);
  const [analyzedResumeContent, setAnalyzedResumeContent] = useState<string | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [fixesApplied, setFixesApplied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This function converts HSL string to just the numbers for the CSS variables
    const setCssVar = (name: string, value: string) => {
      const hslValues = value.match(/(\d+(\.\d+)?\s*%?\s*){3}/)?.[0];
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
    setFixesApplied(false); // Reset on any manual change
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

      setFixesApplied(false);
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

    if (contentEvaluation && resumeContent === analyzedResumeContent) {
      setIsAnalysisDialogOpen(true);
      return;
    }

    setLoading('analyze');
    setContentEvaluation(null);
    setFixesApplied(false);
    try {
      const evaluation = await evaluateResumeContent({ resumeContent });
      setContentEvaluation(evaluation);
      setAnalyzedResumeContent(resumeContent);
      setIsAnalysisDialogOpen(true);
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

  const handleApplyFixes = async () => {
    if (!contentEvaluation) return;

    setLoading('apply-fixes');
    try {
      const updatedResume = await applySuggestedFixes({
        resumeContent: JSON.stringify(resumeData),
        suggestedFixes: contentEvaluation.suggestedFixes,
      });

      setResumeData(produce(draft => {
        Object.assign(draft, updatedResume);
        // Ensure IDs are present after applying fixes
        if (draft.experience) draft.experience.forEach(item => { if (!item.id) item.id = crypto.randomUUID(); });
        if (draft.education) draft.education.forEach(item => { if (!item.id) item.id = crypto.randomUUID(); });
        if (draft.projects) draft.projects.forEach(item => { if (!item.id) item.id = crypto.randomUUID(); });
      }));
      
      setFixesApplied(true);
      // Mark content as analyzed to prevent re-running immediately
      setAnalyzedResumeContent(JSON.stringify(updatedResume));
      // Close the dialog and show success
      setIsAnalysisDialogOpen(false);
      toast({
        title: 'Fixes Applied',
        description: 'The AI suggestions have been applied to your resume.',
      });
    } catch (error) {
       console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to Apply Fixes',
        description: 'Could not apply the suggested fixes. Please try again.',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6 no-print">
        <Logo />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleAnalyzeContent}
            disabled={loading === 'analyze'}
          >
            {loading === 'analyze' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            AI Analysis
          </Button>
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
                loading={loading}
                skillScores={skillScores}
              />
            </div>
          </ScrollArea>
        </aside>

        <section className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-8 print-container">
          <ResumePreview resume={resumeData} onUpdate={handleResumeUpdate} />
        </section>
      </main>

      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Resume Analysis
            </DialogTitle>
            <DialogDescription>
              Here's a breakdown of your resume's scores and suggestions for
              improvement.
            </DialogDescription>
          </DialogHeader>
          {contentEvaluation && (
            <div className="grid gap-6 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-card p-4 text-center">
                  <Label>Clarity Score</Label>
                  <p className="text-3xl font-bold text-primary">
                    {contentEvaluation.clarityScore}
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center">
                  <Label>Grammar Score</Label>
                  <p className="text-3xl font-bold text-primary">
                    {contentEvaluation.grammarScore}
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center">
                  <Label>ATS Score</Label>
                  <p className="text-3xl font-bold text-primary">
                    {contentEvaluation.atsScore}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><Star className="h-4 w-4 text-primary" />AI Feedback</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border">{contentEvaluation.effectivenessFeedback}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-primary" />Suggested Fixes</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 bg-muted p-3 rounded-md border">
                  {contentEvaluation.suggestedFixes.map((fix, index) => (
                    <li key={index}>{fix}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAnalysisDialogOpen(false)}>Cancel</Button>
            {!fixesApplied && (
              <Button onClick={handleApplyFixes} disabled={loading === 'apply-fixes'}>
                {loading === 'apply-fixes' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Apply Fixes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    