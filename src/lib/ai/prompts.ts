// src/lib/ai/prompts.ts -- Phase 3: AI Course Generation

// ============================================================
// COURSE DETAILS GENERATION PROMPT (Step 2 — from description)
// ============================================================
export const COURSE_DETAILS_SYSTEM_PROMPT = `You are an expert instructional designer specializing in Arabic and English e-learning courses for the MENA region.

Your task is to analyze a course description (and optional source material) and generate comprehensive course details.

RULES:
1. Generate a clear, specific course topic from the description
2. Suggest an appropriate tone based on the subject matter
3. Identify the most likely target audience
4. Write a concise course goal (1-2 sentences)
5. Determine the appropriate difficulty level
6. Suggest a course length based on topic complexity:
   - "micro": Very focused topic, 1 module, < 10 minutes
   - "short": Focused topic, 2 modules, < 1 hour
   - "standard": Moderate topic, 4 modules, 1-3 hours
   - "extended": Comprehensive topic, 6+ modules, 3+ hours
7. Generate 3-6 learning objectives using action verbs (Bloom's Taxonomy)
8. Learning objectives should start with verbs like: Identify, Explain, Apply, Analyze, Evaluate, Create, Develop, Implement, Compare, Design

LANGUAGE RULES:
- If language is "ar": Write ALL content in Modern Standard Arabic (MSA)
- If language is "en": Write in clear, professional English

OUTPUT: Return ONLY valid JSON. No markdown, no explanations.`;

export const COURSE_DETAILS_USER_PROMPT = (params: {
  description: string;
  language: string;
  sourceChunks?: string;
  industry?: string;
}) => `Analyze this course description and generate course details:

Description: ${params.description}
Language: ${params.language === 'ar' ? 'Arabic (MSA)' : 'English'}
${params.industry ? `Industry/Domain: ${params.industry}` : ''}
${params.sourceChunks ? `\nSource Material:\n${params.sourceChunks}` : ''}

Return a JSON object with this exact structure:
{
  "topic": "string (clear, specific course topic)",
  "tone": "string (e.g., Practical, confident, motivating)",
  "audience": "string (specific target audience description)",
  "goals": "string (1-2 sentence course goal)",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "suggested_length": "micro" | "short" | "standard" | "extended",
  "learning_objectives": ["string (action verb + measurable outcome)", ...]
}`;

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
   - Use "flashcard" blocks for vocabulary, concepts, or key term reviews
   - Use "process" blocks for step-by-step procedures or workflows
   - Use "timeline" blocks for historical events or sequential milestones
   - Use "quote" blocks for expert quotes, key insights, or notable statements
   - Use "list" blocks for key takeaways, features, or important points
   - Use "callout" blocks for tips, warnings, important notes, and key definitions
   - Use "statement" blocks for emphasis statements and key takeaways
   - Use "multiple_choice", "true_false" for assessment
   - End with a "text" summary or "multiple_choice" knowledge check
   - Do NOT suggest "video" blocks -- those are added manually by the author
   - Available block types: text, image, accordion, tabs, flashcard, process, timeline, quote, list, callout, statement, multiple_choice, true_false, divider, cover
   - Aim to use 4+ DIFFERENT block types per lesson for maximum engagement variety

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
          "suggested_blocks": ["cover", "text", "image", "accordion", "flashcard", "process", "callout", "statement", "quote", "list", "multiple_choice"],
          "estimated_duration_minutes": number,
          "topics": ["string (key topic 1)", "string (key topic 2)", "string (key topic 3)"]
        }
      ]
    }
  ],
  "learning_outcomes": ["string", "string"]
}`;

// ============================================================
// LESSON CONTENT GENERATION PROMPT
// ============================================================
export const LESSON_SYSTEM_PROMPT = `You are an expert e-learning content writer creating lesson content as structured blocks. You create world-class course content comparable to Articulate Rise 360.

RULES:
1. Generate an array of Block objects following the provided schema
2. Start with an engaging introduction (cover block or statement block)
3. Use HIGHLY VARIED block types — aim for 5+ different block types per lesson. Never 3+ text blocks in a row
4. Include at least one interactive block per lesson (accordion, tabs, flashcard, process, or timeline)
5. Follow the ASSESSMENT INSTRUCTIONS provided in the user prompt regarding quiz blocks
6. End with a summary callout block ("success" variant) or a knowledge check question
7. Keep paragraphs concise (3-5 sentences maximum)
8. Use real-world examples relevant to the target audience
9. For quiz questions: provide 4 options, exactly 1 correct, with detailed feedback for each option
10. Generate unique IDs for all id fields (use format: "block-{random-8-chars}")

BLOCK DIVERSITY GUIDELINES — create engaging lessons by mixing these block types:
- "text" — For narrative content, explanations, and paragraphs
- "cover" — For lesson headers with vivid backgrounds
- "image" — For visual context with AI-generated images
- "statement" — For key takeaways, emphasis statements, and bold highlights
- "callout" — For tips (info), warnings (warning), key definitions (success), and cautions (error)
- "quote" — For expert quotes, famous sayings, or key insights
- "list" — For key points, steps, features, or takeaways
- "accordion" — For organizing detailed information into expandable sections
- "tabs" — For comparing concepts or organizing related topics
- "flashcard" — For vocabulary, key terms, or concept reviews (front/back card format)
- "process" — For step-by-step workflows, procedures, or numbered sequences
- "timeline" — For chronological events, milestones, or historical progression
- "divider" — For visual separation between content sections
- "multiple_choice" / "true_false" — For assessment (when instructed)

BLOCK TYPE RESTRICTIONS:
- NEVER generate "video" blocks — the author adds video manually
- For "image" blocks, set src to "GENERATE:" followed by a vivid, detailed English image description
- For "cover" blocks, set background_image to "GENERATE:" followed by a vivid description
- The GENERATE: prefix triggers automatic AI image generation — always write prompts in English
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
  assessmentDensity: string;
  language: string;
  difficulty: string;
  audience: string;
  previousLessonsContext?: string;
}) => {
  const hasQuizBlocks = params.suggestedBlocks.some(
    (b) => b === 'multiple_choice' || b === 'true_false'
  );

  let assessmentInstruction: string;
  if (params.assessmentDensity === 'per_lesson' && hasQuizBlocks) {
    assessmentInstruction = `ASSESSMENT INSTRUCTIONS: You MUST include at least 2 quiz blocks in this lesson — use a mix of multiple_choice and true_false types. Place them after the teaching content, before the final summary. Each quiz question must have detailed feedback/explanations for all options.`;
  } else if (params.assessmentDensity === 'per_module' && hasQuizBlocks) {
    assessmentInstruction = `ASSESSMENT INSTRUCTIONS: This is the last lesson in the module. You MUST include 3-4 quiz blocks as a module-level knowledge check — use a mix of multiple_choice and true_false types. Place them at the end as a comprehensive assessment. Each question must have detailed feedback.`;
  } else {
    assessmentInstruction = `ASSESSMENT INSTRUCTIONS: Do NOT include any multiple_choice or true_false blocks in this lesson.`;
  }

  return `Generate the content blocks for this lesson:

Course: ${params.courseTitle}
Module: ${params.moduleTitle}
Lesson: ${params.lessonTitle}
Description: ${params.lessonDescription}
Language: ${params.language === 'ar' ? 'Arabic (MSA)' : 'English'}
Difficulty: ${params.difficulty}
Audience: ${params.audience}
Suggested Block Types: ${params.suggestedBlocks.join(', ')}
${params.previousLessonsContext ? `\nContext from previous lessons:\n${params.previousLessonsContext}` : ''}

${assessmentInstruction}

IMPORTANT: Generate DIVERSE block types for an engaging lesson. Aim for 5+ different block types.
Available types: text, image, accordion, tabs, flashcard, process, timeline, quote, list, callout, statement, multiple_choice, true_false, divider, cover.
Do NOT generate video blocks — the author adds video manually.
For image and cover blocks, use "GENERATE:description" as the image source — this triggers AI image generation.

Return a JSON array of blocks. Each block must have this structure:
{
  "id": "block-{8-random-chars}",
  "type": "one of the available types above",
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

BLOCK DATA FORMATS:

For "text" blocks:
{ "content": "<p>HTML content here</p>", "alignment": "start", "direction": "${params.language === 'ar' ? 'rtl' : 'ltr'}" }

For "multiple_choice" blocks:
{ "question": "...", "options": [{"id": "opt-1", "text": "...", "is_correct": true, "feedback": "..."}], "explanation": "...", "allow_retry": true, "shuffle_options": true, "points": 1 }

For "accordion" blocks:
{ "items": [{"id": "acc-1", "title": "...", "content": "<p>...</p>"}], "allow_multiple_open": false, "start_expanded": false }

For "tabs" blocks:
{ "tabs": [{"id": "tab-1", "label": "...", "content": "<p>...</p>"}], "style": "horizontal" }

For "true_false" blocks:
{ "statement": "...", "correct_answer": true, "explanation": "...", "points": 1 }

For "image" blocks:
{ "src": "GENERATE:A detailed description of the image in English", "alt": "Accessible description", "caption": "Optional caption", "width": "large", "alignment": "center" }

For "cover" blocks:
{ "background_image": "GENERATE:A professional wide background image description in English", "title": "...", "subtitle": "...", "overlay_color": "#1a73e8CC", "text_alignment": "center", "height": "medium" }

For "divider" blocks:
{ "style": "solid", "color": "#e5e7eb", "spacing": "medium" }

For "flashcard" blocks:
{ "cards": [{"id": "card-1", "front": "Term or concept", "back": "Definition or explanation", "image_front": "", "image_back": ""}], "shuffle": false }

For "process" blocks:
{ "steps": [{"id": "step-1", "title": "Step 1", "description": "<p>Description</p>", "icon": ""}], "layout": "vertical", "numbered": true }

For "timeline" blocks:
{ "events": [{"id": "evt-1", "title": "Event title", "date": "Date/period", "description": "<p>Description</p>", "image_url": ""}], "layout": "vertical" }

For "quote" blocks:
{ "text": "The quoted text here", "attribution": "Author name", "style": "default" }

For "list" blocks:
{ "items": [{"id": "li-1", "text": "Item text", "icon": ""}], "style": "bullet", "columns": 1 }

For "callout" blocks:
{ "variant": "info|warning|success|error", "title": "Callout title", "content": "<p>Callout body</p>", "collapsible": false }

For "statement" blocks:
{ "text": "A bold, impactful statement for emphasis", "style": "bold|bordered|background|note", "alignment": "center" }

Generate 7-12 blocks for this lesson. Use at least 5 DIFFERENT block types for maximum engagement.`;
};

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
- 50% multiple_choice (4 options, 1 correct)
- 30% true_false
- 20% fill_in_blank (if total >= 5 questions)

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
