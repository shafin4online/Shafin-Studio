import React from 'react';
import type { EditorState, StudioImage } from '@/context/studioTypes';
import { 
  Check, 
  Square, 
  CheckSquare, 
  Loader2, 
  Sliders, 
  Sun,
  Contrast,
  Droplets,
  Thermometer,
  Palette,
  Eye,
  Image as ImageIcon
} from 'lucide-react';

// Subcomponet 1: Active Edits Summary
interface BatchAdjustmentsSummaryProps {
  editorState: EditorState;
  hasAdjustments: boolean;
}

export const BatchAdjustmentsSummary: React.FC<BatchAdjustmentsSummaryProps> = ({ 
  editorState, 
  hasAdjustments 
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
        <Sliders className="h-3 w-3 text-indigo-400" />
        <span>Adjustments to apply:</span>
      </div>
      
      {!hasAdjustments ? (
        <p className="text-[11px] text-amber-400/80 italic">
          No adjustments set. Slide filters in the sidebar before entering batch mode.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400">
          {editorState.brightness !== 100 && (
            <div className="flex items-center gap-1 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-800">
              <Sun className="h-3 w-3 text-yellow-400 shrink-0" />
              <span className="truncate">Brightness: {editorState.brightness}%</span>
            </div>
          )}
          {editorState.contrast !== 100 && (
            <div className="flex items-center gap-1 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-800">
              <Contrast className="h-3 w-3 text-cyan-400 shrink-0" />
              <span className="truncate">Contrast: {editorState.contrast}%</span>
            </div>
          )}
          {editorState.saturation !== 100 && (
            <div className="flex items-center gap-1 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-800">
              <Droplets className="h-3 w-3 text-blue-400 shrink-0" />
              <span className="truncate">Saturation: {editorState.saturation}%</span>
            </div>
          )}
          {editorState.temperature !== 0 && (
            <div className="flex items-center gap-1 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-800">
              <Thermometer className="h-3 w-3 text-amber-500 shrink-0" />
              <span className="truncate">Temp: {editorState.temperature > 0 ? '+' : ''}{editorState.temperature}</span>
            </div>
          )}
          {editorState.hue !== 0 && (
            <div className="flex items-center gap-1 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-800">
              <Palette className="h-3 w-3 text-pink-500 shrink-0" />
              <span className="truncate">Hue: {editorState.hue}°</span>
            </div>
          )}
          {editorState.rotation !== 0 && (
            <div className="flex items-center gap-1 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-800">
              <span className="font-bold text-emerald-400 text-xs shrink-0">↻</span>
              <span className="truncate">Rotation: {editorState.rotation}°</span>
            </div>
          )}
          {editorState.imageScale !== 100 && (
            <div className="flex items-center gap-1 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-800">
              <span className="font-bold text-purple-400 text-xs shrink-0">±</span>
              <span className="truncate">Scale: {editorState.imageScale}%</span>
            </div>
          )}
          {editorState.backgroundColor !== 'transparent' && (
            <div className="flex items-center gap-0.5 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-800">
              <div className="h-2 w-2 rounded-full border border-slate-700 shrink-0" style={{ backgroundColor: editorState.backgroundColor }} />
              <span className="truncate text-[9.5px]">Bg: {editorState.backgroundColor}</span>
            </div>
          )}
          {editorState.borderEnabled && (
            <div className="flex items-center gap-1 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-800">
              <div className="h-2 w-2 border border-white shrink-0" />
              <span className="truncate">Border Frame</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Subcomponent 2: Selection Target list
interface BatchSelectionListProps {
  images: StudioImage[];
  selectedIds: string[];
  previewId: string | null;
  toggleSelectAll: () => void;
  toggleSelectImage: (id: string) => void;
  setPreviewId: (id: string) => void;
}

export const BatchSelectionList: React.FC<BatchSelectionListProps> = ({
  images,
  selectedIds,
  previewId,
  toggleSelectAll,
  toggleSelectImage,
  setPreviewId,
}) => {
  return (
    <div className="space-y-2 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300 uppercase tracking-wider">
          <ImageIcon className="h-3 w-3 text-indigo-400" />
          <span>Apply batch to ({selectedIds.length} of {images.length})</span>
        </div>
        
        <button 
          onClick={toggleSelectAll}
          type="button"
          className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline transition-colors font-semibold"
        >
          {selectedIds.length === images.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded">
          Tray is empty. Load some images first.
        </p>
      ) : (
        <div className="flex-1 overflow-y-auto studio-scrollbar p-1 bg-slate-900/20 border border-slate-800/50 rounded-lg space-y-1 max-h-[160px] md:max-h-none">
          {images.map(img => {
            const isSelected = selectedIds.includes(img.id);
            const isCurrentlyPreviewed = img.id === previewId;
            return (
              <div 
                key={img.id}
                className={`flex items-center gap-2.5 p-1.5 rounded-md border text-left cursor-pointer transition-all duration-200 group ${
                  isCurrentlyPreviewed 
                    ? 'border-indigo-500/80 bg-slate-900/80' 
                    : 'border-slate-850 hover:border-slate-800'
                }`}
              >
                {/* Selection Checkbox */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectImage(img.id);
                  }}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                >
                  {isSelected ? (
                    <CheckSquare className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-600" />
                  )}
                </div>

                {/* Image preview selectors */}
                <div 
                  className="flex-1 flex items-center gap-2 min-w-0"
                  onClick={() => setPreviewId(img.id)}
                >
                  <div className="relative shrink-0 w-8 h-8 rounded border border-slate-800 bg-slate-950 overflow-hidden">
                    <img src={img.thumbnail} alt={img.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pr-1 text-slate-300">
                    <p className={`text-[10px] truncate leading-tight transition-colors ${isCurrentlyPreviewed ? 'text-indigo-400 font-bold' : 'group-hover:text-slate-100'}`}>
                      {img.name}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      Click to preview
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


// Subcomponent 3: Interactive Gallery comparison pane
interface BatchPreviewGalleryProps {
  images: StudioImage[];
  selectedIds: string[];
  previewId: string | null;
  previewUrl: string | null;
  isPreviewLoading: boolean;
  interactiveCompareMode: 'side' | 'layer';
  isHoveringLayer: boolean;
  setPreviewId: (id: string) => void;
  setInteractiveCompareMode: (mode: 'side' | 'layer') => void;
  setIsHoveringLayer: (hover: boolean) => void;
}

export const BatchPreviewGallery: React.FC<BatchPreviewGalleryProps> = ({
  images,
  selectedIds,
  previewId,
  previewUrl,
  isPreviewLoading,
  interactiveCompareMode,
  isHoveringLayer,
  setPreviewId,
  setInteractiveCompareMode,
  setIsHoveringLayer,
}) => {
  const currentPreviewImage = images.find(img => img.id === previewId);

  return (
    <div className="md:col-span-7 bg-slate-900/30 border border-slate-800/80 rounded-xl p-3.5 flex flex-col space-y-3 min-h-[320px] md:min-h-0 overflow-hidden">
      
      {/* Header preview tool controls */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Eye className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">
            Preview: {currentPreviewImage ? currentPreviewImage.name : 'No image loaded'}
          </span>
        </div>

        <div className="flex rounded-md bg-slate-950/80 p-0.5 border border-slate-800/80 text-[10px]">
          <button
            type="button"
            onClick={() => setInteractiveCompareMode('side')}
            className={`px-2 py-1 rounded transition-colors ${interactiveCompareMode === 'side' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Side-by-side
          </button>
          <button
            type="button"
            onClick={() => setInteractiveCompareMode('layer')}
            className={`px-2 py-1 rounded transition-colors ${interactiveCompareMode === 'layer' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Hold to Compare
          </button>
        </div>
      </div>

      {/* Main Interactive Screen with state change preview */}
      <div className="flex-1 relative bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-2 min-h-[180px]">
        {isPreviewLoading && (
          <div className="absolute inset-0 bg-slate-950/70 z-10 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
            <span className="text-[10px] font-mono text-slate-400">Rendering preview state...</span>
          </div>
        )}

        {!currentPreviewImage ? (
          <p className="text-xs text-slate-500">Select an image thumbnail below or in the list to inspect</p>
        ) : (
          <>
            {interactiveCompareMode === 'side' ? (
              /* Side-by-Side Dual View */
              <div className="w-full h-full grid grid-cols-2 gap-2">
                {/* LEFT: Before */}
                <div className="relative border border-slate-900 bg-slate-900/10 rounded overflow-hidden flex flex-col justify-between items-center h-full min-h-0">
                  <div className="absolute top-1 left-1.5 z-10 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] font-semibold text-slate-400 select-none uppercase tracking-wider border border-slate-800">
                    Before (Tray Base)
                  </div>
                  <div className="flex-1 flex items-center justify-center w-full p-1 overflow-hidden">
                    <img 
                      src={currentPreviewImage.edited} 
                      alt="Base version" 
                      className="max-h-full max-w-full object-contain rounded select-none shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* RIGHT: Adjusted After Preview */}
                <div className="relative border border-slate-800 bg-slate-900/10 rounded overflow-hidden flex flex-col justify-between items-center h-full min-h-0">
                  <div className="absolute top-1 left-1.5 z-10 bg-indigo-950/90 px-1.5 py-0.5 rounded text-[8px] font-bold text-indigo-300 select-none uppercase tracking-wider border border-indigo-500/30">
                    Batch Adjust Result
                  </div>
                  <div className="flex-1 flex items-center justify-center w-full p-1 overflow-hidden_">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Batch Adjustment Preview" 
                        className="max-h-[180px] md:max-h-full max-w-full object-contain rounded select-none shadow-md transition-all duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-[10px] text-slate-600 font-mono">Loading...</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Layer Overlay Toggle View (Hover to see original) */
              <div 
                className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair select-none"
                onMouseDown={() => setIsHoveringLayer(true)}
                onMouseUp={() => setIsHoveringLayer(false)}
                onMouseLeave={() => setIsHoveringLayer(false)}
                onTouchStart={() => setIsHoveringLayer(true)}
                onTouchEnd={() => setIsHoveringLayer(false)}
              >
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 select-none">
                  <div className="bg-slate-950/90 px-1.5 py-0.5 rounded text-[8px] font-semibold text-slate-300 uppercase tracking-widest border border-slate-800 w-max">
                    Compare Mode: {isHoveringLayer ? 'PRE-ADJUSTED (ORIGINAL)' : 'PROPOSED ADJUSTMENT'}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium italic block bg-slate-950/60 px-1.5 py-0.5 rounded">
                    {isHoveringLayer ? 'Release to view adjustments' : 'Click/Hold anywhere inside to view Before state'}
                  </span>
                </div>

                <img 
                  src={isHoveringLayer ? currentPreviewImage.edited : (previewUrl || currentPreviewImage.edited)} 
                  alt="Interactive Compare Overlay" 
                  className="max-h-full max-w-full object-contain rounded-md shadow-2xl transition-all duration-100"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Gallery Mini Thumbnail Strip selection bar */}
      <div className="space-y-1 shrink-0">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
          Select image to inspect details:
        </span>
        
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 select-none studio-scrollbar">
          {images.map(img => {
            const isSelected = img.id === previewId;
            const isTargetedForBatch = selectedIds.includes(img.id);
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setPreviewId(img.id)}
                className={`relative shrink-0 w-11 h-11 rounded-lg border-2 bg-slate-950 overflow-hidden flex items-center justify-center p-0.5 transition-all ${
                  isSelected 
                    ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/10' 
                    : 'border-slate-880 opacity-60 hover:opacity-100'
                }`}
                title={img.name}
              >
                <img src={img.thumbnail} alt={img.name} className="w-full h-full object-cover rounded" />
                
                {/* Batch Action Active Indicator */}
                {isTargetedForBatch ? (
                  <div className="absolute bottom-0.5 right-0.5 bg-indigo-500 rounded-full p-0.5">
                    <Check className="h-1.5 w-1.5 text-white stroke-[4]" />
                  </div>
                ) : (
                  <div className="absolute bottom-0.5 right-0.5 bg-red-600 rounded-full p-0.5">
                    <div className="h-1.5 w-1.5 rounded-full" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
