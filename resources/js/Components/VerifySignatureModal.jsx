import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import StudentAvatar from './StudentAvatar';

export default function VerifySignatureModal({ student, isOpen, onClose, onSuccess }) {
    if (!isOpen || !student) return null;

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleConfirm = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const response = await fetch(`/thesis/student/${student.id}/toggle-signature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({
                    notes: 'Confirmed in-person signature via student portal',
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || 'Unable to confirm signature. Please try again.');
                setSubmitting(false);
                return;
            }

            // Confetti celebration
            confetti({
                particleCount: 75,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#C1AA3F', '#10b981', '#6366f1', '#f59e0b'],
            });

            onSuccess(data.student || { ...student, signed: true, signed_at: new Date().toISOString() });
            onClose();
        } catch (err) {
            setError('An error occurred during confirmation. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl p-5 sm:p-6 overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/images/beltei-logo.png"
                            alt="BELTEI Logo"
                            className="w-10 h-10 object-contain shrink-0 drop-shadow-xs"
                        />
                        <div>
                            <h2 className="text-base font-bold text-slate-900 font-display">
                                Confirm Book Signature
                            </h2>
                            <p className="text-[11px] text-[#88742b] font-medium">
                                Faculty of IT • BELTEI IU
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Candidate Overview Card */}
                <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center gap-3">
                        <StudentAvatar student={student} size="sm" showBadge={true} className="shrink-0" />
                        <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm">
                                {student.name_latin}
                            </div>
                            {student.name_khmer && (
                                <div className="text-xs text-slate-600 font-khmer">
                                    {student.name_khmer}
                                </div>
                            )}
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                ID: <strong className="text-slate-900">{student.student_id_formatted || student.student_id}</strong> • Class <span className="text-[#88742b] font-bold">{student.class_code}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-3.5">
                    <p className="text-xs text-slate-600 text-center leading-relaxed">
                        Are you sure you want to confirm your in-person signature on the printed bachelor thesis book?
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-1">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#C1AA3F] hover:bg-[#D8C359] text-slate-950 shadow-md shadow-[#C1AA3F]/25 focus:outline-none focus:ring-2 focus:ring-[#C1AA3F] disabled:opacity-50 transition-all transform active:scale-98 cursor-pointer"
                        >
                            {submitting ? (
                                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Yes, Confirm Book Signature</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer text-center"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
