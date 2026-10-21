import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Download, ExternalLink, QrCode } from 'lucide-react';

export default function QrModal({ isOpen, onClose, url }) {
    if (!isOpen) return null;

    const targetUrl = url || (typeof window !== 'undefined' ? `${window.location.origin}/thesis` : '/thesis');

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
                {/* Header (hidden in print) */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40 print:hidden">
                    <div className="flex items-center gap-2 text-white font-semibold text-base">
                        <QrCode className="w-5 h-5 text-sky-400" />
                        <span>Student QR Code Scanner</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Printable Content */}
                <div className="p-6 text-center space-y-4 print:p-8">
                    <div className="space-y-1">
                        <span className="text-[11px] uppercase font-bold tracking-widest text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 print:border-slate-300 print:text-slate-800">
                            Faculty of Information Technology
                        </span>
                        <h2 className="text-xl font-extrabold text-white print:text-slate-900 pt-1">
                            Bachelor Thesis Defense Portal
                        </h2>
                        <p className="text-xs text-slate-400 print:text-slate-600">
                            Scan with your smartphone camera to check results & sign thesis
                        </p>
                    </div>

                    {/* QR Code Container */}
                    <div className="inline-block p-4 rounded-2xl bg-white shadow-xl ring-4 ring-sky-500/20 mx-auto print:ring-0">
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
                        <p className="text-[11px] text-slate-500 print:text-slate-500">
                            Search your name • Check topic & defense score • Confirm in-person signature
                        </p>
                    </div>

                    {/* Actions (hidden in print) */}
                    <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-lg shadow-sky-500/20"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print Sign-in Poster</span>
                        </button>
                        <button
                            onClick={() => window.open(targetUrl, '_blank')}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
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
