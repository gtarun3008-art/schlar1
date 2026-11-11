import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { THEMES } from '../../types';
import { AttendanceStatus } from '../../types';
import {
  Calendar,
  Clock,
  Check,
  X,
  Lock,
  Unlock,
  AlertCircle,
  Save,
  Send,
  Search,
  Filter,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
  RefreshCw,
  Building,
  UserCheck,
  UserX,
  Info,
  HelpCircle,
  Edit3,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface PeriodAttendanceMatrixProps {
  onNavigateTab?: (tab: string) => void;
}

export const PeriodAttendanceMatrix: React.FC<PeriodAttendanceMatrixProps> = () => {
  const {
    state,
    setSelectedTeacherId,
    checkTeacherPeriodPermission,
    savePeriodAttendance,
    requestAttendanceCorrection,
    reviewAttendanceCorrection,
    addToast,
  } = useApp();

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  // Active Teacher / Persona (defaults to tch-sterling Marcus Sterling)
  const activeTeacherId = state.selectedTeacherId || 'tch-sterling';
  const activeTeacher =
    state.teachers.find((t) => t.id === activeTeacherId) || state.teachers[0] || {
      id: 'tch-sterling',
      name: 'Marcus Sterling',
      subjects: ['Mathematics'],
      classes: ['Grade 10A'],
      employeeId: 'EMP-T-101',
      roleTitle: 'Head of Mathematics',
    };

  // Date State - Defaults to Monday in current demo academic calendar (e.g. 2026-10-19)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-19');

  // Class & Section Selection
  const [selectedClass, setSelectedClass] = useState<string>('Grade 10A');
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Currently focused period for bulk controls & absent summary (default to Period 1)
  const [focusedPeriodNumber, setFocusedPeriodNumber] = useState<number>(1);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Present' | 'Absent' | 'Not Marked'>('all');

  // Review & Submit Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [hasConfirmedReview, setHasConfirmedReview] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Overwrite Confirmation Modal
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState<boolean>(false);

  // Correction Request Modal State
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState<boolean>(false);
  const [correctionStudent, setCorrectionStudent] = useState<{
    id: string;
    name: string;
    admissionId: string;
    currentStatus: AttendanceStatus;
  } | null>(null);
  const [correctionProposedStatus, setCorrectionProposedStatus] = useState<AttendanceStatus>('Present');
  const [correctionReason, setCorrectionReason] = useState<string>('');

  // Local draft marks before committing (indexed by studentId_periodNumber)
  // This allows instant responsive editing while keeping track of changes
  const [localDrafts, setLocalDrafts] = useState<Record<string, AttendanceStatus>>({});

  // Active matrix sub-view tab
  const [activeMatrixTab, setActiveMatrixTab] = useState<'matrix' | 'corrections' | 'summary'>('matrix');

  // Calculate day of week from selectedDate
  const dateObj = useMemo(() => new Date(selectedDate + 'T12:00:00'), [selectedDate]);
  const dayNames: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayOfWeek = dayNames[dateObj.getDay()];
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

  // Format date display
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Scheduled Timetable periods for this Class and Day
  const scheduledPeriods = useMemo(() => {
    if (isWeekend) return [];
    return state.timetable
      .filter((s) => s.class === selectedClass && s.day === dayOfWeek)
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }, [state.timetable, selectedClass, dayOfWeek, isWeekend]);

  // Students in selected class
  const classStudents = useMemo(() => {
    return state.students.filter((s) => {
      const matchClass = s.class === selectedClass;
      const matchSection = selectedSection === 'All' || s.section === selectedSection;
      return matchClass && matchSection;
    });
  }, [state.students, selectedClass, selectedSection]);

  // Filtered Students for the Table
  const filteredStudents = useMemo(() => {
    return classStudents.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.rollNo && student.rollNo.includes(searchQuery));

      if (!matchSearch) return false;

      if (statusFilter === 'all') return true;

      // Check status in focused period
      const draftKey = `${student.id}_${focusedPeriodNumber}`;
      let st: AttendanceStatus | 'Not Marked' = localDrafts[draftKey];
      if (!st) {
        const saved = state.attendance.find(
          (a) =>
            a.studentId === student.id &&
            a.date === selectedDate &&
            a.class === selectedClass &&
            a.periodNumber === focusedPeriodNumber
        );
        st = saved ? saved.status : 'Not Marked';
      }

      return st === statusFilter;
    });
  }, [classStudents, searchQuery, statusFilter, focusedPeriodNumber, localDrafts, state.attendance, selectedDate, selectedClass]);

  // Find the slot for the focused period
  const focusedSlot = useMemo(() => {
    return scheduledPeriods.find((p) => p.periodNumber === focusedPeriodNumber) || scheduledPeriods[0];
  }, [scheduledPeriods, focusedPeriodNumber]);

  // Check permission for focused slot
  const focusedPermission = useMemo(() => {
    if (!focusedSlot) return { authorized: false, reason: 'No period selected' };
    return checkTeacherPeriodPermission(
      activeTeacher.id,
      selectedClass,
      selectedDate,
      focusedSlot.periodNumber,
      focusedSlot.period
    );
  }, [checkTeacherPeriodPermission, activeTeacher.id, selectedClass, selectedDate, focusedSlot]);

  // Check session status for focused period
  const focusedSession = useMemo(() => {
    if (!focusedSlot) return null;
    return (state.attendanceSessions || []).find(
      (s) =>
        s.date === selectedDate &&
        s.class === selectedClass &&
        s.periodNumber === focusedSlot.periodNumber
    );
  }, [state.attendanceSessions, selectedDate, selectedClass, focusedSlot]);

  // Helper to get status of a student in a specific period
  const getCellStatus = (studentId: string, periodNumber: number): AttendanceStatus | 'Not Marked' => {
    const draftKey = `${studentId}_${periodNumber}`;
    if (localDrafts[draftKey] !== undefined) {
      return localDrafts[draftKey];
    }
    const existing = state.attendance.find(
      (a) =>
        a.studentId === studentId &&
        a.date === selectedDate &&
        a.class === selectedClass &&
        a.periodNumber === periodNumber
    );
    return existing ? existing.status : 'Not Marked';
  };

  // Cell Click Handler - With Strict Independent Permission Validation
  const handleCellClick = (studentId: string, slot: typeof scheduledPeriods[0]) => {
    // 1. Independent permission check
    const perm = checkTeacherPeriodPermission(
      activeTeacher.id,
      selectedClass,
      selectedDate,
      slot.periodNumber,
      slot.period
    );

    if (!perm.authorized) {
      addToast(
        'Permission Denied',
        perm.reason || `You are not assigned to ${slot.period}. Only ${slot.teacherName} (${slot.subject}) is authorized to mark attendance.`,
        'error'
      );
      return;
    }

    // 2. Check if period session is already officially submitted
    const session = (state.attendanceSessions || []).find(
      (s) =>
        s.date === selectedDate &&
        s.class === selectedClass &&
        s.periodNumber === slot.periodNumber
    );

    if (session && session.status === 'Submitted' && state.currentRole !== 'principal' && state.currentRole !== 'vice_principal') {
      const student = state.students.find((s) => s.id === studentId);
      const currentSt = getCellStatus(studentId, slot.periodNumber);
      setCorrectionStudent({
        id: studentId,
        name: student?.name || 'Student',
        admissionId: student?.admissionId || '',
        currentStatus: (currentSt === 'Not Marked' ? 'Present' : currentSt) as AttendanceStatus,
      });
      setCorrectionProposedStatus(currentSt === 'Present' ? 'Absent' : 'Present');
      setIsCorrectionModalOpen(true);
      return;
    }

    // 3. Cycle status: Not Marked -> Present -> Absent -> Not Marked
    const current = getCellStatus(studentId, slot.periodNumber);
    let next: AttendanceStatus | 'Not Marked';
    if (current === 'Not Marked') {
      next = 'Present';
    } else if (current === 'Present') {
      next = 'Absent';
    } else {
      next = 'Not Marked';
    }

    const draftKey = `${studentId}_${slot.periodNumber}`;
    setLocalDrafts((prev) => ({
      ...prev,
      [draftKey]: next as AttendanceStatus,
    }));
  };

  // Direct Status Select for a student in focused period
  const setStudentStatus = (studentId: string, status: AttendanceStatus | 'Not Marked') => {
    if (!focusedSlot) return;

    const perm = checkTeacherPeriodPermission(
      activeTeacher.id,
      selectedClass,
      selectedDate,
      focusedSlot.periodNumber,
      focusedSlot.period
    );

    if (!perm.authorized) {
      addToast('Permission Denied', perm.reason || 'You are not assigned to this period.', 'error');
      return;
    }

    const draftKey = `${studentId}_${focusedSlot.periodNumber}`;
    setLocalDrafts((prev) => ({
      ...prev,
      [draftKey]: status as AttendanceStatus,
    }));
  };

  // Mark All Present for Focused Period
  const handleMarkAllPresentClick = () => {
    if (!focusedSlot) return;

    const perm = checkTeacherPeriodPermission(
      activeTeacher.id,
      selectedClass,
      selectedDate,
      focusedSlot.periodNumber,
      focusedSlot.period
    );

    if (!perm.authorized) {
      addToast(
        'Permission Denied',
        `Unauthorized bulk action: Only ${focusedSlot.teacherName} can record attendance for ${focusedSlot.period} (${focusedSlot.subject}).`,
        'error'
      );
      return;
    }

    // Check if any student already has marks in this period that would be overwritten
    const hasExistingMarks = classStudents.some((s) => {
      const st = getCellStatus(s.id, focusedSlot.periodNumber);
      return st !== 'Not Marked';
    });

    if (hasExistingMarks) {
      setIsOverwriteModalOpen(true);
    } else {
      executeMarkAllPresent();
    }
  };

  const executeMarkAllPresent = () => {
    if (!focusedSlot) return;
    const updates: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      updates[`${s.id}_${focusedSlot.periodNumber}`] = 'Present';
    });
    setLocalDrafts((prev) => ({ ...prev, ...updates }));
    setIsOverwriteModalOpen(false);
    addToast('Bulk Update Applied', `Marked all ${classStudents.length} students as Present for ${focusedSlot.period}. Click 'Save Draft' or 'Review and Submit' to store.`, 'info');
  };

  // Clear / Reset Marks for Focused Period
  const handleClearPeriodMarks = () => {
    if (!focusedSlot) return;

    const perm = checkTeacherPeriodPermission(
      activeTeacher.id,
      selectedClass,
      selectedDate,
      focusedSlot.periodNumber,
      focusedSlot.period
    );

    if (!perm.authorized) {
      addToast('Permission Denied', 'You are not authorized to clear marks for this period.', 'error');
      return;
    }

    const updates: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      updates[`${s.id}_${focusedSlot.periodNumber}`] = 'Not Marked' as any;
    });
    setLocalDrafts((prev) => ({ ...prev, ...updates }));
    addToast('Period Marks Cleared', `Reset attendance marks for ${focusedSlot.period} to 'Not Marked'.`, 'info');
  };

  // Save Draft Action
  const handleSaveDraft = () => {
    if (!focusedSlot) return;

    const perm = checkTeacherPeriodPermission(
      activeTeacher.id,
      selectedClass,
      selectedDate,
      focusedSlot.periodNumber,
      focusedSlot.period
    );

    if (!perm.authorized) {
      addToast('Permission Denied', perm.reason || 'You are not authorized to save drafts for this period.', 'error');
      return;
    }

    // Compile student records for this period
    const records = classStudents.map((std) => {
      const st = getCellStatus(std.id, focusedSlot.periodNumber);
      return {
        studentId: std.id,
        status: (st === 'Not Marked' ? 'Not Marked' : st) as AttendanceStatus,
      };
    });

    const result = savePeriodAttendance({
      date: selectedDate,
      className: selectedClass,
      section: selectedSection === 'All' ? 'A' : selectedSection,
      period: focusedSlot.period,
      periodNumber: focusedSlot.periodNumber,
      subject: focusedSlot.subject,
      teacherId: activeTeacher.id,
      teacherName: activeTeacher.name,
      room: focusedSlot.room,
      records,
      isDraft: true,
    });

    if (result.success) {
      // Clean up local drafts for this period since they are committed
      setLocalDrafts((prev) => {
        const next = { ...prev };
        classStudents.forEach((std) => {
          delete next[`${std.id}_${focusedSlot.periodNumber}`];
        });
        return next;
      });
    }
  };

  // Calculate Metrics for Focused Period
  const focusedPeriodMetrics = useMemo(() => {
    if (!focusedSlot) {
      return { total: 0, marked: 0, present: 0, absent: 0, notMarked: 0, completionRate: 0, absentStudents: [] };
    }

    const total = classStudents.length;
    let present = 0;
    let absent = 0;
    const absentList: typeof classStudents = [];

    classStudents.forEach((std) => {
      const st = getCellStatus(std.id, focusedSlot.periodNumber);
      if (st === 'Present') {
        present++;
      } else if (st === 'Absent') {
        absent++;
        absentList.push(std);
      }
    });

    const marked = present + absent;
    const notMarked = Math.max(0, total - marked);
    const completionRate = total > 0 ? Math.round((marked / total) * 100) : 0;

    return {
      total,
      marked,
      present,
      absent,
      notMarked,
      completionRate,
      absentStudents: absentList,
    };
  }, [classStudents, focusedSlot, localDrafts, state.attendance, selectedDate, selectedClass]);

  // Open Review & Submit Modal
  const handleOpenReviewModal = () => {
    if (!focusedSlot) return;

    const perm = checkTeacherPeriodPermission(
      activeTeacher.id,
      selectedClass,
      selectedDate,
      focusedSlot.periodNumber,
      focusedSlot.period
    );

    if (!perm.authorized) {
      addToast('Permission Denied', perm.reason || 'You are not assigned to this period.', 'error');
      return;
    }

    setHasConfirmedReview(false);
    setIsReviewModalOpen(true);
  };

  // Execute Official Submission
  const handleExecuteSubmit = () => {
    if (!focusedSlot) return;

    if (focusedPeriodMetrics.notMarked > 0) {
      addToast(
        'Submission Incomplete',
        `Cannot submit: ${focusedPeriodMetrics.notMarked} students remain 'Not Marked'. All students must be marked Present or Absent before final submission.`,
        'error'
      );
      return;
    }

    if (!hasConfirmedReview) {
      addToast('Confirmation Required', 'Please check the verification acknowledgement box before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);

    const records = classStudents.map((std) => {
      const st = getCellStatus(std.id, focusedSlot.periodNumber);
      return {
        studentId: std.id,
        status: st as AttendanceStatus,
      };
    });

    const res = savePeriodAttendance({
      date: selectedDate,
      className: selectedClass,
      section: selectedSection === 'All' ? 'A' : selectedSection,
      period: focusedSlot.period,
      periodNumber: focusedSlot.periodNumber,
      subject: focusedSlot.subject,
      teacherId: activeTeacher.id,
      teacherName: activeTeacher.name,
      room: focusedSlot.room,
      records,
      isDraft: false,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsReviewModalOpen(false);
      // Clear local draft state for this period
      setLocalDrafts((prev) => {
        const next = { ...prev };
        classStudents.forEach((std) => {
          delete next[`${std.id}_${focusedSlot.periodNumber}`];
        });
        return next;
      });
    }
  };

  // Submit Attendance Correction Request
  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionStudent || !focusedSlot) return;

    if (!correctionReason.trim()) {
      addToast('Validation', 'Please provide a clear reason for the correction.', 'error');
      return;
    }

    requestAttendanceCorrection({
      studentId: correctionStudent.id,
      studentName: correctionStudent.name,
      admissionId: correctionStudent.admissionId,
      class: selectedClass,
      section: selectedSection === 'All' ? 'A' : selectedSection,
      date: selectedDate,
      period: focusedSlot.period,
      subject: focusedSlot.subject,
      currentStatus: correctionStudent.currentStatus,
      proposedStatus: correctionProposedStatus,
      reason: correctionReason.trim(),
      requestedBy: activeTeacher.name,
      requestedRole: 'Teacher',
    });

    setIsCorrectionModalOpen(false);
    setCorrectionReason('');
    setCorrectionStudent(null);
  };

  // Quick Date Navigation Helpers
  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Institutional Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase ${currentTheme.badgeBg} text-white`}>
                Official Register
              </span>
              <span className="text-xs font-mono text-slate-400">Greenfield Academic Ledger</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Period-Wise Attendance Matrix
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-period roll register with independent lesson authorization and faculty assignment enforcement.
            </p>
          </div>

          {/* Active Faculty Persona Switcher (For testing permissions) */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {activeTeacher.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{activeTeacher.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                    Active Faculty
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {activeTeacher.roleTitle || activeTeacher.subjects.join(', ')}
                </p>
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Switch Faculty (Test Rule)
              </label>
              <select
                value={activeTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {state.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subjects.slice(0, 2).join(', ')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Top Selectors Bar: Date, Class, Section */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Attendance Date */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Attendance Date
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => shiftDate(-1)}
                className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => shiftDate(1)}
                className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Class Selector */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Class Section
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {state.classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.totalStudents} students · {c.classTeacherName})
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Section Roll
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Sections (Cohort)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          {/* Current Selection Summary Badge */}
          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-2.5 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Active Cohort Context
            </span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs font-bold text-slate-900">{selectedClass}</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                {classStudents.length} Students
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 truncate">{formattedDate}</span>
          </div>
        </div>

        {/* Weekend Warning */}
        {isWeekend && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {dayOfWeek} is an institutional weekend. Instructional periods are not scheduled. Select a weekday (Monday–Friday) to mark or view period attendance.
            </span>
            <button
              onClick={() => setSelectedDate('2026-10-19')}
              className="ml-auto underline font-bold hover:text-amber-950"
            >
              Go to Monday
            </button>
          </div>
        )}
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveMatrixTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMatrixTab === 'matrix'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Period Attendance Matrix
          <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {scheduledPeriods.length} Periods
          </span>
        </button>

        <button
          onClick={() => setActiveMatrixTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMatrixTab === 'summary'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Period Summary & Absent Roll
          {focusedPeriodMetrics.absent > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white">
              {focusedPeriodMetrics.absent} Absent
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMatrixTab('corrections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMatrixTab === 'corrections'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Corrections & Approval Queue
          {(state.attendanceCorrections || []).filter((c) => c.status === 'Pending').length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
              {(state.attendanceCorrections || []).filter((c) => c.status === 'Pending').length}
            </span>
          )}
        </button>
      </div>

      {/* 4. Tab 1: THE MAIN PERIOD ATTENDANCE MATRIX */}
      {activeMatrixTab === 'matrix' && (
        <div className="space-y-4">
          {/* Period Focus & Action Ribbon */}
          {focusedSlot && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Active Focus Indicator */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    focusedPermission.authorized
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    P{focusedSlot.periodNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {focusedSlot.period}: {focusedSlot.subject}
                      </span>
                      {focusedPermission.authorized ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Unlock className="w-2.5 h-2.5" />
                          Authorized Lesson
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Lock className="w-2.5 h-2.5" />
                          Read-Only (Assigned to {focusedSlot.teacherName})
                        </span>
                      )}
                      {focusedSession?.status === 'Submitted' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          ✓ Officially Submitted
                        </span>
                      )}
                      {focusedSession?.status === 'Draft' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          Draft Saved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Time: {focusedSlot.time} · Room: {focusedSlot.room} · Scheduled Instructor:{' '}
                      <strong className="text-slate-700">{focusedSlot.teacherName}</strong>
                    </p>
                  </div>
                </div>

                {/* Period Quick Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleMarkAllPresentClick}
                    disabled={!focusedPermission.authorized}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      focusedPermission.authorized
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 shadow-2xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                    }`}
                    title={
                      focusedPermission.authorized
                        ? 'Mark all students in this period as Present'
                        : focusedPermission.reason
                    }
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Mark All Present
                  </button>

                  <button
                    onClick={handleClearPeriodMarks}
                    disabled={!focusedPermission.authorized}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      focusedPermission.authorized
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                    }`}
                    title={focusedPermission.authorized ? 'Clear marks in this period' : focusedPermission.reason}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Clear Marks
                  </button>

                  <button
                    onClick={handleSaveDraft}
                    disabled={!focusedPermission.authorized}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      focusedPermission.authorized
                        ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                    }`}
                    title={focusedPermission.authorized ? 'Save draft marks for this period' : focusedPermission.reason}
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Draft
                  </button>

                  <button
                    onClick={handleOpenReviewModal}
                    disabled={!focusedPermission.authorized}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      focusedPermission.authorized
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                    }`}
                    title={focusedPermission.authorized ? 'Review and submit official attendance' : focusedPermission.reason}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Review & Submit
                  </button>
                </div>
              </div>

              {/* Permission Banner Warning if Read-Only */}
              {!focusedPermission.authorized && (
                <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-center gap-2 text-xs text-amber-900">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Lesson Authorization Enforcement:</strong> {focusedPermission.reason}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Matrix Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student name, roll # or admission ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Filter Focused Period:</span>
              {(['all', 'Present', 'Absent', 'Not Marked'] as const).map((filterOpt) => (
                <button
                  key={filterOpt}
                  onClick={() => setStatusFilter(filterOpt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === filterOpt
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filterOpt === 'all' ? 'All Students' : filterOpt}
                </button>
              ))}
            </div>
          </div>

          {/* THE MATRIX TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {/* Fixed First Column: Student Info */}
                    <th className="sticky left-0 bg-slate-50 z-20 px-4 py-3.5 font-bold text-slate-700 min-w-[220px] shadow-sm">
                      <div className="flex items-center justify-between">
                        <span>Student Name & ID</span>
                        <span className="text-[10px] font-mono font-normal text-slate-400">
                          {filteredStudents.length} of {classStudents.length}
                        </span>
                      </div>
                    </th>

                    {/* Period Columns Header */}
                    {scheduledPeriods.map((slot) => {
                      const perm = checkTeacherPeriodPermission(
                        activeTeacher.id,
                        selectedClass,
                        selectedDate,
                        slot.periodNumber,
                        slot.period
                      );
                      const isFocused = focusedPeriodNumber === slot.periodNumber;
                      const session = (state.attendanceSessions || []).find(
                        (s) =>
                          s.date === selectedDate &&
                          s.class === selectedClass &&
                          s.periodNumber === slot.periodNumber
                      );

                      return (
                        <th
                          key={slot.id}
                          onClick={() => setFocusedPeriodNumber(slot.periodNumber)}
                          className={`px-3 py-3 font-semibold text-slate-700 min-w-[155px] cursor-pointer transition-colors border-l border-slate-200/80 ${
                            isFocused
                              ? 'bg-emerald-50/70 border-b-2 border-b-emerald-600'
                              : 'hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">
                                {slot.period}
                              </span>
                              {perm.authorized ? (
                                <span className="p-0.5 rounded bg-emerald-100 text-emerald-700" title="Authorized lesson">
                                  <Unlock className="w-3 h-3" />
                                </span>
                              ) : (
                                <span className="p-0.5 rounded bg-slate-200 text-slate-500" title={`Assigned to ${slot.teacherName}`}>
                                  <Lock className="w-3 h-3" />
                                </span>
                              )}
                            </div>

                            <div className="font-bold text-slate-800 truncate text-[11px]" title={slot.subject}>
                              {slot.subject}
                            </div>

                            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              {slot.time.split('-')[0].trim()}
                            </div>

                            <div className="text-[10px] text-slate-500 truncate" title={`Teacher: ${slot.teacherName}`}>
                              {slot.teacherName}
                            </div>

                            {/* Session status indicator */}
                            <div className="pt-0.5">
                              {session?.status === 'Submitted' ? (
                                <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                                  Submitted
                                </span>
                              ) : session?.status === 'Draft' ? (
                                <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                  Draft
                                </span>
                              ) : (
                                <span className="inline-block text-[9px] font-normal px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                  Unmarked
                                </span>
                              )}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={scheduledPeriods.length + 1} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-medium text-slate-600">No students match current filter criteria.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Try clearing search query or changing period status filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Sticky Student Name & ID Cell */}
                        <td className="sticky left-0 bg-white hover:bg-slate-50 z-10 px-4 py-2.5 border-r border-slate-200/80 shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {student.rollNo || '00'}
                            </span>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate text-xs">
                                {student.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono truncate block">
                                {student.admissionId} · Sec {student.section || 'A'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Attendance Cells for Each Period */}
                        {scheduledPeriods.map((slot) => {
                          const status = getCellStatus(student.id, slot.periodNumber);
                          const perm = checkTeacherPeriodPermission(
                            activeTeacher.id,
                            selectedClass,
                            selectedDate,
                            slot.periodNumber,
                            slot.period
                          );
                          const isFocused = focusedPeriodNumber === slot.periodNumber;

                          return (
                            <td
                              key={`${student.id}_${slot.id}`}
                              onClick={() => handleCellClick(student.id, slot)}
                              className={`px-3 py-2 border-l border-slate-100 text-center transition-all ${
                                !perm.authorized
                                  ? 'bg-slate-50/60 cursor-not-allowed hover:bg-slate-100/50'
                                  : 'cursor-pointer hover:bg-emerald-50/40'
                              } ${isFocused ? 'bg-slate-50/30' : ''}`}
                              title={
                                perm.authorized
                                  ? `Click to cycle status for ${student.name} (${slot.period})`
                                  : `Read-Only: ${perm.reason}`
                              }
                            >
                              {/* Status Badge with accessible text & color */}
                              <div className="inline-flex items-center justify-center w-full">
                                {status === 'Present' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                                    <span>✓ Present</span>
                                  </span>
                                )}

                                {status === 'Absent' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                                    <X className="w-3.5 h-3.5 text-rose-700 stroke-[3]" />
                                    <span>✕ Absent</span>
                                  </span>
                                )}

                                {status === 'Not Marked' && (
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-dashed ${
                                    perm.authorized
                                      ? 'bg-slate-50 text-slate-500 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                                      : 'bg-slate-100/70 text-slate-400 border-slate-200'
                                  }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    <span>Not Marked</span>
                                    {!perm.authorized && <Lock className="w-2.5 h-2.5 text-slate-400 ml-0.5" />}
                                  </span>
                                )}

                                {(status === 'Late' || status === 'Excused' || status === 'Half Day') && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>{status}</span>
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Matrix Legend Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-800">Status Legend:</span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ✓ Present
                </span>
                <span className="flex items-center gap-1.5 font-medium text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> ✕ Absent
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> ○ Not Marked
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500">
                <span className="flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Authorized Lesson (Editable)
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Read-Only (Assigned to Colleague)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: PERIOD SUMMARY & ABSENT ROLL */}
      {activeMatrixTab === 'summary' && focusedSlot && (
        <div className="space-y-6">
          {/* Summary Metric Cards for Focused Period */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Enrolled
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {focusedPeriodMetrics.total}
              </span>
              <span className="text-[11px] text-slate-500">{selectedClass} Cohort</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                ✓ Present
              </span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                {focusedPeriodMetrics.present}
              </span>
              <span className="text-[11px] text-slate-500">Physical attendance</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                ✕ Absent
              </span>
              <span className="text-2xl font-bold text-rose-700 mt-1 block">
                {focusedPeriodMetrics.absent}
              </span>
              <span className="text-[11px] text-slate-500">Unaccounted absence</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ○ Not Marked
              </span>
              <span className="text-2xl font-bold text-slate-700 mt-1 block">
                {focusedPeriodMetrics.notMarked}
              </span>
              <span className="text-[11px] text-slate-500">Pending register roll</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                Completion Rate
              </span>
              <span className="text-2xl font-bold text-indigo-700 mt-1 block">
                {focusedPeriodMetrics.completionRate}%
              </span>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${focusedPeriodMetrics.completionRate}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Session Status
              </span>
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                  focusedSession?.status === 'Submitted'
                    ? 'bg-blue-100 text-blue-800'
                    : focusedSession?.status === 'Draft'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {focusedSession?.status || 'Not Started'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {focusedSession?.submittedAt ? `By ${focusedSession.submittedBy}` : 'Draft editable'}
                </span>
              </div>
            </div>
          </div>

          {/* Absent Students Roster */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Absent Students in {focusedSlot.period} ({focusedSlot.subject})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified student absences requiring guardian notification or administrative gate pass.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                {focusedPeriodMetrics.absentStudents.length} Absent
              </span>
            </div>

            {focusedPeriodMetrics.absentStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <UserCheck className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                <p className="font-semibold text-slate-700 text-sm">No Absent Students Recorded</p>
                <p className="text-xs text-slate-400 mt-1">
                  All marked students for {focusedSlot.period} are recorded as Present.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {focusedPeriodMetrics.absentStudents.map((std) => (
                  <div
                    key={std.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
                        {std.rollNo || '00'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{std.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Admission: {std.admissionId} · Parent: {std.parentName} ({std.parentPhone})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setStudentStatus(std.id, 'Present');
                          addToast('Marked Present', `${std.name} changed to Present.`, 'success');
                        }}
                        disabled={!focusedPermission.authorized}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        Change to Present
                      </button>

                      <button
                        onClick={() => {
                          addToast(
                            'Guardian Alert Sent',
                            `Automated SMS/Email broadcast sent to ${std.parentName} (${std.parentPhone}) regarding ${std.name}'s absence in ${focusedSlot.subject}.`,
                            'info'
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        Notify Parent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Tab 3: CORRECTIONS & APPROVAL QUEUE */}
      {activeMatrixTab === 'corrections' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">Attendance Correction Requests</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Formal audit requests to change attendance on officially submitted registers. Institutional rules require Vice Principal or Principal sign-off.
            </p>

            <div className="mt-4 divide-y divide-slate-100">
              {(state.attendanceCorrections || []).length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <FileCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-600">No correction requests recorded.</p>
                </div>
              ) : (
                (state.attendanceCorrections || []).map((req) => (
                  <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{req.studentName}</span>
                        <span className="text-[10px] font-mono text-slate-400">({req.class} · {req.period})</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Change proposed: <strong className="text-rose-600">{req.currentStatus}</strong> → <strong className="text-emerald-600">{req.proposedStatus}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        "{req.reason}" — Requested by {req.requestedBy} at {req.requestedAt}
                      </p>
                    </div>

                    {/* Review controls for Principal / VP */}
                    {(state.currentRole === 'principal' || state.currentRole === 'vice_principal') && req.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => reviewAttendanceCorrection(req.id, 'Approved', 'Verified through gate pass record.')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        >
                          Approve Change
                        </button>
                        <button
                          onClick={() => reviewAttendanceCorrection(req.id, 'Rejected', 'Insufficient justification.')}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REVIEW AND SUBMIT (Prompt Requirement 9) */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review & Submit Official Attendance Register"
        subtitle="Verify all student roll marks before committing to the institutional ledger."
      >
        {focusedSlot && (
          <div className="space-y-4 text-xs">
            {/* Cohort & Lesson Header Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Class & Section</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedClass} (Section {selectedSection})</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance Date</span>
                  <span className="font-bold text-slate-900">{formattedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Period & Subject</span>
                  <span className="font-bold text-slate-900">{focusedSlot.period} — {focusedSlot.subject}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheduled Time</span>
                  <span className="font-semibold text-slate-700">{focusedSlot.time} ({focusedSlot.room})</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Authorized Faculty</span>
                  <span className="font-semibold text-slate-700">{activeTeacher.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Faculty ID</span>
                  <span className="font-mono text-slate-700">{activeTeacher.employeeId}</span>
                </div>
              </div>
            </div>

            {/* Attendance Metrics Breakdown */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
                <span className="text-lg font-bold text-slate-800">{focusedPeriodMetrics.total}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Present</span>
                <span className="text-lg font-bold text-emerald-800">{focusedPeriodMetrics.present}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50">
                <span className="text-[10px] font-bold text-rose-700 uppercase block">Absent</span>
                <span className="text-lg font-bold text-rose-800">{focusedPeriodMetrics.absent}</span>
              </div>
              <div className={`p-2.5 rounded-lg border ${
                focusedPeriodMetrics.notMarked > 0
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}>
                <span className="text-[10px] font-bold uppercase block">Not Marked</span>
                <span className="text-lg font-bold">{focusedPeriodMetrics.notMarked}</span>
              </div>
            </div>

            {/* Incomplete Warning if any Not Marked */}
            {focusedPeriodMetrics.notMarked > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Register Incomplete: Cannot Submit</strong>
                  <span>
                    {focusedPeriodMetrics.notMarked} students remain 'Not Marked'. School policy requires every student to be marked Present or Absent before final submission. Please return to the matrix to complete the roll, or save as a draft.
                  </span>
                </div>
              </div>
            )}

            {/* Absent Students Summary List */}
            <div>
              <span className="font-bold text-slate-800 block mb-1">
                Absent Students in this Period ({focusedPeriodMetrics.absentStudents.length}):
              </span>
              {focusedPeriodMetrics.absentStudents.length === 0 ? (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium">
                  ✓ Full attendance recorded: No students are marked absent.
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg p-2 bg-slate-50">
                  {focusedPeriodMetrics.absentStudents.map((s) => (
                    <div key={s.id} className="py-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <span className="font-mono text-slate-400">{s.admissionId}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Explicit Confirmation Checkbox */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConfirmedReview}
                  onChange={(e) => setHasConfirmedReview(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-700">
                  I, <strong>{activeTeacher.name}</strong>, certify that this attendance register accurately reflects physical student attendance for <strong>{focusedSlot.period} ({focusedSlot.subject})</strong> on {selectedDate}.
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
              >
                Back to Matrix
              </button>

              <button
                type="button"
                onClick={handleExecuteSubmit}
                disabled={focusedPeriodMetrics.notMarked > 0 || !hasConfirmedReview || isSubmitting}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all ${
                  focusedPeriodMetrics.notMarked === 0 && hasConfirmedReview && !isSubmitting
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed opacity-60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Recording...' : 'Submit Official Attendance'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: CONFIRM OVERWRITE MARKS */}
      <Modal
        isOpen={isOverwriteModalOpen}
        onClose={() => setIsOverwriteModalOpen(false)}
        title="Confirm Bulk Action"
        subtitle="Existing student attendance marks detected for this period."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Some students in <strong>{focusedSlot?.period}</strong> already have attendance marks recorded. Marking all students as <strong>Present</strong> will overwrite any existing absent marks.
          </p>
          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Are you sure you want to overwrite all marks for this period with 'Present'?</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsOverwriteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={executeMarkAllPresent}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
            >
              Yes, Overwrite with Present
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: REQUEST ATTENDANCE CORRECTION */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="Request Attendance Correction"
        subtitle="Submit official adjustment for already submitted attendance record."
      >
        {correctionStudent && (
          <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">{correctionStudent.name}</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {correctionStudent.admissionId} · {selectedClass} · {focusedSlot?.period}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Recorded Status</label>
              <input
                type="text"
                disabled
                value={correctionStudent.currentStatus}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposed New Status</label>
              <select
                value={correctionProposedStatus}
                onChange={(e) => setCorrectionProposedStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold text-slate-800 bg-white"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason for Correction <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Student arrived at 08:45 AM with excused medical pass from nurse; mistakenly marked absent."
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCorrectionModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold"
              >
                Submit Correction Request
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
