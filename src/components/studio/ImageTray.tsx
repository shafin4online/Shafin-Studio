import React from 'react';
import { StudioImage } from '@/context/studioTypes';
import { Plus, X, Sparkles } from 'lucide-react';

interface ImageTrayProps {
  images: StudioImage[];
  activeImageId: string | null;
  onSelectImage: (id: string | null) => void;
  onRemoveImage: (id: string) => void;
  onMergeOpen: () => void;
  onLayerMode: () => void;
  onBatchOpen: () => void;
}

export function ImageTray({ images, activeImageId, onSelectImage, onRemoveImage, onMergeOpen, onLayerMode, onBatchOpen }: ImageTrayProps) {
  return (
    <div className="p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Image Tray</p>
      <div className="flex flex-wrap gap-2">
        {images.map(img => (
          <div 
            key={img.id} 
            className={`relative w-12 h-12 rounded border cursor-pointer ${activeImageId === img.id ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
            onClick={() => onSelectImage(img.id)}
          >
            <img src={img.thumbnail} className="w-full h-full object-cover rounded" />
            <button 
              onClick={(e) => { e.stopPropagation(); onRemoveImage(img.id); }}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-2 w-2" />
            </button>
          </div>
        ))}
        <button className="w-12 h-12 rounded border border-dashed flex items-center justify-center hover:bg-muted">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="mt-3 flex gap-1 flex-wrap">
        <button onClick={onMergeOpen} className="text-[10px] px-2 py-1 bg-secondary rounded hover:bg-secondary/80">Merge</button>
        <button onClick={onLayerMode} className="text-[10px] px-2 py-1 bg-secondary rounded hover:bg-secondary/80">Layers</button>
        <button onClick={onBatchOpen} className="text-[10px] px-2 py-1 bg-[#4f46e5]/90 hover:bg-[#4f46e5] text-white font-semibold rounded flex items-center gap-1 transition-colors">
          <Sparkles className="h-2.5 w-2.5 text-indigo-200" />
          Batch Edit
        </button>
      </div>
    </div>
  );
}
