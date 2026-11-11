import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Notice, RoleType } from '../../types';
import { Modal } from '../common/Modal';
import {
  Bell,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Users,
  Eye,
  Edit2,
  Trash2,
  Send,
  Download,
  Check,
  Radio,
  Sparkles,
} from 'lucide-react';

interface NoticeBoardModuleProps {
  customTitle?: string;
  customSubtitle?: string;
}

export const NoticeBoardModule: React.FC<NoticeBoardModuleProps> = ({
  customTitle,
  customSubtitle,
}) => {
  const { state, addNotice, updateNotice, deleteNotice, acknowledgeNotice, addToast } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [selectedNoticeForDetail, setSelectedNoticeForDetail] = useState<Notice | null>(null);
  const [selectedNoticeForDelete, setSelectedNoticeForDelete] = useState<Notice | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Compose Form
  const [composeForm, setComposeForm] = useState({
    title: '',
    category: 'School' as Notice['category'],
    priority: 'Normal' as Notice['priority'],
    targetAudience: 'All School Community',
    content: '',
    author: state.currentRole === 'principal' ? 'Dr. Robert Hayes (Principal)' : 'Administrative Office',
    status: 'Published' as NonNullable<Notice['status']>,
    expiryDate: '2026-11-30',
  });

  // Roles permitted to publish/manage announcements
  const canPublishNotices =
    state.currentRole === 'admin' ||
    state.currentRole === 'principal' ||
    state.currentRole === 'vice_principal' ||
    state.currentRole === 'receptionist';

  // Categories
  const categories = ['All', 'School', 'Class', 'Exam', 'Event', 'Important'];

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return state.notices.filter((n) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.targetAudience.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'All' || n.category === categoryFilter;
      const matchPriority = priorityFilter === 'All' || n.priority === priorityFilter;
      return matchSearch && matchCat && matchPriority;
    });
  }, [state.notices, searchQuery, categoryFilter, priorityFilter]);

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.title.trim() || !composeForm.content.trim()) {
      addToast('Validation', 'Title and announcement content are required.', 'error');
      return;
    }

    if (editingNotice) {
      updateNotice({
        ...editingNotice,
        title: composeForm.title.trim(),
        category: composeForm.category,
        priority: composeForm.priority,
        targetAudience: composeForm.targetAudience,
        content: composeForm.content.trim(),
        author: composeForm.author,
        status: composeForm.status,
        expiryDate: composeForm.expiryDate,
      });
      setIsComposeOpen(false);
      setEditingNotice(null);
    } else {
      addNotice({
        title: composeForm.title.trim(),
        category: composeForm.category,
        priority: composeForm.priority,
        targetAudience: composeForm.targetAudience,
        content: composeForm.content.trim(),
        author: composeForm.author,
        status: composeForm.status,
        expiryDate: composeForm.expiryDate,
      });
      setIsComposeOpen(false);
    }
  };

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Institutional Communications Desk
            </span>
            <span className="text-xs text-slate-400 font-mono">Simulated In-App Broadcast System</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {customTitle || 'Official School Notices & Circulars'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {customSubtitle ||
              'School-wide circulars, academic deadlines, emergency alerts, and class-specific announcements.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canPublishNotices && (
            <button
              onClick={() => {
                setEditingNotice(null);
                setPreviewMode(false);
                setComposeForm({
                  title: '',
                  category: 'School',
                  priority: 'Normal',
                  targetAudience: 'All School Community',
                  content: '',
                  author: state.currentRole === 'principal' ? 'Dr. Robert Hayes (Principal)' : 'Administrative Office',
                  status: 'Published',
                  expiryDate: '2026-11-30',
                });
                setIsComposeOpen(true);
              }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Compose Notice
            </button>
          )}
        </div>
      </div>

      {/* Broadcast Notice Status Banner */}
      <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-indigo-600 animate-pulse shrink-0" />
          <span className="text-slate-700 font-medium">
            Active Circulars: <strong>{state.notices.length} notices broadcasted</strong> across student cohorts, faculty desks, and mobile apps.
          </span>
        </div>
        <span className="text-[11px] font-mono text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0">
          ✓ In-App Simulated Delivery: 100% Verified
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search circular title, content, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High Priority</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-xs text-slate-400">
            No circulars match your current search criteria.
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const hasAcknowledged = (notice.acknowledgedBy || []).includes(state.currentRole);

            return (
              <div
                key={notice.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {notice.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityBadgeClass(
                          notice.priority
                        )}`}
                      >
                        {notice.priority}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Date: {notice.date}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {hasAcknowledged ? (
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          Acknowledged
                        </span>
                      ) : (
                        <button
                          onClick={() => acknowledgeNotice(notice.id, state.currentRole)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold transition-colors"
                        >
                          Acknowledge Receipt
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{notice.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-4">
                    {notice.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Audience:</strong> {notice.targetAudience}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Issued by:</strong> {notice.author}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedNoticeForDetail(notice)}
                      className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold"
                    >
                      View Details
                    </button>
                    {canPublishNotices && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => {
                            setEditingNotice(notice);
                            setPreviewMode(false);
                            setComposeForm({
                              title: notice.title,
                              category: notice.category,
                              priority: notice.priority,
                              targetAudience: notice.targetAudience,
                              content: notice.content,
                              author: notice.author,
                              status: notice.status || 'Published',
                              expiryDate: notice.expiryDate || '2026-11-30',
                            });
                            setIsComposeOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Edit Notice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedNoticeForDelete(notice)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Remove Notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Notice Detail */}
      {selectedNoticeForDetail && (
        <Modal
          isOpen={!!selectedNoticeForDetail}
          onClose={() => setSelectedNoticeForDetail(null)}
          title={selectedNoticeForDetail.title}
          subtitle={`Greenfield Official Circular · Issued by ${selectedNoticeForDetail.author}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Category: {selectedNoticeForDetail.category}</span>
                <span className="text-slate-500 block">Target Audience: {selectedNoticeForDetail.targetAudience}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-slate-700 font-bold block">{selectedNoticeForDetail.date}</span>
                <span className="font-semibold text-indigo-700 block">{selectedNoticeForDetail.priority} Priority</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedNoticeForDetail.content}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                Acknowledged by {(selectedNoticeForDetail.acknowledgedBy || []).length} recipients.
              </span>
              <button
                onClick={() => setSelectedNoticeForDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Compose Notice (With Live Preview) */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          setEditingNotice(null);
        }}
        title={editingNotice ? 'Edit School Circular' : 'Compose Official School Circular'}
        subtitle="Broadcast to parents, faculty, staff, or specific class sections."
      >
        <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              {previewMode ? 'Back to Editor' : 'Live Preview'}
            </button>
          </div>

          {previewMode ? (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold">
                  {composeForm.category}
                </span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold">
                  {composeForm.priority}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">Today</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{composeForm.title || 'Untitled Notice'}</h3>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                {composeForm.content || 'Notice body text will appear here.'}
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                Audience: {composeForm.targetAudience} · By {composeForm.author}
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Circular Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Term 1 Mid-Semester Parent Conferences"
                  value={composeForm.title}
                  onChange={(e) => setComposeForm({ ...composeForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={composeForm.category}
                    onChange={(e) => setComposeForm({ ...composeForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="School">School</option>
                    <option value="Class">Class</option>
                    <option value="Exam">Exam</option>
                    <option value="Event">Event</option>
                    <option value="Important">Important</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={composeForm.priority}
                    onChange={(e) => setComposeForm({ ...composeForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Audience</label>
                  <select
                    value={composeForm.targetAudience}
                    onChange={(e) => setComposeForm({ ...composeForm, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="All School Community">All School Community</option>
                    <option value="All Parents & Teachers">All Parents & Teachers</option>
                    <option value="Faculty & Staff">Faculty & Staff</option>
                    <option value="Grades 7 to 10">Grades 7 to 10</option>
                    <option value="Grade 10A Parents">Grade 10A Parents</option>
                    <option value="Grade 8A Parents">Grade 8A Parents</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Issued Author Name</label>
                  <input
                    type="text"
                    value={composeForm.author}
                    onChange={(e) => setComposeForm({ ...composeForm, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Circular Content & Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed circular copy, guidelines, dates, and action required..."
                  value={composeForm.content}
                  onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsComposeOpen(false);
                setEditingNotice(null);
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {editingNotice ? 'Update Notice' : 'Broadcast Circular'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Notice Confirmation */}
      {selectedNoticeForDelete && (
        <Modal
          isOpen={!!selectedNoticeForDelete}
          onClose={() => setSelectedNoticeForDelete(null)}
          title="Remove Notice"
          subtitle="Are you sure you want to remove this circular from active notice boards?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700">
              This will remove <strong>{selectedNoticeForDelete.title}</strong> issued on {selectedNoticeForDelete.date}.
            </p>
            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setSelectedNoticeForDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteNotice(selectedNoticeForDelete.id);
                  setSelectedNoticeForDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
              >
                Yes, Remove Notice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
