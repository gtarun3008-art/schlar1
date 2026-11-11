import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatMessage, RoleType } from '../../types';
import { Modal } from '../common/Modal';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  User,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  Filter,
  Users,
} from 'lucide-react';

interface InternalMessagingModuleProps {
  customTitle?: string;
  customSubtitle?: string;
}

export const InternalMessagingModule: React.FC<InternalMessagingModuleProps> = ({
  customTitle,
  customSubtitle,
}) => {
  const { state, sendMessage, addToast } = useApp();

  const [activeThreadId, setActiveThreadId] = useState<string>('thr-vikram-sterling');
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // New Conversation Form
  const [composeForm, setComposeForm] = useState({
    recipientId: 'tch-sterling',
    recipientName: 'Marcus Sterling',
    subject: '',
    messageText: '',
  });

  // Group messages into threads
  const threads = useMemo(() => {
    const threadMap: Record<
      string,
      {
        threadId: string;
        lastMessage: ChatMessage;
        messages: ChatMessage[];
        participantNames: string[];
        unreadCount: number;
      }
    > = {};

    state.messages.forEach((msg) => {
      if (!threadMap[msg.threadId]) {
        threadMap[msg.threadId] = {
          threadId: msg.threadId,
          lastMessage: msg,
          messages: [],
          participantNames: [],
          unreadCount: 0,
        };
      }
      threadMap[msg.threadId].messages.push(msg);
      threadMap[msg.threadId].lastMessage = msg;
      if (!threadMap[msg.threadId].participantNames.includes(msg.senderName)) {
        threadMap[msg.threadId].participantNames.push(msg.senderName);
      }
      if (!threadMap[msg.threadId].participantNames.includes(msg.recipientName)) {
        threadMap[msg.threadId].participantNames.push(msg.recipientName);
      }
    });

    return Object.values(threadMap);
  }, [state.messages]);

  // Permitted recipients based on current logged in role
  const permittedRecipients = useMemo(() => {
    switch (state.currentRole) {
      case 'parent':
        // Only teachers assigned to their children and principal
        return [
          { id: 'tch-sterling', name: 'Marcus Sterling (Math Teacher - Grade 8A & 10A)' },
          { id: 'tch-watson', name: 'Emily Watson (Science Teacher - Grade 5B)' },
          { id: 'tch-kim', name: 'David Kim (Literature Teacher - Grade 8A)' },
          { id: 'usr-principal', name: 'Dr. Robert Hayes (Principal Executive Desk)' },
          { id: 'stf-front-1', name: 'Clara Oswald (Front Desk & Admissions)' },
        ];
      case 'teacher':
        // Parents in their classes and leadership
        return [
          { id: 'std-aarav-parent', name: 'Vikram Sharma (Parent - Aarav Sharma Grade 8A)' },
          { id: 'std-rohan-parent', name: 'Sanjay Mehta (Parent - Rohan Mehta Grade 10A)' },
          { id: 'std-priya-parent', name: 'Anil Patel (Parent - Priya Patel Grade 10A)' },
          { id: 'usr-principal', name: 'Dr. Robert Hayes (Principal)' },
          { id: 'usr-vp', name: 'Sarah Jenkins (Vice Principal Academics)' },
          { id: 'tch-bennett', name: 'Laura Bennett (Physics Faculty)' },
          { id: 'stf-front-1', name: 'Clara Oswald (Reception)' },
        ];
      case 'admin':
      case 'principal':
      case 'vice_principal':
        // Full access to teachers, staff, parents
        return [
          { id: 'tch-sterling', name: 'Marcus Sterling (Faculty Leader)' },
          { id: 'tch-bennett', name: 'Laura Bennett (Physics Head)' },
          { id: 'tch-kim', name: 'David Kim (Literature Head)' },
          { id: 'stf-acc-1', name: 'Edward Fletcher (Bursar / Accounts)' },
          { id: 'stf-hr-1', name: 'Eleanor Vance (HR Manager)' },
          { id: 'stf-front-1', name: 'Clara Oswald (Front Desk)' },
          { id: 'std-aarav-parent', name: 'Vikram Sharma (Parent Council Rep)' },
        ];
      default:
        // Other staff members can message administration and departmental colleagues
        return [
          { id: 'usr-principal', name: 'Dr. Robert Hayes (Principal)' },
          { id: 'usr-vp', name: 'Sarah Jenkins (Vice Principal)' },
          { id: 'stf-front-1', name: 'Clara Oswald (Reception Desk)' },
          { id: 'tch-sterling', name: 'Marcus Sterling (Faculty)' },
        ];
    }
  }, [state.currentRole]);

  // Current active thread messages
  const activeThread = useMemo(() => {
    return threads.find((t) => t.threadId === activeThreadId) || threads[0];
  }, [threads, activeThreadId]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const senderRole =
      state.currentRole === 'parent'
        ? 'parent'
        : state.currentRole === 'teacher'
        ? 'teacher'
        : 'school';

    const senderName =
      state.currentRole === 'parent'
        ? 'Vikram Sharma (Parent)'
        : state.currentRole === 'teacher'
        ? 'Marcus Sterling (Teacher)'
        : state.currentRole === 'principal'
        ? 'Dr. Robert Hayes (Principal)'
        : 'School Staff';

    const otherParticipant = activeThread.lastMessage.senderName === senderName
      ? activeThread.lastMessage.recipientName
      : activeThread.lastMessage.senderName;

    sendMessage(
      activeThread.threadId,
      replyText.trim(),
      senderRole,
      senderName,
      activeThread.lastMessage.recipientId,
      otherParticipant
    );

    setReplyText('');
    addToast('Message Sent', `Dispatched to ${otherParticipant}.`, 'success');
  };

  const handleCreateConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.messageText.trim() || !composeForm.recipientId) {
      addToast('Validation', 'Please provide message content.', 'error');
      return;
    }

    const newThreadId = 'thr-' + Date.now();
    const senderRole =
      state.currentRole === 'parent'
        ? 'parent'
        : state.currentRole === 'teacher'
        ? 'teacher'
        : 'school';

    const senderName =
      state.currentRole === 'parent'
        ? 'Vikram Sharma (Parent)'
        : state.currentRole === 'teacher'
        ? 'Marcus Sterling (Teacher)'
        : state.currentRole === 'principal'
        ? 'Dr. Robert Hayes (Principal)'
        : 'School Administration';

    sendMessage(
      newThreadId,
      composeForm.messageText.trim(),
      senderRole,
      senderName,
      composeForm.recipientId,
      composeForm.recipientName
    );

    setActiveThreadId(newThreadId);
    setIsComposeOpen(false);
    addToast('Conversation Started', `Message sent to ${composeForm.recipientName}.`, 'success');

    setComposeForm({
      recipientId: permittedRecipients[0]?.id || '',
      recipientName: permittedRecipients[0]?.name || '',
      subject: '',
      messageText: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Institutional Communications Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">Role-Permitted Contacts Only</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {customTitle || 'Internal Messaging & Direct Communications'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {customSubtitle ||
              'Secure direct messaging between authorized parents, faculty members, and campus administrative staff.'}
          </p>
        </div>

        <button
          onClick={() => {
            setComposeForm({
              recipientId: permittedRecipients[0]?.id || '',
              recipientName: permittedRecipients[0]?.name || '',
              subject: '',
              messageText: '',
            });
            setIsComposeOpen(true);
          }}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Message
        </button>
      </div>

      {/* Two-Pane Messaging Interface */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[560px]">
        {/* Left Pane: Conversations List */}
        <div className="border-r border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[460px]">
              {threads.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active messaging threads.
                </div>
              ) : (
                threads.map((thr) => {
                  const isActive = (activeThread?.threadId || '') === thr.threadId;
                  return (
                    <button
                      key={thr.threadId}
                      onClick={() => setActiveThreadId(thr.threadId)}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                        isActive ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {thr.lastMessage.senderName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {thr.lastMessage.senderName}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {thr.lastMessage.timestamp.split(',')[0]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">{thr.lastMessage.text}</p>
                        <span className="text-[10px] text-indigo-700 font-medium block mt-1">
                          {thr.messages.length} messages in thread
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Strict privacy: Only permitted contacts visible.</span>
          </div>
        </div>

        {/* Right Pane: Active Thread Chat Stream */}
        <div className="md:col-span-2 flex flex-col justify-between bg-slate-50/40">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {activeThread.participantNames.join(' ↔ ')}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Thread ID: {activeThread.threadId} · Greenfield Communications
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
                  Active Thread
                </span>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[380px] flex-1">
                {activeThread.messages.map((msg) => {
                  const isMe =
                    (state.currentRole === 'parent' && msg.senderRole === 'parent') ||
                    (state.currentRole === 'teacher' && msg.senderRole === 'teacher') ||
                    (state.currentRole !== 'parent' && state.currentRole !== 'teacher' && msg.senderRole === 'school');

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-slate-200/80 flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder={`Reply as ${
                    state.currentRole === 'parent'
                      ? 'Vikram Sharma (Parent)...'
                      : state.currentRole === 'teacher'
                      ? 'Marcus Sterling (Teacher)...'
                      : 'School Administration...'
                  }`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 m-auto">
              Select a conversation thread to view messages.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Compose New Conversation */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Start Direct Message"
        subtitle="Compose an internal communication to an authorized school contact."
      >
        <form onSubmit={handleCreateConversation} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Select Authorized Recipient <span className="text-rose-500">*</span>
            </label>
            <select
              value={composeForm.recipientId}
              onChange={(e) => {
                const rec = permittedRecipients.find((r) => r.id === e.target.value);
                setComposeForm({
                  ...composeForm,
                  recipientId: e.target.value,
                  recipientName: rec?.name || '',
                });
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              {permittedRecipients.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Subject / Inquiry Topic</label>
            <input
              type="text"
              placeholder="e.g. Mathematics homework practice sheets or field trip details"
              value={composeForm.subject}
              onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Message Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Type your message here..."
              value={composeForm.messageText}
              onChange={(e) => setComposeForm({ ...composeForm, messageText: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsComposeOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Send Message
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
