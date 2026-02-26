// src/types/authoring.ts -- COMPLETE FILE

// ============================================================
// LOCALIZED STRING (Arabic-first, with English fallback)
// ============================================================

export interface LocalizedString {
  ar: string;
  en: string;
}

// ============================================================
// BLOCK TYPE ENUM -- all 27 block types
// ============================================================

export enum BlockType {
  // Content blocks
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  EMBED = 'embed',
  QUOTE = 'quote',
  LIST = 'list',
  CODE = 'code',
  TABLE = 'table',
  DIVIDER = 'divider',
  COVER = 'cover',
  GALLERY = 'gallery',
  CHART = 'chart',

  // Interactive blocks
  ACCORDION = 'accordion',
  TABS = 'tabs',
  FLASHCARD = 'flashcard',
  LABELED_GRAPHIC = 'labeled_graphic',
  PROCESS = 'process',
  TIMELINE = 'timeline',
  HOTSPOT = 'hotspot',
  SCENARIO = 'scenario',

  // Assessment blocks
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  MULTIPLE_RESPONSE = 'multiple_response',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  SORTING = 'sorting',
}

// ============================================================
// BASE BLOCK -- shared fields for all blocks
// ============================================================

export interface BaseBlock {
  id: string;                          // UUID v4, generated client-side
  type: BlockType;
  order: number;                       // Position within lesson (0-indexed)
  visible: boolean;                    // Can be hidden without deleting
  locked: boolean;                     // Prevent editing (AI-generated lock)
  metadata: {
    created_at: string;                // ISO 8601
    updated_at: string;                // ISO 8601
    created_by: 'human' | 'ai';       // Track AI-generated content
    ai_model?: string;                 // e.g., 'claude-sonnet-4-6'
  };
}

// ============================================================
// CONTENT BLOCKS
// ============================================================

export interface TextBlock extends BaseBlock {
  type: BlockType.TEXT;
  data: {
    content: string;                   // Tiptap JSON string (ProseMirror doc)
    alignment: 'start' | 'center' | 'end';  // RTL-aware (start = right in RTL)
    direction: 'rtl' | 'ltr' | 'auto';
  };
}

export interface ImageBlock extends BaseBlock {
  type: BlockType.IMAGE;
  data: {
    src: string;                       // Supabase Storage signed URL
    alt: string;
    caption?: string;
    width: 'small' | 'medium' | 'large' | 'full';  // 33%, 50%, 75%, 100%
    alignment: 'start' | 'center' | 'end';
    link_url?: string;                 // Optional click-through URL
  };
}

export interface VideoBlock extends BaseBlock {
  type: BlockType.VIDEO;
  data: {
    bunny_video_id: string;            // Bunny Stream video GUID
    bunny_library_id: string;          // Bunny Stream library ID
    title: string;
    description?: string;
    duration_seconds: number;
    thumbnail_url: string;             // Bunny auto-generated thumbnail
    captions: { language: string; label: string; src_url: string }[];
    chapters: { time_seconds: number; title: string }[];
    completion_criteria: 'watch_75' | 'watch_90' | 'watch_100';
    allow_skip: boolean;
    autoplay: boolean;
  };
}

export interface AudioBlock extends BaseBlock {
  type: BlockType.AUDIO;
  data: {
    src: string;                       // Supabase or Bunny Storage URL
    title: string;
    duration_seconds: number;
    show_transcript: boolean;
    transcript?: string;
  };
}

export interface EmbedBlock extends BaseBlock {
  type: BlockType.EMBED;
  data: {
    url: string;                       // YouTube, Vimeo, Google Slides, etc.
    provider: 'youtube' | 'vimeo' | 'google_slides' | 'custom';
    aspect_ratio: '16:9' | '4:3' | '1:1';
    allow_fullscreen: boolean;
  };
}

export interface QuoteBlock extends BaseBlock {
  type: BlockType.QUOTE;
  data: {
    text: string;
    attribution: string;
    style: 'default' | 'large' | 'highlight';
  };
}

export interface ListBlock extends BaseBlock {
  type: BlockType.LIST;
  data: {
    items: { id: string; text: string; icon?: string }[];
    style: 'bullet' | 'numbered' | 'icon';
    columns: 1 | 2 | 3;
  };
}

export interface CodeBlock extends BaseBlock {
  type: BlockType.CODE;
  data: {
    code: string;
    language: string;                  // 'javascript', 'python', 'sql', etc.
    show_line_numbers: boolean;
    caption?: string;
  };
}

export interface TableBlock extends BaseBlock {
  type: BlockType.TABLE;
  data: {
    headers: string[];
    rows: string[][];
    has_header_row: boolean;
    striped: boolean;
    caption?: string;
  };
}

export interface DividerBlock extends BaseBlock {
  type: BlockType.DIVIDER;
  data: {
    style: 'line' | 'dots' | 'space';
    spacing: 'small' | 'medium' | 'large';
  };
}

export interface CoverBlock extends BaseBlock {
  type: BlockType.COVER;
  data: {
    background_image: string;          // URL
    title: string;
    subtitle?: string;
    overlay_color: string;             // hex with alpha, e.g., '#000000AA'
    text_alignment: 'start' | 'center' | 'end';
    height: 'small' | 'medium' | 'large';  // 200px, 400px, 600px
  };
}

export interface GalleryBlock extends BaseBlock {
  type: BlockType.GALLERY;
  data: {
    images: {
      id: string;
      src: string;
      alt: string;
      caption?: string;
    }[];
    layout: 'grid' | 'carousel' | 'masonry';
    columns: 2 | 3 | 4;
  };
}

export interface ChartBlock extends BaseBlock {
  type: BlockType.CHART;
  data: {
    chart_type: 'bar' | 'line' | 'pie' | 'donut';
    title: string;
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
    show_legend: boolean;
  };
}

// ============================================================
// INTERACTIVE BLOCKS
// ============================================================

export interface AccordionBlock extends BaseBlock {
  type: BlockType.ACCORDION;
  data: {
    items: {
      id: string;
      title: string;
      content: string;                 // Tiptap JSON string
      icon?: string;
    }[];
    allow_multiple_open: boolean;
    start_expanded: boolean;
  };
}

export interface TabsBlock extends BaseBlock {
  type: BlockType.TABS;
  data: {
    tabs: {
      id: string;
      label: string;
      content: string;                 // Tiptap JSON string
      icon?: string;
    }[];
    style: 'horizontal' | 'vertical';
  };
}

export interface FlashcardBlock extends BaseBlock {
  type: BlockType.FLASHCARD;
  data: {
    cards: {
      id: string;
      front: string;
      back: string;
      image_front?: string;
      image_back?: string;
    }[];
    shuffle: boolean;
  };
}

export interface LabeledGraphicBlock extends BaseBlock {
  type: BlockType.LABELED_GRAPHIC;
  data: {
    image: string;                     // URL
    markers: {
      id: string;
      x_percent: number;              // 0-100 position on image
      y_percent: number;
      label: string;
      description: string;
      icon: 'info' | 'pin' | 'number';
    }[];
  };
}

export interface ProcessBlock extends BaseBlock {
  type: BlockType.PROCESS;
  data: {
    steps: {
      id: string;
      title: string;
      description: string;
      icon?: string;
      image?: string;
    }[];
    layout: 'vertical' | 'horizontal';
    numbered: boolean;
  };
}

export interface TimelineBlock extends BaseBlock {
  type: BlockType.TIMELINE;
  data: {
    events: {
      id: string;
      date: string;
      title: string;
      description: string;
      image?: string;
    }[];
    direction: 'vertical' | 'horizontal';
  };
}

export interface HotspotBlock extends BaseBlock {
  type: BlockType.HOTSPOT;
  data: {
    image: string;
    regions: {
      id: string;
      shape: 'circle' | 'rect';
      coords: number[];               // [x, y, radius] or [x1, y1, x2, y2] as percentages
      label: string;
      content: string;
      is_correct?: boolean;           // For quiz mode
    }[];
    mode: 'explore' | 'quiz';         // Explore = info only, Quiz = find correct regions
  };
}

export interface ScenarioBlock extends BaseBlock {
  type: BlockType.SCENARIO;
  data: {
    title: string;
    description: string;
    nodes: {
      id: string;
      type: 'question' | 'outcome';
      content: string;
      image?: string;
      choices?: {
        id: string;
        text: string;
        next_node_id: string;          // Points to another node
        is_optimal: boolean;
        feedback: string;
      }[];
      is_positive_outcome?: boolean;   // For outcome nodes
    }[];
    start_node_id: string;
  };
}

// ============================================================
// ASSESSMENT BLOCKS
// ============================================================

export interface MultipleChoiceBlock extends BaseBlock {
  type: BlockType.MULTIPLE_CHOICE;
  data: {
    question: string;
    options: {
      id: string;
      text: string;
      is_correct: boolean;
      feedback?: string;               // Shown when selected
    }[];
    explanation: string;               // Shown after answering
    allow_retry: boolean;
    shuffle_options: boolean;
    points: number;                    // Default 1
  };
}

export interface TrueFalseBlock extends BaseBlock {
  type: BlockType.TRUE_FALSE;
  data: {
    statement: string;
    correct_answer: boolean;
    explanation_true: string;
    explanation_false: string;
    points: number;
  };
}

export interface MultipleResponseBlock extends BaseBlock {
  type: BlockType.MULTIPLE_RESPONSE;
  data: {
    question: string;
    options: {
      id: string;
      text: string;
      is_correct: boolean;
      feedback?: string;
    }[];
    explanation: string;
    min_selections: number;
    max_selections: number;
    scoring: 'all_or_nothing' | 'partial';  // Partial = points per correct option
    points: number;
  };
}

export interface FillInBlankBlock extends BaseBlock {
  type: BlockType.FILL_IN_BLANK;
  data: {
    text_with_blanks: string;          // "The capital of Saudi Arabia is ___blank_1___"
    blanks: {
      id: string;                      // Matches ___blank_1___
      correct_answers: string[];       // Multiple accepted answers
      case_sensitive: boolean;
    }[];
    explanation: string;
    points: number;
  };
}

export interface MatchingBlock extends BaseBlock {
  type: BlockType.MATCHING;
  data: {
    instruction: string;
    pairs: {
      id: string;
      left: string;
      right: string;
    }[];
    shuffle: boolean;
    explanation: string;
    points: number;
  };
}

export interface SortingBlock extends BaseBlock {
  type: BlockType.SORTING;
  data: {
    instruction: string;
    categories: {
      id: string;
      name: string;
    }[];
    items: {
      id: string;
      text: string;
      correct_category_id: string;     // Which category this belongs to
    }[];
    explanation: string;
    points: number;
  };
}

// ============================================================
// DISCRIMINATED UNION -- the master Block type
// ============================================================

export type Block =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | AudioBlock
  | EmbedBlock
  | QuoteBlock
  | ListBlock
  | CodeBlock
  | TableBlock
  | DividerBlock
  | CoverBlock
  | GalleryBlock
  | ChartBlock
  | AccordionBlock
  | TabsBlock
  | FlashcardBlock
  | LabeledGraphicBlock
  | ProcessBlock
  | TimelineBlock
  | HotspotBlock
  | ScenarioBlock
  | MultipleChoiceBlock
  | TrueFalseBlock
  | MultipleResponseBlock
  | FillInBlankBlock
  | MatchingBlock
  | SortingBlock;

// ============================================================
// COURSE STRUCTURE
// ============================================================

export interface Lesson {
  id: string;                          // UUID v4
  title: string;
  description?: string;
  order: number;
  blocks: Block[];
  duration_minutes?: number;           // Estimated completion time
  is_locked: boolean;                  // Require previous lesson completion
}

export interface Module {
  id: string;                          // UUID v4
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  is_locked: boolean;                  // Require previous module completion
}

export interface CourseContent {
  modules: Module[];
  settings: CourseSettings;
}

export interface CourseSettings {
  theme: CourseTheme;
  navigation: 'sequential' | 'free';  // Sequential = must complete in order
  show_progress_bar: boolean;
  show_lesson_list: boolean;
  completion_criteria: 'all_blocks' | 'all_required' | 'percentage';
  completion_percentage?: number;       // If criteria = 'percentage'
  passing_score?: number;              // Minimum quiz score to pass (0-100)
  language: 'ar' | 'en' | 'bilingual';
  direction: 'rtl' | 'ltr' | 'auto';
}

export interface CourseTheme {
  primary_color: string;               // Hex, e.g., '#1a73e8'
  secondary_color: string;
  background_color: string;
  text_color: string;
  font_family: string;                 // 'cairo' | 'inter' | 'tajawal' | 'system'
  border_radius: 'none' | 'small' | 'medium' | 'large';
  cover_style: 'gradient' | 'image' | 'solid';
}

// ============================================================
// AI GENERATION TYPES
// ============================================================

export interface CourseOutline {
  title: string;
  description: string;
  target_audience: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'ar' | 'en';
  estimated_duration_minutes: number;
  modules: {
    title: string;
    description: string;
    order: number;
    lessons: {
      title: string;
      description: string;
      order: number;
      suggested_blocks: BlockType[];    // AI suggests which block types to use
      estimated_duration_minutes: number;
    }[];
  }[];
  learning_outcomes: string[];
}

export interface AIGenerationRequest {
  topic: string;
  audience: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'ar' | 'en';
  tone: 'formal' | 'conversational' | 'academic';
  module_count: number;                // 3-7
  lessons_per_module: number;          // 2-5
  source_chunks?: DocumentChunk[];     // From document upload
}

export interface DocumentChunk {
  text: string;
  page_number: number;
  heading?: string;
  type: 'text' | 'heading' | 'list' | 'table';
}

// ============================================================
// BUNNY.NET TYPES
// ============================================================

export interface BunnyVideo {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;                      // Duration in seconds
  status: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 4 = finished, 5 = failed
  framerate: number;
  rotation: number;
  width: number;
  height: number;
  availableResolutions: string;        // "240p,360p,480p,720p,1080p"
  thumbnailCount: number;
  encodeProgress: number;              // 0-100
  storageSize: number;
  captions: {
    srclang: string;
    label: string;
  }[];
  hasMP4Fallback: boolean;
  collectionId: string;
  thumbnailFileName: string;
  averageWatchTime: number;
  totalWatchTime: number;
  category: string;
  chapters: {
    title: string;
    start: number;
    end: number;
  }[];
  moments: {
    label: string;
    timestamp: number;
  }[];
  metaTags: {
    property: string;
    value: string;
  }[];
  transcodingMessages: {
    timeStamp: string;
    level: number;
    issueCode: number;
    message: string;
    value: string;
  }[];
}

export interface BunnyStorageItem {
  Guid: string;
  StorageZoneName: string;
  Path: string;
  ObjectName: string;
  Length: number;
  LastChanged: string;
  ServerId: number;
  ArrayNumber: number;
  IsDirectory: boolean;
  UserId: string;
  ContentType: string;
  DateCreated: string;
  StorageZoneId: number;
  Checksum: string;
  ReplicatedZones: string;
}

export interface BunnyWebhookPayload {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;                      // 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
}
