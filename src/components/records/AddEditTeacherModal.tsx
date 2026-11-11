import React, { useState, useEffect } from 'react';
import { Teacher, ClassRoom } from '../../types';
import { Modal } from '../common/Modal';
import { User, Briefcase, BookOpen, MapPin, Activity } from 'lucide-react';

interface AddEditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  teacherToEdit: Teacher | null;
  existingTeachers: Teacher[];
  onSave: (teacherData: any) => void;
}

export const AddEditTeacherModal: React.FC<AddEditTeacherModalProps> = ({
  isOpen,
  onClose,
  classes,
  teacherToEdit,
  existingTeachers,
  onSave,
}) => {
  const isEdit = !!teacherToEdit;
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'academic' | 'contact'>('personal');

  const departments = [
    'Mathematics',
    'Science',
    'English',
    'STEM & Computer Science',
    'Social Studies',
    'Languages',
    'Physical Education',
    'Fine Arts',
  ];

  const commonSubjects = [
    'Mathematics',
    'Advanced Calculus',
    'Physics',
    'Chemistry',
    'Biology',
    'Science',
    'English',
    'Literature',
    'Computer Science',
    'Robotics',
    'Social Studies',
    'World History',
    'Geography',
    'Spanish',
    'French',
    'Physical Education',
  ];

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    department: 'Mathematics',
    roleTitle: 'Faculty Member',
    qualification: 'M.Sc., B.Ed.',
    institution: 'Boston University School of Education',
    employmentType: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract',
    status: 'Active' as 'Active' | 'On Leave' | 'Probation' | 'Archived',
    joiningDate: '2021-08-15',
    workloadHours: 20,
    subjects: ['Mathematics'],
    classes: ['Grade 10A'],
    address: '124 Academic Way, Greenfield, MA 01301',
    emergencyContactName: 'Sarah Sterling (Spouse)',
    emergencyContactPhone: '+1 (555) 432-9901',
    internalNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (teacherToEdit) {
      setFormData({
        name: teacherToEdit.name,
        employeeId: teacherToEdit.employeeId,
        email: teacherToEdit.email,
        phone: teacherToEdit.phone,
        department: teacherToEdit.department || 'Mathematics',
        roleTitle: teacherToEdit.roleTitle || 'Faculty Member',
        qualification: teacherToEdit.qualification || 'M.Sc., B.Ed.',
        institution: teacherToEdit.institution || 'State University',
        employmentType: teacherToEdit.employmentType || 'Full-time',
        status: teacherToEdit.status as any || 'Active',
        joiningDate: teacherToEdit.joiningDate || '2021-08-15',
        workloadHours: teacherToEdit.workloadHours || 20,
        subjects: teacherToEdit.subjects || ['Mathematics'],
        classes: teacherToEdit.classes || ['Grade 10A'],
        address: teacherToEdit.address || '',
        emergencyContactName: teacherToEdit.emergencyContactName || '',
        emergencyContactPhone: teacherToEdit.emergencyContactPhone || '',
        internalNotes: teacherToEdit.internalNotes || '',
      });
    } else {
      const nextNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        name: '',
        employeeId: `EMP-T-${nextNum}`,
        email: '',
        phone: '+1 (555) 432-',
        department: 'Mathematics',
        roleTitle: 'Subject Teacher',
        qualification: 'B.Sc., B.Ed.',
        institution: 'University of Massachusetts',
        employmentType: 'Full-time',
        status: 'Active',
        joiningDate: new Date().toISOString().split('T')[0],
        workloadHours: 20,
        subjects: ['Mathematics'],
        classes: [classes[0]?.name || 'Grade 10A'],
        address: 'Greenfield, MA 01301',
        emergencyContactName: '',
        emergencyContactPhone: '',
        internalNotes: '',
      });
    }
    setErrors({});
    setActiveTab('personal');
  }, [teacherToEdit, isOpen, classes]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'Full teacher name is required.';
    }
    if (!formData.employeeId.trim()) {
      errs.employeeId = 'Employee ID is required.';
    } else {
      const isDuplicate = existingTeachers.some(
        (t) => t.employeeId.toLowerCase() === formData.employeeId.trim().toLowerCase() && t.id !== teacherToEdit?.id
      );
      if (isDuplicate) {
        errs.employeeId = 'Employee ID is already assigned to another teacher.';
      }
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid institutional email is required.';
    }
    if (!formData.roleTitle.trim()) {
      errs.roleTitle = 'Designation is required.';
    }
    if (formData.subjects.length === 0) {
      errs.subjects = 'Select at least one subject specialization.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleToggleSubject = (sub: string) => {
    if (formData.subjects.includes(sub)) {
      if (formData.subjects.length > 1) {
        setFormData({ ...formData, subjects: formData.subjects.filter((s) => s !== sub) });
      }
    } else {
      setFormData({ ...formData, subjects: [...formData.subjects, sub] });
    }
  };

  const handleToggleClass = (clsName: string) => {
    if (formData.classes.includes(clsName)) {
      if (formData.classes.length > 1) {
        setFormData({ ...formData, classes: formData.classes.filter((c) => c !== clsName) });
      }
    } else {
      setFormData({ ...formData, classes: [...formData.classes, clsName] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (errors.name || errors.employeeId || errors.email) setActiveTab('personal');
      else if (errors.roleTitle || errors.department) setActiveTab('employment');
      else if (errors.subjects) setActiveTab('academic');
      return;
    }

    onSave({
      ...(teacherToEdit || {}),
      name: formData.name.trim(),
      employeeId: formData.employeeId.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department,
      roleTitle: formData.roleTitle.trim(),
      qualification: formData.qualification.trim(),
      institution: formData.institution.trim(),
      employmentType: formData.employmentType,
      status: formData.status,
      joiningDate: formData.joiningDate,
      workloadHours: Number(formData.workloadHours) || 20,
      subjects: formData.subjects,
      classes: formData.classes,
      address: formData.address.trim(),
      emergencyContactName: formData.emergencyContactName.trim() || undefined,
      emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
      internalNotes: formData.internalNotes || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Faculty Record — ${teacherToEdit?.name}` : 'Onboard New Faculty Member'}
      subtitle={`Greenfield International School · Academic Faculty Roster`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs pb-1">
          {[
            { id: 'personal', label: '1. Identity & Contact', icon: User, hasError: !!(errors.name || errors.employeeId || errors.email) },
            { id: 'employment', label: '2. Employment & Role', icon: Briefcase, hasError: !!errors.roleTitle },
            { id: 'academic', label: '3. Subjects & Workload', icon: BookOpen, hasError: !!errors.subjects },
            { id: 'contact', label: '4. Address & Emergency', icon: MapPin, hasError: false },
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

        {/* Tab 1: Identity & Contact */}
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
                  placeholder="e.g., Dr. Marcus Sterling"
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
                  placeholder="EMP-T-101"
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
                  placeholder="m.sterling@greenfield.edu"
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
                  placeholder="+1 (555) 432-1101"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Employment & Role */}
        {activeTab === 'employment' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Academic Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept} Department
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Role Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  placeholder="e.g., Head of Mathematics"
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
                  <option value="Part-time">Part-time Faculty</option>
                  <option value="Contract">Contract / Adjunct</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employment Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active Faculty</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Probation">Probationary Period</option>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Highest Qualifications</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g., M.Sc. Mathematics, B.Ed."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Granting Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="e.g., Boston University"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Academic Assignments & Workload */}
        {activeTab === 'academic' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Instructional Subjects <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                {commonSubjects.map((sub) => {
                  const selected = formData.subjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleToggleSubject(sub)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sub} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
              {errors.subjects && <p className="text-[10px] text-rose-600 mt-1">{errors.subjects}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Assigned Class Cohorts</label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                {classes.map((cls) => {
                  const selected = formData.classes.includes(cls.name);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => handleToggleClass(cls.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cls.name} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Weekly Teaching Workload (Hours/Week)</label>
              <input
                type="number"
                min={1}
                max={40}
                value={formData.workloadHours}
                onChange={(e) => setFormData({ ...formData, workloadHours: Number(e.target.value) })}
                className="w-32 px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 ml-2">Standard full-time cap: 24 hrs/week</span>
            </div>
          </div>
        )}

        {/* Tab 4: Address & Emergency */}
        {activeTab === 'contact' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="124 Academic Way, Greenfield, MA 01301"
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
                  placeholder="Sarah Sterling (Spouse)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="+1 (555) 432-9901"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {isEdit ? 'Updating faculty master registry' : 'All onboarded teachers are assigned institutional credentials'}
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
              {isEdit ? 'Save Faculty Record' : 'Onboard Faculty Member'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
