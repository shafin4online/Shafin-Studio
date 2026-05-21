import React from 'react';
import { useStudio } from '@/context/StudioContext';
import { Layers, Eye, Lock } from 'lucide-react';

export function LayerPanel() {
  const { images, activeImageId } = useStudio();
  const activeImage = images.find(i => i.id === activeImageId);

  return (
    <div className="space-y-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-2">
        <Layers className="h-3.5 w-3.5" /> LAYERS
      </p>
      
      {activeImage ? (
        <div className="flex items-center gap-3 p-2 bg-primary/5 border border-primary/20 rounded-lg group">
          <div className="h-10 w-10 bg-muted rounded overflow-hidden border border-border/50">
            <img src={activeImage.edited} className="h-full w-full object-cover" alt="" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium truncate">{activeImage.name}</p>
            <p className="text-[9px] text-muted-foreground">Active Layer</p>
          </div>
          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <Eye className="h-3.5 w-3.5 cursor-pointer text-blue-400" />
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-muted-foreground py-6 text-center border border-dashed border-border/50 rounded-lg">
          No image selected
        </div>
      )}
    </div>
  );
}
