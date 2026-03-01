'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { CourseOutline, DocumentChunk } from '@/types/authoring';
import { OutlineEditor } from './OutlineEditor';
import { GenerationProgress } from './GenerationProgress';
import { DocumentUploader } from './DocumentUploader';

interface AICourseWizardProps {
  courseId: number;
  onComplete: () => void;
  onCancel: () => void;
}

type WizardStep = 'settings' | 'outline' | 'generate';

export function AICourseWizard({
  courseId,
  onComplete,
  onCancel,
}: AICourseWizardProps) {
  const [step, setStep] = useState<WizardStep>('settings');
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

  // Settings state
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [difficulty, setDifficulty] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('intermediate');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [tone, setTone] = useState<'formal' | 'conversational' | 'academic'>(
    'formal'
  );
  const [moduleCount, setModuleCount] = useState(4);
  const [lessonsPerModule, setLessonsPerModule] = useState(3);
  const [sourceChunks, setSourceChunks] = useState<DocumentChunk[]>([]);

  // Outline state
  const [outline, setOutline] = useState<CourseOutline | null>(null);

  const handleGenerateOutline = async () => {
    if (!topic.trim() || !audience.trim()) {
      toast.error('Please fill in topic and audience');
      return;
    }

    setIsGeneratingOutline(true);
    try {
      const contextText =
        sourceChunks.length > 0
          ? sourceChunks.map((c) => c.text).join('\n\n').slice(0, 15000)
          : undefined;

      const res = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          audience,
          difficulty,
          language,
          tone,
          module_count: moduleCount,
          lessons_per_module: lessonsPerModule,
          source_chunks: contextText,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate outline');
      }

      const data = await res.json();
      setOutline(data.outline);
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

  const handleDocumentExtracted = (chunks: DocumentChunk[]) => {
    setSourceChunks(chunks);
    if (!topic.trim() && chunks.length > 0) {
      // Auto-fill topic from first heading
      const firstHeading = chunks.find((c) => c.type === 'heading');
      if (firstHeading) {
        setTopic(firstHeading.text);
      }
    }
  };

  const handleOutlineApproved = (editedOutline: CourseOutline) => {
    setOutline(editedOutline);
    setStep('generate');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(['settings', 'outline', 'generate'] as WizardStep[]).map(
          (s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && (
                <div className="h-px w-8 bg-muted-foreground/30" />
              )}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : ['settings', 'outline', 'generate'].indexOf(step) >
                      i
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {['settings', 'outline', 'generate'].indexOf(step) > i ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{i + 1}</span>
                )}
                {s === 'settings' && 'Topic & Settings'}
                {s === 'outline' && 'Review Outline'}
                {s === 'generate' && 'Generate Content'}
              </div>
            </div>
          )
        )}
      </div>

      {/* Step 1: Topic & Settings */}
      {step === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Course Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Course Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Introduction to Project Management"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience *</Label>
                <Input
                  id="audience"
                  placeholder="e.g., New employees in the finance sector"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(v) =>
                      setDifficulty(
                        v as 'beginner' | 'intermediate' | 'advanced'
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">
                        Intermediate
                      </SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={language}
                    onValueChange={(v) => setLanguage(v as 'ar' | 'en')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">Arabic (MSA)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select
                    value={tone}
                    onValueChange={(v) =>
                      setTone(
                        v as 'formal' | 'conversational' | 'academic'
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="conversational">
                        Conversational
                      </SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Modules</Label>
                  <Select
                    value={String(moduleCount)}
                    onValueChange={(v) => setModuleCount(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} modules
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lessons / Module</Label>
                  <Select
                    value={String(lessonsPerModule)}
                    onValueChange={(v) => setLessonsPerModule(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} lessons
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document upload (optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Source Document (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUploader onExtracted={handleDocumentExtracted} />
              {sourceChunks.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {sourceChunks.length} chunks extracted (
                  {sourceChunks
                    .reduce((s, c) => s + c.text.length, 0)
                    .toLocaleString()}{' '}
                  characters)
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleGenerateOutline}
              disabled={
                isGeneratingOutline || !topic.trim() || !audience.trim()
              }
            >
              {isGeneratingOutline ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Outline...
                </>
              ) : (
                <>
                  Generate Outline
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Outline Review */}
      {step === 'outline' && outline && (
        <div className="space-y-6">
          <OutlineEditor
            outline={outline}
            onApprove={handleOutlineApproved}
            onBack={() => setStep('settings')}
          />
        </div>
      )}

      {/* Step 3: Generation */}
      {step === 'generate' && outline && (
        <GenerationProgress
          courseId={courseId}
          outline={outline}
          language={language}
          difficulty={difficulty}
          audience={audience}
          onComplete={onComplete}
          onBack={() => setStep('outline')}
        />
      )}
    </div>
  );
}
