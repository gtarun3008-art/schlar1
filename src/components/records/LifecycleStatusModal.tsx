import React, { useState } from 'react';
import { Student, StudentLifecycleStatus, ClassRoom } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowRight, AlertTriangle, ShieldAlert } from 'lucide-react';

interface LifecycleStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classes: ClassRoom[];
  onTransition: (studentId: string, toStatus: StudentLifecycleStatus, reason: string, targetClass?: string) => void;
}

export const LifecycleStatusModal: React.FC<LifecycleStatusModalProps> = ({
  isOpen,
  onClose,
  student,
  classes,
  onTransition,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<StudentLifecycleStatus>('Promoted');
  const [targetClass, setTargetClass] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!student) return null;

  const statusOptions: { value: StudentLifecycleStatus; label: string; desc: string; requiresClass?: boolean }[] = [
    { value: 'Active', label: 'Active Enrollment', desc: 'Student is actively enrolled and attending daily academic sessions.' },
    { value: 'Admitted', label: 'Admitted / Pending Onboarding', desc: 'Admission verified and fees cleared; awaiting formal orientation.' },
    { value: 'Promoted', label: 'Promote to Next Class', desc: 'Academic session concluded; promote student to higher grade.', requiresClass: true },
    { value: 'Transferred', label: 'Section / Cohort Transfer', desc: 'Reassign student to a different class section or campus branch.', requiresClass: true },
    { value: 'Withdrawn', label: 'Withdrawn / TC Issued', desc: 'Student has formally exited; Transfer Certificate dispatched.' },
    { value: 'Archived', label: 'Archive Record', desc: 'Retire record from active directories while preserving historical marks & fees.' },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('Please provide an official administrative reason for this lifecycle transition.');
      return;
    }

    const opt = statusOptions.find((o) => o.value === selectedStatus);
    if (opt?.requiresClass && !targetClass) {
      setError('Please select the target class cohort for promotion or transfer.');
      return;
    }

    setConfirmStep(true);
  };

  const handleFinalSubmit = () => {
    onTransition(
      student.id,
      selectedStatus,
      reason.trim(),
      selectedStatus === 'Promoted' || selectedStatus === 'Transferred' ? targetClass : undefined
    );
    setConfirmStep(false);
    setReason('');
    setTargetClass('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmStep(false);
        setError(null);
        onClose();
      }}
      title={`Lifecycle Status Transition — ${student.name}`}
      subtitle={`Admission ID: ${student.admissionId} · Current: ${student.class} (${student.status})`}
      size="md"
    >
      {!confirmStep ? (
        <form onSubmit={handleNext} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Target Lifecycle Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.map((opt) => {
                const isCurrent = student.status === opt.value;
                const isSelected = selectedStatus === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    } ${isCurrent ? 'opacity-60 bg-slate-50' : ''}`}
                  >
                    <input
                      type="radio"
                      name="lifecycleStatus"
                      value={opt.value}
                      checked={isSelected}
                      disabled={isCurrent}
                      onChange={() => setSelectedStatus(opt.value)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{opt.label}</span>
                        {isCurrent && (
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-200 px-1.5 py-0.2 rounded">
                            Current Status
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {(selectedStatus === 'Promoted' || selectedStatus === 'Transferred') && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Class Cohort <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">-- Select Destination Class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.name} disabled={cls.name === student.class}>
                    {cls.name} {cls.name === student.class ? '(Current Class)' : `(${cls.totalStudents} enrolled)`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Administrative Reason & Authority Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Annual Board Examination Promotion verified by Principal Council; or Parent formal relocation request received."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              This note is immutably logged into the student's institutional audit ledger.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
            >
              Review & Confirm
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Confirmation Required</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                You are about to modify the official academic lifecycle status for{' '}
                <strong>{student.name}</strong>. This update will be reflected across faculty rosters, attendance registers, and academic transcripts.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold text-slate-900">{student.name} ({student.admissionId})</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Transition:</span>
              <div className="flex items-center gap-1.5 font-semibold">
                <StatusBadge status={student.status} />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <StatusBadge status={selectedStatus} />
              </div>
            </div>
            {(selectedStatus === 'Promoted' || selectedStatus === 'Transferred') && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Cohort Adjustment:</span>
                <span className="font-semibold text-indigo-700">
                  {student.class} → {targetClass}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 text-xs">
              <span className="text-slate-500 block mb-0.5">Reason on record:</span>
              <span className="italic text-slate-700">"{reason}"</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmStep(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors shadow-xs"
            >
              Confirm Status Transition
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
