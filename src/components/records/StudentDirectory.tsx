import React, { useState, useMemo } from 'react';
import { Student, ClassRoom, RoleType, StudentLifecycleStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  Clock,
  ArrowUpDown,
  GraduationCap,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface StudentDirectoryProps {
  students: Student[];
  classes: ClassRoom[];
  currentRole: RoleType;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onLifecycleStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onAddStudent: () => void;
  forcedClassFilter?: string; // e.g. for Teacher who only views their assigned class
  title?: string;
  subtitle?: string;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  classes,
  currentRole,
  onViewStudent,
  onEditStudent,
  onLifecycleStudent,
  onDeleteStudent,
  onAddStudent,
  forcedClassFilter,
  title = 'Student Directory & Records',
  subtitle = 'Institutional student rosters, enrollment lifecycles, guardian details and academic standings.',
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState(forcedClassFilter || 'All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [academicFilter, setAcademicFilter] = useState('All');

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'admissionId' | 'rollNo' | 'attendanceRate' | 'class'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Permissions
  const canAdd = currentRole === 'principal' || currentRole === 'receptionist';
  const canEdit = currentRole === 'principal';
  const canDelete = currentRole === 'principal';
  const canViewContacts = currentRole === 'principal' || currentRole === 'receptionist' || currentRole === 'teacher';

  // Filter & Search Logic
  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        std.name.toLowerCase().includes(q) ||
        std.admissionId.toLowerCase().includes(q) ||
        (std.parentName && std.parentName.toLowerCase().includes(q)) ||
        (std.rollNo && std.rollNo.includes(q));

      const matchesClass =
        forcedClassFilter ? std.class === forcedClassFilter : classFilter === 'All' || std.class === classFilter;
      const matchesSection = sectionFilter === 'All' || std.section === sectionFilter;
      const matchesStatus = statusFilter === 'All' || std.status === statusFilter;
      const matchesAcademic = academicFilter === 'All' || std.academicStatus === academicFilter;

      return matchesSearch && matchesClass && matchesSection && matchesStatus && matchesAcademic;
    });
  }, [students, searchTerm, classFilter, sectionFilter, statusFilter, academicFilter, forcedClassFilter]);

  // Sorted list
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'admissionId') {
        comparison = a.admissionId.localeCompare(b.admissionId);
      } else if (sortBy === 'rollNo') {
        comparison = (parseInt(a.rollNo, 10) || 0) - (parseInt(b.rollNo, 10) || 0);
      } else if (sortBy === 'attendanceRate') {
        comparison = a.attendanceRate - b.attendanceRate;
      } else if (sortBy === 'class') {
        comparison = a.class.localeCompare(b.class);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredStudents, sortBy, sortOrder]);

  // Paginated records
  const totalPages = Math.ceil(sortedStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStudents.slice(start, start + pageSize);
  }, [sortedStudents, currentPage, pageSize]);

  const handleSortToggle = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Admission ID',
      'Student Name',
      'Class',
      'Section',
      'Roll Number',
      'Attendance Rate',
      'Academic Status',
      'Lifecycle Status',
      'Guardian Name',
      'Guardian Phone',
      'Address',
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.admissionId}"`,
      `"${s.name}"`,
      `"${s.class}"`,
      `"${s.section}"`,
      `"${s.rollNo}"`,
      `"${s.attendanceRate}%"`,
      `"${s.academicStatus}"`,
      `"${s.status}"`,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`,
      `"${s.address}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greenfield_students_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    if (!forcedClassFilter) setClassFilter('All');
    setSectionFilter('All');
    setStatusFilter('All');
    setAcademicFilter('All');
    setCurrentPage(1);
  };

  // Summary Metrics
  const activeCount = students.filter((s) => s.status === 'Active').length;
  const admittedCount = students.filter((s) => s.status === 'Admitted').length;
  const avgAttendance = (
    students.reduce((acc, s) => acc + s.attendanceRate, 0) / (students.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Directory Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
              title="Export filtered directory to CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {canAdd && (
              <button
                onClick={onAddStudent}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            )}
          </div>
        </div>

        {/* Operational Stat Counters */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Master Records</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">{students.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
            <span className="text-[10px] text-emerald-700 block font-semibold uppercase">Actively Enrolled</span>
            <span className="text-base font-bold font-mono text-emerald-800 mt-0.5 block">{activeCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-50/50 border border-cyan-200/60">
            <span className="text-[10px] text-cyan-700 block font-semibold uppercase">New Admissions</span>
            <span className="text-base font-bold font-mono text-cyan-800 mt-0.5 block">{admittedCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200/60">
            <span className="text-[10px] text-indigo-700 block font-semibold uppercase">Average Attendance</span>
            <span className="text-base font-bold font-mono text-indigo-800 mt-0.5 block">{avgAttendance}%</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, admission ID, roll #, parent..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Class Filter */}
          {!forcedClassFilter && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Class:</span>
              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Cohorts ({students.length})</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Sec:</span>
            <select
              value={sectionFilter}
              onChange={(e) => {
                setSectionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          {/* Lifecycle Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Lifecycle:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Admitted">Admitted</option>
              <option value="Enquiry">Enquiry</option>
              <option value="Promoted">Promoted</option>
              <option value="Transferred">Transferred</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Academic Standing Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Standing:</span>
            <select
              value={academicFilter}
              onChange={(e) => {
                setAcademicFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Standings</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Needs Attention">Needs Attention</option>
            </select>
          </div>

          {(searchTerm || classFilter !== 'All' || sectionFilter !== 'All' || statusFilter !== 'All' || academicFilter !== 'All') && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-500 font-mono tabular-nums">
            Showing {filteredStudents.length} of {students.length} records
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => handleSortToggle('admissionId')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Admission ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('name')}
                  className="px-5 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('class')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Class & Section</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('attendanceRate')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Attendance Rate</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Academic Standing</th>
                <th className="px-4 py-3">Guardian Contact</th>
                <th className="px-4 py-3">Lifecycle Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-slate-700">No matching student records found</span>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search query, class cohort, or status filters.
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="mt-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-indigo-600 hover:bg-slate-50"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-3.5 font-mono text-indigo-700 font-semibold">{std.admissionId}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {std.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold block text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {std.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Roll #{std.rollNo} · {std.academicYear || '2025-2026'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-800 text-[11px]">
                        {std.class}
                      </span>
                      <span className="ml-1 text-slate-400">({std.section})</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-800 tabular-nums">
                          {std.attendanceRate}%
                        </span>
                        <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              std.attendanceRate >= 90
                                ? 'bg-emerald-500'
                                : std.attendanceRate >= 75
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${std.attendanceRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={std.academicStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {canViewContacts ? (
                        <div>
                          <span className="block font-medium text-slate-800">{std.parentName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{std.parentPhone}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Protected</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={std.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onViewStudent(std)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Complete Student Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onEditStudent(std)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Student Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {canEdit && (
                          <button
                            onClick={() => onLifecycleStudent(std)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Promote, Transfer or Withdraw"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => onDeleteStudent(std)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Archive / Remove Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counts */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Showing {sortedStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedStudents.length)} of {sortedStudents.length} entries
            </span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded border border-slate-200 text-xs bg-white font-mono"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 font-mono text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
