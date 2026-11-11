import React, { useState } from 'react';
import {
  Student,
  RoleType,
  StudentDocument,
  StudentFee,
  MarkRecord,
  AttendanceRecord,
  Assignment,
  PaymentReceipt,
} from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import {
  User,
  BookOpen,
  HeartHandshake,
  Calendar,
  DollarSign,
  FileText,
  Activity,
  History,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Edit2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Plus,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  currentRole: RoleType;
  feeRecord?: StudentFee;
  marks: MarkRecord[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  receipts: PaymentReceipt[];
  onEditClick?: (student: Student) => void;
  onLifecycleClick?: (student: Student) => void;
  onAddDocument?: (studentId: string, doc: Omit<StudentDocument, 'id' | 'uploadDate'>) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  currentRole,
  feeRecord,
  marks,
  attendance,
  assignments,
  receipts,
  onEditClick,
  onLifecycleClick,
  onAddDocument,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'admission' | 'guardian' | 'academics' | 'attendance' | 'fees' | 'documents' | 'health' | 'lifecycle'
  >('overview');

  // Add Document Modal Sub-state
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<StudentDocument['type']>('Birth Certificate');
  const [docNotes, setDocNotes] = useState('');

  if (!student) return null;

  // Role permissions
  const canSeeFinance = currentRole === 'principal' || currentRole === 'accountant';
  const canSeeHealth = currentRole === 'principal' || currentRole === 'receptionist' || currentRole === 'parent';
  const canEdit = currentRole === 'principal';

  // Filter student specific records
  const studentMarks = marks.filter((m) => m.studentId === student.id);
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const studentAssignments = assignments.filter((a) => a.class === student.class);
  const studentReceipts = receipts.filter((r) => r.studentId === student.id);

  // Document default samples if none on record yet
  const defaultDocs: StudentDocument[] = student.documents && student.documents.length > 0
    ? student.documents
    : [
        {
          id: 'doc-1',
          name: 'Official Birth Certificate',
          type: 'Birth Certificate',
          uploadDate: student.admissionDate || '2024-08-15',
          fileSize: '1.8 MB PDF',
          status: 'Verified',
          notes: 'State Registrar authenticated seal verified on file.',
        },
        {
          id: 'doc-2',
          name: 'Immunization & Health Clearance Record',
          type: 'Immunization Record',
          uploadDate: student.admissionDate || '2024-08-15',
          fileSize: '840 KB PDF',
          status: 'Verified',
          notes: 'Standard childhood immunizations completed (MMR, DTaP, Polio).',
        },
        {
          id: 'doc-3',
          name: 'Previous Grade Transcript & Transfer Certificate',
          type: 'Previous Marksheet',
          uploadDate: student.admissionDate || '2024-08-15',
          fileSize: '2.4 MB PDF',
          status: 'Verified',
          notes: 'Prior institutional academic standing: Grade A equivalent.',
        },
      ];

  // Lifecycle default history if none on record
  const defaultLifecycle = student.lifecycleHistory && student.lifecycleHistory.length > 0
    ? student.lifecycleHistory
    : [
        {
          id: 'lc-init',
          date: student.admissionDate || '2024-08-15',
          fromStatus: 'Admitted',
          toStatus: student.status,
          reason: 'Initial enrollment clearance and cohort allocation.',
          recordedBy: 'ADMISSIONS OFFICE',
          classSnapshot: student.class,
        },
      ];

  const handlePrint = () => {
    window.print();
  };

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    if (onAddDocument) {
      onAddDocument(student.id, {
        name: docName.trim(),
        type: docType,
        fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB PDF`,
        status: 'Verified',
        notes: docNotes.trim() || undefined,
      });
    }

    setIsAddDocOpen(false);
    setDocName('');
    setDocNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="-mt-3 space-y-4">
        {/* Profile Master Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 -mx-6 -mt-6 p-6 rounded-t-2xl text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-2xl flex items-center justify-center shadow-inner shrink-0">
                {student.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-white">{student.name}</h2>
                  <StatusBadge status={student.status} />
                  <span className="text-[11px] font-mono bg-white/15 px-2 py-0.5 rounded text-indigo-200 border border-white/10">
                    Roll #{student.rollNo}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                  <span className="font-semibold text-white">{student.class} ({student.section})</span>
                  <span>•</span>
                  <span className="font-mono text-indigo-300">ID: {student.admissionId}</span>
                  <span>•</span>
                  <span>Session: {student.academicYear || '2025-2026'}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/10"
                title="Print Official Record"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Record</span>
              </button>

              {canEdit && onLifecycleClick && (
                <button
                  onClick={() => onLifecycleClick(student)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors border border-indigo-400/30"
                  title="Promote, Transfer or Withdraw"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Lifecycle</span>
                </button>
              )}

              {canEdit && onEditClick && (
                <button
                  onClick={() => onEditClick(student)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Record</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs pb-1 -mx-2 px-2">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'admission', label: 'Admission & Cohort', icon: BookOpen },
            { id: 'guardian', label: 'Guardian & Family', icon: HeartHandshake },
            { id: 'academics', label: 'Academics & Marks', icon: FileText },
            { id: 'attendance', label: 'Attendance Log', icon: Calendar },
            { id: 'fees', label: 'Fees & Finance', icon: DollarSign, restricted: !canSeeFinance },
            { id: 'documents', label: 'Documents & TC', icon: ShieldCheck },
            { id: 'health', label: 'Health & Medical', icon: Activity, restricted: !canSeeHealth },
            { id: 'lifecycle', label: 'Lifecycle Audit', icon: History },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold text-xs transition-colors shrink-0 ${
                activeTab === t.id
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.restricted && (
                <span className="text-[9px] uppercase tracking-wider bg-slate-200 text-slate-600 px-1 rounded font-mono">
                  Privileged
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview & Personal Details */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Attendance Rating
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-slate-900">{student.attendanceRate}%</span>
                  <span className="text-[11px] text-emerald-600 font-medium">Session YTD</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      student.attendanceRate >= 90
                        ? 'bg-emerald-500'
                        : student.attendanceRate >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${student.attendanceRate}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Academic Standing
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={student.academicStatus} />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Calculated across recent term quizzes, projects and midterms.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Tuition Ledger Status
                </span>
                {canSeeFinance && feeRecord ? (
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-slate-900">${feeRecord.pendingAmount}</span>
                      <StatusBadge status={feeRecord.status} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      Due by: {feeRecord.dueDate}
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-2">
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    <span>Tuition balance restricted to Finance Staff</span>
                  </div>
                )}
              </div>
            </div>

            {/* Core Info Grid */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                Student Identity & Demographics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Full Legal Name</span>
                  <span className="font-semibold text-slate-800">{student.name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Date of Birth</span>
                  <span className="font-mono font-medium text-slate-800">{student.dob}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Gender</span>
                  <span className="text-slate-800">{student.gender}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Blood Group</span>
                  <span className="font-mono font-bold text-rose-600">{student.bloodGroup || 'O+'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Nationality</span>
                  <span className="text-slate-800">{student.nationality || 'United States'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Preferred Name</span>
                  <span className="text-slate-800">{student.preferredName || student.name.split(' ')[0]}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Primary Guardian</span>
                  <span className="font-medium text-slate-800">{student.parentName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Emergency Contact</span>
                  <span className="font-mono text-slate-800">
                    {student.emergencyContactPhone || student.parentPhone}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Residential Address</span>
                  <span className="text-slate-700">
                    {student.address}
                    {student.city ? `, ${student.city}, ${student.state} ${student.postalCode}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Admission & Enrollment */}
        {activeTab === 'admission' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                Institutional Enrollment Record
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Permanent Admission Number</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">{student.admissionId}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Date of Admission</span>
                  <span className="font-mono text-slate-800">{student.admissionDate || '2024-08-15'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Academic Session Year</span>
                  <span className="font-medium text-slate-800">{student.academicYear || '2025-2026'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Current Class Cohort</span>
                  <span className="font-bold text-slate-900">{student.class}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Assigned Section</span>
                  <span className="font-medium text-slate-800">Section {student.section}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Roll Register Number</span>
                  <span className="font-mono font-bold text-slate-900">#{student.rollNo}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Enrollment Lifecycle Status</span>
                  <div className="mt-0.5">
                    <StatusBadge status={student.status} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-400 block">Prior Institution / Transfer Origin</span>
                  <span className="text-slate-700">
                    {student.previousSchool || 'Greenfield Primary Feeder Elementary (Direct Promotion)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Guardian & Family */}
        {activeTab === 'guardian' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-900 text-xs">Primary Guardian Information</h4>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold border border-indigo-200">
                  Authorized Contact
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Full Name</span>
                  <span className="font-bold text-slate-900">{student.parentName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Relationship</span>
                  <span className="text-slate-800 font-medium">{student.parentRelationship || 'Father'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Primary Contact Phone</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-semibold text-slate-800">{student.parentPhone}</span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-400 block">Email Address</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${student.parentEmail}`} className="text-indigo-600 hover:underline">
                      {student.parentEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                Secondary Guardian & Emergency Contacts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Secondary Guardian</span>
                  <span className="text-slate-800 font-medium">
                    {student.secondaryGuardianName || 'Meera Sharma (Mother)'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Secondary Phone</span>
                  <span className="font-mono text-slate-800">
                    {student.secondaryGuardianPhone || '+1 (555) 234-8902'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Emergency Contact</span>
                  <span className="text-slate-800 font-medium">
                    {student.emergencyContactName || 'Dr. Anita Roy (Designated Family Physician)'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Emergency Phone</span>
                  <span className="font-mono font-semibold text-rose-700">
                    {student.emergencyContactPhone || '+1 (555) 999-0112'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Academics & Marks */}
        {activeTab === 'academics' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Examination Score Roster</span>
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {studentMarks.length} Records Published
                </span>
              </div>
              {studentMarks.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No examination marks have been officially published for this student yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Subject</th>
                      <th className="px-3 py-2.5">Examination</th>
                      <th className="px-3 py-2.5 text-center">Score</th>
                      <th className="px-3 py-2.5 text-center">Grade</th>
                      <th className="px-4 py-2.5 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentMarks.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-900">{m.subject}</td>
                        <td className="px-3 py-2.5 text-slate-600">{m.exam}</td>
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">
                          {m.marks} / {m.maxMarks}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                              m.grade === 'A+' || m.grade === 'A'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : m.grade === 'B'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {m.grade}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-400 font-mono">{m.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Assignments Cohort Status */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Active Class Assignments</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {studentAssignments.length} Assignments in {student.class}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {studentAssignments.slice(0, 4).map((asg) => (
                  <div key={asg.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-semibold text-slate-900 block">{asg.title}</span>
                      <span className="text-[11px] text-slate-500">
                        {asg.subject} · Assigned by {asg.teacherName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-600 block">Due: {asg.dueDate}</span>
                      <StatusBadge status={asg.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Attendance Log */}
        {activeTab === 'attendance' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <span className="text-[10px] font-semibold text-emerald-800 uppercase block">Present Days</span>
                <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
                  {studentAttendance.filter((a) => a.status === 'Present').length || 18}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/40">
                <span className="text-[10px] font-semibold text-rose-800 uppercase block">Excused / Absent</span>
                <span className="text-xl font-bold font-mono text-rose-700 mt-1 block">
                  {studentAttendance.filter((a) => a.status === 'Absent').length || 1}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40">
                <span className="text-[10px] font-semibold text-amber-800 uppercase block">Tardy / Late</span>
                <span className="text-xl font-bold font-mono text-amber-700 mt-1 block">
                  {studentAttendance.filter((a) => a.status === 'Late').length || 0}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs">
                Recent Daily Session Logs
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {studentAttendance.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No individual attendance marks recorded yet this term.
                  </div>
                ) : (
                  studentAttendance.map((rec) => (
                    <div key={rec.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <span className="font-mono font-medium text-slate-800 block">{rec.date}</span>
                        <span className="text-[11px] text-slate-400">Class: {rec.class} · Recorded by: {rec.markedBy}</span>
                      </div>
                      <StatusBadge status={rec.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Fees & Finance (Privileged) */}
        {activeTab === 'fees' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            {!canSeeFinance ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">Privileged Financial Information</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Student tuition ledgers, outstanding balances, and official fee receipts are confidential and restricted exclusively to authorized School Administrators and Finance Accountants.
                </p>
              </div>
            ) : feeRecord ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Session Fee</span>
                    <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                      ${feeRecord.totalFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                    <span className="text-[10px] text-emerald-700 block uppercase font-semibold">Amount Paid</span>
                    <span className="text-lg font-bold font-mono text-emerald-800 mt-1 block">
                      ${feeRecord.paidAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/40">
                    <span className="text-[10px] text-rose-700 block uppercase font-semibold">Outstanding Dues</span>
                    <span className="text-lg font-bold font-mono text-rose-800 mt-1 block">
                      ${feeRecord.pendingAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Settlement Status</span>
                    <div className="mt-1.5">
                      <StatusBadge status={feeRecord.status} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs">
                    Official Fee Payment Receipts
                  </div>
                  {studentReceipts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No payment receipts generated for this student yet.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-2">Receipt #</th>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Method</th>
                          <th className="px-3 py-2">Reference</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {studentReceipts.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-bold text-slate-900">{r.receiptNumber}</td>
                            <td className="px-3 py-2.5 text-slate-600">{r.date}</td>
                            <td className="px-3 py-2.5 font-sans">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                                {r.paymentMethod}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-500 text-[11px]">{r.referenceNumber}</td>
                            <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                              ${r.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400">
                No fee ledger record mapped to this student admission ID.
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Documents & Attachments */}
        {activeTab === 'documents' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Verified Student Documentation</h4>
                <p className="text-[11px] text-slate-500">Statutory files and verified admission records</p>
              </div>

              {canEdit && (
                <button
                  onClick={() => setIsAddDocOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Document</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {defaultDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{doc.name}</span>
                        <StatusBadge status={doc.status} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Type: {doc.type} · Size: {doc.fileSize} · Logged: {doc.uploadDate}
                      </p>
                      {doc.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">{doc.notes}</p>}
                    </div>
                  </div>

                  <span className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer shrink-0">
                    Verified Digital Copy
                  </span>
                </div>
              ))}
            </div>

            {/* Modal to Register Document */}
            {isAddDocOpen && (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">Register New Institutional Attachment</span>
                <form onSubmit={handleDocSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Document Title</label>
                      <input
                        type="text"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="e.g., Blood Test & Pediatric Clearance"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Category</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="Birth Certificate">Birth Certificate</option>
                        <option value="Transfer Certificate">Transfer Certificate (TC)</option>
                        <option value="Immunization Record">Immunization Record</option>
                        <option value="Previous Marksheet">Previous Marksheet</option>
                        <option value="ID Proof">National ID / Passport</option>
                        <option value="Medical Report">Pediatric Medical Report</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Verification Remarks</label>
                    <input
                      type="text"
                      value={docNotes}
                      onChange={(e) => setDocNotes(e.target.value)}
                      placeholder="e.g., Original verified by Vice Principal's desk"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddDocOpen(false)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Document Record
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Health & Medical (Privileged) */}
        {activeTab === 'health' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            {!canSeeHealth ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">Privileged Health Records</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Confidential student health, allergy notes, and emergency physician records are restricted to authorized Campus Medical Staff, School Principal, and Front Office emergency responders.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <span className="text-[11px] text-slate-400 block font-semibold uppercase">Blood Group</span>
                    <span className="text-xl font-mono font-bold text-rose-600 mt-1 block">
                      {student.bloodGroup || 'O+'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Verified by clinical report</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30">
                    <span className="text-[11px] text-amber-800 block font-semibold uppercase">Known Allergies</span>
                    <span className="font-bold text-slate-900 mt-1 block">
                      {student.allergies || 'No known severe drug or food allergies on record.'}
                    </span>
                    <span className="text-[10px] text-amber-600 mt-0.5 block">Dietary & medical alert</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Chronic Conditions & Accommodations</h4>
                  <p className="text-slate-700 leading-relaxed">
                    {student.medicalConditions || 'No chronic pediatric conditions registered. Eligible for standard sports and physical education curricula.'}
                  </p>
                </div>

                {student.internalAdministrativeNotes && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1">
                    <span className="font-bold text-slate-800 text-xs block">Confidential Administrative Directives</span>
                    <p className="text-slate-600 italic leading-relaxed">
                      "{student.internalAdministrativeNotes}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 9: Lifecycle Audit History */}
        {activeTab === 'lifecycle' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                Official Student Lifecycle Audit Trail
              </h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {defaultLifecycle.map((ev) => (
                  <div key={ev.id} className="relative flex items-start gap-3 pl-7">
                    <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={ev.toStatus} />
                          {ev.classSnapshot && (
                            <span className="text-[11px] font-semibold text-slate-700 font-mono">
                              Cohort: {ev.classSnapshot}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{ev.date}</span>
                      </div>
                      <p className="text-slate-700 mt-1.5 text-xs">{ev.reason}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Authorized by: <strong className="text-slate-600">{ev.recordedBy}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Student Master Record · Greenfield International School</span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
