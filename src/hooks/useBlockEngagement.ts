'use client';

import { useRef, useCallback, useEffect } from 'react';

interface BlockEngagementEvent {
  blockId: string;
  blockType: string;
  eventType: 'view' | 'interact' | 'complete' | 'time_spent';
  durationMs?: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export function useBlockEngagement(blockId: string, blockType: string) {
  const startTimeRef = useRef<number>(Date.now());
  const eventsRef = useRef<BlockEngagementEvent[]>([]);

  const trackEvent = useCallback(
    (eventType: BlockEngagementEvent['eventType'], metadata?: Record<string, unknown>) => {
      const event: BlockEngagementEvent = {
        blockId,
        blockType,
        eventType,
        durationMs: eventType === 'time_spent' ? Date.now() - startTimeRef.current : undefined,
        metadata,
        timestamp: new Date().toISOString(),
      };
      eventsRef.current.push(event);
    },
    [blockId, blockType]
  );

  // Track time spent when block unmounts or becomes invisible
  useEffect(() => {
    startTimeRef.current = Date.now();
    return () => {
      trackEvent('time_spent');
    };
  }, [trackEvent]);

  const getEvents = useCallback(() => eventsRef.current, []);

  return { trackEvent, getEvents };
}
