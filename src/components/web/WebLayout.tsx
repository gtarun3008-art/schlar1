import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleType, ThemeColor, THEMES } from '../../types';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { CustomPaletteEditor } from '../common/CustomPaletteEditor';
import {
  School,
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Building,
  Library,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  BookOpen,
  CheckSquare,
  MessageSquare,
  Award,
  Layers,
  Sparkles,
  Smartphone,
  RotateCcw,
  UserCheck,
  CreditCard,
  Briefcase,
  AlertTriangle,
  X,
  Search,
  User,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCheck,
  Bus,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Menu,
  Wrench,
  Bookmark,
  Compass,
  Megaphone,
  Phone,
  Send,
  Shield,
} from 'lucide-react';

interface WebLayoutProps {
  children: React.ReactNode;
  onExitToWelcome: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badge?: string | number;
}

export interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const WebLayout: React.FC<WebLayoutProps> = ({ children, onExitToWelcome }) => {
  const {
    state,
    setRole,
    setPlatform,
    setActiveNav,
    setThemeColor,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  // Role metadata for all 10 roles
  const roleProfiles: Record<
    RoleType,
    { title: string; name: string; email: string; avatarChar: string; badgeColor: string }
  > = {
    admin: {
      title: 'School Administrator',
      name: 'Dr. Robert Hayes',
      email: 'admin@greenfield.edu',
      avatarChar: 'AD',
      badgeColor: 'bg-slate-800',
    },
    principal: {
      title: 'Principal / School Admin',
      name: 'Dr. Robert Hayes',
      email: 'r.hayes@greenfield.edu',
      avatarChar: 'RH',
      badgeColor: 'bg-indigo-600',
    },
    vice_principal: {
      title: 'Vice Principal / Coordinator',
      name: 'Sarah Jenkins',
      email: 's.jenkins@greenfield.edu',
      avatarChar: 'SJ',
      badgeColor: 'bg-purple-600',
    },
    teacher: {
      title: 'Faculty / Subject Teacher',
      name: 'Marcus Sterling',
      email: 'm.sterling@greenfield.edu',
      avatarChar: 'MS',
      badgeColor: 'bg-emerald-600',
    },
    accountant: {
      title: 'Accountant / Finance Staff',
      name: 'Edward Fletcher',
      email: 'e.fletcher@greenfield.edu',
      avatarChar: 'EF',
      badgeColor: 'bg-amber-600',
    },
    receptionist: {
      title: 'Front Office / Receptionist',
      name: 'Clara Oswald',
      email: 'c.oswald@greenfield.edu',
      avatarChar: 'CO',
      badgeColor: 'bg-cyan-600',
    },
    hr: {
      title: 'HR / Staff Manager',
      name: 'Eleanor Vance',
      email: 'e.vance@greenfield.edu',
      avatarChar: 'EV',
      badgeColor: 'bg-rose-600',
    },
    librarian: {
      title: 'Head Librarian',
      name: 'Arthur Pendelton',
      email: 'a.pendelton@greenfield.edu',
      avatarChar: 'AP',
      badgeColor: 'bg-teal-600',
    },
    transport: {
      title: 'Transport Director',
      name: 'Gary Vance',
      email: 'transport@greenfield.edu',
      avatarChar: 'GV',
      badgeColor: 'bg-amber-700',
    },
    exam_coordinator: {
      title: 'Exam Controller',
      name: 'Dr. Helen Vance',
      email: 'exams@greenfield.edu',
      avatarChar: 'HV',
      badgeColor: 'bg-violet-700',
    },
    parent: {
      title: 'Parent',
      name: 'Vikram Sharma',
      email: 'vikram.sharma@example.com',
      avatarChar: 'VS',
      badgeColor: 'bg-blue-600',
    },
  };

  const currentProfile = roleProfiles[state.currentRole] || roleProfiles.principal;

  // Filter role notifications
  const roleNotifs = state.notifications.filter((n) => n.role === state.currentRole);
  const unreadNotifs = roleNotifs.filter((n) => !n.read);

  // ChatGPT-inspired grouped navigation specification for every role
  const getNavGroups = (): NavGroup[] => {
    switch (state.currentRole) {
      case 'admin':
      case 'principal':
        return [
          {
            groupTitle: 'Overview',
            items: [{ id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard }],
          },
          {
            groupTitle: 'Institutional Records',
            items: [
              { id: 'students', label: 'Students Roster', icon: GraduationCap, badge: state.students.length },
              { id: 'teachers', label: 'Teachers Directory', icon: Users, badge: state.teachers.length },
              { id: 'staff', label: 'Staff Directory', icon: Briefcase, badge: state.staff.length },
            ],
          },
          {
            groupTitle: 'Academic Operations',
            items: [
              { id: 'classes', label: 'Class Sections', icon: Layers },
              { id: 'academics', label: 'Academic Setup', icon: BookOpen },
              { id: 'attendance', label: 'Attendance Matrix', icon: CheckSquare },
              { id: 'timetable', label: 'Master Timetable', icon: Clock },
              { id: 'exams', label: 'Exam Operations', icon: Award },
              { id: 'assignments', label: 'Assignments', icon: FileText },
            ],
          },
          {
            groupTitle: 'Finance & Governance',
            items: [
              { id: 'finance', label: 'Finance & Fees', icon: DollarSign },
              { id: 'reports', label: 'Institutional Reports', icon: FileText },
            ],
          },
          {
            groupTitle: 'Communication & System',
            items: [
              { id: 'notices', label: 'School Notices', icon: Bell },
              { id: 'events', label: 'Events Calendar', icon: Calendar },
              { id: 'messages', label: 'Internal Messaging', icon: MessageSquare },
              { id: 'audit_logs', label: 'Audit Trail & Compliance', icon: ShieldCheck },
              { id: 'settings', label: 'System & Permissions', icon: Settings },
            ],
          },
        ];

      case 'vice_principal':
        return [
          {
            groupTitle: 'Academic Overview',
            items: [{ id: 'dashboard', label: 'Academic Dashboard', icon: LayoutDashboard }],
          },
          {
            groupTitle: 'Curriculum & Faculty',
            items: [
              { id: 'classes', label: 'Classes Oversight', icon: Layers },
              { id: 'teachers', label: 'Teacher Workload', icon: Users },
              { id: 'subjects', label: 'Subject Performance', icon: BookOpen },
            ],
          },
          {
            groupTitle: 'Daily Operations',
            items: [
              { id: 'attendance', label: 'Attendance Monitoring', icon: CheckSquare },
              { id: 'timetable', label: 'Master Timetable', icon: Clock },
              { id: 'assignments', label: 'Assignment Review', icon: FileText },
            ],
          },
          {
            groupTitle: 'Examinations & Reports',
            items: [
              { id: 'exams', label: 'Exam Schedules', icon: Award },
              { id: 'marks', label: 'Marks Approval', icon: FileText, badge: 'Pending' },
              { id: 'reports', label: 'Academic Reports', icon: FileText },
            ],
          },
          {
            groupTitle: 'Faculty Hub',
            items: [
              { id: 'notices', label: 'Academic Notices', icon: Bell },
              { id: 'events', label: 'Academic Calendar', icon: Calendar },
              { id: 'messages', label: 'Faculty Messages', icon: MessageSquare },
              { id: 'audit_logs', label: 'Academic Audit Trail', icon: ShieldCheck },
              { id: 'settings', label: 'Settings', icon: Settings },
            ],
          },
        ];

      case 'teacher':
        return [
          {
            groupTitle: 'Instruction Overview',
            items: [{ id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard }],
          },
          {
            groupTitle: 'Classes & Roster',
            items: [
              { id: 'my_classes', label: 'My Classes', icon: Layers },
              { id: 'students', label: 'Student List', icon: GraduationCap },
              { id: 'attendance', label: 'Record Attendance', icon: CheckSquare },
            ],
          },
          {
            groupTitle: 'Grading & Schedule',
            items: [
              { id: 'marks', label: 'Enter Marks', icon: Award },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'timetable', label: 'My Schedule', icon: Clock },
              { id: 'exams', label: 'Exam Schedules', icon: Award },
            ],
          },
          {
            groupTitle: 'Communication',
            items: [
              { id: 'notices', label: 'School Notices', icon: Bell },
              { id: 'events', label: 'School Calendar', icon: Calendar },
              { id: 'messages', label: 'Parent Messages', icon: MessageSquare },
              { id: 'settings', label: 'Profile & Settings', icon: Settings },
            ],
          },
        ];

      case 'accountant':
        return [
          {
            groupTitle: 'Financial Overview',
            items: [{ id: 'dashboard', label: 'Financial Dashboard', icon: LayoutDashboard }],
          },
          {
            groupTitle: 'Tuition & Billing',
            items: [
              { id: 'fees', label: 'Student Accounts', icon: DollarSign, badge: state.fees.length },
              { id: 'fee_structure', label: 'Fee Structure', icon: Layers },
              { id: 'collections', label: 'Fee Collection', icon: CreditCard },
              { id: 'pending_fees', label: 'Outstanding Dues', icon: AlertTriangle, badge: state.fees.filter((f) => f.pendingAmount > 0).length || undefined },
            ],
          },
          {
            groupTitle: 'Transactions & Ledgers',
            items: [
              { id: 'payment_history', label: 'Payment History', icon: Clock },
              { id: 'receipts', label: 'Issued Receipts', icon: FileText, badge: state.payments.length },
              { id: 'concessions', label: 'Concessions & Waivers', icon: Award },
              { id: 'adjustments', label: 'Refunds & Adjustments', icon: AlertTriangle },
              { id: 'expenses', label: 'Operating Expenses', icon: TrendingUp },
            ],
          },
          {
            groupTitle: 'Audits & Reporting',
            items: [
              { id: 'reports', label: 'Finance Reports', icon: FileText },
              { id: 'settings', label: 'Billing Policies', icon: Settings },
            ],
          },
        ];

      case 'hr':
        return [
          {
            groupTitle: 'Personnel Overview',
            items: [{ id: 'dashboard', label: 'HR Dashboard', icon: LayoutDashboard }],
          },
          {
            groupTitle: 'Staff Administration',
            items: [
              { id: 'staff', label: 'Staff Directory', icon: Users, badge: state.staff.length + state.teachers.length },
              { id: 'staff_profiles', label: 'Staff Profiles', icon: UserCheck },
              { id: 'departments', label: 'Departments & Roles', icon: Building },
              { id: 'attendance', label: 'Staff Attendance', icon: CheckSquare },
            ],
          },
          {
            groupTitle: 'Leaves & Assignments',
            items: [
              { id: 'leave', label: 'Leave Management', icon: Calendar, badge: state.leaveRequests.filter((l) => l.status === 'Pending').length || undefined },
              { id: 'work_assignments', label: 'Work Assignments', icon: Briefcase },
              { id: 'documents', label: 'Employment Documents', icon: FileText },
            ],
          },
          {
            groupTitle: 'Talent & Compensation',
            items: [
              { id: 'recruitment', label: 'Recruitment', icon: Users },
              { id: 'payroll', label: 'Payroll Overview', icon: DollarSign },
              { id: 'reports', label: 'HR Reports', icon: FileText },
              { id: 'settings', label: 'HR Policies', icon: Settings },
            ],
          },
        ];

      case 'librarian':
        return [
          {
            groupTitle: 'Overview',
            items: [{ id: 'dashboard', label: 'Library Command Center', icon: LayoutDashboard }],
          },
          {
            groupTitle: 'Catalog & Inventory',
            items: [
              { id: 'books', label: 'Book Catalogue', icon: Library, badge: state.books.length },
              { id: 'categories', label: 'Book Categories', icon: Layers },
              { id: 'authors_publishers', label: 'Authors & Publishers', icon: BookOpen },
              { id: 'inventory', label: 'Copies & Barcodes', icon: Bookmark },
            ],
          },
          {
            groupTitle: 'Circulation Desk',
            items: [
              { id: 'issue_books', label: 'Issue Desk', icon: CheckSquare },
              { id: 'return_books', label: 'Return Desk', icon: RotateCcw },
              { id: 'active_loans', label: 'Active Loans', icon: Clock, badge: state.libraryTransactions.filter((t) => t.status === 'Issued' || t.status === 'Overdue').length || undefined },
              { id: 'overdue', label: 'Overdue Books', icon: AlertTriangle, badge: state.libraryTransactions.filter((t) => t.status === 'Overdue').length || undefined },
              { id: 'reservations', label: 'Reservations', icon: Calendar },
              { id: 'lost_damaged', label: 'Lost / Damaged', icon: AlertTriangle },
            ],
          },
          {
            groupTitle: 'Members & Governance',
            items: [
              { id: 'members', label: 'Library Members', icon: Users, badge: state.students.length },
              { id: 'transactions', label: 'Circulation History', icon: FileText },
              { id: 'reports', label: 'Library Reports', icon: TrendingUp },
              { id: 'settings', label: 'Circulation Policies', icon: Settings },
              { id: 'profile', label: 'Librarian Profile', icon: User },
            ],
          },
        ];

      case 'transport':
        return [
          {
            groupTitle: 'Fleet Overview',
            items: [{ id: 'dashboard', label: 'Transport Command', icon: Bus }],
          },
          {
            groupTitle: 'Fleet & Personnel',
            items: [
              { id: 'vehicles', label: 'Bus Fleet Register', icon: Bus, badge: 6 },
              { id: 'drivers', label: 'Drivers Directory', icon: UserCheck, badge: 4 },
              { id: 'staff', label: 'Transit Attendants', icon: Users },
            ],
          },
          {
            groupTitle: 'Routes & Schedules',
            items: [
              { id: 'routes', label: 'Transit Routes', icon: MapPin, badge: (state.transportRoutes || []).length },
              { id: 'stops', label: 'Stops & Timings', icon: Compass },
              { id: 'schedules', label: 'Route Dispatch Schedules', icon: Calendar },
            ],
          },
          {
            groupTitle: 'Passenger Operations',
            items: [
              { id: 'allocations', label: 'Student Bus Allocations', icon: Users },
              { id: 'rosters', label: 'Route Rosters & Manifests', icon: FileText },
            ],
          },
          {
            groupTitle: 'Safety, Maintenance & Reports',
            items: [
              { id: 'maintenance', label: 'Fleet Maintenance', icon: Wrench, badge: 2 },
              { id: 'incidents', label: 'Safety & Incidents', icon: ShieldCheck },
              { id: 'announcements', label: 'Transit Bulletins', icon: Megaphone },
              { id: 'reports', label: 'Operations Reports', icon: TrendingUp },
              { id: 'settings', label: 'Dispatch Policies', icon: Settings },
              { id: 'profile', label: 'Director Profile', icon: User },
            ],
          },
        ];

      case 'exam_coordinator':
        return [
          {
            groupTitle: 'Command Overview',
            items: [{ id: 'dashboard', label: 'Exam Command Center', icon: Award }],
          },
          {
            groupTitle: 'Examination Setup & Calendar',
            items: [
              { id: 'exam_setup', label: 'Examination Setup', icon: Layers },
              { id: 'sessions', label: 'Exam Types & Sessions', icon: BookOpen },
              { id: 'exam_calendar', label: 'Academic Exam Calendar', icon: Calendar },
            ],
          },
          {
            groupTitle: 'Timetable, Seating & Conflicts',
            items: [
              { id: 'schedules', label: 'Examination Timetable', icon: Clock, badge: 4 },
              { id: 'class_subject_mapping', label: 'Class & Subject Mapping', icon: CheckSquare },
              { id: 'seating', label: 'Room & Hall Allocation', icon: Building },
              { id: 'readiness', label: 'Readiness & Conflict Audit', icon: AlertTriangle, badge: 'Audit' },
            ],
          },
          {
            groupTitle: 'Marks, Moderation & Publication',
            items: [
              { id: 'marks_status', label: 'Marks Entry Status', icon: FileText },
              { id: 'marks_moderation', label: 'Results Review & Moderation', icon: CheckSquare },
              { id: 'results_publication', label: 'Results Publication Desk', icon: Send },
              { id: 'report_cards', label: 'Student Transcripts & Cards', icon: GraduationCap },
            ],
          },
          {
            groupTitle: 'Reports & Profile',
            items: [
              { id: 'reports', label: 'Examination Reports', icon: TrendingUp },
              { id: 'profile', label: 'Coordinator Profile', icon: User },
            ],
          },
        ];

      case 'receptionist':
        return [
          {
            groupTitle: 'Front Desk Overview',
            items: [{ id: 'dashboard', label: 'Front Desk Hub', icon: LayoutDashboard }],
          },
          {
            groupTitle: 'Visitor & Gate Operations',
            items: [
              { id: 'visitor_register', label: 'Visitor Register', icon: UserCheck, badge: state.visitors.filter((v) => v.status === 'Checked In').length || undefined },
              { id: 'checkin_checkout', label: 'Check-In / Check-Out Desk', icon: ShieldCheck },
              { id: 'appointments', label: 'Appointments Diary', icon: Calendar, badge: state.appointments.length },
            ],
          },
          {
            groupTitle: 'Inquiries & Admissions',
            items: [
              { id: 'enquiries', label: 'General Enquiries', icon: Users, badge: state.enquiries.length },
              { id: 'admissions_tracking', label: 'Admissions Pipeline', icon: GraduationCap },
            ],
          },
          {
            groupTitle: 'Directories & Communications',
            items: [
              { id: 'student_directory', label: 'Student & Guardian Directory', icon: Users },
              { id: 'staff_directory', label: 'Staff Work Directory', icon: Briefcase },
              { id: 'communication_log', label: 'Communication Log', icon: Phone },
              { id: 'contacts', label: 'School Emergency Contacts', icon: Building },
            ],
          },
          {
            groupTitle: 'Circulars, Reports & Profile',
            items: [
              { id: 'notices_events', label: 'Notices & School Events', icon: Bell },
              { id: 'reports', label: 'Front Office Reports', icon: TrendingUp },
              { id: 'profile', label: 'Receptionist Profile', icon: User },
            ],
          },
        ];

      case 'parent':
        return [
          {
            groupTitle: 'Ward Overview',
            items: [
              { id: 'dashboard', label: 'Parent Dashboard', icon: LayoutDashboard },
              { id: 'children', label: 'Student Profile', icon: GraduationCap },
            ],
          },
          {
            groupTitle: 'Academic Progress',
            items: [
              { id: 'academics', label: 'Report Cards & Marks', icon: Award },
              { id: 'attendance', label: 'Attendance Record', icon: CheckSquare },
              { id: 'timetable', label: 'Class Timetable', icon: Clock },
              { id: 'assignments', label: 'Homework & Tasks', icon: FileText },
            ],
          },
          {
            groupTitle: 'Tuition & Contacts',
            items: [
              { id: 'fees', label: 'Tuition & Receipts', icon: DollarSign },
              { id: 'notices', label: 'School Circulars', icon: Bell },
              { id: 'messages', label: 'Teacher Messaging', icon: MessageSquare },
              { id: 'settings', label: 'Account Settings', icon: Settings },
            ],
          },
        ];

      default:
        return [
          {
            groupTitle: 'General',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'settings', label: 'Settings', icon: Settings },
            ],
          },
        ];
    }
  };

  const navGroups = getNavGroups();

  // Filter groups if search text is entered in sidebar
  const filteredNavGroups = navGroups
    .map((grp) => ({
      ...grp,
      items: grp.items.filter(
        (item) =>
          item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
          grp.groupTitle.toLowerCase().includes(sidebarSearch.toLowerCase())
      ),
    }))
    .filter((grp) => grp.items.length > 0);

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    setMobileDrawerOpen(false);
  };

  const handleNotificationClick = (notif: any) => {
    markNotificationRead(notif.id);
    if (notif.targetModule) {
      setActiveNav(notif.targetModule);
    }
    setNotificationsOpen(false);
  };

  // 10-Role Quick Switcher definitions
  const quickRoles: { id: RoleType; label: string }[] = [
    { id: 'admin', label: 'Admin' },
    { id: 'vice_principal', label: 'VP / Academics' },
    { id: 'teacher', label: 'Teacher' },
    { id: 'parent', label: 'Parent (Mobile)' },
    { id: 'accountant', label: 'Accountant' },
    { id: 'hr', label: 'HR Manager' },
    { id: 'librarian', label: 'Librarian' },
    { id: 'transport', label: 'Transport' },
    { id: 'receptionist', label: 'Reception' },
    { id: 'exam_coordinator', label: 'Exam Coord' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Quick Role Switcher Bar - 10-role specification */}
      <div className="bg-slate-900 text-slate-300 text-xs px-3 sm:px-4 py-2 border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Role Switch:
          </span>
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {quickRoles.map((r) => {
              const isCurrent =
                state.currentRole === r.id ||
                (r.id === 'admin' && state.currentRole === 'principal');
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    if (r.id === 'parent') {
                      setPlatform('mobile');
                      setRole('parent');
                    } else {
                      setRole(r.id);
                    }
                  }}
                  style={isCurrent ? { backgroundColor: currentTheme.primary } : {}}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                    isCurrent
                      ? 'text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setPlatform('mobile')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors font-medium text-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Switch to </span>Mobile App
          </button>
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors text-xs"
            title="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Top Header - Clean 3-zone Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Zone 1: Mobile Hamburger & Brand Wordmark */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={onExitToWelcome}
            className="flex items-center gap-2.5 text-left group"
            title="Return to Welcome Screen"
          >
            <div
              style={{ backgroundColor: currentTheme.primary }}
              className="w-9 h-9 rounded-lg text-white flex items-center justify-center shadow-xs transition-colors shrink-0"
            >
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">Schlar</span>
              <span className="text-[11px] text-slate-500 block -mt-1 font-medium hidden sm:block">
                Greenfield International
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Context Navigation / Breadcrumb & Global Search */}
        <div className="flex-1 max-w-xl mx-3 sm:mx-6 hidden md:flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <span className="font-semibold text-slate-800 capitalize">
              {state.currentRole.replace('_', ' ')}
            </span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="capitalize font-medium text-slate-600 truncate max-w-[150px]">
              {state.activeNav.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100/80 text-xs text-slate-400 transition-colors shadow-2xs group"
            title="Press Cmd+K or Ctrl+K to search"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
              <span className="truncate">Search students, faculty, classes, routes...</span>
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono text-[10px] text-slate-500 shadow-2xs shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Zone 3: Primary Actions, Theme Picker, Notifications & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Accent Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setThemeMenuOpen(!themeMenuOpen);
                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700 shadow-2xs"
              title="Change Brand Theme & Accent Color"
            >
              <Palette className="w-4 h-4 text-slate-600" />
              <span
                className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs shrink-0"
                style={{ backgroundColor: currentTheme.primary }}
              />
              <span className="hidden xl:inline text-[11px] font-semibold text-slate-700">
                {currentTheme.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
                <CustomPaletteEditor onClose={() => setThemeMenuOpen(false)} />
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
                setThemeMenuOpen(false);
              }}
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Notifications
                    </h4>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead(state.currentRole)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 my-1">
                  {roleNotifs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications for this role.
                    </div>
                  ) : (
                    roleNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors rounded-lg ${
                          !n.read ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {n.description}
                        </p>
                        {n.targetModule && (
                          <span className="inline-block mt-1.5 text-[10px] text-indigo-600 font-medium">
                            Go to {n.targetModule} →
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full ${currentProfile.badgeColor} text-white font-semibold text-xs flex items-center justify-center`}
              >
                {currentProfile.avatarChar}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-slate-800 block truncate max-w-[120px]">
                  {currentProfile.name}
                </span>
                <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                  {currentProfile.title}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentProfile.name}</p>
                  <p className="text-xs text-slate-500">{currentProfile.email}</p>
                  <p className="text-[11px] text-indigo-600 font-medium mt-1">{currentProfile.title}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setActiveNav('profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 rounded-lg text-left font-semibold transition-colors mb-1"
                  >
                    <User className="w-4 h-4 text-indigo-600" />
                    My Profile & Credentials
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onExitToWelcome();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg text-left"
                  >
                    <School className="w-4 h-4 text-slate-500" />
                    Switch Role / Hub
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setPlatform('mobile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg text-left"
                  >
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    Open Mobile App View
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={onExitToWelcome}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg text-left font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out to Welcome
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar (Desktop) — ChatGPT-inspired persistent collapsible sidebar */}
        <aside
          className={`hidden md:flex ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } bg-white border-r border-slate-200/80 flex-col shrink-0 transition-all duration-200 ease-in-out z-20`}
        >
          {/* Sidebar Top: Role Info & Collapse Toggle */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  Role Workspace
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {currentProfile.title}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors mx-auto shrink-0"
              title={isSidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Sidebar Quick Filter (ChatGPT-inspired quick list search) */}
          {!isSidebarCollapsed && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter menu..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-400 bg-slate-50/70"
                />
                {sidebarSearch && (
                  <button
                    onClick={() => setSidebarSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Grouped Nav Items List */}
          <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
            {filteredNavGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-0.5">
                {!isSidebarCollapsed && (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1 pb-1">
                    {group.groupTitle}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = state.activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={isSidebarCollapsed ? `${group.groupTitle} — ${item.label}` : undefined}
                      style={
                        isActive
                          ? {
                              backgroundColor: currentTheme.light,
                              color: currentTheme.dark,
                              borderLeft: `3px solid ${currentTheme.primary}`,
                            }
                          : {}
                      }
                      className={`w-full flex items-center ${
                        isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                      } rounded-lg text-xs font-medium transition-colors text-left ${
                        isActive
                          ? 'font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className="w-4 h-4 shrink-0"
                          style={{ color: isActive ? currentTheme.primary : undefined }}
                        />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isSidebarCollapsed && item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono shrink-0 ${
                            isActive
                              ? 'bg-white text-slate-800 shadow-2xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer: My Profile & Live Badge */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 text-xs space-y-1.5">
            <button
              onClick={() => setActiveNav('profile')}
              title={isSidebarCollapsed ? 'My Profile & Account' : undefined}
              style={
                state.activeNav === 'profile'
                  ? {
                      backgroundColor: currentTheme.light,
                      color: currentTheme.dark,
                      borderLeft: `3px solid ${currentTheme.primary}`,
                    }
                  : {}
              }
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
              } rounded-lg text-xs font-semibold transition-colors text-left ${
                state.activeNav === 'profile'
                  ? 'font-bold shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <User
                className="w-4 h-4 shrink-0"
                style={{ color: currentTheme.primary }}
              />
              {!isSidebarCollapsed && <span className="truncate">My Profile & Account</span>}
            </button>

            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 px-1">
                <span>GIS Term 1 (2026)</span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Demo
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Accessible Slide-Out Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />

            {/* Sliding Drawer Content */}
            <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: currentTheme.primary }}
                    className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs"
                  >
                    GIS
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Greenfield Int.</h3>
                    <p className="text-[10px] text-slate-500">{currentProfile.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Search */}
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter menu..."
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden bg-slate-50"
                  />
                </div>
              </div>

              {/* Drawer Nav Items */}
              <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
                {filteredNavGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                      {group.groupTitle}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = state.activeNav === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          style={
                            isActive
                              ? {
                                  backgroundColor: currentTheme.light,
                                  color: currentTheme.dark,
                                  borderLeft: `3px solid ${currentTheme.primary}`,
                                }
                              : {}
                          }
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                            isActive
                              ? 'font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className="w-4 h-4 shrink-0"
                              style={{ color: isActive ? currentTheme.primary : undefined }}
                            />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="p-3 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => {
                    setActiveNav('profile');
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  <User className="w-4 h-4" />
                  My Profile & Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content Viewport — Clean main workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Confirmation Dialog for Resetting Data */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Reset Demo Data?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              This will restore all students, marks, attendance records, finance receipts, bus routes, and visitor
              logs back to the clean initial Greenfield International School dataset.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setResetConfirmOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
