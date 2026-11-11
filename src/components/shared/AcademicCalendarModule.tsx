import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolEvent, RoleType } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Filter,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Tag,
  Info,
} from 'lucide-react';

interface AcademicCalendarModuleProps {
  customTitle?: string;
  customSubtitle?: string;
}

export const AcademicCalendarModule: React.FC<AcademicCalendarModuleProps> = ({
  customTitle,
  customSubtitle,
}) => {
  const { state, addSchoolEvent, updateSchoolEvent, deleteSchoolEvent, addToast } = useApp();

  // View mode
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // 0-indexed: 9 = October 2026
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<SchoolEvent | null>(null);
  const [selectedEventForDelete, setSelectedEventForDelete] = useState<SchoolEvent | null>(null);

  // Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '2026-10-28',
    time: '10:00 AM - 12:00 PM',
    location: 'Main Auditorium',
    audience: 'All Students & Parents',
    type: 'School Event' as NonNullable<SchoolEvent['type']>,
    status: 'Upcoming' as NonNullable<SchoolEvent['status']>,
    description: '',
  });

  // Permission check
  const canManageEvents =
    state.currentRole === 'admin' ||
    state.currentRole === 'principal' ||
    state.currentRole === 'vice_principal';

  const months = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026',
    'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  const categories: (SchoolEvent['type'] | 'All')[] = [
    'All',
    'Holiday',
    'Examination',
    'PTM',
    'Academic Deadline',
    'School Event',
    'Staff Development',
    'Sports',
    'Meeting',
  ];

  // Active academic year & term info
  const activeYear = state.academicYears?.find((y) => y.id === state.activeAcademicYearId) || state.academicYears?.[0] || {
    name: '2026-2027 Academic Session',
    code: 'AY-2026-27',
    terms: [
      { id: 'term-1', name: 'Term 1 (Fall Semester)', startDate: '2026-08-10', endDate: '2026-12-22', status: 'Active' },
      { id: 'term-2', name: 'Term 2 (Spring Semester)', startDate: '2027-01-08', endDate: '2027-05-28', status: 'Upcoming' },
    ],
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return state.events.filter((evt) => {
      const matchCat = selectedCategory === 'All' || evt.type === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        (evt.location || '').toLowerCase().includes(q) ||
        (evt.audience || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [state.events, selectedCategory, searchQuery]);

  // Conflict validation: Check if date overlaps with an existing examination or holiday
  const detectEventConflicts = (date: string) => {
    const conflicts: string[] = [];
    const sameDateEvents = state.events.filter((e) => e.date === date && e.id !== editingEvent?.id);

    sameDateEvents.forEach((e) => {
      if (e.type === 'Holiday') {
        conflicts.push(`Date coincides with scheduled School Holiday: "${e.title}".`);
      } else if (e.type === 'Examination') {
        conflicts.push(`Date overlaps with major examination event: "${e.title}".`);
      }
    });

    return conflicts;
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) {
      addToast('Validation', 'Event title is required.', 'error');
      return;
    }

    const conflicts = detectEventConflicts(eventForm.date);

    if (editingEvent) {
      updateSchoolEvent({
        ...editingEvent,
        title: eventForm.title.trim(),
        date: eventForm.date,
        time: eventForm.time,
        location: eventForm.location,
        audience: eventForm.audience,
        type: eventForm.type,
        status: eventForm.status,
        description: eventForm.description.trim(),
      });
      setIsAddEventOpen(false);
      setEditingEvent(null);
      if (conflicts.length > 0) {
        addToast('Schedule Warning', conflicts[0], 'info');
      }
    } else {
      addSchoolEvent({
        title: eventForm.title.trim(),
        date: eventForm.date,
        time: eventForm.time,
        location: eventForm.location,
        audience: eventForm.audience,
        type: eventForm.type,
        status: eventForm.status,
        description: eventForm.description.trim(),
      });
      setIsAddEventOpen(false);
      if (conflicts.length > 0) {
        addToast('Schedule Warning', conflicts[0], 'info');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Event Title', 'Date', 'Time', 'Location', 'Audience', 'Category', 'Status', 'Description'];
    const rows = filteredEvents.map((evt) => [
      `"${evt.title}"`,
      `"${evt.date}"`,
      `"${evt.time || ''}"`,
      `"${evt.location || ''}"`,
      `"${evt.audience || ''}"`,
      `"${evt.type || 'Event'}"`,
      `"${evt.status || 'Upcoming'}"`,
      `"${evt.description.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greenfield_calendar_events_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Calendar Exported', 'Calendar events downloaded as CSV.', 'success');
  };

  const getCategoryBadgeClass = (type?: string) => {
    switch (type) {
      case 'Holiday':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Examination':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PTM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Academic Deadline':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Sports':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Staff Development':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Meeting':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Institutional Academic Calendar
            </span>
            <span className="text-xs text-slate-400 font-mono">{activeYear.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {customTitle || 'School Events & Academic Calendar'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {customSubtitle ||
              'Official master calendar tracking term dates, holidays, examination weeks, parent-teacher conferences, and extracurricular events.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Calendar
          </button>
          {canManageEvents && (
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventForm({
                  title: '',
                  date: '2026-10-28',
                  time: '10:00 AM - 12:00 PM',
                  location: 'Main Auditorium',
                  audience: 'All Students & Parents',
                  type: 'School Event',
                  status: 'Upcoming',
                  description: '',
                });
                setIsAddEventOpen(true);
              }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Event
            </button>
          )}
        </div>
      </div>

      {/* Academic Term Progress Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-300" />
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">Active Academic Session</span>
          </div>
          <h3 className="text-lg font-bold">{activeYear.name} ({activeYear.code})</h3>
          <p className="text-xs text-indigo-200 max-w-xl">
            Term 1 Fall Semester in progress. Scheduled working days: Monday through Friday (08:30 AM – 03:30 PM).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs text-xs shrink-0">
          <div>
            <span className="text-indigo-200 block text-[10px] uppercase font-bold">Term 1 Duration</span>
            <span className="font-mono font-bold text-white">Aug 10 – Dec 22, 2026</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <span className="text-indigo-200 block text-[10px] uppercase font-bold">Next Break</span>
            <span className="font-mono font-bold text-amber-300">Winter Recess (Dec 23)</span>
          </div>
        </div>
      </div>

      {/* Navigation, View Toggle & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Month selector & View switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 font-mono min-w-[120px] text-center">
              {months[currentMonthIndex]}
            </span>
            <button
              onClick={() => setCurrentMonthIndex((prev) => Math.min(months.length - 1, prev + 1))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List Ledger
            </button>
          </div>
        </div>

        {/* Search & Category Pills */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search event, location, audience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Events Display */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Event Title</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Audience</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                      No calendar events found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        <button
                          onClick={() => setSelectedEventForDetail(evt)}
                          className="hover:text-indigo-600 hover:underline text-left cursor-pointer"
                        >
                          {evt.title}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700 whitespace-nowrap">
                        <span className="font-bold block">{evt.date}</span>
                        <span className="text-[10px] text-slate-400">{evt.time || 'All Day'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(
                            evt.type
                          )}`}
                        >
                          {evt.type || 'Event'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{evt.location || 'Campus'}</td>
                      <td className="px-4 py-3.5 text-slate-600">{evt.audience || 'All School'}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                          {evt.status || 'Upcoming'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedEventForDetail(evt)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                          >
                            Details
                          </button>
                          {canManageEvents && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingEvent(evt);
                                  setEventForm({
                                    title: evt.title,
                                    date: evt.date,
                                    time: evt.time || '',
                                    location: evt.location || '',
                                    audience: evt.audience || '',
                                    type: evt.type || 'School Event',
                                    status: evt.status || 'Upcoming',
                                    description: evt.description,
                                  });
                                  setIsAddEventOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                                title="Edit Event"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setSelectedEventForDelete(evt)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="Cancel Event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Month Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(
                      evt.type
                    )}`}
                  >
                    {evt.type || 'School Event'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700">{evt.date}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">{evt.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">{evt.description}</p>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {evt.time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">{evt.time}</span>
                    </div>
                  )}
                  {evt.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.location}</span>
                    </div>
                  )}
                  {evt.audience && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">{evt.audience}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedEventForDetail(evt)}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                >
                  View Full Agenda →
                </button>
                {canManageEvents && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingEvent(evt);
                        setEventForm({
                          title: evt.title,
                          date: evt.date,
                          time: evt.time || '',
                          location: evt.location || '',
                          audience: evt.audience || '',
                          type: evt.type || 'School Event',
                          status: evt.status || 'Upcoming',
                          description: evt.description,
                        });
                        setIsAddEventOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedEventForDelete(evt)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Event Detail */}
      {selectedEventForDetail && (
        <Modal
          isOpen={!!selectedEventForDetail}
          onClose={() => setSelectedEventForDetail(null)}
          title={selectedEventForDetail.title}
          subtitle={`Greenfield Calendar Event · ${selectedEventForDetail.date}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900">Category: {selectedEventForDetail.type || 'Event'}</span>
                <span className="font-mono text-indigo-700 font-bold">{selectedEventForDetail.date}</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <div><strong>Time Window:</strong> {selectedEventForDetail.time || 'All Day'}</div>
                <div><strong>Venue / Location:</strong> {selectedEventForDetail.location || 'Greenfield Campus'}</div>
                <div><strong>Target Audience:</strong> {selectedEventForDetail.audience || 'All School Community'}</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Event Agenda & Information:</h4>
              <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {selectedEventForDetail.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEventForDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Add / Edit Event (Authorized Leadership Only) */}
      <Modal
        isOpen={isAddEventOpen}
        onClose={() => {
          setIsAddEventOpen(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? 'Modify Scheduled Calendar Event' : 'Schedule New School Event'}
        subtitle="Publish to the master calendar across all student, teacher, and administrative workspaces."
      >
        <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Inter-School Science Fair 2026"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date</label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Time Slot</label>
              <input
                type="text"
                placeholder="e.g. 09:00 AM - 01:00 PM"
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="School Event">School Event</option>
                <option value="Holiday">Holiday</option>
                <option value="Examination">Examination</option>
                <option value="PTM">Parent-Teacher Meeting (PTM)</option>
                <option value="Academic Deadline">Academic Deadline</option>
                <option value="Staff Development">Staff Development</option>
                <option value="Sports">Sports & Athletics</option>
                <option value="Meeting">Meeting</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Audience</label>
              <select
                value={eventForm.audience}
                onChange={(e) => setEventForm({ ...eventForm, audience: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="All Students & Parents">All Students & Parents</option>
                <option value="All School Community">All School Community</option>
                <option value="Faculty & Staff">Faculty & Staff</option>
                <option value="Parents Only">Parents Only</option>
                <option value="Senior Secondary (Grades 9-10)">Senior Secondary (Grades 9-10)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Venue / Location</label>
            <input
              type="text"
              placeholder="e.g. Main Auditorium / Sports Complex / Room 301"
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description & Details</label>
            <textarea
              rows={3}
              placeholder="Outline schedule, participation criteria, and guidelines..."
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddEventOpen(false);
                setEditingEvent(null);
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              {editingEvent ? 'Save Changes' : 'Publish Calendar Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Cancel / Delete Event Confirmation */}
      {selectedEventForDelete && (
        <Modal
          isOpen={!!selectedEventForDelete}
          onClose={() => setSelectedEventForDelete(null)}
          title="Cancel Calendar Event"
          subtitle="Are you sure you want to cancel and remove this event from the master school calendar?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700">
              This will remove <strong>{selectedEventForDelete.title}</strong> scheduled for{' '}
              {selectedEventForDelete.date} from the public calendar.
            </p>
            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setSelectedEventForDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Keep Event
              </button>
              <button
                onClick={() => {
                  deleteSchoolEvent(selectedEventForDelete.id);
                  setSelectedEventForDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
              >
                Yes, Cancel Event
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
