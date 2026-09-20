import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface MobileBottomSheetWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const MobileBottomSheetWrapper: React.FC<MobileBottomSheetWrapperProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}) => {
  // Prevent background scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Bottom Sheet Card */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full bg-[#f4f5f7] rounded-t-[32px] shadow-2xl max-h-[88vh] flex flex-col overflow-hidden border-t border-slate-200"
          >
            {/* Top Drag Indicator */}
            <div className="pt-3 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header: Title + Subtitle + Close Button (Matches Screenshots exactly) */}
            <div className="px-5 py-3 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="বন্ধ করুন"
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* Content Area */}
            <div className="px-4 pb-6 pt-1 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
