import { FileText } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <FileText className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold font-headline text-foreground">
        ResumeAI Pro
      </h1>
    </div>
  );
}
