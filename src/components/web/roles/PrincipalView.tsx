import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Student, Teacher, StaffMember, ClassRoom } from '../../../types';
import { MetricCard } from '../../common/MetricCard';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';
import { BarChart, LineChart, DonutChart } from '../../common/Charts';
import { WeeklyTimetable } from '../../common/WeeklyTimetable';
import { AcademicWorkspace } from '../../academic/AcademicWorkspace';
import { StudentDirectory } from '../../records/StudentDirectory';
import { StudentProfileModal } from '../../records/StudentProfileModal';
import { AddEditStudentModal } from '../../records/AddEditStudentModal';
import { LifecycleStatusModal } from '../../records/LifecycleStatusModal';
import { TeacherDirectory } from '../../records/TeacherDirectory';
import { TeacherProfileModal } from '../../records/TeacherProfileModal';
import { AddEditTeacherModal } from '../../records/AddEditTeacherModal';
import { StaffDirectory } from '../../records/StaffDirectory';
import { StaffProfileModal } from '../../records/StaffProfileModal';
import { AddEditStaffModal } from '../../records/AddEditStaffModal';
import { PeriodAttendanceMatrix } from '../../attendance/PeriodAttendanceMatrix';
import { NoticeBoardModule } from '../../shared/NoticeBoardModule';
import { AcademicCalendarModule } from '../../shared/AcademicCalendarModule';
import { InternalMessagingModule } from '../../shared/InternalMessagingModule';
import { AuditTrailModule } from '../../shared/AuditTrailModule';
import { ReportExportFoundation } from '../../shared/ReportExportFoundation';
import {
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  CheckSquare,
  DollarSign,
  Award,
  AlertTriangle,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Bell,
  RotateCcw,
  Check,
} from 'lucide-react';

export const PrincipalView: React.FC = () => {
  const {
    state,
    setActiveNav,
    addStudent,
    updateStudent,
    deleteStudent,
    transitionStudentLifecycle,
    addStudentDocument,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addTeacherDocument,
    addStaff,
    updateStaff,
    deleteStaff,
    addStaffDocument,
    addClass,
    updateClass,
    deleteClass,
    resetDemoData,
    addToast,
  } = useApp();

  // Search & Filter state for Students
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Student Modal states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [selectedStudentForLifecycle, setSelectedStudentForLifecycle] = useState<Student | null>(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<Student | null>(null);

  // Teacher Modal states
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [selectedTeacherForView, setSelectedTeacherForView] = useState<Teacher | null>(null);
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState<Teacher | null>(null);
  const [deleteConfirmTeacher, setDeleteConfirmTeacher] = useState<Teacher | null>(null);

  // Staff Modal states
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [selectedStaffForView, setSelectedStaffForView] = useState<StaffMember | null>(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<StaffMember | null>(null);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<StaffMember | null>(null);
  // Class Modal states
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<ClassRoom | null>(null);
  const [deleteConfirmClass, setDeleteConfirmClass] = useState<ClassRoom | null>(null);
  const [classFormData, setClassFormData] = useState({
    name: 'Grade 11A',
    grade: 'Grade 11',
    section: 'A',
    classTeacherId: 'tch-sterling',
    classTeacherName: 'Marcus Sterling',
    roomNumber: 'Room 304',
  });

  // Selected class for Timetable view
  const [selectedTimetableClass, setSelectedTimetableClass] = useState('Grade 10A');
  const [attendanceSubTab, setAttendanceSubTab] = useState<'matrix' | 'overview'>('matrix');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filtered Students
  const filteredStudents = state.students.filter((std) => {
    const matchesSearch =
      std.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      std.admissionId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      std.parentName.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesClass = classFilter === 'All' || std.class === classFilter;
    const matchesStatus = statusFilter === 'All' || std.status === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Summary Metrics calculations
  const totalStudents = state.students.length;
  const totalTeachers = state.teachers.length;
  const totalStaff = state.staff.length;
  const totalClasses = state.classes.length;

  const totalFees = state.fees.reduce((sum, f) => sum + f.totalFee, 0);
  const collectedFees = state.fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const pendingFees = state.fees.reduce((sum, f) => sum + f.pendingAmount, 0);
  const overdueFees = state.fees
    .filter((f) => f.status === 'Overdue')
    .reduce((sum, f) => sum + f.pendingAmount, 0);

  const avgAttendance =
    Math.round(
      (state.classes.reduce((sum, c) => sum + c.attendanceToday, 0) / (state.classes.length || 1)) * 10
    ) / 10;



  // Class handlers
  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classFormData.name.trim() || !classFormData.roomNumber.trim()) {
      addToast('Validation Error', 'Class name and room number are required.', 'error');
      return;
    }
    const selectedTch = state.teachers.find((t) => t.id === classFormData.classTeacherId);
    addClass({
      name: classFormData.name.trim(),
      grade: classFormData.grade.trim() || classFormData.name.split(' ')[0] || 'Grade',
      section: classFormData.section.trim() || 'A',
      classTeacherId: classFormData.classTeacherId,
      classTeacherName: selectedTch ? selectedTch.name : classFormData.classTeacherName,
      roomNumber: classFormData.roomNumber.trim(),
    });
    setIsAddClassOpen(false);
    setClassFormData({
      name: '',
      grade: 'Grade 11',
      section: 'A',
      classTeacherId: state.teachers[0]?.id || '',
      classTeacherName: state.teachers[0]?.name || '',
      roomNumber: 'Room 305',
    });
  };

  const handleEditClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForEdit) return;
    updateClass(selectedClassForEdit);
    setIsEditClassOpen(false);
    setSelectedClassForEdit(null);
  };

  /* -------------------------------------------------------------
     MODULE RENDERERS BASED ON ACTIVE NAV
  ------------------------------------------------------------- */

  // 1. Dashboard View
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
            Principal Operations Hub
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, Dr. Robert Hayes
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Greenfield International School · Academic Year 2026-2027 · Term 1 Week 8
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveNav('students');
              setIsAddStudentOpen(true);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value={totalStudents}
          subtitle="Enrolled across 6 grades"
          change={{ value: '+4 this month', isPositive: true }}
          icon={<GraduationCap className="w-5 h-5 text-indigo-600" />}
          actionText="View Directory"
          onAction={() => setActiveNav('students')}
        />

        <MetricCard
          title="Teaching Faculty"
          value={totalTeachers}
          subtitle="Full-time certified teachers"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          actionText="Faculty List"
          onAction={() => setActiveNav('teachers')}
        />

        <MetricCard
          title="Today's Attendance"
          value={`${avgAttendance}%`}
          subtitle="Overall school campus rate"
          change={{ value: '+1.4% vs last week', isPositive: true }}
          icon={<CheckSquare className="w-5 h-5 text-teal-600" />}
          actionText="Attendance Log"
          onAction={() => setActiveNav('attendance')}
        />

        <MetricCard
          title="Pending Tuition Fees"
          value={`$${pendingFees.toLocaleString()}`}
          subtitle={`${state.fees.filter((f) => f.status === 'Overdue').length} overdue accounts`}
          change={{ value: `$${overdueFees} critical`, isPositive: false }}
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
          actionText="Fee Ledger"
          onAction={() => setActiveNav('finance')}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance Overview</h3>
              <p className="text-xs text-slate-500">Weekly campus-wide attendance percentage</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Avg {avgAttendance}%
            </span>
          </div>
          <LineChart
            data={[
              { label: 'Mon', value: 92.5 },
              { label: 'Tue', value: 95.0 },
              { label: 'Wed', value: 94.2 },
              { label: 'Thu', value: 96.1 },
              { label: 'Today', value: avgAttendance },
            ]}
            height={160}
          />
        </div>

        {/* Academic Performance by Class */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Class Performance Averages</h3>
              <p className="text-xs text-slate-500">Midterm evaluation average across grades</p>
            </div>
            <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Goal: &gt;80%
            </span>
          </div>
          <BarChart
            data={state.classes.map((c) => ({
              label: c.name,
              value: c.averageMarks,
              displayValue: `${c.averageMarks}%`,
            }))}
            height={160}
            valueSuffix="%"
          />
        </div>
      </div>

      {/* Operational Highlights & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Important Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Institutional Attention
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
              <span className="font-semibold text-amber-900 block">Low Attendance Warning</span>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Lucas Brown (Grade 7B) attendance has fallen to 74.0%. Remedial session scheduled with
                guardian.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs">
              <span className="font-semibold text-rose-900 block">Overdue Fee Follow-up</span>
              <p className="text-rose-800 mt-0.5 leading-relaxed">
                2 student accounts with outstanding balance &gt; 15 days past due date.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs">
              <span className="font-semibold text-indigo-900 block">Upcoming STEM Fair</span>
              <p className="text-indigo-800 mt-0.5 leading-relaxed">
                Inter-school science exhibition registration deadline in 5 business days.
              </p>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Principal's Day
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100">
              <span className="font-mono font-semibold text-slate-700 shrink-0">08:30 AM</span>
              <div>
                <p className="font-semibold text-slate-900">Morning Faculty Assembly</p>
                <p className="text-slate-500">Briefing on mid-semester review</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100">
              <span className="font-mono font-semibold text-slate-700 shrink-0">11:00 AM</span>
              <div>
                <p className="font-semibold text-slate-900">Curriculum Advisory Meeting</p>
                <p className="text-slate-500">With Sarah Jenkins (VP Academics)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100">
              <span className="font-mono font-semibold text-slate-700 shrink-0">02:30 PM</span>
              <div>
                <p className="font-semibold text-slate-900">Parent Consultation (Aarav Sharma)</p>
                <p className="text-slate-500">Quarterly progress overview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Notices Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              Recent Notices
            </h3>
            <button
              onClick={() => setActiveNav('notices')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              All Notices →
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            {state.notices.slice(0, 3).map((notice) => (
              <div key={notice.id} className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                    {notice.title}
                  </span>
                  <StatusBadge status={notice.category} />
                </div>
                <p className="text-slate-500 text-[11px] mt-1 line-clamp-1">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Students Module
  const renderStudents = () => (
    <StudentDirectory
      students={state.students}
      classes={state.classes}
      currentRole={state.currentRole}
      onViewStudent={(std) => setSelectedStudentForView(std)}
      onEditStudent={(std) => {
        setSelectedStudentForEdit(std);
        setIsEditStudentOpen(true);
      }}
      onLifecycleStudent={(std) => setSelectedStudentForLifecycle(std)}
      onDeleteStudent={(std) => setDeleteConfirmStudent(std)}
      onAddStudent={() => {
        setSelectedStudentForEdit(null);
        setIsAddStudentOpen(true);
      }}
    />
  );

  // 3. Teachers Module
  const renderTeachers = () => (
    <TeacherDirectory
      teachers={state.teachers}
      classes={state.classes}
      currentRole={state.currentRole}
      onViewTeacher={(tch) => setSelectedTeacherForView(tch)}
      onEditTeacher={(tch) => {
        setSelectedTeacherForEdit(tch);
        setIsEditTeacherOpen(true);
      }}
      onDeleteTeacher={(tch) => setDeleteConfirmTeacher(tch)}
      onAddTeacher={() => {
        setSelectedTeacherForEdit(null);
        setIsAddTeacherOpen(true);
      }}
    />
  );

  // 4. Staff Directory
  const renderStaff = () => (
    <StaffDirectory
      staff={state.staff}
      currentRole={state.currentRole}
      onViewStaff={(stf) => setSelectedStaffForView(stf)}
      onEditStaff={(stf) => {
        setSelectedStaffForEdit(stf);
        setIsAddStaffOpen(true);
      }}
      onDeleteStaff={(stf) => setDeleteConfirmStaff(stf)}
      onAddStaff={() => {
        setSelectedStaffForEdit(null);
        setIsAddStaffOpen(true);
      }}
    />
  );

  // 5. Classes Module
  const renderClasses = () => (
    <AcademicWorkspace initialTab="classes" />
  );

  // 6. Academics Module
  const renderAcademics = () => (
    <AcademicWorkspace initialTab="setup" />
  );

  // 7. Attendance Module
  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Attendance Central</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live daily session checks, period-wise attendance matrix, class-wise rates, and students requiring intervention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAttendanceSubTab('matrix')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                attendanceSubTab === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Period Attendance Matrix
            </button>
            <button
              onClick={() => setAttendanceSubTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                attendanceSubTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Campus Overview & Rates
            </button>
          </div>
        </div>
      </div>

      {attendanceSubTab === 'matrix' ? (
        <PeriodAttendanceMatrix onNavigateTab={setActiveNav} />
      ) : (
        <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Today Campus Rate</span>
          <div className="mt-2 text-3xl font-bold text-slate-900 font-mono tabular-nums">{avgAttendance}%</div>
          <p className="text-xs text-emerald-600 mt-1">Nominal operational threshold</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Logged Records</span>
          <div className="mt-2 text-3xl font-bold text-slate-900 font-mono tabular-nums">{state.attendance.length}</div>
          <p className="text-xs text-slate-500 mt-1">Real records stored in state</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Intervention Alerts</span>
          <div className="mt-2 text-3xl font-bold text-rose-600 font-mono tabular-nums">
            {state.students.filter((s) => s.attendanceRate < 80).length}
          </div>
          <p className="text-xs text-slate-500 mt-1">&lt;80% attendance rate</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Class Attendance Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Class Teacher</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Today Attendance</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.classes.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-slate-700">{c.classTeacherName}</td>
                  <td className="px-4 py-3 font-mono">{c.totalStudents}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-emerald-600 tabular-nums">
                    {c.attendanceToday}%
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.attendanceToday >= 92 ? 'Excellent' : 'Normal'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}
  </div>
);

  // 8. Timetable Module
  const renderTimetable = () => (
    <AcademicWorkspace initialTab="timetable" initialClass={selectedTimetableClass} />
  );

  // 9. Exams Module
  const renderExams = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Examinations & Assessments</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Term schedules, upcoming assessments, and published grade records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <StatusBadge status="Ongoing" />
          <h3 className="text-sm font-bold text-slate-900 mt-3">Midterm Assessments 2026</h3>
          <p className="text-xs text-slate-500 mt-1">Grades 7 to 10 · 6 Core Subjects</p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Marks Recorded:</span>
            <span className="font-mono font-semibold">{state.marks.length} entries</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <StatusBadge status="Scheduled" />
          <h3 className="text-sm font-bold text-slate-900 mt-3">Unit Test 2</h3>
          <p className="text-xs text-slate-500 mt-1">Commencing Oct 22, 2026</p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Question Papers:</span>
            <span className="font-semibold text-emerald-600">Approved</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <StatusBadge status="Scheduled" />
          <h3 className="text-sm font-bold text-slate-900 mt-3">Annual Board Prelims</h3>
          <p className="text-xs text-slate-500 mt-1">Grade 10 · External Evaluators</p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Target Date:</span>
            <span className="font-mono">Dec 01, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 10. Assignments Module
  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Curriculum Assignments</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          School-wide homework and laboratory assignments published by teachers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.assignments.map((asg) => (
          <div key={asg.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                  {asg.class} · {asg.subject}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{asg.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Faculty: {asg.teacherName}</p>
              </div>
              <StatusBadge status={asg.status} />
            </div>

            <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {asg.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Due: <strong className="text-slate-800">{asg.dueDate}</strong>
              </span>
              <span className="font-mono text-slate-600">
                Submissions: {asg.submissionCount}/{asg.totalStudents}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 11. Notices & Events Module
  const renderNotices = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Institutional Notices</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official communications broadcast to teachers, parents, and students.
        </p>
      </div>

      <div className="space-y-3">
        {state.notices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={notice.category} />
                <h3 className="text-sm font-bold text-slate-900">{notice.title}</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{notice.date}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{notice.content}</p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Audience: {notice.targetAudience}</span>
              <span>Published by: {notice.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">School Calendar & Events</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Conferences, inter-school tournaments, exhibitions, and extracurricular programs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {state.events.map((evt) => (
          <div key={evt.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <StatusBadge status={evt.status || 'Upcoming'} />
            <h3 className="text-sm font-bold text-slate-900 mt-3">{evt.title}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {evt.date} · {evt.time}
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">{evt.description}</p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>Location: {evt.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 12. Finance Module
  const renderFinance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Institutional Finance</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tuition fee collections, pending student arrears, and financial summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Billed" value={`$${totalFees.toLocaleString()}`} />
        <MetricCard title="Collected Fees" value={`$${collectedFees.toLocaleString()}`} />
        <MetricCard title="Pending Receivables" value={`$${pendingFees.toLocaleString()}`} />
        <MetricCard title="Overdue Dues" value={`$${overdueFees.toLocaleString()}`} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Collection Status Breakdown</h3>
        <DonutChart
          segments={[
            { label: 'Collected', value: collectedFees, color: '#10B981' },
            { label: 'Pending Regular', value: pendingFees - overdueFees, color: '#F59E0B' },
            { label: 'Overdue Dues', value: overdueFees, color: '#EF4444' },
          ]}
          centerLabel="Total Billed"
          centerValue={`$${totalFees.toLocaleString()}`}
        />
      </div>
    </div>
  );

  // 13. Reports Module
  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Executive School Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Compiled performance statistics, attendance reports, and regulatory audit compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: 'Term 1 Academic Comprehensive Audit', date: 'Generated Sep 2026', size: '1.4 MB PDF' },
          { title: 'Annual Attendance & Punctuality Ledger', date: 'Updated Weekly', size: '850 KB XLSX' },
          { title: 'Fee Reconciliation & Receipts Statement', date: 'Monthly Audit', size: '2.1 MB CSV' },
        ].map((rep, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <FileText className="w-6 h-6 text-indigo-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">{rep.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{rep.date} · {rep.size}</p>
            <button
              onClick={() => addToast('Report Downloaded', `Mock export: ${rep.title}`, 'success')}
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              Export Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // 14. Settings Module
  const renderSettings = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">School & System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure Greenfield International School instance preferences and demo state.
        </p>

        <div className="mt-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">School Name</label>
              <input
                type="text"
                disabled
                value="Greenfield International School"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Academic Year</label>
              <input
                type="text"
                disabled
                value="2026-2027 (Term 1)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Demo State Reset</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            All modifications made during testing (added students, marked attendance, fee payments,
            visitor entries, library books, and leave approvals) are stored in your browser's
            localStorage. You can reset to the original sample school data at any time.
          </p>

          {showResetConfirm ? (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-rose-800">
                Are you sure? This will restore all demo datasets back to original state.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    resetDemoData();
                    setShowResetConfirm(false);
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-2xs"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="mt-4 inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Demo Data
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Route matching */}
      {state.activeNav === 'dashboard' && renderDashboard()}
      {state.activeNav === 'students' && renderStudents()}
      {state.activeNav === 'teachers' && renderTeachers()}
      {state.activeNav === 'staff' && renderStaff()}
      {state.activeNav === 'classes' && renderClasses()}
      {state.activeNav === 'academics' && renderAcademics()}
      {state.activeNav === 'attendance' && renderAttendance()}
      {state.activeNav === 'timetable' && renderTimetable()}
      {state.activeNav === 'exams' && renderExams()}
      {state.activeNav === 'assignments' && renderAssignments()}
      {state.activeNav === 'notices' && <NoticeBoardModule />}
      {state.activeNav === 'events' && <AcademicCalendarModule />}
      {state.activeNav === 'calendar' && <AcademicCalendarModule />}
      {state.activeNav === 'messages' && <InternalMessagingModule />}
      {state.activeNav === 'audit_logs' && <AuditTrailModule />}
      {state.activeNav === 'finance' && renderFinance()}
      {state.activeNav === 'reports' && <ReportExportFoundation />}
      {state.activeNav === 'settings' && renderSettings()}

      {/* -------------------------------------------------------------
         MODALS
      ------------------------------------------------------------- */}

      {/* Add / Edit Student Modal */}
      <AddEditStudentModal
        isOpen={isAddStudentOpen || isEditStudentOpen}
        onClose={() => {
          setIsAddStudentOpen(false);
          setIsEditStudentOpen(false);
          setSelectedStudentForEdit(null);
        }}
        classes={state.classes}
        studentToEdit={selectedStudentForEdit}
        existingStudents={state.students}
        onSave={(studentData) => {
          if (selectedStudentForEdit) {
            updateStudent({ ...studentData, id: selectedStudentForEdit.id });
          } else {
            addStudent(studentData);
          }
        }}
      />

      {/* Student Lifecycle Transition Modal */}
      <LifecycleStatusModal
        isOpen={!!selectedStudentForLifecycle}
        onClose={() => setSelectedStudentForLifecycle(null)}
        student={selectedStudentForLifecycle}
        classes={state.classes}
        onTransition={(studentId, toStatus, reason, targetClass) => {
          transitionStudentLifecycle(studentId, toStatus, reason, targetClass);
        }}
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={!!selectedStudentForView}
        onClose={() => setSelectedStudentForView(null)}
        student={selectedStudentForView}
        currentRole={state.currentRole}
        feeRecord={state.fees.find(
          (f) => f.studentId === selectedStudentForView?.id
        )}
        marks={state.marks.filter((m) => m.studentId === selectedStudentForView?.id)}
        attendance={state.attendance.filter((a) => a.studentId === selectedStudentForView?.id)}
        assignments={state.assignments.filter((a) => a.class === selectedStudentForView?.class)}
        receipts={state.payments.filter((r) => r.studentId === selectedStudentForView?.id)}
        onEditClick={(std) => {
          setSelectedStudentForEdit(std);
          setIsEditStudentOpen(true);
        }}
        onLifecycleClick={(std) => setSelectedStudentForLifecycle(std)}
        onAddDocument={(studentId, doc) => addStudentDocument(studentId, doc)}
      />

      {/* Delete Confirmation Modal for Student */}
      {deleteConfirmStudent && (
        <Modal
          isOpen={!!deleteConfirmStudent}
          onClose={() => setDeleteConfirmStudent(null)}
          title="Confirm Student Archive"
        >
          <div className="text-xs space-y-3">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to remove <strong>{deleteConfirmStudent.name}</strong> (
              {deleteConfirmStudent.admissionId}) from active enrollment?
            </p>
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmStudent(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteStudent(deleteConfirmStudent.id);
                  setDeleteConfirmStudent(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
              >
                Delete Student
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Teacher Profile Modal */}
      <TeacherProfileModal
        isOpen={!!selectedTeacherForView}
        onClose={() => setSelectedTeacherForView(null)}
        teacher={selectedTeacherForView}
        currentRole={state.currentRole}
        timetable={state.timetable.filter(
          (t) => t.teacherId === selectedTeacherForView?.id || t.teacherName === selectedTeacherForView?.name
        )}
        leaveRequests={state.leaveRequests.filter((l) => l.employeeName === selectedTeacherForView?.name)}
        onEditClick={(tch) => {
          setSelectedTeacherForEdit(tch);
          setIsEditTeacherOpen(true);
        }}
        onAddDocument={(teacherId, doc) => addTeacherDocument(teacherId, doc)}
      />

      {/* Add / Edit Teacher Modal */}
      <AddEditTeacherModal
        isOpen={isAddTeacherOpen || isEditTeacherOpen}
        onClose={() => {
          setIsAddTeacherOpen(false);
          setIsEditTeacherOpen(false);
          setSelectedTeacherForEdit(null);
        }}
        classes={state.classes}
        teacherToEdit={selectedTeacherForEdit}
        existingTeachers={state.teachers}
        onSave={(teacherData) => {
          if (selectedTeacherForEdit) {
            updateTeacher({ ...teacherData, id: selectedTeacherForEdit.id });
          } else {
            addTeacher(teacherData);
          }
        }}
      />

      {/* Delete Teacher Confirmation Modal */}
      {deleteConfirmTeacher && (
        <Modal
          isOpen={!!deleteConfirmTeacher}
          onClose={() => setDeleteConfirmTeacher(null)}
          title="Confirm Faculty Removal"
        >
          <div className="text-xs space-y-3">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to remove <strong>{deleteConfirmTeacher.name}</strong> (
              {deleteConfirmTeacher.roleTitle}) from the institutional roster?
            </p>
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmTeacher(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTeacher(deleteConfirmTeacher.id);
                  setDeleteConfirmTeacher(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
              >
                Delete Faculty
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Staff Profile Modal */}
      <StaffProfileModal
        isOpen={!!selectedStaffForView}
        onClose={() => setSelectedStaffForView(null)}
        staff={selectedStaffForView}
        currentRole={state.currentRole}
        leaveRequests={state.leaveRequests.filter((l) => l.employeeName === selectedStaffForView?.name)}
        onEditClick={(stf) => {
          setSelectedStaffForEdit(stf);
          setIsEditStaffOpen(true);
        }}
        onAddDocument={(staffId, doc) => addStaffDocument(staffId, doc)}
      />

      {/* Add / Edit Staff Modal */}
      <AddEditStaffModal
        isOpen={isAddStaffOpen || isEditStaffOpen}
        onClose={() => {
          setIsAddStaffOpen(false);
          setIsEditStaffOpen(false);
          setSelectedStaffForEdit(null);
        }}
        staffToEdit={selectedStaffForEdit}
        existingStaff={state.staff}
        onSave={(staffData) => {
          if (selectedStaffForEdit) {
            updateStaff({ ...staffData, id: selectedStaffForEdit.id });
          } else {
            addStaff(staffData);
          }
        }}
      />

      {/* Delete Staff Confirmation Modal */}
      {deleteConfirmStaff && (
        <Modal
          isOpen={!!deleteConfirmStaff}
          onClose={() => setDeleteConfirmStaff(null)}
          title="Confirm Staff Removal"
        >
          <div className="text-xs space-y-3">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to remove <strong>{deleteConfirmStaff.name}</strong> (
              {deleteConfirmStaff.role} · {deleteConfirmStaff.department}) from active employment records?
            </p>
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmStaff(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteStaff(deleteConfirmStaff.id);
                  setDeleteConfirmStaff(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
              >
                Delete Staff Member
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Class Modal */}
      <Modal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        title="Create Academic Class Section"
        subtitle="Establish a new student cohort, assign a class teacher, and dedicate a classroom."
      >
        <form onSubmit={handleAddClassSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Cohort Class Name *</label>
              <input
                type="text"
                required
                placeholder="Grade 11A"
                value={classFormData.name}
                onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Section</label>
              <input
                type="text"
                placeholder="A"
                value={classFormData.section}
                onChange={(e) => setClassFormData({ ...classFormData, section: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Classroom / Hall Number *</label>
              <input
                type="text"
                required
                placeholder="Room 305"
                value={classFormData.roomNumber}
                onChange={(e) => setClassFormData({ ...classFormData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Appointed Class Teacher</label>
              <select
                value={classFormData.classTeacherId}
                onChange={(e) => {
                  const tch = state.teachers.find((t) => t.id === e.target.value);
                  setClassFormData({
                    ...classFormData,
                    classTeacherId: e.target.value,
                    classTeacherName: tch ? tch.name : '',
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {state.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.roleTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddClassOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Create Class Cohort
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      {selectedClassForEdit && (
        <Modal
          isOpen={isEditClassOpen}
          onClose={() => {
            setIsEditClassOpen(false);
            setSelectedClassForEdit(null);
          }}
          title={`Edit Cohort: ${selectedClassForEdit.name}`}
          subtitle={`Classroom: ${selectedClassForEdit.roomNumber} · ${selectedClassForEdit.totalStudents} Students`}
        >
          <form onSubmit={handleEditClassSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cohort Name</label>
                <input
                  type="text"
                  required
                  value={selectedClassForEdit.name}
                  onChange={(e) => setSelectedClassForEdit({ ...selectedClassForEdit, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Section</label>
                <input
                  type="text"
                  required
                  value={selectedClassForEdit.section}
                  onChange={(e) => setSelectedClassForEdit({ ...selectedClassForEdit, section: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={selectedClassForEdit.roomNumber}
                  onChange={(e) => setSelectedClassForEdit({ ...selectedClassForEdit, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Class Teacher</label>
                <select
                  value={selectedClassForEdit.classTeacherId}
                  onChange={(e) => {
                    const tch = state.teachers.find((t) => t.id === e.target.value);
                    setSelectedClassForEdit({
                      ...selectedClassForEdit,
                      classTeacherId: e.target.value,
                      classTeacherName: tch ? tch.name : selectedClassForEdit.classTeacherName,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {state.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.roleTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditClassOpen(false);
                  setSelectedClassForEdit(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Update Class Cohort
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Class Confirmation Modal */}
      {deleteConfirmClass && (
        <Modal
          isOpen={!!deleteConfirmClass}
          onClose={() => setDeleteConfirmClass(null)}
          title="Confirm Class Cohort Deletion"
        >
          <div className="text-xs space-y-3">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to remove <strong>{deleteConfirmClass.name}</strong> ({deleteConfirmClass.roomNumber})?
              This will remove the cohort section from school scheduling.
            </p>
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmClass(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteClass(deleteConfirmClass.id);
                  setDeleteConfirmClass(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
              >
                Delete Class Section
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
