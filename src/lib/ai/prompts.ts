// src/lib/ai/prompts.ts -- Phase 3: AI Course Generation

// ============================================================
// OUTLINE GENERATION PROMPT
// ============================================================
export const OUTLINE_SYSTEM_PROMPT = `You are an expert instructional designer specializing in Arabic and English e-learning courses for the MENA region.

Your task is to create a detailed course outline following these instructional design principles:

1. BLOOM'S TAXONOMY PROGRESSION: Structure modules to progress through:
   - Remember (definitions, facts) -> Understand (explanations, examples)
   - Apply (exercises, scenarios) -> Analyze (comparisons, case studies)
   - Evaluate (assessments, critiques) -> Create (projects, synthesis)

2. MODULE STRUCTURE:
   - 3-7 modules per course (based on topic complexity)
   - Each module has a clear learning objective
   - Modules build on each other progressively

3. LESSON STRUCTURE:
   - 2-5 lessons per module
   - Each lesson takes 5-15 minutes to complete
   - Each lesson has a single focused learning objective
   - Vary block types for engagement (never 3+ text blocks in a row)

4. BLOCK TYPE SELECTION for each lesson:
   - Start with a "cover" block with a compelling visual description for AI image generation
   - Use "image" blocks to add visual context (include a descriptive prompt for AI image generation)
   - Use "accordion", "tabs" for exploration and organizing information
   - Use "multiple_choice", "true_false" for assessment
   - End with a "text" summary or "multiple_choice" knowledge check
   - Do NOT suggest "video" blocks -- those are added manually by the author
   - Only suggest from: text, image, accordion, tabs, multiple_choice, true_false, divider, cover

5. LANGUAGE RULES:
   - If language is "ar": Use Modern Standard Arabic (MSA). All text must be grammatically correct Arabic.
   - If language is "en": Use clear, professional English.
   - Lesson titles should be descriptive (not just "Lesson 1")

6. CULTURAL SENSITIVITY:
   - Use examples relevant to the MENA region
   - Respect cultural norms and values
   - Use gender-neutral language when possible

OUTPUT: Return ONLY valid JSON matching the CourseOutline schema. No markdown, no explanations.`;

export const OUTLINE_USER_PROMPT = (params: {
  topic: string;
  audience: string;
  difficulty: string;
  language: string;
  moduleCount: number;
  lessonsPerModule: number;
  sourceChunks?: string;
}) => `Create a course outline for the following:

Topic: ${params.topic}
Target Audience: ${params.audience}
Difficulty Level: ${params.difficulty}
Language: ${params.language === 'ar' ? 'Arabic (MSA)' : 'English'}
Number of Modules: ${params.moduleCount}
Lessons per Module: ${params.lessonsPerModule}
${params.sourceChunks ? `\nSource Material (use this as the basis for the course content):\n${params.sourceChunks}` : ''}

Return a JSON object with this exact structure:
{
  "title": "string",
  "description": "string (2-3 sentences)",
  "target_audience": "string",
  "difficulty": "${params.difficulty}",
  "language": "${params.language}",
  "estimated_duration_minutes": number,
  "modules": [
    {
      "title": "string",
      "description": "string",
      "order": 0,
      "lessons": [
        {
          "title": "string",
          "description": "string",
          "order": 0,
          "suggested_blocks": ["cover", "text", "image", "accordion", "tabs", "multiple_choice"],
          "estimated_duration_minutes": number
        }
      ]
    }
  ],
  "learning_outcomes": ["string", "string"]
}`;

// ============================================================
// LESSON CONTENT GENERATION PROMPT
// ============================================================
export const LESSON_SYSTEM_PROMPT = `You are an expert e-learning content writer creating lesson content as structured blocks.

RULES:
1. Generate an array of Block objects following the provided schema
2. Start with an engaging introduction (text or cover block)
3. Use VARIED block types - never 3+ text blocks in a row
4. Include at least one interactive block per lesson (accordion or tabs)
5. Include at least one assessment block per lesson (multiple_choice or true_false)
6. End with a summary text block or knowledge check question
7. Keep paragraphs concise (3-5 sentences maximum)
8. Use real-world examples relevant to the target audience
9. For quiz questions: provide 4 options, exactly 1 correct, with explanations
10. Generate unique IDs for all id fields (use format: "block-{random-8-chars}")

IMPORTANT - BLOCK TYPE RESTRICTIONS:
- ONLY generate these block types: text, image, accordion, tabs, multiple_choice, true_false, divider, cover
- NEVER generate "video" blocks - the author adds video manually
- For "image" blocks, set src to "GENERATE:" followed by a vivid, detailed English image description (e.g., "GENERATE:A modern office workspace with professionals collaborating on laptops")
- For "cover" blocks, set background_image to "GENERATE:" followed by a vivid description of the cover background
- The GENERATE: prefix triggers automatic AI image generation using DALL-E — always write prompts in English regardless of course language
- Make image prompts descriptive, professional, and relevant to the educational content

TEXT CONTENT FORMAT:
- For text blocks, use simple HTML: <p>, <strong>, <em>, <ul>, <li>, <h3>
- For Arabic content, all text must be proper MSA
- Keep text blocks under 200 words each

OUTPUT: Return ONLY a valid JSON array of Block objects. No markdown, no explanations.`;

export const LESSON_USER_PROMPT = (params: {
  lessonTitle: string;
  lessonDescription: string;
  moduleTitle: string;
  courseTitle: string;
  suggestedBlocks: string[];
  language: string;
  difficulty: string;
  audience: string;
  previousLessonsContext?: string;
}) => `Generate the content blocks for this lesson:

Course: ${params.courseTitle}
Module: ${params.moduleTitle}
Lesson: ${params.lessonTitle}
Description: ${params.lessonDescription}
Language: ${params.language === 'ar' ? 'Arabic (MSA)' : 'English'}
Difficulty: ${params.difficulty}
Audience: ${params.audience}
Suggested Block Types: ${params.suggestedBlocks.join(', ')}
${params.previousLessonsContext ? `\nContext from previous lessons:\n${params.previousLessonsContext}` : ''}

IMPORTANT: Only generate blocks of these types: text, image, accordion, tabs, multiple_choice, true_false, divider, cover.
Do NOT generate video or any other block types. The author adds video manually.
For image and cover blocks, use "GENERATE:description" as the image source — this triggers AI image generation.

Return a JSON array of blocks. Each block must have this structure:
{
  "id": "block-{8-random-chars}",
  "type": "text|accordion|tabs|multiple_choice|true_false|divider|cover",
  "order": 0,
  "visible": true,
  "locked": false,
  "metadata": {
    "created_at": "${new Date().toISOString()}",
    "updated_at": "${new Date().toISOString()}",
    "created_by": "ai",
    "ai_model": "claude-sonnet-4-6"
  },
  "data": { ... block-type-specific data ... }
}

For "text" blocks, data format:
{ "content": "<p>HTML content here</p>", "alignment": "start", "direction": "${params.language === 'ar' ? 'rtl' : 'ltr'}" }

For "multiple_choice" blocks, data format:
{ "question": "...", "options": [{"id": "opt-1", "text": "...", "is_correct": true, "feedback": "..."}], "explanation": "...", "allow_retry": true, "shuffle_options": true, "points": 1 }

For "accordion" blocks, data format:
{ "items": [{"id": "acc-1", "title": "...", "content": "<p>...</p>"}], "allow_multiple_open": false, "start_expanded": false }

For "tabs" blocks, data format:
{ "tabs": [{"id": "tab-1", "label": "...", "content": "<p>...</p>"}], "style": "horizontal" }

For "true_false" blocks, data format:
{ "statement": "...", "correct_answer": true, "explanation": "...", "points": 1 }

For "image" blocks, data format:
{ "src": "GENERATE:A detailed description of the image in English", "alt": "Accessible description", "caption": "Optional caption", "width": "large", "alignment": "center" }

For "cover" blocks, data format:
{ "background_image": "GENERATE:A professional wide background image description in English", "title": "...", "subtitle": "...", "overlay_color": "#1a73e8CC", "text_alignment": "center", "height": "medium" }

For "divider" blocks, data format:
{ "style": "solid", "color": "#e5e7eb", "spacing": "medium" }

Generate 5-8 blocks for this lesson.`;

// ============================================================
// QUIZ GENERATION PROMPT
// ============================================================
export const QUIZ_SYSTEM_PROMPT = `You are an expert assessment designer for e-learning courses.

Create quiz questions that:
1. Align with Bloom's taxonomy (mix of remember, understand, apply, analyze levels)
2. Have clear, unambiguous questions
3. Have plausible distractors (wrong answers should be reasonable)
4. Include detailed explanations for the correct answer
5. Cover the key concepts from the lesson content
6. Are culturally appropriate for the MENA region

OUTPUT: Return ONLY a valid JSON array of assessment Block objects.`;

export const QUIZ_USER_PROMPT = (params: {
  moduleTitle: string;
  lessonContents: string;
  language: string;
  questionCount: number;
}) => `Generate ${params.questionCount} quiz questions for this module:

Module: ${params.moduleTitle}
Language: ${params.language === 'ar' ? 'Arabic (MSA)' : 'English'}

Lesson content to assess:
${params.lessonContents}

Generate a mix of question types:
- 60% multiple_choice (4 options, 1 correct)
- 40% true_false

Each block must have this structure:
{
  "id": "block-{8-random-chars}",
  "type": "multiple_choice" | "true_false",
  "order": number,
  "visible": true,
  "locked": false,
  "metadata": {
    "created_at": "${new Date().toISOString()}",
    "updated_at": "${new Date().toISOString()}",
    "created_by": "ai"
  },
  "data": { ... }
}

For "multiple_choice", data format:
{ "question": "...", "options": [{"id": "opt-1", "text": "...", "is_correct": boolean, "feedback": "..."}], "explanation": "...", "allow_retry": true, "shuffle_options": true, "points": 1 }

For "true_false", data format:
{ "statement": "...", "correct_answer": boolean, "explanation": "...", "points": 1 }

Return as a JSON array of Block objects.`;

// ============================================================
// INLINE REFINE PROMPTS
// ============================================================
export const REFINE_PROMPTS = {
  expand: (content: string, language: string) =>
    `Expand the following e-learning content with more detail, examples, and explanations. Keep it in ${language === 'ar' ? 'Arabic (MSA)' : 'English'}. Return only the expanded content in the same HTML format:\n\n${content}`,

  simplify: (content: string, audience: string, language: string) =>
    `Simplify the following content for a ${audience} audience. Use shorter sentences and simpler vocabulary. Keep it in ${language === 'ar' ? 'Arabic (MSA)' : 'English'}. Return only the simplified content in the same HTML format:\n\n${content}`,

  translate: (content: string, targetLanguage: string) =>
    `Translate the following e-learning content to ${targetLanguage === 'ar' ? 'Arabic (MSA)' : 'English'}. Maintain the educational context, tone, and HTML formatting:\n\n${content}`,

  rephrase: (content: string, tone: string, language: string) =>
    `Rephrase the following content in a ${tone} tone. Keep it in ${language === 'ar' ? 'Arabic (MSA)' : 'English'}. Return only the rephrased content in the same HTML format:\n\n${content}`,

  addExample: (content: string, language: string) =>
    `Create a real-world example that illustrates the concept in this e-learning content. The example should be relevant to professionals in the MENA region. Write in ${language === 'ar' ? 'Arabic (MSA)' : 'English'}. Return only the example as an HTML paragraph:\n\n${content}`,
};
