'use client';

import { type ProcessBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitBranch, GripVertical, Plus, Trash2 } from 'lucide-react';

interface ProcessBlockEditorProps {
  block: ProcessBlock;
  onChange: (data: Partial<ProcessBlock['data']>) => void;
}

export function ProcessBlockEditor({
  block,
  onChange,
}: ProcessBlockEditorProps) {
  const { data } = block;

  const addStep = () => {
    const newStep = {
      id: uuidv4(),
      title: '',
      description: '',
    };
    onChange({ steps: [...data.steps, newStep] });
  };

  const removeStep = (stepId: string) => {
    onChange({ steps: data.steps.filter((step) => step.id !== stepId) });
  };

  const updateStep = (
    stepId: string,
    field: 'title' | 'description' | 'icon' | 'image',
    value: string
  ) => {
    onChange({
      steps: data.steps.map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <GitBranch className="h-4 w-4" />
          Process Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Process steps */}
        <div className="space-y-3">
          {data.steps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-lg border border-border bg-muted/20 p-3"
            >
              <div className="mb-3 flex items-center gap-2">
                {/* Drag handle (visual only) */}
                <div
                  className="flex cursor-grab items-center text-muted-foreground"
                  title="Drag to reorder (coming soon)"
                >
                  <GripVertical className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium text-muted-foreground">
                  Step {index + 1}
                </span>

                <div className="flex-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStep(step.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={data.steps.length <= 1}
                  title="Remove step"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label
                    htmlFor={`process-title-${step.id}`}
                    className="text-xs"
                  >
                    Title
                  </Label>
                  <Input
                    id={`process-title-${step.id}`}
                    value={step.title}
                    onChange={(e) =>
                      updateStep(step.id, 'title', e.target.value)
                    }
                    placeholder="Step title"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`process-description-${step.id}`}
                    className="text-xs"
                  >
                    Description
                  </Label>
                  <Textarea
                    id={`process-description-${step.id}`}
                    value={step.description}
                    onChange={(e) =>
                      updateStep(step.id, 'description', e.target.value)
                    }
                    placeholder="Step description"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`process-icon-${step.id}`}
                    className="text-xs"
                  >
                    Icon (optional)
                  </Label>
                  <Input
                    id={`process-icon-${step.id}`}
                    value={step.icon ?? ''}
                    onChange={(e) =>
                      updateStep(step.id, 'icon', e.target.value)
                    }
                    placeholder="Icon name or emoji"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`process-image-${step.id}`}
                    className="text-xs"
                  >
                    Image URL (optional)
                  </Label>
                  <Input
                    id={`process-image-${step.id}`}
                    value={step.image ?? ''}
                    onChange={(e) =>
                      updateStep(step.id, 'image', e.target.value)
                    }
                    placeholder="https://example.com/image.png"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add step button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addStep}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Step
        </Button>

        {/* Settings */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select
              value={data.layout}
              onValueChange={(value: 'vertical' | 'horizontal') =>
                onChange({ layout: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`process-numbered-${block.id}`}
              className="cursor-pointer"
            >
              Numbered steps
            </Label>
            <Switch
              id={`process-numbered-${block.id}`}
              checked={data.numbered}
              onCheckedChange={(checked) => onChange({ numbered: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
