'use client';

import type { ResumeData } from '@/lib/types';
import { Mail, Phone, User, Briefcase, GraduationCap, Wrench, Sparkles, FolderGit2, Link } from 'lucide-react';

const EditableField = ({ value, onSave, multiline = false }: { value: string; onSave: (newValue: string) => void; multiline?: boolean }) => {
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    onSave(e.currentTarget.innerText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      dangerouslySetInnerHTML={{ __html: value }}
      className="outline-none focus:bg-primary/10 focus:ring-1 focus:ring-primary rounded-sm px-1 -mx-1"
    />
  );
};

export function ResumePreview({ resume, onUpdate }: { resume: ResumeData, onUpdate: (newData: ResumeData) => void }) {
  const { name, email, phone, summary, experience, education, skills, projects } = resume;

  const handleUpdate = (path: string, value: any) => {
    const keys = path.split('.');
    const newResumeData = JSON.parse(JSON.stringify(resume));
    let current = newResumeData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onUpdate(newResumeData);
  };

  return (
    <div id="resume-preview" className="w-full h-full bg-card rounded-lg shadow-lg overflow-y-auto p-8 lg:p-12 text-card-foreground">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <header className="text-center border-b pb-6">
          {name && <h1 className="text-4xl font-bold font-headline tracking-tight"><EditableField value={name} onSave={(v) => handleUpdate('name', v)} /></h1>}
          <div className="flex justify-center items-center gap-6 mt-3 text-sm text-muted-foreground">
            {email && (
              <div className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <EditableField value={email} onSave={(v) => handleUpdate('email', v)} />
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <EditableField value={phone} onSave={(v) => handleUpdate('phone', v)} />
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
              <div className="text-sm leading-relaxed"><EditableField value={summary} onSave={(v) => handleUpdate('summary', v)} multiline /></div>
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
                      <h3 className="font-semibold"><EditableField value={exp.title || ''} onSave={(v) => handleUpdate(`experience.${index}.title`, v)} /></h3>
                      <p className="text-xs text-muted-foreground"><EditableField value={exp.dates || ''} onSave={(v) => handleUpdate(`experience.${index}.dates`, v)} /></p>
                    </div>
                    <p className="text-sm font-medium text-primary"><EditableField value={exp.company || ''} onSave={(v) => handleUpdate(`experience.${index}.company`, v)} /></p>
                    <p className="text-sm text-muted-foreground pt-1"><EditableField value={exp.description || ''} onSave={(v) => handleUpdate(`experience.${index}.description`, v)} multiline /></p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <div key={index} className="space-y-1 break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold"><EditableField value={project.name || ''} onSave={(v) => handleUpdate(`projects.${index}.name`, v)} /></h3>
                      <p className="text-xs text-muted-foreground"><EditableField value={project.dates || ''} onSave={(v) => handleUpdate(`projects.${index}.dates`, v)} /></p>
                    </div>
                    {project.url && (
                        <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <Link className="h-3 w-3" />
                            <EditableField value={project.url} onSave={(v) => handleUpdate(`projects.${index}.url`, v)} />
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground pt-1"><EditableField value={project.description || ''} onSave={(v) => handleUpdate(`projects.${index}.description`, v)} multiline /></p>
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
                      <h3 className="font-semibold"><EditableField value={edu.institution || ''} onSave={(v) => handleUpdate(`education.${index}.institution`, v)} /></h3>
                      <p className="text-xs text-muted-foreground"><EditableField value={edu.dates || ''} onSave={(v) => handleUpdate(`education.${index}.dates`, v)} /></p>
                    </div>
                    <p className="text-sm text-muted-foreground"><EditableField value={edu.degree || ''} onSave={(v) => handleUpdate(`education.${index}.degree`, v)} /></p>
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
                    <EditableField value={skill} onSave={(v) => handleUpdate(`skills.${index}`, v)} />
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
