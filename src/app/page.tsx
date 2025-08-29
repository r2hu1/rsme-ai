'use client';

import { useCallback, useState } from 'react';

import { parseExistingResume } from '@/ai/flows/parse-existing-resume';
import { scoreSkills } from '@/ai/flows/score-skills-based-on-relevance';
import { evaluateResumeContent } from '@/ai/flows/evaluate-resume-content';

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
import { Printer } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialResume: ResumeData = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  phone: '123-456-7890',
  summary: 'Innovative and deadline-driven Software Engineer with 5+ years of experience designing and developing user-centered digital products from initial concept to final, polished deliverable.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      dates: '2020 - Present',
      description: 'Lead development of a new microservices-based architecture, improving system scalability by 40%.',
    },
    {
      title: 'Software Engineer',
      company: 'Innovate LLC',
      dates: '2018 - 2020',
      description: 'Developed and maintained front-end features for a large-scale e-commerce platform using React and Redux.',
    },
  ],
  education: [
    {
      institution: 'State University',
      degree: 'B.S. in Computer Science',
      dates: '2014 - 2018',
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL'],
  projects: [
    {
      name: 'E-commerce Search Platform',
      description: 'Built a high-performance search engine for an e-commerce site using Elasticsearch, resulting in a 30% increase in conversion rates.',
      dates: '2022',
      url: 'project-search.example.com',
    },
    {
      name: 'Data Visualization Dashboard',
      description: 'Designed and developed a real-time data visualization dashboard with D3.js and React.',
      dates: '2021',
      url: 'project-dashboard.example.com',
    },
  ],
};

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResume);
  const [loading, setLoading] = useState<string | null>(null);
  const [skillScores, setSkillScores] = useState<SkillScore[] | null>(null);
  const [contentEvaluation, setContentEvaluation] =
    useState<ContentEvaluation | null>(null);
  const { toast } = useToast();

  const handleResumeUpdate = useCallback((newData: ResumeData) => {
    setResumeData(newData);
  }, []);

  const handleParseResume = async (text: string) => {
    setLoading('parse');
    try {
      const parsedData = await parseExistingResume({ resumeText: text });
      setResumeData(parsedData);
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

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6 no-print">
        <Logo />
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print / Export PDF
        </Button>
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

        <section className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-8">
          <ResumePreview resume={resumeData} onUpdate={handleResumeUpdate} />
        </section>
      </main>
    </div>
  );
}
