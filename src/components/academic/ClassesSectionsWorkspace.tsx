import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassRoom, Student, Teacher, THEMES } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import {
  Layers,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface ClassesSectionsWorkspaceProps {
  onViewStudent?: (student: Student) => void;
  onNavigateToTimetable?: (className: string) => void;
}

export const ClassesSectionsWorkspace: React.FC<ClassesSectionsWorkspaceProps> = ({
  onViewStudent,
  onNavigateToTimetable,
}) => {
  const {
    state,
    addClass,
    updateClass,
    deleteClass,
    addToast,
    logAuditEvent,
  } = useApp();

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [academicYearFilter, setAcademicYearFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal states
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<ClassRoom | null>(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassRoom | null>(null);
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [targetClassForSection, setTargetClassForSection] = useState<ClassRoom | null>(null);
  const [deleteConfirmClass, setDeleteConfirmClass] = useState<ClassRoom | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    grade: 'Grade 11',
    section: 'A',
    classTeacherId: 'tch-sterling',
    roomNumber: 'Room 305',
    capacity: 35,
    description: 'Senior academic cohort with specialized subject streams.',
    academicYearId: state.activeAcademicYearId || 'ay-2026-27',
  });

  const [sectionFormData, setSectionFormData] = useState({
    section: 'C',
    classTeacherId: 'tch-watson',
    roomNumber: 'Room 306',
    capacity: 32,
    description: 'Additional section for expanded enrollment.',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return state.classes.filter((cls) => {
      const matchesSearch =
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.classTeacherName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGrade = gradeFilter === 'All' || cls.grade === gradeFilter || cls.name.includes(gradeFilter);
      const matchesYear =
        academicYearFilter === 'All' ||
        !cls.academicYearId ||
        cls.academicYearId === academicYearFilter;

      return matchesSearch && matchesGrade && matchesYear;
    });
  }, [state.classes, searchQuery, gradeFilter, academicYearFilter]);

  // Unique grades for filter
  const uniqueGrades = useMemo(() => {
    const set = new Set<string>();
    state.classes.forEach((c) => set.add(c.grade || c.name.split(' ')[0] || '10'));
    return Array.from(set).sort();
  }, [state.classes]);

  // Open Create Class Modal
  const openCreateClass = () => {
    setFormData({
      grade: 'Grade 11',
      section: 'A',
      classTeacherId: state.teachers[0]?.id || 'tch-sterling',
      roomNumber: 'Room 305',
      capacity: 35,
      description: 'Senior academic cohort with specialized subject streams.',
      academicYearId: state.activeAcademicYearId,
    });
    setFormError(null);
    setIsCreateClassOpen(true);
  };

  // Open Edit Class Modal
  const openEditClass = (cls: ClassRoom) => {
    setSelectedClassForEdit(cls);
    setFormData({
      grade: cls.grade,
      section: cls.section,
      classTeacherId: cls.classTeacherId,
      roomNumber: cls.roomNumber,
      capacity: cls.capacity || 35,
      description: cls.description || '',
      academicYearId: cls.academicYearId || state.activeAcademicYearId,
    });
    setFormError(null);
    setIsEditClassOpen(true);
  };

  // Open Create Section Modal
  const openCreateSection = (cls: ClassRoom) => {
    setTargetClassForSection(cls);
    // Find next available section letter
    const existingSections = state.classes
      .filter((c) => c.grade === cls.grade)
      .map((c) => c.section.toUpperCase());
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextSec = alphabet.find((l) => !existingSections.includes(l)) || 'C';

    setSectionFormData({
      section: nextSec,
      classTeacherId: state.teachers[1]?.id || 'tch-watson',
      roomNumber: `Room ${parseInt(cls.roomNumber.replace(/\D/g, '') || '300', 10) + 1}`,
      capacity: cls.capacity || 32,
      description: `Section ${nextSec} for ${cls.grade} cohort.`,
    });
    setFormError(null);
    setIsCreateSectionOpen(true);
  };

  // Submit Create Class
  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const className = `${formData.grade} ${formData.section.toUpperCase()}`.trim();

    // Check duplicate class name in same academic year
    const exists = state.classes.some(
      (c) =>
        c.name.toLowerCase() === className.toLowerCase() &&
        (c.academicYearId || state.activeAcademicYearId) === formData.academicYearId
    );
    if (exists) {
      setFormError(`Class ${className} already exists for this academic year.`);
      return;
    }

    const teacher = state.teachers.find((t) => t.id === formData.classTeacherId);

    addClass({
      name: className,
      grade: formData.grade,
      section: formData.section.toUpperCase(),
      classTeacherId: formData.classTeacherId,
      classTeacherName: teacher ? teacher.name : 'Unassigned',
      roomNumber: formData.roomNumber,
      capacity: formData.capacity,
      academicYearId: formData.academicYearId,
      description: formData.description,
      status: 'Active',
    });

    logAuditEvent(`Created Class & Section ${className}`, className, 'Academic');
    setIsCreateClassOpen(false);
  };

  // Submit Edit Class
  const handleEditClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForEdit) return;

    const className = `${formData.grade} ${formData.section.toUpperCase()}`.trim();

    // Prevent duplicate name with another class
    const duplicate = state.classes.some(
      (c) =>
        c.id !== selectedClassForEdit.id &&
        c.name.toLowerCase() === className.toLowerCase() &&
        (c.academicYearId || state.activeAcademicYearId) === formData.academicYearId
    );
    if (duplicate) {
      setFormError(`Another class with name ${className} already exists in this academic year.`);
      return;
    }

    const teacher = state.teachers.find((t) => t.id === formData.classTeacherId);

    updateClass({
      ...selectedClassForEdit,
      name: className,
      grade: formData.grade,
      section: formData.section.toUpperCase(),
      classTeacherId: formData.classTeacherId,
      classTeacherName: teacher ? teacher.name : 'Unassigned',
      roomNumber: formData.roomNumber,
      capacity: formData.capacity,
      academicYearId: formData.academicYearId,
      description: formData.description,
    });

    logAuditEvent(`Updated Class & Section ${className}`, className, 'Academic');
    setIsEditClassOpen(false);
  };

  // Submit Create Section
  const handleCreateSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClassForSection) return;

    const newClassName = `${targetClassForSection.grade} ${sectionFormData.section.toUpperCase()}`.trim();

    // Check duplicate section identifier
    const exists = state.classes.some(
      (c) =>
        c.grade === targetClassForSection.grade &&
        c.section.toUpperCase() === sectionFormData.section.toUpperCase()
    );
    if (exists) {
      setFormError(`Section ${sectionFormData.section.toUpperCase()} already exists for ${targetClassForSection.grade}.`);
      return;
    }

    const teacher = state.teachers.find((t) => t.id === sectionFormData.classTeacherId);

    addClass({
      name: newClassName,
      grade: targetClassForSection.grade,
      section: sectionFormData.section.toUpperCase(),
      classTeacherId: sectionFormData.classTeacherId,
      classTeacherName: teacher ? teacher.name : 'Unassigned',
      roomNumber: sectionFormData.roomNumber,
      capacity: sectionFormData.capacity,
      academicYearId: targetClassForSection.academicYearId || state.activeAcademicYearId,
      description: sectionFormData.description,
      status: 'Active',
    });

    logAuditEvent(`Created Section ${newClassName} for ${targetClassForSection.grade}`, newClassName, 'Academic');
    setIsCreateSectionOpen(false);
  };

  // Delete / Archive class
  const handleDeleteClassConfirm = () => {
    if (!deleteConfirmClass) return;
    const enrolledCount = state.students.filter((s) => s.class === deleteConfirmClass.name).length;
    if (enrolledCount > 0) {
      addToast(
        'Cannot Delete Populated Class',
        `Class ${deleteConfirmClass.name} has ${enrolledCount} enrolled students. Reassign students first.`,
        'error'
      );
      setDeleteConfirmClass(null);
      return;
    }

    deleteClass(deleteConfirmClass.id);
    logAuditEvent(`Archived Class ${deleteConfirmClass.name}`, deleteConfirmClass.name, 'Academic');
    setDeleteConfirmClass(null);
  };

  // Related data for Class Detail Modal
  const detailEnrolledStudents = useMemo(() => {
    if (!selectedClassDetail) return [];
    return state.students.filter((s) => s.class === selectedClassDetail.name);
  }, [state.students, selectedClassDetail]);

  const detailSubjectAllocations = useMemo(() => {
    if (!selectedClassDetail) return [];
    return (state.subjectAllocations || []).filter(
      (sa) => sa.className === selectedClassDetail.name || sa.classId === selectedClassDetail.id
    );
  }, [state.subjectAllocations, selectedClassDetail]);

  const detailTimetableSlots = useMemo(() => {
    if (!selectedClassDetail) return [];
    return (state.timetable || []).filter((s) => s.class === selectedClassDetail.name);
  }, [state.timetable, selectedClassDetail]);

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Classes & Sections Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grade cohorts, section management, assigned faculty leads, and student capacity metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table
            </button>
          </div>

          <button
            onClick={openCreateClass}
            style={{ backgroundColor: currentTheme.primary }}
            className="flex items-center gap-1.5 px-3.5 py-2 hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-xs transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Create Class
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by class name, room number, or class teacher..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Grade:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="All">All Grades</option>
              {uniqueGrades.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Academic Year:</span>
            <select
              value={academicYearFilter}
              onChange={(e) => setAcademicYearFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="All">All Sessions</option>
              {state.academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} ({ay.code})
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || gradeFilter !== 'All' || academicYearFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setGradeFilter('All');
                setAcademicYearFilter('All');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: CARDS VIEW */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const enrolled = state.students.filter((s) => s.class === cls.name).length;
            const capacity = cls.capacity || 35;
            const occupancyPct = Math.round((enrolled / capacity) * 100);

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          Sec {cls.section}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {cls.roomNumber}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                        occupancyPct >= 100
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {enrolled} / {capacity}
                    </span>
                  </div>

                  {/* Occupancy bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          occupancyPct > 90 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata items */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Class Teacher:</span>
                      <span className="font-semibold text-slate-900">{cls.classTeacherName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Attendance Today:</span>
                      <span className="font-mono font-semibold text-emerald-600">
                        {cls.attendanceToday}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Average Score:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {cls.averageMarks}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedClassDetail(cls)}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Class Details
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openCreateSection(cls)}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                      title="Add Section to Grade"
                    >
                      + Section
                    </button>
                    <button
                      onClick={() => openEditClass(cls)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-50"
                      title="Edit Class"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmClass(cls)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                      title="Archive Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW MODE 2: TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Class & Section</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Class Teacher</th>
                  <th className="px-4 py-3 text-center">Enrolled / Cap</th>
                  <th className="px-4 py-3 text-center">Attendance</th>
                  <th className="px-4 py-3 text-center">Avg Marks</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.map((cls) => {
                  const enrolled = state.students.filter((s) => s.class === cls.name).length;
                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                        <span>{cls.name}</span>
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          Sec {cls.section}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{cls.roomNumber}</td>
                      <td className="px-4 py-3 text-slate-900 font-medium">{cls.classTeacherName}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-slate-800">
                        {enrolled} / {cls.capacity || 35}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600">
                        {cls.attendanceToday}%
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                        {cls.averageMarks}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedClassDetail(cls)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="View Class Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditClass(cls)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmClass(cls)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Archive"
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
        </div>
      )}

      {/* CLASS DETAIL MODAL / WORKSPACE */}
      {selectedClassDetail && (
        <Modal
          isOpen={!!selectedClassDetail}
          onClose={() => setSelectedClassDetail(null)}
          title={`${selectedClassDetail.name} Complete Academic Profile`}
          subtitle="Enrolled students, assigned subjects, teacher allocations, and weekly timetable overview."
        >
          <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Class Lead</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">
                  {selectedClassDetail.classTeacherName}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Assigned Room</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {selectedClassDetail.roomNumber}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Student Enrollment</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                  {detailEnrolledStudents.length} / {selectedClassDetail.capacity || 35}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Today's Attendance</span>
                <span className="font-mono font-bold text-emerald-600 text-sm mt-0.5 block">
                  {selectedClassDetail.attendanceToday}%
                </span>
              </div>
            </div>

            {/* Allocated Subjects & Teachers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Allocated Subjects & Faculty ({detailSubjectAllocations.length})
                </h4>
              </div>

              {detailSubjectAllocations.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400">
                  No subjects allocated yet to this class.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {detailSubjectAllocations.map((sa) => (
                    <div
                      key={sa.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{sa.subjectName}</span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 rounded">
                            {sa.subjectCode}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Teacher: {sa.teacherName || 'Unassigned'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {sa.weeklyPeriods} periods/wk
                        </span>
                        {sa.roomNumber && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                            {sa.roomNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enrolled Students Roster */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Enrolled Students ({detailEnrolledStudents.length})
                </h4>
                <span className="text-[11px] text-slate-400">
                  Click any student to view complete profile & documents
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Roll</th>
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2">Admission ID</th>
                      <th className="px-3 py-2">Parent / Contact</th>
                      <th className="px-3 py-2 text-center">Attendance</th>
                      <th className="px-3 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailEnrolledStudents.map((std) => (
                      <tr
                        key={std.id}
                        onClick={() => onViewStudent && onViewStudent(std)}
                        className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                      >
                        <td className="px-3 py-2 font-mono font-bold text-slate-700">
                          #{std.rollNo}
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-900 hover:text-indigo-600">
                          {std.name}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-500">{std.admissionId}</td>
                        <td className="px-3 py-2 text-slate-600">
                          {std.parentName} ({std.parentPhone})
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-semibold text-emerald-600">
                          {std.attendanceRate}%
                        </td>
                        <td className="px-3 py-2 text-right">
                          <StatusBadge status={std.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timetable Link Action */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-indigo-950 text-xs">
                  Weekly Timetable for {selectedClassDetail.name}
                </h5>
                <p className="text-[11px] text-indigo-800 mt-0.5">
                  {detailTimetableSlots.length} periods configured across Monday through Friday.
                </p>
              </div>

              {onNavigateToTimetable && (
                <button
                  onClick={() => {
                    const cName = selectedClassDetail.name;
                    setSelectedClassDetail(null);
                    onNavigateToTimetable(cName);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
                >
                  Open in Timetable Editor →
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE CLASS MODAL */}
      {isCreateClassOpen && (
        <Modal
          isOpen={isCreateClassOpen}
          onClose={() => setIsCreateClassOpen(false)}
          title="Create New Academic Class"
          subtitle="Define cohort level, section designation, appointed teacher, and room allocation."
        >
          <form onSubmit={handleCreateClassSubmit} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Grade Level *</label>
                <input
                  type="text"
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="e.g. Grade 11, Grade 12"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Section Letter *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                  placeholder="e.g. A, B, C"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Class Teacher *</label>
                <select
                  value={formData.classTeacherId}
                  onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {state.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Room *</label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g. Room 304, Lab 2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Capacity</label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 35 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Year</label>
                <select
                  value={formData.academicYearId}
                  onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {state.academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} ({ay.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Cohort description, focus, or stream..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateClassOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.primary }}
                className="px-5 py-2 text-white rounded-lg font-semibold shadow-xs"
              >
                Create Class
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT CLASS MODAL */}
      {isEditClassOpen && selectedClassForEdit && (
        <Modal
          isOpen={isEditClassOpen}
          onClose={() => setIsEditClassOpen(false)}
          title={`Edit ${selectedClassForEdit.name}`}
          subtitle="Modify classroom lead, room allocation, or capacity."
        >
          <form onSubmit={handleEditClassSubmit} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Grade Level *</label>
                <input
                  type="text"
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Section Letter *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Class Teacher *</label>
                <select
                  value={formData.classTeacherId}
                  onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {state.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Room *</label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Capacity</label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 35 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Year</label>
                <select
                  value={formData.academicYearId}
                  onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {state.academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} ({ay.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditClassOpen(false)}
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

      {/* CREATE SECTION MODAL */}
      {isCreateSectionOpen && targetClassForSection && (
        <Modal
          isOpen={isCreateSectionOpen}
          onClose={() => setIsCreateSectionOpen(false)}
          title={`Add New Section to ${targetClassForSection.grade}`}
          subtitle="Expand the grade cohort with an additional section and designated room."
        >
          <form onSubmit={handleCreateSectionSubmit} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Parent Grade</label>
                <input
                  type="text"
                  disabled
                  value={targetClassForSection.grade}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Section Letter *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={sectionFormData.section}
                  onChange={(e) =>
                    setSectionFormData({ ...sectionFormData, section: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Class Teacher *</label>
                <select
                  value={sectionFormData.classTeacherId}
                  onChange={(e) =>
                    setSectionFormData({ ...sectionFormData, classTeacherId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {state.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Room *</label>
                <input
                  type="text"
                  required
                  value={sectionFormData.roomNumber}
                  onChange={(e) =>
                    setSectionFormData({ ...sectionFormData, roomNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Section Capacity</label>
              <input
                type="number"
                min={10}
                max={60}
                value={sectionFormData.capacity}
                onChange={(e) =>
                  setSectionFormData({
                    ...sectionFormData,
                    capacity: parseInt(e.target.value, 10) || 30,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateSectionOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.primary }}
                className="px-5 py-2 text-white rounded-lg font-semibold shadow-xs"
              >
                Create Section
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ARCHIVE / DELETE CONFIRMATION MODAL */}
      {deleteConfirmClass && (
        <Modal
          isOpen={!!deleteConfirmClass}
          onClose={() => setDeleteConfirmClass(null)}
          title={`Archive ${deleteConfirmClass.name}?`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to archive <strong>{deleteConfirmClass.name}</strong>?
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              Only classes with 0 enrolled students can be archived. Historical timetable entries and exam records for this cohort will be preserved in audit archives.
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmClass(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteClassConfirm}
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
