'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  GripVertical,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StepLearningObjectivesProps {
  objectives: string[];
  onChange: (objectives: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  topic: string;
  audience: string;
  language: string;
}

interface SortableObjectiveProps {
  id: string;
  index: number;
  value: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  canDelete: boolean;
}

function SortableObjective({
  id,
  index,
  value,
  onChange,
  onDelete,
  canDelete,
}: SortableObjectiveProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 group ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground/50 hover:text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="text-xs text-muted-foreground w-5 shrink-0 text-center">
        {index + 1}.
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-sm"
        placeholder="e.g., Identify key B2B sales activities..."
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 text-destructive"
        onClick={onDelete}
        disabled={!canDelete}
        aria-label="Remove objective"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function StepLearningObjectives({
  objectives,
  onChange,
  onNext,
  onBack,
  isLoading,
  topic,
  audience,
  language,
}: StepLearningObjectivesProps) {
  const [isAILoading, setIsAILoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const objectiveIds = objectives.map((_, i) => `obj-${i}`);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = objectiveIds.indexOf(active.id as string);
      const newIndex = objectiveIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...objectives];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      onChange(reordered);
    },
    [objectives, objectiveIds, onChange]
  );

  const updateObjective = (index: number, value: string) => {
    const updated = [...objectives];
    updated[index] = value;
    onChange(updated);
  };

  const deleteObjective = (index: number) => {
    if (objectives.length <= 1) return;
    onChange(objectives.filter((_, i) => i !== index));
  };

  const addObjective = () => {
    onChange([...objectives, '']);
  };

  const callWizardAssist = async (action: 'rewrite_objectives' | 'add_objectives') => {
    setIsAILoading(true);
    try {
      const res = await fetch('/api/ai/wizard-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          objectives,
          context: {
            topic,
            audience,
            language: language as 'ar' | 'en',
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'AI assist failed');
      }

      const data = await res.json();
      const result = data.result as string[];

      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('AI returned unexpected format');
      }

      if (action === 'rewrite_objectives') {
        onChange(result);
        toast.success('Objectives rewritten', {
          description: `${result.length} objectives updated with AI suggestions.`,
        });
      } else {
        onChange([...objectives, ...result]);
        toast.success('Objectives added', {
          description: `${result.length} new objectives added.`,
        });
      }
    } catch (error) {
      toast.error('AI assist failed', {
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Review the learning objectives
        </h2>
        <p className="text-sm text-muted-foreground">
          After completing this course, learners should understand or be able to:
        </p>
      </div>

      {/* Objectives editor */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Learning Objectives</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={isAILoading}
              >
                {isAILoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Edit with AI
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => callWizardAssist('rewrite_objectives')}
                disabled={isAILoading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Rewrite all objectives
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => callWizardAssist('add_objectives')}
                disabled={isAILoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add more objectives
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={objectiveIds}
              strategy={verticalListSortingStrategy}
            >
              {objectives.map((obj, i) => (
                <SortableObjective
                  key={objectiveIds[i]}
                  id={objectiveIds[i]}
                  index={i}
                  value={obj}
                  onChange={(v) => updateObjective(i, v)}
                  onDelete={() => deleteObjective(i)}
                  canDelete={objectives.length > 1}
                />
              ))}
            </SortableContext>
          </DndContext>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs ml-9"
            onClick={addObjective}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add learning objective
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating outline...
            </>
          ) : (
            <>
              Generate course outline
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
