import React, { useState, useCallback } from 'react';
import { useStudio } from '@/context/StudioContext';
import { Printer, Download, Archive } from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { PrintSheetDialog, PRINT_PRESETS } from './PrintSheetDialog';
import { PrintAllDialog } from './PrintAllDialog';
import type { PrintSlot } from './PrintSheetDialog';

export function RightSidebarExportPanel() {
  const {
    images,
    activeImageId,
    editorState,
    addImages,
    setMobileRightOpen,
  } = useStudio();

  const activeImage = images.find(i => i.id === activeImageId);
  const [printOpen, setPrintOpen] = useState(false);
  const [printAllOpen, setPrintAllOpen] = useState(false);

  // Core canvas rendering generator
  const getRenderedCanvas = useCallback((targetW?: number, targetH?: number, forceTransparent?: boolean): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      if (!activeImage) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = activeImage.edited;
      img.onload = () => {
        const w = targetW || img.width;
        const h = targetH || img.height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;

        if (!forceTransparent && editorState.backgroundColor !== 'transparent') {
          ctx.fillStyle = editorState.backgroundColor;
          ctx.fillRect(0, 0, w, h);
        } else {
          ctx.clearRect(0, 0, w, h);
        }

        ctx.filter = `brightness(${editorState.brightness}%) contrast(${editorState.contrast}%) saturate(${editorState.saturation}%)`;
        const scale = editorState.imageScale / 100;
        const scaledW = w * scale;
        const scaledH = h * scale;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((editorState.rotation * Math.PI) / 180);
        ctx.drawImage(img, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
        ctx.restore();

        if (editorState.borderEnabled) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = editorState.borderWidth * 2;
          ctx.strokeRect(0, 0, w, h);
        }

        resolve(canvas);
      };
    });
  }, [activeImage, editorState]);

  const handleDownload = async () => {
    if (!activeImage) return;
    const canvas = await getRenderedCanvas();
    canvas.toBlob(blob => {
      if (blob) saveAs(blob, `edited-${activeImage.name}`);
    }, 'image/png');
  };

  const handleDownloadTransparent = async () => {
    if (!activeImage) return;
    const baseName = activeImage.name.replace(/\.[^.]+$/, '');
    const canvas = await getRenderedCanvas(undefined, undefined, true);
    canvas.toBlob(blob => {
      if (blob) {
        saveAs(blob, `${baseName}-transparent.png`);
      }
    }, 'image/png');
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    const zip = new JSZip();
    for (const img of images) {
      const response = await fetch(img.edited);
      const blob = await response.blob();
      zip.file(`edited-${img.name}`, blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'photo-studio-export.zip');
  };

  const handlePrintSheet = async (slots: PrintSlot[], page: { widthMm: number; heightMm: number }, printGap: number) => {
    if (!activeImage) return;
    const slotImages: { preset: typeof PRINT_PRESETS[0]; dataUrl: string; count: number }[] = [];
    for (const slot of slots) {
      const preset = PRINT_PRESETS[slot.presetIndex];
      const canvas = await getRenderedCanvas(preset.widthPx, preset.heightPx);
      slotImages.push({ preset, dataUrl: canvas.toDataURL('image/png'), count: slot.count });
    }

    let imagesHtml = '';
    for (const { preset, dataUrl, count } of slotImages) {
      for (let i = 0; i < count; i++) {
        imagesHtml += `<div class="photo" style="width:${preset.widthMm}mm;height:${preset.heightMm}mm;"><img src="${dataUrl}" /></div>`;
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>Print Sheet</title>
          <style>
             @page { size: ${page.widthMm}mm ${page.heightMm}mm; margin: 2mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; flex-wrap: wrap; gap: ${printGap}mm; align-content: flex-start; padding: ${printGap}mm; }
            .photo { overflow: hidden; flex-shrink: 0; border: 0.3mm solid #999; }
            .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
          </style>
        </head>
        <body>
          ${imagesHtml}
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setPrintOpen(false);
  };

  const handlePrintAll = async (presetIndex: number, page: { widthMm: number; heightMm: number }, gap: number) => {
    if (images.length === 0) return;
    const preset = PRINT_PRESETS[presetIndex];
    let imagesHtml = '';
    for (const img of images) {
      imagesHtml += `<div class="photo" style="width:${preset.widthMm}mm;height:${preset.heightMm}mm;"><img src="${img.edited}" /></div>`;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>Print All</title>
          <style>
            @page { size: ${page.widthMm}mm ${page.heightMm}mm; margin: 2mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; flex-wrap: wrap; gap: ${gap}mm; align-content: flex-start; padding: ${gap}mm; }
            .photo { overflow: hidden; flex-shrink: 0; border: 0.3mm solid #999; }
            .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
          </style>
        </head>
        <body>
          ${imagesHtml}
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setPrintAllOpen(false);
  };

  return (
    <>
      <div className="p-3 space-y-1.5 mt-auto pb-8 select-none">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-bold">Export</p>
        <button
          onClick={() => {
            setPrintOpen(true);
          }}
          disabled={!activeImage}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5" /> Print Sheet
        </button>
        <button
          onClick={() => {
            setPrintAllOpen(true);
          }}
          disabled={images.length === 0}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5" /> Print All (Tray)
        </button>
        <button
          onClick={() => {
            handleDownload();
          }}
          disabled={!activeImage}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        <button
          onClick={() => {
            handleDownloadTransparent();
          }}
          disabled={!activeImage}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium bg-violet-500/15 text-violet-200 border border-violet-500/30 hover:bg-violet-500/25 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" /> PNG (Transparent)
        </button>
        <button
          onClick={() => {
            handleDownloadAll();
          }}
          disabled={images.length === 0}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Archive className="h-3.5 w-3.5" /> Download All (ZIP)
        </button>
      </div>

      <PrintSheetDialog open={printOpen} onOpenChange={setPrintOpen} onPrint={handlePrintSheet} />
      <PrintAllDialog open={printAllOpen} onOpenChange={setPrintAllOpen} imageCount={images.length} onPrint={handlePrintAll} />
    </>
  );
}
