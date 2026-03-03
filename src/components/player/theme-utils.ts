import type { CourseTheme } from '@/types/authoring';

export const FONT_FAMILY_VALUES: Record<string, string> = {
  cairo: '"Cairo", sans-serif',
  inter: '"Inter", sans-serif',
  tajawal: '"Tajawal", sans-serif',
  system: 'system-ui, -apple-system, sans-serif',
};

export const BORDER_RADIUS_VALUES: Record<CourseTheme['border_radius'], string> = {
  none: '0px',
  small: '4px',
  medium: '8px',
  large: '16px',
};

export function resolveFont(theme: CourseTheme): string {
  return FONT_FAMILY_VALUES[theme.font_family] || FONT_FAMILY_VALUES.system;
}

export function resolveRadius(theme: CourseTheme): string {
  return BORDER_RADIUS_VALUES[theme.border_radius];
}

/**
 * Returns CSS custom properties to inject on the player root element.
 * All player components reference these variables instead of hardcoded colors.
 */
export function getThemeCSSVars(theme: CourseTheme): React.CSSProperties {
  const isDark = theme.dark_mode;
  return {
    '--player-primary': theme.primary_color,
    '--player-secondary': theme.secondary_color,
    '--player-bg': isDark ? '#1a1a2e' : theme.background_color,
    '--player-text': isDark ? '#e2e8f0' : theme.text_color,
    '--player-font': resolveFont(theme),
    '--player-radius': resolveRadius(theme),
  } as React.CSSProperties;
}
