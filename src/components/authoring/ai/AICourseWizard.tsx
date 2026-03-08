'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import type {
  ContentOptions,
  CourseDetails,
  CourseOutline,
  DocumentChunk,
  CourseLength,
} from '@/types/authoring';
import { COURSE_LENGTH_CONFIG } from '@/types/authoring';
import { StepSourceMaterial, type SourceMaterialData } from './StepSourceMaterial';
import { StepCourseDetails } from './StepCourseDetails';
import { StepLearningObjectives } from './StepLearningObjectives';
import { StepOutlineEditor } from './StepOutlineEditor';
import { StepContentOptions } from './StepContentOptions';
import { StepGeneration } from './StepGeneration';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface AICourseWizardProps {
  courseId: number;
  onComplete: () => void;
  onCancel: () => void;
}

type WizardStep =
  | 'source'
  | 'details'
  | 'objectives'
  | 'outline'
  | 'options'
  | 'generate';

const STEPS: { key: WizardStep; label: string; shortLabel: string }[] = [
  { key: 'source', label: 'Source material', shortLabel: 'Source' },
  { key: 'details', label: 'Course details', shortLabel: 'Details' },
  { key: 'objectives', label: 'Learning objectives', shortLabel: 'Objectives' },
  { key: 'outline', label: 'Course outline', shortLabel: 'Outline' },
  { key: 'options', label: 'Content options', shortLabel: 'Options' },
  { key: 'generate', label: 'Generate', shortLabel: 'Generate' },
];

// ============================================================
// WIZARD COMPONENT
// ============================================================

export function AICourseWizard({
  courseId,
  onComplete,
  onCancel,
}: AICourseWizardProps) {
  // Current step
  const [step, setStep] = useState<WizardStep>('source');

  // Loading states
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

  // Step 1: Source material data
  const [sourceData, setSourceData] = useState<SourceMaterialData>({
    description: '',
    sourceChunks: [],
    language: 'ar',
    industry: 'general',
  });

  // Step 2: Course details (AI-generated, user-editable)
  const [courseDetails, setCourseDetails] = useState<CourseDetails>({
    topic: '',
    tone: '',
    audience: '',
    goals: '',
    difficulty: 'intermediate',
    suggested_length: 'short',
    learning_objectives: [],
  });

  // Step 3: Learning objectives (editable copy from courseDetails)
  const [objectives, setObjectives] = useState<string[]>([]);

  // Step 4: Course outline (AI-generated, user-editable)
  const [outline, setOutline] = useState<CourseOutline | null>(null);

  // Step 5: Content options
  const [contentOptions, setContentOptions] = useState<ContentOptions>({
    content_format: 'interactive',
    generate_images: true,
    assessment_density: 'per_lesson',
  });

  // --------------------------------------------------------
  // Step transitions
  // --------------------------------------------------------

  /** Step 1 → Step 2: Generate course details from description */
  const handleSourceNext = async () => {
    setIsGeneratingDetails(true);
    try {
      const contextText =
        sourceData.sourceChunks.length > 0
          ? sourceData.sourceChunks
              .map((c) => c.text)
              .join('\n\n')
              .slice(0, 15000)
          : undefined;

      const res = await fetch('/api/ai/generate-course-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: sourceData.description,
          language: sourceData.language,
          source_chunks: contextText,
          industry:
            sourceData.industry !== 'general'
              ? sourceData.industry
              : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate course details');
      }

      const data = await res.json();
      const details: CourseDetails = data.details;

      setCourseDetails(details);
      setObjectives(details.learning_objectives || []);
      setStep('details');
    } catch (error) {
      toast.error('Course details generation failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  /** Step 3 → Step 4: Generate outline from details + objectives */
  const handleObjectivesNext = async () => {
    setIsGeneratingOutline(true);
    try {
      const lengthConfig =
        COURSE_LENGTH_CONFIG[courseDetails.suggested_length];

      const contextText =
        sourceData.sourceChunks.length > 0
          ? sourceData.sourceChunks
              .map((c) => c.text)
              .join('\n\n')
              .slice(0, 15000)
          : undefined;

      const res = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: courseDetails.topic,
          audience: courseDetails.audience,
          difficulty: courseDetails.difficulty,
          language: sourceData.language,
          tone: courseDetails.tone.includes('formal')
            ? 'formal'
            : courseDetails.tone.includes('academic')
              ? 'academic'
              : 'conversational',
          module_count: lengthConfig.modules,
          lessons_per_module: lengthConfig.lessonsPerModule,
          source_chunks: contextText,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        const fieldDetails = errData.details?.fieldErrors
          ? Object.entries(errData.details.fieldErrors)
              .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
              .join('; ')
          : '';
        throw new Error(
          fieldDetails
            ? `${errData.error}: ${fieldDetails}`
            : errData.error || 'Failed to generate outline'
        );
      }

      const data = await res.json();
      const generatedOutline: CourseOutline = data.outline;

      // Inject the edited learning objectives
      generatedOutline.learning_outcomes = objectives;

      // Ensure every lesson has a topics array
      generatedOutline.modules.forEach((mod) => {
        mod.lessons.forEach((les) => {
          if (!les.topics) les.topics = [];
        });
      });

      setOutline(generatedOutline);
      setStep('outline');
    } catch (error) {
      toast.error('Outline generation failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  // --------------------------------------------------------
  // Step index helper
  // --------------------------------------------------------
  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ──────────────────────────────────────────────────── */}
      {/* STEP INDICATOR                                      */}
      {/* ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const isCompleted = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;
          const isUpcoming = i > currentStepIndex;

          return (
            <div key={s.key} className="flex items-center gap-1">
              {i > 0 && (
                <div
                  className={cn(
                    'h-px w-4 md:w-8 shrink-0',
                    isCompleted
                      ? 'bg-primary'
                      : 'bg-muted-foreground/20'
                  )}
                />
              )}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                  isCompleted &&
                    'bg-primary/15 text-primary',
                  isCurrent &&
                    'bg-primary text-primary-foreground',
                  isUpcoming &&
                    'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="w-3 text-center">{i + 1}</span>
                )}
                <span className="hidden md:inline">{s.label}</span>
                <span className="md:hidden">{s.shortLabel}</span>
              </div>
            </div>
          );
        })}
      </nav>

      {/* ──────────────────────────────────────────────────── */}
      {/* STEP CONTENT                                         */}
      {/* ──────────────────────────────────────────────────── */}

      {step === 'source' && (
        <StepSourceMaterial
          data={sourceData}
          onChange={setSourceData}
          onNext={handleSourceNext}
          onCancel={onCancel}
          isLoading={isGeneratingDetails}
        />
      )}

      {step === 'details' && (
        <StepCourseDetails
          details={courseDetails}
          onChange={(d) => {
            setCourseDetails(d);
            setObjectives(d.learning_objectives);
          }}
          onNext={() => setStep('objectives')}
          onBack={() => setStep('source')}
        />
      )}

      {step === 'objectives' && (
        <StepLearningObjectives
          objectives={objectives}
          onChange={setObjectives}
          onNext={handleObjectivesNext}
          onBack={() => setStep('details')}
          isLoading={isGeneratingOutline}
          topic={courseDetails.topic}
          audience={courseDetails.audience}
          language={sourceData.language}
        />
      )}

      {step === 'outline' && outline && (
        <StepOutlineEditor
          outline={outline}
          onChange={setOutline}
          onNext={() => setStep('options')}
          onBack={() => setStep('objectives')}
          topic={courseDetails.topic}
          audience={courseDetails.audience}
          difficulty={courseDetails.difficulty}
          language={sourceData.language}
        />
      )}

      {step === 'options' && outline && (
        <StepContentOptions
          options={contentOptions}
          onChange={setContentOptions}
          outline={outline}
          onGenerate={() => setStep('generate')}
          onBack={() => setStep('outline')}
        />
      )}

      {step === 'generate' && outline && (
        <StepGeneration
          courseId={courseId}
          outline={outline}
          options={contentOptions}
          language={sourceData.language}
          difficulty={courseDetails.difficulty}
          audience={courseDetails.audience}
          sourceChunks={sourceData.sourceChunks}
          onComplete={onComplete}
          onBack={() => setStep('options')}
        />
      )}
    </div>
  );
}
