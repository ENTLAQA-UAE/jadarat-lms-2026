'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ChevronDown, Sparkles, Settings2 } from 'lucide-react';
import { DocumentUploader } from './DocumentUploader';
import type { DocumentChunk } from '@/types/authoring';

export interface SourceMaterialData {
  description: string;
  sourceChunks: DocumentChunk[];
  language: 'ar' | 'en';
  industry: string;
}

interface StepSourceMaterialProps {
  data: SourceMaterialData;
  onChange: (data: SourceMaterialData) => void;
  onNext: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const INDUSTRIES = [
  { value: 'general', label: 'General' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'compliance', label: 'Compliance & Regulatory' },
  { value: 'sales', label: 'Sales & Marketing' },
  { value: 'technical', label: 'Technical & IT' },
  { value: 'leadership', label: 'Leadership & Management' },
  { value: 'safety', label: 'Health & Safety' },
  { value: 'finance', label: 'Finance & Accounting' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'onboarding', label: 'Employee Onboarding' },
];

export function StepSourceMaterial({
  data,
  onChange,
  onNext,
  onCancel,
  isLoading,
}: StepSourceMaterialProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleDocumentExtracted = (chunks: DocumentChunk[]) => {
    onChange({ ...data, sourceChunks: chunks });
    // Auto-fill description from first heading if empty
    if (!data.description.trim() && chunks.length > 0) {
      const firstHeading = chunks.find((c) => c.type === 'heading');
      if (firstHeading) {
        onChange({ ...data, sourceChunks: chunks, description: firstHeading.text });
      }
    }
  };

  const canProceed = data.description.trim().length >= 3;

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Let&apos;s build your course together
        </h2>
        <p className="text-sm text-muted-foreground">
          Share your vision and source materials, and we&apos;ll create engaging
          lessons designed for your learners.
        </p>
      </div>

      {/* Main input — Course description */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Describe your course <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="e.g., A course on B2B sales activities and strategies for mid-level professionals..."
              value={data.description}
              onChange={(e) =>
                onChange({ ...data, description: e.target.value })
              }
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              A few words is enough to get started, but add as much context as
              you&apos;d like.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Source document (optional) */}
      <Card>
        <CardContent className="pt-6 space-y-2">
          <Label className="text-sm font-medium">
            Source materials (optional)
          </Label>
          <DocumentUploader onExtracted={handleDocumentExtracted} />
          {data.sourceChunks.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {data.sourceChunks.length} sections extracted (
              {data.sourceChunks
                .reduce((s, c) => s + c.text.length, 0)
                .toLocaleString()}{' '}
              characters)
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Add documents, slides, or files. AI will restructure important
            concepts into an effective course designed for your learners.
          </p>
        </CardContent>
      </Card>

      {/* Advanced options (collapsed) */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Settings2 className="h-4 w-4" />
              Advanced options
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                advancedOpen ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Language</Label>
                  <Select
                    value={data.language}
                    onValueChange={(v) =>
                      onChange({ ...data, language: v as 'ar' | 'en' })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">Arabic (MSA)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Industry</Label>
                  <Select
                    value={data.industry}
                    onValueChange={(v) => onChange({ ...data, industry: v })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onNext} disabled={!canProceed || isLoading}>
          {isLoading ? (
            <>
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating course details...
            </>
          ) : (
            <>
              Generate course details
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
