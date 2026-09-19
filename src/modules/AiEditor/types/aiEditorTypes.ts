export type PhotoSizeId = 'passport' | 'dual' | 'epass' | 'visa' | 'birth';

export interface PhotoSizePreset {
  id: PhotoSizeId;
  label: string;
  subLabel: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number;
  description: string;
}

export type BgColorId = 
  | 'white' 
  | 'light-blue' 
  | 'sky-blue' 
  | 'grey' 
  | 'royal-blue' 
  | 'deep-green' 
  | 'off-white' 
  | 'custom';

export interface BgColorOption {
  id: BgColorId;
  label: string;
  hex: string;
  borderColor?: string;
  isCustomPicker?: boolean;
}

export interface DressOption {
  id: string;
  title: string;
  category: 'none' | 'male-formal' | 'male-casual' | 'female-formal' | 'female-traditional' | 'religious';
  promptDescription: string;
  iconType: string;
}

export interface DressColorItem {
  id: string;
  label: string;
  hex: string;
  isLight?: boolean;
}

export interface DressCustomization {
  colorHex: string;
  colorLabel: string;
  isCheckPattern: boolean;
  hasTie: boolean;
}

export interface EnhancementOption {
  id: string;
  label: string;
  description: string;
  iconType: string;
  promptDirective: string;
}

export interface AiEditorState {
  selectedSize: PhotoSizeId;
  selectedBg: BgColorId;
  customBgHex: string;
  selectedDressId: string;
  dressCustomization: DressCustomization;
  // Dual mode specific options
  leftDressId: string;
  leftDressCustomization: DressCustomization;
  rightDressId: string;
  rightDressCustomization: DressCustomization;
  selectedEnhancements: string[]; // list of enhancement IDs
  customInstruction: string;
  uploadedImage: string | null; // single mode image
  uploadedImageLeft: string | null; // dual mode left image
  uploadedImageRight: string | null; // dual mode right image
  generatedImage: string | null;
  isGenerating: boolean;
  generationProgress: string;
}
