// src/types/authoring.ts -- COMPLETE FILE

// ============================================================
// LOCALIZED STRING (Arabic-first, with English fallback)
// ============================================================

export interface LocalizedString {
  ar: string;
  en: string;
}

// ============================================================
// BLOCK TYPE ENUM -- all block types
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
  CALLOUT = 'callout',
  STATEMENT = 'statement',
  BUTTON = 'button',
  ATTACHMENT = 'attachment',

  // Interactive blocks
  ACCORDION = 'accordion',
  TABS = 'tabs',
  FLASHCARD = 'flashcard',
  LABELED_GRAPHIC = 'labeled_graphic',
  PROCESS = 'process',
  TIMELINE = 'timeline',
  HOTSPOT = 'hotspot',
  SCENARIO = 'scenario',
  CONTINUE = 'continue',

  // Assessment blocks
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  MULTIPLE_RESPONSE = 'multiple_response',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  SORTING = 'sorting',
}

// ============================================================
// BLOCK STYLE -- per-block visual customization
// ============================================================

export interface BlockStyle {
  background_color?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  card_mode?: boolean;
  full_width?: boolean;
  margin_top?: 'none' | 'small' | 'medium' | 'large';
  margin_bottom?: 'none' | 'small' | 'medium' | 'large';
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
  style?: BlockStyle;                  // Per-block visual customization
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
    // Carousel mode: multiple quotes
    quotes?: { id: string; text: string; attribution: string }[];
    carousel?: boolean;
  };
}

export interface ListBlock extends BaseBlock {
  type: BlockType.LIST;
  data: {
    items: { id: string; text: string; icon?: string }[];
    style: 'bullet' | 'numbered' | 'icon' | 'checkbox';
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
    layout: 'centered' | 'left_aligned' | 'split' | 'minimal' | 'gradient_overlay' | 'full_bleed' | 'pattern' | 'video_bg';
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
      audio_url?: string;             // Optional narration audio
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
      audio_url?: string;             // Optional narration audio
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
      audio_url?: string;             // Optional narration audio
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
      audio_url?: string;             // Optional narration audio
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
      audio_url?: string;             // Optional narration audio
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

export interface CalloutBlock extends BaseBlock {
  type: BlockType.CALLOUT;
  data: {
    variant: 'info' | 'warning' | 'success' | 'error';
    title: string;
    content: string;                   // HTML content
    icon?: string;                     // optional custom emoji/icon
    collapsible: boolean;
  };
}

export interface StatementBlock extends BaseBlock {
  type: BlockType.STATEMENT;
  data: {
    text: string;                      // Main statement text
    media_url?: string;                // Optional background or side image
    style: 'bold' | 'bordered' | 'background' | 'note';
    alignment: 'start' | 'center' | 'end';
    accent_color?: string;             // Optional accent color override
  };
}

export interface ButtonBlock extends BaseBlock {
  type: BlockType.BUTTON;
  data: {
    buttons: {
      id: string;
      label: string;
      url?: string;                    // External URL
      action: 'link' | 'next_lesson' | 'previous_lesson' | 'scroll_top';
      style: 'primary' | 'secondary' | 'outline' | 'ghost';
      icon?: string;                   // Optional emoji or icon name
    }[];
    alignment: 'start' | 'center' | 'end';
    layout: 'inline' | 'stacked';     // Side by side or stacked
  };
}

export interface ContinueBlock extends BaseBlock {
  type: BlockType.CONTINUE;
  data: {
    label: string;                     // Button text, e.g., "Continue"
    completion_type: 'none' | 'above' | 'all_above';
    // none = always enabled
    // above = must complete the block directly above
    // all_above = must complete all blocks above this one
  };
}

export interface AttachmentBlock extends BaseBlock {
  type: BlockType.ATTACHMENT;
  data: {
    file_url: string;                  // Supabase Storage URL
    file_name: string;
    file_size: number;                 // bytes
    file_type: string;                 // MIME type e.g. 'application/pdf'
    title: string;
    description?: string;
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
  | SortingBlock
  | CalloutBlock
  | StatementBlock
  | ButtonBlock
  | ContinueBlock
  | AttachmentBlock;

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
  lesson_type?: 'content' | 'quiz';   // Content = regular blocks, Quiz = graded assessment (defaults to 'content')
  quiz_settings?: QuizLessonSettings; // Only used when lesson_type = 'quiz'
}

export interface QuizLessonSettings {
  passing_score: number;               // 0-100 percentage required to pass
  max_attempts: number;                // 0 = unlimited
  time_limit_minutes: number;          // 0 = no time limit
  randomize_questions: boolean;
  show_results: boolean;               // Show results screen after submission
  show_correct_answers: boolean;       // Reveal correct answers in results
  question_pool_size: number;          // 0 = use all questions, >0 = draw N random questions
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
  // Rise 360-inspired settings
  sidebar_default_open: boolean;        // Begin with sidebar open
  allow_search: boolean;                // Enable search within sidebar
  allow_mark_complete: boolean;         // Allow marking lessons complete manually
  show_lesson_count: boolean;           // "Lesson X of Y" label
  quiz_settings: {
    allow_retries: boolean;
    max_retries: number;                // 0 = unlimited
    randomize_questions: boolean;
    shuffle_answers: boolean;
    require_passing_to_continue: boolean;
  };
  block_entrance_animations: boolean;   // Enable entrance animations
}

export interface CourseTheme {
  primary_color: string;               // Hex, e.g., '#1a73e8'
  secondary_color: string;
  background_color: string;
  text_color: string;
  font_family: string;                 // 'cairo' | 'inter' | 'tajawal' | 'system' | custom name
  border_radius: 'none' | 'small' | 'medium' | 'large';
  cover_style: 'gradient' | 'image' | 'solid';
  navigation_style: 'sidebar' | 'top_bar' | 'compact' | 'overlay' | 'hidden';
  lesson_header_style: 'full_width_banner' | 'compact' | 'none';
  dark_mode: boolean;
  cover_image_url?: string;
  logo_url?: string;                   // Course logo overlay on cover/header
  custom_fonts?: CustomFont[];         // User-uploaded brand fonts
}

export interface CustomFont {
  name: string;
  url: string;                         // Supabase Storage URL
  format: 'woff2' | 'woff' | 'ttf' | 'otf';
}

// ============================================================
// AI GENERATION TYPES
// ============================================================

export type CourseLength = 'micro' | 'short' | 'standard' | 'extended';

/** AI-generated course details — produced from just a description in Step 2 */
export interface CourseDetails {
  topic: string;
  tone: string;
  audience: string;
  goals: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  suggested_length: CourseLength;
  learning_objectives: string[];
}

/** Content generation options selected in Step 5 */
export interface ContentOptions {
  content_format: 'interactive' | 'text_only';
  generate_images: boolean;
  assessment_density: 'per_lesson' | 'per_module' | 'none';
}

/** Course length → module/lesson mapping */
export const COURSE_LENGTH_CONFIG: Record<CourseLength, { modules: number; lessonsPerModule: number; label: string; description: string; duration: string }> = {
  micro: { modules: 1, lessonsPerModule: 2, label: 'Micro', description: '1 module, 2 lessons', duration: '< 10 min' },
  short: { modules: 2, lessonsPerModule: 3, label: 'Short', description: '2 modules, ~6 lessons', duration: '< 1 hour' },
  standard: { modules: 4, lessonsPerModule: 3, label: 'Standard', description: '4 modules, ~12 lessons', duration: '1-3 hours' },
  extended: { modules: 6, lessonsPerModule: 4, label: 'Extended', description: '6+ modules, ~24 lessons', duration: '3+ hours' },
};

export interface CourseOutlineLesson {
  title: string;
  description: string;
  order: number;
  suggested_blocks: BlockType[];
  estimated_duration_minutes: number;
  topics: string[];                     // Key topics covered in this lesson
}

export interface CourseOutlineModule {
  title: string;
  description: string;
  order: number;
  lessons: CourseOutlineLesson[];
}

export interface CourseOutline {
  title: string;
  description: string;
  target_audience: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'ar' | 'en';
  estimated_duration_minutes: number;
  modules: CourseOutlineModule[];
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
