import React, { useRef, useEffect, useState } from 'react';
import { StudioImage } from '@/context/studioTypes';
import { useStudio } from '@/context/StudioContext';

interface LayerCanvasProps {
  image: StudioImage;
  scale: number;
  onScaleChange: (scale: number) => void;
}

export function LayerCanvas({ image, scale, onScaleChange }: LayerCanvasProps) {
  const { editorState } = useStudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image.edited;
    img.onload = () => {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw background if not transparent
      if (editorState.backgroundColor !== 'transparent') {
        ctx.fillStyle = editorState.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Apply filters
      const { brightness, contrast, saturation, hue, temperature } = editorState;
      
      // Combine CSS filters
      ctx.filter = `
        brightness(${brightness}%) 
        contrast(${contrast}%) 
        saturate(${saturation}%)
        hue-rotate(${hue}deg)
      `;

      // Draw image with rotation and internal scale
      const internalScale = editorState.imageScale / 100;
      const w = canvas.width * internalScale;
      const h = canvas.height * internalScale;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((editorState.rotation * Math.PI) / 180);
      
      // Temperature effect (tinting)
      if (temperature !== 0) {
        // Very basic tinting approximation
        const tintColor = temperature > 0 ? 'orange' : 'blue';
        const alpha = Math.abs(temperature) / 200;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.globalCompositeOperation = temperature > 0 ? 'overlay' : 'soft-light';
        ctx.fillStyle = tintColor;
        ctx.globalAlpha = alpha;
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
      
      ctx.restore();

      // Apply border
      if (editorState.borderEnabled) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = editorState.borderWidth * 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [image.edited, editorState]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt+Left
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      onScaleChange(Math.max(0.1, Math.min(3, scale + delta)));
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div 
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        className="shadow-2xl bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,_hsl(var(--studio-surface))_0%_50%)_50%_/_20px_20px]"
      >
        <canvas 
          ref={canvasRef}
          className="max-w-[none] block"
        />
      </div>
      
      <div className="absolute bottom-4 left-4 flex gap-2">
         <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-mono">
            {image.name} • {Math.round(canvasRef.current?.width || 0)}x{Math.round(canvasRef.current?.height || 0)}px
         </div>
      </div>
    </div>
  );
}
