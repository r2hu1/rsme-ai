
'use client';

import React, { useRef, useMemo } from 'react';
import type { ResumeData, Section as SectionData, SectionType } from '@/lib/types';
import { Mail, Phone, Link, GripVertical, Sparkles, Trash2 } from 'lucide-react';
import { produce } from 'immer';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const EditableField = ({ value, onSave, multiline = false, as: Component = 'div', className }: { value: string; onSave: (newValue: string) => void; multiline?: boolean, as?: React.ElementType, className?: string }) => {
  const fieldRef = useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (fieldRef.current && value !== fieldRef.current.innerHTML) {
      fieldRef.current.innerHTML = value;
    }
  }, [value]);

  const handleBlur = () => {
    if (fieldRef.current) {
      const newValue = fieldRef.current.innerHTML;
      if (newValue !== value) {
        onSave(newValue);
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  return (
    <Component
      ref={fieldRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      dangerouslySetInnerHTML={{ __html: value }}
      className={cn("outline-none focus:bg-primary/10 focus:ring-1 focus:ring-primary rounded-sm px-1 -mx-1", className)}
    />
  );
};


function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="relative group/item">
      {children}
      <button {...attributes} {...listeners} className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 text-muted-foreground opacity-0 group-hover/item:opacity-100 focus:opacity-100 transition-opacity cursor-grab active:cursor-grabbing no-print">
        <GripVertical className="h-4 w-4" />
      </button>
    </div>
  );
}

const DraggableSection = ({ section, resume, onUpdate, children }: { section: SectionData, resume: ResumeData, onUpdate: (data: Partial<ResumeData>) => void, children: React.ReactNode }) => {
   const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 'auto'
  };

  const handleTitleUpdate = (newTitle: string) => {
    const updatedSections = produce(resume.sections, draft => {
      const sec = draft.find(s => s.id === section.id);
      if (sec) sec.title = newTitle;
    });
    onUpdate({ sections: updatedSections });
  };
  
  const removeSection = () => {
    const updatedSections = resume.sections.filter(s => s.id !== section.id);
    onUpdate({ sections: updatedSections });
  }

  return (
     <section ref={setNodeRef} style={style} className="relative group/section">
        <div
          className="flex items-center gap-3 text-lg font-semibold font-headline pb-2 mb-4"
          style={{ 
            borderBottom: `${resume.theme.borderWidth}px solid var(--resume-border-color)`, 
            color: 'var(--resume-section-title-color)' 
          }}
        >
          <EditableField value={section.title} onSave={handleTitleUpdate} as="h2" className="flex-grow" />
           <div className="flex items-center gap-1 no-print">
            {section.type === 'custom' && (
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/section:opacity-100" onClick={removeSection}>
                <Trash2 className="h-4 w-4 text-destructive"/>
              </Button>
            )}
            <button {...attributes} {...listeners} className="p-1 text-muted-foreground opacity-0 group-hover/section:opacity-100 focus:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5" />
            </button>
           </div>
        </div>
      {children}
    </section>
  )
}

export function ResumePreview({ resume, onUpdate }: { resume: ResumeData, onUpdate: (newData: Partial<ResumeData>) => void }) {
  const { name, email, phone, summary, experience, education, skills, projects, sections, theme } = resume;

  const handleUpdate = (path: string, value: any) => {
    onUpdate(produce(resume, draft => {
      const keys = path.split('.');
      let current: any = draft;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    }));
  };

  const handleItemUpdate = (itemId: string, sectionType: keyof ResumeData, field: string, value: any) => {
     onUpdate(produce(resume, draft => {
        const items = draft[sectionType] as any[];
        if (items && Array.isArray(items)) {
            const itemIndex = items.findIndex(i => i.id === itemId);
            if (itemIndex > -1) {
              (items[itemIndex] as any)[field] = value;
            }
        }
    }));
  }
  
  const handleSectionContentUpdate = (sectionId: string, value: string) => {
     onUpdate(produce(resume, draft => {
        const section = draft.sections.find(s => s.id === sectionId);
        if (section) {
            section.content = value;
        }
     }));
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const sectionOrder = useMemo(() => sections.map(s => s.id), [sections]);

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as string);
      const newIndex = sectionOrder.indexOf(over.id as string);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      onUpdate({ sections: newSections });
    }
  }

  function handleItemDragEnd(event: DragEndEvent, sectionType: 'experience' | 'education' | 'projects') {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const items = resume[sectionType] as any[];
      if(items && Array.isArray(items)) {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            const newItems = arrayMove(items, oldIndex, newIndex);
            onUpdate({ [sectionType]: newItems });
        }
      }
    }
  }

  const renderSection = (sectionId: string) => {
    const sectionData = sections.find(s => s.id === sectionId);
    if (!sectionData || !sectionData.enabled) return null;
    
    switch(sectionData.type) {
        case 'summary':
            return summary != null && (
            <DraggableSection key={sectionId} section={sectionData} resume={resume} onUpdate={onUpdate}>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--resume-item-description-color)' }}><EditableField value={summary} onSave={(v) => handleUpdate('summary', v)} multiline /></div>
            </DraggableSection>
          );
        case 'experience':
            return experience && experience.length > 0 && (
            <DraggableSection key={sectionId} section={sectionData} resume={resume} onUpdate={onUpdate}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleItemDragEnd(e, 'experience')}>
                <SortableContext items={experience.map(e => e.id!)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6">
                    {experience.map((exp) => (
                      <SortableItem key={exp.id} id={exp.id!}>
                        <div className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold" style={{ color: 'var(--resume-item-title-color)' }}><EditableField value={exp.title || ''} onSave={(v) => handleItemUpdate(exp.id!, 'experience', 'title', v)} as="div" /></h3>
                            <div className="text-xs" style={{ color: 'var(--resume-secondary-color)' }}><EditableField value={exp.dates || ''} onSave={(v) => handleItemUpdate(exp.id!, 'experience', 'dates', v)} /></div>
                          </div>
                          <div className="text-sm font-medium" style={{ color: 'var(--resume-secondary-color)' }}><EditableField value={exp.company || ''} onSave={(v) => handleItemUpdate(exp.id!, 'experience', 'company', v)} /></div>
                          <div className="text-sm pt-1" style={{ color: 'var(--resume-item-description-color)' }}><EditableField value={exp.description || ''} onSave={(v) => handleItemUpdate(exp.id!, 'experience', 'description', v)} multiline /></div>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </DraggableSection>
          );
        case 'projects':
            return projects && projects.length > 0 && (
            <DraggableSection key={sectionId} section={sectionData} resume={resume} onUpdate={onUpdate}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleItemDragEnd(e, 'projects')}>
                <SortableContext items={projects.map(p => p.id!)} strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {projects.map((project) => (
                      <SortableItem key={project.id} id={project.id!}>
                        <div className="space-y-1 break-inside-avoid">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold" style={{ color: 'var(--resume-item-title-color)' }}><EditableField value={project.name || ''} onSave={(v) => handleItemUpdate(project.id!, 'projects', 'name', v)} as="div" /></h3>
                            <div className="text-xs" style={{ color: 'var(--resume-secondary-color)' }}><EditableField value={project.dates || ''} onSave={(v) => handleItemUpdate(project.id!, 'projects', 'dates', v)} /></div>
                          </div>
                          {project.url && (
                              <div className="flex items-center gap-2 text-sm hover:underline" style={{ color: 'var(--resume-link-color)' }}>
                                  <Link className="h-3 w-3" />
                                  <EditableField value={project.url} onSave={(v) => handleItemUpdate(project.id!, 'projects', 'url', v)} />
                              </div>
                          )}
                          <div className="text-sm pt-1" style={{ color: 'var(--resume-item-description-color)' }}><EditableField value={project.description || ''} onSave={(v) => handleItemUpdate(project.id!, 'projects', 'description', v)} multiline /></div>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </DraggableSection>
          );
        case 'education':
          return education && education.length > 0 && (
            <DraggableSection key={sectionId} section={sectionData} resume={resume} onUpdate={onUpdate}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleItemDragEnd(e, 'education')}>
                <SortableContext items={education.map(e => e.id!)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {education.map((edu) => (
                      <SortableItem key={edu.id} id={edu.id!}>
                        <div>
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold" style={{ color: 'var(--resume-item-title-color)' }}><EditableField value={edu.institution || ''} onSave={(v) => handleItemUpdate(edu.id!, 'education', 'institution', v)} as="div" /></h3>
                            <div className="text-xs" style={{ color: 'var(--resume-secondary-color)' }}><EditableField value={edu.dates || ''} onSave={(v) => handleItemUpdate(edu.id!, 'education', 'dates', v)} /></div>
                          </div>
                          <div className="text-sm" style={{ color: 'var(--resume-item-description-color)' }}><EditableField value={edu.degree || ''} onSave={(v) => handleItemUpdate(edu.id!, 'education', 'degree', v)} /></div>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </DraggableSection>
          );
        case 'skills':
            return skills && skills.length > 0 && (
            <DraggableSection key={sectionId} section={sectionData} resume={resume} onUpdate={onUpdate}>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div key={index} style={{backgroundColor: 'var(--resume-secondary-color)', color: 'white'}} className="rounded-full px-3 py-1 text-sm bg-secondary text-secondary-foreground">
                    <EditableField value={skill} onSave={(v) => handleUpdate(`skills.${index}`, v)} />
                  </div>
                ))}
              </div>
            </DraggableSection>
          );
        case 'custom':
          return (
            <DraggableSection key={sectionId} section={sectionData} resume={resume} onUpdate={onUpdate}>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--resume-item-description-color)' }}>
                  <EditableField value={sectionData.content || ''} onSave={(v) => handleSectionContentUpdate(sectionData.id, v)} multiline />
              </div>
            </DraggableSection>
          )
        default:
            return null;
    }
  }


  return (
    <div 
        id="resume-preview" 
        className="w-full h-full bg-card rounded-lg shadow-lg overflow-y-auto p-8 lg:p-12"
        style={{
            '--resume-heading-color': theme.headingColor,
            '--resume-section-title-color': theme.sectionTitleColor,
            '--resume-item-title-color': theme.itemTitleColor,
            '--resume-item-description-color': theme.itemDescriptionColor,
            '--resume-link-color': theme.linkColor,
            '--resume-secondary-color': theme.secondaryColor,
            '--resume-border-color': theme.borderColor,
        } as React.CSSProperties}
    >
      <div className="flex flex-col gap-8">
        {/* Header */}
        <header className="text-center pb-6">
          {name != null && <h1 className="text-4xl font-bold font-headline tracking-tight" style={{ color: 'var(--resume-heading-color)' }}><EditableField value={name} onSave={(v) => handleUpdate('name', v)} as="h1" /></h1>}
          <div className="flex justify-center items-center gap-6 mt-3 text-sm" style={{ color: 'var(--resume-secondary-color)' }}>
            {email != null && (
              <div className="flex items-center gap-2 hover:text-resume-primary transition-colors">
                <Mail className="h-4 w-4" />
                <EditableField value={email} onSave={(v) => handleUpdate('email', v)} />
              </div>
            )}
            {phone != null && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <EditableField value={phone} onSave={(v) => handleUpdate('phone', v)} />
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 gap-10">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
            <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
              {sectionOrder.map(sectionId => renderSection(sectionId))}
            </SortableContext>
          </DndContext>

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
