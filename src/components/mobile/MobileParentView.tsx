import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { BarChart } from '../common/Charts';
import { Modal } from '../common/Modal';
import { ProfilePage } from '../common/ProfilePage';
import { CustomPaletteEditor } from '../common/CustomPaletteEditor';
import { THEMES, ThemeColor } from '../../types';
import {
  Home,
  BookOpen,
  CheckSquare,
  DollarSign,
  MoreHorizontal,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  Award,
  Bus,
  Library,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Download,
  Printer,
  Sparkles,
  Shield,
  Palette,
  LogOut,
  HelpCircle,
  ExternalLink,
  Plus,
  CreditCard,
  Building,
  RotateCcw,
} from 'lucide-react';

interface MobileParentViewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExit: () => void;
}

export const MobileParentView: React.FC<MobileParentViewProps> = ({
  activeTab,
  onTabChange,
  onExit,
}) => {
  const {
    state,
    setSelectedChild,
    sendMessage,
    recordPayment,
    addStudentLeaveRequest,
    setThemeColor,
    resetDemoData,
    addToast,
  } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  // Selected Child (Aarav Sharma vs Ananya Sharma)
  const currentChildId = state.selectedChildId || 'std-aarav';
  const child =
    state.students.find((s) => s.id === currentChildId) ||
    state.students.find((s) => s.parentEmail === 'vikram.sharma@example.com') ||
    state.students[0];

  // Connected data for the active child
  const childAttendanceRecords = state.attendance.filter((a) => a.studentId === child.id);
  const childMarks = state.marks.filter((m) => m.studentId === child.id);
  const childAssignments = state.assignments.filter((a) => a.class === child.class);
  const childFee = state.fees.find((f) => f.studentId === child.id);
  const childPayments = state.payments.filter((p) => p.studentId === child.id);
  const childLeaveRequests = (state.studentLeaveRequests || []).filter(
    (l) => l.studentId === child.id
  );
  const childBorrowedBooks = state.libraryTransactions.filter(
    (t) => t.studentId === child.id && t.status !== 'Returned'
  );

  // Relevant Notices (General School or specific to child's class)
  const childNotices = state.notices.filter(
    (n) =>
      n.targetAudience.includes('All') ||
      n.targetAudience.includes(child.class) ||
      n.targetAudience.includes(child.class.split(' ')[0])
  );

  // Class teacher info based on active child
  const isAarav = child.id === 'std-aarav';
  const teacherName = isAarav ? 'Marcus Sterling' : 'Emily Watson';
  const teacherId = isAarav ? 'tch-sterling' : 'tch-watson';
  const threadId = isAarav ? 'thr-vikram-sterling' : 'thr-vikram-watson';

  // Sub-screens & Modals
  const [activeMoreScreen, setActiveMoreScreen] = useState<string | null>(null);
  const [academicsSubTab, setAcademicsSubTab] = useState<'grades' | 'homework'>('grades');
  const [homeworkFilter, setHomeworkFilter] = useState<'all' | 'pending' | 'submitted'>('all');
  const [selectedNoticeForView, setSelectedNoticeForView] = useState<any | null>(null);
  const [selectedAssignmentModal, setSelectedAssignmentModal] = useState<any | null>(null);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<
    'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  >('Monday');
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<'September' | 'October'>(
    'September'
  );
  const [selectedCalendarDayInfo, setSelectedCalendarDayInfo] = useState<string | null>(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(childFee?.pendingAmount || 1200);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Bank Transfer'>('UPI');
  const [upiIdInput, setUpiIdInput] = useState('vikram.sharma@okaxis');
  const [paymentRemarks, setPaymentRemarks] = useState('Tuition fee remittance for Term 1');

  // Leave Form State
  const [leaveStartDate, setLeaveStartDate] = useState('2026-10-28');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-10-29');
  const [leaveReasonCategory, setLeaveReasonCategory] = useState<'Medical' | 'Family' | 'Academic' | 'Other'>('Medical');
  const [leaveReasonNotes, setLeaveReasonNotes] = useState('');

  // Messaging State
  const [messageInput, setMessageInput] = useState('');

  // Switch Child Handler
  const handleSwitchChild = (childId: string) => {
    setSelectedChild(childId);
    const newFee = state.fees.find((f) => f.studentId === childId);
    if (newFee) {
      setPaymentAmount(newFee.pendingAmount || 0);
    }
    setSelectedCalendarDayInfo(null);
  };

  // Submit Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessage(
      threadId,
      messageInput.trim(),
      'parent',
      'Vikram Sharma (Parent)',
      teacherId,
      teacherName
    );
    setMessageInput('');
  };

  // Submit Leave Request
  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReasonNotes.trim()) {
      addToast('Missing Details', 'Please provide a reason note for the leave request.', 'info');
      return;
    }

    addStudentLeaveRequest({
      studentId: child.id,
      studentName: child.name,
      admissionId: child.admissionId,
      class: child.class,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      reason: `[${leaveReasonCategory}] ${leaveReasonNotes.trim()}`,
      appliedBy: 'Vikram Sharma (Parent)',
    });

    setIsLeaveModalOpen(false);
    setLeaveReasonNotes('');
    addToast('Request Submitted', `Leave application for ${child.name} has been sent to school administration.`, 'success');
  };

  // Submit Online Tuition Payment
  const handleConfirmPayment = () => {
    if (!childFee || paymentAmount <= 0) return;

    const receiptRef = `TXN-PAR-${Date.now().toString().slice(-6)}`;
    recordPayment({
      studentId: child.id,
      amount: paymentAmount,
      paymentMethod: paymentMethod === 'Card' ? 'Card' : paymentMethod === 'Bank Transfer' ? 'Bank Transfer' : 'UPI',
      referenceNumber: receiptRef,
      remarks: `${paymentRemarks} (${paymentMethod})`,
    });

    setIsPaymentModalOpen(false);
    addToast('Payment Successful', `Remittance of $${paymentAmount.toLocaleString()} verified. Receipt #${receiptRef} generated.`, 'success');
  };

  /* -------------------------------------------------------------
     MULTI-CHILD SWITCHER HEADER
  ------------------------------------------------------------- */
  const renderChildSwitcher = () => (
    <div className="bg-slate-900 text-white rounded-2xl p-2 flex items-center gap-2 shadow-sm">
      <button
        onClick={() => handleSwitchChild('std-aarav')}
        style={currentChildId === 'std-aarav' ? { backgroundColor: currentTheme.primary } : {}}
        className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2.5 transition-all min-h-[44px] ${
          currentChildId === 'std-aarav'
            ? 'font-bold shadow-xs text-white'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-white/20 text-white font-mono text-xs flex items-center justify-center font-bold">
          AS
        </div>
        <div className="text-left leading-tight">
          <span className="block text-xs font-bold">Aarav Sharma</span>
          <span className="block text-[10px] text-slate-300">Grade 8A · Roll #12</span>
        </div>
      </button>

      <button
        onClick={() => handleSwitchChild('std-ananya')}
        style={currentChildId === 'std-ananya' ? { backgroundColor: currentTheme.primary } : {}}
        className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2.5 transition-all min-h-[44px] ${
          currentChildId === 'std-ananya'
            ? 'font-bold shadow-xs text-white'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-white/20 text-white font-mono text-xs flex items-center justify-center font-bold">
          AN
        </div>
        <div className="text-left leading-tight">
          <span className="block text-xs font-bold">Ananya Sharma</span>
          <span className="block text-[10px] text-slate-300">Grade 5B · Roll #08</span>
        </div>
      </button>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 1: HOME — "How is my child doing?"
  ------------------------------------------------------------- */
  const renderHome = () => (
    <div className="space-y-4 text-xs">
      {/* Multi-Child Selector */}
      {renderChildSwitcher()}

      {/* Greeting & Quick Notice Alert */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900">Good morning, Vikram!</h2>
          <p className="text-[11px] text-slate-500">Welcome to your family school portal</p>
        </div>
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs text-[11px] font-semibold"
        >
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Profile</span>
        </button>
      </div>

      {/* "How is my child doing?" Executive Health Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-start justify-between">
          <div>
            <span
              style={{ color: currentTheme.primary }}
              className="text-[10px] font-bold uppercase tracking-wider block"
            >
              How is {child.name.split(' ')[0]} doing today?
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{child.name}</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {child.class} · {child.admissionId}
            </p>
          </div>
          <StatusBadge status={child.academicStatus} />
        </div>

        {/* 4 Connected Quick Stat Pillars */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">
              Attendance
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-emerald-600 font-mono">Present</span>
              <span className="text-[11px] text-slate-400 font-mono">({child.attendanceRate}%)</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Session recorded</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">
              Academic Standing
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                style={{ color: currentTheme.primary }}
                className="text-base font-bold font-mono"
              >
                {child.academicStatus === 'Excellent' ? 'Grade A · Top 5%' : 'Grade A · 91%'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Term 1 Evaluations</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">
              Tuition Status
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={`text-base font-bold font-mono ${
                  (childFee?.pendingAmount || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {(childFee?.pendingAmount || 0) > 0
                  ? `$${childFee?.pendingAmount.toLocaleString()} Due`
                  : 'Settled'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {(childFee?.pendingAmount || 0) > 0 ? `Due ${childFee?.dueDate}` : 'Fully Cleared'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">
              Campus Transit
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-emerald-700 font-mono">Bus Route 4</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">On Schedule · Gate 3</span>
          </div>
        </div>
      </div>

      {/* 6 Quick Action Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setActiveMoreScreen('timetable');
              onTabChange('more');
            }}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-center"
          >
            <Clock className="w-5 h-5 text-indigo-600 mb-1.5" />
            <span className="font-semibold text-slate-800 text-[11px]">Timetable</span>
          </button>

          <button
            onClick={() => onTabChange('academics')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-center"
          >
            <BookOpen className="w-5 h-5 text-emerald-600 mb-1.5" />
            <span className="font-semibold text-slate-800 text-[11px]">Academics</span>
          </button>

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-center"
          >
            <Calendar className="w-5 h-5 text-amber-600 mb-1.5" />
            <span className="font-semibold text-slate-800 text-[11px]">Apply Leave</span>
          </button>

          <button
            onClick={() => onTabChange('fees')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-center"
          >
            <DollarSign className="w-5 h-5 text-emerald-600 mb-1.5" />
            <span className="font-semibold text-slate-800 text-[11px]">Pay Tuition</span>
          </button>

          <button
            onClick={() => setIsReportCardOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-center"
          >
            <Award className="w-5 h-5 text-purple-600 mb-1.5" />
            <span className="font-semibold text-slate-800 text-[11px]">Report Card</span>
          </button>

          <button
            onClick={() => {
              setActiveMoreScreen('messages');
              onTabChange('more');
            }}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-center"
          >
            <MessageSquare className="w-5 h-5 text-blue-600 mb-1.5" />
            <span className="font-semibold text-slate-800 text-[11px]">Teacher Chat</span>
          </button>
        </div>
      </div>

      {/* Today's Class Schedule Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Clock style={{ color: currentTheme.primary }} className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Today's Classes ({selectedScheduleDay})
            </h3>
          </div>
          <button
            onClick={() => {
              setActiveMoreScreen('timetable');
              onTabChange('more');
            }}
            style={{ color: currentTheme.primary }}
            className="text-[11px] font-semibold hover:underline"
          >
            Full Week →
          </button>
        </div>

        {(() => {
          const daySlots = state.timetable
            .filter((s) => s.class === child.class && s.day === selectedScheduleDay)
            .sort((a, b) => a.periodNumber - b.periodNumber);

          if (daySlots.length === 0) {
            return (
              <p className="p-3 text-center text-slate-400 text-xs">
                No classes scheduled on {selectedScheduleDay} for {child.class}.
              </p>
            );
          }

          return (
            <div className="space-y-2">
              {daySlots.slice(0, 3).map((slot) => (
                <div
                  key={slot.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{slot.subject}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {slot.type || 'Lecture'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {slot.period} ({slot.time}) · {slot.teacherName}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {slot.room}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Homework & Assignments Due Soon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Active Assignments ({childAssignments.length})
          </h3>
          <button
            onClick={() => {
              setAcademicsSubTab('homework');
              onTabChange('academics');
            }}
            style={{ color: currentTheme.primary }}
            className="text-[11px] font-semibold hover:underline"
          >
            All Tasks →
          </button>
        </div>

        <div className="space-y-2">
          {childAssignments.length === 0 ? (
            <p className="p-3 text-center text-slate-400">No pending assignments for {child.class}</p>
          ) : (
            childAssignments.slice(0, 2).map((asg) => (
              <div
                key={asg.id}
                onClick={() => setSelectedAssignmentModal(asg)}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-xs">{asg.title}</span>
                  <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Due {asg.dueDate}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {asg.subject} · {asg.teacherName}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tuition Fee Balance Card with Pay Button */}
      {childFee && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tuition Fee Balance
              </span>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                ${childFee.pendingAmount.toLocaleString()} Pending
              </div>
            </div>
            <StatusBadge status={childFee.status} />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Total: ${childFee.totalFee.toLocaleString()}</span>
            <span>Paid: ${childFee.paidAmount.toLocaleString()}</span>
            <span>Due: {childFee.dueDate}</span>
          </div>

          <div className="mt-3 flex gap-2">
            {childFee.pendingAmount > 0 ? (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Pay Tuition Online (${childFee.pendingAmount.toLocaleString()})
              </button>
            ) : (
              <button
                onClick={() => onTabChange('fees')}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1"
              >
                View Fee Receipts
              </button>
            )}
          </div>
        </div>
      )}

      {/* School Circular / Announcement */}
      {childNotices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Latest School Notice
            </h3>
            <button
              onClick={() => {
                setActiveMoreScreen('notices');
                onTabChange('more');
              }}
              style={{ color: currentTheme.primary }}
              className="text-[11px] font-semibold hover:underline"
            >
              All Circulars →
            </button>
          </div>
          <div
            onClick={() => setSelectedNoticeForView(childNotices[0])}
            className="p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <StatusBadge status={childNotices[0].category} />
              <span className="text-[10px] text-slate-400 font-mono">{childNotices[0].date}</span>
            </div>
            <span className="font-bold text-slate-900 block text-xs">{childNotices[0].title}</span>
            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
              {childNotices[0].content}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  /* -------------------------------------------------------------
     TAB 2: ATTENDANCE
  ------------------------------------------------------------- */
  const renderAttendance = () => (
    <div className="space-y-4 text-xs">
      {/* Multi-Child Selector */}
      {renderChildSwitcher()}

      {/* Attendance Header & Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{child.name} — Attendance Record</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Year-to-date recorded classroom presence.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-emerald-600 block">
              {child.attendanceRate}%
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Overall Rate</span>
          </div>
        </div>

        {/* 4-Stat Pillar Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-[9px] text-emerald-700 block font-bold uppercase">Present</span>
            <span className="font-mono font-bold text-emerald-800 text-sm">48 Days</span>
          </div>
          <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
            <span className="text-[9px] text-rose-700 block font-bold uppercase">Absent</span>
            <span className="font-mono font-bold text-rose-800 text-sm">2 Days</span>
          </div>
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-[9px] text-amber-700 block font-bold uppercase">Late</span>
            <span className="font-mono font-bold text-amber-800 text-sm">1 Day</span>
          </div>
          <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-[9px] text-blue-700 block font-bold uppercase">Excused</span>
            <span className="font-mono font-bold text-blue-800 text-sm">1 Day</span>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Calendar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar style={{ color: currentTheme.primary }} className="w-4 h-4" />
            <h3 className="text-xs font-bold text-slate-900">
              {selectedCalendarMonth} 2026 Calendar
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setSelectedCalendarMonth('September')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                selectedCalendarMonth === 'September'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500'
              }`}
            >
              Sep
            </button>
            <button
              onClick={() => setSelectedCalendarMonth('October')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                selectedCalendarMonth === 'October'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500'
              }`}
            >
              Oct
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] mb-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
            <span key={i} className="text-slate-400 font-semibold py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
          {Array.from({ length: selectedCalendarMonth === 'September' ? 30 : 31 }).map((_, idx) => {
            const dayNum = idx + 1;
            const isWeekend = idx % 7 === 5 || idx % 7 === 6;

            // Specific demo marked days
            const isAbsent =
              (selectedCalendarMonth === 'September' && dayNum === 14) ||
              (selectedCalendarMonth === 'October' && dayNum === 8);
            const isLate =
              (selectedCalendarMonth === 'September' && dayNum === 22) ||
              (selectedCalendarMonth === 'October' && dayNum === 15);
            const isExcused = selectedCalendarMonth === 'October' && dayNum === 22;

            let cellClass = 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100';
            let statusText = 'Present (Full Day)';

            if (isWeekend) {
              cellClass = 'text-slate-300 bg-slate-50/50 border border-transparent';
              statusText = 'Weekend (Campus Closed)';
            } else if (isAbsent) {
              cellClass = 'bg-rose-100 text-rose-800 font-bold border border-rose-300';
              statusText = 'Absent (Unexcused Absence)';
            } else if (isLate) {
              cellClass = 'bg-amber-100 text-amber-800 font-bold border border-amber-300';
              statusText = 'Late Arrival (Recorded 08:45 AM)';
            } else if (isExcused) {
              cellClass = 'bg-blue-100 text-blue-800 font-bold border border-blue-300';
              statusText = 'Excused Leave (Approved Science Olympiad)';
            }

            return (
              <button
                key={idx}
                disabled={isWeekend}
                onClick={() =>
                  setSelectedCalendarDayInfo(
                    `${selectedCalendarMonth} ${dayNum}, 2026: ${statusText}`
                  )
                }
                className={`py-2 rounded-lg transition-all min-h-[32px] flex flex-col items-center justify-center ${cellClass} hover:opacity-80 active:scale-95`}
              >
                <span>{dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Toast / Detail Snippet */}
        {selectedCalendarDayInfo && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between">
            <span className="font-medium">{selectedCalendarDayInfo}</span>
            <button
              onClick={() => setSelectedCalendarDayInfo(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Calendar Legend */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Excused</span>
          </div>
        </div>
      </div>

      {/* Leave Application Callout Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Apply for Student Leave</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Notify the administration of scheduled medical or family absence.
            </p>
          </div>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            style={{ backgroundColor: currentTheme.primary }}
            className="px-3.5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1 shadow-xs hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            New Request
          </button>
        </div>

        {/* History of Leave Requests */}
        {childLeaveRequests.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Recent Leave Requests ({childLeaveRequests.length})
            </span>
            {childLeaveRequests.map((req) => (
              <div
                key={req.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900 block text-xs">
                    {req.startDate} to {req.endDate}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{req.reason}</span>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Read-Only Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-500 text-[10px] leading-relaxed">
        <strong>Institutional Attendance Policy:</strong> Attendance records are recorded in real-time
        by classroom instructors. Parents may not edit records directly. To correct an erroneous absence
        entry, contact the class faculty or submit a Leave Request with medical notes.
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 3: ACADEMICS
  ------------------------------------------------------------- */
  const renderAcademics = () => (
    <div className="space-y-4 text-xs">
      {/* Multi-Child Selector */}
      {renderChildSwitcher()}

      {/* Segmented Sub-Tab Switcher: Grades vs Homework */}
      <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
        <button
          onClick={() => setAcademicsSubTab('grades')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
            academicsSubTab === 'grades'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Examinations & Grades
        </button>
        <button
          onClick={() => setAcademicsSubTab('homework')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
            academicsSubTab === 'homework'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Homework & Assignments ({childAssignments.length})
        </button>
      </div>

      {academicsSubTab === 'grades' ? (
        <>
          {/* Term 1 Academic Performance Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span
                  style={{ color: currentTheme.primary }}
                  className="text-[10px] font-bold uppercase tracking-wider block"
                >
                  Term 1 Progress Summary
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">{child.name}</h2>
                <p className="text-[11px] text-slate-500">
                  {child.class} · Academic Session 2026-2027
                </p>
              </div>
              <button
                onClick={() => setIsReportCardOpen(true)}
                style={{ backgroundColor: currentTheme.primary }}
                className="px-3 py-1.5 text-white font-bold rounded-xl text-[11px] shadow-xs flex items-center gap-1.5 hover:opacity-90"
              >
                <Award className="w-3.5 h-3.5" />
                Report Card
              </button>
            </div>

            {/* GPA & Standing */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                  Cumulative Score
                </span>
                <span className="text-lg font-bold font-mono text-emerald-600 block mt-0.5">
                  91.2% (Grade A)
                </span>
                <span className="text-[10px] text-slate-400">Class Rank: #2 of 32</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                  Faculty Evaluation
                </span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">Commendable</span>
                <span className="text-[10px] text-slate-400">Teacher: {teacherName}</span>
              </div>
            </div>
          </div>

          {/* Subject Scores Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Subject Score Ledger
            </h3>

            <div className="divide-y divide-slate-100">
              {childMarks.length === 0 ? (
                <p className="p-4 text-center text-slate-400">No marks recorded yet for {child.name}.</p>
              ) : (
                childMarks.map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">{m.subject}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {m.exam} · Max {m.maxMarks}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {m.marks}/{m.maxMarks}
                      </span>
                      <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {m.grade}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Bar Chart */}
          {childMarks.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Comparative Subject Graph
              </h3>
              <BarChart
                data={childMarks.map((m) => ({
                  label: m.subject.split(' ')[0],
                  value: m.marks,
                  displayValue: `${m.marks}%`,
                }))}
                height={140}
                valueSuffix="%"
              />
            </div>
          )}
        </>
      ) : (
        /* Homework & Assignments sub-tab */
        <div className="space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            {(['all', 'pending', 'submitted'] as const).map((flt) => (
              <button
                key={flt}
                onClick={() => setHomeworkFilter(flt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  homeworkFilter === flt
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>

          {/* Assignments List */}
          <div className="space-y-2.5">
            {childAssignments.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border text-center text-slate-400">
                No active assignments for {child.class}.
              </div>
            ) : (
              childAssignments
                .filter((a) => {
                  if (homeworkFilter === 'pending') return a.status === 'Published';
                  if (homeworkFilter === 'submitted') return a.submissionCount > 0;
                  return true;
                })
                .map((asg) => (
                  <div
                    key={asg.id}
                    onClick={() => setSelectedAssignmentModal(asg)}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {asg.subject}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Due {asg.dueDate}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{asg.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {asg.description}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Faculty: {asg.teacherName}</span>
                      <span className="font-semibold text-indigo-600">View Details →</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* -------------------------------------------------------------
     TAB 4: FEES & ONLINE REMITTANCE
  ------------------------------------------------------------- */
  const renderFees = () => (
    <div className="space-y-4 text-xs">
      {/* Multi-Child Selector */}
      {renderChildSwitcher()}

      {/* Outstanding Balance Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span
              style={{ color: currentTheme.primary }}
              className="text-[10px] font-bold uppercase tracking-wider block"
            >
              Annual Tuition Ledger
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ${childFee?.pendingAmount.toLocaleString() || '0'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {(childFee?.pendingAmount || 0) > 0
                ? `Pending balance due by ${childFee?.dueDate}`
                : 'All dues cleared for the current academic session'}
            </p>
          </div>
          <StatusBadge status={childFee?.status || 'Paid'} />
        </div>

        {/* 3 Metrics: Total, Paid, Outstanding */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Fee</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
              ${childFee?.totalFee.toLocaleString() || '4,800'}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-semibold block uppercase">Paid to Date</span>
            <span className="text-sm font-bold font-mono text-emerald-800 mt-0.5 block">
              ${childFee?.paidAmount.toLocaleString() || '0'}
            </span>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
            <span className="text-[10px] text-rose-700 font-semibold block uppercase">Due</span>
            <span className="text-sm font-bold font-mono text-rose-800 mt-0.5 block">
              ${childFee?.pendingAmount.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        {/* Pay Button */}
        {(childFee?.pendingAmount || 0) > 0 && (
          <button
            onClick={() => {
              setPaymentAmount(childFee?.pendingAmount || 1200);
              setIsPaymentModalOpen(true);
            }}
            className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            Pay Tuition Online Now (${childFee?.pendingAmount.toLocaleString()})
          </button>
        )}
      </div>

      {/* Fee Breakdown Structure */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Fee Structure Breakdown (Session 2026-27)
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
            <span className="font-semibold text-slate-800">Tuition & Instructional Fee</span>
            <span className="font-mono font-bold text-slate-900">$3,200</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
            <span className="font-semibold text-slate-800">STEM & Computer Science Lab</span>
            <span className="font-mono font-bold text-slate-900">$600</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
            <span className="font-semibold text-slate-800">Sports & Co-Curricular Athletics</span>
            <span className="font-mono font-bold text-slate-900">$400</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
            <span className="font-semibold text-slate-800">School Bus Transit & Infrastructure</span>
            <span className="font-mono font-bold text-slate-900">$600</span>
          </div>
        </div>
      </div>

      {/* Payment Receipts History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Payment Receipts ({childPayments.length})
        </h3>

        <div className="space-y-2">
          {childPayments.length === 0 ? (
            <p className="p-3 text-center text-slate-400">No payment receipts on file.</p>
          ) : (
            childPayments.map((pay) => (
              <div
                key={pay.id}
                onClick={() => setSelectedReceiptForView(pay)}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {pay.receiptNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">· {pay.date}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    {pay.paymentMethod} · Ref #{pay.referenceNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-700 text-sm block">
                    ${pay.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold hover:underline">
                    View Receipt →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     TAB 5: MORE — AUTHORIZED SECONDARY MODULES
  ------------------------------------------------------------- */
  const renderMore = () => {
    // If a sub-screen is active, render that sub-screen
    if (activeMoreScreen === 'timetable') {
      const daySlots = state.timetable
        .filter((s) => s.class === child.class && s.day === selectedScheduleDay)
        .sort((a, b) => a.periodNumber - b.periodNumber);

      return (
        <div className="space-y-4 text-xs">
          <button
            onClick={() => setActiveMoreScreen(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to More Menu
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900">
              {child.name} — Weekly Class Timetable
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Class {child.class} · Academic Session 2026-27
            </p>

            {/* Day Selector */}
            <div className="flex items-center gap-1 mt-3 pb-2 overflow-x-auto">
              {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedScheduleDay(d)}
                  style={selectedScheduleDay === d ? { backgroundColor: currentTheme.primary } : {}}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                    selectedScheduleDay === d
                      ? 'text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Timetable Period List */}
            <div className="divide-y divide-slate-100 mt-3">
              {daySlots.length === 0 ? (
                <p className="p-4 text-center text-slate-400">
                  No periods scheduled for {selectedScheduleDay}.
                </p>
              ) : (
                daySlots.map((slot) => (
                  <div key={slot.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{slot.subject}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {slot.type || 'Lecture'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        {slot.period} ({slot.time}) · {slot.teacherName}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {slot.room}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeMoreScreen === 'leave_requests') {
      return (
        <div className="space-y-4 text-xs">
          <button
            onClick={() => setActiveMoreScreen(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to More Menu
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Student Leave Applications</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Official absence requests for {child.name}
                </p>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                style={{ backgroundColor: currentTheme.primary }}
                className="px-3.5 py-2 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Apply Leave
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {childLeaveRequests.length === 0 ? (
                <p className="p-4 text-center text-slate-400">
                  No leave requests recorded for {child.name}.
                </p>
              ) : (
                childLeaveRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {req.startDate} — {req.endDate}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-[11px] text-slate-600">{req.reason}</p>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Applied: {req.appliedDate}</span>
                      {req.reviewedBy && (
                        <span>
                          Reviewed by: <strong className="text-slate-600">{req.reviewedBy}</strong>
                        </span>
                      )}
                    </div>
                    {req.reviewRemarks && (
                      <p className="text-[10px] text-indigo-700 italic bg-indigo-50/60 p-1.5 rounded">
                        Remark: &ldquo;{req.reviewRemarks}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeMoreScreen === 'transport') {
      return (
        <div className="space-y-4 text-xs">
          <button
            onClick={() => setActiveMoreScreen(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to More Menu
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Campus Transit Service
                </span>
                <h2 className="text-base font-bold text-slate-900">Route 4 — North Corridor</h2>
                <p className="text-[11px] text-slate-500">Bus Registration: GIS-B-04</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                On Schedule
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Morning Pickup
                </span>
                <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block">
                  07:30 AM
                </span>
                <span className="text-[10px] text-slate-500">Metro Station Plaza</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Afternoon Drop
                </span>
                <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block">
                  03:25 PM
                </span>
                <span className="text-[10px] text-slate-500">Greenfield Gate 3</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                  DO
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">David O'Connor</span>
                  <span className="text-[10px] text-slate-500">Certified School Bus Driver</span>
                </div>
              </div>
              <a
                href="tel:+15558912014"
                className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Driver
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (activeMoreScreen === 'library') {
      return (
        <div className="space-y-4 text-xs">
          <button
            onClick={() => setActiveMoreScreen(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to More Menu
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900">
              Library Circulations — {child.name}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Books currently checked out from Greenfield Media Center
            </p>

            <div className="mt-4 space-y-2.5">
              {childBorrowedBooks.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No books currently on loan to {child.name}.
                </div>
              ) : (
                childBorrowedBooks.map((txn) => (
                  <div
                    key={txn.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">{txn.bookTitle}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Issued: {txn.issueDate} · Due: {txn.dueDate}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active Loan
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeMoreScreen === 'messages') {
      return (
        <div className="space-y-4 text-xs">
          <button
            onClick={() => setActiveMoreScreen(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to More Menu
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Faculty Chat: {teacherName}</h2>
                <p className="text-[10px] text-slate-500">Class Faculty for {child.class}</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            {/* Message Feed */}
            <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {state.messages
                .filter((m) => m.threadId === threadId)
                .map((msg) => {
                  const isParent = msg.senderRole === 'parent';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        isParent ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <span className="text-[9px] text-slate-400 font-medium mb-0.5">
                        {msg.timestamp}
                      </span>
                      <div
                        style={isParent ? { backgroundColor: currentTheme.primary } : {}}
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isParent
                            ? 'text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder={`Message ${teacherName}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.primary }}
                className="px-4 py-2 text-white font-semibold rounded-xl shrink-0 flex items-center justify-center hover:opacity-90 shadow-2xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (activeMoreScreen === 'notices') {
      return (
        <div className="space-y-3 text-xs">
          <button
            onClick={() => setActiveMoreScreen(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to More Menu
          </button>

          <h2 className="text-sm font-bold text-slate-900 px-1">Announcements & Circulars</h2>
          {childNotices.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedNoticeForView(n)}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <StatusBadge status={n.category} />
                <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs mt-1">{n.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.content}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeMoreScreen === 'events') {
      return (
        <div className="space-y-3 text-xs">
          <button
            onClick={() => setActiveMoreScreen(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to More Menu
          </button>

          <h2 className="text-sm font-bold text-slate-900 px-1">Campus Calendar & Events</h2>
          <div className="space-y-2">
            {(state.events || state.schoolEvents || []).map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{ev.title}</span>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {ev.date}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">{ev.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeMoreScreen === 'documents') {
      return (
        <div className="space-y-3 text-xs">
          <button
            onClick={() => setActiveMoreScreen(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to More Menu
          </button>

          <h2 className="text-sm font-bold text-slate-900 px-1">
            Official Documents & Digital ID
          </h2>
          <div className="space-y-2">
            {[
              { title: 'Student Digital Identity Card', size: '1.2 MB', date: '2026-09-01' },
              { title: 'Official Bonafide Enrollment Certificate', size: '450 KB', date: '2026-09-10' },
              { title: 'Term 1 Academic Evaluation Transcript', size: '890 KB', date: '2026-09-24' },
              { title: 'Institutional Health & Immunization Record', size: '620 KB', date: '2026-08-15' },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{doc.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {doc.size} · Verified {doc.date}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    addToast('Downloaded', `${doc.title} saved to device storage.`, 'info')
                  }
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default More Menu Dashboard
    return (
      <div className="space-y-4 text-xs">
        {/* Multi-Child Selector */}
        {renderChildSwitcher()}

        {/* Guardian Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: currentTheme.primary }}
              className="w-11 h-11 rounded-2xl text-white font-bold text-sm flex items-center justify-center shadow-xs"
            >
              VS
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Vikram Sharma</h2>
              <p className="text-[11px] text-slate-500">Guardian of Aarav (8A) & Ananya (5B)</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                vikram.sharma@example.com · +1 (555) 234-8901
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Modules Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs divide-y divide-slate-100">
          <button
            onClick={() => setActiveMoreScreen('timetable')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="font-semibold text-slate-900 block">Class Timetable</span>
                <span className="text-[10px] text-slate-400">Weekly schedule & period rooms</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMoreScreen('leave_requests')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-semibold text-slate-900 block">Leave Requests</span>
                <span className="text-[10px] text-slate-400">Apply & monitor absence approvals</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMoreScreen('transport')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Bus className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-semibold text-slate-900 block">School Transport</span>
                <span className="text-[10px] text-slate-400">Bus route 4, driver & pickup times</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMoreScreen('library')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Library className="w-4 h-4 text-purple-600" />
              <div>
                <span className="font-semibold text-slate-900 block">Library Circulations</span>
                <span className="text-[10px] text-slate-400">Borrowed books & due dates</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMoreScreen('messages')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-semibold text-slate-900 block">Faculty Messaging</span>
                <span className="text-[10px] text-slate-400">Direct chat with {teacherName}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMoreScreen('notices')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-teal-600" />
              <div>
                <span className="font-semibold text-slate-900 block">Notices & Circulars</span>
                <span className="text-[10px] text-slate-400">School announcements</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMoreScreen('events')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-rose-600" />
              <div>
                <span className="font-semibold text-slate-900 block">Events & Academic Calendar</span>
                <span className="text-[10px] text-slate-400">Exams, holidays & PTM</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMoreScreen('documents')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-semibold text-slate-900 block">Documents & Certificates</span>
                <span className="text-[10px] text-slate-400">ID card & official transcripts</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Brand Theme Selector Card with Custom HEX & Presets */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <CustomPaletteEditor />
        </div>

        {/* Institutional Contact Support */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs text-slate-600">
          <h3 className="font-bold text-slate-900 text-xs mb-2">School Helpline & Front Desk</h3>
          <p className="text-[11px]">Greenfield International School</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Phone: +1 (555) 019-2834 · Email: contact@greenfield.edu
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Campus Office Hours: 08:00 AM – 04:30 PM</p>
        </div>

        {/* Reset Demo Data Action */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-xs mb-1">Sandbox Demo Operations</h3>
          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
            Reset Greenfield International School records back to clean initial state.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 hover:border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onExit}
          className="w-full py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors border border-rose-200/60"
        >
          <LogOut className="w-4 h-4" />
          Sign Out / Return to Portal
        </button>

        {/* Modal: Confirm Reset */}
        {showResetConfirm && (
          <Modal
            isOpen={showResetConfirm}
            onClose={() => setShowResetConfirm(false)}
            title="Reset Greenfield Demo Data?"
            subtitle="Restore all school records back to the pristine demo dataset."
          >
            <div className="text-xs space-y-4">
              <p className="text-slate-600 leading-relaxed">
                This will reset all students, attendance registers, exam marks, fee receipts, and library logs back to the clean seed dataset.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetDemoData();
                    setShowResetConfirm(false);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Yes, Reset All
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  };

  return (
    <div>
      {activeTab === 'home' && renderHome()}
      {activeTab === 'attendance' && renderAttendance()}
      {activeTab === 'academics' && renderAcademics()}
      {activeTab === 'fees' && renderFees()}
      {activeTab === 'more' && renderMore()}

      {/* Notice View Modal */}
      {selectedNoticeForView && (
        <Modal
          isOpen={!!selectedNoticeForView}
          onClose={() => setSelectedNoticeForView(null)}
          title={selectedNoticeForView.title}
          subtitle={`Category: ${selectedNoticeForView.category} · Date: ${selectedNoticeForView.date}`}
        >
          <div className="text-xs space-y-3">
            <p className="text-slate-700 leading-relaxed">{selectedNoticeForView.content}</p>
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Published by: {selectedNoticeForView.author} · Target: {selectedNoticeForView.targetAudience}
            </div>
          </div>
        </Modal>
      )}

      {/* Assignment Detail Modal */}
      {selectedAssignmentModal && (
        <Modal
          isOpen={!!selectedAssignmentModal}
          onClose={() => setSelectedAssignmentModal(null)}
          title={selectedAssignmentModal.title}
          subtitle={`${selectedAssignmentModal.subject} · Due ${selectedAssignmentModal.dueDate}`}
        >
          <div className="text-xs space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Class Cohort:</span>
                <span className="font-bold text-slate-900">{selectedAssignmentModal.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Instructor:</span>
                <span className="font-medium text-slate-800">{selectedAssignmentModal.teacherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Due Date:</span>
                <span className="font-mono font-bold text-amber-700">{selectedAssignmentModal.dueDate}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Assignment Instructions:</h4>
              <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                {selectedAssignmentModal.description}
              </p>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setSelectedAssignmentModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Report Card Modal */}
      {isReportCardOpen && (
        <Modal
          isOpen={isReportCardOpen}
          onClose={() => setIsReportCardOpen(false)}
          title="Official Term 1 Transcript"
          subtitle={`${child.name} · ${child.class} · Greenfield International School`}
        >
          <div className="p-4 bg-slate-50 border rounded-xl space-y-3 text-xs">
            <div className="text-center pb-2 border-b">
              <span className="font-bold text-slate-900 block text-sm">
                GREENFIELD INTERNATIONAL SCHOOL
              </span>
              <span className="text-[10px] text-slate-500">
                Student Progress Report Card · Academic Session 2026-2027
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                Student: <strong className="text-slate-900">{child.name}</strong>
              </div>
              <div>
                Roll No: <strong className="text-slate-900">#{child.rollNo}</strong>
              </div>
              <div>
                Cohort: <strong className="text-slate-900">{child.class}</strong>
              </div>
              <div>
                Attendance:{' '}
                <strong className="text-emerald-700">{child.attendanceRate}%</strong>
              </div>
            </div>

            <div className="border-t pt-2">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="py-1">Subject</th>
                    <th className="py-1 text-center">Marks</th>
                    <th className="py-1 text-right">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {childMarks.map((m) => (
                    <tr key={m.id}>
                      <td className="py-1.5 font-medium">{m.subject}</td>
                      <td className="py-1.5 text-center font-mono">{m.marks}/100</td>
                      <td className="py-1.5 text-right font-bold font-mono text-emerald-700">
                        {m.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t text-[10px] text-slate-500">
              Teacher Remark:{' '}
              <em>&ldquo;Exhibits exemplary focus, consistent critical thinking velocity, and peer leadership.&rdquo;</em>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              onClick={() => setIsReportCardOpen(false)}
              className="px-4 py-2 text-slate-600 font-semibold text-xs"
            >
              Close
            </button>
            <button
              onClick={() => {
                addToast('Downloaded', `Report Card PDF for ${child.name} downloaded successfully.`, 'info');
                setIsReportCardOpen(false);
              }}
              style={{ backgroundColor: currentTheme.primary }}
              className="px-4 py-2 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Official PDF
            </button>
          </div>
        </Modal>
      )}

      {/* Online Tuition Payment Simulator Modal */}
      {isPaymentModalOpen && childFee && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Tuition Online Settlement"
          subtitle={`Remittance for ${child.name} (${child.class})`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Outstanding Balance:</span>
                <span className="font-mono font-bold text-rose-600 text-sm">
                  ${childFee.pendingAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Due Date:</span>
                <span className="font-medium text-slate-800">{childFee.dueDate}</span>
              </div>
            </div>

            {/* Payment Amount Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Remittance Amount ($)
              </label>
              <input
                type="number"
                min="1"
                max={childFee.pendingAmount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'Card', 'Bank Transfer'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all ${
                      paymentMethod === method
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'UPI' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Virtual Payment Address (VPA / UPI ID)
                </label>
                <input
                  type="text"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="name@okbank"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Transaction Note / Memo
              </label>
              <input
                type="text"
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 text-slate-600 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                Authorize Payment (${paymentAmount.toLocaleString()})
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Receipt Modal */}
      {selectedReceiptForView && (
        <Modal
          isOpen={!!selectedReceiptForView}
          onClose={() => setSelectedReceiptForView(null)}
          title={`Official Receipt #${selectedReceiptForView.receiptNumber}`}
          subtitle="Greenfield International School Finance Division"
        >
          <div className="p-4 bg-slate-50 border rounded-2xl space-y-3 text-xs">
            <div className="text-center pb-2 border-b">
              <span className="font-bold text-slate-900 block text-sm">
                GREENFIELD INTERNATIONAL SCHOOL
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Official Tuition Remittance Acknowledgment
              </span>
            </div>

            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{selectedReceiptForView.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class:</span>
                <span className="font-medium">{selectedReceiptForView.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Cleared:</span>
                <span className="font-mono">{selectedReceiptForView.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel / Method:</span>
                <span className="font-mono">{selectedReceiptForView.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference ID:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedReceiptForView.referenceNumber}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  ${selectedReceiptForView.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t text-[10px] text-slate-400">
              Recorded by: {selectedReceiptForView.recordedBy || 'Finance Office'} · Status: Cleared
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              onClick={() => setSelectedReceiptForView(null)}
              className="px-4 py-2 text-slate-600 font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                addToast('Receipt Downloaded', `Receipt ${selectedReceiptForView.receiptNumber} downloaded.`, 'info');
                setSelectedReceiptForView(null);
              }}
              style={{ backgroundColor: currentTheme.primary }}
              className="px-4 py-2 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF Receipt
            </button>
          </div>
        </Modal>
      )}

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <Modal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          title={`Apply for Student Leave: ${child.name}`}
          subtitle={`${child.class} · Greenfield Attendance Office`}
        >
          <form onSubmit={handleSubmitLeave} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Leave Start Date
                </label>
                <input
                  type="date"
                  value={leaveStartDate}
                  onChange={(e) => setLeaveStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Leave End Date
                </label>
                <input
                  type="date"
                  value={leaveEndDate}
                  onChange={(e) => setLeaveEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Reason Category
              </label>
              <select
                value={leaveReasonCategory}
                onChange={(e) => setLeaveReasonCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
              >
                <option value="Medical">Medical / Physician Clinic Visit</option>
                <option value="Family">Family / Personal Emergency</option>
                <option value="Academic">Extracurricular / Academic Tournament</option>
                <option value="Other">Other Authorized Absence</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Detailed Reason & Notes
              </label>
              <textarea
                rows={3}
                placeholder="Describe reason for leave (e.g. Doctor recommendation for recovery)..."
                value={leaveReasonNotes}
                onChange={(e) => setLeaveReasonNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                required
              />
            </div>

            <div className="pt-2 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="px-4 py-2 text-slate-600 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.primary }}
                className="px-5 py-2 text-white font-bold rounded-xl shadow-xs"
              >
                Submit Application
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Full Guardian Profile Modal */}
      {isProfileModalOpen && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="Guardian Profile & Digital ID"
          subtitle="Vikram Sharma · Greenfield International School"
        >
          <div className="max-h-[75vh] overflow-y-auto pr-1">
            <ProfilePage onBack={() => setIsProfileModalOpen(false)} />
          </div>
        </Modal>
      )}
    </div>
  );
};
