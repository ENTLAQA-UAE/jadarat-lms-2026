'use client';

import { type HotspotBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MousePointerClick, Plus, Trash2 } from 'lucide-react';

interface HotspotBlockEditorProps {
  block: HotspotBlock;
  onChange: (data: Partial<HotspotBlock['data']>) => void;
}

export function HotspotBlockEditor({
  block,
  onChange,
}: HotspotBlockEditorProps) {
  const { data } = block;

  const addRegion = () => {
    const newRegion = {
      id: uuidv4(),
      shape: 'circle' as const,
      coords: [50, 50, 10],
      label: '',
      content: '',
      is_correct: false,
    };
    onChange({ regions: [...data.regions, newRegion] });
  };

  const removeRegion = (regionId: string) => {
    onChange({ regions: data.regions.filter((r) => r.id !== regionId) });
  };

  const updateRegion = (
    regionId: string,
    field: keyof HotspotBlock['data']['regions'][number],
    value: string | number[] | boolean
  ) => {
    onChange({
      regions: data.regions.map((region) =>
        region.id === regionId ? { ...region, [field]: value } : region
      ),
    });
  };

  const updateRegionCoord = (
    regionId: string,
    coordIndex: number,
    value: number
  ) => {
    onChange({
      regions: data.regions.map((region) => {
        if (region.id !== regionId) return region;
        const newCoords = [...region.coords];
        newCoords[coordIndex] = value;
        return { ...region, coords: newCoords };
      }),
    });
  };

  const handleShapeChange = (
    regionId: string,
    shape: 'circle' | 'rect'
  ) => {
    onChange({
      regions: data.regions.map((region) => {
        if (region.id !== regionId) return region;
        const newCoords =
          shape === 'circle' ? [50, 50, 10] : [25, 25, 75, 75];
        return { ...region, shape, coords: newCoords };
      }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <MousePointerClick className="h-4 w-4" />
          Hotspot Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor={`hs-image-${block.id}`}>Image URL</Label>
          <Input
            id={`hs-image-${block.id}`}
            value={data.image}
            onChange={(e) => onChange({ image: e.target.value })}
            placeholder="https://example.com/image.jpg"
            type="url"
          />
        </div>

        {/* Mode select */}
        <div className="space-y-2">
          <Label htmlFor={`hs-mode-${block.id}`}>Mode</Label>
          <select
            id={`hs-mode-${block.id}`}
            value={data.mode}
            onChange={(e) =>
              onChange({ mode: e.target.value as 'explore' | 'quiz' })
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="explore">Explore</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>

        {/* Image preview with regions */}
        {data.image && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div className="relative overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.image}
                alt="Hotspot preview"
                className="w-full object-contain"
              />
              {data.regions.map((region, index) => {
                if (region.shape === 'circle') {
                  const [x, y, radius] = region.coords;
                  return (
                    <div
                      key={region.id}
                      className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-md border-2 border-white"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                      }}
                      title={region.label || `Region ${index + 1}`}
                    >
                      {index + 1}
                    </div>
                  );
                } else {
                  const [x1, y1, x2, y2] = region.coords;
                  return (
                    <div
                      key={region.id}
                      className="absolute border-2 border-primary bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                      style={{
                        left: `${x1}%`,
                        top: `${y1}%`,
                        width: `${x2 - x1}%`,
                        height: `${y2 - y1}%`,
                      }}
                      title={region.label || `Region ${index + 1}`}
                    >
                      <span className="rounded-full bg-primary h-5 w-5 flex items-center justify-center shadow-md border-2 border-white">
                        {index + 1}
                      </span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Regions list */}
        <div className="space-y-3">
          {data.regions.map((region, index) => (
            <div
              key={region.id}
              className="rounded-lg border border-border bg-muted/20 p-3"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Region {index + 1}
                </span>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRegion(region.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  title="Remove region"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                {/* Shape select */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`hs-shape-${region.id}`}
                    className="text-xs"
                  >
                    Shape
                  </Label>
                  <select
                    id={`hs-shape-${region.id}`}
                    value={region.shape}
                    onChange={(e) =>
                      handleShapeChange(
                        region.id,
                        e.target.value as 'circle' | 'rect'
                      )
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="circle">Circle</option>
                    <option value="rect">Rectangle</option>
                  </select>
                </div>

                {/* Coordinates */}
                {region.shape === 'circle' ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor={`hs-cx-${region.id}`}
                        className="text-xs"
                      >
                        X (0-100)
                      </Label>
                      <Input
                        id={`hs-cx-${region.id}`}
                        type="number"
                        min={0}
                        max={100}
                        value={region.coords[0] ?? 50}
                        onChange={(e) =>
                          updateRegionCoord(
                            region.id,
                            0,
                            Number(e.target.value)
                          )
                        }
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`hs-cy-${region.id}`}
                        className="text-xs"
                      >
                        Y (0-100)
                      </Label>
                      <Input
                        id={`hs-cy-${region.id}`}
                        type="number"
                        min={0}
                        max={100}
                        value={region.coords[1] ?? 50}
                        onChange={(e) =>
                          updateRegionCoord(
                            region.id,
                            1,
                            Number(e.target.value)
                          )
                        }
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`hs-cr-${region.id}`}
                        className="text-xs"
                      >
                        Radius (0-100)
                      </Label>
                      <Input
                        id={`hs-cr-${region.id}`}
                        type="number"
                        min={0}
                        max={100}
                        value={region.coords[2] ?? 10}
                        onChange={(e) =>
                          updateRegionCoord(
                            region.id,
                            2,
                            Number(e.target.value)
                          )
                        }
                        placeholder="10"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor={`hs-x1-${region.id}`}
                        className="text-xs"
                      >
                        X1 (0-100)
                      </Label>
                      <Input
                        id={`hs-x1-${region.id}`}
                        type="number"
                        min={0}
                        max={100}
                        value={region.coords[0] ?? 25}
                        onChange={(e) =>
                          updateRegionCoord(
                            region.id,
                            0,
                            Number(e.target.value)
                          )
                        }
                        placeholder="25"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`hs-y1-${region.id}`}
                        className="text-xs"
                      >
                        Y1 (0-100)
                      </Label>
                      <Input
                        id={`hs-y1-${region.id}`}
                        type="number"
                        min={0}
                        max={100}
                        value={region.coords[1] ?? 25}
                        onChange={(e) =>
                          updateRegionCoord(
                            region.id,
                            1,
                            Number(e.target.value)
                          )
                        }
                        placeholder="25"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`hs-x2-${region.id}`}
                        className="text-xs"
                      >
                        X2 (0-100)
                      </Label>
                      <Input
                        id={`hs-x2-${region.id}`}
                        type="number"
                        min={0}
                        max={100}
                        value={region.coords[2] ?? 75}
                        onChange={(e) =>
                          updateRegionCoord(
                            region.id,
                            2,
                            Number(e.target.value)
                          )
                        }
                        placeholder="75"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`hs-y2-${region.id}`}
                        className="text-xs"
                      >
                        Y2 (0-100)
                      </Label>
                      <Input
                        id={`hs-y2-${region.id}`}
                        type="number"
                        min={0}
                        max={100}
                        value={region.coords[3] ?? 75}
                        onChange={(e) =>
                          updateRegionCoord(
                            region.id,
                            3,
                            Number(e.target.value)
                          )
                        }
                        placeholder="75"
                      />
                    </div>
                  </div>
                )}

                {/* Label */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`hs-label-${region.id}`}
                    className="text-xs"
                  >
                    Label
                  </Label>
                  <Input
                    id={`hs-label-${region.id}`}
                    value={region.label}
                    onChange={(e) =>
                      updateRegion(region.id, 'label', e.target.value)
                    }
                    placeholder="Region label"
                  />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <Label
                    htmlFor={`hs-content-${region.id}`}
                    className="text-xs"
                  >
                    Content
                  </Label>
                  <Textarea
                    id={`hs-content-${region.id}`}
                    value={region.content}
                    onChange={(e) =>
                      updateRegion(region.id, 'content', e.target.value)
                    }
                    placeholder="Tooltip text shown on hover/click"
                    className="min-h-[60px]"
                  />
                </div>

                {/* Is correct (quiz mode only) */}
                {data.mode === 'quiz' && (
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`hs-correct-${region.id}`}
                      className="cursor-pointer text-xs"
                    >
                      Correct region
                    </Label>
                    <Switch
                      id={`hs-correct-${region.id}`}
                      checked={region.is_correct ?? false}
                      onCheckedChange={(checked) =>
                        updateRegion(region.id, 'is_correct', checked)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add region button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addRegion}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Region
        </Button>
      </CardContent>
    </Card>
  );
}
