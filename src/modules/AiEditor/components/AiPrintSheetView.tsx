import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  FileDown, 
  Printer, 
  Scissors, 
  Maximize2, 
  Square, 
  RotateCcw, 
  Grid, 
  ChevronDown, 
  ZoomIn, 
  ZoomOut, 
  Expand 
} from 'lucide-react';

export interface PrintPhotoItem {
  id: string;
  type: 'passport' | 'stamp' | '2r' | '3r' | '4r' | '5r' | '6r' | '8r' | 'a4' | 'custom';
  name: string;
  widthMm: number;
  heightMm: number;
}

interface AiPrintSheetViewProps {
  imageSrc: string;
  onBack: () => void;
}

export const AiPrintSheetView: React.FC<AiPrintSheetViewProps> = ({
  imageSrc,
  onBack
}) => {
  // Page Settings
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | '4x6'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [gapMm, setGapMm] = useState<number>(3);
  
  // Options
  const [isFreeSize, setIsFreeSize] = useState(false);
  const [hasCuttingBorder, setHasCuttingBorder] = useState(false);
  const [hasPhotoBorder, setHasPhotoBorder] = useState(false);
  
  // Zoom
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Photos placed on sheet: initially 4 passport photos matching Screenshot 3
  const [items, setItems] = useState<PrintPhotoItem[]>([
    { id: '1', type: 'passport', name: 'পাসপোর্ট', widthMm: 45, heightMm: 55 },
    { id: '2', type: 'passport', name: 'পাসপোর্ট', widthMm: 45, heightMm: 55 },
    { id: '3', type: 'passport', name: 'পাসপোর্ট', widthMm: 45, heightMm: 55 },
    { id: '4', type: 'passport', name: 'পাসপোর্ট', widthMm: 45, heightMm: 55 },
  ]);

  const printSheetRef = useRef<HTMLDivElement>(null);

  // Paper Dimensions in mm
  const paperDimensions = {
    a4: { w: 210, h: 297 },
    letter: { w: 216, h: 279 },
    '4x6': { w: 102, h: 152 },
  };

  const currentPaper = paperDimensions[pageSize];
  const pageWidthMm = orientation === 'portrait' ? currentPaper.w : currentPaper.h;
  const pageHeightMm = orientation === 'portrait' ? currentPaper.h : currentPaper.w;

  // Quick Add Helpers
  const addPreset = (type: 'passport' | 'stamp', count: number) => {
    const presetConfig = type === 'passport' 
      ? { name: 'পাসপোর্ট', widthMm: 45, heightMm: 55 }
      : { name: 'স্ট্যাম্প', widthMm: 20, heightMm: 25 };

    const newPhotos: PrintPhotoItem[] = [];
    for (let i = 0; i < count; i++) {
      newPhotos.push({
        id: `${type}-${Date.now()}-${Math.random()}`,
        type,
        name: presetConfig.name,
        widthMm: presetConfig.widthMm,
        heightMm: presetConfig.heightMm
      });
    }
    setItems(prev => [...prev, ...newPhotos]);
  };

  const addRSize = (rType: '2r' | '3r' | '4r' | '5r' | '6r' | '8r' | 'a4') => {
    const rSizes: Record<string, { w: number; h: number; name: string }> = {
      '2r': { w: 64, h: 89, name: '২R' },
      '3r': { w: 89, h: 127, name: '৩R' },
      '4r': { w: 102, h: 152, name: '৪R' },
      '5r': { w: 127, h: 178, name: '৫R' },
      '6r': { w: 152, h: 203, name: '৬R' },
      '8r': { w: 203, h: 254, name: '৮R' },
      'a4': { w: 190, h: 270, name: 'A4' },
    };
    const conf = rSizes[rType];
    if (conf) {
      setItems(prev => [
        ...prev,
        {
          id: `${rType}-${Date.now()}`,
          type: rType,
          name: conf.name,
          widthMm: conf.w,
          heightMm: conf.h
        }
      ]);
    }
  };

  const handleClear = () => {
    setItems([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  // Convert mm to screen pixels: on mobile auto-scale to fit cleanly inside preview card
  const scaleMmToPx = isMobile ? 1.4 : 3.2 * (zoomPercent / 100);

  return (
    <div className="fixed inset-0 z-50 bg-[#0c101d] text-slate-100 flex flex-col h-screen w-screen overflow-hidden select-none">
      {/* Embedded print stylesheet for pristine A4 output matching Screenshot 4 */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-sheet-paper, #print-sheet-paper * {
            visibility: visible !important;
          }
          #print-sheet-paper {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 8mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* Top Header bar with Back button */}
      <header className="h-12 bg-[#0e1424] border-b border-slate-800 flex items-center justify-between px-3 md:px-4 shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-8 px-2.5 md:px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>এডিটরে ফিরুন</span>
          </button>
          <span className="text-xs font-bold text-slate-300 truncate">
            স্টুডিও প্রিন্ট শিট ইঞ্জিন
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            মোট ছবি: <strong className="text-amber-400">{items.length}</strong> টি
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* ========================================================================= */}
        {/* MOBILE VIEW (matches Screenshot 3: Top Paper Preview + Scrollable Table) */}
        {/* ========================================================================= */}
        <div className="md:hidden flex-1 flex flex-col overflow-hidden bg-[#0c101d]">
          {/* Top Live Sheet Preview (Screenshot 3 Top) */}
          <div className="h-[34vh] min-h-[220px] bg-[#1a2030] border-b border-slate-800 flex items-center justify-center p-3 overflow-auto">
            <div
              id="print-sheet-paper"
              ref={printSheetRef}
              style={{
                width: `${pageWidthMm * scaleMmToPx}px`,
                height: `${pageHeightMm * scaleMmToPx}px`,
                padding: `${6 * scaleMmToPx}px`,
              }}
              className="bg-white shadow-xl transition-all relative flex flex-wrap content-start select-none"
            >
              {items.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                  <Printer className="w-8 h-8 stroke-[1] mb-1 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">শিটে কোনো ছবি নেই</p>
                  <p className="text-[10px] text-slate-400">নিচে থেকে সাইজ যোগ করুন</p>
                </div>
              ) : (
                <div 
                  className="flex flex-wrap content-start w-full h-full"
                  style={{ gap: `${gapMm * scaleMmToPx}px` }}
                >
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        width: `${item.widthMm * scaleMmToPx}px`,
                        height: `${item.heightMm * scaleMmToPx}px`,
                      }}
                      className={`relative group bg-slate-100 overflow-hidden ${
                        hasPhotoBorder ? 'border border-slate-900' : ''
                      } ${
                        hasCuttingBorder ? 'outline outline-1 outline-dashed outline-slate-400' : ''
                      }`}
                    >
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="w-full h-full object-cover block"
                      />
                      {/* Delete individual item on touch */}
                      <button
                        type="button"
                        onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center cursor-pointer shadow-md print:hidden"
                        title="মুছুন"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Middle Controls (Screenshot 3 Middle) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-3 bg-[#0e1424]">
            {/* 1. Selected Photo Thumbnail */}
            <div className="flex justify-center">
              <div className="w-13 h-15 rounded-xl overflow-hidden border-2 border-amber-500 shadow-md bg-black relative">
                <img
                  src={imageSrc}
                  alt="Selected"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 2. দ্রুত যোগ করুন Header */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-200">দ্রুত যোগ করুন</span>
              <button
                type="button"
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                ফটো সাইজ সেটিং
              </button>
            </div>

            {/* পাসপোর্ট Row */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <div>
                <span className="text-xs font-bold text-white block">পাসপোর্ট</span>
                <span className="text-[10px] text-slate-400">৪৫×৫৫mm</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addPreset('passport', 1)}
                  className="w-9 h-8 rounded-lg bg-[#f59e0b] hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ১+
                </button>
                <button
                  type="button"
                  onClick={() => addPreset('passport', 4)}
                  className="w-9 h-8 rounded-lg bg-[#f59e0b] hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ৪+
                </button>
                <button
                  type="button"
                  onClick={() => addPreset('passport', 8)}
                  className="w-9 h-8 rounded-lg bg-[#f59e0b] hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ৮+
                </button>
              </div>
            </div>

            {/* স্ট্যাম্প Row */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <div>
                <span className="text-xs font-bold text-white block">স্ট্যাম্প</span>
                <span className="text-[10px] text-slate-400">২০×২৫mm</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addPreset('stamp', 1)}
                  className="w-9 h-8 rounded-lg bg-[#64748b] hover:bg-slate-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ১+
                </button>
                <button
                  type="button"
                  onClick={() => addPreset('stamp', 4)}
                  className="w-9 h-8 rounded-lg bg-[#64748b] hover:bg-slate-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ৪+
                </button>
                <button
                  type="button"
                  onClick={() => addPreset('stamp', 8)}
                  className="w-9 h-8 rounded-lg bg-[#64748b] hover:bg-slate-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ৮+
                </button>
              </div>
            </div>

            {/* R সাইজ Buttons */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs text-slate-200 font-bold mb-2">
                <span>R সাইজ</span>
                <span className="text-[10px] text-slate-400 font-normal">mm</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => addRSize('2r')}
                  className="h-8 rounded-lg bg-[#0284c7] hover:bg-sky-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ২R
                </button>
                <button
                  type="button"
                  onClick={() => addRSize('3r')}
                  className="h-8 rounded-lg bg-[#8b5cf6] hover:bg-purple-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ৩R
                </button>
                <button
                  type="button"
                  onClick={() => addRSize('4r')}
                  className="h-8 rounded-lg bg-[#ec4899] hover:bg-pink-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ৪R
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => addRSize('5r')}
                  className="h-8 rounded-lg bg-[#f97316] hover:bg-orange-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ৫R
                </button>
                <button
                  type="button"
                  onClick={() => addRSize('6r')}
                  className="h-8 rounded-lg bg-[#0d9488] hover:bg-teal-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  ৬R
                </button>
                <button
                  type="button"
                  onClick={() => addRSize('a4')}
                  className="h-8 rounded-lg bg-[#10b981] hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  A4
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions (Screenshot 3 Bottom) */}
          <div className="p-3 border-t border-slate-800 bg-[#0e1424] flex flex-col gap-2 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            {/* Row 1: Trash + PDF Download */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="w-11 h-10 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="সব ছবি মুছুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex-1 h-10 rounded-xl bg-[#fef3c7] hover:bg-amber-200 border border-amber-300/60 text-[#92400e] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <FileDown className="w-4 h-4 text-[#92400e]" />
                <span>পিডিএফ ডাউনলোড</span>
              </button>
            </div>

            {/* Row 2: Full-width Bright Green Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="w-full h-11 rounded-xl bg-[#10b981] hover:bg-emerald-600 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP VIEW (Two-column layout for wider screens) */}
        {/* ========================================================================= */}
        <aside className="hidden md:flex w-80 lg:w-88 bg-[#111726] border-r border-slate-800 flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-5">
            {/* 1. Selected Photo Thumbnail */}
            <div className="flex justify-center">
              <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-amber-500 shadow-md bg-black relative">
                <img
                  src={imageSrc}
                  alt="Selected"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 2. দ্রুত যোগ করুন */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-300">দ্রুত যোগ করুন</span>
                <span className="text-[11px] font-semibold text-amber-400">
                  ফটো সাইজ সেটিং
                </span>
              </div>

              {/* পাসপোর্ট */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-white block">পাসপোর্ট</span>
                  <span className="text-[10px] text-slate-400">৪৫×৫৫mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => addPreset('passport', 1)}
                    className="w-8 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  >
                    ১+
                  </button>
                  <button
                    type="button"
                    onClick={() => addPreset('passport', 4)}
                    className="w-8 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  >
                    ৪+
                  </button>
                  <button
                    type="button"
                    onClick={() => addPreset('passport', 8)}
                    className="w-8 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  >
                    ৮+
                  </button>
                </div>
              </div>

              {/* স্ট্যাম্প */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold text-white block">স্ট্যাম্প</span>
                  <span className="text-[10px] text-slate-400">২০×২৫mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => addPreset('stamp', 1)}
                    className="w-8 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    ১+
                  </button>
                  <button
                    type="button"
                    onClick={() => addPreset('stamp', 4)}
                    className="w-8 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    ৪+
                  </button>
                  <button
                    type="button"
                    onClick={() => addPreset('stamp', 8)}
                    className="w-8 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    ৮+
                  </button>
                </div>
              </div>

              {/* R সাইজ Buttons */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold mb-1.5">
                  <span>R সাইজ</span>
                  <span className="text-[10px] text-slate-400 font-normal">mm</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                  <button
                    type="button"
                    onClick={() => addRSize('2r')}
                    className="h-7 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    ২R
                  </button>
                  <button
                    type="button"
                    onClick={() => addRSize('3r')}
                    className="h-7 rounded-lg bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    ৩R
                  </button>
                  <button
                    type="button"
                    onClick={() => addRSize('4r')}
                    className="h-7 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    ৪R
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => addRSize('5r')}
                    className="h-7 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    ৫R
                  </button>
                  <button
                    type="button"
                    onClick={() => addRSize('6r')}
                    className="h-7 rounded-lg bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    ৬R
                  </button>
                  <button
                    type="button"
                    onClick={() => addRSize('a4')}
                    className="h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    A4
                  </button>
                </div>
              </div>
            </div>

            {/* 3. অপশন (Checkboxes) */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 block mb-2.5">অপশন</span>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300 flex items-center gap-2">
                    <Scissors className="w-3.5 h-3.5 text-slate-400" />
                    কাটিং বর্ডার
                  </span>
                  <input
                    type="checkbox"
                    checked={hasCuttingBorder}
                    onChange={(e) => setHasCuttingBorder(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300 flex items-center gap-2">
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    ছবির বর্ডার
                  </span>
                  <input
                    type="checkbox"
                    checked={hasPhotoBorder}
                    onChange={(e) => setHasPhotoBorder(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* 4. ছবির ব্যবধান (মিমি) */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">
                  ছবির ব্যবধান: <strong className="text-amber-400">{gapMm}MM</strong>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={gapMm}
                onChange={(e) => setGapMm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="mt-auto p-4 border-t border-slate-800 bg-[#0e1424] flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="সব ছবি মুছুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex-1 h-10 rounded-xl bg-[#fef3c7] hover:bg-amber-200 border border-amber-300 text-[#92400e] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-[#92400e]" />
              <span>পিডিএফ ডাউনলোড</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 h-10 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট</span>
            </button>
          </div>
        </aside>

        {/* RIGHT LIVE A4 CANVAS PREVIEW (Desktop) */}
        <main className="hidden md:flex flex-1 bg-[#232733] overflow-auto items-center justify-center p-6 custom-scrollbar">
          <div
            style={{
              width: `${pageWidthMm * scaleMmToPx}px`,
              height: `${pageHeightMm * scaleMmToPx}px`,
              padding: `${8 * scaleMmToPx}px`,
            }}
            className="bg-white shadow-2xl transition-all duration-200 relative flex flex-wrap content-start select-none print:m-0 print:shadow-none print:w-full print:h-full"
          >
            {items.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Printer className="w-12 h-12 stroke-[1] mb-2 text-slate-300" />
                <p className="text-sm font-semibold">শিটে কোনো ছবি নেই</p>
                <p className="text-xs text-slate-400 mt-1">বামদিকের বাটনগুলো থেকে পাসপোর্ট বা স্ট্যাম্প সাইজ যোগ করুন</p>
              </div>
            ) : (
              <div 
                className="flex flex-wrap content-start w-full h-full"
                style={{ gap: `${gapMm * scaleMmToPx}px` }}
              >
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      width: `${item.widthMm * scaleMmToPx}px`,
                      height: `${item.heightMm * scaleMmToPx}px`,
                    }}
                    className={`relative group bg-slate-100 overflow-hidden ${
                      hasPhotoBorder ? 'border border-slate-900' : ''
                    } ${
                      hasCuttingBorder ? 'outline outline-1 outline-dashed outline-slate-400' : ''
                    }`}
                  >
                    <img
                      src={imageSrc}
                      alt={item.name}
                      className="w-full h-full object-cover block"
                    />

                    {/* Hover delete button on individual photo */}
                    <button
                      type="button"
                      onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md print:hidden"
                      title="মুছুন"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
