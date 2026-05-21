import { useState, useCallback } from 'react';
import { useStudio } from '@/context/StudioContext';
import { CROP_PRESETS } from '@/context/studioTypes';
import { Printer, Download, Archive, Palette, ImageIcon } from 'lucide-react';
import { LayerPanel } from './LayerPanel';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ImageTray } from './ImageTray';
import { PrintSheetDialog, PRINT_PRESETS } from './PrintSheetDialog';
import { PrintAllDialog } from './PrintAllDialog';
import { MergeDialog } from './MergeDialog';
import type { PrintSlot } from './PrintSheetDialog';

const BG_PRESETS = [
  { label: 'None', value: 'transparent' },
  { label: 'Pure White (পাসপোর্ট/ভিসা)', value: '#FFFFFF' },
  { label: 'Sky Blue (আইডি কার্ড)', value: '#87CEEB' },
  { label: 'Royal Blue (অফিসিয়াল)', value: '#002366' },
  { label: 'Vivid Blue (স্টুডিও)', value: '#007DFC' },
  { label: 'Light Gray (কর্পোরেট)', value: '#D3D3D3' },
  { label: 'Off-White (বিকল্প)', value: '#FAF9F6' },
  { label: 'Black', value: '#111111' },
];

export function RightSidebar() {
  const {
    images, activeImageId, setActiveImage, removeImage,
    editorState, updateEditorState, updateEditedImage, pushHistory, addImages,
    isLayerMode, setIsLayerMode,
  } = useStudio();

  const activeImage = images.find(i => i.id === activeImageId);
  const [printOpen, setPrintOpen] = useState(false);
  const [printAllOpen, setPrintAllOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);

  const getRenderedCanvas = useCallback((targetW?: number, targetH?: number): Promise<HTMLCanvasElement> => {
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

        if (editorState.backgroundColor !== 'transparent') {
          ctx.fillStyle = editorState.backgroundColor;
          ctx.fillRect(0, 0, w, h);
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
    // Robust path: load the edited image (works for data: URLs, blob: URLs, and http(s)),
    // re-encode through canvas as PNG so the alpha channel is always preserved
    // regardless of the source MIME type or storage form.
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = activeImage.edited;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: false })!;
    // No background fill — preserve transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Encode failed')), 'image/png')
    );
    saveAs(blob, `${baseName}-transparent.png`);
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

  const handleMerge = async (img1Id: string, img2Id: string, mode: 'side-by-side' | 'top-bottom' | 'overlay', gap: number, opacity: number) => {
    const img1 = images.find(i => i.id === img1Id);
    const img2 = images.find(i => i.id === img2Id);
    if (!img1 || !img2) return;
    const { mergeImages } = await import('@/lib/imageMerge');
    const result = await mergeImages(img1.edited, img2.edited, mode, { gap, opacity });
    const res = await fetch(result);
    const blob = await res.blob();
    const file = new File([blob], `merged-${Date.now()}.png`, { type: 'image/png' });
    addImages([file]);
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
    <aside className="w-[280px] border-l border-border bg-[#0f1116] flex flex-col overflow-hidden studio-scrollbar text-white">
      <div className="flex-1 overflow-y-auto studio-scrollbar">
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5" /> IMAGE TRAY
            </p>
            <ImageTray
              images={images}
              activeImageId={activeImageId}
              onSelectImage={setActiveImage}
              onRemoveImage={removeImage}
              onMergeOpen={() => setMergeOpen(true)}
              onLayerMode={() => setIsLayerMode(true)}
            />
          </div>

          <div className="pt-6 border-t border-border/50">
            <LayerPanel />
          </div>

          <div className="pt-6 border-t border-border/50">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4">Colors</p>
            <div className="grid grid-cols-4 gap-2">
              {BG_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => updateEditorState({ backgroundColor: preset.value })}
                  className={cn(
                    "w-full aspect-square rounded-md border transition-all",
                    editorState.backgroundColor === preset.value
                      ? "border-primary ring-1 ring-primary scale-110"
                      : "border-border hover:border-muted-foreground"
                  )}
                  style={{
                    background: preset.value === 'transparent'
                      ? 'repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--studio-surface)) 0% 50%) 50% / 12px 12px'
                      : preset.value,
                  }}
                  title={preset.label}
                />
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full aspect-square rounded-md border transition-all flex items-center justify-center",
                      !BG_PRESETS.some(p => p.value === editorState.backgroundColor)
                        ? "border-primary ring-1 ring-primary scale-110"
                        : "border-border hover:border-muted-foreground",
                      "bg-gradient-to-br from-red-500 via-green-500 to-blue-500"
                    )}
                    title="Custom Color"
                  >
                    <Palette className="h-3.5 w-3.5 text-white drop-shadow-md" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3" side="left">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Custom Color</p>
                    <Input
                      type="color"
                      value={editorState.backgroundColor === 'transparent' ? '#ffffff' : editorState.backgroundColor}
                      onChange={(e) => updateEditorState({ backgroundColor: e.target.value })}
                      className="w-full h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      placeholder="#RRGGBB"
                      value={editorState.backgroundColor === 'transparent' ? '' : editorState.backgroundColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val) || val === '') {
                          updateEditorState({ backgroundColor: val || 'transparent' });
                        }
                      }}
                      className="text-xs h-8"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="border-t border-border/50" />

          {/* Border */}
          <div className="p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="border-toggle"
                checked={editorState.borderEnabled}
                onCheckedChange={(checked) => updateEditorState({ borderEnabled: !!checked })}
              />
              <label htmlFor="border-toggle" className="text-[11px] text-muted-foreground cursor-pointer">
                2px Border
              </label>
            </div>
          </div>

          <div className="border-t border-border/50" />

          {/* Export Actions */}
          <div className="p-3 space-y-1.5 mt-auto pb-8">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-bold">Export</p>
            <button
              onClick={() => setPrintOpen(true)}
              disabled={!activeImage}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-40"
            >
              <Printer className="h-3.5 w-3.5" /> Print Sheet
            </button>
            <button
              onClick={() => setPrintAllOpen(true)}
              disabled={images.length === 0}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-40"
            >
              <Printer className="h-3.5 w-3.5" /> Print All (Tray)
            </button>
            <button
              onClick={handleDownload}
              disabled={!activeImage}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button
              onClick={handleDownloadTransparent}
              disabled={!activeImage}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium bg-violet-500/15 text-violet-200 border border-violet-500/30 hover:bg-violet-500/25 transition-colors disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" /> PNG (Transparent)
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={images.length === 0}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-40"
            >
              <Archive className="h-3.5 w-3.5" /> Download All (ZIP)
            </button>
          </div>
        </div>
      </div>

      <PrintSheetDialog open={printOpen} onOpenChange={setPrintOpen} onPrint={handlePrintSheet} />
      <PrintAllDialog open={printAllOpen} onOpenChange={setPrintAllOpen} imageCount={images.length} onPrint={handlePrintAll} />
      <MergeDialog
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        images={images}
        defaultImg1={images[0]?.id || null}
        defaultImg2={images[1]?.id || null}
        onMerge={handleMerge}
      />
    </aside>
  );
}
