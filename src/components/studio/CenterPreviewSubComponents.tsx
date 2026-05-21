import React from 'react';
import { useStudio } from '@/context/StudioContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, ImageIcon, RotateCw, Maximize2, ArrowLeftRight, Sparkles, Wand2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Subcomponent 1: Empty State File Upload Drag & Drop Box
interface CenterPreviewEmptyProps {
  onBrowseClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const CenterPreviewEmpty: React.FC<CenterPreviewEmptyProps> = ({
  onBrowseClick,
  fileInputRef,
  handleFileChange,
  onDrop,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-[#0f1116] relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)]" />
        <div 
          className="z-10 w-full max-w-[500px] aspect-video border-2 border-dashed border-border/40 rounded-xl bg-card/20 backdrop-blur-sm text-center transition-all hover:border-primary/40 group flex flex-col items-center justify-center cursor-pointer"
          onClick={onBrowseClick}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={onDrop}
        >
          <div className="mb-4 p-4 rounded-full bg-primary/10 text-primary/60 group-hover:scale-110 group-hover:text-primary transition-all">
            <Upload className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold mb-1">Upload Image</h2>
          <p className="text-muted-foreground text-sm font-medium">
            Drop files here or click to browse
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
            accept="image/*" 
          />
        </div>
      </div>
    </div>
  );
};


// Subcomponent 2: Drag Slider Comparison View
interface CenterPreviewComparisonProps {
  type: 'bg' | 'enhancer';
  beforeUrl: string;
  afterUrl: string;
  sliderPos: number;
  containerRef: React.RefObject<HTMLDivElement>;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onClose: () => void;
  onRevert: () => void;
}

export const CenterPreviewComparison: React.FC<CenterPreviewComparisonProps> = ({
  type,
  beforeUrl,
  afterUrl,
  sliderPos,
  containerRef,
  onPointerDown,
  onPointerMove,
  onClose,
  onRevert,
}) => {
  const isBg = type === 'bg';

  return (
    <div className="absolute inset-0 bg-[#0d0e12] z-40 flex flex-col select-none">
      {/* Header control bar */}
      <div className="h-14 border-b border-border bg-[#14161f] flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-3">
          {isBg ? (
            <span className="font-bold text-xs text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              BG-PRO COMPARISON
            </span>
          ) : (
            <span className="font-bold text-xs text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5 animate-pulse" />
              AI IMAGE ENHANCER COMPARISON
            </span>
          )}
          <span className="text-xs text-muted-foreground opacity-60">•</span>
          <span className="text-xs font-semibold text-slate-200">স্লাইডার ড্র্যাগ করে বিফোর-আফটার কম্পেয়ার করুন</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-[11px] px-3.5 border-red-500/35 bg-red-500/10 text-red-300 hover:bg-red-500/20" 
            onClick={onRevert}
          >
            Revert / Undo
          </Button>
          <Button 
            size="sm" 
            className={cn(
              "h-8 text-[11px] text-white px-4 font-bold",
              isBg ? "bg-emerald-650 hover:bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-500 animate-pulse"
            )}
            onClick={onClose}
          >
            {isBg ? 'Keep Changes' : 'Keep Enhanced'}
          </Button>
        </div>
      </div>

      {/* Drag comparison viewport */}
      <div className="flex-1 relative bg-[#090a0d] flex items-center justify-center overflow-hidden p-8">
        <div 
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          className="relative max-w-full max-h-full aspect-auto bg-[#14161f] border border-border/40 shadow-2xl rounded-lg overflow-hidden cursor-ew-resize flex items-center justify-center"
          style={{ 
            width: 'min(720px, 100%)',
            height: '460px',
          }}
        >
          {/* AFTER image in background */}
          <div 
            className={cn(
              "absolute inset-0 w-full h-full bg-[#14161f] flex items-center justify-center",
              isBg && "bg-[repeating-conic-gradient(#1e2230_0%_25%,_#0f1116_0%_50%)_50%_/_20px_20px]"
            )}
          >
            <img 
              src={afterUrl} 
              alt="After Effect" 
              className="w-full h-full object-contain pointer-events-none"
              referrerPolicy="no-referrer"
            />
            <div className={cn(
              "absolute right-3 bottom-3 backdrop-blur-md text-[9px] text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider",
              isBg ? "bg-emerald-600/80" : "bg-indigo-600/80"
            )}>
              {isBg ? 'AFTER (BG REMOVED)' : 'AFTER (ENHANCED AI)'}
            </div>
          </div>

          {/* BEFORE image clipped overlay */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <div className="w-full h-full bg-[#14161f] flex items-center justify-center">
              <img 
                src={beforeUrl} 
                alt="Before Original" 
                className="w-full h-full object-contain pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute left-3 bottom-3 bg-[#e11d48]/80 backdrop-blur-md text-[9px] text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              BEFORE ORIGINAL
            </div>
          </div>

          {/* Vertical handle line */}
          <div 
            className={cn(
              "absolute top-0 bottom-0 w-0.5 z-10 pointer-events-none shadow-xl",
              isBg ? "bg-purple-500" : "bg-indigo-500"
            )}
            style={{ left: `${sliderPos}%` }}
          >
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 text-white flex items-center justify-center shadow-lg pointer-events-none",
              isBg ? "bg-purple-600 border-purple-400" : "bg-indigo-650 border-indigo-400"
            )}>
              <ArrowLeftRight className="h-4.5 w-4.5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress/slider visual info footer */}
      <div className="h-10 border-t border-border bg-[#14161f] flex items-center justify-center px-6 z-50 shrink-0">
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
          Position: {Math.round(sliderPos)}% • কম্পেয়ার করতে ইমেজ স্লাইডারের উপর ক্লিক করে ড্র্যাগ করুন
        </span>
      </div>
    </div>
  );
};


// Subcomponent 3: Loading overlays for AI tasks
export const CenterPreviewOverlayModals: React.FC = () => {
  const {
    isProcessingBg,
    bgProgress,
    bgProgressKey,
    cancelBgPro,
    isProcessingEnhancer,
    enhancerProgressKey,
    cancelImageEnhancer,
  } = useStudio();

  return (
    <>
      {/* SOTA BG-Pro Processing On-device overlay */}
      {isProcessingBg && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d0e12]/80 backdrop-blur-[3px] select-none">
          <div className="bg-[#14161f] p-6 rounded-xl border border-purple-500/30 shadow-2xl flex flex-col items-center gap-4 max-w-xs text-center">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-purple-400 animate-pulse absolute z-10" />
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
            </div>
            <div>
              <p className="font-bold text-white text-xs uppercase tracking-wider">Running BG-Pro AI Engine</p>
              <p className="text-[10px] text-slate-400 font-medium font-mono mt-1 w-full truncate px-1">
                {bgProgressKey || 'Initializing model setup...'}
              </p>
            </div>
            
            {/* Realtime progress tracker */}
            <div className="w-full">
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden border border-border/80">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${bgProgress}%` }}
                />
              </div>
              <span className="text-[9px] text-purple-400 font-mono font-bold block mt-1">
                Completed: {bgProgress}%
              </span>
            </div>

            <Button 
              variant="outline"
              size="sm"
              onClick={cancelBgPro}
              className="h-7 px-3.5 text-[9px] font-bold border-red-500/35 bg-red-500/10 text-red-300 hover:bg-red-500/20"
            >
              Cancel Process
            </Button>
          </div>
        </div>
      )}

      {/* AI Image Enhancer processing modal overlay */}
      {isProcessingEnhancer && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d0e12]/80 backdrop-blur-[3px] select-none">
          <div className="bg-[#14161f] p-6 rounded-xl border border-indigo-500/30 shadow-2xl flex flex-col items-center gap-4 max-w-xs text-center animate-fadeIn">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <Wand2 className="h-7 w-7 text-indigo-400 animate-pulse absolute z-10" />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
            </div>
            <div>
              <p className="font-bold text-white text-xs uppercase tracking-wider">Running AI Image Enhancer</p>
              <p className="text-[10px] text-slate-400 font-medium font-mono mt-2 leading-relaxed">
                {enhancerProgressKey || 'Contacting Hugging Face neural space...'}
              </p>
            </div>

            <Button 
              variant="outline"
              size="sm"
              onClick={cancelImageEnhancer}
              className="h-7 px-3.5 text-[9px] font-bold border-red-500/35 bg-red-500/10 text-red-300 hover:bg-red-500/20"
            >
              Cancel Process
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
