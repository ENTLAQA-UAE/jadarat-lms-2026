import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    href: string;
  };
  children?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  action,
  children,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        className
      )}
    >
      <h2 className="text-title text-foreground">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {action.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
      {children}
    </div>
  );
}
