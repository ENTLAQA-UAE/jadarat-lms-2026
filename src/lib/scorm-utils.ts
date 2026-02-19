interface ParsedSuspendData {
  sections?: string[];
  progressData?: string;
  slideId?: string;      // Identifier for current slide/screen
  interactions?: {       // User interactions/answers
    total: number;
    completed: number;
  };
  attempts?: number;
}

export function parseSuspendData(suspendData: string): ParsedSuspendData {
  if (!suspendData) return {};

  const sections = suspendData.split(/[~^]/);
  
  // Section [1] typically contains slide identifier after "v_player."
  const slideMatch = sections[1]?.match(/v_player\.([^.]+)/);
  
  // Look for patterns like "ts1001214" in progressData
  const interactionsMatch = sections[0]?.match(/ts(\d+)/);
  
  return {
    sections,
    progressData: sections[0],
    slideId: slideMatch?.[1] || '',
    interactions: interactionsMatch ? {
      total: parseInt(interactionsMatch[1].slice(0, 3)),
      completed: parseInt(interactionsMatch[1].slice(3))
    } : undefined,
    attempts: parseInt(sections[3] || '0')
  };
} 