import React, { useState, useMemo } from 'react';
import { StaffMember, RoleType } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  Briefcase,
  ArrowUpDown,
  Building,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface StaffDirectoryProps {
  staff: StaffMember[];
  currentRole: RoleType;
  onViewStaff: (staff: StaffMember) => void;
  onEditStaff: (staff: StaffMember) => void;
  onDeleteStaff: (staff: StaffMember) => void;
  onAddStaff: () => void;
  title?: string;
  subtitle?: string;
}

export const StaffDirectory: React.FC<StaffDirectoryProps> = ({
  staff,
  currentRole,
  onViewStaff,
  onEditStaff,
  onDeleteStaff,
  onAddStaff,
  title = 'General Staff Directory',
  subtitle = 'Institutional administration, finance, front-office, library, IT systems and operational support personnel.',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [sortBy, setSortBy] = useState<'name' | 'employeeId' | 'department' | 'joiningDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const canAdd = currentRole === 'principal';
  const canEdit = currentRole === 'principal';
  const canDelete = currentRole === 'principal';

  const departments = useMemo(() => {
    const set = new Set<string>();
    staff.forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set).sort();
  }, [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.employeeId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);

      const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [staff, searchTerm, departmentFilter, statusFilter]);

  const sortedStaff = useMemo(() => {
    return [...filteredStaff].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'employeeId') {
        comparison = a.employeeId.localeCompare(b.employeeId);
      } else if (sortBy === 'department') {
        comparison = a.department.localeCompare(b.department);
      } else if (sortBy === 'joiningDate') {
        comparison = a.joiningDate.localeCompare(b.joiningDate);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredStaff, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedStaff.length / pageSize) || 1;
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStaff.slice(start, start + pageSize);
  }, [sortedStaff, currentPage, pageSize]);

  const handleSortToggle = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Role / Designation',
      'Department',
      'Employment Type',
      'Joining Date',
      'Attendance Rate',
      'Status',
      'Email',
      'Phone',
    ];

    const rows = filteredStaff.map((s) => [
      `"${s.employeeId}"`,
      `"${s.name}"`,
      `"${s.role}"`,
      `"${s.department}"`,
      `"${s.employmentType || 'Full-time'}"`,
      `"${s.joiningDate}"`,
      `"${s.attendanceRate}%"`,
      `"${s.status}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greenfield_general_staff_roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Roster</span>
            </button>

            {canAdd && (
              <button
                onClick={onAddStaff}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Register Staff Member</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name, employee ID, role or department..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Probation">Probation</option>
            </select>
          </div>

          {(searchTerm || departmentFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={clearFilters}
              className="text-xs text-teal-600 hover:text-teal-800 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-500 font-mono tabular-nums">
            Showing {filteredStaff.length} of {staff.length} staff records
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => handleSortToggle('employeeId')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Employee ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('name')}
                  className="px-5 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Staff Member</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Designation / Role</th>
                <th
                  onClick={() => handleSortToggle('department')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Department</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('joiningDate')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Joining Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-slate-700">No staff members match the selected criteria</span>
                      <button
                        onClick={clearFilters}
                        className="mt-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-teal-600 hover:bg-slate-50"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((stf) => (
                  <tr key={stf.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-3.5 font-mono text-teal-700 font-semibold">{stf.employeeId}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {stf.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold block text-slate-900 group-hover:text-teal-600 transition-colors">
                            {stf.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{stf.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{stf.role}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                        {stf.department}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{stf.joiningDate}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-800 font-medium">{stf.attendanceRate}%</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={stf.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onViewStaff(stf)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Staff Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onEditStaff(stf)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => onDeleteStaff(stf)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Staff Record"
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

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Showing {sortedStaff.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedStaff.length)} of {sortedStaff.length} entries
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
