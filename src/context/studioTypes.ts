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

export const CROP_PRESETS = [
  { label: 'Original', value: 'original' },
  { label: 'Square (1:1)', value: '1:1' },
  { label: 'Passport (BD)', value: '40:50' },
  { label: '3R', value: '3.5:5' },
  { label: '4R', value: '4:6' },
];
