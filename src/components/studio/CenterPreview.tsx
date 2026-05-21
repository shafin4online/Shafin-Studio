import React, { useState, useRef } from 'react';
import { useStudio } from '@/context/StudioContext';
import { LayerCanvas } from './LayerCanvas';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Upload, ImageIcon, Maximize2, RotateCw, ArrowLeftRight, Sparkles, Wand2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropUtils';

export function CenterPreview() {
  const { 
    images, 
    activeImageId, 
    addImages, 
    updateEditedImage, 
    editorState, 
    updateEditorState,
    activeCropPreset,
    setActiveCropPreset,

    isProcessingBg,
    bgProgress,
    bgProgressKey,
    bgBeforeUrl,
    bgAfterUrl,
    showBgComparison,
    setShowBgComparison,
    cancelBgPro,
    undo,

    isProcessingEnhancer,
    enhancerProgressKey,
    showEnhancerComparison,
    setShowEnhancerComparison,
    enhancerBeforeUrl,
    enhancerAfterUrl,
    cancelImageEnhancer
  } = useStudio();
  
  const [scale, setScale] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerCompareRef = useRef<HTMLDivElement>(null);

  // Before/After comparison slider position
  const [sliderPos, setSliderPos] = useState(50);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [manualW, setManualW] = useState(300);
  const [manualH, setManualH] = useState(300);
  const [isCroppingSave, setIsCroppingSave] = useState(false);

  const activeImage = images.find(i => i.id === activeImageId);

  const handleApplyCrop = async () => {
    if (!activeImage || !croppedAreaPixels) return;
    setIsCroppingSave(true);
    try {
      const croppedUrl = await getCroppedImg(activeImage.edited, croppedAreaPixels);
      updateEditedImage(activeImage.id, croppedUrl);
      setActiveCropPreset(null);
      // Reset cropping states
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
      console.error('Error applying crop:', error);
    } finally {
      setIsCroppingSave(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addImages(Array.from(e.target.files));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return; // Only drag when pointer is pressed (mouse left click/touch)
    if (!containerCompareRef.current) return;
    const rect = containerCompareRef.current.getBoundingClientRect();
    const offset = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offset / rect.width) * 100));
    setSliderPos(percentage);
  };

  if (images.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-[#0f1116] relative overflow-hidden">
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)]" />
          <div 
            className="z-10 w-full max-w-[500px] aspect-video border-2 border-dashed border-border/40 rounded-xl bg-card/20 backdrop-blur-sm text-center transition-all hover:border-primary/40 group flex flex-col items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files) addImages(Array.from(e.dataTransfer.files));
            }}
          >
            <div className="mb-4 p-4 rounded-full bg-primary/10 text-primary/60 group-hover:scale-110 group-hover:text-primary transition-all">
              <Upload className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold mb-1">Upload Image</h2>
            <p className="text-muted-foreground text-sm">
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
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f1116] relative overflow-hidden">
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {showEnhancerComparison && enhancerBeforeUrl && enhancerAfterUrl ? (
          <div className="absolute inset-0 bg-[#0d0e12] z-40 flex flex-col">
            {/* Header control bar */}
            <div className="h-14 border-b border-border bg-[#14161f] flex items-center justify-between px-6 z-50">
               <div className="flex items-center gap-3">
                 <span className="font-bold text-xs text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                   <Wand2 className="h-3.5 w-3.5 animate-pulse" />
                   AI IMAGE ENHANCER COMPARISON
                 </span>
                 <span className="text-xs text-muted-foreground opacity-60">•</span>
                 <span className="text-xs font-semibold text-slate-200">স্লাইডার ড্র্যাগ করে বিফোর-আফটার কম্পেয়ার করুন</span>
               </div>

               <div className="flex items-center gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="h-8 text-[11px] px-3.5 border-red-500/35 bg-red-500/10 text-red-300 hover:bg-red-500/20" 
                   onClick={() => {
                     undo(); // Revert image changes instantly
                     setShowEnhancerComparison(false);
                   }}
                 >
                   Revert / Undo
                 </Button>
                 <Button 
                   size="sm" 
                   className="h-8 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white px-4 font-bold animate-pulse" 
                   onClick={() => setShowEnhancerComparison(false)}
                 >
                   Keep Enhanced
                 </Button>
               </div>
            </div>

            {/* Drag comparison viewport */}
            <div className="flex-1 relative bg-[#090a0d] flex items-center justify-center overflow-hidden p-8 select-none">
              <div 
                ref={containerCompareRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                className="relative max-w-full max-h-full aspect-auto bg-[#14161f] border border-border/40 shadow-2xl rounded-lg overflow-hidden cursor-ew-resize flex items-center justify-center"
                style={{ 
                  width: 'min(720px, 100%)',
                  height: '460px',
                }}
              >
                {/* AFTER image in background */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#14161f] flex items-center justify-center"
                >
                  <img 
                    src={enhancerAfterUrl} 
                    alt="After Enhancer" 
                    className="w-full h-full object-contain pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute right-3 bottom-3 bg-indigo-600/80 backdrop-blur-md text-[9px] text-white select-none px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                     AFTER (ENHANCED AI)
                  </div>
                </div>

                {/* BEFORE image clipped overlay */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <div className="w-full h-full bg-[#14161f] flex items-center justify-center">
                    <img 
                      src={enhancerBeforeUrl} 
                      alt="Before Enhancer" 
                      className="w-full h-full object-contain pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute left-3 bottom-3 bg-[#e11d48]/80 backdrop-blur-md text-[9px] text-white select-none px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                     BEFORE ORIGINAL
                  </div>
                </div>

                {/* Vertical handle line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 z-10 pointer-events-none shadow-xl"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-indigo-650 border-2 border-indigo-400 text-white flex items-center justify-center shadow-lg pointer-events-none">
                    <ArrowLeftRight className="h-4.5 w-4.5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress/slider visual info footer */}
            <div className="h-10 border-t border-border bg-[#14161f] flex items-center justify-center px-6 z-50">
               <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                 Position: {Math.round(sliderPos)}% • কম্পেয়ার করতে ইমেজ স্লাইডারের উপর ক্লিক করে ড্র্যাগ করুন
               </span>
            </div>
          </div>
        ) : showBgComparison && bgBeforeUrl && bgAfterUrl ? (
          <div className="absolute inset-0 bg-[#0d0e12] z-40 flex flex-col">
            {/* Header control bar */}
            <div className="h-14 border-b border-border bg-[#14161f] flex items-center justify-between px-6 z-50">
               <div className="flex items-center gap-3">
                 <span className="font-bold text-xs text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                   <Sparkles className="h-3.5 w-3.5" />
                   BG-PRO COMPARISON
                 </span>
                 <span className="text-xs text-muted-foreground opacity-60">•</span>
                 <span className="text-xs font-semibold text-slate-200">স্লাইডার ড্র্যাগ করে বিফোর-আফটার কম্পেয়ার করুন</span>
               </div>

               <div className="flex items-center gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="h-8 text-[11px] px-3.5 border-red-500/35 bg-red-500/10 text-red-300 hover:bg-red-500/20" 
                   onClick={() => {
                     undo(); // Revert image changes instantly
                     setShowBgComparison(false);
                   }}
                 >
                   Revert / Undo
                 </Button>
                 <Button 
                   size="sm" 
                   className="h-8 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white px-4 font-bold" 
                   onClick={() => setShowBgComparison(false)}
                 >
                   Keep Changes
                 </Button>
               </div>
            </div>

            {/* Drag comparison viewport */}
            <div className="flex-1 relative bg-[#090a0d] flex items-center justify-center overflow-hidden p-8 select-none">
              <div 
                ref={containerCompareRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                className="relative max-w-full max-h-full aspect-auto bg-[#14161f] border border-border/40 shadow-2xl rounded-lg overflow-hidden cursor-ew-resize flex items-center justify-center"
                style={{ 
                  width: 'min(720px, 100%)',
                  height: '460px',
                }}
              >
                {/* AFTER image in background (transparency grid) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[repeating-conic-gradient(#1e2230_0%_25%,_#0f1116_0%_50%)_50%_/_20px_20px] flex items-center justify-center"
                >
                  <img 
                    src={bgAfterUrl} 
                    alt="After BG-Pro" 
                    className="w-full h-full object-contain pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute right-3 bottom-3 bg-emerald-600/80 backdrop-blur-md text-[9px] text-white select-none px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                     AFTER (BG REMOVED)
                  </div>
                </div>

                {/* BEFORE image clipped overlay */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <div className="w-full h-full bg-[#14161f] flex items-center justify-center">
                    <img 
                      src={bgBeforeUrl} 
                      alt="Before BG-Pro" 
                      className="w-full h-full object-contain pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute left-3 bottom-3 bg-[#e11d48]/80 backdrop-blur-md text-[9px] text-white select-none px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                     BEFORE ORIGINAL
                  </div>
                </div>

                {/* Vertical handle line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-purple-500 z-10 pointer-events-none shadow-xl"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-purple-600 border-2 border-purple-400 text-white flex items-center justify-center shadow-lg pointer-events-none">
                    <ArrowLeftRight className="h-4.5 w-4.5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress/slider visual info footer */}
            <div className="h-10 border-t border-border bg-[#14161f] flex items-center justify-center px-6 z-50">
               <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                 Position: {Math.round(sliderPos)}% • কম্পেয়ার করতে ইমেজ স্লাইডারের উপর ক্লিক করে ড্র্যাগ করুন
               </span>
            </div>
          </div>
        ) : activeCropPreset && activeImage ? (
          <div className="absolute inset-0 bg-[#0d0e12] z-40 flex flex-col">
            {/* Header control bar */}
            <div className="h-14 border-b border-border bg-[#14161f] flex items-center justify-between px-6 z-50">
               <div className="flex items-center gap-3">
                 <span className="font-bold text-xs text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-ping" />
                   CROP MODE
                 </span>
                 <span className="text-xs text-muted-foreground opacity-60">•</span>
                 <span className="text-xs font-semibold text-slate-200">{activeCropPreset.label} ({activeCropPreset.subLabel})</span>
               </div>

               {activeCropPreset.isManual && (
                 <div className="flex items-center gap-6 text-xs">
                   <div className="flex items-center gap-2">
                     <span className="text-muted-foreground/80 text-[10px] uppercase font-mono tracking-wider">Width (px)</span>
                     <input 
                       type="number" 
                       value={manualW} 
                       min={50}
                       max={4000}
                       onChange={(e) => setManualW(Math.max(1, parseInt(e.target.value) || 0))}
                       className="w-16 h-8 bg-[#1a1c24] border border-border/80 rounded text-center text-xs text-white px-2 outline-none focus:border-purple-500/50"
                     />
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-muted-foreground/80 text-[10px] uppercase font-mono tracking-wider">Height (px)</span>
                     <input 
                       type="number" 
                       value={manualH} 
                       min={50}
                       max={4000}
                       onChange={(e) => setManualH(Math.max(1, parseInt(e.target.value) || 0))}
                       className="w-16 h-8 bg-[#1a1c24] border border-border/80 rounded text-center text-xs text-white px-2 outline-none focus:border-purple-500/50"
                     />
                   </div>
                 </div>
               )}

               <div className="flex items-center gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="h-8 text-[11px] px-3.5 border-border bg-muted/20 text-slate-300 hover:bg-muted/40" 
                   onClick={() => setActiveCropPreset(null)}
                   disabled={isCroppingSave}
                 >
                   Cancel
                 </Button>
                 <Button 
                   size="sm" 
                   className="h-8 text-[11px] bg-blue-600 hover:bg-blue-500 text-white px-4 font-bold" 
                   onClick={handleApplyCrop}
                   disabled={isCroppingSave}
                 >
                   {isCroppingSave ? 'Applying...' : 'Apply Crop'}
                 </Button>
               </div>
            </div>

            {/* Cropper area */}
            <div className="flex-1 relative bg-[#090a0d]">
              <Cropper
                image={activeImage.edited}
                crop={crop}
                zoom={zoom}
                aspect={activeCropPreset.isManual ? (manualW / manualH) : activeCropPreset.aspect}
                onCropChange={setCrop}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                onZoomChange={setZoom}
              />
            </div>

            {/* Scale/Zoom overlay slider */}
            <div className="h-14 border-t border-border bg-[#14161f] flex items-center justify-center px-6 z-50">
              <div className="w-full max-w-sm flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider shrink-0">Zoom Preset</span>
                <Slider 
                  value={[zoom]} 
                  min={1} 
                  max={3} 
                  step={0.1}
                  onValueChange={([val]) => setZoom(val)}
                  className="flex-1 cursor-ew-resize [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-400 [&_.bg-primary]:bg-blue-500"
                />
                <span className="text-[10px] font-mono font-bold text-blue-400 w-10 text-right shrink-0">{Math.round(zoom * 100)}%</span>
              </div>
            </div>
          </div>
        ) : activeImage ? (
          <LayerCanvas 
            image={activeImage} 
            scale={scale} 
            onScaleChange={setScale} 
          />
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-3">
            <ImageIcon className="h-12 w-12 opacity-20" />
            <p className="text-sm italic">Select an image from the tray to begin</p>
          </div>
        )}
      </div>

      {/* Bottom Controls Overlay */}
      {!showBgComparison && !activeCropPreset && activeImage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 z-30 pointer-events-none">
          <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-full py-3 px-6 shadow-2xl pointer-events-auto flex flex-col gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 flex-1">
                <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                <Slider 
                  value={[editorState.imageScale]} 
                  min={50} max={150} step={1}
                  onValueChange={([val]) => updateEditorState({ imageScale: val })}
                  className="flex-1"
                />
                <span className="text-[10px] font-mono w-8 text-right text-blue-400">{editorState.imageScale}%</span>
              </div>

              <div className="flex items-center gap-3 flex-1">
                <RotateCw className="h-3.5 w-3.5 text-muted-foreground" />
                <Slider 
                  value={[editorState.rotation]} 
                  min={-180} max={180} step={1}
                  onValueChange={([val]) => updateEditorState({ rotation: val })}
                  className="flex-1"
                />
                <span className="text-[10px] font-mono w-8 text-right text-blue-400">{editorState.rotation}°</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOTA BG-Pro Processing On-device overlay */}
      {isProcessingBg && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d0e12]/80 backdrop-blur-[3px]">
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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d0e12]/80 backdrop-blur-[3px]">
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
    </div>
  );
}
