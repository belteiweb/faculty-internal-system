import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#C1AA3F] selection:text-white">
            <Head title="Faculty Admin Login - Thesis Controller" />

            {/* Ambient Background Glows with Faculty Gold */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#C1AA3F]/15 via-amber-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                {/* Logo */}
                <div className="inline-flex items-center justify-center mb-3">
                    <img
                        src="/images/beltei-logo.png"
                        alt="BELTEI International University"
                        className="w-20 sm:w-24 h-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-200"
                    />
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-slate-900">
                    Faculty Admin Portal
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    Faculty of Information Technology & Sciences • BELTEI IU
                </p>
            </div>

            <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 relative">
                    {/* Security Badge */}
                    <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#88742b]">
                            <ShieldCheck className="w-4 h-4 text-[#C1AA3F]" />
                            <span>Authorized Personnel Only</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C1AA3F]/15 text-[#88742b] border border-[#C1AA3F]/30 font-bold">
                            FITS • BELTEI IU
                        </span>
                    </div>

                    {errors.email && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                            <span>{errors.email}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Official University Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="your-email@beltei.edu.kh"
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C1AA3F] focus:ring-2 focus:ring-[#C1AA3F]/20 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Account Password
                                </label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C1AA3F] focus:ring-2 focus:ring-[#C1AA3F]/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-[#C1AA3F] focus:ring-[#C1AA3F]"
                                />
                                <span>Remember my session</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-900 bg-[#C1AA3F] hover:bg-[#b09a34] active:scale-[0.99] transition-all shadow-md shadow-[#C1AA3F]/25 disabled:opacity-50 cursor-pointer"
                        >
                            <span>{processing ? 'Authenticating...' : 'Sign In as Faculty Controller'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <Link
                        href="/thesis"
                        className="text-xs text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
                    >
                        <span>← Return to Public Student Portal</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
