'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Check,
  Image as ImageIcon,
  Monitor,
  Moon,
  Palette,
  PanelLeft,
  PanelTop,
  Smartphone,
  Sun,
  Tablet,
  Upload,
  X,
  EyeOff,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEditorStore } from '@/stores/editor.store';
import type { CourseTheme } from '@/types/authoring';
import { THEME_PRESETS } from '@/lib/theme-presets';
import { cn } from '@/lib/utils';

// ============================================================
// CONSTANTS
// ============================================================

const FONT_OPTIONS: { value: string; label: string }[] = [
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

const NAV_STYLE_OPTIONS: { value: CourseTheme['navigation_style']; label: string; icon: React.ReactNode }[] = [
  { value: 'sidebar', label: 'Sidebar', icon: <PanelLeft className="h-4 w-4" /> },
  { value: 'top_bar', label: 'Top Bar', icon: <PanelTop className="h-4 w-4" /> },
  { value: 'hidden', label: 'Hidden', icon: <EyeOff className="h-4 w-4" /> },
];

const HEADER_STYLE_OPTIONS: { value: CourseTheme['lesson_header_style']; label: string }[] = [
  { value: 'full_width_banner', label: 'Full-Width Banner' },
  { value: 'compact', label: 'Compact' },
  { value: 'none', label: 'None' },
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

type PreviewViewport = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_WIDTHS: Record<PreviewViewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
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
      const hex = e.target.value;
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

  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>('desktop');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleApplyPreset = useCallback(
    (presetTheme: CourseTheme) => {
      updateTheme(presetTheme);
    },
    [updateTheme],
  );

  const handleCoverImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        updateTheme({ cover_image_url: dataUrl, cover_style: 'image' });
      };
      reader.readAsDataURL(file);
    },
    [updateTheme],
  );

  const handleRemoveCoverImage = useCallback(() => {
    updateTheme({ cover_image_url: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [updateTheme]);

  const isPresetActive = (presetTheme: CourseTheme) => {
    return (
      presetTheme.primary_color === theme.primary_color &&
      presetTheme.secondary_color === theme.secondary_color &&
      presetTheme.font_family === theme.font_family &&
      presetTheme.cover_style === theme.cover_style
    );
  };

  const resolvedRadius = BORDER_RADIUS_VALUES[theme.border_radius];
  const resolvedFont = FONT_FAMILY_VALUES[theme.font_family] || FONT_FAMILY_VALUES.system;
  const previewBg = theme.dark_mode ? '#1a1a2e' : theme.background_color;
  const previewText = theme.dark_mode ? '#e2e8f0' : theme.text_color;

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
      {/* Theme Presets                                             */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Theme Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {THEME_PRESETS.map((preset) => {
              const active = isPresetActive(preset.theme);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.theme)}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all hover:shadow-sm',
                    active
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card hover:border-primary/30',
                  )}
                >
                  {active && (
                    <div className="absolute top-1.5 right-1.5">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  {/* Color swatch row */}
                  <div className="flex items-center gap-1">
                    <div
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ backgroundColor: preset.theme.primary_color }}
                    />
                    <div
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ backgroundColor: preset.theme.secondary_color }}
                    />
                    <div
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ backgroundColor: preset.theme.background_color }}
                    />
                  </div>
                  <span className="text-xs font-medium">{preset.name}</span>
                  <span className="text-[10px] text-muted-foreground" dir="rtl">
                    {preset.nameAr}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
      {/* Cover & Image Section                                    */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cover Style & Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* Cover image upload */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Cover Image</Label>
            {theme.cover_image_url ? (
              <div className="relative">
                <div
                  className="h-32 w-full rounded-lg border border-border bg-cover bg-center"
                  style={{ backgroundImage: `url(${theme.cover_image_url})` }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={handleRemoveCoverImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/50"
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs">Drop an image or click to upload</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverImageUpload}
            />
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------- */}
      {/* Navigation Style                                         */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Navigation Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1.5">
            {NAV_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateTheme({ navigation_style: opt.value })}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors',
                  theme.navigation_style === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------- */}
      {/* Lesson Header Style                                      */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Lesson Header Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1.5">
            {HEADER_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateTheme({ lesson_header_style: opt.value })}
                className={cn(
                  'flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  theme.lesson_header_style === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------- */}
      {/* Dark Mode Toggle                                         */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dark Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme.dark_mode ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
              )}
              <Label className="text-xs text-muted-foreground">
                {theme.dark_mode ? 'Dark mode enabled' : 'Light mode'}
              </Label>
            </div>
            <Switch
              checked={theme.dark_mode}
              onCheckedChange={(checked) => updateTheme({ dark_mode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------- */}
      {/* Live Preview Section                                     */}
      {/* -------------------------------------------------------- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm">Live Preview</CardTitle>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {([
              { key: 'desktop' as PreviewViewport, icon: <Monitor className="h-3.5 w-3.5" /> },
              { key: 'tablet' as PreviewViewport, icon: <Tablet className="h-3.5 w-3.5" /> },
              { key: 'mobile' as PreviewViewport, icon: <Smartphone className="h-3.5 w-3.5" /> },
            ]).map(({ key, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPreviewViewport(key)}
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  previewViewport === key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
              >
                {icon}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div
              className="overflow-hidden border border-border transition-all duration-300"
              style={{
                width: VIEWPORT_WIDTHS[previewViewport],
                maxWidth: '100%',
                backgroundColor: previewBg,
                borderRadius: resolvedRadius,
                fontFamily: resolvedFont,
              }}
            >
              {/* Preview cover/header */}
              <div
                className="relative px-4 py-3"
                style={{
                  background:
                    theme.cover_style === 'gradient'
                      ? `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})`
                      : theme.cover_style === 'solid'
                        ? theme.primary_color
                        : undefined,
                  backgroundImage:
                    theme.cover_style === 'image' && theme.cover_image_url
                      ? `url(${theme.cover_image_url})`
                      : theme.cover_style === 'image'
                        ? `linear-gradient(135deg, ${theme.primary_color}CC, ${theme.secondary_color}CC)`
                        : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {theme.cover_style === 'image' && theme.cover_image_url && (
                  <div className="absolute inset-0 bg-black/40" />
                )}
                <div className="relative z-10">
                  <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                    Course Title
                  </p>
                  {theme.lesson_header_style !== 'none' && (
                    <p className="mt-0.5 text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Module 1 - Lesson 1
                    </p>
                  )}
                </div>
              </div>

              {/* Preview layout with optional sidebar indicator */}
              <div className="flex">
                {theme.navigation_style === 'sidebar' && (
                  <div
                    className="hidden sm:flex w-12 flex-col items-center gap-1 border-r py-3"
                    style={{ borderColor: `${previewText}15` }}
                  >
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-6 rounded-full"
                        style={{
                          backgroundColor: i === 1
                            ? theme.primary_color
                            : `${previewText}20`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Preview body */}
                <div className="flex-1 space-y-3 px-4 py-4">
                  {theme.navigation_style === 'top_bar' && (
                    <div
                      className="flex items-center gap-1 border-b pb-2 mb-2"
                      style={{ borderColor: `${previewText}15` }}
                    >
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 w-8 rounded-full"
                          style={{
                            backgroundColor: i === 1
                              ? theme.primary_color
                              : `${previewText}20`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-sm font-medium" style={{ color: previewText }}>
                    Sample Heading
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: previewText, opacity: 0.7 }}
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
                    <p className="text-xs font-medium" style={{ color: theme.primary_color }}>
                      Info Card
                    </p>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: previewText, opacity: 0.6 }}
                    >
                      Content blocks will inherit your theme colors and border
                      radius settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
