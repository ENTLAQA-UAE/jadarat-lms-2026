'use client';

import { useEffect, useState } from 'react';
import { Info, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LabeledGraphicBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface LabeledGraphicRendererProps {
  block: LabeledGraphicBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function LabeledGraphicRenderer({
  block,
  progress,
  onComplete,
}: LabeledGraphicRendererProps) {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [viewedMarkers, setViewedMarkers] = useState<Set<string>>(new Set());

  const handleMarkerClick = (markerId: string) => {
    setActiveMarkerId((prev) => (prev === markerId ? null : markerId));
    setViewedMarkers((prev) => {
      const next = new Set(prev);
      next.add(markerId);
      return next;
    });
  };

  // Auto-complete if no markers; otherwise complete after at least one marker is viewed
  useEffect(() => {
    if (progress?.completed) return;

    if (block.data.markers.length === 0) {
      onComplete();
    } else if (viewedMarkers.size > 0) {
      onComplete();
    }
  }, [
    viewedMarkers.size,
    block.data.markers.length,
    progress?.completed,
    onComplete,
  ]);

  const renderMarkerIcon = (
    marker: LabeledGraphicBlock['data']['markers'][number],
    index: number
  ) => {
    switch (marker.icon) {
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'pin':
        return <MapPin className="h-4 w-4" />;
      case 'number':
        return (
          <span className="text-xs font-bold leading-none">{index + 1}</span>
        );
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (!block.data.image) {
    return (
      <div className="flex items-center justify-center h-48 rounded-lg bg-muted border border-dashed">
        <p className="text-sm text-muted-foreground">
          No image configured for this labeled graphic.
        </p>
      </div>
    );
  }

  return (
    <div className="relative select-none">
      {/* Image container */}
      <div className="relative overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.data.image}
          alt="Labeled graphic"
          className="w-full object-contain"
          loading="lazy"
        />

        {/* Marker overlays */}
        {block.data.markers.map((marker, index) => {
          const isActive = activeMarkerId === marker.id;
          const isViewed = viewedMarkers.has(marker.id);

          return (
            <div
              key={marker.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${marker.x_percent}%`,
                top: `${marker.y_percent}%`,
              }}
            >
              {/* Marker button */}
              <button
                type="button"
                onClick={() => handleMarkerClick(marker.id)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full shadow-lg border-2 transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary scale-125 ring-2 ring-primary/30'
                    : isViewed
                      ? 'bg-primary/80 text-primary-foreground border-white hover:scale-110'
                      : 'bg-white text-primary border-primary hover:scale-110 hover:bg-primary/10'
                )}
                title={marker.label}
              >
                {renderMarkerIcon(marker, index)}
              </button>

              {/* Tooltip / Popover */}
              {isActive && (
                <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-3 w-56">
                  <div className="rounded-lg border bg-popover p-3 text-popover-foreground shadow-xl">
                    <div className="font-medium text-sm mb-1">
                      {marker.label}
                    </div>
                    {marker.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {marker.description}
                      </p>
                    )}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="h-2 w-2 rotate-45 border-b border-r bg-popover" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
