import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlatformType, RoleType, ThemeColor, THEMES } from '../../types';
import {
  GraduationCap,
  Smartphone,
  Monitor,
  Shield,
  BookOpen,
  UserCheck,
  CreditCard,
  Building2,
  Library,
  ArrowRight,
  School,
  CheckCircle2,
  Palette,
  Check,
  Bus,
  Award,
  Briefcase,
  Users,
} from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const { setPlatform, setRole, setThemeColor, state } = useApp();
  const [selectedPlatform, setSelectedPlatformState] = useState<PlatformType>(state.currentPlatform || 'web');
  const [selectedRole, setSelectedRoleState] = useState<RoleType>(state.currentRole || 'principal');
  const [selectedTheme, setSelectedThemeState] = useState<ThemeColor>(state.themeColor || 'indigo');

  const currentTheme = THEMES[selectedTheme] || THEMES.indigo;

  // Exactly 9 Web Roles as per specification (Parent Web Portal removed - Parents have ONLY Mobile App)
  const webRoles: { id: RoleType; name: string; title: string; desc: string; icon: any }[] = [
    {
      id: 'principal',
      name: 'Principal / Admin',
      title: 'Dr. Robert Hayes',
      desc: 'Complete institutional governance, cross-module analytics, student profiles & settings',
      icon: Shield,
    },
    {
      id: 'vice_principal',
      name: 'Vice Principal / Coordinator',
      title: 'Sarah Jenkins',
      desc: 'Academic oversight, class averages, subject performance, pending marks & timetable',
      icon: BookOpen,
    },
    {
      id: 'teacher',
      name: 'Teacher (Web)',
      title: 'Marcus Sterling',
      desc: 'Class management, live attendance recording, exam marks entry & assignment publishing',
      icon: UserCheck,
    },
    {
      id: 'accountant',
      name: 'Accountant / Finance',
      title: 'Edward Fletcher',
      desc: 'Tuition fees ledger, record payments (Cash/Bank/UPI), generate receipts & financial reports',
      icon: CreditCard,
    },
    {
      id: 'receptionist',
      name: 'Receptionist / Front Office',
      title: 'Clara Oswald',
      desc: 'Visitor check-in/out, admission enquiry tracking pipeline & appointments',
      icon: Building2,
    },
    {
      id: 'librarian',
      name: 'Librarian',
      title: 'Arthur Pendelton',
      desc: 'Book catalog management, issue & return workflow, automatic fine computation',
      icon: Library,
    },
    {
      id: 'hr',
      name: 'HR & Personnel',
      title: 'Eleanor Vance',
      desc: 'Faculty & staff directory, departments, leave applications review, and payroll audits',
      icon: Briefcase,
    },
    {
      id: 'transport',
      name: 'Transport Manager',
      title: 'Gary Vance',
      desc: 'Bus routes, transit timetables, student commute allocations, and driver safety logs',
      icon: Bus,
    },
    {
      id: 'exam_coordinator',
      name: 'Exam Coordinator',
      title: 'Dr. Helen Vance',
      desc: 'Examination timetables, seating matrices, marks moderation, and report card publishing',
      icon: Award,
    },
  ];

  // Exactly 2 Mobile Roles as per specification
  const mobileRoles: { id: RoleType; name: string; title: string; desc: string; icon: any }[] = [
    {
      id: 'parent',
      name: 'Parent Mobile App',
      title: 'Vikram Sharma',
      desc: 'Family-centered mobile app: switch between Aarav & Ananya, attendance calendar, grades, tuition fee payments & teacher chat',
      icon: GraduationCap,
    },
    {
      id: 'teacher',
      name: 'Teacher Mobile App',
      title: 'Marcus Sterling',
      desc: 'Thumb-friendly daily schedule, period attendance taker, quick tasks & alerts',
      icon: UserCheck,
    },
  ];

  const handleThemeSelect = (color: ThemeColor) => {
    setSelectedThemeState(color);
    setThemeColor(color);
  };

  const handleLaunch = (platform: PlatformType, role: RoleType) => {
    setThemeColor(selectedTheme);
    const targetPlatform = role === 'parent' ? 'mobile' : platform;
    setPlatform(targetPlatform);
    setRole(role);
    onEnter();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-slate-700 selection:text-white relative">
      {/* Dynamic background radial glow in chosen theme color */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-500 opacity-20"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% -20%, ${currentTheme.primary}, rgba(255,255,255,0))`,
        }}
      />

      {/* Top Banner */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: currentTheme.primary }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-colors"
            >
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Schlar
                <span
                  style={{ borderColor: currentTheme.primary, color: currentTheme.light }}
                  className="text-[10px] uppercase font-mono tracking-widest bg-slate-900/90 px-2 py-0.5 rounded border"
                >
                  Demo
                </span>
              </span>
              <p className="text-xs text-slate-400 hidden sm:block">One connected platform for smarter schools</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Greenfield International School
            </span>
          </div>
        </div>
      </header>

      {/* Hero & Platform / Role Selection */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 text-balance">
            Schlar School Management
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed text-balance">
            “One connected platform for smarter schools.” Experience connected data flows across
            administrators, academic heads, faculty, finance, front office, library, transport, exams, and parents.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Interactive LocalStorage Persistence
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              10 Role Workspaces
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Customizable Brand Color System
            </span>
          </div>
        </div>

        {/* STEP 1: Platform Selection Segment */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-1.5 sm:p-2 max-w-md mx-auto flex items-center gap-2 mb-6">
          <button
            onClick={() => {
              setSelectedPlatformState('web');
              setSelectedRoleState('principal');
            }}
            style={selectedPlatform === 'web' ? { backgroundColor: currentTheme.primary } : {}}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedPlatform === 'web'
                ? 'text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Web Workspaces
          </button>

          <button
            onClick={() => {
              setSelectedPlatformState('mobile');
              setSelectedRoleState('parent');
            }}
            style={selectedPlatform === 'mobile' ? { backgroundColor: currentTheme.primary } : {}}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedPlatform === 'mobile'
                ? 'text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile App (Parent & Teacher)
          </button>
        </div>

        {/* STEP 2: Color Theme Selection Option (USER REQUESTED) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" style={{ color: currentTheme.primary }} />
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Select Brand Theme & Accent Color
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              Selected color applies to all Web dashboards and Mobile apps
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {(Object.keys(THEMES) as ThemeColor[]).map((key) => {
              const th = THEMES[key];
              const isSelected = selectedTheme === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleThemeSelect(key)}
                  style={
                    isSelected
                      ? {
                          borderColor: th.primary,
                          boxShadow: `0 0 12px ${th.ring}`,
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        }
                      : {}
                  }
                  className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 scale-102 ring-1'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="relative mb-2">
                    <span
                      className="w-7 h-7 rounded-full shadow-md flex items-center justify-center border-2 border-slate-900 transition-transform"
                      style={{ backgroundColor: th.primary }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white block leading-tight truncate w-full">
                    {th.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block leading-tight">
                    {th.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: Role Selector & Launch */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 sm:p-7 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                {selectedPlatform === 'web' ? (
                  <>
                    <Monitor className="w-5 h-5" style={{ color: currentTheme.primary }} />
                    Web Platform Workspace
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" style={{ color: currentTheme.primary }} />
                    Mobile Application Experience
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedPlatform === 'web'
                  ? 'Six specialized desktop workspaces for administration, academic coordination, teaching, finance, reception, and library.'
                  : 'Touch-optimized mobile interfaces with bottom tabs, child switcher, and quick teacher attendance.'}
              </p>
            </div>

            <button
              onClick={() => handleLaunch(selectedPlatform, selectedRole)}
              style={{ backgroundColor: currentTheme.primary }}
              className="inline-flex items-center justify-center gap-2 hover:opacity-90 text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 hover:translate-x-0.5"
            >
              Launch As Selected Role
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(selectedPlatform === 'web' ? webRoles : mobileRoles).map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleState(role.id)}
                  style={
                    isSelected
                      ? {
                          borderColor: currentTheme.primary,
                          boxShadow: `0 0 16px ${currentTheme.ring}`,
                        }
                      : {}
                  }
                  className={`group relative p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900/90 border-2 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      style={isSelected ? { backgroundColor: currentTheme.primary } : {}}
                      className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? 'text-white'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white truncate">{role.name}</h3>
                        {isSelected && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentTheme.primary }}
                          />
                        )}
                      </div>
                      <p
                        className="text-xs font-medium mt-0.5 truncate"
                        style={{ color: isSelected ? currentTheme.light : '#cbd5e1' }}
                      >
                        {role.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {role.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      {role.id === 'parent' ? '2 Children Linked' : `${state.students.length} Students`}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunch(selectedPlatform, role.id);
                      }}
                      style={{ color: currentTheme.primary }}
                      className="text-xs font-semibold hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      Enter Role →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>Schlar Platform Demo · Greenfield International School · Powered by dynamic multi-role state</p>
      </footer>
    </div>
  );
};
