"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/language.context";

interface DetailPageLayoutProps {
  title: string;
  backHref?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function DetailPageLayout({
  title,
  backHref,
  actions,
  children,
  className,
}: DetailPageLayoutProps) {
  const router = useRouter();
  const { isRTL } = useLanguage();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className={cn("p-4 sm:p-6 space-y-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {backHref && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => router.push(backHref)}
              aria-label="Go back"
            >
              <BackArrow className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-heading tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
      {children}
    </div>
  );
}
