import { useState, useEffect } from 'react';
import type { EditorState, StudioImage } from '@/context/studioTypes';
import { renderAdjustedImage } from '@/lib/batchRenderer';

interface UseBatchStateProps {
  images: StudioImage[];
  editorState: EditorState;
  batchUpdateEditedImages: (updates: { id: string; dataUrl: string }[], resetSliders: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function useBatchState({
  images,
  editorState,
  batchUpdateEditedImages,
  open,
  onOpenChange,
}: UseBatchStateProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bakeBackground, setBakeBackground] = useState(true);
  const [bakeBorders, setBakeBorders] = useState(true);
  const [resetSliders, setResetSliders] = useState(true);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [processingName, setProcessingName] = useState('');

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [interactiveCompareMode, setInteractiveCompareMode] = useState<'side' | 'layer'>('side');
  const [isHoveringLayer, setIsHoveringLayer] = useState(false);

  // Repopulate selected lists when dialogue opens
  useEffect(() => {
    if (open) {
      setSelectedIds(images.map(img => img.id));
      if (images.length > 0) {
        setPreviewId(images[0].id);
      }
    }
  }, [open, images]);

  // Render preview image in real-time when inputs change
  useEffect(() => {
    if (!open) return;
    
    // Automatically set fallback if preview ID is missing
    if (!previewId && images.length > 0) {
      setPreviewId(images[0].id);
      return;
    }

    const currentImg = images.find(img => img.id === previewId);
    if (!currentImg) {
      setPreviewUrl(null);
      return;
    }

    setIsPreviewLoading(true);

    const adjustments = {
      brightness: editorState.brightness,
      contrast: editorState.contrast,
      saturation: editorState.saturation,
      temperature: editorState.temperature,
      hue: editorState.hue,
      rotation: editorState.rotation,
      imageScale: editorState.imageScale,
      backgroundColor: bakeBackground ? editorState.backgroundColor : 'transparent',
      borderEnabled: bakeBorders ? editorState.borderEnabled : false,
      borderWidth: editorState.borderWidth,
    };

    let active = true;
    renderAdjustedImage(currentImg.edited, adjustments)
      .then(url => {
        if (active) {
          setPreviewUrl(url);
          setIsPreviewLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to render interactive preview:", err);
        if (active) {
          setIsPreviewLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    open,
    previewId,
    images,
    editorState.brightness,
    editorState.contrast,
    editorState.saturation,
    editorState.temperature,
    editorState.hue,
    editorState.rotation,
    editorState.imageScale,
    editorState.backgroundColor,
    editorState.borderEnabled,
    editorState.borderWidth,
    bakeBackground,
    bakeBorders
  ]);

  const toggleSelectAll = () => {
    if (selectedIds.length === images.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(images.map(img => img.id));
    }
  };

  const toggleSelectImage = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBatchApply = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    setProgressIndex(0);

    const updates: { id: string; dataUrl: string }[] = [];

    const adjustments = {
      brightness: editorState.brightness,
      contrast: editorState.contrast,
      saturation: editorState.saturation,
      temperature: editorState.temperature,
      hue: editorState.hue,
      rotation: editorState.rotation,
      imageScale: editorState.imageScale,
      backgroundColor: bakeBackground ? editorState.backgroundColor : 'transparent',
      borderEnabled: bakeBorders ? editorState.borderEnabled : false,
      borderWidth: editorState.borderWidth,
    };

    try {
      for (let i = 0; i < selectedIds.length; i++) {
        const targetId = selectedIds[i];
        const targetImg = images.find(img => img.id === targetId);
        if (!targetImg) continue;

        setProgressIndex(i + 1);
        setProcessingName(targetImg.name);
        
        await new Promise(resolve => setTimeout(resolve, 80));

        const outputDataUrl = await renderAdjustedImage(targetImg.edited, adjustments);
        updates.push({ id: targetId, dataUrl: outputDataUrl });
      }

      batchUpdateEditedImages(updates, resetSliders);
      onOpenChange(false);
    } catch (err) {
      console.error("Batch processing error:", err);
      alert(err instanceof Error ? err.message : "Error applying adjustments");
    } finally {
      setIsProcessing(false);
      setProgressIndex(0);
      setProcessingName('');
    }
  };

  return {
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
  };
}
