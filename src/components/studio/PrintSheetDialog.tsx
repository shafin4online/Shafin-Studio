import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useStudio } from '@/context/StudioContext';

export const PRINT_PRESETS = [
  { name: 'NID Card (85.6x53.98mm)', widthPx: 1011, heightPx: 638, widthMm: 85.6, heightMm: 53.98 },
  { name: 'Passport Portrait (40x50mm)', widthPx: 472, heightPx: 591, widthMm: 40, heightMm: 50 },
  { name: 'Passport Portrait (39x49mm)', widthPx: 461, heightPx: 579, widthMm: 39, heightMm: 49 },
  { name: 'Passport Landscape (49x39mm)', widthPx: 579, heightPx: 461, widthMm: 49, heightMm: 39 },
  { name: 'Stamp Size (20x25mm)', widthPx: 236, heightPx: 295, widthMm: 20, heightMm: 25 },
  { name: '3R (89x127mm)', widthPx: 1050, heightPx: 1500, widthMm: 89, heightMm: 127 },
  { name: '4R (102x152mm)', widthPx: 1200, heightPx: 1800, widthMm: 102, heightMm: 152 },
  { name: '5R (127x178mm)', widthPx: 1500, heightPx: 2100, widthMm: 127, heightMm: 178 },
];

export interface PrintSlot {
  presetIndex: number;
  count: number;
}

interface PrintSheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (slots: PrintSlot[], page: { widthMm: number, heightMm: number }, gap: number) => void;
}

export function PrintSheetDialog({ open, onOpenChange, onPrint }: PrintSheetDialogProps) {
  const {
    printSlots,
    setPrintSlots,
    printPage,
    setPrintPage,
    printGap,
    setPrintGap,
  } = useStudio();

  const addSlot = () => setPrintSlots([...printSlots, { presetIndex: 0, count: 1 }]);
  const removeSlot = (index: number) => setPrintSlots(printSlots.filter((_, i) => i !== index));
  const updateSlot = (index: number, updates: Partial<PrintSlot>) => {
    setPrintSlots(printSlots.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const handlePrint = () => {
    onPrint(printSlots, printPage, printGap);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Print Sheet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Print Slots</Label>
            {printSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select 
                  value={slot.presetIndex.toString()} 
                  onValueChange={(val) => updateSlot(index, { presetIndex: parseInt(val) })}
                >
                  <SelectTrigger className="flex-1 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRINT_PRESETS.map((p, i) => (
                      <SelectItem key={i} value={i.toString()}>{p.name} ({p.widthMm}x{p.heightMm}mm)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  type="number" 
                  value={slot.count} 
                  onChange={(e) => updateSlot(index, { count: parseInt(e.target.value) || 0 })}
                  className="w-16 h-9"
                  min="1"
                />
                <Button 
                   variant="ghost" 
                  size="icon" 
                  onClick={() => removeSlot(index)}
                  disabled={printSlots.length === 1}
                  className="h-9 w-9 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSlot} className="w-full h-8 gap-2 border-dashed">
              <Plus className="h-3 w-3" /> Add More
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="space-y-2">
              <Label className="text-xs">Page Width (mm)</Label>
              <Input 
                type="number" 
                value={printPage.widthMm} 
                onChange={(e) => setPrintPage({ ...printPage, widthMm: parseInt(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Page Height (mm)</Label>
              <Input 
                type="number" 
                value={printPage.heightMm} 
                onChange={(e) => setPrintPage({ ...printPage, heightMm: parseInt(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Gap between photos (mm)</Label>
            <Input 
              type="number" 
              value={printGap} 
              onChange={(e) => setPrintGap(parseInt(e.target.value) || 0)}
              className="h-9"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-500">Print Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
