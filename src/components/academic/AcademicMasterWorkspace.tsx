import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, THEMES } from '../../types';
import { AcademicSetupWorkspace } from './AcademicSetupWorkspace';
import { ClassesSectionsWorkspace } from './ClassesSectionsWorkspace';
import { SubjectsWorkspace } from './SubjectsWorkspace';
import { InteractiveTimetableEditor } from './InteractiveTimetableEditor';
import { TeacherWorkloadWorkspace } from './TeacherWorkloadWorkspace';
import { AcademicCalendarWorkspace } from './AcademicCalendarWorkspace';
import { BarChart, LineChart } from '../common/Charts';
import {
  Layers,
  Calendar,
  Clock,
  BookOpen,
  Users,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Building,
  Award,
  ChevronRight,
} from 'lucide-react';

interface AcademicMasterWorkspaceProps {
  initialSubTab?:
    | 'dashboard'
    | 'years'
    | 'classes'
    | 'subjects'
    | 'timetable'
    | 'workload'
    | 'calendar';
  initialClass?: string;
  onViewStudent?: (student: Student) => void;
}

export const AcademicMasterWorkspace: React.FC<AcademicMasterWorkspaceProps> = ({
  initialSubTab = 'dashboard',
  initialClass = 'Grade 10A',
  onViewStudent,
}) => {
  const { state, setActiveNav } = useApp();
  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'years' | 'classes' | 'subjects' | 'timetable' | 'workload' | 'calendar'
  >(initialSubTab);

  const [selectedTimetableClass, setSelectedTimetableClass] = useState<string>(initialClass);
  const [selectedTeacherScheduleId, setSelectedTeacherScheduleId] = useState<string | undefined>(
    undefined
  );

  const activeAy =
    state.academicYears.find((ay) => ay.id === state.activeAcademicYearId) || state.academicYears[0];

  // Missing teacher allocations count
  const missingAllocationsCount = (state.subjectAllocations || []).filter(
    (a) => !a.teacherId || a.teacherName.toLowerCase().includes('unassigned')
  ).length;

  // Timetable conflicts count
  const conflictCount = React.useMemo(() => {
    let count = 0;
    const allSlots = state.timetable || [];
    for (let i = 0; i < allSlots.length; i++) {
      for (let j = i + 1; j < allSlots.length; j++) {
        const s1 = allSlots[i];
        const s2 = allSlots[j];
        if (s1.day === s2.day && s1.periodNumber === s2.periodNumber) {
          if (
            (s1.teacherId && s2.teacherId && s1.teacherId === s2.teacherId && s1.class !== s2.class) ||
            (s1.room && s2.room && s1.room === s2.room && s1.class !== s2.class) ||
            (s1.class === s2.class && s1.id !== s2.id)
          ) {
            count++;
          }
        }
      }
    }
    return count;
  }, [state.timetable]);

  const handleNavigateToTimetable = (className: string) => {
    setSelectedTimetableClass(className);
    setSelectedTeacherScheduleId(undefined);
    setActiveTab('timetable');
  };

  const handleNavigateToTeacherSchedule = (teacherId: string) => {
    setSelectedTeacherScheduleId(teacherId);
    setActiveTab('timetable');
  };

  return (
    <div className="space-y-6">
      {/* Top Academic Sub-navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Academic Dashboard
          </button>

          <button
            onClick={() => setActiveTab('years')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'years'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Years & Terms
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'classes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Classes & Sections ({state.classes.length})
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Subjects & Allocations
            {missingAllocationsCount > 0 && (
              <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold ml-1">
                {missingAllocationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'timetable'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Master Timetable
            {conflictCount > 0 && (
              <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold ml-1">
                {conflictCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('workload')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'workload'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Faculty Availability
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Events Calendar
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ACADEMIC DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
                Institutional Academic Operations
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Academic Management Command Center
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Active Session: <strong>{activeAy?.name}</strong> · Fall Semester Term 1 · Greenfield International School
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('timetable')}
                style={{ backgroundColor: currentTheme.primary }}
                className="flex items-center gap-1.5 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity"
              >
                <Clock className="w-4 h-4" />
                Open Timetable Editor
              </button>
              <button
                onClick={() => setActiveTab('classes')}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Layers className="w-4 h-4" />
                Manage Classes
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Classes & Cohorts
                </span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                {state.classes.length} Classes
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between">
                <span>Total Enrolled:</span>
                <span className="font-semibold text-slate-800">{state.students.length} Students</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Curriculum Subjects
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                {state.subjects?.length || 12} Subjects
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between">
                <span>Coverage Status:</span>
                {missingAllocationsCount > 0 ? (
                  <span className="font-bold text-amber-600">{missingAllocationsCount} Unassigned</span>
                ) : (
                  <span className="font-bold text-emerald-600">100% Allocated</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Master Timetable
                </span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                {state.timetable?.length || 0} Lessons
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between">
                <span>Schedule Conflicts:</span>
                {conflictCount > 0 ? (
                  <span className="font-bold text-rose-600">{conflictCount} Clashes</span>
                ) : (
                  <span className="font-bold text-emerald-600">0 Clashes (Verified)</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Faculty Utilization
                </span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                {state.teachers.length} Teachers
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between">
                <span>Average Load:</span>
                <span className="font-bold text-slate-800">21.4 hrs / week</span>
              </div>
            </div>
          </div>

          {/* Quick Operations Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              onClick={() => setActiveTab('classes')}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm">Classes & Cohorts Oversight</h3>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">
                Inspect enrolled rosters, room allocations, section counts, and today's attendance rates.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('subjects')}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm">Subject Allocations Matrix</h3>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">
                Configure syllabus requirements, connect teachers to classes, and resolve unassigned subjects.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('timetable')}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm">Interactive Timetable Editor</h3>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">
                Drag, edit, and audit lessons with automated teacher overlap and room double-booking prevention.
              </p>
            </div>
          </div>

          {/* Performance & Pacing Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Subject Performance Across Cohorts</h3>
              <p className="text-xs text-slate-500 mb-4">Average score percentage by curriculum area</p>
              <BarChart
                data={[
                  { label: 'Math', value: 86.4, displayValue: '86.4%' },
                  { label: 'Science', value: 84.1, displayValue: '84.1%' },
                  { label: 'English', value: 89.2, displayValue: '89.2%' },
                  { label: 'History', value: 78.5, displayValue: '78.5%' },
                  { label: 'CompSci', value: 92.0, displayValue: '92.0%' },
                  { label: 'Arts', value: 94.5, displayValue: '94.5%' },
                ]}
                height={180}
                valueSuffix="%"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Class Attendance Performance</h3>
              <p className="text-xs text-slate-500 mb-4">Daily attendance percentages across cohorts</p>
              <BarChart
                data={state.classes.map((c) => ({
                  label: c.name.replace('Grade ', 'Gr '),
                  value: c.attendanceToday,
                  displayValue: `${c.attendanceToday}%`,
                }))}
                height={180}
                valueSuffix="%"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ACADEMIC YEARS & TERMS */}
      {activeTab === 'years' && <AcademicSetupWorkspace />}

      {/* SUB-TAB 3: CLASSES & SECTIONS */}
      {activeTab === 'classes' && (
        <ClassesSectionsWorkspace
          onViewStudent={onViewStudent}
          onNavigateToTimetable={handleNavigateToTimetable}
        />
      )}

      {/* SUB-TAB 4: SUBJECTS & ALLOCATIONS */}
      {activeTab === 'subjects' && <SubjectsWorkspace />}

      {/* SUB-TAB 5: MASTER TIMETABLE */}
      {activeTab === 'timetable' && (
        <InteractiveTimetableEditor
          initialClass={selectedTimetableClass}
          initialTeacherId={selectedTeacherScheduleId}
          canEdit={true}
        />
      )}

      {/* SUB-TAB 6: FACULTY WORKLOAD */}
      {activeTab === 'workload' && (
        <TeacherWorkloadWorkspace onViewTeacherSchedule={handleNavigateToTeacherSchedule} />
      )}

      {/* SUB-TAB 7: ACADEMIC CALENDAR */}
      {activeTab === 'calendar' && <AcademicCalendarWorkspace />}
    </div>
  );
};
