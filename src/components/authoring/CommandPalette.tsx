'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Type,
  Image,
  Video,
  Minus,
  Quote,
  List,
  Code,
  ChevronDown,
  MessageSquare,
  Columns,
  Layers,
  CircleDot,
  ToggleLeft,
  Settings,
  Eye,
  Undo2,
  Redo2,
  PanelLeft,
  LayoutGrid,
  Search,
  Keyboard,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor.store';
import { BlockType } from '@/types/authoring';
import { cn } from '@/lib/utils';
import { createDefaultBlock } from './EditorCanvas';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const commandPaletteOpen = useEditorStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useEditorStore((s) => s.setCommandPaletteOpen);
  const selectedModuleId = useEditorStore((s) => s.selectedModuleId);
  const selectedLessonId = useEditorStore((s) => s.selectedLessonId);
  const addBlock = useEditorStore((s) => s.addBlock);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const togglePreview = useEditorStore((s) => s.togglePreview);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const toggleBlockLibrary = useEditorStore((s) => s.toggleBlockLibrary);
  const content = useEditorStore((s) => s.content);
  const selectModule = useEditorStore((s) => s.selectModule);
  const selectLesson = useEditorStore((s) => s.selectLesson);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo((): CommandItem[] => {
    const items: CommandItem[] = [];

    // Block insertion commands
    if (selectedModuleId && selectedLessonId) {
      const blockCommands: { type: BlockType; label: string; icon: React.ReactNode; keywords?: string[] }[] = [
        { type: BlockType.TEXT, label: 'Text Block', icon: <Type className="h-4 w-4" />, keywords: ['paragraph', 'content'] },
        { type: BlockType.IMAGE, label: 'Image Block', icon: <Image className="h-4 w-4" />, keywords: ['picture', 'photo'] },
        { type: BlockType.VIDEO, label: 'Video Block', icon: <Video className="h-4 w-4" />, keywords: ['media', 'clip'] },
        { type: BlockType.DIVIDER, label: 'Divider', icon: <Minus className="h-4 w-4" />, keywords: ['separator', 'line'] },
        { type: BlockType.QUOTE, label: 'Quote Block', icon: <Quote className="h-4 w-4" />, keywords: ['citation', 'blockquote'] },
        { type: BlockType.LIST, label: 'List Block', icon: <List className="h-4 w-4" />, keywords: ['bullet', 'numbered'] },
        { type: BlockType.CODE, label: 'Code Block', icon: <Code className="h-4 w-4" />, keywords: ['snippet', 'programming'] },
        { type: BlockType.ACCORDION, label: 'Accordion Block', icon: <ChevronDown className="h-4 w-4" />, keywords: ['collapse', 'expand', 'faq'] },
        { type: BlockType.CALLOUT, label: 'Callout Block', icon: <MessageSquare className="h-4 w-4" />, keywords: ['alert', 'notice', 'warning'] },
        { type: BlockType.TABS, label: 'Tabs Block', icon: <Columns className="h-4 w-4" />, keywords: ['tabbed', 'sections'] },
        { type: BlockType.FLASHCARD, label: 'Flashcard Block', icon: <Layers className="h-4 w-4" />, keywords: ['card', 'flip', 'study'] },
        { type: BlockType.MULTIPLE_CHOICE, label: 'Multiple Choice', icon: <CircleDot className="h-4 w-4" />, keywords: ['quiz', 'question', 'mcq'] },
        { type: BlockType.TRUE_FALSE, label: 'True/False', icon: <ToggleLeft className="h-4 w-4" />, keywords: ['quiz', 'question', 'boolean'] },
      ];

      for (const cmd of blockCommands) {
        items.push({
          id: `add-${cmd.type}`,
          label: `Add ${cmd.label}`,
          category: 'Add Block',
          icon: cmd.icon,
          keywords: cmd.keywords,
          action: () => {
            const block = createDefaultBlock(cmd.type);
            addBlock(selectedModuleId, selectedLessonId, block);
          },
        });
      }
    }

    // Navigation commands
    for (const mod of content.modules) {
      items.push({
        id: `nav-module-${mod.id}`,
        label: mod.title,
        category: 'Navigate to Module',
        icon: <LayoutGrid className="h-4 w-4" />,
        action: () => {
          selectModule(mod.id);
        },
      });
      for (const lesson of mod.lessons) {
        items.push({
          id: `nav-lesson-${lesson.id}`,
          label: `${mod.title} / ${lesson.title}`,
          description: lesson.title,
          category: 'Navigate to Lesson',
          icon: <Search className="h-4 w-4" />,
          action: () => {
            selectModule(mod.id);
            selectLesson(lesson.id);
          },
        });
      }
    }

    // Editor actions
    items.push(
      {
        id: 'action-undo',
        label: 'Undo',
        category: 'Actions',
        icon: <Undo2 className="h-4 w-4" />,
        keywords: ['revert', 'back'],
        action: undo,
      },
      {
        id: 'action-redo',
        label: 'Redo',
        category: 'Actions',
        icon: <Redo2 className="h-4 w-4" />,
        keywords: ['forward'],
        action: redo,
      },
      {
        id: 'action-preview',
        label: 'Toggle Preview',
        category: 'Actions',
        icon: <Eye className="h-4 w-4" />,
        keywords: ['learner', 'view'],
        action: togglePreview,
      },
      {
        id: 'action-sidebar',
        label: 'Toggle Sidebar',
        category: 'Actions',
        icon: <PanelLeft className="h-4 w-4" />,
        keywords: ['panel', 'structure'],
        action: toggleSidebar,
      },
      {
        id: 'action-block-library',
        label: 'Toggle Block Library',
        category: 'Actions',
        icon: <LayoutGrid className="h-4 w-4" />,
        keywords: ['blocks', 'components'],
        action: toggleBlockLibrary,
      },
      {
        id: 'action-shortcuts',
        label: 'Show Keyboard Shortcuts',
        category: 'Actions',
        icon: <Keyboard className="h-4 w-4" />,
        keywords: ['help', 'keys', 'hotkeys'],
        action: () => {
          // Just close palette — shortcuts reference is informational
        },
      },
    );

    return items;
  }, [selectedModuleId, selectedLessonId, addBlock, undo, redo, togglePreview, toggleSidebar, toggleBlockLibrary, content.modules, selectModule, selectLesson]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) => {
      if (cmd.label.toLowerCase().includes(lowerQuery)) return true;
      if (cmd.category.toLowerCase().includes(lowerQuery)) return true;
      if (cmd.keywords?.some((k) => k.includes(lowerQuery))) return true;
      return false;
    });
  }, [commands, query]);

  const executeCommand = useCallback(
    (cmd: CommandItem) => {
      cmd.action();
      setCommandPaletteOpen(false);
      setQuery('');
      setSelectedIndex(0);
    },
    [setCommandPaletteOpen]
  );

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    },
    [filteredCommands, selectedIndex, executeCommand, setCommandPaletteOpen]
  );

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  // Group by category
  const grouped = new Map<string, CommandItem[]>();
  for (const cmd of filteredCommands) {
    const group = grouped.get(cmd.category) ?? [];
    group.push(cmd);
    grouped.set(cmd.category, group);
  }

  let globalIndex = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
      onClick={() => setCommandPaletteOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg rounded-xl border border-border/50 bg-card shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
          />
          <kbd className="rounded bg-muted border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground/50">
              No commands found.
            </div>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category}>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
                  {category}
                </p>
                {items.map((cmd) => {
                  const idx = globalIndex++;
                  const isActive = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      data-active={isActive}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary/8 text-primary'
                          : 'text-foreground/80 hover:bg-muted/50',
                      )}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <span className="shrink-0 text-muted-foreground/60">{cmd.icon}</span>
                      <span className="truncate">{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t px-4 py-2 text-[10px] text-muted-foreground/40">
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-muted border border-border px-1 py-0.5 font-mono">&uarr;&darr;</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-muted border border-border px-1 py-0.5 font-mono">Enter</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-muted border border-border px-1 py-0.5 font-mono">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
