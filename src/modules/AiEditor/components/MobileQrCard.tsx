import React, { useState } from 'react';
import { QrCode, Scan, X, Smartphone, Check, Copy } from 'lucide-react';

export const MobileQrCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://studio.shafinbd.com';

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Widget (matches screenshot) */}
      <div className="bg-[#1a2030]/90 border border-slate-700/50 backdrop-blur-md rounded-2xl p-3.5 shadow-xl w-[260px] flex flex-col gap-2.5 transition-transform hover:scale-[1.01]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 shadow-inner">
            <QrCode className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-100 leading-tight">
              মোবাইল থেকে ছবি আপলোড করুন
            </span>
            <span className="text-[10px] text-slate-400">
              QR কোড স্ক্যান করুন
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full h-8 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Scan className="w-3.5 h-3.5 text-slate-400" />
          <span>স্ক্যান QR কোড</span>
        </button>
      </div>

      {/* Modal Dialog for QR Code */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-700 rounded-2xl max-w-sm w-full p-5 text-center relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-500">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">মোবাইল থেকে কানেক্ট করুন</h3>
            <p className="text-xs text-slate-400 mb-4">
              ফোনের ক্যামেরা দিয়ে QR কোডটি স্ক্যান করে যেকোনো ছবি সরাসরি আপলোড করুন
            </p>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`}
                alt="Mobile QR Code"
                className="w-40 h-40 object-contain block mx-auto"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 text-[11px] rounded-lg px-2.5 py-1.5 truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
