import { useEffect, useState, useRef } from 'react';
import { Undo2, Redo2, Keyboard, Sparkles, HelpCircle } from 'lucide-react';
import { useStudio } from '@/context/StudioContext';
import { Button } from '@/components/ui/button';

export function StudioHeader() {
  const { images, undo, redo, history, historyIndex, batchOpen, setBatchOpen } = useStudio();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const alt = e.altKey;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
      } else if ((alt && e.key.toLowerCase() === 'b') || (mod && e.shiftKey && e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        setBatchOpen(!batchOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, batchOpen, setBatchOpen]);

  // Close shortcuts dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowShortcuts(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border/60 bg-[#0f1116] shadow-sm z-50">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-600/20">
          S
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-bold tracking-tight text-white">
            Photo Studio
          </h1>
          <span className="text-xs text-muted-foreground font-light hidden sm:inline">
            — Online Photo Editor
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="h-9 px-4 border-border/40 bg-transparent hover:bg-muted/10 text-white gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Undo2 className="h-4 w-4" />
            <span className="text-xs font-medium">Undo</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="h-9 px-4 border-border/40 bg-transparent hover:bg-muted/10 text-white gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Redo2 className="h-4 w-4" />
            <span className="text-xs font-medium">Redo</span>
          </Button>

          {/* Keyboard Shortcuts Trigger and Dropdown */}
          <div ref={containerRef} className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcuts(!showShortcuts)}
              onMouseEnter={() => setShowShortcuts(true)}
              className={`h-9 w-9 p-0 border-border/40 bg-transparent text-white transition-all hover:scale-105 active:scale-95 ${
                showShortcuts ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400' : 'hover:bg-muted/10'
              }`}
              title="Keyboard Shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </Button>

            {showShortcuts && (
              <div 
                className="absolute right-0 mt-2 w-72 rounded-lg bg-[#0e1117] border border-slate-800 p-4 shadow-2xl z-[100] animate-in fade-in duration-150"
                onMouseLeave={() => setShowShortcuts(false)}
              >
                <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-slate-800">
                  <Keyboard className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">Keyboard Shortcuts</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Undo Action</span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-800 border border-slate-700 rounded text-slate-300 shadow-sm">Ctrl</kbd>
                      <span className="text-slate-500 font-mono text-[9px]">+</span>
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-800 border border-slate-700 rounded text-slate-300 shadow-sm">Z</kbd>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Redo Action</span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-800 border border-slate-700 rounded text-slate-300 shadow-sm">Ctrl</kbd>
                        <span className="text-slate-500 font-mono text-[9px]">+</span>
                        <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-800 border border-slate-700 rounded text-slate-300 shadow-sm">Y</kbd>
                      </span>
                      <span className="text-[9px] text-slate-600 font-light italic">or Ctrl + Shift + Z</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/50">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-indigo-400" />
                      Batch Edit
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-800 border border-slate-700 rounded text-slate-300 shadow-sm">Alt</kbd>
                        <span className="text-slate-500 font-mono text-[9px]">+</span>
                        <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-800 border border-slate-700 rounded text-slate-300 shadow-sm">B</kbd>
                      </span>
                      <span className="text-[9px] text-slate-600 font-light italic">or Ctrl + Shift + B</span>
                    </span>
                  </div>
                </div>

                <p className="text-[9px] text-slate-500 font-medium text-center mt-4 pt-2 border-t border-slate-800/40">
                  Press <kbd className="px-1 py-0.2 bg-slate-800/50 rounded font-mono">Alt+B</kbd> anywhere to batch apply!
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="h-9 px-4 flex items-center border border-border/40 rounded-md bg-muted/5">
          <span className="text-xs text-muted-foreground font-mono">
            {images.length} images loaded
          </span>
        </div>
      </div>
    </header>
  );
}
