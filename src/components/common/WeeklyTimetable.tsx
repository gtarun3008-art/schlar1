import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TimetableSlot, THEMES } from '../../types';
import { Modal } from './Modal';
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
} from 'lucide-react';

interface WeeklyTimetableProps {
  initialClass?: string;
  initialTeacherId?: string;
  canEdit?: boolean;
  title?: string;
  subtitle?: string;
}

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({
  initialClass = 'Grade 10A',
  initialTeacherId,
  canEdit = true,
  title = 'Weekly Master Timetable',
  subtitle = 'Official institutional instructional schedule across all five academic days.',
}) => {
  const { state, saveTimetableSlot, deleteTimetableSlot, addToast } = useApp();
  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(initialTeacherId || 'all');
  const [activeDayView, setActiveDayView] = useState<'all' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('all');
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [showConflictsPanel, setShowConflictsPanel] = useState(false);

  // Real-time conflict analysis engine across all classes and rooms
  const detectedConflicts = useMemo(() => {
    const list: {
      id: string;
      type: 'Teacher Overlap' | 'Room Double-Booking';
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
          } else if (s1.room && s2.room && s1.room === s2.room && s1.class !== s2.class) {
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
              explanation: `Instructional room ${s1.room} is double-booked for ${s1.class} (${s1.subject}) and ${s2.class} (${s2.subject}) in Period ${s1.periodNumber}.`,
              slot1: s1,
              slot2: s2,
            });
          }
        }
      }
    }
    return list;
  }, [state.timetable]);

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

  // Modal Form State
  const [formDay, setFormDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [formPeriodNum, setFormPeriodNum] = useState<number>(1);
  const [formClass, setFormClass] = useState<string>(selectedClass);
  const [formSubject, setFormSubject] = useState<string>('Mathematics');
  const [formTeacherId, setFormTeacherId] = useState<string>('tch-sterling');
  const [formRoom, setFormRoom] = useState<string>('Room 301');
  const [formType, setFormType] = useState<TimetableSlot['type']>('Lecture');

  const openAddModal = (day?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday', pNum?: number) => {
    setEditingSlot(null);
    setFormDay(day || (activeDayView !== 'all' ? activeDayView : 'Monday'));
    setFormPeriodNum(pNum || 1);
    setFormClass(selectedClass);
    setFormSubject('Mathematics');
    setFormTeacherId('tch-sterling');
    setFormRoom('Room 301');
    setFormType('Lecture');
    setIsSlotModalOpen(true);
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormDay(slot.day);
    setFormPeriodNum(slot.periodNumber);
    setFormClass(slot.class);
    setFormSubject(slot.subject);
    setFormTeacherId(slot.teacherId);
    setFormRoom(slot.room);
    setFormType(slot.type || 'Lecture');
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
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

  // Filter timetable
  const filteredSlots = (state.timetable || []).filter((slot) => {
    if (selectedTeacherId !== 'all') {
      return slot.teacherId === selectedTeacherId;
    }
    return slot.class === selectedClass;
  });

  const getSlot = (day: string, pNum: number) => {
    return filteredSlots.find((s) => s.day === day && s.periodNumber === pNum);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'Day,Period,Time,Class,Subject,Teacher,Room,Type\n';
    const rows = filteredSlots
      .map(
        (s) =>
          `"${s.day}","${s.period}","${s.time}","${s.class}","${s.subject}","${s.teacherName}","${s.room}","${s.type}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Schlar_Timetable_${selectedClass.replace(/\s+/g, '_')}.csv`;
    a.click();
    addToast('Schedule Exported', 'Timetable CSV download started.', 'success');
  };

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
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: currentTheme.primary }} />
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedTeacherId('all');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {state.classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Teacher:</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Class Faculty</option>
                {state.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subjects[0]})
                  </option>
                ))}
              </select>
            </div>

            {canEdit && (
              <button
                onClick={() => openAddModal()}
                style={{ backgroundColor: currentTheme.primary }}
                className="flex items-center gap-1 px-3 py-1.5 hover:opacity-90 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Period
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Export as CSV"
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

        {/* Day Selector Navigation Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
            <button
              onClick={() => setActiveDayView('all')}
              style={
                activeDayView === 'all'
                  ? { backgroundColor: currentTheme.primary, color: '#ffffff' }
                  : {}
              }
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeDayView === 'all'
                  ? 'shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Full Week (Mon - Fri)
            </button>

            {days.map((day) => {
              const count = filteredSlots.filter((s) => s.day === day).length;
              const isActive = activeDayView === day;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDayView(day)}
                  style={
                    isActive
                      ? { backgroundColor: currentTheme.primary, color: '#ffffff' }
                      : {}
                  }
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{day}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            {detectedConflicts.length > 0 ? (
              <button
                onClick={() => setShowConflictsPanel(!showConflictsPanel)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                {detectedConflicts.length} Timetable Conflict{detectedConflicts.length > 1 ? 's' : ''} Detected
              </button>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                0 Timetable Conflicts (Verified)
              </span>
            )}
            <span className="text-slate-300">·</span>
            <span>Total: 35 Periods / Week</span>
          </div>
        </div>

        {/* Expandable Timetable Conflict Resolution Panel */}
        {showConflictsPanel && detectedConflicts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Timetable Conflict Audit Log ({detectedConflicts.length} Active Clashes)
              </h4>
              <button
                onClick={() => setShowConflictsPanel(false)}
                className="text-[11px] text-slate-500 hover:text-slate-700"
              >
                Dismiss Panel
              </button>
            </div>
            <div className="space-y-2">
              {detectedConflicts.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-900">{c.type}:</span>
                      <span className="font-mono text-slate-700 font-semibold">
                        {c.day} · Period {c.periodNumber} ({c.periodTime})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white font-medium text-slate-700 border border-slate-200 text-[10px]">
                        {c.class1} vs {c.class2}
                      </span>
                    </div>
                    <p className="text-rose-800 text-[11px] leading-relaxed">{c.explanation}</p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => openEditModal(c.slot1)}
                      className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-semibold text-xs transition-colors shrink-0 self-start sm:self-auto"
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

      {/* VIEW MODE A: FULL WEEK GRID (All 5 Days x 7 Periods) */}
      {activeDayView === 'all' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[800px]">
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
                {periodDefs.map((p, idx) => {
                  const isRecessBefore = p.periodNumber === 3;
                  const isLunchBefore = p.periodNumber === 5;

                  return (
                    <React.Fragment key={p.periodNumber}>
                      {/* Morning Break row */}
                      {isRecessBefore && (
                        <tr className="bg-amber-50/60 text-amber-800 text-[11px] border-y border-amber-200/50">
                          <td className="px-3.5 py-1.5 font-bold border-r border-slate-200 text-amber-900">
                            10:00 - 10:20 AM
                          </td>
                          <td colSpan={5} className="px-4 py-1.5 text-center font-bold tracking-wider uppercase text-amber-800">
                            Morning Refreshment & Assembly Recess (20 Mins)
                          </td>
                        </tr>
                      )}

                      {/* Lunch Break row */}
                      {isLunchBefore && (
                        <tr className="bg-emerald-50/60 text-emerald-800 text-[11px] border-y border-emerald-200/50">
                          <td className="px-3.5 py-1.5 font-bold border-r border-slate-200 text-emerald-900">
                            11:50 - 12:40 PM
                          </td>
                          <td colSpan={5} className="px-4 py-1.5 text-center font-bold tracking-wider uppercase text-emerald-800">
                            Campus Lunch Interval & Activity Hour (50 Mins)
                          </td>
                        </tr>
                      )}

                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3.5 py-3 border-r border-slate-200 bg-slate-50/30">
                          <span className="font-bold text-slate-900 block">{p.label}</span>
                          <span className="font-mono text-[10px] text-slate-400 block">{p.time}</span>
                        </td>

                        {days.map((day) => {
                          const slot = getSlot(day, p.periodNumber);

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
                                    <span className="group-hover:text-indigo-600 transition-colors">+ Add</span>
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
                              className="px-2.5 py-2 border-r border-slate-100 last:border-r-0 align-top relative group"
                            >
                              <div
                                className={`p-2 rounded-xl border ${getTypeStyle(
                                  slot.type
                                )} transition-all shadow-2xs hover:shadow-xs`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-900 truncate block text-[11px]">
                                    {slot.subject}
                                  </span>
                                  <span className="text-[9px] uppercase px-1 rounded font-bold font-mono">
                                    {slot.type || 'Lec'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-600 font-medium">
                                  <span className="truncate">
                                    {selectedTeacherId !== 'all' ? slot.class : slot.teacherName}
                                  </span>
                                  {selectedTeacherId === 'all' && (
                                    <span className="text-[9px] font-mono text-slate-400 ml-1 shrink-0">
                                      {slot.room}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/40 text-[9px] font-mono text-slate-500">
                                  <span>{selectedTeacherId !== 'all' ? `${slot.room}` : slot.period}</span>
                                  {canEdit && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditModal(slot);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800"
                                        title="Edit"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteTimetableSlot(slot.id);
                                        }}
                                        className="text-rose-500 hover:text-rose-700"
                                        title="Delete"
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
      ) : (
        /* VIEW MODE B: SINGLE DAY FOCUS VIEW */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {activeDayView} Instructional Schedule — {selectedClass}
              </h2>
              <p className="text-xs text-slate-500">
                Step-by-step period timeline with room locations and designated instructors.
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => openAddModal(activeDayView)}
                style={{ backgroundColor: currentTheme.primary }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add {activeDayView} Period
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {periodDefs.map((p) => {
              const slot = getSlot(activeDayView, p.periodNumber);

              if (!slot) {
                return (
                  <div
                    key={p.periodNumber}
                    onClick={() => canEdit && openAddModal(activeDayView, p.periodNumber)}
                    className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 transition-all"
                  >
                    <div>
                      <span className="font-bold text-slate-400">{p.label}</span>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{p.time}</span>
                    </div>
                    <div className="mt-3 text-center text-slate-400">
                      {canEdit ? '+ Assign Subject Slot' : 'Free Period / Study Time'}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={p.periodNumber}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between text-xs transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
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
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded text-[10px]">
                        {slot.class}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-500">{slot.time}</span>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {slot.room}
                    </span>
                  </div>

                  {canEdit && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(slot)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => deleteTimetableSlot(slot.id)}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD / EDIT PERIOD SLOT MODAL */}
      {isSlotModalOpen && (
        <Modal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          title={editingSlot ? 'Edit Timetable Period Slot' : 'Add Period Slot to Schedule'}
        >
          <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
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
                <label className="block text-slate-700 font-semibold mb-1">Period Number *</label>
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
                  placeholder="e.g. Mathematics, Physics..."
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
                <label className="block text-slate-700 font-semibold mb-1">Room / Venue *</label>
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

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Instructional Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Lecture">Lecture (Classroom Theory)</option>
                <option value="Lab">Laboratory / Hands-on Science</option>
                <option value="Practical">Practical (Computer / Arts / Robotics)</option>
                <option value="Sports">Sports / Physical Education</option>
                <option value="Library">Library & Reading Period</option>
              </select>
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
    </div>
  );
};
