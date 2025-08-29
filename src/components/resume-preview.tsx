'use client';

import type { ResumeData } from '@/lib/types';
import { Mail, Phone, MapPin, User, Briefcase, GraduationCap, Wrench, Sparkles, FolderGit2, Link } from 'lucide-react';

export function ResumePreview({ resume }: { resume: ResumeData }) {
  const { name, email, phone, summary, experience, education, skills, projects } = resume;

  return (
    <div id="resume-preview" className="w-full h-full bg-card rounded-lg shadow-lg overflow-y-auto p-8 lg:p-12 text-card-foreground">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <header className="text-center border-b pb-6">
          {name && <h1 className="text-4xl font-bold font-headline tracking-tight">{name}</h1>}
          <div className="flex justify-center items-center gap-6 mt-3 text-sm text-muted-foreground">
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <span>{email}</span>
              </a>
            )}
            {phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{phone}</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 gap-10">
          {/* Summary */}
          {summary && (
            <section>
              <h2 className="flex items-center gap-3 text-lg font-semibold font-headline border-b-2 border-primary pb-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                Professional Summary
              </h2>
              <p className="text-sm leading-relaxed">{summary}</p>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section>
              <h2 className="flex items-center gap-3 text-lg font-semibold font-headline border-b-2 border-primary pb-2 mb-4">
                <Briefcase className="h-5 w-5 text-primary" />
                Work Experience
              </h2>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-xs text-muted-foreground">{exp.dates}</p>
                    </div>
                    <p className="text-sm font-medium text-primary">{exp.company}</p>
                    <p className="text-sm text-muted-foreground pt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section>
              <h2 className="flex items-center gap-3 text-lg font-semibold font-headline border-b-2 border-primary pb-2 mb-4">
                <FolderGit2 className="h-5 w-5 text-primary" />
                Projects
              </h2>
              <div className="space-y-6">
                {projects.map((project, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-xs text-muted-foreground">{project.dates}</p>
                    </div>
                    {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <Link className="h-3 w-3" />
                            {project.url}
                        </a>
                    )}
                    <p className="text-sm text-muted-foreground pt-1">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section>
              <h2 className="flex items-center gap-3 text-lg font-semibold font-headline border-b-2 border-primary pb-2 mb-4">
                <GraduationCap className="h-5 w-5 text-primary" />
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold">{edu.institution}</h3>
                      <p className="text-xs text-muted-foreground">{edu.dates}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{edu.degree}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <section>
              <h2 className="flex items-center gap-3 text-lg font-semibold font-headline border-b-2 border-primary pb-2 mb-4">
                <Wrench className="h-5 w-5 text-primary" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </section>
          )}

          {!name && !summary && (!experience || experience.length === 0) && (
            <div className="text-center py-20 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Your resume will appear here</h3>
              <p className="text-sm">Start by importing or creating your resume content.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
