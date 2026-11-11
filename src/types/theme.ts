// SCHLAR Design System - Authoritative Theme Tokens and 12 Palettes

export interface ThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  // Derived / Semantic helpers
  primaryHover: string;
  primaryLight: string;
  secondaryHover: string;
  secondaryLight: string;
  accentLight: string;
  text: string;
  textMuted: string;
  border: string;
  surfaceMuted: string;
}

export type ThemePaletteId =
  | 'palette-1'
  | 'palette-2'
  | 'palette-3'
  | 'palette-4'
  | 'palette-5'
  | 'palette-6'
  | 'palette-7' // DEFAULT: Petrol & Copper
  | 'palette-8'
  | 'palette-9'
  | 'palette-10'
  | 'palette-11'
  | 'palette-12'
  | string; // For saved custom themes

export interface ThemeConfig {
  id: string;
  paletteNumber?: number;
  name: string;
  isDefault?: boolean;
  isCustom?: boolean;
  core: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  tokens: ThemeTokens;
}

// Helper: Convert hex to rgba string
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper: Lighten or darken hex color
export function adjustHexBrightness(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Generate derived tokens from the 5 core hex colors
export function buildTokensFromCore(core: {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}): ThemeTokens {
  return {
    primary: core.primary,
    secondary: core.secondary,
    accent: core.accent,
    background: core.background,
    surface: core.surface,
    primaryHover: adjustHexBrightness(core.primary, -8),
    primaryLight: hexToRgba(core.primary, 0.08),
    secondaryHover: adjustHexBrightness(core.secondary, -8),
    secondaryLight: hexToRgba(core.secondary, 0.1),
    accentLight: hexToRgba(core.accent, 0.12),
    text: '#192024',
    textMuted: '#5c6670',
    border: hexToRgba(core.primary, 0.14),
    surfaceMuted: adjustHexBrightness(core.background, 1.5),
  };
}

// THE AUTHORITATIVE 12 SCHLAR COLOR PALETTES
export const SCHLAR_PALETTES: Record<string, ThemeConfig> = {
  'palette-1': {
    id: 'palette-1',
    paletteNumber: 1,
    name: 'Navy & Teal',
    core: {
      primary: '#17324D',
      secondary: '#2A7886',
      accent: '#E0A458',
      background: '#F2F5F8',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#17324D',
      secondary: '#2A7886',
      accent: '#E0A458',
      background: '#F2F5F8',
      surface: '#FFFFFF',
    }),
  },
  'palette-2': {
    id: 'palette-2',
    paletteNumber: 2,
    name: 'Forest & Champagne',
    core: {
      primary: '#245747',
      secondary: '#54866A',
      accent: '#D6B878',
      background: '#F3F4EC',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#245747',
      secondary: '#54866A',
      accent: '#D6B878',
      background: '#F3F4EC',
      surface: '#FFFFFF',
    }),
  },
  'palette-3': {
    id: 'palette-3',
    paletteNumber: 3,
    name: 'Oxblood & Blush',
    core: {
      primary: '#702D3A',
      secondary: '#A65C69',
      accent: '#D9A3A7',
      background: '#F8F0F0',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#702D3A',
      secondary: '#A65C69',
      accent: '#D9A3A7',
      background: '#F8F0F0',
      surface: '#FFFFFF',
    }),
  },
  'palette-4': {
    id: 'palette-4',
    paletteNumber: 4,
    name: 'Cobalt & Electric Lime',
    core: {
      primary: '#2448A5',
      secondary: '#3C70D6',
      accent: '#C4E83A',
      background: '#F2F5FC',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#2448A5',
      secondary: '#3C70D6',
      accent: '#C4E83A',
      background: '#F2F5FC',
      surface: '#FFFFFF',
    }),
  },
  'palette-5': {
    id: 'palette-5',
    paletteNumber: 5,
    name: 'Terracotta & Sage',
    core: {
      primary: '#A34F38',
      secondary: '#71866B',
      accent: '#D9A66F',
      background: '#F7F1E9',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#A34F38',
      secondary: '#71866B',
      accent: '#D9A66F',
      background: '#F7F1E9',
      surface: '#FFFFFF',
    }),
  },
  'palette-6': {
    id: 'palette-6',
    paletteNumber: 6,
    name: 'Graphite & Ice Lavender',
    core: {
      primary: '#343640',
      secondary: '#666A7D',
      accent: '#B8B5E8',
      background: '#F3F3F8',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#343640',
      secondary: '#666A7D',
      accent: '#B8B5E8',
      background: '#F3F3F8',
      surface: '#FFFFFF',
    }),
  },
  'palette-7': {
    id: 'palette-7',
    paletteNumber: 7,
    name: 'Petrol & Copper',
    isDefault: true,
    core: {
      primary: '#164E55',
      secondary: '#287B7A',
      accent: '#C47D54',
      background: '#F5F0E7',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#164E55',
      secondary: '#287B7A',
      accent: '#C47D54',
      background: '#F5F0E7',
      surface: '#FFFFFF',
    }),
  },
  'palette-8': {
    id: 'palette-8',
    paletteNumber: 8,
    name: 'Indigo & Marigold',
    core: {
      primary: '#373B83',
      secondary: '#6266B5',
      accent: '#E9B949',
      background: '#F4F3FA',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#373B83',
      secondary: '#6266B5',
      accent: '#E9B949',
      background: '#F4F3FA',
      surface: '#FFFFFF',
    }),
  },
  'palette-9': {
    id: 'palette-9',
    paletteNumber: 9,
    name: 'Royal Purple & Gold',
    core: {
      primary: '#512B81',
      secondary: '#8056A8',
      accent: '#D8B45A',
      background: '#F6F1FA',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#512B81',
      secondary: '#8056A8',
      accent: '#D8B45A',
      background: '#F6F1FA',
      surface: '#FFFFFF',
    }),
  },
  'palette-10': {
    id: 'palette-10',
    paletteNumber: 10,
    name: 'Emerald & Coral',
    core: {
      primary: '#146B58',
      secondary: '#329780',
      accent: '#EF806F',
      background: '#EFF6F2',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#146B58',
      secondary: '#329780',
      accent: '#EF806F',
      background: '#EFF6F2',
      surface: '#FFFFFF',
    }),
  },
  'palette-11': {
    id: 'palette-11',
    paletteNumber: 11,
    name: 'Black & Gold',
    core: {
      primary: '#242424',
      secondary: '#454545',
      accent: '#C9A44C',
      background: '#F4F2EC',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#242424',
      secondary: '#454545',
      accent: '#C9A44C',
      background: '#F4F2EC',
      surface: '#FFFFFF',
    }),
  },
  'palette-12': {
    id: 'palette-12',
    paletteNumber: 12,
    name: 'Sky & Midnight',
    core: {
      primary: '#17365D',
      secondary: '#3985B8',
      accent: '#F0B44D',
      background: '#EFF5FA',
      surface: '#FFFFFF',
    },
    tokens: buildTokensFromCore({
      primary: '#17365D',
      secondary: '#3985B8',
      accent: '#F0B44D',
      background: '#EFF5FA',
      surface: '#FFFFFF',
    }),
  },
};

export const DEFAULT_THEME_ID = 'palette-7';
export const DEFAULT_THEME = SCHLAR_PALETTES['palette-7'];

// Validation for hex color: must match #RGB or #RRGGBB
export function isValidHexColor(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

// Validate theme export/import schema strictly (no eval, no prototype pollution)
export function validateImportedTheme(raw: any): { valid: boolean; theme?: ThemeConfig; error?: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'Theme configuration must be a JSON object.' };
  }

  const name = typeof raw.name === 'string' && raw.name.trim().length > 0 ? raw.name.trim() : 'Custom Theme';
  const core = raw.core || raw;

  if (!core || typeof core !== 'object') {
    return { valid: false, error: 'Missing core color configuration.' };
  }

  const requiredKeys = ['primary', 'secondary', 'accent', 'background', 'surface'] as const;
  for (const key of requiredKeys) {
    if (!core[key] || typeof core[key] !== 'string' || !isValidHexColor(core[key])) {
      return {
        valid: false,
        error: `Field "${key}" must be a valid hex color code (e.g., #164E55). Got: ${String(core[key])}`,
      };
    }
  }

  const safeCore = {
    primary: core.primary.trim().toUpperCase(),
    secondary: core.secondary.trim().toUpperCase(),
    accent: core.accent.trim().toUpperCase(),
    background: core.background.trim().toUpperCase(),
    surface: core.surface.trim().toUpperCase(),
  };

  const id = `custom-${Date.now()}`;
  const theme: ThemeConfig = {
    id,
    name: name.slice(0, 40),
    isCustom: true,
    core: safeCore,
    tokens: buildTokensFromCore(safeCore),
  };

  return { valid: true, theme };
}
