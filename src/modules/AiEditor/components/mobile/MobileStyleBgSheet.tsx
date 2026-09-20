import React, { useRef } from 'react';
import { Check, Palette, Ban, SlidersHorizontal } from 'lucide-react';
import { BgColorId, DressCustomization } from '../../types/aiEditorTypes';
import { DRESS_OPTIONS, BG_COLORS, DRESS_COLORS } from '../../data/presetsData';
import { MobileBottomSheetWrapper } from './MobileBottomSheetWrapper';

interface MobileStyleBgSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDressId: string;
  dressCustomization: DressCustomization;
  onSelectDress: (id: string) => void;
  onChangeDressCustomization: (updates: Partial<DressCustomization>) => void;
  selectedBg: BgColorId;
  customBgHex: string;
  onSelectBg: (id: BgColorId) => void;
  onCustomBgChange: (hex: string) => void;
}

export const MobileStyleBgSheet: React.FC<MobileStyleBgSheetProps> = ({
  isOpen,
  onClose,
  selectedDressId,
  dressCustomization,
  onSelectDress,
  onChangeDressCustomization,
  selectedBg,
  customBgHex,
  onSelectBg,
  onCustomBgChange
}) => {
  const customBgInputRef = useRef<HTMLInputElement>(null);
  const [showDressColorSettings, setShowDressColorSettings] = React.useState(false);

  const renderDressSvg = (iconType: string, isSelected: boolean) => {
    switch (iconType) {
      case 'none':
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400">
            <Ban className="w-6 h-6 stroke-[2]" />
          </div>
        );

      case 'white-shirt': {
        const bodyFill = isSelected ? dressCustomization.colorHex : '#f8fafc';
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M22 14 L12 24 L16 32 L20 28 L20 56 L44 56 L44 28 L48 32 L52 24 L42 14 Z" fill={bodyFill} stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M22 14 L32 24 L27 15 Z" fill={isSelected ? bodyFill : '#ffffff'} stroke="#94a3b8" strokeWidth="1.2" />
            <path d="M42 14 L32 24 L37 15 Z" fill={isSelected ? bodyFill : '#ffffff'} stroke="#94a3b8" strokeWidth="1.2" />
            {isSelected && dressCustomization.hasTie ? (
              <g>
                <polygon points="31,19 33,19 34,23 30,23" fill="#dc2626" />
                <polygon points="30,23 34,23 35,42 32,46 29,42" fill="#ef4444" />
              </g>
            ) : (
              <line x1="32" y1="24" x2="32" y2="54" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="1 5" />
            )}
          </svg>
        );
      }

      case 'dark-polo': {
        const bodyFill = isSelected ? dressCustomization.colorHex : '#1e293b';
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M20 16 L10 26 L15 32 L19 28 L19 54 L45 54 L45 28 L49 32 L54 26 L44 16 Z" fill={bodyFill} stroke="#0f172a" strokeWidth="1.5" />
            <path d="M22 16 L32 24 L26 18 Z" fill="#0f172a" />
            <path d="M42 16 L32 24 L38 18 Z" fill="#0f172a" />
            <rect x="30" y="24" width="4" height="12" fill="#334155" rx="1" />
          </svg>
        );
      }

      case 'suit-red-tie':
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M18 16 L8 28 L14 34 L18 28 L18 56 L46 56 L46 28 L50 34 L56 28 L46 16 Z" fill="#1e2538" stroke="#111827" strokeWidth="1.5" />
            <polygon points="24,16 40,16 32,38" fill="#f8fafc" />
            <polygon points="31,18 33,18 34,22 30,22" fill="#dc2626" />
            <polygon points="30,22 34,22 36,44 32,48 28,44" fill="#ef4444" />
            <path d="M20 16 L29 36 L24 40 Z" fill="#111827" />
            <path d="M44 16 L35 36 L40 40 Z" fill="#111827" />
          </svg>
        );

      case 'dark-suit':
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M18 16 L8 28 L14 34 L18 28 L18 56 L46 56 L46 28 L50 34 L56 28 L46 16 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="24,16 40,16 32,40" fill="#f1f5f9" />
            <path d="M19 16 L31 38 L22 42 Z" fill="#0f172a" />
            <path d="M45 16 L33 38 L42 42 Z" fill="#0f172a" />
          </svg>
        );

      case 'red-saree':
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M18 18 L12 28 L18 56 L46 56 L50 28 L44 18 Z" fill="#991b1b" />
            <path d="M18 20 Q32 36 46 56 L38 56 Q24 38 14 26 Z" fill="#b91c1c" />
            <path d="M18 20 Q32 36 46 56" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
          </svg>
        );

      case 'red-black-hijab':
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M20 14 C12 22 10 38 12 56 L52 56 C54 38 52 22 44 14 C38 8 26 8 20 14 Z" fill="#18181b" />
            <ellipse cx="32" cy="28" rx="8" ry="11" fill="#fde68a" />
            <path d="M16 42 Q32 48 48 42 L48 56 L16 56 Z" fill="#b91c1c" opacity="0.9" />
          </svg>
        );

      case 'white-panjabi':
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M22 14 L12 26 L16 32 L20 28 L20 58 L44 58 L44 28 L48 32 L52 26 L42 14 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M26 14 C26 12 38 12 38 14 L36 17 L28 17 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <rect x="30" y="16" width="4" height="24" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
          </svg>
        );

      case 'maroon-kurti':
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M22 16 L12 26 L16 32 L21 28 L18 56 L46 56 L43 28 L48 32 L52 26 L42 16 Z" fill="#881337" stroke="#4c0519" strokeWidth="1.2" />
            <polygon points="26,16 38,16 32,28" fill="#fda4af" />
          </svg>
        );

      case 'blue-tshirt':
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M22 16 L10 26 L15 32 L19 28 L19 54 L45 54 L45 28 L49 32 L54 26 L42 16 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.2" />
            <path d="M24 16 Q32 23 40 16" stroke="#60a5fa" strokeWidth="2" fill="none" />
          </svg>
        );

      case 'sky-hijab':
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M20 14 C12 22 10 38 12 56 L52 56 C54 38 52 22 44 14 C38 8 26 8 20 14 Z" fill="#38bdf8" />
            <ellipse cx="32" cy="28" rx="8" ry="11" fill="#fed7aa" />
          </svg>
        );

      case 'black-hijab':
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M20 14 C12 22 10 38 12 56 L52 56 C54 38 52 22 44 14 C38 8 26 8 20 14 Z" fill="#18181b" />
            <ellipse cx="32" cy="28" rx="8" ry="11" fill="#fed7aa" />
          </svg>
        );

      case 'purple-salwar':
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M22 16 L12 26 L16 32 L21 28 L19 56 L45 56 L43 28 L48 32 L52 26 L42 16 Z" fill="#7e22ce" />
            <polygon points="26,16 38,16 32,28" fill="#f3e8ff" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 64 64" className="w-8 h-8 drop-shadow-2xs">
            <path d="M22 14 L12 24 L16 32 L20 28 L20 56 L44 56 L44 28 L48 32 L52 24 L42 14 Z" fill="#0284c7" />
          </svg>
        );
    }
  };

  return (
    <MobileBottomSheetWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="স্টাইল ও ব্যাকগ্রাউন্ড"
      subtitle="পোশাক ও পটভূমি বেছে নিন"
    >
      {/* 1. পোশাক স্টাইল (Exact recreation of Screenshot 2) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-700">পোশাক স্টাইল</h3>
          {selectedDressId !== 'none' && (
            <button
              type="button"
              onClick={() => setShowDressColorSettings(!showDressColorSettings)}
              className="text-[11px] font-semibold text-amber-600 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>কালার ও কাস্টমাইজ</span>
            </button>
          )}
        </div>

        {/* 5-column Dress Grid */}
        <div className="grid grid-cols-5 gap-2">
          {DRESS_OPTIONS.slice(0, 15).map((dress) => {
            const isSelected = selectedDressId === dress.id;
            return (
              <button
                key={dress.id}
                type="button"
                onClick={() => onSelectDress(dress.id)}
                title={dress.title}
                className={`relative aspect-square rounded-xl flex items-center justify-center p-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 border-amber-500 bg-amber-50/10 shadow-xs'
                    : 'border border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {/* Active Checkmark Badge */}
                {isSelected && (
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}

                {renderDressSvg(dress.iconType, isSelected)}
              </button>
            );
          })}
        </div>

        {/* Expandable Dress Customization Drawer for Shirts */}
        {showDressColorSettings && selectedDressId !== 'none' && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 block">পোশাকের রঙ:</span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {DRESS_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChangeDressCustomization({ colorHex: c.hex, colorLabel: c.label })}
                  className={`w-6 h-6 rounded-md border transition-transform ${
                    dressCustomization.colorHex === c.hex
                      ? 'ring-2 ring-amber-500 ring-offset-1 scale-110'
                      : 'border-slate-200'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. ব্যাকগ্রাউন্ড (Exact recreation of Screenshot 2) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 mb-3">ব্যাকগ্রাউন্ড</h3>

        {/* Color swatches row/grid */}
        <div className="grid grid-cols-8 gap-2">
          {BG_COLORS.map((color) => {
            const isSelected = selectedBg === color.id;

            if (color.isCustomPicker) {
              return (
                <div key={color.id} className="relative">
                  <input
                    ref={customBgInputRef}
                    type="color"
                    value={customBgHex}
                    onChange={(e) => {
                      onCustomBgChange(e.target.value);
                      onSelectBg('custom');
                    }}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBg('custom');
                      customBgInputRef.current?.click();
                    }}
                    title="কাস্টম রঙ নির্বাচন"
                    className={`w-full aspect-square rounded-xl bg-black flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected ? 'border-2 border-amber-500 shadow-xs' : 'border border-slate-800'
                    }`}
                  >
                    <Palette className="w-4 h-4 text-white" />
                    {isSelected && (
                      <span className="absolute bottom-1 right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center text-white">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </span>
                    )}
                  </button>
                </div>
              );
            }

            return (
              <button
                key={color.id}
                type="button"
                onClick={() => onSelectBg(color.id)}
                title={color.label}
                className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer relative border ${
                  isSelected
                    ? 'border-2 border-amber-500 shadow-xs scale-102'
                    : 'border-slate-200'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </MobileBottomSheetWrapper>
  );
};
