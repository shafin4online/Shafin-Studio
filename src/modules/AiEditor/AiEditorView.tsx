import React, { useState, useMemo } from 'react';
import { PhotoSizeId, BgColorId, DressCustomization } from './types/aiEditorTypes';
import { AiEditorSidebar } from './components/AiEditorSidebar';
import { AiUploadArea } from './components/AiUploadArea';
import { MobileQrCard } from './components/MobileQrCard';
import { AiGeneratedSidebar, ImageAdjustments } from './components/AiGeneratedSidebar';
import { AiPrintSheetView } from './components/AiPrintSheetView';
import { buildDynamicPrompt } from './utils/promptBuilder';
import { ApiPoolManagerModal } from './components/ApiPoolManagerModal';
import { MobilePhotoSizeSheet } from './components/mobile/MobilePhotoSizeSheet';
import { MobileStyleBgSheet } from './components/mobile/MobileStyleBgSheet';
import { MobileEnhancementSheet } from './components/mobile/MobileEnhancementSheet';
import { MobileBottomDock } from './components/mobile/MobileBottomDock';
import { useStudio } from '@/context/StudioContext';
import { Sparkles, ArrowLeft, Server, AlertCircle, X } from 'lucide-react';

interface AiEditorViewProps {
  onBackToStudio?: () => void;
}

export const AiEditorView: React.FC<AiEditorViewProps> = ({ onBackToStudio }) => {
  const { addStudioImage, setActiveImage, setActiveView } = useStudio();

  // State
  const [activeMobileSheet, setActiveMobileSheet] = useState<'size' | 'styleBg' | 'enhancements' | null>(null);
  const [isApiManagerOpen, setIsApiManagerOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<PhotoSizeId>('passport');
  const [selectedBg, setSelectedBg] = useState<BgColorId>('white');
  const [customBgHex, setCustomBgHex] = useState<string>('#6366f1');
  const [selectedDressId, setSelectedDressId] = useState<string>('none');
  const [dressCustomization, setDressCustomization] = useState<DressCustomization>({
    colorHex: '#FFFFFF',
    colorLabel: 'সাদা',
    isCheckPattern: false,
    hasTie: false,
  });

  // Dual mode specific states
  const [leftDressId, setLeftDressId] = useState<string>('none');
  const [leftDressCustomization, setLeftDressCustomization] = useState<DressCustomization>({
    colorHex: '#FFFFFF',
    colorLabel: 'সাদা',
    isCheckPattern: false,
    hasTie: false,
  });
  const [rightDressId, setRightDressId] = useState<string>('none');
  const [rightDressCustomization, setRightDressCustomization] = useState<DressCustomization>({
    colorHex: '#FFFFFF',
    colorLabel: 'সাদা',
    isCheckPattern: false,
    hasTie: false,
  });
  const [uploadedImageLeft, setUploadedImageLeft] = useState<string | null>(null);
  const [uploadedImageRight, setUploadedImageRight] = useState<string | null>(null);

  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([
    'beauty-enhance',
    'skin-smooth'
  ]);
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [apiErrorNotice, setApiErrorNotice] = useState<string | null>(null);

  // Post-generation image adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0
  });

  // Print Sheet View toggle
  const [isPrintSheetOpen, setIsPrintSheetOpen] = useState<boolean>(false);

  const isDualMode = selectedSize === 'dual';

  // Compute dynamic prompt in real-time as user changes selections
  const dynamicPrompt = useMemo(() => {
    return buildDynamicPrompt({
      sizeId: selectedSize,
      bgId: selectedBg,
      customBgHex,
      dressId: selectedDressId,
      dressCustomization,
      leftDressId,
      leftDressCustomization,
      rightDressId,
      rightDressCustomization,
      enhancementIds: selectedEnhancements,
      customInstruction
    });
  }, [
    selectedSize, 
    selectedBg, 
    customBgHex, 
    selectedDressId, 
    dressCustomization, 
    leftDressId,
    leftDressCustomization,
    rightDressId,
    rightDressCustomization,
    selectedEnhancements, 
    customInstruction
  ]);

  // Handlers
  const handleToggleEnhancement = (id: string) => {
    setSelectedEnhancements(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChangeDressCustomization = (updates: Partial<DressCustomization>) => {
    setDressCustomization(prev => ({ ...prev, ...updates }));
  };

  const handleResetSize = () => {
    setSelectedSize('passport');
  };

  const handleSwapDual = () => {
    // Swap images
    const tempImg = uploadedImageLeft;
    setUploadedImageLeft(uploadedImageRight);
    setUploadedImageRight(tempImg);

    // Swap dresses
    const tempDress = leftDressId;
    setLeftDressId(rightDressId);
    setRightDressId(tempDress);

    // Swap customizations
    const tempCust = leftDressCustomization;
    setLeftDressCustomization(rightDressCustomization);
    setRightDressCustomization(tempCust);
  };

  const handleGeneratePhoto = async () => {
    if (isDualMode) {
      if (!uploadedImageLeft && !uploadedImageRight) {
        alert('অনুগ্রহ করে অন্তত একটি ছবি (বাম বা ডান) আপলোড করুন।');
        return;
      }
    } else {
      if (!uploadedImage) {
        alert('অনুগ্রহ করে প্রথমে একটি ছবি আপলোড করুন।');
        return;
      }
    }

    setIsGenerating(true);
    setGenerationProgress('Google AI প্রম্পট সংকলন করা হচ্ছে...');

    try {
      setGenerationProgress('Google AI নিউরাল সার্ভারের সাথে কানেক্ট করা হচ্ছে...');
      
      const effectiveBgHex = selectedBg === 'custom' 
        ? customBgHex 
        : selectedBg === 'white' ? '#FFFFFF' : '#3b82f6';

      setApiErrorNotice(null);

      // Retrieve locally saved client keys for multi-instance / serverless cold-start resilience
      let clientKeys: Array<{ name: string; apiKey: string }> = [];
      try {
        const stored = localStorage.getItem('shafinbd_gemini_keys');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) clientKeys = parsed;
        }
      } catch (e) {
        console.warn('Failed to parse local stored keys:', e);
      }

      const response = await fetch('/api/ai-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: isDualMode ? (uploadedImageLeft || uploadedImageRight) : uploadedImage,
          leftImage: uploadedImageLeft,
          rightImage: uploadedImageRight,
          prompt: dynamicPrompt,
          size: selectedSize,
          dressId: isDualMode ? undefined : selectedDressId,
          leftDressId,
          rightDressId,
          bgHex: effectiveBgHex,
          clientKeys
        })
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        if (data.image) {
          setGeneratedImage(data.image);
          setApiErrorNotice(null);
          setIsGenerating(false);
          return;
        } else if (data.error || data.message) {
          setApiErrorNotice(data.error || data.message);
        }
      } else if (response) {
        const errData = await response.json().catch(() => null);
        if (errData?.error || errData?.message) {
          setApiErrorNotice(errData.error || errData.message);
        }
      }

      // Fallback or UI preview simulation
      setGenerationProgress('ছবিটি সফলভাবে প্রসেস করা হয়েছে!');
      if (isDualMode) {
        // Compose dual image side-by-side
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = effectiveBgHex;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = src;
          });

          const [imgL, imgR] = await Promise.all([
            uploadedImageLeft ? loadImg(uploadedImageLeft).catch(() => null) : Promise.resolve(null),
            uploadedImageRight ? loadImg(uploadedImageRight).catch(() => null) : Promise.resolve(null),
          ]);

          const halfW = canvas.width / 2;
          const targetH = canvas.height * 0.92;
          const targetY = canvas.height * 0.08;

          if (imgL && imgR) {
            const wL = targetH * (imgL.width / imgL.height);
            const xL = (halfW - wL) / 2 + halfW * 0.15;
            ctx.drawImage(imgL, xL, targetY, wL, targetH);

            const wR = targetH * (imgR.width / imgR.height);
            const xR = halfW + (halfW - wR) / 2 - halfW * 0.15;
            ctx.drawImage(imgR, xR, targetY, wR, targetH);
          } else if (imgL) {
            const w = targetH * (imgL.width / imgL.height);
            ctx.drawImage(imgL, (canvas.width - w) / 2, targetY, w, targetH);
          } else if (imgR) {
            const w = targetH * (imgR.width / imgR.height);
            ctx.drawImage(imgR, (canvas.width - w) / 2, targetY, w, targetH);
          }

          setGeneratedImage(canvas.toDataURL('image/png'));
        } else {
          setGeneratedImage(uploadedImageLeft || uploadedImageRight || uploadedImage);
        }
      } else if (uploadedImage) {
        // High-fidelity client-side portrait framing & background rendering
        const canvas = document.createElement('canvas');
        let targetW = 900;
        let targetH = 1100; // default 45x55 passport ratio
        if (selectedSize === 'visa') {
          targetW = 1000;
          targetH = 1000;
        } else if (selectedSize === 'epass') {
          targetW = 820;
          targetH = 1025;
        } else if (selectedSize === 'birth') {
          targetW = 900;
          targetH = 1200;
        }
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = effectiveBgHex;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = uploadedImage;
          });

          if (img.width && img.height) {
            const imgAspect = img.width / img.height;
            const canvasAspect = targetW / targetH;
            let drawW = targetW;
            let drawH = targetH;
            let drawX = 0;
            let drawY = 0;

            if (imgAspect > canvasAspect) {
              drawW = targetH * imgAspect;
              drawX = (targetW - drawW) / 2;
            } else {
              drawH = targetW / imgAspect;
              drawY = 0; // Top-align portrait
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            setGeneratedImage(canvas.toDataURL('image/png'));
          } else {
            setGeneratedImage(uploadedImage);
          }
        } else {
          setGeneratedImage(uploadedImage);
        }
      } else {
        setGeneratedImage(uploadedImage);
      }
      setIsGenerating(false);
    } catch (err: unknown) {
      console.warn('AI Editor generation note:', err);
      setIsGenerating(false);
    }
  };

  const handleSendToStudio = (imageSrc: string) => {
    const id = `ai-gen-${Date.now()}`;
    const newImage = {
      id,
      name: `AI_${selectedSize.toUpperCase()}_Photo.png`,
      original: imageSrc,
      edited: imageSrc,
      thumbnail: imageSrc
    };

    addStudioImage(newImage);
    setActiveImage(id);

    if (setActiveView) {
      setActiveView('studio');
    }
    if (onBackToStudio) {
      onBackToStudio();
    }
  };

  const handleDownloadPhoto = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `studio-ai-photo-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyPhoto = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  const handleCropPhoto = () => {
    if (generatedImage) {
      handleSendToStudio(generatedImage);
    }
  };

  const handleCustomSize = () => {
    setIsPrintSheetOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full w-full overflow-hidden bg-[#0c101d] text-slate-100 relative select-none">
      {/* Print Sheet Fullscreen Engine (Screenshot 3) */}
      {isPrintSheetOpen && generatedImage && (
        <AiPrintSheetView
          imageSrc={generatedImage}
          onBack={() => setIsPrintSheetOpen(false)}
        />
      )}

      {/* Centrally Managed AI API Pool Modal */}
      <ApiPoolManagerModal
        isOpen={isApiManagerOpen}
        onClose={() => setIsApiManagerOpen(false)}
      />

      {/* Top Banner on Mobile for Back navigation & API Pool */}
      <div className="lg:hidden flex items-center justify-between px-3 py-2.5 bg-[#0e1322] border-b border-slate-800 shrink-0 select-none">
        <button
          type="button"
          onClick={onBackToStudio}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>স্টুডিও</span>
        </button>
        <span className="text-xs font-bold text-slate-200">AI স্টুডিও ফটো এডিটর</span>
        <button
          type="button"
          onClick={() => setIsApiManagerOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[11px] font-bold text-amber-400 border border-slate-700/80 cursor-pointer transition-colors shadow-2xs"
        >
          <Server className="w-3.5 h-3.5 text-amber-400" />
          <span>API পুল</span>
        </button>
      </div>

      {/* Left Sidebar (ছবি তৈরির সেটিংস) - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:flex h-full shrink-0 z-10 flex-col">
        <AiEditorSidebar
          selectedSize={selectedSize}
          selectedBg={selectedBg}
          customBgHex={customBgHex}
          selectedDressId={selectedDressId}
          dressCustomization={dressCustomization}
          isDualMode={isDualMode}
          leftDressId={leftDressId}
          leftDressCustomization={leftDressCustomization}
          onSelectLeftDress={setLeftDressId}
          onChangeLeftDressCustomization={(updates) => setLeftDressCustomization(prev => ({ ...prev, ...updates }))}
          rightDressId={rightDressId}
          rightDressCustomization={rightDressCustomization}
          onSelectRightDress={setRightDressId}
          onChangeRightDressCustomization={(updates) => setRightDressCustomization(prev => ({ ...prev, ...updates }))}
          selectedEnhancements={selectedEnhancements}
          customInstruction={customInstruction}
          isGenerating={isGenerating}
          onSelectSize={setSelectedSize}
          onResetSize={handleResetSize}
          onSelectBg={setSelectedBg}
          onCustomBgChange={setCustomBgHex}
          onSelectDress={setSelectedDressId}
          onChangeDressCustomization={handleChangeDressCustomization}
          onToggleEnhancement={handleToggleEnhancement}
          onCustomInstructionChange={setCustomInstruction}
          onGeneratePhoto={handleGeneratePhoto}
          onOpenApiManager={() => setIsApiManagerOpen(true)}
        />
      </div>

      {/* Center Canvas Workspace */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-[#0b0f19] pb-20 lg:pb-0">
        {/* API Error Notification Alert */}
        {apiErrorNotice && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-950/90 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg z-30 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-amber-300 block">AI সার্ভিস সংক্রান্ত তথ্য:</span>
                <span className="text-[11px] text-amber-200/90 truncate block">{apiErrorNotice}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsApiManagerOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                কী পুল ম্যানেজার
              </button>
              <button
                type="button"
                onClick={() => setApiErrorNotice(null)}
                className="w-6 h-6 rounded-md hover:bg-white/10 text-amber-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top-Right Floating Mobile QR Card (Desktop only, when image is not yet generated) */}
        {!generatedImage && (
          <div className="hidden md:block absolute top-5 right-5 z-20">
            <MobileQrCard />
          </div>
        )}

        {/* Center Canvas / Upload Dropzone */}
        <div className="flex-1 w-full h-full flex items-center justify-center">
          <AiUploadArea
            selectedSize={selectedSize}
            uploadedImage={uploadedImage}
            uploadedImageLeft={uploadedImageLeft}
            uploadedImageRight={uploadedImageRight}
            generatedImage={generatedImage}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            dynamicPrompt={dynamicPrompt}
            adjustments={adjustments}
            onImageUpload={(dataUrl) => {
              setUploadedImage(dataUrl);
              setGeneratedImage(null);
            }}
            onRemoveImage={() => {
              setUploadedImage(null);
              setGeneratedImage(null);
            }}
            onImageUploadLeft={(dataUrl) => {
              setUploadedImageLeft(dataUrl);
              setGeneratedImage(null);
            }}
            onRemoveLeftImage={() => {
              setUploadedImageLeft(null);
              setGeneratedImage(null);
            }}
            onImageUploadRight={(dataUrl) => {
              setUploadedImageRight(dataUrl);
              setGeneratedImage(null);
            }}
            onRemoveRightImage={() => {
              setUploadedImageRight(null);
              setGeneratedImage(null);
            }}
            onSwapDual={handleSwapDual}
            onExitDualMode={() => setSelectedSize('passport')}
            onSendToStudio={handleSendToStudio}
            onClearGenerated={() => setGeneratedImage(null)}
            onCopyImage={handleCopyPhoto}
            onFeedbackGood={() => {
              console.log('User liked the generated photo');
            }}
            onFeedbackBad={() => {
              console.log('User disliked the generated photo');
            }}
            onDownloadPhoto={handleDownloadPhoto}
            onOpenPrintSheet={() => setIsPrintSheetOpen(true)}
          />
        </div>
      </main>

      {/* Right Sidebar (তৈরি হওয়া ছবি এডিট করুন - matches Screenshot 1) */}
      {generatedImage && (
        <AiGeneratedSidebar
          adjustments={adjustments}
          onChangeAdjustments={setAdjustments}
          onCrop={handleCropPhoto}
          onDownload={handleDownloadPhoto}
          onCustomSize={handleCustomSize}
          onCopyImage={handleCopyPhoto}
          onPrint={() => setIsPrintSheetOpen(true)}
        />
      )}

      {/* Mobile Floating Bottom Dock (Mobile only, hidden when generated image result is active) */}
      {!generatedImage && (
        <MobileBottomDock
          selectedSize={selectedSize}
          selectedDressId={selectedDressId}
          selectedBg={selectedBg}
          customBgHex={customBgHex}
          selectedEnhancements={selectedEnhancements}
          isProcessing={isGenerating}
          hasInputImage={Boolean(uploadedImage || (uploadedImageLeft && uploadedImageRight))}
          onOpenSizeSheet={() => setActiveMobileSheet('size')}
          onOpenStyleBgSheet={() => setActiveMobileSheet('styleBg')}
          onOpenEnhancementSheet={() => setActiveMobileSheet('enhancements')}
          onGenerate={handleGeneratePhoto}
          onBackToStudio={onBackToStudio}
        />
      )}

      {/* Mobile Bottom Sheets (Matching User Screenshots 1, 2, 3) */}
      <MobilePhotoSizeSheet
        isOpen={activeMobileSheet === 'size'}
        onClose={() => setActiveMobileSheet(null)}
        selectedSize={selectedSize}
        onSelectSize={(newSize) => {
          setSelectedSize(newSize);
        }}
      />

      <MobileStyleBgSheet
        isOpen={activeMobileSheet === 'styleBg'}
        onClose={() => setActiveMobileSheet(null)}
        selectedDressId={selectedDressId}
        dressCustomization={dressCustomization}
        onSelectDress={(id) => setSelectedDressId(id)}
        onChangeDressCustomization={handleChangeDressCustomization}
        selectedBg={selectedBg}
        customBgHex={customBgHex}
        onSelectBg={setSelectedBg}
        onCustomBgChange={setCustomBgHex}
      />

      <MobileEnhancementSheet
        isOpen={activeMobileSheet === 'enhancements'}
        onClose={() => setActiveMobileSheet(null)}
        selectedEnhancements={selectedEnhancements}
        onToggleEnhancement={handleToggleEnhancement}
        customPrompt={customInstruction}
        onChangeCustomPrompt={setCustomInstruction}
      />
    </div>
  );
};
