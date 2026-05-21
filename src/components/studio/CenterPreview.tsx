import React, { useState, useRef } from 'react';
import { useStudio } from '@/context/StudioContext';
import { LayerCanvas } from './LayerCanvas';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Upload, ImageIcon, Maximize2, Minimize2, ZoomIn, ZoomOut, Zap, RotateCw } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

export function CenterPreview() {
  const { images, activeImageId, addImages, updateEditedImage, editorState, updateEditorState } = useStudio();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeImage = images.find(i => i.id === activeImageId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addImages(Array.from(e.target.files));
    }
  };

  const handleBgRemoval = async () => {
    if (!activeImage) return;
    setIsProcessing(true);
    try {
      const blob = await removeBackground(activeImage.original);
      const url = URL.createObjectURL(blob);
      updateEditedImage(activeImage.id, url);
    } catch (error) {
      console.error('BG Removal failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const onZoomIn = () => setScale(s => Math.min(s + 0.1, 3));
  const onZoomOut = () => setScale(s => Math.max(s - 0.1, 0.1));
  const onResetZoom = () => setScale(1);

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
        {activeImage ? (
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

      {isProcessing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
          <div className="bg-card p-6 rounded-xl border shadow-xl flex flex-col items-center gap-4 max-w-xs text-center">
            <Zap className="h-8 w-8 text-primary animate-bounce" />
            <div>
              <p className="font-semibold">Removing Background...</p>
              <p className="text-xs text-muted-foreground mt-1">This uses SOTA AI on your device. Please wait.</p>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
