import React, { useState, useEffect } from 'react';
import { Student, ClassRoom, StudentLifecycleStatus } from '../../types';
import { Modal } from '../common/Modal';
import { AlertCircle, CheckCircle2, User, BookOpen, HeartHandshake, MapPin, Activity } from 'lucide-react';

interface AddEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  studentToEdit: Student | null; // null = Add, non-null = Edit
  existingStudents: Student[];
  onSave: (studentData: any) => void;
}

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  isOpen,
  onClose,
  classes,
  studentToEdit,
  existingStudents,
  onSave,
}) => {
  const isEdit = !!studentToEdit;
  const [activeTab, setActiveTab] = useState<'basic' | 'admission' | 'guardian' | 'address' | 'medical'>('basic');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    dob: '2012-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    nationality: 'United States',
    admissionId: '',
    admissionDate: '2025-08-20',
    academicYear: '2025-2026',
    class: 'Grade 10A',
    section: 'A',
    rollNo: '25',
    previousSchool: '',
    status: 'Active' as StudentLifecycleStatus,
    parentName: '',
    parentRelationship: 'Father' as 'Father' | 'Mother' | 'Guardian',
    parentPhone: '',
    parentEmail: '',
    secondaryGuardianName: '',
    secondaryGuardianPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    city: 'Greenfield',
    state: 'MA',
    postalCode: '01301',
    country: 'United States',
    bloodGroup: 'O+',
    allergies: '',
    medicalConditions: '',
    internalAdministrativeNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (studentToEdit) {
      // Split name if first/last not explicitly set
      const parts = studentToEdit.name.split(' ');
      const fName = studentToEdit.firstName || parts[0] || '';
      const lName = studentToEdit.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : '');

      setFormData({
        firstName: fName,
        middleName: studentToEdit.middleName || '',
        lastName: lName,
        preferredName: studentToEdit.preferredName || '',
        dob: studentToEdit.dob || '2012-05-15',
        gender: studentToEdit.gender || 'Male',
        nationality: studentToEdit.nationality || 'United States',
        admissionId: studentToEdit.admissionId,
        admissionDate: studentToEdit.admissionDate || '2024-08-15',
        academicYear: studentToEdit.academicYear || '2025-2026',
        class: studentToEdit.class,
        section: studentToEdit.section || 'A',
        rollNo: studentToEdit.rollNo || '01',
        previousSchool: studentToEdit.previousSchool || '',
        status: studentToEdit.status || 'Active',
        parentName: studentToEdit.parentName || '',
        parentRelationship: studentToEdit.parentRelationship || 'Father',
        parentPhone: studentToEdit.parentPhone || '',
        parentEmail: studentToEdit.parentEmail || '',
        secondaryGuardianName: studentToEdit.secondaryGuardianName || '',
        secondaryGuardianPhone: studentToEdit.secondaryGuardianPhone || '',
        emergencyContactName: studentToEdit.emergencyContactName || '',
        emergencyContactPhone: studentToEdit.emergencyContactPhone || '',
        address: studentToEdit.address || '',
        city: studentToEdit.city || 'Greenfield',
        state: studentToEdit.state || 'MA',
        postalCode: studentToEdit.postalCode || '01301',
        country: studentToEdit.country || 'United States',
        bloodGroup: studentToEdit.bloodGroup || 'O+',
        allergies: studentToEdit.allergies || '',
        medicalConditions: studentToEdit.medicalConditions || '',
        internalAdministrativeNotes: studentToEdit.internalAdministrativeNotes || '',
      });
    } else {
      // Generate unique provisional admission number
      const nextNum = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        preferredName: '',
        dob: '2012-05-15',
        gender: 'Male',
        nationality: 'United States',
        admissionId: `GIS-2026-${nextNum}`,
        admissionDate: new Date().toISOString().split('T')[0],
        academicYear: '2025-2026',
        class: classes[0]?.name || 'Grade 10A',
        section: 'A',
        rollNo: String(Math.floor(20 + Math.random() * 20)),
        previousSchool: '',
        status: 'Active',
        parentName: '',
        parentRelationship: 'Father',
        parentPhone: '+1 (555) ',
        parentEmail: '',
        secondaryGuardianName: '',
        secondaryGuardianPhone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        address: '',
        city: 'Greenfield',
        state: 'MA',
        postalCode: '01301',
        country: 'United States',
        bloodGroup: 'O+',
        allergies: '',
        medicalConditions: '',
        internalAdministrativeNotes: '',
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [studentToEdit, isOpen, classes]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errs.firstName = 'First name is required.';
    }
    if (!formData.lastName.trim()) {
      errs.lastName = 'Last name is required.';
    }
    if (!formData.admissionId.trim()) {
      errs.admissionId = 'Admission number is required.';
    } else {
      // Check duplicate admissionId
      const isDuplicate = existingStudents.some(
        (s) => s.admissionId.toLowerCase() === formData.admissionId.trim().toLowerCase() && s.id !== studentToEdit?.id
      );
      if (isDuplicate) {
        errs.admissionId = 'Admission number is already allocated to another student.';
      }
    }

    if (!formData.parentName.trim()) {
      errs.parentName = 'Primary guardian name is required.';
    }
    if (!formData.parentPhone.trim() || formData.parentPhone.trim().length < 7) {
      errs.parentPhone = 'Valid primary contact phone is required.';
    }
    if (formData.parentEmail && !formData.parentEmail.includes('@')) {
      errs.parentEmail = 'Please enter a valid guardian email address.';
    }
    if (!formData.address.trim()) {
      errs.address = 'Residential street address is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Switch tab to first field with error
      if (errors.firstName || errors.lastName) setActiveTab('basic');
      else if (errors.admissionId) setActiveTab('admission');
      else if (errors.parentName || errors.parentPhone || errors.parentEmail) setActiveTab('guardian');
      else if (errors.address) setActiveTab('address');
      return;
    }

    const fullName = `${formData.firstName.trim()} ${formData.middleName ? formData.middleName.trim() + ' ' : ''}${formData.lastName.trim()}`;

    const studentPayload = {
      ...(studentToEdit || {}),
      name: fullName,
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim() || undefined,
      lastName: formData.lastName.trim(),
      preferredName: formData.preferredName.trim() || undefined,
      dob: formData.dob,
      gender: formData.gender,
      nationality: formData.nationality,
      admissionId: formData.admissionId.trim(),
      admissionDate: formData.admissionDate,
      academicYear: formData.academicYear,
      class: formData.class,
      section: formData.section,
      rollNo: formData.rollNo,
      previousSchool: formData.previousSchool.trim() || undefined,
      status: formData.status,
      parentName: formData.parentName.trim(),
      parentRelationship: formData.parentRelationship,
      parentPhone: formData.parentPhone.trim(),
      parentEmail: formData.parentEmail.trim(),
      secondaryGuardianName: formData.secondaryGuardianName.trim() || undefined,
      secondaryGuardianPhone: formData.secondaryGuardianPhone.trim() || undefined,
      emergencyContactName: formData.emergencyContactName.trim() || undefined,
      emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      postalCode: formData.postalCode.trim(),
      country: formData.country.trim(),
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies.trim() || undefined,
      medicalConditions: formData.medicalConditions.trim() || undefined,
      internalAdministrativeNotes: formData.internalAdministrativeNotes.trim() || undefined,
    };

    onSave(studentPayload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Student Record — ${studentToEdit?.name}` : 'Enroll New Student'}
      subtitle={
        isEdit
          ? `Admission ID: ${studentToEdit?.admissionId} · Cohort: ${studentToEdit?.class}`
          : 'Greenfield International School · Student Master Registry'
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs pb-1">
          {[
            { id: 'basic', label: '1. Basic Identity', icon: User, hasError: !!(errors.firstName || errors.lastName) },
            { id: 'admission', label: '2. Admission & Cohort', icon: BookOpen, hasError: !!errors.admissionId },
            { id: 'guardian', label: '3. Guardian & Family', icon: HeartHandshake, hasError: !!(errors.parentName || errors.parentPhone || errors.parentEmail) },
            { id: 'address', label: '4. Residential Address', icon: MapPin, hasError: !!errors.address },
            { id: 'medical', label: '5. Medical & Notes', icon: Activity, hasError: false },
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

        {/* Tab 1: Basic Information */}
        {activeTab === 'basic' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g., Liam"
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    errors.firstName ? 'border-rose-300 ring-1 ring-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                  required
                />
                {errors.firstName && <p className="text-[10px] text-rose-600 mt-0.5">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Middle Name (Optional)</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  placeholder="e.g., Alexander"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g., Campbell"
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    errors.lastName ? 'border-rose-300 ring-1 ring-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                  required
                />
                {errors.lastName && <p className="text-[10px] text-rose-600 mt-0.5">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Name / Alias</label>
                <input
                  type="text"
                  value={formData.preferredName}
                  onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                  placeholder="e.g., Leo"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-binary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="e.g., United States"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Admission & Cohort */}
        {activeTab === 'admission' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Admission ID / Roll Register <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.admissionId}
                  onChange={(e) => setFormData({ ...formData, admissionId: e.target.value })}
                  disabled={isEdit}
                  placeholder="GIS-2026-0000"
                  className={`w-full px-3 py-2 rounded-lg border font-mono text-xs ${
                    isEdit ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                  } ${
                    errors.admissionId ? 'border-rose-300 ring-1 ring-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                  required
                />
                {errors.admissionId && <p className="text-[10px] text-rose-600 mt-0.5">{errors.admissionId}</p>}
                {isEdit && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Admission number is an immutable institution identifier.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Date</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Session Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="2025-2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Enrolled Class Cohort <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.class}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const matched = classes.find((c) => c.name === selectedName);
                    setFormData({
                      ...formData,
                      class: selectedName,
                      section: matched?.section || 'A',
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Room {c.roomNumber} · {c.classTeacherName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {['A', 'B', 'C', 'D'].map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="e.g., 18"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Previous School / Transfer Board</label>
                <input
                  type="text"
                  value={formData.previousSchool}
                  onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                  placeholder="e.g., St. Jude Academy, Boston"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lifecycle Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active (Attending)</option>
                  <option value="Admitted">Admitted (Pending Onboarding)</option>
                  <option value="Enquiry">Enquiry / Applicant</option>
                  <option value="Promoted">Promoted</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Guardian Information */}
        {activeTab === 'guardian' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Guardian Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="e.g., Vikram Sharma"
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    errors.parentName ? 'border-rose-300 ring-1 ring-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                  required
                />
                {errors.parentName && <p className="text-[10px] text-rose-600 mt-0.5">{errors.parentName}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                <select
                  value={formData.parentRelationship}
                  onChange={(e) => setFormData({ ...formData, parentRelationship: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Legal Guardian</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Mobile Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+1 (555) 234-8901"
                  className={`w-full px-3 py-2 rounded-lg border font-mono text-xs ${
                    errors.parentPhone ? 'border-rose-300 ring-1 ring-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                  required
                />
                {errors.parentPhone && <p className="text-[10px] text-rose-600 mt-0.5">{errors.parentPhone}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guardian Email Address</label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  placeholder="v.sharma@example.com"
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    errors.parentEmail ? 'border-rose-300 ring-1 ring-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.parentEmail && <p className="text-[10px] text-rose-600 mt-0.5">{errors.parentEmail}</p>}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Secondary Guardian Name (Optional)</label>
                <input
                  type="text"
                  value={formData.secondaryGuardianName}
                  onChange={(e) => setFormData({ ...formData, secondaryGuardianName: e.target.value })}
                  placeholder="e.g., Meera Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Secondary Guardian Phone</label>
                <input
                  type="text"
                  value={formData.secondaryGuardianPhone}
                  onChange={(e) => setFormData({ ...formData, secondaryGuardianPhone: e.target.value })}
                  placeholder="+1 (555) 234-8902"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="e.g., Dr. Anita Roy (Aunt)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="+1 (555) 999-0112"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Residential Address */}
        {activeTab === 'address' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., 742 Evergreen Terrace, Apt 4B"
                className={`w-full px-3 py-2 rounded-lg border text-xs ${
                  errors.address ? 'border-rose-300 ring-1 ring-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                required
              />
              {errors.address && <p className="text-[10px] text-rose-600 mt-0.5">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Greenfield"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="MA"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Postal / ZIP Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="01301"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="United States"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Tab 5: Medical & Confidential Notes */}
        {activeTab === 'medical' && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-semibold text-slate-800 block mb-1">Medical & Health Record Protection</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Health information is restricted to authorized school nurses, administrators, and designated front-desk emergency response personnel.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g., Peanuts, Penicillin (None on file)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chronic Conditions / Accommodations</label>
                <input
                  type="text"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  placeholder="e.g., Mild Asthma (Inhaler with nurse)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Internal Administrative & Counseling Notes
              </label>
              <textarea
                rows={3}
                value={formData.internalAdministrativeNotes}
                onChange={(e) => setFormData({ ...formData, internalAdministrativeNotes: e.target.value })}
                placeholder="Confidential observations or admission directives visible only to senior institutional staff."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {isEdit ? 'Modifying existing student master file' : 'Fields marked with * are required for enrollment'}
          </div>

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
              {isEdit ? 'Save Record Changes' : 'Register & Enroll Student'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
