import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassInfo, Student } from '../../types';
import { Modal } from '../common/Modal';
import {
  Layers,
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Clock,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowUpDown,
  Building,
} from 'lucide-react';

interface ClassSectionManagerProps {
  onSelectTimetableClass?: (className: string) => void;
}

export const ClassSectionManager: React.FC<ClassSectionManagerProps> = ({
  onSelectTimetableClass,
}) => {
  const { state, addClass, updateClass, deleteClass, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'grade' | 'students'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassInfo | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [deleteConfirmClass, setDeleteConfirmClass] = useState<ClassInfo | null>(null);

  // Form state
  const [formGrade, setFormGrade] = useState('10');
  const [formSection, setFormSection] = useState('A');
  const [formRoomNumber, setFormRoomNumber] = useState('Room 301');
  const [formTeacherId, setFormTeacherId] = useState('tch-sterling');
  const [formTotalStudents, setFormTotalStudents] = useState(32);
  const [formAcademicYearId, setFormAcademicYearId] = useState(state.activeAcademicYearId || 'ay-2026-27');
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Filtered and sorted classes
  const filteredClasses = useMemo(() => {
    return (state.classes || [])
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.classTeacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGrade = gradeFilter === 'all' || c.grade === gradeFilter;
        return matchesSearch && matchesGrade;
      })
      .sort((a, b) => {
        let valA: string | number = a.name;
        let valB: string | number = b.name;

        if (sortField === 'grade') {
          valA = parseInt(a.grade, 10) || 0;
          valB = parseInt(b.grade, 10) || 0;
        } else if (sortField === 'students') {
          valA = a.totalStudents;
          valB = b.totalStudents;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [state.classes, searchQuery, gradeFilter, sortField, sortOrder]);

  const grades = Array.from(new Set(state.classes.map((c) => c.grade))).sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10)
  );

  const openAddSectionModal = () => {
    setEditingClass(null);
    setFormGrade('10');
    setFormSection('C');
    setFormRoomNumber('Room 305');
    setFormTeacherId(state.teachers[0]?.id || 'tch-sterling');
    setFormTotalStudents(30);
    setFormAcademicYearId(state.activeAcademicYearId || 'ay-2026-27');
    setFormValidationError(null);
    setIsAddEditModalOpen(true);
  };

  const openEditSectionModal = (cls: ClassInfo) => {
    setEditingClass(cls);
    setFormGrade(cls.grade);
    setFormSection(cls.section);
    setFormRoomNumber(cls.roomNumber);
    setFormTeacherId(cls.classTeacherId);
    setFormTotalStudents(cls.totalStudents);
    setFormAcademicYearId(cls.academicYearId || state.activeAcademicYearId || 'ay-2026-27');
    setFormValidationError(null);
    setIsAddEditModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const candidateName = `Grade ${formGrade}${formSection.toUpperCase()}`;

    // Duplicate detection rule: Section identifier must not be duplicate within same grade and academic year
    const isDuplicate = state.classes.some((c) => {
      if (editingClass && c.id === editingClass.id) return false;
      const sameAy = !c.academicYearId || c.academicYearId === formAcademicYearId;
      return c.grade === formGrade && c.section.toUpperCase() === formSection.toUpperCase() && sameAy;
    });

    if (isDuplicate) {
      setFormValidationError(
        `Duplicate Section: Grade ${formGrade} Section ${formSection.toUpperCase()} already exists in the academic year!`
      );
      return;
    }

    const teacherObj = state.teachers.find((t) => t.id === formTeacherId);
    const teacherName = teacherObj ? teacherObj.name : 'Unassigned';

    if (editingClass) {
      updateClass({
        ...editingClass,
        name: candidateName,
        grade: formGrade,
        section: formSection.toUpperCase(),
        roomNumber: formRoomNumber,
        classTeacherId: formTeacherId,
        classTeacherName: teacherName,
        totalStudents: formTotalStudents,
        academicYearId: formAcademicYearId,
      });
      addToast('Section Updated', `${candidateName} specifications saved.`, 'success');
    } else {
      addClass({
        name: candidateName,
        grade: formGrade,
        section: formSection.toUpperCase(),
        classTeacherId: formTeacherId,
        classTeacherName: teacherName,
        roomNumber: formRoomNumber,
        totalStudents: formTotalStudents,
        academicYearId: formAcademicYearId,
      });
      addToast('Section Created', `${candidateName} initialized with room ${formRoomNumber}.`, 'success');
    }

    setIsAddEditModalOpen(false);
  };

  const handleDeleteClass = () => {
    if (deleteConfirmClass) {
      const enrolledCount = state.students.filter((s) => s.class === deleteConfirmClass.name).length;
      if (enrolledCount > 0) {
        addToast(
          'Reassignment Required',
          `Cannot delete ${deleteConfirmClass.name} while ${enrolledCount} students are actively enrolled. Move students first.`,
          'error'
        );
        return;
      }

      deleteClass(deleteConfirmClass.id);
      addToast('Section Removed', `${deleteConfirmClass.name} deleted from database.`, 'info');
      setDeleteConfirmClass(null);
    }
  };

  // Class detail helper data
  const detailStudents = useMemo(() => {
    if (!selectedClassDetail) return [];
    return state.students.filter((s) => s.class === selectedClassDetail.name);
  }, [selectedClassDetail, state.students]);

  const detailAllocations = useMemo(() => {
    if (!selectedClassDetail) return [];
    return (state.subjectAllocations || []).filter(
      (a) => (a.class || a.className) === selectedClassDetail.name
    );
  }, [selectedClassDetail, state.subjectAllocations]);

  const detailTimetableSlots = useMemo(() => {
    if (!selectedClassDetail) return [];
    return (state.timetable || []).filter((s) => s.class === selectedClassDetail.name);
  }, [selectedClassDetail, state.timetable]);

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Classes & Sections Directory
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active grade cohorts, homeroom teacher assignments, student capacity, and section timetables.
            </p>
          </div>

          <button
            onClick={openAddSectionModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Class / Section
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search grade, section, homeroom teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Grade:</span>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="all">All Grades ({state.classes.length})</option>
                {grades.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Sort:</span>
              <button
                onClick={() => {
                  if (sortField === 'name') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('name');
                    setSortOrder('asc');
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 ${
                  sortField === 'name'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Name <ArrowUpDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  if (sortField === 'students') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('students');
                    setSortOrder('desc');
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 ${
                  sortField === 'students'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Students <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map((cls) => {
          const enrolledCount = state.students.filter((s) => s.class === cls.name).length;
          const assignedSubjects = (state.subjectAllocations || []).filter(
            (a) => (a.class || a.className) === cls.name
          );
          const timetableCount = (state.timetable || []).filter(
            (s) => s.class === cls.name
          ).length;

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{cls.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Sec {cls.section}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {cls.roomNumber} · {state.activeAcademicYearId || 'AY 2026-27'}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>

                {/* Metrics */}
                <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Class Coordinator:</span>
                    <span className="font-bold text-slate-900">{cls.classTeacherName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Enrolled Students:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {enrolledCount} / {cls.totalStudents} cap
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Curriculum Subjects:</span>
                    <span className="font-mono font-semibold text-indigo-600">
                      {assignedSubjects.length} subjects
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Weekly Periods:</span>
                    <span className="font-mono font-semibold text-purple-600">
                      {timetableCount} / 35 slots
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedClassDetail(cls)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Class Detail
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (onSelectTimetableClass) {
                        onSelectTimetableClass(cls.name);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="View Class Timetable"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditSectionModal(cls)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Section Info"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmClass(cls)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Class Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Section Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingClass ? `Edit Section: ${editingClass.name}` : 'Create Class Section'}
        subtitle="Specify cohort grade, section letter, assigned classroom, and homeroom coordinator."
      >
        <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
          {formValidationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formValidationError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Grade Level *</label>
              <select
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {['6', '7', '8', '9', '10', '11', '12'].map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Section Identifier *</label>
              <input
                type="text"
                required
                maxLength={2}
                placeholder="e.g. A, B, C"
                value={formSection}
                onChange={(e) => setFormSection(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Classroom *</label>
              <input
                type="text"
                required
                placeholder="e.g. Room 301, Lab B"
                value={formRoomNumber}
                onChange={(e) => setFormRoomNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Seat Capacity</label>
              <input
                type="number"
                min={10}
                max={50}
                value={formTotalStudents}
                onChange={(e) => setFormTotalStudents(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Homeroom Coordinator *</label>
            <select
              value={formTeacherId}
              onChange={(e) => setFormTeacherId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              {state.teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.subjects.join(', ')})
                </option>
              ))}
            </select>
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
              {editingClass ? 'Save Changes' : 'Initialize Section'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Class Detail Modal */}
      {selectedClassDetail && (
        <Modal
          isOpen={!!selectedClassDetail}
          onClose={() => setSelectedClassDetail(null)}
          title={`Class Detail: ${selectedClassDetail.name}`}
          subtitle={`${selectedClassDetail.roomNumber} · Homeroom Teacher: ${selectedClassDetail.classTeacherName}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Enrolled Students
                </span>
                <span className="font-mono font-bold text-base text-slate-900">
                  {detailStudents.length} / {selectedClassDetail.totalStudents}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Allocated Subjects
                </span>
                <span className="font-mono font-bold text-base text-indigo-600">
                  {detailAllocations.length} Active Courses
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Timetable Fill
                </span>
                <span className="font-mono font-bold text-base text-purple-600">
                  {Math.round((detailTimetableSlots.length / 35) * 100)}% ({detailTimetableSlots.length}/35)
                </span>
              </div>
            </div>

            {/* Assigned Subjects & Teachers */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Curriculum Subjects & Allocated Faculty
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-3.5 py-2">Subject</th>
                      <th className="px-3.5 py-2">Teacher</th>
                      <th className="px-3.5 py-2 text-center">Weekly Periods</th>
                      <th className="px-3.5 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailAllocations.map((a) => (
                      <tr key={a.id}>
                        <td className="px-3.5 py-2 font-bold text-slate-900">{a.subjectName}</td>
                        <td className="px-3.5 py-2 text-slate-700">{a.teacherName}</td>
                        <td className="px-3.5 py-2 text-center font-mono font-semibold">
                          {a.weeklyPeriods} / wk
                        </td>
                        <td className="px-3.5 py-2 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                            Allocated
                          </span>
                        </td>
                      </tr>
                    ))}
                    {detailAllocations.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3.5 py-3 text-center text-slate-400">
                          No subjects formally allocated yet. Configure allocations in the Subjects workspace.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enrolled Students Roster */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Enrolled Students ({detailStudents.length})
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto divide-y divide-slate-100">
                {detailStudents.map((std) => (
                  <div key={std.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900 block">{std.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Adm: {std.admissionId} · Roll: #{std.rollNo}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-emerald-600 block">
                        {std.academicStatus}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {std.attendanceRate}% Attendance
                      </span>
                    </div>
                  </div>
                ))}
                {detailStudents.length === 0 && (
                  <div className="p-4 text-center text-slate-400">
                    No students currently enrolled in this section.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  if (onSelectTimetableClass) {
                    onSelectTimetableClass(selectedClassDetail.name);
                  }
                  setSelectedClassDetail(null);
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5" />
                Open Section Timetable
              </button>

              <button
                onClick={() => setSelectedClassDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmClass && (
        <Modal
          isOpen={!!deleteConfirmClass}
          onClose={() => setDeleteConfirmClass(null)}
          title={`Delete Class: ${deleteConfirmClass.name}?`}
          subtitle="Confirm complete removal of this class cohort."
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to delete <strong>{deleteConfirmClass.name}</strong>?
            </p>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
              <strong>Note:</strong> Class sections with active students cannot be deleted. Any students must be formally transferred or reassigned first.
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmClass(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClass}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
