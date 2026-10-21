import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/controller/password', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setTimeout(() => {
                    onClose();
                }, 1500);
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 overflow-hidden border border-slate-200 text-slate-800">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#C1AA3F]/15 text-[#88742b] flex items-center justify-center shrink-0">
                            <Lock className="w-5 h-5 text-[#C1AA3F]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 font-display">
                                Change Admin Password
                            </h2>
                            <p className="text-xs text-slate-500">
                                Update your account security credentials
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

                {recentlySuccessful && (
                    <div className="my-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Password changed successfully! Closing...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            required
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            placeholder="Enter current password"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C1AA3F] focus:ring-2 focus:ring-[#C1AA3F]/20 transition-all"
                        />
                        {errors.current_password && (
                            <p className="text-xs text-rose-600 mt-1">{errors.current_password}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            New Password (min 8 characters)
                        </label>
                        <input
                            type="password"
                            required
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter new strong password"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C1AA3F] focus:ring-2 focus:ring-[#C1AA3F]/20 transition-all"
                        />
                        {errors.password && (
                            <p className="text-xs text-rose-600 mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            required
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C1AA3F] focus:ring-2 focus:ring-[#C1AA3F]/20 transition-all"
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-[#C1AA3F] hover:bg-[#b09a34] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
