'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import type { CourseDetails, CourseLength } from '@/types/authoring';
import { COURSE_LENGTH_CONFIG } from '@/types/authoring';
import { cn } from '@/lib/utils';

interface StepCourseDetailsProps {
  details: CourseDetails;
  onChange: (details: CourseDetails) => void;
  onNext: () => void;
  onBack: () => void;
}

const LENGTH_ICONS: Record<CourseLength, React.ReactNode> = {
  micro: <FileText className="h-6 w-6" />,
  short: <BookOpen className="h-6 w-6" />,
  standard: <GraduationCap className="h-6 w-6" />,
  extended: <Clock className="h-6 w-6" />,
};

export function StepCourseDetails({
  details,
  onChange,
  onNext,
  onBack,
}: StepCourseDetailsProps) {
  const updateField = <K extends keyof CourseDetails>(
    field: K,
    value: CourseDetails[K]
  ) => {
    onChange({ ...details, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Take a look at the course details we&apos;ve generated.
        </h2>
        <p className="text-sm text-muted-foreground">
          Refine the course information and learning objectives to match your
          vision. We&apos;ll build on this to create your course outline.
        </p>
      </div>

      {/* Course Length Cards */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Course Length</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(COURSE_LENGTH_CONFIG) as CourseLength[]).map((key) => {
            const config = COURSE_LENGTH_CONFIG[key];
            const isSelected = details.suggested_length === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateField('suggested_length', key)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all hover:shadow-sm',
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                )}
              >
                <span
                  className={cn(
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {LENGTH_ICONS[key]}
                </span>
                <span className="text-sm font-semibold">{config.label}</span>
                <span className="text-xs opacity-70">{config.description}</span>
                <span className="text-xs opacity-50">{config.duration}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Course Information</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Edit with AI
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                Rewrite section (coming soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-xs text-muted-foreground">
              Course Topic
            </Label>
            <Input
              id="topic"
              value={details.topic}
              onChange={(e) => updateField('topic', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone" className="text-xs text-muted-foreground">
              Tone
            </Label>
            <Input
              id="tone"
              value={details.tone}
              onChange={(e) => updateField('tone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience" className="text-xs text-muted-foreground">
              Audience
            </Label>
            <Textarea
              id="audience"
              value={details.audience}
              onChange={(e) => updateField('audience', e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals" className="text-xs text-muted-foreground">
              Goals
            </Label>
            <Textarea
              id="goals"
              value={details.goals}
              onChange={(e) => updateField('goals', e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Difficulty</Label>
            <Select
              value={details.difficulty}
              onValueChange={(v) =>
                updateField(
                  'difficulty',
                  v as 'beginner' | 'intermediate' | 'advanced'
                )
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Review learning objectives
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
