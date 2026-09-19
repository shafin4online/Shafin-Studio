import React, { useRef } from 'react';
import { Check, Palette } from 'lucide-react';
import { BgColorId } from '../types/aiEditorTypes';
import { BG_COLORS } from '../data/presetsData';

interface BackgroundSelectorProps {
  selectedBg: BgColorId;
  customHex: string;
  onSelectBg: (id: BgColorId) => void;
  onCustomColorChange: (hex: string) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  selectedBg,
  customHex,
  onSelectBg,
  onCustomColorChange
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
        <h3 className="text-xs font-bold text-slate-800 tracking-tight">ব্যাকগ্রাউন্ড</h3>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {BG_COLORS.map((color) => {
          const isSelected = selectedBg === color.id;

          if (color.isCustomPicker) {
            return (
              <div key={color.id} className="relative">
                <input
                  ref={colorInputRef}
                  type="color"
                  value={customHex}
                  onChange={(e) => {
                    onCustomColorChange(e.target.value);
                    onSelectBg('custom');
                  }}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSelectBg('custom');
                    colorInputRef.current?.click();
                  }}
                  title="কাস্টম ব্যাকগ্রাউন্ড কালার নির্বাচন করুন"
                  className={`w-full aspect-square rounded-lg flex items-center justify-center transition-transform cursor-pointer relative ${
                    isSelected ? 'ring-2 ring-amber-500 ring-offset-1 scale-105' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: isSelected ? customHex : '#7c3aed' }}
                >
                  <Palette className="w-4 h-4 text-white drop-shadow-xs" />
                  <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                </button>
              </div>
            );
          }

          return (
            <button
              key={color.id}
              onClick={() => onSelectBg(color.id)}
              title={color.label}
              className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer relative border ${
                isSelected 
                  ? 'ring-2 ring-amber-500 ring-offset-1 border-amber-500 scale-105 shadow-xs' 
                  : 'border-slate-200/80 hover:scale-102'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && (
                <Check className={`w-3.5 h-3.5 stroke-[3] ${
                  color.id === 'white' || color.id === 'off-white' 
                    ? 'text-amber-500' 
                    : 'text-white'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
