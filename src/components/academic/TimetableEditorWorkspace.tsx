import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TimetableSlot, THEMES, TimetableRevision, TimetableMetadata } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar,
  Clock,
  Layers,
  Users,
  Building,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Download,
  BookOpen,
  History,
  Send,
  Eye,
  Sparkles,
  Info,
  CalendarDays,
  FileCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface TimetableEditorWorkspaceProps {
  initialClass?: string;
  canEdit?: boolean;
}

export const TimetableEditorWorkspace: React.FC<TimetableEditorWorkspaceProps> = ({
  initialClass = 'Grade 10A',
  canEdit = true,
}) => {
  const {
    state,
    saveTimetableSlot,
    deleteTimetableSlot,
    publishTimetable,
    addToast,
  } = useApp();

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  // View Mode: 'class' | 'day' | 'teacher' | 'room' | 'matrix'
  const [viewMode, setViewMode] = useState<'class' | 'day' | 'teacher' | 'room' | 'matrix'>('class');

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(state.teachers[0]?.id || 'tch-sterling');
  const [selectedRoom, setSelectedRoom] = useState<string>('Room 301');

  // Modals & Panels
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<TimetableSlot | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishVersionNote, setPublishVersionNote] = useState('');
  const [isRevisionHistoryOpen, setIsRevisionHistoryOpen] = useState(false);
  const [showConflictsPanel, setShowConflictsPanel] = useState(false);

  // Form state
  const [formDay, setFormDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [formPeriodNum, setFormPeriodNum] = useState<number>(1);
  const [formClass, setFormClass] = useState<string>(selectedClass);
  const [formSubject, setFormSubject] = useState<string>('Mathematics');
  const [formTeacherId, setFormTeacherId] = useState<string>('tch-sterling');
  const [formRoom, setFormRoom] = useState<string>('Room 301');
  const [formType, setFormType] = useState<TimetableSlot['type']>('Lecture');
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  const periodDefs = [
    { periodNumber: 1, label: 'Period 1', time: '08:30 - 09:15 AM' },
    { periodNumber: 2, label: 'Period 2', time: '09:15 - 10:00 AM' },
    { periodNumber: 3, label: 'Period 3', time: '10:20 - 11:05 AM' },
    { periodNumber: 4, label: 'Period 4', time: '11:05 - 11:50 AM' },
    { periodNumber: 5, label: 'Period 5', time: '12:40 - 01:25 PM' },
    { periodNumber: 6, label: 'Period 6', time: '01:25 - 02:10 PM' },
    { periodNumber: 7, label: 'Period 7', time: '02:15 - 03:00 PM' },
  ];

  // Distinct rooms
  const rooms = useMemo(() => {
    const set = new Set<string>();
    state.classes.forEach((c) => set.add(c.roomNumber));
    (state.timetable || []).forEach((t) => {
      if (t.room) set.add(t.room);
    });
    set.add('Science Lab A');
    set.add('Computer Lab');
    set.add('Library');
    return Array.from(set).sort();
  }, [state.classes, state.timetable]);

  // Timetable Metadata for current class
  const classMetadata: TimetableMetadata = useMemo(() => {
    return (
      state.timetableMetadata?.[selectedClass] || {
        academicYearId: state.activeAcademicYearId,
        class: selectedClass,
        version: 'v1.0',
        status: 'Draft',
        lastModified: '2026-10-18',
        notes: 'Initial academic draft',
      }
    );
  }, [state.timetableMetadata, selectedClass, state.activeAcademicYearId]);

  // Comprehensive Conflict Detection Engine
  const detectedConflicts = useMemo(() => {
    const list: {
      id: string;
      type: 'Teacher Overlap' | 'Room Double-Booking' | 'Class Conflict';
      day: string;
      periodNumber: number;
      periodTime: string;
      class1: string;
      class2: string;
      teacherName: string;
      room: string;
      explanation: string;
      slot1: TimetableSlot;
      slot2: TimetableSlot;
    }[] = [];

    const allSlots = state.timetable || [];
    for (let i = 0; i < allSlots.length; i++) {
      for (let j = i + 1; j < allSlots.length; j++) {
        const s1 = allSlots[i];
        const s2 = allSlots[j];

        if (s1.day === s2.day && s1.periodNumber === s2.periodNumber) {
          // 1. Teacher Conflict: Same teacher teaching two different classes
          if (s1.teacherId === s2.teacherId && s1.class !== s2.class) {
            list.push({
              id: `tc-${s1.id}-${s2.id}`,
              type: 'Teacher Overlap',
              day: s1.day,
              periodNumber: s1.periodNumber,
              periodTime: s1.time,
              class1: s1.class,
              class2: s2.class,
              teacherName: s1.teacherName,
              room: `${s1.room} & ${s2.room}`,
              explanation: `${s1.teacherName} is scheduled to teach ${s1.subject} in ${s1.class} and ${s2.subject} in ${s2.class} concurrently during Period ${s1.periodNumber} (${s1.time}).`,
              slot1: s1,
              slot2: s2,
            });
          }
          // 2. Room Conflict: Same room booked for two different classes
          else if (s1.room && s2.room && s1.room === s2.room && s1.class !== s2.class) {
            list.push({
              id: `rc-${s1.id}-${s2.id}`,
              type: 'Room Double-Booking',
              day: s1.day,
              periodNumber: s1.periodNumber,
              periodTime: s1.time,
              class1: s1.class,
              class2: s2.class,
              teacherName: `${s1.teacherName} & ${s2.teacherName}`,
              room: s1.room,
              explanation: `Classroom ${s1.room} is double-booked for ${s1.class} (${s1.subject}) and ${s2.class} (${s2.subject}) in Period ${s1.periodNumber}.`,
              slot1: s1,
              slot2: s2,
            });
          }
          // 3. Class Conflict: Same class scheduled twice
          else if (s1.class === s2.class) {
            list.push({
              id: `cc-${s1.id}-${s2.id}`,
              type: 'Class Conflict',
              day: s1.day,
              periodNumber: s1.periodNumber,
              periodTime: s1.time,
              class1: s1.class,
              class2: s2.class,
              teacherName: `${s1.teacherName} & ${s2.teacherName}`,
              room: `${s1.room}`,
              explanation: `${s1.class} has two overlapping lessons scheduled in Period ${s1.periodNumber}: ${s1.subject} and ${s2.subject}.`,
              slot1: s1,
              slot2: s2,
            });
          }
        }
      }
    }
    return list;
  }, [state.timetable]);

  // Open Add Period modal
  const openAddModal = (
    day?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday',
    pNum?: number,
    clsName?: string
  ) => {
    const targetClass = clsName || selectedClass;
    setEditingSlot(null);
    setFormDay(day || selectedDay);
    setFormPeriodNum(pNum || 1);
    setFormClass(targetClass);

    // Auto-detect homeroom or allocated subjects
    const classObj = state.classes.find((c) => c.name === targetClass);
    const classAllocations = (state.subjectAllocations || []).filter(
      (a) => a.class === targetClass
    );

    const defaultSubject = classAllocations[0]?.subjectName || 'Mathematics';
    const defaultTeacherId = classAllocations[0]?.teacherId || classObj?.classTeacherId || 'tch-sterling';

    setFormSubject(defaultSubject);
    setFormTeacherId(defaultTeacherId);
    setFormRoom(classObj?.roomNumber || 'Room 301');
    setFormType('Lecture');
    setFormValidationError(null);
    setIsSlotModalOpen(true);
  };

  // Open Edit Period modal
  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormDay(slot.day);
    setFormPeriodNum(slot.periodNumber);
    setFormClass(slot.class);
    setFormSubject(slot.subject);
    setFormTeacherId(slot.teacherId);
    setFormRoom(slot.room);
    setFormType(slot.type || 'Lecture');
    setFormValidationError(null);
    setIsSlotModalOpen(true);
  };

  // Auto-update teacher when subject changes in modal
  const handleSubjectChange = (subjectName: string) => {
    setFormSubject(subjectName);
    const alloc = (state.subjectAllocations || []).find(
      (a) => a.class === formClass && a.subjectName === subjectName
    );
    if (alloc && alloc.teacherId && alloc.teacherId !== 'unassigned') {
      setFormTeacherId(alloc.teacherId);
    }
  };

  const validateSlotForm = (): boolean => {
    // 1. Check duplicate slot in same cell for this class
    const existingSameClass = (state.timetable || []).find((s) => {
      if (editingSlot && s.id === editingSlot.id) return false;
      return (
        s.class === formClass &&
        s.day === formDay &&
        s.periodNumber === formPeriodNum
      );
    });

    if (existingSameClass) {
      setFormValidationError(
        `${formClass} already has a lesson scheduled for ${formDay} Period ${formPeriodNum} (${existingSameClass.subject}). Delete or edit that slot first.`
      );
      return false;
    }

    // 2. Pre-check Teacher Overlap
    const teacherConflict = (state.timetable || []).find((s) => {
      if (editingSlot && s.id === editingSlot.id) return false;
      return (
        s.teacherId === formTeacherId &&
        s.day === formDay &&
        s.periodNumber === formPeriodNum &&
        s.class !== formClass
      );
    });

    if (teacherConflict) {
      const tchName = state.teachers.find((t) => t.id === formTeacherId)?.name || 'This teacher';
      setFormValidationError(
        `Teacher Conflict: ${tchName} is already assigned to teach ${teacherConflict.class} (${teacherConflict.subject}) during ${formDay} Period ${formPeriodNum}.`
      );
      return false;
    }

    // 3. Pre-check Room Double-Booking
    if (formRoom) {
      const roomConflict = (state.timetable || []).find((s) => {
        if (editingSlot && s.id === editingSlot.id) return false;
        return (
          s.room === formRoom &&
          s.day === formDay &&
          s.periodNumber === formPeriodNum &&
          s.class !== formClass
        );
      });

      if (roomConflict) {
        setFormValidationError(
          `Room Double-Booking: Classroom ${formRoom} is already occupied by ${roomConflict.class} (${roomConflict.subject}) during ${formDay} Period ${formPeriodNum}.`
        );
        return false;
      }
    }

    setFormValidationError(null);
    return true;
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSlotForm()) return;

    const periodObj = periodDefs.find((p) => p.periodNumber === formPeriodNum) || periodDefs[0];
    const teacherObj = state.teachers.find((t) => t.id === formTeacherId);

    const slotPayload: TimetableSlot = {
      id: editingSlot ? editingSlot.id : 'tt-' + Date.now(),
      day: formDay,
      period: periodObj.label,
      periodNumber: formPeriodNum,
      time: periodObj.time,
      class: formClass,
      subject: formSubject,
      teacherId: formTeacherId,
      teacherName: teacherObj ? teacherObj.name : 'Faculty Member',
      room: formRoom,
      type: formType,
    };

    saveTimetableSlot(slotPayload);
    setIsSlotModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (slotToDelete) {
      deleteTimetableSlot(slotToDelete.id);
      setSlotToDelete(null);
    }
  };

  const handlePublishTimetable = (e: React.FormEvent) => {
    e.preventDefault();
    publishTimetable(selectedClass, publishVersionNote);
    setIsPublishModalOpen(false);
    setPublishVersionNote('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const slots = (state.timetable || []).filter((s) => s.class === selectedClass);
    const headers = 'Day,Period,Time,Class,Subject,Teacher,Room,Type\n';
    const rows = slots
      .map(
        (s) =>
          `"${s.day}","${s.period}","${s.time}","${s.class}","${s.subject}","${s.teacherName}","${s.room}","${s.type}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Greenfield_Timetable_${selectedClass.replace(/\s+/g, '_')}_${classMetadata.version}.csv`;
    a.click();
    addToast('Schedule Exported', 'CSV download initiated.', 'success');
  };

  // Timetable slots for currently selected class
  const classSlots = useMemo(() => {
    return (state.timetable || []).filter((s) => s.class === selectedClass);
  }, [state.timetable, selectedClass]);

  // Timetable slots for currently selected teacher
  const teacherSlots = useMemo(() => {
    return (state.timetable || []).filter((s) => s.teacherId === selectedTeacherId);
  }, [state.timetable, selectedTeacherId]);

  // Timetable slots for currently selected room
  const roomSlots = useMemo(() => {
    return (state.timetable || []).filter((s) => s.room === selectedRoom);
  }, [state.timetable, selectedRoom]);

  // Helper to check if a specific slot has an active conflict
  const getSlotConflict = (slotId: string) => {
    return detectedConflicts.find((c) => c.slot1.id === slotId || c.slot2.id === slotId);
  };

  const selectedTeacherObj = state.teachers.find((t) => t.id === selectedTeacherId);

  return (
    <div className="space-y-6">
      {/* Master Workspace Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Calendar className="w-5 h-5" style={{ color: currentTheme.primary }} />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Master Timetable & Lesson Scheduler
              </h2>
              {/* Published vs Draft Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  classMetadata.status === 'Published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {classMetadata.status === 'Published' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {classMetadata.status} ({classMetadata.version})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Greenfield International School · Academic Year 2026–2027 · 5-Day Weekly Instructional Grid (7 Periods/Day)
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {canEdit && (
              <>
                <button
                  onClick={() => openAddModal()}
                  style={{ backgroundColor: currentTheme.primary }}
                  className="flex items-center gap-1.5 px-3.5 py-2 hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Lesson Period
                </button>

                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish Timetable
                </button>
              </>
            )}

            <button
              onClick={() => setIsRevisionHistoryOpen(true)}
              className="p-2 text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              title="View Revision Changelog"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportCSV}
              className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              title="Print Schedule"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher and Filters Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setViewMode('class')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'class'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Class Weekly Grid
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'day'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              Single Day View
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'teacher'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Teacher Timetable
            </button>
            <button
              onClick={() => setViewMode('room')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'room'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-amber-600" />
              Room Timetable
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              Availability Matrix
            </button>
          </div>

          {/* Contextual Selectors based on View Mode */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {viewMode === 'class' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Cohort:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  {state.classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.roomNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewMode === 'day' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-semibold">Cohort:</span>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                  >
                    {state.classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-semibold">Day:</span>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {viewMode === 'teacher' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Faculty:</span>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  {state.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects.join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewMode === 'room' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Facility / Room:</span>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  {rooms.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Conflict Detection Banner */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            {detectedConflicts.length > 0 ? (
              <button
                onClick={() => setShowConflictsPanel(!showConflictsPanel)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                {detectedConflicts.length} Conflict{detectedConflicts.length > 1 ? 's' : ''} Detected
                (Click to view & resolve)
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                0 Timetable Conflicts (Verified Clear)
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            <span>Class: <strong className="text-slate-800">{selectedClass}</strong></span>
            <span className="mx-2">·</span>
            <span>Version: <strong className="text-slate-800">{classMetadata.version}</strong></span>
            {classMetadata.publishedAt && (
              <>
                <span className="mx-2">·</span>
                <span>Published: {classMetadata.publishedAt}</span>
              </>
            )}
          </div>
        </div>

        {/* Expandable Conflict Panel */}
        {showConflictsPanel && detectedConflicts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Active Scheduling Conflicts ({detectedConflicts.length})
              </h4>
              <button
                onClick={() => setShowConflictsPanel(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                Dismiss Panel
              </button>
            </div>

            <div className="space-y-2">
              {detectedConflicts.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-rose-900 uppercase text-[10px] bg-rose-100 px-2 py-0.5 rounded">
                        {c.type}
                      </span>
                      <span className="font-mono text-slate-700 font-semibold">
                        {c.day} · Period {c.periodNumber} ({c.periodTime})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white font-medium text-slate-700 border border-slate-200 text-[11px]">
                        {c.class1} vs {c.class2}
                      </span>
                    </div>
                    <p className="text-rose-800 text-[11px] leading-relaxed">{c.explanation}</p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => openEditModal(c.slot1)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-semibold text-xs transition-colors shrink-0 self-start sm:self-auto"
                    >
                      Resolve Slot →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: CLASS WEEKLY GRID (Mon-Fri x 7 Periods) */}
      {viewMode === 'class' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3 border-r border-slate-200 w-36">Period & Timing</th>
                  {days.map((day) => (
                    <th key={day} className="px-3 py-3 border-r border-slate-200 last:border-r-0 text-center">
                      <span className="block text-slate-900 font-bold">{day}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        {classSlots.filter((s) => s.day === day).length} Lessons
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periodDefs.map((p) => {
                  const isRecessBefore = p.periodNumber === 3;
                  const isLunchBefore = p.periodNumber === 5;

                  return (
                    <React.Fragment key={p.periodNumber}>
                      {/* Morning Break */}
                      {isRecessBefore && (
                        <tr className="bg-amber-50/50 text-amber-800 text-[11px] border-y border-amber-200/40">
                          <td className="px-4 py-1.5 font-bold border-r border-amber-200/40">
                            10:00 - 10:20 AM
                          </td>
                          <td colSpan={5} className="px-3 py-1.5 text-center font-semibold tracking-wider uppercase text-[10px]">
                            ☕ Morning Break & Homeroom Check
                          </td>
                        </tr>
                      )}

                      {/* Lunch Break */}
                      {isLunchBefore && (
                        <tr className="bg-emerald-50/50 text-emerald-800 text-[11px] border-y border-emerald-200/40">
                          <td className="px-4 py-1.5 font-bold border-r border-emerald-200/40">
                            11:50 AM - 12:40 PM
                          </td>
                          <td colSpan={5} className="px-3 py-1.5 text-center font-semibold tracking-wider uppercase text-[10px]">
                            🥗 Campus Lunch & Activity Interval
                          </td>
                        </tr>
                      )}

                      <tr>
                        <td className="px-4 py-3 border-r border-slate-200 bg-slate-50/50 align-top">
                          <span className="font-bold text-slate-900 block">{p.label}</span>
                          <span className="text-[11px] font-mono text-slate-500">{p.time}</span>
                        </td>

                        {days.map((day) => {
                          const slot = classSlots.find(
                            (s) => s.day === day && s.periodNumber === p.periodNumber
                          );
                          const conflict = slot ? getSlotConflict(slot.id) : null;

                          return (
                            <td
                              key={day}
                              className={`p-2 border-r border-slate-100 last:border-r-0 align-top transition-colors min-h-[90px] ${
                                conflict ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'
                              }`}
                            >
                              {slot ? (
                                <div
                                  className={`p-2.5 rounded-xl border relative group flex flex-col justify-between h-full min-h-[85px] transition-all shadow-2xs ${
                                    conflict
                                      ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400'
                                      : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-1">
                                      <span className="font-bold text-slate-900 leading-tight">
                                        {slot.subject}
                                      </span>
                                      {conflict && (
                                        <span title={conflict.explanation}>
                                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                                      <Users className="w-3 h-3 text-slate-400" />
                                      <span className="truncate">{slot.teacherName}</span>
                                    </div>
                                  </div>

                                  <div className="mt-2 pt-1.5 border-t border-slate-100/80 flex items-center justify-between text-[10px]">
                                    <span className="font-mono text-slate-400 font-medium">
                                      {slot.room}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                                      {slot.type}
                                    </span>
                                  </div>

                                  {/* Hover action overlay */}
                                  {canEdit && (
                                    <div className="absolute top-1.5 right-1.5 hidden group-hover:flex items-center gap-1 bg-white/95 p-1 rounded-lg border border-slate-200 shadow-xs">
                                      <button
                                        onClick={() => openEditModal(slot)}
                                        className="p-1 text-slate-600 hover:text-indigo-600 rounded"
                                        title="Edit Period"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => setSlotToDelete(slot)}
                                        className="p-1 text-slate-600 hover:text-rose-600 rounded"
                                        title="Delete Period"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  onClick={() => canEdit && openAddModal(day, p.periodNumber)}
                                  className={`h-full min-h-[85px] rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-2 text-center transition-all ${
                                    canEdit
                                      ? 'cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30'
                                      : 'opacity-50'
                                  }`}
                                >
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {canEdit ? '+ Assign Lesson' : 'Free Period'}
                                  </span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: SINGLE DAY VIEW */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">
              {selectedDay} Schedule — {selectedClass}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sequence of 7 instructional periods with timing and faculty allocations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {periodDefs.map((p) => {
              const slot = classSlots.find(
                (s) => s.day === selectedDay && s.periodNumber === p.periodNumber
              );
              const conflict = slot ? getSlotConflict(slot.id) : null;

              return (
                <div
                  key={p.periodNumber}
                  className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between ${
                    conflict
                      ? 'border-rose-300 ring-2 ring-rose-500/10'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700">
                        {p.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{p.time}</span>
                    </div>

                    {slot ? (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-base">{slot.subject}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {slot.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{slot.teacherName}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.room}</span>
                        </div>

                        {conflict && (
                          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <span>{conflict.explanation}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-slate-400 text-xs">
                        Free Instructional Period
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    {slot ? (
                      canEdit && (
                        <>
                          <button
                            onClick={() => openEditModal(slot)}
                            className="px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setSlotToDelete(slot)}
                            className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold"
                          >
                            Delete
                          </button>
                        </>
                      )
                    ) : (
                      canEdit && (
                        <button
                          onClick={() => openAddModal(selectedDay, p.periodNumber)}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold"
                        >
                          + Assign Lesson
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: TEACHER TIMETABLE */}
      {viewMode === 'teacher' && selectedTeacherObj && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Faculty Schedule: {selectedTeacherObj.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedTeacherObj.roleTitle} · {selectedTeacherObj.subjects.join(', ')} ·{' '}
                <strong className="text-slate-800 font-mono">{teacherSlots.length}</strong> Periods Scheduled
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200">
                Workload: {teacherSlots.length * 0.75} Hours / Week
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3 border-r border-slate-200 w-36">Period</th>
                    {days.map((day) => (
                      <th key={day} className="px-3 py-3 border-r border-slate-200 last:border-r-0 text-center">
                        <span className="font-bold text-slate-900">{day}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periodDefs.map((p) => (
                    <tr key={p.periodNumber}>
                      <td className="px-4 py-3 border-r border-slate-200 bg-slate-50/50">
                        <span className="font-bold text-slate-900 block">{p.label}</span>
                        <span className="text-[11px] font-mono text-slate-500">{p.time}</span>
                      </td>
                      {days.map((day) => {
                        const slots = teacherSlots.filter(
                          (s) => s.day === day && s.periodNumber === p.periodNumber
                        );
                        const isConflict = slots.length > 1;

                        return (
                          <td
                            key={day}
                            className={`p-2 border-r border-slate-100 last:border-r-0 align-top ${
                              isConflict ? 'bg-rose-50' : ''
                            }`}
                          >
                            {slots.length > 0 ? (
                              <div className="space-y-1.5">
                                {slots.map((s) => (
                                  <div
                                    key={s.id}
                                    className={`p-2 rounded-xl border text-xs ${
                                      isConflict
                                        ? 'bg-rose-100 border-rose-300 text-rose-900'
                                        : 'bg-indigo-50/60 border-indigo-100 text-indigo-950'
                                    }`}
                                  >
                                    <div className="font-bold flex items-center justify-between">
                                      <span>{s.class}</span>
                                      <span className="text-[10px] text-slate-500">{s.room}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-700">{s.subject}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-12 rounded-lg bg-emerald-50/30 border border-dashed border-emerald-100 flex items-center justify-center text-[11px] text-emerald-600 font-medium">
                                Free Period
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: ROOM TIMETABLE */}
      {viewMode === 'room' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Facility Schedule: {selectedRoom}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Occupancy tracking ·{' '}
                <strong className="text-slate-800 font-mono">{roomSlots.length}</strong> of 35 weekly periods booked ({Math.round((roomSlots.length / 35) * 100)}% utilization)
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 font-semibold rounded-lg border border-amber-200 text-xs">
              Room Utilization: {Math.round((roomSlots.length / 35) * 100)}%
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3 border-r border-slate-200 w-36">Period</th>
                    {days.map((day) => (
                      <th key={day} className="px-3 py-3 border-r border-slate-200 last:border-r-0 text-center">
                        <span className="font-bold text-slate-900">{day}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periodDefs.map((p) => (
                    <tr key={p.periodNumber}>
                      <td className="px-4 py-3 border-r border-slate-200 bg-slate-50/50">
                        <span className="font-bold text-slate-900 block">{p.label}</span>
                        <span className="text-[11px] font-mono text-slate-500">{p.time}</span>
                      </td>
                      {days.map((day) => {
                        const slots = roomSlots.filter(
                          (s) => s.day === day && s.periodNumber === p.periodNumber
                        );
                        const isConflict = slots.length > 1;

                        return (
                          <td
                            key={day}
                            className={`p-2 border-r border-slate-100 last:border-r-0 align-top ${
                              isConflict ? 'bg-rose-50' : ''
                            }`}
                          >
                            {slots.length > 0 ? (
                              <div className="space-y-1.5">
                                {slots.map((s) => (
                                  <div
                                    key={s.id}
                                    className={`p-2 rounded-xl border text-xs ${
                                      isConflict
                                        ? 'bg-rose-100 border-rose-300 text-rose-900'
                                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                                    }`}
                                  >
                                    <div className="font-bold flex items-center justify-between">
                                      <span>{s.class}</span>
                                      <span className="text-[10px] text-slate-500">{s.type}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-700">{s.subject}</div>
                                    <div className="text-[10px] text-slate-500">{s.teacherName}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-12 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400">
                                Vacant
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: TEACHER & ROOM AVAILABILITY MATRIX */}
      {viewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">
              Campus Availability Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live scan of faculty and room allocations across the 5 academic days to identify free substitution candidates and unbooked spaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Faculty Availability */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Faculty Teaching Load & Free Periods
              </h4>
              <div className="space-y-3 text-xs">
                {state.teachers.map((t) => {
                  const scheduledCount = (state.timetable || []).filter(
                    (s) => s.teacherId === t.id
                  ).length;
                  const totalPeriods = 35;
                  const freePeriods = totalPeriods - scheduledCount;
                  const pct = Math.round((scheduledCount / 24) * 100);

                  return (
                    <div key={t.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900">{t.name}</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {scheduledCount} / 24 max periods ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full ${
                            scheduledCount > 24
                              ? 'bg-rose-500'
                              : scheduledCount >= 18
                              ? 'bg-emerald-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>{t.subjects.join(', ')}</span>
                        <span className="text-emerald-700 font-semibold">{freePeriods} Free Periods / Wk</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Availability */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-amber-600" />
                Classrooms & Laboratories Occupancy
              </h4>
              <div className="space-y-3 text-xs">
                {rooms.map((room) => {
                  const scheduledCount = (state.timetable || []).filter(
                    (s) => s.room === room
                  ).length;
                  const pct = Math.round((scheduledCount / 35) * 100);

                  return (
                    <div key={room} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900">{room}</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {scheduledCount} / 35 periods ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full ${
                            pct > 80
                              ? 'bg-rose-500'
                              : pct >= 50
                              ? 'bg-indigo-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Standard Instructional Room</span>
                        <span className="text-slate-600 font-medium">{35 - scheduledCount} Vacant Slots</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lesson Period Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title={editingSlot ? 'Edit Lesson Period' : 'Add Timetable Lesson'}
        subtitle={`Schedule a lesson for ${formClass} on ${formDay}.`}
      >
        <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
          {formValidationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formValidationError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Day of Week *</label>
              <select
                value={formDay}
                onChange={(e) => setFormDay(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Period & Time *</label>
              <select
                value={formPeriodNum}
                onChange={(e) => setFormPeriodNum(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
              >
                {periodDefs.map((p) => (
                  <option key={p.periodNumber} value={p.periodNumber}>
                    {p.label} ({p.time})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Class Cohort *</label>
              <select
                value={formClass}
                onChange={(e) => {
                  setFormClass(e.target.value);
                  const cObj = state.classes.find((c) => c.name === e.target.value);
                  if (cObj) setFormRoom(cObj.roomNumber);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {state.classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Curriculum Subject *</label>
              <select
                value={formSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {(state.subjects || []).map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Teacher *</label>
              <select
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {state.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subjects.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Instructional Room *</label>
              <select
                value={formRoom}
                onChange={(e) => setFormRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {rooms.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Session Type</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="Lecture">Lecture (Standard Classroom)</option>
              <option value="Lab">Lab (Hands-on Science/Computer)</option>
              <option value="Practical">Practical Workshop</option>
              <option value="Sports">Physical Education / Sports</option>
              <option value="Library">Library Reading & Research</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSlotModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              {editingSlot ? 'Save Lesson' : 'Confirm Schedule Slot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Slot Confirmation Modal */}
      {slotToDelete && (
        <Modal
          isOpen={!!slotToDelete}
          onClose={() => setSlotToDelete(null)}
          title="Remove Timetable Lesson?"
          subtitle={`Delete ${slotToDelete.subject} on ${slotToDelete.day} ${slotToDelete.period}?`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Cohort:</span>
                <span className="font-bold text-slate-900">{slotToDelete.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timing:</span>
                <span className="font-mono text-slate-900">{slotToDelete.day} · {slotToDelete.period} ({slotToDelete.time})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-bold text-indigo-700">{slotToDelete.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Faculty:</span>
                <span className="font-medium text-slate-900">{slotToDelete.teacherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room:</span>
                <span className="font-mono text-slate-700">{slotToDelete.room}</span>
              </div>
            </div>

            <p className="text-slate-600">
              Removing this slot leaves the period vacant in all student, faculty, and classroom timetables.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSlotToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Delete Lesson
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Publish Timetable Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title={`Publish Timetable: ${selectedClass}`}
        subtitle="Make this instructional schedule official and accessible to students, faculty, and parents."
      >
        <form onSubmit={handlePublishTimetable} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              Publishing Audit Information
            </div>
            <p className="text-[11px] leading-relaxed">
              Publishing will increment the schedule to a new official version and stamp it in the revision log. All students and parents will immediately see the updated schedule.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Publication / Release Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Official mid-term schedule adjustments for science lab rotations."
              value={publishVersionNote}
              onChange={(e) => setPublishVersionNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Confirm & Publish Live
            </button>
          </div>
        </form>
      </Modal>

      {/* Revision History Modal */}
      <Modal
        isOpen={isRevisionHistoryOpen}
        onClose={() => setIsRevisionHistoryOpen(false)}
        title="Timetable Revision Changelog"
        subtitle="Auditable record of published versions, timestamps, and academic council approvals."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {(state.timetableRevisions || []).map((rev) => (
              <div key={rev.id} className="p-3.5 space-y-1 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.class}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700">
                      {rev.version}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      {rev.status}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">{rev.timestamp}</span>
                </div>
                <p className="text-slate-600 text-[11px]">{rev.changeSummary}</p>
                <div className="text-[10px] text-slate-400">Authorized By: {rev.author}</div>
              </div>
            ))}
            {(state.timetableRevisions || []).length === 0 && (
              <div className="p-6 text-center text-slate-400">
                No published revisions logged yet.
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setIsRevisionHistoryOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Close History
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
