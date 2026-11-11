import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { StudentFee, PaymentReceipt } from '../../../types';
import { MetricCard } from '../../common/MetricCard';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';
import { BarChart, DonutChart } from '../../common/Charts';
import {
  DollarSign,
  CreditCard,
  AlertTriangle,
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Printer,
  Download,
  Send,
  Building,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  Award,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  User,
  Shield,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface FeeStructureItem {
  id: string;
  name: string;
  class: string;
  academicYear: string;
  category: 'Tuition' | 'Lab & Tech' | 'Sports & Co-curricular' | 'Campus Transit' | 'Library';
  amount: number;
  termSchedule: string;
  dueDate: string;
  status: 'Active' | 'Archived';
}

interface ConcessionRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  category: 'Merit Scholarship' | 'Sibling Concession' | 'Need-based Assistance' | 'Staff Ward';
  amount: number;
  date: string;
  reason: string;
  approvedBy: string;
  status: 'Approved' | 'Pending Approval';
}

interface AdjustmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  type: 'Billing Correction' | 'Fee Waiver' | 'Refund' | 'Write-off';
  amount: number;
  date: string;
  reason: string;
  authorizedBy: string;
  status: 'Processed' | 'Under Review';
}

interface ExpenseRecord {
  id: string;
  category: 'Facility Maintenance' | 'Lab Reagents & Tech' | 'Campus Utilities' | 'Educational Supplies' | 'Sports Equipment' | 'Administrative';
  description: string;
  amount: number;
  date: string;
  referenceNumber: string;
  paidTo: string;
  status: 'Paid' | 'Approved';
}

export const AccountantView: React.FC = () => {
  const { state, recordPayment, updateFeeRecord, logAuditEvent, addToast } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');

  // Fee Structures Local State
  const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>([
    { id: 'fs-1', name: 'Grade 10 Senior Secondary Standard', class: 'Grade 10A', academicYear: '2026-2027', category: 'Tuition', amount: 5400, termSchedule: '2 Installments ($2,700 x 2)', dueDate: '2026-10-15', status: 'Active' },
    { id: 'fs-2', name: 'Grade 10 Senior Secondary Standard', class: 'Grade 10B', academicYear: '2026-2027', category: 'Tuition', amount: 5400, termSchedule: '2 Installments ($2,700 x 2)', dueDate: '2026-10-15', status: 'Active' },
    { id: 'fs-3', name: 'Grade 9 Middle Years Comprehensive', class: 'Grade 9A', academicYear: '2026-2027', category: 'Tuition', amount: 5100, termSchedule: '2 Installments ($2,550 x 2)', dueDate: '2026-10-15', status: 'Active' },
    { id: 'fs-4', name: 'Grade 8 Foundation Program', class: 'Grade 8A', academicYear: '2026-2027', category: 'Tuition', amount: 4800, termSchedule: '2 Installments ($2,400 x 2)', dueDate: '2026-10-15', status: 'Active' },
    { id: 'fs-5', name: 'Grade 7 Junior Secondary Program', class: 'Grade 7B', academicYear: '2026-2027', category: 'Tuition', amount: 4600, termSchedule: '2 Installments ($2,300 x 2)', dueDate: '2026-10-15', status: 'Active' },
    { id: 'fs-6', name: 'Grade 5 Elementary Foundation', class: 'Grade 5B', academicYear: '2026-2027', category: 'Tuition', amount: 4200, termSchedule: 'Annual Lump Sum', dueDate: '2026-10-15', status: 'Active' },
    { id: 'fs-7', name: 'STEM & Robotics Lab Fee', class: 'Grade 10A', academicYear: '2026-2027', category: 'Lab & Tech', amount: 600, termSchedule: 'Annual Session Fee', dueDate: '2026-09-30', status: 'Active' },
    { id: 'fs-8', name: 'Inter-School Athletics & Sports', class: 'Grade 8A', academicYear: '2026-2027', category: 'Sports & Co-curricular', amount: 400, termSchedule: 'Annual Fee', dueDate: '2026-09-30', status: 'Active' },
  ]);

  // Concessions State
  const [concessions, setConcessions] = useState<ConcessionRecord[]>([
    { id: 'conc-1', studentId: 'std-maya', studentName: 'Maya Lin', class: 'Grade 8A', category: 'Merit Scholarship', amount: 500, date: '2026-09-01', reason: 'Top 1% in National Mathematics Olympiad', approvedBy: 'Dr. Robert Hayes (Principal)', status: 'Approved' },
    { id: 'conc-2', studentId: 'std-ananya', studentName: 'Ananya Sharma', class: 'Grade 5B', category: 'Sibling Concession', amount: 300, date: '2026-09-05', reason: 'Sibling of Aarav Sharma (Grade 8A)', approvedBy: 'Edward Fletcher (Accountant)', status: 'Approved' },
  ]);

  // Adjustments State
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([
    { id: 'adj-1', studentId: 'std-kevin', studentName: 'Kevin Vance', class: 'Grade 10B', type: 'Billing Correction', amount: 200, date: '2026-09-12', reason: 'Double billing on transport locker component corrected', authorizedBy: 'Edward Fletcher', status: 'Processed' },
  ]);

  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([
    { id: 'exp-1', category: 'Lab Reagents & Tech', description: 'Consumables & optics for Senior Biology laboratory', amount: 2850, date: '2026-09-22', referenceNumber: 'INV-BIO-9921', paidTo: 'Apex Scientific Labs Ltd', status: 'Paid' },
    { id: 'exp-2', category: 'Facility Maintenance', description: 'Campus HVAC filter overhaul & classroom ventilation audit', amount: 4100, date: '2026-09-18', referenceNumber: 'INV-HVAC-104', paidTo: 'Metro Climate Solutions', status: 'Paid' },
    { id: 'exp-3', category: 'Educational Supplies', description: 'Curriculum workbooks and geometry drafting kits for Grades 7-10', amount: 1650, date: '2026-09-14', referenceNumber: 'INV-PUB-5510', paidTo: 'Oxford Educational Press', status: 'Paid' },
    { id: 'exp-4', category: 'Campus Utilities', description: 'Monthly high-speed optical fiber and campus electricity', amount: 3200, date: '2026-09-08', referenceNumber: 'UTIL-SEP-2026', paidTo: 'City Power & Telecom Grid', status: 'Paid' },
    { id: 'exp-5', category: 'Sports Equipment', description: 'Tournament basketballs, volleyball nets & athletic first aid packs', amount: 950, date: '2026-09-05', referenceNumber: 'INV-SPT-338', paidTo: 'Varsity Athletics Depot', status: 'Paid' },
  ]);

  // Modals State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(1200);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'UPI' | 'Card'>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('REF-88910');
  const [paymentRemarks, setPaymentRemarks] = useState('Tuition Installment');

  const [selectedFeeForEdit, setSelectedFeeForEdit] = useState<StudentFee | null>(null);
  const [isEditFeeModalOpen, setIsEditFeeModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [selectedStudentLedger, setSelectedStudentLedger] = useState<StudentFee | null>(null);
  const [isAddFeeStructureOpen, setIsAddFeeStructureOpen] = useState(false);
  const [isAddConcessionOpen, setIsAddConcessionOpen] = useState(false);
  const [isAddAdjustmentOpen, setIsAddAdjustmentOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [statementModalStudent, setStatementModalStudent] = useState<StudentFee | null>(null);

  // New Fee Structure Form
  const [newStructureForm, setNewStructureForm] = useState<Partial<FeeStructureItem>>({
    name: '',
    class: 'Grade 10A',
    academicYear: '2026-2027',
    category: 'Tuition',
    amount: 5000,
    termSchedule: '2 Installments',
    dueDate: '2026-10-15',
    status: 'Active',
  });

  // New Concession Form
  const [newConcessionForm, setNewConcessionForm] = useState({
    studentId: '',
    category: 'Merit Scholarship' as ConcessionRecord['category'],
    amount: 500,
    reason: '',
  });

  // New Adjustment Form
  const [newAdjustmentForm, setNewAdjustmentForm] = useState({
    studentId: '',
    type: 'Billing Correction' as AdjustmentRecord['type'],
    amount: 150,
    reason: '',
  });

  // New Expense Form
  const [newExpenseForm, setNewExpenseForm] = useState<Partial<ExpenseRecord>>({
    category: 'Educational Supplies',
    description: '',
    amount: 500,
    date: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    paidTo: '',
  });

  // Financial calculations
  const totalFees = state.fees.reduce((sum, f) => sum + f.totalFee, 0);
  const collected = state.fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const pending = state.fees.reduce((sum, f) => sum + f.pendingAmount, 0);
  const overdueFees = state.fees.filter((f) => {
    if (f.pendingAmount <= 0) return false;
    const due = new Date(f.dueDate).getTime();
    const now = new Date('2026-10-22').getTime();
    return due < now;
  });
  const overdueTotal = overdueFees.reduce((sum, f) => sum + f.pendingAmount, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const todayCollections = state.payments
    .filter((p) => p.date === '2026-10-22' || p.date === '2026-09-26')
    .reduce((sum, p) => sum + p.amount, 0);

  // Filtered fee records
  const filteredFees = state.fees.filter((f) => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = feeStatusFilter === 'All' || f.status === feeStatusFilter;
    const matchesClass = classFilter === 'All' || f.class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  // Open Payment helper
  const openPaymentForStudent = (studentId: string, defaultAmt: number) => {
    setSelectedStudentForPay(studentId);
    setPaymentAmount(defaultAmt > 0 ? defaultAmt : 1200);
    setReferenceNumber('TXN-' + Math.floor(100000 + Math.random() * 900000));
    setIsPaymentModalOpen(true);
  };

  // Submit Payment
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPay) {
      addToast('Validation', 'Please select an eligible student account.', 'error');
      return;
    }
    const studentAcc = state.fees.find((f) => f.studentId === selectedStudentForPay);
    if (!studentAcc) {
      addToast('Error', 'Student fee account not found.', 'error');
      return;
    }

    if (paymentAmount <= 0) {
      addToast('Validation', 'Payment amount must be greater than zero.', 'error');
      return;
    }

    const isExcess = paymentAmount > studentAcc.pendingAmount && studentAcc.pendingAmount > 0;
    const finalRemarks = isExcess && !paymentRemarks.includes('Advance Credit')
      ? `${paymentRemarks ? paymentRemarks + ' · ' : ''}Includes $${(paymentAmount - studentAcc.pendingAmount).toLocaleString()} advance fee credit`
      : paymentRemarks;

    const receiptRef = referenceNumber || 'REF-' + Date.now();
    recordPayment({
      studentId: selectedStudentForPay,
      amount: Number(paymentAmount),
      paymentMethod,
      referenceNumber: receiptRef,
      remarks: finalRemarks,
    });

    logAuditEvent(`Recorded Payment of $${paymentAmount} for ${studentAcc.studentName}`, studentAcc.studentName, 'Finance');
    setIsPaymentModalOpen(false);

    const student = state.students.find((s) => s.id === selectedStudentForPay);
    const newReceiptNum = 'REC-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
    setActiveReceipt({
      receiptNumber: newReceiptNum,
      studentName: student?.name || studentAcc.studentName,
      class: student?.class || studentAcc.class,
      amount: paymentAmount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceNumber: receiptRef,
      remainingBalance: Math.max(0, studentAcc.pendingAmount - paymentAmount),
    });

    addToast('Payment Recorded', `Payment of $${paymentAmount.toLocaleString()} posted. Receipt #${newReceiptNum} created.`, 'success');
  };

  // Submit Concession
  const handleAddConcessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = state.students.find((s) => s.id === newConcessionForm.studentId);
    if (!student) {
      addToast('Validation', 'Please select a student.', 'error');
      return;
    }
    if (newConcessionForm.amount <= 0) {
      addToast('Validation', 'Concession amount must be positive.', 'error');
      return;
    }

    const newConc: ConcessionRecord = {
      id: 'conc-' + Date.now(),
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      category: newConcessionForm.category,
      amount: Number(newConcessionForm.amount),
      date: new Date().toISOString().split('T')[0],
      reason: newConcessionForm.reason || 'Institutional concession approved',
      approvedBy: 'Edward Fletcher (Accountant)',
      status: 'Approved',
    };

    setConcessions([newConc, ...concessions]);

    // Update student fee balance
    const feeAcc = state.fees.find((f) => f.studentId === student.id);
    if (feeAcc) {
      const newTotal = Math.max(0, feeAcc.totalFee - newConc.amount);
      const newPending = Math.max(0, newTotal - feeAcc.paidAmount);
      updateFeeRecord({
        ...feeAcc,
        totalFee: newTotal,
        pendingAmount: newPending,
        status: newPending === 0 ? 'Paid' : 'Partially Paid',
      });
    }

    logAuditEvent(`Applied ${newConc.category} of $${newConc.amount} for ${student.name}`, student.name, 'Finance');
    setIsAddConcessionOpen(false);
    setNewConcessionForm({ studentId: '', category: 'Merit Scholarship', amount: 500, reason: '' });
    addToast('Concession Granted', `$${newConc.amount} concession credited to ${student.name}'s account.`, 'success');
  };

  // Submit Adjustment
  const handleAddAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = state.students.find((s) => s.id === newAdjustmentForm.studentId);
    if (!student) {
      addToast('Validation', 'Please select a student.', 'error');
      return;
    }
    if (newAdjustmentForm.amount <= 0) {
      addToast('Validation', 'Adjustment amount must be positive.', 'error');
      return;
    }

    const newAdj: AdjustmentRecord = {
      id: 'adj-' + Date.now(),
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      type: newAdjustmentForm.type,
      amount: Number(newAdjustmentForm.amount),
      date: new Date().toISOString().split('T')[0],
      reason: newAdjustmentForm.reason || 'Ledger adjustment entry',
      authorizedBy: 'Edward Fletcher (Accountant)',
      status: 'Processed',
    };

    setAdjustments([newAdj, ...adjustments]);
    logAuditEvent(`Financial Adjustment (${newAdj.type}) of $${newAdj.amount} for ${student.name}`, student.name, 'Finance');
    setIsAddAdjustmentOpen(false);
    setNewAdjustmentForm({ studentId: '', type: 'Billing Correction', amount: 150, reason: '' });
    addToast('Adjustment Posted', `Financial adjustment #${newAdj.id} recorded.`, 'success');
  };

  // Submit Expense
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseForm.description || !newExpenseForm.amount) {
      addToast('Validation', 'Please fill in description and amount.', 'error');
      return;
    }

    const newExp: ExpenseRecord = {
      id: 'exp-' + Date.now(),
      category: newExpenseForm.category || 'Educational Supplies',
      description: newExpenseForm.description,
      amount: Number(newExpenseForm.amount),
      date: newExpenseForm.date || new Date().toISOString().split('T')[0],
      referenceNumber: newExpenseForm.referenceNumber || 'INV-' + Math.floor(1000 + Math.random() * 9000),
      paidTo: newExpenseForm.paidTo || 'Authorized Vendor',
      status: 'Paid',
    };

    setExpenses([newExp, ...expenses]);
    logAuditEvent(`Recorded School Expense of $${newExp.amount} for ${newExp.category}`, newExp.description, 'Finance');
    setIsAddExpenseOpen(false);
    setNewExpenseForm({ category: 'Educational Supplies', description: '', amount: 500, date: new Date().toISOString().split('T')[0], referenceNumber: '', paidTo: '' });
    addToast('Expense Logged', `Operating disbursement of $${newExp.amount.toLocaleString()} logged.`, 'success');
  };

  // Submit Fee Structure
  const handleAddFeeStructureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStructureForm.name || !newStructureForm.amount) {
      addToast('Validation', 'Please fill in fee structure name and amount.', 'error');
      return;
    }

    const newStruct: FeeStructureItem = {
      id: 'fs-' + Date.now(),
      name: newStructureForm.name,
      class: newStructureForm.class || 'Grade 10A',
      academicYear: newStructureForm.academicYear || '2026-2027',
      category: newStructureForm.category || 'Tuition',
      amount: Number(newStructureForm.amount),
      termSchedule: newStructureForm.termSchedule || 'Annual Fee',
      dueDate: newStructureForm.dueDate || '2026-10-15',
      status: 'Active',
    };

    setFeeStructures([...feeStructures, newStruct]);
    logAuditEvent(`Added Fee Structure: ${newStruct.name} (${newStruct.class})`, newStruct.name, 'Finance');
    setIsAddFeeStructureOpen(false);
    setNewStructureForm({ name: '', class: 'Grade 10A', academicYear: '2026-2027', category: 'Tuition', amount: 5000, termSchedule: '2 Installments', dueDate: '2026-10-15', status: 'Active' });
    addToast('Fee Structure Saved', `Created schedule for ${newStruct.class}.`, 'success');
  };

  // Send Reminder Simulator
  const handleSendReminder = (studentName: string) => {
    addToast('Notice Dispatched', `Automated fee payment alert sent to registered parent of ${studentName}.`, 'info');
  };

  // Export CSV Helper
  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export Complete', `${filename} generated and downloaded.`, 'success');
  };

  /* -------------------------------------------------------------
     TAB 1: FINANCIAL DASHBOARD
  ------------------------------------------------------------- */
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-1">
            Accounts & Bursar Bureau
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            School Financial & Fee Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Edward Fletcher (Accountant / Fee Manager) · Greenfield International School
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              if (state.students.length > 0) {
                openPaymentForStudent(state.students[0].id, 1200);
              }
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record Fee Collection
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <TrendingDown className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Billed Fees"
          value={`$${totalFees.toLocaleString()}`}
          subtitle={`${state.fees.length} Enrolled Student Accounts`}
          icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="Total Fees Collected"
          value={`$${collected.toLocaleString()}`}
          subtitle={`${Math.round((collected / (totalFees || 1)) * 100)}% collection efficiency`}
          change={{ value: '+14% this month', isPositive: true }}
          icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Outstanding Receivables"
          value={`$${pending.toLocaleString()}`}
          subtitle={`${state.fees.filter((f) => f.pendingAmount > 0).length} accounts with balance`}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Overdue Dues"
          value={`$${overdueTotal.toLocaleString()}`}
          subtitle={`${overdueFees.length} accounts past deadline`}
          change={{ value: `${overdueFees.length} action required`, isPositive: false }}
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Today's Collections</span>
            <span className="text-xl font-bold font-mono text-emerald-700 mt-0.5 block">${todayCollections.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">Real-time ledger updates</span>
          </div>
          <CreditCard className="w-8 h-8 text-emerald-200" />
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">School Expenses (YTD)</span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">${totalExpensesAmount.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">{expenses.length} operating disbursements</span>
          </div>
          <TrendingDown className="w-8 h-8 text-rose-200" />
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Net Operating Cashflow</span>
            <span className="text-xl font-bold font-mono text-indigo-700 mt-0.5 block">${(collected - totalExpensesAmount).toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">Collections less expenses</span>
          </div>
          <TrendingUp className="w-8 h-8 text-indigo-200" />
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Fee Inflows</h3>
          <p className="text-xs text-slate-500 mb-4">Academic Year 2026-2027 collection volume</p>
          <BarChart
            data={[
              { label: 'May', value: 45000, color: 'bg-indigo-600' },
              { label: 'Jun', value: 85000, color: 'bg-emerald-600' },
              { label: 'Jul', value: 32000, color: 'bg-indigo-600' },
              { label: 'Aug', value: 28000, color: 'bg-indigo-600' },
              { label: 'Sep', value: 52000, color: 'bg-emerald-600' },
            ]}
            height={160}
            valueSuffix=""
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Collections by Payment Gateway</h3>
          <p className="text-xs text-slate-500 mb-4">Channel distribution</p>
          <DonutChart
            segments={[
              { label: 'Bank Transfer', value: 55, color: '#164E55' },
              { label: 'UPI / Mobile', value: 25, color: '#059669' },
              { label: 'Credit Card', value: 15, color: '#C47D54' },
              { label: 'Cash Desk', value: 5, color: '#94a3b8' },
            ]}
            size={160}
            centerLabel="Gateway"
            centerValue="100%"
          />
        </div>
      </div>

      {/* Recent Collections Journal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Collections Journal</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time payment logs and digital receipts.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Receipt #</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5">Reference ID</th>
                <th className="px-4 py-3.5 font-mono text-right">Amount</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.payments.slice(0, 5).map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{pay.studentName}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{pay.receiptNumber}</td>
                  <td className="px-4 py-3.5 text-slate-600">{pay.date}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{pay.paymentMethod}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">{pay.referenceNumber}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                    ${pay.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() =>
                        setActiveReceipt({
                          receiptNumber: pay.receiptNumber,
                          studentName: pay.studentName,
                          class: state.students.find((s) => s.id === pay.studentId)?.class || 'Grade 10',
                          amount: pay.amount,
                          date: pay.date,
                          paymentMethod: pay.paymentMethod,
                          referenceNumber: pay.referenceNumber,
                          remainingBalance: 0,
                        })
                      }
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 2: STUDENT FEE ACCOUNTS
  ------------------------------------------------------------- */
  const renderFees = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Student Fee Accounts Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive ledger of assessments, collections, and outstanding dues.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <select
              value={feeStatusFilter}
              onChange={(e) => setFeeStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
            >
              <option value="All">All Classes</option>
              {Array.from(new Set(state.fees.map((f) => f.class))).map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Cohort</th>
                <th className="px-4 py-3.5 font-mono text-right">Total Fee</th>
                <th className="px-4 py-3.5 font-mono text-right">Amount Paid</th>
                <th className="px-4 py-3.5 font-mono text-right">Pending Dues</th>
                <th className="px-4 py-3.5">Due Date</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No student fee accounts matching current query.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{fee.studentName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{fee.studentId}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{fee.class}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                      ${fee.totalFee.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-700">
                      ${fee.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-700">
                      ${fee.pendingAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{fee.dueDate}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={fee.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudentLedger(fee)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs"
                          title="View Full Ledger History"
                        >
                          Ledger
                        </button>
                        {fee.pendingAmount > 0 && (
                          <button
                            onClick={() => openPaymentForStudent(fee.studentId, fee.pendingAmount)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs shadow-2xs"
                          >
                            Collect
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedFeeForEdit(fee);
                            setIsEditFeeModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="Edit Assessment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 3: FEE STRUCTURE MANAGEMENT
  ------------------------------------------------------------- */
  const renderFeeStructure = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Annual Fee Schedules & Structures</h2>
          <p className="text-xs text-slate-500 mt-1">
            Governing approved fee slabs, laboratory levies, and installment structures for 2026-2027.
          </p>
        </div>
        <button
          onClick={() => setIsAddFeeStructureOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Fee Schedule
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Fee Schedule Name</th>
                <th className="px-4 py-3.5">Cohort</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 font-mono text-right">Fee Surcharge ($)</th>
                <th className="px-4 py-3.5">Installment Terms</th>
                <th className="px-4 py-3.5">Payment Deadline</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feeStructures.map((struct) => (
                <tr key={struct.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{struct.name}</td>
                  <td className="px-4 py-3.5 text-slate-700 font-medium">{struct.class}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-800 text-[10px]">
                      {struct.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                    ${struct.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{struct.termSchedule}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{struct.dueDate}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 text-[11px] border border-emerald-200">
                      {struct.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 4: FEE COLLECTION WORKFLOW
  ------------------------------------------------------------- */
  const renderCollections = () => (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Post Student Fee Collection</h2>
        <p className="text-xs text-slate-500 mt-1">
          Select student account, specify received amount, and generate official electronic receipt.
        </p>

        <form onSubmit={handleRecordPaymentSubmit} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Student Fee Account *</label>
            <select
              value={selectedStudentForPay}
              onChange={(e) => {
                const sid = e.target.value;
                setSelectedStudentForPay(sid);
                const st = state.fees.find((f) => f.studentId === sid);
                if (st) {
                  setPaymentAmount(st.pendingAmount > 0 ? st.pendingAmount : 1200);
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select Enrolled Student...</option>
              {state.fees.map((f) => (
                <option key={f.id} value={f.studentId}>
                  {f.studentName} ({f.class}) — Outstanding: ${f.pendingAmount.toLocaleString()} ({f.status})
                </option>
              ))}
            </select>
          </div>

          {selectedStudentForPay && (
            (() => {
              const currentFee = state.fees.find((f) => f.studentId === selectedStudentForPay);
              if (!currentFee) return null;
              return (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Assessed:</span>
                    <strong className="text-sm font-mono text-slate-900">${currentFee.totalFee.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Previously Paid:</span>
                    <strong className="text-sm font-mono text-emerald-700">${currentFee.paidAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Current Balance:</span>
                    <strong className="text-sm font-mono text-rose-700">${currentFee.pendingAmount.toLocaleString()}</strong>
                  </div>
                </div>
              );
            })()
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Amount Received ($) *</label>
              <input
                type="number"
                min={1}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Channel *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Bank Transfer">Bank Transfer / Wire</option>
                <option value="UPI">UPI / Instant Pay</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash">Cash at Front Counter</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reference / Transaction Number</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                placeholder="TXN-998822"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Remarks / Installment Description</label>
              <input
                type="text"
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                placeholder="Term 1 Tuition settlement"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Payment & Print Receipt (${paymentAmount.toLocaleString()})
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 5: OUTSTANDING DUES & AGING
  ------------------------------------------------------------- */
  const renderPendingFees = () => {
    const duesList = state.fees.filter((f) => f.pendingAmount > 0);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Outstanding Receivables & Due Notices</h2>
            <p className="text-xs text-slate-500 mt-1">
              {duesList.length} accounts with pending balance · Total uncollected: ${pending.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => {
              handleExportCSV(
                'outstanding_dues_report.csv',
                ['Student ID', 'Student Name', 'Class', 'Pending Amount', 'Due Date', 'Status'],
                duesList.map((f) => [f.studentId, f.studentName, f.class, f.pendingAmount, f.dueDate, f.status])
              );
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            Export Dues Roster (CSV)
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Student Account</th>
                  <th className="px-4 py-3.5">Cohort</th>
                  <th className="px-4 py-3.5 font-mono text-right">Outstanding Due</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Overdue Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {duesList.map((f) => {
                  const isOverdue = new Date(f.dueDate).getTime() < new Date('2026-10-22').getTime();
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{f.studentName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{f.studentId}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">{f.class}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-700 text-sm">
                        ${f.pendingAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{f.dueDate}</td>
                      <td className="px-4 py-3.5">
                        {isOverdue ? (
                          <span className="px-2 py-0.5 rounded font-bold bg-rose-50 text-rose-700 border border-rose-200 text-[10px]">
                            Overdue
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-semibold bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                            Upcoming
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setStatementModalStudent(f)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs"
                          >
                            Statement
                          </button>
                          <button
                            onClick={() => handleSendReminder(f.studentName)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md font-semibold text-xs border border-amber-200"
                          >
                            Send Alert
                          </button>
                          <button
                            onClick={() => openPaymentForStudent(f.studentId, f.pendingAmount)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs"
                          >
                            Collect
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
      </div>
    );
  };

  /* -------------------------------------------------------------
     TAB 6: PAYMENT HISTORY & TRANSACTIONS
  ------------------------------------------------------------- */
  const renderPaymentHistory = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payment Transactions Journal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete immutable ledger of all verified receipts ({state.payments.length} entries).
          </p>
        </div>
        <button
          onClick={() => {
            handleExportCSV(
              'payment_transactions_history.csv',
              ['Receipt #', 'Student ID', 'Student Name', 'Class', 'Amount', 'Date', 'Payment Method', 'Reference', 'Recorded By'],
              state.payments.map((p) => [p.receiptNumber, p.studentId, p.studentName, p.class, p.amount, p.date, p.paymentMethod, p.referenceNumber, p.recordedBy])
            );
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <Download className="w-4 h-4" />
          Export Transactions (CSV)
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Receipt #</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Cohort</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 font-mono text-right">Amount Paid</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5">Reference ID</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{p.receiptNumber}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{p.studentName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{p.class}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{p.date}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                    ${p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{p.paymentMethod}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">{p.referenceNumber}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() =>
                        setActiveReceipt({
                          receiptNumber: p.receiptNumber,
                          studentName: p.studentName,
                          class: p.class,
                          amount: p.amount,
                          date: p.date,
                          paymentMethod: p.paymentMethod,
                          referenceNumber: p.referenceNumber,
                          remainingBalance: 0,
                        })
                      }
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 7: CONCESSIONS & SCHOLARSHIPS
  ------------------------------------------------------------- */
  const renderConcessions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Scholarships & Fee Concessions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Governing approved merit scholarships, sibling discounts, and staff fee subsidies.
          </p>
        </div>
        <button
          onClick={() => setIsAddConcessionOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Grant Concession
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Class</th>
                <th className="px-4 py-3.5">Concession Type</th>
                <th className="px-4 py-3.5 font-mono text-right">Amount ($)</th>
                <th className="px-4 py-3.5">Justification & Notes</th>
                <th className="px-4 py-3.5">Approved By</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {concessions.map((conc) => (
                <tr key={conc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{conc.studentName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{conc.class}</td>
                  <td className="px-4 py-3.5 font-medium text-indigo-700">{conc.category}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                    ${conc.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{conc.reason}</td>
                  <td className="px-4 py-3.5 text-slate-500">{conc.approvedBy}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                      {conc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 8: REFUNDS & ADJUSTMENTS
  ------------------------------------------------------------- */
  const renderAdjustments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Refunds, Waivers & Ledger Adjustments</h2>
          <p className="text-xs text-slate-500 mt-1">
            Authorizing accounting reversals, write-offs, and duplicate fee corrections.
          </p>
        </div>
        <button
          onClick={() => setIsAddAdjustmentOpen(true)}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Record Adjustment
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Adjustment ID</th>
                <th className="px-4 py-3.5">Student Account</th>
                <th className="px-4 py-3.5">Adjustment Type</th>
                <th className="px-4 py-3.5 font-mono text-right">Adjustment Amount</th>
                <th className="px-4 py-3.5">Reason & Description</th>
                <th className="px-4 py-3.5">Authorized Officer</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-500">{adj.id}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{adj.studentName} ({adj.class})</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{adj.type}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-700 text-sm">
                    -${adj.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{adj.reason}</td>
                  <td className="px-4 py-3.5 text-slate-500">{adj.authorizedBy}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                      {adj.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 9: OPERATING EXPENSES
  ------------------------------------------------------------- */
  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Institutional Operating Expenses</h2>
          <p className="text-xs text-slate-500 mt-1">
            Audited disbursements for facilities, laboratories, campus utilities, and supplies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleExportCSV(
                'school_expenses_ledger.csv',
                ['Expense ID', 'Category', 'Description', 'Amount', 'Date', 'Reference', 'Paid To', 'Status'],
                expenses.map((e) => [e.id, e.category, e.description, e.amount, e.date, e.referenceNumber, e.paidTo, e.status])
              );
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            Export (CSV)
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5 font-mono text-right">Disbursed Amount</th>
                <th className="px-4 py-3.5">Payment Date</th>
                <th className="px-4 py-3.5">Invoice / Voucher #</th>
                <th className="px-4 py-3.5">Beneficiary / Vendor</th>
                <th className="px-4 py-3.5">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{exp.category}</td>
                  <td className="px-4 py-3.5 text-slate-700">{exp.description}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-700 text-sm">
                    ${exp.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{exp.date}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{exp.referenceNumber}</td>
                  <td className="px-4 py-3.5 text-slate-600">{exp.paidTo}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 10: FINANCE REPORTS
  ------------------------------------------------------------- */
  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Institutional Financial Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Data-derived audit summaries, collection breakdowns, and receivable aging analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={() => {
              handleExportCSV(
                'finance_master_summary.csv',
                ['Class', 'Total Billed', 'Amount Collected', 'Outstanding Balance', 'Collection Rate'],
                Array.from(new Set(state.fees.map((f) => f.class))).map((cls) => {
                  const classFees = state.fees.filter((f) => f.class === cls);
                  const tot = classFees.reduce((s, f) => s + f.totalFee, 0);
                  const col = classFees.reduce((s, f) => s + f.paidAmount, 0);
                  const pen = classFees.reduce((s, f) => s + f.pendingAmount, 0);
                  return [cls, tot, col, pen, `${Math.round((col / (tot || 1)) * 100)}%`];
                })
              );
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export Master Report (CSV)
          </button>
        </div>
      </div>

      {/* Class-wise Collection Analysis Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Cohort-wise Fee Inflows & Recovery</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Class Cohort</th>
                <th className="px-4 py-2.5 text-right font-mono">Assessed Total</th>
                <th className="px-4 py-2.5 text-right font-mono">Collected to Date</th>
                <th className="px-4 py-2.5 text-right font-mono">Pending Balance</th>
                <th className="px-4 py-2.5 text-right">Recovery Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from(new Set(state.fees.map((f) => f.class))).map((cls) => {
                const classFees = state.fees.filter((f) => f.class === cls);
                const tot = classFees.reduce((s, f) => s + f.totalFee, 0);
                const col = classFees.reduce((s, f) => s + f.paidAmount, 0);
                const pen = classFees.reduce((s, f) => s + f.pendingAmount, 0);
                const rate = Math.round((col / (tot || 1)) * 100);
                return (
                  <tr key={cls} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold text-slate-900">{cls}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800">${tot.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-700">${col.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-700">${pen.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${rate >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {rate}%
                      </span>
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

  /* -------------------------------------------------------------
     TAB 11: SETTINGS & BILLING POLICIES
  ------------------------------------------------------------- */
  const renderSettings = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Billing Policies & Payment Channels</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure receipt formats, overdue grace periods, and remittance banking details.
        </p>

        <div className="mt-6 space-y-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="font-bold text-slate-900">Surcharge & Late Fee Rules</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-600 block mb-1">Grace Period (Days)</label>
                <input type="number" readOnly value={10} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono" />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Late Fine per Month</label>
                <input type="text" readOnly value="$50.00 Fixed" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono font-bold text-rose-600" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <h4 className="font-bold text-slate-900">Designated School Settlement Account</h4>
            <div className="text-slate-600 space-y-1 font-mono text-[11px]">
              <div>Bank: Greenfield First Community Bank</div>
              <div>Account Name: Greenfield International School Operating Fund</div>
              <div>IBAN / SWIFT: GISCUS33XXXX · Routing: 021000021</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {state.activeNav === 'dashboard' && renderDashboard()}
      {state.activeNav === 'fees' && renderFees()}
      {state.activeNav === 'fee_structure' && renderFeeStructure()}
      {state.activeNav === 'collections' && renderCollections()}
      {state.activeNav === 'pending_fees' && renderPendingFees()}
      {state.activeNav === 'payment_history' && renderPaymentHistory()}
      {state.activeNav === 'receipts' && renderPaymentHistory()}
      {state.activeNav === 'concessions' && renderConcessions()}
      {state.activeNav === 'adjustments' && renderAdjustments()}
      {state.activeNav === 'expenses' && renderExpenses()}
      {state.activeNav === 'reports' && renderReports()}
      {state.activeNav === 'settings' && renderSettings()}
      {![
        'dashboard',
        'fees',
        'fee_structure',
        'collections',
        'pending_fees',
        'payment_history',
        'receipts',
        'concessions',
        'adjustments',
        'expenses',
        'reports',
        'settings',
      ].includes(state.activeNav) && renderDashboard()}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Student Tuition Payment"
        subtitle="Post a verified fee collection directly into student ledger."
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Student Account *</label>
            <select
              value={selectedStudentForPay}
              onChange={(e) => {
                const sid = e.target.value;
                setSelectedStudentForPay(sid);
                const st = state.fees.find((f) => f.studentId === sid);
                if (st) {
                  setPaymentAmount(st.pendingAmount > 0 ? st.pendingAmount : 1200);
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
              required
            >
              <option value="">Select Enrolled Student...</option>
              {state.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.class}) · Admission ID: {s.admissionId}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Amount ($) *</label>
              <input
                type="number"
                min={1}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Bank Transfer">Bank Transfer / Wire</option>
                <option value="UPI">UPI / Instant Pay</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash">Cash at Desk</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Txn / Reference No</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Remarks / Note</label>
              <input
                type="text"
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Post Payment & Generate Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Receipt Modal */}
      {activeReceipt && (
        <Modal
          isOpen={!!activeReceipt}
          onClose={() => setActiveReceipt(null)}
          title="Tuition Payment Voucher"
          subtitle="Official Greenfield International School computer-generated receipt."
        >
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs font-mono">
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <h3 className="font-bold text-sm text-slate-900 uppercase">Greenfield International School</h3>
              <p className="text-[11px] text-slate-500 font-sans">Official Tuition Fee Receipt</p>
              <p className="text-slate-400 text-[10px] mt-1">Receipt No: {activeReceipt.receiptNumber}</p>
            </div>

            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Student Name:</span>
                <span className="font-bold">{activeReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span>Class:</span>
                <span>{activeReceipt.class}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{activeReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span>{activeReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Ref Number:</span>
                <span>{activeReceipt.referenceNumber}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between text-sm font-bold text-slate-900">
              <span>Amount Paid:</span>
              <span className="text-emerald-700 font-mono">${activeReceipt.amount.toLocaleString()}</span>
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-400 font-sans">
              Thank you. Computer-generated receipt · No signature required.
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                window.print();
                setActiveReceipt(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
          </div>
        </Modal>
      )}

      {/* Student Ledger Detail Modal */}
      {selectedStudentLedger && (
        <Modal
          isOpen={!!selectedStudentLedger}
          onClose={() => setSelectedStudentLedger(null)}
          title={`Fee Account Ledger: ${selectedStudentLedger.studentName}`}
          subtitle={`${selectedStudentLedger.class} · Student ID: ${selectedStudentLedger.studentId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Total Assessed</span>
                <span className="text-base font-bold font-mono text-slate-900">${selectedStudentLedger.totalFee.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Amount Settled</span>
                <span className="text-base font-bold font-mono text-emerald-700">${selectedStudentLedger.paidAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Outstanding Balance</span>
                <span className="text-base font-bold font-mono text-rose-700">${selectedStudentLedger.pendingAmount.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Chronological Transaction History</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {state.payments
                  .filter((p) => p.studentId === selectedStudentLedger.studentId)
                  .map((pay) => (
                    <div key={pay.id} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{pay.receiptNumber}</span>
                          <span className="px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-700 text-[10px]">Credit</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                          {pay.date} · via {pay.paymentMethod} (Ref: {pay.referenceNumber})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 text-sm">+${pay.amount.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedStudentLedger(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
              >
                Close
              </button>
              {selectedStudentLedger.pendingAmount > 0 && (
                <button
                  onClick={() => {
                    const sid = selectedStudentLedger.studentId;
                    const amt = selectedStudentLedger.pendingAmount;
                    setSelectedStudentLedger(null);
                    openPaymentForStudent(sid, amt);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Record Payment
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Dues Statement Modal */}
      {statementModalStudent && (
        <Modal
          isOpen={!!statementModalStudent}
          onClose={() => setStatementModalStudent(null)}
          title="Official Outstanding Dues Statement"
          subtitle={`Greenfield International School Accounts Bureau · ${statementModalStudent.studentName}`}
        >
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs font-mono">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h3 className="font-bold text-sm text-slate-900 uppercase">Greenfield International School</h3>
              <p className="text-[11px] text-slate-500 font-sans">Formal Tuition Due Notice</p>
              <p className="text-slate-400 text-[10px] mt-1">Generated: {new Date().toISOString().split('T')[0]}</p>
            </div>

            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Student Name:</span>
                <span className="font-bold">{statementModalStudent.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span>Class / Section:</span>
                <span>{statementModalStudent.class}</span>
              </div>
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span className="text-rose-600 font-bold">{statementModalStudent.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Annual Assessment:</span>
                <span>${statementModalStudent.totalFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Already Paid:</span>
                <span className="text-emerald-700">${statementModalStudent.paidAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between text-sm font-bold text-slate-900">
              <span>Outstanding Balance Payable:</span>
              <span className="text-rose-700 font-mono">${statementModalStudent.pendingAmount.toLocaleString()}</span>
            </div>

            <div className="pt-2 text-[10px] text-slate-500 font-sans leading-relaxed">
              Kindly clear the remaining balance through the Parent Mobile App or direct remittance to Greenfield Operating Fund (IBAN: GISCUS33XXXX).
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              onClick={() => setStatementModalStudent(null)}
              className="px-4 py-2 text-slate-600 font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                window.print();
                setStatementModalStudent(null);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Dues Notice
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Fee Record Modal */}
      {selectedFeeForEdit && (
        <Modal
          isOpen={isEditFeeModalOpen}
          onClose={() => {
            setIsEditFeeModalOpen(false);
            setSelectedFeeForEdit(null);
          }}
          title={`Edit Fee Record: ${selectedFeeForEdit.studentName}`}
          subtitle={`${selectedFeeForEdit.class} · Ledger Record ID: ${selectedFeeForEdit.id}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const total = Number(selectedFeeForEdit.totalFee) || 0;
              const paid = Number(selectedFeeForEdit.paidAmount) || 0;
              const pending = Math.max(0, total - paid);
              let status: StudentFee['status'] = 'Pending';
              if (pending === 0) status = 'Paid';
              else if (paid > 0) status = 'Partially Paid';
              else status = selectedFeeForEdit.status || 'Pending';

              updateFeeRecord({
                ...selectedFeeForEdit,
                totalFee: total,
                paidAmount: paid,
                pendingAmount: pending,
                status,
              });
              setIsEditFeeModalOpen(false);
              setSelectedFeeForEdit(null);
              addToast('Fee Record Updated', `Saved adjustments for ${selectedFeeForEdit.studentName}.`, 'success');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Student & Class</label>
              <input
                type="text"
                disabled
                value={`${selectedFeeForEdit.studentName} (${selectedFeeForEdit.class})`}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Total Fee ($)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={selectedFeeForEdit.totalFee}
                  onChange={(e) => {
                    const total = Number(e.target.value) || 0;
                    const paid = Number(selectedFeeForEdit.paidAmount) || 0;
                    setSelectedFeeForEdit({
                      ...selectedFeeForEdit,
                      totalFee: total,
                      pendingAmount: Math.max(0, total - paid),
                    });
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Paid Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={selectedFeeForEdit.paidAmount}
                  onChange={(e) => {
                    const paid = Number(e.target.value) || 0;
                    const total = Number(selectedFeeForEdit.totalFee) || 0;
                    setSelectedFeeForEdit({
                      ...selectedFeeForEdit,
                      paidAmount: paid,
                      pendingAmount: Math.max(0, total - paid),
                    });
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pending Amount ($ calculated)</label>
                <input
                  type="number"
                  disabled
                  value={selectedFeeForEdit.pendingAmount}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={selectedFeeForEdit.dueDate}
                  onChange={(e) =>
                    setSelectedFeeForEdit({
                      ...selectedFeeForEdit,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Status</label>
              <select
                value={selectedFeeForEdit.status}
                onChange={(e) =>
                  setSelectedFeeForEdit({
                    ...selectedFeeForEdit,
                    status: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditFeeModalOpen(false);
                  setSelectedFeeForEdit(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Save Ledger Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Fee Structure Modal */}
      {isAddFeeStructureOpen && (
        <Modal
          isOpen={isAddFeeStructureOpen}
          onClose={() => setIsAddFeeStructureOpen(false)}
          title="Create New Annual Fee Schedule"
          subtitle="Define cohort fee slabs, categories, and due schedules."
        >
          <form onSubmit={handleAddFeeStructureSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Fee Schedule Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Grade 10 Senior Secondary Standard"
                value={newStructureForm.name}
                onChange={(e) => setNewStructureForm({ ...newStructureForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cohort / Class *</label>
                <select
                  value={newStructureForm.class}
                  onChange={(e) => setNewStructureForm({ ...newStructureForm, class: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Grade 10A">Grade 10A</option>
                  <option value="Grade 10B">Grade 10B</option>
                  <option value="Grade 9A">Grade 9A</option>
                  <option value="Grade 8A">Grade 8A</option>
                  <option value="Grade 7B">Grade 7B</option>
                  <option value="Grade 5B">Grade 5B</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                <select
                  value={newStructureForm.category}
                  onChange={(e) => setNewStructureForm({ ...newStructureForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Tuition">Tuition</option>
                  <option value="Lab & Tech">Lab & Tech</option>
                  <option value="Sports & Co-curricular">Sports & Co-curricular</option>
                  <option value="Campus Transit">Campus Transit</option>
                  <option value="Library">Library</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount ($) *</label>
                <input
                  type="number"
                  min="50"
                  required
                  value={newStructureForm.amount}
                  onChange={(e) => setNewStructureForm({ ...newStructureForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={newStructureForm.dueDate}
                  onChange={(e) => setNewStructureForm({ ...newStructureForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddFeeStructureOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
              >
                Save Fee Structure
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Grant Concession Modal */}
      {isAddConcessionOpen && (
        <Modal
          isOpen={isAddConcessionOpen}
          onClose={() => setIsAddConcessionOpen(false)}
          title="Grant Scholarship or Fee Concession"
          subtitle="Apply authorized fee waivers or sibling deductions."
        >
          <form onSubmit={handleAddConcessionSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Student *</label>
              <select
                value={newConcessionForm.studentId}
                onChange={(e) => setNewConcessionForm({ ...newConcessionForm, studentId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                <option value="">Select Enrolled Student...</option>
                {state.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Concession Type *</label>
                <select
                  value={newConcessionForm.category}
                  onChange={(e) => setNewConcessionForm({ ...newConcessionForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Merit Scholarship">Merit Scholarship</option>
                  <option value="Sibling Concession">Sibling Concession</option>
                  <option value="Need-based Assistance">Need-based Assistance</option>
                  <option value="Staff Ward">Staff Ward Subsidy</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Concession Amount ($) *</label>
                <input
                  type="number"
                  min="50"
                  required
                  value={newConcessionForm.amount}
                  onChange={(e) => setNewConcessionForm({ ...newConcessionForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Approval Justification</label>
              <textarea
                rows={2}
                placeholder="Reason or scholarship eligibility..."
                value={newConcessionForm.reason}
                onChange={(e) => setNewConcessionForm({ ...newConcessionForm, reason: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddConcessionOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
              >
                Authorize & Credit Concession
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Adjustment Modal */}
      {isAddAdjustmentOpen && (
        <Modal
          isOpen={isAddAdjustmentOpen}
          onClose={() => setIsAddAdjustmentOpen(false)}
          title="Record Accounting Adjustment / Refund"
          subtitle="Audit-tracked balance modifications."
        >
          <form onSubmit={handleAddAdjustmentSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Student Account *</label>
              <select
                value={newAdjustmentForm.studentId}
                onChange={(e) => setNewAdjustmentForm({ ...newAdjustmentForm, studentId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                required
              >
                <option value="">Select Enrolled Student...</option>
                {state.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Adjustment Type *</label>
                <select
                  value={newAdjustmentForm.type}
                  onChange={(e) => setNewAdjustmentForm({ ...newAdjustmentForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Billing Correction">Billing Correction</option>
                  <option value="Fee Waiver">Fee Waiver</option>
                  <option value="Refund">Cash / Wire Refund</option>
                  <option value="Write-off">Uncollectible Write-off</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount ($) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newAdjustmentForm.amount}
                  onChange={(e) => setNewAdjustmentForm({ ...newAdjustmentForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason & Audit Justification</label>
              <textarea
                rows={2}
                placeholder="Audit notes and authorization memo..."
                value={newAdjustmentForm.reason}
                onChange={(e) => setNewAdjustmentForm({ ...newAdjustmentForm, reason: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddAdjustmentOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs"
              >
                Confirm Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Expense Modal */}
      {isAddExpenseOpen && (
        <Modal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          title="Record Operating School Expense"
          subtitle="Post a campus disbursement into institutional accounting."
        >
          <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Category *</label>
                <select
                  value={newExpenseForm.category}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Facility Maintenance">Facility Maintenance</option>
                  <option value="Lab Reagents & Tech">Lab Reagents & Tech</option>
                  <option value="Campus Utilities">Campus Utilities</option>
                  <option value="Educational Supplies">Educational Supplies</option>
                  <option value="Sports Equipment">Sports Equipment</option>
                  <option value="Administrative">Administrative Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount ($) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newExpenseForm.amount}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Item Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Physics optics bench lenses and mirrors"
                value={newExpenseForm.description}
                onChange={(e) => setNewExpenseForm({ ...newExpenseForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Paid To / Beneficiary *</label>
                <input
                  type="text"
                  required
                  placeholder="Vendor or payee name"
                  value={newExpenseForm.paidTo}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, paidTo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Invoice / Voucher #</label>
                <input
                  type="text"
                  placeholder="INV-9921"
                  value={newExpenseForm.referenceNumber}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
              >
                Post Expense Entry
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
