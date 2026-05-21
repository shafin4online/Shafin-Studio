import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EditorState, StudioImage } from './studioTypes';

interface StudioContextType {
  images: StudioImage[];
  activeImageId: string | null;
  editorState: EditorState;
  history: EditorState[];
  historyIndex: number;
  isLayerMode: boolean;
  setActiveImage: (id: string | null) => void;
  updateEditorState: (updates: Partial<EditorState>) => void;
  updateEditedImage: (id: string, dataUrl: string) => void;
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  setIsLayerMode: (val: boolean) => void;
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
  const [history, setHistory] = useState<EditorState[]>([initialEditorState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLayerMode, setIsLayerMode] = useState(false);

  const setActiveImage = (id: string | null) => setActiveImageId(id);

  const updateEditorState = (updates: Partial<EditorState>) => {
    setEditorState(prev => ({ ...prev, ...updates }));
  };

  const updateEditedImage = (id: string, dataUrl: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, edited: dataUrl } : img));
  };

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
    setImages(prev => [...prev, ...newImages]);
    if (!activeImageId && newImages.length > 0) setActiveImageId(newImages[0].id);
  }, [activeImageId]);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (activeImageId === id) setActiveImageId(null);
  };

  const pushHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...editorState });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setEditorState({ ...history[historyIndex - 1] });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setEditorState({ ...history[historyIndex + 1] });
    }
  };

  return (
    <StudioContext.Provider value={{
      images, activeImageId, editorState, history, historyIndex, isLayerMode,
      setActiveImage, updateEditorState, updateEditedImage, addImages, removeImage,
      undo, redo, pushHistory, setIsLayerMode
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
