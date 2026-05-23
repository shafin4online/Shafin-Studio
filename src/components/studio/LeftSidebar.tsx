import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '@/context/StudioContext';
import { ChevronDown, Zap, Eraser, RotateCcw, SquareIcon, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CROP_PRESETS } from '@/context/studioTypes';
import { LeftSidebarAiTools } from './LeftSidebarAiTools';
import { LeftSidebarSliders } from './LeftSidebarSliders';

export function LeftSidebar() {
  const { 
    activeCropPreset,
    setActiveCropPreset,
    updateEditorState,
    setIsPerspectiveCropOpen,
    activeImageId,
    setMobileLeftOpen,
  } = useStudio();

  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCropDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleQuickAdjust = () => {
    updateEditorState({ brightness: 108, contrast: 108, saturation: 110 });
    setMobileLeftOpen(false);
  };

  return (
    <aside className="w-64 border-r border-border bg-[#0f1116] flex flex-col overflow-y-auto studio-scrollbar text-[11px]">
      {/* Selection / Crop */}
      <div className="p-3 space-y-2 select-none relative" ref={dropdownRef}>
        <Button 
          variant="outline" 
          onClick={() => setIsCropDropdownOpen(!isCropDropdownOpen)}
          className="w-full justify-between h-8 text-[11px] font-normal border-border bg-muted/30 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SquareIcon className="h-3.5 w-3.5 text-blue-400" />
            <span>{activeCropPreset ? activeCropPreset.label : 'Crop'}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>

        {isCropDropdownOpen && (
          <div className="absolute top-11 left-3 right-3 bg-[#0f1116] border border-border/80 p-1 text-white shadow-2xl rounded-md z-50 max-h-[320px] overflow-y-auto studio-scrollbar">
            {CROP_PRESETS.map((preset) => (
              <button 
                key={preset.id}
                type="button"
                onClick={() => {
                  setActiveCropPreset(preset);
                  setIsCropDropdownOpen(false);
                  setMobileLeftOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between w-full text-left px-2.5 py-2 text-[11px] font-normal cursor-pointer rounded transition-all outline-none",
                  "text-slate-300 hover:bg-[#1a1c24] hover:text-white focus:bg-blue-600 focus:text-white",
                  activeCropPreset?.id === preset.id && "bg-blue-600 text-white font-semibold hover:bg-blue-600"
                )}
              >
                <div className="flex justify-between w-full items-center gap-4">
                  <span className="font-medium text-[11px] shrink-0">{preset.label}</span>
                  <span className="text-[10px] text-muted-foreground/80 font-mono text-right shrink-0">{preset.subLabel}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <Button 
          variant="outline" 
          disabled={!activeImageId}
          className="w-full justify-start h-8 text-[11px] font-normal border-border bg-muted/30 gap-2 hover:bg-indigo-500/10 hover:text-indigo-200 transition-colors cursor-pointer"
          onClick={() => {
            setIsPerspectiveCropOpen(true);
            setMobileLeftOpen(false);
          }}
          title="বাঁকা ছবিকে সোজা ও ফ্ল্যাট করতে এটি ব্যবহার করুন"
        >
          <Compass className="h-3.5 w-3.5 text-indigo-400" />
          <span>CamScanner Smart Scan</span>
        </Button>

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

      <LeftSidebarAiTools />

      <div className="p-3 pt-0">
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

      <LeftSidebarSliders />
    </aside>
  );
}
