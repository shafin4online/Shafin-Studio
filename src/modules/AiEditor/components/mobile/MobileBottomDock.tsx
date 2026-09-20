import React from 'react';
import { 
  UserRound, 
  Scissors, 
  RotateCw, 
  SlidersHorizontal, 
  Crop, 
  Loader2, 
  Check 
} from 'lucide-react';
import { PhotoSizeId, BgColorId } from '../../types/aiEditorTypes';
import { PHOTO_SIZES, BG_COLORS } from '../../data/presetsData';

interface MobileBottomDockProps {
  selectedSize: PhotoSizeId;
  selectedDressId: string;
  selectedBg: BgColorId;
  customBgHex: string;
  selectedEnhancements: string[];
  isProcessing: boolean;
  hasInputImage: boolean;
  onOpenSizeSheet: () => void;
  onOpenStyleBgSheet: () => void;
  onOpenEnhancementSheet: () => void;
  onGenerate: () => void;
  onBackToStudio?: () => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  selectedSize,
  selectedBg,
  customBgHex,
  selectedEnhancements,
  isProcessing,
  hasInputImage,
  onOpenSizeSheet,
  onOpenStyleBgSheet,
  onOpenEnhancementSheet,
  onGenerate,
}) => {
  const currentSizeObj = PHOTO_SIZES.find((s) => s.id === selectedSize);
  const currentBgObj = BG_COLORS.find((b) => b.id === selectedBg);
  const bgHex = selectedBg === 'custom' ? customBgHex : (currentBgObj?.hex || '#ffffff');
  const enhancementCount = selectedEnhancements.length;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#0c101d]/95 backdrop-blur-md border-t border-slate-800/80 shadow-2xl px-2 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] select-none">
      <div className="max-w-md mx-auto flex items-center justify-around gap-1 relative">
        {/* Tab 1: পোশাক (User / Dress) */}
        <button
          type="button"
          onClick={onOpenStyleBgSheet}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <UserRound className="w-5 h-5 text-slate-300" />
          <span className="text-[9px] font-medium mt-1 text-slate-400">পোশাক</span>
        </button>

        {/* Tab 2: পটভূমি (Scissors / BG) with check badge */}
        <button
          type="button"
          onClick={onOpenStyleBgSheet}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <div className="relative">
            <Scissors className="w-5 h-5 text-slate-300" />
            <span
              className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full border border-slate-900 flex items-center justify-center text-[7px] text-white font-bold shadow-xs bg-amber-500"
              style={{ backgroundColor: bgHex !== '#ffffff' ? bgHex : '#f59e0b' }}
            >
              <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
            </span>
          </div>
          <span className="text-[9px] font-medium mt-1 text-slate-400">পটভূমি</span>
        </button>

        {/* Center Tab 3: Elevated Orange/Amber Circular Button */}
        <div className="flex-1 flex flex-col items-center justify-center relative -mt-5">
          <button
            type="button"
            disabled={!hasInputImage || isProcessing}
            onClick={onGenerate}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer active:scale-95 border-2 border-[#0c101d] ${
              !hasInputImage
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                : isProcessing
                ? 'bg-amber-600 text-white cursor-wait animate-pulse'
                : 'bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 text-white shadow-amber-500/30 hover:scale-105'
            }`}
            title="ছবি তৈরি করুন"
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <RotateCw className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Tab 4: ফিল্টার / নির্দেশনা (Sliders) */}
        <button
          type="button"
          onClick={onOpenEnhancementSheet}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <div className="relative">
            <SlidersHorizontal className="w-5 h-5 text-slate-300" />
            {enhancementCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3 h-3 bg-amber-500 text-slate-950 text-[8px] font-bold rounded-full flex items-center justify-center">
                {enhancementCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium mt-1 text-slate-400">ফিল্টার</span>
        </button>

        {/* Tab 5: সাইজ (Crop / Size) */}
        <button
          type="button"
          onClick={onOpenSizeSheet}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <div className="relative">
            <Crop className="w-5 h-5 text-slate-300" />
            <span className="absolute -top-1 -right-2 text-[7px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded-full leading-none">
              {currentSizeObj?.id === 'passport' ? 'PP' : currentSizeObj?.label?.slice(0, 3) || 'size'}
            </span>
          </div>
          <span className="text-[9px] font-medium mt-1 text-slate-400">সাইজ</span>
        </button>
      </div>
    </div>
  );
};
