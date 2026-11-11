import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicYear, AcademicTerm, THEMES } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  AlertTriangle,
  Info,
  CalendarDays,
  Check,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export const AcademicSetupWorkspace: React.FC = () => {
  const {
    state,
    setActiveAcademicYear,
    addAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    addToast,
  } = useApp();

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;
  const activeAy = state.academicYears.find((ay) => ay.id === state.activeAcademicYearId) || state.academicYears[0];

  const [selectedAy, setSelectedAy] = useState<AcademicYear>(activeAy);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [ayToArchive, setAyToArchive] = useState<AcademicYear | null>(null);

  // Form state
  const [formName, setFormName] = useState('2027-2028 Academic Session');
  const [formCode, setFormCode] = useState('AY-2027-28');
  const [formStartDate, setFormStartDate] = useState('2027-08-16');
  const [formEndDate, setFormEndDate] = useState('2028-06-16');
  const [formStatus, setFormStatus] = useState<AcademicYear['status']>('Upcoming');
  const [formDescription, setFormDescription] = useState('Next annual academic session.');
  const [formWorkingDays, setFormWorkingDays] = useState<Weekday[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);

  // Terms form state
  const [formTerms, setFormTerms] = useState<AcademicTerm[]>([
    {
      id: 'term-1',
      name: 'Term 1 (Fall Semester)',
      startDate: '2027-08-16',
      endDate: '2027-12-17',
      examStartDate: '2027-10-11',
      examEndDate: '2027-10-22',
      status: 'Upcoming',
    },
    {
      id: 'term-2',
      name: 'Term 2 (Spring Semester)',
      startDate: '2028-01-05',
      endDate: '2028-06-16',
      examStartDate: '2028-05-15',
      examEndDate: '2028-05-26',
      status: 'Upcoming',
    },
  ]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const openAddModal = () => {
    setFormName('2028-2029 Academic Session');
    setFormCode('AY-2028-29');
    setFormStartDate('2028-08-14');
    setFormEndDate('2029-06-15');
    setFormStatus('Upcoming');
    setFormDescription('Planned academic cycle with Cambridge & IB curricula.');
    setFormWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setFormTerms([
      {
        id: 't-1',
        name: 'Term 1 (Fall Semester)',
        startDate: '2028-08-14',
        endDate: '2028-12-15',
        examStartDate: '2028-10-09',
        examEndDate: '2028-10-20',
        status: 'Upcoming',
      },
      {
        id: 't-2',
        name: 'Term 2 (Spring Semester)',
        startDate: '2029-01-08',
        endDate: '2029-06-15',
        examStartDate: '2029-05-14',
        examEndDate: '2029-05-25',
        status: 'Upcoming',
      },
    ]);
    setValidationError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (ay: AcademicYear) => {
    setSelectedAy(ay);
    setFormName(ay.name);
    setFormCode(ay.code);
    setFormStartDate(ay.startDate);
    setFormEndDate(ay.endDate);
    setFormStatus(ay.status);
    setFormDescription(ay.description || '');
    setFormWorkingDays(
      Array.isArray(ay.workingDays)
        ? (ay.workingDays as Weekday[])
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    );
    setFormTerms(ay.terms || []);
    setValidationError(null);
    setIsEditModalOpen(true);
  };

  const validateDates = (): boolean => {
    if (new Date(formEndDate) <= new Date(formStartDate)) {
      setValidationError('Academic year end date must be strictly after the start date.');
      return false;
    }
    for (const term of formTerms) {
      if (new Date(term.endDate) <= new Date(term.startDate)) {
        setValidationError(`Term "${term.name}" end date must be after its start date.`);
        return false;
      }
      if (
        new Date(term.startDate) < new Date(formStartDate) ||
        new Date(term.endDate) > new Date(formEndDate)
      ) {
        setValidationError(
          `Term "${term.name}" date range (${term.startDate} to ${term.endDate}) must fall within the academic year (${formStartDate} to ${formEndDate}).`
        );
        return false;
      }
      if (term.examStartDate && term.examEndDate) {
        if (new Date(term.examEndDate) < new Date(term.examStartDate)) {
          setValidationError(`Exam end date in "${term.name}" cannot precede exam start date.`);
          return false;
        }
      }
    }
    setValidationError(null);
    return true;
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) return;

    addAcademicYear({
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      startDate: formStartDate,
      endDate: formEndDate,
      status: formStatus,
      description: formDescription.trim(),
      workingDays: formWorkingDays,
      terms: formTerms,
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) return;

    updateAcademicYear({
      ...selectedAy,
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      startDate: formStartDate,
      endDate: formEndDate,
      status: formStatus,
      description: formDescription.trim(),
      workingDays: formWorkingDays,
      terms: formTerms,
    });
    setIsEditModalOpen(false);
  };

  const toggleWorkingDay = (day: Weekday) => {
    if (formWorkingDays.includes(day)) {
      if (formWorkingDays.length <= 1) {
        addToast('Validation', 'At least one working day must be selected.', 'error');
        return;
      }
      setFormWorkingDays(formWorkingDays.filter((d) => d !== day));
    } else {
      setFormWorkingDays([...formWorkingDays, day]);
    }
  };

  const updateTermField = (idx: number, field: keyof AcademicTerm, value: any) => {
    setFormTerms((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Academic Years & Terms Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage institutional sessions, semester durations, examination intervals, and working calendars.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            style={{ backgroundColor: currentTheme.primary }}
            className="flex items-center gap-1.5 px-3.5 py-2 hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-xs transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Academic Year
          </button>
        </div>
      </div>

      {/* Academic Year Selector Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.academicYears.map((ay) => {
          const isActive = ay.id === state.activeAcademicYearId;
          const isSelected = ay.id === selectedAy.id;
          return (
            <div
              key={ay.id}
              onClick={() => setSelectedAy(ay)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {ay.code}
                </span>
                <div className="flex items-center gap-1.5">
                  {isActive && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Active Session
                    </span>
                  )}
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      ay.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ay.status === 'Upcoming'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ay.status}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{ay.name}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {ay.startDate} to {ay.endDate}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{ay.terms?.length || 0} Academic Terms</span>
                <div className="flex items-center gap-1">
                  {!isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAcademicYear(ay.id);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(ay);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Edit Session"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Academic Year Deep-Dive */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{selectedAy.name}</h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                {selectedAy.code}
              </span>
              {selectedAy.id === state.activeAcademicYearId ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Current Official Session
                </span>
              ) : (
                <button
                  onClick={() => setActiveAcademicYear(selectedAy.id)}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Make Active Session →
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{selectedAy.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(selectedAy)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              Edit Year Info
            </button>
            {selectedAy.id !== state.activeAcademicYearId && (
              <button
                onClick={() => {
                  setAyToArchive(selectedAy);
                  setIsArchiveConfirmOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Archive
              </button>
            )}
          </div>
        </div>

        {/* Key Dates & Working Days Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium">Session Term Dates</span>
            <div className="mt-1 font-bold text-slate-900 text-sm">
              {selectedAy.startDate} → {selectedAy.endDate}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              42 Instructional Weeks (approx. 210 days)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium">Configured Working Days</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {(Array.isArray(selectedAy.workingDays)
                ? selectedAy.workingDays
                : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
              ).map((day) => (
                <span
                  key={day}
                  className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs"
                >
                  {day}
                </span>
              ))}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              5-day academic week (Mon - Fri)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium">Associated Cohorts & Classes</span>
            <div className="mt-1 font-bold text-slate-900 text-sm">
              {state.classes.length} Classes · {state.students.length} Students
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              All records safely linked to active session
            </span>
          </div>
        </div>

        {/* Term Structure Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Terms and Examination Calendars ({selectedAy.terms?.length || 0} Terms)
            </h3>
            <span className="text-xs text-slate-400">Validated against institutional policy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedAy.terms?.map((term, index) => (
              <div
                key={term.id}
                className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Term #{index + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        term.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : term.status === 'Completed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {term.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{term.name}</h4>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Term Duration:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {term.startDate} to {term.endDate}
                      </span>
                    </div>
                    {term.examStartDate && (
                      <div className="flex justify-between text-slate-600">
                        <span className="flex items-center gap-1 text-purple-700 font-medium">
                          <Award className="w-3.5 h-3.5" />
                          Exam Period:
                        </span>
                        <span className="font-mono font-semibold text-purple-900">
                          {term.examStartDate} to {term.examEndDate || 'TBD'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Classrooms active: All 6 grades</span>
                  <span className="font-medium text-emerald-600">Curriculum Synced</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ADD ACADEMIC YEAR MODAL */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Academic Year Session"
          subtitle="Define academic calendar bounds, working days, and semester term timelines."
        >
          <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Session Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 2027-2028 Academic Session"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Code / Identifier *</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. AY-2027-28"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Upcoming">Upcoming (Planning)</option>
                  <option value="Active">Active (Current)</option>
                  <option value="Archived">Archived (Historical)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Institutional notes and scope..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            {/* Working Days */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                School Working Days
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const).map(
                  (day) => {
                    const isChecked = formWorkingDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleWorkingDay(day)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Term breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">Terms / Semesters Structure</h4>
              {formTerms.map((t, idx) => (
                <div key={t.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Start Date</span>
                      <input
                        type="date"
                        value={t.startDate}
                        onChange={(e) => updateTermField(idx, 'startDate', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">End Date</span>
                      <input
                        type="date"
                        value={t.endDate}
                        onChange={(e) => updateTermField(idx, 'endDate', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Exam Start</span>
                      <input
                        type="date"
                        value={t.examStartDate || ''}
                        onChange={(e) => updateTermField(idx, 'examStartDate', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Exam End</span>
                      <input
                        type="date"
                        value={t.examEndDate || ''}
                        onChange={(e) => updateTermField(idx, 'examEndDate', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.primary }}
                className="px-5 py-2 text-white rounded-lg font-semibold shadow-xs"
              >
                Create Academic Year
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT ACADEMIC YEAR MODAL */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${selectedAy.name}`}
          subtitle="Modify dates, working day calendars, or semester dates."
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Session Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Code / Identifier *</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Upcoming">Upcoming (Planning)</option>
                  <option value="Active">Active (Current)</option>
                  <option value="Archived">Archived (Historical)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            {/* Working Days */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                School Working Days
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const).map(
                  (day) => {
                    const isChecked = formWorkingDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleWorkingDay(day)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Term breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">Terms / Semesters Structure</h4>
              {formTerms.map((t, idx) => (
                <div key={t.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Start Date</span>
                      <input
                        type="date"
                        value={t.startDate}
                        onChange={(e) => updateTermField(idx, 'startDate', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">End Date</span>
                      <input
                        type="date"
                        value={t.endDate}
                        onChange={(e) => updateTermField(idx, 'endDate', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Exam Start</span>
                      <input
                        type="date"
                        value={t.examStartDate || ''}
                        onChange={(e) => updateTermField(idx, 'examStartDate', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Exam End</span>
                      <input
                        type="date"
                        value={t.examEndDate || ''}
                        onChange={(e) => updateTermField(idx, 'examEndDate', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.primary }}
                className="px-5 py-2 text-white rounded-lg font-semibold shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ARCHIVE CONFIRMATION MODAL */}
      {isArchiveConfirmOpen && ayToArchive && (
        <Modal
          isOpen={isArchiveConfirmOpen}
          onClose={() => setIsArchiveConfirmOpen(false)}
          title="Archive Academic Year Session?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to archive <strong>{ayToArchive.name}</strong> ({ayToArchive.code})?
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              Historical student records and marks will be preserved. This academic session will no longer be available for new enrollment or timetable scheduling.
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsArchiveConfirmOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAcademicYear(ayToArchive.id);
                  setIsArchiveConfirmOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
