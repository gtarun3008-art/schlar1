import React, { useState } from 'react';
import { Teacher, RoleType, TimetableSlot, LeaveRequest, TeacherDocument } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import {
  User,
  Briefcase,
  BookOpen,
  Calendar,
  Clock,
  Award,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  MapPin,
  Printer,
  Edit2,
  Plus,
} from 'lucide-react';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  currentRole: RoleType;
  timetable: TimetableSlot[];
  leaveRequests: LeaveRequest[];
  onEditClick?: (teacher: Teacher) => void;
  onAddDocument?: (teacherId: string, doc: Omit<TeacherDocument, 'id' | 'uploadDate'>) => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  teacher,
  currentRole,
  timetable,
  leaveRequests,
  onEditClick,
  onAddDocument,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'assignments' | 'timetable' | 'qualifications' | 'leave' | 'documents'
  >('overview');

  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  // Add Document state
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<TeacherDocument['type']>('Teaching License');

  if (!teacher) return null;

  const canEdit = currentRole === 'principal' || currentRole === 'vice_principal';

  // Filter timetable for this teacher
  const teacherSlots = timetable.filter(
    (s) => s.teacherId === teacher.id || s.teacherName.toLowerCase().includes(teacher.name.toLowerCase().split(' ')[1] || '---')
  );

  const daySlots = teacherSlots
    .filter((s) => s.day === selectedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  // Filter leaves for this teacher
  const teacherLeaves = leaveRequests.filter(
    (l) => l.employeeId === teacher.employeeId || l.employeeName.toLowerCase().includes(teacher.name.toLowerCase())
  );

  const defaultDocs: TeacherDocument[] = teacher.documents && teacher.documents.length > 0
    ? teacher.documents
    : [
        {
          id: 'doc-t1',
          name: 'State Educator Professional License (Class A)',
          type: 'Teaching License',
          uploadDate: teacher.joiningDate || '2021-08-15',
          fileSize: '1.4 MB PDF',
          status: 'Verified',
        },
        {
          id: 'doc-t2',
          name: 'Master of Science Graduate Degree Certificate',
          type: 'Degree Certificate',
          uploadDate: teacher.joiningDate || '2021-08-15',
          fileSize: '2.8 MB PDF',
          status: 'Verified',
        },
        {
          id: 'doc-t3',
          name: 'Comprehensive Criminal Background Check Clearance',
          type: 'Background Verification',
          uploadDate: teacher.joiningDate || '2021-08-15',
          fileSize: '650 KB PDF',
          status: 'Verified',
        },
      ];

  const handlePrint = () => {
    window.print();
  };

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    if (onAddDocument) {
      onAddDocument(teacher.id, {
        name: docName.trim(),
        type: docType,
        fileSize: `${(Math.random() * 2 + 0.8).toFixed(1)} MB PDF`,
        status: 'Verified',
      });
    }

    setIsAddDocOpen(false);
    setDocName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="-mt-3 space-y-4">
        {/* Teacher Master Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 -mx-6 -mt-6 p-6 rounded-t-2xl text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-2xl flex items-center justify-center shadow-inner shrink-0">
                {teacher.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-white">{teacher.name}</h2>
                  <StatusBadge status={teacher.status} />
                  <span className="text-[11px] font-mono bg-white/15 px-2 py-0.5 rounded text-purple-200 border border-white/10">
                    {teacher.employeeId}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                  <span className="font-semibold text-white">{teacher.roleTitle}</span>
                  <span>•</span>
                  <span>{teacher.department || 'Mathematics'} Department</span>
                  <span>•</span>
                  <span>{teacher.employmentType || 'Full-time Regular'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/10"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>

              {canEdit && onEditClick && (
                <button
                  onClick={() => onEditClick(teacher)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Faculty</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs pb-1 -mx-2 px-2">
          {[
            { id: 'overview', label: 'Professional Overview', icon: User },
            { id: 'assignments', label: 'Subjects & Workload', icon: BookOpen },
            { id: 'timetable', label: 'Weekly Schedule', icon: Clock },
            { id: 'qualifications', label: 'Credentials & Degrees', icon: Award },
            { id: 'leave', label: 'Leaves & Attendance', icon: Calendar },
            { id: 'documents', label: 'Faculty Documents', icon: ShieldCheck },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold text-xs transition-colors shrink-0 ${
                activeTab === t.id
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Faculty Attendance
                </span>
                <span className="text-xl font-bold font-mono text-slate-900">{teacher.attendanceRate}%</span>
                <span className="text-[11px] text-emerald-600 font-medium block mt-1">Excellent record</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Weekly Teaching Load
                </span>
                <span className="text-xl font-bold font-mono text-slate-900">{teacher.workloadHours} hrs / wk</span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Across {teacher.classes.length} assigned cohorts
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Institutional Tenure
                </span>
                <span className="text-xl font-bold font-mono text-slate-900">Since {teacher.joiningDate?.slice(0, 4) || '2021'}</span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Joining: {teacher.joiningDate || '2021-08-15'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                Official Contact & Employment Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Official Institutional Email</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${teacher.email}`} className="text-purple-600 hover:underline font-mono">
                      {teacher.email}
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Phone Extension</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-medium text-slate-800">{teacher.phone}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Department & Designation</span>
                  <span className="font-semibold text-slate-800">
                    {teacher.roleTitle} ({teacher.department || 'Academic'})
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-400 block">Residential Campus Address</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teacher.address || 'Faculty Residence Block B, Greenfield Campus, MA 01301'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Emergency Contact</span>
                  <span className="font-mono text-slate-800">
                    {teacher.emergencyContactPhone || '+1 (555) 432-9901'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Subjects & Workload */}
        {activeTab === 'assignments' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                Subject Specialization & Assigned Cohorts
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Authorized Teaching Subjects</span>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.subjects.map((sub) => (
                      <span
                        key={sub}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-xs"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Allocated Class Cohorts</span>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.classes.map((cls) => (
                      <span
                        key={cls}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Weekly Timetable */}
        {activeTab === 'timetable' && (
          <div className="space-y-3 text-xs animate-in fade-in">
            {/* Day Selector */}
            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl">
              {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                    selectedDay === d ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
              {daySlots.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No instructional periods scheduled for {selectedDay}. (Planning period / Office hours)
                </div>
              ) : (
                daySlots.map((slot) => (
                  <div key={slot.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{slot.subject}</span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                          {slot.class}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                        Period {slot.periodNumber} ({slot.time})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono font-semibold text-[11px] border border-slate-200">
                        {slot.room}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Qualifications & Credentials */}
        {activeTab === 'qualifications' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                Academic Degrees & Pedagogical Certifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Primary Academic Degree</span>
                  <span className="font-bold text-slate-900 text-sm">{teacher.qualification}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Alma Mater / Institution</span>
                  <span className="text-slate-800 font-medium">
                    {teacher.institution || 'State University School of Education'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Leaves & Attendance */}
        {activeTab === 'leave' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs">
                Official Leave Applications & Absences
              </div>
              {teacherLeaves.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No active leave requests filed for this academic term. Full attendance on record.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {teacherLeaves.map((l) => (
                    <div key={l.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{l.leaveType}</span>
                          <span className="text-[11px] font-mono text-slate-500">({l.days} days)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{l.reason}</p>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {l.startDate} through {l.endDate}
                        </span>
                      </div>
                      <StatusBadge status={l.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Documents & Credentials */}
        {activeTab === 'documents' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Verified Faculty Credentials</h4>
                <p className="text-[11px] text-slate-500">Accreditation files and statutory compliance verification</p>
              </div>

              {canEdit && (
                <button
                  onClick={() => setIsAddDocOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
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
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{doc.name}</span>
                        <StatusBadge status={doc.status} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Category: {doc.type} · Size: {doc.fileSize} · Recorded: {doc.uploadDate}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-purple-600 font-semibold hover:underline cursor-pointer shrink-0">
                    Verified Digital Copy
                  </span>
                </div>
              ))}
            </div>

            {/* Modal to Register Document */}
            {isAddDocOpen && (
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">Register Faculty Accreditation Record</span>
                <form onSubmit={handleDocSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Document Title</label>
                      <input
                        type="text"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="e.g., National STEM Teacher Accreditation"
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
                        <option value="Teaching License">State Teaching License</option>
                        <option value="Degree Certificate">Degree Certificate</option>
                        <option value="Background Verification">Background Check Verification</option>
                        <option value="Resume">Curriculum Vitae / Resume</option>
                        <option value="Contract">Faculty Contract Agreement</option>
                      </select>
                    </div>
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
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Document
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Faculty Master Record · Greenfield International School</span>
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
