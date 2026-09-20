import React, { useRef, useEffect, useState } from 'react';
import { 
  Upload, 
  ImageIcon, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  Code, 
  Download, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  ArrowLeftRight, 
  X,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check
} from 'lucide-react';
import { PhotoSizeId } from '../types/aiEditorTypes';
import { PHOTO_SIZES } from '../data/presetsData';
import { MobileAiResultView } from './mobile/MobileAiResultView';

interface AiUploadAreaProps {
  selectedSize: PhotoSizeId;
  uploadedImage: string | null;
  uploadedImageLeft?: string | null;
  uploadedImageRight?: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
  generationProgress: string;
  dynamicPrompt: string;
  adjustments?: {
    brightness: number;
    contrast: number;
    saturation: number;
    sharpness: number;
  };
  onImageUpload: (dataUrl: string) => void;
  onRemoveImage: () => void;
  onImageUploadLeft?: (dataUrl: string) => void;
  onRemoveLeftImage?: () => void;
  onImageUploadRight?: (dataUrl: string) => void;
  onRemoveRightImage?: () => void;
  onSwapDual?: () => void;
  onExitDualMode?: () => void;
  onSendToStudio?: (dataUrl: string) => void;
  onClearGenerated?: () => void;
  onCopyImage?: () => void;
  onFeedbackGood?: () => void;
  onFeedbackBad?: () => void;
  onDownloadPhoto?: () => void;
  onOpenPrintSheet?: () => void;
}

export const AiUploadArea: React.FC<AiUploadAreaProps> = ({
  selectedSize,
  uploadedImage,
  uploadedImageLeft = null,
  uploadedImageRight = null,
  generatedImage,
  isGenerating,
  generationProgress,
  dynamicPrompt,
  adjustments = { brightness: 0, contrast: 0, saturation: 0, sharpness: 0 },
  onImageUpload,
  onRemoveImage,
  onImageUploadLeft,
  onRemoveLeftImage,
  onImageUploadRight,
  onRemoveRightImage,
  onSwapDual,
  onExitDualMode,
  onSendToStudio,
  onClearGenerated,
  onCopyImage,
  onFeedbackGood,
  onFeedbackBad,
  onDownloadPhoto,
  onOpenPrintSheet
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isLeftDragOver, setIsLeftDragOver] = useState(false);
  const [isRightDragOver, setIsRightDragOver] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [isComparingOriginal, setIsComparingOriginal] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'good' | 'bad' | 'copied' | null>(null);

  const isDualMode = selectedSize === 'dual';
  const sizePreset = PHOTO_SIZES.find(s => s.id === selectedSize) || PHOTO_SIZES[0];

  // Shortcut Ctrl+U / Cmd+U listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        if (isDualMode) {
          if (!uploadedImageLeft) {
            leftFileInputRef.current?.click();
          } else {
            rightFileInputRef.current?.click();
          }
        } else {
          fileInputRef.current?.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDualMode, uploadedImageLeft]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploadCallback?: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file && onUploadCallback) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUploadCallback(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDropFile = (
    e: React.DragEvent,
    onUploadCallback?: (dataUrl: string) => void
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && onUploadCallback) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUploadCallback(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-8 select-none">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, onImageUpload)}
        className="sr-only"
      />
      <input
        ref={leftFileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, onImageUploadLeft)}
        className="sr-only"
      />
      <input
        ref={rightFileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, onImageUploadRight)}
        className="sr-only"
      />

      {/* DUAL MODE UPLOAD STATE */}
      {isDualMode && !generatedImage ? (
        <div className="w-full max-w-4xl flex flex-col items-center justify-center gap-5">
          {/* Header pill */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-tight">
              যৌথ / ড্যুয়াল পাসপোর্ট ফটো মোড
            </span>
          </div>

          {/* Two Upload Cards Side-by-Side matching user screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl">
            {/* 1. Left Photo Card */}
            <div className="relative">
              {/* Red round cross button at top right corner matching screenshot */}
              <button
                type="button"
                onClick={() => onRemoveLeftImage?.()}
                title="বাম ছবি মুছুন"
                className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 z-20 cursor-pointer text-xs font-bold"
              >
                ✕
              </button>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsLeftDragOver(true);
                }}
                onDragLeave={() => setIsLeftDragOver(false)}
                onDrop={(e) => {
                  setIsLeftDragOver(false);
                  handleDropFile(e, onImageUploadLeft);
                }}
                className={`w-full aspect-[1.15/1] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-200 relative overflow-hidden ${
                  isLeftDragOver
                    ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
                    : 'border-slate-700/60 hover:border-slate-600 bg-slate-900/30'
                }`}
              >
                {uploadedImageLeft ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src={uploadedImageLeft}
                      alt="Left Person"
                      className="max-h-[160px] max-w-full object-contain rounded-xl shadow-md border border-slate-700/50 mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> বাম ছবি যুক্ত হয়েছে
                      </span>
                      <button
                        type="button"
                        onClick={() => leftFileInputRef.current?.click()}
                        className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                      >
                        পরিবর্তন
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-slate-800/70 border border-slate-700/60 flex items-center justify-center mb-3 text-slate-400 shadow-inner">
                      <ImageIcon className="w-7 h-7 stroke-[1.5]" />
                    </div>

                    <h3 className="text-sm md:text-base font-bold text-white mb-1 tracking-tight">
                      বাম দিকের ছবি আপলোড করুন
                    </h3>

                    <p className="text-xs text-slate-400 mb-4">
                      ছবি নির্বাচন করতে ক্লিক করুন
                    </p>

                    <button
                      type="button"
                      onClick={() => leftFileInputRef.current?.click()}
                      className="h-10 px-5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                      <span>ছবি আপলোড করুন</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 2. Right Photo Card */}
            <div className="relative">
              {/* Red round cross button at top right corner matching screenshot */}
              <button
                type="button"
                onClick={() => onRemoveRightImage?.()}
                title="ডান ছবি মুছুন"
                className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 z-20 cursor-pointer text-xs font-bold"
              >
                ✕
              </button>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsRightDragOver(true);
                }}
                onDragLeave={() => setIsRightDragOver(false)}
                onDrop={(e) => {
                  setIsRightDragOver(false);
                  handleDropFile(e, onImageUploadRight);
                }}
                className={`w-full aspect-[1.15/1] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-200 relative overflow-hidden ${
                  isRightDragOver
                    ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
                    : 'border-slate-700/60 hover:border-slate-600 bg-slate-900/30'
                }`}
              >
                {uploadedImageRight ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src={uploadedImageRight}
                      alt="Right Person"
                      className="max-h-[160px] max-w-full object-contain rounded-xl shadow-md border border-slate-700/50 mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ডান ছবি যুক্ত হয়েছে
                      </span>
                      <button
                        type="button"
                        onClick={() => rightFileInputRef.current?.click()}
                        className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                      >
                        পরিবর্তন
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-slate-800/70 border border-slate-700/60 flex items-center justify-center mb-3 text-slate-400 shadow-inner">
                      <ImageIcon className="w-7 h-7 stroke-[1.5]" />
                    </div>

                    <h3 className="text-sm md:text-base font-bold text-white mb-1 tracking-tight">
                      ডান দিকের ছবি আপলোড করুন
                    </h3>

                    <p className="text-xs text-slate-400 mb-4">
                      ছবি নির্বাচন করতে ক্লিক করুন
                    </p>

                    <button
                      type="button"
                      onClick={() => rightFileInputRef.current?.click()}
                      className="h-10 px-5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                      <span>ছবি আপলোড করুন</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Dual Action Buttons */}
          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={onSwapDual}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm cursor-pointer"
              title="বাম ও ডান ছবি অদলবদল করুন"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
              <span>ছবি অদলবদল (⇄)</span>
            </button>

            {onExitDualMode && (
              <button
                type="button"
                onClick={onExitDualMode}
                className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 hover:border-rose-900/60 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>একক মোডে ফিরুন</span>
              </button>
            )}
          </div>
        </div>
      ) : !uploadedImage && !uploadedImageLeft && !uploadedImageRight ? (
        /* SINGLE MODE: When NO image is uploaded -> Render single upload card */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            setIsDragOver(false);
            handleDropFile(e, onImageUpload);
          }}
          className={`w-full max-w-xl aspect-[1.25/1] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-amber-500 bg-amber-500/5 scale-[1.01]'
              : 'border-slate-700/60 hover:border-slate-600 bg-slate-900/20'
          }`}
        >
          {/* Circular Image Icon Placeholder */}
          <div className="w-16 h-16 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-5 text-slate-400 shadow-inner">
            <ImageIcon className="w-8 h-8 stroke-[1.5]" />
          </div>

          <h2 className="text-lg md:text-xl font-bold text-white mb-2 tracking-tight">
            একটি ছবি আপলোড করুন
          </h2>

          <p className="text-xs md:text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
            ক্লিক করুন অথবা QR স্ক্যান করে মোবাইল থেকে আপলোড করুন ({sizePreset.subLabel})
          </p>

          {/* Upload Button matching screenshot */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 px-6 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all duration-150 cursor-pointer mb-3"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>ছবি আপলোড করুন</span>
          </button>

          {/* Shortcut Badge matching screenshot */}
          <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-400 font-mono text-[10px] tracking-wider">
            Ctrl+U
          </div>
        </div>
      ) : (
        /* Image Preview Area */
        <div className="w-full max-w-2xl h-full flex flex-col items-center justify-center">
          {/* Top Info Bar (Hidden on mobile when generatedImage is present to match Screenshot 1) */}
          <div className={`w-full items-center justify-between pb-3 px-2 ${generatedImage ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold">
                {sizePreset.label} ({sizePreset.subLabel})
              </span>
              {generatedImage && (
                <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  এআই এডিটেড
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPromptModal(true)}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="এআই ডাইনামিক প্রম্পট দেখুন"
              >
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>প্রম্পট দেখুন</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>পরিবর্তন</span>
              </button>

              <button
                type="button"
                onClick={onRemoveImage}
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="ছবি সরান"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Main Image Box */}
          {generatedImage ? (
            <>
              {/* MOBILE POST-EDIT VIEW: Matches Screenshot 1 & 2 */}
              <div className="w-full flex-1 lg:hidden flex flex-col items-center justify-start overflow-hidden">
                <MobileAiResultView
                  generatedImage={generatedImage}
                  originalImage={uploadedImage || uploadedImageLeft || uploadedImageRight || null}
                  onClear={() => {
                    if (onClearGenerated) onClearGenerated();
                    else onRemoveImage();
                  }}
                  onCrop={() => {
                    if (onSendToStudio) {
                      onSendToStudio(generatedImage);
                    }
                  }}
                  onDownload={() => {
                    if (onDownloadPhoto) {
                      onDownloadPhoto();
                    } else {
                      const link = document.createElement('a');
                      link.download = `photo-${selectedSize}-${Date.now()}.png`;
                      link.href = generatedImage;
                      link.click();
                    }
                  }}
                  onPrint={() => {
                    if (onOpenPrintSheet) {
                      onOpenPrintSheet();
                    }
                  }}
                  onFeedbackGood={onFeedbackGood}
                  onFeedbackBad={onFeedbackBad}
                />
              </div>

              {/* DESKTOP VIEW: Large card with canvas and floating control bar */}
              <div className="hidden lg:flex relative max-h-[72vh] max-w-full flex-col items-center select-none">
                {/* White card border wrapper */}
                <div className="relative bg-white p-2 md:p-3 rounded-2xl shadow-2xl overflow-hidden border border-slate-700/60 max-h-[70vh] flex items-center justify-center">
                  {/* Top-Right Corner Controls: Eye (toggle compare) & Close (✕) */}
                  <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsComparingOriginal(prev => !prev)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-90 cursor-pointer ${
                        isComparingOriginal ? 'bg-amber-600 ring-2 ring-white/60' : 'bg-amber-500 hover:bg-amber-600'
                      }`}
                      title={isComparingOriginal ? 'এআই সম্পাদিত ছবি দেখুন' : 'আসল ছবি দেখুন'}
                    >
                      <Eye className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onClearGenerated) onClearGenerated();
                        else onRemoveImage();
                      }}
                      className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer text-xs font-bold"
                      title="ফলাফল বন্ধ করুন"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Main Photo with applied dynamic adjustments */}
                  <img
                    src={isComparingOriginal ? (uploadedImage || uploadedImageLeft || uploadedImageRight || '') : generatedImage}
                    alt="Studio Result"
                    style={{
                      filter: `brightness(${1 + (adjustments.brightness / 100)}) contrast(${1 + (adjustments.contrast / 100)}) saturate(${1 + (adjustments.saturation / 100)})`,
                    }}
                    className="max-h-[62vh] max-w-full object-contain block rounded-xl shadow-md"
                  />

                  {/* Original Photo Indicator badge if active */}
                  {isComparingOriginal && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 text-white text-[11px] font-semibold tracking-wide">
                      আসল ছবি
                    </div>
                  )}

                  {/* Bottom Center Floating Action Bar (ভালো হয়েছে / ভালো হয়নি / ছবি কপি করুন) */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/15 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackStatus('good');
                        onFeedbackGood?.();
                      }}
                      className={`h-8 px-3.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                        feedbackStatus === 'good'
                          ? 'bg-emerald-500 text-white ring-2 ring-white/60'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>ভালো হয়েছে</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackStatus('bad');
                        onFeedbackBad?.();
                      }}
                      className={`h-8 px-3.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                        feedbackStatus === 'bad'
                          ? 'bg-rose-500 text-white ring-2 ring-white/60'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>ভালো হয়নি</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onCopyImage?.();
                        setFeedbackStatus('copied');
                        setTimeout(() => setFeedbackStatus(null), 2000);
                      }}
                      className="h-8 px-3.5 rounded-full text-xs font-bold bg-[#1c2438] hover:bg-[#25304a] text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700/60 shadow-sm"
                    >
                      {feedbackStatus === 'copied' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>ছবি কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="relative max-h-[68vh] max-w-full rounded-2xl overflow-hidden border border-slate-700/60 bg-[#090d16] shadow-2xl flex items-center justify-center p-3">
              {/* Original Uploaded Image */}
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={uploadedImage || uploadedImageLeft || uploadedImageRight || ''}
                  alt="Original portrait"
                  className="max-h-[60vh] max-w-full object-contain block rounded-lg shadow-md"
                />

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                    <div className="w-12 h-12 rounded-full border-3 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
                    <span className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Google AI প্রসেসিং চলছে...
                    </span>
                    <span className="text-xs text-slate-300 max-w-xs">
                      {generationProgress || 'ছবিটি এআই প্রম্পট অনুযায়ী রূপান্তর করা হচ্ছে'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Prompt Viewer Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl relative animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">ডাইনামিক Google AI প্রম্পট</h3>
              </div>
              <button
                onClick={() => setShowPromptModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                বন্ধ করুন
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              আপনার নির্বাচিত সাইজ, ব্যাকগ্রাউন্ড, পোশাক ও অতিরিক্ত সেটিংস থেকে এই নিখুঁত প্রম্পটটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে:
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl max-h-64 overflow-y-auto studio-scrollbar font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
              {dynamicPrompt}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
