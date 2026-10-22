import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ExternalLink, QrCode, Edit3, Check, RotateCcw } from 'lucide-react';

export default function QrModal({ isOpen, onClose, url }) {
    if (!isOpen) return null;

    const defaultHeader = "Scan ទីនេះ! ក្រោយចុះហត្ថលេខា និងពិនិត្យពិន្ទុ";
    const defaultSubtext = "ស្កេនតាមរយៈកាមេរ៉ាទូរស័ព្ទ ដើម្បីពិនិត្យលទ្ធផលពិន្ទុ និងបញ្ជាក់ហត្ថលេខាលើសៀវភៅសារណា";

    const [headerText, setHeaderText] = useState(defaultHeader);
    const [subText, setSubText] = useState(defaultSubtext);
    const [isCustomizing, setIsCustomizing] = useState(false);

    const targetUrl = url || (typeof window !== 'undefined' ? `${window.location.origin}/thesis` : '/thesis');

    const handlePrint = () => {
        window.print();
    };

    const presets = [
        {
            label: "Khmer (Sign & Check)",
            header: "Scan ទីនេះ! ក្រោយចុះហត្ថលេខា និងពិនិត្យពិន្ទុ",
            sub: "ស្កេនតាមរយៈកាមេរ៉ាទូរស័ព្ទ ដើម្បីពិនិត្យលទ្ធផលពិន្ទុ និងបញ្ជាក់ហត្ថលេខាលើសៀវភៅសារណា"
        },
        {
            label: "English (Portal)",
            header: "Bachelor Thesis Defense Portal",
            sub: "Scan with your smartphone camera to check results & sign thesis"
        },
        {
            label: "Bilingual Notice",
            header: "Scan ទីនេះ! • Thesis Sign-In",
            sub: "Scan with smartphone camera to check scores & confirm in-person signature"
        }
    ];

    const resetToDefault = () => {
        setHeaderText(defaultHeader);
        setSubText(defaultSubtext);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto print:p-0 print:bg-white print:static print:block">
            {/* Scoped print styles ensuring only the poster prints cleanly */}
            <style>
                {`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 1.5cm;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-qr-poster, #printable-qr-poster * {
                        visibility: visible !important;
                    }
                    #printable-qr-poster {
                        position: fixed !important;
                        left: 50% !important;
                        top: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 100% !important;
                        max-width: 480px !important;
                        border: 2px solid #0f172a !important;
                        border-radius: 24px !important;
                        padding: 32px 24px !important;
                        background: #ffffff !important;
                        box-shadow: none !important;
                    }
                }
                `}
            </style>

            <div
                id="printable-qr-poster"
                className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden print:border-2 print:border-slate-900 print:shadow-none print:bg-white print:text-black"
            >
                {/* Header Toolbar (hidden in print) */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-800/40 print:hidden">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
                        <QrCode className="w-5 h-5 text-sky-400" />
                        <span>Student QR Code Scanner</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setIsCustomizing(!isCustomizing)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                isCustomizing
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Customize Poster Header"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isCustomizing ? 'Done Editing' : 'Customize Header'}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Customization Drawer (hidden in print) */}
                {isCustomizing && (
                    <div className="p-4 bg-slate-800/60 border-b border-slate-700/70 space-y-3 text-xs print:hidden animate-in fade-in duration-150">
                        <div className="space-y-1">
                            <label className="text-slate-300 font-semibold block">
                                Header Title / ចំណងជើងធំ:
                            </label>
                            <input
                                type="text"
                                value={headerText}
                                onChange={(e) => setHeaderText(e.target.value)}
                                placeholder="Scan ទីនេះ! ក្រោយចុះហត្ថលេខា និងពិនិត្យពិន្ទុ"
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-white font-khmer text-xs focus:outline-none focus:border-sky-400"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-slate-300 font-semibold block">
                                Subtitle / ការណែនាំ:
                            </label>
                            <textarea
                                rows={2}
                                value={subText}
                                onChange={(e) => setSubText(e.target.value)}
                                placeholder="Scan instructions..."
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-white font-khmer text-xs focus:outline-none focus:border-sky-400 resize-none"
                            />
                        </div>

                        {/* Quick Presets */}
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Quick Presets:</span>
                                <button
                                    onClick={resetToDefault}
                                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reset Default</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {presets.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setHeaderText(preset.header);
                                            setSubText(preset.sub);
                                        }}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                            headerText === preset.header
                                                ? 'bg-sky-500 text-slate-950 font-bold'
                                                : 'bg-slate-700/80 hover:bg-slate-700 text-slate-200'
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Printable Content */}
                <div className="p-6 text-center space-y-4 print:p-0 print:space-y-3">
                    {/* Official University Crest in Print */}
                    <div className="hidden print:flex items-center justify-center gap-3 pb-2 border-b border-slate-200">
                        <img
                            src="/images/beltei-logo.png"
                            alt="BELTEI International University"
                            className="w-14 h-16 object-contain"
                        />
                        <div className="text-left">
                            <h3 className="font-khmer font-bold text-sm text-slate-900 leading-tight">
                                សាកលវិទ្យាល័យ ប៊ែលធី អន្តរជាតិ
                            </h3>
                            <h4 className="font-extrabold text-xs text-[#1c4482] tracking-wider uppercase">
                                BELTEI International University
                            </h4>
                            <p className="text-[10px] text-slate-600 font-medium">
                                Faculty of Information Technology
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <span className="inline-block text-[11px] uppercase font-bold tracking-widest text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 print:border-slate-300 print:text-slate-800 print:bg-slate-100">
                            Faculty of Information Technology
                        </span>
                        
                        {/* Main Header (Customizable) */}
                        <h2 className="text-xl sm:text-2xl font-bold font-khmer text-white print:text-slate-950 pt-1 leading-snug px-2">
                            {headerText}
                        </h2>

                        {/* Subtext */}
                        {subText && (
                            <p className="text-xs text-slate-300 print:text-slate-700 font-khmer leading-relaxed max-w-sm mx-auto px-2">
                                {subText}
                            </p>
                        )}
                    </div>

                    {/* QR Code Container */}
                    <div className="inline-block p-4 rounded-2xl bg-white shadow-xl ring-4 ring-sky-500/20 mx-auto print:ring-0 print:shadow-none print:border print:border-slate-200">
                        <QRCodeSVG
                            value={targetUrl}
                            size={220}
                            level="H"
                            includeMargin={false}
                        />
                    </div>

                    <div className="text-xs text-slate-400 print:text-slate-700 space-y-1">
                        <div className="font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 inline-block text-[11px] text-sky-400 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
                            {targetUrl}
                        </div>
                        <p className="text-[11px] text-slate-400 print:text-slate-600 font-khmer">
                            ស្វែងរកឈ្មោះ • ពិនិត្យប្រធានបទ និងពិន្ទុការពារសារណា • បញ្ជាក់ហត្ថលេខាផ្ទាល់
                        </p>
                    </div>

                    {/* Actions Toolbar (hidden in print) */}
                    <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-800 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-lg shadow-sky-500/20 cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print Sign-in Poster</span>
                        </button>
                        <button
                            onClick={() => window.open(targetUrl, '_blank')}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open URL</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

