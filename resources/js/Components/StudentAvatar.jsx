import React, { useState } from 'react';
import { User, ShieldCheck } from 'lucide-react';

export default function StudentAvatar({
    student,
    size = 'md',
    className = '',
    showBadge = false,
    zoomable = false,
    onZoom = null
}) {
    const [imgError, setImgError] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [useRemoteFallback, setUseRemoteFallback] = useState(false);

    if (!student) return null;

    // UMS student photo format: 8-digit zero-padded student ID
    const studentIdCode = student.student_id_formatted || String(student.student_id || '').padStart(8, '0');
    
    // Priority: Local downloaded & compressed image (works outside internal network)
    // Fallback: Remote UMS URL if local file is missing
    const localPhotoUrl = `/images/students/${studentIdCode}.jpg`;
    const remotePhotoUrl = `https://ums.beltei.edu.kh/storage/uploads/images/students/${studentIdCode}.jpg`;
    const photoUrl = useRemoteFallback ? remotePhotoUrl : localPhotoUrl;

    const handleImgError = () => {
        if (!useRemoteFallback) {
            setUseRemoteFallback(true);
            setImgLoaded(false);
        } else {
            setImgError(true);
        }
    };

    const sizeClasses = {
        sm: 'w-10 h-10 rounded-xl text-xs',
        md: 'w-14 h-16 sm:w-16 sm:h-20 rounded-2xl text-sm shadow-sm',
        lg: 'w-20 h-26 sm:w-24 sm:h-30 rounded-2xl text-base shadow-md',
        xl: 'w-28 h-36 rounded-2xl text-xl shadow-lg',
    };

    const isFemale = student.sex === 'F';
    const initial = student.name_latin ? student.name_latin.charAt(0).toUpperCase() : 'S';

    const fallbackBg = isFemale
        ? 'bg-rose-50 text-rose-600 border border-rose-200'
        : 'bg-[#C1AA3F]/15 text-[#88742b] border border-[#C1AA3F]/30';

    return (
        <div
            className={`relative shrink-0 overflow-hidden select-none bg-slate-100 border border-slate-200 shadow-sm group ${sizeClasses[size] || sizeClasses.md} ${className} ${
                zoomable ? 'cursor-pointer' : ''
            }`}
            onClick={zoomable && onZoom ? () => onZoom(photoUrl, student) : undefined}
            title={zoomable ? 'Click to inspect photo' : `${student.name_latin} (${studentIdCode})`}
        >
            {!imgError ? (
                <>
                    {/* Placeholder skeleton while loading */}
                    {!imgLoaded && (
                        <div className={`absolute inset-0 flex items-center justify-center font-bold font-display animate-pulse ${fallbackBg}`}>
                            <span>{initial}</span>
                        </div>
                    )}
                    <img
                        key={photoUrl}
                        src={photoUrl}
                        alt={`${student.name_latin}`}
                        loading="lazy"
                        onLoad={() => setImgLoaded(true)}
                        onError={handleImgError}
                        className={`w-full h-full object-cover transition-all duration-300 ${
                            imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        } ${zoomable ? 'group-hover:scale-105' : ''}`}
                    />
                </>
            ) : (
                <div className={`w-full h-full flex flex-col items-center justify-center font-bold font-display ${fallbackBg}`}>
                    <span>{initial}</span>
                    <span className="text-[9px] font-sans font-semibold tracking-wider opacity-70">BELTEI</span>
                </div>
            )}

            {/* UMS Verified Pill at the bottom */}
            {showBadge && (
                <div className="absolute bottom-0 inset-x-0 bg-[#1c4482]/95 backdrop-blur-sm text-[8px] sm:text-[9px] text-center font-mono py-0.5 font-bold text-white tracking-wider uppercase">
                    UMS
                </div>
            )}
        </div>
    );
}
