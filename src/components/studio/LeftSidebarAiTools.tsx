import React, { useState } from 'react';
import { Sparkles, Wand2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useStudio } from '@/context/StudioContext';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';

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

  // Collapsible panels state
  const [isBgProExpanded, setIsBgProExpanded] = useState(false);
  const [isEnhancerExpanded, setIsEnhancerExpanded] = useState(false);

  // Interactive Alpha Threshold simulation slider as depicted in reference picture 4
  const [alphaThreshold, setAlphaThreshold] = useState(5);

  const activeImage = images.find(img => img.id === activeImageId);

  return (
    <div className="p-3 space-y-3 shrink-0">
      
      {/* BG-PRO CLOUDLESS AI ACCORDION SECTION */}
      <div className="border border-purple-500/20 bg-purple-500/5 rounded-md overflow-hidden transition-all duration-250">
        
        {/* Accordion Split Trigger Header */}
        <div className="flex h-9 items-stretch justify-between bg-purple-950/20 border-b border-purple-500/20 select-none">
          <button
            onClick={() => setIsBgProExpanded(!isBgProExpanded)}
            className="flex-1 flex items-center gap-1.5 px-3.5 text-left hover:bg-purple-950/40 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span className="font-bold text-purple-200 text-[11px] uppercase tracking-wide">BG-Pro</span>
            <span className="bg-purple-600 font-bold text-[7px] text-white px-1 leading-normal rounded uppercase select-none font-mono">
              SOTA
            </span>
          </button>
          
          <div className="w-px bg-purple-500/20 my-1.5 shrink-0" />
          
          <button
            onClick={() => setIsBgProExpanded(!isBgProExpanded)}
            className="w-9 flex items-center justify-center text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors shrink-0"
          >
            {isBgProExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Accordion Expandable Inner Panel */}
        {isBgProExpanded && (
          <div className="p-3 space-y-3.5 animate-fadeIn">
            {/* AI Model Status indicator */}
            <div className="flex items-center justify-between text-[10px] select-none">
              <span className="text-slate-400 font-medium font-mono uppercase tracking-wider text-[9px]">AI Model</span>
              {bgModelStatus === 'ready' ? (
                <span className="text-[8px] tracking-tight px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1">
                  <span className="h-1 w-1 bg-emerald-400 rounded-full" />
                  Ready (cached)
                </span>
              ) : (
                <span className="text-[8px] tracking-tight px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/20 flex items-center gap-1 animate-pulse">
                  <span className="h-1 w-1 bg-amber-400 rounded-full" />
                  Needs Download (~40MB)
                </span>
              )}
            </div>

            {/* Custom Output Fill styles matching reference Picture 4 */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-[#8e9aa8] uppercase tracking-wider font-bold block">Output:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['transparent', 'white', 'black'] as const).map((style) => {
                  const isActive = bgOutputMode === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setBgOutputMode(style)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-1.5 rounded-lg border bg-[#14161f] cursor-pointer transition-all hover:border-purple-500/40 hover:bg-[#1a1d29]",
                        isActive 
                          ? "border-purple-500 ring-1 ring-purple-500/45 shadow-sm shadow-purple-500/20" 
                          : "border-slate-800"
                      )}
                    >
                      {/* Box with specific color style / mesh design */}
                      <div 
                        className="w-full aspect-[4/3] rounded border border-slate-900/60 transition-transform duration-200"
                        style={{
                          background: style === 'transparent'
                            ? 'repeating-conic-gradient(#1e2230 0% 25%, #0f1116 0% 50%) 50% / 6px 6px'
                            : style === 'white' ? '#FFFFFF' : '#0a0a0d'
                        }}
                      />
                      <span className={cn(
                        "text-[9px] font-semibold leading-none",
                        isActive ? "text-purple-300 font-bold" : "text-slate-500"
                      )}>
                        {style === 'transparent' ? 'PNG A' : style === 'white' ? 'White' : 'Black'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Parameter 1: Edge Smoothing slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] select-none">
                <span className="text-slate-400 font-medium">Edge Smoothing</span>
                <span className="font-mono text-purple-300 font-bold bg-purple-500/10 px-1 py-0.2 rounded border border-purple-500/20">
                  {edgeSmoothing}px
                </span>
              </div>
              <Slider
                value={[edgeSmoothing]}
                min={0}
                max={10}
                step={1}
                onValueChange={([val]) => setEdgeSmoothing(val)}
                className="h-1 cursor-ew-resize [&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400 [&_.bg-primary]:bg-purple-500"
              />
            </div>

            {/* Custom Parameter 2: Alpha Threshold matching Image 4 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] select-none">
                <span className="text-slate-400 font-medium">Alpha Threshold</span>
                <span className="font-mono text-purple-300 font-bold bg-purple-500/10 px-1 py-0.2 rounded border border-purple-500/20">
                  {alphaThreshold}%
                </span>
              </div>
              <Slider
                value={[alphaThreshold]}
                min={0}
                max={100}
                step={1}
                onValueChange={([val]) => setAlphaThreshold(val)}
                className="h-1 cursor-ew-resize [&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400 [&_.bg-primary]:bg-purple-500"
              />
            </div>

            {/* Explanatory notes (Bengali matching picture 4 precisely) */}
            <p className="text-[8.5px] text-slate-500 font-medium leading-relaxed font-sans normal-case">
              প্রথমবার ~40MB AI model download হবে (browser cache হবে)। সর্বোচ্চ quality, hair/edge perfect।
            </p>

            {/* Run BG-Pro launcher action button */}
            <Button
              size="sm"
              disabled={!activeImage || isProcessingBg}
              onClick={() => runBgPro(activeImageId!)}
              className={cn(
                "w-full h-8 px-4 text-xs font-bold rounded shadow-lg transition-all text-white",
                activeImage 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/20 active:scale-98 cursor-pointer" 
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
        )}
      </div>

      {/* AI IMAGE ENHANCER ACCORDION SECTION */}
      <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-md overflow-hidden transition-all duration-250">
        
        {/* Accordion Split Trigger Header */}
        <div className="flex h-9 items-stretch justify-between bg-indigo-950/20 border-b border-indigo-500/20 select-none">
          <button
            onClick={() => setIsEnhancerExpanded(!isEnhancerExpanded)}
            className="flex-1 flex items-center gap-1.5 px-3.5 text-left hover:bg-indigo-950/40 transition-colors"
          >
            <Wand2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="font-bold text-indigo-200 text-[11px] uppercase tracking-wide">HF Upscale</span>
            <span className="bg-indigo-600 font-bold text-[7px] text-white px-1 leading-normal rounded uppercase select-none font-mono">
              CLOUD
            </span>
          </button>
          
          <div className="w-px bg-indigo-500/20 my-1.5 shrink-0" />
          
          <button
            onClick={() => setIsEnhancerExpanded(!isEnhancerExpanded)}
            className="w-9 flex items-center justify-center text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-colors shrink-0"
          >
            {isEnhancerExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Accordion Expandable Inner Panel */}
        {isEnhancerExpanded && (
          <div className="p-3 space-y-3.5 animate-fadeIn">
            
            {/* Split Action Button Menu (Image 1 and 2 style) */}
            <div className="flex items-center gap-1">
              {/* Left Side: Clickable Primary Action Trigger with dynamic indicator label */}
              <Button
                size="sm"
                disabled={!activeImage || isProcessingEnhancer}
                onClick={() => runImageEnhancer(activeImageId!)}
                className={cn(
                  "flex-1 h-8 px-3 text-xs font-bold rounded shadow-lg transition-all text-white overflow-hidden text-ellipsis whitespace-nowrap",
                  activeImage 
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/20 active:scale-98 cursor-pointer" 
                    : "bg-muted/10 border border-border/50 text-slate-500 cursor-not-allowed"
                )}
              >
                <Wand2 className="h-3.5 w-3.5 mr-1.5 text-indigo-200 shrink-0" />
                {isProcessingEnhancer ? 'Enhancing...' : `Enhance (${enhancerScale})`}
              </Button>

              {/* Right Side: Split Chevrondown button that opens the upscale value options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0 border border-indigo-500/30 bg-[#14161f] text-indigo-400 hover:text-indigo-200 hover:bg-[#1a1d29] rounded shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-32 bg-[#0d0e12] border border-slate-800 p-1 text-white shadow-2xl z-[100]" 
                  align="end"
                >
                  {(['2x', '4x', '8x'] as const).map((lvl) => {
                    const isSelected = enhancerScale === lvl;
                    return (
                      <DropdownMenuItem
                        key={lvl}
                        onClick={() => setEnhancerScale(lvl)}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-1.5 text-[11px] font-normal cursor-pointer rounded transition-all",
                          "text-slate-300 hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white"
                        )}
                      >
                        <span className="font-semibold">{lvl} upscale</span>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Rest of custom parameter panels inside the expandable accordion */}
            <div className="p-2 border border-border/50 bg-[#14161f] rounded-lg space-y-2.5 text-[10px]">
              <span className="font-bold text-[9px] text-[#8e9aa8] uppercase tracking-wider block border-b border-slate-900 pb-1 font-mono">
                Enhancement Configurations
              </span>
              
              {/* Custom Output DPI setting */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-medium font-sans">Custom Output DPI Limit</span>
                  <input
                    type="checkbox"
                    checked={enhancerDpi}
                    onChange={(e) => setEnhancerDpi(e.target.checked)}
                    className="rounded border-slate-850 bg-[#0d0e12] focus:ring-opacity-40 focus:ring-indigo-500 text-indigo-600 h-3 w-3 cursor-pointer"
                  />
                </div>

                {enhancerDpi && (
                  <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                    <span className="text-[9px] text-slate-500">DPI:</span>
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

              {/* Custom Image Resize Setting */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-medium font-sans">Custom Resize Limit</span>
                  <input
                    type="checkbox"
                    checked={enhancerResize}
                    onChange={(e) => setEnhancerResize(e.target.checked)}
                    className="rounded border-slate-850 bg-[#0d0e12] focus:ring-opacity-40 focus:ring-indigo-500 text-indigo-600 h-3 w-3 cursor-pointer"
                  />
                </div>

                {enhancerResize && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 animate-fadeIn">
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-slate-500">W:</span>
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
                      <span className="text-[8px] text-slate-500">H:</span>
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

            {!activeImage && (
              <p className="text-[9px] text-amber-400/80 leading-snug text-center font-medium mt-1">
                * প্রথমে ইমেজ ট্রে থেকে একটি ছবি সিলেক্ট করুন
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
