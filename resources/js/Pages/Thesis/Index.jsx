import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import ReportModal from '@/Components/ReportModal';
import QrModal from '@/Components/QrModal';
import VerifySignatureModal from '@/Components/VerifySignatureModal';
import StudentDetailModal from '@/Components/StudentDetailModal';
import StudentAvatar from '@/Components/StudentAvatar';
import {
    Search, Filter, CheckCircle2, XCircle, Clock, BookOpen,
    AlertCircle, Phone, Award, School, Copy, Check, QrCode,
    Sparkles, GraduationCap, RefreshCw, X, ArrowRight, Lightbulb,
    Users, Compass, Eye, ShieldCheck, ChevronRight, FileCheck
} from 'lucide-react';

export default function Index({
    students,
    suggestions = [],
    matchedClasses = [],
    filters = {},
    options = {},
    stats = {},
    initialState = false,
    appUrl
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCampus, setSelectedCampus] = useState(filters.campus || '');
    const [selectedMajor, setSelectedMajor] = useState(filters.major || '');
    const [selectedClass, setSelectedClass] = useState(filters.class_code || '');
    const [selectedSupervisor, setSelectedSupervisor] = useState(filters.supervisor || '');
    const [selectedResult, setSelectedResult] = useState(filters.result_status || '');
    const [selectedSigned, setSelectedSigned] = useState(filters.signed !== undefined && filters.signed !== null ? String(filters.signed) : '');
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [reportingStudent, setReportingStudent] = useState(null);
    const [verifyingStudent, setVerifyingStudent] = useState(null);
    const [detailedStudent, setDetailedStudent] = useState(null);
    const [qrOpen, setQrOpen] = useState(false);

    // Copied feedback
    const [copiedId, setCopiedId] = useState(null);

    // Local signature overrides (studentId -> boolean)
    const [localSignatures, setLocalSignatures] = useState({});

    // Apply filters
    const applyFilters = (newParams = {}) => {
        const params = {
            search: search.trim() || undefined,
            campus: selectedCampus || undefined,
            major: selectedMajor || undefined,
            class_code: selectedClass || undefined,
            supervisor: selectedSupervisor || undefined,
            result_status: selectedResult || undefined,
            signed: selectedSigned !== '' ? selectedSigned : undefined,
            ...newParams,
        };

        router.get('/thesis', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters({ search: search.trim() || undefined });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleClearFilters = () => {
        setSearch('');
        setSelectedCampus('');
        setSelectedMajor('');
        setSelectedClass('');
        setSelectedSupervisor('');
        setSelectedResult('');
        setSelectedSigned('');
        router.get('/thesis', {}, { preserveState: true, replace: true });
    };

    const handleQuickClassSelect = (classCode) => {
        setSelectedClass(classCode);
        applyFilters({ class_code: classCode });
    };

    const copyToClipboard = (text, id, e) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSignatureClick = (student, e) => {
        if (e) e.stopPropagation();
        const isCurrentlySigned = localSignatures[student.id] !== undefined
            ? localSignatures[student.id]
            : student.signed;

        if (!isCurrentlySigned) {
            setVerifyingStudent(student);
        } else {
            if (confirm(`Do you wish to unmark the signature for ${student.name_latin}?`)) {
                setLocalSignatures((prev) => ({ ...prev, [student.id]: false }));
                router.post(`/thesis/student/${student.id}/toggle-signature`, {}, {
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        }
    };

    const handleVerificationSuccess = (updatedStudent) => {
        setLocalSignatures((prev) => ({ ...prev, [updatedStudent.id]: true }));
        router.reload({ only: ['students', 'stats'] });
    };

    const activeFilterCount = [
        selectedCampus,
        selectedMajor,
        selectedClass,
        selectedSupervisor,
        selectedResult,
        selectedSigned,
    ].filter(Boolean).length;

    const hasSearchResults = students?.data && students.data.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-[#C1AA3F] selection:text-slate-950 font-sans">
            <Head title="Bachelor Thesis Portal • Batch VI FITS BELTEI" />

            <Navbar active="student" onOpenQr={() => setQrOpen(true)} />

            {/* Mobile-First Header & Search Console */}
            <div className="bg-white border-b border-slate-200/90 shadow-xs px-4 pt-4 pb-3.5 sm:pt-6 sm:pb-5">
                <div className="max-w-xl mx-auto space-y-3">
                    {/* Header Label */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#C1AA3F]" />
                            <span className="text-[11px] font-bold tracking-wider text-[#88742b] uppercase">
                                FITS • Bachelor Thesis Defense
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                            Batch VI
                        </span>
                    </div>

                    {/* Clean Search Input */}
                    <div className="relative flex items-center">
                        <Search className="absolute left-3.5 w-4 h-4 text-[#88742b]" />
                        <input
                            type="text"
                            autoFocus={initialState}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Enter ID (e.g. 55984) or Name..."
                            className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#C1AA3F] focus:ring-3 focus:ring-[#C1AA3F]/20 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Quick Cohort Badges - Horizontal Touch Scrollable */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar text-xs">
                        <button
                            onClick={() => handleQuickClassSelect('')}
                            className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all text-xs ${!selectedClass
                                ? 'bg-[#C1AA3F] text-slate-950 shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            All Classes
                        </button>
                        {options.classes?.map((c) => (
                            <button
                                key={c}
                                onClick={() => handleQuickClassSelect(c)}
                                className={`px-2.5 py-1 rounded-lg font-mono font-bold shrink-0 transition-all text-xs border ${selectedClass === c
                                    ? 'bg-[#C1AA3F] text-slate-950 border-[#C1AA3F] shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-[#C1AA3F]/60 hover:text-[#88742b]'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Filter Toggle Pill (Understated to keep view clean) */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                        >
                            <Filter className="w-3 h-3 text-[#C1AA3F]" />
                            <span>{showFilters ? 'Hide Filters' : 'More Filters'}</span>
                            {activeFilterCount > 0 && (
                                <span className="w-3.5 h-3.5 rounded-full bg-[#C1AA3F] text-slate-950 font-bold text-[9px] flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {activeFilterCount > 0 && (
                            <button
                                onClick={handleClearFilters}
                                className="text-[11px] text-rose-600 hover:underline flex items-center gap-0.5"
                            >
                                <RefreshCw className="w-2.5 h-2.5" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>

                    {/* Collapsible Advanced Filters */}
                    {showFilters && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-in fade-in duration-200">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                                        Major
                                    </label>
                                    <select
                                        value={selectedMajor}
                                        onChange={(e) => {
                                            setSelectedMajor(e.target.value);
                                            applyFilters({ major: e.target.value || undefined });
                                        }}
                                        className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 outline-none focus:border-[#C1AA3F]"
                                    >
                                        <option value="">All Majors</option>
                                        {options.majors?.map((m) => (
                                            <option key={m.code} value={m.code}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                                        Signature
                                    </label>
                                    <select
                                        value={selectedSigned}
                                        onChange={(e) => {
                                            setSelectedSigned(e.target.value);
                                            applyFilters({ signed: e.target.value !== '' ? e.target.value : undefined });
                                        }}
                                        className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 outline-none focus:border-[#C1AA3F]"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="1">Signed Only</option>
                                        <option value="0">Unsigned Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-xl w-full mx-auto px-3.5 sm:px-4 py-4 space-y-3.5">

                {/* 1. INITIAL STATE: Clean Welcome without clutter */}
                {initialState && (
                    <div className="space-y-4 py-2 animate-in fade-in duration-200">
                        {/* Quick guidance banner */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center space-y-1.5">
                            <h2 className="text-base font-extrabold text-slate-900 font-display">
                                Student Defense Verification
                            </h2>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                                Search with your <strong className="text-slate-800">Student ID</strong> or <strong className="text-slate-800">Name</strong> to check your defense score and confirm your printed thesis book signature.
                            </p>
                        </div>

                        {/* Quick Class Grid Selector */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                                    Browse by Class Cohort
                                </span>
                                <span className="text-[11px] text-slate-400">Tap to load</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {options.classes?.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => handleQuickClassSelect(c)}
                                        className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-[#C1AA3F]/15 border border-slate-200 hover:border-[#C1AA3F]/50 text-xs font-mono font-bold text-slate-700 hover:text-[#88742b] transition-all text-center"
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MULTIPLE MATCHES NARROW-DOWN */}
                {matchedClasses && matchedClasses.length > 1 && (
                    <div className="p-3 rounded-xl bg-[#FAF8F0] border border-[#C1AA3F]/30 space-y-1.5 animate-in fade-in duration-200">
                        <span className="text-[11px] font-bold text-[#88742b] block">
                            Multiple students found. Narrow by your class:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() => handleQuickClassSelect('')}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold ${!selectedClass ? 'bg-[#C1AA3F] text-slate-950' : 'bg-white text-slate-700 border border-slate-200'
                                    }`}
                            >
                                All ({students?.total || 0})
                            </button>
                            {matchedClasses.map((cls) => (
                                <button
                                    key={cls}
                                    onClick={() => handleQuickClassSelect(cls)}
                                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${selectedClass === cls
                                        ? 'bg-[#C1AA3F] text-slate-950'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:border-[#C1AA3F]'
                                        }`}
                                >
                                    {cls}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. CANDIDATE CARDS - FOCUSED ON SCORE & BOOK SIGNATURE */}
                {hasSearchResults && (
                    <div className="space-y-3">
                        <div className="text-[11px] text-slate-500 px-1 flex items-center justify-between">
                            <span>Found <strong>{students.total || 0}</strong> candidates</span>
                            {search && <span>Filtered by: "{search}"</span>}
                        </div>

                        {students.data.map((student) => {
                            const isSigned = localSignatures[student.id] !== undefined
                                ? localSignatures[student.id]
                                : student.signed;
                            const isPassed = student.result_status === 'PASS';

                            return (
                                <div
                                    key={student.id}
                                    id={`student-${student.student_id}`}
                                    className={`rounded-2xl p-4 transition-all duration-150 border bg-white shadow-2xs space-y-3 ${isSigned
                                        ? 'border-emerald-300 ring-1 ring-emerald-200/60'
                                        : 'border-slate-200 hover:border-[#C1AA3F]'
                                        }`}
                                >
                                    {/* Student Header */}
                                    <div className="flex items-start gap-3">
                                        <StudentAvatar
                                            student={student}
                                            size="lg"
                                            showBadge={true}
                                            className="shrink-0"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-display">
                                                    {student.name_latin}
                                                </h3>
                                                {student.name_khmer && (
                                                    <span className="text-xs font-medium text-slate-600 font-khmer px-1.5 py-0.5 rounded bg-slate-100">
                                                        {student.name_khmer}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-medium">
                                                <button
                                                    onClick={(e) => copyToClipboard(student.student_id, `id-${student.id}`, e)}
                                                    className="font-mono text-slate-700 hover:text-[#88742b] flex items-center gap-1"
                                                >
                                                    <span>ID: <strong className="text-slate-900">{student.student_id_formatted || student.student_id}</strong></span>
                                                    {copiedId === `id-${student.id}` ? (
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="w-2.5 h-2.5 text-slate-400" />
                                                    )}
                                                </button>
                                                <span>•</span>
                                                <span className="px-1.5 py-0.2 rounded bg-[#C1AA3F]/15 text-[#88742b] font-mono font-bold text-[11px]">
                                                    {student.class_code || 'N/A'}
                                                </span>
                                                <span>•</span>
                                                <span>{student.major_code}</span>
                                            </div>

                                            {/* 2 MAIN EYECATCHY HIGHLIGHTS: SCORE + BOOK SIGNATURE */}
                                            <div className="grid grid-cols-1 gap-2 pt-0.5">
                                                {/* 1. Defense Score & Pass/Fail Status */}
                                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Award className="w-4 h-4 text-[#88742b]" />
                                                        <span className="text-xs font-semibold text-slate-600">
                                                            Mark:
                                                        </span>
                                                        <span className="text-sm font-extrabold text-slate-900 font-display">
                                                            {student.score !== null ? `${Number(student.score).toFixed(2)}` : 'N/A'}
                                                        </span>
                                                        {/* {student.score !== null && (
                                                            <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
                                                        )} */}
                                                    </div>
                                                    {isPassed ? (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            PASSED
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                                            REPEAT
                                                        </span>
                                                    )}

                                                </div>

                                                {/* 2. Official Thesis Book Signature Action (Primary Goal!) */}
                                                {isSigned ? (
                                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                                            <div>
                                                                <span className="text-xs font-extrabold text-emerald-900 block leading-tight">
                                                                    Hard-Copy Book Signed ✓
                                                                </span>
                                                                <span className="text-[10px] text-emerald-700">
                                                                    {student.signed_at ? `Signed on ${new Date(student.signed_at).toLocaleDateString()}` : 'Registered on system'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={(e) => handleSignatureClick(student, e)}
                                                            className="text-[11px] text-rose-600 hover:text-rose-700 underline font-medium shrink-0 cursor-pointer"
                                                        >
                                                            Unmark
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => handleSignatureClick(student, e)}
                                                        className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-[#C1AA3F] hover:bg-[#D8C359] text-slate-950 shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                                                    >
                                                        <FileCheck className="w-4 h-4 text-slate-950" />
                                                        <span>Confirm Book Signature</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>



                                    {/* Discrete "View Topic & Details" link */}
                                    <div className="pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                                        <button
                                            onClick={() => setDetailedStudent(student)}
                                            className="text-slate-600 hover:text-[#88742b] font-medium flex items-center gap-1 transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-[#C1AA3F]" />
                                            <span>View Details</span>
                                        </button>

                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 4. FUZZY SUGGESTIONS ("Did you mean?") */}
                {!initialState && !hasSearchResults && suggestions && suggestions.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-[#C1AA3F]/30 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-[#88742b]">
                            <Lightbulb className="w-4 h-4 text-[#C1AA3F] shrink-0" />
                            <span className="text-xs font-bold text-slate-900">
                                No exact match for "{search}". Did you mean:
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            {suggestions.map((sug) => (
                                <div
                                    key={sug.id}
                                    onClick={() => {
                                        setSearch(sug.student_id);
                                        applyFilters({ search: sug.student_id });
                                    }}
                                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#C1AA3F] flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <StudentAvatar student={sug} size="sm" />
                                        <div className="text-xs">
                                            <span className="font-bold text-slate-900 block">
                                                {sug.name_latin} {sug.name_khmer && `(${sug.name_khmer})`}
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-mono">
                                                ID: {sug.student_id} • Class {sug.class_code}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#88742b]" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. EMPTY STATE */}
                {!initialState && !hasSearchResults && (!suggestions || suggestions.length === 0) && (
                    <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
                        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">No student found</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                We couldn't find any candidate matching "{search}". Try searching by ID.
                            </p>
                        </div>
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C1AA3F] text-slate-950 hover:bg-[#D8C359]"
                        >
                            Reset Search
                        </button>
                    </div>
                )}

                {/* 6. PAGINATION */}
                {students?.links && students.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-1 pt-3 pb-8">
                        {students.links.map((link, idx) => {
                            if (!link.url) return null;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${link.active
                                        ? 'bg-[#C1AA3F] border-[#C1AA3F] text-slate-950'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                        }`}
                                />
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Candidate Detailed Specifications Modal */}
            <StudentDetailModal
                student={detailedStudent}
                isOpen={Boolean(detailedStudent)}
                onClose={() => setDetailedStudent(null)}
                onVerifySignature={(student) => setVerifyingStudent(student)}
                onReportIssue={(student) => setReportingStudent(student)}
                isSigned={detailedStudent ? (
                    localSignatures[detailedStudent.id] !== undefined
                        ? localSignatures[detailedStudent.id]
                        : detailedStudent.signed
                ) : false}
            />

            {/* Simple Signature Confirmation Modal */}
            <VerifySignatureModal
                student={verifyingStudent}
                isOpen={Boolean(verifyingStudent)}
                onClose={() => setVerifyingStudent(null)}
                onSuccess={handleVerificationSuccess}
            />

            {/* Issue Reporting Modal */}
            <ReportModal
                student={reportingStudent}
                isOpen={Boolean(reportingStudent)}
                onClose={() => setReportingStudent(null)}
                onSuccess={() => { }}
            />

            {/* QR Code Modal */}
            <QrModal
                isOpen={qrOpen}
                onClose={() => setQrOpen(false)}
                url={appUrl ? `${appUrl}/thesis` : (typeof window !== 'undefined' ? `${window.location.origin}/thesis` : '')}
            />
        </div>
    );
}
