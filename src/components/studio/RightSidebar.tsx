import { useState } from 'react';
import { useStudio } from '@/context/StudioContext';
import { Palette, ImageIcon } from 'lucide-react';
import { LayerPanel } from './LayerPanel';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ImageTray } from './ImageTray';
import { MergeDialog } from './MergeDialog';
import { BatchProcessDialog } from './BatchProcessDialog';
import { RightSidebarExportPanel } from './RightSidebarExportPanel';

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
    editorState, updateEditorState, addImages,
    isLayerMode, setIsLayerMode, batchOpen, setBatchOpen,
  } = useStudio();

  const [mergeOpen, setMergeOpen] = useState(false);

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

  return (
    <aside className="w-[280px] border-l border-border bg-[#0f1116] flex flex-col overflow-hidden studio-scrollbar text-white">
      <div className="flex-1 overflow-y-auto studio-scrollbar">
        <div className="p-4 space-y-6">
          <div className="space-y-3Select selection-none">
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
              onBatchOpen={() => setBatchOpen(true)}
            />
          </div>

          <div className="pt-6 border-t border-border/50 select-none">
            <LayerPanel />
          </div>

          <div className="pt-6 border-t border-border/50 select-none">
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
          <div className="p-3 select-none">
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

          {/* Export Actions Panel */}
          <RightSidebarExportPanel />

        </div>
      </div>

      <MergeDialog
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        images={images}
        defaultImg1={images[0]?.id || null}
        defaultImg2={images[1]?.id || null}
        onMerge={handleMerge}
      />
      <BatchProcessDialog
        open={batchOpen}
        onOpenChange={setBatchOpen}
      />
    </aside>
  );
}
