import React from 'react';
import { useStudio } from '@/context/StudioContext';
import { 
  ChevronDown, Zap, Wand2, Sparkles, Cloud, Eraser, 
  RotateCcw, Undo2, Redo2, Sun, Contrast, Droplets, 
  Thermometer, Palette, SquareIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { CROP_PRESETS } from '@/context/studioTypes';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';

export function LeftSidebar() {
  const { 
    images,
    activeImageId,
    editorState, 
    updateEditorState, 
    undo, 
    redo, 
    historyIndex, 
    history,
    activeCropPreset,
    setActiveCropPreset,

    isProcessingBg,
    bgProgress,
    bgProgressKey,
    bgOutputMode,
    setBgOutputMode,
    edgeSmoothing,
    setEdgeSmoothing,
    bgModelStatus,
    runBgPro,
    cancelBgPro,

    isProcessingEnhancer,
    enhancerScale,
    setEnhancerScale,
    enhancerDpi,
    setEnhancerDpi,
    enhancerDpiValue,
    setEnhancerDpiValue,
    enhancerResize,
    setEnhancerResize,
    enhancerWidth,
    setEnhancerWidth,
    enhancerHeight,
    setEnhancerHeight,
    runImageEnhancer,
    cancelImageEnhancer
  } = useStudio();

  const activeImage = images.find(img => img.id === activeImageId);

  const handleFilterChange = (key: keyof typeof editorState, value: number) => {
    updateEditorState({ [key]: value });
  };

  const handleEnReal = () => {
    updateEditorState({ brightness: 110, contrast: 115, saturation: 105 });
  };
  
  const handleEnhanAI = () => {
    updateEditorState({ brightness: 105, contrast: 110, saturation: 120, sharpness: 20 });
  };

  const handleQuickAdjust = () => {
    updateEditorState({ brightness: 108, contrast: 108, saturation: 110 });
  };

  return (
    <aside className="w-64 border-r border-border bg-[#0f1116] flex flex-col overflow-y-auto studio-scrollbar text-[11px]">
      {/* Selection / Crop */}
      <div className="p-3 space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-8 text-[11px] font-normal border-border bg-muted/30 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-2">
                <SquareIcon className="h-3.5 w-3.5 text-blue-400" />
                <span>{activeCropPreset ? activeCropPreset.label : 'Crop'}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[260px] bg-[#0f1116] border border-border/80 p-1 text-white shadow-xl z-[100]" align="start">
            {CROP_PRESETS.map((preset) => (
              <DropdownMenuItem 
                key={preset.id}
                onClick={() => setActiveCropPreset(preset)}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 text-[11px] font-normal cursor-pointer rounded transition-all",
                  "text-slate-300 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                  activeCropPreset?.id === preset.id && "bg-blue-600 text-white font-semibold"
                )}
              >
                <div className="flex justify-between w-full items-center gap-4">
                  <span className="font-medium text-[11px] shrink-0">{preset.label}</span>
                  <span className="text-[10px] text-muted-foreground/80 font-mono text-right shrink-0">{preset.subLabel}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="outline" 
          className="w-full justify-start h-8 text-[11px] font-normal border-border bg-muted/30 gap-2 hover:bg-yellow-500/10 transition-colors"
          onClick={handleQuickAdjust}
        >
          <Zap className="h-3.5 w-3.5 text-yellow-500" />
          <span>Quick Adjust</span>
        </Button>
      </div>

      <div className="px-3 py-1 bg-muted/20 border-y border-border/50 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
        AI Tools
      </div>

      <div className="p-3 space-y-3">
        <div className="p-2.5 border border-purple-500/30 bg-purple-500/5 rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-purple-300 text-[11px]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>BG-PRO CLOUDLESS AI</span>
              <span className="bg-purple-500 text-white text-[7px] px-1 rounded font-bold">SOTA</span>
            </div>
            {bgModelStatus === 'ready' ? (
              <span className="text-[8px] tracking-tight px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/20">
                ● Ready (Cached)
              </span>
            ) : (
              <span className="text-[8px] tracking-tight px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/20">
                ● Needs Download (~40MB)
              </span>
            )}
          </div>

          {/* BG-Pro Settings Panel */}
          <div className="p-2 border border-border/60 bg-[#14161f] rounded space-y-2 text-[10px]">
            <span className="font-bold text-[9px] text-[#8e9aa8] uppercase tracking-wider block">BG-Pro Panel Settings</span>
            
            {/* Output Formats */}
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground font-medium block">Output Background Style:</span>
              <div className="grid grid-cols-3 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBgOutputMode('transparent')}
                  className={cn(
                    "h-6 px-1.5 text-[9px] font-medium border-border/80 rounded transition-all",
                    bgOutputMode === 'transparent' 
                      ? "bg-purple-600/30 text-purple-200 border-purple-500" 
                      : "bg-muted/10 text-slate-400 hover:text-white hover:bg-muted/20"
                  )}
                >
                  Transparent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBgOutputMode('white')}
                  className={cn(
                    "h-6 px-1.5 text-[9px] font-medium border-border/80 rounded transition-all",
                    bgOutputMode === 'white' 
                      ? "bg-purple-600/30 text-purple-200 border-purple-500" 
                      : "bg-muted/10 text-slate-400 hover:text-white hover:bg-muted/20"
                  )}
                >
                  White BG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBgOutputMode('black')}
                  className={cn(
                    "h-6 px-1.5 text-[9px] font-medium border-border/80 rounded transition-all",
                    bgOutputMode === 'black' 
                      ? "bg-purple-600/30 text-purple-200 border-purple-500" 
                      : "bg-muted/10 text-slate-400 hover:text-white hover:bg-muted/20"
                  )}
                >
                  Black BG
                </Button>
              </div>
            </div>

            {/* Edge Smoothing Customisation */}
            <div className="space-y-1.5 pt-1.5 border-t border-border/30">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-muted-foreground">Edge Smooth / Blur</span>
                <span className="font-mono text-purple-300 font-bold">{edgeSmoothing}px</span>
              </div>
              <Slider
                value={[edgeSmoothing]}
                min={0}
                max={10}
                step={1}
                onValueChange={([val]) => setEdgeSmoothing(val)}
                className="h-1 py-1"
              />
            </div>
          </div>

          {/* Action Trigger Button */}
          <Button
            size="sm"
            disabled={!activeImage || isProcessingBg}
            onClick={() => runBgPro(activeImageId!)}
            className={cn(
              "w-full h-8 px-4 text-xs font-bold rounded shadow-lg transition-all text-white",
              activeImage 
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/20" 
                : "bg-muted/10 border border-border/50 text-slate-500 cursor-not-allowed"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-purple-200 animate-pulse" />
            {isProcessingBg ? 'Processing ON-DEVICE...' : 'Run BG-Pro'}
          </Button>

          {!activeImage && (
            <p className="text-[9px] text-amber-400/80 leading-snug text-center font-medium mt-1">
              * প্রথমে ইমেজ ট্রে থেকে একটি ছবি সিলেক্ট করুন
            </p>
          )}
        </div>

        {/* AI IMAGE ENHANCER Panel */}
        <div className="p-2.5 border border-indigo-500/30 bg-indigo-500/5 rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-[11px]">
              <Wand2 className="h-3.5 w-3.5" />
              <span>AI IMAGE ENHANCER</span>
              <span className="bg-indigo-600 text-white text-[7px] px-1 rounded font-bold">HF</span>
            </div>
            <span className="text-[8px] tracking-tight px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/20">
              ● API Mode
            </span>
          </div>

          <div className="p-2 border border-border/60 bg-[#14161f] rounded space-y-2 text-[10px]">
            <span className="font-bold text-[9px] text-[#8e9aa8] uppercase tracking-wider block">Enhancement Configurations</span>
            
            {/* Scale options 2x, 4x, 8x */}
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground font-medium block">Upsceal Model Multiplier:</span>
              <div className="grid grid-cols-3 gap-1">
                {(['2x', '4x', '8x'] as const).map((lvl) => (
                  <Button
                    key={lvl}
                    variant="outline"
                    size="sm"
                    onClick={() => setEnhancerScale(lvl)}
                    className={cn(
                      "h-6 px-1.5 text-[9px] font-medium border-border/80 rounded transition-all",
                      enhancerScale === lvl 
                        ? "bg-indigo-600/30 text-indigo-200 border-indigo-500" 
                        : "bg-muted/10 text-slate-400 hover:text-white hover:bg-muted/20"
                    )}
                  >
                    {lvl}
                  </Button>
                ))}
              </div>
            </div>

            {/* DPI Configuration section */}
            <div className="space-y-1.5 pt-1.5 border-t border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground font-medium">Custom Output DPI:</span>
                <input
                  type="checkbox"
                  checked={enhancerDpi}
                  onChange={(e) => setEnhancerDpi(e.target.checked)}
                  className="rounded border-border bg-[#0d0e12] focus:ring-opacity-40 focus:ring-indigo-500 text-indigo-600 h-3 w-3"
                />
              </div>

              {enhancerDpi && (
                <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                  <span className="text-[9px] text-slate-400">DPI Value:</span>
                  <input
                    type="number"
                    value={enhancerDpiValue}
                    min={72}
                    max={1200}
                    onChange={(e) => setEnhancerDpiValue(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-16 h-5 bg-[#0d0e12] border border-border/80 rounded text-center text-[10px] text-white px-1 outline-none"
                  />
                  <span className="text-[8px] text-muted-foreground font-mono">px/in</span>
                </div>
              )}
            </div>

            {/* Resize options width and height */}
            <div className="space-y-1.5 pt-1.5 border-t border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground font-medium">Custom Resize Limit:</span>
                <input
                  type="checkbox"
                  checked={enhancerResize}
                  onChange={(e) => setEnhancerResize(e.target.checked)}
                  className="rounded border-border bg-[#0d0e12] focus:ring-opacity-40 focus:ring-indigo-500 text-indigo-600 h-3 w-3"
                />
              </div>

              {enhancerResize && (
                <div className="grid grid-cols-2 gap-1.5 pt-1 animate-fadeIn">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-slate-400">W:</span>
                    <input
                      type="number"
                      value={enhancerWidth}
                      min={64}
                      max={4000}
                      onChange={(e) => setEnhancerWidth(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full h-5 bg-[#0d0e12] border border-border/80 rounded text-center text-[10px] text-white px-1 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-slate-400">H:</span>
                    <input
                      type="number"
                      value={enhancerHeight}
                      min={64}
                      max={4000}
                      onChange={(e) => setEnhancerHeight(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full h-5 bg-[#0d0e12] border border-border/80 rounded text-center text-[10px] text-white px-1 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            size="sm"
            disabled={!activeImage || isProcessingEnhancer}
            onClick={() => runImageEnhancer(activeImageId!)}
            className={cn(
              "w-full h-8 px-4 text-xs font-bold rounded shadow-lg transition-all text-white",
              activeImage 
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/20" 
                : "bg-muted/10 border border-border/50 text-slate-500 cursor-not-allowed"
            )}
          >
            <Wand2 className="h-3.5 w-3.5 mr-1.5 text-indigo-200" />
            {isProcessingEnhancer ? 'Enhancing details...' : 'Enhance Image'}
          </Button>

          {!activeImage && (
            <p className="text-[9px] text-amber-400/80 leading-snug text-center font-medium mt-1">
              * প্রথমে ইমেজ ট্রে থেকে একটি ছবি সিলেক্ট করুন
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          <Button variant="outline" className="h-9 gap-2 border-border bg-muted/20">
            <Eraser className="h-3.5 w-3.5 text-orange-400" />
            <span>Erase</span>
          </Button>
          <Button variant="outline" className="h-9 gap-2 border-border bg-muted/20">
            <RotateCcw className="h-3.5 w-3.5 text-green-400" />
            <span>Restore</span>
          </Button>
        </div>
      </div>

      <div className="px-3 py-1 bg-muted/20 border-y border-border/50 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
        Filters
      </div>

      <div className="p-3 space-y-4">
        {[
          { label: 'Brightness', icon: Sun, key: 'brightness', min: 0, max: 200, unit: '%' },
          { label: 'Contrast', icon: Contrast, key: 'contrast', min: 0, max: 200, unit: '%' },
          { label: 'Saturation', icon: Droplets, key: 'saturation', min: 0, max: 200, unit: '%' },
          { label: 'Temperature', icon: Thermometer, key: 'temperature', min: -100, max: 100, unit: '' },
          { label: 'Hue', icon: Palette, key: 'hue', min: -180, max: 180, unit: '°' },
          { label: 'Sharpness', icon: Sparkles, key: 'sharpness', min: 0, max: 100, unit: '%' },
        ].map((filter) => (
          <div key={filter.key} className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <filter.icon className="h-3 w-3" />
                <span className="uppercase">{filter.label}</span>
              </div>
              <span className="font-mono text-primary">{editorState[filter.key as keyof typeof editorState]}{filter.unit}</span>
            </div>
            <Slider 
              value={[editorState[filter.key as keyof typeof editorState] as number]}
              min={filter.min}
              max={filter.max}
              step={1}
              onValueChange={([val]) => handleFilterChange(filter.key as keyof typeof editorState, val)}
              className="h-1.5"
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
