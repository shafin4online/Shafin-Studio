import React from 'react';
import { 
  Sparkles, 
  Sun, 
  Check, 
  Lightbulb, 
  ArrowUpDown, 
  UserCheck, 
  Edit3 
} from 'lucide-react';
import { ENHANCEMENT_OPTIONS } from '../../data/presetsData';
import { MobileBottomSheetWrapper } from './MobileBottomSheetWrapper';

interface MobileEnhancementSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEnhancements: string[];
  onToggleEnhancement: (id: string) => void;
  customPrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
}

export const MobileEnhancementSheet: React.FC<MobileEnhancementSheetProps> = ({
  isOpen,
  onClose,
  selectedEnhancements,
  onToggleEnhancement,
  customPrompt,
  onChangeCustomPrompt
}) => {
  const isCustomActive = selectedEnhancements.includes('custom-instruction');

  const renderEnhancementIcon = (iconType: string, isSelected: boolean) => {
    const strokeColor = isSelected ? '#d97706' : '#64748b';

    switch (iconType) {
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;

      case 'smooth-face':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke={strokeColor} strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 10h.01M15 10h.01" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M8.5 15.5c1 .8 2.2 1.2 3.5 1.2s2.5-.4 3.5-1.2" strokeLinecap="round" />
            <path d="M9 7c1.5-.7 4.5-.7 6 0" strokeDasharray="1 2" />
          </svg>
        );

      case 'oil-drop':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke={strokeColor} strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 10h.01M15 10h.01" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 16c1.5.8 4.5.8 6 0" strokeLinecap="round" />
            <path d="M12 4v3" strokeLinecap="round" />
          </svg>
        );

      case 'sun-bright':
        return <Sun className="w-5 h-5 text-amber-500" />;

      case 'studio-light':
        return <Lightbulb className="w-5 h-5 text-amber-500" />;

      case 'head-straight':
        return <ArrowUpDown className="w-5 h-5 text-amber-500" />;

      case 'half-body':
        return <UserCheck className="w-5 h-5 text-amber-500" />;

      case 'preserve-mole':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke={strokeColor} strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 9.5h.01M15.5 9.5h.01" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 15c1.5.7 4.5.7 6 0" strokeLinecap="round" />
            <circle cx="16" cy="13.5" r="1.2" fill="#d97706" stroke="none" />
          </svg>
        );

      case 'nose-pin':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke={strokeColor} strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5l2 1" strokeLinecap="round" />
            <circle cx="15.5" cy="13.5" r="1.3" fill="#f59e0b" stroke="#d97706" strokeWidth="0.5" />
          </svg>
        );

      case 'lipstick':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke={strokeColor} strokeWidth="1.7">
            <path d="M9 22h6v-8H9v8z" strokeLinecap="round" />
            <path d="M10 14V9l4-3v8" fill="#fda4af" stroke="#e11d48" strokeWidth="1.2" />
          </svg>
        );

      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <MobileBottomSheetWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="অতিরিক্ত নির্দেশনা"
      subtitle="ছবি এডিটিং নির্দেশনা"
    >
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs space-y-3">
        {/* 5-column Enhancements Grid (Matches Screenshot 3) */}
        <div className="grid grid-cols-5 gap-2">
          {ENHANCEMENT_OPTIONS.map((item) => {
            const isSelected = selectedEnhancements.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleEnhancement(item.id)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center relative transition-all ${
                    isSelected
                      ? 'border-2 border-amber-500 bg-amber-50/15 shadow-xs'
                      : 'border border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  {renderEnhancementIcon(item.iconType, isSelected)}
                </div>

                <span
                  className={`text-[10px] font-semibold mt-1 text-center leading-tight line-clamp-2 px-0.5 ${
                    isSelected ? 'text-amber-700' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 11th item: কাস্টম নির্দেশনা (Custom instruction) */}
          <button
            type="button"
            onClick={() => onToggleEnhancement('custom-instruction')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div
              className={`w-full aspect-square rounded-xl flex items-center justify-center relative transition-all ${
                isCustomActive
                  ? 'border-2 border-amber-500 bg-amber-50/15 shadow-xs'
                  : 'border border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              {isCustomActive && (
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              <Edit3 className={`w-5 h-5 ${isCustomActive ? 'text-amber-500' : 'text-slate-500'}`} />
            </div>

            <span
              className={`text-[10px] font-semibold mt-1 text-center leading-tight line-clamp-2 px-0.5 ${
                isCustomActive ? 'text-amber-700' : 'text-slate-600'
              }`}
            >
              কাস্টম নির্দেশনা
            </span>
          </button>
        </div>

        {/* Expandable Custom Instruction Input */}
        {isCustomActive && (
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              কাস্টম নির্দেশনা লিখুন (ঐচ্ছিক):
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => onChangeCustomPrompt(e.target.value)}
              placeholder="যেমন: পটভূমি সামান্য ব্লার করুন বা ফরমাল লুক দিন..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-800 bg-slate-50/50 resize-none"
            />
          </div>
        )}
      </div>
    </MobileBottomSheetWrapper>
  );
};
