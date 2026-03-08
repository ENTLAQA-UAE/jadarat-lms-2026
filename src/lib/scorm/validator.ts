// src/lib/scorm/validator.ts
//
// Pre-export validation for SCORM packages.
// Checks course content for common issues before generating a SCORM ZIP.

import type {
  CourseContent,
  Block,
  MultipleChoiceBlock,
  TrueFalseBlock,
  ImageBlock,
  VideoBlock,
} from '@/types/authoring';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidationWarning {
  type: 'error' | 'warning';
  message: string;
  blockId?: string;
  lessonId?: string;
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

/**
 * Validate a course for SCORM export readiness.
 *
 * Checks:
 * - No empty modules (must have at least 1 lesson)
 * - No empty lessons (must have at least 1 block)
 * - Assessment blocks (multiple_choice, true_false) have at least one correct answer
 * - Image blocks have non-empty `src` URLs
 * - Video blocks have non-empty `bunny_video_id`
 */
export function validateCourseForExport(course: CourseContent): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const mod of course.modules) {
    // Check for empty modules
    if (!mod.lessons || mod.lessons.length === 0) {
      warnings.push({
        type: 'error',
        message: `Module "${mod.title}" has no lessons. Each module must contain at least 1 lesson.`,
      });
      continue;
    }

    for (const lesson of mod.lessons) {
      // Check for empty lessons
      if (!lesson.blocks || lesson.blocks.length === 0) {
        warnings.push({
          type: 'error',
          message: `Lesson "${lesson.title}" in module "${mod.title}" has no blocks. Each lesson must contain at least 1 block.`,
          lessonId: lesson.id,
        });
        continue;
      }

      for (const block of lesson.blocks) {
        // Check multiple_choice blocks have at least one correct answer
        if (block.type === 'multiple_choice') {
          const mcBlock = block as MultipleChoiceBlock;
          const hasCorrect = mcBlock.data.options.some((opt) => opt.is_correct);
          if (!hasCorrect) {
            warnings.push({
              type: 'error',
              message: `Multiple choice block in lesson "${lesson.title}" has no correct answer set.`,
              blockId: block.id,
              lessonId: lesson.id,
            });
          }
        }

        // Check true_false blocks have a correct answer set
        if (block.type === 'true_false') {
          const tfBlock = block as TrueFalseBlock;
          if (tfBlock.data.correct_answer === undefined || tfBlock.data.correct_answer === null) {
            warnings.push({
              type: 'error',
              message: `True/false block in lesson "${lesson.title}" has no correct answer set.`,
              blockId: block.id,
              lessonId: lesson.id,
            });
          }
        }

        // Check image blocks have non-empty src
        if (block.type === 'image') {
          const imgBlock = block as ImageBlock;
          if (!imgBlock.data.src || imgBlock.data.src.trim() === '') {
            warnings.push({
              type: 'warning',
              message: `Image block in lesson "${lesson.title}" has an empty src URL.`,
              blockId: block.id,
              lessonId: lesson.id,
            });
          }
        }

        // Check video blocks have non-empty bunny_video_id
        if (block.type === 'video') {
          const vidBlock = block as VideoBlock;
          if (!vidBlock.data.bunny_video_id || vidBlock.data.bunny_video_id.trim() === '') {
            warnings.push({
              type: 'warning',
              message: `Video block in lesson "${lesson.title}" has an empty bunny_video_id.`,
              blockId: block.id,
              lessonId: lesson.id,
            });
          }
        }
      }
    }
  }

  return warnings;
}
