import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolEvent, THEMES } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Users,
  Award,
  AlertTriangle,
  CalendarDays,
  Sparkles,
  Bookmark,
} from 'lucide-react';

export const AcademicCalendarWorkspace: React.FC = () => {
  const {
    state,
    addSchoolEvent,
    updateSchoolEvent,
    deleteSchoolEvent,
    addToast,
    logAuditEvent,
  } = useApp();

  const currentTheme = THEMES[state.themeColor] || THEMES.indigo;

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Event modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<SchoolEvent | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<SchoolEvent | null>(null);

  // Form states
  const [eventForm, setEventForm] = useState<{
    title: string;
    date: string;
    endDate: string;
    time: string;
    location: string;
    audience: string;
    type: SchoolEvent['type'];
    status: SchoolEvent['status'];
    description: string;
  }>({
    title: 'Midterm Board Mock Examinations',
    date: '2026-10-14',
    endDate: '2026-10-23',
    time: '08:30 AM - 12:30 PM',
    location: 'Main Examination Halls',
    audience: 'Grades 9 to 12',
    type: 'Examination',
    status: 'Upcoming',
    description: 'Preparatory mock exams evaluated in accordance with Cambridge assessment benchmarks.',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return (state.events || []).filter((evt) => {
      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (evt.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (evt.audience || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'All' || evt.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || evt.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [state.events, searchQuery, typeFilter, statusFilter]);

  const openAddModal = () => {
    setEventForm({
      title: 'Inter-House Science Exhibition',
      date: '2026-11-06',
      endDate: '2026-11-07',
      time: '09:00 AM - 03:30 PM',
      location: 'Science Complex & Quadrangle',
      audience: 'All Students & Parents',
      type: 'School Event',
      status: 'Upcoming',
      description: 'Showcasing student STEM models, interactive physics experiments, and software demonstrations.',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (evt: SchoolEvent) => {
    setSelectedEventForEdit(evt);
    setEventForm({
      title: evt.title,
      date: evt.date,
      endDate: evt.endDate || evt.date,
      time: evt.time || '',
      location: evt.location || '',
      audience: evt.audience || '',
      type: evt.type || 'School Event',
      status: evt.status,
      description: evt.description,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) {
      setFormError('Event title is required.');
      return;
    }

    addSchoolEvent({
      title: eventForm.title.trim(),
      date: eventForm.date,
      endDate: eventForm.endDate,
      time: eventForm.time,
      location: eventForm.location,
      audience: eventForm.audience,
      type: eventForm.type,
      status: eventForm.status,
      description: eventForm.description.trim(),
    });

    logAuditEvent(`Added Academic Calendar Event: ${eventForm.title}`, eventForm.title, 'Academic');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForEdit || !eventForm.title.trim()) return;

    updateSchoolEvent({
      ...selectedEventForEdit,
      title: eventForm.title.trim(),
      date: eventForm.date,
      endDate: eventForm.endDate,
      time: eventForm.time,
      location: eventForm.location,
      audience: eventForm.audience,
      type: eventForm.type,
      status: eventForm.status,
      description: eventForm.description.trim(),
    });

    logAuditEvent(`Updated Academic Calendar Event: ${eventForm.title}`, eventForm.title, 'Academic');
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmEvent) return;
    deleteSchoolEvent(deleteConfirmEvent.id);
    logAuditEvent(`Deleted Calendar Event: ${deleteConfirmEvent.title}`, deleteConfirmEvent.title, 'Academic');
    setDeleteConfirmEvent(null);
  };

  const getTypeStyle = (type?: string) => {
    switch (type) {
      case 'Holiday':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Examination':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PTM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Academic Deadline':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Term Date':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Academic Calendar & Key Dates
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional examinations, parent-teacher conferences, term start dates, and holiday observances.
          </p>
        </div>

        <button
          onClick={openAddModal}
          style={{ backgroundColor: currentTheme.primary }}
          className="flex items-center gap-1.5 px-3.5 py-2 hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-xs transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Schedule Event
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, locations, or audiences..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="All">All Types</option>
              <option value="Examination">Examination</option>
              <option value="PTM">PTM</option>
              <option value="Holiday">Holiday</option>
              <option value="Academic Deadline">Academic Deadline</option>
              <option value="School Event">School Event</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Agenda Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTypeStyle(
                    evt.type
                  )}`}
                >
                  {evt.type || 'Event'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    evt.status === 'Ongoing'
                      ? 'bg-amber-100 text-amber-800'
                      : evt.status === 'Completed'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {evt.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{evt.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{evt.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-semibold text-slate-900">
                    {evt.date} {evt.endDate && evt.endDate !== evt.date ? `→ ${evt.endDate}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{evt.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{evt.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{evt.audience}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
              <button
                onClick={() => openEditModal(evt)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                title="Edit Event"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteConfirmEvent(evt)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                title="Delete Event"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT EVENT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isEditModalOpen ? 'Edit Academic Event' : 'Schedule Academic Calendar Event'}
          subtitle="Record exams, meetings, deadlines, or campus-wide events."
        >
          <form
            onSubmit={isEditModalOpen ? handleSaveEdit : handleSaveAdd}
            className="space-y-4 text-xs"
          >
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Midterm Examination Assessment Week"
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Time Range</label>
                <input
                  type="text"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  placeholder="e.g. 09:00 AM - 01:00 PM"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Venue / Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="e.g. Main Auditorium, Science Labs"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Event Category</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Examination">Examination</option>
                  <option value="PTM">Parent-Teacher Meeting (PTM)</option>
                  <option value="Holiday">School Holiday</option>
                  <option value="Academic Deadline">Academic Deadline</option>
                  <option value="School Event">School Event</option>
                  <option value="Term Date">Term Milestone</option>
                  <option value="Staff Development">Staff Development</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Audience</label>
                <input
                  type="text"
                  value={eventForm.audience}
                  onChange={(e) => setEventForm({ ...eventForm, audience: e.target.value })}
                  placeholder="e.g. All Students & Parents, Grades 9-10"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description & Agenda</label>
              <textarea
                rows={3}
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Important instructions, timetable impact, or agenda details..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.primary }}
                className="px-5 py-2 text-white rounded-lg font-semibold shadow-xs"
              >
                {isEditModalOpen ? 'Save Changes' : 'Schedule Event'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmEvent && (
        <Modal
          isOpen={!!deleteConfirmEvent}
          onClose={() => setDeleteConfirmEvent(null)}
          title={`Delete Event "${deleteConfirmEvent.title}"?`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to remove this event from the academic calendar?
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmEvent(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
