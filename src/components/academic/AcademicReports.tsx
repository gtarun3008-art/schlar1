import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart } from '../common/Charts';
import {
  FileText,
  Users,
  BookOpen,
  Building,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  Clock,
  Layers,
  GraduationCap,
} from 'lucide-react';

export const AcademicReports: React.FC = () => {
  const { state, addToast } = useApp();

  const classes = state.classes || [];
  const teachers = state.teachers || [];
  const subjects = state.subjects || [];
  const allocations = state.subjectAllocations || [];
  const timetable = state.timetable || [];
  const students = state.students || [];

  // Summary Metrics
  const totalClassesCount = classes.length;
  const totalStudentsCount = students.length;
  const totalAllocationsCount = allocations.length;
  const unassignedAllocationsCount = allocations.filter(
    (a) => !a.teacherId || a.teacherId === 'unassigned' || a.teacherName.toLowerCase().includes('unassigned')
  ).length;

  // Timetable fill rate across all classes (each class has 35 periods)
  const totalPossibleSlots = totalClassesCount * 35;
  const filledSlotsCount = timetable.length;
  const timetableFillRate = totalPossibleSlots > 0 ? Math.round((filledSlotsCount / totalPossibleSlots) * 100) : 0;

  // Conflict calculation
  const conflictCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < timetable.length; i++) {
      for (let j = i + 1; j < timetable.length; j++) {
        const s1 = timetable[i];
        const s2 = timetable[j];
        if (s1.day === s2.day && s1.periodNumber === s2.periodNumber) {
          if (s1.teacherId === s2.teacherId && s1.class !== s2.class) count++;
          else if (s1.room && s2.room && s1.room === s2.room && s1.class !== s2.class) count++;
          else if (s1.class === s2.class) count++;
        }
      }
    }
    return count;
  }, [timetable]);

  // Distinct rooms
  const rooms = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => set.add(c.roomNumber));
    timetable.forEach((t) => {
      if (t.room) set.add(t.room);
    });
    set.add('Science Lab A');
    set.add('Computer Lab');
    set.add('Library');
    return Array.from(set).sort();
  }, [classes, timetable]);

  // Teacher Workload Chart Data
  const teacherWorkloadChartData = useMemo(() => {
    return teachers.slice(0, 8).map((t) => {
      const scheduledPeriods = timetable.filter((s) => s.teacherId === t.id).length;
      return {
        label: t.name.split(' ')[1] || t.name,
        value: scheduledPeriods,
        displayValue: `${scheduledPeriods}p`,
      };
    });
  }, [teachers, timetable]);

  // Room Utilization Chart Data
  const roomUtilizationChartData = useMemo(() => {
    return rooms.slice(0, 6).map((r) => {
      const scheduledPeriods = timetable.filter((s) => s.room === r).length;
      const pct = Math.round((scheduledPeriods / 35) * 100);
      return {
        label: r.replace('Room ', 'R'),
        value: pct,
        displayValue: `${pct}%`,
      };
    });
  }, [rooms, timetable]);

  const handleExportFullReport = () => {
    const reportData = {
      institution: 'Greenfield International School',
      academicYear: state.activeAcademicYearId,
      timestamp: new Date().toISOString(),
      summary: {
        totalClasses: totalClassesCount,
        totalStudents: totalStudentsCount,
        timetableCompletionRate: `${timetableFillRate}%`,
        conflictsCount: conflictCount,
        unassignedAllocationsCount,
      },
      facultyWorkload: teachers.map((t) => ({
        name: t.name,
        employeeId: t.employeeId,
        scheduledPeriods: timetable.filter((s) => s.teacherId === t.id).length,
      })),
      roomUtilization: rooms.map((r) => ({
        room: r,
        bookedPeriods: timetable.filter((s) => s.room === r).length,
        occupancyRate: `${Math.round((timetable.filter((s) => s.room === r).length / 35) * 100)}%`,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Greenfield_Academic_Audit_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addToast('Report Exported', 'Full institutional audit JSON generated.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Academic Management Dashboards & Audit Reports
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Greenfield International School · Comprehensive instructional load, facility occupancy, and syllabus fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFullReport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Audit JSON
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Audit Dossier
            </button>
          </div>
        </div>

        {/* High-level KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Active Classes & Sections
            </span>
            <div className="mt-1 text-2xl font-bold text-slate-900 font-mono">
              {totalClassesCount} Cohorts
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {totalStudentsCount} enrolled students
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Timetable Completion
            </span>
            <div className="mt-1 text-2xl font-bold text-indigo-600 font-mono">
              {timetableFillRate}%
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {filledSlotsCount} of {totalPossibleSlots} periods populated
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Missing Teacher Allocations
            </span>
            <div className={`mt-1 text-2xl font-bold font-mono ${unassignedAllocationsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {unassignedAllocationsCount} Courses
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {unassignedAllocationsCount > 0 ? 'Action required in allocations' : '100% faculty allocated'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Timetable Clashes
            </span>
            <div className={`mt-1 text-2xl font-bold font-mono ${conflictCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {conflictCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {conflictCount === 0 ? 'Optimal master schedule' : 'Requires resolution'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Faculty Instructional Load</h3>
              <p className="text-xs text-slate-500">Scheduled weekly periods per teacher (Target: 18 - 22)</p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              Max Cap: 24p/wk
            </span>
          </div>

          <BarChart data={teacherWorkloadChartData} height={180} valueSuffix="p" />
        </div>

        {/* Room Utilization */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Facility & Room Utilization Rate</h3>
              <p className="text-xs text-slate-500">Occupancy rate over 35 weekly period slots</p>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              Standard: 75%
            </span>
          </div>

          <BarChart data={roomUtilizationChartData} height={180} valueSuffix="%" />
        </div>
      </div>

      {/* Subject Coverage & Allocation Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Subject Curriculum Coverage Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between required syllabus weekly periods and currently scheduled periods in the master timetable.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {allocations.length} Active Course Mappings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Class Cohort</th>
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3">Assigned Faculty</th>
                <th className="px-4 py-3 text-center">Required Periods</th>
                <th className="px-4 py-3 text-center">Scheduled Periods</th>
                <th className="px-4 py-3 text-center">Coverage Rate</th>
                <th className="px-5 py-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.map((alloc) => {
                const targetClass = alloc.class || alloc.className || '';
                const scheduled = timetable.filter(
                  (s) => s.class === targetClass && s.subject === alloc.subjectName
                ).length;
                const pct = Math.round((scheduled / alloc.weeklyPeriods) * 100);
                const isUnder = scheduled < alloc.weeklyPeriods;

                return (
                  <tr key={alloc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-900">{targetClass}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{alloc.subjectName}</td>
                    <td className="px-4 py-3 text-slate-700">{alloc.teacherName}</td>
                    <td className="px-4 py-3 text-center font-mono font-semibold text-slate-800">
                      {alloc.weeklyPeriods} / wk
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      <span className={isUnder ? 'text-amber-600' : 'text-emerald-600'}>
                        {scheduled}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-semibold">
                      {pct}%
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isUnder ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Needs {alloc.weeklyPeriods - scheduled} Slot{alloc.weeklyPeriods - scheduled > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Complete
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
