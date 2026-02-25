import { cn } from "@/lib/utils";
import PageHeader from "./PageHeader";

interface DataPageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function DataPageLayout({
  title,
  description,
  actions,
  children,
  className,
}: DataPageLayoutProps) {
  return (
    <div className={cn("p-4 sm:p-6 space-y-6", className)}>
      <PageHeader title={title} description={description}>
        {actions}
      </PageHeader>
      <div className="w-full">{children}</div>
    </div>
  );
}
