import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicYear, AcademicTerm } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Archive,
  AlertTriangle,
  Info,
  CalendarDays,
  Bookmark,
} from 'lucide-react';

export const AcademicYearManager: React.FC = () => {
  const {
    state,
    addAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    setActiveAcademicYear,
    addToast,
  } = useApp();

  const academicYears = state.academicYears || [];
  const activeYearId = state.activeAcademicYearId || 'ay-2026-27';

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
  const [isSwitchActiveModalOpen, setIsSwitchActiveModalOpen] = useState(false);
  const [yearToActivate, setYearToActivate] = useState<AcademicYear | null>(null);

  // Form state
  const [formName, setFormName] = useState('Academic Year 2026–2027');
  const [formCode, setFormCode] = useState('AY 2026-27');
  const [formStartDate, setFormStartDate] = useState('2026-08-15');
  const [formEndDate, setFormEndDate] = useState('2027-06-25');
  const [formWorkingDays, setFormWorkingDays] = useState(210);
  const [formStatus, setFormStatus] = useState<'Active' | 'Upcoming' | 'Archived'>('Active');
  const [formTerms, setFormTerms] = useState<AcademicTerm[]>([
    {
      id: 'term-1',
      name: 'Term 1 (Fall Semester)',
      startDate: '2026-08-15',
      endDate: '2026-12-20',
      status: 'Current',
      examStartDate: '2026-12-05',
      examEndDate: '2026-12-18',
    },
    {
      id: 'term-2',
      name: 'Term 2 (Spring Semester)',
      startDate: '2027-01-08',
      endDate: '2027-06-25',
      status: 'Upcoming',
      examStartDate: '2027-06-01',
      examEndDate: '2027-06-20',
    },
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingYear(null);
    setFormName('Academic Year 2027–2028');
    setFormCode('AY 2027-28');
    setFormStartDate('2027-08-15');
    setFormEndDate('2028-06-25');
    setFormWorkingDays(210);
    setFormStatus('Upcoming');
    setFormTerms([
      {
        id: 'term-1',
        name: 'Term 1 (Fall)',
        startDate: '2027-08-15',
        endDate: '2027-12-20',
        status: 'Upcoming',
      },
      {
        id: 'term-2',
        name: 'Term 2 (Spring)',
        startDate: '2028-01-08',
        endDate: '2028-06-25',
        status: 'Upcoming',
      },
    ]);
    setValidationError(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (ay: AcademicYear) => {
    setEditingYear(ay);
    setFormName(ay.name);
    setFormCode(ay.code);
    setFormStartDate(ay.startDate);
    setFormEndDate(ay.endDate);
    setFormWorkingDays(typeof ay.workingDays === 'number' ? ay.workingDays : 210);
    setFormStatus(ay.status);
    setFormTerms(ay.terms || []);
    setValidationError(null);
    setIsAddEditModalOpen(true);
  };

  const handleTermChange = (index: number, field: keyof AcademicTerm, value: any) => {
    const updated = [...formTerms];
    updated[index] = { ...updated[index], [field]: value };
    setFormTerms(updated);
  };

  const addTermRow = () => {
    const newTerm: AcademicTerm = {
      id: 'term-' + (formTerms.length + 1),
      name: `Term ${formTerms.length + 1}`,
      startDate: formStartDate,
      endDate: formEndDate,
      status: 'Upcoming',
    };
    setFormTerms([...formTerms, newTerm]);
  };

  const removeTermRow = (index: number) => {
    if (formTerms.length <= 1) {
      addToast('Validation', 'An academic year must have at least one term.', 'info');
      return;
    }
    setFormTerms(formTerms.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    // 1. End date must be strictly after start date
    if (new Date(formEndDate) <= new Date(formStartDate)) {
      setValidationError('Academic year end date must be strictly after the start date.');
      return false;
    }

    // 2. Terms validation
    for (let i = 0; i < formTerms.length; i++) {
      const term = formTerms[i];
      if (!term.name.trim()) {
        setValidationError(`Term ${i + 1} name cannot be empty.`);
        return false;
      }
      if (new Date(term.endDate) <= new Date(term.startDate)) {
        setValidationError(`Term "${term.name}": End date must be after start date.`);
        return false;
      }
      if (
        new Date(term.startDate) < new Date(formStartDate) ||
        new Date(term.endDate) > new Date(formEndDate)
      ) {
        setValidationError(
          `Term "${term.name}" dates must fall within the academic year window (${formStartDate} to ${formEndDate}).`
        );
        return false;
      }
      // Check exams dates
      if (term.examStartDate && term.examEndDate) {
        if (new Date(term.examEndDate) <= new Date(term.examStartDate)) {
          setValidationError(`Term "${term.name}": Examination end date must be after exam start date.`);
          return false;
        }
      }
    }

    // 3. Check overlapping terms
    for (let i = 0; i < formTerms.length; i++) {
      for (let j = i + 1; j < formTerms.length; j++) {
        const t1 = formTerms[i];
        const t2 = formTerms[j];
        const t1Start = new Date(t1.startDate);
        const t1End = new Date(t1.endDate);
        const t2Start = new Date(t2.startDate);
        const t2End = new Date(t2.endDate);

        if (t1Start < t2End && t2Start < t1End) {
          setValidationError(
            `Warning: Term "${t1.name}" and Term "${t2.name}" have overlapping date ranges. Please adjust term dates.`
          );
          return false;
        }
      }
    }

    setValidationError(null);
    return true;
  };

  const handleSaveAcademicYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingYear) {
      updateAcademicYear({
        ...editingYear,
        name: formName,
        code: formCode,
        startDate: formStartDate,
        endDate: formEndDate,
        workingDays: formWorkingDays,
        status: formStatus,
        terms: formTerms,
      });
      addToast('Academic Year Updated', `${formName} configuration saved.`, 'success');
    } else {
      addAcademicYear({
        name: formName,
        code: formCode,
        startDate: formStartDate,
        endDate: formEndDate,
        isCurrent: formStatus === 'Active',
        status: formStatus,
        workingDays: formWorkingDays,
        terms: formTerms,
      });
      addToast('Academic Year Created', `${formName} added to academic registry.`, 'success');
    }
    setIsAddEditModalOpen(false);
  };

  const handleConfirmActivate = () => {
    if (yearToActivate) {
      setActiveAcademicYear(yearToActivate.id);
      setIsSwitchActiveModalOpen(false);
      setYearToActivate(null);
    }
  };

  const handleConfirmDelete = () => {
    if (yearToDelete) {
      if (yearToDelete.id === activeYearId) {
        addToast(
          'Action Prohibited',
          'Cannot delete the currently active academic year. Switch active year first.',
          'error'
        );
        return;
      }
      deleteAcademicYear(yearToDelete.id);
      setIsDeleteModalOpen(false);
      setYearToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Academic Years & Terms Setup
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure school academic sessions, semester terms, examination windows, and working day calendar.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Academic Year
            </button>
          </div>
        </div>

        {/* Notice banner */}
        <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-xs text-indigo-900">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Active Session Rule:</span> Switching the active academic session adjusts the current timetable, subject allocations, and term calendars for all school operations without erasing any historical records.
          </div>
        </div>
      </div>

      {/* Academic Years List */}
      <div className="grid grid-cols-1 gap-5">
        {academicYears.map((ay) => {
          const isActive = ay.id === activeYearId;
          const associatedClasses = (state.classes || []).filter(
            (c) => !c.academicYearId || c.academicYearId === ay.id
          );

          return (
            <div
              key={ay.id}
              className={`bg-white rounded-2xl border transition-all shadow-xs p-6 ${
                isActive
                  ? 'border-indigo-400 ring-2 ring-indigo-500/10'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900">{ay.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-700">
                      {ay.code}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active School Session
                      </span>
                    ) : (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          ay.status === 'Archived'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ay.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {ay.startDate} to {ay.endDate}
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-slate-700">{ay.workingDays}</strong> Working Days
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-slate-700">{associatedClasses.length}</strong> Associated Classes
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-start">
                  {!isActive && (
                    <button
                      onClick={() => {
                        setYearToActivate(ay);
                        setIsSwitchActiveModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors"
                    >
                      Set as Active Year
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(ay)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Academic Year"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {ay.status !== 'Archived' && !isActive && (
                    <button
                      onClick={() => {
                        updateAcademicYear({ ...ay, status: 'Archived' });
                        addToast('Archived', `${ay.name} moved to archived sessions.`, 'info');
                      }}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Archive Academic Year"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                  {!isActive && (
                    <button
                      onClick={() => {
                        setYearToDelete(ay);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Academic Year"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Terms Breakdown */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Academic Terms & Examination Windows
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(ay.terms || []).map((term) => (
                    <div
                      key={term.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{term.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            term.status === 'Current' || term.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : term.status === 'Completed'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {term.status}
                        </span>
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {term.startDate} → {term.endDate}
                      </div>
                      {term.examStartDate && term.examEndDate && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Bookmark className="w-3 h-3 text-purple-600" />
                            Exams:
                          </span>
                          <span className="font-mono font-medium text-slate-700">
                            {term.examStartDate} to {term.examEndDate}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Academic Year Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingYear ? `Edit Academic Session: ${editingYear.name}` : 'Create Academic Year'}
        subtitle="Establish academic calendar parameters, semester terms, and operational boundaries."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveAcademicYear} className="space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Academic Year Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Academic Year 2026–2027"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Session Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. AY 2026-27"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Working Days</label>
              <input
                type="number"
                min={100}
                max={300}
                value={formWorkingDays}
                onChange={(e) => setFormWorkingDays(parseInt(e.target.value, 10) || 200)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Lifecycle Status</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="Active">Active (Current Primary Session)</option>
              <option value="Upcoming">Upcoming (Future Planning)</option>
              <option value="Archived">Archived (Historical Record)</option>
            </select>
          </div>

          {/* Terms Sub-form */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-slate-900 font-bold">Terms / Semesters Structure</label>
              <button
                type="button"
                onClick={addTermRow}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Term
              </button>
            </div>

            <div className="space-y-3">
              {formTerms.map((term, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Term #{index + 1}</span>
                    {formTerms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTermRow(index)}
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Term Name</label>
                      <input
                        type="text"
                        required
                        value={term.name}
                        onChange={(e) => handleTermChange(index, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Start Date</label>
                      <input
                        type="date"
                        required
                        value={term.startDate}
                        onChange={(e) => handleTermChange(index, 'startDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">End Date</label>
                      <input
                        type="date"
                        required
                        value={term.endDate}
                        onChange={(e) => handleTermChange(index, 'endDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Exams Start (Optional)</label>
                      <input
                        type="date"
                        value={term.examStartDate || ''}
                        onChange={(e) => handleTermChange(index, 'examStartDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Exams End (Optional)</label>
                      <input
                        type="date"
                        value={term.examEndDate || ''}
                        onChange={(e) => handleTermChange(index, 'examEndDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Term Status</label>
                      <select
                        value={term.status}
                        onChange={(e) => handleTermChange(index, 'status', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Current">Current (Active)</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              {editingYear ? 'Save Changes' : 'Create Academic Year'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Switch Active Year Confirmation Modal */}
      {yearToActivate && (
        <Modal
          isOpen={isSwitchActiveModalOpen}
          onClose={() => setIsSwitchActiveModalOpen(false)}
          title="Switch Active Academic Session?"
          subtitle={`Set "${yearToActivate.name}" as the active operational year.`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice regarding historical integrity:</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Changing the active academic session shifts the primary operational views to {yearToActivate.name}. All existing marks, attendance, and timetable history from previous sessions remain completely preserved in the database.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsSwitchActiveModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmActivate}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Confirm & Switch Session
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Academic Year Confirmation Modal */}
      {yearToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Remove Academic Year?"
          subtitle={`Are you sure you want to delete ${yearToDelete.name}?`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              This action will remove the academic year record <strong>{yearToDelete.name}</strong> ({yearToDelete.code}).
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
