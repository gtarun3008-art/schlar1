import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleType, ThemeColor, THEMES } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Modal } from './Modal';
import { CustomPaletteEditor } from './CustomPaletteEditor';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  Key,
  Bell,
  CheckCircle2,
  Lock,
  Smartphone,
  Globe,
  Award,
  BookOpen,
  ArrowLeft,
  Edit3,
  Download,
  Printer,
  QrCode,
  School,
  Clock,
  CheckSquare,
  AlertCircle,
  Save,
  Users,
  Palette,
  Check,
} from 'lucide-react';

interface ProfilePageProps {
  onBack?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { state, setActiveNav, addToast, setThemeColor } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'credentials' | 'security' | 'preferences'>('overview');

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  // Role metadata & profile defaults
  const roleMeta: Record<
    RoleType,
    {
      name: string;
      title: string;
      email: string;
      phone: string;
      employeeId: string;
      department: string;
      office: string;
      joiningDate: string;
      bloodGroup: string;
      avatarChar: string;
      badgeColor: string;
      qualifications: string[];
      bio: string;
      responsibilities: string[];
      permissions: { name: string; level: 'Full' | 'Read/Write' | 'Read Only' | 'Approval' }[];
    }
  > = {
    admin: {
      name: 'Dr. Robert Hayes',
      title: 'School Administrator / Superintendent',
      email: 'admin@greenfield.edu',
      phone: '+1 (555) 019-2834',
      employeeId: 'ADM-1000',
      department: 'Executive Administration',
      office: 'Admin Suite 100, Executive Wing',
      joiningDate: '2016-08-15',
      bloodGroup: 'O+',
      avatarChar: 'AD',
      badgeColor: 'bg-slate-800',
      qualifications: [
        'Ph.D. in Educational Administration — Columbia University',
        'M.Ed. in School Leadership — Harvard University',
        'B.A. in Political Science — Princeton University',
        'Certified Educational Executive Officer (CEEO)',
      ],
      bio: 'Leading Greenfield International School governance, accreditation, compliance, institutional budgeting, and policy implementation.',
      responsibilities: [
        'School board liaison and institutional compliance oversight',
        'Master security, access control, and user permission auditing',
        'Capital expenditure and fiscal budget authorization',
        'Senior executive appointment sign-off and charter compliance',
      ],
      permissions: [
        { name: 'System Security & Role Permissions', level: 'Full' },
        { name: 'Student Information Master', level: 'Full' },
        { name: 'Staff & Faculty Management', level: 'Full' },
        { name: 'Financial Governance & Disbursements', level: 'Full' },
        { name: 'Policy & Institutional Audit', level: 'Full' },
      ],
    },
    principal: {
      name: 'Dr. Robert Hayes',
      title: 'Principal / School Administrator',
      email: 'r.hayes@greenfield.edu',
      phone: '+1 (555) 019-2834',
      employeeId: 'ADM-1001',
      department: 'Executive Administration',
      office: 'Principal Suite 101, Admin Wing',
      joiningDate: '2016-08-15',
      bloodGroup: 'O+',
      avatarChar: 'RH',
      badgeColor: 'bg-indigo-600',
      qualifications: [
        'Ph.D. in Educational Leadership — Columbia University',
        'M.Ed. in School Administration — Harvard University',
        'B.A. in English Literature — Princeton University',
        'Certified National Superintendent & Principal Fellow (NASSP)',
      ],
      bio: 'Serving as the institutional leader of Greenfield International School for over 8 years, dedicated to academic rigor, holistic student well-being, and modern STEM innovation.',
      responsibilities: [
        'Institutional governance and school board liaison',
        'Senior faculty evaluation and recruitment sign-off',
        'Annual fiscal budget allocation and operational clearance',
        'Curricular standards oversight and regional accreditation compliance',
      ],
      permissions: [
        { name: 'Student Records Master', level: 'Full' },
        { name: 'Staff & Faculty Management', level: 'Full' },
        { name: 'Financial Disbursements & Reports', level: 'Full' },
        { name: 'Curriculum & Examination Approval', level: 'Approval' },
        { name: 'Security & System Configuration', level: 'Full' },
      ],
    },
    vice_principal: {
      name: 'Sarah Jenkins',
      title: 'Vice Principal & Academic Coordinator',
      email: 's.jenkins@greenfield.edu',
      phone: '+1 (555) 019-4822',
      employeeId: 'ADM-1004',
      department: 'Academic Supervision',
      office: 'Office 104, Central Academic Wing',
      joiningDate: '2018-07-01',
      bloodGroup: 'A+',
      avatarChar: 'SJ',
      badgeColor: 'bg-purple-600',
      qualifications: [
        'M.Ed. in Curriculum Design — Stanford University',
        'B.S. in Mathematics & Education — UC Berkeley',
        'International Baccalaureate (IB) Certified Curriculum Lead',
      ],
      bio: 'Leading curriculum development, faculty mentoring, and examination velocity monitoring across grades 7 through 10.',
      responsibilities: [
        'Curricular pacing and syllabus velocity oversight',
        'Classroom timetable generation and faculty workload balancing',
        'Term examination administration and moderation of grades',
        'Parent academic escalations and student support plans',
      ],
      permissions: [
        { name: 'Curriculum & Syllabi Oversight', level: 'Full' },
        { name: 'Faculty Workload & Timetables', level: 'Full' },
        { name: 'Examination & Marks Approval', level: 'Approval' },
        { name: 'Student Academic Records', level: 'Read/Write' },
        { name: 'Parent Communication Hub', level: 'Full' },
      ],
    },
    teacher: {
      name: 'Marcus Sterling',
      title: 'Faculty / Head of Mathematics',
      email: 'm.sterling@greenfield.edu',
      phone: '+1 (555) 019-7711',
      employeeId: 'FAC-2009',
      department: 'Department of Mathematics',
      office: 'Faculty Lounge 301, Science & Math Wing',
      joiningDate: '2020-08-10',
      bloodGroup: 'B+',
      avatarChar: 'MS',
      badgeColor: 'bg-emerald-600',
      qualifications: [
        'M.Sc. in Applied Mathematics — MIT',
        'B.Ed. in Secondary STEM Education — Boston University',
        'AP Calculus & Statistics Certified Instructor',
      ],
      bio: 'Passionate math educator teaching Grade 10A, Grade 10B, and Grade 8A. Focus on conceptual clarity, Olympiad coaching, and interactive problem solving.',
      responsibilities: [
        'Class teacher for Grade 10A and mathematics instructor for 8A/10B',
        'Daily roll attendance recording and term assessments',
        'Designing periodic homework assignments and quizzes',
        'Parent-teacher consultations and individual tutoring hours',
      ],
      permissions: [
        { name: 'Assigned Class Rosters', level: 'Read/Write' },
        { name: 'Attendance Recording', level: 'Read/Write' },
        { name: 'Marks & Assessment Input', level: 'Read/Write' },
        { name: 'Homework & Assignment Dispatch', level: 'Full' },
        { name: 'Direct Parent Messaging', level: 'Read/Write' },
      ],
    },
    accountant: {
      name: 'Edward Fletcher',
      title: 'Senior Bursar & Finance Manager',
      email: 'e.fletcher@greenfield.edu',
      phone: '+1 (555) 019-3390',
      employeeId: 'FIN-3002',
      department: 'Finance & Bursar Office',
      office: 'Bursar Suite 108, Admin Wing',
      joiningDate: '2019-03-12',
      bloodGroup: 'AB+',
      avatarChar: 'EF',
      badgeColor: 'bg-amber-600',
      qualifications: [
        'Certified Public Accountant (CPA)',
        'B.S. in Accountancy & Finance — NYU Stern',
        'Diploma in Non-Profit & Institutional Accounting',
      ],
      bio: 'Managing student tuition receipts, payroll reconciliation, vendor billing, and institutional fiscal reporting.',
      responsibilities: [
        'Tuition fee collection and automated receipt generation',
        'Outstanding dues tracking and collection escalation notices',
        'Staff monthly payroll processing and deductions',
        'Preparation of quarterly audit reports and bank reconciliations',
      ],
      permissions: [
        { name: 'Fee Collection & Cash Ledger', level: 'Full' },
        { name: 'Receipt Issuance & Reversals', level: 'Full' },
        { name: 'Financial Audits & Reports', level: 'Full' },
        { name: 'Student Financial Records', level: 'Read/Write' },
        { name: 'Fee Structure Configuration', level: 'Approval' },
      ],
    },
    receptionist: {
      name: 'Clara Oswald',
      title: 'Front Office & Admissions Coordinator',
      email: 'c.oswald@greenfield.edu',
      phone: '+1 (555) 019-1100',
      employeeId: 'ADM-4001',
      department: 'Front Desk & Community Relations',
      office: 'Main Welcome Lobby Gate 1',
      joiningDate: '2021-11-05',
      bloodGroup: 'O-',
      avatarChar: 'CO',
      badgeColor: 'bg-cyan-600',
      qualifications: [
        'B.A. in Communications & Public Relations — Penn State',
        'Certified Hospitality & Front-of-House Administrator',
      ],
      bio: 'First point of contact for parents, visitors, prospective families, and guest logistics at Greenfield International.',
      responsibilities: [
        'Campus visitor check-in, identity verification, and pass dispatch',
        'Admissions prospective family triage and campus tour scheduling',
        'Inbound telephone and reception communications hub',
        'Staff and administrative appointment coordination',
      ],
      permissions: [
        { name: 'Visitor Log & Security Gate Passes', level: 'Full' },
        { name: 'Admissions Enquiry Pipeline', level: 'Read/Write' },
        { name: 'Appointment Scheduling', level: 'Full' },
        { name: 'Public Notice Board Management', level: 'Read/Write' },
        { name: 'Student Emergency Contact Directory', level: 'Read Only' },
      ],
    },
    hr: {
      name: 'Eleanor Vance',
      title: 'Director of Human Resources & Personnel',
      email: 'e.vance@greenfield.edu',
      phone: '+1 (555) 019-5544',
      employeeId: 'HR-5001',
      department: 'Human Resources & People Care',
      office: 'Admin Block Suite 102',
      joiningDate: '2017-09-18',
      bloodGroup: 'A-',
      avatarChar: 'EV',
      badgeColor: 'bg-rose-600',
      qualifications: [
        'Senior Certified Professional (SHRM-SCP)',
        'M.S. in Human Resource Management — Cornell University',
        'B.A. in Organizational Psychology — Univ of Michigan',
      ],
      bio: 'Directing faculty recruitment, benefits administration, employee wellness, statutory compliance, and staff development.',
      responsibilities: [
        'Staff leave applications approval and substitute coordination',
        'Faculty credentials verification and state licensing compliance',
        'New employee onboarding and contract administration',
        'Annual performance appraisal facilitation and staff records',
      ],
      permissions: [
        { name: 'Staff Directory & Personnel Files', level: 'Full' },
        { name: 'Staff Leave Processing', level: 'Approval' },
        { name: 'Payroll Approval Interface', level: 'Approval' },
        { name: 'Staff Attendance Audits', level: 'Full' },
        { name: 'Department Organization Charts', level: 'Full' },
      ],
    },
    librarian: {
      name: 'Arthur Pendelton',
      title: 'Head Librarian & Resource Curator',
      email: 'a.pendelton@greenfield.edu',
      phone: '+1 (555) 019-6622',
      employeeId: 'LIB-6001',
      department: 'Learning Resource Center',
      office: 'Central Library Mezzanine',
      joiningDate: '2015-02-01',
      bloodGroup: 'B-',
      avatarChar: 'AP',
      badgeColor: 'bg-teal-600',
      qualifications: [
        'Master of Library & Information Science (MLIS) — Univ of Washington',
        'B.A. in History & Archival Studies — Northwestern University',
        'Certified Digital Repository & Research Specialist',
      ],
      bio: 'Curating the school’s 12,000+ print and digital collection, fostering reading clubs, and managing campus research resources.',
      responsibilities: [
        'Library collection acquisition and cataloging',
        'Daily book circulation, issue, return, and overdue notices',
        'Digital library databases and scholastic research access',
        'Annual library inventory audits and student reading programs',
      ],
      permissions: [
        { name: 'Book Catalog & Asset Registry', level: 'Full' },
        { name: 'Circulation & Borrowing Ledger', level: 'Full' },
        { name: 'Overdue Penalties & Fines Collection', level: 'Full' },
        { name: 'Digital Research Portal Administration', level: 'Full' },
        { name: 'Student Library Membership', level: 'Read/Write' },
      ],
    },
    parent: {
      name: 'Vikram Sharma',
      title: 'Parent & Guardian Representative',
      email: 'vikram.sharma@example.com',
      phone: '+1 (555) 234-8901',
      employeeId: 'PAR-8821',
      department: 'Parent-Teacher Association (PTA)',
      office: 'Residential: 742 Evergreen Terrace',
      joiningDate: '2022-08-20',
      bloodGroup: 'O+',
      avatarChar: 'VS',
      badgeColor: 'bg-blue-600',
      qualifications: [
        'Senior Software Enterprise Architect',
        'M.S. in Computer Science — Georgia Tech',
        'PTA STEM Committee Volunteer',
      ],
      bio: 'Guardian of Aarav Sharma (Grade 8A) and Ananya Sharma (Grade 5B). Active participant in school technology initiatives and science fair mentoring.',
      responsibilities: [
        'Parental oversight for enrolled children: Aarav & Ananya',
        'Tuition fee settlement and school transport authorization',
        'Attendance review and academic progress sign-offs',
        'PTA advisory committee feedback',
      ],
      permissions: [
        { name: 'Ward Academic Transcripts', level: 'Read Only' },
        { name: 'Ward Attendance Ledger', level: 'Read Only' },
        { name: 'Online Tuition Remittance', level: 'Full' },
        { name: 'Teacher Two-Way Messaging', level: 'Read/Write' },
        { name: 'School Circulars & Circulars', level: 'Read Only' },
      ],
    },
    transport: {
      name: 'Gary Vance',
      title: 'Transport Operations Director',
      email: 'transport@greenfield.edu',
      phone: '+1 (555) 019-7890',
      employeeId: 'OPS-7001',
      department: 'Campus Logistics & Fleet Operations',
      office: 'Fleet Operations Building, Gate 4',
      joiningDate: '2019-04-10',
      bloodGroup: 'O+',
      avatarChar: 'GV',
      badgeColor: 'bg-amber-700',
      qualifications: [
        'B.S. in Logistics & Supply Chain Management — Penn State',
        'Certified Pupil Transportation Director (CPTD)',
        'Advanced Fleet Safety & Incident Management Certification',
      ],
      bio: 'Directing the Greenfield International bus fleet, routing optimization, driver safety training, and real-time student commute tracking.',
      responsibilities: [
        'Campus bus fleet routing, schedule dispatch, and live monitoring',
        'Student bus pass allocation and stop assignments',
        'Driver roster management, safety compliance, and licensing',
        'Vehicle maintenance logs and regulatory roadworthiness audits',
      ],
      permissions: [
        { name: 'Fleet Routes & Schedules', level: 'Full' },
        { name: 'Student Commute Allocation', level: 'Full' },
        { name: 'Vehicle Maintenance & Compliance', level: 'Full' },
        { name: 'Driver Records & Safety Logs', level: 'Full' },
        { name: 'Emergency Commute Alerts', level: 'Full' },
      ],
    },
    exam_coordinator: {
      name: 'Dr. Helen Vance',
      title: 'Chief Examination Controller',
      email: 'exams@greenfield.edu',
      phone: '+1 (555) 019-6743',
      employeeId: 'EXM-8001',
      department: 'Office of Examination & Evaluation',
      office: 'Examination Cell, Hall 202',
      joiningDate: '2017-10-15',
      bloodGroup: 'B+',
      avatarChar: 'HV',
      badgeColor: 'bg-violet-700',
      qualifications: [
        'Ph.D. in Psychometrics & Educational Measurement — University of Cambridge',
        'M.Sc. in Statistics — London School of Economics',
        'IB & Cambridge Assessment Certified Chief Examiner',
      ],
      bio: 'Supervising term examinations, question paper moderation, seating matrices, mark entry audits, and academic transcript integrity.',
      responsibilities: [
        'Term examination timetable scheduling and hall allocations',
        'Invigilator duty roster and exam security protocol enforcement',
        'Marks entry audits, grade distribution, and GPA moderation',
        'Official report card generation and transcript archival',
      ],
      permissions: [
        { name: 'Exam Term Schedules & Timetables', level: 'Full' },
        { name: 'Hall Ticket & Seating Matrix', level: 'Full' },
        { name: 'Marks Entry Audit & Moderation', level: 'Approval' },
        { name: 'Grade Scale & GPA Scheme Config', level: 'Full' },
        { name: 'Report Card Dispatch & Transcripts', level: 'Full' },
      ],
    },
  };

  const currentRole = state.currentRole;
  const current = roleMeta[currentRole] || roleMeta.principal;

  // Editable Profile State
  const [phone, setPhone] = useState(current.phone);
  const [email, setEmail] = useState(current.email);
  const [office, setOffice] = useState(current.office);
  const [bio, setBio] = useState(current.bio);
  const [address, setAddress] = useState(
    currentRole === 'parent' ? '742 Evergreen Terrace, Greenfield District' : '45 Campus Drive, Faculty Residences'
  );
  const [emergencyContact, setEmergencyContact] = useState('Sunita Sharma (+1 555-234-8902)');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Preferences State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsUrgent, setSmsUrgent] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditModalOpen(false);
    addToast('Profile Updated', 'Your personal details have been saved successfully.', 'success');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast('Security Error', 'Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('Security Error', 'New password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Security Error', 'New passwords do not match.', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast('Password Changed', 'Your security credentials have been updated.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setActiveNav('dashboard')}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">User Profile & Account</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official institutional credentials for Greenfield International School
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsIdCardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            Digital ID Card
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            style={{ backgroundColor: currentTheme.primary }}
            className="flex items-center gap-1.5 px-3.5 py-2 hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background banner in current theme */}
        <div
          className="absolute top-0 left-0 right-0 h-24 opacity-95 transition-all"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.gradientStart}, ${currentTheme.gradientEnd})`,
          }}
        />

        <div className="relative pt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar Pill */}
            <div
              style={{ backgroundColor: currentTheme.primary }}
              className="w-24 h-24 rounded-2xl text-white font-bold text-3xl flex items-center justify-center border-4 border-white shadow-md relative z-10 shrink-0 transition-colors"
            >
              {current.avatarChar}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">{current.name}</h2>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {current.employeeId}
                </span>
              </div>
              <p
                style={{ color: currentTheme.text }}
                className="text-xs font-semibold mt-1"
              >
                {current.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {current.department} · {current.office}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t md:border-t-0 border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Member Since</span>
              <span className="font-semibold text-slate-800">{current.joiningDate}</span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
              <span className="font-mono font-bold text-slate-800">{current.bloodGroup}</span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Campus Status</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                On Duty / Active
              </span>
            </div>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex items-center gap-1 mt-8 border-t border-slate-100 pt-4 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview & Contact', icon: User },
            { id: 'credentials', label: 'Credentials & Permissions', icon: Award },
            { id: 'security', label: 'Security & Access', icon: Shield },
            { id: 'preferences', label: 'System Preferences', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={
                  isActive
                    ? {
                        backgroundColor: currentTheme.light,
                        color: currentTheme.dark,
                        borderColor: currentTheme.border,
                      }
                    : {}
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap border ${
                  isActive
                    ? 'font-bold shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? currentTheme.primary : undefined }}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & CONTACT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Executive Profile Summary
              </h3>
              <p className="text-slate-700 text-xs leading-relaxed">{bio}</p>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Key Operational Responsibilities</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {current.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed Contact Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Direct Contact & Location
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Official Email</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-900 truncate">{email}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Direct Phone</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-900 font-mono">{phone}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Office Location</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-900">{office}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Emergency Contact</span>
                  <div className="flex items-center gap-2 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="font-semibold text-slate-900">{emergencyContact}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Residential / Mailing Address</span>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-900">{address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Sidebar Column */}
          <div className="space-y-6">
            {/* Institution Badge Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white border border-white/20">
                  <School className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Greenfield International</h4>
                  <p className="text-[10px] text-slate-300">CBSE & IB World School Affiliation</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Institutional Code:</span>
                  <span className="font-mono text-white font-semibold">GIS-9842-US</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Campus:</span>
                  <span className="text-white font-semibold">North Academic Campus</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Session:</span>
                  <span className="text-emerald-400 font-semibold">2026-2027 (Term 1)</span>
                </div>
              </div>

              <button
                onClick={() => setIsIdCardModalOpen(true)}
                className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" /> View Institutional ID Card
              </button>
            </div>

            {/* Quick Stats or Child Summary (if Parent) */}
            {currentRole === 'parent' ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Registered Wards ({state.students.filter((s) => s.parentName.includes('Sharma')).length})
                </h4>
                <div className="space-y-2">
                  {state.students
                    .filter((s) => s.parentName.includes('Sharma'))
                    .map((child) => (
                      <div key={child.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{child.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {child.class} · Roll #{child.rollNo}
                          </span>
                        </div>
                        <StatusBadge status={child.academicStatus} />
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Staff Service Record
                </h4>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-slate-400">Staff Category:</span>
                    <span className="font-semibold text-slate-800">Permanent Full-Time</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-slate-400">Department Head:</span>
                    <span className="font-semibold text-slate-800">Dr. Robert Hayes</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-slate-400">Annual Appraisal:</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Exceeds Standards</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Access Key Card:</span>
                    <span className="font-mono font-bold text-slate-800">#RFID-9844-ACTIVE</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREDENTIALS & PERMISSIONS */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Qualifications & Degrees */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              Verified Academic Qualifications & Certifications
            </h3>

            <div className="space-y-3">
              {current.qualifications.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{q.split('—')[0]}</span>
                    {q.includes('—') && (
                      <span className="text-[11px] text-slate-500 font-medium">{q.split('—')[1]}</span>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> State & Board Verified Record
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Permissions Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-600" />
              Role-Based Access Control (RBAC) Permissions
            </h3>

            <div className="divide-y divide-slate-100">
              {current.permissions.map((perm, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{perm.name}</span>
                    <span className="text-[10px] text-slate-400">Schlar Institutional Privilege</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      perm.level === 'Full'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : perm.level === 'Approval'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : perm.level === 'Read/Write'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {perm.level}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-800 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Permissions are governed by Dr. Robert Hayes and the Greenfield School District IT Policy.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & ACCESS */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-600" />
              Change Account Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ensure your password is at least 8 characters with a mix of numbers and letters.
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                >
                  Update Account Password
                </button>
              </div>
            </form>
          </div>

          {/* Two-Factor Authentication & Active Sessions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Two-Factor Authentication (2FA)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Require SMS or authenticator passkey on new devices.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    addToast('Security Preference', `2FA has been ${!twoFactorEnabled ? 'enabled' : 'disabled'}.`, 'info');
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Active Authorized Sessions
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Chrome on macOS (Current)</span>
                    <span className="text-[10px] text-slate-500 font-mono">IP: 192.168.1.42 · Greenfield Campus WiFi</span>
                  </div>
                  <span className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Schlar Mobile App (iOS)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Last active: 2 hours ago · LTE</span>
                  </div>
                  <button
                    onClick={() => addToast('Session Terminated', 'Logged out mobile device.', 'info')}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PREFERENCES & COMMUNICATIONS */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-600" />
              Notification & Alert Channels
            </h3>

            <div className="space-y-4 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Email Circulars & Notices</span>
                  <span className="text-[11px] text-slate-500">Receive school-wide announcements directly via email.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">SMS Emergency Broadcasts</span>
                  <span className="text-[11px] text-slate-500">Urgent notifications for weather, transport, or closures.</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsUrgent}
                  onChange={(e) => setSmsUrgent(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Mobile Push Notifications</span>
                  <span className="text-[11px] text-slate-500">Instant ping for marks, attendance, and message replies.</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Daily Operational Digest</span>
                  <span className="text-[11px] text-slate-500">Morning summary of daily classes, events, and rosters.</span>
                </div>
                <input
                  type="checkbox"
                  checked={dailyDigest}
                  onChange={(e) => setDailyDigest(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t">
              <button
                onClick={() => addToast('Preferences Saved', 'Your communication settings are active.', 'success')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              Regional & Display Format
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Language</label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-white">
                  <option>English (United States)</option>
                  <option>English (United Kingdom)</option>
                  <option>Spanish / Español</option>
                  <option>French / Français</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Timezone</label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-[11px]">
                  <option>America/New_York (EST, UTC-05:00)</option>
                  <option>America/Chicago (CST, UTC-06:00)</option>
                  <option>America/Los_Angeles (PST, UTC-08:00)</option>
                  <option>Europe/London (GMT, UTC+00:00)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date Format</label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-[11px]">
                  <option>YYYY-MM-DD (2026-09-27)</option>
                  <option>DD/MM/YYYY (27/09/2026)</option>
                  <option>MM/DD/YYYY (09/27/2026)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Theme & Accent Color Selection Panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette className="w-4 h-4" style={{ color: currentTheme.primary }} />
                  Schlar Brand Theme & Accent Color
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose your institutional accent color. Selected color applies live across all Web Platform roles and Mobile apps.
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs self-start sm:self-auto"
                style={{ backgroundColor: currentTheme.primary }}
              >
                {currentTheme.name}
              </span>
            </div>

            <div className="pt-2">
              <CustomPaletteEditor />
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile Information"
          subtitle={`Update contact and administrative details for ${current.name}`}
        >
          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Direct Phone *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Office Location</label>
                <input
                  type="text"
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mailing Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Profile Summary / Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-slate-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* OFFICIAL DIGITAL ID CARD MODAL */}
      {isIdCardModalOpen && (
        <Modal
          isOpen={isIdCardModalOpen}
          onClose={() => setIsIdCardModalOpen(false)}
          title="Institutional Identity Credential"
          subtitle="Official Greenfield International School Digital ID"
        >
          <div className="p-4 flex flex-col items-center">
            {/* ID Card Outer */}
            <div className="w-full max-w-sm bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border-2 border-indigo-400/30 relative overflow-hidden text-center">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5 text-indigo-300" />
                  <span className="font-bold tracking-tight text-xs uppercase">Greenfield International</span>
                </div>
                <span className="text-[9px] font-mono bg-white/20 px-2 py-0.5 rounded-full font-bold">2026-2027</span>
              </div>

              <div className="my-5 flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-2xl ${current.badgeColor} text-white font-bold text-2xl flex items-center justify-center border-4 border-white shadow-lg mb-3`}
                >
                  {current.avatarChar}
                </div>
                <h3 className="font-bold text-lg tracking-tight text-white">{current.name}</h3>
                <span className="text-xs text-indigo-200 font-semibold">{current.title}</span>
                <span className="text-[10px] text-slate-300 font-mono mt-0.5">{current.employeeId}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-[10px] bg-white/10 rounded-2xl p-3 border border-white/10 mb-4">
                <div>
                  <span className="text-indigo-200 block uppercase">Department</span>
                  <span className="font-semibold text-white truncate block">{current.department}</span>
                </div>
                <div>
                  <span className="text-indigo-200 block uppercase">Blood Group</span>
                  <span className="font-mono font-bold text-white block">{current.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-indigo-200 block uppercase">Emergency Phone</span>
                  <span className="font-mono text-white block">{phone}</span>
                </div>
                <div>
                  <span className="text-indigo-200 block uppercase">Valid Thru</span>
                  <span className="font-semibold text-emerald-300 block">31 JUL 2027</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="pt-2 border-t border-white/20 flex flex-col items-center">
                <div className="h-8 w-44 bg-white/90 rounded px-2 flex items-center justify-around">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="bg-black"
                      style={{
                        width: i % 3 === 0 ? '3px' : '1.5px',
                        height: '24px',
                      }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] text-slate-300 mt-1">*{current.employeeId}*</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2 w-full max-w-sm">
              <button
                onClick={() => {
                  addToast('Printed', 'Sending ID badge to school card printer.', 'info');
                  setIsIdCardModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print Card
              </button>
              <button
                onClick={() => {
                  addToast('Downloaded', 'Digital credential image saved to device.', 'success');
                  setIsIdCardModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
