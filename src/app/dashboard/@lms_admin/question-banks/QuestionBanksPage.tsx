'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Library,
  Trash2,
  Pencil,
  FileQuestion,
  Tag,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionBank } from '@/types/question-bank';
import QuestionBankDetail from './QuestionBankDetail';

export default function QuestionBanksPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editBank, setEditBank] = useState<QuestionBank | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formLanguage, setFormLanguage] = useState<'ar' | 'en' | 'bilingual'>('ar');

  const fetchBanks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/question-banks');
      const data = await res.json();
      if (data.banks) setBanks(data.banks);
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormCategory('');
    setFormLanguage('ar');
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;

    const res = await fetch('/api/question-banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formName,
        description: formDescription,
        category: formCategory,
        language: formLanguage,
      }),
    });

    if (res.ok) {
      resetForm();
      setCreateOpen(false);
      fetchBanks();
    }
  };

  const handleUpdate = async () => {
    if (!editBank || !formName.trim()) return;

    const res = await fetch('/api/question-banks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editBank.id,
        name: formName,
        description: formDescription,
        category: formCategory,
        language: formLanguage,
      }),
    });

    if (res.ok) {
      resetForm();
      setEditBank(null);
      fetchBanks();
    }
  };

  const handleDelete = async (bankId: string) => {
    const res = await fetch(`/api/question-banks?id=${bankId}`, { method: 'DELETE' });
    if (res.ok) {
      if (selectedBank?.id === bankId) setSelectedBank(null);
      fetchBanks();
    }
  };

  const openEdit = (bank: QuestionBank) => {
    setFormName(bank.name);
    setFormDescription(bank.description || '');
    setFormCategory(bank.category || '');
    setFormLanguage(bank.language);
    setEditBank(bank);
  };

  const filteredBanks = banks.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // If a bank is selected, show its detail view
  if (selectedBank) {
    return (
      <QuestionBankDetail
        bank={selectedBank}
        onBack={() => {
          setSelectedBank(null);
          fetchBanks();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="h-6 w-6" />
            Question Banks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage reusable question collections across your courses.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { resetForm(); setCreateOpen(true); }}>
              <Plus className="h-4 w-4" />
              New Bank
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Question Bank</DialogTitle>
              <DialogDescription>
                Create a new collection of reusable assessment questions.
              </DialogDescription>
            </DialogHeader>
            <BankForm
              name={formName}
              description={formDescription}
              category={formCategory}
              language={formLanguage}
              onNameChange={setFormName}
              onDescriptionChange={setFormDescription}
              onCategoryChange={setFormCategory}
              onLanguageChange={setFormLanguage}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!formName.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search question banks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-9"
        />
      </div>

      {/* Bank grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBanks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">
              {searchQuery ? 'No banks found' : 'No question banks yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'Try a different search term.'
                : 'Create your first question bank to start building a reusable question library.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => { resetForm(); setCreateOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Bank
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanks.map((bank) => (
            <Card
              key={bank.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md hover:border-primary/30',
              )}
              onClick={() => setSelectedBank(bank)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-1">{bank.name}</CardTitle>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(bank)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(bank.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bank.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {bank.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileQuestion className="h-3.5 w-3.5" />
                    {bank.question_count} questions
                  </span>
                  {bank.category && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {bank.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1 ms-auto">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {bank.language === 'ar' ? 'عربي' : bank.language === 'en' ? 'English' : 'Bilingual'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editBank} onOpenChange={(open) => { if (!open) setEditBank(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question Bank</DialogTitle>
          </DialogHeader>
          <BankForm
            name={formName}
            description={formDescription}
            category={formCategory}
            language={formLanguage}
            onNameChange={setFormName}
            onDescriptionChange={setFormDescription}
            onCategoryChange={setFormCategory}
            onLanguageChange={setFormLanguage}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBank(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!formName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// Bank form fields (shared between create and edit)
// ============================================================

function BankForm({
  name,
  description,
  category,
  language,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onLanguageChange,
}: {
  name: string;
  description: string;
  category: string;
  language: 'ar' | 'en' | 'bilingual';
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onLanguageChange: (v: 'ar' | 'en' | 'bilingual') => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qb-name">Name</Label>
        <Input
          id="qb-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Workplace Safety Questions"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qb-desc">Description</Label>
        <Input
          id="qb-desc"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Optional description"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qb-category">Category</Label>
        <Input
          id="qb-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="e.g., compliance, onboarding, safety"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Language</Label>
        <Select value={language} onValueChange={(v) => onLanguageChange(v as 'ar' | 'en' | 'bilingual')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">Arabic</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="bilingual">Bilingual</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
