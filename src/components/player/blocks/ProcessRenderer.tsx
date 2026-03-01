'use client';

import { useEffect } from 'react';
import type { ProcessBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface ProcessRendererProps {
  block: ProcessBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function ProcessRenderer({
  block,
  progress,
  onComplete,
  theme,
}: ProcessRendererProps) {
  // Process blocks are auto-completed on render
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const { steps, layout, numbered } = block.data;

  if (layout === 'horizontal') {
    return (
      <div className="flex flex-wrap items-start justify-center gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start">
            {/* Step card */}
            <div className="flex w-48 flex-col items-center text-center">
              {/* Step circle */}
              <div
                className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-semibold text-sm"
                style={{ backgroundColor: theme.primary_color }}
              >
                {numbered ? (
                  index + 1
                ) : step.icon ? (
                  <span className="text-lg">{step.icon}</span>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step content */}
              <h4 className="mb-1 font-semibold text-sm">{step.title}</h4>
              <p className="text-xs text-muted-foreground">
                {step.description}
              </p>

              {/* Step image */}
              {step.image && (
                <img
                  src={step.image}
                  alt={step.title}
                  className="mt-2 w-full rounded-md object-cover"
                />
              )}
            </div>

            {/* Arrow connector between steps */}
            {index < steps.length - 1 && (
              <div className="flex items-center px-2 pt-5">
                <svg
                  className="h-5 w-8 shrink-0 text-muted-foreground"
                  viewBox="0 0 32 20"
                  fill="none"
                >
                  <path
                    d="M0 10h28m0 0l-6-6m6 6l-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Vertical layout (default)
  return (
    <div className="relative">
      {steps.map((step, index) => (
        <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
          {/* Connecting line */}
          {index < steps.length - 1 && (
            <div
              className="absolute left-[23px] top-12 bottom-0 w-0.5"
              style={{ backgroundColor: theme.primary_color, opacity: 0.3 }}
            />
          )}

          {/* Step circle */}
          <div
            className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-semibold text-sm"
            style={{ backgroundColor: theme.primary_color }}
          >
            {numbered ? (
              index + 1
            ) : step.icon ? (
              <span className="text-lg">{step.icon}</span>
            ) : (
              index + 1
            )}
          </div>

          {/* Step content */}
          <div className="flex-1 pt-1">
            <h4 className="mb-1 font-semibold">{step.title}</h4>
            <p className="text-sm text-muted-foreground">{step.description}</p>

            {/* Step image */}
            {step.image && (
              <img
                src={step.image}
                alt={step.title}
                className="mt-2 max-w-sm rounded-md object-cover"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
