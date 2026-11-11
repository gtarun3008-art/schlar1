import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { AttendanceStatus, THEMES } from '../../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  CheckSquare,
  RotateCcw,
  Save,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react';

interface TeacherAttendanceViewProps {
  initialClass?: string;
  onNavigateTab?: (tab: string) => void;
}

export const TeacherAttendanceView: React.FC<TeacherAttendanceViewProps> = ({
  initialClass = 'Grade 10A',
  onNavigateTab,
}) => {
  const {
    state,
    saveClassAttendance,
    savePeriodAttendance,
    addToast,
  } = useApp();

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  // Current Teacher: Marcus Sterling (Head of Mathematics)
  const teacherId = 'tch-sterling';
  const teacherName = 'Marcus Sterling';
  const myClasses = ['Grade 10A', 'Grade 10B', 'Grade 8A'];

  // Form State
  const [selectedClass, setSelectedClass] = useState<string>(initialClass || 'Grade 10A');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today or recent academic date
    const today = new Date().toISOString().split('T')[0];
    return today;
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Period 1 (08:30 - 09:25 AM)');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Present' | 'Absent' | 'Late'>('all');

  // Inline remarks per student (e.g. "Doctor appointment", "Fever")
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  // Local statuses state for editing before save
  const [localStatuses, setLocalStatuses] = useState<Record<string, AttendanceStatus>>({});

  // Scheduled periods for Marcus Sterling in selected class
  const classTimetableSlots = useMemo(() => {
    return state.timetable
      .filter((s) => s.class === selectedClass && (s.teacherId === teacherId || s.teacherName.includes('Sterling')))
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }, [state.timetable, selectedClass]);

  // Fallback periods if none found
  const availablePeriods = useMemo(() => {
    if (classTimetableSlots.length > 0) {
      return classTimetableSlots.map((s) => `${s.period} (${s.time}) · ${s.subject}`);
    }
    return [
      'Period 1 (08:30 - 09:25 AM) · Mathematics',
      'Period 2 (09:30 - 10:25 AM) · Mathematics',
      'Period 4 (11:30 - 12:25 PM) · Mathematics',
      'Morning Roll Call (08:15 AM)',
    ];
  }, [classTimetableSlots]);

  // Students in selected cohort
  const cohortStudents = useMemo(() => {
    return state.students.filter((s) => s.class === selectedClass);
  }, [state.students, selectedClass]);

  // Helper to get status of student (draft -> existing saved attendance -> default 'Present')
  const getStudentStatus = (studentId: string): AttendanceStatus => {
    if (localStatuses[studentId]) {
      return localStatuses[studentId];
    }
    // Check if attendance already exists in state for this date, class, and student
    const existing = state.attendance.find(
      (a) =>
        a.studentId === studentId &&
        a.date === selectedDate &&
        a.class === selectedClass
    );
    if (existing) {
      return existing.status;
    }
    return 'Present';
  };

  // Set single student status
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setLocalStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Bulk: Mark All Present
  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    cohortStudents.forEach((std) => {
      updated[std.id] = 'Present';
    });
    setLocalStatuses(updated);
    addToast('All Marked Present', `Marked all ${cohortStudents.length} students in ${selectedClass} as Present.`, 'success');
  };

  // Bulk: Clear / Reset
  const handleResetRegister = () => {
    setLocalStatuses({});
    setRemarks({});
    addToast('Register Cleared', 'Reset attendance selections back to default.', 'info');
  };

  // Quick Date Shifter
  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
    // Clear local drafts when changing date to reload that date's data
    setLocalStatuses({});
  };

  const setDateToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setLocalStatuses({});
  };

  // Filtered students for display
  const filteredStudents = useMemo(() => {
    return cohortStudents.filter((std) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        std.name.toLowerCase().includes(q) ||
        std.admissionId.toLowerCase().includes(q) ||
        (std.rollNo && std.rollNo.includes(q));

      if (!matchSearch) return false;

      if (statusFilter === 'all') return true;
      const st = getStudentStatus(std.id);
      return st === statusFilter;
    });
  }, [cohortStudents, searchQuery, statusFilter, localStatuses, selectedDate, selectedClass, state.attendance]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    cohortStudents.forEach((std) => {
      const st = getStudentStatus(std.id);
      if (st === 'Present') present++;
      else if (st === 'Absent') absent++;
      else if (st === 'Late') late++;
      else if (st === 'Excused') excused++;
    });

    const total = cohortStudents.length || 1;
    const rate = Math.round(((present + late) / total) * 100);

    return {
      total: cohortStudents.length,
      present,
      absent,
      late,
      excused,
      rate,
    };
  }, [cohortStudents, localStatuses, selectedDate, selectedClass, state.attendance]);

  // Save Attendance Handler
  const handleSaveAttendance = () => {
    if (cohortStudents.length === 0) {
      addToast('No Students', 'Selected cohort has no enrolled students.', 'error');
      return;
    }

    const records = cohortStudents.map((std) => ({
      studentId: std.id,
      status: getStudentStatus(std.id),
      remarks: remarks[std.id] || undefined,
    }));

    // Extract period number if available
    const periodNumMatch = selectedPeriod.match(/Period\s*(\d+)/i);
    const periodNum = periodNumMatch ? parseInt(periodNumMatch[1], 10) : 1;

    // Save into Period-wise session & global attendance state
    savePeriodAttendance({
      date: selectedDate,
      className: selectedClass,
      section: selectedClass.includes('A') ? 'A' : selectedClass.includes('B') ? 'B' : 'A',
      period: selectedPeriod,
      periodNumber: periodNum,
      subject: 'Mathematics',
      teacherId,
      teacherName,
      room: 'Room 301',
      records: records.map((r) => ({
        studentId: r.studentId,
        status: r.status,
      })),
      isDraft: false,
    });

    // Also update class daily rate
    const mappedClassRecords = records.map((r) => {
      let st: 'Present' | 'Absent' | 'Late' = 'Present';
      if (r.status === 'Absent' || r.status === 'Excused' || r.status === 'Half Day') {
        st = 'Absent';
      } else if (r.status === 'Late') {
        st = 'Late';
      }
      return {
        studentId: r.studentId,
        status: st,
      };
    });

    saveClassAttendance(
      selectedClass,
      mappedClassRecords,
      selectedPeriod
    );

    addToast(
      'Attendance Submitted',
      `Attendance for ${selectedClass} (${selectedDate}) successfully saved (${metrics.present} Present, ${metrics.absent} Absent).`,
      'success'
    );
  };

  // Recent attendance sessions for this class
  const recentSessions = useMemo(() => {
    const sessions = (state.attendanceSessions || []).filter((s) => s.class === selectedClass);
    if (sessions.length > 0) {
      return sessions.slice(0, 4);
    }
    // Fallback recent demo dates
    return [
      {
        id: 'sess-1',
        date: '2026-10-18',
        period: 'Period 1 (08:30 AM)',
        subject: 'Mathematics',
        presentCount: 29,
        absentCount: 1,
        totalStudents: 30,
        status: 'Submitted',
      },
      {
        id: 'sess-2',
        date: '2026-10-17',
        period: 'Period 2 (09:30 AM)',
        subject: 'Mathematics',
        presentCount: 28,
        absentCount: 2,
        totalStudents: 30,
        status: 'Submitted',
      },
    ];
  }, [state.attendanceSessions, selectedClass]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: currentTheme.primary }}
                className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase text-white shadow-2xs"
              >
                Teacher Register
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {teacherName} · Head of Mathematics
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Class Attendance Register
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Take roll call and record student attendance for your assigned cohorts.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-2 self-stretch md:self-auto overflow-x-auto pb-1 md:pb-0">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-center min-w-[70px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total</span>
              <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                {metrics.total}
              </span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-center min-w-[70px]">
              <span className="text-[10px] uppercase font-semibold text-emerald-700 block">Present</span>
              <span className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                {metrics.present}
              </span>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2 text-center min-w-[70px]">
              <span className="text-[10px] uppercase font-semibold text-rose-700 block">Absent</span>
              <span className="text-base font-bold font-mono text-rose-700 tabular-nums">
                {metrics.absent}
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 text-center min-w-[70px]">
              <span className="text-[10px] uppercase font-semibold text-amber-700 block">Late</span>
              <span className="text-base font-bold font-mono text-amber-700 tabular-nums">
                {metrics.late}
              </span>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3.5 py-2 text-center min-w-[75px]">
              <span className="text-[10px] uppercase font-semibold text-indigo-700 block">Rate</span>
              <span className="text-base font-bold font-mono text-indigo-700 tabular-nums">
                {metrics.rate}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Control Toolbar: Class, Date, Period */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Cohort Selector */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Assigned Cohort
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
              {myClasses.map((cls) => {
                const isSelected = selectedClass === cls;
                const count = state.students.filter((s) => s.class === cls).length;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      setSelectedClass(cls);
                      setLocalStatuses({});
                    }}
                    style={isSelected ? { backgroundColor: currentTheme.primary } : {}}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>{cls}</span>
                    <span
                      className={`ml-1 text-[10px] font-mono ${
                        isSelected ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker with stepper */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Attendance Date
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => shiftDate(-1)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setLocalStatuses({});
                }}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => shiftDate(1)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={setDateToToday}
                className="px-2.5 py-2 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
              >
                Today
              </button>
            </div>
          </div>

          {/* Period / Lesson Slot */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Period / Lesson Slot
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              {availablePeriods.map((p, idx) => (
                <option key={idx} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Action Toolbar & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search & Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${selectedClass} students...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Quick Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
            <option value="Late">Late Only</option>
          </select>
        </div>

        {/* Batch Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={handleResetRegister}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Reset register to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAttendance}
            style={{ backgroundColor: currentTheme.primary }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity"
          >
            <Save className="w-4 h-4" />
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      {/* 4. Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              Student Attendance Register
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 font-medium">
              {filteredStudents.length} of {cohortStudents.length} Students
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Late
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500" /> Excused
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5 w-16">Roll #</th>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5 font-mono text-center w-24">History</th>
                <th className="px-6 py-3.5 text-center w-80">Mark Status</th>
                <th className="px-5 py-3.5">Remarks / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((std) => {
                const currentStatus = getStudentStatus(std.id);
                const isAbsent = currentStatus === 'Absent';
                const isLate = currentStatus === 'Late';
                const isExcused = currentStatus === 'Excused';
                const isPresent = currentStatus === 'Present';

                return (
                  <tr
                    key={std.id}
                    className={`transition-colors ${
                      isAbsent
                        ? 'bg-rose-50/30 hover:bg-rose-50/50'
                        : isLate
                        ? 'bg-amber-50/30 hover:bg-amber-50/50'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Roll No */}
                    <td className="px-5 py-3 font-mono font-bold text-slate-500 tabular-nums">
                      #{std.rollNo || '—'}
                    </td>

                    {/* Student Identity */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0 ${
                            isAbsent
                              ? 'bg-rose-600'
                              : isLate
                              ? 'bg-amber-600'
                              : isExcused
                              ? 'bg-sky-600'
                              : 'bg-emerald-600'
                          }`}
                        >
                          {std.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">
                            {std.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {std.admissionId} · Sec {std.section || 'A'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Overall Attendance Rate */}
                    <td className="px-4 py-3 text-center font-mono">
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          (std.attendanceRate || 95) >= 90
                            ? 'text-emerald-700'
                            : (std.attendanceRate || 95) >= 75
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {std.attendanceRate || 95}%
                      </span>
                    </td>

                    {/* Tactile Status Buttons */}
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Present */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(std.id, 'Present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            isPresent
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        {/* Absent */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(std.id, 'Absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            isAbsent
                              ? 'bg-rose-600 text-white font-bold shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        {/* Late */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(std.id, 'Late')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            isLate
                              ? 'bg-amber-600 text-white font-bold shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>Late</span>
                        </button>

                        {/* Excused */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(std.id, 'Excused')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isExcused
                              ? 'bg-sky-600 text-white font-bold shadow-xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-700'
                          }`}
                        >
                          <span>Excused</span>
                        </button>
                      </div>
                    </td>

                    {/* Remarks Input */}
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        placeholder={isAbsent ? 'Reason for absence...' : 'Optional notes...'}
                        value={remarks[std.id] || ''}
                        onChange={(e) =>
                          setRemarks({ ...remarks, [std.id]: e.target.value })
                        }
                        className={`w-full px-2.5 py-1 text-xs rounded-lg border focus:outline-hidden transition-colors ${
                          isAbsent
                            ? 'border-rose-200 bg-rose-50/50 text-rose-950 placeholder-rose-300 focus:border-rose-400'
                            : 'border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:border-indigo-400'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No students match your filter criteria in {selectedClass}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Save Bar at Bottom */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span>Summary: </span>
            <strong className="text-emerald-700 font-semibold">{metrics.present} Present</strong>
            <span className="text-slate-400 mx-1.5">·</span>
            <strong className="text-rose-700 font-semibold">{metrics.absent} Absent</strong>
            <span className="text-slate-400 mx-1.5">·</span>
            <strong className="text-amber-700 font-semibold">{metrics.late} Late</strong>
            <span className="text-slate-400 mx-1.5">·</span>
            <span className="font-mono text-slate-500 font-bold">{metrics.rate}% Attendance Rate</span>
          </div>

          <button
            type="button"
            onClick={handleSaveAttendance}
            style={{ backgroundColor: currentTheme.primary }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity"
          >
            <Save className="w-4 h-4" />
            <span>Save & Submit Attendance Register</span>
          </button>
        </div>
      </div>

      {/* 5. Recent Register Submissions History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Attendance Sessions — {selectedClass}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified historical roll calls previously recorded for this cohort.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Academic Session 2026-27
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {recentSessions.map((sess, idx) => {
            const pCount = sess.presentCount || 28;
            const aCount = sess.absentCount || 2;
            const total = sess.totalStudents || 30;
            const pct = Math.round((pCount / total) * 100);

            return (
              <div
                key={sess.id || idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{sess.date}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {sess.status || 'Verified'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {sess.period || 'Period 1 (08:30 AM)'}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-mono">
                    <strong className="text-emerald-700">{pCount}P</strong> ·{' '}
                    <strong className="text-rose-700">{aCount}A</strong>
                  </span>
                  <span className="font-bold font-mono text-slate-900">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
