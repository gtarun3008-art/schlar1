import React, { useState, useEffect } from 'react';
import { StaffMember } from '../../types';
import { Modal } from '../common/Modal';
import { User, Briefcase, MapPin, Award } from 'lucide-react';

interface AddEditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit: StaffMember | null;
  existingStaff: StaffMember[];
  onSave: (staffData: any) => void;
}

export const AddEditStaffModal: React.FC<AddEditStaffModalProps> = ({
  isOpen,
  onClose,
  staffToEdit,
  existingStaff,
  onSave,
}) => {
  const isEdit = !!staffToEdit;
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'contact' | 'qualifications'>('personal');

  const departments: StaffMember['department'][] = [
    'Administration',
    'Accounts',
    'Front Office',
    'Library',
    'IT Support',
    'Operations',
    'Facilities',
  ];

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    role: 'Administrative Executive',
    department: 'Administration' as StaffMember['department'],
    email: '',
    phone: '',
    joiningDate: '2022-01-15',
    employmentType: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract',
    status: 'Active' as 'Active' | 'On Leave' | 'Probation' | 'Archived',
    qualifications: 'B.A. Business Administration',
    address: '42 Academic Drive, Greenfield, MA 01301',
    emergencyContactName: '',
    emergencyContactPhone: '',
    internalNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (staffToEdit) {
      setFormData({
        name: staffToEdit.name,
        employeeId: staffToEdit.employeeId,
        role: staffToEdit.role,
        department: staffToEdit.department,
        email: staffToEdit.email,
        phone: staffToEdit.phone,
        joiningDate: staffToEdit.joiningDate,
        employmentType: staffToEdit.employmentType || 'Full-time',
        status: staffToEdit.status as any || 'Active',
        qualifications: staffToEdit.qualifications || 'Professional Certification',
        address: staffToEdit.address || '',
        emergencyContactName: staffToEdit.emergencyContactName || '',
        emergencyContactPhone: staffToEdit.emergencyContactPhone || '',
        internalNotes: staffToEdit.internalNotes || '',
      });
    } else {
      const nextNum = Math.floor(200 + Math.random() * 800);
      setFormData({
        name: '',
        employeeId: `EMP-S-${nextNum}`,
        role: 'Operations Specialist',
        department: 'Operations',
        email: '',
        phone: '+1 (555) 601-',
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: 'Full-time',
        status: 'Active',
        qualifications: 'Associate Degree / Professional Diploma',
        address: 'Greenfield, MA 01301',
        emergencyContactName: '',
        emergencyContactPhone: '',
        internalNotes: '',
      });
    }
    setErrors({});
    setActiveTab('personal');
  }, [staffToEdit, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) errs.name = 'Staff member name is required.';
    if (!formData.employeeId.trim()) {
      errs.employeeId = 'Employee ID is required.';
    } else {
      const isDuplicate = existingStaff.some(
        (s) => s.employeeId.toLowerCase() === formData.employeeId.trim().toLowerCase() && s.id !== staffToEdit?.id
      );
      if (isDuplicate) errs.employeeId = 'Employee ID is already registered.';
    }

    if (!formData.role.trim()) errs.role = 'Role / Job title is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid email address is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (errors.name || errors.employeeId || errors.email) setActiveTab('personal');
      else if (errors.role) setActiveTab('employment');
      return;
    }

    onSave({
      ...(staffToEdit || {}),
      name: formData.name.trim(),
      employeeId: formData.employeeId.trim(),
      role: formData.role.trim(),
      department: formData.department,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      joiningDate: formData.joiningDate,
      employmentType: formData.employmentType,
      status: formData.status,
      qualifications: formData.qualifications.trim(),
      address: formData.address.trim(),
      emergencyContactName: formData.emergencyContactName.trim() || undefined,
      emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
      internalNotes: formData.internalNotes.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Staff Member — ${staffToEdit?.name}` : 'Register School Staff Member'}
      subtitle="Institutional Administrative, Operational & Support Personnel"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs pb-1">
          {[
            { id: 'personal', label: '1. Identity & Contact', icon: User, hasError: !!(errors.name || errors.employeeId || errors.email) },
            { id: 'employment', label: '2. Role & Department', icon: Briefcase, hasError: !!errors.role },
            { id: 'contact', label: '3. Address & Emergency', icon: MapPin, hasError: false },
            { id: 'qualifications', label: '4. Credentials', icon: Award, hasError: false },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold text-xs transition-colors shrink-0 ${
                activeTab === t.id
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${t.hasError ? 'text-rose-600' : ''}`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.hasError && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
            </button>
          ))}
        </div>

        {/* Tab 1: Personal */}
        {activeTab === 'personal' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Clara Oswald"
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    errors.name ? 'border-rose-300 ring-1 ring-rose-400' : 'border-slate-200'
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                  required
                />
                {errors.name && <p className="text-[10px] text-rose-600 mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  disabled={isEdit}
                  placeholder="EMP-S-201"
                  className={`w-full px-3 py-2 rounded-lg border font-mono text-xs ${
                    isEdit ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                  } ${errors.employeeId ? 'border-rose-300 ring-1 ring-rose-400' : 'border-slate-200'} focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                  required
                />
                {errors.employeeId && <p className="text-[10px] text-rose-600 mt-0.5">{errors.employeeId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="c.oswald@greenfield.edu"
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    errors.email ? 'border-rose-300 ring-1 ring-rose-400' : 'border-slate-200'
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                  required
                />
                {errors.email && <p className="text-[10px] text-rose-600 mt-0.5">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 601-1001"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Employment */}
        {activeTab === 'employment' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Designation / Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Head Receptionist"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Full-time">Full-time Regular</option>
                  <option value="Part-time">Part-time Staff</option>
                  <option value="Contract">Contractual</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Probation">Probation</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Contact */}
        {activeTab === 'contact' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="42 Academic Drive, Greenfield, MA 01301"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="e.g., Samuel Oswald (Brother)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="+1 (555) 601-9988"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Credentials */}
        {activeTab === 'qualifications' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Qualifications & Certifications</label>
              <input
                type="text"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                placeholder="e.g., Certified Front Desk Executive, B.Com Accounting"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Internal Supervisory Notes</label>
              <textarea
                rows={3}
                value={formData.internalNotes}
                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                placeholder="Operational responsibilities, key holder privileges, or departmental oversight directives."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {isEdit ? 'Updating staff registry file' : 'General personnel record entry'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-2xs transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Register Staff Member'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
