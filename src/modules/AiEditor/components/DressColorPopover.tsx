import React from 'react';
import { Check, X } from 'lucide-react';
import { DRESS_COLORS } from '../data/presetsData';

interface DressColorPopoverProps {
  dressTitle: string;
  selectedColorHex: string;
  isCheckPattern: boolean;
  hasTie: boolean;
  onSelectColor: (hex: string, label: string) => void;
  onToggleCheck: () => void;
  onToggleTie: () => void;
  onClose: () => void;
}

export const DressColorPopover: React.FC<DressColorPopoverProps> = ({
  dressTitle,
  selectedColorHex,
  isCheckPattern,
  hasTie,
  onSelectColor,
  onToggleCheck,
  onToggleTie,
  onClose
}) => {
  // Clean title helper: "শার্ট", "পোলো", "স্যুট", etc. exactly like screenshot "শার্ট — রঙ বেছে নিন"
  const getCleanTitle = (title: string) => {
    if (title.includes('শার্ট')) return 'শার্ট';
    if (title.includes('পোলো')) return 'পোলো';
    if (title.includes('স্যুট') || title.includes('ব্লেজার')) return 'স্যুট';
    if (title.includes('শাড়ি')) return 'শাড়ি';
    if (title.includes('পাঞ্জাবি')) return 'পাঞ্জাবি';
    if (title.includes('কুর্তি') || title.includes('কামিজ')) return 'কুর্তি';
    if (title.includes('হিজাব')) return 'হিজাব';
    if (title.includes('টি-শার্ট')) return 'টি-শার্ট';
    return title.replace('ফরমাল ', '').replace('ক্যাজুয়াল ', '').trim();
  };

  const shortTitle = getCleanTitle(dressTitle);

  return (
    <div className="relative w-full bg-white border-2 border-amber-500 rounded-2xl p-3.5 shadow-2xl select-none animate-in fade-in zoom-in-95 duration-150 z-30">
      {/* Header with Title and Toggle Pills */}
      <div className="flex items-center justify-between gap-1 pb-1">
        <div className="flex items-center">
          <span className="text-xs font-bold text-slate-800 tracking-tight whitespace-nowrap">
            {shortTitle} — রঙ বেছে নিন
          </span>
        </div>

        {/* Check & Tie toggles exactly like screenshot */}
        <div className="flex items-center gap-1.5">
          {/* Check Pattern Pill */}
          <button
            type="button"
            onClick={onToggleCheck}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
              isCheckPattern
                ? 'border-amber-500 bg-[#fff8eb] text-amber-600 font-semibold shadow-2xs'
                : 'border-slate-300 text-slate-700 hover:border-slate-400 bg-white'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded-[3.5px] border flex items-center justify-center text-[10px] transition-colors ${
              isCheckPattern
                ? 'border-amber-500 bg-amber-500 text-white'
                : 'border-slate-400 bg-white'
            }`}>
              {isCheckPattern && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
            </span>
            <span className="whitespace-nowrap">চেক শার্ট</span>
          </button>

          {/* Tie Pill */}
          <button
            type="button"
            onClick={onToggleTie}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
              hasTie
                ? 'border-amber-500 bg-[#fff8eb] text-amber-600 font-semibold shadow-2xs'
                : 'border-slate-300 text-slate-700 hover:border-slate-400 bg-white'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded-[3.5px] border flex items-center justify-center text-[10px] transition-colors ${
              hasTie
                ? 'border-amber-500 bg-amber-500 text-white'
                : 'border-slate-400 bg-white'
            }`}>
              {hasTie && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
            </span>
            <span className="whitespace-nowrap">টাই</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            title="পপআপ বন্ধ করুন"
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0 ml-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 20 Color Palette Grid matching the screenshot (6 columns) */}
      <div className="grid grid-cols-6 gap-2.5 pt-2.5">
        {DRESS_COLORS.map((color) => {
          const isSelected = selectedColorHex.toLowerCase() === color.hex.toLowerCase();
          
          // Compute check pattern grid style matching screenshot
          const getSwatchStyle = () => {
            if (!isCheckPattern) {
              return { backgroundColor: color.hex };
            }

            // High contrast grid lines
            const gridLineColor = color.isLight 
              ? 'rgba(71, 85, 105, 0.45)' 
              : 'rgba(255, 255, 255, 0.55)';

            return {
              backgroundColor: color.hex,
              backgroundImage: `
                linear-gradient(to right, ${gridLineColor} 1px, transparent 1px),
                linear-gradient(to bottom, ${gridLineColor} 1px, transparent 1px)
              `,
              backgroundSize: '6.5px 6.5px',
              backgroundPosition: 'center center'
            };
          };

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onSelectColor(color.hex, color.label)}
              title={`${color.label} ${isCheckPattern ? '(চেক শার্ট)' : ''}`}
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center transition-all duration-150 cursor-pointer relative overflow-hidden ${
                color.isLight ? 'border border-slate-200/90 shadow-2xs' : 'shadow-2xs'
              } ${
                isSelected
                  ? 'ring-2 ring-amber-500 ring-offset-2 scale-110 shadow-sm'
                  : 'hover:scale-110 active:scale-95'
              }`}
              style={getSwatchStyle()}
            >
              {isSelected && (
                <span className="w-4 h-4 rounded-full bg-black/75 backdrop-blur-[1px] flex items-center justify-center text-white shadow-xs z-10">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
