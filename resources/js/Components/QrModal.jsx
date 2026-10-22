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

    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        try {
            setIsPrinting(true);
            const qrSvgElement = document.getElementById('poster-qr-code-svg');
            const qrSvgHtml = qrSvgElement ? qrSvgElement.innerHTML : '';

            // Remove previous iframe if present
            const oldIframe = document.getElementById('qr-print-isolated-frame');
            if (oldIframe) {
                oldIframe.remove();
            }

            const iframe = document.createElement('iframe');
            iframe.id = 'qr-print-isolated-frame';
            iframe.style.position = 'fixed';
            iframe.style.top = '-9999px';
            iframe.style.left = '-9999px';
            iframe.style.width = '0px';
            iframe.style.height = '0px';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);

            const logoSrc = `${window.location.origin}/images/beltei-logo.png`;

            const printHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${headerText || 'Thesis Sign-in Poster'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4 portrait;
            margin: 1.2cm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        html, body {
            background: #ffffff;
            color: #0f172a;
            font-family: 'Kantumruy Pro', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            width: 100%;
            height: 100%;
        }
        .page-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 94vh;
            padding: 10px;
        }
        .poster-card {
            width: 100%;
            max-width: 520px;
            border: 2.5px solid #0f172a;
            border-radius: 28px;
            padding: 36px 30px;
            text-align: center;
            background: #ffffff;
        }
        .crest-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            padding-bottom: 16px;
            border-bottom: 1.5px solid #e2e8f0;
            margin-bottom: 20px;
        }
        .crest-img {
            width: 58px;
            height: 68px;
            object-fit: contain;
        }
        .crest-titles {
            text-align: left;
        }
        .crest-kh {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.3;
        }
        .crest-en {
            font-size: 11.5px;
            font-weight: 800;
            color: #1c4482;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            margin-top: 2px;
        }
        .crest-sub {
            font-size: 10px;
            font-weight: 600;
            color: #475569;
            margin-top: 2px;
        }
        .faculty-badge {
            display: inline-block;
            font-size: 10.5px;
            font-weight: 800;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: #0369a1;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            padding: 4px 14px;
            border-radius: 9999px;
            margin-bottom: 14px;
        }
        .poster-title {
            font-size: 23px;
            font-weight: 800;
            color: #020617;
            line-height: 1.38;
            margin-bottom: 10px;
            padding: 0 4px;
        }
        .poster-subtext {
            font-size: 12.5px;
            font-weight: 500;
            color: #334155;
            line-height: 1.6;
            max-width: 420px;
            margin: 0 auto 20px auto;
        }
        .qr-wrapper {
            display: inline-block;
            padding: 16px;
            background: #ffffff;
            border: 2px solid #cbd5e1;
            border-radius: 22px;
            margin-bottom: 18px;
        }
        .qr-wrapper svg {
            display: block;
            width: 230px;
            height: 230px;
        }
        .url-pill {
            display: inline-block;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 11.5px;
            font-weight: 600;
            color: #0f172a;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 6px 14px;
            border-radius: 10px;
            margin-bottom: 10px;
            word-break: break-all;
        }
        .poster-footnote {
            font-size: 11px;
            color: #64748b;
            font-weight: 500;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="poster-card">
            <div class="crest-header">
                <img src="${logoSrc}" class="crest-img" alt="BELTEI" onerror="this.style.display='none'">
                <div class="crest-titles">
                    <div class="crest-kh">សាកលវិទ្យាល័យ ប៊ែលធី អន្តរជាតិ</div>
                    <div class="crest-en">BELTEI International University</div>
                    <div class="crest-sub">Faculty of Information Technology</div>
                </div>
            </div>

            <div class="faculty-badge">Faculty of Information Technology</div>

            <h1 class="poster-title">${headerText}</h1>

            ${subText ? `<p class="poster-subtext">${subText}</p>` : ''}

            <div class="qr-wrapper">
                ${qrSvgHtml}
            </div>

            <div>
                <div class="url-pill">${targetUrl}</div>
                <div class="poster-footnote">
                    ស្វែងរកឈ្មោះ • ពិនិត្យប្រធានបទ និងពិន្ទុការពារសារណា • បញ្ជាក់ហត្ថលេខាផ្ទាល់
                </div>
            </div>
        </div>
    </div>
</body>
</html>
            `;

            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(printHtml);
            doc.close();

            // Allow brief timeout for browser to finish document parsing
            setTimeout(() => {
                setIsPrinting(false);
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            }, 300);
        } catch (err) {
            console.error('Print error:', err);
            setIsPrinting(false);
            window.print();
        }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
            <div
                className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
            >
                {/* Header Toolbar */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-800/40">
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

                {/* Customization Drawer */}
                {isCustomizing && (
                    <div className="p-4 bg-slate-800/60 border-b border-slate-700/70 space-y-3 text-xs animate-in fade-in duration-150">
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

                {/* Poster Preview Content */}
                <div className="p-6 text-center space-y-4">
                    <div className="space-y-1.5">
                        <span className="inline-block text-[11px] uppercase font-bold tracking-widest text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                            Faculty of Information Technology
                        </span>
                        
                        {/* Main Header (Customizable) */}
                        <h2 className="text-xl sm:text-2xl font-bold font-khmer text-white pt-1 leading-snug px-2">
                            {headerText}
                        </h2>

                        {/* Subtext */}
                        {subText && (
                            <p className="text-xs text-slate-300 font-khmer leading-relaxed max-w-sm mx-auto px-2">
                                {subText}
                            </p>
                        )}
                    </div>

                    {/* QR Code Container */}
                    <div id="poster-qr-code-svg" className="inline-block p-4 rounded-2xl bg-white shadow-xl ring-4 ring-sky-500/20 mx-auto">
                        <QRCodeSVG
                            value={targetUrl}
                            size={220}
                            level="H"
                            includeMargin={false}
                        />
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                        <div className="font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 inline-block text-[11px] text-sky-400">
                            {targetUrl}
                        </div>
                        <p className="text-[11px] text-slate-400 font-khmer">
                            ស្វែងរកឈ្មោះ • ពិនិត្យប្រធានបទ និងពិន្ទុការពារសារណា • បញ្ជាក់ហត្ថលេខាផ្ទាល់
                        </p>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-800">
                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 transition-colors shadow-lg shadow-sky-500/20 cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>{isPrinting ? 'Preparing Poster...' : 'Print Sign-in Poster'}</span>
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

