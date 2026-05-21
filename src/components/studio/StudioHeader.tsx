import { useEffect } from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useStudio } from '@/context/StudioContext';
import { Button } from '@/components/ui/button';

export function StudioHeader() {
  const { images, undo, redo, history, historyIndex } = useStudio();
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

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
            disabled={historyIndex <= 0}
            className="h-9 px-4 border-border/40 bg-transparent hover:bg-muted/10 text-white gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Undo2 className="h-4 w-4" />
            <span className="text-xs font-medium">Undo</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="h-9 px-4 border-border/40 bg-transparent hover:bg-muted/10 text-white gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Redo2 className="h-4 w-4" />
            <span className="text-xs font-medium">Redo</span>
          </Button>
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
