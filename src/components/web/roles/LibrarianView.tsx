import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { MetricCard } from '../../common/MetricCard';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';
import { Book, LibraryCopy, LibraryReservation, LibraryLostDamagedRecord, LibraryTransaction } from '../../../types';
import {
  Library,
  BookOpen,
  Clock,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertTriangle,
  FileText,
  Printer,
  Download,
  Calendar,
  Layers,
  Send,
  ArrowRight,
  Eye,
  Bookmark,
  RotateCcw,
  UserCheck,
  User,
  Shield,
  HelpCircle,
  XCircle,
  Tag,
  Check,
} from 'lucide-react';

// Local storage key for librarian local state extensions
const LIB_COPIES_KEY = 'schlar_library_copies_v1';
const LIB_RESERVATIONS_KEY = 'schlar_library_reservations_v1';
const LIB_LOST_DAMAGED_KEY = 'schlar_library_lost_damaged_v1';
const LIB_SETTINGS_KEY = 'schlar_library_settings_v1';

export const LibrarianView: React.FC = () => {
  const {
    state,
    issueBook,
    returnBook,
    addBook,
    updateBook,
    deleteBook,
    addToast,
    setActiveNav,
  } = useApp();

  // Circulation Settings State
  const [policies, setPolicies] = useState({
    loanDurationDays: 14,
    studentLimit: 3,
    staffLimit: 5,
    dailyOverdueFine: 0.5,
    lostBookAdminFee: 15.0,
    allowRenewals: true,
    maxRenewals: 2,
  });

  // Physical copies state
  const [physicalCopies, setPhysicalCopies] = useState<LibraryCopy[]>(() => {
    try {
      const stored = localStorage.getItem(LIB_COPIES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    // Seed initial physical copies based on books
    const initialCopies: LibraryCopy[] = [];
    state.books.forEach((b) => {
      for (let i = 1; i <= b.totalCopies; i++) {
        const isIssued = i > b.availableCopies;
        initialCopies.push({
          id: `cpy-${b.id}-${i}`,
          copyCode: `GIS-LIB-${b.category.substring(0, 3).toUpperCase()}-${String(b.id).replace(/\D/g, '').padStart(3, '0')}-C${i}`,
          barcode: `978013${Math.floor(100000 + Math.random() * 900000)}`,
          bookId: b.id,
          bookTitle: b.title,
          shelfLocation: b.shelfLocation || 'Stack-A1',
          status: isIssued ? 'Issued' : 'Available',
          condition: i === b.totalCopies && i > 3 ? 'Fair' : 'Good',
          acquiredDate: '2024-08-15',
          borrowerName: isIssued ? 'Enrolled Student' : undefined,
        });
      }
    });
    return initialCopies;
  });

  // Reservations state
  const [reservations, setReservations] = useState<LibraryReservation[]>(() => {
    try {
      const stored = localStorage.getItem(LIB_RESERVATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'res-1',
        bookId: 'bk-4',
        bookTitle: 'A Brief History of Time',
        memberId: 'std-ananya',
        memberName: 'Ananya Sharma',
        memberType: 'Student',
        classOrDept: 'Grade 5B',
        reservedDate: '2026-10-18',
        queuePosition: 1,
        status: 'Ready',
        notes: 'Hold for pickup at front circulation counter',
      },
      {
        id: 'res-2',
        bookId: 'bk-2',
        bookTitle: 'Algorithms, 4th Edition',
        memberId: 'std-kevin',
        memberName: 'Kevin Vance',
        memberType: 'Student',
        classOrDept: 'Grade 10B',
        reservedDate: '2026-10-20',
        queuePosition: 1,
        status: 'Queued',
        notes: 'Advanced placement coursework requirement',
      },
      {
        id: 'res-3',
        bookId: 'bk-1',
        bookTitle: 'The C Programming Language',
        memberId: 'tch-green',
        memberName: 'Rachel Green',
        memberType: 'Staff',
        classOrDept: 'Computer Science Dept',
        reservedDate: '2026-10-21',
        queuePosition: 2,
        status: 'Queued',
      },
    ];
  });

  // Lost & Damaged state
  const [lostDamagedRecords, setLostDamagedRecords] = useState<LibraryLostDamagedRecord[]>(() => {
    try {
      const stored = localStorage.getItem(LIB_LOST_DAMAGED_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'ld-1',
        copyCode: 'GIS-LIB-SCI-004-C4',
        bookId: 'bk-4',
        bookTitle: 'A Brief History of Time',
        reportedBy: 'Arthur Pendelton',
        reportedDate: '2026-09-28',
        type: 'Damaged',
        incidentDescription: 'Water damage across chapters 4 and 5 from outdoor rain study session.',
        status: 'Investigating',
        replacementCost: 18.5,
      },
      {
        id: 'ld-2',
        copyCode: 'GIS-LIB-HIS-007-C9',
        bookId: 'bk-7',
        bookTitle: 'Sapiens: A Brief History of Humankind',
        reportedBy: 'Arthur Pendelton',
        reportedDate: '2026-09-15',
        type: 'Lost',
        incidentDescription: 'Reported misplaced during middle-school library exchange day.',
        status: 'Written Off',
        replacementCost: 24.0,
      },
    ];
  });

  // Persist local library collections
  useEffect(() => {
    localStorage.setItem(LIB_COPIES_KEY, JSON.stringify(physicalCopies));
  }, [physicalCopies]);

  useEffect(() => {
    localStorage.setItem(LIB_RESERVATIONS_KEY, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(LIB_LOST_DAMAGED_KEY, JSON.stringify(lostDamagedRecords));
  }, [lostDamagedRecords]);

  // Load policy settings from storage if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LIB_SETTINGS_KEY);
      if (stored) setPolicies(JSON.parse(stored));
    } catch {
      // fallback
    }

    const handleReset = () => {
      localStorage.removeItem(LIB_COPIES_KEY);
      localStorage.removeItem(LIB_RESERVATIONS_KEY);
      localStorage.removeItem(LIB_LOST_DAMAGED_KEY);
      localStorage.removeItem(LIB_SETTINGS_KEY);
      setPolicies({
        loanDurationDays: 14,
        studentLimit: 3,
        staffLimit: 5,
        dailyOverdueFine: 0.5,
        lostBookAdminFee: 15.0,
        allowRenewals: true,
        maxRenewals: 2,
      });
    };
    window.addEventListener('schlar_demo_reset', handleReset);
    return () => window.removeEventListener('schlar_demo_reset', handleReset);
  }, []);

  // Search & Filter state for Catalogue
  const [bookSearch, setBookSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'Available' | 'Out'>('All');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'copies'>('title');

  // Modals & Details
  const [selectedBookForView, setSelectedBookForView] = useState<Book | null>(null);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<Book | null>(null);
  const [deleteConfirmBook, setDeleteConfirmBook] = useState<Book | null>(null);

  // Issue Book Flow
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedMemberType, setSelectedMemberType] = useState<'Student' | 'Staff'>('Student');
  const [selectedBorrowerId, setSelectedBorrowerId] = useState('');
  const [selectedBookForIssue, setSelectedBookForIssue] = useState('');
  const [issueDueDate, setIssueDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [issueNotes, setIssueNotes] = useState('');

  // Return Book Flow
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedTxnForReturn, setSelectedTxnForReturn] = useState<LibraryTransaction | null>(null);
  const [returnCondition, setReturnCondition] = useState<'Good' | 'Fair' | 'Damaged'>('Good');
  const [returnNotes, setReturnNotes] = useState('');

  // Reservation Modal Flow
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reserveBookId, setReserveBookId] = useState('');
  const [reserveMemberId, setReserveMemberId] = useState('');
  const [reserveNotes, setReserveNotes] = useState('');

  // Lost & Damaged Modal Flow
  const [isReportLossModalOpen, setIsReportLossModalOpen] = useState(false);
  const [incidentCopyCode, setIncidentCopyCode] = useState('');
  const [incidentType, setIncidentType] = useState<'Lost' | 'Damaged'>('Damaged');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentCost, setIncidentCost] = useState(20);

  // Member Dossier Modal
  const [selectedMemberForDossier, setSelectedMemberForDossier] = useState<{
    id: string;
    name: string;
    type: 'Student' | 'Staff';
    classOrDept: string;
    idCode: string;
  } | null>(null);

  // Add Book Form state
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science' as Book['category'],
    totalCopies: 5,
    shelfLocation: 'CS-Shelf-01',
    publisher: 'Academic Press International',
    publicationYear: 2024,
    edition: '2nd Revised Edition',
    language: 'English',
    description: 'Core instructional library text with student exercise guides and references.',
  });

  // Calculate high-level metrics dynamically
  const totalBooks = state.books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableCopies = state.books.reduce((sum, b) => sum + b.availableCopies, 0);
  const issuedCopies = totalBooks - availableCopies;
  const overdueTransactions = state.libraryTransactions.filter((t) => t.status === 'Overdue');
  const activeTransactions = state.libraryTransactions.filter(
    (t) => t.status === 'Issued' || t.status === 'Overdue'
  );
  const totalFines = state.libraryTransactions.reduce((sum, t) => sum + (t.fineAmount || 0), 0);
  const pendingReservationsCount = reservations.filter((r) => r.status === 'Queued' || r.status === 'Ready').length;
  const lostDamagedCount = lostDamagedRecords.length;

  // Filter books catalogue
  const filteredBooks = state.books
    .filter((b) => {
      const q = bookSearch.toLowerCase();
      const matchSearch =
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.includes(q) ||
        b.shelfLocation.toLowerCase().includes(q);
      const matchCategory = categoryFilter === 'All' || b.category === categoryFilter;
      const matchAvailability =
        availabilityFilter === 'All'
          ? true
          : availabilityFilter === 'Available'
          ? b.availableCopies > 0
          : b.availableCopies === 0;
      return matchSearch && matchCategory && matchAvailability;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'copies') return b.totalCopies - a.totalCopies;
      return 0;
    });

  // Helper to find borrower active loan count
  const getBorrowerLoanCount = (id: string) => {
    return state.libraryTransactions.filter(
      (t) => t.studentId === id && (t.status === 'Issued' || t.status === 'Overdue')
    ).length;
  };

  // Helper to check borrower overdue count
  const getBorrowerOverdueCount = (id: string) => {
    return state.libraryTransactions.filter(
      (t) => t.studentId === id && t.status === 'Overdue'
    ).length;
  };

  // ISSUE BOOK SUBMISSION
  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowerId || !selectedBookForIssue) {
      addToast('Validation', 'Please select both borrower and catalog title.', 'error');
      return;
    }

    const book = state.books.find((b) => b.id === selectedBookForIssue);
    if (!book || book.availableCopies <= 0) {
      addToast('Inventory Limit', 'No physical copies available on shelf.', 'error');
      return;
    }

    // Quota check
    const currentLoans = getBorrowerLoanCount(selectedBorrowerId);
    const limit = selectedMemberType === 'Student' ? policies.studentLimit : policies.staffLimit;
    if (currentLoans >= limit) {
      addToast(
        'Quota Exceeded',
        `Borrower already has ${currentLoans} active loans (Limit: ${limit}).`,
        'error'
      );
      return;
    }

    // Call context issueBook
    const success = issueBook(selectedBorrowerId, selectedBookForIssue, issueDueDate);
    if (success) {
      // Mark a copy as issued in physical copies
      const borrowerName =
        selectedMemberType === 'Student'
          ? state.students.find((s) => s.id === selectedBorrowerId)?.name
          : state.teachers.find((t) => t.id === selectedBorrowerId)?.name || 'Faculty Member';

      setPhysicalCopies((prev) => {
        let updated = false;
        return prev.map((cpy) => {
          if (!updated && cpy.bookId === book.id && cpy.status === 'Available') {
            updated = true;
            return {
              ...cpy,
              status: 'Issued',
              borrowerName,
              borrowerId: selectedBorrowerId,
              dueDate: issueDueDate,
            };
          }
          return cpy;
        });
      });

      setIsIssueModalOpen(false);
      setSelectedBorrowerId('');
      setSelectedBookForIssue('');
      setIssueNotes('');
    }
  };

  // RETURN BOOK SUBMISSION
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxnForReturn) return;

    // Check overdue fine
    const today = new Date().toISOString().split('T')[0];
    const isLate = new Date(today) > new Date(selectedTxnForReturn.dueDate);
    const daysLate = isLate
      ? Math.ceil(
          (new Date(today).getTime() - new Date(selectedTxnForReturn.dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
    const computedFine = daysLate > 0 ? Math.round(daysLate * policies.dailyOverdueFine * 100) / 100 : 0;

    returnBook(selectedTxnForReturn.id);

    // Update physical copy status
    setPhysicalCopies((prev) => {
      let restored = false;
      return prev.map((cpy) => {
        if (!restored && cpy.bookId === selectedTxnForReturn.bookId && cpy.status === 'Issued') {
          restored = true;
          return {
            ...cpy,
            status: returnCondition === 'Damaged' ? 'Damaged' : 'Available',
            condition: returnCondition,
            borrowerName: undefined,
            borrowerId: undefined,
            dueDate: undefined,
          };
        }
        return cpy;
      });
    });

    if (returnCondition === 'Damaged') {
      // Automatically record in damaged register
      const newDamagedRecord: LibraryLostDamagedRecord = {
        id: 'ld-' + Date.now(),
        copyCode: `GIS-LIB-${selectedTxnForReturn.bookTitle.substring(0, 3).toUpperCase()}-DMG`,
        bookId: selectedTxnForReturn.bookId,
        bookTitle: selectedTxnForReturn.bookTitle,
        reportedBy: 'Arthur Pendelton',
        reportedDate: today,
        type: 'Damaged',
        incidentDescription: `Volume returned damaged by ${selectedTxnForReturn.studentName}. Notes: ${returnNotes || 'Inspection needed'}`,
        status: 'Investigating',
        replacementCost: 15.0,
      };
      setLostDamagedRecords((prev) => [newDamagedRecord, ...prev]);
    }

    addToast(
      'Book Returned',
      `"${selectedTxnForReturn.bookTitle}" checked back in.${
        computedFine > 0 ? ` Calculated overdue fine: $${computedFine.toFixed(2)} (${daysLate} days late)` : ''
      }`,
      'success'
    );

    setIsReturnModalOpen(false);
    setSelectedTxnForReturn(null);
    setReturnNotes('');
  };

  // ADD BOOK SUBMISSION
  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      addToast('Validation', 'Title and Author are required fields.', 'error');
      return;
    }

    // Prevent duplicate ISBN
    const cleanIsbn = bookForm.isbn.trim();
    if (cleanIsbn && state.books.some((b) => b.isbn === cleanIsbn)) {
      addToast('Duplicate ISBN', `A book with ISBN ${cleanIsbn} already exists in the catalogue.`, 'error');
      return;
    }

    const total = Math.max(1, Number(bookForm.totalCopies) || 1);
    const newIsbn = cleanIsbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const newBookId = 'bk-' + Date.now();

    addBook({
      isbn: newIsbn,
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      category: bookForm.category,
      totalCopies: total,
      availableCopies: total,
      shelfLocation: bookForm.shelfLocation.trim() || 'General-Stack-01',
      publisher: bookForm.publisher,
      publicationYear: Number(bookForm.publicationYear) || 2024,
      edition: bookForm.edition,
      language: bookForm.language,
      description: bookForm.description,
    });

    // Generate physical copies
    const newCopies: LibraryCopy[] = [];
    for (let i = 1; i <= total; i++) {
      newCopies.push({
        id: `cpy-${newBookId}-${i}`,
        copyCode: `GIS-LIB-${bookForm.category.substring(0, 3).toUpperCase()}-${String(state.books.length + 1).padStart(3, '0')}-C${i}`,
        barcode: `978013${Math.floor(100000 + Math.random() * 900000)}`,
        bookId: newBookId,
        bookTitle: bookForm.title.trim(),
        shelfLocation: bookForm.shelfLocation.trim() || 'General-Stack-01',
        status: 'Available',
        condition: 'Good',
        acquiredDate: new Date().toISOString().split('T')[0],
      });
    }
    setPhysicalCopies((prev) => [...prev, ...newCopies]);

    setIsAddBookModalOpen(false);
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      category: 'Computer Science',
      totalCopies: 5,
      shelfLocation: 'CS-Shelf-01',
      publisher: 'Academic Press International',
      publicationYear: 2024,
      edition: '2nd Revised Edition',
      language: 'English',
      description: 'Core instructional library text with student exercise guides and references.',
    });
  };

  // EDIT BOOK SUBMISSION
  const handleEditBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForEdit) return;

    // Check duplicate ISBN on other books
    const cleanIsbn = selectedBookForEdit.isbn.trim();
    if (
      cleanIsbn &&
      state.books.some((b) => b.id !== selectedBookForEdit.id && b.isbn === cleanIsbn)
    ) {
      addToast('Duplicate ISBN', `Another book already uses ISBN ${cleanIsbn}.`, 'error');
      return;
    }

    updateBook(selectedBookForEdit);
    setIsEditBookModalOpen(false);
    setSelectedBookForEdit(null);
  };

  // DELETE BOOK CONFIRMATION
  const handleDeleteBookConfirm = () => {
    if (!deleteConfirmBook) return;
    // Check if copies are currently issued
    const isCurrentlyIssued = state.libraryTransactions.some(
      (t) => t.bookId === deleteConfirmBook.id && (t.status === 'Issued' || t.status === 'Overdue')
    );
    if (isCurrentlyIssued) {
      addToast(
        'Deletion Blocked',
        `Cannot delete "${deleteConfirmBook.title}" while copies are in active circulation.`,
        'error'
      );
      setDeleteConfirmBook(null);
      return;
    }

    deleteBook(deleteConfirmBook.id);
    setPhysicalCopies((prev) => prev.filter((c) => c.bookId !== deleteConfirmBook.id));
    setDeleteConfirmBook(null);
  };

  // SEND RECALL NOTICE
  const handleSendRecallNotice = (studentName: string, title: string) => {
    addToast(
      'Recall Notice Transmitted',
      `Official return reminder dispatched to ${studentName} for "${title}".`,
      'success'
    );
  };

  // CREATE RESERVATION
  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveBookId || !reserveMemberId) {
      addToast('Validation', 'Select both member and book to reserve.', 'error');
      return;
    }

    const book = state.books.find((b) => b.id === reserveBookId);
    const student = state.students.find((s) => s.id === reserveMemberId);
    const teacher = state.teachers.find((t) => t.id === reserveMemberId);
    const memberName = student ? student.name : teacher ? teacher.name : 'Library Member';
    const classOrDept = student ? student.class : teacher ? 'Faculty' : 'Member';
    const memberType = student ? 'Student' : 'Staff';

    // Duplicate reservation check
    const alreadyReserved = reservations.some(
      (r) => r.bookId === reserveBookId && r.memberId === reserveMemberId && r.status === 'Queued'
    );
    if (alreadyReserved) {
      addToast('Already Queued', `${memberName} already has an active reservation for this title.`, 'info');
      return;
    }

    const existingQueueCount = reservations.filter(
      (r) => r.bookId === reserveBookId && (r.status === 'Queued' || r.status === 'Ready')
    ).length;

    const newRes: LibraryReservation = {
      id: 'res-' + Date.now(),
      bookId: reserveBookId,
      bookTitle: book?.title || 'Unknown Title',
      memberId: reserveMemberId,
      memberName,
      memberType,
      classOrDept,
      reservedDate: new Date().toISOString().split('T')[0],
      queuePosition: existingQueueCount + 1,
      status: book && book.availableCopies > 0 ? 'Ready' : 'Queued',
      notes: reserveNotes || 'Hold requested via circulation counter',
    };

    setReservations((prev) => [newRes, ...prev]);
    setIsReserveModalOpen(false);
    setReserveBookId('');
    setReserveMemberId('');
    setReserveNotes('');
    addToast('Reservation Logged', `Reserved position #${newRes.queuePosition} for ${memberName}.`, 'success');
  };

  // REPORT LOST / DAMAGED COPY
  const handleReportLossSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentCopyCode) {
      addToast('Validation', 'Please enter or select a physical copy code.', 'error');
      return;
    }

    const copy = physicalCopies.find((c) => c.copyCode.toLowerCase() === incidentCopyCode.toLowerCase());
    const bookTitle = copy ? copy.bookTitle : 'Unknown Library Title';
    const bookId = copy ? copy.bookId : 'bk-1';

    const newRecord: LibraryLostDamagedRecord = {
      id: 'ld-' + Date.now(),
      copyCode: incidentCopyCode,
      bookId,
      bookTitle,
      reportedBy: 'Arthur Pendelton',
      reportedDate: new Date().toISOString().split('T')[0],
      type: incidentType,
      incidentDescription: incidentDesc || `Condition flagged as ${incidentType}`,
      status: 'Investigating',
      replacementCost: Number(incidentCost) || 20,
    };

    setLostDamagedRecords((prev) => [newRecord, ...prev]);

    // Update physical copy status so it CANNOT be issued
    if (copy) {
      setPhysicalCopies((prev) =>
        prev.map((c) =>
          c.id === copy.id ? { ...c, status: incidentType, condition: incidentType === 'Lost' ? 'Poor' : 'Poor' } : c
        )
      );
    }

    setIsReportLossModalOpen(false);
    setIncidentCopyCode('');
    setIncidentDesc('');
    addToast(
      'Incident Recorded',
      `Physical copy ${incidentCopyCode} logged as ${incidentType}. Inventory updated.`,
      'info'
    );
  };

  // RESTORE DAMAGED/LOST COPY
  const handleRestoreCopy = (rec: LibraryLostDamagedRecord) => {
    setLostDamagedRecords((prev) =>
      prev.map((r) => (r.id === rec.id ? { ...r, status: 'Restored' } : r))
    );

    setPhysicalCopies((prev) =>
      prev.map((c) =>
        c.copyCode === rec.copyCode
          ? { ...c, status: 'Available', condition: 'Fair' }
          : c
      )
    );

    addToast('Copy Restored', `Copy ${rec.copyCode} marked as restored to active stack.`, 'success');
  };

  // EXPORT CSV
  const handleExportCSV = () => {
    const headers = [
      'Book ID',
      'ISBN',
      'Title',
      'Author',
      'Category',
      'Shelf Location',
      'Total Copies',
      'Available Copies',
      'Issued Copies',
    ];
    const rows = state.books.map((b) => [
      b.id,
      b.isbn,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      b.category,
      b.shelfLocation,
      b.totalCopies,
      b.availableCopies,
      b.totalCopies - b.availableCopies,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `schlar_library_catalogue_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Report Exported', 'Library catalogue CSV successfully generated.', 'success');
  };

  /* =============================================================
     MODULE 1: DASHBOARD
  ============================================================= */
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/70">
              Circulation & Learning Resources
            </span>
            <span className="text-xs font-medium text-slate-500">Academic Year 2026-2027</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Library Command Center & Media Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Arthur Pendelton (Senior Librarian) · Central Campus Library & Digital Stacks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Issue Volume
          </button>
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Title
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Volumes"
          value={totalBooks}
          subtitle={`${state.books.length} unique catalogue titles`}
          icon={<Library className="w-5 h-5 text-teal-600" />}
          onAction={() => setActiveNav('books')}
        />
        <MetricCard
          title="In Circulation"
          value={issuedCopies}
          subtitle={`${Math.round((issuedCopies / (totalBooks || 1)) * 100)}% active utilization`}
          icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
          onAction={() => setActiveNav('active_loans')}
        />
        <MetricCard
          title="Available on Shelf"
          value={availableCopies}
          subtitle="Ready for student checkout"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          onAction={() => setActiveNav('books')}
        />
        <MetricCard
          title="Overdue Loans"
          value={overdueTransactions.length}
          subtitle={`$${totalFines.toFixed(2)} pending fines`}
          change={{ value: `${overdueTransactions.length} items overdue`, isPositive: false }}
          icon={<Clock className="w-5 h-5 text-rose-600" />}
          onAction={() => setActiveNav('overdue')}
        />
      </div>

      {/* Quick Workflow Action Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Daily Circulation Workflows & Shortcuts
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-teal-800 text-center transition-all hover:shadow-xs group"
          >
            <BookOpen className="w-5 h-5 mb-1.5 text-teal-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Issue Book</span>
            <span className="text-[10px] text-teal-600/80">Check out to student</span>
          </button>
          <button
            onClick={() => setActiveNav('return_books')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white text-slate-800 text-center transition-all hover:shadow-xs group"
          >
            <RotateCcw className="w-5 h-5 mb-1.5 text-slate-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Return Volume</span>
            <span className="text-[10px] text-slate-500">Scan & check in</span>
          </button>
          <button
            onClick={() => setActiveNav('overdue')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-800 text-center transition-all hover:shadow-xs group"
          >
            <AlertTriangle className="w-5 h-5 mb-1.5 text-rose-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Overdue Recall</span>
            <span className="text-[10px] text-rose-600/80">{overdueTransactions.length} pending notices</span>
          </button>
          <button
            onClick={() => setActiveNav('reservations')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white text-slate-800 text-center transition-all hover:shadow-xs group"
          >
            <Bookmark className="w-5 h-5 mb-1.5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Reservations</span>
            <span className="text-[10px] text-slate-500">{pendingReservationsCount} queued holds</span>
          </button>
          <button
            onClick={() => setActiveNav('inventory')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white text-slate-800 text-center transition-all hover:shadow-xs group"
          >
            <Layers className="w-5 h-5 mb-1.5 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Copies & Barcodes</span>
            <span className="text-[10px] text-slate-500">{physicalCopies.length} tracking units</span>
          </button>
          <button
            onClick={() => setActiveNav('reports')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white text-slate-800 text-center transition-all hover:shadow-xs group"
          >
            <FileText className="w-5 h-5 mb-1.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Analytics & Export</span>
            <span className="text-[10px] text-slate-500">Audit sheets & CSV</span>
          </button>
        </div>
      </div>

      {/* Active Borrowers & Circulation Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Current Borrowers & Active Circulation</h3>
              <p className="text-xs text-slate-500">Live loans tracked across enrolled cohorts</p>
            </div>
            <button
              onClick={() => setActiveNav('active_loans')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
            >
              View All Loans
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Borrower</th>
                  <th className="px-3 py-3">Class</th>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-3 py-3">Due Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Quick Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{tx.studentName}</td>
                    <td className="px-3 py-3 text-slate-600">{tx.class}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium max-w-[200px] truncate">
                      {tx.bookTitle}
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-600">{tx.dueDate}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedTxnForReturn(tx);
                          setIsReturnModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-md font-semibold text-[11px] transition-colors"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
                {activeTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      No active loans currently recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overdue Alerts & Recall Notice Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Overdue Loans Priority
              </h3>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {overdueTransactions.length} Pending
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Loans past return window require manual librarian follow-up and recall notice dispatch.
            </p>

            <div className="space-y-2.5">
              {overdueTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 flex items-start justify-between gap-2"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{tx.studentName}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{tx.bookTitle}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span>Due: {tx.dueDate}</span>
                      <span>·</span>
                      <span className="text-rose-700 font-semibold font-mono">Fine: ${tx.fineAmount || 10}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRecallNotice(tx.studentName, tx.bookTitle)}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs"
                    title="Send Recall Notice"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {overdueTransactions.length === 0 && (
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 text-center text-xs text-emerald-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  All borrowed volumes are within permitted due dates.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveNav('overdue')}
              className="w-full text-center text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              Open Overdue Tracker & Fine Ledgers →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 2: BOOK CATALOGUE
  ============================================================= */
  const renderCatalog = () => (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
              Bibliographic Records
            </span>
            <span className="text-xs text-slate-500">{filteredBooks.length} titles displayed</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Book Catalogue & Stack Inventory
          </h2>
          <p className="text-xs text-slate-500">
            Search repository, examine shelf coordinates, and manage accession records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Title
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Catalogue
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN, shelf location..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="All">All Categories</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="Literature">Literature</option>
            <option value="History">History</option>
            <option value="Fiction">Fiction</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available On Shelf</option>
            <option value="Out">Fully Circulated (0 copies)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="title">Book Title (A-Z)</option>
            <option value="author">Author Name</option>
            <option value="copies">Total Copies</option>
          </select>
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Title & Author</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 font-mono">ISBN</th>
                <th className="px-4 py-3.5 font-mono">Shelf Location</th>
                <th className="px-4 py-3.5 text-center">Physical Copies</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.map((book) => {
                const isAvailable = book.availableCopies > 0;
                return (
                  <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-10 rounded bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {book.title.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug hover:text-teal-700 cursor-pointer"
                            onClick={() => setSelectedBookForView(book)}>
                            {book.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{book.isbn}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-700 font-medium">
                      {book.shelfLocation}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {book.availableCopies}
                      </span>
                      <span className="text-slate-400"> / {book.totalCopies}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={isAvailable ? 'Available' : 'Circulated'} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBookForView(book)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                          title="View Book Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBookForEdit(book);
                            setIsEditBookModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors"
                          title="Edit Book Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmBook(book)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                          title="Delete Catalog Title"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    <Library className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No catalogue records matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 3: BOOK CATEGORIES
  ============================================================= */
  const renderCategories = () => {
    const categoriesList = [
      'Computer Science',
      'Mathematics',
      'Science',
      'Literature',
      'History',
      'Fiction',
      'Encyclopedia',
    ];

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
              Dewey & Academic Classification
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Book Categories & Stacks Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Departmental distribution, stack allocations, and collection density.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesList.map((cat) => {
            const catBooks = state.books.filter((b) => b.category === cat);
            const totalVol = catBooks.reduce((sum, b) => sum + b.totalCopies, 0);
            const availVol = catBooks.reduce((sum, b) => sum + b.availableCopies, 0);
            const issuedVol = totalVol - availVol;
            const utilRate = totalVol > 0 ? Math.round((issuedVol / totalVol) * 100) : 0;

            return (
              <div
                key={cat}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-teal-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                    {cat}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {catBooks.length} Titles
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center my-3">
                  <div>
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="text-base font-bold text-slate-900">{totalVol}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Available</span>
                    <span className="text-base font-bold text-emerald-600">{availVol}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">On Loan</span>
                    <span className="text-base font-bold text-indigo-600">{issuedVol}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Circulation Rate</span>
                    <span className="font-semibold text-slate-800">{utilRate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all"
                      style={{ width: `${utilRate}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    Stacks: {cat.substring(0, 3).toUpperCase()}-01 to 04
                  </span>
                  <button
                    onClick={() => {
                      setCategoryFilter(cat);
                      setActiveNav('books');
                    }}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                  >
                    Browse Titles →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* =============================================================
     MODULE 4: AUTHORS & PUBLISHERS
  ============================================================= */
  const renderAuthorsPublishers = () => {
    // Unique authors and publishers
    const authorsMap = new Map<string, { count: number; titles: string[]; category: string }>();
    state.books.forEach((b) => {
      const existing = authorsMap.get(b.author) || { count: 0, titles: [], category: b.category };
      existing.count += b.totalCopies;
      existing.titles.push(b.title);
      authorsMap.set(b.author, existing);
    });

    const publishers = [
      { name: 'Prentice Hall / Pearson Education', location: 'Boston, MA', titles: 4, rep: 'David Clark' },
      { name: 'Oxford University Press', location: 'Oxford, UK', titles: 3, rep: 'Sarah Milligan' },
      { name: 'HarperCollins Publishers', location: 'New York, NY', titles: 2, rep: 'Eileen Thorne' },
      { name: 'Cambridge University Press', location: 'Cambridge, UK', titles: 3, rep: 'Dr. John Croft' },
      { name: 'O\'Reilly Media Publishing', location: 'Sebastopol, CA', titles: 3, rep: 'Tim Peterson' },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
            Publishing Metadata
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Authors Registry & Publisher Network
          </h2>
          <p className="text-xs text-slate-500">
            Creators, imprints, academic presses, and distributor coordinates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authors List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Registered Authors & Contributors</h3>
              <span className="text-xs text-slate-500">{authorsMap.size} creators</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {Array.from(authorsMap.entries()).map(([author, info]) => (
                <div key={author} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-900">{author}</h4>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
                      {info.count} Total Copies
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Titles in collection: {info.titles.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Publishers List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Academic Presses & Publishers</h3>
              <span className="text-xs text-slate-500">{publishers.length} imprints</span>
            </div>
            <div className="divide-y divide-slate-100">
              {publishers.map((pub) => (
                <div key={pub.name} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{pub.name}</h4>
                      <p className="text-[11px] text-slate-500">{pub.location} · Rep: {pub.rep}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      {pub.titles} Catalogue Titles
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* =============================================================
     MODULE 5: INVENTORY & PHYSICAL COPIES
  ============================================================= */
  const renderInventory = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
            Physical Asset Tracking
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Physical Copies & Barcode Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Individual item tracking, accession barcodes, physical conditions, and shelf coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReportLossModalOpen(true)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Report Lost / Damaged
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Physical Copy Repository ({physicalCopies.length} Total)</h3>
          <span className="text-xs text-slate-500">Each physical book possesses a unique accession identifier</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-mono">Accession Code</th>
                <th className="px-4 py-3.5 font-mono">Barcode</th>
                <th className="px-4 py-3.5">Title</th>
                <th className="px-4 py-3.5 font-mono">Shelf Location</th>
                <th className="px-4 py-3.5">Condition</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Current Borrower</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {physicalCopies.map((cpy) => (
                <tr key={cpy.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-900">{cpy.copyCode}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{cpy.barcode}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 max-w-[220px] truncate">{cpy.bookTitle}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{cpy.shelfLocation}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        cpy.condition === 'Good'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : cpy.condition === 'Fair'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {cpy.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={cpy.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">
                    {cpy.borrowerName || <span className="text-slate-400">— On Stack —</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 6: ISSUE BOOKS (CIRCULATION DESK)
  ============================================================= */
  const renderIssueDesk = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
          Circulation Desk
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Check Out Library Volumes
        </h2>
        <p className="text-xs text-slate-500">
          Verify borrower eligibility, select available physical volumes, and register loan records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Issue Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
            {/* Step 1: Member Selection */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Step 1: Select Borrower Account *
              </label>
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="memberType"
                    checked={selectedMemberType === 'Student'}
                    onChange={() => {
                      setSelectedMemberType('Student');
                      setSelectedBorrowerId('');
                    }}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-semibold text-slate-800">Student Borrower</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="memberType"
                    checked={selectedMemberType === 'Staff'}
                    onChange={() => {
                      setSelectedMemberType('Staff');
                      setSelectedBorrowerId('');
                    }}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-semibold text-slate-800">Faculty / Staff Borrower</span>
                </label>
              </div>

              <select
                value={selectedBorrowerId}
                onChange={(e) => setSelectedBorrowerId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
              >
                <option value="">-- Choose {selectedMemberType} Account --</option>
                {selectedMemberType === 'Student'
                  ? state.students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class}) · Admission ID: {s.admissionId}
                      </option>
                    ))
                  : state.teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.roleTitle}) · {t.department || 'Faculty'}
                      </option>
                    ))}
              </select>
            </div>

            {/* Step 2: Book Title Selection */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Step 2: Select Available Catalog Title *
              </label>
              <select
                value={selectedBookForIssue}
                onChange={(e) => setSelectedBookForIssue(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
              >
                <option value="">-- Choose Available Volume from Repository --</option>
                {state.books.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                    {b.title} by {b.author} ({b.availableCopies} of {b.totalCopies} available on shelf)
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Dates and Policy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Issue Date</label>
                <input
                  type="date"
                  disabled
                  value={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Return Due Date *</label>
                <input
                  type="date"
                  required
                  value={issueDueDate}
                  onChange={(e) => setIssueDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Circulation Remarks (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Supplementary science competition preparation reference"
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedBorrowerId('');
                  setSelectedBookForIssue('');
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                Reset Fields
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Authorize & Check Out
              </button>
            </div>
          </form>
        </div>

        {/* Borrower Status Preview Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Borrower Clearance Status
          </h3>

          {selectedBorrowerId ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                <span className="text-[10px] font-semibold text-teal-700 uppercase">Verified Member</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedMemberType === 'Student'
                    ? state.students.find((s) => s.id === selectedBorrowerId)?.name
                    : state.teachers.find((t) => t.id === selectedBorrowerId)?.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedMemberType === 'Student'
                    ? state.students.find((s) => s.id === selectedBorrowerId)?.class
                    : 'Faculty Staff Member'}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Active Borrowed Loans:</span>
                  <span className="font-bold text-slate-900">
                    {getBorrowerLoanCount(selectedBorrowerId)} of{' '}
                    {selectedMemberType === 'Student' ? policies.studentLimit : policies.staffLimit} max
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Overdue Books:</span>
                  <span
                    className={`font-bold ${
                      getBorrowerOverdueCount(selectedBorrowerId) > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {getBorrowerOverdueCount(selectedBorrowerId)} Items
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Loan Eligibility:</span>
                  <span
                    className={`font-bold ${
                      getBorrowerLoanCount(selectedBorrowerId) >=
                      (selectedMemberType === 'Student' ? policies.studentLimit : policies.staffLimit)
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {getBorrowerLoanCount(selectedBorrowerId) >=
                    (selectedMemberType === 'Student' ? policies.studentLimit : policies.staffLimit)
                      ? 'Quota Full'
                      : 'Cleared'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Select a borrower from the form to review account standing and borrowing limits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 7: RETURN BOOKS
  ============================================================= */
  const renderReturnDesk = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
          Circulation Check-In
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Return Volume & Condition Review Desk
        </h2>
        <p className="text-xs text-slate-500">
          Process returns, verify book condition on check-in, calculate late fees, and restore shelf inventory.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Active Circulated Loans Awaiting Check-In ({activeTransactions.length})
          </h3>
          <span className="text-xs text-slate-500">Click &quot;Process Return&quot; to inspect and restore to shelf</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Borrower</th>
                <th className="px-4 py-3.5">Class / Role</th>
                <th className="px-4 py-3.5">Book Title</th>
                <th className="px-4 py-3.5 font-mono">Issued Date</th>
                <th className="px-4 py-3.5 font-mono">Due Date</th>
                <th className="px-4 py-3.5">Loan Status</th>
                <th className="px-5 py-3.5 text-right">Circulation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{tx.studentName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{tx.class}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{tx.bookTitle}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{tx.issueDate}</td>
                  <td className="px-4 py-3.5 font-mono font-medium text-slate-700">{tx.dueDate}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedTxnForReturn(tx);
                        setIsReturnModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                    >
                      Process Return
                    </button>
                  </td>
                </tr>
              ))}
              {activeTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    All library volumes are currently returned to shelf.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 8: ACTIVE LOANS
  ============================================================= */
  const renderActiveLoans = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
          Circulation Register
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Active Circulation Register
        </h2>
        <p className="text-xs text-slate-500">
          All volumes currently held by students and faculty across campus.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Loan ID</th>
                <th className="px-4 py-3.5">Borrower</th>
                <th className="px-4 py-3.5">Class / Dept</th>
                <th className="px-4 py-3.5">Book Title</th>
                <th className="px-4 py-3.5 font-mono">Issue Date</th>
                <th className="px-4 py-3.5 font-mono">Due Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-400">{tx.id}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{tx.studentName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{tx.class}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{tx.bookTitle}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{tx.issueDate}</td>
                  <td className="px-4 py-3.5 font-mono font-medium text-slate-800">{tx.dueDate}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedTxnForReturn(tx);
                        setIsReturnModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded font-semibold text-[11px]"
                    >
                      Return
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

  /* =============================================================
     MODULE 9: OVERDUE BOOKS & RECALL NOTICES
  ============================================================= */
  const renderOverdue = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/70">
            Delinquent Loans
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Overdue Loans & Recall Dispatch
          </h2>
          <p className="text-xs text-slate-500">
            Track unreturned books past contractual return dates and transmit formal recall alerts.
          </p>
        </div>

        <button
          onClick={() => {
            overdueTransactions.forEach((tx) =>
              handleSendRecallNotice(tx.studentName, tx.bookTitle)
            );
            addToast('Batch Dispatch', 'Recalls transmitted to all delinquent borrowers.', 'success');
          }}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
          Transmit All Recall Notices
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Borrower</th>
                <th className="px-4 py-3.5">Class</th>
                <th className="px-4 py-3.5">Book Title</th>
                <th className="px-4 py-3.5 font-mono">Due Date</th>
                <th className="px-4 py-3.5">Days Late</th>
                <th className="px-4 py-3.5 font-mono">Fine Accrued</th>
                <th className="px-5 py-3.5 text-right">Recall Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overdueTransactions.map((tx) => {
                const today = new Date().toISOString().split('T')[0];
                const daysLate = Math.max(
                  1,
                  Math.ceil(
                    (new Date(today).getTime() - new Date(tx.dueDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                );

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{tx.studentName}</td>
                    <td className="px-4 py-3.5 text-slate-600">{tx.class}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{tx.bookTitle}</td>
                    <td className="px-4 py-3.5 font-mono text-rose-700 font-semibold">{tx.dueDate}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[11px]">
                        {daysLate} Days Late
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-900 font-bold">
                      ${tx.fineAmount || (daysLate * policies.dailyOverdueFine).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendRecallNotice(tx.studentName, tx.bookTitle)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold text-[11px] transition-colors"
                        >
                          Send Notice
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTxnForReturn(tx);
                            setIsReturnModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-semibold text-[11px] transition-colors"
                        >
                          Check In
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {overdueTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No overdue books currently pending. All items returned or within due date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 10: RESERVATIONS
  ============================================================= */
  const renderReservations = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
            Hold Queue Management
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Book Reservations & Waitlists
          </h2>
          <p className="text-xs text-slate-500">
            Manage student and faculty reservations for high-demand or currently circulated volumes.
          </p>
        </div>

        <button
          onClick={() => setIsReserveModalOpen(true)}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Queue New Hold
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Queued Title</th>
                <th className="px-4 py-3.5">Member Name</th>
                <th className="px-4 py-3.5">Class / Dept</th>
                <th className="px-4 py-3.5 font-mono">Reserved Date</th>
                <th className="px-4 py-3.5 text-center">Queue Rank</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{res.bookTitle}</td>
                  <td className="px-4 py-3.5 text-slate-800 font-semibold">{res.memberName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{res.classOrDept}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{res.reservedDate}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      #{res.queuePosition}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={res.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {res.status === 'Ready' && (
                        <button
                          onClick={() => {
                            setReservations((prev) =>
                              prev.map((r) => (r.id === res.id ? { ...r, status: 'Fulfilled' } : r))
                            );
                            addToast('Reservation Fulfilled', `Handed over hold to ${res.memberName}.`, 'success');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px]"
                        >
                          Fulfill
                        </button>
                      )}
                      {res.status === 'Queued' && (
                        <button
                          onClick={() => {
                            setReservations((prev) =>
                              prev.map((r) => (r.id === res.id ? { ...r, status: 'Ready' } : r))
                            );
                            addToast('Ready for Pickup', `Flagged hold for ${res.memberName} as Ready.`, 'info');
                          }}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded font-semibold text-[11px]"
                        >
                          Mark Ready
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setReservations((prev) =>
                            prev.map((r) => (r.id === res.id ? { ...r, status: 'Cancelled' } : r))
                          );
                          addToast('Hold Cancelled', `Reservation cancelled for ${res.memberName}.`, 'info');
                        }}
                        className="px-2.5 py-1 hover:bg-rose-50 text-rose-600 rounded text-[11px] font-medium"
                      >
                        Cancel
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

  /* =============================================================
     MODULE 11: LOST OR DAMAGED BOOKS
  ============================================================= */
  const renderLostDamaged = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/70">
            Write-Off & Incident Register
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Lost, Damaged & Decommissioned Copies
          </h2>
          <p className="text-xs text-slate-500">
            Audit register of non-circulating damaged physical copies and replacement fee assessment.
          </p>
        </div>

        <button
          onClick={() => setIsReportLossModalOpen(true)}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Incident
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-mono">Accession Code</th>
                <th className="px-4 py-3.5">Title</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Incident Description</th>
                <th className="px-4 py-3.5 font-mono">Reported Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 font-mono">Replacement</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lostDamagedRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{rec.copyCode}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{rec.bookTitle}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        rec.type === 'Lost'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-[250px] truncate">
                    {rec.incidentDescription}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{rec.reportedDate}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="px-4 py-3.5 font-mono font-semibold text-slate-900">
                    ${rec.replacementCost?.toFixed(2) || '20.00'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {rec.status !== 'Restored' && (
                      <button
                        onClick={() => handleRestoreCopy(rec)}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded font-semibold text-[11px] transition-colors"
                      >
                        Restore to Shelf
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

  /* =============================================================
     MODULE 12: LIBRARY MEMBERS
  ============================================================= */
  const renderMembers = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
          Patron Directory
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Library Members & Borrowing Privileges
        </h2>
        <p className="text-xs text-slate-500">
          Enrolled students and faculty member borrowing records, active volumes, and loan standing.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Member Name</th>
                <th className="px-4 py-3.5">Member Role</th>
                <th className="px-4 py-3.5">Class / Department</th>
                <th className="px-4 py-3.5 font-mono">Admission / Staff ID</th>
                <th className="px-4 py-3.5 text-center">Active Loans</th>
                <th className="px-4 py-3.5 text-center">Standing</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.students.map((std) => {
                const loans = getBorrowerLoanCount(std.id);
                const overdues = getBorrowerOverdueCount(std.id);
                const isOverLimit = loans >= policies.studentLimit;

                return (
                  <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{std.name}</td>
                    <td className="px-4 py-3.5 text-slate-600">Student Patron</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{std.class}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{std.admissionId}</td>
                    <td className="px-4 py-3.5 text-center font-mono font-semibold text-slate-900">
                      {loans} / {policies.studentLimit}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          overdues > 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isOverLimit
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {overdues > 0 ? 'Overdue Books' : isOverLimit ? 'Quota Reached' : 'Good Standing'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() =>
                          setSelectedMemberForDossier({
                            id: std.id,
                            name: std.name,
                            type: 'Student',
                            classOrDept: std.class,
                            idCode: std.admissionId,
                          })
                        }
                        className="px-2.5 py-1 hover:bg-slate-100 text-slate-700 font-semibold rounded text-[11px]"
                      >
                        View Dossier
                      </button>
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

  /* =============================================================
     MODULE 13: CIRCULATION TRANSACTIONS HISTORY
  ============================================================= */
  const renderTransactions = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
            Audit Ledger
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Complete Circulation History & Audit Log
          </h2>
          <p className="text-xs text-slate-500">
            Immutable transaction trail of all checkouts, returns, renewals, and overdue records.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Transaction Journal
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-mono">Txn Ref</th>
                <th className="px-4 py-3.5">Borrower</th>
                <th className="px-4 py-3.5">Class</th>
                <th className="px-4 py-3.5">Book Title</th>
                <th className="px-4 py-3.5 font-mono">Issued</th>
                <th className="px-4 py-3.5 font-mono">Due Date</th>
                <th className="px-4 py-3.5 font-mono">Return Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right font-mono">Fine Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.libraryTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{tx.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{tx.studentName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{tx.class}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{tx.bookTitle}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{tx.issueDate}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{tx.dueDate}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{tx.returnDate || '—'}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-900">
                    ${tx.fineAmount || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 14: LIBRARY REPORTS
  ============================================================= */
  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
            Circulation Analytics
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Library Metrics & Utilization Reports
          </h2>
          <p className="text-xs text-slate-500">
            Summary metrics, collection breakdown, and printable compliance audit sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Full CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center">
          <span className="text-xs text-slate-500 block mb-1">Catalog Density</span>
          <span className="text-2xl font-bold text-slate-900">{totalBooks}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Physical books across all stacks</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center">
          <span className="text-xs text-slate-500 block mb-1">Circulation Rate</span>
          <span className="text-2xl font-bold text-indigo-600">
            {Math.round((issuedCopies / (totalBooks || 1)) * 100)}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">{issuedCopies} active items checked out</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center">
          <span className="text-xs text-slate-500 block mb-1">Overdue Rate</span>
          <span className="text-2xl font-bold text-rose-600">
            {issuedCopies > 0 ? Math.round((overdueTransactions.length / issuedCopies) * 100) : 0}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">{overdueTransactions.length} delinquent items</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center">
          <span className="text-xs text-slate-500 block mb-1">Collection Integrity</span>
          <span className="text-2xl font-bold text-emerald-600">
            {Math.round(((totalBooks - lostDamagedCount) / (totalBooks || 1)) * 100)}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">{lostDamagedCount} written-off/damaged</span>
        </div>
      </div>

      {/* Category Density Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Collection Breakdown by Classification</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
            <tr>
              <th className="px-5 py-3">Classification</th>
              <th className="px-4 py-3 text-center">Unique Titles</th>
              <th className="px-4 py-3 text-center">Total Volumes</th>
              <th className="px-4 py-3 text-center">Available</th>
              <th className="px-4 py-3 text-center">In Circulation</th>
              <th className="px-5 py-3 text-right">Circulation Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {['Computer Science', 'Mathematics', 'Science', 'Literature', 'History', 'Fiction'].map((cat) => {
              const cBooks = state.books.filter((b) => b.category === cat);
              const tVol = cBooks.reduce((sum, b) => sum + b.totalCopies, 0);
              const aVol = cBooks.reduce((sum, b) => sum + b.availableCopies, 0);
              const iVol = tVol - aVol;
              const rate = tVol > 0 ? Math.round((iVol / tVol) * 100) : 0;
              return (
                <tr key={cat} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-bold text-slate-900">{cat}</td>
                  <td className="px-4 py-3 text-center font-mono">{cBooks.length}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">{tVol}</td>
                  <td className="px-4 py-3 text-center font-mono text-emerald-600">{aVol}</td>
                  <td className="px-4 py-3 text-center font-mono text-indigo-600">{iVol}</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">{rate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 15: CIRCULATION POLICIES & SETTINGS
  ============================================================= */
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
          Institutional Governance
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Circulation Policies & Rule Matrix
        </h2>
        <p className="text-xs text-slate-500">
          Configurable loan durations, member borrowing quotas, and overdue recall policies.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-2xl space-y-5 text-xs">
        <div>
          <label className="block text-slate-700 font-bold mb-1">Standard Loan Period (Days)</label>
          <input
            type="number"
            min={1}
            max={60}
            value={policies.loanDurationDays}
            onChange={(e) =>
              setPolicies({ ...policies, loanDurationDays: Number(e.target.value) || 14 })
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Default checkout window calculated from checkout date.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Max Student Active Loans</label>
            <input
              type="number"
              min={1}
              max={10}
              value={policies.studentLimit}
              onChange={(e) =>
                setPolicies({ ...policies, studentLimit: Number(e.target.value) || 3 })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Max Staff Active Loans</label>
            <input
              type="number"
              min={1}
              max={20}
              value={policies.staffLimit}
              onChange={(e) =>
                setPolicies({ ...policies, staffLimit: Number(e.target.value) || 5 })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Daily Overdue Fine ($ / day)</label>
            <input
              type="number"
              step="0.10"
              min={0}
              value={policies.dailyOverdueFine}
              onChange={(e) =>
                setPolicies({ ...policies, dailyOverdueFine: Number(e.target.value) || 0.5 })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Lost Book Administrative Surcharge ($)</label>
            <input
              type="number"
              min={0}
              value={policies.lostBookAdminFee}
              onChange={(e) =>
                setPolicies({ ...policies, lostBookAdminFee: Number(e.target.value) || 15.0 })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              localStorage.setItem(LIB_SETTINGS_KEY, JSON.stringify(policies));
              addToast('Policies Saved', 'Library circulation rules saved to institutional cache.', 'success');
            }}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors"
          >
            Save Circulation Rules
          </button>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 16: LIBRARIAN PROFILE
  ============================================================= */
  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
          AP
        </div>
        <div className="flex-1 text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
            Head Librarian & Media Specialist
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Arthur Pendelton, MLIS</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Master of Library & Information Science (University of Michigan) · 14 Years Academic Service
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs text-slate-600">
            <span>Staff ID: <strong>STF-LIB-001</strong></span>
            <span>·</span>
            <span>Email: <strong>a.pendelton@greenfield.edu</strong></span>
            <span>·</span>
            <span>Office: <strong>Central Library 204</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Media Desk Credentials</h3>
          <p className="text-slate-600 leading-relaxed">
            Authorized administrator for Dewey Decimal Cataloguing, Inter-Library Loan consortia, and Digital Archives.
          </p>
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Circulation Role:</span>
              <span className="font-bold text-slate-800">Master Clearance</span>
            </div>
            <div className="flex justify-between">
              <span>Stack Oversight:</span>
              <span className="font-bold text-slate-800">Main & Junior Stacks</span>
            </div>
            <div className="flex justify-between">
              <span>Inventory Cycle:</span>
              <span className="font-bold text-slate-800">Quarterly Audit</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Library Operating Hours</h3>
          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Monday – Thursday:</span>
              <span className="font-bold text-slate-900">07:45 AM – 05:00 PM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Friday:</span>
              <span className="font-bold text-slate-900">07:45 AM – 04:00 PM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Saturday Study Hall:</span>
              <span className="font-bold text-slate-900">09:00 AM – 01:00 PM</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Barcode Scanners Active</span>
            </div>
            <div className="flex items-center gap-2 text-teal-700 bg-teal-50 p-2.5 rounded-xl border border-teal-200">
              <Check className="w-4 h-4 text-teal-600" />
              <span>Catalog Database Synced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MAIN DISPATCH ROUTER
  ============================================================= */
  return (
    <div>
      {/* Route according to state.activeNav */}
      {state.activeNav === 'dashboard' && renderDashboard()}
      {state.activeNav === 'books' && renderCatalog()}
      {state.activeNav === 'categories' && renderCategories()}
      {state.activeNav === 'authors_publishers' && renderAuthorsPublishers()}
      {state.activeNav === 'inventory' && renderInventory()}
      {(state.activeNav === 'issue_books' || state.activeNav === 'issue_return') && renderIssueDesk()}
      {state.activeNav === 'return_books' && renderReturnDesk()}
      {(state.activeNav === 'active_loans' || state.activeNav === 'issued') && renderActiveLoans()}
      {(state.activeNav === 'overdue' || state.activeNav === 'due_books') && renderOverdue()}
      {state.activeNav === 'reservations' && renderReservations()}
      {state.activeNav === 'lost_damaged' && renderLostDamaged()}
      {state.activeNav === 'members' && renderMembers()}
      {state.activeNav === 'transactions' && renderTransactions()}
      {(state.activeNav === 'reports' || state.activeNav === 'fines') && renderReports()}
      {state.activeNav === 'settings' && renderSettings()}
      {state.activeNav === 'profile' && renderProfile()}

      {/* Fallback to dashboard */}
      {![
        'dashboard',
        'books',
        'categories',
        'authors_publishers',
        'inventory',
        'issue_books',
        'issue_return',
        'return_books',
        'active_loans',
        'issued',
        'overdue',
        'due_books',
        'reservations',
        'lost_damaged',
        'members',
        'transactions',
        'reports',
        'fines',
        'settings',
        'profile',
      ].includes(state.activeNav) && renderDashboard()}

      {/* =========================================================
         MODALS
      ========================================================= */}

      {/* MODAL 1: Issue Book Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Check Out Library Volume"
        subtitle="Authorize loan of repository title to enrolled student or faculty."
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Borrower Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="modalMemberType"
                  checked={selectedMemberType === 'Student'}
                  onChange={() => setSelectedMemberType('Student')}
                />
                <span className="font-medium text-slate-800">Student</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="modalMemberType"
                  checked={selectedMemberType === 'Staff'}
                  onChange={() => setSelectedMemberType('Staff')}
                />
                <span className="font-medium text-slate-800">Staff / Faculty</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Borrower *</label>
            <select
              value={selectedBorrowerId}
              onChange={(e) => setSelectedBorrowerId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="">-- Choose Borrower Account --</option>
              {selectedMemberType === 'Student'
                ? state.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.class}) · ID: {s.admissionId}
                    </option>
                  ))
                : state.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.roleTitle})
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Catalog Title *</label>
            <select
              value={selectedBookForIssue}
              onChange={(e) => setSelectedBookForIssue(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="">-- Choose Available Volume --</option>
              {state.books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                  {b.title} by {b.author} ({b.availableCopies} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Return Due Date *</label>
            <input
              type="date"
              required
              value={issueDueDate}
              onChange={(e) => setIssueDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Confirm Checkout
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Process Return Modal */}
      {selectedTxnForReturn && (
        <Modal
          isOpen={isReturnModalOpen}
          onClose={() => {
            setIsReturnModalOpen(false);
            setSelectedTxnForReturn(null);
          }}
          title="Process Volume Return"
          subtitle={`Check in "${selectedTxnForReturn.bookTitle}" borrowed by ${selectedTxnForReturn.studentName}.`}
        >
          <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Issued On:</span>
                <span className="font-mono text-slate-800">{selectedTxnForReturn.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Due Date:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTxnForReturn.dueDate}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Condition on Return *</label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Good">Good (Normal shelf ready)</option>
                <option value="Fair">Fair (Minor wear, usable)</option>
                <option value="Damaged">Damaged (Requires repair / replacement)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Check-in Remarks</label>
              <input
                type="text"
                placeholder="e.g. Returned on time at main desk"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsReturnModalOpen(false);
                  setSelectedTxnForReturn(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Complete Check-In
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Add New Book Modal */}
      <Modal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        title="Accession New Title to Library"
        subtitle="Register catalogue title and initialize physical tracking copies."
      >
        <form onSubmit={handleAddBookSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Book Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship"
              value={bookForm.title}
              onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Author / Creator *</label>
              <input
                type="text"
                required
                placeholder="e.g. Robert C. Martin"
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ISBN Identifier</label>
              <input
                type="text"
                placeholder="978-0132350884"
                value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Literature">Literature</option>
                <option value="History">History</option>
                <option value="Fiction">Fiction</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Copies *</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={bookForm.totalCopies}
                onChange={(e) => setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Shelf Stack</label>
              <input
                type="text"
                placeholder="CS-Shelf-04"
                value={bookForm.shelfLocation}
                onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Publisher</label>
              <input
                type="text"
                value={bookForm.publisher}
                onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Publication Year</label>
              <input
                type="number"
                value={bookForm.publicationYear}
                onChange={(e) => setBookForm({ ...bookForm, publicationYear: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddBookModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
            >
              Accession Title
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Edit Book Modal */}
      {selectedBookForEdit && (
        <Modal
          isOpen={isEditBookModalOpen}
          onClose={() => {
            setIsEditBookModalOpen(false);
            setSelectedBookForEdit(null);
          }}
          title={`Edit Catalogue Record: ${selectedBookForEdit.title}`}
          subtitle={`ISBN: ${selectedBookForEdit.isbn} · Stack: ${selectedBookForEdit.shelfLocation}`}
        >
          <form onSubmit={handleEditBookSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={selectedBookForEdit.title}
                onChange={(e) =>
                  setSelectedBookForEdit({ ...selectedBookForEdit, title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Author *</label>
                <input
                  type="text"
                  required
                  value={selectedBookForEdit.author}
                  onChange={(e) =>
                    setSelectedBookForEdit({ ...selectedBookForEdit, author: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">ISBN Number</label>
                <input
                  type="text"
                  value={selectedBookForEdit.isbn}
                  onChange={(e) =>
                    setSelectedBookForEdit({ ...selectedBookForEdit, isbn: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Classification</label>
                <select
                  value={selectedBookForEdit.category}
                  onChange={(e) =>
                    setSelectedBookForEdit({
                      ...selectedBookForEdit,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Literature">Literature</option>
                  <option value="History">History</option>
                  <option value="Fiction">Fiction</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shelf Location</label>
                <input
                  type="text"
                  value={selectedBookForEdit.shelfLocation}
                  onChange={(e) =>
                    setSelectedBookForEdit({ ...selectedBookForEdit, shelfLocation: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditBookModalOpen(false);
                  setSelectedBookForEdit(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Update Catalogue Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 5: Delete Book Confirmation */}
      {deleteConfirmBook && (
        <Modal
          isOpen={!!deleteConfirmBook}
          onClose={() => setDeleteConfirmBook(null)}
          title="Delete Catalogue Record?"
          subtitle="Confirm removal of title from school library database."
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deleteConfirmBook.title}</strong> by{' '}
              {deleteConfirmBook.author} (ISBN: {deleteConfirmBook.isbn})? All catalogued physical copies
              associated with this record will be cleared.
            </p>
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmBook(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBookConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 6: Book Details Dossier */}
      {selectedBookForView && (
        <Modal
          isOpen={!!selectedBookForView}
          onClose={() => setSelectedBookForView(null)}
          title={`Catalogue Dossier: ${selectedBookForView.title}`}
          subtitle={`Accession ID: ${selectedBookForView.id} · ISBN: ${selectedBookForView.isbn}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 block">Author:</span>
                <span className="font-bold text-slate-900">{selectedBookForView.author}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Category:</span>
                <span className="font-bold text-teal-700">{selectedBookForView.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Shelf Stack:</span>
                <span className="font-mono font-bold text-slate-800">{selectedBookForView.shelfLocation}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Copies Available:</span>
                <span className="font-bold text-emerald-600">
                  {selectedBookForView.availableCopies} of {selectedBookForView.totalCopies} on shelf
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-1">Physical Stacks Breakdown:</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100/70 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3 py-2 font-mono">Accession Code</th>
                      <th className="px-3 py-2 font-mono">Barcode</th>
                      <th className="px-3 py-2">Condition</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {physicalCopies
                      .filter((c) => c.bookId === selectedBookForView.id)
                      .map((c) => (
                        <tr key={c.id}>
                          <td className="px-3 py-1.5 font-mono font-semibold text-slate-900">{c.copyCode}</td>
                          <td className="px-3 py-1.5 font-mono text-slate-500">{c.barcode}</td>
                          <td className="px-3 py-1.5">{c.condition}</td>
                          <td className="px-3 py-1.5">
                            <StatusBadge status={c.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBookForView(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 7: Reservation Modal */}
      <Modal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        title="Reserve Book / Queue Hold"
        subtitle="Place member in prioritized hold queue for volume checkout."
      >
        <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Member *</label>
            <select
              value={reserveMemberId}
              onChange={(e) => setReserveMemberId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="">-- Choose Member --</option>
              {state.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.class}) · ID: {s.admissionId}
                </option>
              ))}
              {state.teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Faculty) · {t.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Book Title *</label>
            <select
              value={reserveBookId}
              onChange={(e) => setReserveBookId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="">-- Choose Book --</option>
              {state.books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} by {b.author} ({b.availableCopies} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Hold Notes</label>
            <input
              type="text"
              placeholder="e.g. Notify student when returned from circulation"
              value={reserveNotes}
              onChange={(e) => setReserveNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsReserveModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Place Reservation
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 8: Report Lost / Damaged Modal */}
      <Modal
        isOpen={isReportLossModalOpen}
        onClose={() => setIsReportLossModalOpen(false)}
        title="Report Lost or Damaged Physical Copy"
        subtitle="Decommission volume from active circulation and assess replacement."
      >
        <form onSubmit={handleReportLossSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Physical Copy Code *</label>
            <select
              value={incidentCopyCode}
              onChange={(e) => setIncidentCopyCode(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
            >
              <option value="">-- Select Physical Copy --</option>
              {physicalCopies.map((c) => (
                <option key={c.id} value={c.copyCode}>
                  {c.copyCode} · {c.bookTitle} ({c.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Incident Type</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Damaged">Damaged (Requires Repair / Rebinding)</option>
                <option value="Lost">Lost / Missing</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Replacement Fee ($)</label>
              <input
                type="number"
                min={0}
                value={incidentCost}
                onChange={(e) => setIncidentCost(Number(e.target.value) || 20)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Incident Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Describe condition, missing pages, or circumstances of loss..."
              value={incidentDesc}
              onChange={(e) => setIncidentDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsReportLossModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Confirm & Decommission
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 9: Member Dossier */}
      {selectedMemberForDossier && (
        <Modal
          isOpen={!!selectedMemberForDossier}
          onClose={() => setSelectedMemberForDossier(null)}
          title={`Member Dossier: ${selectedMemberForDossier.name}`}
          subtitle={`${selectedMemberForDossier.type} · ${selectedMemberForDossier.classOrDept} · ID: ${selectedMemberForDossier.idCode}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Borrowed Loans:</span>
                <span className="font-bold text-slate-900">
                  {getBorrowerLoanCount(selectedMemberForDossier.id)} of {policies.studentLimit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Overdue Items:</span>
                <span className="font-bold text-rose-600">
                  {getBorrowerOverdueCount(selectedMemberForDossier.id)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Loan History:</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Book Title</th>
                      <th className="px-3 py-2 font-mono">Due Date</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.libraryTransactions
                      .filter((t) => t.studentId === selectedMemberForDossier.id)
                      .map((t) => (
                        <tr key={t.id}>
                          <td className="px-3 py-2 font-medium text-slate-900">{t.bookTitle}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{t.dueDate}</td>
                          <td className="px-3 py-2">
                            <StatusBadge status={t.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedMemberForDossier(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
