import React from 'react';
import { RotateCcw, Check, User, Users, FileText, Plane, Award } from 'lucide-react';
import { PhotoSizeId } from '../types/aiEditorTypes';
import { PHOTO_SIZES } from '../data/presetsData';

interface PhotoSizeSelectorProps {
  selectedSize: PhotoSizeId;
  onSelectSize: (id: PhotoSizeId) => void;
  onReset: () => void;
}

export const PhotoSizeSelector: React.FC<PhotoSizeSelectorProps> = ({
  selectedSize,
  onSelectSize,
  onReset
}) => {
  const getIcon = (id: PhotoSizeId) => {
    switch (id) {
      case 'passport':
        return <User className="w-5 h-5 text-amber-500" />;
      case 'dual':
        return <Users className="w-5 h-5 text-slate-400" />;
      case 'epass':
        return <FileText className="w-5 h-5 text-slate-400" />;
      case 'visa':
        return <Plane className="w-5 h-5 text-slate-400" />;
      case 'birth':
        return <Award className="w-5 h-5 text-slate-400" />;
      default:
        return <User className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
          <h3 className="text-xs font-bold text-slate-800 tracking-tight">ছবির মাপ</h3>
        </div>
        <button
          onClick={onReset}
          title="রিসেট করুন"
          className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sizes row grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {PHOTO_SIZES.map((preset) => {
          const isSelected = selectedSize === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectSize(preset.id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-amber-50/70 border-2 border-amber-500 shadow-sm'
                  : 'bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              <div className="p-1 mb-1">
                {getIcon(preset.id)}
              </div>
              <span className={`text-[11px] font-semibold leading-tight ${
                isSelected ? 'text-amber-700' : 'text-slate-600'
              }`}>
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
