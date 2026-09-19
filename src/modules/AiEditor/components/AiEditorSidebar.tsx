import React, { useState } from 'react';
import { Wand2, ChevronDown, ChevronUp, MessageSquare, Server } from 'lucide-react';
import { PhotoSizeId, BgColorId, DressCustomization } from '../types/aiEditorTypes';
import { PhotoSizeSelector } from './PhotoSizeSelector';
import { BackgroundSelector } from './BackgroundSelector';
import { DressGrid } from './DressGrid';
import { EnhancementGrid } from './EnhancementGrid';

interface AiEditorSidebarProps {
  selectedSize: PhotoSizeId;
  selectedBg: BgColorId;
  customBgHex: string;
  selectedDressId: string;
  dressCustomization: DressCustomization;
  // Dual mode support
  isDualMode?: boolean;
  leftDressId?: string;
  leftDressCustomization?: DressCustomization;
  onSelectLeftDress?: (id: string) => void;
  onChangeLeftDressCustomization?: (customization: Partial<DressCustomization>) => void;
  rightDressId?: string;
  rightDressCustomization?: DressCustomization;
  onSelectRightDress?: (id: string) => void;
  onChangeRightDressCustomization?: (customization: Partial<DressCustomization>) => void;
  selectedEnhancements: string[];
  customInstruction: string;
  isGenerating?: boolean;
  onSelectSize: (id: PhotoSizeId) => void;
  onResetSize: () => void;
  onSelectBg: (id: BgColorId) => void;
  onCustomBgChange: (hex: string) => void;
  onSelectDress: (id: string) => void;
  onChangeDressCustomization: (customization: Partial<DressCustomization>) => void;
  onToggleEnhancement: (id: string) => void;
  onCustomInstructionChange: (text: string) => void;
  onGeneratePhoto: () => void;
  onOpenApiManager?: () => void;
}

export const AiEditorSidebar: React.FC<AiEditorSidebarProps> = ({
  selectedSize,
  selectedBg,
  customBgHex,
  selectedDressId,
  dressCustomization,
  isDualMode = false,
  leftDressId,
  leftDressCustomization,
  onSelectLeftDress,
  onChangeLeftDressCustomization,
  rightDressId,
  rightDressCustomization,
  onSelectRightDress,
  onChangeRightDressCustomization,
  selectedEnhancements,
  customInstruction,
  isGenerating = false,
  onSelectSize,
  onResetSize,
  onSelectBg,
  onCustomBgChange,
  onSelectDress,
  onChangeDressCustomization,
  onToggleEnhancement,
  onCustomInstructionChange,
  onGeneratePhoto,
  onOpenApiManager
}) => {
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  return (
    <aside className="w-full lg:w-[350px] xl:w-[380px] bg-white border-r border-slate-200/80 flex flex-col h-full overflow-hidden shadow-xs">
      {/* Top Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">ছবি তৈরির সেটিংস</h2>
        </div>
        {onOpenApiManager && (
          <button
            type="button"
            onClick={onOpenApiManager}
            title="AI API Pool Manager"
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Server className="w-3.5 h-3.5 text-amber-500" />
            <span>API পুল</span>
          </button>
        )}
      </div>

      {/* Scrollable controls body */}
      <div className="flex-1 overflow-y-auto studio-scrollbar px-4 py-3 space-y-4">
        {/* 1. Photo Size */}
        <PhotoSizeSelector
          selectedSize={selectedSize}
          onSelectSize={onSelectSize}
          onReset={onResetSize}
        />

        {/* 2. Background Selector */}
        <BackgroundSelector
          selectedBg={selectedBg}
          customHex={customBgHex}
          onSelectBg={onSelectBg}
          onCustomColorChange={onCustomBgChange}
        />

        {/* 3. Dress Style */}
        <DressGrid
          isDualMode={isDualMode}
          selectedDressId={selectedDressId}
          dressCustomization={dressCustomization}
          onSelectDress={onSelectDress}
          onChangeCustomization={onChangeDressCustomization}
          leftDressId={leftDressId}
          leftDressCustomization={leftDressCustomization}
          onSelectLeftDress={onSelectLeftDress}
          onChangeLeftCustomization={onChangeLeftDressCustomization}
          rightDressId={rightDressId}
          rightDressCustomization={rightDressCustomization}
          onSelectRightDress={onSelectRightDress}
          onChangeRightCustomization={onChangeRightDressCustomization}
        />

        {/* 4. Additional Enhancements */}
        <EnhancementGrid
          selectedEnhancements={selectedEnhancements}
          onToggleEnhancement={onToggleEnhancement}
        />

        {/* 5. Optional Custom Instruction Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowCustomPrompt(!showCustomPrompt)}
            className="w-full flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-700 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              কাস্টম প্রম্পট বা অতিরিক্ত নির্দেশ (ঐচ্ছিক)
            </span>
            {showCustomPrompt ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showCustomPrompt && (
            <div className="mt-1.5">
              <textarea
                value={customInstruction}
                onChange={(e) => onCustomInstructionChange(e.target.value)}
                placeholder="যেমন: নীল টাই পরাবেন, অথবা ডান চোখে চশমা রাখবেন..."
                rows={2}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50/50 text-slate-700 resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Button */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0">
        <button
          type="button"
          onClick={onGeneratePhoto}
          disabled={isGenerating}
          className="w-full h-11 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none active:scale-[0.99]"
        >
          <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'প্রসেসিং হচ্ছে...' : 'ফটো জেনারেট করুন'}</span>
        </button>
      </div>
    </aside>
  );
};
