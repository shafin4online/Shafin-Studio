import React, { useState, useRef } from 'react';
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
  type: 'passport' | 'stamp' | '2r' | '3r' | '4r' | '5r' | '6r' | '8r' | 'custom';
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

  // Photos placed on sheet: by default add 4 passport photos like in Screenshot 3!
  const [items, setItems] = useState<PrintPhotoItem[]>([
    { id: '1', type: 'passport', name: 'পাসপোর্ট', widthMm: 40, heightMm: 50 },
    { id: '2', type: 'passport', name: 'পাসপোর্ট', widthMm: 40, heightMm: 50 },
    { id: '3', type: 'passport', name: 'পাসপোর্ট', widthMm: 40, heightMm: 50 },
    { id: '4', type: 'passport', name: 'পাসপোর্ট', widthMm: 40, heightMm: 50 },
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
      ? { name: 'পাসপোর্ট', widthMm: 40, heightMm: 50 }
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

  const addRSize = (rType: '2r' | '3r' | '4r' | '5r' | '6r' | '8r') => {
    const rSizes: Record<string, { w: number; h: number; name: string }> = {
      '2r': { w: 64, h: 89, name: '২R' },
      '3r': { w: 89, h: 127, name: '৩R' },
      '4r': { w: 102, h: 152, name: '৪R' },
      '5r': { w: 127, h: 178, name: '৫R' },
      '6r': { w: 152, h: 203, name: '৬R' },
      '8r': { w: 203, h: 254, name: '৮R' },
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
    // Standard high-quality print dialog will offer Save as PDF
    window.print();
  };

  // Convert mm to screen pixels based on 96 DPI scale (approx 3.78 px per mm)
  const scaleMmToPx = 3.2 * (zoomPercent / 100);

  return (
    <div className="fixed inset-0 z-50 bg-[#0c101d] text-slate-100 flex flex-col h-screen w-screen overflow-hidden select-none">
      {/* Top Header bar with Back button */}
      <header className="h-12 bg-[#0e1424] border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>এডিটরে ফিরুন</span>
          </button>
          <span className="text-xs font-bold text-slate-300">
            স্টুডিও প্রিন্ট শিট ইঞ্জিন
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            মোট ছবি: <strong className="text-amber-400">{items.length}</strong> টি
          </span>
        </div>
      </header>

      {/* Main Workspace: Left Controls + Right Live Canvas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT CONTROL PANEL (Matches Screenshot 3) */}
        <aside className="w-full md:w-80 lg:w-84 bg-[#111726] border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
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
                <button
                  type="button"
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  ফটো সাইজ সেটিং
                </button>
              </div>

              {/* পাসপোর্ট */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-white block">পাসপোর্ট</span>
                  <span className="text-[10px] text-slate-400">৪০×৫০mm</span>
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
                    onClick={() => addRSize('8r')}
                    className="h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    ৮R
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
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                    ফ্রি সাইজ
                  </span>
                  <input
                    type="checkbox"
                    checked={isFreeSize}
                    onChange={(e) => setIsFreeSize(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>

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
                  ছবির ব্যবধান (মিমি): <strong className="text-amber-400">{gapMm}MM</strong>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={gapMm}
                onChange={(e) => setGapMm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 px-1 mt-1">
                <span>০</span>
                <span>৫</span>
                <span>১০</span>
              </div>
            </div>

            {/* 5. পেজ ও লেআউট */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">পেজ ও লেআউট</span>

              {/* Page Size Select */}
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter' | '4x6')}
                  className="w-full h-9 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200 appearance-none focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="a4">A4 — ২১০×২৯৭mm</option>
                  <option value="letter">Letter — ২১৬×২৭৯mm</option>
                  <option value="4x6">4R — ১০২×১৫২mm</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>

              {/* Orientation Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`h-8 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    orientation === 'portrait'
                      ? 'bg-amber-500 text-white font-bold shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span>⬒ পোর্ট্রেট</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`h-8 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    orientation === 'landscape'
                      ? 'bg-amber-500 text-white font-bold shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span>⬓ ল্যান্ডস্কেপ</span>
                </button>
              </div>

              {/* অটো এরেঞ্জ Button */}
              <button
                type="button"
                onClick={() => {
                  // Re-layout/re-shuffle or balance
                  setItems(prev => [...prev]);
                }}
                className="w-full h-9 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Grid className="w-4 h-4" />
                <span>অটো এরেঞ্জ</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* View Zoom */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">ভিউ জুম</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoomPercent(prev => Math.max(50, prev - 15))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer text-xs"
                    title="জুম কমান"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-semibold text-slate-200 px-1">
                    {zoomPercent}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomPercent(prev => Math.min(180, prev + 15))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer text-xs"
                    title="জুম বাড়ান"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomPercent(100)}
                    className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center cursor-pointer text-xs ml-1"
                    title="ফিট করুন"
                  >
                    <Expand className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
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
              className="flex-1 h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>পিডিএফ ডাউনলোড</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট</span>
            </button>
          </div>
        </aside>

        {/* RIGHT LIVE A4 CANVAS PREVIEW */}
        <main className="flex-1 bg-[#232733] overflow-auto flex items-center justify-center p-6 custom-scrollbar">
          {/* Paper Canvas (A4 / Letter Sheet) */}
          <div
            ref={printSheetRef}
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
                style={{
                  gap: `${gapMm * scaleMmToPx}px`
                }}
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
