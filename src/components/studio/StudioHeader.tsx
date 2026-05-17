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
    <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <img src="/favicon.png" alt="Photo Studio logo" className="h-6 w-6" />
        <h1 className="text-base font-semibold tracking-tight font-mono-studio text-foreground">
          {import.meta.env.VITE_APP_TITLE || 'ShafinBD Studio'}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="h-8 gap-1.5"
        >
          <Undo2 className="h-3.5 w-3.5" />
          <span className="text-xs">Undo</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="h-8 gap-1.5"
        >
          <Redo2 className="h-3.5 w-3.5" />
          <span className="text-xs">Redo</span>
        </Button>
        <span className="text-xs text-muted-foreground ml-2">
          {images.length} image{images.length !== 1 ? 's' : ''} loaded
        </span>
      </div>
    </header>
  );
}
