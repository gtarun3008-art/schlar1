import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolEvent } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar,
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Search,
  Bookmark,
  Award,
  Sun,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AcademicCalendarManager: React.FC = () => {
  const { state, addSchoolEvent, updateSchoolEvent, deleteSchoolEvent, addToast } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFormat, setViewFormat] = useState<'list' | 'cards'>('cards');

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<SchoolEvent | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<SchoolEvent['type']>('Academic');
  const [formStartDate, setFormStartDate] = useState('2026-11-01');
  const [formEndDate, setFormEndDate] = useState('2026-11-02');
  const [formDescription, setFormDescription] = useState('');
  const [formAudience, setFormAudience] = useState<'All' | 'Students' | 'Faculty' | 'Parents'>('All');

  const events: SchoolEvent[] = state.events || [];

  const filteredEvents = useMemo(() => {
    return events
      .filter((ev: SchoolEvent) => {
        const matchesType = typeFilter === 'all' || ev.type === typeFilter;
        const matchesSearch =
          ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ev.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort(
        (a: SchoolEvent, b: SchoolEvent) =>
          new Date(a.startDate || a.date).getTime() - new Date(b.startDate || b.date).getTime()
      );
  }, [events, typeFilter, searchQuery]);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormType('Academic');
    setFormStartDate('2026-11-15');
    setFormEndDate('2026-11-15');
    setFormDescription('');
    setFormAudience('All');
    setIsEventModalOpen(true);
  };

  const openEditModal = (ev: SchoolEvent) => {
    setEditingEvent(ev);
    setFormTitle(ev.title);
    setFormType(ev.type || 'Academic');
    setFormStartDate(ev.startDate || ev.date || '2026-11-15');
    setFormEndDate(ev.endDate || ev.date || '2026-11-15');
    setFormDescription(ev.description || '');
    setFormAudience((ev.targetAudience || ev.audience || 'All') as any);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formEndDate) < new Date(formStartDate)) {
      addToast('Validation Error', 'Event end date cannot be earlier than start date.', 'error');
      return;
    }

    if (editingEvent) {
      updateSchoolEvent({
        ...editingEvent,
        title: formTitle,
        type: formType,
        date: formStartDate,
        startDate: formStartDate,
        endDate: formEndDate,
        description: formDescription,
        targetAudience: formAudience,
        audience: formAudience,
      });
      addToast('Event Updated', `${formTitle} updated in calendar.`, 'success');
    } else {
      addSchoolEvent({
        title: formTitle,
        type: formType,
        date: formStartDate,
        startDate: formStartDate,
        endDate: formEndDate,
        time: '09:00 AM',
        location: 'Campus Auditorium',
        audience: formAudience,
        targetAudience: formAudience,
        status: 'Upcoming',
        description: formDescription,
        academicYearId: state.activeAcademicYearId,
      });
      addToast('Event Added', `${formTitle} scheduled in academic calendar.`, 'success');
    }

    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (deleteConfirmEvent) {
      deleteSchoolEvent(deleteConfirmEvent.id);
      addToast('Event Removed', `${deleteConfirmEvent.title} deleted.`, 'info');
      setDeleteConfirmEvent(null);
    }
  };

  const getTypeBadge = (type?: SchoolEvent['type']) => {
    switch (type) {
      case 'Examination':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Holiday':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Sports':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Meeting':
      case 'PTM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Academic Calendar & Institutional Events
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Greenfield International School · Semester milestones, examination windows, holidays, and campus meetings.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Calendar Event
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events, exams, holidays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Category:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="all">All Events ({events.length})</option>
                <option value="Academic">Academic Milestones</option>
                <option value="Examination">Examinations</option>
                <option value="Holiday">Holidays & Breaks</option>
                <option value="Sports">Sports & Culture</option>
                <option value="Meeting">Conferences & Meetings</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setViewFormat('cards')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewFormat === 'cards' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewFormat('list')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewFormat === 'list' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Events Display */}
      {viewFormat === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeBadge(
                      ev.type
                    )}`}
                  >
                    {ev.type}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    For: {ev.targetAudience}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-2.5">{ev.title}</h3>

                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {ev.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-mono text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {ev.startDate}
                    {ev.startDate !== ev.endDate && ` → ${ev.endDate}`}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                <button
                  onClick={() => openEditModal(ev)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit Event"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmEvent(ev)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
          {filteredEvents.map((ev: SchoolEvent) => (
            <div key={ev.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
              <div className="flex items-start gap-4">
                <div className="w-32 shrink-0 font-mono text-xs text-slate-500 pt-0.5">
                  <div className="font-bold text-slate-800">{ev.startDate}</div>
                  {ev.startDate !== ev.endDate && <div className="text-[11px] text-slate-400">to {ev.endDate}</div>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ev.title}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${getTypeBadge(ev.type)}`}>
                      {ev.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEditModal(ev)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmEvent(ev)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={editingEvent ? `Edit Event: ${editingEvent.title}` : 'Schedule School Event'}
        subtitle="Post examination dates, school holidays, or academic parent-teacher conferences."
      >
        <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm Examination Window"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category *</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Academic">Academic Milestone</option>
                <option value="Examination">Examination</option>
                <option value="Holiday">Holiday / Recess</option>
                <option value="Sports">Sports & Activities</option>
                <option value="Meeting">Meeting / Conference</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Audience</label>
              <select
                value={formAudience}
                onChange={(e) => setFormAudience(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="All">All School Community</option>
                <option value="Students">Students Only</option>
                <option value="Faculty">Faculty & Staff</option>
                <option value="Parents">Parents Community</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description / Notes</label>
            <textarea
              rows={3}
              placeholder="Details regarding bell schedule modifications, dress code, or exam logistics..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              {editingEvent ? 'Save Changes' : 'Confirm & Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Event Confirmation Modal */}
      {deleteConfirmEvent && (
        <Modal
          isOpen={!!deleteConfirmEvent}
          onClose={() => setDeleteConfirmEvent(null)}
          title="Remove Calendar Event?"
          subtitle={`Delete "${deleteConfirmEvent.title}" from the school calendar?`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to delete this event scheduled for{' '}
              <strong>{deleteConfirmEvent.startDate || deleteConfirmEvent.date}</strong>?
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmEvent(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Delete Event
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
