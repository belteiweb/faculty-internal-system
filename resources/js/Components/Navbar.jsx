import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { QrCode, ShieldCheck, GraduationCap, LayoutDashboard, Flag, LogIn, LogOut, UserCheck, KeyRound } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar({ active = 'student', onOpenQr }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <Link href="/thesis" className="flex items-center gap-2 sm:gap-2.5 group">
                            <img
                                src="/images/beltei-logo.png"
                                alt="BELTEI International University"
                                className="h-9 sm:h-10 w-auto object-contain shrink-0 transition-transform group-hover:scale-105 duration-200"
                            />
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-display font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                                        Thesis Controller
                                    </span>
                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#1c4482]/10 text-[#1c4482] border border-[#1c4482]/20">
                                        Batch VI
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                                    Faculty of Information Technology & Sciences • BELTEI IU
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Nav Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {onOpenQr && (
                            <button
                                onClick={onOpenQr}
                                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all active:scale-95 cursor-pointer"
                                title="Show QR Code for students to scan"
                            >
                                <QrCode className="w-4 h-4 text-[#C1AA3F]" />
                                <span className="hidden sm:inline">QR Poster</span>
                            </button>
                        )}

                        {user ? (
                            <>
                                <Link
                                    href="/controller/dashboard"
                                    className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        active === 'controller'
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <LayoutDashboard className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Admin</span>
                                </Link>

                                <button
                                    onClick={() => setPasswordModalOpen(true)}
                                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                                    title="Change Admin Password"
                                >
                                    <KeyRound className="w-3.5 h-3.5 text-[#C1AA3F]" />
                                    <span className="hidden sm:inline">Password</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
                                    title="Sign out of admin session"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all active:scale-95"
                            >
                                <LogIn className="w-3.5 h-3.5 text-[#C1AA3F]" />
                                <span className="hidden sm:inline">Faculty </span>
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Change Password Modal for Admin */}
            <ChangePasswordModal
                isOpen={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
            />
        </header>
    );
}
