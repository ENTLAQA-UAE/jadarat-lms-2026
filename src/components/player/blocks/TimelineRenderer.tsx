'use client';

import { useEffect } from 'react';
import type { TimelineBlock, CourseTheme } from '@/types/authoring';
import type { BlockProgress } from '../CoursePlayer';

interface TimelineRendererProps {
  block: TimelineBlock;
  progress?: BlockProgress;
  onComplete: () => void;
  theme: CourseTheme;
}

export function TimelineRenderer({
  block,
  progress,
  onComplete,
  theme,
}: TimelineRendererProps) {
  // Timelines are auto-completed on render
  useEffect(() => {
    if (!progress?.completed) {
      onComplete();
    }
  }, [progress?.completed, onComplete]);

  if (block.data.direction === 'horizontal') {
    return (
      <div className="w-full overflow-x-auto pb-4">
        <div className="relative min-w-max px-8 py-6">
          {/* Horizontal line */}
          <div
            className="absolute top-[42px] inset-inline-8 h-0.5"
            style={{ backgroundColor: theme.primary_color }}
          />

          <div className="flex gap-12">
            {block.data.events.map((event) => (
              <div key={event.id} className="relative flex flex-col items-center w-56">
                {/* Date badge */}
                <span
                  className="mb-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: theme.primary_color }}
                >
                  {event.date}
                </span>

                {/* Dot */}
                <div
                  className="relative z-10 h-4 w-4 rounded-full border-[3px] border-white shadow-sm"
                  style={{ backgroundColor: theme.primary_color }}
                />

                {/* Content card */}
                <div className="mt-4 w-full rounded-lg border bg-card p-4 shadow-sm">
                  <h4 className="font-semibold text-sm">{event.title}</h4>
                  {event.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  {event.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.image}
                      alt={event.title}
                      className="mt-2 w-full rounded-md object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vertical mode: centered line with alternating left/right events
  return (
    <div className="relative py-4">
      {/* Vertical center line */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
        style={{ backgroundColor: theme.primary_color }}
      />

      <div className="space-y-8">
        {block.data.events.map((event, index) => {
          const isLeft = index % 2 === 0;

          return (
            <div key={event.id} className="relative flex items-start">
              {/* Left content */}
              <div className="w-1/2 pe-8">
                {isLeft && (
                  <div className="ms-auto max-w-sm text-end">
                    {/* Date badge */}
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: theme.primary_color }}
                    >
                      {event.date}
                    </span>

                    {/* Content card */}
                    <div className="mt-2 rounded-lg border bg-card p-4 shadow-sm">
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      {event.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {event.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.image}
                          alt={event.title}
                          className="mt-2 w-full rounded-md object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Center dot */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10">
                <div
                  className="h-4 w-4 rounded-full border-[3px] border-white shadow-sm"
                  style={{ backgroundColor: theme.primary_color }}
                />
              </div>

              {/* Right content */}
              <div className="w-1/2 ps-8">
                {!isLeft && (
                  <div className="max-w-sm">
                    {/* Date badge */}
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: theme.primary_color }}
                    >
                      {event.date}
                    </span>

                    {/* Content card */}
                    <div className="mt-2 rounded-lg border bg-card p-4 shadow-sm">
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      {event.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {event.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.image}
                          alt={event.title}
                          className="mt-2 w-full rounded-md object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
