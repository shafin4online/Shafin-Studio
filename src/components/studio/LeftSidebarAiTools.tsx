import React from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useStudio } from '@/context/StudioContext';

export function LeftSidebarAiTools() {
  const {
    images,
    activeImageId,
    isProcessingBg,
    bgProgress,
    bgProgressKey,
    bgOutputMode,
    setBgOutputMode,
    edgeSmoothing,
    setEdgeSmoothing,
    bgModelStatus,
    runBgPro,
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
  } = useStudio();

  const activeImage = images.find(img => img.id === activeImageId);

  return (
    <div className="p-3 space-y-3">
      {/* BG-PRO CLOUDLESS AI */}
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
              {(['transparent', 'white', 'black'] as const).map((style) => (
                <Button
                  key={style}
                  variant="outline"
                  size="sm"
                  onClick={() => setBgOutputMode(style)}
                  className={cn(
                    "h-6 px-1.5 text-[9px] font-medium border-border/80 rounded transition-all",
                    bgOutputMode === style 
                      ? "bg-purple-600/30 text-purple-200 border-purple-500" 
                      : "bg-muted/10 text-slate-400 hover:text-white hover:bg-muted/20"
                  )}
                >
                  {style === 'transparent' ? 'Transparent' : style === 'white' ? 'White BG' : 'Black BG'}
                </Button>
              ))}
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
            <span className="text-[9px] text-muted-foreground font-medium block">Upscale Model Multiplier:</span>
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
    </div>
  );
}
