// src/types/question-bank.ts -- Question Bank types

import type { BlockType } from './authoring';

// ============================================================
// QUESTION BANK -- org-wide reusable question collection
// ============================================================

export interface QuestionBank {
  id: string;
  organization_id: number;
  name: string;
  description?: string;
  category?: string;
  tags: string[];
  language: 'ar' | 'en' | 'bilingual';
  question_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface QuestionBankItem {
  id: string;
  bank_id: string;
  block_type: AssessmentBlockType;
  block_data: Record<string, unknown>; // Same shape as the assessment block's `data` field
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  points: number;
  usage_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type AssessmentBlockType =
  | BlockType.MULTIPLE_CHOICE
  | BlockType.TRUE_FALSE
  | BlockType.MULTIPLE_RESPONSE
  | BlockType.FILL_IN_BLANK
  | BlockType.MATCHING
  | BlockType.SORTING;

// ============================================================
// QUESTION BANK REFERENCE -- used in QuizLessonSettings
// ============================================================

export interface QuestionBankReference {
  bank_id: string;
  bank_name: string;              // Display name (denormalized for offline use)
  draw_count: number;             // How many questions to draw from this bank
  block_type_filter?: AssessmentBlockType; // Optional: only draw this question type
  difficulty_filter?: 'easy' | 'medium' | 'hard'; // Optional: only draw this difficulty
}

// ============================================================
// API PAYLOADS
// ============================================================

export interface CreateQuestionBankPayload {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  language?: 'ar' | 'en' | 'bilingual';
}

export interface UpdateQuestionBankPayload {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  language?: 'ar' | 'en' | 'bilingual';
}

export interface CreateQuestionItemPayload {
  bank_id: string;
  block_type: AssessmentBlockType;
  block_data: Record<string, unknown>;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  points?: number;
}

export interface UpdateQuestionItemPayload {
  block_data?: Record<string, unknown>;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  points?: number;
}

export interface DrawQuestionsPayload {
  bank_id: string;
  count: number;
  block_type?: AssessmentBlockType;
  difficulty?: 'easy' | 'medium' | 'hard';
}
