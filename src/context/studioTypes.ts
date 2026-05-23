export interface EditorState {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  hue: number;
  sharpness: number;
  rotation: number;
  imageScale: number;
  backgroundColor: string;
  borderEnabled: boolean;
  borderWidth: number;
  edgeSharp: number;
  despill: boolean;
}

export interface StudioImage {
  id: string;
  name: string;
  original: string;
  edited: string;
  thumbnail: string;
}

export interface CropPreset {
  id: string;
  label: string;
  subLabel: string;
  aspect: number | undefined;
  widthPx?: number;
  heightPx?: number;
  isManual?: boolean;
}

export interface PrintSlot {
  presetIndex: number;
  count: number;
}

export const CROP_PRESETS: CropPreset[] = [
  { id: 'nid-card', label: 'NID Card', subLabel: '85.6×53.98mm @300dpi', aspect: 85.6 / 53.98, widthPx: 1011, heightPx: 638 },
  { id: 'passport-portrait', label: 'Passport Portrait', subLabel: '39×49mm @300dpi', aspect: 39 / 49 },
  { id: 'passport-landscape', label: 'Passport Landscape', subLabel: '49×39mm @300dpi', aspect: 49 / 39 },
  { id: 'stamp-size', label: 'Stamp Size', subLabel: '20×25mm @300dpi', aspect: 20 / 25 },
  { id: 'square-300', label: 'Square 300px', subLabel: '300×300 Pixels', aspect: 1, widthPx: 300, heightPx: 300 },
  { id: 'signature', label: 'Signature', subLabel: '300×80 Pixels', aspect: 300 / 80, widthPx: 300, heightPx: 80 },
  { id: '3r-print', label: '3R Print', subLabel: "3.5×5\" @300dpi", aspect: 3.5 / 5 },
  { id: '4r-print', label: '4R Print', subLabel: "4×6\" @300dpi", aspect: 4 / 6 },
  { id: '5r-print', label: '5R Print', subLabel: "5×7\" @300dpi", aspect: 5 / 7 },
  { id: 'free', label: 'Free', subLabel: 'Free Crop', aspect: undefined },
  { id: 'manual', label: 'Manual', subLabel: 'Custom W×H', aspect: undefined, isManual: true },
];
