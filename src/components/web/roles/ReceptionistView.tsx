import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { MetricCard } from '../../common/MetricCard';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';
import { Enquiry, Student, FrontOfficeCommunicationLog, Appointment } from '../../../types';
import { StudentProfileModal } from '../../records/StudentProfileModal';
import { NoticeBoardModule } from '../../shared/NoticeBoardModule';
import { ReportExportFoundation } from '../../shared/ReportExportFoundation';
import {
  UserCheck,
  Users,
  Calendar,
  Clock,
  Plus,
  LogIn,
  LogOut,
  Search,
  Filter,
  Phone,
  Printer,
  GraduationCap,
  Bell,
  CheckCircle2,
  FileText,
  AlertCircle,
  ShieldCheck,
  Download,
  Building,
  Mail,
  MapPin,
  Eye,
  Edit2,
  PhoneCall,
  Package,
  MessageSquare,
  User,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

const COMM_LOGS_STORAGE_KEY = 'schlar_receptionist_comm_logs_v1';
const APPOINTMENTS_STORAGE_KEY = 'schlar_receptionist_appointments_v1';

const INITIAL_COMM_LOGS: FrontOfficeCommunicationLog[] = [
  {
    id: 'comm-1',
    date: '2026-10-24',
    time: '08:45 AM',
    type: 'Inbound Call',
    callerOrVisitorName: 'Mrs. Eleanor Vance',
    contactNumber: '+1 (555) 302-8841',
    relatedPerson: 'Kevin Vance (Grade 10B)',
    subject: 'Late arrival notification',
    details: 'Student Kevin has a morning dental appointment; will arrive on campus by 10:15 AM. Notification forwarded to homeroom teacher Ms. Bennett.',
    status: 'Resolved',
    handledBy: 'Clara Oswald',
  },
  {
    id: 'comm-2',
    date: '2026-10-24',
    time: '09:20 AM',
    type: 'Courier / Parcel',
    callerOrVisitorName: 'Apex Express Logistics (Courier Dave)',
    contactNumber: '+1 (555) 700-1122',
    relatedPerson: 'Dr. Aris Thorne (Robotics Lab)',
    subject: 'Urgent STEM Microcontrollers Package',
    details: 'Tracking #APX-99410. Received at front desk, signed security register, and informed Dr. Thorne via campus intercom.',
    status: 'Resolved',
    handledBy: 'Clara Oswald',
  },
  {
    id: 'comm-3',
    date: '2026-10-24',
    time: '10:15 AM',
    type: 'Emergency Message',
    callerOrVisitorName: 'David Sharma (Uncle)',
    contactNumber: '+1 (555) 412-9900',
    relatedPerson: 'Aarav Sharma (Grade 8A)',
    subject: 'Early pickup authorization message',
    details: 'Parent Vikram Sharma authorized uncle David to pick up Aarav at 02:00 PM for family emergency. Emergency contact verified against student registry.',
    status: 'Message Passed',
    handledBy: 'Clara Oswald',
  },
  {
    id: 'comm-4',
    date: '2026-10-24',
    time: '11:05 AM',
    type: 'Front Desk Inquiry',
    callerOrVisitorName: 'Arthur & Martha Clark',
    contactNumber: '+1 (555) 604-3311',
    relatedPerson: 'Prospective Grade 9 candidate',
    subject: 'Walk-in Admissions Prospectus Request',
    details: 'Provided Cambridge IGCSE syllabus booklet, campus tour schedule, and registered admissions enquiry #ENQ-2026-108.',
    status: 'Resolved',
    handledBy: 'Clara Oswald',
  },
  {
    id: 'comm-5',
    date: '2026-10-23',
    time: '03:30 PM',
    type: 'Outbound Call',
    callerOrVisitorName: 'Front Desk -> City Bus Transit',
    contactNumber: '+1 (555) 890-4411',
    relatedPerson: 'Route 4 Bus Dispatcher',
    subject: 'Inquiry regarding traffic delay on Elm Street',
    details: 'Confirmed 15-minute delay due to municipal road resurfacing. Dispatched parent SMS alert through administration.',
    status: 'Resolved',
    handledBy: 'Clara Oswald',
  },
];

const EMERGENCY_CONTACTS = [
  { department: 'Campus Main Reception', extension: 'Ext. 100 / 101', contactPerson: 'Clara Oswald', phone: '+1 (555) 019-1000', location: 'Administration Block, Level 1', hours: '07:30 AM - 05:00 PM' },
  { department: 'Principal Executive Office', extension: 'Ext. 102', contactPerson: 'Dr. Robert Hayes (Principal)', phone: '+1 (555) 019-1002', location: 'Admin Suite A-10', hours: '08:00 AM - 04:30 PM' },
  { department: 'Vice Principal Academics', extension: 'Ext. 105', contactPerson: 'Sarah Jenkins (VP)', phone: '+1 (555) 019-1005', location: 'Academic Wing Room 102', hours: '08:00 AM - 04:30 PM' },
  { department: 'Health Clinic & Campus Infirmary', extension: 'Ext. 199 (Emergency)', contactPerson: 'Nurse Evelyn Reed, RN', phone: '+1 (555) 019-1199', location: 'Wellness Pavilion Ground Floor', hours: '24/7 School Hours' },
  { department: 'Campus Security & Gate 1 Control', extension: 'Ext. 111 / 112', contactPerson: 'Chief Guard James Miller', phone: '+1 (555) 019-1111', location: 'Main Boulevard Gatehouse', hours: '24 Hours On-Duty' },
  { department: 'Pupil Transport & Fleet Dispatch', extension: 'Ext. 130', contactPerson: 'Robert Sterling (Transport Mgr)', phone: '+1 (555) 019-1130', location: 'East Transit Depot', hours: '06:00 AM - 06:30 PM' },
  { department: 'Accounts & Bursar Office', extension: 'Ext. 120', contactPerson: 'Edward Fletcher (Accountant)', phone: '+1 (555) 019-1120', location: 'Admin Suite B-04', hours: '08:30 AM - 04:00 PM' },
  { department: 'IT Systems & Access Helpdesk', extension: 'Ext. 140', contactPerson: 'Alex Chen (Network Admin)', phone: '+1 (555) 019-1140', location: 'Library Lower Level', hours: '08:00 AM - 05:00 PM' },
];

export const ReceptionistView: React.FC = () => {
  const {
    state,
    checkInVisitor,
    checkOutVisitor,
    updateEnquiryStatus,
    addEnquiry,
    addToast,
    updateStudent,
    convertEnquiryToStudent,
    setActiveNav,
  } = useApp();

  // Communication logs persistence
  const [commLogs, setCommLogs] = useState<FrontOfficeCommunicationLog[]>(() => {
    try {
      const saved = localStorage.getItem(COMM_LOGS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_COMM_LOGS;
    } catch {
      return INITIAL_COMM_LOGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COMM_LOGS_STORAGE_KEY, JSON.stringify(commLogs));
    } catch (e) {
      console.error('Failed to save communication logs', e);
    }
  }, [commLogs]);

  // Appointments persistence & merge
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return state.appointments.map((a) => ({
      ...a,
      purpose: a.purpose || 'School Consultation',
      status: (a.status || 'Scheduled') as Appointment['status'],
      hostDepartment: a.hostDepartment || 'Administration',
    }));
  });

  useEffect(() => {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.error('Failed to save appointments', e);
    }
  }, [appointments]);

  useEffect(() => {
    const handleReset = () => {
      setCommLogs(INITIAL_COMM_LOGS);
      setAppointments(
        state.appointments.map((a) => ({
          ...a,
          purpose: a.purpose || 'School Consultation',
          status: (a.status || 'Scheduled') as Appointment['status'],
          hostDepartment: a.hostDepartment || 'Administration',
        }))
      );
    };
    window.addEventListener('schlar_demo_reset', handleReset);
    return () => window.removeEventListener('schlar_demo_reset', handleReset);
  }, [state.appointments]);

  // Search & Filters
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorFilter, setVisitorFilter] = useState<'All' | 'Checked In' | 'Checked Out'>('All');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryGradeFilter, setEnquiryGradeFilter] = useState('All');
  const [enquiryStageFilter, setEnquiryStageFilter] = useState<string>('All');
  const [studentDirectorySearch, setStudentDirectorySearch] = useState('');
  const [staffDirectorySearch, setStaffDirectorySearch] = useState('');
  const [staffDeptFilter, setStaffDeptFilter] = useState('All');
  const [commLogSearch, setCommLogSearch] = useState('');
  const [commLogTypeFilter, setCommLogTypeFilter] = useState('All');

  // Modals
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isCommLogModalOpen, setIsCommLogModalOpen] = useState(false);
  const [isEmergencyCardOpen, setIsEmergencyCardOpen] = useState(false);
  const [selectedStudentForEmergency, setSelectedStudentForEmergency] = useState<Student | null>(null);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<any | null>(null);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [activeGatePass, setActiveGatePass] = useState<any | null>(null);
  const [selectedEnquiryForFollowUp, setSelectedEnquiryForFollowUp] = useState<Enquiry | null>(null);
  const [followUpNote, setFollowUpNote] = useState('');
  const [selectedEnquiryForConvert, setSelectedEnquiryForConvert] = useState<Enquiry | null>(null);
  const [targetClassForEnrollment, setTargetClassForEnrollment] = useState('Grade 8A');

  // Visitor Check-In Form
  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    purpose: '',
    personToMeet: 'Dr. Robert Hayes (Principal)',
    phone: '',
    organization: '',
    badgeNumber: '',
    hostDepartment: 'Administration',
    notes: '',
  });

  // Appointment Form
  const [appointmentForm, setAppointmentForm] = useState({
    parentName: '',
    studentName: '',
    withPerson: 'Dr. Robert Hayes (Principal)',
    hostDepartment: 'Administration',
    date: '2026-10-25',
    time: '10:00 AM',
    purpose: 'Parent-Teacher Progress Consultation',
    phone: '',
    notes: '',
  });

  // Enquiry Form
  const [enquiryForm, setEnquiryForm] = useState({
    parentName: '',
    studentName: '',
    grade: 'Grade 8A',
    contact: '',
    email: '',
    source: 'Walk-in' as Enquiry['source'],
    notes: '',
    status: 'New' as Enquiry['status'],
    assignedStaff: 'Clara Oswald',
  });

  // Comm Log Form
  const [commLogForm, setCommLogForm] = useState({
    type: 'Inbound Call' as FrontOfficeCommunicationLog['type'],
    callerOrVisitorName: '',
    contactNumber: '',
    relatedPerson: '',
    subject: '',
    details: '',
    status: 'Resolved' as FrontOfficeCommunicationLog['status'],
  });

  // Live Visitor counts
  const checkedInVisitors = state.visitors.filter((v) => v.status === 'Checked In');
  const newEnquiriesCount = state.enquiries.filter((e) => e.status === 'New').length;
  const todayAppointments = appointments.filter((a) => a.date === '2026-10-24' || a.status === 'Scheduled');

  // Handlers
  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorForm.visitorName.trim() || !visitorForm.purpose.trim()) {
      addToast('Validation', 'Please provide visitor name and visit purpose.', 'error');
      return;
    }

    const badgeCode = visitorForm.badgeNumber.trim() || `VIS-${Math.floor(100 + Math.random() * 900)}`;

    checkInVisitor({
      visitorName: visitorForm.visitorName.trim(),
      purpose: visitorForm.purpose.trim(),
      personToMeet: visitorForm.personToMeet,
      phone: visitorForm.phone || '+1 (555) 000-0000',
    });

    setIsVisitorModalOpen(false);
    setActiveGatePass({
      passNumber: badgeCode,
      visitorName: visitorForm.visitorName.trim(),
      organization: visitorForm.organization.trim() || 'Visitor / Guardian',
      purpose: visitorForm.purpose.trim(),
      personToMeet: visitorForm.personToMeet,
      hostDepartment: visitorForm.hostDepartment,
      phone: visitorForm.phone || '+1 (555) 000-0000',
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
    });

    setVisitorForm({
      visitorName: '',
      purpose: '',
      personToMeet: 'Dr. Robert Hayes (Principal)',
      phone: '',
      organization: '',
      badgeNumber: '',
      hostDepartment: 'Administration',
      notes: '',
    });
  };

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentForm.parentName.trim()) {
      addToast('Validation', 'Parent or visitor name is required.', 'error');
      return;
    }

    const newApt: Appointment = {
      id: 'apt-' + Date.now(),
      parentName: appointmentForm.parentName.trim(),
      studentName: appointmentForm.studentName.trim() || 'N/A',
      withPerson: appointmentForm.withPerson,
      date: appointmentForm.date,
      time: appointmentForm.time,
      purpose: appointmentForm.purpose,
      status: 'Scheduled',
      hostDepartment: appointmentForm.hostDepartment,
      phone: appointmentForm.phone || '+1 (555) 000-0000',
      notes: appointmentForm.notes,
    };

    setAppointments([newApt, ...appointments]);
    setIsAppointmentModalOpen(false);
    addToast('Appointment Booked', `Meeting scheduled with ${newApt.withPerson} on ${newApt.date} at ${newApt.time}.`, 'success');

    setAppointmentForm({
      parentName: '',
      studentName: '',
      withPerson: 'Dr. Robert Hayes (Principal)',
      hostDepartment: 'Administration',
      date: '2026-10-25',
      time: '10:00 AM',
      purpose: 'Parent-Teacher Progress Consultation',
      phone: '',
      notes: '',
    });
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
    addToast('Appointment Updated', `Status changed to ${status}.`, 'info');
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.parentName.trim() || !enquiryForm.studentName.trim()) {
      addToast('Validation', 'Parent and student name are required.', 'error');
      return;
    }

    addEnquiry({
      parentName: enquiryForm.parentName.trim(),
      studentName: enquiryForm.studentName.trim(),
      grade: enquiryForm.grade,
      contact: enquiryForm.contact || '+1 (555) 000-0000',
      email: enquiryForm.email || 'parent@example.com',
      source: enquiryForm.source,
      notes: enquiryForm.notes || 'Inquired at front desk reception.',
      status: enquiryForm.status,
      assignedStaff: enquiryForm.assignedStaff,
    });

    setIsEnquiryModalOpen(false);
    setEnquiryForm({
      parentName: '',
      studentName: '',
      grade: 'Grade 8A',
      contact: '',
      email: '',
      source: 'Walk-in',
      notes: '',
      status: 'New',
      assignedStaff: 'Clara Oswald',
    });
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiryForFollowUp || !followUpNote.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const newHistoryItem = {
      date: today,
      action: 'Front Desk Follow-up',
      note: followUpNote.trim(),
      staff: 'Clara Oswald',
    };

    const updatedNotes = `${selectedEnquiryForFollowUp.notes ? selectedEnquiryForFollowUp.notes + ' | ' : ''}Follow-up: ${followUpNote.trim()}`;

    updateEnquiryStatus(selectedEnquiryForFollowUp.id, 'Follow-up');
    addToast('Follow-Up Saved', `Note recorded for ${selectedEnquiryForFollowUp.studentName}.`, 'success');
    setSelectedEnquiryForFollowUp(null);
    setFollowUpNote('');
  };

  const handleConvertEnquiry = () => {
    if (!selectedEnquiryForConvert) return;
    const res = convertEnquiryToStudent(selectedEnquiryForConvert.id, targetClassForEnrollment, 'A');
    if (res.success) {
      setSelectedEnquiryForConvert(null);
    }
  };

  const handleCommLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commLogForm.callerOrVisitorName.trim() || !commLogForm.subject.trim()) {
      addToast('Validation', 'Caller / Visitor name and subject are required.', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: FrontOfficeCommunicationLog = {
      id: 'comm-' + Date.now(),
      date: today,
      time: nowTime,
      type: commLogForm.type,
      callerOrVisitorName: commLogForm.callerOrVisitorName.trim(),
      contactNumber: commLogForm.contactNumber.trim(),
      relatedPerson: commLogForm.relatedPerson.trim() || 'General Desk',
      subject: commLogForm.subject.trim(),
      details: commLogForm.details.trim(),
      status: commLogForm.status,
      handledBy: 'Clara Oswald',
    };

    setCommLogs([newLog, ...commLogs]);
    setIsCommLogModalOpen(false);
    addToast('Communication Logged', `${newLog.type} recorded in front desk diary.`, 'success');

    setCommLogForm({
      type: 'Inbound Call',
      callerOrVisitorName: '',
      contactNumber: '',
      relatedPerson: '',
      subject: '',
      details: '',
      status: 'Resolved',
    });
  };

  // CSV Export
  const downloadVisitorsCSV = () => {
    const headers = ['Visitor Name', 'Purpose', 'Person to Meet', 'Phone', 'Entry Time', 'Exit Time', 'Status', 'Date'];
    const rows = state.visitors.map((v) => [
      `"${v.visitorName}"`,
      `"${v.purpose}"`,
      `"${v.personToMeet}"`,
      `"${v.phone}"`,
      `"${v.entryTime}"`,
      `"${v.exitTime || 'On Campus'}"`,
      `"${v.status}"`,
      `"${v.date}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greenfield_visitors_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export Complete', 'Visitor register downloaded as CSV.', 'success');
  };

  const downloadEnquiriesCSV = () => {
    const headers = ['Parent Name', 'Student Name', 'Target Grade', 'Phone', 'Email', 'Source', 'Stage', 'Date', 'Notes'];
    const rows = state.enquiries.map((e) => [
      `"${e.parentName}"`,
      `"${e.studentName}"`,
      `"${e.grade}"`,
      `"${e.contact}"`,
      `"${e.email || ''}"`,
      `"${e.source}"`,
      `"${e.status}"`,
      `"${e.date}"`,
      `"${e.notes.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greenfield_admissions_enquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export Complete', 'Admissions enquiries pipeline downloaded as CSV.', 'success');
  };

  /* -------------------------------------------------------------
     MODULE 1: FRONT DESK OVERVIEW / HUB
  ------------------------------------------------------------- */
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              Front Desk & Reception Command
            </span>
            <span className="text-xs text-slate-400 font-mono">Shift: 07:30 AM – 04:30 PM</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Front Office Command — Clara Oswald
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Campus security badge issuance, visitor gate passes, admissions walk-ins, phone communications & parent appointments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsVisitorModalOpen(true)}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Check In Visitor
          </button>
          <button
            onClick={() => setIsEnquiryModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Enquiry
          </button>
          <button
            onClick={() => setIsAppointmentModalOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Calendar className="w-4 h-4 text-cyan-600" />
            Book Meeting
          </button>
          <button
            onClick={() => setIsCommLogModalOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-amber-600" />
            Log Call / Parcel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Visitors On Campus"
          value={checkedInVisitors.length}
          subtitle="Active security badges inside premises"
          icon={<UserCheck className="w-5 h-5 text-cyan-600" />}
        />
        <MetricCard
          title="Today's Gate Entries"
          value={state.visitors.length}
          subtitle="Total visitor check-in logs"
          icon={<Clock className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="Admissions Enquiries"
          value={state.enquiries.length}
          subtitle={`${newEnquiriesCount} new leads awaiting follow-up`}
          icon={<Users className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Appointments Diary"
          value={appointments.length}
          subtitle={`${appointments.filter((a) => a.status === 'Scheduled').length} scheduled meetings`}
          icon={<Calendar className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-cyan-50 to-white rounded-2xl border border-cyan-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Gate Pass & Visitor Control</h3>
            <p className="text-xs text-slate-600 mt-1">
              Issue instant security badges for parents, vendors, and inspectors with arrival timestamps.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-cyan-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-cyan-800 font-semibold">{checkedInVisitors.length} active badge passes</span>
            <button
              onClick={() => setActiveNav('visitor_register')}
              className="text-xs text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1"
            >
              Open Register <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Admissions Pipeline</h3>
            <p className="text-xs text-slate-600 mt-1">
              Guide prospective families from first walk-in enquiry through entrance assessment and enrollment.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-800 font-semibold">{newEnquiriesCount} new walk-ins</span>
            <button
              onClick={() => setActiveNav('enquiries')}
              className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
            >
              View Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-3">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Front Desk Communications</h3>
            <p className="text-xs text-slate-600 mt-1">
              Log parent calls, emergency messages for classrooms, and incoming courier deliveries.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-800 font-semibold">{commLogs.length} logs recorded</span>
            <button
              onClick={() => setActiveNav('communication_log')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              View Calls <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Campus Visitors Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Visitors on School Grounds</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live physical badges. Click &quot;Check Out&quot; when the visitor returns their pass at the security desk.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVisitorModalOpen(true)}
              className="text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Check In Visitor
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Visitor Name</th>
                <th className="px-4 py-3.5">Purpose of Visit</th>
                <th className="px-4 py-3.5">Host Staff / Faculty</th>
                <th className="px-4 py-3.5">Contact Phone</th>
                <th className="px-4 py-3.5">Entry Time</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checkedInVisitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No visitors currently inside school grounds. All badges checked out.
                  </td>
                </tr>
              ) : (
                checkedInVisitors.map((vis) => (
                  <tr key={vis.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">
                        {vis.visitorName.charAt(0)}
                      </div>
                      {vis.visitorName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{vis.purpose}</td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium">{vis.personToMeet}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{vis.phone}</td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">{vis.entryTime}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={vis.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => checkOutVisitor(vis.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold text-xs border border-rose-200 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Check Out
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduled Appointments Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today&apos;s Front Desk Appointments</h3>
            <p className="text-xs text-slate-500">Parent meetings and leadership consultations.</p>
          </div>
          <button
            onClick={() => setIsAppointmentModalOpen(true)}
            className="text-xs text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Book Appointment
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {appointments.slice(0, 3).map((apt) => (
            <div key={apt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">{apt.parentName}</span>
                  <StatusBadge status={apt.status} />
                </div>
                <p className="text-slate-600 text-xs">
                  Student: <span className="font-semibold text-slate-800">{apt.studentName}</span>
                </p>
                <p className="text-cyan-700 font-medium text-xs mt-1">Host: {apt.withPerson}</p>
                <p className="text-slate-500 text-[11px] mt-1 italic">&quot;{apt.purpose}&quot;</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{apt.date}</span>
                <span className="font-bold text-slate-700">{apt.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 2: VISITOR REGISTER
  ------------------------------------------------------------- */
  const renderVisitorRegister = () => {
    const filteredVisitors = state.visitors.filter((v) => {
      const matchSearch =
        v.visitorName.toLowerCase().includes(visitorSearch.toLowerCase()) ||
        v.personToMeet.toLowerCase().includes(visitorSearch.toLowerCase()) ||
        v.purpose.toLowerCase().includes(visitorSearch.toLowerCase());
      const matchFilter = visitorFilter === 'All' || v.status === visitorFilter;
      return matchSearch && matchFilter;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Campus Visitor Register & Ledger</h2>
            <p className="text-xs text-slate-500 mt-1">
              Physical campus entry log, security badge issuance, departure timestamps, and compliance records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadVisitorsCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              onClick={() => setIsVisitorModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              Check In Visitor
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search visitor, host, or purpose..."
                value={visitorSearch}
                onChange={(e) => setVisitorSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVisitorFilter('All')}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  visitorFilter === 'All' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Records ({state.visitors.length})
              </button>
              <button
                onClick={() => setVisitorFilter('Checked In')}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  visitorFilter === 'Checked In' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                On Campus ({checkedInVisitors.length})
              </button>
              <button
                onClick={() => setVisitorFilter('Checked Out')}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  visitorFilter === 'Checked Out' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Checked Out ({state.visitors.length - checkedInVisitors.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Visitor</th>
                  <th className="px-4 py-3.5">Purpose</th>
                  <th className="px-4 py-3.5">Person to Meet</th>
                  <th className="px-4 py-3.5">Contact Phone</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">In Time</th>
                  <th className="px-4 py-3.5">Out Time</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisitors.map((vis) => (
                  <tr key={vis.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{vis.visitorName}</td>
                    <td className="px-4 py-3.5 text-slate-700">{vis.purpose}</td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium">{vis.personToMeet}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{vis.phone}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{vis.date}</td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">{vis.entryTime}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{vis.exitTime || '—'}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={vis.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {vis.status === 'Checked In' ? (
                        <button
                          onClick={() => checkOutVisitor(vis.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md font-semibold text-xs border border-rose-200 transition-colors inline-flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3" />
                          Check Out
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     MODULE 3: CHECK-IN / CHECK-OUT DESK (INTERACTIVE)
  ------------------------------------------------------------- */
  const renderCheckInDesk = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Check-In & Check-Out Operations Desk</h2>
          <p className="text-xs text-slate-500 mt-1">
            Immediate visitor entry registration, security badge generation, host notification, and barcode gate pass printer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fast Check-In Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <LogIn className="w-5 h-5 text-cyan-600" />
            <h3 className="font-bold text-slate-900 text-base">Register Incoming Visitor</h3>
          </div>

          <form onSubmit={handleVisitorSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Visitor Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Pendelton"
                  value={visitorForm.visitorName}
                  onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organization / Relation</label>
                <input
                  type="text"
                  placeholder="e.g. Guardian / Cambridge Assessment / Vendor"
                  value={visitorForm.organization}
                  onChange={(e) => setVisitorForm({ ...visitorForm, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={visitorForm.phone}
                  onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Visitor Badge # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. VIS-104 (Auto-assigned if empty)"
                  value={visitorForm.badgeNumber}
                  onChange={(e) => setVisitorForm({ ...visitorForm, badgeNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Host Staff / Person to Meet</label>
                <select
                  value={visitorForm.personToMeet}
                  onChange={(e) => setVisitorForm({ ...visitorForm, personToMeet: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Dr. Robert Hayes (Principal)">Dr. Robert Hayes (Principal)</option>
                  <option value="Sarah Jenkins (VP Academics)">Sarah Jenkins (VP Academics)</option>
                  <option value="Marcus Sterling (Teacher)">Marcus Sterling (Teacher)</option>
                  <option value="Laura Bennett (Physics Faculty)">Laura Bennett (Physics Faculty)</option>
                  <option value="David Kim (Literature Teacher)">David Kim (Literature Teacher)</option>
                  <option value="Edward Fletcher (Accountant)">Edward Fletcher (Accountant)</option>
                  <option value="Clara Oswald (Head Receptionist)">Clara Oswald (Head Receptionist)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Host Department</label>
                <select
                  value={visitorForm.hostDepartment}
                  onChange={(e) => setVisitorForm({ ...visitorForm, hostDepartment: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Administration">Administration</option>
                  <option value="Academic Faculty">Academic Faculty</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                  <option value="Health Clinic">Health Clinic</option>
                  <option value="Transport Operations">Transport Operations</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Purpose of Visit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Admissions Consultation / Parent Progress Review / Equipment Service"
                value={visitorForm.purpose}
                onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Issue Campus Pass & Check In
              </button>
            </div>
          </form>
        </div>

        {/* Quick Check-Out Scanner / Search */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <LogOut className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-base">Quick Departure Check-Out</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              When visitors surrender their badge at the front gate, click check out to log departure timestamp.
            </p>

            <div className="space-y-3">
              {checkedInVisitors.map((v) => (
                <div key={v.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{v.visitorName}</h4>
                    <p className="text-[11px] text-slate-500">Host: {v.personToMeet}</p>
                    <p className="text-[10px] text-slate-400 font-mono">In: {v.entryTime}</p>
                  </div>
                  <button
                    onClick={() => checkOutVisitor(v.id)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Check Out
                  </button>
                </div>
              ))}
              {checkedInVisitors.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-6">All registered visitors have departed.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Passes must be accounted for before 05:00 PM security sweep.
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 4: APPOINTMENTS DIARY
  ------------------------------------------------------------- */
  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Front Desk Appointments Diary</h2>
          <p className="text-xs text-slate-500 mt-1">
            Parent conferences, leadership appointments, admissions tours, and faculty office hours.
          </p>
        </div>
        <button
          onClick={() => setIsAppointmentModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Calendar className="w-4 h-4" />
          Schedule Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        {appointments.map((apt) => (
          <div key={apt.id} className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-cyan-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900 text-sm">{apt.parentName}</span>
                <StatusBadge status={apt.status} />
              </div>
              <p className="text-slate-600 mb-1">
                Student: <span className="font-semibold text-slate-800">{apt.studentName}</span>
              </p>
              <p className="text-cyan-700 font-medium mb-1">Host: {apt.withPerson}</p>
              <p className="text-slate-600 text-xs mb-2">Purpose: {apt.purpose}</p>
              {apt.notes && <p className="text-slate-400 text-[11px] italic bg-slate-50 p-2 rounded-lg">{apt.notes}</p>}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between font-mono text-slate-500">
                <span>{apt.date}</span>
                <span className="font-bold text-slate-800">{apt.time}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                {apt.status === 'Scheduled' && (
                  <>
                    <button
                      onClick={() => handleUpdateAppointmentStatus(apt.id, 'Completed')}
                      className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded text-[11px] font-semibold"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleUpdateAppointmentStatus(apt.id, 'Cancelled')}
                      className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded text-[11px] font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 5: GENERAL ENQUIRIES
  ------------------------------------------------------------- */
  const renderEnquiries = () => {
    const filtered = state.enquiries.filter((enq) => {
      const matchSearch =
        enq.parentName.toLowerCase().includes(enquirySearch.toLowerCase()) ||
        enq.studentName.toLowerCase().includes(enquirySearch.toLowerCase()) ||
        enq.notes.toLowerCase().includes(enquirySearch.toLowerCase());
      const matchGrade = enquiryGradeFilter === 'All' || enq.grade === enquiryGradeFilter;
      const matchStage = enquiryStageFilter === 'All' || enq.status === enquiryStageFilter;
      return matchSearch && matchGrade && matchStage;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">General Enquiries Pipeline</h2>
            <p className="text-xs text-slate-500 mt-1">
              Log phone inquiries, walk-in visits, website requests, follow-up callbacks, and status progressions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadEnquiriesCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Enquiries
            </button>
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Log New Enquiry
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search parent, student, or notes..."
                value={enquirySearch}
                onChange={(e) => setEnquirySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={enquiryStageFilter}
                onChange={(e) => setEnquiryStageFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="All">All Stages</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Under Review">Under Review</option>
                <option value="Accepted">Accepted</option>
                <option value="Converted">Converted</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={enquiryGradeFilter}
                onChange={(e) => setEnquiryGradeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="All">All Grades</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 5B">Grade 5B</option>
                <option value="Grade 7B">Grade 7B</option>
                <option value="Grade 8A">Grade 8A</option>
                <option value="Grade 9A">Grade 9A</option>
                <option value="Grade 10A">Grade 10A</option>
                <option value="Grade 10B">Grade 10B</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Parent / Guardian</th>
                  <th className="px-4 py-3.5">Student Candidate</th>
                  <th className="px-4 py-3.5">Grade</th>
                  <th className="px-4 py-3.5">Contact Phone</th>
                  <th className="px-4 py-3.5">Source</th>
                  <th className="px-4 py-3.5">Notes & Requirements</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{enq.parentName}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{enq.studentName}</td>
                    <td className="px-4 py-3.5 font-semibold text-cyan-700">{enq.grade}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{enq.contact}</td>
                    <td className="px-4 py-3.5 text-slate-600">{enq.source}</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-[200px] truncate" title={enq.notes}>
                      {enq.notes}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={enq.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedEnquiryForFollowUp(enq);
                            setFollowUpNote('');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs border border-slate-200"
                        >
                          + Follow-Up
                        </button>
                        <select
                          value={enq.status}
                          onChange={(e) => updateEnquiryStatus(enq.id, e.target.value as any)}
                          className="px-2 py-1 rounded-md border border-slate-200 text-xs bg-white font-medium"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Converted">Converted</option>
                          <option value="Waitlisted">Waitlisted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     MODULE 6: ADMISSIONS TRACKING (SAFEGUARDED PIPELINE)
  ------------------------------------------------------------- */
  const renderAdmissionsTracking = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Prospective Admissions Pipeline</h2>
          <p className="text-xs text-slate-500 mt-1">
            Formal prospective student intake pipeline. Inquiries are tracked through assessment stages before formal enrollment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
            Safeguard: Formal Conversion Only When Accepted
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stage 1: New Leads */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">1. Initial Inquiry</h3>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-mono text-[11px] font-bold">
              {state.enquiries.filter((e) => e.status === 'New' || e.status === 'Contacted').length}
            </span>
          </div>
          <div className="space-y-3">
            {state.enquiries
              .filter((e) => e.status === 'New' || e.status === 'Contacted')
              .map((enq) => (
                <div key={enq.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900">{enq.studentName}</span>
                    <span className="text-[10px] text-cyan-700 font-bold">{enq.grade}</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Parent: {enq.parentName}</p>
                  <p className="text-slate-400 text-[10px] font-mono mt-1">{enq.contact}</p>
                  <button
                    onClick={() => updateEnquiryStatus(enq.id, 'Follow-up')}
                    className="mt-2.5 w-full py-1 text-center bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-semibold text-slate-700"
                  >
                    Advance to Follow-up
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Stage 2: Assessment / Follow-Up */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">2. Assessment & Review</h3>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-mono text-[11px] font-bold">
              {state.enquiries.filter((e) => e.status === 'Follow-up' || e.status === 'Under Review').length}
            </span>
          </div>
          <div className="space-y-3">
            {state.enquiries
              .filter((e) => e.status === 'Follow-up' || e.status === 'Under Review')
              .map((enq) => (
                <div key={enq.id} className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-200/70 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900">{enq.studentName}</span>
                    <span className="text-[10px] text-indigo-700 font-bold">{enq.grade}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">Parent: {enq.parentName}</p>
                  <p className="text-slate-500 text-[10px] mt-1">{enq.notes}</p>
                  <button
                    onClick={() => updateEnquiryStatus(enq.id, 'Accepted')}
                    className="mt-2.5 w-full py-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold"
                  >
                    Clear For Admission
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Stage 3: Accepted (Ready to Enroll) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-emerald-800 text-xs uppercase tracking-wider">3. Accepted / Ready</h3>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-mono text-[11px] font-bold">
              {state.enquiries.filter((e) => e.status === 'Accepted').length}
            </span>
          </div>
          <div className="space-y-3">
            {state.enquiries
              .filter((e) => e.status === 'Accepted')
              .map((enq) => (
                <div key={enq.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900">{enq.studentName}</span>
                    <span className="text-[10px] text-emerald-700 font-bold">{enq.grade}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">Parent: {enq.parentName}</p>
                  <p className="text-emerald-700 text-[10px] font-medium mt-1">Cleared by Principal Hayes</p>
                  <button
                    onClick={() => {
                      setSelectedEnquiryForConvert(enq);
                      setTargetClassForEnrollment(enq.grade || 'Grade 8A');
                    }}
                    className="mt-2.5 w-full py-1.5 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-xs"
                  >
                    Formally Enroll Student
                  </button>
                </div>
              ))}
            {state.enquiries.filter((e) => e.status === 'Accepted').length === 0 && (
              <p className="text-center text-slate-400 text-xs py-4">No candidates currently in Accepted stage.</p>
            )}
          </div>
        </div>

        {/* Stage 4: Converted / Enrolled */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">4. Formally Enrolled</h3>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-mono text-[11px] font-bold">
              {state.enquiries.filter((e) => e.status === 'Converted').length}
            </span>
          </div>
          <div className="space-y-3">
            {state.enquiries
              .filter((e) => e.status === 'Converted')
              .map((enq) => (
                <div key={enq.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900">{enq.studentName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-slate-500 text-[11px]">Enrolled into {enq.grade}</p>
                  <p className="text-slate-400 text-[10px] font-mono mt-1">{enq.date}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 7: STUDENT & GUARDIAN DIRECTORY (PERMITTED EMERGENCY REGISTRY)
  ------------------------------------------------------------- */
  const renderStudentDirectory = () => {
    const filtered = state.students.filter((s) => {
      const q = studentDirectorySearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.admissionId.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        s.parentPhone.toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Student & Guardian Emergency Registry</h2>
            <p className="text-xs text-slate-500 mt-1">
              Permitted front desk view: guardian contact info, early pickup verification, emergency addresses, and blood groups.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, class, parent, or phone..."
              value={studentDirectorySearch}
              onChange={(e) => setStudentDirectorySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-4 py-3.5">Admission ID</th>
                  <th className="px-4 py-3.5">Class / Section</th>
                  <th className="px-4 py-3.5">Guardian Name</th>
                  <th className="px-4 py-3.5">Emergency Phone</th>
                  <th className="px-4 py-3.5">Blood Group</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => {
                          setSelectedStudentForEmergency(std);
                          setIsEmergencyCardOpen(true);
                        }}
                        className="font-bold text-slate-900 hover:text-cyan-700 hover:underline text-left cursor-pointer transition-colors"
                      >
                        {std.name}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{std.admissionId}</td>
                    <td className="px-4 py-3.5 font-semibold text-cyan-700">{std.class}</td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium">{std.parentName}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">{std.parentPhone}</td>
                    <td className="px-4 py-3.5 font-mono text-rose-700 font-bold">{std.bloodGroup || 'O+'}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={std.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudentForEmergency(std);
                            setIsEmergencyCardOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-md font-semibold text-xs border border-cyan-200 hover:bg-cyan-100 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          Emergency Card
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudentForEdit({ ...std });
                            setIsEditStudentOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                          title="Edit Emergency Contacts"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     MODULE 8: STAFF & FACULTY WORK DIRECTORY
  ------------------------------------------------------------- */
  const renderStaffDirectory = () => {
    const allStaffMembers = [
      ...state.teachers.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.roleTitle || 'Faculty Member',
        department: t.department || 'Academics',
        email: t.email,
        phone: t.phone,
        extension: `Ext. ${200 + parseInt(t.id.replace(/\D/g, '') || '10', 10) % 90}`,
        room: 'Faculty Lounge Room 201',
      })),
      ...state.staff.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        department: s.department,
        email: s.email,
        phone: s.phone,
        extension: `Ext. ${100 + parseInt(s.id.replace(/\D/g, '') || '5', 10) % 50}`,
        room: 'Administration Suite',
      })),
    ];

    const filtered = allStaffMembers.filter((m) => {
      const q = staffDirectorySearch.toLowerCase();
      const matchSearch =
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q);
      const matchDept = staffDeptFilter === 'All' || m.department === staffDeptFilter;
      return matchSearch && matchDept;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Campus Staff & Faculty Work Directory</h2>
            <p className="text-xs text-slate-500 mt-1">
              Authorized front desk extension index for call routing, visitor escorts, and internal staff communication.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, faculty, or department..."
                value={staffDirectorySearch}
                onChange={(e) => setStaffDirectorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>
            <select
              value={staffDeptFilter}
              onChange={(e) => setStaffDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
            >
              <option value="All">All Departments</option>
              <option value="Administration">Administration</option>
              <option value="Academics">Academics</option>
              <option value="Accounts">Accounts</option>
              <option value="Front Office">Front Office</option>
              <option value="Library">Library</option>
              <option value="IT Support">IT Support</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((person) => (
            <div key={person.id} className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{person.name}</h4>
                    <span className="text-[11px] text-cyan-700 font-medium block">{person.role}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{person.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-cyan-800 font-semibold">{person.extension}</span>
                    <span className="text-slate-400">({person.phone})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 truncate">{person.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{person.room}</span>
                <button
                  onClick={() => addToast('Calling Extension', `Dialing ${person.extension} for ${person.name}...`, 'info')}
                  className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-md text-[11px] font-semibold flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     MODULE 9: COMMUNICATION LOG (CALLS, PARCELS, MESSAGES)
  ------------------------------------------------------------- */
  const renderCommunicationLog = () => {
    const filtered = commLogs.filter((log) => {
      const q = commLogSearch.toLowerCase();
      const matchSearch =
        log.callerOrVisitorName.toLowerCase().includes(q) ||
        log.subject.toLowerCase().includes(q) ||
        (log.relatedPerson || '').toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q);
      const matchType = commLogTypeFilter === 'All' || log.type === commLogTypeFilter;
      return matchSearch && matchType;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Front Desk Communication & Courier Register</h2>
            <p className="text-xs text-slate-500 mt-1">
              Ledger of telephone inquiries, urgent classroom notices, parent messages, and package deliveries.
            </p>
          </div>
          <button
            onClick={() => setIsCommLogModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Log New Communication
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search caller, subject, or message..."
                value={commLogSearch}
                onChange={(e) => setCommLogSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={commLogTypeFilter}
                onChange={(e) => setCommLogTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="All">All Communication Types</option>
                <option value="Inbound Call">Inbound Call</option>
                <option value="Outbound Call">Outbound Call</option>
                <option value="Emergency Message">Emergency Message</option>
                <option value="Courier / Parcel">Courier / Parcel</option>
                <option value="Front Desk Inquiry">Front Desk Inquiry</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Time & Date</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Caller / Entity</th>
                  <th className="px-4 py-3.5">Regarding / Recipient</th>
                  <th className="px-4 py-3.5">Subject & Summary</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Handled By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-800 block">{log.time}</span>
                      <span className="font-mono text-slate-400 text-[10px]">{log.date}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          log.type === 'Inbound Call'
                            ? 'bg-blue-50 text-blue-700'
                            : log.type === 'Emergency Message'
                            ? 'bg-rose-50 text-rose-700'
                            : log.type === 'Courier / Parcel'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.type === 'Courier / Parcel' && <Package className="w-3 h-3" />}
                        {log.type.includes('Call') && <Phone className="w-3 h-3" />}
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {log.callerOrVisitorName}
                      {log.contactNumber && (
                        <span className="block font-mono text-[10px] text-slate-400 font-normal">{log.contactNumber}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{log.relatedPerson || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 block">{log.subject}</span>
                      <span className="text-slate-500 text-[11px] max-w-md block line-clamp-2">{log.details}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-600">{log.handledBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     MODULE 10: EMERGENCY & CAMPUS DIRECTORY
  ------------------------------------------------------------- */
  const renderEmergencyContacts = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campus Emergency & Critical Extension Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Rapid dial extensions for the campus infirmary, gatehouses, transport bay, and leadership offices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {EMERGENCY_CONTACTS.map((ec, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">{ec.department}</span>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-mono font-bold text-xs rounded border border-rose-200">
                  {ec.extension}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{ec.contactPerson}</h4>
              <p className="font-mono text-xs text-slate-600 mt-1">{ec.phone}</p>
              <p className="text-slate-500 text-[11px] mt-2 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {ec.location}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">{ec.hours}</span>
              <button
                onClick={() => addToast('Emergency Line', `Connecting directly to ${ec.department}...`, 'info')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 11: CIRCULARS & NOTICES
  ------------------------------------------------------------- */
  const renderNotices = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Front Desk Notice Board & Public Circulars</h2>
          <p className="text-xs text-slate-500 mt-1">
            Display public circulars, campus visiting hours, and visitor safety protocols.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {state.notices.map((n) => (
          <div key={n.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-800 rounded-full text-[11px] font-semibold border border-cyan-200">
                {n.category}
              </span>
              <span className="font-mono text-slate-400 text-[11px]">{n.date}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">{n.title}</h3>
            <p className="text-slate-600 leading-relaxed">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 12: FRONT OFFICE REPORTS
  ------------------------------------------------------------- */
  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Front Office Audits & Operational Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Daily gate transaction records, visitor security compliance, admissions source breakdown, and CSV data dumps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadVisitorsCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download Gate Logs CSV
          </button>
          <button
            onClick={downloadEnquiriesCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download Admissions CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Today&apos;s Visitor Distribution</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Checked In:</span>
              <span className="font-mono font-bold text-slate-900">{state.visitors.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Currently On Campus:</span>
              <span className="font-mono font-bold text-cyan-700">{checkedInVisitors.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Checked Out / Departed:</span>
              <span className="font-mono font-bold text-slate-900">
                {state.visitors.length - checkedInVisitors.length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Average Visit Duration:</span>
              <span className="font-mono font-bold text-slate-900">42 minutes</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Admissions Channel Sources</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Walk-in Campus Visits:</span>
              <span className="font-mono font-bold text-slate-900">
                {state.enquiries.filter((e) => e.source === 'Walk-in').length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Website Digital Inquiries:</span>
              <span className="font-mono font-bold text-slate-900">
                {state.enquiries.filter((e) => e.source === 'Website').length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Parent / Faculty Referral:</span>
              <span className="font-mono font-bold text-slate-900">
                {state.enquiries.filter((e) => e.source === 'Referral').length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Social & Outreach:</span>
              <span className="font-mono font-bold text-slate-900">
                {state.enquiries.filter((e) => e.source === 'Social Media').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Front Desk Operations Health</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Security Passes Accounted:</span>
              <span className="font-mono font-bold text-emerald-600">100% Verified</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Calls Handled Today:</span>
              <span className="font-mono font-bold text-slate-900">{commLogs.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Scheduled Appointments:</span>
              <span className="font-mono font-bold text-slate-900">{appointments.length}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Next Scheduled Fire Drill:</span>
              <span className="font-mono font-bold text-slate-900">Nov 12, 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 13: RECEPTIONIST PROFILE
  ------------------------------------------------------------- */
  const renderProfile = () => (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            CO
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">Clara Oswald</h2>
              <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-700 rounded-full font-semibold text-xs border border-cyan-200">
                Head of Reception & Front Office
              </span>
            </div>
            <p className="text-xs text-slate-500">Employee ID: STF-2022-04 · Greenfield International School</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 text-xs">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-cyan-800">
              Workstation & Duty Parameters
            </h4>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Desk:</span>
                <span className="font-bold text-slate-900">Central Main Lobby Reception (Desk 1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Extension:</span>
                <span className="font-mono font-bold text-cyan-700">Ext. 101</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shift Schedule:</span>
                <span className="font-bold text-slate-900">07:30 AM – 04:30 PM (Mon – Fri)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-700">clara.oswald@greenfield.edu</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-cyan-800">
              Security & Compliance Clearances
            </h4>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Campus Evacuation Warden:</span>
                <span className="font-bold text-emerald-700">Zone A (Main Lobby & Admin)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">First Aid Certification:</span>
                <span className="font-bold text-slate-900">Red Cross Level 2 (Valid 2027)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Background Verification:</span>
                <span className="font-bold text-emerald-700">Cleared & Registered</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gate Pass Authorization:</span>
                <span className="font-bold text-cyan-800">Full Signature Clearance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Route according to state.activeNav */}
      {state.activeNav === 'dashboard' && renderDashboard()}
      {(state.activeNav === 'visitor_register' || state.activeNav === 'visitors') && renderVisitorRegister()}
      {state.activeNav === 'checkin_checkout' && renderCheckInDesk()}
      {state.activeNav === 'appointments' && renderAppointments()}
      {state.activeNav === 'enquiries' && renderEnquiries()}
      {state.activeNav === 'admissions_tracking' && renderAdmissionsTracking()}
      {(state.activeNav === 'student_directory' || state.activeNav === 'students') && renderStudentDirectory()}
      {state.activeNav === 'staff_directory' && renderStaffDirectory()}
      {state.activeNav === 'communication_log' && renderCommunicationLog()}
      {state.activeNav === 'contacts' && renderEmergencyContacts()}
      {(state.activeNav === 'notices_events' || state.activeNav === 'notices') && <NoticeBoardModule />}
      {state.activeNav === 'reports' && renderReports()}
      {state.activeNav === 'profile' && renderProfile()}

      {/* Fallback */}
      {![
        'dashboard',
        'visitor_register',
        'visitors',
        'checkin_checkout',
        'appointments',
        'enquiries',
        'admissions_tracking',
        'student_directory',
        'students',
        'staff_directory',
        'communication_log',
        'contacts',
        'notices_events',
        'notices',
        'reports',
        'profile',
      ].includes(state.activeNav) && renderDashboard()}

      {/* MODAL: Check In Campus Visitor */}
      <Modal
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
        title="Check In Campus Visitor"
        subtitle="Log visitor entry, host contact, and issue physical security badge."
      >
        <form onSubmit={handleVisitorSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Visitor Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Michael Thorne"
              value={visitorForm.visitorName}
              onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Purpose of Visit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Parent Inquiry / Vendor Delivery"
                value={visitorForm.purpose}
                onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Person to Meet</label>
              <select
                value={visitorForm.personToMeet}
                onChange={(e) => setVisitorForm({ ...visitorForm, personToMeet: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Dr. Robert Hayes (Principal)">Dr. Robert Hayes (Principal)</option>
                <option value="Sarah Jenkins (VP Academics)">Sarah Jenkins (VP Academics)</option>
                <option value="Marcus Sterling (Teacher)">Marcus Sterling (Teacher)</option>
                <option value="Laura Bennett (Physics Faculty)">Laura Bennett (Physics Faculty)</option>
                <option value="Edward Fletcher (Accountant)">Edward Fletcher (Accountant)</option>
                <option value="Clara Oswald (Front Desk)">Clara Oswald (Front Desk)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={visitorForm.phone}
                onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Badge ID</label>
              <input
                type="text"
                placeholder="Auto-generated"
                value={visitorForm.badgeNumber}
                onChange={(e) => setVisitorForm({ ...visitorForm, badgeNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsVisitorModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Check In & Issue Pass
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Gate Pass Print Preview */}
      {activeGatePass && (
        <Modal
          isOpen={!!activeGatePass}
          onClose={() => setActiveGatePass(null)}
          title="Greenfield International School — Campus Visitor Pass"
          subtitle="Physical security badge generated for on-campus guest."
        >
          <div className="p-6 bg-cyan-50/40 border border-cyan-200 rounded-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-200">
              <div>
                <span className="font-bold text-base text-cyan-950 block">{activeGatePass.visitorName}</span>
                <span className="text-[11px] text-cyan-700 font-mono">Badge Code: {activeGatePass.passNumber}</span>
              </div>
              <ShieldCheck className="w-9 h-9 text-cyan-600" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div><strong>Purpose:</strong> {activeGatePass.purpose}</div>
              <div><strong>Host:</strong> {activeGatePass.personToMeet}</div>
              <div><strong>Date:</strong> {activeGatePass.date}</div>
              <div><strong>Entry Time:</strong> {activeGatePass.entryTime}</div>
              <div><strong>Phone:</strong> {activeGatePass.phone}</div>
              <div><strong>Organization:</strong> {activeGatePass.organization}</div>
            </div>

            <div className="text-[11px] text-slate-500 pt-3 border-t border-cyan-200 bg-white/70 p-3 rounded-lg">
              <strong>Security Protocol:</strong> This badge must be visibly worn at all times while on school grounds. Visitors must return this pass to the Reception desk upon departure.
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                addToast('Printing', 'Sending gate pass to front desk thermal printer...', 'info');
                setActiveGatePass(null);
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print Security Pass
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL: Book Appointment */}
      <Modal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        title="Schedule Front Office Appointment"
        subtitle="Book a meeting with school leadership or academic faculty."
      >
        <form onSubmit={handleAppointmentSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Parent / Visitor Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amanda Cole"
              value={appointmentForm.parentName}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, parentName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Student Candidate</label>
              <input
                type="text"
                placeholder="e.g. Leo Cole (Grade 8A)"
                value={appointmentForm.studentName}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, studentName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Meeting With</label>
              <select
                value={appointmentForm.withPerson}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, withPerson: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Dr. Robert Hayes (Principal)">Dr. Robert Hayes (Principal)</option>
                <option value="Sarah Jenkins (VP Academics)">Sarah Jenkins (VP Academics)</option>
                <option value="Marcus Sterling (Teacher)">Marcus Sterling (Teacher)</option>
                <option value="Laura Bennett (Physics Faculty)">Laura Bennett (Physics Faculty)</option>
                <option value="Edward Fletcher (Accountant)">Edward Fletcher (Accountant)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={appointmentForm.date}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Time Slot</label>
              <input
                type="text"
                placeholder="e.g. 10:30 AM"
                value={appointmentForm.time}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Purpose of Meeting</label>
            <input
              type="text"
              placeholder="e.g. Progress review, fee schedule discussion, or admissions tour"
              value={appointmentForm.purpose}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, purpose: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAppointmentModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: New Admissions Enquiry */}
      <Modal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        title="Record Admissions Enquiry"
        subtitle="Log prospective parent inquiry and target cohort details."
      >
        <form onSubmit={handleEnquirySubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Parent / Guardian Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. David Miller"
                value={enquiryForm.parentName}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, parentName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Student Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lucas Miller"
                value={enquiryForm.studentName}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, studentName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Grade</label>
              <select
                value={enquiryForm.grade}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, grade: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 5B">Grade 5B</option>
                <option value="Grade 7B">Grade 7B</option>
                <option value="Grade 8A">Grade 8A</option>
                <option value="Grade 9A">Grade 9A</option>
                <option value="Grade 10A">Grade 10A</option>
                <option value="Grade 10B">Grade 10B</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={enquiryForm.contact}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, contact: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={enquiryForm.email}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lead Source</label>
              <select
                value={enquiryForm.source}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, source: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Notes / Academic Interests</label>
            <textarea
              rows={2}
              placeholder="e.g. Relocating next month, interested in STEM laboratory facilities."
              value={enquiryForm.notes}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEnquiryModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
            >
              Save Enquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Log Front Desk Communication */}
      <Modal
        isOpen={isCommLogModalOpen}
        onClose={() => setIsCommLogModalOpen(false)}
        title="Log Communication or Courier Parcel"
        subtitle="Record phone calls, urgent classroom messages, or incoming package deliveries."
      >
        <form onSubmit={handleCommLogSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Communication Type</label>
              <select
                value={commLogForm.type}
                onChange={(e) => setCommLogForm({ ...commLogForm, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Inbound Call">Inbound Call</option>
                <option value="Outbound Call">Outbound Call</option>
                <option value="Emergency Message">Emergency Message</option>
                <option value="Courier / Parcel">Courier / Parcel</option>
                <option value="Front Desk Inquiry">Front Desk Inquiry</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Status</label>
              <select
                value={commLogForm.status}
                onChange={(e) => setCommLogForm({ ...commLogForm, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Resolved">Resolved</option>
                <option value="Follow-up Required">Follow-up Required</option>
                <option value="Message Passed">Message Passed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Caller / Entity Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mrs. Vance / DHL Express"
                value={commLogForm.callerOrVisitorName}
                onChange={(e) => setCommLogForm({ ...commLogForm, callerOrVisitorName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={commLogForm.contactNumber}
                onChange={(e) => setCommLogForm({ ...commLogForm, contactNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Recipient / Student Involved</label>
            <input
              type="text"
              placeholder="e.g. Kevin Vance (Grade 10B) or Dr. Thorne"
              value={commLogForm.relatedPerson}
              onChange={(e) => setCommLogForm({ ...commLogForm, relatedPerson: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Late Arrival Notice / Package Received"
              value={commLogForm.subject}
              onChange={(e) => setCommLogForm({ ...commLogForm, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Detailed Message / Tracking #</label>
            <textarea
              rows={2}
              placeholder="Log notes, action taken, and who was notified..."
              value={commLogForm.details}
              onChange={(e) => setCommLogForm({ ...commLogForm, details: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCommLogModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold"
            >
              Save to Log
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Emergency Card */}
      {selectedStudentForEmergency && (
        <Modal
          isOpen={isEmergencyCardOpen}
          onClose={() => {
            setIsEmergencyCardOpen(false);
            setSelectedStudentForEmergency(null);
          }}
          title={`Front Desk Emergency Card: ${selectedStudentForEmergency.name}`}
          subtitle={`${selectedStudentForEmergency.class} · Admission ID: ${selectedStudentForEmergency.admissionId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-rose-200 font-bold text-rose-900">
                <span>Blood Group: {selectedStudentForEmergency.bloodGroup || 'O+'}</span>
                <span>Class: {selectedStudentForEmergency.class}</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <div><strong>Primary Guardian:</strong> {selectedStudentForEmergency.parentName}</div>
                <div><strong>Guardian Phone:</strong> <span className="font-mono font-bold text-cyan-800">{selectedStudentForEmergency.parentPhone}</span></div>
                <div><strong>Emergency Email:</strong> {selectedStudentForEmergency.parentEmail}</div>
                <div><strong>Residential Address:</strong> {selectedStudentForEmergency.address}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
              <strong>Early Pickup Verification Rule:</strong> Students may only be released to guardians listed on this verified emergency card. Confirm photo ID and contact phone before issuing an early departure student pass.
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => addToast('Dialing Guardian', `Calling ${selectedStudentForEmergency.parentPhone}...`, 'info')}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                Dial Guardian
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Add Follow-up Note */}
      {selectedEnquiryForFollowUp && (
        <Modal
          isOpen={!!selectedEnquiryForFollowUp}
          onClose={() => setSelectedEnquiryForFollowUp(null)}
          title={`Record Admissions Follow-Up: ${selectedEnquiryForFollowUp.studentName}`}
          subtitle={`Parent: ${selectedEnquiryForFollowUp.parentName} · Target: ${selectedEnquiryForFollowUp.grade}`}
        >
          <form onSubmit={handleAddFollowUp} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Follow-Up Action & Summary</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Called parent to confirm attendance for Tuesday campus tour and entrance assessment."
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>
            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedEnquiryForFollowUp(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 text-white rounded-lg font-semibold"
              >
                Save Follow-Up
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Formal Enrollment Confirmation */}
      {selectedEnquiryForConvert && (
        <Modal
          isOpen={!!selectedEnquiryForConvert}
          onClose={() => setSelectedEnquiryForConvert(null)}
          title={`Formally Enroll: ${selectedEnquiryForConvert.studentName}`}
          subtitle="Convert cleared admissions candidate into officially active enrolled student."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-emerald-950">
              <p>
                <strong>Candidate:</strong> {selectedEnquiryForConvert.studentName}
              </p>
              <p>
                <strong>Guardian:</strong> {selectedEnquiryForConvert.parentName} ({selectedEnquiryForConvert.contact})
              </p>
              <p>
                <strong>Clearance:</strong> Approved by Principal Dr. Robert Hayes.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Confirm Target Cohort Class</label>
              <select
                value={targetClassForEnrollment}
                onChange={(e) => setTargetClassForEnrollment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {state.classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} (Current: {c.totalStudents} students)
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedEnquiryForConvert(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvertEnquiry}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
              >
                Issue Admission ID & Enroll
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Edit Student Emergency Contact */}
      {selectedStudentForEdit && (
        <Modal
          isOpen={isEditStudentOpen}
          onClose={() => {
            setIsEditStudentOpen(false);
            setSelectedStudentForEdit(null);
          }}
          title={`Update Emergency Contact: ${selectedStudentForEdit.name}`}
          subtitle={`${selectedStudentForEdit.class} · Admission ID: ${selectedStudentForEdit.admissionId}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateStudent(selectedStudentForEdit);
              setIsEditStudentOpen(false);
              setSelectedStudentForEdit(null);
              addToast('Emergency Contact Saved', `Updated front desk emergency profile for ${selectedStudentForEdit.name}.`, 'success');
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={selectedStudentForEdit.name}
                  onChange={(e) =>
                    setSelectedStudentForEdit({ ...selectedStudentForEdit, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cohort Class</label>
                <input
                  type="text"
                  readOnly
                  value={selectedStudentForEdit.class}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Guardian Name</label>
                <input
                  type="text"
                  required
                  value={selectedStudentForEdit.parentName}
                  onChange={(e) =>
                    setSelectedStudentForEdit({ ...selectedStudentForEdit, parentName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Emergency Phone</label>
                <input
                  type="text"
                  required
                  value={selectedStudentForEdit.parentPhone}
                  onChange={(e) =>
                    setSelectedStudentForEdit({ ...selectedStudentForEdit, parentPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Residential Address</label>
              <input
                type="text"
                value={selectedStudentForEdit.address}
                onChange={(e) =>
                  setSelectedStudentForEdit({ ...selectedStudentForEdit, address: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditStudentOpen(false);
                  setSelectedStudentForEdit(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Save Emergency Contact
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
