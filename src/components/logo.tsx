import { FileText } from "lucide-react";

export function Logo() {
	return (
		<div className="flex items-center gap-2">
			<div className="bg-primary text-primary-foreground p-2 rounded-lg">
				<FileText className="h-3.5 w-3.5" />
			</div>
			<h1 className="text-base font-bold font-headline text-foreground">
				Rsme AI
			</h1>
		</div>
	);
}
