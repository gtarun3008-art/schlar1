import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MetricCard } from '../../common/MetricCard';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';
import { BarChart } from '../../common/Charts';
import { WeeklyTimetable } from '../../common/WeeklyTimetable';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckSquare,
  FileText,
  DollarSign,
  MessageSquare,
  Bell,
  Smartphone,
  BookOpen,
  User,
  Bus,
  Printer,
  Download,
  Send,
  Award,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export const ParentWebView: React.FC = () => {
  const {
    state,
    setSelectedChild,
    setPlatform,
    setActiveNav,
    sendMessage,
    addToast,
  } = useApp();

  const selectedChildId = state.selectedChildId || 'std-aarav';
  const child =
    state.students.find((s) => s.id === selectedChildId) ||
    state.students.find((s) => s.parentEmail === 'vikram.sharma@example.com') ||
    state.students[0];

  const [scheduleDay, setScheduleDay] = useState<
    'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  >('Monday');

  const [replyMessage, setReplyMessage] = useState('');
  const [activeReceiptModal, setActiveReceiptModal] = useState<any | null>(null);

  // Filter marks for this child
  const childMarks = state.marks.filter((m) => m.studentId === child.id);
  const avgMarks =
    childMarks.length > 0
      ? Math.round(
          childMarks.reduce((sum, m) => sum + m.marks, 0) / childMarks.length
        )
      : 86;

  // Assignments for child's class
  const classAssignments = state.assignments.filter(
    (a) => a.class === child.class
  );

  // Fee record
  const feeRecord = state.fees.find((f) => f.studentId === child.id);

  // Notices for parents
  const parentNotices = state.notices.filter(
    (n) =>
      n.targetAudience.includes('All') ||
      n.targetAudience.includes('Parents') ||
      n.targetAudience.includes(child.class) ||
      n.targetAudience.includes('Grade 8') ||
      n.targetAudience.includes('Grade 5')
  );

  // Messaging thread
  const threadId =
    child.id === 'std-aarav' ? 'thr-vikram-sterling' : 'thr-vikram-watson';
  const threadMessages = state.messages.filter((m) => m.threadId === threadId);
  const teacherRecipient =
    child.id === 'std-aarav'
      ? { id: 'tch-sterling', name: 'Marcus Sterling (Math Teacher)' }
      : { id: 'tch-watson', name: 'Emily Watson (Science Teacher)' };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    sendMessage(
      threadId,
      replyMessage.trim(),
      'parent',
      'Vikram Sharma (Parent)',
      teacherRecipient.id,
      teacherRecipient.name
    );
    setReplyMessage('');
    addToast('Message Sent', `Dispatched to ${teacherRecipient.name}`, 'success');
  };

  /* -------------------------------------------------------------
     TOP CHILD SELECTOR HEADER & MOBILE SWITCH
  ------------------------------------------------------------- */
  const renderHeader = () => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              VS
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Guardian Portal — Vikram Sharma
              </h1>
              <p className="text-xs text-slate-500">
                Managing academic records, daily timetables, and school communications.
              </p>
            </div>
          </div>
        </div>

        {/* Children Toggles & Mobile Switch */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <span className="text-[11px] font-semibold text-slate-400 px-2">Student:</span>
            <button
              onClick={() => setSelectedChild('std-aarav')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                child.id === 'std-aarav'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aarav Sharma (Grade 8A)
            </button>
            <button
              onClick={() => setSelectedChild('std-ananya')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                child.id === 'std-ananya'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ananya Sharma (Grade 5B)
            </button>
          </div>

          <button
            onClick={() => setPlatform('mobile')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs border border-indigo-200 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Switch to Mobile View
          </button>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     VIEW 1: PARENT DASHBOARD
  ------------------------------------------------------------- */
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Attendance Rate"
          value={`${child.attendanceRate}%`}
          subtitle="Year-to-date regular"
          icon={<CheckSquare className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Academic Score Avg"
          value={`${avgMarks}%`}
          subtitle={`${childMarks.length} subjects evaluated`}
          icon={<Award className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="Active Homework"
          value={`${classAssignments.length} Assignments`}
          subtitle="Due next week"
          icon={<FileText className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Tuition Due"
          value={
            feeRecord?.pendingAmount && feeRecord.pendingAmount > 0
              ? `$${feeRecord.pendingAmount}`
              : 'Paid in Full'
          }
          subtitle={`Status: ${feeRecord?.status || 'Paid'}`}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Timetable Card & Daily Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                {child.name}'s Class Schedule ({scheduleDay})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official instructional periods for {child.class} (Room {child.class === 'Grade 8A' ? '101' : '104'})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map(
                  (d) => (
                    <button
                      key={d}
                      onClick={() => setScheduleDay(d)}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        scheduleDay === d
                          ? 'bg-white text-indigo-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setActiveNav('timetable')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Full Week →
              </button>
            </div>
          </div>

          {(() => {
            const daySlots = state.timetable
              .filter((s) => s.class === child.class && s.day === scheduleDay)
              .sort((a, b) => a.periodNumber - b.periodNumber);

            if (daySlots.length === 0) {
              return (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                  No classes scheduled on {scheduleDay} for {child.class}.
                </div>
              );
            }

            return (
              <div className="space-y-2 text-xs">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{slot.subject}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {slot.period}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-100 text-slate-600">
                          {slot.type}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px] mt-0.5 block">
                        {slot.time} · Faculty: {slot.teacherName}
                      </span>
                    </div>
                    <span className="font-mono text-slate-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                      {slot.room}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* School Bus & Quick Notices */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bus className="w-4 h-4 text-amber-600" />
                Bus Route GPS Tracking
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                On Schedule
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Route Number:</span>
                <span className="font-bold text-slate-900">Route #04 (North Corridor)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver & Vehicle:</span>
                <span className="font-medium text-slate-800">Gary Jenkins · Bus #B-42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Morning Pickup:</span>
                <span className="font-mono font-semibold text-slate-700">07:42 AM (Pine Valley)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Afternoon ETA:</span>
                <span className="font-mono font-bold text-emerald-700">03:45 PM</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                Important Circulars
              </h3>
              <button
                onClick={() => setActiveNav('notices')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                All ({parentNotices.length}) →
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {parentNotices.slice(0, 2).map((n) => (
                <div key={n.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={n.category} />
                    <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-1">{n.title}</h4>
                  <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     VIEW 2: WEEKLY TIMETABLE TAB
  ------------------------------------------------------------- */
  const renderTimetable = () => (
    <WeeklyTimetable
      initialClass={child.class}
      canEdit={false}
      title={`${child.name}'s Weekly Timetable — ${child.class}`}
      subtitle={`Official 5-day academic master schedule with all 7 instructional periods, faculty assignments, and lab rooms.`}
    />
  );

  /* -------------------------------------------------------------
     VIEW 3: ACADEMICS & REPORT CARDS
  ------------------------------------------------------------- */
  const renderAcademics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {child.name} — Academic Attainment & Report Cards
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Published term examination marks, subject evaluations, and grade standing.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Overall Standing</span>
          <span className="text-base font-bold text-emerald-600">{child.academicStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Subject Attainment (%)</h3>
          <BarChart
            data={childMarks.map((m) => ({
              label: m.subject.split(' ')[0],
              value: m.marks,
              displayValue: `${m.marks}%`,
            }))}
            height={200}
            valueSuffix="%"
          />
        </div>

        {/* Detailed Marks Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Term 1 Score Transcript
            </h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Assessment</th>
                <th className="px-4 py-3 font-mono text-center">Score</th>
                <th className="px-4 py-3 font-mono text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {childMarks.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-bold text-slate-900">{m.subject}</td>
                  <td className="px-4 py-3 text-slate-500">{m.exam}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-center text-slate-800">
                    {m.marks}/{m.maxMarks}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {m.grade}
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
     VIEW 4: ATTENDANCE
  ------------------------------------------------------------- */
  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {child.name} — Year-To-Date Attendance Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Attendance compliance recorded at morning roll call.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Attendance Rate</span>
          <span className="text-xl font-mono font-bold text-emerald-600">
            {child.attendanceRate}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Days Present</span>
          <span className="text-2xl font-mono font-bold text-emerald-600 mt-1 block">48 Days</span>
          <span className="text-[11px] text-slate-400 mt-1 block">96% compliant</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs text-slate-500 block">Excused Leaves</span>
          <span className="text-2xl font-mono font-bold text-rose-600 mt-1 block">2 Days</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Medical notes verified</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs text-slate-500 block">Late Arrivals</span>
          <span className="text-2xl font-mono font-bold text-amber-600 mt-1 block">1 Day</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Under 15 minutes</span>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     VIEW 5: ASSIGNMENTS
  ------------------------------------------------------------- */
  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">
          Curriculum Assignments — {child.class}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Active homework sets, laboratory portfolios, and submission deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classAssignments.map((asg) => (
          <div key={asg.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {asg.subject}
              </span>
              <StatusBadge status={asg.status} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">{asg.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Faculty: {asg.teacherName}</p>
            <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {asg.description}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Due: <strong className="text-slate-800">{asg.dueDate}</strong></span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Class Submissions: {asg.submissionCount}/{asg.totalStudents}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     VIEW 6: FEES & RECEIPTS
  ------------------------------------------------------------- */
  const renderFees = () => {
    const studentPayments = state.payments.filter((p) => p.studentId === child.id);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Tuition Billing & Official Receipts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fee account balance, payment records, and tax receipts.
            </p>
          </div>
          {feeRecord && <StatusBadge status={feeRecord.status} />}
        </div>

        {feeRecord && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs text-slate-500 block">Total Tuition Billed</span>
              <span className="text-2xl font-mono font-bold text-slate-900 mt-1 block">
                ${feeRecord.totalFee.toLocaleString()}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs text-slate-500 block">Paid Amount</span>
              <span className="text-2xl font-mono font-bold text-emerald-600 mt-1 block">
                ${feeRecord.paidAmount.toLocaleString()}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs text-slate-500 block">Outstanding Balance</span>
              <span className="text-2xl font-mono font-bold text-rose-600 mt-1 block">
                ${feeRecord.pendingAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Issued Receipts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Payment Receipts History
            </h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Receipt #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 font-mono text-right">Amount</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">{p.receiptNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{p.date}</td>
                  <td className="px-4 py-3">{p.paymentMethod}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{p.referenceNumber}</td>
                  <td className="px-4 py-3 font-mono font-bold text-right text-emerald-700">
                    ${p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setActiveReceiptModal(p)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      View Voucher
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     VIEW 7: MESSAGES
  ------------------------------------------------------------- */
  const renderMessages = () => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Direct Teacher Communication
          </h2>
          <p className="text-xs text-slate-500">
            Private correspondence with {teacherRecipient.name} ({child.name}'s cohort)
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Active Channel
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto p-2">
        {threadMessages.map((msg) => {
          const isMe = msg.senderRole === 'parent';
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-lg ${
                isMe ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <span className="text-[10px] text-slate-400 mb-0.5">
                {msg.senderName} · {msg.timestamp}
              </span>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-100">
        <input
          type="text"
          placeholder={`Message ${teacherRecipient.name}...`}
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );

  /* -------------------------------------------------------------
     VIEW 8: NOTICES
  ------------------------------------------------------------- */
  const renderNotices = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Official Circulars & School Notices</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Announcements, event circulars, examination schedules, and safety advisories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parentNotices.map((n) => (
          <div key={n.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <StatusBadge status={n.category} />
              <span className="text-xs font-mono text-slate-400">{n.date}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">{n.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Author: {n.author}</p>
            <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {n.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     VIEW 9: STUDENT PROFILE
  ------------------------------------------------------------- */
  const renderProfile = () => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center">
          {child.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{child.name}</h2>
          <p className="text-xs text-slate-500 font-mono">
            Admission ID: {child.admissionId} · Roll #{child.rollNo}
          </p>
          <span className="inline-block mt-1 font-semibold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {child.class} (Section {child.section})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block">Date of Birth:</span>
          <span className="font-semibold text-slate-800">{child.dob}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block">Blood Group:</span>
          <span className="font-semibold text-slate-800">{child.bloodGroup || 'O+'}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block">Class Teacher:</span>
          <span className="font-semibold text-slate-800">
            {child.class === 'Grade 8A' ? 'David Kim' : 'Emily Watson'}
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-400 block">Emergency Guardian Contact:</span>
          <span className="font-semibold text-slate-800">{child.parentPhone}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {renderHeader()}

      {state.activeNav === 'dashboard' && renderDashboard()}
      {state.activeNav === 'timetable' && renderTimetable()}
      {state.activeNav === 'academics' && renderAcademics()}
      {state.activeNav === 'attendance' && renderAttendance()}
      {state.activeNav === 'assignments' && renderAssignments()}
      {state.activeNav === 'fees' && renderFees()}
      {state.activeNav === 'messages' && renderMessages()}
      {state.activeNav === 'notices' && renderNotices()}
      {state.activeNav === 'children' && renderProfile()}
      {state.activeNav === 'settings' && renderProfile()}

      {/* Payment Receipt Voucher Modal */}
      {activeReceiptModal && (
        <Modal
          isOpen={!!activeReceiptModal}
          onClose={() => setActiveReceiptModal(null)}
          title="Official Tuition Fee Receipt"
        >
          <div className="space-y-4 text-xs">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
              <h3 className="font-bold text-slate-900 text-sm">Greenfield International School</h3>
              <p className="text-[11px] text-slate-500">Official Institutional Fee Voucher</p>
              <div className="mt-2 font-mono text-base font-bold text-indigo-700">
                {activeReceiptModal.receiptNumber}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Student:</span>
                <span className="font-bold text-slate-900">{activeReceiptModal.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Class / Cohort:</span>
                <span className="font-bold text-slate-900">{activeReceiptModal.class}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Date:</span>
                <span className="font-mono text-slate-800">{activeReceiptModal.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Method:</span>
                <span className="font-semibold text-slate-800">{activeReceiptModal.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Transaction Reference:</span>
                <span className="font-mono text-slate-800">{activeReceiptModal.referenceNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Amount Paid:</span>
                <span className="font-mono text-base font-bold text-emerald-600">
                  ${activeReceiptModal.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Voucher
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
