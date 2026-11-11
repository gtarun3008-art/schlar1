import React, { useState } from 'react';
import { StaffMember, RoleType, LeaveRequest, StaffDocument } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import {
  User,
  Briefcase,
  MapPin,
  Calendar,
  Award,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  Printer,
  Edit2,
  Plus,
} from 'lucide-react';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  currentRole: RoleType;
  leaveRequests: LeaveRequest[];
  onEditClick?: (staff: StaffMember) => void;
  onAddDocument?: (staffId: string, doc: Omit<StaffDocument, 'id' | 'uploadDate'>) => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  isOpen,
  onClose,
  staff,
  currentRole,
  leaveRequests,
  onEditClick,
  onAddDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'employment' | 'qualifications' | 'leave' | 'documents'>('overview');

  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<StaffDocument['type']>('ID Proof');

  if (!staff) return null;

  const canEdit = currentRole === 'principal';

  const staffLeaves = leaveRequests.filter(
    (l) => l.employeeId === staff.employeeId || l.employeeName.toLowerCase().includes(staff.name.toLowerCase())
  );

  const defaultDocs: StaffDocument[] = staff.documents && staff.documents.length > 0
    ? staff.documents
    : [
        {
          id: 'doc-s1',
          name: 'Government Issued National Identification / Driver License',
          type: 'ID Proof',
          uploadDate: staff.joiningDate || '2020-08-15',
          fileSize: '1.2 MB PDF',
          status: 'Verified',
        },
        {
          id: 'doc-s2',
          name: 'Institutional Staff Employment Contract & Code of Conduct',
          type: 'Contract',
          uploadDate: staff.joiningDate || '2020-08-15',
          fileSize: '2.1 MB PDF',
          status: 'Verified',
        },
        {
          id: 'doc-s3',
          name: 'Mandatory Background Security Clearance Record',
          type: 'Background Verification',
          uploadDate: staff.joiningDate || '2020-08-15',
          fileSize: '820 KB PDF',
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
      onAddDocument(staff.id, {
        name: docName.trim(),
        type: docType,
        fileSize: `${(Math.random() * 2 + 0.6).toFixed(1)} MB PDF`,
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
        {/* Staff Master Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 -mx-6 -mt-6 p-6 rounded-t-2xl text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-2xl flex items-center justify-center shadow-inner shrink-0">
                {staff.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-white">{staff.name}</h2>
                  <StatusBadge status={staff.status} />
                  <span className="text-[11px] font-mono bg-white/15 px-2 py-0.5 rounded text-teal-200 border border-white/10">
                    {staff.employeeId}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                  <span className="font-semibold text-white">{staff.role}</span>
                  <span>•</span>
                  <span>{staff.department} Department</span>
                  <span>•</span>
                  <span>{staff.employmentType || 'Full-time Regular'}</span>
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
                <span>Print Profile</span>
              </button>

              {canEdit && onEditClick && (
                <button
                  onClick={() => onEditClick(staff)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Staff</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs pb-1 -mx-2 px-2">
          {[
            { id: 'overview', label: 'Overview & Contact', icon: User },
            { id: 'employment', label: 'Employment & Department', icon: Briefcase },
            { id: 'qualifications', label: 'Qualifications', icon: Award },
            { id: 'leave', label: 'Leaves & Attendance', icon: Calendar },
            { id: 'documents', label: 'Staff Documents', icon: ShieldCheck },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold text-xs transition-colors shrink-0 ${
                activeTab === t.id
                  ? 'border-b-2 border-teal-600 text-teal-600 bg-teal-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Overview & Contact */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Staff Attendance
                </span>
                <span className="text-xl font-bold font-mono text-slate-900">{staff.attendanceRate}%</span>
                <span className="text-[11px] text-emerald-600 font-medium block mt-1">Operational presence</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Department
                </span>
                <span className="text-base font-bold text-slate-900">{staff.department}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Operational branch</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Tenure
                </span>
                <span className="text-xl font-bold font-mono text-slate-900">Since {staff.joiningDate?.slice(0, 4) || '2020'}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Joined: {staff.joiningDate}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                Official Contact & Campus Location
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Institutional Email</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${staff.email}`} className="text-teal-600 hover:underline font-mono">
                      {staff.email}
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Direct Extension / Phone</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-medium text-slate-800">{staff.phone}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Designation / Station</span>
                  <span className="font-semibold text-slate-800">{staff.role}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-400 block">Residential Address</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{staff.address || 'Greenfield Campus Administrative Quarters, MA 01301'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Emergency Contact</span>
                  <span className="font-mono text-slate-800">
                    {staff.emergencyContactPhone || '+1 (555) 601-9988'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Employment */}
        {activeTab === 'employment' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                Operational Role & Supervisory Reporting
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Assigned Department</span>
                  <span className="font-bold text-slate-900 text-sm">{staff.department}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Official Designation</span>
                  <span className="font-semibold text-slate-800">{staff.role}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Employment Category</span>
                  <span className="text-slate-800">{staff.employmentType || 'Full-time Regular Staff'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Reporting Supervisor</span>
                  <span className="text-slate-800 font-medium">Head of Institutional Administration</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Operational Shift</span>
                  <span className="text-slate-800 font-mono">08:00 AM – 04:30 PM (Mon–Fri)</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Status</span>
                  <div className="mt-0.5">
                    <StatusBadge status={staff.status} />
                  </div>
                </div>
              </div>

              {staff.internalNotes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Supervisory Notes</span>
                  <p className="text-slate-600 italic">"{staff.internalNotes}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Qualifications */}
        {activeTab === 'qualifications' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                Educational Credentials & Professional Accreditations
              </h4>
              <div>
                <span className="text-[11px] text-slate-400 block">Credentials on File</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {staff.qualifications || 'Associate Degree & Certified School Operations Professional'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Leaves */}
        {activeTab === 'leave' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs">
                Staff Leave Record & Absence History
              </div>
              {staffLeaves.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No active leave records filed for this staff member this academic term. Full attendance on record.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {staffLeaves.map((l) => (
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

        {/* Tab 5: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Verified Staff Documentation</h4>
                <p className="text-[11px] text-slate-500">Identity verification, contracts and background checks</p>
              </div>

              {canEdit && (
                <button
                  onClick={() => setIsAddDocOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
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
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{doc.name}</span>
                        <StatusBadge status={doc.status} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Category: {doc.type} · Size: {doc.fileSize} · Verified: {doc.uploadDate}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-teal-600 font-semibold hover:underline cursor-pointer shrink-0">
                    Verified Digital Copy
                  </span>
                </div>
              ))}
            </div>

            {/* Modal to Register Document */}
            {isAddDocOpen && (
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">Register Staff Personnel Document</span>
                <form onSubmit={handleDocSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Document Title</label>
                      <input
                        type="text"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="e.g., Annual First Aid & CPR Re-certification"
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
                        <option value="ID Proof">Government ID / Passport</option>
                        <option value="Contract">Employment Contract</option>
                        <option value="Background Verification">Background Check</option>
                        <option value="Qualification">Vocational / Academic Certificate</option>
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
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
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
          <span>General Staff Master File · Greenfield International School</span>
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
