import React, { useState } from 'react';
import { Sparkles, Wand2, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
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
    setMobileLeftOpen,
  } = useStudio();

  // Collapsible panels state
  const [isBgProExpanded, setIsBgProExpanded] = useState(false);
  const [isEnhancerExpanded, setIsEnhancerExpanded] = useState(false);

  // Interactive Alpha Threshold simulation slider as depicted in reference picture 4
  const [alphaThreshold, setAlphaThreshold] = useState(5);

  const activeImage = images.find(img => img.id === activeImageId);

  const handleBgClick = () => {
    if (!activeImage) {
      // Prompt user visually
      alert('প্রথমে ইমেজ ট্রে থেকে একটি ছবি সিলেক্ট করুন!');
      return;
    }
    if (!isProcessingBg) {
      runBgPro(activeImageId!);
      setMobileLeftOpen(false);
    }
  };

  const handleEnhanceClick = () => {
    if (!activeImage) {
      alert('প্রথমে ইমেজ ট্রে থেকে একটি ছবি সিলেক্ট করুন!');
      return;
    }
    if (!isProcessingEnhancer) {
      runImageEnhancer(activeImageId!);
      setMobileLeftOpen(false);
    }
  };

  return (
    <div className="p-3 space-y-3 shrink-0">
      
      {/* BG-PRO CLOUDLESS AI ACCORDION SECTION */}
      <div className="border border-purple-500/20 bg-purple-500/5 rounded-md overflow-hidden transition-all duration-250">
        
        {/* Accordion Split Trigger Header */}
        <div className="flex h-10 items-stretch justify-between bg-purple-950/20 border-b border-purple-500/20 select-none">
          {/* Main action side - Starts background removal immediately */}
          <button
            onClick={handleBgClick}
            disabled={isProcessingBg}
            className={cn(
              "flex-1 flex items-center gap-2 px-3 text-left transition-colors relative outline-none focus:outline-none",
              activeImage 
                ? "hover:bg-purple-950/45 cursor-pointer text-purple-200 active:bg-purple-900/35" 
                : "text-slate-500 hover:bg-transparent cursor-not-allowed opacity-60"
            )}
            title={activeImage ? "ব্যাকগ্রাউন্ড রিমুভ করতে এখানে চাপুন" : "প্রথমে একটি ছবি সিলেক্ট করুন"}
          >
            {isProcessingBg ? (
              <Loader2 className="h-3.5 w-3.5 text-purple-400 animate-spin shrink-0" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            )}
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-[#eaeef6] text-[10.5px] uppercase tracking-wide leading-none">
                {isProcessingBg ? 'Processing...' : 'BG-Pro'}
              </span>
              <span className="text-[7.5px] text-purple-400 font-semibold leading-none mt-0.5">Click to run AI</span>
            </div>
            <span className="bg-purple-600 font-extrabold text-[7px] text-white px-1 leading-normal rounded uppercase select-none font-mono ml-auto">
              SOTA
            </span>
          </button>
          
          <div className="w-px bg-purple-500/20 my-1.5 shrink-0" />
          
          {/* Collapse toggle side */}
          <button
            onClick={() => setIsBgProExpanded(!isBgProExpanded)}
            className="w-10 flex items-center justify-center text-purple-400 hover:text-purple-300 hover:bg-purple-950/45 transition-colors shrink-0 outline-none focus:outline-none"
            title="অপশন ও সেটিংস দেখুন"
          >
            {isBgProExpanded ? (
              <ChevronUp className="h-4 w-4 text-purple-300" />
            ) : (
              <ChevronDown className="h-4 w-4 text-purple-400" />
            )}
          </button>
        </div>

        {/* Accordion Expandable Inner Panel */}
        {isBgProExpanded && (
          <div className="p-3 space-y-3.5 animate-fadeIn bg-purple-950/5">
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
              <span className="text-[9px] text-[#8e9aa8] uppercase tracking-wider font-bold block">Output Style:</span>
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
        <div className="flex h-10 items-stretch justify-between bg-indigo-950/20 border-b border-indigo-500/20 select-none">
          {/* Main action side - Starts image enhancement immediately */}
          <button
            onClick={handleEnhanceClick}
            disabled={isProcessingEnhancer}
            className={cn(
              "flex-1 flex items-center gap-2 px-3 text-left transition-colors relative outline-none focus:outline-none",
              activeImage 
                ? "hover:bg-indigo-950/45 cursor-pointer text-indigo-200 active:bg-indigo-900/35" 
                : "text-slate-500 hover:bg-transparent cursor-not-allowed opacity-60"
            )}
            title={activeImage ? "ছবির রেজোলিউশন ও কোয়ালিটি বাড়াতে এখানে চাপুন" : "প্রথমে একটি ছবি সিলেক্ট করুন"}
          >
            {isProcessingEnhancer ? (
              <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin shrink-0" />
            ) : (
              <Wand2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            )}
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-[#eaeef6] text-[10.5px] uppercase tracking-wide leading-none">
                {isProcessingEnhancer ? 'Enhancing...' : `HF Enhance (${enhancerScale})`}
              </span>
              <span className="text-[7.5px] text-indigo-400 font-semibold leading-none mt-0.5">Click to run Cloud AI</span>
            </div>
            <span className="bg-indigo-600 font-extrabold text-[7px] text-white px-1 leading-normal rounded uppercase select-none font-mono ml-auto">
              CLOUD
            </span>
          </button>
          
          <div className="w-px bg-indigo-500/20 my-1.5 shrink-0" />
          
          {/* Collapse toggle side */}
          <button
            onClick={() => setIsEnhancerExpanded(!isEnhancerExpanded)}
            className="w-10 flex items-center justify-center text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/45 transition-colors shrink-0 outline-none focus:outline-none"
            title="অপশন ও সেটিংস দেখুন"
          >
            {isEnhancerExpanded ? (
              <ChevronUp className="h-4 w-4 text-indigo-300" />
            ) : (
              <ChevronDown className="h-4 w-4 text-indigo-400" />
            )}
          </button>
        </div>

        {/* Accordion Expandable Inner Panel */}
        {isEnhancerExpanded && (
          <div className="p-3 space-y-3.5 animate-fadeIn bg-indigo-950/5">
            
            {/* Quick Segment Selector for Upscale Levels (Replaces the dropdown for instant toggling!) */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-[#8e9aa8] uppercase tracking-wider font-bold block">Upscale Level:</span>
              <div className="grid grid-cols-3 gap-1 bg-[#10121a] p-1 rounded-md border border-slate-900">
                {(['2x', '4x', '8x'] as const).map((lvl) => {
                  const isSelected = enhancerScale === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnhancerScale(lvl)}
                      className={cn(
                        "py-1 text-center font-extrabold text-[10px] rounded transition-all cursor-pointer",
                        isSelected 
                          ? "bg-indigo-600 text-white shadow" 
                          : "text-slate-400 hover:text-white hover:bg-indigo-950/20"
                      )}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
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
                      className="w-16 h-5 bg-[#0d0e12] border border-border/80 rounded text-center text-[10px] text-white px-1 outline-none font-mono"
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
                      <span className="text-[8px] text-slate-500 font-mono">W:</span>
                      <input
                        type="number"
                        value={enhancerWidth}
                        min={64}
                        max={4000}
                        onChange={(e) => setEnhancerWidth(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full h-5 bg-[#0d0e12] border border-border/80 rounded text-center text-[10px] text-white px-1 outline-none font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-slate-500 font-mono">H:</span>
                      <input
                        type="number"
                        value={enhancerHeight}
                        min={64}
                        max={4000}
                        onChange={(e) => setEnhancerHeight(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full h-5 bg-[#0d0e12] border border-border/80 rounded text-center text-[10px] text-white px-1 outline-none font-mono"
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
