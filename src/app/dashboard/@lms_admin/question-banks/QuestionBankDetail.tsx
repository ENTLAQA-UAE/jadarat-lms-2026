'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileQuestion,
  CheckCircle2,
  ToggleLeft,
  GripHorizontal,
  ListOrdered,
  Type,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionBank } from '@/types/question-bank';
import { BlockType } from '@/types/authoring';

interface QuestionItem {
  id: string;
  block_type: string;
  block_data: Record<string, unknown>;
  difficulty: string;
  tags: string[];
  points: number;
  usage_count: number;
  created_at: string;
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True / False',
  multiple_response: 'Multiple Response',
  fill_in_blank: 'Fill in Blank',
  matching: 'Matching',
  sorting: 'Sorting',
};

const QUESTION_TYPE_ICONS: Record<string, React.ReactNode> = {
  multiple_choice: <CheckCircle2 className="h-4 w-4" />,
  true_false: <ToggleLeft className="h-4 w-4" />,
  multiple_response: <GripHorizontal className="h-4 w-4" />,
  fill_in_blank: <Type className="h-4 w-4" />,
  matching: <ArrowLeftRight className="h-4 w-4" />,
  sorting: <ListOrdered className="h-4 w-4" />,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface QuestionBankDetailProps {
  bank: QuestionBank;
  onBack: () => void;
}

export default function QuestionBankDetail({ bank, onBack }: QuestionBankDetailProps) {
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Add question form state
  const [newType, setNewType] = useState<string>('multiple_choice');
  const [newDifficulty, setNewDifficulty] = useState<string>('medium');
  const [newPoints, setNewPoints] = useState(1);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState([
    { id: uuidv4(), text: '', is_correct: true, feedback: '' },
    { id: uuidv4(), text: '', is_correct: false, feedback: '' },
    { id: uuidv4(), text: '', is_correct: false, feedback: '' },
    { id: uuidv4(), text: '', is_correct: false, feedback: '' },
  ]);
  const [newExplanation, setNewExplanation] = useState('');
  // True/False specific
  const [newStatement, setNewStatement] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ bank_id: bank.id });
      if (filterType !== 'all') params.set('type', filterType);
      if (filterDifficulty !== 'all') params.set('difficulty', filterDifficulty);

      const res = await fetch(`/api/question-banks/items?${params}`);
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [bank.id, filterType, filterDifficulty]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const resetAddForm = () => {
    setNewType('multiple_choice');
    setNewDifficulty('medium');
    setNewPoints(1);
    setNewQuestion('');
    setNewOptions([
      { id: uuidv4(), text: '', is_correct: true, feedback: '' },
      { id: uuidv4(), text: '', is_correct: false, feedback: '' },
      { id: uuidv4(), text: '', is_correct: false, feedback: '' },
      { id: uuidv4(), text: '', is_correct: false, feedback: '' },
    ]);
    setNewExplanation('');
    setNewStatement('');
    setNewCorrectAnswer(true);
  };

  const buildBlockData = (): Record<string, unknown> => {
    switch (newType) {
      case 'multiple_choice':
        return {
          question: newQuestion,
          options: newOptions,
          explanation: newExplanation,
          allow_retry: true,
          shuffle_options: true,
          points: newPoints,
        };
      case 'true_false':
        return {
          statement: newStatement || newQuestion,
          correct_answer: newCorrectAnswer,
          explanation_true: newExplanation,
          explanation_false: newExplanation,
          points: newPoints,
        };
      case 'multiple_response':
        return {
          question: newQuestion,
          options: newOptions,
          explanation: newExplanation,
          min_selections: 1,
          max_selections: newOptions.filter((o) => o.is_correct).length,
          scoring: 'partial',
          points: newPoints,
        };
      case 'fill_in_blank':
        return {
          text_with_blanks: newQuestion,
          blanks: [{ id: 'blank_1', correct_answers: [newExplanation], case_sensitive: false }],
          explanation: '',
          points: newPoints,
        };
      case 'matching':
        return {
          instruction: newQuestion,
          pairs: newOptions.slice(0, 2).map((o, i) => ({
            id: o.id,
            left: o.text,
            right: o.feedback || `Match ${i + 1}`,
          })),
          shuffle: true,
          explanation: newExplanation,
          points: newPoints,
        };
      case 'sorting':
        return {
          instruction: newQuestion,
          categories: [
            { id: uuidv4(), name: 'Category A' },
            { id: uuidv4(), name: 'Category B' },
          ],
          items: newOptions.map((o) => ({
            id: o.id,
            text: o.text,
            correct_category_id: '',
          })),
          explanation: newExplanation,
          points: newPoints,
        };
      default:
        return {};
    }
  };

  const handleAdd = async () => {
    const blockData = buildBlockData();

    const res = await fetch('/api/question-banks/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bank_id: bank.id,
        block_type: newType,
        block_data: blockData,
        difficulty: newDifficulty,
        points: newPoints,
      }),
    });

    if (res.ok) {
      resetAddForm();
      setAddOpen(false);
      fetchItems();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const res = await fetch(`/api/question-banks/items?id=${itemId}`, { method: 'DELETE' });
    if (res.ok) fetchItems();
  };

  const getQuestionPreview = (item: QuestionItem): string => {
    const data = item.block_data;
    return (
      (data.question as string) ||
      (data.statement as string) ||
      (data.instruction as string) ||
      (data.text_with_blanks as string) ||
      'Untitled question'
    );
  };

  const hasQuestionContent = newType === 'true_false' ? newStatement.trim() : newQuestion.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{bank.name}</h1>
          {bank.description && (
            <p className="text-sm text-muted-foreground">{bank.description}</p>
          )}
        </div>
        <Button className="gap-2" onClick={() => { resetAddForm(); setAddOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="true_false">True / False</SelectItem>
            <SelectItem value="multiple_response">Multiple Response</SelectItem>
            <SelectItem value="fill_in_blank">Fill in Blank</SelectItem>
            <SelectItem value="matching">Matching</SelectItem>
            <SelectItem value="sorting">Sorting</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ms-auto">
          {items.length} question{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No questions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first question to start building this bank.
            </p>
            <Button onClick={() => { resetAddForm(); setAddOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <Card key={item.id} className="group">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-xs text-muted-foreground w-6 text-center shrink-0">
                  {index + 1}
                </span>
                <span className="shrink-0">{QUESTION_TYPE_ICONS[item.block_type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getQuestionPreview(item)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {QUESTION_TYPE_LABELS[item.block_type] || item.block_type}
                    </Badge>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0 rounded-full font-medium',
                        DIFFICULTY_COLORS[item.difficulty],
                      )}
                    >
                      {item.difficulty}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.points} pt{item.points !== 1 ? 's' : ''}
                    </span>
                    {item.usage_count > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        Used {item.usage_count}x
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Question Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Question type */}
            <div className="space-y-1.5">
              <Label>Question Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True / False</SelectItem>
                  <SelectItem value="multiple_response">Multiple Response</SelectItem>
                  <SelectItem value="fill_in_blank">Fill in Blank</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                  <SelectItem value="sorting">Sorting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty & Points */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Points</Label>
                <Input
                  type="number"
                  min={1}
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value) || 1)}
                />
              </div>
            </div>

            {/* Type-specific fields */}
            {newType === 'true_false' ? (
              <>
                <div className="space-y-1.5">
                  <Label>Statement</Label>
                  <Input
                    value={newStatement}
                    onChange={(e) => setNewStatement(e.target.value)}
                    placeholder="Enter the true/false statement..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Correct Answer</Label>
                  <Select
                    value={newCorrectAnswer ? 'true' : 'false'}
                    onValueChange={(v) => setNewCorrectAnswer(v === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Question</Label>
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter the question..."
                  />
                </div>

                {(newType === 'multiple_choice' || newType === 'multiple_response') && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {newOptions.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input
                          type={newType === 'multiple_choice' ? 'radio' : 'checkbox'}
                          name="correct-option"
                          checked={opt.is_correct}
                          onChange={() => {
                            if (newType === 'multiple_choice') {
                              setNewOptions(
                                newOptions.map((o, i) => ({ ...o, is_correct: i === idx }))
                              );
                            } else {
                              setNewOptions(
                                newOptions.map((o, i) =>
                                  i === idx ? { ...o, is_correct: !o.is_correct } : o
                                )
                              );
                            }
                          }}
                          className="shrink-0"
                        />
                        <Input
                          value={opt.text}
                          onChange={(e) =>
                            setNewOptions(
                              newOptions.map((o, i) =>
                                i === idx ? { ...o, text: e.target.value } : o
                              )
                            )
                          }
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1"
                        />
                        {newOptions.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() =>
                              setNewOptions(newOptions.filter((_, i) => i !== idx))
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {newOptions.length < 6 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() =>
                          setNewOptions([
                            ...newOptions,
                            { id: uuidv4(), text: '', is_correct: false, feedback: '' },
                          ])
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Option
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Explanation */}
            <div className="space-y-1.5">
              <Label>Explanation (shown after answering)</Label>
              <Input
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Why this is the correct answer..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!hasQuestionContent}>
              Add Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
