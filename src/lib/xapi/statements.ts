// xAPI statement generator for native course blocks
// Uses ADL xAPI spec: https://github.com/adlnet/xAPI-Spec

export interface XApiActor {
  mbox: string;
  name: string;
  objectType: 'Agent';
}

export interface XApiVerb {
  id: string;
  display: Record<string, string>;
}

export interface XApiObject {
  id: string;
  objectType: 'Activity';
  definition: {
    type: string;
    name: Record<string, string>;
    description?: Record<string, string>;
    interactionType?: string;
  };
}

export interface XApiResult {
  score?: { scaled?: number; raw?: number; min?: number; max?: number };
  success?: boolean;
  completion?: boolean;
  duration?: string;
  response?: string;
}

export interface XApiStatement {
  actor: XApiActor;
  verb: XApiVerb;
  object: XApiObject;
  result?: XApiResult;
  timestamp: string;
  context?: {
    contextActivities?: {
      parent?: { id: string; objectType: 'Activity' }[];
      grouping?: { id: string; objectType: 'Activity' }[];
    };
    language?: string;
  };
}

// ============================================================
// VERB CONSTANTS
// ============================================================

export const XAPI_VERBS = {
  launched: { id: 'http://adlnet.gov/expapi/verbs/launched', display: { 'en-US': 'launched' } },
  completed: { id: 'http://adlnet.gov/expapi/verbs/completed', display: { 'en-US': 'completed' } },
  passed: { id: 'http://adlnet.gov/expapi/verbs/passed', display: { 'en-US': 'passed' } },
  failed: { id: 'http://adlnet.gov/expapi/verbs/failed', display: { 'en-US': 'failed' } },
  answered: { id: 'http://adlnet.gov/expapi/verbs/answered', display: { 'en-US': 'answered' } },
  attempted: { id: 'http://adlnet.gov/expapi/verbs/attempted', display: { 'en-US': 'attempted' } },
  experienced: { id: 'http://adlnet.gov/expapi/verbs/experienced', display: { 'en-US': 'experienced' } },
  interacted: { id: 'http://adlnet.gov/expapi/verbs/interacted', display: { 'en-US': 'interacted' } },
  progressed: { id: 'http://adlnet.gov/expapi/verbs/progressed', display: { 'en-US': 'progressed' } },
} as const;

// ============================================================
// ACTIVITY TYPES
// ============================================================

export const XAPI_ACTIVITY_TYPES = {
  course: 'http://adlnet.gov/expapi/activities/course',
  module: 'http://adlnet.gov/expapi/activities/module',
  lesson: 'http://adlnet.gov/expapi/activities/lesson',
  assessment: 'http://adlnet.gov/expapi/activities/assessment',
  interaction: 'http://adlnet.gov/expapi/activities/interaction',
  media: 'http://adlnet.gov/expapi/activities/media',
} as const;

// ============================================================
// HELPERS
// ============================================================

const ASSESSMENT_BLOCK_TYPES = new Set([
  'multiple_choice',
  'true_false',
  'multiple_response',
  'fill_in_blank',
  'matching',
  'sorting',
]);

function isAssessmentBlock(blockType: string): boolean {
  return ASSESSMENT_BLOCK_TYPES.has(blockType);
}

function getActivityTypeForBlock(blockType: string): string {
  if (isAssessmentBlock(blockType)) return XAPI_ACTIVITY_TYPES.assessment;
  if (['video', 'audio'].includes(blockType)) return XAPI_ACTIVITY_TYPES.media;
  return XAPI_ACTIVITY_TYPES.interaction;
}

function mapBlockTypeToInteraction(blockType: string): string {
  switch (blockType) {
    case 'multiple_choice':
      return 'choice';
    case 'true_false':
      return 'true-false';
    case 'multiple_response':
      return 'choice';
    case 'fill_in_blank':
      return 'fill-in';
    case 'matching':
      return 'matching';
    case 'sorting':
      return 'sequencing';
    default:
      return 'other';
  }
}

// ============================================================
// GENERATOR FUNCTIONS
// ============================================================

/**
 * Create an xAPI actor from email and display name.
 */
export function createActor(email: string, name: string): XApiActor {
  return {
    mbox: `mailto:${email}`,
    name,
    objectType: 'Agent',
  };
}

/**
 * Generate a "launched" statement for a course.
 */
export function createCourseLaunchedStatement(
  actor: XApiActor,
  courseId: number | string,
  courseTitle: string,
  language: string = 'en-US',
): XApiStatement {
  return {
    actor,
    verb: XAPI_VERBS.launched,
    object: {
      id: `https://jadarat.app/courses/${courseId}`,
      objectType: 'Activity',
      definition: {
        type: XAPI_ACTIVITY_TYPES.course,
        name: { [language]: courseTitle },
      },
    },
    timestamp: new Date().toISOString(),
    context: {
      language,
    },
  };
}

/**
 * Generate a block-level completion statement.
 * Verb is determined by score: passed (>= 0.7 scaled), failed (< 0.7),
 * or completed (no score).
 */
export function createBlockCompletedStatement(
  actor: XApiActor,
  courseId: number | string,
  courseTitle: string,
  blockId: string,
  blockType: string,
  blockTitle: string,
  score?: number,
  maxScore?: number,
): XApiStatement {
  const hasScore =
    score !== undefined && maxScore !== undefined && maxScore > 0;
  const scaled = hasScore ? score / maxScore : undefined;

  // Determine verb based on whether block is an assessment and score
  let verb: XApiVerb = XAPI_VERBS.completed;
  if (hasScore && isAssessmentBlock(blockType)) {
    verb = scaled! >= 0.7 ? XAPI_VERBS.passed : XAPI_VERBS.failed;
  }

  const result: XApiResult = {
    completion: true,
  };

  if (hasScore) {
    result.score = {
      scaled,
      raw: score,
      min: 0,
      max: maxScore,
    };
    result.success = scaled! >= 0.7;
  }

  return {
    actor,
    verb,
    object: {
      id: `https://jadarat.app/courses/${courseId}/blocks/${blockId}`,
      objectType: 'Activity',
      definition: {
        type: getActivityTypeForBlock(blockType),
        name: { 'en-US': blockTitle || blockType },
        interactionType: isAssessmentBlock(blockType)
          ? mapBlockTypeToInteraction(blockType)
          : undefined,
      },
    },
    result,
    timestamp: new Date().toISOString(),
    context: {
      contextActivities: {
        parent: [
          {
            id: `https://jadarat.app/courses/${courseId}`,
            objectType: 'Activity',
          },
        ],
      },
    },
  };
}

/**
 * Generate a course-level completion statement.
 * Uses "completed" verb when progress >= 1, "progressed" otherwise.
 */
export function createCourseCompletedStatement(
  actor: XApiActor,
  courseId: number | string,
  courseTitle: string,
  progress: number,
  score?: number,
): XApiStatement {
  const isComplete = progress >= 1;

  const result: XApiResult = {
    completion: isComplete,
  };

  if (score !== undefined) {
    result.score = {
      scaled: score,
    };
    result.success = score >= 0.7;
  }

  return {
    actor,
    verb: isComplete ? XAPI_VERBS.completed : XAPI_VERBS.progressed,
    object: {
      id: `https://jadarat.app/courses/${courseId}`,
      objectType: 'Activity',
      definition: {
        type: XAPI_ACTIVITY_TYPES.course,
        name: { 'en-US': courseTitle },
      },
    },
    result,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate a block interaction statement (answered or interacted).
 */
export function createBlockInteractionStatement(
  actor: XApiActor,
  courseId: number | string,
  blockId: string,
  blockType: string,
  responseData?: string,
): XApiStatement {
  const verb = isAssessmentBlock(blockType)
    ? XAPI_VERBS.answered
    : XAPI_VERBS.interacted;

  return {
    actor,
    verb,
    object: {
      id: `https://jadarat.app/courses/${courseId}/blocks/${blockId}`,
      objectType: 'Activity',
      definition: {
        type: getActivityTypeForBlock(blockType),
        name: { 'en-US': blockType },
        interactionType: isAssessmentBlock(blockType)
          ? mapBlockTypeToInteraction(blockType)
          : undefined,
      },
    },
    result: responseData ? { response: responseData } : undefined,
    timestamp: new Date().toISOString(),
    context: {
      contextActivities: {
        parent: [
          {
            id: `https://jadarat.app/courses/${courseId}`,
            objectType: 'Activity',
          },
        ],
      },
    },
  };
}

// ============================================================
// STATEMENT BUILDERS (simplified API using actor IDs)
// ============================================================

/**
 * Build an xAPI statement for when a learner starts a course.
 */
export function buildCourseStartedStatement(
  actorId: string,
  courseId: string,
  courseName: string,
): XApiStatement {
  return {
    actor: {
      mbox: `mailto:${actorId}`,
      name: actorId,
      objectType: 'Agent',
    },
    verb: XAPI_VERBS.launched,
    object: {
      id: `https://jadarat.app/courses/${courseId}`,
      objectType: 'Activity',
      definition: {
        type: XAPI_ACTIVITY_TYPES.course,
        name: { 'en-US': courseName },
      },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build an xAPI statement for when a learner completes a lesson.
 */
export function buildLessonCompletedStatement(
  actorId: string,
  lessonId: string,
  lessonName: string,
  courseId: string,
): XApiStatement {
  return {
    actor: {
      mbox: `mailto:${actorId}`,
      name: actorId,
      objectType: 'Agent',
    },
    verb: XAPI_VERBS.completed,
    object: {
      id: `https://jadarat.app/courses/${courseId}/lessons/${lessonId}`,
      objectType: 'Activity',
      definition: {
        type: XAPI_ACTIVITY_TYPES.lesson,
        name: { 'en-US': lessonName },
      },
    },
    result: {
      completion: true,
    },
    timestamp: new Date().toISOString(),
    context: {
      contextActivities: {
        parent: [
          {
            id: `https://jadarat.app/courses/${courseId}`,
            objectType: 'Activity',
          },
        ],
      },
    },
  };
}

/**
 * Build an xAPI statement for when a learner answers a quiz question.
 */
export function buildQuizAnsweredStatement(
  actorId: string,
  questionId: string,
  questionText: string,
  response: string,
  correct: boolean,
  score: number,
): XApiStatement {
  return {
    actor: {
      mbox: `mailto:${actorId}`,
      name: actorId,
      objectType: 'Agent',
    },
    verb: XAPI_VERBS.answered,
    object: {
      id: `https://jadarat.app/questions/${questionId}`,
      objectType: 'Activity',
      definition: {
        type: XAPI_ACTIVITY_TYPES.interaction,
        name: { 'en-US': questionText },
        interactionType: 'choice',
      },
    },
    result: {
      score: {
        scaled: score,
        raw: score,
        min: 0,
        max: 1,
      },
      success: correct,
      response,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build an xAPI statement for when a learner completes a course.
 */
export function buildCourseCompletedStatement(
  actorId: string,
  courseId: string,
  courseName: string,
  score: number,
  duration: string,
): XApiStatement {
  return {
    actor: {
      mbox: `mailto:${actorId}`,
      name: actorId,
      objectType: 'Agent',
    },
    verb: score >= 0.7 ? XAPI_VERBS.passed : XAPI_VERBS.completed,
    object: {
      id: `https://jadarat.app/courses/${courseId}`,
      objectType: 'Activity',
      definition: {
        type: XAPI_ACTIVITY_TYPES.course,
        name: { 'en-US': courseName },
      },
    },
    result: {
      score: {
        scaled: score,
      },
      completion: true,
      success: score >= 0.7,
      duration,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Convert seconds to ISO 8601 duration format (PT1H2M3S).
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'PT0S';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || duration === 'PT') duration += `${secs}S`;

  return duration;
}

// ============================================================
// BATCH GENERATOR
// ============================================================

interface BlockProgressEntry {
  blockId: string;
  blockType: string;
  blockTitle: string;
  completed: boolean;
  score?: number;
  maxScore?: number;
  responseData?: string;
}

/**
 * Batch generate xAPI statements for a set of block progress entries.
 * Returns an array of statements in chronological order.
 */
export function generateStatementsForBlockProgress(
  actor: XApiActor,
  courseId: number | string,
  courseTitle: string,
  blocks: BlockProgressEntry[],
  language: string = 'en-US',
): XApiStatement[] {
  const statements: XApiStatement[] = [];

  for (const block of blocks) {
    // If there's response data, emit an interaction statement
    if (block.responseData) {
      statements.push(
        createBlockInteractionStatement(
          actor,
          courseId,
          block.blockId,
          block.blockType,
          block.responseData,
        ),
      );
    }

    // If the block is completed, emit a completion statement
    if (block.completed) {
      const stmt = createBlockCompletedStatement(
        actor,
        courseId,
        courseTitle,
        block.blockId,
        block.blockType,
        block.blockTitle,
        block.score,
        block.maxScore,
      );

      // Attach language to context if provided
      if (language && stmt.context) {
        stmt.context.language = language;
      }

      statements.push(stmt);
    }
  }

  // Calculate overall progress
  const completedCount = blocks.filter((b) => b.completed).length;
  const progress = blocks.length > 0 ? completedCount / blocks.length : 0;

  // Calculate average score from scored blocks
  const scoredBlocks = blocks.filter(
    (b) =>
      b.score !== undefined &&
      b.maxScore !== undefined &&
      b.maxScore > 0,
  );
  const avgScore =
    scoredBlocks.length > 0
      ? scoredBlocks.reduce((sum, b) => sum + b.score! / b.maxScore!, 0) /
        scoredBlocks.length
      : undefined;

  // Emit course-level progress / completion
  statements.push(
    createCourseCompletedStatement(
      actor,
      courseId,
      courseTitle,
      progress,
      avgScore,
    ),
  );

  return statements;
}
