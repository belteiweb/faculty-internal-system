import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import {
    Flag, AlertTriangle, CheckCircle2, Clock, Eye,
    Phone, Filter, ArrowLeft, MessageSquare, ShieldAlert
} from 'lucide-react';

export default function Reports({ reports, filters = {}, counts = {} }) {
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedType, setSelectedType] = useState(filters.issue_type || '');
    const [adminNotes, setAdminNotes] = useState({});
    const [updatingId, setUpdatingId] = useState(null);

    const applyFilters = (newParams = {}) => {
        const params = {
            status: selectedStatus || undefined,
            issue_type: selectedType || undefined,
            ...newParams,
        };

        router.get('/controller/reports', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleUpdateStatus = (reportId, newStatus) => {
        setUpdatingId(reportId);
        router.patch(`/controller/reports/${reportId}`, {
            status: newStatus,
            admin_notes: adminNotes[reportId],
        }, {
            preserveScroll: true,
            onFinish: () => setUpdatingId(null),
        });
    };

    const issueTypeLabels = {
        wrong_topic: 'Wrong Topic Title',
        wrong_questions: 'Wrong Research Questions',
        wrong_supervisor: 'Wrong Supervisor or Group',
        name_id_error: 'Name or Student ID Typo',
        score_error: 'Score / Evaluation Error',
        signature_issue: 'Signature Issue',
        other: 'Other Feedback',
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            <Head title="Reported Student Issues - Faculty Controller" />

            <Navbar active="reports" />

            {/* Header */}
            <div className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-5">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#88742b] tracking-wider">
                            <ShieldAlert className="w-4 h-4 text-[#C1AA3F]" />
                            <span>Faculty Thesis Verification Committee</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display pt-0.5">
                            Student Discrepancy Reports
                        </h1>
                        <p className="text-xs text-slate-500">
                            Review and resolve issues submitted by students regarding their topics, supervisors, or marks.
                        </p>
                    </div>

                    <Link
                        href="/controller/dashboard"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors self-start shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-500" />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                    {[
                        { id: '', label: 'All Reports', count: (counts.pending || 0) + (counts.under_review || 0) + (counts.resolved || 0) + (counts.dismissed || 0) },
                        { id: 'pending', label: 'Pending', count: counts.pending || 0 },
                        { id: 'under_review', label: 'Under Review', count: counts.under_review || 0 },
                        { id: 'resolved', label: 'Resolved', count: counts.resolved || 0 },
                        { id: 'dismissed', label: 'Dismissed', count: counts.dismissed || 0 },
                    ].map((tab) => {
                        const isSelected = selectedStatus === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setSelectedStatus(tab.id);
                                    applyFilters({ status: tab.id || undefined });
                                }}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                                    isSelected
                                        ? 'bg-[#C1AA3F] text-slate-900 shadow-sm font-bold'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-black/10' : 'bg-slate-100 text-slate-500'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Reports List */}
                {reports.data && reports.data.length > 0 ? (
                    <div className="space-y-4">
                        {reports.data.map((report) => (
                            <div
                                key={report.id}
                                className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                                            <Flag className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-slate-900">
                                                    {report.student_name}
                                                </h3>
                                                <span className="text-xs font-mono font-semibold text-[#88742b]">
                                                    ID: {report.student_id_code}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                                <span>Submitted on {new Date(report.created_at).toLocaleString()}</span>
                                                {report.student && (
                                                    <span>• Class: {report.student.class_code}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Issue Type Pill */}
                                    <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                        {issueTypeLabels[report.issue_type] || report.issue_type}
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Student's Statement:
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {report.description}
                                    </p>

                                    {report.contact_phone && (
                                        <div className="pt-2 flex items-center gap-1.5 text-xs text-[#88742b]">
                                            <Phone className="w-3.5 h-3.5 text-[#C1AA3F]" />
                                            <span>Contact Phone:</span>
                                            <a href={`tel:${report.contact_phone}`} className="font-semibold underline">
                                                {report.contact_phone}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Current Status & Admin Resolution */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Current Status:</span>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                                                report.status === 'resolved'
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    : report.status === 'under_review'
                                                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                                    : report.status === 'dismissed'
                                                    ? 'bg-slate-100 text-slate-600'
                                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                            }`}
                                        >
                                            {report.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {report.status !== 'under_review' && (
                                            <button
                                                onClick={() => handleUpdateStatus(report.id, 'under_review')}
                                                disabled={updatingId === report.id}
                                                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 font-semibold cursor-pointer"
                                            >
                                                Mark In-Review
                                            </button>
                                        )}
                                        {report.status !== 'resolved' && (
                                            <button
                                                onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                                disabled={updatingId === report.id}
                                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold cursor-pointer"
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                        {report.status !== 'dismissed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                                disabled={updatingId === report.id}
                                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 font-semibold cursor-pointer"
                                            >
                                                Dismiss
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                        <h3 className="text-base font-semibold text-slate-800">No reports in this category</h3>
                        <p className="text-xs text-slate-500">
                            All student reports have been processed or none have been submitted yet.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
