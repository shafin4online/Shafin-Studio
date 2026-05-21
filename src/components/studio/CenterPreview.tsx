import React, { useState, useRef } from 'react';
import { useStudio } from '@/context/StudioContext';
import { LayerCanvas } from './LayerCanvas';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ImageIcon, Maximize2, RotateCw } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropUtils';
import { 
  CenterPreviewEmpty, 
  CenterPreviewComparison, 
  CenterPreviewOverlayModals 
} from './CenterPreviewSubComponents';

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
    showBgComparison,
    setShowBgComparison,
    bgBeforeUrl,
    bgAfterUrl,
    showEnhancerComparison,
    setShowEnhancerComparison,
    enhancerBeforeUrl,
    enhancerAfterUrl,
    undo,
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
    if (e.buttons !== 1) return;
    if (!containerCompareRef.current) return;
    const rect = containerCompareRef.current.getBoundingClientRect();
    const offset = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offset / rect.width) * 100));
    setSliderPos(percentage);
  };

  if (images.length === 0) {
    return (
      <CenterPreviewEmpty 
        onBrowseClick={() => fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files) addImages(Array.from(e.dataTransfer.files));
        }}
      />
    );
  }

  const showAnyComparison = (showEnhancerComparison && enhancerBeforeUrl && enhancerAfterUrl) || (showBgComparison && bgBeforeUrl && bgAfterUrl);

  return (
    <div className="flex-1 flex flex-col bg-[#0f1116] relative overflow-hidden select-none">
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {showEnhancerComparison && enhancerBeforeUrl && enhancerAfterUrl ? (
          <CenterPreviewComparison
            type="enhancer"
            beforeUrl={enhancerBeforeUrl}
            afterUrl={enhancerAfterUrl}
            sliderPos={sliderPos}
            containerRef={containerCompareRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onClose={() => setShowEnhancerComparison(false)}
            onRevert={() => {
              undo();
              setShowEnhancerComparison(false);
            }}
          />
        ) : showBgComparison && bgBeforeUrl && bgAfterUrl ? (
          <CenterPreviewComparison
            type="bg"
            beforeUrl={bgBeforeUrl}
            afterUrl={bgAfterUrl}
            sliderPos={sliderPos}
            containerRef={containerCompareRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onClose={() => setShowBgComparison(false)}
            onRevert={() => {
              undo();
              setShowBgComparison(false);
            }}
          />
        ) : activeCropPreset && activeImage ? (
          <div className="absolute inset-0 bg-[#0d0e12] z-40 flex flex-col">
            {/* Crop Header Control Bar */}
            <div className="h-14 border-b border-border bg-[#14161f] flex items-center justify-between px-6 z-50 shrink-0">
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

            {/* Cropper Area */}
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

            {/* Zoom slider */}
            <div className="h-14 border-t border-border bg-[#14161f] flex items-center justify-center px-6 z-50 shrink-0">
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

      {/* Bottom controls overlay */}
      {!showAnyComparison && !activeCropPreset && activeImage && (
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

      {/* Real-time Processing Overlay Screen */}
      <CenterPreviewOverlayModals />
    </div>
  );
}
