import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MetricCard } from '../../common/MetricCard';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';
import {
  Layers,
  GraduationCap,
  CheckSquare,
  Award,
  FileText,
  Clock,
  Plus,
  Send,
  Calendar,
  Save,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Eye,
} from 'lucide-react';
import { WeeklyTimetable } from '../../common/WeeklyTimetable';
import { Student } from '../../../types';
import { StudentProfileModal } from '../../records/StudentProfileModal';
import { TeacherAttendanceView } from './TeacherAttendanceView';
import { NoticeBoardModule } from '../../shared/NoticeBoardModule';
import { AcademicCalendarModule } from '../../shared/AcademicCalendarModule';
import { InternalMessagingModule } from '../../shared/InternalMessagingModule';

export const TeacherWebView: React.FC = () => {
  const {
    state,
    setActiveNav,
    updateStudent,
    saveClassAttendance,
    saveExamMarks,
    createAssignment,
    deleteAssignment,
    sendMessage,
    addToast,
  } = useApp();

  // Current Teacher Profile: Marcus Sterling
  const teacherId = 'tch-sterling';
  const myClasses = ['Grade 10A', 'Grade 10B', 'Grade 8A'];

  // Attendance workflow states
  const [attClass, setAttClass] = useState('Grade 10A');
  const [attPeriod, setAttPeriod] = useState('Period 1 (08:30 AM)');
  const [attendanceStatuses, setAttendanceStatuses] = useState<
    Record<string, 'Present' | 'Absent' | 'Late'>
  >({});
  const [dashboardDay, setDashboardDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  // Marks workflow states
  const [markClass, setMarkClass] = useState('Grade 10A');
  const [markSubject, setMarkSubject] = useState('Mathematics');
  const [markExam, setMarkExam] = useState('Midterm Examination');
  const [marksEntries, setMarksEntries] = useState<Record<string, number>>({});

  // Assignment Modal & Form
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<any | null>(null);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [asgForm, setAsgForm] = useState({
    title: '',
    subject: 'Mathematics',
    class: 'Grade 10A',
    description: '',
    dueDate: '2026-10-05',
    status: 'Published' as 'Published' | 'Draft',
  });

  // Messaging state (Parent chat)
  const [parentReplyText, setParentReplyText] = useState('');

  // Class students for Attendance
  const classStudents = state.students.filter((s) => s.class === attClass);
  // Class students for Marks
  const markClassStudents = state.students.filter((s) => s.class === markClass);

  // Initialize attendance for class if empty
  const getStatusForStudent = (studentId: string): 'Present' | 'Absent' | 'Late' => {
    if (attendanceStatuses[studentId]) return attendanceStatuses[studentId];
    // check if today already marked in state
    const today = new Date().toISOString().split('T')[0];
    const existing = state.attendance.find(
      (a) => a.studentId === studentId && a.date === today && a.class === attClass
    );
    if (existing?.status === 'Absent' || existing?.status === 'Late') {
      return existing.status;
    }
    return 'Present';
  };

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    const records = classStudents.map((std) => ({
      studentId: std.id,
      status: getStatusForStudent(std.id),
    }));

    saveClassAttendance(attClass, records, attPeriod);
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    const entries = markClassStudents.map((std) => {
      const val = marksEntries[std.id] !== undefined ? marksEntries[std.id] : 85;
      return {
        studentId: std.id,
        marks: val,
        maxMarks: 100,
      };
    });

    saveExamMarks(markClass, markSubject, markExam, entries);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgForm.title.trim()) {
      addToast('Validation', 'Title is required', 'error');
      return;
    }

    createAssignment({
      title: asgForm.title.trim(),
      subject: asgForm.subject,
      class: asgForm.class,
      teacherId,
      teacherName: 'Marcus Sterling',
      description: asgForm.description || 'Complete exercises as instructed.',
      dueDate: asgForm.dueDate,
      status: asgForm.status,
      totalStudents: state.students.filter((s) => s.class === asgForm.class).length || 30,
    });

    setIsAssignmentModalOpen(false);
    setAsgForm({
      title: '',
      subject: 'Mathematics',
      class: 'Grade 10A',
      description: '',
      dueDate: '2026-10-05',
      status: 'Published',
    });
  };

  const handleSendParentReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentReplyText.trim()) return;

    sendMessage(
      'thr-vikram-sterling',
      parentReplyText.trim(),
      'teacher',
      'Marcus Sterling (Maths Faculty)',
      'std-aarav-parent',
      'Vikram Sharma (Parent)'
    );
    setParentReplyText('');
    addToast('Message Sent', 'Reply sent to Vikram Sharma.', 'success');
  };

  /* -------------------------------------------------------------
     VIEWS
  ------------------------------------------------------------- */

  // Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 block mb-1">
            Faculty Teaching Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome, Mr. Marcus Sterling
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Head of Mathematics · Grade 10A Class Teacher · Greenfield International School
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveNav('attendance')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            Take Attendance
          </button>
          <button
            onClick={() => setActiveNav('marks')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Award className="w-4 h-4" />
            Enter Marks
          </button>
          <button
            onClick={() => setIsAssignmentModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Assignment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Classes"
          value="4 Periods"
          subtitle="Grade 10A, 10B, 8A"
          icon={<Clock className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="Assigned Students"
          value="88 Enrolled"
          subtitle="Across 3 sections"
          icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Pending Homework"
          value="1 Due Tomorrow"
          subtitle="Quadratic Equations Set"
          icon={<FileText className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Exam Marks Pending"
          value="Grade 10B"
          subtitle="Midterm Math review"
          icon={<Award className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Schedule & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Teaching Schedule ({dashboardDay})
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDashboardDay(d)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    dashboardDay === d
                      ? 'bg-white text-emerald-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const slots = state.timetable
              .filter((s) => s.teacherId === teacherId && s.day === dashboardDay)
              .sort((a, b) => a.periodNumber - b.periodNumber);

            if (slots.length === 0) {
              return (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  No classes scheduled on {dashboardDay} for Mr. Sterling.
                </div>
              );
            }

            return (
              <div className="space-y-2.5 text-xs">
                {slots.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{s.subject}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {s.period}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px] mt-0.5 block">
                        {s.time} · {s.room}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs border border-emerald-200">
                      {s.class}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Parent Communication
            </h3>
            <button
              onClick={() => setActiveNav('messages')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Open Messenger →
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs">
            <span className="font-semibold text-indigo-900 block">
              Vikram Sharma (Parent of Aarav Sharma):
            </span>
            <p className="text-indigo-950 mt-1 italic leading-relaxed">
              "Aarav has been thoroughly enjoying the algebra quadratic problems. Are there extra practice
              sheets available for Olympiad prep?"
            </p>
            <div className="mt-3">
              <button
                onClick={() => setActiveNav('messages')}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
              >
                Reply to Mr. Sharma →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Simplified, Fast & Professional Teacher Class Attendance
  const renderAttendanceWorkflow = () => (
    <TeacherAttendanceView initialClass={attClass} onNavigateTab={setActiveNav} />
  );

  // Marks Entry Workflow
  const renderMarksWorkflow = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Exam Marks Entry</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter student scores, auto-calculate letter grades, and update class grade averages.
        </p>

        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Class</label>
            <select
              value={markClass}
              onChange={(e) => setMarkClass(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              {myClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Subject</label>
            <input
              type="text"
              value={markSubject}
              onChange={(e) => setMarkSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Assessment / Exam</label>
            <select
              value={markExam}
              onChange={(e) => setMarkExam(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="Midterm Examination">Midterm Examination</option>
              <option value="Unit Test 1">Unit Test 1</option>
              <option value="Quarterly Assessment">Quarterly Assessment</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <form onSubmit={handleSaveMarks}>
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Students Roster — {markClass} ({markClassStudents.length} Students)
            </span>
            <span className="text-slate-500">Max Score: 100 Marks</span>
          </div>

          <div className="divide-y divide-slate-100">
            {markClassStudents.map((std) => {
              const currentVal =
                marksEntries[std.id] !== undefined
                  ? marksEntries[std.id]
                  : state.marks.find(
                      (m) => m.studentId === std.id && m.subject === markSubject && m.exam === markExam
                    )?.marks || 88;

              return (
                <div
                  key={std.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400">#{std.rollNo}</span>
                    <span className="font-semibold text-slate-900">{std.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={currentVal}
                      onChange={(e) =>
                        setMarksEntries({
                          ...marksEntries,
                          [std.id]: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-right text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="font-mono text-slate-400">/ 100</span>
                    <span className="w-10 text-center font-bold font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                      {currentVal >= 90 ? 'A+' : currentVal >= 80 ? 'A' : currentVal >= 70 ? 'B' : 'C'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Save & Publish Marks
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Acceptance Test 4: Assignment Workflow
  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Manage Assignments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, publish, edit, or remove coursework tasks. Published assignments immediately appear in student and parent portals.
          </p>
        </div>

        <button
          onClick={() => setIsAssignmentModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.assignments
          .filter((a) => a.teacherId === teacherId || myClasses.includes(a.class))
          .map((asg) => (
            <div key={asg.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                    {asg.class} · {asg.subject}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{asg.title}</h3>
                </div>
                <StatusBadge status={asg.status} />
              </div>

              <p className="text-xs text-slate-600 mt-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {asg.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Due: <strong className="text-slate-800">{asg.dueDate}</strong>
                </span>
                <button
                  onClick={() => deleteAssignment(asg.id)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  // Messages Workflow
  const renderMessages = () => (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Parent & Faculty Messaging</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real two-way conversational channel with guardians and academic coordinators.
        </p>

        {/* Conversation Box */}
        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Thread: Vikram Sharma (Father of Aarav Sharma, Grade 8A)
            </span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>

          <div className="p-4 space-y-3 max-h-72 overflow-y-auto text-xs">
            {state.messages
              .filter((m) => m.threadId === 'thr-vikram-sterling')
              .map((msg) => {
                const isMe = msg.senderRole === 'teacher';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-medium mb-1">
                      {msg.senderName} · {msg.timestamp}
                    </span>
                    <div
                      className={`p-3 rounded-xl leading-relaxed ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
          </div>

          <form onSubmit={handleSendParentReply} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder="Type your message to Mr. Vikram Sharma..."
              value={parentReplyText}
              onChange={(e) => setParentReplyText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // My Classes View
  const renderMyClasses = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Assigned Cohorts & Classes</h2>
          <p className="text-xs text-slate-500 mt-1">
            Classes instructed by Marcus Sterling · Mathematics & STEM Department.
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
          3 Active Classes Assigned
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {myClasses.map((clsName) => {
          const students = state.students.filter((s) => s.class === clsName);
          return (
            <div key={clsName} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-base text-slate-900">{clsName}</span>
                  <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {students.length} Students
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Subject: Mathematics (Algebra & Geometry)</p>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-600">
                  <div className="flex justify-between">
                    <span>Class Attendance:</span>
                    <span className="font-bold text-emerald-600 font-mono">95.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Attainment:</span>
                    <span className="font-bold text-slate-900 font-mono">86.2%</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    setAttClass(clsName);
                    setActiveNav('attendance');
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                >
                  Take Attendance →
                </button>
                <button
                  onClick={() => {
                    setMarkClass(clsName);
                    setActiveNav('marks');
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Enter Marks →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Students Directory View
  const renderStudents = () => {
    const teacherStudents = state.students.filter((s) => myClasses.includes(s.class));
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Enrolled Students Roster</h2>
            <p className="text-xs text-slate-500 mt-1">
              Students across Grade 10A, 10B, and 8A enrolled in mathematics courses.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 px-3 py-1.5 bg-slate-100 rounded-lg">
            {teacherStudents.length} Total Enrolled
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Admission ID</th>
                  <th className="px-4 py-3.5">Cohort</th>
                  <th className="px-4 py-3.5 font-mono text-center">Score Avg</th>
                  <th className="px-4 py-3.5 font-mono text-center">Attendance</th>
                  <th className="px-4 py-3.5">Parent / Contact</th>
                  <th className="px-5 py-3.5 text-right">Direct Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teacherStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedStudentForView(std)}
                        className="font-bold text-slate-900 hover:text-indigo-600 hover:underline text-left cursor-pointer transition-colors"
                      >
                        {std.name}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{std.admissionId}</td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-700">{std.class}</td>
                    <td className="px-4 py-3.5 font-mono text-center font-bold text-slate-800">
                      {std.academicStatus}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-center font-semibold text-emerald-600">
                      {std.attendanceRate}%
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {std.parentName} ({std.parentPhone})
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedStudentForView(std)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-semibold text-xs border border-indigo-200 transition-colors"
                          title="View Student Profile"
                        >
                          <Eye className="w-3 h-3" />
                          Profile
                        </button>
                        <button
                          onClick={() => setActiveNav('messages')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-semibold text-xs border border-emerald-200 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Chat
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudentForEdit({ ...std });
                            setIsEditStudentOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Student Academic Status"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Timetable View - Read-Only for Teachers (Managed by Academic Administration)
  const renderTimetable = () => (
    <WeeklyTimetable
      initialTeacherId={teacherId}
      initialClass="Grade 10A"
      canEdit={false}
      title="Faculty Teaching Schedule — Marcus Sterling"
      subtitle="View-only institutional schedule across assigned cohorts (Grade 10A, Grade 10B, Grade 8A). Official timetable adjustments and room allocations are managed by Academic Administration."
    />
  );

  // Exams View
  const renderExams = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Examinations & Invigilation Duties</h2>
          <p className="text-xs text-slate-500 mt-1">
            Upcoming midterm math exams, paper setting deadlines, and hall invigilation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Mathematics Examination Grid</h3>
          <div className="space-y-3">
            {[
              { date: 'Oct 12, 2026', time: '09:00 - 11:30 AM', class: 'Grade 10A & 10B', title: 'Mathematics Midterm Theory' },
              { date: 'Oct 15, 2026', time: '09:00 - 11:00 AM', class: 'Grade 8A', title: 'Mathematics Midterm Theory' },
              { date: 'Oct 20, 2026', time: '01:00 - 02:30 PM', class: 'Grade 10A', title: 'Geometry Practical Portfolio' },
            ].map((ex, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 block">{ex.title}</span>
                  <span className="text-[11px] text-slate-500">{ex.class}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-800 block">{ex.date}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{ex.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Invigilation Assignments</h3>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="font-bold text-emerald-900 block">Duty 1: Science Lab 1 (Oct 14, 08:45 AM)</span>
              <p className="text-emerald-800 text-[11px] mt-0.5">Invigilating Grade 10B Physics practical assessment with Laura Bennett.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 block">Paper Setting Clearance</span>
              <p className="text-slate-600 text-[11px] mt-0.5">Question Paper for Grade 10 Midterm uploaded and signed off by Vice Principal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Notices View
  const renderNotices = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Faculty Bulletins & Academic Circulars</h2>
        <p className="text-xs text-slate-500 mt-1">Official memos dispatched to teaching faculty.</p>
      </div>

      <div className="space-y-3 text-xs">
        {state.notices.map((n) => (
          <div key={n.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold">
                {n.category}
              </span>
              <span className="font-mono text-slate-400 text-[11px]">{n.date}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">{n.title}</h3>
            <p className="text-slate-600">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Settings View
  const renderSettings = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Faculty Profile & Office Consultation</h2>
        <p className="text-xs text-slate-500 mt-1">Personal teaching dossier, office hours, and contact details.</p>

        <div className="mt-6 space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 block mb-1">Faculty Member</label>
              <input type="text" readOnly value="Marcus Sterling" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-semibold text-slate-900" />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Employee ID</label>
              <input type="text" readOnly value="TCH-2021-04" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono" />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Assigned Department</label>
              <input type="text" readOnly value="Mathematics & STEM" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-medium" />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Office Consultation Room</label>
              <input type="text" readOnly value="Room 304 (Math Faculty Annex)" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-medium" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {state.activeNav === 'dashboard' && renderDashboard()}
      {state.activeNav === 'my_classes' && renderMyClasses()}
      {state.activeNav === 'students' && renderStudents()}
      {state.activeNav === 'attendance' && renderAttendanceWorkflow()}
      {state.activeNav === 'marks' && renderMarksWorkflow()}
      {state.activeNav === 'assignments' && renderAssignments()}
      {state.activeNav === 'timetable' && renderTimetable()}
      {state.activeNav === 'exams' && renderExams()}
      {state.activeNav === 'notices' && <NoticeBoardModule />}
      {state.activeNav === 'events' && <AcademicCalendarModule />}
      {state.activeNav === 'calendar' && <AcademicCalendarModule />}
      {state.activeNav === 'messages' && <InternalMessagingModule />}
      {state.activeNav === 'settings' && renderSettings()}
      {![
        'dashboard',
        'my_classes',
        'students',
        'attendance',
        'marks',
        'assignments',
        'timetable',
        'exams',
        'notices',
        'events',
        'calendar',
        'messages',
        'settings',
      ].includes(state.activeNav) && renderDashboard()}

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title="Create New Assignment"
        subtitle="Publish homework, lab reflections, or projects for your assigned classes."
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Assignment Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Trigonometric Identities Problem Set 3"
              value={asgForm.title}
              onChange={(e) => setAsgForm({ ...asgForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Class Section</label>
              <select
                value={asgForm.class}
                onChange={(e) => setAsgForm({ ...asgForm, class: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {myClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subject</label>
              <input
                type="text"
                value={asgForm.subject}
                onChange={(e) => setAsgForm({ ...asgForm, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
              <input
                type="date"
                value={asgForm.dueDate}
                onChange={(e) => setAsgForm({ ...asgForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Publication Status</label>
              <select
                value={asgForm.status}
                onChange={(e) => setAsgForm({ ...asgForm, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Published">Published (Immediate)</option>
                <option value="Draft">Draft (Save Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Assignment Instructions</label>
            <textarea
              rows={3}
              placeholder="Provide problem numbers, textbook page references, or submission expectations..."
              value={asgForm.description}
              onChange={(e) => setAsgForm({ ...asgForm, description: e.target.value })}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAssignmentModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Assessment / Details Modal */}
      {selectedStudentForEdit && (
        <Modal
          isOpen={isEditStudentOpen}
          onClose={() => {
            setIsEditStudentOpen(false);
            setSelectedStudentForEdit(null);
          }}
          title={`Edit Student Assessment: ${selectedStudentForEdit.name}`}
          subtitle={`${selectedStudentForEdit.class} · Admission ID: ${selectedStudentForEdit.admissionId}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateStudent(selectedStudentForEdit);
              setIsEditStudentOpen(false);
              setSelectedStudentForEdit(null);
              addToast('Student Assessment Saved', `${selectedStudentForEdit.name}'s performance status has been updated.`, 'success');
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Roll Number</label>
                <input
                  type="text"
                  value={selectedStudentForEdit.rollNo}
                  onChange={(e) =>
                    setSelectedStudentForEdit({ ...selectedStudentForEdit, rollNo: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Attainment Rating</label>
                <select
                  value={selectedStudentForEdit.academicStatus}
                  onChange={(e) =>
                    setSelectedStudentForEdit({
                      ...selectedStudentForEdit,
                      academicStatus: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Parent Contact Number</label>
              <input
                type="text"
                value={selectedStudentForEdit.parentPhone}
                onChange={(e) =>
                  setSelectedStudentForEdit({ ...selectedStudentForEdit, parentPhone: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditStudentOpen(false);
                  setSelectedStudentForEdit(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Save Student Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={!!selectedStudentForView}
        onClose={() => setSelectedStudentForView(null)}
        student={selectedStudentForView}
        currentRole={state.currentRole}
        marks={state.marks.filter((m) => m.studentId === selectedStudentForView?.id)}
        attendance={state.attendance.filter((a) => a.studentId === selectedStudentForView?.id)}
        assignments={state.assignments.filter((a) => a.class === selectedStudentForView?.class)}
        receipts={state.payments.filter((r) => r.studentId === selectedStudentForView?.id)}
        onEditClick={(std) => {
          setSelectedStudentForEdit({ ...std });
          setIsEditStudentOpen(true);
          setSelectedStudentForView(null);
        }}
      />
    </div>
  );
};
