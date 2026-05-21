import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { EditorState, StudioImage, CropPreset } from './studioTypes';
import { removeBackground } from '@imgly/background-removal';
import { Client } from '@gradio/client';

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

  // Actions
  setActiveImage: (id: string | null) => void;
  updateEditorState: (updates: Partial<EditorState>) => void;
  updateEditedImage: (id: string, dataUrl: string) => void;
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: (customImages?: StudioImage[], customEditorState?: EditorState) => void;
  setIsLayerMode: (val: boolean) => void;
  setActiveCropPreset: (preset: CropPreset | null) => void;
  
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

  const addImages = useCallback(async (files: File[]) => {
    const newImages: StudioImage[] = await Promise.all(
      files.map(async (file) => {
        const id = Math.random().toString(36).substring(7);
        const url = URL.createObjectURL(file);
        return {
          id,
          name: file.name,
          original: url,
          edited: url,
          thumbnail: url,
        };
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

      const resultBlob = await removeBackground(imageUrl, {
        output: {
          format: 'image/png',
          type: 'foreground',
        },
        progress: (key: string, current: number, total: number) => {
          let progressVal = 0;
          if (total && total > 0) {
            progressVal = Math.round((current / total) * 100);
          } else {
            progressVal = current ? Math.min(Math.round(current / 10000), 99) : 0;
          }
          setBgProgress(progressVal);
          
          if (key.includes('fetch')) {
            const part = key.split(':')[1] || '';
            setBgProgressKey(`Downloading neural network model ${part} (${progressVal}%)...`);
          } else if (key.includes('onnx')) {
            setBgProgressKey('Compiling WebAssembly AI model runtime...');
          } else if (key === 'processing') {
            setBgProgressKey('Analyzing transparency channels and smoothing borders...');
          } else {
            setBgProgressKey(`Processing: ${key}...`);
          }
        },
        signal: controller.signal
      });

      // Composite the image if solid background or custom feathering required
      let finalDataUrl = '';
      if (bgOutputMode === 'transparent' && edgeSmoothing === 0) {
        finalDataUrl = URL.createObjectURL(resultBlob);
      } else {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const im = new Image();
          im.crossOrigin = 'anonymous';
          im.onload = () => resolve(im);
          im.onerror = reject;
          im.src = URL.createObjectURL(resultBlob);
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;

        // Fill background
        if (bgOutputMode === 'white') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bgOutputMode === 'black') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Apply edge smoothing via slight shadow blur or custom composite drawing
        if (edgeSmoothing > 0) {
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
          ctx.shadowBlur = edgeSmoothing;
        }

        ctx.drawImage(img, 0, 0);
        finalDataUrl = canvas.toDataURL('image/png');
      }

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
    setEnhancerProgressKey('Connecting with Hugging Face Space (rmayormartins)...');

    const controller = new AbortController();
    enhancerAbortControllerRef.current = controller;

    try {
      const imageUrl = imgItem.edited;
      const resBlob = await fetch(imageUrl);
      const imageBlob = await resBlob.blob();

      setEnhancerProgressKey('Enhancing details & running neural upscaler...');
      const client = await Client.connect("rmayormartins/image-enhancer");

      if (controller.signal.aborted) {
        throw new Error('AbortError');
      }

      const result = await client.predict("/predict", [
        imageBlob,
        true, // enhance
        enhancerScale,
        enhancerDpi,
        enhancerDpiValue,
        enhancerResize,
        enhancerWidth,
        enhancerHeight
      ]);

      if (controller.signal.aborted) {
        throw new Error('AbortError');
      }

      setEnhancerProgressKey('Importing enhanced details...');
      
      const outputData = result.data[0];
      const outputUrl = typeof outputData === 'object' && outputData !== null && 'url' in outputData 
        ? (outputData as { url: string }).url 
        : (typeof outputData === 'string' ? outputData : null);

      if (!outputUrl) {
        throw new Error('Enhancer did not return a valid result URL');
      }

      const responseUrl = await fetch(outputUrl);
      const finalBlob = await responseUrl.blob();
      const localResultUrl = URL.createObjectURL(finalBlob);

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
      setActiveImage, updateEditorState, updateEditedImage, addImages, removeImage,
      undo, redo, pushHistory, setIsLayerMode, setActiveCropPreset,
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
