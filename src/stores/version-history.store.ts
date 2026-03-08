import { create } from 'zustand';
import type { CourseContent } from '@/types/authoring';

export interface VersionSnapshot {
  id: string;
  content: CourseContent;
  timestamp: string;
  label?: string;
  autoSave: boolean;
}

interface VersionHistoryState {
  snapshots: VersionSnapshot[];
  maxSnapshots: number;
  addSnapshot: (content: CourseContent, label?: string, autoSave?: boolean) => void;
  getSnapshot: (id: string) => VersionSnapshot | undefined;
  clearHistory: () => void;
}

export const useVersionHistoryStore = create<VersionHistoryState>((set, get) => ({
  snapshots: [],
  maxSnapshots: 30,

  addSnapshot: (content, label, autoSave = false) => {
    const snapshot: VersionSnapshot = {
      id: crypto.randomUUID(),
      content: JSON.parse(JSON.stringify(content)),
      timestamp: new Date().toISOString(),
      label,
      autoSave,
    };
    set((state) => {
      const newSnapshots = [snapshot, ...state.snapshots].slice(0, state.maxSnapshots);
      return { snapshots: newSnapshots };
    });
  },

  getSnapshot: (id) => get().snapshots.find((s) => s.id === id),

  clearHistory: () => set({ snapshots: [] }),
}));
