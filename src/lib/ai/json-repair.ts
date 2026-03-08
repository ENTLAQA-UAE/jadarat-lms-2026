/**
 * Attempts to repair malformed JSON strings commonly returned by LLMs.
 *
 * Handles:
 * - Markdown code fences (```json ... ```)
 * - Trailing commas before } or ]
 * - Unclosed brackets / braces at the end
 */
export function repairJSON(raw: string): string {
  let text = raw.trim();

  // 1. Strip markdown code fences
  // Handle ```json or ``` at the start
  text = text.replace(/^```(?:json)?\s*\n?/, '');
  // Handle ``` at the end
  text = text.replace(/\n?\s*```\s*$/, '');

  text = text.trim();

  // 2. Strip trailing commas before } or ]
  // Matches comma followed by optional whitespace then } or ]
  text = text.replace(/,\s*([}\]])/g, '$1');

  // 3. Fix unclosed brackets/braces at the end
  // Count open vs close for braces and brackets
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }

  // Append missing closing characters
  while (brackets > 0) {
    text += ']';
    brackets--;
  }
  while (braces > 0) {
    text += '}';
    braces--;
  }

  return text;
}
