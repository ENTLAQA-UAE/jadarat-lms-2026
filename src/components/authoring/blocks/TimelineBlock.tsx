'use client';

import { type TimelineBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GripVertical, Plus, Trash2, Clock } from 'lucide-react';

interface TimelineBlockEditorProps {
  block: TimelineBlock;
  onChange: (data: Partial<TimelineBlock['data']>) => void;
}

export function TimelineBlockEditor({
  block,
  onChange,
}: TimelineBlockEditorProps) {
  const { data } = block;

  const addEvent = () => {
    const newEvent = {
      id: uuidv4(),
      date: '',
      title: '',
      description: '',
    };
    onChange({ events: [...data.events, newEvent] });
  };

  const removeEvent = (eventId: string) => {
    onChange({ events: data.events.filter((event) => event.id !== eventId) });
  };

  const updateEvent = (
    eventId: string,
    field: 'date' | 'title' | 'description' | 'image',
    value: string
  ) => {
    onChange({
      events: data.events.map((event) =>
        event.id === eventId ? { ...event, [field]: value } : event
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          Timeline Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline events */}
        <div className="space-y-3">
          {data.events.map((event, index) => (
            <div
              key={event.id}
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
                  Event {index + 1}
                </span>

                <div className="flex-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEvent(event.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={data.events.length <= 1}
                  title="Remove event"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label
                    htmlFor={`timeline-date-${event.id}`}
                    className="text-xs"
                  >
                    Date
                  </Label>
                  <Input
                    id={`timeline-date-${event.id}`}
                    value={event.date}
                    onChange={(e) =>
                      updateEvent(event.id, 'date', e.target.value)
                    }
                    placeholder="e.g. 2024, January 2024, Q1 2024"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`timeline-title-${event.id}`}
                    className="text-xs"
                  >
                    Title
                  </Label>
                  <Input
                    id={`timeline-title-${event.id}`}
                    value={event.title}
                    onChange={(e) =>
                      updateEvent(event.id, 'title', e.target.value)
                    }
                    placeholder="Event title"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`timeline-description-${event.id}`}
                    className="text-xs"
                  >
                    Description
                  </Label>
                  <Textarea
                    id={`timeline-description-${event.id}`}
                    value={event.description}
                    onChange={(e) =>
                      updateEvent(event.id, 'description', e.target.value)
                    }
                    placeholder="Event description"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`timeline-image-${event.id}`}
                    className="text-xs"
                  >
                    Image URL (optional)
                  </Label>
                  <Input
                    id={`timeline-image-${event.id}`}
                    value={event.image ?? ''}
                    onChange={(e) =>
                      updateEvent(event.id, 'image', e.target.value)
                    }
                    placeholder="https://example.com/image.png"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add event button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addEvent}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>

        {/* Direction selector */}
        <div className="space-y-2 border-t border-border pt-4">
          <Label>Direction</Label>
          <Select
            value={data.direction}
            onValueChange={(value: 'vertical' | 'horizontal') =>
              onChange({ direction: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">Vertical</SelectItem>
              <SelectItem value="horizontal">Horizontal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
