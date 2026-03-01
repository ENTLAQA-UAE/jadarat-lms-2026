'use client';

import { type GalleryBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Plus, Trash2, GalleryHorizontal as GalleryIcon } from 'lucide-react';

interface GalleryBlockEditorProps {
  block: GalleryBlock;
  onChange: (data: Partial<GalleryBlock['data']>) => void;
}

export function GalleryBlockEditor({ block, onChange }: GalleryBlockEditorProps) {
  const { data } = block;

  const addImage = () => {
    const newImage = {
      id: uuidv4(),
      src: '',
      alt: '',
      caption: '',
    };
    onChange({ images: [...data.images, newImage] });
  };

  const removeImage = (imageId: string) => {
    onChange({ images: data.images.filter((img) => img.id !== imageId) });
  };

  const updateImage = (
    imageId: string,
    field: 'src' | 'alt' | 'caption',
    value: string
  ) => {
    onChange({
      images: data.images.map((img) =>
        img.id === imageId ? { ...img, [field]: value } : img
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <GalleryIcon className="h-4 w-4" />
          Gallery Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image items */}
        <div className="space-y-3">
          {data.images.map((image, index) => (
            <div
              key={image.id}
              className="rounded-lg border border-border bg-muted/20 p-3"
            >
              <div className="mb-3 flex items-center gap-2">
                {/* Drag handle (visual only) */}
                <div
                  className="flex cursor-grab items-center text-muted-foreground"
                  title="Drag to reorder (coming soon)"
                >
                  <GripVertical className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium text-muted-foreground">
                  Image {index + 1}
                </span>

                <div className="flex-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(image.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={data.images.length <= 1}
                  title="Remove image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label
                    htmlFor={`gallery-src-${image.id}`}
                    className="text-xs"
                  >
                    Image URL
                  </Label>
                  <Input
                    id={`gallery-src-${image.id}`}
                    value={image.src}
                    onChange={(e) =>
                      updateImage(image.id, 'src', e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`gallery-alt-${image.id}`}
                    className="text-xs"
                  >
                    Alt Text
                  </Label>
                  <Input
                    id={`gallery-alt-${image.id}`}
                    value={image.alt}
                    onChange={(e) =>
                      updateImage(image.id, 'alt', e.target.value)
                    }
                    placeholder="Describe the image for accessibility"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`gallery-caption-${image.id}`}
                    className="text-xs"
                  >
                    Caption (optional)
                  </Label>
                  <Input
                    id={`gallery-caption-${image.id}`}
                    value={image.caption ?? ''}
                    onChange={(e) =>
                      updateImage(image.id, 'caption', e.target.value)
                    }
                    placeholder="Image caption"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add image button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addImage}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Image
        </Button>

        {/* Settings */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="space-y-2">
            <Label htmlFor={`gallery-layout-${block.id}`}>Layout</Label>
            <select
              id={`gallery-layout-${block.id}`}
              value={data.layout}
              onChange={(e) =>
                onChange({
                  layout: e.target.value as 'grid' | 'carousel' | 'masonry',
                })
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="grid">Grid</option>
              <option value="carousel">Carousel</option>
              <option value="masonry">Masonry</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`gallery-columns-${block.id}`}>Columns</Label>
            <select
              id={`gallery-columns-${block.id}`}
              value={data.columns}
              onChange={(e) =>
                onChange({ columns: Number(e.target.value) as 2 | 3 | 4 })
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
