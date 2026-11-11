import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, SubjectAllocation } from '../../types';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Layers,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export const SubjectAllocationManager: React.FC = () => {
  const {
    state,
    addSubject,
    updateSubject,
    deleteSubject,
    allocateSubject,
    updateSubjectAllocation,
    deleteSubjectAllocation,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'allocations' | 'catalog'>('allocations');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<SubjectAllocation | null>(null);
  const [deleteAllocationConfirm, setDeleteAllocationConfirm] = useState<SubjectAllocation | null>(null);

  // Subject Form
  const [subjectFormName, setSubjectFormName] = useState('');
  const [subjectFormCode, setSubjectFormCode] = useState('');
  const [subjectFormCategory, setSubjectFormCategory] = useState<Subject['category']>('Core');
  const [subjectFormWeeklyPeriods, setSubjectFormWeeklyPeriods] = useState(5);
  const [subjectFormDescription, setSubjectFormDescription] = useState('');
  const [subjectFormApplicableGrades, setSubjectFormApplicableGrades] = useState('7, 8, 9, 10');

  // Allocation Form
  const [allocFormClass, setAllocFormClass] = useState('Grade 10A');
  const [allocFormSubjectId, setAllocFormSubjectId] = useState('');
  const [allocFormTeacherId, setAllocFormTeacherId] = useState('');
  const [allocFormWeeklyPeriods, setAllocFormWeeklyPeriods] = useState(5);
  const [allocValidationError, setAllocValidationError] = useState<string | null>(null);

  // Subjects & Categories
  const subjects = state.subjects || [];
  const allocations = state.subjectAllocations || [];
  const classes = state.classes || [];
  const teachers = state.teachers || [];

  // Filtered allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter((a) => {
      const clsName = a.class || a.className || '';
      const matchesClass = selectedClassFilter === 'all' || clsName === selectedClassFilter;
      const matchesSearch =
        a.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clsName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [allocations, selectedClassFilter, searchQuery]);

  // Missing teacher assignments detection
  const missingAssignments = useMemo(() => {
    return allocations.filter(
      (a) => !a.teacherId || a.teacherId === 'unassigned' || a.teacherName.toLowerCase().includes('unassigned')
    );
  }, [allocations]);

  // Open Add Subject
  const openAddSubjectModal = () => {
    setEditingSubject(null);
    setSubjectFormName('');
    setSubjectFormCode('');
    setSubjectFormCategory('Core');
    setSubjectFormWeeklyPeriods(5);
    setSubjectFormDescription('');
    setSubjectFormApplicableGrades('7, 8, 9, 10');
    setIsSubjectModalOpen(true);
  };

  // Open Edit Subject
  const openEditSubjectModal = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectFormName(sub.name);
    setSubjectFormCode(sub.code);
    setSubjectFormCategory(sub.category);
    setSubjectFormWeeklyPeriods(sub.weeklyPeriods || sub.weeklyPeriodsRequired || 5);
    setSubjectFormDescription(sub.description || '');
    setSubjectFormApplicableGrades(sub.applicableGrades.join(', '));
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const gradesArr = subjectFormApplicableGrades
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        name: subjectFormName,
        code: subjectFormCode.toUpperCase(),
        category: subjectFormCategory,
        weeklyPeriods: subjectFormWeeklyPeriods,
        weeklyPeriodsRequired: subjectFormWeeklyPeriods,
        applicableGrades: gradesArr,
        description: subjectFormDescription,
      });
      addToast('Subject Updated', `${subjectFormName} curriculum catalog updated.`, 'success');
    } else {
      addSubject({
        name: subjectFormName,
        code: subjectFormCode.toUpperCase(),
        category: subjectFormCategory,
        weeklyPeriods: subjectFormWeeklyPeriods,
        weeklyPeriodsRequired: subjectFormWeeklyPeriods,
        applicableGrades: gradesArr,
        academicYearId: state.activeAcademicYearId,
        description: subjectFormDescription,
        status: 'Active',
      });
      addToast('Subject Added', `${subjectFormName} added to institutional curriculum.`, 'success');
    }
    setIsSubjectModalOpen(false);
  };

  // Open Add Allocation
  const openAddAllocationModal = () => {
    setEditingAllocation(null);
    setAllocFormClass(classes[0]?.name || 'Grade 10A');
    setAllocFormSubjectId(subjects[0]?.id || '');
    setAllocFormTeacherId(teachers[0]?.id || '');
    setAllocFormWeeklyPeriods(subjects[0]?.weeklyPeriods || subjects[0]?.weeklyPeriodsRequired || 5);
    setAllocValidationError(null);
    setIsAllocationModalOpen(true);
  };

  // Open Edit Allocation
  const openEditAllocationModal = (alloc: SubjectAllocation) => {
    setEditingAllocation(alloc);
    setAllocFormClass(alloc.class || alloc.className || 'Grade 10A');
    setAllocFormSubjectId(alloc.subjectId);
    setAllocFormTeacherId(alloc.teacherId);
    setAllocFormWeeklyPeriods(alloc.weeklyPeriods);
    setAllocValidationError(null);
    setIsAllocationModalOpen(true);
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSubject = subjects.find((s) => s.id === allocFormSubjectId);
    const selectedTeacher = teachers.find((t) => t.id === allocFormTeacherId);

    if (!selectedSubject) {
      setAllocValidationError('Please choose a valid curriculum subject.');
      return;
    }

    // Check duplicate allocation: Same subject already allocated to this class
    const isDuplicate = allocations.some((a) => {
      if (editingAllocation && a.id === editingAllocation.id) return false;
      const targetCls = a.class || a.className;
      return targetCls === allocFormClass && a.subjectId === allocFormSubjectId;
    });

    if (isDuplicate) {
      setAllocValidationError(
        `Duplicate Allocation: ${selectedSubject.name} is already allocated to ${allocFormClass}. Edit the existing allocation instead.`
      );
      return;
    }

    const teacherName = selectedTeacher ? selectedTeacher.name : 'Unassigned Faculty';

    if (editingAllocation) {
      updateSubjectAllocation({
        ...editingAllocation,
        class: allocFormClass,
        className: allocFormClass,
        classId: 'cls-' + allocFormClass.toLowerCase().replace(/\s+/g, '-'),
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
        teacherId: allocFormTeacherId || 'unassigned',
        teacherName: teacherName,
        weeklyPeriods: allocFormWeeklyPeriods,
        academicYearId: state.activeAcademicYearId,
      });
      addToast('Allocation Updated', `${selectedSubject.name} in ${allocFormClass} reassigned.`, 'success');
    } else {
      allocateSubject({
        class: allocFormClass,
        className: allocFormClass,
        classId: 'cls-' + allocFormClass.toLowerCase().replace(/\s+/g, '-'),
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
        teacherId: allocFormTeacherId || 'unassigned',
        teacherName: teacherName,
        weeklyPeriods: allocFormWeeklyPeriods,
        academicYearId: state.activeAcademicYearId,
      });
      addToast('Subject Allocated', `${selectedSubject.name} allocated to ${allocFormClass} (${teacherName}).`, 'success');
    }

    setIsAllocationModalOpen(false);
  };

  const handleDeleteAllocation = () => {
    if (deleteAllocationConfirm) {
      deleteSubjectAllocation(deleteAllocationConfirm.id);
      addToast('Allocation Removed', 'Subject-teacher class allocation deleted.', 'info');
      setDeleteAllocationConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Subjects & Faculty Allocation Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curriculum catalog, class-level subject mappings, weekly period targets, and faculty assignment validation.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openAddSubjectModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Subject
            </button>
            <button
              onClick={openAddAllocationModal}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Allocate Subject to Class
            </button>
          </div>
        </div>

        {/* Missing Assignments Alert Banner */}
        {missingAssignments.length > 0 && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900">
                  {missingAssignments.length} Missing Faculty Allocation{missingAssignments.length > 1 ? 's' : ''} Detected
                </span>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  The following courses require faculty assignment before timetable slots can be populated:
                  {' '}
                  <span className="font-semibold underline">
                    {missingAssignments.map((m) => `${m.subjectName} (${m.class || m.className})`).join(', ')}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => openEditAllocationModal(missingAssignments[0])}
              className="px-2.5 py-1 bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-[11px] shrink-0"
            >
              Assign Faculty Now →
            </button>
          </div>
        )}

        {/* View Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('allocations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'allocations'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Class Allocations ({allocations.length})
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Subject Catalog ({subjects.length})
            </button>
          </div>

          {activeTab === 'allocations' && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter subjects, teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Cohort:</span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value="all">All Cohorts ({classes.length})</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: ALLOCATIONS TABLE */}
      {activeTab === 'allocations' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Class / Section</th>
                  <th className="px-4 py-3.5">Curriculum Subject</th>
                  <th className="px-4 py-3.5">Subject Code</th>
                  <th className="px-4 py-3.5">Assigned Faculty</th>
                  <th className="px-4 py-3.5 text-center">Required Periods</th>
                  <th className="px-4 py-3.5 text-center">Timetable Slots</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAllocations.map((alloc) => {
                  const isUnassigned =
                    !alloc.teacherId ||
                    alloc.teacherId === 'unassigned' ||
                    alloc.teacherName.toLowerCase().includes('unassigned');

                  const targetClass = alloc.class || alloc.className || '';
                  const scheduledSlots = (state.timetable || []).filter(
                    (s) => s.class === targetClass && s.subject === alloc.subjectName
                  ).length;

                  const isUnderScheduled = scheduledSlots < alloc.weeklyPeriods;

                  return (
                    <tr key={alloc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{targetClass}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800">{alloc.subjectName}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500 font-semibold text-[11px]">
                        {alloc.subjectCode}
                      </td>
                      <td className="px-4 py-3.5">
                        {isUnassigned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Missing Assignment
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                            <Users className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{alloc.teacherName}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800">
                        {alloc.weeklyPeriods} / wk
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono">
                        <span
                          className={`font-semibold ${
                            isUnderScheduled ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {scheduledSlots} / {alloc.weeklyPeriods}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {isUnassigned ? (
                          <span className="text-[11px] font-semibold text-rose-600">Pending Teacher</span>
                        ) : isUnderScheduled ? (
                          <span className="text-[11px] font-semibold text-amber-600">
                            Needs {alloc.weeklyPeriods - scheduledSlots} more slots
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Fully Scheduled
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditAllocationModal(alloc)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Allocation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteAllocationConfirm(alloc)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete Allocation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredAllocations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                      No subject allocations matching the current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECT CATALOG */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => {
            const countAllocations = allocations.filter((a) => a.subjectId === sub.id).length;

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{sub.name}</h3>
                      <span className="font-mono text-xs font-semibold text-indigo-600">
                        {sub.code}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {sub.category}
                    </span>
                  </div>

                  {sub.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Weekly Requirement:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {sub.weeklyPeriods || sub.weeklyPeriodsRequired || 5} Periods / Week
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Applicable Grades:</span>
                      <span className="font-semibold text-slate-800">
                        Grades {sub.applicableGrades.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Active Class Allocations:</span>
                      <span className="font-mono font-semibold text-indigo-600">
                        {countAllocations} cohorts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Status: <strong className="text-emerald-600 font-semibold">Active</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditSubjectModal(sub)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (countAllocations > 0) {
                          addToast(
                            'Allocations Exist',
                            `Cannot delete ${sub.name} while allocated to ${countAllocations} class cohorts.`,
                            'error'
                          );
                          return;
                        }
                        deleteSubject(sub.id);
                        addToast('Subject Deleted', `${sub.name} removed from catalog.`, 'info');
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingSubject ? `Edit Subject: ${editingSubject.name}` : 'Add Curriculum Subject'}
        subtitle="Define syllabus title, classification category, code, and weekly periods."
      >
        <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Advanced Calculus"
                value={subjectFormName}
                onChange={(e) => setSubjectFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subject Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. MATH-401"
                value={subjectFormCode}
                onChange={(e) => setSubjectFormCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={subjectFormCategory}
                onChange={(e) => setSubjectFormCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Language">Language</option>
                <option value="STEM">STEM</option>
                <option value="Arts">Arts</option>
                <option value="Physical Education">Physical Education</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Required Weekly Periods
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={subjectFormWeeklyPeriods}
                onChange={(e) => setSubjectFormWeeklyPeriods(parseInt(e.target.value, 10) || 4)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Applicable Grades (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. 7, 8, 9, 10"
              value={subjectFormApplicableGrades}
              onChange={(e) => setSubjectFormApplicableGrades(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Optional course overview and learning focus..."
              value={subjectFormDescription}
              onChange={(e) => setSubjectFormDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Allocation Modal */}
      <Modal
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        title={editingAllocation ? 'Modify Subject Allocation' : 'Allocate Subject to Class'}
        subtitle="Assign a specific faculty member and weekly period requirement to a class cohort."
      >
        <form onSubmit={handleSaveAllocation} className="space-y-4 text-xs">
          {allocValidationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{allocValidationError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Class Cohort *</label>
              <select
                value={allocFormClass}
                onChange={(e) => setAllocFormClass(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.roomNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Curriculum Subject *</label>
              <select
                value={allocFormSubjectId}
                onChange={(e) => {
                  setAllocFormSubjectId(e.target.value);
                  const sub = subjects.find((s) => s.id === e.target.value);
                  if (sub) setAllocFormWeeklyPeriods(sub.weeklyPeriods || sub.weeklyPeriodsRequired || 5);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Faculty Member *</label>
              <select
                value={allocFormTeacherId}
                onChange={(e) => setAllocFormTeacherId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subjects.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Weekly Period Target</label>
              <input
                type="number"
                min={1}
                max={12}
                value={allocFormWeeklyPeriods}
                onChange={(e) => setAllocFormWeeklyPeriods(parseInt(e.target.value, 10) || 4)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
            <strong>Note:</strong> Allocations feed directly into the Timetable Editor. The Timetable will enforce that only allocated faculty can be scheduled for this subject and cohort.
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAllocationModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              {editingAllocation ? 'Save Allocation' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Allocation Confirmation Modal */}
      {deleteAllocationConfirm && (
        <Modal
          isOpen={!!deleteAllocationConfirm}
          onClose={() => setDeleteAllocationConfirm(null)}
          title="Remove Subject Allocation?"
          subtitle={`Revoke ${deleteAllocationConfirm.subjectName} allocation from ${deleteAllocationConfirm.class || deleteAllocationConfirm.className}.`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to remove the allocation of{' '}
              <strong>{deleteAllocationConfirm.subjectName}</strong> ({deleteAllocationConfirm.subjectCode}) for{' '}
              <strong>{deleteAllocationConfirm.class || deleteAllocationConfirm.className}</strong> assigned to{' '}
              <strong>{deleteAllocationConfirm.teacherName}</strong>?
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteAllocationConfirm(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllocation}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Delete Allocation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
