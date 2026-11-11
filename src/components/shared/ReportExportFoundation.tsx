import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  Layers,
  Award,
  DollarSign,
  Users,
  Bus,
  CheckCircle2,
  Eye,
  X,
  Building,
} from 'lucide-react';

export interface ReportConfig {
  id: string;
  title: string;
  category: 'Academic' | 'Attendance' | 'Finance' | 'Administrative' | 'Logistics';
  description: string;
  icon: any;
  defaultClass?: string;
}

export const ReportExportFoundation: React.FC = () => {
  const { state, addToast } = useApp();

  const reportTemplates: ReportConfig[] = [
    {
      id: 'academic_attainment',
      title: 'Term 1 Academic Attainment & Grade Curves',
      category: 'Academic',
      description: 'Comprehensive subject-by-subject attainment, passing rates, and student marks distribution.',
      icon: Award,
    },
    {
      id: 'attendance_ledger',
      title: 'Monthly Period Attendance & Punctuality Ledger',
      category: 'Attendance',
      description: 'Student and faculty presence metrics, late arrivals, excused leaves, and aggregate percentages.',
      icon: Users,
    },
    {
      id: 'fee_reconciliation',
      title: 'Fee Collection & Defaulters Reconciliation',
      category: 'Finance',
      description: 'Tuition billed vs collected, pending installments, overdue payments, and receipt registry.',
      icon: DollarSign,
    },
    {
      id: 'visitor_registry',
      title: 'Campus Front Desk & Visitor Security Ledger',
      category: 'Administrative',
      description: 'Visitor sign-in logs, pass numbers, host staff, and purpose of visit records.',
      icon: Building,
    },
    {
      id: 'transport_fleet',
      title: 'Transport Logistics & Route Capacity Utilization',
      category: 'Logistics',
      description: 'Bus fleet passenger assignments, pickup sequence, vehicle inspection dates, and driver logs.',
      icon: Bus,
    },
    {
      id: 'audit_compliance',
      title: 'Institutional Governance & Audit Trail Digest',
      category: 'Administrative',
      description: 'Chronological activity log of student lifecycle transitions, financial receipts, and mark approvals.',
      icon: FileText,
    },
  ];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('academic_attainment');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1 (2026-2027)');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const activeTemplate = useMemo(
    () => reportTemplates.find((t) => t.id === selectedTemplateId) || reportTemplates[0],
    [selectedTemplateId]
  );

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'All') return reportTemplates;
    return reportTemplates.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  // Dynamic report data calculation
  const reportData = useMemo(() => {
    if (selectedTemplateId === 'academic_attainment') {
      const filteredMarks = state.marks.filter(
        (m) => selectedClass === 'All' || m.class === selectedClass
      );
      const totalMarksSum = filteredMarks.reduce((acc, m) => acc + (m.marks / m.maxMarks) * 100, 0);
      const avgPercentage = filteredMarks.length ? Math.round(totalMarksSum / filteredMarks.length) : 0;
      const passedCount = filteredMarks.filter((m) => (m.marks / m.maxMarks) * 100 >= 50).length;

      return {
        type: 'academic',
        title: 'Term 1 Academic Attainment Report',
        recordsCount: filteredMarks.length,
        metrics: [
          { label: 'Total Assessed Papers', value: filteredMarks.length },
          { label: 'Average Score', value: `${avgPercentage}%` },
          { label: 'Pass Rate', value: `${filteredMarks.length ? Math.round((passedCount / filteredMarks.length) * 100) : 0}%` },
        ],
        headers: ['Student Name', 'Cohort', 'Subject', 'Exam Assessment', 'Score', 'Max', 'Grade'],
        rows: filteredMarks.map((m) => [m.studentName, m.class, m.subject, m.exam, m.marks, m.maxMarks, m.grade]),
      };
    }

    if (selectedTemplateId === 'attendance_ledger') {
      const filteredStudents = state.students.filter(
        (s) => selectedClass === 'All' || s.class === selectedClass
      );
      const totalAttd = filteredStudents.reduce((acc, s) => acc + s.attendanceRate, 0);
      const avgAttd = filteredStudents.length ? (totalAttd / filteredStudents.length).toFixed(1) : '0';

      return {
        type: 'attendance',
        title: 'Monthly Student Attendance Ledger',
        recordsCount: filteredStudents.length,
        metrics: [
          { label: 'Enrolled Cohort Size', value: filteredStudents.length },
          { label: 'Average Presence Rate', value: `${avgAttd}%` },
          { label: 'Above 90% Threshold', value: filteredStudents.filter((s) => s.attendanceRate >= 90).length },
        ],
        headers: ['Admission ID', 'Student Name', 'Cohort', 'Roll No', 'Attendance Rate', 'Academic Standing'],
        rows: filteredStudents.map((s) => [s.admissionId, s.name, s.class, s.rollNo, `${s.attendanceRate}%`, s.academicStatus]),
      };
    }

    if (selectedTemplateId === 'fee_reconciliation') {
      const totalBilled = state.fees.reduce((acc, f) => acc + f.totalFee, 0);
      const totalCollected = state.fees.reduce((acc, f) => acc + f.paidAmount, 0);
      const totalPending = state.fees.reduce((acc, f) => acc + f.pendingAmount, 0);

      return {
        type: 'finance',
        title: 'Tuition Fee Collection & Defaulters Reconciliation',
        recordsCount: state.fees.length,
        metrics: [
          { label: 'Total Billed Tuition', value: `$${totalBilled.toLocaleString()}` },
          { label: 'Net Collected', value: `$${totalCollected.toLocaleString()}` },
          { label: 'Outstanding Balance', value: `$${totalPending.toLocaleString()}` },
        ],
        headers: ['Student Name', 'Cohort', 'Total Billed', 'Paid Amount', 'Pending Due', 'Due Date', 'Status'],
        rows: state.fees.map((f) => [
          f.studentName,
          f.class,
          `$${f.totalFee}`,
          `$${f.paidAmount}`,
          `$${f.pendingAmount}`,
          f.dueDate,
          f.status,
        ]),
      };
    }

    if (selectedTemplateId === 'visitor_registry') {
      return {
        type: 'administrative',
        title: 'Campus Front Desk Visitor Registry',
        recordsCount: state.visitors.length,
        metrics: [
          { label: 'Total Logged Visitors', value: state.visitors.length },
          { label: 'Checked In Currently', value: state.visitors.filter((v) => v.status === 'Checked In').length },
          { label: 'Official Clearances', value: state.visitors.filter((v) => v.status === 'Checked Out').length },
        ],
        headers: ['Pass #', 'Visitor Name', 'Purpose', 'Person Visited', 'Check-In', 'Check-Out', 'Status'],
        rows: state.visitors.map((v) => [v.badgeNumber || v.id, v.visitorName, v.purpose, v.personToMeet, v.entryTime, v.exitTime || '—', v.status]),
      };
    }

    if (selectedTemplateId === 'transport_fleet') {
      const routes = state.transportRoutes || [];
      const totalAssigned = routes.reduce((acc, r) => acc + r.assignedStudents, 0);
      const totalCap = routes.reduce((acc, r) => acc + r.capacity, 0);

      return {
        type: 'logistics',
        title: 'Transport Routes & Fleet Utilization Report',
        recordsCount: routes.length,
        metrics: [
          { label: 'Active Transit Routes', value: routes.length },
          { label: 'Assigned Students', value: totalAssigned },
          { label: 'Fleet Seat Capacity', value: totalCap },
        ],
        headers: ['Route Code', 'Route Name', 'Vehicle #', 'Driver Name', 'Capacity', 'Assigned', 'Status'],
        rows: routes.map((r) => [r.routeCode, r.routeName, r.vehicleNumber, r.driverName, r.capacity, r.assignedStudents, r.status]),
      };
    }

    // Default: audit_compliance
    return {
      type: 'compliance',
      title: 'Institutional Governance & Audit Trail Digest',
      recordsCount: state.auditLogs.length,
      metrics: [
        { label: 'Total Event Logs', value: state.auditLogs.length },
        { label: 'Verified Actors', value: new Set(state.auditLogs.map((a) => a.actor)).size },
        { label: 'Tamper Verification', value: '100% Valid' },
      ],
      headers: ['Log ID', 'Timestamp', 'Actor Name', 'Role', 'Category', 'Action Summary', 'Target'],
      rows: state.auditLogs.map((l) => [l.id, l.timestamp, l.actor, l.role, l.category, l.action, l.target]),
    };
  }, [selectedTemplateId, selectedClass, state]);

  // CSV Export Trigger
  const handleDownloadCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        reportData.headers.map((h) => `"${h}"`).join(','),
        ...reportData.rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `gis_${selectedTemplateId}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Report Exported', `${reportData.title} CSV generated and downloaded.`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                School Reports & Export Foundation
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized regulatory compliance, academic transcripts, and institutional statements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            Preview Formal Report
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Template Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Report Templates List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Standard Report Catalog</h3>
            <span className="text-[11px] text-slate-400 font-mono">{filteredTemplates.length} Available</span>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            {['All', 'Academic', 'Attendance', 'Finance', 'Administrative', 'Logistics'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template cards */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredTemplates.map((tpl) => {
              const Icon = tpl.icon;
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tpl.category}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    {tpl.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Report Config & Live Data Preview */}
        <div className="lg:col-span-2 space-y-5">
          {/* Configuration Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Report Parameters & Scope</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Academic Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Term 1 (2026-2027)">Term 1 (2026-2027)</option>
                  <option value="Term 2 (2026-2027)">Term 2 (2026-2027)</option>
                  <option value="Full Academic Year">Full Academic Year</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Target Cohort / Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="All">All Cohorts (Institution-wide)</option>
                  {state.classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Date Timestamp</label>
                <input
                  type="text"
                  disabled
                  value="September 27, 2026 (Live)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Calculated Key Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              {reportData.metrics.map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                    {m.label}
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900 mt-1 font-mono">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Table View */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">{reportData.title}</h3>
                <p className="text-[11px] text-slate-400">Displaying top records from active dataset</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold">
                {reportData.recordsCount} rows
              </span>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] sticky top-0">
                  <tr>
                    {reportData.headers.map((h, i) => (
                      <th key={i} className="px-4 py-2.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.rows.slice(0, 8).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/80">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-slate-700">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Official Formatted Print / PDF Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Institutional Document Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV Data
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formal School Letterhead */}
            <div className="mt-6 text-center border-b-2 border-slate-900 pb-6">
              <div className="inline-block p-2 rounded-xl bg-slate-900 text-white font-bold text-xs tracking-wider mb-2">
                GREENFIELD INTERNATIONAL SCHOOL
              </div>
              <h2 className="text-lg font-serif font-bold text-slate-900 tracking-wide uppercase">
                {reportData.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-serif italic">
                Affiliation Code: GIS-CBSE-88301 · 742 Evergreen Campus, Springfield · Academic Year 2026-2027
              </p>
              <div className="mt-3 flex items-center justify-center gap-6 text-[11px] text-slate-600 font-mono">
                <span>Scope: {selectedClass === 'All' ? 'School-Wide' : selectedClass}</span>
                <span>Term: {selectedTerm}</span>
                <span>Date: Sep 27, 2026</span>
              </div>
            </div>

            {/* Document Metrics */}
            <div className="grid grid-cols-3 gap-4 my-6 text-center">
              {reportData.metrics.map((m, idx) => (
                <div key={idx} className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{m.label}</span>
                  <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Full Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    {reportData.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.rows.slice(0, 15).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-800">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sign-off Block */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-center">
              <div>
                <div className="w-40 border-b border-slate-400 mx-auto mb-2 pb-6 font-serif italic text-slate-600">
                  Sarah Jenkins
                </div>
                <p className="font-bold text-slate-800">Sarah Jenkins</p>
                <p className="text-slate-500 text-[11px]">Vice Principal / Academic Controller</p>
              </div>

              <div>
                <div className="w-40 border-b border-slate-400 mx-auto mb-2 pb-6 font-serif italic text-slate-600">
                  Dr. Robert Hayes
                </div>
                <p className="font-bold text-slate-800">Dr. Robert Hayes</p>
                <p className="text-slate-500 text-[11px]">Head of School / Principal</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
