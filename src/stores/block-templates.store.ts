import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Block } from '@/types/authoring';

export interface BlockTemplate {
  id: string;
  name: string;
  description?: string;
  blocks: Block[];
  createdAt: string;
  category: 'custom' | 'favorites' | 'recent';
}

interface BlockTemplatesState {
  templates: BlockTemplate[];
  recentlyUsed: string[]; // Block type IDs
  addTemplate: (template: Omit<BlockTemplate, 'id' | 'createdAt'>) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<BlockTemplate>) => void;
  addRecentlyUsed: (blockType: string) => void;
  getRecentlyUsed: () => string[];
}

export const useBlockTemplatesStore = create<BlockTemplatesState>()(
  persist(
    (set, get) => ({
      templates: [],
      recentlyUsed: [],

      addTemplate: (template) => {
        const newTemplate: BlockTemplate = {
          ...template,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          templates: [newTemplate, ...state.templates],
        }));
      },

      removeTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      addRecentlyUsed: (blockType) => {
        set((state) => {
          const recent = [blockType, ...state.recentlyUsed.filter((t) => t !== blockType)].slice(0, 10);
          return { recentlyUsed: recent };
        });
      },

      getRecentlyUsed: () => get().recentlyUsed,
    }),
    {
      name: 'jadarat-block-templates',
    }
  )
);
