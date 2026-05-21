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

export function LeftSidebar() {
  const { editorState, updateEditorState, undo, redo, historyIndex, history } = useStudio();

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
        <Button variant="outline" className="w-full justify-between h-8 text-[11px] font-normal border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <SquareIcon className="h-3.5 w-3.5 text-blue-400" />
            <span>Crop</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
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

      <div className="p-3 space-y-3">
        <div className="p-2 border border-purple-500/20 bg-purple-500/5 rounded-md space-y-3">
           <div className="flex items-center justify-between group cursor-pointer hover:bg-purple-500/10 p-1 rounded transition-colors">
             <div className="flex items-center gap-1.5 font-bold text-purple-300">
               <Sparkles className="h-4 w-4" />
               <span>BG-Pro</span>
               <span className="bg-purple-500/30 text-purple-200 text-[8px] px-1.5 py-0.5 rounded ml-1 font-bold">SOTA</span>
             </div>
             <ChevronDown className="h-4 w-4 opacity-50" />
           </div>
           <div className="grid grid-cols-3 gap-2">
             <Button 
                variant="outline" 
                className="flex-col h-14 text-[9px] p-0 bg-muted/10 border-border group hover:border-purple-500/40"
                onClick={() => updateEditorState({ despill: false })} // Placeholder action
             >
               <Sparkles className="h-4 w-4 mb-1 text-purple-400 group-hover:scale-110 transition-transform" />
               BG-First
             </Button>
             <Button 
                variant="outline" 
                className="flex-col h-14 text-[9px] p-0 bg-muted/10 border-border group hover:border-purple-500/40"
             >
               <Zap className="h-4 w-4 mb-1 text-yellow-400 group-hover:scale-110 transition-transform" />
               BG-AI
             </Button>
             <Button 
                variant="outline" 
                className="flex-col h-14 text-[9px] p-0 bg-muted/10 border-border group hover:border-purple-500/40"
             >
               <span className="text-sm mb-1">👤</span>
               BG-Human
             </Button>
           </div>

           {/* Edge Sharp & Despill Controls */}
           <div className="space-y-4 pt-2 border-t border-purple-500/20">
             <div className="space-y-2">
               <div className="flex justify-between items-center text-[10px]">
                 <div className="flex items-center gap-1.5 text-blue-400">
                   <Sparkles className="h-3 w-3 rotate-45" />
                   <span className="font-semibold uppercase tracking-tight">Edge Sharp</span>
                 </div>
                 <span className="font-mono text-blue-400 font-bold">{editorState.edgeSharp}</span>
               </div>
               <Slider 
                 value={[editorState.edgeSharp]}
                 min={0}
                 max={100}
                 step={1}
                 onValueChange={([val]) => updateEditorState({ edgeSharp: val })}
                 className="h-1.5"
               />
               <p className="text-[9px] text-muted-foreground/60 leading-tight">
                 যেকোনো BG tool চালানোর পর adjust করো
               </p>
             </div>

             <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-1.5 text-red-400">
                   <Sparkles className="h-3 w-3" />
                   <span className="text-[10px] font-semibold uppercase tracking-tight">Despill</span>
                 </div>
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 px-2 text-[9px] bg-red-500/20 text-red-300 hover:bg-red-500/30 font-bold"
                    onClick={() => updateEditorState({ despill: !editorState.despill })}
                 >
                   Apply
                 </Button>
               </div>
               <p className="text-[9px] text-muted-foreground/60 leading-tight">
                 Edge এর color spill / halo দূর করে
               </p>
             </div>
           </div>
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
              onValueChange={([val]) => handleFilterChange(filter.key as any, val)}
              className="h-1.5"
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
