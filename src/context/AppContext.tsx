import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AppState,
  PlatformType,
  RoleType,
  ThemeColor,
  THEMES,
  Student,
  StudentLifecycleStatus,
  StudentDocument,
  StudentLifecycleEvent,
  Teacher,
  TeacherDocument,
  StaffMember,
  StaffDocument,
  ClassRoom,
  AttendanceRecord,
  MarkRecord,
  Assignment,
  StudentFee,
  PaymentReceipt,
  Book,
  LibraryTransaction,
  Visitor,
  Enquiry,
  Appointment,
  LeaveRequest,
  Notice,
  SchoolEvent,
  ChatMessage,
  NotificationItem,
  TimetableSlot,
  AuditLogItem,
  AcademicYear,
  Subject,
  SubjectAllocation,
  PeriodDefinition,
  TimetableMetadata,
  TimetableRevision,
  AttendanceStatus,
  AttendanceSession,
  AttendanceCorrectionRequest,
  StudentGatePass,
  StudentLeaveRequest,
  StaffAttendanceRecord,
  AttendanceSettings,
  TransportRoute,
  hexToRgba,
  adjustHexBrightness,
} from '../types';
import { INITIAL_DATA } from '../data/initialData';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  state: AppState;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  setPlatform: (platform: PlatformType) => void;
  setRole: (role: RoleType) => void;
  setActiveNav: (nav: string) => void;
  setSelectedChild: (childId: string) => void;
  setThemeColor: (color: ThemeColor) => void;
  setCustomHex: (hex: string) => void;

  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'attendanceRate' | 'academicStatus'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  transitionStudentLifecycle: (
    studentId: string,
    toStatus: StudentLifecycleStatus,
    reason: string,
    targetClass?: string
  ) => void;
  addStudentDocument: (
    studentId: string,
    doc: Omit<StudentDocument, 'id' | 'uploadDate'>
  ) => void;

  // Teacher Actions
  addTeacher: (teacher: Omit<Teacher, 'id' | 'attendanceRate'>) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (teacherId: string) => void;
  addTeacherDocument: (
    teacherId: string,
    doc: Omit<TeacherDocument, 'id' | 'uploadDate'>
  ) => void;

  // Staff Actions
  addStaff: (staff: Omit<StaffMember, 'id' | 'attendanceRate'>) => void;
  updateStaff: (staff: StaffMember) => void;
  deleteStaff: (staffId: string) => void;
  addStaffDocument: (
    staffId: string,
    doc: Omit<StaffDocument, 'id' | 'uploadDate'>
  ) => void;

  // Class Actions
  addClass: (classroom: Omit<ClassRoom, 'id' | 'attendanceToday' | 'averageMarks' | 'totalStudents'> & { totalStudents?: number }) => void;
  updateClass: (classroom: ClassRoom) => void;
  deleteClass: (classId: string) => void;

  // Attendance Actions
  setSelectedTeacherId: (teacherId: string) => void;
  checkTeacherPeriodPermission: (
    teacherId: string,
    className: string,
    date: string,
    periodNumber: number,
    periodLabel?: string
  ) => { authorized: boolean; reason?: string; assignedTeacherName?: string; subject?: string };
  savePeriodAttendance: (params: {
    date: string;
    className: string;
    section: string;
    period: string;
    periodNumber: number;
    subject: string;
    teacherId: string;
    teacherName: string;
    room?: string;
    records: { studentId: string; status: AttendanceStatus }[];
    isDraft: boolean;
  }) => { success: boolean; message: string };
  requestAttendanceCorrection: (req: Omit<AttendanceCorrectionRequest, 'id' | 'requestedAt' | 'status'>) => void;
  reviewAttendanceCorrection: (id: string, decision: 'Approved' | 'Rejected', reviewRemarks?: string) => void;
  addGatePass: (gatePass: Omit<StudentGatePass, 'id'>) => void;
  addStudentLeaveRequest: (leave: Omit<StudentLeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  reviewStudentLeaveRequest: (id: string, decision: 'Approved' | 'Rejected', reviewRemarks?: string) => void;
  saveStaffAttendance: (records: StaffAttendanceRecord[]) => void;
  updateAttendanceSettings: (settings: AttendanceSettings) => void;
  saveClassAttendance: (
    className: string,
    records: { studentId: string; status: 'Present' | 'Absent' | 'Late' }[],
    period?: string
  ) => void;

  // Marks Actions
  saveExamMarks: (
    className: string,
    subject: string,
    exam: string,
    entries: { studentId: string; marks: number; maxMarks: number }[]
  ) => void;

  // Assignment Actions
  createAssignment: (assignment: Omit<Assignment, 'id' | 'createdDate' | 'submissionCount'>) => void;
  deleteAssignment: (assignmentId: string) => void;
  updateAssignment: (assignment: Assignment) => void;

  // Finance Actions
  recordPayment: (payment: {
    studentId: string;
    amount: number;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Card';
    referenceNumber: string;
    remarks?: string;
  }) => void;
  updateFeeRecord: (fee: StudentFee) => void;

  // Receptionist Actions
  checkInVisitor: (visitor: {
    visitorName: string;
    purpose: string;
    personToMeet: string;
    phone: string;
  }) => void;
  checkOutVisitor: (visitorId: string) => void;
  updateEnquiryStatus: (enquiryId: string, status: Enquiry['status']) => void;
  addEnquiry: (enquiry: Omit<Enquiry, 'id' | 'date'>) => void;
  updateEnquiry: (enquiry: Enquiry) => void;
  addEnquiryFollowUp: (enquiryId: string, followUp: { date: string; action: string; note: string; staff: string }) => void;
  convertEnquiryToStudent: (enquiryId: string, targetClass: string, section?: string) => { success: boolean; studentId: string; message: string };
  updateRolePermission: (role: string, permissionKey: string, allowed: boolean) => void;
  addTransportRoute: (route: Omit<TransportRoute, 'id'>) => void;
  updateTransportRoute: (route: TransportRoute) => void;
  deleteTransportRoute: (routeId: string) => void;

  // HR Actions
  handleLeaveAction: (leaveId: string, status: 'Approved' | 'Rejected') => void;

  // Library Actions
  issueBook: (studentId: string, bookId: string, dueDate: string) => boolean;
  returnBook: (transactionId: string) => void;
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;

  // Messaging Actions
  sendMessage: (
    threadId: string,
    text: string,
    senderRole: 'parent' | 'teacher' | 'school',
    senderName: string,
    recipientId: string,
    recipientName: string
  ) => void;

  // Notification Actions
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: (role: RoleType) => void;

  // Timetable Actions
  saveTimetableSlot: (slot: TimetableSlot) => void;
  deleteTimetableSlot: (slotId: string) => void;
  publishTimetable: (className: string, versionNote?: string) => void;

  // Academic Year Actions
  addAcademicYear: (ay: Omit<AcademicYear, 'id'>) => void;
  updateAcademicYear: (ay: AcademicYear) => void;
  deleteAcademicYear: (id: string) => void;
  setActiveAcademicYear: (id: string) => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: string) => void;

  // Subject Allocation Actions
  allocateSubject: (alloc: Omit<SubjectAllocation, 'id'>) => void;
  updateSubjectAllocation: (alloc: SubjectAllocation) => void;
  deleteSubjectAllocation: (allocId: string) => void;

  // School Events Actions
  addSchoolEvent: (event: Omit<SchoolEvent, 'id'>) => void;
  updateSchoolEvent: (event: SchoolEvent) => void;
  deleteSchoolEvent: (eventId: string) => void;

  // Notice Actions
  addNotice: (notice: Omit<Notice, 'id' | 'date'>) => void;
  updateNotice: (notice: Notice) => void;
  deleteNotice: (noticeId: string) => void;
  acknowledgeNotice: (noticeId: string, roleOrUserId: string) => void;

  // Audit Actions
  logAuditEvent: (action: string, target: string, category: AuditLogItem['category']) => void;

  // Reset Demo
  resetDemoData: () => void;
}

const STORAGE_KEY = 'schlar_school_state_v5';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged: AppState = {
          ...INITIAL_DATA,
          ...parsed,
          students: Array.isArray(parsed.students) && parsed.students.length > 0 ? parsed.students : INITIAL_DATA.students,
          teachers: Array.isArray(parsed.teachers) && parsed.teachers.length > 0 ? parsed.teachers : INITIAL_DATA.teachers,
          staff: Array.isArray(parsed.staff) && parsed.staff.length > 0 ? parsed.staff : INITIAL_DATA.staff,
          classes: Array.isArray(parsed.classes) && parsed.classes.length > 0 ? parsed.classes : INITIAL_DATA.classes,
          timetable: Array.isArray(parsed.timetable) && parsed.timetable.length >= INITIAL_DATA.timetable.length ? parsed.timetable : INITIAL_DATA.timetable,
          attendance: Array.isArray(parsed.attendance) ? parsed.attendance : INITIAL_DATA.attendance,
          attendanceSessions: Array.isArray(parsed.attendanceSessions) ? parsed.attendanceSessions : INITIAL_DATA.attendanceSessions,
          attendanceCorrections: Array.isArray(parsed.attendanceCorrections) ? parsed.attendanceCorrections : INITIAL_DATA.attendanceCorrections,
          gatePasses: Array.isArray(parsed.gatePasses) ? parsed.gatePasses : (INITIAL_DATA.gatePasses || []),
          studentLeaveRequests: Array.isArray(parsed.studentLeaveRequests) ? parsed.studentLeaveRequests : (INITIAL_DATA.studentLeaveRequests || []),
          staffAttendance: Array.isArray(parsed.staffAttendance) ? parsed.staffAttendance : (INITIAL_DATA.staffAttendance || []),
          marks: Array.isArray(parsed.marks) ? parsed.marks : INITIAL_DATA.marks,
          fees: Array.isArray(parsed.fees) ? parsed.fees : INITIAL_DATA.fees,
          payments: Array.isArray(parsed.payments) ? parsed.payments : INITIAL_DATA.payments,
          books: Array.isArray(parsed.books) ? parsed.books : INITIAL_DATA.books,
          libraryTransactions: Array.isArray(parsed.libraryTransactions) ? parsed.libraryTransactions : INITIAL_DATA.libraryTransactions,
          visitors: Array.isArray(parsed.visitors) ? parsed.visitors : INITIAL_DATA.visitors,
          enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : INITIAL_DATA.enquiries,
          appointments: Array.isArray(parsed.appointments) ? parsed.appointments : INITIAL_DATA.appointments,
          leaveRequests: Array.isArray(parsed.leaveRequests) ? parsed.leaveRequests : INITIAL_DATA.leaveRequests,
          notices: Array.isArray(parsed.notices) ? parsed.notices : INITIAL_DATA.notices,
          events: Array.isArray(parsed.events) ? parsed.events : INITIAL_DATA.events,
          messages: Array.isArray(parsed.messages) ? parsed.messages : INITIAL_DATA.messages,
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : INITIAL_DATA.notifications,
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : INITIAL_DATA.auditLogs,
          academicYears: Array.isArray(parsed.academicYears) && parsed.academicYears.length > 0 ? parsed.academicYears : INITIAL_DATA.academicYears,
          subjects: Array.isArray(parsed.subjects) && parsed.subjects.length > 0 ? parsed.subjects : INITIAL_DATA.subjects,
          subjectAllocations: Array.isArray(parsed.subjectAllocations) && parsed.subjectAllocations.length > 0 ? parsed.subjectAllocations : INITIAL_DATA.subjectAllocations,
          periods: Array.isArray(parsed.periods) && parsed.periods.length > 0 ? parsed.periods : INITIAL_DATA.periods,
          timetableMetadata: parsed.timetableMetadata || INITIAL_DATA.timetableMetadata,
          timetableRevisions: Array.isArray(parsed.timetableRevisions) && parsed.timetableRevisions.length > 0 ? parsed.timetableRevisions : INITIAL_DATA.timetableRevisions,
          transportRoutes: Array.isArray(parsed.transportRoutes) && parsed.transportRoutes.length > 0 ? parsed.transportRoutes : INITIAL_DATA.transportRoutes,
          themeColor: parsed.themeColor || INITIAL_DATA.themeColor,
          customHex: parsed.customHex || INITIAL_DATA.customHex,
        };
        return merged;
      }
    } catch (e) {
      console.error('Failed to load stored state', e);
    }
    return INITIAL_DATA;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }, [state]);

  // Apply Theme CSS Custom Properties and Attribute to document.documentElement
  useEffect(() => {
    const themeColor = state.themeColor || 'indigo';
    const root = document.documentElement;

    if (themeColor === 'custom' && state.customHex) {
      const hex = state.customHex;
      const primary = hex;
      const hover = adjustHexBrightness(hex, -8);
      const dark = adjustHexBrightness(hex, -16);
      const light = hexToRgba(hex, 0.08);
      const border = hexToRgba(hex, 0.25);
      const ring = hexToRgba(hex, 0.35);
      const text = hex;
      const gradientStart = dark;
      const gradientEnd = adjustHexBrightness(hex, 16);

      THEMES.custom.primary = primary;
      THEMES.custom.hover = hover;
      THEMES.custom.dark = dark;
      THEMES.custom.light = light;
      THEMES.custom.border = border;
      THEMES.custom.ring = ring;
      THEMES.custom.text = text;
      THEMES.custom.gradientStart = gradientStart;
      THEMES.custom.gradientEnd = gradientEnd;

      root.style.setProperty('--primary-color', primary);
      root.style.setProperty('--primary-hover', hover);
      root.style.setProperty('--primary-dark', dark);
      root.style.setProperty('--primary-light', light);
      root.style.setProperty('--primary-border', border);
      root.style.setProperty('--primary-ring', ring);
      root.style.setProperty('--primary-text', text);
      root.style.setProperty('--gradient-start', gradientStart);
      root.style.setProperty('--gradient-end', gradientEnd);
      root.setAttribute('data-theme', 'custom');
    } else {
      const theme = THEMES[themeColor] || THEMES.indigo;
      root.style.setProperty('--primary-color', theme.primary);
      root.style.setProperty('--primary-hover', theme.hover);
      root.style.setProperty('--primary-dark', theme.dark);
      root.style.setProperty('--primary-light', theme.light);
      root.style.setProperty('--primary-border', theme.border);
      root.style.setProperty('--primary-ring', theme.ring);
      root.style.setProperty('--primary-text', theme.text);
      root.style.setProperty('--gradient-start', theme.gradientStart);
      root.style.setProperty('--gradient-end', theme.gradientEnd);
      root.setAttribute('data-theme', theme.id);
    }
  }, [state.themeColor, state.customHex]);

  const setThemeColor = (color: ThemeColor) => {
    setState((prev) => ({ ...prev, themeColor: color }));
    const theme = THEMES[color] || THEMES.indigo;
    addToast('Theme Updated', `Switched theme accent to ${theme.name}`, 'info');
  };

  const setCustomHex = (hex: string) => {
    let clean = hex.trim();
    if (!clean.startsWith('#')) clean = '#' + clean;
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(clean)) {
      addToast('Invalid HEX', 'Please enter a valid hex color code (e.g. #164E55).', 'error');
      return;
    }
    setState((prev) => ({
      ...prev,
      customHex: clean,
      themeColor: 'custom',
    }));
    addToast('Custom Palette Saved', `Applied custom color ${clean.toUpperCase()}`, 'success');
  };

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setPlatform = (platform: PlatformType) => {
    setState((prev) => {
      let defaultRole: RoleType = 'principal';
      if (platform === 'mobile') {
        defaultRole = prev.currentRole === 'parent' ? 'parent' : 'teacher';
      }
      return {
        ...prev,
        currentPlatform: platform,
        currentRole: defaultRole,
        activeNav: 'dashboard',
      };
    });
  };

  const setRole = (role: RoleType) => {
    setState((prev) => ({
      ...prev,
      currentRole: role,
      currentPlatform: role === 'parent' ? 'mobile' : prev.currentPlatform,
      activeNav: 'dashboard',
    }));
    addToast('Switched Workspace', `Now acting as ${role.replace('_', ' ').toUpperCase()}`, 'info');
  };

  const setActiveNav = (nav: string) => {
    setState((prev) => ({ ...prev, activeNav: nav }));
  };

  const setSelectedChild = (childId: string) => {
    setState((prev) => ({ ...prev, selectedChildId: childId }));
    const child = state.students.find((s) => s.id === childId);
    if (child) {
      addToast('Active Student Profile', `Switched view to ${child.name} (${child.class})`, 'info');
    }
  };

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id' | 'attendanceRate' | 'academicStatus'>) => {
    const newId = 'std-' + Date.now();
    const newStudent: Student = {
      ...studentData,
      id: newId,
      attendanceRate: 100,
      academicStatus: 'Good',
    };

    // Also initialize a fee record for the student
    const newFee: StudentFee = {
      id: 'fee-' + newId,
      studentId: newId,
      studentName: newStudent.name,
      class: newStudent.class,
      totalFee: 4800,
      paidAmount: 0,
      pendingAmount: 4800,
      dueDate: '2026-10-31',
      status: 'Pending',
    };

    setState((prev) => {
      // Update class enrolled count
      const updatedClasses = prev.classes.map((cls) => {
        if (cls.name === newStudent.class) {
          return { ...cls, totalStudents: cls.totalStudents + 1 };
        }
        return cls;
      });

      return {
        ...prev,
        students: [newStudent, ...prev.students],
        fees: [newFee, ...prev.fees],
        classes: updatedClasses,
        notifications: [
          {
            id: 'notif-' + Date.now(),
            role: 'principal',
            title: 'New Student Admitted',
            description: `${newStudent.name} enrolled into ${newStudent.class} (${newStudent.admissionId}).`,
            timestamp: 'Just now',
            read: false,
            targetModule: 'students',
            type: 'success',
          },
          ...prev.notifications,
        ],
      };
    });

    addToast('Student Added', `${newStudent.name} successfully registered.`, 'success');
  };

  const updateStudent = (updatedStudent: Student) => {
    setState((prev) => {
      const oldStudent = prev.students.find((s) => s.id === updatedStudent.id);
      let updatedClasses = prev.classes;
      if (oldStudent && oldStudent.class !== updatedStudent.class) {
        updatedClasses = prev.classes.map((cls) => {
          if (cls.name === oldStudent.class) {
            return { ...cls, totalStudents: Math.max(0, cls.totalStudents - 1) };
          }
          if (cls.name === updatedStudent.class) {
            return { ...cls, totalStudents: cls.totalStudents + 1 };
          }
          return cls;
        });
      }

      return {
        ...prev,
        classes: updatedClasses,
        students: prev.students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)),
        fees: prev.fees.map((f) =>
          f.studentId === updatedStudent.id
            ? { ...f, studentName: updatedStudent.name, class: updatedStudent.class }
            : f
        ),
      };
    });
    addToast('Student Updated', `${updatedStudent.name} record saved.`, 'success');
  };

  const transitionStudentLifecycle = (
    studentId: string,
    toStatus: StudentLifecycleStatus,
    reason: string,
    targetClass?: string
  ) => {
    setState((prev) => {
      const target = prev.students.find((s) => s.id === studentId);
      if (!target) return prev;

      const event: StudentLifecycleEvent = {
        id: 'lc-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        fromStatus: target.status,
        toStatus,
        reason,
        recordedBy: prev.currentRole.replace('_', ' ').toUpperCase(),
        classSnapshot: targetClass || target.class,
      };

      const updatedStudent: Student = {
        ...target,
        status: toStatus,
        class: targetClass || target.class,
        lifecycleHistory: [event, ...(target.lifecycleHistory || [])],
      };

      let updatedClasses = prev.classes;
      if (targetClass && targetClass !== target.class) {
        updatedClasses = prev.classes.map((cls) => {
          if (cls.name === target.class) {
            return { ...cls, totalStudents: Math.max(0, cls.totalStudents - 1) };
          }
          if (cls.name === targetClass) {
            return { ...cls, totalStudents: cls.totalStudents + 1 };
          }
          return cls;
        });
      }

      const auditItem: AuditLogItem = {
        id: 'aud-' + Date.now(),
        timestamp: 'Just now',
        actor: 'Dr. Robert Hayes',
        role: 'Principal',
        action: `Lifecycle changed to ${toStatus}: ${reason}`,
        target: `${target.name} (${target.admissionId})`,
        category: 'Admissions',
      };

      return {
        ...prev,
        classes: updatedClasses,
        students: prev.students.map((s) => (s.id === studentId ? updatedStudent : s)),
        auditLogs: [auditItem, ...prev.auditLogs],
      };
    });

    addToast('Lifecycle Updated', `Student status transitioned to ${toStatus}.`, 'info');
  };

  const addStudentDocument = (
    studentId: string,
    doc: Omit<StudentDocument, 'id' | 'uploadDate'>
  ) => {
    const newDoc: StudentDocument = {
      ...doc,
      id: 'doc-' + Date.now(),
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? { ...s, documents: [newDoc, ...(s.documents || [])] }
          : s
      ),
    }));
    addToast('Document Registered', `${newDoc.name} on record.`, 'success');
  };

  const deleteStudent = (studentId: string) => {
    const target = state.students.find((s) => s.id === studentId);
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
      fees: prev.fees.filter((f) => f.studentId !== studentId),
      classes: prev.classes.map((cls) => {
        if (target && cls.name === target.class) {
          return { ...cls, totalStudents: Math.max(0, cls.totalStudents - 1) };
        }
        return cls;
      }),
    }));
    addToast('Student Removed', `Student record has been archived.`, 'info');
  };

  // Teacher CRUD
  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'attendanceRate'>) => {
    const newId = 'tch-' + Date.now();
    const newTeacher: Teacher = {
      ...teacherData,
      id: newId,
      attendanceRate: 98,
    };
    setState((prev) => ({
      ...prev,
      teachers: [newTeacher, ...prev.teachers],
      notifications: [
        {
          id: 'notif-' + Date.now(),
          role: 'principal',
          title: 'Faculty Member Onboarded',
          description: `${newTeacher.name} joined as ${newTeacher.roleTitle} (${newTeacher.employeeId}).`,
          timestamp: 'Just now',
          read: false,
          targetModule: 'teachers',
          type: 'success',
        },
        ...prev.notifications,
      ],
    }));
    addToast('Faculty Onboarded', `${newTeacher.name} has been added to teaching roster.`, 'success');
  };

  const updateTeacher = (updatedTeacher: Teacher) => {
    setState((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t)),
    }));
    addToast('Teacher Updated', `${updatedTeacher.name}'s profile has been updated.`, 'success');
  };

  const deleteTeacher = (teacherId: string) => {
    const target = state.teachers.find((t) => t.id === teacherId);
    setState((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== teacherId),
    }));
    addToast('Teacher Removed', `${target?.name || 'Faculty member'} removed from active roster.`, 'info');
  };

  const addTeacherDocument = (
    teacherId: string,
    doc: Omit<TeacherDocument, 'id' | 'uploadDate'>
  ) => {
    const newDoc: TeacherDocument = {
      ...doc,
      id: 'doc-t-' + Date.now(),
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setState((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) =>
        t.id === teacherId
          ? { ...t, documents: [newDoc, ...(t.documents || [])] }
          : t
      ),
    }));
    addToast('Document Added', `${newDoc.name} registered to faculty portfolio.`, 'success');
  };

  // Staff CRUD
  const addStaff = (staffData: Omit<StaffMember, 'id' | 'attendanceRate'>) => {
    const newId = 'stf-' + Date.now();
    const newStaff: StaffMember = {
      ...staffData,
      id: newId,
      attendanceRate: 97,
    };
    setState((prev) => ({
      ...prev,
      staff: [newStaff, ...prev.staff],
      notifications: [
        {
          id: 'notif-' + Date.now(),
          role: 'principal',
          title: 'Staff Member Registered',
          description: `${newStaff.name} registered in ${newStaff.department} (${newStaff.employeeId}).`,
          timestamp: 'Just now',
          read: false,
          targetModule: 'staff',
          type: 'success',
        },
        ...prev.notifications,
      ],
    }));
    addToast('Staff Registered', `${newStaff.name} has been registered to ${newStaff.department}.`, 'success');
  };

  const updateStaff = (updatedStaff: StaffMember) => {
    setState((prev) => ({
      ...prev,
      staff: prev.staff.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)),
    }));
    addToast('Staff Updated', `${updatedStaff.name}'s record has been updated.`, 'success');
  };

  const deleteStaff = (staffId: string) => {
    const target = state.staff.find((s) => s.id === staffId);
    setState((prev) => ({
      ...prev,
      staff: prev.staff.filter((s) => s.id !== staffId),
    }));
    addToast('Staff Removed', `${target?.name || 'Staff member'} removed from registry.`, 'info');
  };

  const addStaffDocument = (
    staffId: string,
    doc: Omit<StaffDocument, 'id' | 'uploadDate'>
  ) => {
    const newDoc: StaffDocument = {
      ...doc,
      id: 'doc-s-' + Date.now(),
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setState((prev) => ({
      ...prev,
      staff: prev.staff.map((s) =>
        s.id === staffId
          ? { ...s, documents: [newDoc, ...(s.documents || [])] }
          : s
      ),
    }));
    addToast('Document Added', `${newDoc.name} saved to staff record.`, 'success');
  };

  // Class CRUD
  const addClass = (classData: Omit<ClassRoom, 'id' | 'attendanceToday' | 'averageMarks' | 'totalStudents'> & { totalStudents?: number }) => {
    const newId = 'cls-' + Date.now();
    const newClass: ClassRoom = {
      ...classData,
      id: newId,
      totalStudents: classData.totalStudents || 0,
      attendanceToday: 100,
      averageMarks: 85,
    };
    setState((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));
    addToast('Class Created', `${newClass.name} added to school cohorts.`, 'success');
  };

  const updateClass = (updatedClass: ClassRoom) => {
    setState((prev) => ({
      ...prev,
      classes: prev.classes.map((c) => (c.id === updatedClass.id ? updatedClass : c)),
    }));
    addToast('Class Updated', `${updatedClass.name} updated successfully.`, 'success');
  };

  const deleteClass = (classId: string) => {
    const target = state.classes.find((c) => c.id === classId);
    setState((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.id !== classId),
    }));
    addToast('Class Removed', `${target?.name || 'Class cohort'} removed.`, 'info');
  };

  // Active Teacher Profile Context
  const setSelectedTeacherId = (teacherId: string) => {
    setState((prev) => ({ ...prev, selectedTeacherId: teacherId }));
    const t = state.teachers.find((tc) => tc.id === teacherId);
    if (t) {
      addToast('Active Faculty Changed', `Switched active faculty to ${t.name} (${t.roleTitle || t.subjects.join(', ')}).`, 'info');
    }
  };

  // Teacher-Subject-Class-Period Permission Validator
  const checkTeacherPeriodPermission = (
    teacherId: string,
    className: string,
    date: string,
    periodNumber: number,
    periodLabel?: string
  ): { authorized: boolean; reason?: string; assignedTeacherName?: string; subject?: string } => {
    // Principal and Vice Principal have institutional administrative oversight
    if (state.currentRole === 'principal' || state.currentRole === 'vice_principal') {
      return { authorized: true };
    }

    // Determine day of week from date (YYYY-MM-DD)
    const dateObj = new Date(date + 'T12:00:00');
    const dayNames: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ];
    const dayOfWeek = dayNames[dateObj.getDay()];

    if (dayOfWeek === 'Sunday' || dayOfWeek === 'Saturday') {
      return {
        authorized: false,
        reason: 'Weekend dates do not have instructional periods scheduled.',
      };
    }

    // Find the slot in timetable
    const slot = state.timetable.find(
      (s) =>
        s.class === className &&
        s.day === dayOfWeek &&
        (s.periodNumber === periodNumber || (periodLabel && s.period === periodLabel))
    );

    if (!slot) {
      return {
        authorized: false,
        reason: `No timetable assignment exists for ${className} on ${dayOfWeek} (${periodLabel || 'Period ' + periodNumber}). Please verify the master schedule.`,
      };
    }

    if (slot.teacherId === teacherId) {
      return {
        authorized: true,
        assignedTeacherName: slot.teacherName,
        subject: slot.subject,
      };
    }

    return {
      authorized: false,
      reason: `You are not assigned to this period. Only ${slot.teacherName} (${slot.subject}) is authorized to record or submit attendance for ${slot.period}.`,
      assignedTeacherName: slot.teacherName,
      subject: slot.subject,
    };
  };

  // Period Attendance Save & Submit Action
  const savePeriodAttendance = (params: {
    date: string;
    className: string;
    section: string;
    period: string;
    periodNumber: number;
    subject: string;
    teacherId: string;
    teacherName: string;
    room?: string;
    records: { studentId: string; status: AttendanceStatus }[];
    isDraft: boolean;
  }): { success: boolean; message: string } => {
    // 1. Independent validation of assignment
    const check = checkTeacherPeriodPermission(
      params.teacherId,
      params.className,
      params.date,
      params.periodNumber,
      params.period
    );

    if (!check.authorized) {
      const errorMsg = check.reason || 'Permission Denied: You are not authorized to mark attendance for this period.';
      addToast('Permission Denied', errorMsg, 'error');
      return { success: false, message: errorMsg };
    }

    const nowStr =
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const sessionStatus: 'Draft' | 'Submitted' = params.isDraft ? 'Draft' : 'Submitted';
    const sessionId = `att-sess-${params.date}-${params.className}-${params.periodNumber}`;

    setState((prev) => {
      // Filter out ONLY the marks for this specific date, class, and periodNumber/period
      const remainingAttendance = prev.attendance.filter(
        (a) =>
          !(
            a.date === params.date &&
            a.class === params.className &&
            (a.periodNumber === params.periodNumber || a.period === params.period)
          )
      );

      const newMarks: AttendanceRecord[] = params.records.map((r, idx) => ({
        id: `att-${params.date}-${params.className}-p${params.periodNumber}-${r.studentId}-${Date.now()}-${idx}`,
        date: params.date,
        class: params.className,
        section: params.section,
        period: params.period,
        periodNumber: params.periodNumber,
        subject: params.subject,
        teacherId: params.teacherId,
        studentId: r.studentId,
        status: r.status,
        markedBy: params.teacherName,
        sessionStatus,
        savedAt: nowStr,
        submittedAt: params.isDraft ? undefined : nowStr,
      }));

      // Calculate counts
      const classTotal = prev.students.filter((s) => s.class === params.className).length || params.records.length;
      const presentCount = params.records.filter((r) => r.status === 'Present').length;
      const absentCount = params.records.filter((r) => r.status === 'Absent').length;
      const lateCount = params.records.filter((r) => r.status === 'Late').length;
      const unmarkedCount = Math.max(0, classTotal - (presentCount + absentCount + lateCount));

      const updatedSession: AttendanceSession = {
        id: sessionId,
        date: params.date,
        class: params.className,
        section: params.section,
        period: params.period,
        periodNumber: params.periodNumber,
        subject: params.subject,
        teacherId: params.teacherId,
        teacherName: params.teacherName,
        room: params.room,
        status: sessionStatus,
        totalStudents: classTotal,
        presentCount,
        absentCount,
        lateCount,
        unmarkedCount,
        savedAt: nowStr,
        submittedAt: params.isDraft ? undefined : nowStr,
        submittedBy: params.isDraft ? undefined : params.teacherName,
      };

      const remainingSessions = (prev.attendanceSessions || []).filter(
        (s) =>
          !(
            s.date === params.date &&
            s.class === params.className &&
            (s.periodNumber === params.periodNumber || s.period === params.period)
          )
      );

      // Parent notifications if child is absent
      const childNotifs: NotificationItem[] = [];
      params.records.forEach((rec) => {
        if (
          (rec.studentId === prev.selectedChildId || rec.studentId === 'std-aarav' || rec.studentId === 'std-ananya') &&
          rec.status === 'Absent'
        ) {
          const student = prev.students.find((s) => s.id === rec.studentId);
          childNotifs.push({
            id: 'notif-att-' + Date.now() + '-' + rec.studentId,
            role: 'parent',
            title: `Absence Recorded: ${student?.name || 'Child'}`,
            description: `${student?.name} marked Absent for ${params.subject} (${params.period}) on ${params.date}.`,
            timestamp: 'Just now',
            read: false,
            targetModule: 'attendance',
            type: 'warning',
          });
        }
      });

      return {
        ...prev,
        attendance: [...remainingAttendance, ...newMarks],
        attendanceSessions: [updatedSession, ...remainingSessions],
        notifications: [...childNotifs, ...prev.notifications],
      };
    });

    logAuditEvent(
      `${sessionStatus === 'Draft' ? 'Saved Draft Attendance' : 'Submitted Official Attendance'} for ${params.className} ${params.period} (${params.subject})`,
      `${params.className} ${params.period}`,
      'Attendance'
    );

    addToast(
      sessionStatus === 'Draft' ? 'Draft Saved' : 'Attendance Submitted',
      sessionStatus === 'Draft'
        ? `${params.className} ${params.period} draft saved. You can reopen and finalize later.`
        : `${params.className} ${params.period} official attendance register has been submitted.`,
      'success'
    );

    return {
      success: true,
      message: sessionStatus === 'Draft' ? 'Draft saved successfully.' : 'Attendance submitted successfully.',
    };
  };

  const requestAttendanceCorrection = (reqData: Omit<AttendanceCorrectionRequest, 'id' | 'requestedAt' | 'status'>) => {
    const newId = 'corr-' + Date.now();
    const dateStr =
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newReq: AttendanceCorrectionRequest = {
      ...reqData,
      id: newId,
      requestedAt: dateStr,
      status: 'Pending',
    };

    setState((prev) => ({
      ...prev,
      attendanceCorrections: [newReq, ...(prev.attendanceCorrections || [])],
      notifications: [
        {
          id: 'notif-corr-' + Date.now(),
          role: 'vice_principal',
          title: `Attendance Correction: ${newReq.studentName}`,
          description: `${newReq.requestedBy} proposed changing ${newReq.studentName}'s mark from ${newReq.currentStatus} to ${newReq.proposedStatus} in ${newReq.class} (${newReq.period}).`,
          timestamp: 'Just now',
          read: false,
          targetModule: 'attendance',
          type: 'warning',
        },
        ...prev.notifications,
      ],
    }));

    logAuditEvent(`Requested Attendance Correction for ${newReq.studentName} (${newReq.class} ${newReq.period})`, newReq.studentName, 'Attendance');
    addToast('Correction Request Submitted', 'Sent to Academic Coordinator / Principal for review and approval.', 'info');
  };

  const reviewAttendanceCorrection = (id: string, decision: 'Approved' | 'Rejected', reviewRemarks?: string) => {
    const reviewer = state.currentRole === 'principal' ? 'Dr. Robert Hayes (Principal)' : 'Sarah Jenkins (Vice Principal)';
    const dateStr =
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setState((prev) => {
      const target = prev.attendanceCorrections?.find((c) => c.id === id);
      if (!target) return prev;

      const updatedCorrections = (prev.attendanceCorrections || []).map((c) =>
        c.id === id
          ? {
              ...c,
              status: decision,
              reviewedBy: reviewer,
              reviewedAt: dateStr,
              reviewRemarks: reviewRemarks || (decision === 'Approved' ? 'Correction verified and approved.' : 'Request rejected after review.'),
            }
          : c
      );

      let updatedAttendance = prev.attendance;
      if (decision === 'Approved') {
        updatedAttendance = prev.attendance.map((att) => {
          if (
            att.studentId === target.studentId &&
            att.date === target.date &&
            (att.period === target.period || (target.period && att.period?.includes(target.period)))
          ) {
            return {
              ...att,
              status: target.proposedStatus,
              notes: `Corrected from ${target.currentStatus} on ${dateStr} by ${reviewer}. Reason: ${target.reason}`,
            };
          }
          return att;
        });
      }

      return {
        ...prev,
        attendanceCorrections: updatedCorrections,
        attendance: updatedAttendance,
      };
    });

    logAuditEvent(`${decision} Attendance Correction for request #${id}`, id, 'Attendance');
    addToast(`Correction ${decision}`, `The attendance change request has been ${decision.toLowerCase()}.`, decision === 'Approved' ? 'success' : 'info');
  };

  const addGatePass = (data: Omit<StudentGatePass, 'id'>) => {
    const id = 'gp-' + Date.now();
    const newPass: StudentGatePass = { ...data, id };
    setState((prev) => ({
      ...prev,
      gatePasses: [newPass, ...(prev.gatePasses || [])],
    }));
    logAuditEvent(`Logged ${newPass.type} for ${newPass.studentName}`, newPass.studentName, 'Attendance');
    addToast('Gate Pass Recorded', `${newPass.type} logged for ${newPass.studentName} at ${newPass.time}.`, 'success');
  };

  const addStudentLeaveRequest = (data: Omit<StudentLeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    const id = 'slr-' + Date.now();
    const dateStr = new Date().toISOString().split('T')[0];
    const newLeave: StudentLeaveRequest = {
      ...data,
      id,
      appliedDate: dateStr,
      status: 'Pending',
    };
    setState((prev) => ({
      ...prev,
      studentLeaveRequests: [newLeave, ...(prev.studentLeaveRequests || [])],
      notifications: [
        {
          id: 'notif-slr-' + Date.now(),
          role: 'principal',
          title: `Student Leave Request: ${newLeave.studentName}`,
          description: `${newLeave.studentName} (${newLeave.class}) requested leave from ${newLeave.startDate} to ${newLeave.endDate}.`,
          timestamp: 'Just now',
          read: false,
          targetModule: 'attendance',
          type: 'info',
        },
        ...prev.notifications,
      ],
    }));
    logAuditEvent(`Submitted Student Leave for ${newLeave.studentName}`, newLeave.studentName, 'Attendance');
    addToast('Leave Request Submitted', 'Student leave application submitted for administrative review.', 'success');
  };

  const reviewStudentLeaveRequest = (id: string, decision: 'Approved' | 'Rejected', reviewRemarks?: string) => {
    const reviewer = state.currentRole === 'principal' ? 'Dr. Robert Hayes (Principal)' : 'Sarah Jenkins (Vice Principal)';
    const dateStr = new Date().toISOString().split('T')[0];

    setState((prev) => ({
      ...prev,
      studentLeaveRequests: (prev.studentLeaveRequests || []).map((l) =>
        l.id === id
          ? {
              ...l,
              status: decision,
              reviewedBy: reviewer,
              reviewedDate: dateStr,
              reviewRemarks: reviewRemarks || (decision === 'Approved' ? 'Authorized academic/medical leave.' : 'Declined.'),
            }
          : l
      ),
    }));

    logAuditEvent(`${decision} Student Leave for request #${id}`, id, 'Attendance');
    addToast(`Leave ${decision}`, `Student leave application marked as ${decision}.`, decision === 'Approved' ? 'success' : 'info');
  };

  const saveStaffAttendance = (records: StaffAttendanceRecord[]) => {
    setState((prev) => {
      const existing = prev.staffAttendance || [];
      const updated = [
        ...records,
        ...existing.filter((e) => !records.some((r) => r.staffId === e.staffId && r.date === e.date)),
      ];
      return { ...prev, staffAttendance: updated };
    });
    logAuditEvent(`Saved Staff Attendance for ${records.length} faculty/staff members`, 'Staff Attendance', 'Attendance');
    addToast('Staff Attendance Saved', `Updated attendance records for ${records.length} staff members.`, 'success');
  };

  const updateAttendanceSettings = (settings: AttendanceSettings) => {
    setState((prev) => ({ ...prev, attendanceSettings: settings }));
    logAuditEvent('Updated Attendance Settings', 'Configuration', 'Attendance');
    addToast('Attendance Settings Saved', 'Institutional attendance calculation parameters updated.', 'success');
  };

  // Legacy Attendance helper
  const saveClassAttendance = (
    className: string,
    records: { studentId: string; status: 'Present' | 'Absent' | 'Late' }[],
    period: string = 'Morning Session'
  ) => {
    const today = new Date().toISOString().split('T')[0];

    const newAttendanceEntries: AttendanceRecord[] = records.map((r, i) => ({
      id: `att-${Date.now()}-${i}`,
      date: today,
      class: className,
      period,
      studentId: r.studentId,
      status: r.status,
      markedBy: 'Class Teacher',
    }));

    setState((prev) => {
      // Remove previous records for this class and date
      const filteredAtt = prev.attendance.filter(
        (a) => !(a.class === className && a.date === today)
      );

      // Recalculate class today attendance rate
      const presentCount = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
      const attRate = Math.round((presentCount / (records.length || 1)) * 100);

      const updatedClasses = prev.classes.map((c) =>
        c.name === className ? { ...c, attendanceToday: attRate } : c
      );

      // Check if any tracked child was marked
      const childNotifs: NotificationItem[] = [];
      records.forEach((rec) => {
        if (rec.studentId === prev.selectedChildId || rec.studentId === 'std-aarav' || rec.studentId === 'std-ananya') {
          const childName = prev.students.find((s) => s.id === rec.studentId)?.name || 'Child';
          childNotifs.push({
            id: 'notif-att-' + Date.now() + '-' + rec.studentId,
            role: 'parent',
            title: `Attendance Updated: ${childName}`,
            description: `${childName} marked ${rec.status} for ${className} (${period}).`,
            timestamp: 'Just now',
            read: false,
            targetModule: 'attendance',
            type: rec.status === 'Absent' ? 'warning' : 'success',
          });
        }
      });

      return {
        ...prev,
        attendance: [...newAttendanceEntries, ...filteredAtt],
        classes: updatedClasses,
        notifications: [...childNotifs, ...prev.notifications],
      };
    });

    addToast('Attendance Saved', `Recorded ${records.length} student entries for ${className}.`, 'success');
  };

  // Marks
  const saveExamMarks = (
    className: string,
    subject: string,
    exam: string,
    entries: { studentId: string; marks: number; maxMarks: number }[]
  ) => {
    const today = new Date().toISOString().split('T')[0];

    const getGrade = (pct: number) => {
      if (pct >= 90) return 'A+';
      if (pct >= 80) return 'A';
      if (pct >= 70) return 'B';
      if (pct >= 60) return 'C';
      if (pct >= 50) return 'D';
      return 'F';
    };

    const newMarks: MarkRecord[] = entries.map((entry) => {
      const student = state.students.find((s) => s.id === entry.studentId);
      const pct = (entry.marks / (entry.maxMarks || 100)) * 100;
      return {
        id: 'mrk-' + Date.now() + '-' + entry.studentId,
        studentId: entry.studentId,
        studentName: student?.name || 'Student',
        class: className,
        subject,
        exam,
        marks: entry.marks,
        maxMarks: entry.maxMarks,
        grade: getGrade(pct),
        date: today,
      };
    });

    setState((prev) => {
      // replace marks for this exam and student
      const updatedMarks = [
        ...newMarks,
        ...prev.marks.filter(
          (m) =>
            !(
              m.class === className &&
              m.subject === subject &&
              m.exam === exam &&
              entries.some((e) => e.studentId === m.studentId)
            )
        ),
      ];

      // Update class average
      const classMarks = updatedMarks.filter((m) => m.class === className);
      const avg = classMarks.length
        ? Math.round(
            (classMarks.reduce((acc, m) => acc + (m.marks / m.maxMarks) * 100, 0) /
              classMarks.length) *
              10
          ) / 10
        : 80;

      const updatedClasses = prev.classes.map((c) =>
        c.name === className ? { ...c, averageMarks: avg } : c
      );

      return {
        ...prev,
        marks: updatedMarks,
        classes: updatedClasses,
      };
    });

    addToast('Marks Published', `Saved evaluation for ${entries.length} students in ${subject}.`, 'success');
  };

  // Assignments
  const createAssignment = (
    data: Omit<Assignment, 'id' | 'createdDate' | 'submissionCount'>
  ) => {
    const newId = 'asg-' + Date.now();
    const newAssignment: Assignment = {
      ...data,
      id: newId,
      createdDate: new Date().toISOString().split('T')[0],
      submissionCount: 0,
    };

    setState((prev) => ({
      ...prev,
      assignments: [newAssignment, ...prev.assignments],
      notifications: [
        {
          id: 'notif-' + Date.now(),
          role: 'parent',
          title: `New Assignment: ${newAssignment.subject}`,
          description: `${newAssignment.title} assigned to ${newAssignment.class}. Due ${newAssignment.dueDate}.`,
          timestamp: 'Just now',
          read: false,
          targetModule: 'assignments',
          type: 'info',
        },
        ...prev.notifications,
      ],
    }));

    addToast('Assignment Created', `"${newAssignment.title}" published to ${newAssignment.class}.`, 'success');
  };

  const updateAssignment = (updated: Assignment) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => (a.id === updated.id ? updated : a)),
    }));
    addToast('Assignment Updated', `Changes saved for "${updated.title}".`, 'success');
  };

  const deleteAssignment = (id: string) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
    addToast('Assignment Removed', `Assignment has been archived.`, 'info');
  };

  // Finance / Payments
  const recordPayment = (paymentData: {
    studentId: string;
    amount: number;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Card';
    referenceNumber: string;
    remarks?: string;
  }) => {
    const student = state.students.find((s) => s.id === paymentData.studentId);
    const receiptNum = 'REC-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
    const today = new Date().toISOString().split('T')[0];

    const receipt: PaymentReceipt = {
      id: 'pay-' + Date.now(),
      receiptNumber: receiptNum,
      studentId: paymentData.studentId,
      studentName: student?.name || 'Student',
      class: student?.class || 'N/A',
      amount: paymentData.amount,
      date: today,
      paymentMethod: paymentData.paymentMethod,
      referenceNumber: paymentData.referenceNumber,
      recordedBy: 'Edward Fletcher (Accounts)',
      remarks: paymentData.remarks,
    };

    setState((prev) => {
      const updatedFees = prev.fees.map((fee) => {
        if (fee.studentId === paymentData.studentId) {
          const newPaid = fee.paidAmount + paymentData.amount;
          const newPending = Math.max(0, fee.totalFee - newPaid);
          const newStatus: StudentFee['status'] =
            newPending === 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Pending';
          return {
            ...fee,
            paidAmount: newPaid,
            pendingAmount: newPending,
            status: newStatus,
          };
        }
        return fee;
      });

      return {
        ...prev,
        payments: [receipt, ...prev.payments],
        fees: updatedFees,
        notifications: [
          {
            id: 'notif-pay-' + Date.now(),
            role: 'parent',
            title: `Fee Payment Received: $${paymentData.amount}`,
            description: `Payment confirmed for ${student?.name || 'Student'}. Receipt #${receiptNum}.`,
            timestamp: 'Just now',
            read: false,
            targetModule: 'fees',
            type: 'success',
          },
          ...prev.notifications,
        ],
      };
    });

    addToast(
      'Payment Recorded',
      `$${paymentData.amount.toLocaleString()} received for ${student?.name}. Receipt #${receiptNum}.`,
      'success'
    );
  };

  const updateFeeRecord = (updated: StudentFee) => {
    setState((prev) => ({
      ...prev,
      fees: prev.fees.map((f) => (f.id === updated.id ? updated : f)),
    }));
    addToast('Fee Record Updated', `Fee record updated for ${updated.studentName}.`, 'success');
  };

  // Front Office
  const checkInVisitor = (visitorData: {
    visitorName: string;
    purpose: string;
    personToMeet: string;
    phone: string;
  }) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().split('T')[0];
    const newVisitor: Visitor = {
      id: 'vis-' + Date.now(),
      ...visitorData,
      entryTime: nowTime,
      date: today,
      status: 'Checked In',
    };

    setState((prev) => ({
      ...prev,
      visitors: [newVisitor, ...prev.visitors],
    }));

    addToast('Visitor Checked In', `${visitorData.visitorName} logged at Reception.`, 'success');
  };

  const checkOutVisitor = (visitorId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setState((prev) => ({
      ...prev,
      visitors: prev.visitors.map((v) =>
        v.id === visitorId ? { ...v, status: 'Checked Out', exitTime: nowTime } : v
      ),
    }));
    addToast('Visitor Checked Out', `Visitor pass closed successfully.`, 'info');
  };

  const updateEnquiryStatus = (enquiryId: string, status: Enquiry['status']) => {
    setState((prev) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) => (e.id === enquiryId ? { ...e, status } : e)),
    }));
    addToast('Enquiry Pipeline Updated', `Status changed to ${status}.`, 'info');
  };

  const addEnquiry = (enquiryData: Omit<Enquiry, 'id' | 'date'>) => {
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: 'enq-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    setState((prev) => ({
      ...prev,
      enquiries: [newEnquiry, ...prev.enquiries],
      notifications: [
        {
          id: 'notif-enq-' + Date.now(),
          role: 'receptionist',
          title: 'New Admission Enquiry',
          description: `${newEnquiry.parentName} inquired about ${newEnquiry.grade}.`,
          timestamp: 'Just now',
          read: false,
          targetModule: 'enquiries',
          type: 'info',
        },
        ...prev.notifications,
      ],
    }));
    addToast('Enquiry Logged', `Registered prospective lead for ${newEnquiry.studentName}.`, 'success');
  };

  const updateEnquiry = (updated: Enquiry) => {
    setState((prev) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) => (e.id === updated.id ? updated : e)),
    }));
    addToast('Admissions Updated', `Enquiry details saved for ${updated.studentName}.`, 'success');
  };

  const addEnquiryFollowUp = (
    enquiryId: string,
    followUp: { date: string; action: string; note: string; staff: string }
  ) => {
    setState((prev) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) => {
        if (e.id === enquiryId) {
          const currentHist = e.history || [];
          return {
            ...e,
            history: [followUp, ...currentHist],
            notes: `${e.notes ? e.notes + ' | ' : ''}${followUp.action}: ${followUp.note}`,
          };
        }
        return e;
      }),
    }));
    addToast('Follow-Up Recorded', `${followUp.action} logged for admissions follow-up.`, 'info');
  };

  const convertEnquiryToStudent = (
    enquiryId: string,
    targetClass: string,
    section: string = 'A'
  ): { success: boolean; studentId: string; message: string } => {
    const enquiry = state.enquiries.find((e) => e.id === enquiryId);
    if (!enquiry) {
      addToast('Error', 'Enquiry not found', 'error');
      return { success: false, studentId: '', message: 'Enquiry not found' };
    }

    const existing = state.students.find(
      (s) => s.name.toLowerCase() === enquiry.studentName.toLowerCase() && s.class === targetClass
    );
    if (existing) {
      addToast('Duplicate Notice', `${enquiry.studentName} is already enrolled in ${targetClass}.`, 'info');
      return { success: false, studentId: existing.id, message: 'Student is already enrolled.' };
    }

    const newId = 'std-' + Date.now();
    const admissionNumber = 'GIS-2026-0' + (Math.floor(Math.random() * 899) + 100);
    const today = new Date().toISOString().split('T')[0];

    const newStudent: Student = {
      id: newId,
      name: enquiry.studentName,
      admissionId: admissionNumber,
      admissionDate: today,
      dob: '2012-05-14',
      gender: 'Male',
      class: targetClass,
      section,
      rollNo: String(state.students.filter((s) => s.class === targetClass).length + 1).padStart(2, '0'),
      parentName: enquiry.parentName,
      parentPhone: enquiry.contact,
      parentEmail: enquiry.email || 'parent@example.com',
      address: 'Greenfield City, CA',
      attendanceRate: 98.0,
      academicStatus: 'Good',
      status: 'Active',
      bloodGroup: 'O+',
    };

    const newHistoryItem = {
      date: today,
      action: 'Converted to Student',
      note: `Formally enrolled into ${targetClass} (${section}) with Admission ID ${admissionNumber}.`,
      staff: state.currentRole === 'principal' ? 'Dr. Robert Hayes (Principal)' : 'Admissions Office',
    };

    setState((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
      enquiries: prev.enquiries.map((e) =>
        e.id === enquiryId
          ? {
              ...e,
              status: 'Converted',
              history: [newHistoryItem, ...(e.history || [])],
            }
          : e
      ),
      classes: prev.classes.map((c) =>
        c.name === targetClass
          ? { ...c, totalStudents: (c.totalStudents || 0) + 1 }
          : c
      ),
    }));

    logAuditEvent(
      `Converted applicant ${enquiry.studentName} to student (${admissionNumber}) in ${targetClass}`,
      enquiry.studentName,
      'Admissions'
    );

    addToast(
      'Applicant Enrolled',
      `${enquiry.studentName} is now officially registered in ${targetClass} as ${admissionNumber}.`,
      'success'
    );

    return {
      success: true,
      studentId: newId,
      message: `Successfully enrolled in ${targetClass} with Admission ID ${admissionNumber}.`,
    };
  };

  const updateRolePermission = (role: string, permissionKey: string, allowed: boolean) => {
    setState((prev) => {
      const existing = prev.rolePermissions || {};
      const rolePerms = existing[role] || {};
      return {
        ...prev,
        rolePermissions: {
          ...existing,
          [role]: {
            ...rolePerms,
            [permissionKey]: allowed,
          },
        },
      };
    });

    logAuditEvent(`Updated permission ${permissionKey} for role ${role} to ${allowed ? 'Allowed' : 'Denied'}`, role, 'Security');
    addToast('Permission Matrix Updated', `${role.toUpperCase()} ${permissionKey} set to ${allowed ? 'Allowed' : 'Denied'}.`, 'info');
  };

  const addTransportRoute = (routeData: Omit<TransportRoute, 'id'>) => {
    const newRoute: TransportRoute = {
      ...routeData,
      id: 'rt-' + Date.now(),
    };
    setState((prev) => ({
      ...prev,
      transportRoutes: [newRoute, ...(prev.transportRoutes || [])],
    }));
    logAuditEvent(`Added new transport route ${newRoute.routeName}`, newRoute.routeCode, 'Academic');
    addToast('Transport Route Added', `${newRoute.routeName} registered.`, 'success');
  };

  const updateTransportRoute = (route: TransportRoute) => {
    setState((prev) => ({
      ...prev,
      transportRoutes: (prev.transportRoutes || []).map((r) => (r.id === route.id ? route : r)),
    }));
    addToast('Route Updated', `${route.routeName} status and parameters saved.`, 'success');
  };

  const deleteTransportRoute = (routeId: string) => {
    const route = (state.transportRoutes || []).find((r) => r.id === routeId);
    setState((prev) => ({
      ...prev,
      transportRoutes: (prev.transportRoutes || []).filter((r) => r.id !== routeId),
    }));
    logAuditEvent(`Deleted transport route ${route?.routeName || routeId}`, route?.routeCode || routeId, 'Academic');
    addToast('Route Removed', 'Transport route has been removed.', 'info');
  };

  // HR
  const handleLeaveAction = (leaveId: string, status: 'Approved' | 'Rejected') => {
    const leave = state.leaveRequests.find((l) => l.id === leaveId);
    setState((prev) => {
      const updatedRequests = prev.leaveRequests.map((l) =>
        l.id === leaveId ? { ...l, status } : l
      );

      // If approved, update staff or teacher status
      let updatedStaff = prev.staff;
      let updatedTeachers = prev.teachers;

      if (status === 'Approved' && leave) {
        updatedStaff = prev.staff.map((s) =>
          s.id === leave.employeeId ? { ...s, status: 'On Leave' } : s
        );
        updatedTeachers = prev.teachers.map((t) =>
          t.id === leave.employeeId ? { ...t, status: 'On Leave' } : t
        );
      }

      return {
        ...prev,
        leaveRequests: updatedRequests,
        staff: updatedStaff,
        teachers: updatedTeachers,
      };
    });

    addToast('Leave Request ' + status, `Leave request for ${leave?.employeeName} marked as ${status}.`, 'info');
  };

  // Library
  const issueBook = (studentId: string, bookId: string, dueDate: string): boolean => {
    const book = state.books.find((b) => b.id === bookId);
    const student = state.students.find((s) => s.id === studentId);

    if (!book || book.availableCopies <= 0) {
      addToast('Cannot Issue Book', 'No copies currently available in catalog.', 'error');
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    const newTxn: LibraryTransaction = {
      id: 'txn-' + Date.now(),
      bookId: book.id,
      bookTitle: book.title,
      studentId: student?.id || studentId,
      studentName: student?.name || 'Student',
      class: student?.class || 'N/A',
      issueDate: today,
      dueDate,
      status: 'Issued',
      fineAmount: 0,
    };

    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) =>
        b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b
      ),
      libraryTransactions: [newTxn, ...prev.libraryTransactions],
    }));

    addToast('Book Issued', `"${book.title}" checked out to ${student?.name}. Due: ${dueDate}`, 'success');
    return true;
  };

  const returnBook = (transactionId: string) => {
    const txn = state.libraryTransactions.find((t) => t.id === transactionId);
    if (!txn) return;

    const today = new Date().toISOString().split('T')[0];
    // Check if overdue
    const isLate = new Date(today) > new Date(txn.dueDate);
    const fine = isLate ? 10 : 0;

    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) =>
        b.id === txn.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b
      ),
      libraryTransactions: prev.libraryTransactions.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              status: 'Returned',
              returnDate: today,
              fineAmount: fine,
            }
          : t
      ),
    }));

    addToast(
      'Book Returned',
      `"${txn.bookTitle}" checked back into inventory.${fine > 0 ? ` Overdue fine: $${fine}` : ''}`,
      'success'
    );
  };

  const addBook = (bookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...bookData,
      id: 'bk-' + Date.now(),
    };
    setState((prev) => ({
      ...prev,
      books: [newBook, ...prev.books],
    }));
    addToast('Book Cataloged', `"${newBook.title}" added to library collection.`, 'success');
  };

  const updateBook = (updated: Book) => {
    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) => (b.id === updated.id ? updated : b)),
    }));
    addToast('Book Updated', `"${updated.title}" catalog record updated.`, 'success');
  };

  const deleteBook = (bookId: string) => {
    setState((prev) => ({
      ...prev,
      books: prev.books.filter((b) => b.id !== bookId),
    }));
    addToast('Book Removed', 'Book record deleted from catalog.', 'info');
  };

  // Messaging
  const sendMessage = (
    threadId: string,
    text: string,
    senderRole: 'parent' | 'teacher' | 'school',
    senderName: string,
    recipientId: string,
    recipientName: string
  ) => {
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      threadId,
      senderId: 'usr-' + senderRole,
      senderName,
      senderRole,
      recipientId,
      recipientName,
      text,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));
  };

  // Notifications
  const markNotificationRead = (notifId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = (role: RoleType) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)),
    }));
    addToast('Notifications Cleared', 'All role notifications marked as read.', 'info');
  };

  // Timetable Actions
  const saveTimetableSlot = (slot: TimetableSlot) => {
    setState((prev) => {
      const existingIdx = prev.timetable.findIndex((t) => t.id === slot.id);
      let updated: TimetableSlot[];
      if (existingIdx >= 0) {
        updated = prev.timetable.map((t) => (t.id === slot.id ? slot : t));
      } else {
        updated = [...prev.timetable, slot];
      }
      return { ...prev, timetable: updated };
    });
    addToast('Timetable Updated', `${slot.class} ${slot.day} ${slot.period} slot saved.`, 'success');
  };

  const deleteTimetableSlot = (slotId: string) => {
    setState((prev) => ({
      ...prev,
      timetable: prev.timetable.filter((t) => t.id !== slotId),
    }));
    addToast('Period Slot Removed', 'Timetable slot deleted from schedule.', 'info');
  };

  // Timetable Publishing & Revisions
  const publishTimetable = (className: string, versionNote?: string) => {
    const currentMeta = state.timetableMetadata?.[className] || {
      academicYearId: state.activeAcademicYearId,
      class: className,
      version: 'v1.0',
      status: 'Draft',
      lastModified: new Date().toISOString().split('T')[0],
    };

    const verParts = currentMeta.version.replace('v', '').split('.');
    const nextVerMajor = parseInt(verParts[0] || '1', 10);
    const nextVerMinor = parseInt(verParts[1] || '0', 10) + 1;
    const newVersion = `v${nextVerMajor}.${nextVerMinor}`;

    const authorName =
      state.currentRole === 'principal'
        ? 'Dr. Robert Hayes (Principal)'
        : 'Sarah Jenkins (Vice Principal)';
    const dateStr =
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMeta: TimetableMetadata = {
      academicYearId: state.activeAcademicYearId,
      class: className,
      version: newVersion,
      status: 'Published',
      lastModified: new Date().toISOString().split('T')[0],
      publishedAt: dateStr,
      publishedBy: authorName,
      notes: versionNote || 'Official instructional schedule published for student and faculty access.',
    };

    const newRev: TimetableRevision = {
      id: 'rev-' + Date.now(),
      timestamp: dateStr,
      class: className,
      version: newVersion,
      author: authorName,
      changeSummary: versionNote || `Published approved timetable version ${newVersion} for ${className}.`,
      status: 'Published',
    };

    setState((prev) => ({
      ...prev,
      timetableMetadata: {
        ...(prev.timetableMetadata || {}),
        [className]: newMeta,
      },
      timetableRevisions: [newRev, ...(prev.timetableRevisions || [])],
    }));

    logAuditEvent(`Published Timetable ${className} (${newVersion})`, className, 'Academic');
    addToast('Timetable Published', `${className} schedule version ${newVersion} is now live and published.`, 'success');
  };

  // Academic Year Actions
  const addAcademicYear = (ayData: Omit<AcademicYear, 'id'>) => {
    const id = 'ay-' + Date.now();
    const newAy: AcademicYear = { ...ayData, id };
    setState((prev) => ({
      ...prev,
      academicYears: [...(prev.academicYears || []), newAy],
    }));
    logAuditEvent(`Created Academic Session ${newAy.name} (${newAy.code})`, newAy.name, 'Academic');
    addToast('Academic Year Added', `${newAy.name} registered.`, 'success');
  };

  const updateAcademicYear = (ay: AcademicYear) => {
    setState((prev) => ({
      ...prev,
      academicYears: (prev.academicYears || []).map((item) => (item.id === ay.id ? ay : item)),
    }));
    logAuditEvent(`Updated Academic Session ${ay.name}`, ay.name, 'Academic');
    addToast('Academic Year Updated', `Saved changes to ${ay.name}.`, 'success');
  };

  const deleteAcademicYear = (id: string) => {
    const target = state.academicYears?.find((a) => a.id === id);
    if (state.activeAcademicYearId === id) {
      addToast('Cannot Delete Active Year', 'Switch active academic session before deletion.', 'error');
      return;
    }
    setState((prev) => ({
      ...prev,
      academicYears: (prev.academicYears || []).filter((item) => item.id !== id),
    }));
    logAuditEvent(`Archived Academic Session ${target?.name || id}`, id, 'Academic');
    addToast('Academic Year Removed', 'Academic session record archived.', 'info');
  };

  const setActiveAcademicYear = (id: string) => {
    const target = state.academicYears?.find((a) => a.id === id);
    setState((prev) => ({
      ...prev,
      activeAcademicYearId: id,
      academicYears: (prev.academicYears || []).map((item) => ({
        ...item,
        status: item.id === id ? 'Active' : item.status === 'Active' ? 'Archived' : item.status,
      })),
    }));
    logAuditEvent(`Switched Active Academic Session to ${target?.name || id}`, id, 'Academic');
    addToast('Active Session Switched', `Active academic year set to ${target?.name || id}. Historical records preserved.`, 'success');
  };

  // Subject Actions
  const addSubject = (subData: Omit<Subject, 'id'>) => {
    const id = 'sub-' + Date.now();
    const newSub: Subject = { ...subData, id };
    setState((prev) => ({
      ...prev,
      subjects: [...(prev.subjects || []), newSub],
    }));
    logAuditEvent(`Created Curriculum Subject ${newSub.name} (${newSub.code})`, newSub.name, 'Academic');
    addToast('Subject Created', `${newSub.name} added to school curriculum.`, 'success');
  };

  const updateSubject = (sub: Subject) => {
    setState((prev) => ({
      ...prev,
      subjects: (prev.subjects || []).map((item) => (item.id === sub.id ? sub : item)),
    }));
    logAuditEvent(`Updated Subject Details for ${sub.name}`, sub.name, 'Academic');
    addToast('Subject Updated', `${sub.name} curriculum record updated.`, 'success');
  };

  const deleteSubject = (subId: string) => {
    const target = state.subjects?.find((s) => s.id === subId);
    setState((prev) => ({
      ...prev,
      subjects: (prev.subjects || []).filter((item) => item.id !== subId),
      subjectAllocations: (prev.subjectAllocations || []).filter((item) => item.subjectId !== subId),
    }));
    logAuditEvent(`Removed Subject ${target?.name || subId}`, subId, 'Academic');
    addToast('Subject Removed', `${target?.name || 'Subject'} and associated allocations removed.`, 'info');
  };

  // Subject Allocation Actions
  const allocateSubject = (allocData: Omit<SubjectAllocation, 'id'>) => {
    const id = 'sa-' + Date.now();
    const newAlloc: SubjectAllocation = { ...allocData, id };
    setState((prev) => ({
      ...prev,
      subjectAllocations: [...(prev.subjectAllocations || []), newAlloc],
    }));
    logAuditEvent(`Allocated ${newAlloc.subjectName} to ${newAlloc.className || ''} (${newAlloc.teacherName})`, newAlloc.className || '', 'Academic');
    addToast('Subject Allocated', `${newAlloc.subjectName} assigned to ${newAlloc.className}.`, 'success');
  };

  const updateSubjectAllocation = (alloc: SubjectAllocation) => {
    setState((prev) => ({
      ...prev,
      subjectAllocations: (prev.subjectAllocations || []).map((item) => (item.id === alloc.id ? alloc : item)),
    }));
    logAuditEvent(`Updated Allocation for ${alloc.subjectName} in ${alloc.className || ''}`, alloc.className || '', 'Academic');
    addToast('Allocation Updated', `${alloc.subjectName} assignment saved.`, 'success');
  };

  const deleteSubjectAllocation = (allocId: string) => {
    const target = state.subjectAllocations?.find((a) => a.id === allocId);
    setState((prev) => ({
      ...prev,
      subjectAllocations: (prev.subjectAllocations || []).filter((item) => item.id !== allocId),
    }));
    logAuditEvent(`Removed Allocation for ${target?.subjectName || allocId} in ${target?.className || ''}`, allocId, 'Academic');
    addToast('Allocation Removed', 'Subject teacher allocation removed.', 'info');
  };

  // School Events Actions
  const addSchoolEvent = (eventData: Omit<SchoolEvent, 'id'>) => {
    const id = 'evt-' + Date.now();
    const newEvent: SchoolEvent = { ...eventData, id };
    setState((prev) => ({
      ...prev,
      events: [...(prev.events || []), newEvent],
    }));
    logAuditEvent(`Created Calendar Event: ${newEvent.title}`, newEvent.title, 'Academic');
    addToast('Event Scheduled', `${newEvent.title} added to school calendar.`, 'success');
  };

  const updateSchoolEvent = (event: SchoolEvent) => {
    setState((prev) => ({
      ...prev,
      events: (prev.events || []).map((item) => (item.id === event.id ? event : item)),
    }));
    logAuditEvent(`Updated Calendar Event: ${event.title}`, event.title, 'Academic');
    addToast('Event Updated', `${event.title} calendar entry updated.`, 'success');
  };

  const deleteSchoolEvent = (eventId: string) => {
    const target = state.events?.find((e) => e.id === eventId);
    setState((prev) => ({
      ...prev,
      events: (prev.events || []).filter((item) => item.id !== eventId),
    }));
    logAuditEvent(`Deleted Calendar Event: ${target?.title || eventId}`, eventId, 'Academic');
    addToast('Event Deleted', 'Calendar entry removed.', 'info');
  };

  // Notice Actions
  const addNotice = (noticeData: Omit<Notice, 'id' | 'date'>) => {
    const id = 'not-' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    const newNotice: Notice = {
      ...noticeData,
      id,
      date: today,
      status: noticeData.status || 'Published',
      acknowledgedBy: [],
    };
    setState((prev) => ({
      ...prev,
      notices: [newNotice, ...prev.notices],
      notifications: [
        {
          id: 'notif-notice-' + Date.now(),
          role: 'teacher',
          title: `Announcement: ${newNotice.title}`,
          description: newNotice.content.slice(0, 80) + '...',
          timestamp: 'Just now',
          read: false,
          targetModule: 'notices',
          type: newNotice.priority === 'High' || newNotice.priority === 'Urgent' ? 'alert' : 'info',
        },
        ...prev.notifications,
      ],
    }));
    logAuditEvent(`Published Announcement: ${newNotice.title}`, newNotice.title, 'Academic');
    addToast('Notice Broadcasted', `"${newNotice.title}" published to ${newNotice.targetAudience}.`, 'success');
  };

  const updateNotice = (notice: Notice) => {
    setState((prev) => ({
      ...prev,
      notices: prev.notices.map((n) => (n.id === notice.id ? notice : n)),
    }));
    logAuditEvent(`Updated Announcement: ${notice.title}`, notice.title, 'Academic');
    addToast('Notice Updated', `Changes saved to "${notice.title}".`, 'success');
  };

  const deleteNotice = (noticeId: string) => {
    const target = state.notices.find((n) => n.id === noticeId);
    setState((prev) => ({
      ...prev,
      notices: prev.notices.filter((n) => n.id !== noticeId),
    }));
    logAuditEvent(`Deleted Notice: ${target?.title || noticeId}`, noticeId, 'Academic');
    addToast('Notice Removed', 'Announcement removed from active boards.', 'info');
  };

  const acknowledgeNotice = (noticeId: string, roleOrUserId: string) => {
    setState((prev) => ({
      ...prev,
      notices: prev.notices.map((n) => {
        if (n.id === noticeId) {
          const currentAck = n.acknowledgedBy || [];
          if (!currentAck.includes(roleOrUserId)) {
            return { ...n, acknowledgedBy: [...currentAck, roleOrUserId] };
          }
        }
        return n;
      }),
    }));
    addToast('Notice Acknowledged', 'Your acknowledgement has been recorded.', 'info');
  };

  const logAuditEvent = (action: string, target: string, category: AuditLogItem['category']) => {
    const newLog: AuditLogItem = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: state.currentRole === 'principal' ? 'Dr. Robert Hayes' : state.currentRole,
      role: state.currentRole,
      action,
      target,
      category,
    };
    setState((prev) => ({ ...prev, auditLogs: [newLog, ...(prev.auditLogs || [])] }));
  };

  // Reset Demo
  const resetDemoData = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('schlar_') || key.startsWith('schlar-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Storage reset cleanup:', e);
    }
    setState({ ...INITIAL_DATA });
    window.dispatchEvent(new CustomEvent('schlar_demo_reset'));
    addToast('Data Reset Complete', 'Greenfield International School demo data has been restored.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        state,
        toasts,
        addToast,
        removeToast,
        setPlatform,
        setRole,
        setActiveNav,
        setSelectedChild,
        setThemeColor,
        setCustomHex,
        addStudent,
        updateStudent,
        deleteStudent,
        transitionStudentLifecycle,
        addStudentDocument,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addTeacherDocument,
        addStaff,
        updateStaff,
        deleteStaff,
        addStaffDocument,
        addClass,
        updateClass,
        deleteClass,
        setSelectedTeacherId,
        checkTeacherPeriodPermission,
        savePeriodAttendance,
        requestAttendanceCorrection,
        reviewAttendanceCorrection,
        addGatePass,
        addStudentLeaveRequest,
        reviewStudentLeaveRequest,
        saveStaffAttendance,
        updateAttendanceSettings,
        saveClassAttendance,
        saveExamMarks,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        recordPayment,
        updateFeeRecord,
        checkInVisitor,
        checkOutVisitor,
        updateEnquiryStatus,
        addEnquiry,
        updateEnquiry,
        addEnquiryFollowUp,
        convertEnquiryToStudent,
        updateRolePermission,
        addTransportRoute,
        updateTransportRoute,
        deleteTransportRoute,
        handleLeaveAction,
        issueBook,
        returnBook,
        addBook,
        updateBook,
        deleteBook,
        sendMessage,
        markNotificationRead,
        markAllNotificationsRead,
        saveTimetableSlot,
        deleteTimetableSlot,
        publishTimetable,
        addAcademicYear,
        updateAcademicYear,
        deleteAcademicYear,
        setActiveAcademicYear,
        addSubject,
        updateSubject,
        deleteSubject,
        allocateSubject,
        updateSubjectAllocation,
        deleteSubjectAllocation,
        addSchoolEvent,
        updateSchoolEvent,
        deleteSchoolEvent,
        addNotice,
        updateNotice,
        deleteNotice,
        acknowledgeNotice,
        logAuditEvent,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
