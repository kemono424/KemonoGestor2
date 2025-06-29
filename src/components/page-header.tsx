import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div className="grid gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center space-x-2">{children}</div>
    </div>
  );
}
