// ============================================================================
// Email Template Engine
// ============================================================================
// Replaces {{variable}} placeholders in email templates with actual values.
// ============================================================================

/**
 * Replace all {{variable}} placeholders in a template string.
 */
export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

/**
 * Preview a template with example values from the variable definitions.
 */
export function previewTemplate(
  template: string,
  variableDefs: Array<{ key: string; example: string }>
): string {
  const exampleVars: Record<string, string> = {};
  for (const v of variableDefs) {
    exampleVars[v.key] = v.example;
  }
  return renderTemplate(template, exampleVars);
}
