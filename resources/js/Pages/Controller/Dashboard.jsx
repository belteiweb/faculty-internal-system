import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import QrModal from '@/Components/QrModal';
import StudentAvatar from '@/Components/StudentAvatar';
import StudentDetailModal from '@/Components/StudentDetailModal';
import {
    Users, Award, CheckCircle2, Clock, Filter, Search,
    QrCode, Printer, Flag, ArrowUpDown, ChevronRight,
    School, Check, X, ShieldAlert, Sparkles, ExternalLink, Eye
} from 'lucide-react';

export default function Dashboard({
    students,
    filters = {},
    stats = {},
    classBreakdown = [],
    options = {},
    qrCodeUrl
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.class_code || '');
    const [selectedSupervisor, setSelectedSupervisor] = useState(filters.supervisor || '');
    const [selectedSigned, setSelectedSigned] = useState(filters.signed !== undefined && filters.signed !== null ? String(filters.signed) : '');
    const [selectedCampus, setSelectedCampus] = useState(filters.campus || '');
    const [selectedMajor, setSelectedMajor] = useState(filters.major || '');
    const [selectedResult, setSelectedResult] = useState(filters.result_status || '');

    const [qrOpen, setQrOpen] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [localSignatures, setLocalSignatures] = useState({});
    const [detailedStudent, setDetailedStudent] = useState(null);

    const applyFilters = (newParams = {}) => {
        const params = {
            search: search.trim() || undefined,
            class_code: selectedClass || undefined,
            supervisor: selectedSupervisor || undefined,
            signed: selectedSigned !== '' ? selectedSigned : undefined,
            campus: selectedCampus || undefined,
            major: selectedMajor || undefined,
            result_status: selectedResult || undefined,
            ...newParams,
        };

        router.get('/controller/dashboard', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSort = (field) => {
        const currentSort = filters.sort_by;
        const currentDir = filters.sort_dir || 'asc';
        const newDir = currentSort === field && currentDir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: field, sort_dir: newDir });
    };

    const handleToggleSignature = (student) => {
        const current = localSignatures[student.id] !== undefined
            ? localSignatures[student.id]
            : student.signed;
        const targetState = !current;

        setLocalSignatures((prev) => ({ ...prev, [student.id]: targetState }));
        setTogglingId(student.id);

        router.post(`/thesis/${student.id}/signature`, {
            signed: targetState,
        }, {
            preserveScroll: true,
            onFinish: () => setTogglingId(null),
            onError: () => {
                setLocalSignatures((prev) => ({ ...prev, [student.id]: current }));
            },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col print:bg-white print:text-black">
            <Head title="Faculty Thesis Controller Dashboard" />

            <div className="print:hidden">
                <Navbar active="controller" onOpenQr={() => setQrOpen(true)} />
            </div>

            {/* Header Banner */}
            <div className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-5 print:hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#88742b] tracking-wider">
                            <School className="w-4 h-4 text-[#C1AA3F]" />
                            <span>Faculty of Information Technology • Batch VI</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display pt-0.5">
                            Thesis Controller Dashboard
                        </h1>
                        <p className="text-xs text-slate-500">
                            Monitor Bachelor Thesis cohorts, track hardcopy book signatures, and inspect defense evaluation results.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setQrOpen(true)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#C1AA3F] hover:bg-[#b09a34] text-slate-900 transition-colors shadow-sm cursor-pointer"
                        >
                            <QrCode className="w-4 h-4" />
                            <span>Student QR Poster</span>
                        </button>

                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors shadow-sm cursor-pointer"
                        >
                            <Printer className="w-4 h-4 text-slate-500" />
                            <span>Print Sign-in Sheet</span>
                        </button>

                        <Link
                            href="/controller/reports"
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors"
                        >
                            <Flag className="w-4 h-4 text-amber-600" />
                            <span>
                                Issues ({stats.pending_reports || 0} pending)
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block p-4 border-b border-slate-300 text-center space-y-1">
                <h2 className="text-lg font-bold">BELTEI INTERNATIONAL UNIVERSITY</h2>
                <h3 className="text-base font-semibold">FACULTY OF INFORMATION TECHNOLOGY AND SCIENCE</h3>
                <p className="text-sm">
                    Bachelor Thesis Defense Sign-off Sheet — Batch VI {selectedClass ? `[Class: ${selectedClass}]` : ''}
                </p>
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* 4 Top KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold uppercase tracking-wider">Total Candidates</span>
                            <Users className="w-4 h-4 text-[#C1AA3F]" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                            {stats.total_students || 0}
                        </div>
                        <div className="text-[11px] text-slate-500">
                            Across 6 cohorts in UC1 & UC2
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-xs text-emerald-600">
                            <span className="font-semibold uppercase tracking-wider">Defense Passed</span>
                            <Award className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                            {stats.total_passed || 0}
                        </div>
                        <div className="text-[11px] text-emerald-700">
                            Passing score &gt;= 60.00
                        </div>
                    </div>

                    {/* Hardcopy Signatures Collected */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#88742b]">
                            <span className="font-semibold uppercase tracking-wider">Signed Hardcopies</span>
                            <CheckCircle2 className="w-4 h-4 text-[#C1AA3F]" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display flex items-baseline gap-2">
                            <span>{stats.total_signed || 0}</span>
                            <span className="text-xs font-semibold text-[#88742b]">
                                ({stats.signature_percentage || 0}%)
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-[#C1AA3F] h-full rounded-full transition-all duration-500"
                                style={{ width: `${stats.signature_percentage || 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-xs text-amber-600">
                            <span className="font-semibold uppercase tracking-wider">Reported Issues</span>
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                            {stats.total_reports || 0}
                        </div>
                        <div className="text-[11px] text-amber-700">
                            {stats.pending_reports || 0} pending review
                        </div>
                    </div>
                </div>

                {/* Class Cohorts Breakdown */}
                <div className="space-y-2 print:hidden">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#C1AA3F]" />
                            <span>Classes & Cohorts Progress</span>
                        </h2>
                        {selectedClass && (
                            <button
                                onClick={() => {
                                    setSelectedClass('');
                                    applyFilters({ class_code: undefined });
                                }}
                                className="text-xs text-[#88742b] hover:underline cursor-pointer"
                            >
                                Clear class filter (Show all)
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                        {classBreakdown?.map((cb) => {
                            const isSelected = selectedClass === cb.class_code;
                            const pct = cb.total > 0 ? Math.round((cb.signed_count / cb.total) * 100) : 0;
                            return (
                                <button
                                    key={`${cb.campus_code}-${cb.class_code}`}
                                    onClick={() => {
                                        const newClass = isSelected ? '' : cb.class_code;
                                        setSelectedClass(newClass);
                                        applyFilters({ class_code: newClass || undefined });
                                    }}
                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-amber-50 border-[#C1AA3F] shadow-sm ring-1 ring-[#C1AA3F]'
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-extrabold text-sm font-display ${isSelected ? 'text-[#88742b]' : 'text-slate-800'}`}>
                                            {cb.class_code}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                            {cb.campus_code}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                        <span>Total: <strong className="text-slate-700">{cb.total}</strong></span>
                                        <span className="text-emerald-600 font-bold">{pct}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                                        <div
                                            className="bg-[#C1AA3F] h-full rounded-full"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 print:hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Search Name, ID, Topic..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#C1AA3F] focus:ring-1 focus:ring-[#C1AA3F]"
                            />
                        </div>

                        {/* Class Filter */}
                        <div>
                            <select
                                value={selectedClass}
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    applyFilters({ class_code: e.target.value || undefined });
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:border-[#C1AA3F]"
                            >
                                <option value="">All Classes (SE-E1, E2, E3...)</option>
                                {options.classes?.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Supervisor */}
                        <div>
                            <select
                                value={selectedSupervisor}
                                onChange={(e) => {
                                    setSelectedSupervisor(e.target.value);
                                    applyFilters({ supervisor: e.target.value || undefined });
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:border-[#C1AA3F]"
                            >
                                <option value="">All Supervisors</option>
                                {options.supervisors?.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Signature Status */}
                        <div>
                            <select
                                value={selectedSigned}
                                onChange={(e) => {
                                    setSelectedSigned(e.target.value);
                                    applyFilters({ signed: e.target.value !== '' ? e.target.value : undefined });
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:border-[#C1AA3F]"
                            >
                                <option value="">All Signature Statuses</option>
                                <option value="1">Confirmed Signed</option>
                                <option value="0">Pending Signature</option>
                            </select>
                        </div>

                        {/* Result Status */}
                        <div>
                            <select
                                value={selectedResult}
                                onChange={(e) => {
                                    setSelectedResult(e.target.value);
                                    applyFilters({ result_status: e.target.value || undefined });
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:border-[#C1AA3F]"
                            >
                                <option value="">All Defense Results</option>
                                <option value="PASS">Passed (&gt;= 60)</option>
                                <option value="FAIL">Failed / Repeat / Suspended</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Candidate Roster Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm print:border-none print:shadow-none print:bg-transparent">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200 print:bg-slate-100 print:text-black">
                                <tr>
                                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                                    <th
                                        onClick={() => handleSort('student_id')}
                                        className="py-3.5 px-3 cursor-pointer hover:text-slate-800"
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>ID</span>
                                            <ArrowUpDown className="w-3 h-3 text-[#C1AA3F]" />
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('name_latin')}
                                        className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>Student Name</span>
                                            <ArrowUpDown className="w-3 h-3 text-[#C1AA3F]" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-2 text-center">Sex</th>
                                    <th
                                        onClick={() => handleSort('class_code')}
                                        className="py-3.5 px-3 cursor-pointer hover:text-slate-800"
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>Class</span>
                                            <ArrowUpDown className="w-3 h-3 text-[#C1AA3F]" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-3">Supervisor & Group</th>
                                    <th className="py-3.5 px-4 max-w-xs">Research Topic</th>
                                    <th
                                        onClick={() => handleSort('score')}
                                        className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-800"
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <span>Score</span>
                                            <ArrowUpDown className="w-3 h-3 text-[#C1AA3F]" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-3 text-center">Defense Result</th>
                                    <th className="py-3.5 px-4 text-center print:table-cell">
                                        Hardcopy Signature
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 print:divide-slate-200">
                                {students.data && students.data.length > 0 ? (
                                    students.data.map((student, idx) => {
                                        const isSigned = localSignatures[student.id] !== undefined
                                            ? localSignatures[student.id]
                                            : student.signed;
                                        const isPassed = student.result_status === 'PASS';

                                        return (
                                            <tr
                                                key={student.id}
                                                className={`hover:bg-slate-50/80 transition-colors ${
                                                    isSigned ? 'bg-emerald-50/40' : ''
                                                }`}
                                            >
                                                <td className="py-3 px-4 text-center text-slate-400 font-mono">
                                                    {(students.current_page - 1) * students.per_page + idx + 1}
                                                </td>
                                                <td className="py-3 px-3 font-mono font-bold text-slate-800">
                                                    {student.student_id}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-slate-900">
                                                    <div className="flex items-center gap-3">
                                                        <StudentAvatar student={student} size="sm" showBadge={false} className="shrink-0" />
                                                        <div className="min-w-0">
                                                            <span
                                                                onClick={() => setDetailedStudent(student)}
                                                                className="hover:text-[#88742b] transition-colors cursor-pointer block font-bold text-slate-800"
                                                                title="Click to view full thesis details"
                                                            >
                                                                {student.name_latin}
                                                            </span>
                                                            {student.name_khmer && (
                                                                <span className="text-[11px] text-slate-500 font-khmer block">
                                                                    {student.name_khmer}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    <span className="font-semibold text-slate-500">
                                                        {student.sex}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded bg-[#C1AA3F]/15 text-[#88742b] font-bold text-[11px]">
                                                        {student.class_code}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="font-medium text-slate-800">
                                                        {student.supervisor_name || '-'}
                                                    </div>
                                                    {student.group_no && (
                                                        <span className="text-[10px] text-slate-400">
                                                            Group {student.group_no}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 max-w-xs">
                                                    <div className="line-clamp-2 text-slate-600" title={student.topic_title}>
                                                        {student.topic_title || student.topic_raw}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-center font-bold text-slate-900">
                                                    {student.score !== null ? Number(student.score).toFixed(2) : '-'}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    {isPassed ? (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                            PASS
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                                            {student.result_status || 'FAIL'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {/* On Screen: Checkbox button toggle + details eye trigger */}
                                                    <div className="print:hidden flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleToggleSignature(student)}
                                                            disabled={togglingId === student.id}
                                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                                isSigned
                                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            {isSigned ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span>Signed</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                                    <span>Unsigned</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            onClick={() => setDetailedStudent(student)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#88742b] hover:bg-slate-100 transition-colors cursor-pointer"
                                                            title="Inspect student thesis details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* In Print: Blank line for manual student signature */}
                                                    <div className="hidden print:block text-center">
                                                        {isSigned ? (
                                                            <span className="font-bold">Signed (?)</span>
                                                        ) : (
                                                            <div className="h-6 border-b border-slate-400 w-24 mx-auto" />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="py-12 text-center text-slate-400">
                                            No student records found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {students.links && students.links.length > 3 && (
                        <div className="flex flex-wrap items-center justify-between p-4 border-t border-slate-200 text-xs print:hidden">
                            <span className="text-slate-500">
                                Page {students.current_page} of {students.last_page} ({students.total} total candidates)
                            </span>
                            <div className="flex items-center gap-1">
                                {students.links.map((link, idx) => {
                                    if (!link.url) return null;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                                                link.active
                                                    ? 'bg-[#C1AA3F] text-slate-900 font-bold border-[#C1AA3F]'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Detailed Student Specifications Modal */}
            <StudentDetailModal
                student={detailedStudent}
                isOpen={Boolean(detailedStudent)}
                onClose={() => setDetailedStudent(null)}
                onVerifySignature={handleToggleSignature}
                onReportIssue={() => {}}
                isSigned={detailedStudent ? (
                    localSignatures[detailedStudent.id] !== undefined
                        ? localSignatures[detailedStudent.id]
                        : detailedStudent.signed
                ) : false}
            />

            <QrModal
                isOpen={qrOpen}
                onClose={() => setQrOpen(false)}
                url={qrCodeUrl || (typeof window !== 'undefined' ? `${window.location.origin}/thesis` : '')}
            />
        </div>
    );
}
