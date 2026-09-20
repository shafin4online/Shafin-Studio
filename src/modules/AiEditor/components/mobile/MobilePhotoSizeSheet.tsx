import React, { useState } from 'react';
import { User, Users, FileText, Plane, Award, Check } from 'lucide-react';
import { PhotoSizeId } from '../../types/aiEditorTypes';
import { PHOTO_SIZES, COUNTRY_VISA_SIZES } from '../../data/presetsData';
import { MobileBottomSheetWrapper } from './MobileBottomSheetWrapper';

interface MobilePhotoSizeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize: PhotoSizeId;
  onSelectSize: (id: PhotoSizeId) => void;
}

export const MobilePhotoSizeSheet: React.FC<MobilePhotoSizeSheetProps> = ({
  isOpen,
  onClose,
  selectedSize,
  onSelectSize
}) => {
  const [selectedCountrySizeId, setSelectedCountrySizeId] = useState<string>('us-india-2x2');

  const getCategoryIcon = (id: PhotoSizeId, isSelected: boolean) => {
    const stroke = isSelected ? 'text-amber-500' : 'text-slate-400';
    switch (id) {
      case 'passport':
        return (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center">
            <User className={`w-6 h-6 ${stroke}`} />
          </div>
        );
      case 'dual':
        return (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center">
            <Users className={`w-6 h-6 ${stroke}`} />
          </div>
        );
      case 'epass':
        return (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center">
            <FileText className={`w-6 h-6 ${stroke}`} />
          </div>
        );
      case 'visa':
        return (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center">
            <Plane className={`w-6 h-6 ${stroke}`} />
          </div>
        );
      case 'birth':
        return (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center">
            <Award className={`w-6 h-6 ${stroke}`} />
          </div>
        );
      default:
        return <User className={`w-6 h-6 ${stroke}`} />;
    }
  };

  return (
    <MobileBottomSheetWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="ছবির মাপ"
      subtitle="ছবির মাপ বেছে নিন"
    >
      {/* Top Categories Row (Matches Screenshot 1) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs">
        <div className="grid grid-cols-5 gap-2">
          {PHOTO_SIZES.map((preset) => {
            const isSelected = selectedSize === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelectSize(preset.id);
                }}
                className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 border-amber-500 bg-amber-50/10 shadow-xs'
                    : 'border border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                {/* Active Orange Checkmark Badge at Bottom Right */}
                {isSelected && (
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}

                <div className="mb-1">
                  {getCategoryIcon(preset.id, isSelected)}
                </div>

                <span
                  className={`text-[11px] font-bold leading-none ${
                    isSelected ? 'text-amber-500' : 'text-slate-600'
                  }`}
                >
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Country Visa Sizes Grid (Matches Screenshot 1) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 mb-3 px-0.5">
          {selectedSize === 'visa' ? 'ভিসার মাপ' : 'জনপ্রিয় দেশের মাপ'}
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {COUNTRY_VISA_SIZES.map((item) => {
            const isSelected = selectedCountrySizeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedCountrySizeId(item.id);
                  onSelectSize('visa');
                }}
                className={`flex flex-col items-start justify-center p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[58px] ${
                  isSelected
                    ? 'border-2 border-amber-500 bg-amber-50/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className={`text-[12px] font-bold leading-tight ${isSelected ? 'text-amber-600' : 'text-slate-800'}`}>
                  {item.dimensions}
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate w-full mt-0.5">
                  {item.countries}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </MobileBottomSheetWrapper>
  );
};
