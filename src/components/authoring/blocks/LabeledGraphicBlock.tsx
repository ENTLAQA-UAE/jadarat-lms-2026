'use client';

import { type LabeledGraphicBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Plus, Trash2 } from 'lucide-react';

interface LabeledGraphicBlockEditorProps {
  block: LabeledGraphicBlock;
  onChange: (data: Partial<LabeledGraphicBlock['data']>) => void;
}

export function LabeledGraphicBlockEditor({
  block,
  onChange,
}: LabeledGraphicBlockEditorProps) {
  const { data } = block;

  const addMarker = () => {
    const newMarker = {
      id: uuidv4(),
      x_percent: 50,
      y_percent: 50,
      label: '',
      description: '',
      icon: 'info' as const,
    };
    onChange({ markers: [...data.markers, newMarker] });
  };

  const removeMarker = (markerId: string) => {
    onChange({ markers: data.markers.filter((m) => m.id !== markerId) });
  };

  const updateMarker = (
    markerId: string,
    field: keyof LabeledGraphicBlock['data']['markers'][number],
    value: string | number
  ) => {
    onChange({
      markers: data.markers.map((marker) =>
        marker.id === markerId ? { ...marker, [field]: value } : marker
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4" />
          Labeled Graphic Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor={`lg-image-${block.id}`}>Image URL</Label>
          <Input
            id={`lg-image-${block.id}`}
            value={data.image}
            onChange={(e) => onChange({ image: e.target.value })}
            placeholder="https://example.com/image.jpg"
            type="url"
          />
        </div>

        {/* Image preview with markers */}
        {data.image && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div className="relative overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.image}
                alt="Labeled graphic preview"
                className="w-full object-contain"
              />
              {data.markers.map((marker, index) => (
                <div
                  key={marker.id}
                  className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-md border-2 border-white"
                  style={{
                    left: `${marker.x_percent}%`,
                    top: `${marker.y_percent}%`,
                  }}
                  title={marker.label || `Marker ${index + 1}`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Markers list */}
        <div className="space-y-3">
          {data.markers.map((marker, index) => (
            <div
              key={marker.id}
              className="rounded-lg border border-border bg-muted/20 p-3"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Marker {index + 1}
                </span>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMarker(marker.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  title="Remove marker"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                {/* Position inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor={`lg-x-${marker.id}`}
                      className="text-xs"
                    >
                      X Position (0-100)
                    </Label>
                    <Input
                      id={`lg-x-${marker.id}`}
                      type="number"
                      min={0}
                      max={100}
                      value={marker.x_percent}
                      onChange={(e) =>
                        updateMarker(
                          marker.id,
                          'x_percent',
                          Number(e.target.value)
                        )
                      }
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`lg-y-${marker.id}`}
                      className="text-xs"
                    >
                      Y Position (0-100)
                    </Label>
                    <Input
                      id={`lg-y-${marker.id}`}
                      type="number"
                      min={0}
                      max={100}
                      value={marker.y_percent}
                      onChange={(e) =>
                        updateMarker(
                          marker.id,
                          'y_percent',
                          Number(e.target.value)
                        )
                      }
                      placeholder="50"
                    />
                  </div>
                </div>

                {/* Label */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`lg-label-${marker.id}`}
                    className="text-xs"
                  >
                    Label
                  </Label>
                  <Input
                    id={`lg-label-${marker.id}`}
                    value={marker.label}
                    onChange={(e) =>
                      updateMarker(marker.id, 'label', e.target.value)
                    }
                    placeholder="Marker label"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`lg-desc-${marker.id}`}
                    className="text-xs"
                  >
                    Description
                  </Label>
                  <Textarea
                    id={`lg-desc-${marker.id}`}
                    value={marker.description}
                    onChange={(e) =>
                      updateMarker(marker.id, 'description', e.target.value)
                    }
                    placeholder="Marker description"
                    className="min-h-[60px]"
                  />
                </div>

                {/* Icon select */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`lg-icon-${marker.id}`}
                    className="text-xs"
                  >
                    Icon
                  </Label>
                  <select
                    id={`lg-icon-${marker.id}`}
                    value={marker.icon}
                    onChange={(e) =>
                      updateMarker(
                        marker.id,
                        'icon',
                        e.target.value as 'info' | 'pin' | 'number'
                      )
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="info">Info</option>
                    <option value="pin">Pin</option>
                    <option value="number">Number</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add marker button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addMarker}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Marker
        </Button>
      </CardContent>
    </Card>
  );
}
