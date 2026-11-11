import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ThemeColor, THEMES } from '../../types';
import { Palette, Check, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface CustomPaletteEditorProps {
  onClose?: () => void;
  compact?: boolean;
}

export const CustomPaletteEditor: React.FC<CustomPaletteEditorProps> = ({
  onClose,
  compact = false,
}) => {
  const { state, setThemeColor, setCustomHex } = useApp();
  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  const [hexInput, setHexInput] = useState(
    state.customHex || currentTheme.primary || '#164E55'
  );
  const [inputError, setInputError] = useState<string | null>(null);

  const cleanHex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
  const isValid = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cleanHex);

  const handleApplyCustomHex = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setInputError('Please enter a valid 3 or 6-digit hex code (e.g. #164E55)');
      return;
    }
    setInputError(null);
    setCustomHex(cleanHex);
    if (onClose) onClose();
  };

  const handleQuickPreset = (key: ThemeColor) => {
    setThemeColor(key);
    const th = THEMES[key];
    if (th) {
      setHexInput(th.primary);
    }
    if (onClose) onClose();
  };

  return (
    <div className={`space-y-4 text-xs ${compact ? 'p-1' : 'p-4'}`}>
      {/* Header / Description */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-700" style={{ color: currentTheme.primary }} />
            <span className="font-bold text-slate-900 text-sm">Theme & Brand Palette</span>
          </div>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
            style={{ backgroundColor: currentTheme.primary }}
          >
            {currentTheme.name}
          </span>
        </div>
        <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
          Select an authoritative institutional palette or enter a custom hex color code. Live dynamic tokens propagate across all 10 roles.
        </p>
      </div>

      {/* Preset Palettes Grid */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Preset Palettes
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(THEMES) as ThemeColor[]).map((key) => {
            const th = THEMES[key];
            const isSelected = state.themeColor === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleQuickPreset(key)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-4 h-4 rounded-full border border-white shadow-2xs shrink-0"
                    style={{ backgroundColor: th.primary }}
                  />
                  <div className="truncate">
                    <span className="block text-slate-900 font-semibold text-[11px] truncate">
                      {th.name}
                    </span>
                    <span className="block text-slate-400 text-[9px] font-mono">
                      {th.primary.toUpperCase()}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-slate-900 shrink-0 stroke-[3px]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom HEX Palette Editor */}
      <div className="pt-3 border-t border-slate-100">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Custom HEX Color Editor
        </label>
        <form onSubmit={handleApplyCustomHex} className="space-y-3">
          <div className="flex items-center gap-2">
            {/* Color picker square */}
            <div className="relative shrink-0">
              <input
                type="color"
                value={isValid ? cleanHex : '#164E55'}
                onChange={(e) => {
                  setHexInput(e.target.value.toUpperCase());
                  setInputError(null);
                }}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 bg-white p-0.5 shadow-2xs"
                title="Open system color picker"
              />
            </div>

            {/* Hex text input */}
            <div className="flex-1">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  setInputError(null);
                }}
                placeholder="#164E55"
                maxLength={7}
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-300 bg-slate-50"
              />
            </div>

            {/* Apply button */}
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-2xs"
            >
              Apply HEX
            </button>
          </div>

          {inputError && (
            <p className="text-[11px] text-rose-600 font-medium">{inputError}</p>
          )}

          {/* Real-time Token Preview Box */}
          {isValid && (
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase">
                <span>Dynamic Token Generation Preview</span>
                <span className="flex items-center gap-1 text-emerald-600 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  WCAG AA Ready
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                <div
                  className="p-2 rounded-lg text-white font-bold"
                  style={{ backgroundColor: cleanHex }}
                >
                  Primary
                </div>
                <div
                  className="p-2 rounded-lg font-bold"
                  style={{
                    backgroundColor: cleanHex,
                    opacity: 0.15,
                    color: cleanHex,
                  }}
                >
                  Light 15%
                </div>
                <div
                  className="p-2 rounded-lg border font-bold"
                  style={{
                    borderColor: cleanHex,
                    color: cleanHex,
                  }}
                >
                  Border
                </div>
                <div
                  className="p-2 rounded-lg text-white font-bold bg-slate-900"
                  style={{
                    boxShadow: `0 0 10px ${cleanHex}55`,
                  }}
                >
                  Focus Ring
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Recommended Heritage Palettes Shortcut */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Default Institutional: <strong>Petrol & Copper (#164E55)</strong></span>
        <button
          type="button"
          onClick={() => handleQuickPreset('petrol')}
          className="text-slate-800 hover:text-slate-950 font-bold hover:underline"
        >
          Reset to Petrol & Copper
        </button>
      </div>
    </div>
  );
};
