import React, { useState } from 'react';
import { Ban, Check, Settings2 } from 'lucide-react';
import { DRESS_OPTIONS } from '../data/presetsData';
import { DressCustomization } from '../types/aiEditorTypes';
import { DressColorPopover } from './DressColorPopover';

interface DressGridProps {
  isDualMode?: boolean;
  selectedDressId: string;
  dressCustomization: DressCustomization;
  onSelectDress: (id: string) => void;
  onChangeCustomization: (customization: Partial<DressCustomization>) => void;
  // Dual mode specific
  leftDressId?: string;
  leftDressCustomization?: DressCustomization;
  onSelectLeftDress?: (id: string) => void;
  onChangeLeftCustomization?: (customization: Partial<DressCustomization>) => void;
  rightDressId?: string;
  rightDressCustomization?: DressCustomization;
  onSelectRightDress?: (id: string) => void;
  onChangeRightCustomization?: (customization: Partial<DressCustomization>) => void;
}

export const DressGrid: React.FC<DressGridProps> = ({
  isDualMode = false,
  selectedDressId,
  dressCustomization,
  onSelectDress,
  onChangeCustomization,
  leftDressId = 'none',
  leftDressCustomization = dressCustomization,
  onSelectLeftDress,
  onChangeLeftCustomization,
  rightDressId = 'none',
  rightDressCustomization = dressCustomization,
  onSelectRightDress,
  onChangeRightCustomization,
}) => {
  const [activePopover, setActivePopover] = useState<'single' | 'left' | 'right' | null>(null);

  const renderDressSvg = (iconType: string, isSelected: boolean, customization: DressCustomization = dressCustomization) => {
    switch (iconType) {
      case 'none':
        return (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-amber-500">
            <Ban className="w-6 h-6 stroke-[2.2]" />
          </div>
        );

      case 'white-shirt': {
        const bodyFill = isSelected ? customization.colorHex : '#f8fafc';
        const isLight = isSelected 
          ? ['#ffffff', '#fdd835', '#d7ccc8', '#ffa000'].includes(customization.colorHex.toLowerCase())
          : true;
        const gridStroke = isLight ? '#94a3b8' : 'rgba(255,255,255,0.7)';

        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            {/* Shirt body */}
            <path d="M22 14 L12 24 L16 32 L20 28 L20 56 L44 56 L44 28 L48 32 L52 24 L42 14 Z" fill={bodyFill} stroke="#cbd5e1" strokeWidth="1.5" />
            
            {/* Check grid pattern if active and selected */}
            {isSelected && customization.isCheckPattern && (
              <g opacity="0.65">
                <line x1="20" y1="35" x2="44" y2="35" stroke={gridStroke} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
                <line x1="20" y1="42" x2="44" y2="42" stroke={gridStroke} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
                <line x1="20" y1="49" x2="44" y2="49" stroke={gridStroke} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
                <line x1="26" y1="26" x2="26" y2="56" stroke={gridStroke} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
                <line x1="38" y1="26" x2="38" y2="56" stroke={gridStroke} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
              </g>
            )}

            {/* Collar */}
            <path d="M22 14 L32 24 L27 15 Z" fill={isSelected ? bodyFill : '#ffffff'} stroke="#94a3b8" strokeWidth="1.2" />
            <path d="M42 14 L32 24 L37 15 Z" fill={isSelected ? bodyFill : '#ffffff'} stroke="#94a3b8" strokeWidth="1.2" />
            
            {/* Dynamic Tie or Buttons */}
            {isSelected && customization.hasTie ? (
              <g>
                <polygon points="31,19 33,19 34,23 30,23" fill="#dc2626" />
                <polygon points="30,23 34,23 35,42 32,46 29,42" fill="#ef4444" />
              </g>
            ) : (
              <line x1="32" y1="24" x2="32" y2="54" stroke={isLight ? '#94a3b8' : 'rgba(255,255,255,0.7)'} strokeWidth="1.2" strokeDasharray="1 5" />
            )}
          </svg>
        );
      }

      case 'dark-polo': {
        const bodyFill = isSelected ? customization.colorHex : '#1e293b';
        const isLight = isSelected 
          ? ['#ffffff', '#fdd835', '#d7ccc8', '#ffa000'].includes(customization.colorHex.toLowerCase())
          : false;
        const gridStroke = isLight ? '#94a3b8' : 'rgba(255,255,255,0.7)';

        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            <path d="M20 16 L10 26 L15 32 L19 28 L19 54 L45 54 L45 28 L49 32 L54 26 L44 16 Z" fill={bodyFill} stroke={isLight ? '#cbd5e1' : '#0f172a'} strokeWidth="1.5" />
            {isSelected && customization.isCheckPattern && (
              <g opacity="0.65">
                <line x1="19" y1="36" x2="45" y2="36" stroke={gridStroke} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
                <line x1="19" y1="44" x2="45" y2="44" stroke={gridStroke} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
                <line x1="26" y1="28" x2="26" y2="54" stroke={gridStroke} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
                <line x1="38" y1="28" x2="38" y2="54" stroke={gridStroke} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
              </g>
            )}
            <path d="M22 16 L32 24 L26 18 Z" fill={isLight ? '#cbd5e1' : '#0f172a'} />
            <path d="M42 16 L32 24 L38 18 Z" fill={isLight ? '#cbd5e1' : '#0f172a'} />
            <rect x="30" y="24" width="4" height="12" fill={isLight ? '#94a3b8' : '#334155'} rx="1" />
          </svg>
        );
      }

      case 'suit-red-tie':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            {/* Suit jacket */}
            <path d="M18 16 L8 28 L14 34 L18 28 L18 56 L46 56 L46 28 L50 34 L56 28 L46 16 Z" fill="#1e2538" stroke="#111827" strokeWidth="1.5" />
            {/* White shirt inner V */}
            <polygon points="24,16 40,16 32,38" fill="#f8fafc" />
            {/* Red necktie */}
            <polygon points="31,18 33,18 34,22 30,22" fill="#dc2626" />
            <polygon points="30,22 34,22 36,44 32,48 28,44" fill="#ef4444" />
            {/* Lapels */}
            <path d="M20 16 L29 36 L24 40 Z" fill="#111827" />
            <path d="M44 16 L35 36 L40 40 Z" fill="#111827" />
          </svg>
        );

      case 'dark-suit':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            <path d="M18 16 L8 28 L14 34 L18 28 L18 56 L46 56 L46 28 L50 34 L56 28 L46 16 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="24,16 40,16 32,40" fill="#f1f5f9" />
            <path d="M19 16 L31 38 L22 42 Z" fill="#0f172a" />
            <path d="M45 16 L33 38 L42 42 Z" fill="#0f172a" />
          </svg>
        );

      case 'red-saree':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            {/* Saree drape & blouse */}
            <path d="M18 18 L12 28 L18 56 L46 56 L50 28 L44 18 Z" fill="#991b1b" />
            <path d="M18 20 Q32 36 46 56 L38 56 Q24 38 14 26 Z" fill="#b91c1c" />
            {/* Golden Zari Border */}
            <path d="M18 20 Q32 36 46 56" stroke="#fbbf24" strokeWidth="3" fill="none" />
            <path d="M22 18 Q32 30 42 18" stroke="#fef08a" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'red-black-hijab':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            {/* Hijab wrap */}
            <path d="M20 14 C12 22 10 38 12 56 L52 56 C54 38 52 22 44 14 C38 8 26 8 20 14 Z" fill="#18181b" />
            {/* Inner face opening */}
            <ellipse cx="32" cy="28" rx="9" ry="12" fill="#fde68a" />
            {/* Red accents */}
            <path d="M16 42 Q32 48 48 42 L48 56 L16 56 Z" fill="#b91c1c" opacity="0.85" />
          </svg>
        );

      case 'white-panjabi':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            <path d="M22 14 L12 26 L16 32 L20 28 L20 58 L44 58 L44 28 L48 32 L52 26 L42 14 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Mandarin Collar */}
            <path d="M26 14 C26 12 38 12 38 14 L36 17 L28 17 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            {/* Placket with stitches */}
            <rect x="30" y="16" width="4" height="24" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="32" cy="22" r="1" fill="#64748b" />
            <circle cx="32" cy="28" r="1" fill="#64748b" />
            <circle cx="32" cy="34" r="1" fill="#64748b" />
          </svg>
        );

      case 'maroon-kurti':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            <path d="M22 16 L12 26 L16 32 L21 28 L18 56 L46 56 L43 28 L48 32 L52 26 L42 16 Z" fill="#881337" stroke="#4c0519" strokeWidth="1.2" />
            <polygon points="26,16 38,16 32,28" fill="#fda4af" />
            <path d="M28 16 Q32 24 36 16" stroke="#fbcfe8" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'blue-tshirt':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            <path d="M22 16 L10 26 L15 32 L19 28 L19 54 L45 54 L45 28 L49 32 L54 26 L42 16 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.2" />
            <path d="M24 16 Q32 23 40 16" stroke="#60a5fa" strokeWidth="2" fill="none" />
          </svg>
        );

      case 'sky-hijab':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            <path d="M20 14 C12 22 10 38 12 56 L52 56 C54 38 52 22 44 14 C38 8 26 8 20 14 Z" fill="#38bdf8" />
            <ellipse cx="32" cy="28" rx="9" ry="12" fill="#fed7aa" />
            <path d="M14 44 Q32 50 50 44" stroke="#bae6fd" strokeWidth="2" fill="none" />
          </svg>
        );

      case 'black-hijab':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            <path d="M20 14 C12 22 10 38 12 56 L52 56 C54 38 52 22 44 14 C38 8 26 8 20 14 Z" fill="#18181b" />
            <ellipse cx="32" cy="28" rx="9" ry="12" fill="#fed7aa" />
          </svg>
        );

      case 'purple-salwar':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            <path d="M22 16 L12 26 L16 32 L21 28 L19 56 L45 56 L43 28 L48 32 L52 26 L42 16 Z" fill="#7e22ce" />
            {/* White / silver floral neck yoke */}
            <polygon points="26,16 38,16 32,28" fill="#f3e8ff" />
            <path d="M20 20 Q32 38 42 56" stroke="#e9d5ff" strokeWidth="2" fill="none" />
          </svg>
        );

      case 'blue-shirt':
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            <path d="M22 14 L12 24 L16 32 L20 28 L20 56 L44 56 L44 28 L48 32 L52 24 L42 14 Z" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1.2" />
            <path d="M22 14 L32 23 L27 15 Z" fill="#2563eb" />
            <path d="M42 14 L32 23 L37 15 Z" fill="#2563eb" />
          </svg>
        );

      case 'sky-shirt':
      default:
        return (
          <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-xs">
            <path d="M22 14 L12 24 L16 32 L20 28 L20 56 L44 56 L44 28 L48 32 L52 24 L42 14 Z" fill="#93c5fd" stroke="#60a5fa" strokeWidth="1.2" />
            <path d="M22 14 L32 23 L27 15 Z" fill="#bfdbfe" />
            <path d="M42 14 L32 23 L37 15 Z" fill="#bfdbfe" />
          </svg>
        );
    }
  };

  const renderPersonGrid = (
    personKey: 'single' | 'left' | 'right',
    label: string,
    currDressId: string,
    currCustomization: DressCustomization,
    onSelect: ((id: string) => void) | undefined,
    onChangeCust: ((c: Partial<DressCustomization>) => void) | undefined
  ) => {
    const isPopoverOpen = activePopover === personKey;
    const selectedDress = DRESS_OPTIONS.find(d => d.id === currDressId) || DRESS_OPTIONS[0];

    const handleGridItemClick = (dressId: string) => {
      if (!onSelect) return;
      if (dressId === 'none') {
        onSelect('none');
        if (activePopover === personKey) setActivePopover(null);
        return;
      }

      if (currDressId === dressId) {
        setActivePopover(prev => (prev === personKey ? null : personKey));
      } else {
        onSelect(dressId);
        setActivePopover(personKey);
      }
    };

    return (
      <div className="space-y-1.5 relative">
        {label && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700">{label}</span>
            {currDressId !== 'none' && (
              <span className="text-[10px] text-amber-600 font-medium">
                {selectedDress.title}
              </span>
            )}
          </div>
        )}

        {/* 5-column clothing grid */}
        <div className="grid grid-cols-5 gap-1.5 relative">
          {DRESS_OPTIONS.map((dress) => {
            const isSelected = currDressId === dress.id;
            return (
              <button
                key={dress.id}
                type="button"
                onClick={() => handleGridItemClick(dress.id)}
                title={dress.title}
                className={`relative aspect-square rounded-xl p-1 flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50/60 border-2 border-amber-500 shadow-sm'
                    : 'bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/90 hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-white/95 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs z-10">
                    {currCustomization.isCheckPattern ? (
                      <span className="text-[7.5px] font-bold text-amber-600 leading-none">চেক</span>
                    ) : (
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    )}
                  </span>
                )}
                {renderDressSvg(dress.iconType, isSelected, currCustomization)}
              </button>
            );
          })}

          {/* Floating color popover */}
          {isPopoverOpen && currDressId !== 'none' && (
            <>
              {/* Backdrop for outside click dismiss */}
              <div 
                className="fixed inset-0 z-20 cursor-default" 
                onClick={() => setActivePopover(null)} 
              />

              {/* Anchored popover */}
              <div className="absolute top-11 left-0 right-0 z-30">
                <DressColorPopover
                  dressTitle={selectedDress.title}
                  selectedColorHex={currCustomization.colorHex}
                  isCheckPattern={currCustomization.isCheckPattern}
                  hasTie={currCustomization.hasTie}
                  onSelectColor={(hex, colorLabel) => {
                    onChangeCust?.({ colorHex: hex, colorLabel });
                  }}
                  onToggleCheck={() => {
                    onChangeCust?.({ isCheckPattern: !currCustomization.isCheckPattern });
                  }}
                  onToggleTie={() => {
                    onChangeCust?.({ hasTie: !currCustomization.hasTie });
                  }}
                  onClose={() => setActivePopover(null)}
                />
              </div>
            </>
          )}
        </div>

        {/* Selected customization indicator badge when popover is closed */}
        {currDressId !== 'none' && !isPopoverOpen && (
          <div className="flex items-center justify-between px-2.5 py-1 bg-amber-50/50 border border-amber-200/60 rounded-lg text-[11px] text-amber-800">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span 
                className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0 overflow-hidden" 
                style={{ 
                  backgroundColor: currCustomization.colorHex,
                  ...(currCustomization.isCheckPattern ? {
                    backgroundImage: `
                      linear-gradient(to right, rgba(100, 116, 139, 0.45) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(100, 116, 139, 0.45) 1px, transparent 1px)
                    `,
                    backgroundSize: '3.5px 3.5px'
                  } : {})
                }} 
              />
              <span className="font-semibold truncate">{selectedDress.title}</span>
              <span className="text-slate-500 shrink-0">({currCustomization.colorLabel}</span>
              {currCustomization.isCheckPattern && <span className="text-amber-600 font-medium shrink-0">, চেক</span>}
              {currCustomization.hasTie && <span className="text-amber-600 font-medium shrink-0">, টাই</span>}
              <span className="text-slate-500 shrink-0">)</span>
            </div>

            <button
              type="button"
              onClick={() => setActivePopover(personKey)}
              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer shrink-0 ml-1"
            >
              রঙ বদলান
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2.5 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
          <h3 className="text-xs font-bold text-slate-800 tracking-tight">পোশাক স্টাইল</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">১৪/১৪</span>
          <button 
            type="button" 
            onClick={() => {
              if (isDualMode) {
                setActivePopover(prev => (prev ? null : 'left'));
              } else if (selectedDressId !== 'none') {
                setActivePopover(prev => (prev ? null : 'single'));
              }
            }}
            title="পোশাকের রঙ ও প্যাটার্ন নির্বাচন" 
            className={`p-1 rounded transition-colors cursor-pointer ${
              (isDualMode ? (leftDressId !== 'none' || rightDressId !== 'none') : selectedDressId !== 'none')
                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isDualMode ? (
        <div className="space-y-3">
          {/* Left person clothing grid */}
          {renderPersonGrid(
            'left',
            'বাম ব্যক্তি',
            leftDressId,
            leftDressCustomization,
            onSelectLeftDress,
            onChangeLeftCustomization
          )}

          {/* Right person clothing grid */}
          {renderPersonGrid(
            'right',
            'ডান ব্যক্তি',
            rightDressId,
            rightDressCustomization,
            onSelectRightDress,
            onChangeRightCustomization
          )}
        </div>
      ) : (
        /* Single person clothing grid */
        renderPersonGrid(
          'single',
          '',
          selectedDressId,
          dressCustomization,
          onSelectDress,
          onChangeCustomization
        )
      )}
    </div>
  );
};
