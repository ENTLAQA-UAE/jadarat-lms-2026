'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
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
  const [activeStep, setActiveStep] = useState(-1); // -1 = intro, steps.length = summary
  const [viewedSteps, setViewedSteps] = useState<Set<number>>(() => new Set());

  // Process blocks are auto-completed on render
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  const { steps, layout, numbered } = block.data;
  const totalSteps = steps.length;
  const isCarousel = layout === 'horizontal' && totalSteps > 2;

  // Track viewed steps
  useEffect(() => {
    if (activeStep >= 0 && activeStep < totalSteps) {
      setViewedSteps((prev) => {
        const next = new Set(prev);
        next.add(activeStep);
        return next;
      });
    }
  }, [activeStep, totalSteps]);

  // Carousel mode for horizontal layout with many steps
  if (isCarousel) {
    const isIntro = activeStep === -1;
    const isSummary = activeStep === totalSteps;
    const currentStep = steps[activeStep];

    return (
      <div
        className="border rounded-xl overflow-hidden"
        style={{ borderRadius: 'var(--player-radius)' }}
      >
        {/* Step indicator bar */}
        <div className="flex items-center gap-1 p-3 border-b bg-muted/20">
          {steps.map((_, index) => (
            <button
              key={index}
              className="h-1.5 flex-1 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor:
                  index === activeStep
                    ? theme.primary_color
                    : viewedSteps.has(index)
                      ? `color-mix(in srgb, ${theme.primary_color} 30%, transparent)`
                      : 'hsl(var(--muted-foreground) / 0.12)',
              }}
              onClick={() => setActiveStep(index)}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Content area */}
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            {isIntro ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]"
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white font-bold text-lg"
                  style={{ backgroundColor: theme.primary_color }}
                >
                  {totalSteps}
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  {totalSteps} Steps
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Follow along to learn each step in the process.
                </p>
                <Button
                  size="sm"
                  className="text-white"
                  style={{ backgroundColor: theme.primary_color, borderRadius: 'var(--player-radius)' }}
                  onClick={() => setActiveStep(0)}
                >
                  Start
                  <ChevronRight className="w-4 h-4 ms-1" />
                </Button>
              </motion.div>
            ) : isSummary ? (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]"
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: theme.primary_color }}
                >
                  ✓
                </div>
                <h4 className="text-lg font-semibold mb-2">Complete!</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  You&apos;ve reviewed all {totalSteps} steps.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveStep(-1);
                    setViewedSteps(new Set());
                  }}
                  className="gap-2"
                  style={{ borderRadius: 'var(--player-radius)' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restart
                </Button>
              </motion.div>
            ) : currentStep ? (
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Step number */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-semibold text-sm"
                    style={{ backgroundColor: theme.primary_color }}
                  >
                    {numbered ? (
                      activeStep + 1
                    ) : currentStep.icon ? (
                      <span className="text-base">{currentStep.icon}</span>
                    ) : (
                      activeStep + 1
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                        Step {activeStep + 1} of {totalSteps}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{currentStep.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentStep.description}
                    </p>
                    {currentStep.image && (
                      <img
                        src={currentStep.image}
                        alt={currentStep.title}
                        className="mt-4 w-full max-w-sm rounded-lg object-cover"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {!isIntro && (
          <div className="flex items-center justify-between p-3 border-t bg-muted/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveStep((prev) => Math.max(-1, prev - 1))}
              disabled={isIntro}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {isSummary ? `${totalSteps} / ${totalSteps}` : `${activeStep + 1} / ${totalSteps}`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveStep((prev) => Math.min(totalSteps, prev + 1))}
              disabled={isSummary}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── Standard vertical layout (default) ──────────────────
  return (
    <div className="relative">
      {steps.map((step, index) => (
        <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
          {/* Connecting line */}
          {index < steps.length - 1 && (
            <div
              className="absolute left-[23px] top-12 bottom-0 w-0.5"
              style={{ backgroundColor: theme.primary_color, opacity: 0.2 }}
            />
          )}

          {/* Step circle */}
          <div
            className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-semibold text-sm shadow-sm"
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
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

            {/* Step image */}
            {step.image && (
              <img
                src={step.image}
                alt={step.title}
                className="mt-3 max-w-sm rounded-lg object-cover"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
