import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Block,
  CourseContent,
  CourseSettings,
  CourseTheme,
  Lesson,
  Module,
} from '@/types/authoring';

// ============================================================
// DEFAULT SETTINGS (Arabic-first)
// ============================================================

const DEFAULT_SETTINGS: CourseSettings = {
  theme: {
    primary_color: '#1a73e8',
    secondary_color: '#f59e0b',
    background_color: '#ffffff',
    text_color: '#1f2937',
    font_family: 'cairo',
    border_radius: 'medium',
    cover_style: 'gradient',
    navigation_style: 'sidebar',
    lesson_header_style: 'full_width_banner',
    dark_mode: false,
  },
  navigation: 'sequential',
  show_progress_bar: true,
  show_lesson_list: true,
  completion_criteria: 'all_blocks',
  language: 'ar',
  direction: 'rtl',
  sidebar_default_open: true,
  allow_search: true,
  allow_mark_complete: false,
  show_lesson_count: true,
  quiz_settings: {
    allow_retries: true,
    max_retries: 0,
    randomize_questions: false,
    shuffle_answers: true,
    require_passing_to_continue: false,
  },
  block_entrance_animations: true,
};

const DEFAULT_CONTENT: CourseContent = {
  modules: [],
  settings: DEFAULT_SETTINGS,
};

const MAX_UNDO_STACK = 50;

// ============================================================
// STATE INTERFACE
// ============================================================

export interface EditorState {
  courseId: number | null;
  contentId: string | null;
  version: number;
  content: CourseContent;
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  selectedBlockId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  previewMode: boolean;
  sidebarOpen: boolean;
  undoStack: CourseContent[];
  redoStack: CourseContent[];
}

// ============================================================
// ACTIONS INTERFACE
// ============================================================

export interface EditorActions {
  // Lifecycle
  loadContent: (
    courseId: number,
    content: CourseContent,
    contentId: string | null,
    version: number,
  ) => void;
  resetEditor: () => void;

  // Module CRUD
  addModule: (title: string) => void;
  updateModule: (moduleId: string, updates: Partial<Omit<Module, 'id' | 'lessons'>>) => void;
  deleteModule: (moduleId: string) => void;
  reorderModules: (fromIndex: number, toIndex: number) => void;

  // Lesson CRUD
  addLesson: (moduleId: string, title: string) => void;
  updateLesson: (
    moduleId: string,
    lessonId: string,
    updates: Partial<Omit<Lesson, 'id' | 'blocks'>>,
  ) => void;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  reorderLessons: (moduleId: string, fromIndex: number, toIndex: number) => void;

  // Block CRUD
  addBlock: (moduleId: string, lessonId: string, block: Block, atIndex?: number) => void;
  updateBlock: (
    moduleId: string,
    lessonId: string,
    blockId: string,
    data: Partial<Block['data']>,
  ) => void;
  deleteBlock: (moduleId: string, lessonId: string, blockId: string) => void;
  duplicateBlock: (moduleId: string, lessonId: string, blockId: string) => void;
  reorderBlocks: (moduleId: string, lessonId: string, fromIndex: number, toIndex: number) => void;

  // Selection
  selectModule: (id: string | null) => void;
  selectLesson: (id: string | null) => void;
  selectBlock: (id: string | null) => void;

  // Theme & Settings
  updateTheme: (theme: Partial<CourseTheme>) => void;
  updateSettings: (settings: Partial<CourseSettings>) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  pushSnapshot: () => void;

  // UI state
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setPublishing: (publishing: boolean) => void;
  togglePreview: () => void;
  toggleSidebar: () => void;

  // Computed getters
  getCurrentModule: () => Module | null;
  getCurrentLesson: () => Lesson | null;
}

// ============================================================
// HELPERS
// ============================================================

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function reorderArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...arr];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

function recalculateOrder<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

// ============================================================
// STORE
// ============================================================

const initialState: EditorState = {
  courseId: null,
  contentId: null,
  version: 0,
  content: deepClone(DEFAULT_CONTENT),
  selectedModuleId: null,
  selectedLessonId: null,
  selectedBlockId: null,
  isDirty: false,
  isSaving: false,
  isPublishing: false,
  previewMode: false,
  sidebarOpen: true,
  undoStack: [],
  redoStack: [],
};

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  // --------------------------------------------------------
  // Initial state
  // --------------------------------------------------------
  ...initialState,

  // --------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------
  loadContent: (
    courseId: number,
    content: CourseContent,
    contentId: string | null,
    version: number,
  ) => {
    set({
      courseId,
      contentId,
      version,
      content: deepClone(content),
      selectedModuleId: null,
      selectedLessonId: null,
      selectedBlockId: null,
      isDirty: false,
      isSaving: false,
      isPublishing: false,
      previewMode: false,
      undoStack: [],
      redoStack: [],
    });
  },

  resetEditor: () => {
    set(deepClone(initialState));
  },

  // --------------------------------------------------------
  // Module CRUD
  // --------------------------------------------------------
  addModule: (title: string) => {
    const state = get();
    state.pushSnapshot();

    const newModule: Module = {
      id: uuidv4(),
      title,
      order: state.content.modules.length,
      lessons: [],
      is_locked: false,
    };

    set({
      content: {
        ...state.content,
        modules: [...state.content.modules, newModule],
      },
      isDirty: true,
      redoStack: [],
    });
  },

  updateModule: (moduleId: string, updates: Partial<Omit<Module, 'id' | 'lessons'>>) => {
    const state = get();
    state.pushSnapshot();

    set({
      content: {
        ...state.content,
        modules: state.content.modules.map((m) =>
          m.id === moduleId ? { ...m, ...updates } : m,
        ),
      },
      isDirty: true,
      redoStack: [],
    });
  },

  deleteModule: (moduleId: string) => {
    const state = get();
    state.pushSnapshot();

    const filteredModules = recalculateOrder(
      state.content.modules.filter((m) => m.id !== moduleId),
    );

    set({
      content: {
        ...state.content,
        modules: filteredModules,
      },
      selectedModuleId:
        state.selectedModuleId === moduleId ? null : state.selectedModuleId,
      selectedLessonId:
        state.selectedModuleId === moduleId ? null : state.selectedLessonId,
      selectedBlockId:
        state.selectedModuleId === moduleId ? null : state.selectedBlockId,
      isDirty: true,
      redoStack: [],
    });
  },

  reorderModules: (fromIndex: number, toIndex: number) => {
    const state = get();
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= state.content.modules.length ||
      toIndex >= state.content.modules.length
    ) {
      return;
    }

    state.pushSnapshot();

    const reordered = recalculateOrder(
      reorderArray(state.content.modules, fromIndex, toIndex),
    );

    set({
      content: {
        ...state.content,
        modules: reordered,
      },
      isDirty: true,
      redoStack: [],
    });
  },

  // --------------------------------------------------------
  // Lesson CRUD
  // --------------------------------------------------------
  addLesson: (moduleId: string, title: string) => {
    const state = get();
    const moduleIndex = state.content.modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    state.pushSnapshot();

    const targetModule = state.content.modules[moduleIndex];
    const newLesson: Lesson = {
      id: uuidv4(),
      title,
      order: targetModule.lessons.length,
      blocks: [],
      is_locked: false,
    };

    const updatedModules = state.content.modules.map((m) =>
      m.id === moduleId
        ? { ...m, lessons: [...m.lessons, newLesson] }
        : m,
    );

    set({
      content: {
        ...state.content,
        modules: updatedModules,
      },
      isDirty: true,
      redoStack: [],
    });
  },

  updateLesson: (
    moduleId: string,
    lessonId: string,
    updates: Partial<Omit<Lesson, 'id' | 'blocks'>>,
  ) => {
    const state = get();
    state.pushSnapshot();

    const updatedModules = state.content.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId ? { ...l, ...updates } : l,
            ),
          }
        : m,
    );

    set({
      content: {
        ...state.content,
        modules: updatedModules,
      },
      isDirty: true,
      redoStack: [],
    });
  },

  deleteLesson: (moduleId: string, lessonId: string) => {
    const state = get();
    state.pushSnapshot();

    const updatedModules = state.content.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lessons: recalculateOrder(m.lessons.filter((l) => l.id !== lessonId)),
          }
        : m,
    );

    set({
      content: {
        ...state.content,
        modules: updatedModules,
      },
      selectedLessonId:
        state.selectedLessonId === lessonId ? null : state.selectedLessonId,
      selectedBlockId:
        state.selectedLessonId === lessonId ? null : state.selectedBlockId,
      isDirty: true,
      redoStack: [],
    });
  },

  reorderLessons: (moduleId: string, fromIndex: number, toIndex: number) => {
    const state = get();
    const targetModule = state.content.modules.find((m) => m.id === moduleId);
    if (!targetModule) return;
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= targetModule.lessons.length ||
      toIndex >= targetModule.lessons.length
    ) {
      return;
    }

    state.pushSnapshot();

    const updatedModules = state.content.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lessons: recalculateOrder(reorderArray(m.lessons, fromIndex, toIndex)),
          }
        : m,
    );

    set({
      content: {
        ...state.content,
        modules: updatedModules,
      },
      isDirty: true,
      redoStack: [],
    });
  },

  // --------------------------------------------------------
  // Block CRUD
  // --------------------------------------------------------
  addBlock: (moduleId: string, lessonId: string, block: Block, atIndex?: number) => {
    const state = get();
    state.pushSnapshot();

    const updatedModules = state.content.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id !== lessonId) return l;

              const newBlocks = [...l.blocks];
              if (atIndex !== undefined && atIndex >= 0 && atIndex <= newBlocks.length) {
                newBlocks.splice(atIndex, 0, block);
              } else {
                newBlocks.push(block);
              }

              return {
                ...l,
                blocks: recalculateOrder(newBlocks),
              };
            }),
          }
        : m,
    );

    set({
      content: {
        ...state.content,
        modules: updatedModules,
      },
      isDirty: true,
      redoStack: [],
    });
  },

  updateBlock: (
    moduleId: string,
    lessonId: string,
    blockId: string,
    data: Partial<Block['data']>,
  ) => {
    const state = get();
    state.pushSnapshot();

    const now = new Date().toISOString();

    const updatedModules = state.content.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId
                ? {
                    ...l,
                    blocks: l.blocks.map((b) =>
                      b.id === blockId
                        ? {
                            ...b,
                            data: { ...b.data, ...data },
                            metadata: {
                              ...b.metadata,
                              updated_at: now,
                            },
                          }
                        : b,
                    ) as Block[],
                  }
                : l,
            ),
          }
        : m,
    );

    set({
      content: {
        ...state.content,
        modules: updatedModules,
      },
      isDirty: true,
      redoStack: [],
    });
  },

  deleteBlock: (moduleId: string, lessonId: string, blockId: string) => {
    const state = get();
    state.pushSnapshot();

    const updatedModules = state.content.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId
                ? {
                    ...l,
                    blocks: recalculateOrder(
                      l.blocks.filter((b) => b.id !== blockId),
                    ) as Block[],
                  }
                : l,
            ),
          }
        : m,
    );

    set({
      content: {
        ...state.content,
        modules: updatedModules,
      },
      selectedBlockId:
        state.selectedBlockId === blockId ? null : state.selectedBlockId,
      isDirty: true,
      redoStack: [],
    });
  },

  duplicateBlock: (moduleId: string, lessonId: string, blockId: string) => {
    const state = get();

    // Find the block to duplicate
    const targetModule = state.content.modules.find((m) => m.id === moduleId);
    if (!targetModule) return;
    const targetLesson = targetModule.lessons.find((l) => l.id === lessonId);
    if (!targetLesson) return;
    const blockIndex = targetLesson.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) return;

    const originalBlock = targetLesson.blocks[blockIndex];
    const now = new Date().toISOString();

    const duplicatedBlock: Block = {
      ...deepClone(originalBlock),
      id: uuidv4(),
      metadata: {
        ...originalBlock.metadata,
        created_at: now,
        updated_at: now,
      },
    } as Block;

    // Insert the duplicated block right after the original
    state.addBlock(moduleId, lessonId, duplicatedBlock, blockIndex + 1);
  },

  reorderBlocks: (moduleId: string, lessonId: string, fromIndex: number, toIndex: number) => {
    const state = get();
    const targetModule = state.content.modules.find((m) => m.id === moduleId);
    if (!targetModule) return;
    const targetLesson = targetModule.lessons.find((l) => l.id === lessonId);
    if (!targetLesson) return;
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= targetLesson.blocks.length ||
      toIndex >= targetLesson.blocks.length
    ) {
      return;
    }

    state.pushSnapshot();

    const updatedModules = state.content.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId
                ? {
                    ...l,
                    blocks: recalculateOrder(
                      reorderArray(l.blocks, fromIndex, toIndex),
                    ) as Block[],
                  }
                : l,
            ),
          }
        : m,
    );

    set({
      content: {
        ...state.content,
        modules: updatedModules,
      },
      isDirty: true,
      redoStack: [],
    });
  },

  // --------------------------------------------------------
  // Selection
  // --------------------------------------------------------
  selectModule: (id: string | null) => {
    set({
      selectedModuleId: id,
      selectedLessonId: null,
      selectedBlockId: null,
    });
  },

  selectLesson: (id: string | null) => {
    set({
      selectedLessonId: id,
      selectedBlockId: null,
    });
  },

  selectBlock: (id: string | null) => {
    set({ selectedBlockId: id });
  },

  // --------------------------------------------------------
  // Theme & Settings
  // --------------------------------------------------------
  updateTheme: (theme: Partial<CourseTheme>) => {
    const state = get();
    state.pushSnapshot();

    set({
      content: {
        ...state.content,
        settings: {
          ...state.content.settings,
          theme: {
            ...state.content.settings.theme,
            ...theme,
          },
        },
      },
      isDirty: true,
      redoStack: [],
    });
  },

  updateSettings: (settings: Partial<CourseSettings>) => {
    const state = get();
    state.pushSnapshot();

    set({
      content: {
        ...state.content,
        settings: {
          ...state.content.settings,
          ...settings,
          // Preserve full theme object if theme is not being replaced entirely
          theme: settings.theme
            ? { ...state.content.settings.theme, ...settings.theme }
            : state.content.settings.theme,
        },
      },
      isDirty: true,
      redoStack: [],
    });
  },

  // --------------------------------------------------------
  // Undo / Redo
  // --------------------------------------------------------
  pushSnapshot: () => {
    const state = get();
    const snapshot = deepClone(state.content);
    const undoStack = [...state.undoStack, snapshot];

    // Enforce max stack size
    if (undoStack.length > MAX_UNDO_STACK) {
      undoStack.shift();
    }

    set({ undoStack });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;

    const undoStack = [...state.undoStack];
    const previousContent = undoStack.pop()!;
    const redoStack = [...state.redoStack, deepClone(state.content)];

    set({
      content: previousContent,
      undoStack,
      redoStack,
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;

    const redoStack = [...state.redoStack];
    const nextContent = redoStack.pop()!;
    const undoStack = [...state.undoStack, deepClone(state.content)];

    // Enforce max stack size
    if (undoStack.length > MAX_UNDO_STACK) {
      undoStack.shift();
    }

    set({
      content: nextContent,
      undoStack,
      redoStack,
      isDirty: true,
    });
  },

  // --------------------------------------------------------
  // UI State
  // --------------------------------------------------------
  setDirty: (dirty: boolean) => set({ isDirty: dirty }),

  setSaving: (saving: boolean) => set({ isSaving: saving }),

  setPublishing: (publishing: boolean) => set({ isPublishing: publishing }),

  togglePreview: () => set((state) => ({ previewMode: !state.previewMode })),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // --------------------------------------------------------
  // Computed getters
  // --------------------------------------------------------
  getCurrentModule: (): Module | null => {
    const state = get();
    if (!state.selectedModuleId) return null;
    return state.content.modules.find((m) => m.id === state.selectedModuleId) ?? null;
  },

  getCurrentLesson: (): Lesson | null => {
    const state = get();
    if (!state.selectedModuleId || !state.selectedLessonId) return null;
    const currentModule = state.content.modules.find(
      (m) => m.id === state.selectedModuleId,
    );
    if (!currentModule) return null;
    return currentModule.lessons.find((l) => l.id === state.selectedLessonId) ?? null;
  },
}));
