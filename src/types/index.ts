export * from './theme';

export type PlatformType = 'web' | 'mobile';

export type RoleType =
  | 'admin'
  | 'principal'
  | 'vice_principal'
  | 'teacher'
  | 'parent'
  | 'accountant'
  | 'hr'
  | 'librarian'
  | 'transport'
  | 'receptionist'
  | 'exam_coordinator';

export type StudentLifecycleStatus =
  | 'Active'
  | 'Admitted'
  | 'Enquiry'
  | 'Promoted'
  | 'Transferred'
  | 'Withdrawn'
  | 'Archived'
  | 'Inactive';

export interface StudentDocument {
  id: string;
  name: string;
  type: 'Birth Certificate' | 'Transfer Certificate' | 'Immunization Record' | 'Previous Marksheet' | 'ID Proof' | 'Medical Report';
  uploadDate: string;
  fileSize: string;
  status: 'Verified' | 'Pending Verification' | 'Archived';
  notes?: string;
}

export interface StudentLifecycleEvent {
  id: string;
  date: string;
  fromStatus?: string;
  toStatus: StudentLifecycleStatus;
  reason: string;
  recordedBy: string;
  classSnapshot?: string;
}

export interface Student {
  id: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  admissionId: string;
  admissionDate?: string;
  academicYear?: string; // e.g. "2025-2026"
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  class: string; // e.g. "Grade 10A"
  section: string; // e.g. "A"
  rollNo: string;
  rollNumber?: string;
  nationality?: string;
  previousSchool?: string;
  
  // Guardian Information
  parentName: string;
  parentRelationship?: 'Father' | 'Mother' | 'Guardian';
  parentPhone: string;
  parentEmail: string;
  secondaryGuardianName?: string;
  secondaryGuardianPhone?: string;
  secondaryGuardianRelationship?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Address
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Sensitive / Health & Confidential Notes
  bloodGroup?: string;
  allergies?: string;
  medicalConditions?: string;
  internalAdministrativeNotes?: string;

  // Performance & Status
  attendanceRate: number; // e.g. 94.2
  academicStatus: 'Excellent' | 'Good' | 'Average' | 'Needs Attention';
  status: StudentLifecycleStatus;
  avatar?: string;

  // Documents & History
  documents?: StudentDocument[];
  lifecycleHistory?: StudentLifecycleEvent[];
}

export interface TeacherDocument {
  id: string;
  name: string;
  type: 'Degree Certificate' | 'Teaching License' | 'Background Verification' | 'Resume' | 'Contract';
  uploadDate: string;
  fileSize: string;
  status: 'Verified' | 'Pending Verification';
}

export interface Teacher {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  employeeId: string;
  email: string;
  phone: string;
  department?: string;
  subjects: string[];
  classes: string[];
  workloadHours: number;
  attendanceRate: number;
  status: 'Active' | 'On Leave' | 'Probation' | 'Notice Period' | 'Archived';
  employmentType?: 'Full-time' | 'Part-time' | 'Contract';
  joiningDate?: string;
  roleTitle: string;
  qualification: string;
  institution?: string;
  certifications?: string[];
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  internalNotes?: string;
  documents?: TeacherDocument[];
}

export interface StaffDocument {
  id: string;
  name: string;
  type: 'ID Proof' | 'Qualification' | 'Background Verification' | 'Contract' | 'Employment Agreement';
  uploadDate: string;
  fileSize: string;
  status: 'Verified' | 'Pending Verification';
}

export interface StaffMember {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  employeeId: string;
  role: string;
  department: 'Administration' | 'Accounts' | 'Front Office' | 'Library' | 'IT Support' | 'Operations' | 'Facilities';
  email: string;
  phone: string;
  joiningDate: string;
  attendanceRate: number;
  status: 'Active' | 'On Leave' | 'Probation' | 'Archived';
  employmentType?: 'Full-time' | 'Part-time' | 'Contract';
  qualifications?: string;
  certifications?: string[];
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  internalNotes?: string;
  documents?: StaffDocument[];
}

export interface AcademicTerm {
  id: string;
  name: string; // e.g., 'Term 1 (Fall Semester)', 'Term 2 (Spring Semester)'
  startDate: string;
  endDate: string;
  examStartDate?: string;
  examEndDate?: string;
  status: 'Upcoming' | 'Active' | 'Current' | 'Completed';
}

export interface AcademicYear {
  id: string;
  name: string; // '2026-2027 Academic Session'
  code: string; // 'AY-2026-27'
  startDate: string;
  endDate: string;
  status: 'Active' | 'Upcoming' | 'Archived';
  terms: AcademicTerm[];
  workingDays: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] | number;
  description?: string;
  isCurrent?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string; // e.g. 'MATH-101', 'SCI-201'
  category: 'STEM' | 'Humanities' | 'Languages' | 'Arts & Physical' | 'Vocational' | 'Core' | 'Elective' | 'Arts' | 'Physical Education';
  applicableGrades: string[];
  weeklyPeriods: number;
  weeklyPeriodsRequired?: number;
  description?: string;
  status: 'Active' | 'Inactive';
  academicYearId?: string;
}

export interface SubjectAllocation {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId?: string;
  className?: string;
  class?: string;
  teacherId: string;
  teacherName: string;
  weeklyPeriods: number;
  roomNumber?: string;
  academicYearId?: string;
}

export interface PeriodDefinition {
  id: string;
  periodNumber: number;
  label: string;
  startTime: string; // '08:30'
  endTime: string; // '09:15'
  timeDisplay: string; // '08:30 - 09:15 AM'
  type: 'Lecture' | 'Lab' | 'Break' | 'Lunch' | 'Assembly';
  isActive: boolean;
}

export interface TimetableMetadata {
  academicYearId: string;
  class: string;
  version: string; // e.g. 'Rev 1.2'
  status: 'Draft' | 'Under Review' | 'Published' | 'Archived';
  lastModified: string;
  publishedAt?: string;
  publishedBy?: string;
  notes?: string;
}

export interface ClassRoom {
  id: string;
  name: string; // "Grade 10A"
  grade: string;
  section: string;
  academicYearId?: string;
  classTeacherId: string;
  classTeacherName: string;
  roomNumber: string;
  totalStudents: number;
  attendanceToday: number;
  averageMarks: number;
  capacity?: number;
  status?: 'Active' | 'Archived';
  description?: string;
}

export type ClassInfo = ClassRoom;

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused' | 'Half Day';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  class: string;
  section?: string;
  period?: string;
  periodNumber?: number;
  subject?: string;
  teacherId?: string;
  studentId: string;
  status: AttendanceStatus;
  markedBy: string;
  sessionStatus?: 'Draft' | 'Submitted';
  savedAt?: string;
  submittedAt?: string;
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  date: string; // YYYY-MM-DD
  class: string;
  section: string;
  period: string; // 'Period 1'
  periodNumber: number;
  subject: string;
  teacherId: string;
  teacherName: string;
  room?: string;
  status: 'Draft' | 'Submitted';
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  unmarkedCount: number;
  savedAt: string;
  submittedAt?: string;
  submittedBy?: string;
}

export interface AttendanceCorrectionRequest {
  id: string;
  attendanceRecordId?: string;
  studentId: string;
  studentName: string;
  admissionId?: string;
  class: string;
  section: string;
  date: string;
  period: string;
  subject: string;
  currentStatus: AttendanceStatus;
  proposedStatus: AttendanceStatus;
  reason: string;
  requestedBy: string;
  requestedRole: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
}

export interface StudentGatePass {
  id: string;
  studentId: string;
  studentName: string;
  admissionId?: string;
  class: string;
  date: string; // YYYY-MM-DD
  type: 'Late Arrival' | 'Early Departure';
  time: string; // '08:45 AM'
  reason: string;
  recordedBy: string;
  guardianName?: string;
  notes?: string;
}

export interface StudentLeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  admissionId?: string;
  class: string;
  startDate: string;
  endDate: string;
  reason: string;
  appliedBy: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedDate?: string;
  reviewRemarks?: string;
}

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  role: string;
  department: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'On Leave' | 'Half Day';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface AttendanceSettings {
  lateArrivalThresholdMinutes: number;
  dailyCalculationPolicy: 'strict_majority' | 'half_day_rule' | 'all_present';
  allowTeacherCorrectionRequests: boolean;
  autoLockSubmittedDays: boolean;
}

export interface MarkRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  exam: string; // 'Midterm Examination', 'Unit Test 1', 'Quarterly Assessment'
  marks: number;
  maxMarks: number;
  grade: string;
  date: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  class: string;
  teacherId: string;
  teacherName: string;
  description: string;
  dueDate: string;
  createdDate: string;
  status: 'Published' | 'Draft';
  submissionCount: number;
  totalStudents: number;
}

export interface StudentFee {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue';
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  class: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Card';
  referenceNumber: string;
  recordedBy: string;
  remarks?: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: 'Fiction' | 'Science' | 'Mathematics' | 'History' | 'Computer Science' | 'Literature' | 'Encyclopedia' | 'Biography' | 'General';
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  language?: string;
  description?: string;
  classificationCode?: string;
}

export interface LibraryCopy {
  id: string;
  copyCode: string;
  barcode: string;
  bookId: string;
  bookTitle: string;
  shelfLocation: string;
  status: 'Available' | 'Issued' | 'Reserved' | 'Lost' | 'Damaged' | 'Archived';
  condition: 'Good' | 'Fair' | 'Poor' | 'Damaged';
  acquiredDate: string;
  borrowerName?: string;
  borrowerId?: string;
  borrowerType?: 'Student' | 'Staff';
  dueDate?: string;
  notes?: string;
}

export interface LibraryReservation {
  id: string;
  bookId: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  memberType: 'Student' | 'Staff';
  classOrDept: string;
  reservedDate: string;
  queuePosition: number;
  status: 'Queued' | 'Ready' | 'Fulfilled' | 'Cancelled';
  notes?: string;
}

export interface LibraryLostDamagedRecord {
  id: string;
  copyCode: string;
  bookId: string;
  bookTitle: string;
  reportedBy: string;
  reportedDate: string;
  type: 'Lost' | 'Damaged';
  incidentDescription: string;
  status: 'Investigating' | 'Written Off' | 'Restored';
  replacementCost?: number;
}

export interface LibraryTransaction {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  class: string;
  memberType?: 'Student' | 'Staff';
  copyCode?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Issued' | 'Returned' | 'Overdue';
  fineAmount: number;
  conditionOnReturn?: 'Good' | 'Fair' | 'Damaged';
  notes?: string;
}

export interface Visitor {
  id: string;
  visitorName: string;
  purpose: string;
  personToMeet: string;
  phone: string;
  entryTime: string;
  exitTime?: string;
  date: string;
  status: 'Checked In' | 'Checked Out';
  organization?: string;
  badgeNumber?: string;
  notes?: string;
  hostDepartment?: string;
  expectedTime?: string;
}

export interface FrontOfficeCommunicationLog {
  id: string;
  date: string;
  time: string;
  type: 'Inbound Call' | 'Outbound Call' | 'Front Desk Inquiry' | 'Emergency Message' | 'Courier / Parcel';
  callerOrVisitorName: string;
  contactNumber?: string;
  relatedPerson?: string;
  subject: string;
  details: string;
  status: 'Resolved' | 'Follow-up Required' | 'Message Passed';
  handledBy: string;
}

export interface Enquiry {
  id: string;
  parentName: string;
  studentName: string;
  grade: string;
  contact: string;
  email?: string;
  source: 'Walk-in' | 'Website' | 'Referral' | 'Social Media';
  notes: string;
  status: 'New' | 'Contacted' | 'Follow-up' | 'Under Review' | 'Accepted' | 'Converted' | 'Closed' | 'Waitlisted' | 'Rejected';
  date: string;
  assignedStaff?: string;
  followUpDate?: string;
  history?: { date: string; action: string; note: string; staff: string }[];
}

export interface TransportRoute {
  id: string;
  routeName: string;
  routeCode: string;
  startPoint: string;
  endPoint: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedStudents: number;
  morningPickupTime: string;
  afternoonDropTime: string;
  status: 'On Route' | 'Completed' | 'Idle' | 'Maintenance';
}

export interface FleetVehicle {
  id: string;
  vehicleNumber: string;
  makeModel: string;
  vehicleType: 'School Bus' | 'Mini Bus' | 'Transit Van';
  capacity: number;
  assignedRouteId?: string;
  assignedRouteCode?: string;
  driverName?: string;
  driverPhone?: string;
  status: 'Active' | 'Under Maintenance' | 'Inactive';
  insuranceExpiry: string;
  fitnessInspectionExpiry: string;
  odometerKm: number;
  fuelType?: 'Diesel' | 'Electric' | 'CNG';
  year?: number;
  notes?: string;
}

export interface RouteStop {
  id: string;
  routeId: string;
  routeCode: string;
  stopName: string;
  stopSequence: number;
  pickupTime: string;
  dropTime: string;
  areaLandmark: string;
  assignedStudentCount: number;
}

export interface StudentTransportAssignment {
  id: string;
  studentId: string;
  studentName: string;
  admissionId: string;
  class: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  pickupStopId: string;
  pickupStopName: string;
  dropStopId: string;
  dropStopName: string;
  guardianName: string;
  guardianPhone: string;
  effectiveDate: string;
  status: 'Active' | 'Suspended';
}

export interface VehicleMaintenanceLog {
  id: string;
  vehicleNumber: string;
  vehicleId: string;
  serviceType: 'Routine Service' | 'Brake Inspection' | 'Tire Replacement' | 'Engine Diagnostic' | 'AC System Service';
  serviceDate: string;
  nextDueDate: string;
  status: 'Completed' | 'Scheduled' | 'In Progress';
  odometerReadingKm: number;
  workshopVendor: string;
  cost: number;
  technicianNotes: string;
}

export interface TransportIncident {
  id: string;
  incidentRef: string;
  date: string;
  time: string;
  routeCode: string;
  vehicleNumber: string;
  category: 'Minor Delay' | 'Mechanical Issue' | 'Route Detour' | 'Inclement Weather' | 'Student Behavior';
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  resolutionStatus: 'Resolved' | 'Under Review';
  actionTaken: string;
  reportedBy: string;
}

export interface TransportAnnouncement {
  id: string;
  title: string;
  routeCode: string;
  audience: string;
  message: string;
  date: string;
  priority: 'High' | 'Normal';
  author: string;
}

export interface Appointment {
  id: string;
  parentName: string;
  studentName: string;
  withPerson: string;
  date: string;
  time: string;
  purpose: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  notes?: string;
  hostDepartment?: string;
  phone?: string;
}

export interface Examination {
  id: string;
  name: string;
  code: string;
  academicYearId: string;
  term: string;
  type: 'Mid-Term Assessment' | 'Final Examination' | 'Unit Test' | 'Practical / Lab Assessment' | 'Mock Board Exam';
  startDate: string;
  endDate: string;
  applicableClasses: string[];
  status: 'Draft' | 'Scheduled' | 'In Progress' | 'Under Moderation' | 'Published' | 'Archived';
  description?: string;
  isPublishedToParents?: boolean;
  publishedDate?: string;
  approvedBy?: string;
}

export interface ExamSchedulePaper {
  id: string;
  examId: string;
  examName: string;
  class: string;
  section: string;
  subject: string;
  subjectCode: string;
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  hallOrRoom: string;
  invigilatorStaffId?: string;
  invigilatorName: string;
  maxMarks: number;
  passMarks: number;
  status: 'Draft' | 'Scheduled' | 'Completed' | 'Marks Entered' | 'Moderated' | 'Published';
  readinessCheckStatus: 'Ready' | 'Needs Attention' | 'Conflict';
  conflictNote?: string;
}

export interface ExamReadinessIssue {
  id: string;
  paperId?: string;
  examId: string;
  type: 'Schedule Conflict' | 'Missing Room' | 'Missing Invigilator' | 'Marks Pending' | 'Subject Unmapped';
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  affectedClass: string;
  affectedSubject: string;
  resolutionPath: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  leaveType: 'Sick Leave' | 'Casual Leave' | 'Maternity Leave' | 'Annual Leave';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

export interface Notice {
  id: string;
  title: string;
  category: 'School' | 'Class' | 'Exam' | 'Event' | 'Important';
  date: string;
  targetAudience: string;
  content: string;
  priority: 'High' | 'Normal' | 'Urgent';
  author: string;
  status?: 'Published' | 'Draft' | 'Scheduled' | 'Archived';
  expiryDate?: string;
  acknowledgedBy?: string[];
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  location?: string;
  audience?: string;
  targetAudience?: string;
  type?: 'Holiday' | 'Examination' | 'PTM' | 'Academic Deadline' | 'School Event' | 'Term Date' | 'Staff Development' | 'Academic' | 'Sports' | 'Meeting';
  status?: 'Upcoming' | 'Ongoing' | 'Completed';
  description: string;
  applicableClasses?: string[];
  academicYearId?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher' | 'school';
  recipientId: string;
  recipientName: string;
  text: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  role: RoleType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetModule: string;
  type: 'alert' | 'info' | 'success' | 'warning';
}

export type ThemeColor = 'indigo' | 'emerald' | 'ocean' | 'violet' | 'crimson' | 'amber' | 'slate' | 'petrol' | 'custom';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  label: string;
  primary: string;
  hover: string;
  dark: string;
  light: string;
  border: string;
  ring: string;
  text: string;
  gradientStart: string;
  gradientEnd: string;
  badgeBg: string;
}

export const THEMES: Record<ThemeColor, ThemeConfig> = {
  indigo: {
    id: 'indigo',
    name: 'Sapphire Indigo',
    label: 'Classic Indigo',
    primary: '#4f46e5',
    hover: '#4338ca',
    dark: '#3730a3',
    light: '#eef2ff',
    border: '#c7d2fe',
    ring: 'rgba(79, 70, 229, 0.35)',
    text: '#4338ca',
    gradientStart: '#3730a3',
    gradientEnd: '#6366f1',
    badgeBg: 'bg-indigo-600',
  },
  emerald: {
    id: 'emerald',
    name: 'Forest Emerald',
    label: 'Fresh Green',
    primary: '#059669',
    hover: '#047857',
    dark: '#065f46',
    light: '#ecfdf5',
    border: '#a7f3d0',
    ring: 'rgba(5, 150, 105, 0.35)',
    text: '#047857',
    gradientStart: '#065f46',
    gradientEnd: '#10b981',
    badgeBg: 'bg-emerald-600',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Sky',
    label: 'Vibrant Blue',
    primary: '#0284c7',
    hover: '#0369a1',
    dark: '#075985',
    light: '#f0f9ff',
    border: '#bae6fd',
    ring: 'rgba(2, 132, 199, 0.35)',
    text: '#0369a1',
    gradientStart: '#075985',
    gradientEnd: '#38bdf8',
    badgeBg: 'bg-sky-600',
  },
  violet: {
    id: 'violet',
    name: 'Royal Violet',
    label: 'Regal Purple',
    primary: '#7c3aed',
    hover: '#6d28d9',
    dark: '#5b21b6',
    light: '#f5f3ff',
    border: '#ddd6fe',
    ring: 'rgba(124, 58, 237, 0.35)',
    text: '#6d28d9',
    gradientStart: '#5b21b6',
    gradientEnd: '#a855f7',
    badgeBg: 'bg-violet-600',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Rose',
    label: 'Collegiate Ruby',
    primary: '#e11d48',
    hover: '#be123c',
    dark: '#9f1239',
    light: '#fff1f2',
    border: '#fecdd3',
    ring: 'rgba(225, 29, 72, 0.35)',
    text: '#be123c',
    gradientStart: '#9f1239',
    gradientEnd: '#f43f5e',
    badgeBg: 'bg-rose-600',
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber',
    label: 'Scholastic Gold',
    primary: '#d97706',
    hover: '#b45309',
    dark: '#92400e',
    light: '#fffbeb',
    border: '#fde68a',
    ring: 'rgba(217, 119, 6, 0.35)',
    text: '#b45309',
    gradientStart: '#92400e',
    gradientEnd: '#f59e0b',
    badgeBg: 'bg-amber-600',
  },
  slate: {
    id: 'slate',
    name: 'Midnight Slate',
    label: 'Executive Navy',
    primary: '#334155',
    hover: '#1e293b',
    dark: '#0f172a',
    light: '#f8fafc',
    border: '#cbd5e1',
    ring: 'rgba(51, 65, 85, 0.35)',
    text: '#1e293b',
    gradientStart: '#0f172a',
    gradientEnd: '#475569',
    badgeBg: 'bg-slate-700',
  },
  petrol: {
    id: 'petrol',
    name: 'Petrol & Copper',
    label: 'Architectural Teal',
    primary: '#164E55',
    hover: '#103C42',
    dark: '#0A2A2E',
    light: '#F5F0E7',
    border: '#C47D54',
    ring: 'rgba(22, 78, 85, 0.35)',
    text: '#164E55',
    gradientStart: '#164E55',
    gradientEnd: '#287B7A',
    badgeBg: 'bg-[#164E55]',
  },
  custom: {
    id: 'custom',
    name: 'Custom Palette',
    label: 'Custom HEX',
    primary: '#164E55',
    hover: '#103C42',
    dark: '#0A2A2E',
    light: '#F5F0E7',
    border: '#C47D54',
    ring: 'rgba(22, 78, 85, 0.35)',
    text: '#164E55',
    gradientStart: '#164E55',
    gradientEnd: '#287B7A',
    badgeBg: 'bg-[#164E55]',
  },
};

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: string;
  periodNumber: number;
  time: string;
  class: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Practical' | 'Sports' | 'Library';
  notes?: string;
  academicYearId?: string;
}

export interface TimetableRevision {
  id: string;
  timestamp: string;
  class: string;
  version: string;
  author: string;
  changeSummary: string;
  status: 'Draft' | 'Published';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  category: 'Attendance' | 'Marks' | 'Finance' | 'Admissions' | 'Security' | 'Academic';
}

export interface AppState {
  currentPlatform: PlatformType;
  currentRole: RoleType;
  activeNav: string;
  selectedChildId: string; // for parent view: 'std-aarav' or 'std-ananya'
  themeColor: ThemeColor;
  students: Student[];
  teachers: Teacher[];
  staff: StaffMember[];
  classes: ClassRoom[];
  academicYears: AcademicYear[];
  activeAcademicYearId: string;
  subjects: Subject[];
  subjectAllocations: SubjectAllocation[];
  periods: PeriodDefinition[];
  timetable: TimetableSlot[];
  timetableRevisions: TimetableRevision[];
  timetableMetadata: Record<string, TimetableMetadata>;
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
  assignments: Assignment[];
  auditLogs: AuditLogItem[];
  fees: StudentFee[];
  payments: PaymentReceipt[];
  books: Book[];
  libraryTransactions: LibraryTransaction[];
  visitors: Visitor[];
  enquiries: Enquiry[];
  appointments: Appointment[];
  leaveRequests: LeaveRequest[];
  notices: Notice[];
  events: SchoolEvent[];
  schoolEvents?: SchoolEvent[];
  messages: ChatMessage[];
  notifications: NotificationItem[];
  selectedTeacherId?: string;
  attendanceSessions?: AttendanceSession[];
  attendanceCorrections?: AttendanceCorrectionRequest[];
  gatePasses?: StudentGatePass[];
  studentLeaveRequests?: StudentLeaveRequest[];
  staffAttendance?: StaffAttendanceRecord[];
  attendanceSettings?: AttendanceSettings;
  customThemes?: ThemeConfig[];
  currentPaletteId?: string;
  customHex?: string;
  transportRoutes?: TransportRoute[];
  rolePermissions?: Record<string, Record<string, boolean>>;
  libraryCopies?: LibraryCopy[];
  libraryReservations?: LibraryReservation[];
  libraryLostDamaged?: LibraryLostDamagedRecord[];
  fleetVehicles?: FleetVehicle[];
  routeStops?: RouteStop[];
  transportAssignments?: StudentTransportAssignment[];
  maintenanceLogs?: VehicleMaintenanceLog[];
  transportIncidents?: TransportIncident[];
  transportAnnouncements?: TransportAnnouncement[];
  communicationLogs?: FrontOfficeCommunicationLog[];
  examinations?: Examination[];
  examSchedulePapers?: ExamSchedulePaper[];
  examReadinessIssues?: ExamReadinessIssue[];
}
