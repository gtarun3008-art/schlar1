import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Teacher, THEMES, TimetableSlot } from '../../types';
import { Modal } from '../common/Modal';
import {
  Users,
  Search,
  Clock,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  UserCheck,
  UserX,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';

interface TeacherWorkloadWorkspaceProps {
  onViewTeacherSchedule?: (teacherId: string) => void;
}

export const TeacherWorkloadWorkspace: React.FC<TeacherWorkloadWorkspaceProps> = ({
  onViewTeacherSchedule,
}) => {
  const { state, updateTeacher, saveTimetableSlot, addToast, logAuditEvent } = useApp();
  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Substitute modal state
  const [substituteModalData, setSubstituteModalData] = useState<{
    teacherOnLeave: Teacher;
    affectedSlots: TimetableSlot[];
  } | null>(null);

  const [selectedSubstituteTeacherId, setSelectedSubstituteTeacherId] = useState<string>('');
  const [selectedSlotToCover, setSelectedSlotToCover] = useState<string>('all');

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return state.teachers.filter((tch) => {
      const matchesSearch =
        tch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tch.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tch.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept =
        departmentFilter === 'All' ||
        tch.department === departmentFilter ||
        tch.roleTitle.toLowerCase().includes(departmentFilter.toLowerCase());

      const matchesStatus = statusFilter === 'All' || tch.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [state.teachers, searchQuery, departmentFilter, statusFilter]);

  // Teachers on leave
  const teachersOnLeave = useMemo(() => {
    return state.teachers.filter((t) => t.status === 'On Leave');
  }, [state.teachers]);

  // Calculate workload stats for each teacher
  const getTeacherStats = (teacherId: string) => {
    const assignedSlots = (state.timetable || []).filter((s) => s.teacherId === teacherId);
    const assignedPeriodsCount = assignedSlots.length;
    const contractualMax = 25; // standard 25 periods/week
    const loadPct = Math.round((assignedPeriodsCount / contractualMax) * 100);
    const freePrepPeriods = Math.max(0, 35 - assignedPeriodsCount);

    return {
      assignedPeriodsCount,
      contractualMax,
      loadPct,
      freePrepPeriods,
      assignedSlots,
    };
  };

  // Open substitute modal
  const handleOpenSubstituteModal = (teacher: Teacher) => {
    const affected = (state.timetable || []).filter((s) => s.teacherId === teacher.id);
    setSubstituteModalData({
      teacherOnLeave: teacher,
      affectedSlots: affected,
    });
    // Pick substitute teacher from same subject or STEM
    const candidate = state.teachers.find(
      (t) => t.id !== teacher.id && t.status === 'Active'
    );
    setSelectedSubstituteTeacherId(candidate?.id || '');
    setSelectedSlotToCover('all');
  };

  // Submit substitute assignment
  const handleApplySubstitute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!substituteModalData || !selectedSubstituteTeacherId) return;

    const subTeacher = state.teachers.find((t) => t.id === selectedSubstituteTeacherId);
    if (!subTeacher) return;

    const slotsToUpdate =
      selectedSlotToCover === 'all'
        ? substituteModalData.affectedSlots
        : substituteModalData.affectedSlots.filter((s) => s.id === selectedSlotToCover);

    slotsToUpdate.forEach((slot) => {
      saveTimetableSlot({
        ...slot,
        teacherId: subTeacher.id,
        teacherName: `${subTeacher.name} (Sub for ${substituteModalData.teacherOnLeave.name})`,
        notes: `Substitute covered during ${substituteModalData.teacherOnLeave.name}'s leave.`,
      });
    });

    logAuditEvent(
      `Assigned substitute ${subTeacher.name} for ${substituteModalData.teacherOnLeave.name} (${slotsToUpdate.length} periods)`,
      substituteModalData.teacherOnLeave.name,
      'Academic'
    );

    addToast(
      'Substitute Coverage Assigned',
      `${subTeacher.name} appointed to cover ${slotsToUpdate.length} lesson periods.`,
      'success'
    );
    setSubstituteModalData(null);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Teacher Workload & Availability Oversight
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Faculty period allocation, preparation balance, leave coverage, and substitute teacher assignments.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 font-semibold block">Total Faculty</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block font-mono">
              {state.teachers.length} Instructors
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 font-semibold block">Avg Workload</span>
            <span className="font-bold text-indigo-700 text-sm mt-0.5 block font-mono">
              21.5 hrs/wk
            </span>
          </div>
        </div>
      </div>

      {/* Leave Alert & Substitute Recommendation */}
      {teachersOnLeave.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-950 text-xs">
                  Active Faculty On Leave: {teachersOnLeave.map((t) => t.name).join(', ')}
                </h4>
                <p className="text-amber-800 text-xs mt-0.5">
                  Scheduled lessons require temporary substitute instructor coverage to avoid instructional gaps.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {teachersOnLeave.map((tch) => (
                <button
                  key={tch.id}
                  onClick={() => handleOpenSubstituteModal(tch)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  Assign Substitute for {tch.name} →
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teacher name, employee ID, or subject..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Workload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((tch) => {
          const stats = getTeacherStats(tch.id);

          return (
            <div
              key={tch.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{tch.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{tch.roleTitle}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      tch.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {tch.status}
                  </span>
                </div>

                {/* Subjects pill badges */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {tch.subjects.map((sub) => (
                    <span
                      key={sub}
                      className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                {/* Workload Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Weekly Teaching Load:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {stats.assignedPeriodsCount} / {stats.contractualMax} periods ({stats.loadPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stats.loadPct > 90
                          ? 'bg-amber-500'
                          : stats.loadPct > 70
                          ? 'bg-indigo-600'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(stats.loadPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Free Prep Periods:</span>
                    <span className="font-mono font-semibold text-emerald-600">
                      {stats.freePrepPeriods} periods/wk
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Classes:</span>
                    <span className="font-semibold text-slate-900">{tch.classes.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attendance Rate:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {tch.attendanceRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {onViewTeacherSchedule && (
                  <button
                    onClick={() => onViewTeacherSchedule(tch.id)}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    View Timetable →
                  </button>
                )}

                {tch.status === 'On Leave' && (
                  <button
                    onClick={() => handleOpenSubstituteModal(tch)}
                    className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-semibold hover:bg-amber-100 transition-colors"
                  >
                    Assign Sub
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUBSTITUTE APPOINTMENT MODAL */}
      {substituteModalData && (
        <Modal
          isOpen={!!substituteModalData}
          onClose={() => setSubstituteModalData(null)}
          title={`Assign Substitute for ${substituteModalData.teacherOnLeave.name}`}
          subtitle="Select replacement faculty to cover scheduled instructional lessons during leave."
        >
          <form onSubmit={handleApplySubstitute} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <span className="font-bold block">
                {substituteModalData.teacherOnLeave.name} has {substituteModalData.affectedSlots.length} active teaching lessons scheduled.
              </span>
              <span className="text-[11px] text-amber-800 mt-0.5 block">
                Classes affected: {Array.from(new Set(substituteModalData.affectedSlots.map((s) => s.class))).join(', ')}
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Appoint Substitute Teacher *
              </label>
              <select
                required
                value={selectedSubstituteTeacherId}
                onChange={(e) => setSelectedSubstituteTeacherId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {state.teachers
                  .filter((t) => t.id !== substituteModalData.teacherOnLeave.id && t.status === 'Active')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects.join(', ')}) · Load: {t.workloadHours} hrs
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Lessons to Cover
              </label>
              <select
                value={selectedSlotToCover}
                onChange={(e) => setSelectedSlotToCover(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="all">
                  All {substituteModalData.affectedSlots.length} Scheduled Lessons
                </option>
                {substituteModalData.affectedSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.class} · {s.day} {s.period} ({s.subject})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSubstituteModalData(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Confirm Substitute Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
