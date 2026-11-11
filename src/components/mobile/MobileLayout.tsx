import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleType, ThemeColor, THEMES } from '../../types';
import { CustomPaletteEditor } from '../common/CustomPaletteEditor';
import {
  Monitor,
  GraduationCap,
  UserCheck,
  RotateCcw,
  Bell,
  Smartphone,
  School,
  LogOut,
  ChevronDown,
  Palette,
} from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  onExitToWelcome: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string; icon: any }[];
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  onExitToWelcome,
  activeTab,
  onTabChange,
  tabs,
}) => {
  const { state, setPlatform, setRole, setThemeColor, markAllNotificationsRead, resetDemoData } = useApp();
  const [deviceFrameMode, setDeviceFrameMode] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;
  const roleNotifs = state.notifications.filter((n) => n.role === state.currentRole);
  const unreadCount = roleNotifs.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 flex flex-col items-center justify-start sm:py-6 selection:bg-indigo-600 selection:text-white">
      {/* Top Mobile Control Bar (for switching role/platform on desktop or mobile) */}
      <div className="w-full max-w-md bg-slate-950 text-slate-300 text-xs px-4 py-2 flex items-center justify-between border-b border-slate-800 z-50">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Role:
          </span>
          <button
            onClick={() => setRole('parent')}
            style={state.currentRole === 'parent' ? { backgroundColor: currentTheme.primary } : {}}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              state.currentRole === 'parent'
                ? 'text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Parent
          </button>
          <button
            onClick={() => setRole('teacher')}
            style={state.currentRole === 'teacher' ? { backgroundColor: currentTheme.primary } : {}}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              state.currentRole === 'teacher'
                ? 'text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Teacher
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
            title="Reset Greenfield Demo Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => setPlatform('web')}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <Monitor className="w-3.5 h-3.5" />
            Web View
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={onExitToWelcome}
            className="text-[11px] text-slate-400 hover:text-slate-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Simulated Smartphone Shell or Full Width Responsive Viewport */}
      <div
        className={`w-full max-w-md bg-slate-50 flex flex-col relative overflow-hidden transition-all ${
          deviceFrameMode
            ? 'sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 sm:min-h-[820px] sm:max-h-[90vh]'
            : 'min-h-screen'
        }`}
      >
        {/* Mobile Device Status Bar */}
        <div className="h-6 bg-white flex items-center justify-between px-6 pt-1 text-[11px] font-mono font-bold text-slate-800 select-none shrink-0 border-b border-slate-100">
          <span>09:41</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto -mt-2 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Mobile App Header */}
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: currentTheme.primary }}
              className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs transition-colors"
            >
              <School className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">Schlar</span>
              <span className="text-[10px] text-slate-500 block leading-tight">Greenfield Intl</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Picker for Mobile */}
            <div className="relative">
              <button
                onClick={() => {
                  setThemeMenuOpen(!themeMenuOpen);
                  setNotifOpen(false);
                }}
                className="p-1.5 text-slate-600 hover:text-slate-900 relative rounded-lg flex items-center gap-1"
                aria-label="Theme Color"
                title="Change Accent Color"
              >
                <Palette className="w-4 h-4" />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
                  style={{ backgroundColor: currentTheme.primary }}
                />
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 text-xs animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                  <CustomPaletteEditor compact onClose={() => setThemeMenuOpen(false)} />
                </div>
              )}
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setThemeMenuOpen(false);
                }}
                className="p-1.5 text-slate-600 hover:text-slate-900 relative rounded-lg"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-2 text-xs">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 mb-1">
                    <span className="font-bold text-slate-900">Alerts</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead(state.currentRole)}
                        style={{ color: currentTheme.primary }}
                        className="text-[10px] font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {roleNotifs.length === 0 ? (
                      <p className="p-3 text-center text-slate-400">No new alerts</p>
                    ) : (
                      roleNotifs.map((n) => (
                        <div key={n.id} className="p-2 rounded-lg bg-slate-50 text-slate-700">
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{n.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Mobile Body Content */}
        <div className="flex-1 overflow-y-auto pb-20 p-4">{children}</div>

        {/* Fixed Ergonomic Bottom Tab Navigation */}
        <nav
          className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 flex items-center justify-around z-40"
          style={{ height: '64px' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={isActive ? { color: currentTheme.primary } : {}}
                className={`flex-1 h-full flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                  isActive ? 'font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full -mb-1 mt-0.5"
                    style={{ backgroundColor: currentTheme.primary }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Reset Demo Data Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Reset Demo Data?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              This will restore all students, marks, attendance, bus routes, and fee transactions back to the clean Greenfield International School dataset.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setResetConfirmOpen(false);
                }}
                className="px-3 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
