import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { MetricCard } from '../../common/MetricCard';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';
import {
  Examination,
  ExamSchedulePaper,
  ExamReadinessIssue,
  Student,
} from '../../../types';
import {
  Award,
  Calendar,
  Clock,
  CheckSquare,
  FileText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Download,
  Share2,
  Settings,
  BookOpen,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Building,
  GraduationCap,
  Send,
  User,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Sliders,
} from 'lucide-react';

const EXAMS_STORAGE_KEY = 'schlar_exam_definitions_v1';
const PAPERS_STORAGE_KEY = 'schlar_exam_papers_v1';
const READINESS_STORAGE_KEY = 'schlar_exam_readiness_v1';

const INITIAL_EXAMS: Examination[] = [
  {
    id: 'exam-t1-mid',
    name: 'Term 1 Mid-Term Assessment',
    code: 'EXAM-2026-T1-MID',
    academicYearId: 'ay-2026-27',
    term: 'Term 1',
    type: 'Mid-Term Assessment',
    startDate: '2026-10-26',
    endDate: '2026-11-04',
    applicableClasses: ['Grade 10A', 'Grade 10B', 'Grade 9A', 'Grade 8A', 'Grade 7B'],
    status: 'In Progress',
    description: 'Mid-semester cumulative syllabus assessment covering units 1 through 4.',
    isPublishedToParents: true,
    publishedDate: '2026-10-15',
    approvedBy: 'Dr. Helen Vance (Exam Controller)',
  },
  {
    id: 'exam-t1-fin',
    name: 'Term 1 Final Examination',
    code: 'EXAM-2026-T1-FIN',
    academicYearId: 'ay-2026-27',
    term: 'Term 1',
    type: 'Final Examination',
    startDate: '2026-12-08',
    endDate: '2026-12-22',
    applicableClasses: ['Grade 10A', 'Grade 10B', 'Grade 9A', 'Grade 8A', 'Grade 7B', 'Grade 5B'],
    status: 'Scheduled',
    description: 'Comprehensive end-of-term semester examinations and Cambridge board mock prep.',
    isPublishedToParents: false,
    approvedBy: 'Dr. Robert Hayes (Principal)',
  },
  {
    id: 'exam-ut-2',
    name: 'Unit Test 2 — STEM & Languages',
    code: 'EXAM-2026-UT-02',
    academicYearId: 'ay-2026-27',
    term: 'Term 1',
    type: 'Unit Test',
    startDate: '2026-11-18',
    endDate: '2026-11-20',
    applicableClasses: ['Grade 10A', 'Grade 8A'],
    status: 'Draft',
    description: 'Diagnostic monthly unit quiz for algebra, physics lab, and creative writing.',
    isPublishedToParents: false,
  },
  {
    id: 'exam-mock-board',
    name: 'Senior Secondary Mock Board Exam',
    code: 'EXAM-2027-MOCK-10',
    academicYearId: 'ay-2026-27',
    term: 'Term 2',
    type: 'Mock Board Exam',
    startDate: '2027-01-15',
    endDate: '2027-01-28',
    applicableClasses: ['Grade 10A', 'Grade 10B'],
    status: 'Draft',
    description: 'Full simulation of Cambridge IGCSE and National Board external examinations.',
    isPublishedToParents: false,
  },
];

const INITIAL_PAPERS: ExamSchedulePaper[] = [
  {
    id: 'paper-1',
    examId: 'exam-t1-mid',
    examName: 'Term 1 Mid-Term Assessment',
    class: 'Grade 10A',
    section: 'A',
    subject: 'Mathematics',
    subjectCode: 'MATH-101',
    examDate: '2026-10-26',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    durationMinutes: 180,
    hallOrRoom: 'Central Examination Hall A',
    invigilatorName: 'Marcus Sterling',
    maxMarks: 100,
    passMarks: 40,
    status: 'Scheduled',
    readinessCheckStatus: 'Ready',
  },
  {
    id: 'paper-2',
    examId: 'exam-t1-mid',
    examName: 'Term 1 Mid-Term Assessment',
    class: 'Grade 10A',
    section: 'A',
    subject: 'Physics',
    subjectCode: 'PHY-201',
    examDate: '2026-10-28',
    startTime: '09:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 150,
    hallOrRoom: 'Science Wing Room 204',
    invigilatorName: 'Laura Bennett',
    maxMarks: 100,
    passMarks: 40,
    status: 'Scheduled',
    readinessCheckStatus: 'Ready',
  },
  {
    id: 'paper-3',
    examId: 'exam-t1-mid',
    examName: 'Term 1 Mid-Term Assessment',
    class: 'Grade 10B',
    section: 'B',
    subject: 'Physics',
    subjectCode: 'PHY-201',
    examDate: '2026-10-28',
    startTime: '09:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 150,
    hallOrRoom: 'Science Wing Room 204', // Intentional conflict demo
    invigilatorName: 'Laura Bennett', // Intentional invigilator double-booking demo
    maxMarks: 100,
    passMarks: 40,
    status: 'Scheduled',
    readinessCheckStatus: 'Conflict',
    conflictNote: 'Hall Room 204 & Invigilator Laura Bennett double-booked with Grade 10A.',
  },
  {
    id: 'paper-4',
    examId: 'exam-t1-mid',
    examName: 'Term 1 Mid-Term Assessment',
    class: 'Grade 8A',
    section: 'A',
    subject: 'English Literature & Composition',
    subjectCode: 'ENG-101',
    examDate: '2026-10-27',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    durationMinutes: 120,
    hallOrRoom: 'Auditorium West',
    invigilatorName: 'David Kim',
    maxMarks: 80,
    passMarks: 32,
    status: 'Completed',
    readinessCheckStatus: 'Ready',
  },
  {
    id: 'paper-5',
    examId: 'exam-t1-mid',
    examName: 'Term 1 Mid-Term Assessment',
    class: 'Grade 10A',
    section: 'A',
    subject: 'Computer Science & Coding',
    subjectCode: 'CS-105',
    examDate: '2026-11-02',
    startTime: '01:00 PM',
    endTime: '03:30 PM',
    durationMinutes: 150,
    hallOrRoom: 'Computer Lab 1',
    invigilatorName: 'Rachel Green',
    maxMarks: 100,
    passMarks: 40,
    status: 'Scheduled',
    readinessCheckStatus: 'Ready',
  },
  {
    id: 'paper-6',
    examId: 'exam-t1-mid',
    examName: 'Term 1 Mid-Term Assessment',
    class: 'Grade 7B',
    section: 'B',
    subject: 'General Science',
    subjectCode: 'SCI-101',
    examDate: '2026-10-29',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    durationMinutes: 120,
    hallOrRoom: 'Room 104',
    invigilatorName: 'Unassigned',
    maxMarks: 80,
    passMarks: 32,
    status: 'Draft',
    readinessCheckStatus: 'Needs Attention',
    conflictNote: 'No invigilator assigned yet.',
  },
];

const EXAMINATION_HALLS = [
  { id: 'hall-a', name: 'Central Examination Hall A', capacity: 120, location: 'Admin Block Level 2', facilities: 'AC, CCTV Surveillance, Acoustic Padding', status: 'Available' },
  { id: 'hall-aud', name: 'Auditorium West Wing', capacity: 150, location: 'Arts Pavilion', facilities: 'Stage Sound System, Partitioned Desks', status: 'Available' },
  { id: 'hall-sci', name: 'Science Wing Room 204', capacity: 40, location: 'Science Block Level 2', facilities: 'Fixed Desks, Demonstration Bench', status: 'In Use' },
  { id: 'hall-r301', name: 'Room 301', capacity: 35, location: 'High School Block Level 3', facilities: 'Individual Desks, Smart Whiteboard', status: 'Available' },
  { id: 'hall-r302', name: 'Room 302', capacity: 35, location: 'High School Block Level 3', facilities: 'Individual Desks', status: 'Available' },
  { id: 'hall-lab1', name: 'Computer Lab 1', capacity: 30, location: 'IT Wing Lower Level', facilities: '30 Terminals, High Speed LAN, UPS', status: 'Available' },
];

const GRADING_SCALE = [
  { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0, description: 'Outstanding Academic Mastery', remarks: 'Exceptional concept grasp & critical application' },
  { grade: 'A', minPercentage: 80, maxPercentage: 89, gpa: 3.7, description: 'Excellent Comprehension', remarks: 'Consistent thorough understanding' },
  { grade: 'B', minPercentage: 70, maxPercentage: 79, gpa: 3.0, description: 'Good Performance', remarks: 'Solid foundational command with minor gaps' },
  { grade: 'C', minPercentage: 60, maxPercentage: 69, gpa: 2.0, description: 'Satisfactory Progress', remarks: 'Meets minimum grade level benchmark' },
  { grade: 'D', minPercentage: 50, maxPercentage: 59, gpa: 1.0, description: 'Pass / Marginal', remarks: 'Eligible for promotion, remedial advice given' },
  { grade: 'F', minPercentage: 0, maxPercentage: 49, gpa: 0.0, description: 'Needs Remediation / Fail', remarks: 'Mandatory remedial intervention recommended' },
];

export const ExamCoordinatorView: React.FC = () => {
  const { state, addToast, setActiveNav } = useApp();

  // Master Exams State
  const [exams, setExams] = useState<Examination[]>(() => {
    try {
      const saved = localStorage.getItem(EXAMS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
    } catch (e) {
      console.error('Failed to save exams', e);
    }
  }, [exams]);

  // Exam Papers State
  const [papers, setPapers] = useState<ExamSchedulePaper[]>(() => {
    try {
      const saved = localStorage.getItem(PAPERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PAPERS;
    } catch {
      return INITIAL_PAPERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify(papers));
    } catch (e) {
      console.error('Failed to save exam papers', e);
    }
  }, [papers]);

  useEffect(() => {
    const handleReset = () => {
      setExams(INITIAL_EXAMS);
      setPapers(INITIAL_PAPERS);
    };
    window.addEventListener('schlar_demo_reset', handleReset);
    return () => window.removeEventListener('schlar_demo_reset', handleReset);
  }, []);

  // Search & Filters
  const [paperSearch, setPaperSearch] = useState('');
  const [paperClassFilter, setPaperClassFilter] = useState('All');
  const [paperExamFilter, setPaperExamFilter] = useState('All');
  const [paperStatusFilter, setPaperStatusFilter] = useState('All');

  // Modals
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [isSchedulePaperModalOpen, setIsSchedulePaperModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<ExamSchedulePaper | null>(null);
  const [selectedPaperForDelete, setSelectedPaperForDelete] = useState<ExamSchedulePaper | null>(null);
  const [selectedStudentForReportCard, setSelectedStudentForReportCard] = useState<Student | null>(null);
  const [reportCardClassFilter, setReportCardClassFilter] = useState('Grade 10A');
  const [moderationSubjectModal, setModerationSubjectModal] = useState<any | null>(null);
  const [isHallTicketModalOpen, setIsHallTicketModalOpen] = useState(false);
  const [selectedHallForView, setSelectedHallForView] = useState<any | null>(null);

  // New Exam Form
  const [examForm, setExamForm] = useState({
    name: '',
    code: '',
    term: 'Term 1',
    type: 'Mid-Term Assessment' as Examination['type'],
    startDate: '2026-11-10',
    endDate: '2026-11-25',
    applicableClasses: ['Grade 10A', 'Grade 10B', 'Grade 9A', 'Grade 8A'],
    description: '',
  });

  // Schedule Paper Form
  const [paperForm, setPaperForm] = useState({
    examId: 'exam-t1-mid',
    class: 'Grade 10A',
    subject: 'Biology & Life Sciences',
    subjectCode: 'BIO-203',
    examDate: '2026-10-30',
    startTime: '09:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 150,
    hallOrRoom: 'Central Examination Hall A',
    invigilatorName: 'Emily Watson',
    maxMarks: 100,
    passMarks: 40,
  });

  // Automated Conflict Detector
  const detectConflicts = (newPaper: typeof paperForm, excludePaperId?: string) => {
    const conflicts: string[] = [];

    // Check overlaps with other papers on the same date
    const sameDatePapers = papers.filter(
      (p) => p.examDate === newPaper.examDate && p.id !== excludePaperId
    );

    // 1. Same Class conflict
    const classConflict = sameDatePapers.find((p) => p.class === newPaper.class);
    if (classConflict) {
      conflicts.push(`Class Conflict: ${newPaper.class} is already scheduled for "${classConflict.subject}" on ${newPaper.examDate} (${classConflict.startTime} - ${classConflict.endTime}).`);
    }

    // 2. Same Hall / Room conflict
    const roomConflict = sameDatePapers.find(
      (p) => p.hallOrRoom.toLowerCase() === newPaper.hallOrRoom.toLowerCase()
    );
    if (roomConflict) {
      conflicts.push(`Room Double-Booking: "${newPaper.hallOrRoom}" is already booked on ${newPaper.examDate} for ${roomConflict.class} (${roomConflict.subject}).`);
    }

    // 3. Same Invigilator conflict
    if (newPaper.invigilatorName && newPaper.invigilatorName !== 'Unassigned') {
      const invigConflict = sameDatePapers.find(
        (p) => p.invigilatorName.toLowerCase() === newPaper.invigilatorName.toLowerCase()
      );
      if (invigConflict) {
        conflicts.push(`Invigilator Overlap: Faculty ${newPaper.invigilatorName} is already assigned to invigilate ${invigConflict.class} on ${newPaper.examDate}.`);
      }
    }

    return conflicts;
  };

  const activeConflictsCount = useMemo(() => {
    let count = 0;
    papers.forEach((p, idx) => {
      const others = papers.filter((o, oIdx) => oIdx !== idx && o.examDate === p.examDate);
      const hasConflict = others.some(
        (o) =>
          o.class === p.class ||
          o.hallOrRoom === p.hallOrRoom ||
          (o.invigilatorName === p.invigilatorName && p.invigilatorName !== 'Unassigned')
      );
      if (hasConflict) count++;
    });
    return count;
  }, [papers]);

  // Overall marks completion % across all classes
  const marksStats = useMemo(() => {
    const totalPossibleMarks = state.students.length * 6; // approximate subjects
    const entered = state.marks.length;
    const pct = Math.min(100, Math.round((entered / (totalPossibleMarks || 1)) * 100));
    return { entered, totalPossibleMarks, pct: pct || 86 };
  }, [state.students, state.marks]);

  // Handlers
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.name.trim()) {
      addToast('Validation', 'Exam name is required.', 'error');
      return;
    }

    const code = examForm.code.trim() || `EXAM-2026-${examForm.name.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const newExam: Examination = {
      id: 'exam-' + Date.now(),
      name: examForm.name.trim(),
      code,
      academicYearId: 'ay-2026-27',
      term: examForm.term,
      type: examForm.type,
      startDate: examForm.startDate,
      endDate: examForm.endDate,
      applicableClasses: examForm.applicableClasses,
      status: 'Scheduled',
      description: examForm.description,
      isPublishedToParents: false,
    };

    setExams([newExam, ...exams]);
    setIsAddExamModalOpen(false);
    addToast('Examination Created', `"${newExam.name}" master exam record has been registered.`, 'success');

    setExamForm({
      name: '',
      code: '',
      term: 'Term 1',
      type: 'Mid-Term Assessment',
      startDate: '2026-11-10',
      endDate: '2026-11-25',
      applicableClasses: ['Grade 10A', 'Grade 10B', 'Grade 9A', 'Grade 8A'],
      description: '',
    });
  };

  const handleSchedulePaper = (e: React.FormEvent) => {
    e.preventDefault();

    const conflicts = detectConflicts(paperForm, editingPaper?.id);
    const parentExam = exams.find((x) => x.id === paperForm.examId);

    const readiness: ExamSchedulePaper['readinessCheckStatus'] =
      conflicts.length > 0
        ? 'Conflict'
        : paperForm.invigilatorName === 'Unassigned'
        ? 'Needs Attention'
        : 'Ready';

    if (editingPaper) {
      setPapers(
        papers.map((p) =>
          p.id === editingPaper.id
            ? {
                ...p,
                ...paperForm,
                examName: parentExam?.name || p.examName,
                readinessCheckStatus: readiness,
                conflictNote: conflicts.join(' | ') || undefined,
              }
            : p
        )
      );
      addToast(
        conflicts.length > 0 ? 'Paper Updated with Conflict Warning' : 'Paper Updated',
        conflicts.length > 0 ? conflicts[0] : `Exam paper for ${paperForm.subject} saved.`,
        conflicts.length > 0 ? 'error' : 'success'
      );
      setEditingPaper(null);
    } else {
      const newPaper: ExamSchedulePaper = {
        id: 'paper-' + Date.now(),
        ...paperForm,
        examName: parentExam?.name || 'Academic Assessment',
        section: 'A',
        status: 'Scheduled',
        readinessCheckStatus: readiness,
        conflictNote: conflicts.join(' | ') || undefined,
      };

      setPapers([...papers, newPaper]);
      addToast(
        conflicts.length > 0 ? 'Schedule Conflict Flagged' : 'Paper Scheduled',
        conflicts.length > 0
          ? `Conflict detected: ${conflicts[0]}`
          : `${newPaper.subject} scheduled for ${newPaper.class} on ${newPaper.examDate}.`,
        conflicts.length > 0 ? 'error' : 'success'
      );
    }

    setIsSchedulePaperModalOpen(false);
  };

  const handleDeletePaper = (id: string) => {
    setPapers(papers.filter((p) => p.id !== id));
    setSelectedPaperForDelete(null);
    addToast('Paper Removed', 'Examination paper schedule deleted.', 'info');
  };

  const toggleExamPublication = (examId: string) => {
    setExams(
      exams.map((ex) => {
        if (ex.id === examId) {
          const nextPublished = !ex.isPublishedToParents;
          addToast(
            nextPublished ? 'Results Published' : 'Results Un-published',
            nextPublished
              ? `Official grades for "${ex.name}" are now visible to parents & students.`
              : `Results for "${ex.name}" have been recalled and hidden from parent portal.`,
            nextPublished ? 'success' : 'info'
          );
          return {
            ...ex,
            isPublishedToParents: nextPublished,
            status: nextPublished ? 'Published' : 'Under Moderation',
            publishedDate: nextPublished ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return ex;
      })
    );
  };

  const downloadTimetableCSV = () => {
    const headers = ['Exam Title', 'Class', 'Subject', 'Subject Code', 'Date', 'Start Time', 'End Time', 'Hall', 'Invigilator', 'Max Marks', 'Status'];
    const rows = papers.map((p) => [
      `"${p.examName}"`,
      `"${p.class}"`,
      `"${p.subject}"`,
      `"${p.subjectCode}"`,
      `"${p.examDate}"`,
      `"${p.startTime}"`,
      `"${p.endTime}"`,
      `"${p.hallOrRoom}"`,
      `"${p.invigilatorName}"`,
      p.maxMarks,
      `"${p.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greenfield_exam_timetable_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export Complete', 'Exam timetable downloaded as CSV.', 'success');
  };

  /* -------------------------------------------------------------
     MODULE 1: EXAM COMMAND OVERVIEW
  ------------------------------------------------------------- */
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Academic Assessment & Examination Command
            </span>
            <span className="text-xs text-slate-400 font-mono">Academic Session: 2026–2027</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Exam Command Center — Dr. Helen Vance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Master timetable scheduling, automated room & invigilator conflict auditing, teacher marks moderation, and official report card publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingPaper(null);
              setIsSchedulePaperModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Exam Paper
          </button>
          <button
            onClick={() => setIsAddExamModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4" />
            Create Examination
          </button>
          <button
            onClick={() => setActiveNav('readiness')}
            className="flex items-center gap-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Conflict Audit ({activeConflictsCount})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Master Exams"
          value={exams.filter((x) => x.status !== 'Archived').length}
          subtitle={`${exams.filter((x) => x.status === 'In Progress').length} in active session`}
          icon={<Award className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="Scheduled Papers"
          value={papers.length}
          subtitle="Timetable examination slots"
          icon={<Clock className="w-5 h-5 text-cyan-600" />}
        />
        <MetricCard
          title="Timetable Conflicts"
          value={activeConflictsCount}
          subtitle={activeConflictsCount === 0 ? 'Zero conflicts detected' : 'Requires immediate schedule adjustment'}
          icon={<AlertTriangle className={`w-5 h-5 ${activeConflictsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />}
        />
        <MetricCard
          title="Marks Evaluation Rate"
          value={`${marksStats.pct}%`}
          subtitle={`${state.marks.length} marks entries on record`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Conflict Alert Banner if active */}
      {activeConflictsCount > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-rose-900 text-sm">
                Attention Required: {activeConflictsCount} Timetable Conflicts Detected
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Overlapping room allocations or double-booked invigilators found in current timetable schedule.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('readiness')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-xs"
          >
            Review Audit Desk
          </button>
        </div>
      )}

      {/* Active Examination Sessions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-base">Active Master Examination</h3>
              <StatusBadge status={exams[0]?.status || 'In Progress'} />
            </div>
            <h4 className="text-lg font-bold text-indigo-900 mb-1">{exams[0]?.name}</h4>
            <p className="text-xs text-slate-500 mb-3">{exams[0]?.description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Window</span>
                <span className="font-mono font-semibold text-slate-800">{exams[0]?.startDate} to {exams[0]?.endDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Parent Visibility</span>
                <span className={`font-semibold ${exams[0]?.isPublishedToParents ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {exams[0]?.isPublishedToParents ? 'Published to Parents' : 'Internal Moderation Only'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">{exams[0]?.applicableClasses.join(', ')}</span>
            <button
              onClick={() => setActiveNav('exam_setup')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1"
            >
              Configure Master <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-base">Evaluation & Results Publication Desk</h3>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Secure
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Results are strictly quarantined until formal moderation by Exam Controller. Unpublished grades are never revealed to the parent mobile app.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Marks Entry Progress:</span>
                <span className="font-mono font-bold text-slate-900">{marksStats.pct}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${marksStats.pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Evaluation by 5 Teachers</span>
                <span>Term 1 Mid-Term</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveNav('marks_moderation')}
              className="text-xs text-slate-700 hover:text-slate-900 font-semibold"
            >
              Open Moderation
            </button>
            <button
              onClick={() => setActiveNav('results_publication')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1"
            >
              Publication Desk <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Scheduled Papers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upcoming Timetable Papers</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live schedule of examination papers, hall allocations, and invigilator duties.
            </p>
          </div>
          <button
            onClick={() => setActiveNav('schedules')}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
          >
            View Full Timetable <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Subject & Code</th>
                <th className="px-4 py-3.5">Class Cohort</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Time Window</th>
                <th className="px-4 py-3.5">Examination Hall</th>
                <th className="px-4 py-3.5">Invigilator</th>
                <th className="px-4 py-3.5">Audit Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {papers.slice(0, 5).map((paper) => (
                <tr key={paper.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-900 block">{paper.subject}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{paper.subjectCode}</span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-indigo-700">{paper.class}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">{paper.examDate}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{paper.startTime} - {paper.endTime}</td>
                  <td className="px-4 py-3.5 text-slate-800">{paper.hallOrRoom}</td>
                  <td className="px-4 py-3.5 text-slate-700 font-medium">{paper.invigilatorName}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        paper.readinessCheckStatus === 'Ready'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : paper.readinessCheckStatus === 'Conflict'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {paper.readinessCheckStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingPaper(paper);
                        setPaperForm({
                          examId: paper.examId,
                          class: paper.class,
                          subject: paper.subject,
                          subjectCode: paper.subjectCode,
                          examDate: paper.examDate,
                          startTime: paper.startTime,
                          endTime: paper.endTime,
                          durationMinutes: paper.durationMinutes,
                          hallOrRoom: paper.hallOrRoom,
                          invigilatorName: paper.invigilatorName,
                          maxMarks: paper.maxMarks,
                          passMarks: paper.passMarks,
                        });
                        setIsSchedulePaperModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Paper Schedule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
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
     MODULE 2: EXAMINATION MASTER SETUP
  ------------------------------------------------------------- */
  const renderExamSetup = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Master Examination Setup & Architecture</h2>
          <p className="text-xs text-slate-500 mt-1">
            Define institutional assessments, evaluation windows, applicable cohorts, and publication permissions.
          </p>
        </div>
        <button
          onClick={() => setIsAddExamModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Examination
        </button>
      </div>

      <div className="space-y-4">
        {exams.map((ex) => (
          <div key={ex.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{ex.name}</h3>
                <span className="font-mono text-[11px] text-slate-400">({ex.code})</span>
                <StatusBadge status={ex.status} />
                {ex.isPublishedToParents ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Visible to Parents
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[11px] font-semibold border border-amber-200">
                    Parent Visibility Hidden
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 max-w-2xl">{ex.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span><strong>Term:</strong> {ex.term}</span>
                <span><strong>Assessment Type:</strong> {ex.type}</span>
                <span className="font-mono"><strong>Window:</strong> {ex.startDate} – {ex.endDate}</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Applicable Classes:</span>
                {ex.applicableClasses.map((cls) => (
                  <span key={cls} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium font-mono">
                    {cls}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
              <button
                onClick={() => toggleExamPublication(ex.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors ${
                  ex.isPublishedToParents
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                {ex.isPublishedToParents ? 'Quarantine Results' : 'Publish Results to Parents'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 3: EXAM TYPES & SESSIONS
  ------------------------------------------------------------- */
  const renderSessions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Assessment Types & Institutional Grading Scales</h2>
          <p className="text-xs text-slate-500 mt-1">
            Grade Point Average (GPA) boundaries, passing thresholds, component weightages, and evaluation rubrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grading Scale Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Greenfield 4.0 Standard Grading Rubric</h3>
            <p className="text-xs text-slate-500">Official marks conversion scale used on student report cards and official transcripts.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Letter Grade</th>
                  <th className="px-4 py-3.5">Score Range (%)</th>
                  <th className="px-4 py-3.5">GPA Value</th>
                  <th className="px-4 py-3.5">Mastery Classification</th>
                  <th className="px-5 py-3.5">Transcript Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {GRADING_SCALE.map((g) => (
                  <tr key={g.grade} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 font-bold text-indigo-900 font-mono text-sm">{g.grade}</td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">
                      {g.minPercentage}% – {g.maxPercentage}%
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{g.gpa.toFixed(1)}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{g.description}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">{g.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assessment Weightage Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Term Component Weightage</h3>
            <p className="text-xs text-slate-500 mb-4">Official weighting algorithm for semester grade point calculation.</p>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200">
                <div className="flex justify-between font-bold text-indigo-950 mb-1">
                  <span>Theory Final Examination</span>
                  <span className="font-mono">70%</span>
                </div>
                <p className="text-[11px] text-indigo-800">Formal proctored exam paper covering all semester syllabi.</p>
              </div>

              <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200">
                <div className="flex justify-between font-bold text-cyan-950 mb-1">
                  <span>Practical & Laboratory Skills</span>
                  <span className="font-mono">20%</span>
                </div>
                <p className="text-[11px] text-cyan-800">Experiment reports, coding lab assignments, and oral viva.</p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                <div className="flex justify-between font-bold text-amber-950 mb-1">
                  <span>Continuous Homework & Attendance</span>
                  <span className="font-mono">10%</span>
                </div>
                <p className="text-[11px] text-amber-800">Punctual homework submissions and minimum 85% attendance.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Passing threshold: 40% aggregate required in theory and practical combined.
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 4: ACADEMIC EXAM CALENDAR
  ------------------------------------------------------------- */
  const renderExamCalendar = () => {
    // Group papers by date
    const dateMap: Record<string, ExamSchedulePaper[]> = {};
    papers.forEach((p) => {
      if (!dateMap[p.examDate]) dateMap[p.examDate] = [];
      dateMap[p.examDate].push(p);
    });

    const sortedDates = Object.keys(dateMap).sort();

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Academic Examination Master Calendar</h2>
            <p className="text-xs text-slate-500 mt-1">
              Date-wise timeline of scheduled test papers, morning and afternoon proctoring slots.
            </p>
          </div>
          <button
            onClick={downloadTimetableCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Calendar CSV
          </button>
        </div>

        <div className="space-y-5">
          {sortedDates.map((dateStr) => {
            const dayPapers = dateMap[dateStr];
            return (
              <div key={dateStr} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm font-mono">{dateStr}</h3>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {dayPapers.length} {dayPapers.length === 1 ? 'Exam Paper' : 'Exam Papers'} Scheduled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        paper.readinessCheckStatus === 'Conflict'
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900 text-sm">{paper.subject}</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono font-bold text-xs">
                            {paper.class}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-mono mb-1">{paper.startTime} – {paper.endTime} ({paper.durationMinutes} mins)</p>
                        <p className="text-xs text-slate-700 font-medium flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {paper.hallOrRoom}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Invigilator: {paper.invigilatorName}</p>
                      </div>

                      {paper.conflictNote && (
                        <div className="mt-3 pt-2 border-t border-rose-200 text-[11px] text-rose-700 font-medium">
                          ⚠️ {paper.conflictNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     MODULE 5: TIMETABLE SCHEDULES (WITH CONFLICT DETECTOR)
  ------------------------------------------------------------- */
  const renderSchedules = () => {
    const filtered = papers.filter((p) => {
      const q = paperSearch.toLowerCase();
      const matchSearch =
        p.subject.toLowerCase().includes(q) ||
        p.invigilatorName.toLowerCase().includes(q) ||
        p.hallOrRoom.toLowerCase().includes(q);
      const matchClass = paperClassFilter === 'All' || p.class === paperClassFilter;
      const matchExam = paperExamFilter === 'All' || p.examId === paperExamFilter;
      const matchStatus = paperStatusFilter === 'All' || p.readinessCheckStatus === paperStatusFilter;
      return matchSearch && matchClass && matchExam && matchStatus;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Examination Timetable Master Desk</h2>
            <p className="text-xs text-slate-500 mt-1">
              Active timetable ledger with automated real-time room, class, and proctor overlap conflict detection.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadTimetableCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Timetable
            </button>
            <button
              onClick={() => {
                setEditingPaper(null);
                setPaperForm({
                  examId: 'exam-t1-mid',
                  class: 'Grade 10A',
                  subject: 'Biology & Life Sciences',
                  subjectCode: 'BIO-203',
                  examDate: '2026-10-30',
                  startTime: '09:00 AM',
                  endTime: '11:30 AM',
                  durationMinutes: 150,
                  hallOrRoom: 'Central Examination Hall A',
                  invigilatorName: 'Emily Watson',
                  maxMarks: 100,
                  passMarks: 40,
                });
                setIsSchedulePaperModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Schedule Paper
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject, invigilator, or room..."
                value={paperSearch}
                onChange={(e) => setPaperSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={paperClassFilter}
                onChange={(e) => setPaperClassFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="All">All Cohorts</option>
                <option value="Grade 10A">Grade 10A</option>
                <option value="Grade 10B">Grade 10B</option>
                <option value="Grade 9A">Grade 9A</option>
                <option value="Grade 8A">Grade 8A</option>
                <option value="Grade 7B">Grade 7B</option>
              </select>

              <select
                value={paperStatusFilter}
                onChange={(e) => setPaperStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="All">All Audit Statuses</option>
                <option value="Ready">Ready (No Conflict)</option>
                <option value="Conflict">Conflict Alert</option>
                <option value="Needs Attention">Needs Attention</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Subject & Code</th>
                  <th className="px-4 py-3.5">Cohort</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Time & Duration</th>
                  <th className="px-4 py-3.5">Allocated Hall</th>
                  <th className="px-4 py-3.5">Invigilator</th>
                  <th className="px-4 py-3.5">Marks (Max / Pass)</th>
                  <th className="px-4 py-3.5">Audit Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((paper) => (
                  <tr key={paper.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 block">{paper.subject}</span>
                      <span className="font-mono text-slate-400 text-[10px]">{paper.subjectCode}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-indigo-700">{paper.class}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">{paper.examDate}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {paper.startTime} - {paper.endTime}
                      <span className="block text-[10px] text-slate-400 font-sans">{paper.durationMinutes} mins</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium">{paper.hallOrRoom}</td>
                    <td className="px-4 py-3.5 text-slate-700">{paper.invigilatorName}</td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-bold text-slate-900">{paper.maxMarks}</span>
                      <span className="text-slate-400"> / {paper.passMarks}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          paper.readinessCheckStatus === 'Ready'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : paper.readinessCheckStatus === 'Conflict'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {paper.readinessCheckStatus}
                      </span>
                      {paper.conflictNote && (
                        <span className="block text-[10px] text-rose-600 max-w-xs truncate" title={paper.conflictNote}>
                          {paper.conflictNote}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPaper(paper);
                            setPaperForm({
                              examId: paper.examId,
                              class: paper.class,
                              subject: paper.subject,
                              subjectCode: paper.subjectCode,
                              examDate: paper.examDate,
                              startTime: paper.startTime,
                              endTime: paper.endTime,
                              durationMinutes: paper.durationMinutes,
                              hallOrRoom: paper.hallOrRoom,
                              invigilatorName: paper.invigilatorName,
                              maxMarks: paper.maxMarks,
                              passMarks: paper.passMarks,
                            });
                            setIsSchedulePaperModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md"
                          title="Edit Schedule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedPaperForDelete(paper)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                          title="Remove Paper"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
     MODULE 6: CLASS & SUBJECT MAPPING MATRIX
  ------------------------------------------------------------- */
  const renderClassSubjectMapping = () => {
    const classList = ['Grade 10A', 'Grade 10B', 'Grade 9A', 'Grade 8A', 'Grade 7B'];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Class & Curriculum Subject Assessment Matrix</h2>
            <p className="text-xs text-slate-500 mt-1">
              Verify scheduled exam papers against institutional curricula for every active student cohort.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {classList.map((cls) => {
            const classPapers = papers.filter((p) => p.class === cls);
            const classSubjects = state.subjects.filter((s) => s.status === 'Active');

            return (
              <div key={cls} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{cls}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-mono">
                      {classPapers.length} Papers Scheduled
                    </span>
                  </div>
                  <span className="text-xs text-indigo-700 font-semibold">
                    {Math.round((classPapers.length / (classSubjects.length || 1)) * 100)}% Curriculum Covered
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  {classSubjects.slice(0, 8).map((sub) => {
                    const scheduledPaper = classPapers.find((p) => p.subject.toLowerCase().includes(sub.name.toLowerCase()) || sub.name.toLowerCase().includes(p.subject.toLowerCase()));
                    return (
                      <div
                        key={sub.id}
                        className={`p-3 rounded-xl border flex flex-col justify-between ${
                          scheduledPaper
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 truncate" title={sub.name}>
                              {sub.name}
                            </span>
                            {scheduledPaper && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">{sub.code}</span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                          {scheduledPaper ? (
                            <span className="text-[10px] font-mono text-emerald-800 font-semibold">
                              {scheduledPaper.examDate}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPaper(null);
                                setPaperForm({
                                  examId: 'exam-t1-mid',
                                  class: cls,
                                  subject: sub.name,
                                  subjectCode: sub.code,
                                  examDate: '2026-11-04',
                                  startTime: '09:00 AM',
                                  endTime: '11:30 AM',
                                  durationMinutes: 150,
                                  hallOrRoom: 'Central Examination Hall A',
                                  invigilatorName: 'Laura Bennett',
                                  maxMarks: 100,
                                  passMarks: 40,
                                });
                                setIsSchedulePaperModalOpen(true);
                              }}
                              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900"
                            >
                              + Schedule Paper
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     MODULE 7: ROOM & HALL ALLOCATION
  ------------------------------------------------------------- */
  const renderSeating = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Examination Hall & Seating Capacity Allocation</h2>
          <p className="text-xs text-slate-500 mt-1">
            Proctored physical venues, desk spacing guidelines (1.5m examination spacing), CCTV coverage, and hall tickets.
          </p>
        </div>
        <button
          onClick={() => setIsHallTicketModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Printer className="w-4 h-4" />
          Preview Student Hall Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {EXAMINATION_HALLS.map((hall) => {
          const bookedPapers = papers.filter((p) => p.hallOrRoom.toLowerCase() === hall.name.toLowerCase());
          return (
            <div key={hall.id} className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{hall.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                      hall.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {hall.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {hall.location}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seating Capacity:</span>
                    <span className="font-mono font-bold text-slate-900">{hall.capacity} Desks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Papers:</span>
                    <span className="font-mono font-bold text-indigo-700">{bookedPapers.length} Papers</span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-600">
                    <strong>Amenities:</strong> {hall.facilities}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">1.5m Desks Spacing</span>
                <button
                  onClick={() => {
                    setSelectedHallForView(hall);
                    addToast('Hall Inspection', `Inspecting seating layout for ${hall.name}.`, 'info');
                  }}
                  className="text-xs text-indigo-700 hover:text-indigo-900 font-bold"
                >
                  View Desk Layout
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 8: READINESS & CONFLICT AUDIT
  ------------------------------------------------------------- */
  const renderReadiness = () => {
    // Generate audit findings
    const issues: ExamReadinessIssue[] = [];

    // Check for timetable conflicts
    papers.forEach((p, idx) => {
      const others = papers.filter((o, oIdx) => oIdx !== idx && o.examDate === p.examDate);
      others.forEach((o) => {
        if (o.class === p.class && p.id < o.id) {
          issues.push({
            id: `issue-cls-${p.id}-${o.id}`,
            examId: p.examId,
            type: 'Schedule Conflict',
            severity: 'High',
            description: `Class Overlap: ${p.class} has multiple exams scheduled simultaneously (${p.subject} & ${o.subject}) on ${p.examDate}.`,
            affectedClass: p.class,
            affectedSubject: `${p.subject} vs ${o.subject}`,
            resolutionPath: 'Reschedule one paper to an alternate date or afternoon slot.',
          });
        }
        if (o.hallOrRoom === p.hallOrRoom && p.id < o.id) {
          issues.push({
            id: `issue-rm-${p.id}-${o.id}`,
            examId: p.examId,
            type: 'Missing Room',
            severity: 'High',
            description: `Venue Collision: "${p.hallOrRoom}" allocated to both ${p.class} (${p.subject}) and ${o.class} (${o.subject}) on ${p.examDate}.`,
            affectedClass: `${p.class} & ${o.class}`,
            affectedSubject: p.subject,
            resolutionPath: 'Allocate second cohort to Auditorium West or Central Exam Hall A.',
          });
        }
        if (o.invigilatorName === p.invigilatorName && p.invigilatorName !== 'Unassigned' && p.id < o.id) {
          issues.push({
            id: `issue-inv-${p.id}-${o.id}`,
            examId: p.examId,
            type: 'Missing Invigilator',
            severity: 'High',
            description: `Faculty Overlap: ${p.invigilatorName} proctoring two different sessions at once on ${p.examDate}.`,
            affectedClass: `${p.class} / ${o.class}`,
            affectedSubject: p.subject,
            resolutionPath: 'Reassign one exam duty to Dr. Thorne or Mr. Miller.',
          });
        }
      });

      if (p.invigilatorName === 'Unassigned') {
        issues.push({
          id: `issue-unassigned-${p.id}`,
          examId: p.examId,
          type: 'Missing Invigilator',
          severity: 'Medium',
          description: `Unassigned Proctor: ${p.class} ${p.subject} on ${p.examDate} has no invigilator designated.`,
          affectedClass: p.class,
          affectedSubject: p.subject,
          resolutionPath: 'Assign available teacher from faculty roster.',
        });
      }
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Automated Examination Readiness & Conflict Audit</h2>
            <p className="text-xs text-slate-500 mt-1">
              Continuous scan of master timetable, physical hall capacity, proctor workloads, and teacher marks completion.
            </p>
          </div>
          <button
            onClick={() => addToast('Audit Scan Completed', `Scanned ${papers.length} papers. Found ${issues.length} audit items.`, 'info')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            Re-Run Audit Scan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-1">High Severity Conflicts</span>
            <span className="text-2xl font-bold text-rose-950 font-mono">
              {issues.filter((i) => i.severity === 'High').length}
            </span>
            <p className="text-xs text-rose-700 mt-1">Direct room or faculty double-bookings</p>
          </div>
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Attention Required</span>
            <span className="text-2xl font-bold text-amber-950 font-mono">
              {issues.filter((i) => i.severity === 'Medium').length}
            </span>
            <p className="text-xs text-amber-700 mt-1">Missing proctors or room assignments</p>
          </div>
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Approved & Ready Papers</span>
            <span className="text-2xl font-bold text-emerald-950 font-mono">
              {papers.filter((p) => p.readinessCheckStatus === 'Ready').length}
            </span>
            <p className="text-xs text-emerald-700 mt-1">Fully validated timetable slots</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Audit Findings & Resolution Actions</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {issues.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                🎉 No timetable conflicts or readiness issues found. All exam papers validated!
              </div>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          issue.severity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {issue.severity} Severity
                      </span>
                      <span className="font-bold text-slate-900">{issue.type}</span>
                    </div>
                    <p className="text-slate-700 font-medium">{issue.description}</p>
                    <p className="text-slate-500 text-[11px]">
                      <strong>Recommended Resolution:</strong> {issue.resolutionPath}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveNav('schedules');
                      addToast('Resolve Conflict', `Opening Timetable Schedules to adjust paper timing.`, 'info');
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold shrink-0"
                  >
                    Resolve in Timetable
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     MODULE 9: MARKS ENTRY STATUS
  ------------------------------------------------------------- */
  const renderMarksStatus = () => {
    // Generate marks entry overview per class and subject
    const subjectList = ['Mathematics', 'Physics', 'Chemistry', 'English Literature & Composition', 'World History & Social Studies', 'Computer Science & Coding'];
    const classList = ['Grade 10A', 'Grade 10B', 'Grade 9A', 'Grade 8A'];

    const rows: any[] = [];
    classList.forEach((cls) => {
      subjectList.forEach((sub) => {
        const classStudents = state.students.filter((s) => s.class === cls);
        const marksCount = state.marks.filter((m) => m.class === cls && m.subject.toLowerCase().includes(sub.toLowerCase())).length;
        const total = classStudents.length || 30;
        const entered = Math.min(total, marksCount || Math.floor(total * 0.9));
        const pct = Math.round((entered / total) * 100);

        rows.push({
          id: `${cls}-${sub}`,
          class: cls,
          subject: sub,
          teacher: sub === 'Mathematics' ? 'Marcus Sterling' : sub.includes('Physics') ? 'Laura Bennett' : sub.includes('English') ? 'David Kim' : 'Faculty Member',
          totalStudents: total,
          enteredCount: entered,
          pct,
          status: pct === 100 ? 'Completed' : pct > 0 ? 'Partially Entered' : 'Pending',
        });
      });
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Teacher Marks Entry Monitoring Desk</h2>
            <p className="text-xs text-slate-500 mt-1">
              Read-only oversight of teacher marks entry progress. Remind faculty with single-click alerts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
              {rows.filter((r) => r.pct === 100).length} of {rows.length} Sections Submitted
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Cohort</th>
                  <th className="px-4 py-3.5">Subject</th>
                  <th className="px-4 py-3.5">Assigned Teacher</th>
                  <th className="px-4 py-3.5">Submissions</th>
                  <th className="px-4 py-3.5">Completion Rate</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Proctor Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 10).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 font-bold text-indigo-800">{row.class}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{row.subject}</td>
                    <td className="px-4 py-3.5 text-slate-700">{row.teacher}</td>
                    <td className="px-4 py-3.5 font-mono">
                      {row.enteredCount} / {row.totalStudents}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.pct === 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-600 font-bold">{row.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                          row.pct === 100
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {row.pct < 100 && (
                        <button
                          onClick={() => addToast('Reminder Dispatched', `Notification sent to ${row.teacher} to finalize ${row.subject} marks.`, 'info')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs border border-slate-200"
                        >
                          Send Reminder
                        </button>
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
     MODULE 10: MARKS MODERATION DESK
  ------------------------------------------------------------- */
  const renderMarksModeration = () => {
    const moderationItems = [
      { id: 'mod-1', class: 'Grade 10A', subject: 'Mathematics', teacher: 'Marcus Sterling', avg: 84.5, highest: 98, lowest: 54, passRate: 97, status: 'Approved' },
      { id: 'mod-2', class: 'Grade 10A', subject: 'Physics', teacher: 'Laura Bennett', avg: 78.2, highest: 95, lowest: 46, passRate: 94, status: 'Pending Moderation' },
      { id: 'mod-3', class: 'Grade 8A', subject: 'English Literature', teacher: 'David Kim', avg: 82.0, highest: 96, lowest: 60, passRate: 100, status: 'Approved' },
      { id: 'mod-4', class: 'Grade 10B', subject: 'Physics', teacher: 'Laura Bennett', avg: 71.4, highest: 91, lowest: 39, passRate: 88, status: 'Needs Review' },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Results Moderation & Standardization Desk</h2>
            <p className="text-xs text-slate-500 mt-1">
              Statistical grade distribution review, class averages, outlier score investigation, and controller approval sign-off.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {moderationItems.map((item) => (
            <div key={item.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 text-sm">{item.class} · {item.subject}</h3>
                  <span className="text-xs text-slate-400 font-medium">(Teacher: {item.teacher})</span>
                  <StatusBadge status={item.status as any} />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 mt-2">
                  <span>Average: <strong className="text-slate-900">{item.avg}%</strong></span>
                  <span>Highest: <strong className="text-emerald-700">{item.highest}</strong></span>
                  <span>Lowest: <strong className="text-rose-700">{item.lowest}</strong></span>
                  <span>Pass Rate: <strong className="text-indigo-800">{item.passRate}%</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    addToast('Grace Marks Applied', `Applied +2 moderation grace marks to borderline passing students in ${item.subject}.`, 'info');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200"
                >
                  Apply Grace Marks (+2)
                </button>
                <button
                  onClick={() => addToast('Moderation Approved', `Official sign-off granted for ${item.class} ${item.subject}.`, 'success')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Approve Evaluation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     MODULE 11: RESULTS PUBLICATION DESK (CRITICAL SAFEGUARD)
  ------------------------------------------------------------- */
  const renderResultsPublication = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Official Results Publication Desk</h2>
          <p className="text-xs text-slate-500 mt-1">
            Gated release of semester transcripts. Grades are concealed from the Parent Mobile App until formally published here.
          </p>
        </div>
      </div>

      <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <h4 className="font-bold">Family Access & Quarantine Governance:</h4>
          <p>
            When an examination is set to <strong>&quot;Quarantined / Internal Moderation&quot;</strong>, all student grades remain strictly hidden on the Parent Mobile App. Only upon pressing <strong>&quot;Publish Official Results&quot;</strong> do marks become immediately available on parent dashboards and student cards.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {exams.map((ex) => (
          <div key={ex.id} className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900 text-base">{ex.name}</h3>
                <span className="font-mono text-xs text-slate-400 font-semibold">{ex.code}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{ex.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
                <span>Evaluation Window: {ex.startDate} – {ex.endDate}</span>
                <span>•</span>
                <span className={ex.isPublishedToParents ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                  {ex.isPublishedToParents ? 'Status: Active on Parent App' : 'Status: Quarantined Internally'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleExamPublication(ex.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-colors ${
                  ex.isPublishedToParents
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <Send className="w-4 h-4" />
                {ex.isPublishedToParents ? 'Quarantine & Hide From Parents' : 'Publish Official Results'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 12: STUDENT TRANSCRIPTS & REPORT CARDS
  ------------------------------------------------------------- */
  const renderReportCards = () => {
    const classStudents = state.students.filter((s) => s.class === reportCardClassFilter);
    const activeStudent = selectedStudentForReportCard || classStudents[0];
    const studentMarks = state.marks.filter((m) => m.studentId === activeStudent?.id || m.studentName === activeStudent?.name);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Official Student Transcripts & Report Cards</h2>
            <p className="text-xs text-slate-500 mt-1">
              Generate certified institutional report cards with letter grades, GPA calculation, and controller seals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={reportCardClassFilter}
              onChange={(e) => {
                setReportCardClassFilter(e.target.value);
                const first = state.students.find((s) => s.class === e.target.value);
                if (first) setSelectedStudentForReportCard(first);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
            >
              <option value="Grade 10A">Grade 10A</option>
              <option value="Grade 10B">Grade 10B</option>
              <option value="Grade 9A">Grade 9A</option>
              <option value="Grade 8A">Grade 8A</option>
              <option value="Grade 7B">Grade 7B</option>
              <option value="Grade 5B">Grade 5B</option>
            </select>
            <button
              onClick={() => {
                addToast('Print Triggered', 'Printing official student transcript...', 'info');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print Report Card
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student Selector List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Students in {reportCardClassFilter}</h3>
            <div className="space-y-1">
              {classStudents.map((std) => (
                <button
                  key={std.id}
                  onClick={() => setSelectedStudentForReportCard(std)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    activeStudent?.id === std.id
                      ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{std.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{std.admissionId}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Printable Report Card Card */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
            {/* School Header */}
            <div className="text-center pb-6 border-b border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-700">Official Academic Record</span>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">GREENFIELD INTERNATIONAL SCHOOL</h1>
              <p className="text-xs text-slate-500">Accredited by Cambridge International Examinations · Session 2026–2027</p>
            </div>

            {/* Student Dossier Header */}
            {activeStudent && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                  <span className="font-bold text-slate-900">{activeStudent.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission ID</span>
                  <span className="font-mono font-bold text-indigo-800">{activeStudent.admissionId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Cohort Class</span>
                  <span className="font-semibold text-slate-900">{activeStudent.class} (Roll #{activeStudent.rollNo})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Attendance Rate</span>
                  <span className="font-mono font-bold text-emerald-700">{activeStudent.attendanceRate}%</span>
                </div>
              </div>
            )}

            {/* Marks Ledger */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-y border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Maximum Marks</th>
                    <th className="py-2.5 px-4">Marks Obtained</th>
                    <th className="py-2.5 px-4">Percentage</th>
                    <th className="py-2.5 px-4">Letter Grade</th>
                    <th className="py-2.5 px-4 text-right">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentMarks.length > 0 ? (
                    studentMarks.map((m) => {
                      const pct = Math.round((m.marks / m.maxMarks) * 100);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">{m.subject}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{m.maxMarks}</td>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-900">{m.marks}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700">{pct}%</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">{m.grade}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {m.grade === 'A+' ? '4.0' : m.grade === 'A' ? '3.7' : m.grade === 'B' ? '3.0' : '2.0'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">Mathematics</td>
                        <td className="py-3 px-4 font-mono">100</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-900">88</td>
                        <td className="py-3 px-4 font-mono">88%</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">A</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">3.7</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">Physics</td>
                        <td className="py-3 px-4 font-mono">100</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-900">92</td>
                        <td className="py-3 px-4 font-mono">92%</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">A+</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">4.0</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">English Literature</td>
                        <td className="py-3 px-4 font-mono">100</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-900">84</td>
                        <td className="py-3 px-4 font-mono">84%</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">A</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">3.7</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* GPA Summary & Signatures */}
            <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                <span className="text-[11px] text-indigo-800 font-bold block mb-0.5">Cumulative GPA Score:</span>
                <span className="text-xl font-bold font-mono text-indigo-950">3.80 / 4.00</span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">Status: First Division with Distinction</span>
              </div>

              <div className="flex items-center gap-8 text-center text-slate-500 text-[11px]">
                <div>
                  <div className="w-32 border-b border-slate-300 pb-1 mb-1 font-serif text-slate-800 italic">Dr. Helen Vance</div>
                  <span>Examination Controller</span>
                </div>
                <div>
                  <div className="w-32 border-b border-slate-300 pb-1 mb-1 font-serif text-slate-800 italic">Dr. Robert Hayes</div>
                  <span>Principal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
     MODULE 13: EXAMINATION REPORTS & ANALYTICS
  ------------------------------------------------------------- */
  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Examination Statistical Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Comparative cohort pass rates, GPA distributions, honor rolls, and Cambridge assessment benchmarks.
          </p>
        </div>
        <button
          onClick={downloadTimetableCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          Export Performance CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Cohort Pass Percentages</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Grade 10A (Senior):</span>
              <span className="font-mono font-bold text-emerald-700">98.2%</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Grade 10B (Senior):</span>
              <span className="font-mono font-bold text-emerald-700">92.4%</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Grade 9A (High School):</span>
              <span className="font-mono font-bold text-emerald-700">94.1%</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Grade 8A (Middle School):</span>
              <span className="font-mono font-bold text-emerald-700">96.5%</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-600">Grade 7B (Middle School):</span>
              <span className="font-mono font-bold text-indigo-700">89.8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Top Subject Averages</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Mathematics (Higher):</span>
              <span className="font-mono font-bold text-slate-900">84.5%</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Computer Science:</span>
              <span className="font-mono font-bold text-slate-900">88.2%</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">English Literature:</span>
              <span className="font-mono font-bold text-slate-900">82.0%</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Physics:</span>
              <span className="font-mono font-bold text-slate-900">78.2%</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-600">World History:</span>
              <span className="font-mono font-bold text-slate-900">80.1%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Academic Honor Roll (GPA &gt; 3.8)</h3>
          <div className="space-y-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Rohan Mehta</span>
                <span className="text-[10px] text-slate-500">Grade 10A · Top Ranker</span>
              </div>
              <span className="font-mono font-bold text-indigo-700">4.0 GPA</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Aarav Sharma</span>
                <span className="text-[10px] text-slate-500">Grade 8A · STEM Honors</span>
              </div>
              <span className="font-mono font-bold text-indigo-700">3.9 GPA</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Priya Patel</span>
                <span className="text-[10px] text-slate-500">Grade 10A · Science Award</span>
              </div>
              <span className="font-mono font-bold text-indigo-700">3.85 GPA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     MODULE 14: COORDINATOR PROFILE
  ------------------------------------------------------------- */
  const renderProfile = () => (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            HV
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">Dr. Helen Vance</h2>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-semibold text-xs border border-indigo-200">
                Examination Controller & Assessment Director
              </span>
            </div>
            <p className="text-xs text-slate-500">Ph.D. in Educational Measurement · Cambridge International Assessment Officer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 text-xs">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-indigo-800">
              Controller Office Parameters
            </h4>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Executive Office:</span>
                <span className="font-bold text-slate-900">Examination Bureau Room 210 (Secure Wing)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Extension:</span>
                <span className="font-mono font-bold text-indigo-700">Ext. 210</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Direct Line:</span>
                <span className="font-mono text-slate-700">+1 (555) 019-1210</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Office Hours:</span>
                <span className="font-bold text-slate-900">08:00 AM – 04:30 PM</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-indigo-800">
              Confidentiality & Secrecy Clearances
            </h4>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Board Question Paper Vault:</span>
                <span className="font-bold text-emerald-700">Dual Biometric Custody</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official Seal Authority:</span>
                <span className="font-bold text-indigo-800">Institutional Seal Custodian</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Conflict of Interest Registry:</span>
                <span className="font-bold text-emerald-700">Annual Audit Signed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parent Publication Gatekeeper:</span>
                <span className="font-bold text-indigo-800">Authorized Release Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Route matching state.activeNav */}
      {state.activeNav === 'dashboard' && renderDashboard()}
      {state.activeNav === 'exam_setup' && renderExamSetup()}
      {state.activeNav === 'sessions' && renderSessions()}
      {state.activeNav === 'exam_calendar' && renderExamCalendar()}
      {state.activeNav === 'schedules' && renderSchedules()}
      {state.activeNav === 'class_subject_mapping' && renderClassSubjectMapping()}
      {state.activeNav === 'seating' && renderSeating()}
      {state.activeNav === 'readiness' && renderReadiness()}
      {state.activeNav === 'marks_status' && renderMarksStatus()}
      {state.activeNav === 'marks_moderation' && renderMarksModeration()}
      {state.activeNav === 'results_publication' && renderResultsPublication()}
      {state.activeNav === 'report_cards' && renderReportCards()}
      {state.activeNav === 'reports' && renderReports()}
      {state.activeNav === 'profile' && renderProfile()}

      {/* Fallback */}
      {![
        'dashboard',
        'exam_setup',
        'sessions',
        'exam_calendar',
        'schedules',
        'class_subject_mapping',
        'seating',
        'readiness',
        'marks_status',
        'marks_moderation',
        'results_publication',
        'report_cards',
        'reports',
        'profile',
      ].includes(state.activeNav) && renderDashboard()}

      {/* MODAL: Create Master Examination */}
      <Modal
        isOpen={isAddExamModalOpen}
        onClose={() => setIsAddExamModalOpen(false)}
        title="Create Master Examination Definition"
        subtitle="Establish institutional examination session, term, and evaluation windows."
      >
        <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Examination Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Term 2 Mid-Semester Assessments"
              value={examForm.name}
              onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Academic Term</label>
              <select
                value={examForm.term}
                onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Annual">Annual Assessment</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assessment Type</label>
              <select
                value={examForm.type}
                onChange={(e) => setExamForm({ ...examForm, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Mid-Term Assessment">Mid-Term Assessment</option>
                <option value="Final Examination">Final Examination</option>
                <option value="Unit Test">Unit Test</option>
                <option value="Practical / Lab Assessment">Practical / Lab Assessment</option>
                <option value="Mock Board Exam">Mock Board Exam</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
              <input
                type="date"
                value={examForm.startDate}
                onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">End Date</label>
              <input
                type="date"
                value={examForm.endDate}
                onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description / Guidelines</label>
            <textarea
              rows={2}
              placeholder="Syllabus scope, passing criteria, and proctoring rules..."
              value={examForm.description}
              onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddExamModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              Create Master Exam
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Schedule Exam Paper (With Real-time Conflict Validation) */}
      <Modal
        isOpen={isSchedulePaperModalOpen}
        onClose={() => {
          setIsSchedulePaperModalOpen(false);
          setEditingPaper(null);
        }}
        title={editingPaper ? 'Edit Examination Paper Schedule' : 'Schedule Examination Paper'}
        subtitle="Assign date, proctored time slot, venue hall, and invigilator proctor."
      >
        <form onSubmit={handleSchedulePaper} className="space-y-4 text-xs">
          {/* Real-time conflict preview */}
          {(() => {
            const liveConflicts = detectConflicts(paperForm, editingPaper?.id);
            if (liveConflicts.length > 0) {
              return (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Real-Time Timetable Conflict Detected:</span>
                  </div>
                  {liveConflicts.map((c, i) => (
                    <p key={i} className="text-[11px] text-rose-700 pl-5">
                      • {c}
                    </p>
                  ))}
                </div>
              );
            }
            return (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-[11px] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero schedule conflicts: Hall, Cohort & Invigilator are clear for this time slot.</span>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Examination</label>
              <select
                value={paperForm.examId}
                onChange={(e) => setPaperForm({ ...paperForm, examId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Class Cohort</label>
              <select
                value={paperForm.class}
                onChange={(e) => setPaperForm({ ...paperForm, class: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Grade 10A">Grade 10A</option>
                <option value="Grade 10B">Grade 10B</option>
                <option value="Grade 9A">Grade 9A</option>
                <option value="Grade 8A">Grade 8A</option>
                <option value="Grade 7B">Grade 7B</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subject</label>
              <select
                value={paperForm.subject}
                onChange={(e) => {
                  const subObj = state.subjects.find((s) => s.name === e.target.value);
                  setPaperForm({
                    ...paperForm,
                    subject: e.target.value,
                    subjectCode: subObj?.code || 'SUB-101',
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {state.subjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subject Code</label>
              <input
                type="text"
                readOnly
                value={paperForm.subjectCode}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={paperForm.examDate}
                onChange={(e) => setPaperForm({ ...paperForm, examDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Time</label>
              <input
                type="text"
                value={paperForm.startTime}
                onChange={(e) => setPaperForm({ ...paperForm, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">End Time</label>
              <input
                type="text"
                value={paperForm.endTime}
                onChange={(e) => setPaperForm({ ...paperForm, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Examination Venue / Hall</label>
              <select
                value={paperForm.hallOrRoom}
                onChange={(e) => setPaperForm({ ...paperForm, hallOrRoom: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {EXAMINATION_HALLS.map((h) => (
                  <option key={h.id} value={h.name}>
                    {h.name} (Cap: {h.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Invigilator</label>
              <select
                value={paperForm.invigilatorName}
                onChange={(e) => setPaperForm({ ...paperForm, invigilatorName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Marcus Sterling">Marcus Sterling (Mathematics)</option>
                <option value="Laura Bennett">Laura Bennett (Physics)</option>
                <option value="David Kim">David Kim (Literature)</option>
                <option value="Emily Watson">Emily Watson (Chemistry)</option>
                <option value="Rachel Green">Rachel Green (Computer Science)</option>
                <option value="John Miller">John Miller (Social Studies)</option>
                <option value="Unassigned">Unassigned (Designate Later)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Maximum Marks</label>
              <input
                type="number"
                value={paperForm.maxMarks}
                onChange={(e) => setPaperForm({ ...paperForm, maxMarks: parseInt(e.target.value, 10) || 100 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Passing Mark Threshold</label>
              <input
                type="number"
                value={paperForm.passMarks}
                onChange={(e) => setPaperForm({ ...paperForm, passMarks: parseInt(e.target.value, 10) || 40 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSchedulePaperModalOpen(false);
                setEditingPaper(null);
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              {editingPaper ? 'Update Paper Schedule' : 'Schedule Examination Paper'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Paper Confirmation */}
      {selectedPaperForDelete && (
        <Modal
          isOpen={!!selectedPaperForDelete}
          onClose={() => setSelectedPaperForDelete(null)}
          title="Remove Scheduled Exam Paper"
          subtitle="Are you sure you want to remove this paper from the master timetable?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700">
              This will remove <strong>{selectedPaperForDelete.subject}</strong> for <strong>{selectedPaperForDelete.class}</strong> scheduled on {selectedPaperForDelete.examDate} ({selectedPaperForDelete.hallOrRoom}).
            </p>
            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPaperForDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePaper(selectedPaperForDelete.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
              >
                Delete Paper
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Preview Student Hall Ticket */}
      <Modal
        isOpen={isHallTicketModalOpen}
        onClose={() => setIsHallTicketModalOpen(false)}
        title="Official Examination Hall Ticket (Preview)"
        subtitle="Admission voucher issued to student for proctored examination hall entry."
      >
        <div className="p-6 bg-indigo-50/40 border border-indigo-200 rounded-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-200">
            <div>
              <span className="font-bold text-base text-indigo-950 block">Rohan Mehta (Grade 10A)</span>
              <span className="text-[11px] text-indigo-700 font-mono">Admission ID: GIS-2021-0188 · Roll #01</span>
            </div>
            <Award className="w-8 h-8 text-indigo-600" />
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Scheduled Examination Papers:</h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>Oct 26 — Mathematics (MATH-101)</span>
                <span className="font-bold text-indigo-800">Central Exam Hall A (Desk #12)</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>Oct 28 — Physics (PHY-201)</span>
                <span className="font-bold text-indigo-800">Science Wing Room 204 (Desk #04)</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>Nov 02 — Computer Science (CS-105)</span>
                <span className="font-bold text-indigo-800">Computer Lab 1 (Terminal #08)</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-3 border-t border-indigo-200">
            <strong>Hall Entry Rules:</strong> Candidate must report 15 minutes prior to commencement with this hall ticket and school photo ID. Electronic devices prohibited.
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button
            onClick={() => {
              addToast('Printed', 'Hall ticket sent to proctor printer.', 'info');
              setIsHallTicketModalOpen(false);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print Hall Ticket
          </button>
        </div>
      </Modal>
    </div>
  );
};
