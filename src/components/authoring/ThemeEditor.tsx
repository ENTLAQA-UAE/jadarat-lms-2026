'use client';

import { useCallback } from 'react';
import { Palette } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEditorStore } from '@/stores/editor.store';
import type { CourseTheme } from '@/types/authoring';
import { cn } from '@/lib/utils';

// ============================================================
// CONSTANTS
// ============================================================

const FONT_OPTIONS: { value: CourseTheme['font_family']; label: string }[] = [
  { value: 'cairo', label: 'Cairo' },
  { value: 'inter', label: 'Inter' },
  { value: 'tajawal', label: 'Tajawal' },
  { value: 'system', label: 'System' },
];

const BORDER_RADIUS_OPTIONS: { value: CourseTheme['border_radius']; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const COVER_STYLE_OPTIONS: { value: CourseTheme['cover_style']; label: string }[] = [
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image' },
  { value: 'solid', label: 'Solid' },
];

const BORDER_RADIUS_VALUES: Record<CourseTheme['border_radius'], string> = {
  none: '0px',
  small: '4px',
  medium: '8px',
  large: '16px',
};

const FONT_FAMILY_VALUES: Record<string, string> = {
  cairo: '"Cairo", sans-serif',
  inter: '"Inter", sans-serif',
  tajawal: '"Tajawal", sans-serif',
  system: 'system-ui, -apple-system, sans-serif',
};

// ============================================================
// COLOR PICKER ROW
// ============================================================

interface ColorPickerRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPickerRow({ label, value, onChange }: ColorPickerRowProps) {
  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let hex = e.target.value;
      // Allow user to type freely; only update store when valid
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        onChange(hex);
      } else if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        onChange(`#${hex}`);
      }
    },
    [onChange],
  );

  return (
    <div className="flex items-center gap-3">
      <Label className="w-32 shrink-0 text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
          title={`Pick ${label.toLowerCase()}`}
        />
      </div>
      <Input
        type="text"
        value={value}
        onChange={handleHexInputChange}
        className="h-8 w-28 font-mono text-xs"
        maxLength={7}
        placeholder="#000000"
      />
    </div>
  );
}

// ============================================================
// THEME EDITOR COMPONENT
// ============================================================

export function ThemeEditor() {
  const theme = useEditorStore((s) => s.content.settings.theme);
  const updateTheme = useEditorStore((s) => s.updateTheme);

  const handleColorChange = useCallback(
    (field: keyof Pick<CourseTheme, 'primary_color' | 'secondary_color' | 'background_color' | 'text_color'>) =>
      (value: string) => {
        updateTheme({ [field]: value });
      },
    [updateTheme],
  );

  const handleFontChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateTheme({ font_family: e.target.value });
    },
    [updateTheme],
  );

  const handleBorderRadiusChange = useCallback(
    (value: CourseTheme['border_radius']) => {
      updateTheme({ border_radius: value });
    },
    [updateTheme],
  );

  const handleCoverStyleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateTheme({ cover_style: e.target.value as CourseTheme['cover_style'] });
    },
    [updateTheme],
  );

  const resolvedRadius = BORDER_RADIUS_VALUES[theme.border_radius];
  const resolvedFont = FONT_FAMILY_VALUES[theme.font_family] || FONT_FAMILY_VALUES.system;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">
          Theme Settings
        </h2>
      </div>

      {/* -------------------------------------------------------- */}
      {/* Colors Section                                           */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ColorPickerRow
            label="Primary Color"
            value={theme.primary_color}
            onChange={handleColorChange('primary_color')}
          />
          <ColorPickerRow
            label="Secondary Color"
            value={theme.secondary_color}
            onChange={handleColorChange('secondary_color')}
          />
          <ColorPickerRow
            label="Background"
            value={theme.background_color}
            onChange={handleColorChange('background_color')}
          />
          <ColorPickerRow
            label="Text Color"
            value={theme.text_color}
            onChange={handleColorChange('text_color')}
          />
        </CardContent>
      </Card>

      {/* -------------------------------------------------------- */}
      {/* Typography Section                                       */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Label className="w-32 shrink-0 text-xs text-muted-foreground">
              Font Family
            </Label>
            <select
              value={theme.font_family}
              onChange={handleFontChange}
              className="h-8 flex-1 rounded-lg border border-border bg-background px-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font preview */}
          <div
            className="rounded-lg border border-border bg-muted/30 px-4 py-3"
            style={{ fontFamily: resolvedFont }}
          >
            <p className="text-sm text-foreground">
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="mt-1 text-sm text-foreground" dir="rtl">
              هذا نص تجريبي لمعاينة الخط المختار
            </p>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------- */}
      {/* Border Radius Section                                    */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Border Radius</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-1.5">
            {BORDER_RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleBorderRadiusChange(opt.value)}
                className={cn(
                  'flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  theme.border_radius === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Border radius preview */}
          <div className="flex items-center gap-3">
            <div
              className="h-16 w-16 border-2 border-border bg-muted/50"
              style={{ borderRadius: resolvedRadius }}
            />
            <span className="text-xs text-muted-foreground">
              {resolvedRadius}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------- */}
      {/* Cover Style Section                                      */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cover Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Label className="w-32 shrink-0 text-xs text-muted-foreground">
              Style
            </Label>
            <select
              value={theme.cover_style}
              onChange={handleCoverStyleChange}
              className="h-8 flex-1 rounded-lg border border-border bg-background px-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              {COVER_STYLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------- */}
      {/* Live Preview Section                                     */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="overflow-hidden border border-border"
            style={{
              backgroundColor: theme.background_color,
              borderRadius: resolvedRadius,
              fontFamily: resolvedFont,
            }}
          >
            {/* Preview header */}
            <div
              className="px-4 py-3"
              style={{
                background:
                  theme.cover_style === 'gradient'
                    ? `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})`
                    : theme.cover_style === 'solid'
                      ? theme.primary_color
                      : undefined,
                backgroundImage:
                  theme.cover_style === 'image'
                    ? `linear-gradient(135deg, ${theme.primary_color}CC, ${theme.secondary_color}CC)`
                    : undefined,
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: '#ffffff' }}
              >
                Course Title
              </p>
              <p
                className="mt-0.5 text-xs"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                Module 1 - Lesson 1
              </p>
            </div>

            {/* Preview body */}
            <div className="space-y-3 px-4 py-4">
              <p
                className="text-sm font-medium"
                style={{ color: theme.text_color }}
              >
                Sample Heading
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: theme.text_color, opacity: 0.7 }}
              >
                This is a preview of how your course content will look with
                the selected theme settings.
              </p>

              {/* Preview buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: theme.primary_color,
                    borderRadius: resolvedRadius,
                  }}
                >
                  Primary Button
                </button>
                <button
                  type="button"
                  className="border px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
                  style={{
                    borderColor: theme.secondary_color,
                    color: theme.secondary_color,
                    borderRadius: resolvedRadius,
                  }}
                >
                  Secondary
                </button>
              </div>

              {/* Preview card */}
              <div
                className="border p-3"
                style={{
                  borderColor: `${theme.primary_color}33`,
                  backgroundColor: `${theme.primary_color}08`,
                  borderRadius: resolvedRadius,
                }}
              >
                <p
                  className="text-xs font-medium"
                  style={{ color: theme.primary_color }}
                >
                  Info Card
                </p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: theme.text_color, opacity: 0.6 }}
                >
                  Content blocks will inherit your theme colors and border
                  radius settings.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
