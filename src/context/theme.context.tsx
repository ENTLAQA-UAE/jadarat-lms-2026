"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { organizationStateType } from "@/redux/organization.slice";

/**
 * Convert a hex color (#rrggbb) to HSL string "H S% L%".
 * Used to inject tenant branding as CSS variable overrides.
 */
function hexToHSL(hex: string): string | null {
  if (!hex || !hex.startsWith("#")) return null;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Generate a full primary shade scale from a single hex color.
 * Preserves the actual lightness of the input color as the base (500),
 * then derives lighter (50-400) and darker (600-900) shades proportionally.
 */
function generatePrimaryScale(hex: string): Record<string, string> | null {
  const hsl = hexToHSL(hex);
  if (!hsl) return null;

  const match = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!match) return null;

  const h = parseInt(match[1]);
  const s = parseInt(match[2]);
  const l = parseInt(match[3]);

  return {
    "--primary": `${h} ${s}% ${l}%`,
    "--primary-foreground": "0 0% 100%",
    "--primary-50": `${h} ${Math.min(s + 5, 100)}% 97%`,
    "--primary-100": `${h} ${s}% 93%`,
    "--primary-200": `${h} ${Math.max(s - 3, 0)}% 84%`,
    "--primary-300": `${h} ${Math.max(s - 5, 0)}% 72%`,
    "--primary-400": `${h} ${s}% ${Math.min(Math.round(l * 1.35), 62)}%`,
    "--primary-500": `${h} ${s}% ${l}%`,
    "--primary-600": `${h} ${Math.min(s + 2, 100)}% ${Math.max(Math.round(l * 0.84), 15)}%`,
    "--primary-700": `${h} ${s}% ${Math.max(Math.round(l * 0.68), 10)}%`,
    "--primary-800": `${h} ${Math.max(s - 3, 0)}% ${Math.max(Math.round(l * 0.54), 8)}%`,
    "--primary-900": `${h} ${Math.max(s - 8, 0)}% ${Math.max(Math.round(l * 0.38), 5)}%`,
    // Related tokens
    "--ring": `${h} ${s}% ${l}%`,
    "--sidebar-accent": `${h} ${s}% ${l}%`,
    "--sidebar-accent-foreground": "0 0% 100%",
    "--chart-1": `${h} ${s}% ${l}%`,
  };
}

/**
 * TenantBranding: reads org colors from Redux and overrides CSS variables.
 * Must be rendered inside Redux Provider.
 */
function TenantBranding() {
  const primaryColor = useSelector(
    (state: { organization: organizationStateType }) =>
      state.organization.settings.primaryColor
  );
  const secondaryColor = useSelector(
    (state: { organization: organizationStateType }) =>
      state.organization.settings.secondaryColor
  );

  useEffect(() => {
    const root = document.documentElement;

    // Apply primary color overrides
    if (primaryColor && primaryColor !== "#33658a" && primaryColor !== "#4B83DB") {
      const scale = generatePrimaryScale(primaryColor);
      if (scale) {
        Object.entries(scale).forEach(([prop, val]) => {
          root.style.setProperty(prop, val);
        });
      }
    } else {
      // Reset to default theme (remove inline overrides)
      const propsToReset = [
        "--primary",
        "--primary-foreground",
        "--primary-50",
        "--primary-100",
        "--primary-200",
        "--primary-300",
        "--primary-400",
        "--primary-500",
        "--primary-600",
        "--primary-700",
        "--primary-800",
        "--primary-900",
        "--ring",
        "--sidebar-accent",
        "--sidebar-accent-foreground",
        "--chart-1",
      ];
      propsToReset.forEach((prop) => root.style.removeProperty(prop));
    }

    // Apply accent/secondary color override
    if (secondaryColor) {
      const accentHSL = hexToHSL(secondaryColor);
      if (accentHSL) {
        root.style.setProperty("--accent", accentHSL);
        root.style.setProperty("--accent-foreground", "0 0% 100%");
        root.style.setProperty("--chart-2", accentHSL);
      }
    } else {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-foreground");
      root.style.removeProperty("--chart-2");
    }
  }, [primaryColor, secondaryColor]);

  return null;
}

interface AppThemeProviderProps {
  children: React.ReactNode;
}

/**
 * AppThemeProvider: wraps next-themes for dark mode + tenant branding.
 * Place inside Redux Provider (SetupProvider) so TenantBranding can read store.
 */
export default function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TenantBranding />
      {children}
    </NextThemesProvider>
  );
}
