'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScenarioBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface ScenarioRendererProps {
  block: ScenarioBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function ScenarioRenderer({
  block,
  progress,
  onComplete,
  theme,
}: ScenarioRendererProps) {
  const { data } = block;

  const [currentNodeId, setCurrentNodeId] = useState<string>(
    data.start_node_id
  );
  const [pathHistory, setPathHistory] = useState<string[]>([
    data.start_node_id,
  ]);
  const [optimalCount, setOptimalCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [completed, setCompleted] = useState(progress?.completed ?? false);

  const currentNode = data.nodes.find((n) => n.id === currentNodeId);

  // Auto-complete when reaching an outcome node
  useEffect(() => {
    if (currentNode?.type === 'outcome' && !completed) {
      setCompleted(true);
      onComplete();
    }
  }, [currentNode, completed, onComplete]);

  const handleChoiceClick = useCallback(
    (choice: NonNullable<ScenarioBlock['data']['nodes'][number]['choices']>[number]) => {
      if (showFeedback) return;

      // Track optimal choice
      if (choice.is_optimal) {
        setOptimalCount((prev) => prev + 1);
      }

      // Show feedback
      setShowFeedback(choice.feedback || 'Proceeding...');

      // Navigate to next node after 1.5s
      setTimeout(() => {
        setShowFeedback(null);
        setCurrentNodeId(choice.next_node_id);
        setPathHistory((prev) => [...prev, choice.next_node_id]);
      }, 1500);
    },
    [showFeedback]
  );

  const handleRestart = useCallback(() => {
    setCurrentNodeId(data.start_node_id);
    setPathHistory([data.start_node_id]);
    setOptimalCount(0);
    setShowFeedback(null);
    setCompleted(false);
  }, [data.start_node_id]);

  if (!currentNode) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted-foreground">
        Scenario not available. The start node could not be found.
      </div>
    );
  }

  // ── Outcome node ──────────────────────────────────────────
  if (currentNode.type === 'outcome') {
    const isPositive = currentNode.is_positive_outcome ?? true;

    // Count total question nodes visited (exclude outcome)
    const questionNodesVisited = pathHistory.filter((nodeId) => {
      const node = data.nodes.find((n) => n.id === nodeId);
      return node?.type === 'question';
    }).length;

    return (
      <div className="border rounded-lg p-6 space-y-4">
        {/* Title & description */}
        {data.title && (
          <h3 className="font-medium text-lg">{data.title}</h3>
        )}

        {/* Outcome card */}
        <div
          className={cn(
            'rounded-lg p-6 text-center space-y-3',
            isPositive
              ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800'
              : 'bg-orange-50 border border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
          )}
        >
          {/* Icon */}
          <div className="flex justify-center">
            {isPositive ? (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-orange-500" />
            )}
          </div>

          {/* Outcome image */}
          {currentNode.image && (
            <img
              src={currentNode.image}
              alt=""
              className="mx-auto max-h-[200px] rounded-md object-contain"
            />
          )}

          {/* Outcome message */}
          <p
            className={cn(
              'text-lg font-medium',
              isPositive
                ? 'text-green-800 dark:text-green-300'
                : 'text-orange-800 dark:text-orange-300'
            )}
          >
            {currentNode.content}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 text-sm text-muted-foreground pt-2">
            <span>Nodes visited: {pathHistory.length}</span>
            <span>Optimal choices: {optimalCount}{questionNodesVisited > 0 ? ` / ${questionNodesVisited}` : ''}</span>
          </div>
        </div>

        {/* Restart */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleRestart} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
        </div>
      </div>
    );
  }

  // ── Question node ─────────────────────────────────────────
  return (
    <div className="border rounded-lg p-6 space-y-4">
      {/* Title & description (shown only on the first node) */}
      {currentNodeId === data.start_node_id && (
        <div className="space-y-1">
          {data.title && (
            <h3 className="font-medium text-lg">{data.title}</h3>
          )}
          {data.description && (
            <p className="text-sm text-muted-foreground">
              {data.description}
            </p>
          )}
        </div>
      )}

      {/* Node image */}
      {currentNode.image && (
        <img
          src={currentNode.image}
          alt=""
          className="mx-auto max-h-[240px] rounded-md object-contain"
        />
      )}

      {/* Node content */}
      <p className="text-base">{currentNode.content}</p>

      {/* Feedback overlay */}
      {showFeedback && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-300">
          {showFeedback}
        </div>
      )}

      {/* Choice buttons */}
      {!showFeedback && (
        <div className="space-y-2">
          {(currentNode.choices ?? []).map((choice) => (
            <button
              key={choice.id}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg border text-start transition-colors',
                'hover:bg-accent/50 cursor-pointer border-border'
              )}
              onClick={() => handleChoiceClick(choice)}
            >
              <span>{choice.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <span>Step {pathHistory.length}</span>
        <span>Optimal choices so far: {optimalCount}</span>
      </div>
    </div>
  );
}
