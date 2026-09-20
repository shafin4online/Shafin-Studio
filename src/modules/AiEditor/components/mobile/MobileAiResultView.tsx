import React, { useState } from 'react';
import { 
  X, 
  Maximize2, 
  Crop, 
  Download, 
  Printer, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowUpDown,
  Check
} from 'lucide-react';

interface MobileAiResultViewProps {
  generatedImage: string;
  originalImage: string | null;
  onClear: () => void;
  onCrop: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onFeedbackGood?: () => void;
  onFeedbackBad?: () => void;
}

export const MobileAiResultView: React.FC<MobileAiResultViewProps> = ({
  generatedImage,
  originalImage,
  onClear,
  onCrop,
  onDownload,
  onPrint,
  onFeedbackGood,
  onFeedbackBad
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);

  const displayImage = showOriginal && originalImage ? originalImage : generatedImage;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between px-3 pt-2 pb-2 select-none overflow-y-auto custom-scrollbar">
      {/* 1. Main Photo Container Card matching Screenshot 1 & 2 */}
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="relative w-full aspect-[4/5] sm:aspect-[45/55] max-h-[52vh] rounded-3xl overflow-hidden bg-[#141b2d] shadow-2xl border border-slate-700/60 flex items-center justify-center">
          {/* Top-Right Floating Controls: Red Close button (✕) & Dark Fullscreen button (⛶) */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer font-bold"
              title="মুছুন"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md active:scale-90 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer border border-white/10"
              title="সম্পূর্ণ স্ক্রিন দেখুন"
            >
              <Maximize2 className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* The Active Display Photo (smooth transition) */}
          <img
            src={displayImage}
            alt={showOriginal ? 'Original Photo' : 'Edited Photo'}
            className="w-full h-full object-contain block transition-all duration-200"
          />

          {/* Bottom Floating Pill Button: ↑↓ আসল ছবি / ↑↓ এডিট করা ছবি (Screenshot 1 & 2) */}
          {originalImage && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center z-20">
              <button
                type="button"
                onClick={() => setShowOriginal(prev => !prev)}
                className="px-4 py-1.5 rounded-full bg-black/70 hover:bg-black/90 active:scale-95 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                <span>{showOriginal ? 'এডিট করা ছবি' : 'আসল ছবি'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Action Controls Below Image (Exact match with Screenshot 1 & 2) */}
      <div className="w-full max-w-sm flex flex-col gap-2 pt-2.5 shrink-0">
        {/* Full-width White Crop Button */}
        <button
          type="button"
          onClick={onCrop}
          className="w-full h-10 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200"
        >
          <Crop className="w-4 h-4 stroke-[2.5]" />
          <span>ক্রপ করুন</span>
        </button>

        {/* 2-Column Row: Green Download & Blue Print */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            type="button"
            onClick={onDownload}
            className="h-10 bg-[#10b981] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>ডাউনলোড</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="h-10 bg-[#2563eb] hover:bg-blue-600 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>প্রিন্ট</span>
          </button>
        </div>

        {/* 2-Column Row: Dark Green "ভালো হয়েছে" & Dark Red "ভালো হয়নি" */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            type="button"
            onClick={() => {
              setFeedback('good');
              onFeedbackGood?.();
            }}
            className={`h-9 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] border ${
              feedback === 'good'
                ? 'bg-emerald-700 text-white border-emerald-400 ring-2 ring-emerald-500/40'
                : 'bg-[#064e3b]/80 hover:bg-[#064e3b] text-emerald-300 border-emerald-500/30'
            }`}
          >
            {feedback === 'good' ? (
              <Check className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>ভালো হয়েছে</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFeedback('bad');
              onFeedbackBad?.();
            }}
            className={`h-9 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] border ${
              feedback === 'bad'
                ? 'bg-rose-900 text-white border-rose-400 ring-2 ring-rose-500/40'
                : 'bg-[#450a0a]/80 hover:bg-[#450a0a] text-rose-300 border-rose-500/30'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
            <span>ভালো হয়নি</span>
          </button>
        </div>
      </div>

      {/* 3. Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
          <img
            src={displayImage}
            alt="Fullscreen Preview"
            className="max-h-[85vh] max-w-[95vw] object-contain rounded-2xl shadow-2xl"
          />
          <div className="mt-4 flex items-center gap-3">
            {originalImage && (
              <button
                type="button"
                onClick={() => setShowOriginal(prev => !prev)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <ArrowUpDown className="w-4 h-4 text-amber-400" />
                <span>{showOriginal ? 'এডিট করা ছবি' : 'আসল ছবি'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onDownload}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>ডাউনলোড</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
