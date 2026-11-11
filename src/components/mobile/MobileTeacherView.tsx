import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  Home,
  Layers,
  CheckSquare,
  ListTodo,
  MoreHorizontal,
  Clock,
  Plus,
  Save,
  CheckCircle2,
  Calendar,
  Award,
  Bell,
  LogOut,
  MessageSquare,
  Send,
  BookOpen,
  User,
} from 'lucide-react';
import { ProfilePage } from '../common/ProfilePage';

interface MobileTeacherViewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExit: () => void;
}

export const MobileTeacherView: React.FC<MobileTeacherViewProps> = ({
  activeTab,
  onTabChange,
  onExit,
}) => {
  const {
    state,
    saveClassAttendance,
    checkTeacherPeriodPermission,
    savePeriodAttendance,
    setSelectedTeacherId,
    createAssignment,
    saveExamMarks,
    sendMessage,
    addToast,
  } = useApp();

  const activeTeacherId = state.selectedTeacherId || 'tch-sterling';
  const activeTeacher =
    state.teachers.find((t) => t.id === activeTeacherId) || state.teachers[0];

  const [selectedClass, setSelectedClass] = useState('Grade 10A');
  const [selectedPeriod, setSelectedPeriod] = useState('Period 1');
  const [statuses, setStatuses] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});

  // Mobile Assignment Creator
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubject, setAsgSubject] = useState('Mathematics');
  const [asgClass, setAsgClass] = useState('Grade 10A');
  const [asgDue, setAsgDue] = useState('2026-10-05');
  const [asgDesc, setAsgDesc] = useState('');

  // Mobile Quick Marks Modal
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [markStudentId, setMarkStudentId] = useState('');
  const [markExam, setMarkExam] = useState('Mid-Term Examination');
  const [markSubject, setMarkSubject] = useState('Mathematics');
  const [markScore, setMarkScore] = useState(88);

  // Message reply state
  const [replyText, setReplyText] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mobileScheduleDay, setMobileScheduleDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [isWeeklyScheduleModalOpen, setIsWeeklyScheduleModalOpen] = useState(false);
  const [modalScheduleDay, setModalScheduleDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  const classStudents = state.students.filter((s) => s.class === selectedClass);

  const getStatus = (studentId: string) => {
    if (statuses[studentId]) return statuses[studentId];
    return 'Present';
  };

  const handleToggleStatus = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) {
      addToast('Validation', 'Title is required', 'error');
      return;
    }
    const studentCount = state.students.filter((s) => s.class === asgClass).length || 28;
    createAssignment({
      title: asgTitle.trim(),
      subject: asgSubject,
      class: asgClass,
      dueDate: asgDue,
      description: asgDesc || 'Assigned via Mobile Faculty App.',
      status: 'Published',
      teacherId: 'tch-sterling',
      teacherName: 'Marcus Sterling',
      totalStudents: studentCount,
    });
    setIsAssignmentModalOpen(false);
    setAsgTitle('');
    setAsgDesc('');
    addToast('Assignment Published', 'Homework task broadcast to parents and students.', 'success');
  };

  const handleSaveMark = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = state.students.find((s) => s.id === (markStudentId || classStudents[0]?.id));
    if (!targetStudent) return;

    saveExamMarks(
      targetStudent.class,
      markSubject,
      markExam,
      [{ studentId: targetStudent.id, marks: Number(markScore), maxMarks: 100 }]
    );

    setIsMarksModalOpen(false);
    addToast('Grade Saved', `Recorded ${markScore}/100 for ${targetStudent.name}.`, 'success');
  };

  // Period Attendance: Save with strict period authorization check
  const handleSaveAttendance = () => {
    const today = '2026-10-19'; // Default demo academic date (Monday)
    const periodNum = parseInt(selectedPeriod.replace(/\D/g, '') || '1', 10);
    const perm = checkTeacherPeriodPermission(
      activeTeacher.id,
      selectedClass,
      today,
      periodNum,
      selectedPeriod
    );

    if (!perm.authorized) {
      addToast(
        'Permission Denied',
        perm.reason || `You are not authorized to mark attendance for ${selectedPeriod}.`,
        'error'
      );
      return;
    }

    const records = classStudents.map((s) => ({
      studentId: s.id,
      status: (getStatus(s.id) || 'Present') as any,
    }));

    const result = savePeriodAttendance({
      date: today,
      className: selectedClass,
      section: 'A',
      period: selectedPeriod,
      periodNumber: periodNum,
      subject: perm.subject || 'Subject Lesson',
      teacherId: activeTeacher.id,
      teacherName: activeTeacher.name,
      records,
      isDraft: false,
    });

    if (result.success) {
      onTabChange('home');
    }
  };

  // Reply to Vikram Sharma thread
  const handleSendTeacherReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    sendMessage(
      'thr-vikram-sterling',
      replyText.trim(),
      'teacher',
      'Marcus Sterling (Faculty)',
      'parent-vikram',
      'Vikram Sharma'
    );
    setReplyText('');
    addToast('Message Sent', 'Response dispatched to parent Vikram Sharma.', 'success');
  };

  // Render Home Tab
  const renderHome = () => (
    <div className="space-y-4 text-xs">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
          Faculty Mobile Portal
        </span>
        <h2 className="text-lg font-bold mt-0.5">Good Morning, Mr. Sterling</h2>
        <p className="text-xs text-emerald-100 mt-1">Monday, September 26, 2026</p>

        {/* Next Class Highlight */}
        <div className="mt-4 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-200 uppercase block font-semibold">Next Period</span>
            <span className="text-sm font-bold text-white block">Period 1: Mathematics</span>
            <span className="text-[11px] text-emerald-100">Grade 10A · Room 301</span>
          </div>
          <span className="font-mono text-xs font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-lg shadow-xs">
            08:30 AM
          </span>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onTabChange('attendance')}
            className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">Take Attendance</span>
            <span className="text-[10px] text-slate-400">Mark morning roll</span>
          </button>

          <button
            onClick={() => {
              setMarkStudentId(classStudents[0]?.id || '');
              setIsMarksModalOpen(true);
            }}
            className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
              <Award className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">Grade Marks</span>
            <span className="text-[10px] text-slate-400">Record exam score</span>
          </button>

          <button
            onClick={() => setIsAssignmentModalOpen(true)}
            className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">Post Homework</span>
            <span className="text-[10px] text-slate-400">New assignment</span>
          </button>

          <button
            onClick={() => onTabChange('classes')}
            className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">My Classes</span>
            <span className="text-[10px] text-slate-400">Rosters & stats</span>
          </button>
        </div>
      </div>

      {/* Dynamic 5-Day Teaching Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Schedule ({mobileScheduleDay})
          </h3>
          <button
            onClick={() => {
              setModalScheduleDay(mobileScheduleDay);
              setIsWeeklyScheduleModalOpen(true);
            }}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Full Week →
          </button>
        </div>

        {/* Day selector pills */}
        <div className="flex items-center gap-1 pb-2 overflow-x-auto">
          {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setMobileScheduleDay(d)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                mobileScheduleDay === d
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        {(() => {
          const slots = state.timetable
            .filter((s) => s.teacherId === 'tch-sterling' && s.day === mobileScheduleDay)
            .sort((a, b) => a.periodNumber - b.periodNumber);

          if (slots.length === 0) {
            return (
              <p className="p-3 text-center text-slate-400 text-xs">
                No classes scheduled for {mobileScheduleDay}.
              </p>
            );
          }

          return (
            <div className="space-y-2 pt-1">
              {slots.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{s.subject}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {s.period}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {s.time} · {s.room}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    {s.class}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Pending Tasks */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Pending Tasks</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
            <span className="text-slate-700">Submit Grade 10B Math Quiz scores</span>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Due 2PM</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
            <span className="text-slate-700">STEM Fair exhibit registrations check</span>
            <span className="text-[10px] text-slate-500">Tomorrow</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Attendance Tab (Acceptance Test 10 + Prompt 4/10 Matrix Integration)
  const renderAttendanceTab = () => {
    const mobileScheduledPeriods = state.timetable
      .filter((s) => s.class === selectedClass && s.day === 'Monday')
      .sort((a, b) => a.periodNumber - b.periodNumber);

    const periodNum = parseInt(selectedPeriod.replace(/\D/g, '') || '1', 10);
    const activeSlot =
      mobileScheduledPeriods.find((s) => s.periodNumber === periodNum) ||
      mobileScheduledPeriods[0];

    const perm = checkTeacherPeriodPermission(
      activeTeacher.id,
      selectedClass,
      '2026-10-19',
      activeSlot ? activeSlot.periodNumber : periodNum,
      selectedPeriod
    );

    return (
      <div className="space-y-4 text-xs">
        {/* Active Faculty Context Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Active Faculty Identity
              </span>
            </div>
            <span className="font-bold text-sm block mt-0.5">{activeTeacher.name}</span>
            <span className="text-[10px] text-slate-400 truncate max-w-[200px] block">
              {activeTeacher.roleTitle || activeTeacher.subjects.join(', ')}
            </span>
          </div>

          <select
            value={activeTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="text-[11px] bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1"
          >
            {state.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Class & Period Selectors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Period Attendance Register</h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
              Mon, Oct 19
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                {state.classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Period Slot</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                {mobileScheduledPeriods.map((slot) => (
                  <option key={slot.id} value={slot.period}>
                    {slot.period} ({slot.subject})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Authorization Status Badge */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            {perm.authorized ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                  ✓ Authorized Lesson
                </span>
                <span className="text-[10px] text-emerald-700">
                  {activeSlot?.subject} ({activeSlot?.time})
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold block text-[11px]">
                  🔒 Read-Only: Assigned to {activeSlot?.teacherName}
                </span>
                <span className="text-[10px] text-amber-800 mt-0.5 block">
                  Only the assigned teacher can edit attendance for this period.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
          <div className="p-3 bg-slate-50 flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700">
              {selectedClass} ({classStudents.length} Students)
            </span>
            <button
              onClick={() => {
                if (!perm.authorized) {
                  addToast('Permission Denied', perm.reason || 'You are not assigned to this period.', 'error');
                  return;
                }
                const allP: Record<string, 'Present'> = {};
                classStudents.forEach((s) => (allP[s.id] = 'Present'));
                setStatuses((prev) => ({ ...prev, ...allP }));
              }}
              disabled={!perm.authorized}
              className={`text-xs font-semibold px-2 py-1 rounded ${
                perm.authorized
                  ? 'text-emerald-700 hover:bg-emerald-50 cursor-pointer'
                  : 'text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              All Present ✓
            </button>
          </div>

          {classStudents.map((std) => {
            const current = getStatus(std.id);
            return (
              <div key={std.id} className="p-3 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 block">{std.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Roll: #{std.rollNo} · {std.admissionId}</span>
                </div>

                <div className="flex items-center gap-1">
                  {(['Present', 'Absent', 'Late'] as const).map((s) => (
                    <button
                      key={s}
                      disabled={!perm.authorized}
                      onClick={() => {
                        if (!perm.authorized) {
                          addToast('Permission Denied', perm.reason || 'Unauthorized lesson.', 'error');
                          return;
                        }
                        handleToggleStatus(std.id, s);
                      }}
                      className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        current === s
                          ? s === 'Present'
                            ? 'bg-emerald-600 text-white'
                            : s === 'Absent'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      } ${!perm.authorized ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action Bar */}
        <div className="pt-2">
          <button
            onClick={handleSaveAttendance}
            disabled={!perm.authorized}
            className={`w-full h-12 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors ${
              perm.authorized
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
            }`}
          >
            <Save className="w-4 h-4" />
            {perm.authorized ? 'Save Period Attendance' : 'Period Read-Only (Assigned to Colleague)'}
          </button>
        </div>
      </div>
    );
  };

  // Render Classes Tab
  const renderClassesTab = () => (
    <div className="space-y-3 text-xs">
      <h2 className="text-sm font-bold text-slate-900 px-1">My Assigned Classes</h2>
      {['Grade 10A', 'Grade 10B', 'Grade 8A'].map((className) => {
        const cls = state.classes.find((c) => c.name === className);
        const stdCount = state.students.filter((s) => s.class === className).length;
        return (
          <div key={className} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">{className}</h3>
              <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                {cls?.attendanceToday || 95}% Attendance
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
              <div>Room: {cls?.roomNumber}</div>
              <div>Students: {stdCount || cls?.totalStudents}</div>
              <div>Class Average: {cls?.averageMarks}%</div>
              <div>Subject: Mathematics</div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedClass(className);
                  onTabChange('attendance');
                }}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold rounded-lg text-[11px] hover:bg-indigo-100"
              >
                Take Roll →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render Tasks Tab
  const renderTasksTab = () => (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-slate-900">Tasks & Homework</h2>
        <button
          onClick={() => setIsAssignmentModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Homework
        </button>
      </div>

      {state.assignments.map((asg) => (
        <div key={asg.id} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-indigo-700">{asg.class} · {asg.subject}</span>
            <StatusBadge status={asg.status} />
          </div>
          <h4 className="font-bold text-slate-900 text-xs mt-1">{asg.title}</h4>
          <p className="text-slate-500 text-[11px] mt-1">{asg.description}</p>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Due Date: {asg.dueDate}</span>
            <span>By {asg.teacherName}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // Render More Tab (Faculty profile, direct parent communication, sign out)
  const renderMoreTab = () => {
    const parentMessages = state.messages.filter((m) => m.threadId === 'thr-vikram-sterling');

    return (
      <div className="space-y-4 text-xs">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center mx-auto mb-2">
            MS
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Marcus Sterling</h3>
          <p className="text-slate-500 text-[11px]">Head of Mathematics · Greenfield International</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">m.sterling@greenfield.edu · Room 301</p>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full mt-3 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/60"
          >
            <User className="w-3.5 h-3.5 text-emerald-700" />
            View Faculty Profile & Credentials
          </button>
        </div>

        {/* Parent Inquiry Thread */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                Parent Communication
              </h3>
              <p className="text-[10px] text-slate-400">Vikram Sharma (Guardian of Aarav Sharma · Grade 8A)</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {parentMessages.map((msg) => {
              const isMe = msg.senderRole === 'teacher';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <span className="text-[9px] text-slate-400 mb-0.5">{msg.timestamp}</span>
                  <div
                    className={`p-2.5 rounded-xl ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendTeacherReply} className="mt-3 flex gap-1.5">
            <input
              type="text"
              placeholder="Reply to Mr. Sharma..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shrink-0 flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Sign Out Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 divide-y divide-slate-100">
          <button
            onClick={onExit}
            className="w-full p-3 text-rose-600 font-semibold text-left flex items-center justify-between"
          >
            <span>Sign Out / Switch Platform</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {activeTab === 'home' && renderHome()}
      {activeTab === 'attendance' && renderAttendanceTab()}
      {activeTab === 'classes' && renderClassesTab()}
      {activeTab === 'tasks' && renderTasksTab()}
      {activeTab === 'more' && renderMoreTab()}

      {/* Assignment Modal */}
      {isAssignmentModalOpen && (
        <Modal
          isOpen={isAssignmentModalOpen}
          onClose={() => setIsAssignmentModalOpen(false)}
          title="Create New Homework"
          subtitle="Distribute task to students and guardians"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assignment Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chapter 4 Practice Set"
                value={asgTitle}
                onChange={(e) => setAsgTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Class</label>
                <select
                  value={asgClass}
                  onChange={(e) => setAsgClass(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Grade 10A">Grade 10A</option>
                  <option value="Grade 10B">Grade 10B</option>
                  <option value="Grade 8A">Grade 8A</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                <select
                  value={asgSubject}
                  onChange={(e) => setAsgSubject(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Algebra">Algebra</option>
                  <option value="Calculus">Calculus</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
              <input
                type="date"
                value={asgDue}
                onChange={(e) => setAsgDue(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Instructions</label>
              <textarea
                rows={2}
                placeholder="Specific instructions or problem numbers..."
                value={asgDesc}
                onChange={(e) => setAsgDesc(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <button
                type="button"
                onClick={() => setIsAssignmentModalOpen(false)}
                className="px-4 py-2 text-slate-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
              >
                Publish Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Grade Marks Modal */}
      {isMarksModalOpen && (
        <Modal
          isOpen={isMarksModalOpen}
          onClose={() => setIsMarksModalOpen(false)}
          title="Record Student Score"
          subtitle="Direct mobile grade assessment input"
        >
          <form onSubmit={handleSaveMark} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Student</label>
              <select
                value={markStudentId || classStudents[0]?.id}
                onChange={(e) => setMarkStudentId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
              >
                {state.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class}) · #{s.rollNo}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Exam Type</label>
                <select
                  value={markExam}
                  onChange={(e) => setMarkExam(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Mid-Term Examination">Mid-Term Exam</option>
                  <option value="Unit Test 1">Unit Test 1</option>
                  <option value="Class Quiz 3">Class Quiz 3</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                <select
                  value={markSubject}
                  onChange={(e) => setMarkSubject(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Score (Out of 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={markScore}
                onChange={(e) => setMarkScore(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-base font-bold text-slate-800"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <button
                type="button"
                onClick={() => setIsMarksModalOpen(false)}
                className="px-4 py-2 text-slate-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
              >
                Save Score
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Full Faculty Profile Modal */}
      {isProfileModalOpen && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="Faculty Profile & Institutional Credentials"
          subtitle="Marcus Sterling · Head of Mathematics"
        >
          <div className="max-h-[75vh] overflow-y-auto pr-1">
            <ProfilePage onBack={() => setIsProfileModalOpen(false)} />
          </div>
        </Modal>
      )}

      {/* 5-Day Weekly Master Faculty Schedule Modal */}
      {isWeeklyScheduleModalOpen && (
        <Modal
          isOpen={isWeeklyScheduleModalOpen}
          onClose={() => setIsWeeklyScheduleModalOpen(false)}
          title="Faculty 5-Day Instructional Schedule"
          subtitle="Marcus Sterling · Head of Mathematics · Greenfield International"
        >
          <div className="space-y-3 text-xs">
            {/* Day Selector */}
            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl">
              {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setModalScheduleDay(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                    modalScheduleDay === d
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl overflow-hidden">
              {state.timetable
                .filter((s) => s.teacherId === 'tch-sterling' && s.day === modalScheduleDay)
                .sort((a, b) => a.periodNumber - b.periodNumber)
                .map((slot) => (
                  <div key={slot.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{slot.subject}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {slot.period}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                        {slot.time} · {slot.room}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      {slot.class}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

