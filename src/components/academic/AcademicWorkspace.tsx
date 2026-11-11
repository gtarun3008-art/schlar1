import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { THEMES } from '../../types';
import { AcademicYearManager } from './AcademicYearManager';
import { ClassSectionManager } from './ClassSectionManager';
import { SubjectAllocationManager } from './SubjectAllocationManager';
import { TimetableEditorWorkspace } from './TimetableEditorWorkspace';
import { AcademicCalendarManager } from './AcademicCalendarManager';
import { AcademicReports } from './AcademicReports';
import {
  CalendarDays,
  Clock,
  Layers,
  BookOpen,
  Calendar,
  FileText,
  Building,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export type AcademicTabKey =
  | 'timetable'
  | 'setup'
  | 'classes'
  | 'subjects'
  | 'calendar'
  | 'reports';

interface AcademicWorkspaceProps {
  initialTab?: AcademicTabKey;
  initialClass?: string;
}

export const AcademicWorkspace: React.FC<AcademicWorkspaceProps> = ({
  initialTab = 'timetable',
  initialClass = 'Grade 10A',
}) => {
  const { state } = useApp();
  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  const [activeTab, setActiveTab] = useState<AcademicTabKey>(initialTab);
  const [targetTimetableClass, setTargetTimetableClass] = useState<string>(initialClass);

  const activeAy = (state.academicYears || []).find(
    (ay) => ay.id === state.activeAcademicYearId
  ) || {
    name: 'Academic Year 2026–2027',
    code: 'AY 2026-27',
    status: 'Active',
  };

  const tabs = [
    {
      id: 'timetable' as AcademicTabKey,
      label: 'Timetable Editor',
      icon: Clock,
      badge: `${state.timetable?.length || 0} Slots`,
    },
    {
      id: 'setup' as AcademicTabKey,
      label: 'Academic Setup & Terms',
      icon: CalendarDays,
      badge: activeAy.code,
    },
    {
      id: 'classes' as AcademicTabKey,
      label: 'Classes & Sections',
      icon: Layers,
      badge: `${state.classes?.length || 0}`,
    },
    {
      id: 'subjects' as AcademicTabKey,
      label: 'Subjects & Allocations',
      icon: BookOpen,
      badge: `${state.subjects?.length || 0}`,
    },
    {
      id: 'calendar' as AcademicTabKey,
      label: 'Academic Calendar',
      icon: Calendar,
      badge: `${(state.schoolEvents || state.events || []).length}`,
    },
    {
      id: 'reports' as AcademicTabKey,
      label: 'Audit & Workload Reports',
      icon: FileText,
    },
  ];

  const handleSelectTimetableClass = (className: string) => {
    setTargetTimetableClass(className);
    setActiveTab('timetable');
  };

  return (
    <div className="space-y-6">
      {/* Institutional Academic Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Greenfield Academic Operations
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Active Session: {activeAy.name} ({activeAy.code})
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Academic Management & Timetable Suite
            </h1>
            <p className="text-xs text-slate-500">
              Unified administration of sessions, semester terms, grade cohorts, teacher allocations, and live weekly master schedules.
            </p>
          </div>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={
                  isActive
                    ? { backgroundColor: currentTheme.primary, color: '#ffffff' }
                    : {}
                }
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'shadow-xs font-bold text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Rendering */}
      <div>
        {activeTab === 'timetable' && (
          <TimetableEditorWorkspace
            initialClass={targetTimetableClass}
            canEdit={state.currentRole === 'principal' || state.currentRole === 'vice_principal'}
          />
        )}

        {activeTab === 'setup' && <AcademicYearManager />}

        {activeTab === 'classes' && (
          <ClassSectionManager onSelectTimetableClass={handleSelectTimetableClass} />
        )}

        {activeTab === 'subjects' && <SubjectAllocationManager />}

        {activeTab === 'calendar' && <AcademicCalendarManager />}

        {activeTab === 'reports' && <AcademicReports />}
      </div>
    </div>
  );
};
