import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStudio } from '@/context/StudioContext';
import { Loader2, Sparkles, Info } from 'lucide-react';
import { 
  BatchAdjustmentsSummary, 
  BatchSelectionList, 
  BatchPreviewGallery 
} from './BatchSubComponents';
import { useBatchState } from './useBatchState';

interface BatchProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchProcessDialog({ open, onOpenChange }: BatchProcessDialogProps) {
  const { 
    images, 
    editorState, 
    batchUpdateEditedImages 
  } = useStudio();

  const {
    selectedIds,
    bakeBackground,
    setBakeBackground,
    bakeBorders,
    setBakeBorders,
    resetSliders,
    setResetSliders,
    isProcessing,
    progressIndex,
    processingName,
    previewId,
    setPreviewId,
    previewUrl,
    isPreviewLoading,
    interactiveCompareMode,
    setInteractiveCompareMode,
    isHoveringLayer,
    setIsHoveringLayer,
    toggleSelectAll,
    toggleSelectImage,
    handleBatchApply,
  } = useBatchState({
    images,
    editorState,
    batchUpdateEditedImages,
    open,
    onOpenChange,
  });

  const hasAdjustments = 
    editorState.brightness !== 100 ||
    editorState.contrast !== 100 ||
    editorState.saturation !== 100 ||
    editorState.temperature !== 0 ||
    editorState.hue !== 0 ||
    editorState.rotation !== 0 ||
    editorState.imageScale !== 100 ||
    editorState.backgroundColor !== 'transparent' ||
    editorState.borderEnabled;

  return (
    <Dialog open={open} onOpenChange={isProcessing ? () => {} : onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0e1117] border-slate-800 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <DialogHeader className="pb-2 border-b border-slate-800">
          <DialogTitle className="text-md flex items-center gap-2 text-indigo-400 font-bold">
            <Sparkles className="h-4 w-4" /> Batch processing adjustments
          </DialogTitle>
          <DialogDescription className="text-[11px] text-slate-400">
            Apply current slider edits, filters, and backgrounds simultaneously to multiple selected images with a live preview.
          </DialogDescription>
        </DialogHeader>

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 flex-1">
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-14 w-14 text-indigo-500 animate-spin" />
              <span className="absolute font-mono text-xs text-indigo-300 font-bold leading-none">
                {Math.round((progressIndex / selectedIds.length) * 100)}%
              </span>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Processing {progressIndex} of {selectedIds.length}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1 italic max-w-sm truncate px-4">
                "{processingName}"
              </p>
            </div>

            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(progressIndex / selectedIds.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 overflow-hidden min-h-0 py-3">
            
            <div className="md:col-span-5 flex flex-col space-y-4 overflow-y-auto pr-2 studio-scrollbar min-h-0">
              <BatchAdjustmentsSummary 
                editorState={editorState} 
                hasAdjustments={hasAdjustments} 
              />

              <BatchSelectionList 
                images={images}
                selectedIds={selectedIds}
                previewId={previewId}
                toggleSelectAll={toggleSelectAll}
                toggleSelectImage={toggleSelectImage}
                setPreviewId={setPreviewId}
              />

              {/* Rendering Settings */}
              <div className="border-t border-slate-800/80 pt-3 space-y-2 text-[11px] text-slate-300 shrink-0">
                <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[9.5px]">Rendering Settings</span>
                
                <div className="space-y-1.5 text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                    <input 
                      type="checkbox" 
                      checked={bakeBackground}
                      onChange={(e) => setBakeBackground(e.target.checked)}
                      disabled={editorState.backgroundColor === 'transparent'}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-accent-indigo h-3.5 w-3.5"
                    />
                    <span>Bake custom matte backgrounds ({editorState.backgroundColor})</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                    <input 
                      type="checkbox" 
                      checked={bakeBorders}
                      onChange={(e) => setBakeBorders(e.target.checked)}
                      disabled={!editorState.borderEnabled}
                      className="rounded border-slate-805 bg-slate-950 text-indigo-600 focus:ring-accent-indigo h-3.5 w-3.5"
                    />
                    <span>Bake active border outline frames</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                    <input 
                      type="checkbox" 
                      checked={resetSliders}
                      onChange={(e) => setResetSliders(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-accent-indigo h-3.5 w-3.5"
                    />
                    <span className="text-slate-300">Reset editor slider offsets to defaults afterwards</span>
                  </label>
                </div>
              </div>
            </div>

            <BatchPreviewGallery 
              images={images}
              selectedIds={selectedIds}
              previewId={previewId}
              previewUrl={previewUrl}
              isPreviewLoading={isPreviewLoading}
              interactiveCompareMode={interactiveCompareMode}
              isHoveringLayer={isHoveringLayer}
              setPreviewId={setPreviewId}
              setInteractiveCompareMode={setInteractiveCompareMode}
              setIsHoveringLayer={setIsHoveringLayer}
            />

          </div>
        )}

        <DialogFooter className="pt-2 border-t border-slate-800 gap-2 shrink-0">
          <div className="flex-1 flex items-center justify-start gap-1 text-[10px] text-slate-500">
            <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Updates are committed as undoable history checkpoints.</span>
          </div>

          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 h-8 text-[11px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBatchApply}
            disabled={isProcessing || !hasAdjustments || selectedIds.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-8 text-[11px] px-4"
          >
            {isProcessing ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 mr-0.5 text-indigo-200 animate-pulse" />
                Apply to {selectedIds.length} Images
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
