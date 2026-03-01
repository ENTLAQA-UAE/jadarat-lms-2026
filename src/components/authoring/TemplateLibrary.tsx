'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BookTemplate, Search, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEditorStore } from '@/stores/editor.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/utils/supabase/client';
import type { Block, BlockType } from '@/types/authoring';

// ============================================================
// TYPES
// ============================================================

interface BlockTemplate {
  id: string;
  organization_id: number;
  name: string;
  description: string | null;
  category: string;
  block_type: string;
  template_data: Record<string, unknown>;
  thumbnail_url: string | null;
  is_global: boolean;
  usage_count: number;
  created_at: string;
  created_by: string | null;
}

// ============================================================
// CATEGORY HELPERS
// ============================================================

function getCategoryForBlockType(blockType: string): string {
  const contentTypes = [
    'text', 'image', 'video', 'audio', 'embed', 'quote',
    'list', 'code', 'table', 'divider', 'cover', 'gallery', 'chart',
  ];
  const interactiveTypes = [
    'accordion', 'tabs', 'flashcard', 'labeled_graphic',
    'process', 'timeline', 'hotspot', 'scenario',
  ];
  const assessmentTypes = [
    'multiple_choice', 'true_false', 'multiple_response',
    'fill_in_blank', 'matching', 'sorting',
  ];

  if (contentTypes.includes(blockType)) return 'content';
  if (interactiveTypes.includes(blockType)) return 'interactive';
  if (assessmentTypes.includes(blockType)) return 'assessment';
  return 'content';
}

function formatBlockType(blockType: string): string {
  return blockType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================
// SAVE AS TEMPLATE BUTTON
// ============================================================

interface SaveAsTemplateButtonProps {
  block: Block;
}

export function SaveAsTemplateButton({ block }: SaveAsTemplateButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get the user's organization_id from their profile/membership
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user?.id ?? '')
        .limit(1)
        .single();

      if (!membership) {
        toast.error('Could not determine your organization');
        return;
      }

      const category = getCategoryForBlockType(block.type);

      const { error } = await supabase.from('block_templates').insert({
        name: name.trim(),
        description: description.trim() || null,
        category,
        block_type: block.type,
        template_data: { type: block.type, data: block.data },
        organization_id: membership.organization_id,
        created_by: user?.id ?? null,
      });

      if (error) throw error;

      toast.success('Block saved as template');
      setOpen(false);
      setName('');
      setDescription('');
    } catch (err) {
      console.error('Failed to save template:', err);
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <BookTemplate className="h-4 w-4" />
          Save as Template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Save Block as Template</DialogTitle>
        <DialogDescription>
          Save this block to your template library for reuse across courses.
        </DialogDescription>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="template-name">Name</Label>
            <Input
              id="template-name"
              placeholder="e.g., Welcome Introduction"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              placeholder="Briefly describe what this template contains..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// TEMPLATE LIBRARY (BROWSE & INSERT)
// ============================================================

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const selectedModuleId = useEditorStore((s) => s.selectedModuleId);
  const selectedLessonId = useEditorStore((s) => s.selectedLessonId);
  const addBlock = useEditorStore((s) => s.addBlock);

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      setIsLoading(true);

      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from('block_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setTemplates(data ?? []);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        toast.error('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  // Filter templates by search query
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleInsertTemplate = (template: BlockTemplate) => {
    if (!selectedModuleId || !selectedLessonId) {
      toast.error('Please select a module and lesson first');
      return;
    }

    const now = new Date().toISOString();
    const templateData = template.template_data as {
      type: BlockType;
      data: Record<string, unknown>;
    };

    const newBlock = {
      id: uuidv4(),
      type: templateData.type,
      data: templateData.data,
      order: 0, // Will be recalculated by addBlock
      visible: true,
      locked: false,
      metadata: {
        created_at: now,
        updated_at: now,
        created_by: 'human' as const,
      },
    } as Block;

    addBlock(selectedModuleId, selectedLessonId, newBlock);
    toast.success(`Inserted "${template.name}" template`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BookTemplate className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Template Library</h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-9"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="mt-2 text-sm">Loading templates...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <BookTemplate className="h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            {searchQuery ? 'No templates match your search' : 'No templates yet'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {searchQuery
              ? 'Try a different search term'
              : 'Save blocks as templates to reuse them across courses'}
          </p>
        </div>
      )}

      {/* Template grid */}
      {!isLoading && filteredTemplates.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer transition-colors hover:border-primary/40 hover:shadow-sm"
              onClick={() => handleInsertTemplate(template)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-snug">
                    {template.name}
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {formatBlockType(template.block_type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {template.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {template.description}
                  </p>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground/60">
                  {new Date(template.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
