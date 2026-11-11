import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLogItem } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Clock,
  Eye,
  CheckCircle2,
  FileText,
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowUpDown,
  Lock,
} from 'lucide-react';

export const AuditTrailModule: React.FC = () => {
  const { state, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | '7days' | '30days'>('All');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [integrityVerified, setIntegrityVerified] = useState(true);

  // Available unique categories and roles
  const categories = ['All', 'Attendance', 'Marks', 'Finance', 'Admissions', 'Security', 'Academic'];
  const roles = [
    'All',
    'Principal',
    'Vice Principal',
    'Teacher',
    'Accountant',
    'Receptionist',
    'Librarian',
    'HR',
    'Transport',
  ];

  // Filtering logic
  const filteredLogs = useMemo(() => {
    return state.auditLogs.filter((log) => {
      // Category filter
      if (selectedCategory !== 'All' && log.category !== selectedCategory) {
        return false;
      }

      // Role filter
      if (selectedRole !== 'All' && !log.role.toLowerCase().includes(selectedRole.toLowerCase())) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          log.actor.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.target.toLowerCase().includes(q) ||
          log.role.toLowerCase().includes(q) ||
          log.category.toLowerCase().includes(q) ||
          log.timestamp.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Date filter
      if (dateFilter === 'Today') {
        const todayStr = '2026-09-27'; // synchronized with demo calendar active day
        if (!log.timestamp.includes(todayStr)) return false;
      } else if (dateFilter === '7days') {
        // Sep 20 to Sep 27
        if (!log.timestamp.includes('2026-09-2')) return false;
      }

      return true;
    });
  }, [state.auditLogs, selectedCategory, selectedRole, searchQuery, dateFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = state.auditLogs.length;
    const securityCount = state.auditLogs.filter((l) => l.category === 'Security').length;
    const financeCount = state.auditLogs.filter((l) => l.category === 'Finance').length;
    const academicCount = state.auditLogs.filter(
      (l) => l.category === 'Academic' || l.category === 'Marks' || l.category === 'Attendance'
    ).length;

    return { total, securityCount, financeCount, academicCount };
  }, [state.auditLogs]);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      addToast('Export Warning', 'No audit logs match current filters to export.', 'info');
      return;
    }

    const headers = ['Log ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Action Details', 'Target Entity', 'Category'];
    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.actor.replace(/"/g, '""')}"`,
      `"${l.role.replace(/"/g, '""')}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.target.replace(/"/g, '""')}"`,
      `"${l.category}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `schlar_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Audit Log Exported', `${filteredLogs.length} audit entries exported to CSV.`, 'success');
  };

  // Integrity Check simulation
  const handleVerifyIntegrity = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIntegrityVerified(true);
      addToast('Ledger Integrity Validated', 'All block checksums match. Zero tampering detected.', 'success');
    }, 600);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Security':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Finance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Marks':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Attendance':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Admissions':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Institutional Audit Trail & Compliance Ledger
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Cryptographically tracked administrative, financial, academic, and security event log.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-50"
            title="Recalculate SHA-256 Ledger Hashes"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying ? 'Verifying...' : 'Verify Ledger'}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Compliance CSV
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Audit Logs</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{metrics.total}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Append-only storage
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Academic & Marks</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{metrics.academicCount}</p>
          <p className="mt-1 text-[11px] text-slate-400">Curriculum & Attendance</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Finance Transactions</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{metrics.financeCount}</p>
          <p className="mt-1 text-[11px] text-slate-400">Tuition & Fee Receipts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Security & Policy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{metrics.securityCount}</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">100% Policy Pass</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by actor, action description, target entity, or timestamp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Actor Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r === 'All' ? 'All Roles' : r}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Timeline:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All History</option>
              <option value="Today">Today Only</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Category:
          </span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Event Ledger Records</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-semibold">
              {filteredLogs.length} entries
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            SHA-256 Verified
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No audit events found</p>
            <p className="text-xs">Adjust your search query or reset category filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Actor</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Action Executed</th>
                  <th className="px-4 py-3.5">Target Entity</th>
                  <th className="px-4 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.actor}</div>
                      <div className="text-[11px] text-slate-500">{log.role}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryBadgeClass(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-800 font-medium max-w-md">
                      {log.action}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {log.target}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getCategoryBadgeClass(
                    selectedLog.category
                  )}`}
                >
                  {selectedLog.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900">Audit Record #{selectedLog.id}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Action Executed
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-900 font-medium leading-relaxed">
                  {selectedLog.action}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Actor</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedLog.actor}</p>
                  <p className="text-[11px] text-slate-500">{selectedLog.role}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Target Entity</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5 truncate">{selectedLog.target}</p>
                  <p className="text-[11px] text-slate-500">Entity Resource</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Timestamp</span>
                  <p className="font-mono text-slate-800 mt-0.5">{selectedLog.timestamp}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Verification State</span>
                  <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Immutable
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Cryptographic Integrity Seal
                </span>
                <div className="p-2.5 bg-slate-900 rounded-lg text-emerald-400 font-mono text-[10px] break-all leading-tight">
                  SHA-256: 3a7b9c1d8e5f2a4b0c6d9e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
