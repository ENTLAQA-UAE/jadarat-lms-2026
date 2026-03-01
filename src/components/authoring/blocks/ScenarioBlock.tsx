'use client';

import { type ScenarioBlock } from '@/types/authoring';
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
import { Route, Plus, Trash2 } from 'lucide-react';

interface ScenarioBlockEditorProps {
  block: ScenarioBlock;
  onChange: (data: Partial<ScenarioBlock['data']>) => void;
}

export function ScenarioBlockEditor({
  block,
  onChange,
}: ScenarioBlockEditorProps) {
  const { data } = block;

  // ── Node helpers ──────────────────────────────────────────

  const addNode = () => {
    const newNode: ScenarioBlock['data']['nodes'][number] = {
      id: uuidv4(),
      type: 'question',
      content: '',
      choices: [],
    };
    onChange({ nodes: [...data.nodes, newNode] });
  };

  const removeNode = (nodeId: string) => {
    const updatedNodes = data.nodes.filter((node) => node.id !== nodeId);
    // If the removed node was the start node, clear start_node_id
    const updatedStartNodeId =
      data.start_node_id === nodeId ? '' : data.start_node_id;
    onChange({ nodes: updatedNodes, start_node_id: updatedStartNodeId });
  };

  const updateNode = (
    nodeId: string,
    updates: Partial<ScenarioBlock['data']['nodes'][number]>
  ) => {
    onChange({
      nodes: data.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    });
  };

  const updateNodeType = (
    nodeId: string,
    newType: 'question' | 'outcome'
  ) => {
    onChange({
      nodes: data.nodes.map((node) => {
        if (node.id !== nodeId) return node;
        if (newType === 'question') {
          return {
            ...node,
            type: newType,
            choices: node.choices ?? [],
            is_positive_outcome: undefined,
          };
        }
        return {
          ...node,
          type: newType,
          choices: undefined,
          is_positive_outcome: node.is_positive_outcome ?? true,
        };
      }),
    });
  };

  // ── Choice helpers ────────────────────────────────────────

  const addChoice = (nodeId: string) => {
    const node = data.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newChoice: NonNullable<
      ScenarioBlock['data']['nodes'][number]['choices']
    >[number] = {
      id: uuidv4(),
      text: '',
      next_node_id: '',
      is_optimal: false,
      feedback: '',
    };

    updateNode(nodeId, {
      choices: [...(node.choices ?? []), newChoice],
    });
  };

  const removeChoice = (nodeId: string, choiceId: string) => {
    const node = data.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    updateNode(nodeId, {
      choices: (node.choices ?? []).filter((c) => c.id !== choiceId),
    });
  };

  const updateChoice = (
    nodeId: string,
    choiceId: string,
    updates: Partial<
      NonNullable<ScenarioBlock['data']['nodes'][number]['choices']>[number]
    >
  ) => {
    const node = data.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    updateNode(nodeId, {
      choices: (node.choices ?? []).map((choice) =>
        choice.id === choiceId ? { ...choice, ...updates } : choice
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Route className="h-4 w-4" />
          Scenario Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`scenario-title-${block.id}`}>Title</Label>
          <Input
            id={`scenario-title-${block.id}`}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Scenario title"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={`scenario-description-${block.id}`}>
            Description
          </Label>
          <Textarea
            id={`scenario-description-${block.id}`}
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Brief description of the scenario"
            className="min-h-[80px]"
          />
        </div>

        {/* Start Node ID */}
        <div className="space-y-2">
          <Label htmlFor={`scenario-start-node-${block.id}`}>
            Start Node
          </Label>
          <Select
            value={data.start_node_id}
            onValueChange={(value) => onChange({ start_node_id: value })}
          >
            <SelectTrigger id={`scenario-start-node-${block.id}`}>
              <SelectValue placeholder="Select start node" />
            </SelectTrigger>
            <SelectContent>
              {data.nodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.content
                    ? node.content.slice(0, 40) +
                      (node.content.length > 40 ? '...' : '')
                    : '(empty)'}{' '}
                  — {node.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Node ID badges */}
        {data.nodes.length > 0 && (
          <div className="space-y-2">
            <Label>Node References</Label>
            <div className="flex flex-wrap gap-1.5">
              {data.nodes.map((node, index) => (
                <span
                  key={node.id}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {index + 1}. {node.type === 'question' ? 'Q' : 'O'} —{' '}
                  {node.id.slice(0, 8)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nodes */}
        <div className="space-y-2">
          <Label>Nodes</Label>
          <div className="space-y-3">
            {data.nodes.map((node, index) => (
              <div
                key={node.id}
                className="rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Node {index + 1}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {node.id.slice(0, 8)}
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNode(node.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    disabled={data.nodes.length <= 1}
                    title="Remove node"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="mt-2 space-y-2">
                  {/* Node type */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`scenario-node-type-${node.id}`}
                      className="text-xs"
                    >
                      Type
                    </Label>
                    <Select
                      value={node.type}
                      onValueChange={(value: 'question' | 'outcome') =>
                        updateNodeType(node.id, value)
                      }
                    >
                      <SelectTrigger id={`scenario-node-type-${node.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">Question</SelectItem>
                        <SelectItem value="outcome">Outcome</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Node content */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`scenario-node-content-${node.id}`}
                      className="text-xs"
                    >
                      Content
                    </Label>
                    <Textarea
                      id={`scenario-node-content-${node.id}`}
                      value={node.content}
                      onChange={(e) =>
                        updateNode(node.id, { content: e.target.value })
                      }
                      placeholder="Node content text"
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Image URL (optional) */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`scenario-node-image-${node.id}`}
                      className="text-xs"
                    >
                      Image URL (optional)
                    </Label>
                    <Input
                      id={`scenario-node-image-${node.id}`}
                      value={node.image ?? ''}
                      onChange={(e) =>
                        updateNode(node.id, { image: e.target.value })
                      }
                      placeholder="https://example.com/image.png"
                    />
                  </div>

                  {/* Question-specific: Choices */}
                  {node.type === 'question' && (
                    <div className="space-y-2 border-t border-border pt-2">
                      <Label className="text-xs">Choices</Label>
                      <div className="space-y-3">
                        {(node.choices ?? []).map((choice, choiceIndex) => (
                          <div
                            key={choice.id}
                            className="rounded-md border border-border bg-background p-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-muted-foreground">
                                Choice {choiceIndex + 1}
                              </span>
                              <div className="flex-1" />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeChoice(node.id, choice.id)
                                }
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                title="Remove choice"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="mt-1.5 space-y-2">
                              {/* Choice text */}
                              <div className="space-y-1">
                                <Label
                                  htmlFor={`scenario-choice-text-${choice.id}`}
                                  className="text-[10px]"
                                >
                                  Text
                                </Label>
                                <Input
                                  id={`scenario-choice-text-${choice.id}`}
                                  value={choice.text}
                                  onChange={(e) =>
                                    updateChoice(node.id, choice.id, {
                                      text: e.target.value,
                                    })
                                  }
                                  placeholder="Choice text"
                                />
                              </div>

                              {/* Next node ID */}
                              <div className="space-y-1">
                                <Label
                                  htmlFor={`scenario-choice-next-${choice.id}`}
                                  className="text-[10px]"
                                >
                                  Next Node
                                </Label>
                                <Select
                                  value={choice.next_node_id}
                                  onValueChange={(value) =>
                                    updateChoice(node.id, choice.id, {
                                      next_node_id: value,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    id={`scenario-choice-next-${choice.id}`}
                                  >
                                    <SelectValue placeholder="Select next node" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {data.nodes
                                      .filter((n) => n.id !== node.id)
                                      .map((n, nIdx) => (
                                        <SelectItem key={n.id} value={n.id}>
                                          Node{' '}
                                          {data.nodes.findIndex(
                                            (dn) => dn.id === n.id
                                          ) + 1}{' '}
                                          ({n.type}) —{' '}
                                          {n.content
                                            ? n.content.slice(0, 30) +
                                              (n.content.length > 30
                                                ? '...'
                                                : '')
                                            : '(empty)'}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Is optimal */}
                              <div className="flex items-center justify-between">
                                <Label
                                  htmlFor={`scenario-choice-optimal-${choice.id}`}
                                  className="cursor-pointer text-[10px]"
                                >
                                  Optimal choice
                                </Label>
                                <Switch
                                  id={`scenario-choice-optimal-${choice.id}`}
                                  checked={choice.is_optimal}
                                  onCheckedChange={(checked) =>
                                    updateChoice(node.id, choice.id, {
                                      is_optimal: checked,
                                    })
                                  }
                                />
                              </div>

                              {/* Feedback */}
                              <div className="space-y-1">
                                <Label
                                  htmlFor={`scenario-choice-feedback-${choice.id}`}
                                  className="text-[10px]"
                                >
                                  Feedback
                                </Label>
                                <Textarea
                                  id={`scenario-choice-feedback-${choice.id}`}
                                  value={choice.feedback}
                                  onChange={(e) =>
                                    updateChoice(node.id, choice.id, {
                                      feedback: e.target.value,
                                    })
                                  }
                                  placeholder="Feedback shown when this choice is selected"
                                  className="min-h-[60px]"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addChoice(node.id)}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Choice
                      </Button>
                    </div>
                  )}

                  {/* Outcome-specific: is_positive_outcome */}
                  {node.type === 'outcome' && (
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <Label
                        htmlFor={`scenario-node-positive-${node.id}`}
                        className="cursor-pointer text-xs"
                      >
                        Positive outcome
                      </Label>
                      <Switch
                        id={`scenario-node-positive-${node.id}`}
                        checked={node.is_positive_outcome ?? true}
                        onCheckedChange={(checked) =>
                          updateNode(node.id, {
                            is_positive_outcome: checked,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addNode}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
