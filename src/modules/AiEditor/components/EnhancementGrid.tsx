import React from 'react';
import { 
  Sparkles, 
  Sun, 
  Settings2, 
  Check, 
  Lightbulb, 
  ArrowUpDown, 
  UserCheck, 
  Heart, 
  Smile, 
  Flame 
} from 'lucide-react';
import { ENHANCEMENT_OPTIONS } from '../data/presetsData';

interface EnhancementGridProps {
  selectedEnhancements: string[];
  onToggleEnhancement: (id: string) => void;
}

export const EnhancementGrid: React.FC<EnhancementGridProps> = ({
  selectedEnhancements,
  onToggleEnhancement
}) => {
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
            {/* Mole mark */}
            <circle cx="16" cy="13.5" r="1.2" fill="#d97706" stroke="none" />
          </svg>
        );

      case 'nose-pin':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke={strokeColor} strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            {/* Nose line */}
            <path d="M12 8v5l2 1" strokeLinecap="round" />
            {/* Nose pin sparkle */}
            <circle cx="15.5" cy="13.5" r="1.3" fill="#f59e0b" stroke="#d97706" strokeWidth="0.5" />
          </svg>
        );

      case 'lipstick':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke={strokeColor} strokeWidth="1.7">
            <path d="M9 22h6v-8H9v8z" strokeLinecap="round" />
            <path d="M10 14V9l4-3v8" fill="#fda4af" stroke="#e11d48" strokeWidth="1.2" />
            <path d="M9 18h6" />
          </svg>
        );

      default:
        return <Smile className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
          <h3 className="text-xs font-bold text-slate-800 tracking-tight">অতিরিক্ত নির্দেশনা</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">
            {selectedEnhancements.length}/২৫
          </span>
          <button 
            type="button" 
            title="নির্দেশনা কাস্টমাইজেশন" 
            className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of 10 enhancement cards (5 columns x 2 rows) */}
      <div className="grid grid-cols-5 gap-1.5">
        {ENHANCEMENT_OPTIONS.map((opt) => {
          const isSelected = selectedEnhancements.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => onToggleEnhancement(opt.id)}
              title={opt.description}
              className={`relative flex flex-col items-center justify-center p-1.5 min-h-[66px] rounded-xl transition-all duration-150 cursor-pointer text-center ${
                isSelected
                  ? 'bg-amber-50/70 border-2 border-amber-500 shadow-xs'
                  : 'bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/90 hover:border-slate-300'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs z-10">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              <div className="p-0.5 mb-1 flex items-center justify-center">
                {renderEnhancementIcon(opt.iconType, isSelected)}
              </div>
              <span className={`text-[9.5px] font-medium leading-tight line-clamp-1 ${
                isSelected ? 'text-amber-800 font-semibold' : 'text-slate-600'
              }`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
