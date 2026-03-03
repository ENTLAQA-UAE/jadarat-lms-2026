'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ArrowLeft,
  Blocks,
  Image as ImageIcon,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';
import type { ContentOptions, CourseOutline } from '@/types/authoring';

interface StepContentOptionsProps {
  options: ContentOptions;
  onChange: (options: ContentOptions) => void;
  outline: CourseOutline;
  onGenerate: () => void;
  onBack: () => void;
}

export function StepContentOptions({
  options,
  onChange,
  outline,
  onGenerate,
  onBack,
}: StepContentOptionsProps) {
  const totalLessons = outline.modules.reduce(
    (s, m) => s + m.lessons.length,
    0
  );
  // Rough estimate: ~2 images per lesson × $0.04
  const estimatedImageCost = (totalLessons * 2 * 0.04).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Almost there! Configure your content.
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose how your lessons will be generated. You can always edit
          everything after generation.
        </p>
      </div>

      {/* Content Format */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Blocks className="h-4 w-4" />
            Content Format
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={options.content_format}
            onValueChange={(v) =>
              onChange({
                ...options,
                content_format: v as 'interactive' | 'text_only',
              })
            }
            className="space-y-3"
          >
            <label
              htmlFor="format-interactive"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5"
            >
              <RadioGroupItem value="interactive" id="format-interactive" />
              <div>
                <p className="text-sm font-medium">
                  Text and interactive content
                </p>
                <p className="text-xs text-muted-foreground">
                  AI will create text, accordions, tabs, process blocks, and
                  knowledge checks.
                </p>
              </div>
            </label>

            <label
              htmlFor="format-text"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5"
            >
              <RadioGroupItem value="text_only" id="format-text" />
              <div>
                <p className="text-sm font-medium">Text only</p>
                <p className="text-xs text-muted-foreground">
                  AI will create text-based content only. You can add
                  interactive blocks manually later.
                </p>
              </div>
            </label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* AI Images */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            AI Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Generate images for this course
              </p>
              <p className="text-xs text-muted-foreground">
                AI will create relevant images using DALL-E 3.
                {options.generate_images && (
                  <> Estimated cost: ~${estimatedImageCost}</>
                )}
              </p>
            </div>
            <Switch
              checked={options.generate_images}
              onCheckedChange={(checked) =>
                onChange({ ...options, generate_images: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Assessment Density */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={options.assessment_density}
            onValueChange={(v) =>
              onChange({
                ...options,
                assessment_density: v as
                  | 'per_lesson'
                  | 'per_module'
                  | 'none',
              })
            }
            className="space-y-3"
          >
            <label
              htmlFor="assess-lesson"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5"
            >
              <RadioGroupItem value="per_lesson" id="assess-lesson" />
              <div>
                <p className="text-sm font-medium">Quiz every lesson</p>
                <p className="text-xs text-muted-foreground">
                  Knowledge check at the end of each lesson.
                </p>
              </div>
            </label>

            <label
              htmlFor="assess-module"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5"
            >
              <RadioGroupItem value="per_module" id="assess-module" />
              <div>
                <p className="text-sm font-medium">Quiz every module</p>
                <p className="text-xs text-muted-foreground">
                  Assessment at the end of each module only.
                </p>
              </div>
            </label>

            <label
              htmlFor="assess-none"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5"
            >
              <RadioGroupItem value="none" id="assess-none" />
              <div>
                <p className="text-sm font-medium">No quizzes</p>
                <p className="text-xs text-muted-foreground">
                  Content only, no assessments. You can add quizzes manually
                  later.
                </p>
              </div>
            </label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onGenerate}>
          <Sparkles className="h-4 w-4 mr-2" />
          Create course draft
        </Button>
      </div>
    </div>
  );
}
