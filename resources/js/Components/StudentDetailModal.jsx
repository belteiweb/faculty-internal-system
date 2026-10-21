import React, { useState } from 'react';
import {
    X, BookOpen, GraduationCap, Award, CheckCircle2,
    XCircle, ShieldCheck, Flag, Copy, Check, Phone,
    School, FileText
} from 'lucide-react';
import StudentAvatar from './StudentAvatar';

export default function StudentDetailModal({
    student,
    isOpen,
    onClose,
    onVerifySignature,
    onReportIssue,
    isSigned = false
}) {
    if (!isOpen || !student) return null;

    const [copied, setCopied] = useState(false);
    const hasQuestions = student.topic_questions && student.topic_questions.length > 0;
    const isPassed = student.result_status === 'PASS';
    const scoreNum = student.score !== null ? Number(student.score) : null;

    const getGrade = (score) => {
        if (score === null || isNaN(score)) return { grade: 'N/A', label: 'Evaluation Pending' };
        if (score >= 90) return { grade: 'A', label: 'Outstanding (Grade A)' };
        if (score >= 80) return { grade: 'B', label: 'Very Good (Grade B)' };
        if (score >= 70) return { grade: 'C', label: 'Good (Grade C)' };
        if (score >= 60) return { grade: 'D', label: 'Satisfactory (Grade D)' };
        return { grade: 'F', label: 'Repeat / Deficient' };
    };

    const gradeInfo = getGrade(scoreNum);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/thesis?search=${student.student_id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 text-slate-800">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between shrink-0 bg-slate-50/50">
                    <div className="flex items-start gap-3.5">
                        <StudentAvatar
                            student={student}
                            size="md"
                            showBadge={true}
                            className="rounded-2xl ring-2 ring-[#C1AA3F]/30 shrink-0 shadow-sm"
                        />

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display tracking-tight">
                                    {student.name_latin}
                                </h2>
                                {student.name_khmer && (
                                    <span className="text-xs sm:text-sm font-medium text-slate-600 font-khmer px-2 py-0.5 rounded-md bg-white border border-slate-200">
                                        {student.name_khmer}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    ID: <strong className="text-slate-900">{student.student_id_formatted || student.student_id}</strong>
                                </span>
                                <span>•</span>
                                <span className="px-2 py-0.5 rounded-md bg-[#C1AA3F]/15 text-[#88742b] font-mono font-bold border border-[#C1AA3F]/30">
                                    Class {student.class_code || 'N/A'}
                                </span>
                                <span>•</span>
                                <span>{student.major_code}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
                    {/* Score & Verdict Banner */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#C1AA3F]/15 text-[#88742b] flex items-center justify-center shrink-0">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] text-slate-500 block font-medium">Defense Score</span>
                                <span className="text-xl font-extrabold text-slate-900 font-display">
                                    {scoreNum !== null ? `${scoreNum.toFixed(2)} / 100` : 'Pending'}
                                </span>
                            </div>
                        </div>

                        {isPassed ? (
                            <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>PASSED</span>
                                </span>
                                <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">
                                    {gradeInfo.label}
                                </span>
                            </div>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>REPEAT</span>
                            </span>
                        )}
                    </div>

                    {/* Hard-Copy Book Signature Status */}
                    <div
                        className={`p-3.5 rounded-2xl border transition-all ${
                            isSigned
                                ? 'bg-emerald-50/70 border-emerald-200'
                                : 'bg-[#FAF8F0] border-[#C1AA3F]/40'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className={`w-4 h-4 ${isSigned ? 'text-emerald-600' : 'text-[#88742b]'}`} />
                                    <span className="text-xs font-bold text-slate-900">
                                        Thesis Book Signature
                                    </span>
                                    {isSigned ? (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-bold">
                                            SIGNED
                                        </span>
                                    ) : (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C1AA3F]/25 text-[#88742b] font-bold">
                                            PENDING
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    {isSigned
                                        ? `Confirmed on ${student.signed_at ? new Date(student.signed_at).toLocaleString() : 'System'}.`
                                        : 'Confirm once you sign the printed thesis book.'}
                                </p>
                            </div>

                            {!isSigned ? (
                                <button
                                    onClick={() => {
                                        onClose();
                                        onVerifySignature(student);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#C1AA3F] hover:bg-[#D8C359] text-slate-950 shadow-xs shrink-0 cursor-pointer"
                                >
                                    Confirm Sign
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        onClose();
                                        onVerifySignature(student);
                                    }}
                                    className="text-[11px] text-rose-600 hover:text-rose-700 underline shrink-0 cursor-pointer"
                                >
                                    Unmark
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Academic Topic Section */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#88742b]">
                            <BookOpen className="w-3.5 h-3.5 text-[#C1AA3F]" />
                            <span>Approved Research Topic</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-medium leading-relaxed">
                            "{student.topic_title || 'No research topic registered yet.'}"
                        </div>
                    </div>

                    {/* Research Questions Section */}
                    {hasQuestions && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
                                <div className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-[#C1AA3F]" />
                                    <span>Research Inquiries ({student.topic_questions.length})</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                {student.topic_questions.map((q, idx) => (
                                    <div
                                        key={idx}
                                        className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/90 flex items-start gap-2.5 text-xs text-slate-700"
                                    >
                                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#C1AA3F]/20 text-[#88742b] font-bold shrink-0 mt-0.5">
                                            Q{idx + 1}
                                        </span>
                                        <p className="leading-relaxed">{q}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Supervisor & Academic Metadata */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <div className="flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-[#C1AA3F]" />
                                <span>Supervisor</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">
                                Campus: {student.campus_name || student.campus_code}
                            </span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                            {student.supervisor_name || 'Faculty Committee'}
                        </div>
                        {student.supervisor?.phone && (
                            <div className="text-xs text-slate-600 font-mono flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#C1AA3F]" />
                                <span>{student.supervisor.phone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                    <button
                        onClick={() => {
                            onClose();
                            onReportIssue(student);
                        }}
                        className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium cursor-pointer"
                    >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Report Error</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyLink}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Link</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
