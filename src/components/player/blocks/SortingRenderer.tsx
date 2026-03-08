'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortingBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface SortingRendererProps {
  block: SortingBlock;
  progress?: BlockProgress;
  onComplete: (score: number, responseData: Record<string, unknown>) => void;
  theme: CourseTheme;
}

/* ------------------------------------------------------------------ */
/* Draggable item                                                     */
/* ------------------------------------------------------------------ */
function DraggableItem({
  id,
  text,
  disabled,
}: {
  id: string;
  text: string;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
        'bg-background shadow-sm select-none',
        isDragging && 'opacity-30',
        !disabled && 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30',
        disabled && 'cursor-default',
      )}
    >
      {!disabled && <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
      {text}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Droppable category zone                                            */
/* ------------------------------------------------------------------ */
function DroppableCategory({
  id,
  name,
  children,
  disabled,
}: {
  id: string;
  name: string;
  children: React.ReactNode;
  disabled: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg border-2 border-dashed p-4 transition-all min-h-[100px]',
        isOver && !disabled && 'border-primary bg-primary/5 scale-[1.01]',
        !isOver && 'border-border/60',
      )}
    >
      <p className="text-sm font-semibold mb-3">{name}</p>
      <div className="flex flex-wrap gap-2 min-h-[36px]">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export function SortingRenderer({
  block,
  progress,
  onComplete,
}: SortingRendererProps) {
  const initialAssignments = (): Map<string, string> => {
    if (progress?.completed && progress.response_data) {
      const saved = (progress.response_data as Record<string, unknown>)
        ?.assignments as Record<string, string> | undefined;
      if (saved) return new Map(Object.entries(saved));
    }
    return new Map();
  };

  const [assignments, setAssignments] = useState<Map<string, string>>(initialAssignments);
  const [submitted, setSubmitted] = useState(progress?.completed ?? false);
  const [score, setScore] = useState<number | null>(
    progress?.completed ? (progress.score ?? null) : null,
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const isAllCorrect = score !== null && score >= block.data.points;

  const unsortedItems = block.data.items.filter((item) => !assignments.has(item.id));
  const getItemsForCategory = (categoryId: string) =>
    block.data.items.filter((item) => assignments.get(item.id) === categoryId);

  const activeItem = activeId ? block.data.items.find((i) => i.id === activeId) : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      if (submitted) return;

      const { active, over } = event;
      if (!over) return;

      const itemId = active.id as string;
      const categoryId = over.id as string;

      // Only drop onto category zones
      if (!block.data.categories.some((c) => c.id === categoryId)) return;

      setAssignments((prev) => {
        const next = new Map(prev);
        next.set(itemId, categoryId);
        return next;
      });
    },
    [submitted, block.data.categories],
  );

  const handleUnassign = (itemId: string) => {
    if (submitted) return;
    setAssignments((prev) => {
      const next = new Map(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleSubmit = () => {
    if (assignments.size !== block.data.items.length) return;

    let correctCount = 0;
    block.data.items.forEach((item) => {
      if (assignments.get(item.id) === item.correct_category_id) correctCount++;
    });

    const earnedScore = Math.round(
      (correctCount / block.data.items.length) * block.data.points,
    );

    setScore(earnedScore);
    setSubmitted(true);

    const assignmentsObj: Record<string, string> = {};
    assignments.forEach((categoryId, itemId) => {
      assignmentsObj[itemId] = categoryId;
    });

    onComplete(earnedScore, {
      assignments: assignmentsObj,
      correct_count: correctCount,
      total_count: block.data.items.length,
      is_correct: correctCount === block.data.items.length,
    });
  };

  const handleRetry = () => {
    setAssignments(new Map());
    setSubmitted(false);
    setScore(null);
  };

  const allAssigned = assignments.size === block.data.items.length;

  return (
    <div
      className="border rounded-lg p-6 space-y-4"
      style={{ borderRadius: 'var(--player-radius)', fontFamily: 'var(--player-font)' }}
    >
      <h3 className="font-medium text-lg">{block.data.instruction}</h3>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Unsorted items pool */}
        {unsortedItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {submitted ? 'Items' : 'Drag items to a category below, or use the select dropdowns for keyboard access'}
            </p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {unsortedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DraggableItem id={item.id} text={item.text} disabled={submitted} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Category drop zones */}
        <div className="grid gap-3 sm:grid-cols-2">
          {block.data.categories.map((category) => {
            const categoryItems = getItemsForCategory(category.id);

            return (
              <DroppableCategory
                key={category.id}
                id={category.id}
                name={category.name}
                disabled={submitted}
              >
                {categoryItems.length === 0 && !submitted && (
                  <span className="text-xs text-muted-foreground/50 italic">
                    Drop items here
                  </span>
                )}
                <AnimatePresence>
                  {categoryItems.map((item) => {
                    const isCorrectPlacement = item.correct_category_id === category.id;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span
                          role="button"
                          tabIndex={submitted ? -1 : 0}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm',
                            !submitted &&
                              'cursor-pointer hover:bg-destructive/10 hover:border-destructive/40',
                            submitted &&
                              isCorrectPlacement &&
                              'border-green-500 bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-300',
                            submitted &&
                              !isCorrectPlacement &&
                              'border-red-500 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300',
                            !submitted && 'border-border bg-background',
                          )}
                          onClick={() => handleUnassign(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleUnassign(item.id);
                            }
                          }}
                        >
                          {!submitted && (
                            <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                          )}
                          {item.text}
                          {submitted && isCorrectPlacement && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          )}
                          {submitted && !isCorrectPlacement && (
                            <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          )}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </DroppableCategory>
            );
          })}
        </div>

        {/* Ghost card following cursor during drag */}
        <DragOverlay dropAnimation={null}>
          {activeItem && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary bg-primary/5 text-sm shadow-lg scale-105">
              <GripVertical className="h-3.5 w-3.5 text-primary/60 shrink-0" />
              {activeItem.text}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Keyboard-accessible sorting (alternative to drag) */}
      {!submitted && unsortedItems.length > 0 && (
        <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground">Keyboard sorting</p>
          {block.data.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium min-w-[120px]">{item.text}</span>
              <select
                aria-label={`Category for: ${item.text}`}
                className="text-sm border rounded px-2 py-1 bg-background"
                value={assignments.get(item.id) ?? ''}
                onChange={(e) => {
                  const categoryId = e.target.value;
                  setAssignments((prev) => {
                    const next = new Map(prev);
                    if (!categoryId) {
                      next.delete(item.id);
                    } else {
                      next.set(item.id, categoryId);
                    }
                    return next;
                  });
                }}
              >
                <option value="">-- Select category --</option>
                {block.data.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Result & explanation */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-3 rounded-lg text-sm',
            isAllCorrect
              ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300',
          )}
        >
          <div className="flex items-center gap-2 font-medium mb-1">
            {isAllCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Correct!
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> Incorrect — {score} / {block.data.points} points
              </>
            )}
          </div>
          {block.data.explanation && <p>{block.data.explanation}</p>}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!submitted && (
          <Button onClick={handleSubmit} disabled={!allAssigned}>
            Submit Answer
          </Button>
        )}
        {submitted && !isAllCorrect && (
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
