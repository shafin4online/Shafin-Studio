import React from 'react';
import { 
  Crop, 
  Download, 
  SlidersHorizontal, 
  Copy, 
  Printer, 
  QrCode, 
  Check, 
  Sparkles 
} from 'lucide-react';

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  saturation: number; // -100 to 100
  sharpness: number;  // 0 to 100
}

interface AiGeneratedSidebarProps {
  adjustments: ImageAdjustments;
  onChangeAdjustments: (adjustments: ImageAdjustments) => void;
  onCrop: () => void;
  onDownload: () => void;
  onCustomSize: () => void;
  onCopyImage: () => void;
  onPrint: () => void;
  onOpenMobileQr?: () => void;
}

export const AiGeneratedSidebar: React.FC<AiGeneratedSidebarProps> = ({
  adjustments,
  onChangeAdjustments,
  onCrop,
  onDownload,
  onCustomSize,
  onCopyImage,
  onPrint,
  onOpenMobileQr
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopyImage();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateField = (key: keyof ImageAdjustments, value: number) => {
    onChangeAdjustments({
      ...adjustments,
      [key]: value
    });
  };

  const formatPercent = (val: number) => {
    if (val > 0) return `+${val}%`;
    return `${val}%`;
  };

  return (
    <aside className="hidden lg:flex lg:w-88 h-full bg-[#111726] border-l border-slate-800/80 flex-col shrink-0 select-none overflow-y-auto custom-scrollbar pb-6">
      {/* 1. Mobile Upload QR Card */}
      <div className="p-4 pb-2">
        <div className="bg-[#182032] border border-slate-700/60 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">
                মোবাইল থেকে ছবি আপলোড করুন
              </h4>
              <p className="text-[11px] text-slate-400">
                QR কোড স্ক্যান করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMobileQr}
            className="w-full h-8 rounded-xl bg-[#232c42] hover:bg-[#2c3752] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/50"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>স্ক্যান QR কোড</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-2 space-y-6">
        {/* 2. Header: তৈরি হওয়া ছবি এডিট করুন */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-4 bg-amber-500 rounded-full" />
            <h3 className="text-sm font-bold text-white">
              তৈরি হওয়া ছবি এডিট করুন
            </h3>
          </div>
        </div>

        {/* 3. ছবি এডিটিং (Sliders) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
              <h4 className="text-xs font-bold text-white">
                ছবি এডিটিং
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onChangeAdjustments({ brightness: 0, contrast: 0, saturation: 0, sharpness: 0 })}
              className="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              রিসেট
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">ব্রাইটনেস</span>
                <span className="text-amber-400 font-semibold font-mono text-[11px]">
                  {formatPercent(adjustments.brightness)}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.brightness}
                onChange={(e) => updateField('brightness', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">কন্ট্রাস্ট</span>
                <span className="text-amber-400 font-semibold font-mono text-[11px]">
                  {formatPercent(adjustments.contrast)}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.contrast}
                onChange={(e) => updateField('contrast', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">স্যাচুরেশন</span>
                <span className="text-amber-400 font-semibold font-mono text-[11px]">
                  {formatPercent(adjustments.saturation)}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.saturation}
                onChange={(e) => updateField('saturation', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Sharpness */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">শার্পনেস</span>
                <span className="text-amber-400 font-semibold font-mono text-[11px]">
                  {adjustments.sharpness}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sharpness}
                onChange={(e) => updateField('sharpness', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 4. ছবির অ্যাকশন (4 Cards in a Row) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
            <h4 className="text-xs font-bold text-white">
              ছবির অ্যাকশন
            </h4>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* Crop */}
            <button
              type="button"
              onClick={onCrop}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a2236] hover:bg-[#222c46] border border-slate-700/60 transition-all active:scale-95 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300 group-hover:text-amber-400 mb-1.5">
                <Crop className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white whitespace-nowrap">
                ক্রপ করুন
              </span>
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={onDownload}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a2236] hover:bg-[#222c46] border border-slate-700/60 transition-all active:scale-95 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300 group-hover:text-amber-400 mb-1.5">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white whitespace-nowrap">
                ডাউনলোড
              </span>
            </button>

            {/* Custom Size */}
            <button
              type="button"
              onClick={onCustomSize}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a2236] hover:bg-[#222c46] border border-slate-700/60 transition-all active:scale-95 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300 group-hover:text-amber-400 mb-1.5">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white whitespace-nowrap">
                কাস্টম সাইজ
              </span>
            </button>

            {/* Copy */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#1a2236] hover:bg-[#222c46] border border-slate-700/60 transition-all active:scale-95 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300 group-hover:text-amber-400 mb-1.5">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white whitespace-nowrap">
                {copied ? 'কপি হয়েছে' : 'কপি করুন'}
              </span>
            </button>
          </div>
        </div>

        {/* 5. ছবি প্রিন্ট করুন (Large Green Button) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onPrint}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            <span>ছবি প্রিন্ট করুন</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
