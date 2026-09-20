import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { EditorState, StudioImage, CropPreset, PrintSlot, ImageInput } from './studioTypes';
import { processBackgroundRemoval } from './bgProService';
import { processImageEnhancement } from './enhancerService';
import { optimizeUploadImage } from '@/lib/imageOptimizer';

export interface HistoryItem {
  editorState: EditorState;
  images: StudioImage[];
}

interface StudioContextType {
  images: StudioImage[];
  activeImageId: string | null;
  editorState: EditorState;
  history: HistoryItem[];
  historyIndex: number;
  isLayerMode: boolean;
  activeCropPreset: CropPreset | null;
  
  // BG-Pro State
  isProcessingBg: boolean;
  bgProgress: number;
  bgProgressKey: string;
  bgOutputMode: 'transparent' | 'white' | 'black';
  edgeSmoothing: number;
  bgModelStatus: 'ready' | 'download';
  bgBeforeUrl: string | null;
  bgAfterUrl: string | null;
  showBgComparison: boolean;

  // AI Image Enhancer State
  isProcessingEnhancer: boolean;
  enhancerProgressKey: string;
  enhancerScale: '2x' | '4x' | '8x';
  enhancerDpi: boolean;
  enhancerDpiValue: number;
  enhancerResize: boolean;
  enhancerWidth: number;
  enhancerHeight: number;
  showEnhancerComparison: boolean;
  enhancerBeforeUrl: string | null;
  enhancerAfterUrl: string | null;

  isPerspectiveCropOpen: boolean;
  setIsPerspectiveCropOpen: (open: boolean) => void;

  mobileLeftOpen: boolean;
  setMobileLeftOpen: (open: boolean) => void;
  mobileRightOpen: boolean;
  setMobileRightOpen: (open: boolean) => void;

  // Active View (Classic Studio vs AI Editor)
  activeView: 'studio' | 'ai-editor';
  setActiveView: (view: 'studio' | 'ai-editor') => void;

  // Print Sheet Configuration (Persisted)
  printSlots: PrintSlot[];
  setPrintSlots: (slots: PrintSlot[]) => void;
  printPage: { widthMm: number; heightMm: number };
  setPrintPage: (page: { widthMm: number; heightMm: number }) => void;
  printGap: number;
  setPrintGap: (gap: number) => void;

  // Actions
  setActiveImage: (id: string | null) => void;
  updateEditorState: (updates: Partial<EditorState>) => void;
  updateEditedImage: (id: string, dataUrl: string) => void;
  addImages: (files: (ImageInput | string)[]) => void;
  addStudioImage: (image: StudioImage) => void;
  removeImage: (id: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: (customImages?: StudioImage[], customEditorState?: EditorState) => void;
  setIsLayerMode: (val: boolean) => void;
  setActiveCropPreset: (preset: CropPreset | null) => void;
  batchUpdateEditedImages: (updates: { id: string; dataUrl: string; }[], resetSliders: boolean) => void;
  batchOpen: boolean;
  setBatchOpen: (open: boolean) => void;
  
  // BG-Pro Functions
  setBgOutputMode: (mode: 'transparent' | 'white' | 'black') => void;
  setEdgeSmoothing: (val: number) => void;
  runBgPro: (imageId: string) => Promise<void>;
  cancelBgPro: () => void;
  setShowBgComparison: (val: boolean) => void;

  // AI Image Enhancer Functions
  setEnhancerScale: (val: '2x' | '4x' | '8x') => void;
  setEnhancerDpi: (val: boolean) => void;
  setEnhancerDpiValue: (val: number) => void;
  setEnhancerResize: (val: boolean) => void;
  setEnhancerWidth: (val: number) => void;
  setEnhancerHeight: (val: number) => void;
  runImageEnhancer: (imageId: string) => Promise<void>;
  cancelImageEnhancer: () => void;
  setShowEnhancerComparison: (val: boolean) => void;
}

const initialEditorState: EditorState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  temperature: 0,
  hue: 0,
  sharpness: 0,
  rotation: 0,
  imageScale: 100,
  backgroundColor: 'transparent',
  borderEnabled: false,
  borderWidth: 2,
  edgeSharp: 0,
  despill: false,
};

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<StudioImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState>(initialEditorState);
  
  // History is a combination of EditorState and current Images
  const [history, setHistory] = useState<HistoryItem[]>([{ editorState: initialEditorState, images: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLayerMode, setIsLayerMode] = useState(false);
  const [activeCropPreset, setActiveCropPreset] = useState<CropPreset | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);

  // BG-Pro states
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);
  const [bgProgressKey, setBgProgressKey] = useState('');
  const [bgOutputMode, setBgOutputMode] = useState<'transparent' | 'white' | 'black'>('transparent');
  const [edgeSmoothing, setEdgeSmoothing] = useState(0);
  const [bgModelStatus, setBgModelStatus] = useState<'ready' | 'download'>('download');
  const [bgBeforeUrl, setBgBeforeUrl] = useState<string | null>(null);
  const [bgAfterUrl, setBgAfterUrl] = useState<string | null>(null);
  const [showBgComparison, setShowBgComparison] = useState(false);

  // AI Image Enhancer states
  const [isProcessingEnhancer, setIsProcessingEnhancer] = useState(false);
  const [enhancerProgressKey, setEnhancerProgressKey] = useState('');
  const [enhancerScale, setEnhancerScale] = useState<'2x' | '4x' | '8x'>('4x');
  const [enhancerDpi, setEnhancerDpi] = useState(false);
  const [enhancerDpiValue, setEnhancerDpiValue] = useState(300);
  const [enhancerResize, setEnhancerResize] = useState(false);
  const [enhancerWidth, setEnhancerWidth] = useState(512);
  const [enhancerHeight, setEnhancerHeight] = useState(512);
  const [showEnhancerComparison, setShowEnhancerComparison] = useState(false);
  const [enhancerBeforeUrl, setEnhancerBeforeUrl] = useState<string | null>(null);
  const [enhancerAfterUrl, setEnhancerAfterUrl] = useState<string | null>(null);

  const [isPerspectiveCropOpen, setIsPerspectiveCropOpen] = useState(false);

  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  // Active View (Classic Studio vs AI Editor)
  const [activeView, setActiveView] = useState<'studio' | 'ai-editor'>('studio');

  // Print sheet configuration persisted states
  const [printSlots, setPrintSlotsState] = useState<PrintSlot[]>(() => {
    const saved = localStorage.getItem('studio_print_slots');
    return saved ? JSON.parse(saved) : [{ presetIndex: 0, count: 4 }];
  });

  const [printPage, setPrintPageState] = useState<{ widthMm: number; heightMm: number }>(() => {
    const saved = localStorage.getItem('studio_print_page');
    return saved ? JSON.parse(saved) : { widthMm: 210, heightMm: 297 };
  });

  const [printGap, setPrintGapState] = useState<number>(() => {
    const saved = localStorage.getItem('studio_print_gap');
    return saved ? parseInt(saved) : 2;
  });

  const setPrintSlots = useCallback((newValue: PrintSlot[]) => {
    setPrintSlotsState(newValue);
    localStorage.setItem('studio_print_slots', JSON.stringify(newValue));
  }, []);

  const setPrintPage = useCallback((newValue: { widthMm: number; heightMm: number }) => {
    setPrintPageState(newValue);
    localStorage.setItem('studio_print_page', JSON.stringify(newValue));
  }, []);

  const setPrintGap = useCallback((newValue: number) => {
    setPrintGapState(newValue);
    localStorage.setItem('studio_print_gap', newValue.toString());
  }, []);

  const abortControllerRef = useRef<AbortController | null>(null);
  const enhancerAbortControllerRef = useRef<AbortController | null>(null);

  // Check if model has been downloaded previously
  useEffect(() => {
    const isDownloaded = localStorage.getItem('bg_pro_model_downloaded') === 'true';
    if (isDownloaded) {
      setBgModelStatus('ready');
    }
  }, []);

  const setActiveImage = (id: string | null) => setActiveImageId(id);

  const updateEditorState = (updates: Partial<EditorState>) => {
    setEditorState(prev => ({ ...prev, ...updates }));
  };

  const updateEditedImage = (id: string, dataUrl: string) => {
    setImages(prev => {
      const updated = prev.map(img => img.id === id ? { ...img, edited: dataUrl } : img);
      return updated;
    });
  };

  const batchUpdateEditedImages = (updates: { id: string; dataUrl: string; }[], resetSliders: boolean) => {
    setImages(prev => {
      const updated = prev.map(img => {
        const up = updates.find(u => u.id === img.id);
        return up ? { ...img, edited: up.dataUrl, thumbnail: up.dataUrl } : img;
      });

      const nextEditorState = resetSliders ? initialEditorState : editorState;

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        editorState: { ...nextEditorState },
        images: updated.map(img => ({ ...img }))
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      if (resetSliders) {
        setEditorState(nextEditorState);
      }

      return updated;
    });
  };

  const pushHistory = useCallback((customImages?: StudioImage[], customEditorState?: EditorState) => {
    const activeImages = customImages || images;
    const activeState = customEditorState || editorState;
    const newHistory = history.slice(0, historyIndex + 1);

    newHistory.push({
      editorState: { ...activeState },
      images: activeImages.map(img => ({ ...img }))
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [images, editorState, history, historyIndex]);

  const addStudioImage = useCallback((image: StudioImage) => {
    setImages(prev => {
      const updated = [...prev, image];
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        editorState: { ...editorState },
        images: updated.map(img => ({ ...img }))
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return updated;
    });
    setActiveImageId(image.id);
  }, [editorState, history, historyIndex]);

  const addImages = useCallback(async (files: (ImageInput | string)[]) => {
    const newImages: StudioImage[] = await Promise.all(
      files.map(async (file) => {
        // 1. If item is already a StudioImage or has image URL properties
        if (file && typeof file === 'object' && !(file instanceof Blob)) {
          const item = file as Record<string, unknown>;
          const id = (typeof item.id === 'string' && item.id) ? item.id : `img-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          const src = typeof item.original === 'string' ? item.original 
            : typeof item.originalUrl === 'string' ? item.originalUrl
            : typeof item.edited === 'string' ? item.edited
            : typeof item.editedUrl === 'string' ? item.editedUrl
            : '';
          const name = typeof item.name === 'string' ? item.name : `Studio_Photo_${Date.now()}.png`;
          const edited = typeof item.edited === 'string' ? item.edited : typeof item.editedUrl === 'string' ? item.editedUrl : src;
          const thumb = typeof item.thumbnail === 'string' ? item.thumbnail : src;
          return {
            id,
            name,
            original: src,
            edited,
            thumbnail: thumb,
          };
        }

        // 2. If item is a direct string (dataURL or web URL)
        if (typeof file === 'string') {
          const id = `img-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          return {
            id,
            name: `Photo_${Date.now()}.png`,
            original: file,
            edited: file,
            thumbnail: file,
          };
        }

        // 3. If item is a standard Blob / File
        const id = Math.random().toString(36).substring(7);
        try {
          const optimizedFile = await optimizeUploadImage(file);
          const url = (optimizedFile instanceof Blob) ? URL.createObjectURL(optimizedFile) : '';
          return {
            id,
            name: (optimizedFile as File).name || `Photo_${Date.now()}.png`,
            original: url,
            edited: url,
            thumbnail: url,
          };
        } catch (e) {
          console.warn('[StudioContext] Error optimizing file, falling back to direct URL:', e);
          const url = (file instanceof Blob) ? URL.createObjectURL(file) : '';
          return {
            id,
            name: (file as File)?.name || `Photo_${Date.now()}.png`,
            original: url,
            edited: url,
            thumbnail: url,
          };
        }
      })
    );
    setImages(prev => {
      const updated = [...prev, ...newImages];
      
      // Update history immediately upon adding images
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        editorState: { ...editorState },
        images: updated.map(img => ({ ...img }))
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      return updated;
    });
    if (!activeImageId && newImages.length > 0) setActiveImageId(newImages[0].id);
  }, [activeImageId, editorState, history, historyIndex]);

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        editorState: { ...editorState },
        images: updated.map(img => ({ ...img }))
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return updated;
    });
    if (activeImageId === id) setActiveImageId(null);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevItem = history[historyIndex - 1];
      setHistoryIndex(prev => prev - 1);
      setEditorState({ ...prevItem.editorState });
      setImages(prevItem.images.map(img => ({ ...img })));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextItem = history[historyIndex + 1];
      setHistoryIndex(prev => prev + 1);
      setEditorState({ ...nextItem.editorState });
      setImages(nextItem.images.map(img => ({ ...img })));
    }
  };

  const cancelBgPro = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessingBg(false);
    setBgProgress(0);
    setBgProgressKey('');
  };

  const runBgPro = async (imageId: string) => {
    const imgItem = images.find(img => img.id === imageId);
    if (!imgItem) return;

    setIsProcessingBg(true);
    setBgProgress(0);
    setBgProgressKey('Initializing model setup...');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const imageUrl = imgItem.edited;
      const finalDataUrl = await processBackgroundRemoval({
        imageUrl,
        bgOutputMode,
        edgeSmoothing,
        onProgress: (keyLabel, progressVal) => {
          setBgProgressKey(keyLabel);
          setBgProgress(progressVal);
        },
        signal: controller.signal,
      });

      // Mark model as downloaded
      localStorage.setItem('bg_pro_model_downloaded', 'true');
      setBgModelStatus('ready');

      // Update local images and save state into history
      setImages(prev => {
        const updated = prev.map(img => img.id === imageId ? { ...img, edited: finalDataUrl } : img);
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          editorState: { ...editorState },
          images: updated.map(img => ({ ...img }))
        });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        
        return updated;
      });

      // Show Before/After comparison
      setBgBeforeUrl(imageUrl);
      setBgAfterUrl(finalDataUrl);
      setShowBgComparison(true);

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Background removal canceled by user.');
      } else {
        console.error('Background removal failed:', err);
      }
    } finally {
      setIsProcessingBg(false);
      setBgProgress(0);
      setBgProgressKey('');
      abortControllerRef.current = null;
    }
  };

  const cancelImageEnhancer = () => {
    if (enhancerAbortControllerRef.current) {
      enhancerAbortControllerRef.current.abort();
      enhancerAbortControllerRef.current = null;
    }
    setIsProcessingEnhancer(false);
    setEnhancerProgressKey('');
  };

  const runImageEnhancer = async (imageId: string) => {
    const imgItem = images.find(img => img.id === imageId);
    if (!imgItem) return;

    setIsProcessingEnhancer(true);
    setEnhancerProgressKey('Preparing image and setting up proxy connection...');

    const controller = new AbortController();
    enhancerAbortControllerRef.current = controller;

    try {
      const imageUrl = imgItem.edited;
      const localResultUrl = await processImageEnhancement({
        imageUrl,
        enhancerScale,
        enhancerDpi,
        enhancerDpiValue,
        enhancerResize,
        enhancerWidth,
        enhancerHeight,
        onProgress: (keyLabel) => setEnhancerProgressKey(keyLabel),
        signal: controller.signal,
      });

      // Update image and push history
      setImages(prev => {
        const updated = prev.map(img => img.id === imageId ? { ...img, edited: localResultUrl } : img);
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          editorState: { ...editorState },
          images: updated.map(img => ({ ...img }))
        });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        
        return updated;
      });

      // Show Before/After Comparison
      setEnhancerBeforeUrl(imageUrl);
      setEnhancerAfterUrl(localResultUrl);
      setShowEnhancerComparison(true);

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Enhancement canceled by user.');
      } else {
        console.error('Enhancement failed:', err);
        alert(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setIsProcessingEnhancer(false);
      setEnhancerProgressKey('');
      enhancerAbortControllerRef.current = null;
    }
  };

  return (
    <StudioContext.Provider value={{
      images, activeImageId, editorState, history, historyIndex, isLayerMode, activeCropPreset,
      isProcessingBg, bgProgress, bgProgressKey, bgOutputMode, edgeSmoothing, bgModelStatus,
      bgBeforeUrl, bgAfterUrl, showBgComparison,
      isProcessingEnhancer, enhancerProgressKey, enhancerScale, enhancerDpi, enhancerDpiValue,
      enhancerResize, enhancerWidth, enhancerHeight, showEnhancerComparison, enhancerBeforeUrl, enhancerAfterUrl,
      isPerspectiveCropOpen, setIsPerspectiveCropOpen,
      mobileLeftOpen, setMobileLeftOpen, mobileRightOpen, setMobileRightOpen,
      activeView, setActiveView,
      printSlots, setPrintSlots, printPage, setPrintPage, printGap, setPrintGap,
      setActiveImage, updateEditorState, updateEditedImage, addImages, addStudioImage, removeImage,
      undo, redo, pushHistory, setIsLayerMode, setActiveCropPreset, batchUpdateEditedImages, batchOpen, setBatchOpen,
      setBgOutputMode, setEdgeSmoothing, runBgPro, cancelBgPro, setShowBgComparison,
      setEnhancerScale, setEnhancerDpi, setEnhancerDpiValue, setEnhancerResize, setEnhancerWidth, setEnhancerHeight,
      runImageEnhancer, cancelImageEnhancer, setShowEnhancerComparison
    }}>
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) throw new Error('useStudio must be used within a StudioProvider');
  return context;
};
