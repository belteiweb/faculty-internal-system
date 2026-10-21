import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ReportModal({ student, isOpen, onClose, onSuccess }) {
    if (!isOpen || !student) return null;

    const [issueType, setIssueType] = useState('wrong_topic');
    const [description, setDescription] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const issueOptions = [
        { id: 'wrong_topic', label: 'Wrong Topic Title', desc: 'Topic is not mine or worded incorrectly' },
        { id: 'wrong_questions', label: 'Wrong Research Questions', desc: 'Questions are incomplete or incorrect' },
        { id: 'wrong_supervisor', label: 'Wrong Supervisor / Group', desc: 'Assigned to wrong advisor or group number' },
        { id: 'name_id_error', label: 'Name or ID Typo', desc: 'Spelling error in Latin name or student ID' },
        { id: 'score_error', label: 'Score / Result Error', desc: 'Mark differs from official evaluation' },
        { id: 'signature_issue', label: 'Signature Problem', desc: 'Accidentally checked or thesis not printed' },
        { id: 'other', label: 'Other Issue', desc: 'General question or discrepancy' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            setError('Please provide a brief description of the issue.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/thesis/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify({
                    thesis_student_id: student.id,
                    issue_type: issueType,
                    description: description.trim(),
                    contact_phone: contactPhone.trim(),
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSubmitted(true);
                if (onSuccess) onSuccess(data);
                setTimeout(() => {
                    setSubmitted(false);
                    setDescription('');
                    setContactPhone('');
                    onClose();
                }, 1800);
            } else {
                setError(data.message || 'Failed to submit report. Please try again.');
            }
        } catch (err) {
            setError('Network error occurred. Please check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-white">Report Discrepancy</h3>
                            <p className="text-xs text-slate-400">
                                {student.name_latin} • ID: {student.student_id}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {submitted ? (
                    <div className="p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h4 className="text-lg font-bold text-white">Report Submitted!</h4>
                        <p className="text-sm text-slate-300 max-w-sm mx-auto">
                            Thank you. Your feedback has been sent directly to the faculty thesis controller for review.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Issue Type Selection */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                What seems to be wrong?
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {issueOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setIssueType(opt.id)}
                                        className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                                            issueType === opt.id
                                                ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm ring-1 ring-amber-500/30'
                                                : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="font-semibold">{opt.label}</div>
                                        <div className="text-[11px] text-slate-400 line-clamp-1">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Describe the correction needed *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Explain what needs to be changed (e.g. Correct topic title should be... or Correct phone number is...)"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                                required
                            />
                        </div>

                        {/* Contact Phone */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Your Phone Number (Optional)
                            </label>
                            <input
                                type="text"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="e.g. 012 345 678 for staff follow-up"
                                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {submitting ? 'Submitting...' : 'Send Report'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
