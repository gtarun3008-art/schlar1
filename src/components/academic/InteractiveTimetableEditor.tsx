import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TimetableSlot, THEMES, Teacher } from '../../types';
import { Modal } from '../common/Modal';
import {
  Clock,
  Calendar,
  Layers,
  User,
  Plus,
  Printer,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Filter,
  Check,
  History,
  Send,
  Building,
  Sparkles,
  Info,
  CalendarDays,
  ShieldAlert,
} from 'lucide-react';

interface InteractiveTimetableEditorProps {
  initialClass?: string;
  initialTeacherId?: string;
  canEdit?: boolean;
  title?: string;
  subtitle?: string;
}

export const InteractiveTimetableEditor: React.FC<InteractiveTimetableEditorProps> = ({
  initialClass = 'Grade 10A',
  initialTeacherId,
  canEdit = true,
  title = 'Institutional Master Timetable',
  subtitle = 'Official 5-day academic instructional schedule across all cohorts, laboratories, and faculty members.',
}) => {
  const {
    state,
    saveTimetableSlot,
    deleteTimetableSlot,
    publishTimetable,
    addToast,
    logAuditEvent,
  } = useApp();

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  // View Perspective: 'class' | 'day' | 'teacher' | 'room'
  const [viewPerspective, setViewPerspective] = useState<'class' | 'day' | 'teacher' | 'room'>('class');

  // Filter selections
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(initialTeacherId || state.teachers[0]?.id || 'tch-sterling');
  const [selectedRoom, setSelectedRoom] = useState<string>('Room 301');

  // Drawers and panels
  const [showConflictsPanel, setShowConflictsPanel] = useState(false);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishNote, setPublishNote] = useState('');

  // Slot modal state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<TimetableSlot | null>(null);

  // Period definitions
  const periodDefs = [
    { periodNumber: 1, label: 'Period 1', time: '08:30 - 09:15 AM' },
    { periodNumber: 2, label: 'Period 2', time: '09:15 - 10:00 AM' },
    { periodNumber: 3, label: 'Period 3', time: '10:20 - 11:05 AM' },
    { periodNumber: 4, label: 'Period 4', time: '11:05 - 11:50 AM' },
    { periodNumber: 5, label: 'Period 5', time: '12:40 - 01:25 PM' },
    { periodNumber: 6, label: 'Period 6', time: '01:25 - 02:10 PM' },
    { periodNumber: 7, label: 'Period 7', time: '02:15 - 03:00 PM' },
  ];

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  // Distinct rooms from timetable & classes
  const availableRooms = useMemo(() => {
    const set = new Set<string>();
    state.classes.forEach((c) => set.add(c.roomNumber));
    (state.timetable || []).forEach((t) => {
      if (t.room) set.add(t.room);
    });
    set.add('Science Lab 1');
    set.add('Science Lab 2');
    set.add('Computer Lab');
    set.add('Language Lab');
    set.add('Art Studio');
    set.add('Sports Complex');
    set.add('Central Library');
    return Array.from(set).sort();
  }, [state.classes, state.timetable]);

  // Real-time Conflict Engine across all slots in the institution
  const detectedConflicts = useMemo(() => {
    const list: {
      id: string;
      type: 'Teacher Overlap' | 'Room Double-Booking' | 'Class Clashing';
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
          // 1. Teacher Overlap
          if (s1.teacherId && s2.teacherId && s1.teacherId === s2.teacherId && s1.class !== s2.class) {
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
          // 2. Room Double-Booking
          else if (s1.room && s2.room && s1.room.toLowerCase().trim() === s2.room.toLowerCase().trim() && s1.class !== s2.class) {
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
              explanation: `Venue "${s1.room}" is double-booked for ${s1.class} (${s1.subject}) and ${s2.class} (${s2.subject}) in Period ${s1.periodNumber}.`,
              slot1: s1,
              slot2: s2,
            });
          }
          // 3. Class Double-Booking
          else if (s1.class === s2.class && s1.id !== s2.id) {
            list.push({
              id: `cc-${s1.id}-${s2.id}`,
              type: 'Class Clashing',
              day: s1.day,
              periodNumber: s1.periodNumber,
              periodTime: s1.time,
              class1: s1.class,
              class2: s2.class,
              teacherName: `${s1.teacherName} & ${s2.teacherName}`,
              room: `${s1.room} vs ${s2.room}`,
              explanation: `${s1.class} has multiple simultaneous lessons assigned: "${s1.subject}" and "${s2.subject}" during Period ${s1.periodNumber}.`,
              slot1: s1,
              slot2: s2,
            });
          }
        }
      }
    }
    return list;
  }, [state.timetable]);

  // Form states for Add / Edit Slot
  const [formDay, setFormDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [formPeriodNum, setFormPeriodNum] = useState<number>(1);
  const [formClass, setFormClass] = useState<string>(selectedClass);
  const [formSubject, setFormSubject] = useState<string>('Mathematics');
  const [formTeacherId, setFormTeacherId] = useState<string>('tch-sterling');
  const [formRoom, setFormRoom] = useState<string>('Room 301');
  const [formType, setFormType] = useState<TimetableSlot['type']>('Lecture');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Live conflict warning inside the modal as user chooses fields
  const formLiveConflict = useMemo(() => {
    if (!formTeacherId && !formRoom) return null;

    const existingSlots = (state.timetable || []).filter(
      (s) => (!editingSlot || s.id !== editingSlot.id) && s.day === formDay && s.periodNumber === formPeriodNum
    );

    // Check teacher clash
    const teacherClash = existingSlots.find((s) => s.teacherId === formTeacherId && s.class !== formClass);
    if (teacherClash) {
      const tch = state.teachers.find((t) => t.id === formTeacherId);
      return `Conflict Warning: ${tch?.name || 'Selected teacher'} is already scheduled with ${teacherClash.class} (${teacherClash.subject}) at this time!`;
    }

    // Check room clash
    const roomClash = existingSlots.find(
      (s) => s.room.toLowerCase().trim() === formRoom.toLowerCase().trim() && s.class !== formClass
    );
    if (roomClash) {
      return `Conflict Warning: Venue "${formRoom}" is already booked by ${roomClash.class} (${roomClash.subject}) at this time!`;
    }

    // Check class clash
    const classClash = existingSlots.find((s) => s.class === formClass);
    if (classClash) {
      return `Conflict Warning: ${formClass} already has "${classClash.subject}" scheduled in Period ${formPeriodNum}!`;
    }

    return null;
  }, [formDay, formPeriodNum, formClass, formTeacherId, formRoom, editingSlot, state.timetable, state.teachers]);

  // Open Add Slot Modal
  const openAddModal = (day?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday', pNum?: number) => {
    setEditingSlot(null);
    const targetDay = day || (viewPerspective === 'day' ? selectedDay : 'Monday');
    const targetPeriod = pNum || 1;
    setFormDay(targetDay);
    setFormPeriodNum(targetPeriod);
    setFormClass(selectedClass);

    // Auto-select allocated subject/teacher for this class if available
    const classAlloc = (state.subjectAllocations || []).find((sa) => sa.className === selectedClass);
    if (classAlloc) {
      setFormSubject(classAlloc.subjectName);
      setFormTeacherId(classAlloc.teacherId || state.teachers[0]?.id || 'tch-sterling');
      setFormRoom(classAlloc.roomNumber || 'Room 301');
    } else {
      setFormSubject('Mathematics');
      setFormTeacherId(state.teachers[0]?.id || 'tch-sterling');
      setFormRoom('Room 301');
    }

    setFormType('Lecture');
    setFormNotes('');
    setFormValidationError(null);
    setIsSlotModalOpen(true);
  };

  // Open Edit Slot Modal
  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormDay(slot.day);
    setFormPeriodNum(slot.periodNumber);
    setFormClass(slot.class);
    setFormSubject(slot.subject);
    setFormTeacherId(slot.teacherId);
    setFormRoom(slot.room);
    setFormType(slot.type || 'Lecture');
    setFormNotes(slot.notes || '');
    setFormValidationError(null);
    setIsSlotModalOpen(true);
  };

  // Handle Save Slot
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formRoom.trim()) {
      setFormValidationError('Please enter a subject name and room venue.');
      return;
    }

    const periodObj = periodDefs.find((p) => p.periodNumber === formPeriodNum) || periodDefs[0];
    const teacherObj = state.teachers.find((t) => t.id === formTeacherId);

    const slotPayload: TimetableSlot = {
      id: editingSlot ? editingSlot.id : 'tt-' + Date.now(),
      day: formDay,
      period: periodObj.label,
      periodNumber: formPeriodNum,
      time: periodObj.time,
      class: formClass,
      subject: formSubject.trim(),
      teacherId: formTeacherId,
      teacherName: teacherObj ? teacherObj.name : 'Unassigned Faculty',
      room: formRoom.trim(),
      type: formType,
      notes: formNotes.trim(),
      academicYearId: state.activeAcademicYearId,
    };

    saveTimetableSlot(slotPayload);
    logAuditEvent(
      `${editingSlot ? 'Updated' : 'Added'} Timetable Slot: ${slotPayload.class} ${slotPayload.day} Period ${slotPayload.periodNumber} (${slotPayload.subject})`,
      slotPayload.class,
      'Academic'
    );
    setIsSlotModalOpen(false);
  };

  // Handle Delete Slot
  const handleDeleteSlotConfirm = () => {
    if (!deleteConfirmSlot) return;
    deleteTimetableSlot(deleteConfirmSlot.id);
    logAuditEvent(
      `Removed Timetable Slot: ${deleteConfirmSlot.class} ${deleteConfirmSlot.day} Period ${deleteConfirmSlot.periodNumber} (${deleteConfirmSlot.subject})`,
      deleteConfirmSlot.class,
      'Academic'
    );
    setDeleteConfirmSlot(null);
  };

  // Handle Publishing Timetable
  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    publishTimetable(selectedClass, publishNote.trim());
    setIsPublishModalOpen(false);
    setPublishNote('');
  };

  // Current Timetable Metadata
  const currentMeta = state.timetableMetadata?.[selectedClass] || {
    academicYearId: state.activeAcademicYearId,
    class: selectedClass,
    version: 'v1.0',
    status: 'Draft',
    lastModified: '2026-09-24',
    publishedBy: 'Dr. Robert Hayes (Principal)',
  };

  // Export Timetable to CSV
  const handleExportCSV = () => {
    const slotsToExport =
      viewPerspective === 'teacher'
        ? (state.timetable || []).filter((s) => s.teacherId === selectedTeacherId)
        : viewPerspective === 'room'
        ? (state.timetable || []).filter((s) => s.room === selectedRoom)
        : (state.timetable || []).filter((s) => s.class === selectedClass);

    const headers = 'Day,Period,Time,Class,Subject,Teacher,Room,Type,Notes\n';
    const rows = slotsToExport
      .map(
        (s) =>
          `"${s.day}","${s.period}","${s.time}","${s.class}","${s.subject}","${s.teacherName}","${s.room}","${s.type}","${s.notes || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Schlar_Timetable_${viewPerspective}_${(selectedClass || 'Export').replace(/\s+/g, '_')}.csv`;
    a.click();
    addToast('Schedule Exported', 'CSV file downloaded.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for slot type styles
  const getTypeStyle = (type?: string) => {
    switch (type) {
      case 'Lab':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Practical':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Sports':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Library':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-indigo-50/70 text-indigo-900 border-indigo-200';
    }
  };

  // Selected Teacher object
  const activeTeacher = state.teachers.find((t) => t.id === selectedTeacherId) || state.teachers[0];

  // Teacher teaching hours / week calculation
  const teacherTotalSlots = useMemo(() => {
    if (!activeTeacher) return 0;
    return (state.timetable || []).filter((s) => s.teacherId === activeTeacher.id).length;
  }, [state.timetable, activeTeacher]);

  return (
    <div className="space-y-6">
      {/* Top Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                currentMeta.status === 'Published'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {currentMeta.status} ({currentMeta.version})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <>
              <button
                onClick={() => openAddModal()}
                style={{ backgroundColor: currentTheme.primary }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 hover:opacity-90 text-white rounded-lg text-xs font-semibold shadow-xs transition-opacity shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Lesson
              </button>

              <button
                onClick={() => setIsPublishModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Publish Timetable
              </button>
            </>
          )}

          <button
            onClick={() => setShowRevisionHistory(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Version History & Revisions"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Print Schedule"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Perspective Selector Pills & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Perspectives: Class | Day | Teacher | Room */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs overflow-x-auto">
            <button
              onClick={() => setViewPerspective('class')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                viewPerspective === 'class'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Class Grid
            </button>
            <button
              onClick={() => setViewPerspective('day')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                viewPerspective === 'day'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day Progression View
            </button>
            <button
              onClick={() => setViewPerspective('teacher')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                viewPerspective === 'teacher'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teacher Availability
            </button>
            <button
              onClick={() => setViewPerspective('room')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                viewPerspective === 'room'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Room / Lab Utilization
            </button>
          </div>

          {/* Perspective Sub-Filter Selectors */}
          <div className="flex items-center gap-2 text-xs">
            {viewPerspective === 'class' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Class:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {state.classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.roomNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewPerspective === 'day' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Day:</span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <span className="text-slate-500 font-semibold ml-2">Class:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  {state.classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewPerspective === 'teacher' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Teacher:</span>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  {state.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects.join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewPerspective === 'room' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Room / Venue:</span>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  {availableRooms.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Conflict Alert Banner / Verified Indicator */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            {detectedConflicts.length > 0 ? (
              <button
                onClick={() => setShowConflictsPanel(!showConflictsPanel)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                {detectedConflicts.length} Timetable Conflict{detectedConflicts.length > 1 ? 's' : ''} Detected (Click to Inspect)
              </button>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                0 Timetable Conflicts (Verified Across Campus)
              </span>
            )}

            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-mono">
              Academic Session: {state.activeAcademicYearId} (Term 1)
            </span>
          </div>

          <div className="text-slate-400 text-[11px]">
            Last Published: {currentMeta.publishedAt || currentMeta.lastModified} by {currentMeta.publishedBy || 'School Admin'}
          </div>
        </div>

        {/* Expandable Conflict Resolution Drawer */}
        {showConflictsPanel && detectedConflicts.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Timetable Conflict Audit Log ({detectedConflicts.length} Active Clashes)
              </h4>
              <button
                onClick={() => setShowConflictsPanel(false)}
                className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold"
              >
                Close Drawer
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {detectedConflicts.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-white border border-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-900">{c.type}:</span>
                      <span className="font-mono text-slate-700 font-semibold">
                        {c.day} · Period {c.periodNumber} ({c.periodTime})
                      </span>
                    </div>
                    <p className="text-rose-800 text-[11px]">{c.explanation}</p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => openEditModal(c.slot1)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded font-semibold text-xs transition-colors shrink-0"
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

      {/* ==============================================================
          PERSPECTIVE 1: WEEKLY CLASS GRID (Default & Central)
      ============================================================== */}
      {viewPerspective === 'class' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-3.5 py-3 border-r border-slate-200 w-32">Period & Time</th>
                  {days.map((day) => (
                    <th key={day} className="px-3 py-3 border-r border-slate-200 last:border-r-0 text-center">
                      <span className="block text-slate-900 font-bold">{day}</span>
                      <span className="text-[10px] font-normal text-slate-400">7 Periods</span>
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
                      {/* Morning Break interval */}
                      {isRecessBefore && (
                        <tr className="bg-amber-50/60 text-amber-900 text-[11px] border-y border-amber-200/50">
                          <td className="px-3.5 py-1.5 font-bold border-r border-slate-200 text-amber-900">
                            10:00 - 10:20 AM
                          </td>
                          <td colSpan={5} className="px-4 py-1.5 text-center font-bold tracking-wider uppercase text-amber-800">
                            Morning Recess & Nutrition Interval (20 Mins)
                          </td>
                        </tr>
                      )}

                      {/* Lunch Break interval */}
                      {isLunchBefore && (
                        <tr className="bg-emerald-50/60 text-emerald-900 text-[11px] border-y border-emerald-200/50">
                          <td className="px-3.5 py-1.5 font-bold border-r border-slate-200 text-emerald-900">
                            11:50 - 12:40 PM
                          </td>
                          <td colSpan={5} className="px-4 py-1.5 text-center font-bold tracking-wider uppercase text-emerald-800">
                            Campus Lunch Interval & Activity Hour (50 Mins)
                          </td>
                        </tr>
                      )}

                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3.5 py-3 border-r border-slate-200 bg-slate-50/30">
                          <span className="font-bold text-slate-900 block">{p.label}</span>
                          <span className="font-mono text-[10px] text-slate-400 block">{p.time}</span>
                        </td>

                        {days.map((day) => {
                          const slot = (state.timetable || []).find(
                            (s) => s.class === selectedClass && s.day === day && s.periodNumber === p.periodNumber
                          );

                          // Check if this cell is involved in a conflict
                          const isConflicted = detectedConflicts.some(
                            (c) =>
                              (c.slot1.id === slot?.id || c.slot2.id === slot?.id)
                          );

                          if (!slot) {
                            return (
                              <td
                                key={day}
                                onClick={() => canEdit && openAddModal(day, p.periodNumber)}
                                className={`px-2.5 py-2.5 border-r border-slate-100 last:border-r-0 text-center ${
                                  canEdit ? 'hover:bg-indigo-50/40 cursor-pointer group' : ''
                                }`}
                              >
                                <span className="text-[11px] text-slate-300 italic block">
                                  {canEdit ? (
                                    <span className="group-hover:text-indigo-600 transition-colors font-medium">
                                      + Add Period
                                    </span>
                                  ) : (
                                    'Free Period'
                                  )}
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={day}
                              className="px-2 py-1.5 border-r border-slate-100 last:border-r-0 align-top relative group"
                            >
                              <div
                                className={`p-2 rounded-xl border ${getTypeStyle(
                                  slot.type
                                )} ${
                                  isConflicted ? 'ring-2 ring-rose-500 bg-rose-50/80' : ''
                                } transition-all shadow-2xs hover:shadow-xs`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-900 truncate block text-[11px]">
                                    {slot.subject}
                                  </span>
                                  <span className="text-[9px] uppercase px-1 rounded font-bold font-mono">
                                    {slot.type || 'Lec'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
                                  <span className="truncate">{slot.teacherName}</span>
                                  <span className="text-[9px] font-mono text-slate-500 shrink-0 ml-1">
                                    {slot.room}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/50 text-[9px] font-mono text-slate-400">
                                  <span>{slot.period}</span>
                                  {canEdit && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditModal(slot);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800"
                                        title="Edit Period"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteConfirmSlot(slot);
                                        }}
                                        className="text-rose-500 hover:text-rose-700"
                                        title="Delete Period"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
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

      {/* ==============================================================
          PERSPECTIVE 2: INDIVIDUAL DAY FOCUS TIMELINE
      ============================================================== */}
      {viewPerspective === 'day' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {selectedDay} Daily Lesson Sequence — {selectedClass}
              </h2>
              <p className="text-xs text-slate-500">
                Period by period daily timeline with room locations, instructional types, and instructor leads.
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => openAddModal(selectedDay)}
                style={{ backgroundColor: currentTheme.primary }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add {selectedDay} Period
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {periodDefs.map((p) => {
              const slot = (state.timetable || []).find(
                (s) => s.class === selectedClass && s.day === selectedDay && s.periodNumber === p.periodNumber
              );

              if (!slot) {
                return (
                  <div
                    key={p.periodNumber}
                    onClick={() => canEdit && openAddModal(selectedDay, p.periodNumber)}
                    className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 transition-all min-h-[110px]"
                  >
                    <div>
                      <span className="font-bold text-slate-400">{p.label}</span>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{p.time}</span>
                    </div>
                    <div className="mt-2 text-center text-slate-400">
                      {canEdit ? '+ Assign Subject Lesson' : 'Free Period / Study Time'}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={p.periodNumber}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between text-xs hover:shadow-xs transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {slot.period}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTypeStyle(slot.type)}`}>
                        {slot.type || 'Lecture'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mt-1">{slot.subject}</h3>
                    <p className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {slot.teacherName}
                      </span>
                      <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                        {slot.room}
                      </span>
                    </p>

                    {slot.notes && (
                      <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                        "{slot.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-400">{slot.time}</span>
                    {canEdit && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(slot)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmSlot(slot)}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==============================================================
          PERSPECTIVE 3: TEACHER TIMETABLE & AVAILABILITY
      ============================================================== */}
      {viewPerspective === 'teacher' && (
        <div className="space-y-4">
          {/* Teacher Profile Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{activeTeacher?.name}</h2>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                  {activeTeacher?.employeeId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    activeTeacher?.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {activeTeacher?.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeTeacher?.roleTitle} · Department of {activeTeacher?.department || 'Academics'}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Weekly Load</span>
                <span className="font-mono font-bold text-indigo-700 text-sm mt-0.5 block">
                  {teacherTotalSlots} / {activeTeacher?.workloadHours || 24} periods
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Free Prep Periods</span>
                <span className="font-mono font-bold text-emerald-600 text-sm mt-0.5 block">
                  {Math.max(0, 35 - teacherTotalSlots)} periods
                </span>
              </div>
            </div>
          </div>

          {/* Teacher Weekly Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-3.5 py-3 border-r border-slate-200 w-32">Period & Time</th>
                    {days.map((day) => (
                      <th key={day} className="px-3 py-3 border-r border-slate-200 last:border-r-0 text-center">
                        <span className="block text-slate-900 font-bold">{day}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periodDefs.map((p) => (
                    <tr key={p.periodNumber} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3.5 py-3 border-r border-slate-200 bg-slate-50/30">
                        <span className="font-bold text-slate-900 block">{p.label}</span>
                        <span className="font-mono text-[10px] text-slate-400 block">{p.time}</span>
                      </td>

                      {days.map((day) => {
                        const slot = (state.timetable || []).find(
                          (s) => s.teacherId === activeTeacher?.id && s.day === day && s.periodNumber === p.periodNumber
                        );

                        if (!slot) {
                          return (
                            <td
                              key={day}
                              className="px-2.5 py-2.5 border-r border-slate-100 last:border-r-0 text-center bg-emerald-50/20"
                            >
                              <span className="text-[10px] text-emerald-700 font-medium">
                                Available (Prep)
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={day} className="px-2 py-1.5 border-r border-slate-100 last:border-r-0 align-top">
                            <div className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/70">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-900 truncate block text-[11px]">
                                  {slot.class}
                                </span>
                                <span className="text-[9px] font-mono text-slate-500 font-bold">
                                  {slot.room}
                                </span>
                              </div>
                              <span className="text-[10px] text-indigo-900 block font-medium truncate">
                                {slot.subject}
                              </span>
                            </div>
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

      {/* ==============================================================
          PERSPECTIVE 4: ROOM & LAB UTILIZATION TIMETABLE
      ============================================================== */}
      {viewPerspective === 'room' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Venue Schedule: {selectedRoom}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Lab and classroom room occupancy schedule to prevent room double-bookings.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {(state.timetable || []).filter((s) => s.room === selectedRoom).length} of 35 Weekly Periods Booked
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-3.5 py-3 border-r border-slate-200 w-32">Period & Time</th>
                    {days.map((day) => (
                      <th key={day} className="px-3 py-3 border-r border-slate-200 last:border-r-0 text-center">
                        <span className="block text-slate-900 font-bold">{day}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periodDefs.map((p) => (
                    <tr key={p.periodNumber} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3.5 py-3 border-r border-slate-200 bg-slate-50/30">
                        <span className="font-bold text-slate-900 block">{p.label}</span>
                        <span className="font-mono text-[10px] text-slate-400 block">{p.time}</span>
                      </td>

                      {days.map((day) => {
                        const slot = (state.timetable || []).find(
                          (s) => s.room === selectedRoom && s.day === day && s.periodNumber === p.periodNumber
                        );

                        if (!slot) {
                          return (
                            <td
                              key={day}
                              className="px-2.5 py-2.5 border-r border-slate-100 last:border-r-0 text-center bg-emerald-50/20"
                            >
                              <span className="text-[10px] text-emerald-700 font-medium">
                                Room Vacant
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={day} className="px-2 py-1.5 border-r border-slate-100 last:border-r-0 align-top">
                            <div className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/70">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-900 truncate block text-[11px]">
                                  {slot.class}
                                </span>
                                <span className="text-[9px] font-bold text-indigo-700">
                                  {slot.subject}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-600 block truncate">
                                Instructor: {slot.teacherName}
                              </span>
                            </div>
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

      {/* ==============================================================
          ADD / EDIT LESSON SLOT MODAL
      ============================================================== */}
      {isSlotModalOpen && (
        <Modal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          title={editingSlot ? 'Edit Timetable Lesson Slot' : 'Add Lesson to Schedule'}
          subtitle="Configure period time, subject assignment, appointed instructor, and venue."
        >
          <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
            {formLiveConflict && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{formLiveConflict}</span>
              </div>
            )}

            {formValidationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formValidationError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Day *</label>
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
                <label className="block text-slate-700 font-semibold mb-1">Period Time Slot *</label>
                <select
                  value={formPeriodNum}
                  onChange={(e) => setFormPeriodNum(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {periodDefs.map((p) => (
                    <option key={p.periodNumber} value={p.periodNumber}>
                      {p.label} ({p.time})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Class Section *</label>
                <select
                  value={formClass}
                  onChange={(e) => setFormClass(e.target.value)}
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
                <label className="block text-slate-700 font-semibold mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Mathematics, Advanced Physics..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-slate-700 font-semibold mb-1">Venue / Room *</label>
                <input
                  type="text"
                  required
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  placeholder="e.g. Room 301, Science Lab 1..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Instructional Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Lecture">Lecture (Theory Classroom)</option>
                  <option value="Lab">Laboratory (Science / Wet Lab)</option>
                  <option value="Practical">Practical (Computer / Coding / Art)</option>
                  <option value="Sports">Sports / Physical Education</option>
                  <option value="Library">Library & Reading Period</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lesson Notes (Optional)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Bring lab coat, problem set 3..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSlotModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.primary }}
                className="px-5 py-2 text-white rounded-lg font-semibold shadow-xs"
              >
                {editingSlot ? 'Save Changes' : 'Add to Timetable'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ==============================================================
          DELETE LESSON SLOT CONFIRMATION MODAL
      ============================================================== */}
      {deleteConfirmSlot && (
        <Modal
          isOpen={!!deleteConfirmSlot}
          onClose={() => setDeleteConfirmSlot(null)}
          title="Delete Timetable Lesson Slot?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to remove the following lesson from the timetable?
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900 text-sm">{deleteConfirmSlot.subject}</div>
              <div className="text-slate-600">
                {deleteConfirmSlot.class} · {deleteConfirmSlot.day} {deleteConfirmSlot.period} ({deleteConfirmSlot.time})
              </div>
              <div className="text-slate-500 text-[11px]">
                Instructor: {deleteConfirmSlot.teacherName} · Room: {deleteConfirmSlot.room}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmSlot(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSlotConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==============================================================
          PUBLISH TIMETABLE MODAL
      ============================================================== */}
      {isPublishModalOpen && (
        <Modal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          title={`Publish Timetable for ${selectedClass}`}
          subtitle="Publishing increments the version and promotes this schedule as the live official version."
        >
          <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs">
            {detectedConflicts.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Attention: Active Conflicts Exist</span>
                  <span>
                    There are {detectedConflicts.length} unresolved timetable conflicts across campus. It is recommended to resolve conflicts before releasing the final version.
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Version Release Notes *
              </label>
              <textarea
                rows={3}
                required
                value={publishNote}
                onChange={(e) => setPublishNote(e.target.value)}
                placeholder="e.g. Approved Fall semester schedule with finalized science lab rotations."
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
              <span className="font-semibold block text-slate-900">Publication Summary:</span>
              <span>
                Publishing will update student, teacher, and parent portals to version {currentMeta.version ? `v${parseInt(currentMeta.version.replace('v', '').split('.')[0] || '1', 10)}.${parseInt(currentMeta.version.replace('v', '').split('.')[1] || '0', 10) + 1}` : 'v1.1'}.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Confirm & Publish
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ==============================================================
          REVISION HISTORY DRAWER
      ============================================================== */}
      {showRevisionHistory && (
        <Modal
          isOpen={showRevisionHistory}
          onClose={() => setShowRevisionHistory(false)}
          title={`Timetable Version History — ${selectedClass}`}
          subtitle="Audit log of timetable publications, authors, and summary change descriptions."
        >
          <div className="space-y-4 text-xs max-h-[65vh] overflow-y-auto pr-1">
            {(state.timetableRevisions || []).length === 0 ? (
              <p className="text-slate-400 text-center py-6">No revisions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {(state.timetableRevisions || []).map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm font-mono">
                          {rev.version}
                        </span>
                        <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                          {rev.status}
                        </span>
                        <span className="text-slate-500">· {rev.class}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{rev.timestamp}</span>
                    </div>

                    <p className="text-slate-700 text-xs mt-1 leading-relaxed">
                      {rev.changeSummary}
                    </p>

                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Author: {rev.author}</span>
                      <span className="text-emerald-600 font-medium">Synced with Portals</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowRevisionHistory(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
              >
                Close History
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
