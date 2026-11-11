import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  GraduationCap,
  Users,
  Briefcase,
  Layers,
  DollarSign,
  Library,
  ArrowRight,
  Command,
  Bell,
  Calendar,
  Bus,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { state, setActiveNav } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentRole = state.currentRole;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Permission checkers based on active role
  const canViewFinancials = currentRole === 'admin' || currentRole === 'principal' || currentRole === 'accountant';
  const canViewStaffRecords =
    currentRole === 'admin' || currentRole === 'principal' || currentRole === 'vice_principal' || currentRole === 'hr' || currentRole === 'receptionist';
  const canViewTransport =
    currentRole === 'admin' || currentRole === 'principal' || currentRole === 'transport' || currentRole === 'receptionist';
  const isParent = currentRole === 'parent';

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: {
      id: string;
      category: 'Student' | 'Teacher' | 'Staff' | 'Class' | 'Fee Ledger' | 'Library Book' | 'Notice' | 'Event' | 'Transport';
      title: string;
      subtitle: string;
      badge: string;
      icon: any;
      onSelect: () => void;
    }[] = [];

    // 1. Students (Filtered: If Parent, only their linked children)
    const accessibleStudents = isParent
      ? state.students.filter((s) => s.id === 'std-aarav' || s.id === 'std-ananya')
      : state.students;

    accessibleStudents.forEach((s) => {
      if (
        s.name.toLowerCase().includes(q) ||
        s.admissionId.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        s.rollNo.includes(q) ||
        s.parentName.toLowerCase().includes(q)
      ) {
        items.push({
          id: `std-${s.id}`,
          category: 'Student',
          title: s.name,
          subtitle: `${s.class} (Sec ${s.section}) · Roll #${s.rollNo} · Adm: ${s.admissionId} · Parent: ${s.parentName}`,
          badge: `${s.attendanceRate}% Attd`,
          icon: GraduationCap,
          onSelect: () => {
            if (currentRole === 'receptionist') {
              setActiveNav('student_directory');
            } else if (currentRole === 'parent') {
              setActiveNav('children');
            } else {
              setActiveNav('students');
            }
            onClose();
          },
        });
      }
    });

    // 2. Teachers (Visible to all except restricted Parent search)
    if (!isParent) {
      state.teachers.forEach((t) => {
        if (
          t.name.toLowerCase().includes(q) ||
          t.employeeId.toLowerCase().includes(q) ||
          t.subjects.some((sub) => sub.toLowerCase().includes(q)) ||
          t.classes.some((c) => c.toLowerCase().includes(q))
        ) {
          items.push({
            id: `tch-${t.id}`,
            category: 'Teacher',
            title: t.name,
            subtitle: `${t.roleTitle} · Emp: ${t.employeeId} · Subjects: ${t.subjects.join(', ')}`,
            badge: `${t.workloadHours}h / wk`,
            icon: Users,
            onSelect: () => {
              if (currentRole === 'vice_principal' || currentRole === 'principal' || currentRole === 'admin') {
                setActiveNav('teachers');
              } else if (currentRole === 'hr') {
                setActiveNav('staff');
              } else {
                setActiveNav('my_classes');
              }
              onClose();
            },
          });
        }
      });
    }

    // 3. Classes (Cohorts)
    if (!isParent) {
      state.classes.forEach((c) => {
        if (
          c.name.toLowerCase().includes(q) ||
          c.roomNumber.toLowerCase().includes(q) ||
          c.classTeacherName.toLowerCase().includes(q)
        ) {
          items.push({
            id: `cls-${c.id}`,
            category: 'Class',
            title: c.name,
            subtitle: `Room: ${c.roomNumber} · Class Teacher: ${c.classTeacherName}`,
            badge: `${c.totalStudents} Students`,
            icon: Layers,
            onSelect: () => {
              if (currentRole === 'teacher') {
                setActiveNav('my_classes');
              } else {
                setActiveNav('classes');
              }
              onClose();
            },
          });
        }
      });
    }

    // 4. Institutional Notices (Searchable by all roles)
    state.notices.forEach((n) => {
      if (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      ) {
        items.push({
          id: `not-${n.id}`,
          category: 'Notice',
          title: n.title,
          subtitle: `${n.category} · Audience: ${n.targetAudience} · Published: ${n.date}`,
          badge: n.priority,
          icon: Bell,
          onSelect: () => {
            if (currentRole === 'receptionist') {
              setActiveNav('notices_events');
            } else {
              setActiveNav('notices');
            }
            onClose();
          },
        });
      }
    });

    // 5. School Events & Calendar
    state.events.forEach((evt) => {
      if (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        (evt.location && evt.location.toLowerCase().includes(q))
      ) {
        items.push({
          id: `evt-${evt.id}`,
          category: 'Event',
          title: evt.title,
          subtitle: `${evt.date} (${evt.time || 'All Day'}) · Location: ${evt.location || 'Campus'}`,
          badge: evt.status || 'Upcoming',
          icon: Calendar,
          onSelect: () => {
            if (currentRole === 'receptionist') {
              setActiveNav('notices_events');
            } else if (currentRole === 'principal' || currentRole === 'admin') {
              setActiveNav('events');
            } else {
              setActiveNav('dashboard');
            }
            onClose();
          },
        });
      }
    });

    // 6. Fees / Finance (Strict Role Gating: ONLY Principal, Admin, Accountant)
    if (canViewFinancials) {
      state.fees.forEach((f) => {
        if (f.studentName.toLowerCase().includes(q) || f.class.toLowerCase().includes(q)) {
          items.push({
            id: `fee-${f.id}`,
            category: 'Fee Ledger',
            title: `Fee Account: ${f.studentName}`,
            subtitle: `${f.class} · Total: $${f.totalFee.toLocaleString()} · Pending: $${f.pendingAmount.toLocaleString()} · Due: ${f.dueDate}`,
            badge: f.status,
            icon: DollarSign,
            onSelect: () => {
              if (currentRole === 'accountant') {
                setActiveNav('fees');
              } else {
                setActiveNav('finance');
              }
              onClose();
            },
          });
        }
      });
    }

    // 7. Library Books (Searchable by staff / librarians)
    if (!isParent) {
      state.books.forEach((b) => {
        if (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
        ) {
          items.push({
            id: `bk-${b.id}`,
            category: 'Library Book',
            title: b.title,
            subtitle: `By ${b.author} · Shelf: ${b.shelfLocation} · ISBN: ${b.isbn}`,
            badge: `${b.availableCopies}/${b.totalCopies} Avail`,
            icon: Library,
            onSelect: () => {
              if (currentRole === 'librarian') {
                setActiveNav('books');
              } else {
                setActiveNav('dashboard');
              }
              onClose();
            },
          });
        }
      });
    }

    // 8. Staff Directory (Strict Role Gating)
    if (canViewStaffRecords) {
      state.staff.forEach((st) => {
        if (
          st.name.toLowerCase().includes(q) ||
          st.department.toLowerCase().includes(q) ||
          st.role.toLowerCase().includes(q) ||
          st.employeeId.toLowerCase().includes(q)
        ) {
          items.push({
            id: `stf-${st.id}`,
            category: 'Staff',
            title: st.name,
            subtitle: `${st.role} (${st.department}) · Emp: ${st.employeeId}`,
            badge: st.status,
            icon: Briefcase,
            onSelect: () => {
              if (currentRole === 'hr') {
                setActiveNav('staff');
              } else if (currentRole === 'receptionist') {
                setActiveNav('staff_directory');
              } else {
                setActiveNav('staff');
              }
              onClose();
            },
          });
        }
      });
    }

    // 9. Transport Routes
    if (canViewTransport && state.transportRoutes) {
      state.transportRoutes.forEach((tr) => {
        if (
          tr.routeName.toLowerCase().includes(q) ||
          tr.routeCode.toLowerCase().includes(q) ||
          tr.driverName.toLowerCase().includes(q)
        ) {
          items.push({
            id: `tr-${tr.id}`,
            category: 'Transport',
            title: `Route ${tr.routeCode}: ${tr.routeName}`,
            subtitle: `Driver: ${tr.driverName} · Vehicle: ${tr.vehicleNumber} · ${tr.assignedStudents}/${tr.capacity} Assigned`,
            badge: tr.status,
            icon: Bus,
            onSelect: () => {
              if (currentRole === 'transport') {
                setActiveNav('routes');
              } else {
                setActiveNav('dashboard');
              }
              onClose();
            },
          });
        }
      });
    }

    return items.slice(0, 14);
  }, [query, state, currentRole, isParent, canViewFinancials, canViewStaffRecords, canViewTransport, setActiveNav, onClose]);

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyNavigation}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search students, faculty, notices, calendar events, classes..."
            className="flex-1 bg-transparent border-0 text-sm focus:outline-hidden text-slate-900 placeholder-slate-400 font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Results Stream */}
        <div className="max-h-[420px] overflow-y-auto p-2 divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Search className="w-7 h-7 mx-auto text-slate-300" />
              <p className="text-xs font-medium text-slate-600">Quick Global Search</p>
              <p className="text-[11px] max-w-sm mx-auto leading-relaxed text-slate-400">
                Authorized for <strong className="text-slate-700 capitalize">{currentRole.replace('_', ' ')}</strong>.
                Find students, circulars, calendar milestones, classes, and records instantly.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-1">
              <p className="text-xs font-semibold text-slate-700">No results found for "{query}"</p>
              <p className="text-[11px]">Check spelling or try searching by ID, cohort, or category.</p>
            </div>
          ) : (
            results.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/80 text-indigo-950' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs truncate text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.badge}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'translate-x-0.5 text-indigo-600' : 'text-slate-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Keybinds */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs">
                ↓
              </kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs">
                ↵
              </kbd>{' '}
              to select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs">
                esc
              </kbd>{' '}
              to exit
            </span>
          </div>
          <span className="font-semibold text-slate-700">SCHLAR Unified Search</span>
        </div>
      </div>
    </div>
  );
};
