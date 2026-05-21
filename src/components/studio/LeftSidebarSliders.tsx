import React from 'react';
import { 
  Sun, Contrast, Droplets, Thermometer, Palette, Sparkles 
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useStudio } from '@/context/StudioContext';

export function LeftSidebarSliders() {
  const { editorState, updateEditorState } = useStudio();

  const handleFilterChange = (key: string, value: number) => {
    updateEditorState({ [key]: value });
  };

  const slidersList = [
    { label: 'Brightness', icon: Sun, key: 'brightness', min: 0, max: 200, unit: '%' },
    { label: 'Contrast', icon: Contrast, key: 'contrast', min: 0, max: 200, unit: '%' },
    { label: 'Saturation', icon: Droplets, key: 'saturation', min: 0, max: 200, unit: '%' },
    { label: 'Temperature', icon: Thermometer, key: 'temperature', min: -100, max: 100, unit: '' },
    { label: 'Hue', icon: Palette, key: 'hue', min: -180, max: 180, unit: '°' },
    { label: 'Sharpness', icon: Sparkles, key: 'sharpness', min: 0, max: 100, unit: '%' },
  ] as const;

  return (
    <div className="p-3 space-y-4">
      {slidersList.map((filter) => {
        const value = editorState[filter.key as keyof typeof editorState] as number;
        return (
          <div key={filter.key} className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <filter.icon className="h-3 w-3" />
                <span className="uppercase">{filter.label}</span>
              </div>
              <span className="font-mono text-primary">
                {value}
                {filter.unit}
              </span>
            </div>
            <Slider 
              value={[value]}
              min={filter.min}
              max={filter.max}
              step={1}
              onValueChange={([val]) => handleFilterChange(filter.key, val)}
              className="h-1.5"
            />
          </div>
        );
      })}
    </div>
  );
}
