import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MetricCard } from '../../common/MetricCard';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';
import { BarChart, DonutChart } from '../../common/Charts';
import { StaffMember, Teacher } from '../../../types';
import {
  Users,
  Building,
  CheckSquare,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Briefcase,
  Plus,
  Eye,
  FileText,
  Printer,
  Download,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Edit2,
  Trash2,
  UserCheck,
  Shield,
  Award,
  ArrowRight,
  TrendingUp,
  MapPin,
  Lock,
} from 'lucide-react';

interface WorkAssignmentItem {
  id: string;
  staffName: string;
  role: string;
  department: string;
  primaryDuty: string;
  committee: string;
  reportingManager: string;
  term: string;
}

interface EmploymentDocumentItem {
  id: string;
  staffId: string;
  staffName: string;
  title: string;
  type: 'Contract' | 'Degree Transcripts' | 'Background Verification' | 'ID Proof' | 'Medical Certificate';
  issueDate: string;
  expiryDate?: string;
  status: 'Verified' | 'Pending Review';
  fileSize: string;
}

interface JobCandidate {
  id: string;
  name: string;
  position: string;
  department: string;
  applicationDate: string;
  experienceYears: number;
  education: string;
  email: string;
  phone: string;
  stage: 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Offer Extended' | 'Hired' | 'Rejected';
}

export const HRView: React.FC = () => {
  const {
    state,
    handleLeaveAction,
    addToast,
    addStaff,
    updateStaff,
    deleteStaff,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    logAuditEvent,
  } = useApp();

  // Search & Filter State
  const [staffSearch, setStaffSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Modals & Selections
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<any | null>(null);
  const [activeSalarySlip, setActiveSalarySlip] = useState<any | null>(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<any | null>(null);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<any | null>(null);

  // New Modals
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<JobCandidate | null>(null);

  // Leave Rejection Modal
  const [rejectLeaveTarget, setRejectLeaveTarget] = useState<any | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');

  // Work Assignments State
  const [assignments, setAssignments] = useState<WorkAssignmentItem[]>([
    { id: 'asg-1', staffName: 'Marcus Sterling', role: 'Mathematics Faculty', department: 'Academics', primaryDuty: 'Lead Instructor for Grade 8A & 10A Algebra', committee: 'Academic Advisory Board', reportingManager: 'Sarah Jenkins (Vice Principal)', term: 'Academic Session 2026-27' },
    { id: 'asg-2', staffName: 'Emily Watson', role: 'Science Faculty', department: 'Academics', primaryDuty: 'General Science & Life Sciences Coordinator', committee: 'STEM Laboratory Safety Council', reportingManager: 'Sarah Jenkins (Vice Principal)', term: 'Academic Session 2026-27' },
    { id: 'asg-3', staffName: 'Arthur Pendelton', role: 'Head Librarian', department: 'Library', primaryDuty: 'Cataloging, Digital Media Services & Archiving', committee: 'Literary & Reading Club', reportingManager: 'Dr. Robert Hayes (Principal)', term: 'Annual 2026-27' },
    { id: 'asg-4', staffName: 'Clara Oswald', role: 'Front Desk Officer', department: 'Front Office', primaryDuty: 'Visitor Reception, Admissions Tours & Inquiry Desk', committee: 'Admissions Coordination Panel', reportingManager: 'Eleanor Vance (HR Manager)', term: 'Annual 2026-27' },
    { id: 'asg-5', staffName: 'Edward Fletcher', role: 'Chief Accountant', department: 'Accounts', primaryDuty: 'Fee Collections, Banking Reconciliation & Audits', committee: 'Financial Compliance Board', reportingManager: 'Dr. Robert Hayes (Principal)', term: 'Annual 2026-27' },
  ]);

  // Employment Documents State
  const [documents, setDocuments] = useState<EmploymentDocumentItem[]>([
    { id: 'doc-1', staffId: 'tch-sterling', staffName: 'Marcus Sterling', title: 'Faculty Employment Agreement', type: 'Contract', issueDate: '2024-08-15', status: 'Verified', fileSize: '1.4 MB' },
    { id: 'doc-2', staffId: 'tch-sterling', staffName: 'Marcus Sterling', title: 'M.Sc. Mathematics Degree Certificate', type: 'Degree Transcripts', issueDate: '2024-08-10', status: 'Verified', fileSize: '850 KB' },
    { id: 'doc-3', staffId: 'tch-watson', staffName: 'Emily Watson', title: 'State Police Background Clearance', type: 'Background Verification', issueDate: '2025-01-12', status: 'Verified', fileSize: '420 KB' },
    { id: 'doc-4', staffId: 'stf-front-1', staffName: 'Clara Oswald', title: 'Official Employment Contract (Renewed)', type: 'Contract', issueDate: '2025-06-01', status: 'Verified', fileSize: '1.2 MB' },
    { id: 'doc-5', staffId: 'stf-lib-1', staffName: 'Arthur Pendelton', title: 'Master of Library Science (MLS) Diploma', type: 'Degree Transcripts', issueDate: '2023-05-18', status: 'Verified', fileSize: '980 KB' },
    { id: 'doc-6', staffId: 'stf-acc-1', staffName: 'Edward Fletcher', title: 'Certified Public Accountant (CPA) License', type: 'Degree Transcripts', issueDate: '2022-09-01', status: 'Verified', fileSize: '1.1 MB' },
  ]);

  // Recruitment Candidates State
  const [candidates, setCandidates] = useState<JobCandidate[]>([
    { id: 'can-1', name: 'Dr. Julian Sterling', position: 'Secondary Physics Faculty', department: 'Academics', applicationDate: '2026-09-20', experienceYears: 7, education: 'Ph.D. Experimental Physics', email: 'julian.sterling@example.com', phone: '+1 (555) 301-4491', stage: 'Interview Scheduled' },
    { id: 'can-2', name: 'Melissa Thorne', position: 'Junior Laboratory Assistant', department: 'Academics', applicationDate: '2026-09-22', experienceYears: 3, education: 'B.Sc. Chemistry', email: 'melissa.t@example.com', phone: '+1 (555) 781-9922', stage: 'Shortlisted' },
    { id: 'can-3', name: 'Jonathan Vance', position: 'Assistant Systems Administrator', department: 'IT Support', applicationDate: '2026-09-18', experienceYears: 4, education: 'B.S. Computer Engineering', email: 'j.vance@example.com', phone: '+1 (555) 441-8833', stage: 'Offer Extended' },
    { id: 'can-4', name: 'Hannah Blake', position: 'Front Desk Associate', department: 'Front Office', applicationDate: '2026-09-15', experienceYears: 2, education: 'B.A. Public Communications', email: 'hannah.b@example.com', phone: '+1 (555) 220-7711', stage: 'Applied' },
  ]);

  // Form State for Adding Staff
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    role: 'Instructor',
    department: 'Academics',
    email: '',
    phone: '',
    qualification: 'M.Sc., B.Ed.',
    joinDate: new Date().toISOString().split('T')[0],
  });

  // Form State for Work Assignment
  const [newAssignmentForm, setNewAssignmentForm] = useState({
    staffName: '',
    role: '',
    department: 'Academics',
    primaryDuty: '',
    committee: '',
    reportingManager: 'Sarah Jenkins (Vice Principal)',
  });

  // Form State for Employment Document
  const [newDocForm, setNewDocForm] = useState({
    staffName: '',
    title: '',
    type: 'Contract' as EmploymentDocumentItem['type'],
    issueDate: new Date().toISOString().split('T')[0],
  });

  // Form State for Recruitment Candidate
  const [newCandidateForm, setNewCandidateForm] = useState({
    name: '',
    position: 'Secondary Physics Faculty',
    department: 'Academics',
    experienceYears: 4,
    education: 'M.Sc. Physics',
    email: '',
    phone: '',
  });

  // Combined staff for unified display
  const combinedStaff = [
    ...state.staff.map((s) => ({
      id: s.id,
      name: s.name,
      employeeId: s.employeeId,
      role: s.role,
      department: s.department,
      email: s.email,
      phone: s.phone,
      attendanceRate: s.attendanceRate,
      status: s.status,
      employmentType: s.employmentType || 'Full-time',
      joiningDate: s.joiningDate || '2024-09-01',
      salary: '$4,800',
    })),
    ...state.teachers.map((t) => ({
      id: t.id,
      name: t.name,
      employeeId: t.employeeId,
      role: t.roleTitle,
      department: 'Academics',
      email: t.email,
      phone: t.phone,
      attendanceRate: t.attendanceRate,
      status: t.status,
      employmentType: 'Full-time',
      joiningDate: t.joiningDate || '2024-09-01',
      salary: '$5,200',
    })),
  ];

  // Calculations
  const totalEmployees = combinedStaff.length;
  const onLeaveCount = combinedStaff.filter((emp) => emp.status === 'On Leave').length;
  const presentToday = totalEmployees - onLeaveCount;
  const pendingLeaves = state.leaveRequests.filter((l) => l.status === 'Pending').length;

  const filteredStaff = combinedStaff.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      emp.role.toLowerCase().includes(staffSearch.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(staffSearch.toLowerCase());
    const matchDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  // Export CSV Helper
  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export Complete', `${filename} generated and downloaded.`, 'success');
  };

  // Onboard Staff Submission
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name.trim() || !newStaffForm.email.trim()) {
      addToast('Validation', 'Staff name and email are required.', 'error');
      return;
    }

    // Check duplicate email
    if (combinedStaff.some((emp) => emp.email.toLowerCase() === newStaffForm.email.toLowerCase())) {
      addToast('Duplicate Error', 'An employee with this email already exists.', 'error');
      return;
    }

    if (newStaffForm.department === 'Academics') {
      addTeacher({
        name: newStaffForm.name.trim(),
        employeeId: `TCH-${Date.now().toString().slice(-4)}`,
        roleTitle: newStaffForm.role || 'Faculty Instructor',
        department: 'Academics',
        email: newStaffForm.email.trim(),
        phone: newStaffForm.phone.trim() || '+1 (555) 000-0000',
        joiningDate: newStaffForm.joinDate,
        status: 'Active',
        classes: ['Grade 8A'],
        subjects: ['General Academics'],
        workloadHours: 20,
        qualification: newStaffForm.qualification || 'M.Sc., B.Ed.',
      });
    } else {
      addStaff({
        name: newStaffForm.name.trim(),
        employeeId: `STF-${Date.now().toString().slice(-4)}`,
        role: newStaffForm.role,
        department: newStaffForm.department as any,
        email: newStaffForm.email.trim(),
        phone: newStaffForm.phone.trim() || '+1 (555) 000-0000',
        joiningDate: newStaffForm.joinDate,
        status: 'Active',
        employmentType: 'Full-time',
        qualifications: newStaffForm.qualification,
      });
    }

    logAuditEvent(`Onboarded Employee: ${newStaffForm.name} (${newStaffForm.department})`, newStaffForm.name, 'Admissions');
    setIsAddStaffOpen(false);
    setNewStaffForm({
      name: '',
      role: 'Instructor',
      department: 'Academics',
      email: '',
      phone: '',
      qualification: 'M.Sc., B.Ed.',
      joinDate: new Date().toISOString().split('T')[0],
    });
    addToast('Employee Onboarded', `${newStaffForm.name} registered into institutional roster.`, 'success');
  };

  // Edit Staff Submission
  const handleEditStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForEdit) return;

    if (selectedStaffForEdit.department === 'Academics') {
      const existingTeacher = state.teachers.find((t) => t.id === selectedStaffForEdit.id);
      if (existingTeacher) {
        updateTeacher({
          ...existingTeacher,
          name: selectedStaffForEdit.name,
          roleTitle: selectedStaffForEdit.role,
          email: selectedStaffForEdit.email,
          phone: selectedStaffForEdit.phone,
          status: selectedStaffForEdit.status,
        });
      }
    } else {
      const existingStaff = state.staff.find((s) => s.id === selectedStaffForEdit.id);
      if (existingStaff) {
        updateStaff({
          ...existingStaff,
          name: selectedStaffForEdit.name,
          role: selectedStaffForEdit.role,
          department: selectedStaffForEdit.department,
          email: selectedStaffForEdit.email,
          phone: selectedStaffForEdit.phone,
          status: selectedStaffForEdit.status,
        });
      }
    }

    logAuditEvent(`Updated Staff Record: ${selectedStaffForEdit.name}`, selectedStaffForEdit.name, 'Admissions');
    setIsEditStaffOpen(false);
    setSelectedStaffForEdit(null);
    addToast('Record Updated', 'Employee details saved.', 'success');
  };

  // Delete/Archive Confirmation
  const handleDeleteStaffConfirm = (emp: any) => {
    if (emp.department === 'Academics') {
      deleteTeacher(emp.id);
    } else {
      deleteStaff(emp.id);
    }
    logAuditEvent(`Archived Employee Record: ${emp.name}`, emp.name, 'Admissions');
    setDeleteConfirmStaff(null);
    addToast('Employee Archived', `${emp.name} marked as separated/archived.`, 'info');
  };

  // Leave Approval Handler with Safeguard
  const handleApproveLeave = (leave: any) => {
    // Safeguard: HR Manager Eleanor Vance cannot approve her own leave request
    if (leave.employeeName && leave.employeeName.toLowerCase().includes('eleanor vance')) {
      addToast('Policy Safeguard', 'HR Manager may not approve their own leave. Must be submitted to Principal Dr. Hayes.', 'error');
      return;
    }

    handleLeaveAction(leave.id, 'Approved');
    logAuditEvent(`Approved Leave for ${leave.employeeName} (${leave.leaveType})`, leave.employeeName, 'Attendance');
    addToast('Leave Approved', `Leave application for ${leave.employeeName} granted.`, 'success');
  };

  const handleConfirmRejectLeave = () => {
    if (!rejectLeaveTarget) return;
    handleLeaveAction(rejectLeaveTarget.id, 'Rejected');
    logAuditEvent(`Rejected Leave for ${rejectLeaveTarget.employeeName}: ${rejectReasonText}`, rejectLeaveTarget.employeeName, 'Attendance');
    setRejectLeaveTarget(null);
    setRejectReasonText('');
    addToast('Leave Rejected', `Leave application declined.`, 'info');
  };

  /* -------------------------------------------------------------
     TAB 1: HR DASHBOARD
  ------------------------------------------------------------- */
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 block mb-1">
            Human Resources & Staff Directorate
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Personnel Operations & Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Eleanor Vance (HR & Personnel Manager) · Greenfield International School
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Onboard Employee
          </button>
          <button
            onClick={() => setIsAddCandidateOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Employees"
          value={totalEmployees.toString()}
          subtitle={`${state.teachers.length} Faculty · ${state.staff.length} Administrative`}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="Staff Present Today"
          value={`${presentToday} / ${totalEmployees}`}
          subtitle={`${Math.round((presentToday / (totalEmployees || 1)) * 100)}% attendance presence`}
          change={{ value: `${onLeaveCount} on authorized leave`, isPositive: onLeaveCount === 0 }}
          icon={<CheckSquare className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Pending Leave Review"
          value={pendingLeaves.toString()}
          subtitle="Requests awaiting HR decision"
          change={{ value: pendingLeaves > 0 ? 'Requires attention' : 'Queue clear', isPositive: pendingLeaves === 0 }}
          icon={<Calendar className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Open Vacancies"
          value={candidates.length.toString()}
          subtitle="Active recruitment candidates"
          icon={<Briefcase className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Department Distribution & Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Staff Headcount by Department</h3>
          <p className="text-xs text-slate-500 mb-4">Organizational workforce allocation</p>
          <DonutChart
            segments={[
              { label: 'Academics', value: state.teachers.length + 1, color: '#164E55' },
              { label: 'Administration', value: 2, color: '#287B7A' },
              { label: 'Front Office', value: 1, color: '#C47D54' },
              { label: 'Library', value: 1, color: '#4f46e5' },
              { label: 'Accounts', value: 1, color: '#059669' },
            ]}
            size={160}
            centerLabel="Staff"
            centerValue={totalEmployees.toString()}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent HR Compliance & Audits</h3>
              <p className="text-xs text-slate-500">Personnel changes and approvals</p>
            </div>
          </div>

          <div className="space-y-3">
            {state.auditLogs
              .filter((l) => l.category === 'Attendance' || l.category === 'Security' || l.actor.includes('Eleanor'))
              .slice(0, 4)
              .map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs">
                  <Shield className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-900 block">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      {log.timestamp} · {log.actor} ({log.role})
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Staff Quick Action Roster */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Active Staff Registry Snippet</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Attendance</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {combinedStaff.slice(0, 5).map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{emp.name}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{emp.employeeId}</td>
                  <td className="px-4 py-3.5 text-slate-600">{emp.department}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{emp.role}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">{emp.attendanceRate}%</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedStaffProfile(emp)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 2: STAFF DIRECTORY
  ------------------------------------------------------------- */
  const renderStaffDirectory = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Institutional Faculty & Staff Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete institutional directory of instructional, administrative, and operations personnel.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or title..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
          >
            <option value="All">All Departments</option>
            <option value="Academics">Academics</option>
            <option value="Administration">Administration</option>
            <option value="Accounts">Accounts & Finance</option>
            <option value="Front Office">Front Office</option>
            <option value="Library">Library</option>
            <option value="IT Support">IT Support</option>
            <option value="Operations">Operations</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Probation">Probation</option>
          </select>

          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Staff
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5 font-mono">Joining Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No staff records found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[10px] text-slate-400">{emp.employmentType}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{emp.employeeId}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{emp.department}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{emp.role}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-700">{emp.email}</div>
                      <div className="font-mono text-[10px] text-slate-400">{emp.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{emp.joiningDate}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStaffProfile(emp)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                          title="View Personnel Dossier"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaffForEdit(emp);
                            setIsEditStaffOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="Edit Staff Information"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmStaff(emp)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Archive Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

  /* -------------------------------------------------------------
     TAB 3: DEPARTMENTS & ROLES
  ------------------------------------------------------------- */
  const renderDepartments = () => {
    const departments = [
      { name: 'Academics', head: 'Sarah Jenkins (Vice Principal)', staffCount: state.teachers.length + 1, budget: '$48,000 / mo', location: 'Academic Wing & Laboratories' },
      { name: 'Administration', head: 'Dr. Robert Hayes (Principal)', staffCount: 2, budget: '$18,500 / mo', location: 'Executive Suite, Level 2' },
      { name: 'Accounts & Finance', head: 'Edward Fletcher (Chief Accountant)', staffCount: 1, budget: '$8,200 / mo', location: 'Finance Office, Level 1' },
      { name: 'Front Office & Reception', head: 'Clara Oswald', staffCount: 1, budget: '$6,500 / mo', location: 'Campus Main Lobby' },
      { name: 'Library Media Center', head: 'Arthur Pendelton', staffCount: 1, budget: '$7,100 / mo', location: 'Knowledge Commons, East Wing' },
      { name: 'IT Support & Systems', head: 'Rachel Green', staffCount: 1, budget: '$8,900 / mo', location: 'Computer Systems Center' },
      { name: 'Operations & Facilities', head: 'Gary Vance (Transport & Facility)', staffCount: 1, budget: '$12,400 / mo', location: 'Facility Operations Hub' },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Organizational Departments & Wings</h2>
            <p className="text-xs text-slate-500 mt-1">
              Functional departments, reporting hierarchy, and leadership allocation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{dept.name}</span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-indigo-700 bg-indigo-50 text-[10px]">
                  {dept.staffCount} Staff
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Head of Department</span>
                  <span className="font-semibold text-slate-800">{dept.head}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Campus Location</span>
                  <span>{dept.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     TAB 4: STAFF ATTENDANCE
  ------------------------------------------------------------- */
  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Faculty & Staff Attendance Journal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional presence tracking, duty check-ins, and biometric verification log.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold font-mono text-xs rounded-lg border border-emerald-200">
            {presentToday} / {totalEmployees} Present Today ({Math.round((presentToday / (totalEmployees || 1)) * 100)}%)
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Recorded Check In</th>
                <th className="px-4 py-3.5 font-mono">Attendance Rate</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {combinedStaff.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{emp.name}</td>
                  <td className="px-4 py-3.5 text-slate-600">{emp.department}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">
                    {emp.status === 'On Leave' ? '— (On Leave)' : '07:55 AM'}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">{emp.attendanceRate}%</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={emp.status === 'On Leave' ? 'Absent' : 'Present'} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => addToast('Attendance Audited', `Logged attendance verification for ${emp.name}.`, 'info')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 5: LEAVE MANAGEMENT
  ------------------------------------------------------------- */
  const renderLeave = () => {
    const filteredLeaves = state.leaveRequests.filter((l) => {
      if (leaveStatusFilter === 'All') return true;
      return l.status === leaveStatusFilter;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Leave Applications & Authorizations</h2>
            <p className="text-xs text-slate-500 mt-1">
              Authorizing casual leaves, medical dispensations, and academic conference duties.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setLeaveStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  leaveStatusFilter === st
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Leave Type</th>
                  <th className="px-4 py-3.5 font-mono">Duration</th>
                  <th className="px-4 py-3.5">Reason / Justification</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No leave applications matching selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{l.employeeName}</td>
                      <td className="px-4 py-3.5 text-slate-600">{l.department}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{l.leaveType}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {l.startDate} to {l.endDate} ({l.days} {l.days === 1 ? 'day' : 'days'})
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{l.reason}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {l.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveLeave(l)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs shadow-2xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectLeaveTarget(l)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-semibold text-xs border border-rose-200"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Completed</span>
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
     TAB 6: WORK ASSIGNMENTS
  ------------------------------------------------------------- */
  const renderWorkAssignments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Work Assignments & Institutional Committees</h2>
          <p className="text-xs text-slate-500 mt-1">
            Documenting duty schedules, reporting hierarchy, and special committee delegations.
          </p>
        </div>
        <button
          onClick={() => setIsAddAssignmentOpen(true)}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Assign Duty
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Primary Responsibility</th>
                <th className="px-4 py-3.5">Institutional Committee</th>
                <th className="px-4 py-3.5">Reporting Manager</th>
                <th className="px-4 py-3.5">Assignment Term</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((asg) => (
                <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{asg.staffName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{asg.department}</td>
                  <td className="px-4 py-3.5 text-slate-800 font-medium">{asg.primaryDuty}</td>
                  <td className="px-4 py-3.5 font-semibold text-indigo-700">{asg.committee}</td>
                  <td className="px-4 py-3.5 text-slate-500">{asg.reportingManager}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{asg.term}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 7: EMPLOYMENT DOCUMENTS
  ------------------------------------------------------------- */
  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Employment Credentials & Document Register</h2>
          <p className="text-xs text-slate-500 mt-1">
            Verified contracts, background verification clearances, and academic certificates.
          </p>
        </div>
        <button
          onClick={() => setIsAddDocOpen(true)}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Register Document
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Document Title</th>
                <th className="px-4 py-3.5">Staff Member</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 font-mono">Verified Date</th>
                <th className="px-4 py-3.5 font-mono">File Size</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{doc.title}</td>
                  <td className="px-4 py-3.5 text-slate-700">{doc.staffName}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{doc.type}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{doc.issueDate}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">{doc.fileSize}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => addToast('Document Downloaded', `${doc.title} retrieved securely.`, 'info')}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 8: RECRUITMENT & HIRING
  ------------------------------------------------------------- */
  const renderRecruitment = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Talent Acquisition & Faculty Recruitment</h2>
          <p className="text-xs text-slate-500 mt-1">
            Managing candidate applications, panel interviews, and formal offer letters.
          </p>
        </div>
        <button
          onClick={() => setIsAddCandidateOpen(true)}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Candidate
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Candidate Name</th>
                <th className="px-4 py-3.5">Position Applied</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Experience & Credentials</th>
                <th className="px-4 py-3.5 font-mono">Application Date</th>
                <th className="px-4 py-3.5">Recruitment Stage</th>
                <th className="px-5 py-3.5 text-right">Advance Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((can) => (
                <tr key={can.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{can.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{can.email}</div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{can.position}</td>
                  <td className="px-4 py-3.5 text-slate-600">{can.department}</td>
                  <td className="px-4 py-3.5 text-slate-700">
                    <div>{can.education}</div>
                    <div className="text-[10px] text-slate-400">{can.experienceYears} Years Exp</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{can.applicationDate}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded font-semibold bg-rose-50 text-rose-700 border border-rose-200 text-[10px]">
                      {can.stage}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        const stages: JobCandidate['stage'][] = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Offer Extended', 'Hired'];
                        const currIdx = stages.indexOf(can.stage);
                        const nextStage = stages[Math.min(stages.length - 1, currIdx + 1)];
                        setCandidates(candidates.map((c) => (c.id === can.id ? { ...c, stage: nextStage } : c)));
                        addToast('Stage Updated', `${can.name} transitioned to "${nextStage}".`, 'success');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                    >
                      Next Step →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 9: PAYROLL OVERVIEW & SALARY PRIVACY
  ------------------------------------------------------------- */
  const renderPayroll = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Payroll & Remuneration Audit</h2>
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
              <Lock className="w-3 h-3" />
              Confidential HR Scope
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monthly salary disbursements, academic allowances, and statutory benefit deductions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleExportCSV(
                'payroll_disbursements_summary.csv',
                ['Employee ID', 'Name', 'Department', 'Role', 'Monthly Remuneration', 'Status'],
                combinedStaff.map((e) => [e.employeeId, e.name, e.department, e.role, e.salary, 'Cleared'])
              );
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export Payroll (CSV)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5 font-mono">Pay Tier</th>
                <th className="px-4 py-3.5 font-mono text-right">Base Remuneration</th>
                <th className="px-4 py-3.5">Disbursement Status</th>
                <th className="px-5 py-3.5 text-right">Pay Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {combinedStaff.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{emp.name}</td>
                  <td className="px-4 py-3.5 text-slate-600">{emp.department}</td>
                  <td className="px-4 py-3.5 text-slate-700">{emp.role}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">Tier-A</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">{emp.salary}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold border border-emerald-200">
                      Disbursed
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setActiveSalarySlip(emp)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 10: HR REPORTS
  ------------------------------------------------------------- */
  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personnel Analytics & Compliance Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Auditing faculty retention, staff attendance trends, and credential verification metrics.
          </p>
        </div>
        <button
          onClick={() => {
            handleExportCSV(
              'hr_institutional_headcount.csv',
              ['Department', 'Headcount', 'Attendance Avg', 'Compliance Rate'],
              [
                ['Academics', state.teachers.length + 1, '98.5%', '100%'],
                ['Administration', 2, '99.0%', '100%'],
                ['Accounts & Finance', 1, '98.0%', '100%'],
                ['Front Office', 1, '97.5%', '100%'],
                ['Library Media', 1, '99.5%', '100%'],
              ]
            );
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Download className="w-4 h-4" />
          Export Headcount (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-2">
          <h4 className="font-bold text-slate-900 text-sm">Staff Attendance & Absenteeism Rate</h4>
          <p className="text-xs text-slate-500">30-day moving attendance reliability across wings</p>
          <div className="pt-2">
            <BarChart
              data={[
                { label: 'Academics', value: 98, color: 'bg-emerald-600' },
                { label: 'Admin', value: 99, color: 'bg-emerald-600' },
                { label: 'Accounts', value: 98, color: 'bg-emerald-600' },
                { label: 'Library', value: 100, color: 'bg-emerald-600' },
                { label: 'Front Desk', value: 97, color: 'bg-emerald-600' },
              ]}
              height={140}
              valueSuffix="%"
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-3">
          <h4 className="font-bold text-slate-900 text-sm">Regulatory & Credential Compliance</h4>
          <p className="text-xs text-slate-500">Background verification, police clearance, and academic diplomas</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <span>Criminal Background Clearances</span>
              <strong>100% Audited</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <span>University Degree Transcripts on File</span>
              <strong>100% Verified</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <span>Faculty State Teaching Credentials</span>
              <strong>100% Active</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 11: SETTINGS & HR POLICIES
  ------------------------------------------------------------- */
  const renderSettings = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">HR Rules & Leave Entitlements</h2>
        <p className="text-xs text-slate-500 mt-1">
          Institutional leave quotas and working hours per academic contract.
        </p>

        <div className="mt-6 space-y-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="font-bold text-slate-900">Annual Leave Entitlements</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-500 block">Casual Leave</label>
                <input type="text" readOnly value="12 Days / Year" className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded font-mono font-medium" />
              </div>
              <div>
                <label className="text-slate-500 block">Medical Leave</label>
                <input type="text" readOnly value="10 Days / Year" className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded font-mono font-medium" />
              </div>
              <div>
                <label className="text-slate-500 block">Academic Leave</label>
                <input type="text" readOnly value="5 Days / Year" className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded font-mono font-medium" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {state.activeNav === 'dashboard' && renderDashboard()}
      {state.activeNav === 'staff' && renderStaffDirectory()}
      {state.activeNav === 'staff_profiles' && renderStaffDirectory()}
      {state.activeNav === 'departments' && renderDepartments()}
      {state.activeNav === 'attendance' && renderAttendance()}
      {state.activeNav === 'leave' && renderLeave()}
      {state.activeNav === 'work_assignments' && renderWorkAssignments()}
      {state.activeNav === 'documents' && renderDocuments()}
      {state.activeNav === 'recruitment' && renderRecruitment()}
      {state.activeNav === 'payroll' && renderPayroll()}
      {state.activeNav === 'reports' && renderReports()}
      {state.activeNav === 'settings' && renderSettings()}
      {![
        'dashboard',
        'staff',
        'staff_profiles',
        'departments',
        'attendance',
        'leave',
        'work_assignments',
        'documents',
        'recruitment',
        'payroll',
        'reports',
        'settings',
      ].includes(state.activeNav) && renderDashboard()}

      {/* Onboard Staff Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Onboard New Employee"
        subtitle="Add a faculty instructor or administrative staff member to the school roster."
      >
        <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Jennifer Croft"
                value={newStaffForm.name}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Role / Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Chemistry Instructor"
                value={newStaffForm.role}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Department *</label>
              <select
                value={newStaffForm.department}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Academics">Academics (Faculty)</option>
                <option value="Administration">Administration</option>
                <option value="Accounts">Accounts & Finance</option>
                <option value="Front Office">Front Office & Reception</option>
                <option value="Library">Library Media Center</option>
                <option value="IT Support">IT Support & Systems</option>
                <option value="Operations">Operations & Facility</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Qualifications</label>
              <input
                type="text"
                placeholder="Ph.D., M.Ed., CPA, etc."
                value={newStaffForm.qualification}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, qualification: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="j.croft@greenfield.edu"
                value={newStaffForm.email}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 019-8822"
                value={newStaffForm.phone}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddStaffOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Register Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* Staff Dossier Modal */}
      {selectedStaffProfile && (
        <Modal
          isOpen={!!selectedStaffProfile}
          onClose={() => setSelectedStaffProfile(null)}
          title={`Personnel Dossier: ${selectedStaffProfile.name}`}
          subtitle={`${selectedStaffProfile.role} · ${selectedStaffProfile.department}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 block">Employee ID</span>
                <span className="font-mono font-bold text-slate-900">{selectedStaffProfile.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Attendance Score</span>
                <span className="font-mono font-bold text-emerald-600">{selectedStaffProfile.attendanceRate}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <span className="text-slate-800 font-medium">{selectedStaffProfile.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Contact Phone</span>
                <span className="font-mono text-slate-800">{selectedStaffProfile.phone}</span>
              </div>
            </div>

            <div className="p-3.5 border rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900">Institutional Standing</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Employment Type: <strong className="text-slate-900">{selectedStaffProfile.employmentType || 'Full-time'}</strong></div>
                <div>Status: <strong className="text-emerald-700">{selectedStaffProfile.status}</strong></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStaffProfile(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Salary Slip Modal */}
      {activeSalarySlip && (
        <Modal
          isOpen={!!activeSalarySlip}
          onClose={() => setActiveSalarySlip(null)}
          title="Staff Salary Voucher"
          subtitle="Monthly remuneration and statutory deduction statement."
        >
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs font-mono">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <span className="font-bold text-slate-900 uppercase">Greenfield International School</span>
              <p className="text-[11px] text-slate-500 font-sans">Monthly Pay Slip — September 2026</p>
            </div>
            <div className="space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Employee Name:</span>
                <span className="font-bold">{activeSalarySlip.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Department / Designation:</span>
                <span>{activeSalarySlip.department} · {activeSalarySlip.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Basic Remuneration:</span>
                <span className="font-bold text-slate-900">{activeSalarySlip.salary}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Statutory Pension & Benefits:</span>
                <span>-$420.00</span>
              </div>
            </div>
            <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between font-bold text-slate-900 text-sm">
              <span>Net Disbursement:</span>
              <span className="text-emerald-700">${(Number(activeSalarySlip.salary.replace(/[^0-9]/g, '')) - 420).toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              onClick={() => setActiveSalarySlip(null)}
              className="px-4 py-2 text-slate-600 font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                window.print();
                setActiveSalarySlip(null);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Pay Slip
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Staff Modal */}
      {selectedStaffForEdit && (
        <Modal
          isOpen={isEditStaffOpen}
          onClose={() => {
            setIsEditStaffOpen(false);
            setSelectedStaffForEdit(null);
          }}
          title={`Edit Employee Record: ${selectedStaffForEdit.name}`}
          subtitle={`Employee ID: ${selectedStaffForEdit.employeeId}`}
        >
          <form onSubmit={handleEditStaffSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={selectedStaffForEdit.name}
                  onChange={(e) =>
                    setSelectedStaffForEdit({ ...selectedStaffForEdit, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Designation / Role Title</label>
                <input
                  type="text"
                  required
                  value={selectedStaffForEdit.role}
                  onChange={(e) =>
                    setSelectedStaffForEdit({ ...selectedStaffForEdit, role: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Department</label>
                <select
                  value={selectedStaffForEdit.department}
                  onChange={(e) =>
                    setSelectedStaffForEdit({ ...selectedStaffForEdit, department: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Academics">Academics</option>
                  <option value="Administration">Administration</option>
                  <option value="Accounts">Accounts & Finance</option>
                  <option value="Front Office">Front Office & Reception</option>
                  <option value="Library">Library Media Center</option>
                  <option value="IT Support">IT Support & Systems</option>
                  <option value="Operations">Operations & Facility</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={selectedStaffForEdit.email}
                  onChange={(e) =>
                    setSelectedStaffForEdit({ ...selectedStaffForEdit, email: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={selectedStaffForEdit.phone}
                  onChange={(e) =>
                    setSelectedStaffForEdit({ ...selectedStaffForEdit, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Employment Status</label>
                <select
                  value={selectedStaffForEdit.status}
                  onChange={(e) =>
                    setSelectedStaffForEdit({ ...selectedStaffForEdit, status: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Probation">Probation</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditStaffOpen(false);
                  setSelectedStaffForEdit(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Save Employee Updates
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Leave Request Modal */}
      {rejectLeaveTarget && (
        <Modal
          isOpen={!!rejectLeaveTarget}
          onClose={() => setRejectLeaveTarget(null)}
          title={`Decline Leave Request: ${rejectLeaveTarget.employeeName}`}
          subtitle={`${rejectLeaveTarget.leaveType} · ${rejectLeaveTarget.startDate} to ${rejectLeaveTarget.endDate}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Administrative Reason for Decline *</label>
              <textarea
                rows={3}
                required
                placeholder="Specify reason for refusal (e.g. Critical examination duties or insufficient leave balance)..."
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setRejectLeaveTarget(null)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectLeave}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Staff Confirmation Modal */}
      {deleteConfirmStaff && (
        <Modal
          isOpen={!!deleteConfirmStaff}
          onClose={() => setDeleteConfirmStaff(null)}
          title="Confirm Employee Separation"
        >
          <div className="text-xs space-y-3">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to remove <strong>{deleteConfirmStaff.name}</strong> ({deleteConfirmStaff.employeeId} · {deleteConfirmStaff.role}) from the active institutional directory?
            </p>
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmStaff(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStaffConfirm(deleteConfirmStaff)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
              >
                Archive Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Work Assignment Modal */}
      {isAddAssignmentOpen && (
        <Modal
          isOpen={isAddAssignmentOpen}
          onClose={() => setIsAddAssignmentOpen(false)}
          title="Assign Committee or Institutional Duty"
          subtitle="Delegate administrative responsibilities to staff."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newAssignmentForm.staffName || !newAssignmentForm.primaryDuty) {
                addToast('Validation', 'Please provide staff name and duty description.', 'error');
                return;
              }
              const newAsg: WorkAssignmentItem = {
                id: 'asg-' + Date.now(),
                staffName: newAssignmentForm.staffName,
                role: newAssignmentForm.role || 'Faculty Member',
                department: newAssignmentForm.department,
                primaryDuty: newAssignmentForm.primaryDuty,
                committee: newAssignmentForm.committee || 'Campus Committee',
                reportingManager: newAssignmentForm.reportingManager,
                term: 'Session 2026-27',
              };
              setAssignments([...assignments, newAsg]);
              setIsAddAssignmentOpen(false);
              addToast('Duty Assigned', `Assigned responsibility to ${newAsg.staffName}.`, 'success');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Staff Member *</label>
              <select
                value={newAssignmentForm.staffName}
                onChange={(e) => {
                  const emp = combinedStaff.find((s) => s.name === e.target.value);
                  setNewAssignmentForm({
                    ...newAssignmentForm,
                    staffName: e.target.value,
                    role: emp?.role || '',
                    department: emp?.department || 'Academics',
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                <option value="">Select Staff Member...</option>
                {combinedStaff.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role} · {emp.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Primary Duty Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lead Coordinator for Science Olympiad"
                value={newAssignmentForm.primaryDuty}
                onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, primaryDuty: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Institutional Committee</label>
              <input
                type="text"
                placeholder="e.g. Campus Safety & Crisis Council"
                value={newAssignmentForm.committee}
                onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, committee: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddAssignmentOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs"
              >
                Assign Responsibility
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Document Metadata Modal */}
      {isAddDocOpen && (
        <Modal
          isOpen={isAddDocOpen}
          onClose={() => setIsAddDocOpen(false)}
          title="Register Employment Document"
          subtitle="Track verified credentials, contracts, and clearances."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newDocForm.staffName || !newDocForm.title) {
                addToast('Validation', 'Please provide staff name and document title.', 'error');
                return;
              }
              const newDoc: EmploymentDocumentItem = {
                id: 'doc-' + Date.now(),
                staffId: 'stf-' + Date.now().toString().slice(-4),
                staffName: newDocForm.staffName,
                title: newDocForm.title,
                type: newDocForm.type,
                issueDate: newDocForm.issueDate,
                status: 'Verified',
                fileSize: '1.2 MB',
              };
              setDocuments([...documents, newDoc]);
              setIsAddDocOpen(false);
              addToast('Document Registered', `${newDoc.title} recorded for ${newDoc.staffName}.`, 'success');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Staff Member *</label>
              <select
                value={newDocForm.staffName}
                onChange={(e) => setNewDocForm({ ...newDocForm, staffName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                <option value="">Select Staff Member...</option>
                {combinedStaff.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Master of Science Degree Certificate"
                value={newDocForm.title}
                onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Category *</label>
                <select
                  value={newDocForm.type}
                  onChange={(e) => setNewDocForm({ ...newDocForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Contract">Contract</option>
                  <option value="Degree Transcripts">Degree Transcripts</option>
                  <option value="Background Verification">Background Verification</option>
                  <option value="ID Proof">Government ID Proof</option>
                  <option value="Medical Certificate">Medical Certificate</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Verification Date *</label>
                <input
                  type="date"
                  required
                  value={newDocForm.issueDate}
                  onChange={(e) => setNewDocForm({ ...newDocForm, issueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddDocOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs"
              >
                Register Credential
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Recruitment Candidate Modal */}
      {isAddCandidateOpen && (
        <Modal
          isOpen={isAddCandidateOpen}
          onClose={() => setIsAddCandidateOpen(false)}
          title="Add Recruitment Candidate"
          subtitle="Register an applicant for open school vacancies."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCandidateForm.name || !newCandidateForm.email) {
                addToast('Validation', 'Please provide applicant name and email.', 'error');
                return;
              }
              const newCan: JobCandidate = {
                id: 'can-' + Date.now(),
                name: newCandidateForm.name,
                position: newCandidateForm.position,
                department: newCandidateForm.department,
                applicationDate: new Date().toISOString().split('T')[0],
                experienceYears: Number(newCandidateForm.experienceYears),
                education: newCandidateForm.education,
                email: newCandidateForm.email,
                phone: newCandidateForm.phone || '+1 (555) 000-0000',
                stage: 'Applied',
              };
              setCandidates([...candidates, newCan]);
              setIsAddCandidateOpen(false);
              setNewCandidateForm({ name: '', position: 'Secondary Physics Faculty', department: 'Academics', experienceYears: 4, education: 'M.Sc. Physics', email: '', phone: '' });
              addToast('Candidate Registered', `${newCan.name} added to applicant tracking pipeline.`, 'success');
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Julian Sterling"
                  value={newCandidateForm.name}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Position Applied *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Secondary Physics Faculty"
                  value={newCandidateForm.position}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, position: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <select
                  value={newCandidateForm.department}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Academics">Academics</option>
                  <option value="Administration">Administration</option>
                  <option value="Accounts">Accounts & Finance</option>
                  <option value="Front Office">Front Office</option>
                  <option value="IT Support">IT Support</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Education / Degree</label>
                <input
                  type="text"
                  placeholder="e.g. M.Sc., Ph.D."
                  value={newCandidateForm.education}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, education: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="candidate@example.com"
                  value={newCandidateForm.email}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={newCandidateForm.phone}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddCandidateOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs"
              >
                Register Candidate
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
