import React, { useState } from 'react';
import { LeftSidebar } from './components/studio/LeftSidebar';
import { CenterPreview } from './components/studio/CenterPreview';
import { StudioProvider, useStudio } from './context/StudioContext';
import { StudioHeader } from './components/studio/StudioHeader';
import { RightSidebar } from './components/studio/RightSidebar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SlidersHorizontal, FolderClosed, Undo2, Redo2, Home, Sparkles } from 'lucide-react';
import { PerspectiveCropDialog } from './components/studio/PerspectiveCropDialog';
import { AiEditorView } from './modules/AiEditor/AiEditorView';

const StudioWorkspace: React.FC = () => {
  const { 
    undo, 
    redo, 
    history, 
    historyIndex, 
    isPerspectiveCropOpen, 
    setIsPerspectiveCropOpen, 
    activeImageId, 
    images,
    mobileLeftOpen,
    setMobileLeftOpen,
    mobileRightOpen,
    setMobileRightOpen,
    activeView,
    setActiveView
  } = useStudio();

  const activeImage = images.find(img => img.id === activeImageId) || null;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  if (activeView === 'ai-editor') {
    return (
      <div className="flex flex-col h-screen bg-[#0c101d] text-foreground overflow-hidden pb-16 lg:pb-0">
        <StudioHeader />
        <div className="flex-1 overflow-hidden relative">
          <AiEditorView onBackToStudio={() => setActiveView('studio')} />
        </div>

        {/* Mobile Sticky Bottom Bar in AI Editor */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090a0d] border-t border-border/40 px-2 flex items-center justify-around z-40 shadow-2xl">
          <button
            onClick={() => setActiveView('studio')}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 h-12 w-20 text-center cursor-pointer"
          >
            <Home className="h-5 w-5 text-indigo-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Classic Studio</span>
          </button>

          <div className="flex flex-col items-center justify-center gap-1 text-amber-400 font-bold h-12 w-20 text-center">
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider">AI Editor</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden pb-16 lg:pb-0">
      <StudioHeader />
      
      {/* Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Desktop only */}
        <div className="hidden lg:flex shrink-0">
          <LeftSidebar />
        </div>
        
        {/* Center Canvas Preview (responsive height/width) */}
        <CenterPreview />
        
        {/* Right Sidebar - Desktop only */}
        <div className="hidden lg:flex shrink-0">
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Left Sidebar Drawer (AI Tools, Crop, Filters) */}
      <Sheet open={mobileLeftOpen} onOpenChange={setMobileLeftOpen}>
        <SheetContent side="left" className="p-0 bg-[#0f1116] border-r border-[#1a1d29] w-[280px] sm:w-[320px] text-white flex flex-col z-[150] shadow-2xl">
          <div className="pt-10 px-4 pb-2 border-b border-border/20 flex-shrink-0">
            <SheetTitle className="font-bold text-[11px] uppercase text-zinc-400 tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-purple-400" />
              Adjustments & AI Tools
            </SheetTitle>
          </div>
          <div className="flex-1 overflow-y-auto studio-scrollbar">
            <LeftSidebar />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Right Sidebar Drawer (Image Tray, Colors, Layers, Export) */}
      <Sheet open={mobileRightOpen} onOpenChange={setMobileRightOpen}>
        <SheetContent side="right" className="p-0 bg-[#0f1116] border-l border-[#1a1d29] w-[280px] sm:w-[320px] text-white flex flex-col z-[150] shadow-2xl">
          <div className="pt-10 px-4 pb-2 border-b border-border/20 flex-shrink-0">
            <SheetTitle className="font-bold text-[11px] uppercase text-zinc-400 tracking-wider flex items-center gap-2">
              <FolderClosed className="h-4 w-4 text-blue-400" />
              Photo Tray & Colors
            </SheetTitle>
          </div>
          <div className="flex-1 overflow-y-auto studio-scrollbar">
            <RightSidebar />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Sticky Bottom Action Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090a0d] border-t border-border/40 px-2 flex items-center justify-around z-40 shadow-2xl">
        {/* Main App Home Link */}
        <a
          href="https://www.shafinbd.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 h-12 w-14 text-center cursor-pointer"
          title="Go to main app main page"
        >
          <Home className="h-5 w-5 text-indigo-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
        </a>

        {/* AI Editor Quick Switcher on Mobile */}
        <button
          onClick={() => setActiveView('ai-editor')}
          className="flex flex-col items-center justify-center gap-1 text-amber-400 hover:text-amber-300 transition-all duration-200 hover:scale-105 active:scale-95 h-12 w-14 text-center cursor-pointer"
          title="Open AI Editor"
        >
          <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider">AI Edit</span>
        </button>

        {/* Left Drawer Trigger */}
        <button
          onClick={() => {
            setMobileRightOpen(false);
            setMobileLeftOpen(true);
          }}
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 h-12 w-14 text-center cursor-pointer"
        >
          <SlidersHorizontal className="h-5 w-5 text-purple-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Filters</span>
        </button>

        {/* Dynamic Mobile Undo Button */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 hover:scale-110 active:scale-95 h-13 w-10 text-center cursor-pointer"
          title="Undo Action"
        >
          <Undo2 className="h-5 w-5 text-amber-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Undo</span>
        </button>

        {/* Dynamic Mobile Redo Button */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 hover:scale-110 active:scale-95 h-13 w-10 text-center cursor-pointer"
          title="Redo Action"
        >
          <Redo2 className="h-5 w-5 text-emerald-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Redo</span>
        </button>

        {/* Right Drawer Trigger */}
        <button
          onClick={() => {
            setMobileLeftOpen(false);
            setMobileRightOpen(true);
          }}
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 h-12 w-14 text-center cursor-pointer"
        >
          <FolderClosed className="h-5 w-5 text-blue-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Tray</span>
        </button>
      </div>

      <PerspectiveCropDialog 
        open={isPerspectiveCropOpen} 
        onOpenChange={setIsPerspectiveCropOpen} 
        image={activeImage} 
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StudioProvider>
      <StudioWorkspace />
    </StudioProvider>
  );
};

export default App;
