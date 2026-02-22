// ============================================================================
// Phase 2: AI & Intelligence — TypeScript Types
// ============================================================================

export type AIProvider = 'anthropic' | 'openai' | 'google' | 'jais' | 'custom';

export interface OrgAIConfig {
  id: number;
  organization_id: number;
  provider: AIProvider;
  model: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  rate_limit_rpm: number;
  rate_limit_rpd: number;
  chat_enabled: boolean;
  search_enabled: boolean;
  recommendations_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: number;
  session_id: string;
  title: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  tokens_used: number | null;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: number;
}

export interface SemanticSearchResult {
  course_id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  category_name: string | null;
  level: string;
  similarity: number;
  matched_content: string;
  content_type: string;
}

export interface CourseRecommendation {
  course_id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  category_name: string | null;
  level: string;
  score: number;
  reason: string;
  algorithm: string;
}

export const AI_PROVIDERS: Record<AIProvider, { label: string; labelAr: string; models: string[] }> = {
  anthropic: {
    label: 'Anthropic (Claude)',
    labelAr: 'أنثروبيك (كلود)',
    models: ['claude-sonnet-4-5-20250929', 'claude-haiku-4-5-20251001', 'claude-opus-4-6'],
  },
  openai: {
    label: 'OpenAI (GPT)',
    labelAr: 'أوبن أي آي (جي بي تي)',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  },
  google: {
    label: 'Google (Gemini)',
    labelAr: 'جوجل (جيميناي)',
    models: ['gemini-2.0-flash', 'gemini-2.0-pro'],
  },
  jais: {
    label: 'G42 (Jais)',
    labelAr: 'جي42 (جيس)',
    models: ['jais-30b-chat', 'jais-13b-chat'],
  },
  custom: {
    label: 'Custom Provider',
    labelAr: 'مزود مخصص',
    models: [],
  },
};
