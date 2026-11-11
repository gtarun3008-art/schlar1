import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Teacher } from '../../../types';
import { MetricCard } from '../../common/MetricCard';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';
import { BarChart, LineChart } from '../../common/Charts';
import { WeeklyTimetable } from '../../common/WeeklyTimetable';
import { AcademicWorkspace } from '../../academic/AcademicWorkspace';
import { TeacherProfileModal } from '../../records/TeacherProfileModal';
import { PeriodAttendanceMatrix } from '../../attendance/PeriodAttendanceMatrix';
import { NoticeBoardModule } from '../../shared/NoticeBoardModule';
import { AcademicCalendarModule } from '../../shared/AcademicCalendarModule';
import { InternalMessagingModule } from '../../shared/InternalMessagingModule';
import { AuditTrailModule } from '../../shared/AuditTrailModule';
import { ReportExportFoundation } from '../../shared/ReportExportFoundation';
import {
  BookOpen,
  Award,
  Users,
  CheckSquare,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  MessageSquare,
  Send,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Plus,
  Eye,
  Settings,
  Download,
  Share2,
  Bell,
  ArrowRight,
} from 'lucide-react';

export const VicePrincipalView: React.FC = () => {
  const { state, setActiveNav, sendMessage, addToast, updateTeacher, addTeacherDocument } = useApp();
  const [fullProfileTeacher, setFullProfileTeacher] = useState<Teacher | null>(null);

  // Faculty Messaging state
  const [messageText, setMessageText] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('tch-sterling');

  // Classes & timetable filter
  const [selectedClassId, setSelectedClassId] = useState('cls-10a');
  const [selectedTimetableClass, setSelectedTimetableClass] = useState('Grade 10A');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Attendance sub-tab state
  const [attendanceSubTab, setAttendanceSubTab] = useState<'matrix' | 'analytics'>('matrix');

  // Exam marks approval state
  const [approvedExams, setApprovedExams] = useState<Record<string, boolean>>({
    'Grade 10A-Mathematics': true,
    'Grade 8A-Science': true,
  });
  const [selectedMarkSheetModal, setSelectedMarkSheetModal] = useState<{
    exam: string;
    class: string;
    subject: string;
  } | null>(null);
  const [selectedAssignmentDetail, setSelectedAssignmentDetail] = useState<any | null>(null);
  const [marksClassFilter, setMarksClassFilter] = useState('All');
  const [marksExamFilter, setMarksExamFilter] = useState('All');

  // Modal states
  const [selectedClassModal, setSelectedClassModal] = useState<any | null>(null);
  const [isScheduleExamModalOpen, setIsScheduleExamModalOpen] = useState(false);
  const [newExamForm, setNewExamForm] = useState({
    title: '',
    class: 'Grade 10A',
    subject: 'Physics',
    date: '2026-10-14',
    maxMarks: 100,
  });

  // Teacher workload modal / adjust
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<any | null>(null);
  const [isEditingWorkload, setIsEditingWorkload] = useState(false);
  const [editWorkloadForm, setEditWorkloadForm] = useState<{
    workloadHours: number;
    classes: string;
    status: Teacher['status'];
  }>({
    workloadHours: 24,
    classes: '',
    status: 'Active',
  });

  const pendingMarksClasses = [
    { id: 'pm-1', class: 'Grade 10B', subject: 'Physics', teacher: 'Laura Bennett', submittedDate: 'Yesterday', studentsCount: 28, status: 'Awaiting Sign-off' },
    { id: 'pm-2', class: 'Grade 7B', subject: 'Social Studies', teacher: 'David Kim', submittedDate: 'Today 09:30 AM', studentsCount: 30, status: 'Pending Review' },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const teacher = state.teachers.find((t) => t.id === selectedFaculty);
    sendMessage(
      'thr-vp-' + selectedFaculty,
      messageText.trim(),
      'school',
      'Sarah Jenkins (VP Academics)',
      selectedFaculty,
      teacher?.name || 'Faculty Member'
    );
    addToast('Faculty Note Sent', `Memo dispatched to ${teacher?.name || 'Faculty'}.`, 'success');
    setMessageText('');
  };

  const handleApproveMarks = (examKey: string, subjectName: string) => {
    setApprovedExams((prev) => ({ ...prev, [examKey]: true }));
    addToast('Marks Approved', `${subjectName} grade sheet validated and locked into student transcripts.`, 'success');
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamForm.title.trim()) {
      addToast('Validation', 'Please provide an exam title', 'error');
      return;
    }
    addToast('Exam Scheduled', `${newExamForm.title} (${newExamForm.class}) added to academic calendar.`, 'success');
    setIsScheduleExamModalOpen(false);
    setNewExamForm({
      title: '',
      class: 'Grade 10A',
      subject: 'Physics',
      date: '2026-10-14',
      maxMarks: 100,
    });
  };

  /* -------------------------------------------------------------
     TAB 1: ACADEMIC DASHBOARD
  ------------------------------------------------------------- */
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 block mb-1">
            Academic Oversight & Quality Assurance
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Academic Coordinator Desk — Sarah Jenkins
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Greenfield International School · Term 1 syllabus pacing, faculty allocations & standards moderation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveNav('marks')}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Review Pending Marks
          </button>
          <button
            onClick={() => setIsScheduleExamModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Assessment
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Academic Avg"
          value="82.4%"
          subtitle="Across all midterm evaluations"
          change={{ value: '+2.1% improvement', isPositive: true }}
          icon={<Award className="w-5 h-5 text-purple-600" />}
        />
        <MetricCard
          title="Pending Marks Submissions"
          value={pendingMarksClasses.filter((p) => !approvedExams[p.class + '-' + p.subject]).length}
          subtitle="Classes awaiting coordinator approval"
          change={{ value: '2 pending reviews', isPositive: false }}
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Faculty Workload Avg"
          value="21.5h"
          subtitle="Instructional hours per week"
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="Syllabus Completion"
          value="74.2%"
          subtitle="Target for Midterm: 70%"
          change={{ value: '+4.2% ahead of plan', isPositive: true }}
          icon={<CheckSquare className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subject Performance Benchmarks</h3>
              <p className="text-xs text-slate-500">Average exam attainment percentage</p>
            </div>
            <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Target: 80%
            </span>
          </div>
          <BarChart
            data={[
              { label: 'Math', value: 86.4, color: 'bg-purple-600' },
              { label: 'Science', value: 84.1, color: 'bg-indigo-600' },
              { label: 'English', value: 89.2, color: 'bg-emerald-600' },
              { label: 'CompSci', value: 92.0, color: 'bg-teal-600' },
              { label: 'History', value: 78.5, color: 'bg-amber-600' },
              { label: 'Physics', value: 81.3, color: 'bg-rose-600' },
            ]}
            height={160}
            valueSuffix="%"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance vs Academic Attainment</h3>
              <p className="text-xs text-slate-500">Correlation across high school cohorts</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              R = 0.89 strong
            </span>
          </div>
          <LineChart
            data={[
              { label: 'Grade 7', value: 75.8 },
              { label: 'Grade 8', value: 82.4 },
              { label: 'Grade 9', value: 81.0 },
              { label: 'Grade 10', value: 84.5 },
            ]}
            height={160}
            lineColor="#9333ea"
          />
        </div>
      </div>

      {/* Workload and Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Workload Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Teacher Instructional Workload</h3>
            <button
              onClick={() => setActiveNav('teachers')}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
            >
              View Full Workload →
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            {state.teachers.map((tch) => (
              <div
                key={tch.id}
                onClick={() => setSelectedTeacherModal(tch)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 cursor-pointer transition-all"
              >
                <div>
                  <span className="font-semibold text-slate-900 block">{tch.name}</span>
                  <span className="text-[11px] text-slate-500">{tch.roleTitle} · {tch.subjects.join(', ')}</span>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold tabular-nums ${tch.workloadHours > 24 ? 'text-amber-600' : 'text-slate-800'}`}>
                    {tch.workloadHours} hrs/wk
                  </span>
                  <span className="text-[10px] text-emerald-600 block">
                    {tch.classes.length} Classes assigned
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Marks & Moderation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Marks Moderation & Sign-Off</h3>
            <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Needs Approval
            </span>
          </div>
          <div className="space-y-3 text-xs">
            {pendingMarksClasses.map((item) => {
              const isApproved = approvedExams[item.class + '-' + item.subject];
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isApproved
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.class} · {item.subject}</span>
                        <StatusBadge status={isApproved ? 'Approved' : 'Pending'} />
                      </div>
                      <p className="text-slate-600 mt-1">
                        Teacher: <span className="font-medium text-slate-800">{item.teacher}</span> · {item.studentsCount} candidates
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        Submitted: {item.submittedDate}
                      </span>
                    </div>
                    <div>
                      {!isApproved ? (
                        <button
                          onClick={() => handleApproveMarks(item.class + '-' + item.subject, item.subject)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Marks
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Validated
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 2: CLASSES OVERSIGHT
  ------------------------------------------------------------- */
  const renderClasses = () => (
    <AcademicWorkspace initialTab="classes" />
  );

  /* -------------------------------------------------------------
     TAB 3: TEACHER WORKLOAD
  ------------------------------------------------------------- */
  const renderTeachers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Faculty Workload & Allocation Index</h2>
          <p className="text-xs text-slate-500 mt-1">
            Weekly instructional hours, class allocations, and substitution availability monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
            Optimal Range: 18 - 24 hrs/wk
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Faculty Member</th>
                <th className="px-4 py-3.5">Employee ID</th>
                <th className="px-4 py-3.5">Subjects Taught</th>
                <th className="px-4 py-3.5">Assigned Classes</th>
                <th className="px-4 py-3.5">Weekly Workload</th>
                <th className="px-4 py-3.5">Workload Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.teachers.map((tch) => {
                const isHeavy = tch.workloadHours > 24;
                const isLight = tch.workloadHours < 16;
                return (
                  <tr key={tch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{tch.name}</div>
                      <div className="text-[11px] text-slate-400">{tch.roleTitle}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{tch.employeeId}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {tch.subjects.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {tch.classes.join(', ')}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800 text-sm">
                      {tch.workloadHours} hrs
                    </td>
                    <td className="px-4 py-3.5">
                      {isHeavy ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Over Capacity
                        </span>
                      ) : isLight ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Light Load
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Balanced
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedTeacherModal(tch);
                          setEditWorkloadForm({
                            workloadHours: tch.workloadHours,
                            classes: tch.classes.join(', '),
                            status: tch.status,
                          });
                          setIsEditingWorkload(true);
                        }}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md font-semibold text-xs border border-purple-200 transition-colors"
                      >
                        Edit Load
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTeacherModal(tch);
                          setIsEditingWorkload(false);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs border border-slate-200 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setFullProfileTeacher(tch)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-xs border border-indigo-200 transition-colors inline-flex items-center gap-1"
                        title="View Full Academic Profile & Timetable"
                      >
                        <Eye className="w-3 h-3" />
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 4: SUBJECT PERFORMANCE & ALLOCATION
  ------------------------------------------------------------- */
  const renderSubjects = () => (
    <AcademicWorkspace initialTab="subjects" />
  );

  /* -------------------------------------------------------------
     TAB 5: ATTENDANCE MONITORING
  ------------------------------------------------------------- */
  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Attendance Audit & Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional coordinator oversight of period-wise student attendance, teacher assignments, and risk analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAttendanceSubTab('matrix')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              attendanceSubTab === 'matrix'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Period Attendance Matrix
          </button>
          <button
            onClick={() => setAttendanceSubTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              attendanceSubTab === 'analytics'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Attendance Rates & Risk
          </button>
        </div>
      </div>

      {attendanceSubTab === 'matrix' ? (
        <PeriodAttendanceMatrix onNavigateTab={setActiveNav} />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Academic Attendance Audit</h2>
              <p className="text-xs text-slate-500 mt-1">
                Correlating daily presence with academic test scores and identifying chronic absentees.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                Schoolwide: 94.6% Today
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Class-wise Attendance Rates</h3>
              <div className="space-y-3 text-xs">
                {state.classes.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-900">{cls.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }} />
                      </div>
                      <span className="font-mono font-bold text-purple-700">95.0%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Students Flagged for Low Attendance</h3>
              <div className="space-y-2.5 text-xs">
                {state.students
                  .filter((s) => s.attendanceRate < 85)
                  .map((s) => (
                    <div key={s.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{s.name} ({s.class})</span>
                        <span className="text-[11px] text-slate-500">Parent: {s.parentName} · {s.parentPhone}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-700 text-sm">{s.attendanceRate}%</span>
                        <span className="text-[10px] text-amber-800 block">Below 85% Threshold</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* -------------------------------------------------------------
     TAB 6: EXAM OPERATIONS & MARKS APPROVAL
  ------------------------------------------------------------- */
  const renderExams = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Exam Schedules & Moderation</h2>
          <p className="text-xs text-slate-500 mt-1">
            Midterm examinations, unit tests, and invigilation duty rosters.
          </p>
        </div>
        <button
          onClick={() => setIsScheduleExamModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Midterm Examination Schedule</h3>
          <div className="space-y-3">
            {[
              { date: 'Oct 12, 2026', time: '09:00 - 11:30 AM', subject: 'Mathematics (All Cohorts)', room: 'Main Examination Hall', status: 'Question Paper Set' },
              { date: 'Oct 14, 2026', time: '09:00 - 11:30 AM', subject: 'Physics & Science', room: 'Hall A & Lab 1', status: 'Lab Material Verified' },
              { date: 'Oct 16, 2026', time: '09:00 - 11:30 AM', subject: 'English Literature', room: 'Hall B', status: 'Ready for Print' },
            ].map((ex, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{ex.subject}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{ex.date} · {ex.time}</span>
                  <span className="text-[11px] text-slate-400 block">{ex.room}</span>
                </div>
                <StatusBadge status="Scheduled" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Faculty Invigilation Roster</h3>
          <div className="space-y-2.5">
            {[
              { teacher: 'Emily Watson', dutyDate: 'Oct 12, 08:45 AM', venue: 'Hall A' },
              { teacher: 'Marcus Sterling', dutyDate: 'Oct 14, 08:45 AM', venue: 'Science Lab 1' },
              { teacher: 'David Kim', dutyDate: 'Oct 16, 08:45 AM', venue: 'Hall B' },
            ].map((inv, i) => (
              <div key={i} className="p-3 rounded-xl border border-purple-100 bg-purple-50/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{inv.teacher}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{inv.dutyDate}</span>
                </div>
                <span className="px-2 py-1 bg-white font-medium text-purple-700 rounded border border-purple-200 text-[11px]">
                  {inv.venue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 6.5: MARKS MODERATION & APPROVAL
  ------------------------------------------------------------- */
  const renderMarksApproval = () => {
    const examSets: {
      key: string;
      exam: string;
      class: string;
      subject: string;
      teacherName: string;
      records: typeof state.marks;
      avgScore: number;
      maxScore: number;
      minScore: number;
      isApproved: boolean;
    }[] = [];

    const map = new Map<string, typeof state.marks>();
    state.marks.forEach((m) => {
      const key = `${m.exam}__${m.class}__${m.subject}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });

    map.forEach((records, key) => {
      const [exam, cls, subj] = key.split('__');
      const scores = records.map((r) => r.marks);
      const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
      const max = scores.length ? Math.max(...scores) : 0;
      const min = scores.length ? Math.min(...scores) : 0;
      const teacher = state.teachers.find((t) => t.classes.includes(cls) && t.subjects.includes(subj))?.name || 'Subject Faculty';
      const isApproved = approvedExams[`${cls}-${subj}`] ?? false;

      examSets.push({
        key,
        exam,
        class: cls,
        subject: subj,
        teacherName: teacher,
        records,
        avgScore: avg,
        maxScore: max,
        minScore: min,
        isApproved,
      });
    });

    const filteredExamSets = examSets.filter((es) => {
      const matchesClass = marksClassFilter === 'All' || es.class === marksClassFilter;
      const matchesExam = marksExamFilter === 'All' || es.exam === marksExamFilter;
      return matchesClass && matchesExam;
    });

    const totalSubmissions = examSets.length;
    const approvedCount = examSets.filter((e) => e.isApproved).length;
    const pendingCount = totalSubmissions - approvedCount;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Academic Governance · AY 2025–2026
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  Moderation Board
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Marks Moderation & Approval</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted assessment score rosters, verify statistical grade distributions, and authorize publishing to parents and students.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const bulk: Record<string, boolean> = {};
                  examSets.forEach((es) => (bulk[`${es.class}-${es.subject}`] = true));
                  setApprovedExams((prev) => ({ ...prev, ...bulk }));
                  addToast('All Marks Approved', 'All pending grade rosters published to student records.', 'success');
                }}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Approve All Pending
              </button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block text-[11px] font-semibold uppercase">Total Submitted Rosters</span>
              <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">{totalSubmissions}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-emerald-700 block text-[11px] font-semibold uppercase">Published to Parents</span>
              <span className="text-xl font-bold text-emerald-800 font-mono mt-1 block">{approvedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
              <span className="text-amber-700 block text-[11px] font-semibold uppercase">Pending Board Approval</span>
              <span className="text-xl font-bold text-amber-800 font-mono mt-1 block">{pendingCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <span className="text-purple-700 block text-[11px] font-semibold uppercase">Overall School Attainment</span>
              <span className="text-xl font-bold text-purple-800 font-mono mt-1 block">84.2%</span>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Cohort:</span>
              <select
                value={marksClassFilter}
                onChange={(e) => setMarksClassFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
              >
                <option value="All">All Cohorts</option>
                {state.classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Exam:</span>
              <select
                value={marksExamFilter}
                onChange={(e) => setMarksExamFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
              >
                <option value="All">All Examinations</option>
                <option value="Midterm Examination">Midterm Examination</option>
                <option value="Unit Test 1">Unit Test 1</option>
                <option value="Quarterly Assessment">Quarterly Assessment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exam Sets Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Cohort & Exam</th>
                  <th className="px-4 py-3.5">Subject & Faculty</th>
                  <th className="px-4 py-3.5 text-center">Assessed Count</th>
                  <th className="px-4 py-3.5 text-center">Class Average</th>
                  <th className="px-4 py-3.5 text-center">Score Range</th>
                  <th className="px-4 py-3.5 text-center">Moderation Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExamSets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                      No examination mark rosters match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredExamSets.map((es) => (
                    <tr key={es.key} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        <span className="font-bold text-slate-900 block">{es.class}</span>
                        <span className="text-[11px] text-slate-500">{es.exam}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-purple-700 block">{es.subject}</span>
                        <span className="text-[11px] text-slate-400">{es.teacherName}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-700">
                        {es.records.length} Students
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            es.avgScore >= 85
                              ? 'text-emerald-700 bg-emerald-50'
                              : es.avgScore >= 70
                              ? 'text-indigo-700 bg-indigo-50'
                              : 'text-amber-700 bg-amber-50'
                          }`}
                        >
                          {es.avgScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-slate-600 text-[11px]">
                        Min: {es.minScore}% · Max: {es.maxScore}%
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {es.isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Approved & Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Pending Moderation
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() =>
                            setSelectedMarkSheetModal({
                              exam: es.exam,
                              class: es.class,
                              subject: es.subject,
                            })
                          }
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                        >
                          Inspect Roster
                        </button>
                        {!es.isApproved ? (
                          <button
                            onClick={() => {
                              setApprovedExams((prev) => ({
                                ...prev,
                                [`${es.class}-${es.subject}`]: true,
                              }));
                              addToast(
                                'Marks Approved',
                                `Approved and published ${es.class} ${es.subject} scores to parent portal.`,
                                'success'
                              );
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs transition-colors shadow-2xs"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setApprovedExams((prev) => ({
                                ...prev,
                                [`${es.class}-${es.subject}`]: false,
                              }));
                              addToast(
                                'Moderation Reopened',
                                `Reopened moderation review for ${es.class} ${es.subject}.`,
                                'info'
                              );
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md text-xs transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     TAB 6.6: ASSIGNMENT REVIEW
  ------------------------------------------------------------- */
  const renderAssignmentReview = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Curriculum Management · AY 2025–2026
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  Instructional Review
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Assignment & Homework Review</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit weekly homework tasks, project submission deadlines, and student completion compliance across cohorts.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Total Active Assignments: {state.assignments.length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Title & Subject</th>
                  <th className="px-4 py-3.5">Class Cohort</th>
                  <th className="px-4 py-3.5">Teacher</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Submission Rate</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.assignments.map((asg) => {
                  const rate = asg.totalStudents > 0 ? Math.round((asg.submissionCount / asg.totalStudents) * 100) : 0;
                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block">{asg.title}</span>
                        <span className="text-[11px] text-purple-700 font-semibold">{asg.subject}</span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{asg.class}</td>
                      <td className="px-4 py-3.5 text-slate-600">{asg.teacherName}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">{asg.dueDate}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-800">{rate}%</span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400">({asg.submissionCount}/{asg.totalStudents})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={asg.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedAssignmentDetail(asg)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     TAB 7: MASTER TIMETABLE
  ------------------------------------------------------------- */
  const renderTimetable = () => (
    <AcademicWorkspace initialTab="timetable" initialClass={selectedTimetableClass} />
  );

  /* -------------------------------------------------------------
     TAB 8: ACADEMIC REPORTS
  ------------------------------------------------------------- */
  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Moderation Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export class attainment transcripts, grade curves, and accreditation dossiers.
          </p>
        </div>
        <button
          onClick={() => addToast('Exporting Dossier', 'Comprehensive Term 1 Academic Digest downloaded.', 'info')}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Download className="w-4 h-4" />
          Export Complete Dossier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-2">Grade Distribution Summary (All Classes)</h3>
          <div className="space-y-2 pt-2">
            {[
              { grade: 'A+ (90-100%)', pct: '28% of students', count: 32, bar: 'w-[28%] bg-emerald-500' },
              { grade: 'A (80-89%)', pct: '44% of students', count: 50, bar: 'w-[44%] bg-purple-500' },
              { grade: 'B (70-79%)', pct: '19% of students', count: 22, bar: 'w-[19%] bg-indigo-500' },
              { grade: 'C (60-69%)', pct: '7% of students', count: 8, bar: 'w-[7%] bg-amber-500' },
              { grade: 'Below 60%', pct: '2% of students', count: 2, bar: 'w-[2%] bg-rose-500' },
            ].map((g) => (
              <div key={g.grade} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-800">{g.grade}</span>
                  <span className="font-mono text-slate-500">{g.count} students ({g.pct.split(' ')[0]})</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${g.bar}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-2">Academic Accreditation Readiness</h3>
          <p className="text-slate-500 mb-4">Quality standards checklist for upcoming CBSE / IB accreditation review.</p>
          <div className="space-y-3">
            {[
              { title: 'Curriculum Lesson Plans Logged', status: 'Compliant (100%)', ok: true },
              { title: 'Internal Evaluation Double-Blinded', status: 'Verified', ok: true },
              { title: 'STEM Laboratory Safety Audit', status: 'Inspected Sep 15', ok: true },
              { title: 'Parent Academic Feedback Synthesis', status: 'In Progress (88%)', ok: false },
            ].map((chk, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-800 font-medium">{chk.title}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${chk.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {chk.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 9: NOTICES (ACADEMIC)
  ------------------------------------------------------------- */
  const renderNotices = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Circulars & Faculty Directives</h2>
          <p className="text-xs text-slate-500 mt-1">
            Notices issued regarding examination schedules, syllabus pacing, and moderation guidelines.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {state.notices
          .filter((n) => n.category === 'School' || n.category === 'Exam' || n.category === 'Important')
          .map((n) => (
            <div key={n.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[11px] font-semibold">
                  {n.category}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">{n.date}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{n.title}</h3>
              <p className="text-slate-600 leading-relaxed">{n.content}</p>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                Issued by: <span className="font-medium text-slate-700">{n.author}</span> · Audience: {n.targetAudience}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 10: FACULTY MESSAGING
  ------------------------------------------------------------- */
  const renderMessages = () => (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Faculty Internal Memo & Messaging</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Communicate schedule adjustments, mark submissions, and syllabus pacing notes directly with faculty.
        </p>

        <form onSubmit={handleSendMessage} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Faculty Recipient</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              {state.teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.roleTitle})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Directive / Note</label>
            <textarea
              rows={3}
              placeholder="e.g. Please verify that all laboratory safety logs for Wednesday practical are uploaded..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Send Faculty Note
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Faculty Transmissions</h3>
        <div className="space-y-2 text-xs">
          {state.messages
            .filter((m) => m.senderRole === 'school')
            .map((msg) => (
              <div key={msg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">To: {msg.recipientName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                </div>
                <p className="text-slate-600 mt-1">{msg.text}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 11: SETTINGS / ACADEMIC POLICIES
  ------------------------------------------------------------- */
  const renderSettings = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Academic Policy & Grading Standards</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure grading rubrics, passing thresholds, and term pacing.
        </p>

        <div className="mt-6 space-y-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="font-bold text-slate-900">Grading System Thresholds</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block">Grade A+ (Distinction)</label>
                <input type="text" readOnly value="90% - 100%" className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono font-medium" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block">Grade A (Merit)</label>
                <input type="text" readOnly value="80% - 89%" className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono font-medium" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block">Grade B (Pass)</label>
                <input type="text" readOnly value="70% - 79%" className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono font-medium" />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block">Minimum Pass Threshold</label>
                <input type="text" readOnly value="60%" className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono font-bold text-purple-700" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <h4 className="font-bold text-slate-900">Attendance Minimum For Exam Eligibility</h4>
            <p className="text-slate-600">Students falling below 85% attendance require academic board exemption to sit for end-of-term exams.</p>
            <span className="inline-block mt-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Threshold Enforced: 85.0%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {state.activeNav === 'dashboard' && renderDashboard()}
      {state.activeNav === 'classes' && renderClasses()}
      {state.activeNav === 'teachers' && renderTeachers()}
      {state.activeNav === 'subjects' && renderSubjects()}
      {state.activeNav === 'attendance' && renderAttendance()}
      {state.activeNav === 'exams' && renderExams()}
      {state.activeNav === 'marks' && renderMarksApproval()}
      {state.activeNav === 'assignments' && renderAssignmentReview()}
      {state.activeNav === 'timetable' && renderTimetable()}
      {state.activeNav === 'reports' && <ReportExportFoundation />}
      {state.activeNav === 'notices' && <NoticeBoardModule />}
      {state.activeNav === 'events' && <AcademicCalendarModule />}
      {state.activeNav === 'calendar' && <AcademicCalendarModule />}
      {state.activeNav === 'messages' && <InternalMessagingModule />}
      {state.activeNav === 'audit_logs' && <AuditTrailModule />}
      {state.activeNav === 'settings' && renderSettings()}
      {![
        'dashboard',
        'classes',
        'teachers',
        'subjects',
        'attendance',
        'exams',
        'marks',
        'assignments',
        'timetable',
        'reports',
        'notices',
        'events',
        'calendar',
        'messages',
        'audit_logs',
        'settings',
      ].includes(state.activeNav) && renderDashboard()}

      {/* Class Modal */}
      {selectedClassModal && (
        <Modal
          isOpen={!!selectedClassModal}
          onClose={() => setSelectedClassModal(null)}
          title={`Class Roster: ${selectedClassModal.name}`}
          subtitle={`Class Teacher: ${state.teachers.find((t) => t.id === selectedClassModal.classTeacherId)?.name || 'Assigned'}`}
        >
          <div className="space-y-4 text-xs">
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {state.students
                .filter((s) => s.class === selectedClassModal.name)
                .map((std) => (
                  <div key={std.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{std.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">Adm: {std.admissionId}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-emerald-600 block">{std.academicStatus}</span>
                      <span className="text-[10px] text-slate-500">{std.attendanceRate}% Attendance</span>
                    </div>
                  </div>
                ))}
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedClassModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Teacher Workload Detail Modal */}
      {selectedTeacherModal && (
        <Modal
          isOpen={!!selectedTeacherModal}
          onClose={() => setSelectedTeacherModal(null)}
          title={`${selectedTeacherModal.name} — Faculty Workload & Allocation`}
          subtitle={selectedTeacherModal.roleTitle}
        >
          <div className="space-y-4 text-xs">
            {!isEditingWorkload ? (
              <>
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-slate-500 block">Weekly Teaching Load</span>
                    <span className="font-mono font-bold text-base text-slate-900">{selectedTeacherModal.workloadHours} Hours / Week</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Assigned Classes</span>
                    <span className="font-bold text-slate-900">{selectedTeacherModal.classes.join(', ')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Approved Subjects</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTeacherModal.subjects.map((sub: string) => (
                      <span key={sub} className="px-2.5 py-1 bg-purple-50 text-purple-700 font-semibold rounded-md border border-purple-100">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setEditWorkloadForm({
                        workloadHours: selectedTeacherModal.workloadHours,
                        classes: selectedTeacherModal.classes.join(', '),
                        status: selectedTeacherModal.status,
                      });
                      setIsEditingWorkload(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg border border-purple-200 transition-colors"
                  >
                    Adjust Allocation / Workload
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFaculty(selectedTeacherModal.id);
                        setSelectedTeacherModal(null);
                        setActiveNav('messages');
                      }}
                      className="flex items-center gap-1 text-purple-600 font-semibold hover:underline"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Memo
                    </button>
                    <button
                      onClick={() => setSelectedTeacherModal(null)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Weekly Teaching Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={editWorkloadForm.workloadHours}
                    onChange={(e) =>
                      setEditWorkloadForm({ ...editWorkloadForm, workloadHours: Number(e.target.value) || 20 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Classes (comma separated)</label>
                  <input
                    type="text"
                    value={editWorkloadForm.classes}
                    onChange={(e) =>
                      setEditWorkloadForm({ ...editWorkloadForm, classes: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={editWorkloadForm.status}
                    onChange={(e) =>
                      setEditWorkloadForm({ ...editWorkloadForm, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingWorkload(false)}
                    className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated: any = {
                        ...selectedTeacherModal,
                        workloadHours: editWorkloadForm.workloadHours,
                        classes: editWorkloadForm.classes.split(',').map((c: string) => c.trim()).filter(Boolean),
                        status: editWorkloadForm.status,
                      };
                      updateTeacher(updated);
                      setSelectedTeacherModal(updated);
                      setIsEditingWorkload(false);
                      addToast('Allocation Updated', `Updated schedule load for ${updated.name}.`, 'success');
                    }}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Save Allocation
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Schedule Exam Assessment Modal */}
      <Modal
        isOpen={isScheduleExamModalOpen}
        onClose={() => setIsScheduleExamModalOpen(false)}
        title="Schedule Academic Assessment"
        subtitle="Log an upcoming test, midterm, or practical into the school exam grid."
      >
        <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Assessment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit Test 2: Analytical Geometry"
              value={newExamForm.title}
              onChange={(e) => setNewExamForm({ ...newExamForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Cohort / Class</label>
              <select
                value={newExamForm.class}
                onChange={(e) => setNewExamForm({ ...newExamForm, class: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Grade 10A">Grade 10A</option>
                <option value="Grade 10B">Grade 10B</option>
                <option value="Grade 9A">Grade 9A</option>
                <option value="Grade 8A">Grade 8A</option>
                <option value="Grade 7B">Grade 7B</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subject</label>
              <input
                type="text"
                value={newExamForm.subject}
                onChange={(e) => setNewExamForm({ ...newExamForm, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Exam Date</label>
              <input
                type="date"
                value={newExamForm.date}
                onChange={(e) => setNewExamForm({ ...newExamForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Max Score</label>
              <input
                type="number"
                value={newExamForm.maxMarks}
                onChange={(e) => setNewExamForm({ ...newExamForm, maxMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsScheduleExamModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Schedule Exam
            </button>
          </div>
        </form>
      </Modal>

      {/* Inspect Mark Sheet Modal */}
      {selectedMarkSheetModal && (
        <Modal
          isOpen={!!selectedMarkSheetModal}
          onClose={() => setSelectedMarkSheetModal(null)}
          title={`Grade Roster: ${selectedMarkSheetModal.subject} (${selectedMarkSheetModal.class})`}
          subtitle={`Examination: ${selectedMarkSheetModal.exam} · Moderated by Academic Council`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <div>
                <span className="font-semibold text-purple-900 block">Statistical Summary:</span>
                <span className="text-slate-600">
                  {state.marks.filter(
                    (m) =>
                      m.class === selectedMarkSheetModal.class &&
                      m.subject === selectedMarkSheetModal.subject &&
                      m.exam === selectedMarkSheetModal.exam
                  ).length}{' '}
                  Students Evaluated · Passing Standard: 60%
                </span>
              </div>
              <button
                onClick={() => {
                  setApprovedExams((prev) => ({
                    ...prev,
                    [`${selectedMarkSheetModal.class}-${selectedMarkSheetModal.subject}`]: true,
                  }));
                  addToast(
                    'Marks Approved',
                    `Score roster approved and published for ${selectedMarkSheetModal.class} ${selectedMarkSheetModal.subject}.`,
                    'success'
                  );
                  setSelectedMarkSheetModal(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Approve & Publish to Parents
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-4 py-2.5">Admission ID</th>
                    <th className="px-4 py-2.5 text-center">Score</th>
                    <th className="px-4 py-2.5 text-center">Max Marks</th>
                    <th className="px-4 py-2.5 text-center">Percentage</th>
                    <th className="px-4 py-2.5 text-center">Assigned Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.marks
                    .filter(
                      (m) =>
                        m.class === selectedMarkSheetModal.class &&
                        m.subject === selectedMarkSheetModal.subject &&
                        m.exam === selectedMarkSheetModal.exam
                    )
                    .map((mk) => {
                      const pct = Math.round((mk.marks / mk.maxMarks) * 100);
                      return (
                        <tr key={mk.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{mk.studentName}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-500">{mk.studentId}</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-center text-slate-800">
                            {mk.marks}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-center text-slate-400">
                            {mk.maxMarks}
                          </td>
                          <td className="px-4 py-2.5 font-mono font-semibold text-center text-slate-700">
                            {pct}%
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                mk.grade === 'A*' || mk.grade === 'A'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : mk.grade === 'B'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {mk.grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMarkSheetModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close Mark Sheet
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assignment Detail Modal */}
      {selectedAssignmentDetail && (
        <Modal
          isOpen={!!selectedAssignmentDetail}
          onClose={() => setSelectedAssignmentDetail(null)}
          title={selectedAssignmentDetail.title}
          subtitle={`${selectedAssignmentDetail.subject} · ${selectedAssignmentDetail.class}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 block font-semibold uppercase text-[10px]">Assigned By Faculty</span>
                <span className="font-bold text-slate-900">{selectedAssignmentDetail.teacherName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase text-[10px]">Submission Deadline</span>
                <span className="font-mono font-bold text-slate-900">{selectedAssignmentDetail.dueDate}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Assignment Instructions & Learning Objectives:</h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                {selectedAssignmentDetail.description}
              </p>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-900 block">Class Submission Compliance</span>
                <span className="text-slate-600">
                  {selectedAssignmentDetail.submissionCount} of {selectedAssignmentDetail.totalStudents} enrolled students completed
                </span>
              </div>
              <span className="font-mono font-bold text-base text-purple-700">
                {Math.round((selectedAssignmentDetail.submissionCount / selectedAssignmentDetail.totalStudents) * 100)}%
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAssignmentDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Faculty Full Profile & Timetable Modal */}
      <TeacherProfileModal
        isOpen={!!fullProfileTeacher}
        onClose={() => setFullProfileTeacher(null)}
        teacher={fullProfileTeacher}
        currentRole={state.currentRole}
        timetable={state.timetable.filter(
          (t) => t.teacherId === fullProfileTeacher?.id || t.teacherName === fullProfileTeacher?.name
        )}
        leaveRequests={state.leaveRequests.filter((l) => l.employeeName === fullProfileTeacher?.name)}
        onAddDocument={(teacherId, doc) => addTeacherDocument(teacherId, doc)}
      />
    </div>
  );
};
