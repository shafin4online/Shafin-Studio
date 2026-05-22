import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StudioImage } from '@/context/studioTypes';
import { useStudio } from '@/context/StudioContext';
import { warpPerspective, detectDocumentCorners, QuadPoint } from '@/utils/perspectiveWarp';
import { 
  Sparkles, 
  RefreshCw, 
  RotateCw, 
  Maximize, 
  Check, 
  X, 
  Compass, 
  Layers,
  Wand2,
  FileText
} from 'lucide-react';

interface PerspectiveCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: StudioImage | null;
}

export function PerspectiveCropDialog({ open, onOpenChange, image }: PerspectiveCropDialogProps) {
  const { updateEditedImage, pushHistory } = useStudio();
  const [corners, setCorners] = useState<QuadPoint[]>([
    { x: 0.15, y: 0.15 },
    { x: 0.85, y: 0.15 },
    { x: 0.85, y: 0.85 },
    { x: 0.15, y: 0.85 }
  ]);
  const [filterMode, setFilterMode] = useState<'original' | 'magic' | 'bw' | 'grayscale'>('magic');
  const [activeHandle, setActiveHandle] = useState<number | null>(null);
  
  // Image metadata & sizes for dragging mapping
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 800, h: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize and auto-detect corners on image change
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image.edited;
      img.onload = () => {
        setImgNaturalSize({
          w: img.naturalWidth || img.width || 800,
          h: img.naturalHeight || img.height || 600
        });
        // Run CamScanner smart defaults
        setCorners(detectDocumentCorners(img.width, img.height));
      };
    }
  }, [image, open]);

  if (!image) return null;

  // Move a specific point indices: 0:TL, 1:TR, 2:BR, 3:BL
  const handleDragMove = (clientX: number, clientY: number) => {
    if (activeHandle === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Convert to relative ratio (0 to 1) clamped nicely
    const relativeX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const relativeY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    setCorners(prev => {
      const next = [...prev];
      next[activeHandle] = { x: relativeX, y: relativeY };
      return next;
    });
  };

  // Drag listeners
  const handleTouchMove = (e: React.TouchEvent) => {
    if (activeHandle === null) return;
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeHandle === null) return;
    handleDragMove(e.clientX, e.clientY);
  };

  const handleDragEnd = () => {
    setActiveHandle(null);
  };

  // Quick Action Helpers
  const handleResetFull = () => {
    setCorners([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 }
    ]);
  };

  const handleSmartAuto = () => {
    setCorners(detectDocumentCorners(imgNaturalSize.w, imgNaturalSize.h));
  };

  const handleRotateCornersCW = () => {
    // Cycles handles clockwise to rotate document orientation easily
    setCorners(prev => [
      prev[3], // TL gets previous BL
      prev[0], // TR gets TL
      prev[1], // BR gets TR
      prev[2]  // BL gets BR
    ]);
  };

  const handleApplyWarp = () => {
    setIsProcessing(true);
    // Request animation frame to guarantee UI progress feedback
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const imgEl = imgRef.current;
          if (!imgEl) return;

          // Estimate flattened target document size using the average aspect of the corrected quad
          // to make sure we don't skew the proportions of the papers/documents!
          const widthTop = distance(corners[0], corners[1]) * imgNaturalSize.w;
          const widthBottom = distance(corners[3], corners[2]) * imgNaturalSize.w;
          const heightLeft = distance(corners[0], corners[3]) * imgNaturalSize.h;
          const heightRight = distance(corners[1], corners[2]) * imgNaturalSize.h;

          const targetWidth = Math.round(Math.max(widthTop, widthBottom));
          const targetHeight = Math.round(Math.max(heightLeft, heightRight));

          // Guard against scale anomalies
          const finalW = Math.max(150, Math.min(3000, targetWidth));
          const finalH = Math.max(150, Math.min(3000, targetHeight));

          const warpedDataUrl = warpPerspective(
            imgEl,
            corners,
            finalW,
            finalH,
            filterMode,
            0
          );

          if (warpedDataUrl) {
            updateEditedImage(image.id, warpedDataUrl);
            pushHistory();
          }

          setIsProcessing(false);
          onOpenChange(false);
        } catch (err) {
          console.error("Perspective warp error: ", err);
          setIsProcessing(false);
          onOpenChange(false);
        }
      }, 50);
    });
  };

  // Distance helper
  const distance = (p1: QuadPoint, p2: QuadPoint) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  // Convert points back to absolute percentages to place handles elegantly
  const tl = corners[0];
  const tr = corners[1];
  const br = corners[2];
  const bl = corners[3];

  return (
    <Dialog open={open} onOpenChange={(openVal) => !isProcessing && onOpenChange(openVal)}>
      <DialogContent className="max-w-2xl bg-[#0e1117] border border-slate-800 text-white shadow-2xl overflow-hidden flex flex-col max-h-[96vh] md:max-h-[90vh]">
        <DialogHeader className="border-b border-slate-800/80 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-400 animate-spin-slow" />
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-slate-100">
              CamScanner Document Perspective Crop & Auto-Align
            </DialogTitle>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            ছবির বাঁকা কোন কাগজ বা ডকুমেন্ট সোজা করতে ৪টি কোণ ড্র্যাগ করে ঠিক করুন এবং স্ক্যানিং ফিল্টার সিলেক্ট করুন।
          </p>
        </DialogHeader>

        {/* Workspace Canvas Visualizer Wrapper */}
        <div 
          className="flex-1 bg-slate-950/80 rounded-xl relative p-3 flex items-center justify-center min-h-[280px] overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Main Visualizer Container with responsive aspect ratio */}
          <div 
            ref={containerRef}
            className="relative max-w-full max-h-[45vh] shadow-2xl border border-slate-800"
            style={{ aspectRatio: `${imgNaturalSize.w}/${imgNaturalSize.h}` }}
          >
            {/* Base Image */}
            <img 
              ref={imgRef}
              src={image.edited} 
              alt="Source Scan"
              className="w-full h-full object-contain pointer-events-none rounded select-none"
              crossOrigin="anonymous"
            />

            {/* SVG Connecting Polygon Lines Overlay - Glow effect */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Connected guide polygon */}
              <polygon
                points={`${tl.x * 100},${tl.y * 100} ${tr.x * 100},${tr.y * 100} ${br.x * 100},${br.y * 100} ${bl.x * 100},${bl.y * 100}`}
                fill="rgba(99, 102, 241, 0.08)"
                stroke="rgba(99, 102, 241, 0.85)"
                strokeWidth="1.2"
                strokeDasharray="2,2"
                className="animate-pulse"
              />
              
              {/* Outer boundary guidelines */}
              <line x1={`${tl.x * 100}`} y1={`${tl.y * 100}`} x2={`${tr.x * 100}`} y2={`${tr.y * 100}`} stroke="#3b82f6" strokeWidth="1.5" />
              <line x1={`${tr.x * 100}`} y1={`${tr.y * 100}`} x2={`${br.x * 100}`} y2={`${br.y * 100}`} stroke="#3b82f6" strokeWidth="1.5" />
              <line x1={`${br.x * 100}`} y1={`${br.y * 100}`} x2={`${bl.x * 100}`} y2={`${bl.y * 100}`} stroke="#3b82f6" strokeWidth="1.5" />
              <line x1={`${bl.x * 100}`} y1={`${bl.y * 100}`} x2={`${tl.x * 100}`} y2={`${tl.y * 100}`} stroke="#3b82f6" strokeWidth="1.5" />
            </svg>

            {/* Draggable Corner Nodes - Render nicely over the canvas */}
            {corners.map((point, i) => {
              const label = ["Top Left", "Top Right", "Bottom Right", "Bottom Left"][i];
              const short = ["TL", "TR", "BR", "BL"][i];
              const isActive = activeHandle === i;
              
              return (
                <div
                  key={i}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setActiveHandle(i);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setActiveHandle(i);
                  }}
                  className={`absolute w-7 h-7 sm:w-8 sm:h-8 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-move flex items-center justify-center z-20 transition-transform ${
                    isActive ? 'scale-125' : 'hover:scale-110'
                  }`}
                  style={{
                    left: `${point.x * 100}%`,
                    top: `${point.y * 100}%`,
                  }}
                  title={label}
                >
                  {/* Draggable Circle Ring */}
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 bg-slate-900 shadow-xl flex items-center justify-center transition-colors ${
                    isActive ? 'border-amber-400 bg-amber-500/20' : 'border-blue-400 bg-slate-950'
                  }`}>
                    <span className="text-[7.5px] font-black font-sans text-blue-300 pointer-events-none select-none">
                      {short}
                    </span>
                  </div>
                  {/* Outer Radar Pulse */}
                  <div className={`absolute inset-0 rounded-full border border-blue-400/30 pointer-events-none ${
                    isActive ? 'animate-ping border-amber-400/50' : ''
                  }`} />
                </div>
              );
            })}
          </div>

          {/* Drg overlay loading feedback */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
              <p className="text-xs font-bold text-slate-200">Processing Perspective Alignment...</p>
            </div>
          )}
        </div>

        {/* Quick Config & CamScanner Filters Panel */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-900/40 space-y-3 flex-shrink-0 select-none">
          {/* Quick Corner Adjustments Triggers */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Quick Controls:</span>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSmartAuto}
                className="h-7 px-2.5 text-[10px] gap-1 bg-slate-950/60 border-slate-800 hover:bg-indigo-500/10 text-slate-300 hover:text-white"
                title="স্বয়ংক্রিয়ভাবে একটি ডকুমেন্টের সীমানা আন্দাজ করুন"
              >
                <Sparkles className="h-3 w-3 text-indigo-400" />
                Auto-Suggest Bounds
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetFull}
                className="h-7 px-2.5 text-[10px] gap-1 bg-slate-950/60 border-slate-800 hover:bg-blue-500/10 text-slate-300 hover:text-white"
                title="পুরো ছবিতে কোণগুলো ছড়িয়ে দিন"
              >
                <Maximize className="h-3 w-3 text-blue-400" />
                Full Frame / Reset
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRotateCornersCW}
                className="h-7 px-2.5 text-[10px] gap-1 bg-slate-950/60 border-slate-800 hover:bg-amber-500/10 text-slate-300 hover:text-white"
                title="কোণগুলোর ঘূর্ণন কোণ ৯০° পাল্টান"
              >
                <RotateCw className="h-3 w-3 text-amber-500" />
                Rotate 90°
              </Button>
            </div>
          </div>

          {/* Quick Segment Selector for Scanner Output Filter Types */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-zinc-300 font-bold uppercase tracking-wide">
              <span>CamScanner Output scan filter style:</span>
              <span className="text-zinc-500 text-[9px] font-mono font-medium">Auto-enhancers</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([
                { id: 'original', label: 'Original', desc: 'No custom scan filters applied', icon: Layers, color: 'text-zinc-400' },
                { id: 'magic', label: 'Magic Color', desc: 'Auto contrast, text pop-up boost', icon: Wand2, color: 'text-purple-400' },
                { id: 'bw', label: 'Doc Black/White', desc: 'Crisp scan high-contrast output', icon: FileText, color: 'text-blue-400' },
                { id: 'grayscale', label: 'Grayscale', desc: 'Clear grayscale print output', icon: Layers, color: 'text-indigo-400' },
              ] as const).map((style) => {
                const isActive = filterMode === style.id;
                const IconComp = style.icon;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setFilterMode(style.id)}
                    className={`p-1.5 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-1 overflow-hidden min-h-[54px] cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600/15 border-blue-500 shadow shadow-blue-500/20' 
                        : 'bg-slate-950/75 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <IconComp className={`h-3.5 w-3.5 ${isActive ? 'text-blue-400' : style.color} shrink-0`} />
                      <span className={`text-[10px] font-extrabold ${isActive ? 'text-blue-200' : 'text-slate-300'}`}>
                        {style.label}
                      </span>
                    </div>
                    <span className="text-[8px] text-zinc-500 font-medium leading-tight">
                      {style.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <DialogFooter className="bg-slate-950/80 px-4 py-3 border-t border-slate-900/80 gap-2 sm:gap-0 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="h-8 border-slate-800 bg-transparent hover:bg-slate-900 text-slate-300 hover:text-white text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Cancel
          </Button>
          <Button 
            onClick={handleApplyWarp}
            disabled={isProcessing}
            className="h-8 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/15 gap-1 cursor-pointer"
          >
            {isProcessing ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            {isProcessing ? 'Processing...' : 'Apply Perspective Flat Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
