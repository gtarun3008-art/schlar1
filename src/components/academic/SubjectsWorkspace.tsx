import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, SubjectAllocation, Teacher, THEMES } from '../../types';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Filter,
  Check,
  Building,
  Clock,
  Sparkles,
  ArrowRight,
  UserX,
} from 'lucide-react';

export const SubjectsWorkspace: React.FC = () => {
  const {
    state,
    addSubject,
    updateSubject,
    deleteSubject,
    allocateSubject,
    updateSubjectAllocation,
    deleteSubjectAllocation,
    addToast,
    logAuditEvent,
  } = useApp();

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  // Active sub-tab: 'directory' or 'allocations'
  const [activeTab, setActiveTab] = useState<'directory' | 'allocations'>('allocations');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');

  // Subject Modal states
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [selectedSubjectForEdit, setSelectedSubjectForEdit] = useState<Subject | null>(null);
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<Subject | null>(null);

  // Allocation Modal states
  const [isAddAllocOpen, setIsAddAllocOpen] = useState(false);
  const [isEditAllocOpen, setIsEditAllocOpen] = useState(false);
  const [selectedAllocForEdit, setSelectedAllocForEdit] = useState<SubjectAllocation | null>(null);
  const [deleteConfirmAlloc, setDeleteConfirmAlloc] = useState<SubjectAllocation | null>(null);

  // Subject Form state
  const [subjectForm, setSubjectForm] = useState({
    name: 'Advanced Robotics & AI',
    code: 'ROB-301',
    category: 'STEM' as Subject['category'],
    applicableGrades: ['8', '9', '10'],
    weeklyPeriods: 3,
    description: 'Autonomous systems, sensor telemetry, and embedded Python programming.',
    status: 'Active' as Subject['status'],
  });

  // Allocation Form state
  const [allocForm, setAllocForm] = useState({
    subjectId: 'sub-math',
    classId: 'cls-10a',
    teacherId: 'tch-sterling',
    weeklyPeriods: 5,
    roomNumber: 'Room 301',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Missing teacher allocations detector
  const missingTeacherAllocations = useMemo(() => {
    return (state.subjectAllocations || []).filter(
      (a) => !a.teacherId || a.teacherId === '' || a.teacherName.toLowerCase().includes('unassigned')
    );
  }, [state.subjectAllocations]);

  // Filtered subjects
  const filteredSubjects = useMemo(() => {
    return (state.subjects || []).filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || sub.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [state.subjects, searchQuery, categoryFilter]);

  // Filtered allocations
  const filteredAllocations = useMemo(() => {
    return (state.subjectAllocations || []).filter((alloc) => {
      const matchesSearch =
        alloc.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alloc.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alloc.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alloc.className || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = classFilter === 'All' || alloc.className === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [state.subjectAllocations, searchQuery, classFilter]);

  // Open Add Subject
  const openAddSubject = () => {
    setSubjectForm({
      name: 'Advanced Robotics & AI',
      code: 'ROB-301',
      category: 'STEM',
      applicableGrades: ['8', '9', '10'],
      weeklyPeriods: 3,
      description: 'Autonomous systems, sensor telemetry, and embedded Python programming.',
      status: 'Active',
    });
    setFormError(null);
    setIsAddSubjectOpen(true);
  };

  // Open Edit Subject
  const openEditSubject = (sub: Subject) => {
    setSelectedSubjectForEdit(sub);
    setSubjectForm({
      name: sub.name,
      code: sub.code,
      category: sub.category,
      applicableGrades: sub.applicableGrades,
      weeklyPeriods: sub.weeklyPeriods,
      description: sub.description || '',
      status: sub.status,
    });
    setFormError(null);
    setIsEditSubjectOpen(true);
  };

  // Open Add Allocation
  const openAddAllocation = (defaultClass?: string, defaultSubject?: Subject) => {
    const defaultCls = defaultClass
      ? state.classes.find((c) => c.name === defaultClass) || state.classes[0]
      : state.classes[0];
    const defaultSub = defaultSubject || state.subjects[0];

    // Find teacher matching subject if possible
    const matchingTeacher = state.teachers.find((t) =>
      t.subjects.some((s) => s.toLowerCase().includes(defaultSub.name.toLowerCase().slice(0, 4)))
    ) || state.teachers[0];

    setAllocForm({
      subjectId: defaultSub.id,
      classId: defaultCls.id,
      teacherId: matchingTeacher ? matchingTeacher.id : '',
      weeklyPeriods: defaultSub.weeklyPeriods || 4,
      roomNumber: defaultCls.roomNumber || 'Room 301',
    });
    setFormError(null);
    setIsAddAllocOpen(true);
  };

  // Open Edit Allocation
  const openEditAllocation = (alloc: SubjectAllocation) => {
    setSelectedAllocForEdit(alloc);
    setAllocForm({
      subjectId: alloc.subjectId,
      classId: alloc.classId || '',
      teacherId: alloc.teacherId,
      weeklyPeriods: alloc.weeklyPeriods,
      roomNumber: alloc.roomNumber || 'Room 301',
    });
    setFormError(null);
    setIsEditAllocOpen(true);
  };

  // Save Subject Add
  const handleSaveSubjectAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim() || !subjectForm.code.trim()) {
      setFormError('Subject name and code are required.');
      return;
    }

    // Check duplicate code
    if (state.subjects.some((s) => s.code.toUpperCase() === subjectForm.code.toUpperCase())) {
      setFormError(`Subject with code ${subjectForm.code.toUpperCase()} already exists.`);
      return;
    }

    addSubject({
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim().toUpperCase(),
      category: subjectForm.category,
      applicableGrades: subjectForm.applicableGrades,
      weeklyPeriods: subjectForm.weeklyPeriods,
      description: subjectForm.description.trim(),
      status: subjectForm.status,
    });
    setIsAddSubjectOpen(false);
  };

  // Save Subject Edit
  const handleSaveSubjectEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectForEdit) return;

    // Check duplicate code with other subjects
    const duplicate = state.subjects.some(
      (s) =>
        s.id !== selectedSubjectForEdit.id &&
        s.code.toUpperCase() === subjectForm.code.toUpperCase()
    );
    if (duplicate) {
      setFormError(`Another subject with code ${subjectForm.code.toUpperCase()} exists.`);
      return;
    }

    updateSubject({
      ...selectedSubjectForEdit,
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim().toUpperCase(),
      category: subjectForm.category,
      applicableGrades: subjectForm.applicableGrades,
      weeklyPeriods: subjectForm.weeklyPeriods,
      description: subjectForm.description.trim(),
      status: subjectForm.status,
    });
    setIsEditSubjectOpen(false);
  };

  // Save Allocation Add
  const handleSaveAllocAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = state.classes.find((c) => c.id === allocForm.classId);
    const sub = state.subjects.find((s) => s.id === allocForm.subjectId);
    const tch = state.teachers.find((t) => t.id === allocForm.teacherId);

    if (!cls || !sub) {
      setFormError('Please select a valid class and subject.');
      return;
    }

    // Prevent duplicate allocation of same subject to same class
    const duplicate = (state.subjectAllocations || []).some(
      (a) => a.classId === cls.id && a.subjectId === sub.id
    );
    if (duplicate) {
      setFormError(`Subject "${sub.name}" is already allocated to "${cls.name}". Edit existing entry instead.`);
      return;
    }

    allocateSubject({
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      classId: cls.id,
      className: cls.name,
      teacherId: tch ? tch.id : '',
      teacherName: tch ? tch.name : 'Unassigned Faculty',
      weeklyPeriods: allocForm.weeklyPeriods,
      roomNumber: allocForm.roomNumber,
    });
    setIsAddAllocOpen(false);
  };

  // Save Allocation Edit
  const handleSaveAllocEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocForEdit) return;

    const cls = state.classes.find((c) => c.id === allocForm.classId);
    const sub = state.subjects.find((s) => s.id === allocForm.subjectId);
    const tch = state.teachers.find((t) => t.id === allocForm.teacherId);

    if (!cls || !sub) {
      setFormError('Please select a valid class and subject.');
      return;
    }

    // Check duplicate with another allocation
    const duplicate = (state.subjectAllocations || []).some(
      (a) =>
        a.id !== selectedAllocForEdit.id &&
        a.classId === cls.id &&
        a.subjectId === sub.id
    );
    if (duplicate) {
      setFormError(`Subject "${sub.name}" is already allocated to "${cls.name}".`);
      return;
    }

    updateSubjectAllocation({
      ...selectedAllocForEdit,
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      classId: cls.id,
      className: cls.name,
      teacherId: tch ? tch.id : '',
      teacherName: tch ? tch.name : 'Unassigned Faculty',
      weeklyPeriods: allocForm.weeklyPeriods,
      roomNumber: allocForm.roomNumber,
    });
    setIsEditAllocOpen(false);
  };

  const getCategoryBadge = (category: Subject['category']) => {
    switch (category) {
      case 'STEM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Languages':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Humanities':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Arts & Physical':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Curriculum Subjects & Faculty Allocations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Course curriculum, weekly period requirements, class assignments, and missing teacher coverage detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'directory' ? (
            <button
              onClick={openAddSubject}
              style={{ backgroundColor: currentTheme.primary }}
              className="flex items-center gap-1.5 px-3.5 py-2 hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-xs transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          ) : (
            <button
              onClick={() => openAddAllocation()}
              style={{ backgroundColor: currentTheme.primary }}
              className="flex items-center gap-1.5 px-3.5 py-2 hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-xs transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Allocate Subject to Class
            </button>
          )}
        </div>
      </div>

      {/* Missing Teacher Alert Banner */}
      {missingTeacherAllocations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">
                Action Required: {missingTeacherAllocations.length} Subject Allocation{missingTeacherAllocations.length > 1 ? 's' : ''} Missing Assigned Faculty
              </h4>
              <p className="text-amber-800 mt-0.5">
                The curriculum requires instructional coverage for {missingTeacherAllocations.map((a) => `${a.subjectName} (${a.className})`).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('allocations');
              openEditAllocation(missingTeacherAllocations[0]);
            }}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-xs shrink-0 self-start sm:self-auto"
          >
            Assign Teacher Now →
          </button>
        </div>
      )}

      {/* Tabs and Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('allocations')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'allocations'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Class Allocations Matrix ({state.subjectAllocations?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'directory'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Curriculum Catalog ({state.subjects?.length || 0} Subjects)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'allocations'
                    ? 'Search class, subject, teacher...'
                    : 'Search subject name or code...'
                }
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200"
              />
            </div>

            {activeTab === 'directory' ? (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-medium text-xs"
              >
                <option value="All">All Categories</option>
                <option value="STEM">STEM</option>
                <option value="Languages">Languages</option>
                <option value="Humanities">Humanities</option>
                <option value="Arts & Physical">Arts & Physical</option>
              </select>
            ) : (
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-medium text-xs"
              >
                <option value="All">All Classes</option>
                {state.classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* TAB CONTENT A: ALLOCATIONS MATRIX */}
        {activeTab === 'allocations' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Class & Cohort</th>
                  <th className="px-4 py-3">Subject Name & Code</th>
                  <th className="px-4 py-3">Assigned Teacher</th>
                  <th className="px-4 py-3 text-center">Weekly Periods</th>
                  <th className="px-4 py-3">Default Venue</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAllocations.map((alloc) => {
                  const isMissingTeacher =
                    !alloc.teacherId || alloc.teacherName.toLowerCase().includes('unassigned');

                  return (
                    <tr
                      key={alloc.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isMissingTeacher ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-slate-900">{alloc.className}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{alloc.subjectName}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {alloc.subjectCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isMissingTeacher ? (
                          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold w-fit">
                            <UserX className="w-3.5 h-3.5 text-amber-600" />
                            Missing Faculty Assignment
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-900">{alloc.teacherName}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-indigo-700">
                        {alloc.weeklyPeriods} / wk
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 font-medium">
                        {alloc.roomNumber || 'Classroom'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditAllocation(alloc)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Edit Allocation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmAlloc(alloc)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Remove Allocation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB CONTENT B: SUBJECTS DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((sub) => {
              const allocatedClassesCount = (state.subjectAllocations || []).filter(
                (a) => a.subjectId === sub.id || a.subjectName === sub.name
              ).length;

              return (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {sub.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryBadge(
                          sub.category
                        )}`}
                      >
                        {sub.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{sub.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sub.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Standard Periods:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {sub.weeklyPeriods} / week
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Applicable Grades:</span>
                        <span className="font-semibold text-slate-800">
                          Grades {sub.applicableGrades.join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Cohorts:</span>
                        <span className="font-mono font-semibold text-indigo-700">
                          {allocatedClassesCount} classes offering
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => openAddAllocation(undefined, sub)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      + Allocate to Class
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditSubject(sub)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSubject(sub)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
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
      </div>

      {/* ADD SUBJECT MODAL */}
      {isAddSubjectOpen && (
        <Modal
          isOpen={isAddSubjectOpen}
          onClose={() => setIsAddSubjectOpen(false)}
          title="Add New Subject to Curriculum"
          subtitle="Define subject code, faculty category, weekly periods, and syllabus description."
        >
          <form onSubmit={handleSaveSubjectAdd} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Physics Theory & Practical"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.code}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. PHY-201"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                <select
                  value={subjectForm.category}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, category: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="STEM">STEM (Science / Math / CS)</option>
                  <option value="Languages">Languages & Literature</option>
                  <option value="Humanities">Humanities & Social Studies</option>
                  <option value="Arts & Physical">Arts, Music & Physical Ed</option>
                  <option value="Vocational">Vocational / Electives</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Weekly Periods *</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={subjectForm.weeklyPeriods}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      weeklyPeriods: parseInt(e.target.value, 10) || 4,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                placeholder="Curriculum scope, lab requirements, learning goals..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddSubjectOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.primary }}
                className="px-5 py-2 text-white rounded-lg font-semibold shadow-xs"
              >
                Add Subject
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT SUBJECT MODAL */}
      {isEditSubjectOpen && selectedSubjectForEdit && (
        <Modal
          isOpen={isEditSubjectOpen}
          onClose={() => setIsEditSubjectOpen(false)}
          title={`Edit ${selectedSubjectForEdit.name}`}
          subtitle="Modify subject configuration and weekly required instructional periods."
        >
          <form onSubmit={handleSaveSubjectEdit} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.code}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                <select
                  value={subjectForm.category}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, category: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="STEM">STEM (Science / Math / CS)</option>
                  <option value="Languages">Languages & Literature</option>
                  <option value="Humanities">Humanities & Social Studies</option>
                  <option value="Arts & Physical">Arts, Music & Physical Ed</option>
                  <option value="Vocational">Vocational / Electives</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Weekly Periods *</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={subjectForm.weeklyPeriods}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      weeklyPeriods: parseInt(e.target.value, 10) || 4,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditSubjectOpen(false)}
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

      {/* ALLOCATE SUBJECT MODAL (Add & Edit) */}
      {(isAddAllocOpen || isEditAllocOpen) && (
        <Modal
          isOpen={isAddAllocOpen || isEditAllocOpen}
          onClose={() => {
            setIsAddAllocOpen(false);
            setIsEditAllocOpen(false);
          }}
          title={isEditAllocOpen ? 'Edit Subject Allocation' : 'Allocate Subject to Class'}
          subtitle="Assign an approved faculty member, venue, and weekly instructional periods."
        >
          <form
            onSubmit={isEditAllocOpen ? handleSaveAllocEdit : handleSaveAllocAdd}
            className="space-y-4 text-xs"
          >
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Class *</label>
                <select
                  value={allocForm.classId}
                  onChange={(e) => setAllocForm({ ...allocForm, classId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {state.classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Curriculum Subject *</label>
                <select
                  value={allocForm.subjectId}
                  onChange={(e) => {
                    const sub = state.subjects.find((s) => s.id === e.target.value);
                    setAllocForm({
                      ...allocForm,
                      subjectId: e.target.value,
                      weeklyPeriods: sub?.weeklyPeriods || allocForm.weeklyPeriods,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {state.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Teacher *</label>
                <select
                  value={allocForm.teacherId}
                  onChange={(e) => setAllocForm({ ...allocForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">-- Leave Unassigned (Flag for later) --</option>
                  {state.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Instructional Room</label>
                <input
                  type="text"
                  required
                  value={allocForm.roomNumber}
                  onChange={(e) => setAllocForm({ ...allocForm, roomNumber: e.target.value })}
                  placeholder="e.g. Science Lab 1, Room 301"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Weekly Periods</label>
              <input
                type="number"
                min={1}
                max={10}
                value={allocForm.weeklyPeriods}
                onChange={(e) =>
                  setAllocForm({
                    ...allocForm,
                    weeklyPeriods: parseInt(e.target.value, 10) || 4,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddAllocOpen(false);
                  setIsEditAllocOpen(false);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.primary }}
                className="px-5 py-2 text-white rounded-lg font-semibold shadow-xs"
              >
                {isEditAllocOpen ? 'Save Allocation' : 'Create Allocation'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE SUBJECT */}
      {deleteConfirmSubject && (
        <Modal
          isOpen={!!deleteConfirmSubject}
          onClose={() => setDeleteConfirmSubject(null)}
          title={`Remove ${deleteConfirmSubject.name}?`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to delete <strong>{deleteConfirmSubject.name}</strong> ({deleteConfirmSubject.code}) from the curriculum catalog?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
              All active class teacher allocations for this subject will also be removed.
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmSubject(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSubject(deleteConfirmSubject.id);
                  setDeleteConfirmSubject(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE ALLOCATION */}
      {deleteConfirmAlloc && (
        <Modal
          isOpen={!!deleteConfirmAlloc}
          onClose={() => setDeleteConfirmAlloc(null)}
          title="Remove Subject Allocation?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to remove the allocation of <strong>{deleteConfirmAlloc.subjectName}</strong> for <strong>{deleteConfirmAlloc.className}</strong>?
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAlloc(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSubjectAllocation(deleteConfirmAlloc.id);
                  setDeleteConfirmAlloc(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Remove Allocation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
