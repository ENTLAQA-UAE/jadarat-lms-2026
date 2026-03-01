'use client';

import { type ChartBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, BarChart3 as BarChartIcon } from 'lucide-react';

interface ChartBlockEditorProps {
  block: ChartBlock;
  onChange: (data: Partial<ChartBlock['data']>) => void;
}

export function ChartBlockEditor({ block, onChange }: ChartBlockEditorProps) {
  const { data } = block;

  // --- Label helpers ---
  const addLabel = () => {
    const newLabels = [...data.labels, ''];
    const newDatasets = data.datasets.map((ds) => ({
      ...ds,
      data: [...ds.data, 0],
    }));
    onChange({ labels: newLabels, datasets: newDatasets });
  };

  const removeLabel = (index: number) => {
    const newLabels = data.labels.filter((_, i) => i !== index);
    const newDatasets = data.datasets.map((ds) => ({
      ...ds,
      data: ds.data.filter((_, i) => i !== index),
    }));
    onChange({ labels: newLabels, datasets: newDatasets });
  };

  const updateLabel = (index: number, value: string) => {
    const newLabels = data.labels.map((l, i) => (i === index ? value : l));
    onChange({ labels: newLabels });
  };

  // --- Dataset helpers ---
  const addDataset = () => {
    const newDataset = {
      label: '',
      data: data.labels.map(() => 0),
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    };
    onChange({ datasets: [...data.datasets, newDataset] });
  };

  const removeDataset = (index: number) => {
    onChange({ datasets: data.datasets.filter((_, i) => i !== index) });
  };

  const updateDataset = (
    dsIndex: number,
    field: 'label' | 'color',
    value: string
  ) => {
    onChange({
      datasets: data.datasets.map((ds, i) =>
        i === dsIndex ? { ...ds, [field]: value } : ds
      ),
    });
  };

  const updateDatasetValue = (dsIndex: number, valIndex: number, value: number) => {
    onChange({
      datasets: data.datasets.map((ds, i) =>
        i === dsIndex
          ? { ...ds, data: ds.data.map((v, j) => (j === valIndex ? value : v)) }
          : ds
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChartIcon className="h-4 w-4" />
          Chart Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart type */}
        <div className="space-y-2">
          <Label htmlFor={`chart-type-${block.id}`}>Chart Type</Label>
          <select
            id={`chart-type-${block.id}`}
            value={data.chart_type}
            onChange={(e) =>
              onChange({
                chart_type: e.target.value as ChartBlock['data']['chart_type'],
              })
            }
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
            <option value="donut">Donut</option>
          </select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`chart-title-${block.id}`}>Title</Label>
          <Input
            id={`chart-title-${block.id}`}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Chart title"
          />
        </div>

        {/* Labels */}
        <div className="space-y-3 border-t border-border pt-4">
          <Label>Labels</Label>
          <div className="space-y-2">
            {data.labels.map((label, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={label}
                  onChange={(e) => updateLabel(index, e.target.value)}
                  placeholder={`Label ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLabel(index)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={data.labels.length <= 1}
                  title="Remove label"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addLabel}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Label
          </Button>
        </div>

        {/* Datasets */}
        <div className="space-y-3 border-t border-border pt-4">
          <Label>Datasets</Label>
          <div className="space-y-4">
            {data.datasets.map((dataset, dsIndex) => (
              <div
                key={dsIndex}
                className="rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Dataset {dsIndex + 1}
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDataset(dsIndex)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    disabled={data.datasets.length <= 1}
                    title="Remove dataset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={dataset.label}
                        onChange={(e) =>
                          updateDataset(dsIndex, 'label', e.target.value)
                        }
                        placeholder="Dataset label"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color</Label>
                      <input
                        type="color"
                        value={dataset.color}
                        onChange={(e) =>
                          updateDataset(dsIndex, 'color', e.target.value)
                        }
                        className="h-9 w-12 cursor-pointer rounded-md border border-input"
                      />
                    </div>
                  </div>

                  {/* Data values */}
                  <div className="space-y-1">
                    <Label className="text-xs">Values</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {dataset.data.map((value, valIndex) => (
                        <div key={valIndex} className="space-y-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {data.labels[valIndex] || `#${valIndex + 1}`}
                          </span>
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) =>
                              updateDatasetValue(
                                dsIndex,
                                valIndex,
                                Number(e.target.value) || 0
                              )
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addDataset}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Dataset
          </Button>
        </div>

        {/* Show legend toggle */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`chart-legend-${block.id}`}
              className="cursor-pointer"
            >
              Show Legend
            </Label>
            <Switch
              id={`chart-legend-${block.id}`}
              checked={data.show_legend}
              onCheckedChange={(checked) =>
                onChange({ show_legend: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
