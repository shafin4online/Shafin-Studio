import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export const PRINT_PRESETS = [
  { name: 'Passport', widthPx: 400, heightPx: 500, widthMm: 40, heightMm: 50 },
  { name: '3R', widthPx: 1050, heightPx: 1500, widthMm: 89, heightMm: 127 },
  { name: '4R', widthPx: 1200, heightPx: 1800, widthMm: 102, heightMm: 152 },
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
  const [slots, setSlots] = useState<PrintSlot[]>([{ presetIndex: 0, count: 4 }]);
  const [page, setPage] = useState({ widthMm: 210, heightMm: 297 }); // A4
  const [gap, setGap] = useState(2);

  const addSlot = () => setSlots([...slots, { presetIndex: 0, count: 1 }]);
  const removeSlot = (index: number) => setSlots(slots.filter((_, i) => i !== index));
  const updateSlot = (index: number, updates: Partial<PrintSlot>) => {
    setSlots(slots.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const handlePrint = () => {
    onPrint(slots, page, gap);
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
            {slots.map((slot, index) => (
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
                  disabled={slots.length === 1}
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
                value={page.widthMm} 
                onChange={(e) => setPage({ ...page, widthMm: parseInt(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Page Height (mm)</Label>
              <Input 
                type="number" 
                value={page.heightMm} 
                onChange={(e) => setPage({ ...page, heightMm: parseInt(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Gap between photos (mm)</Label>
            <Input 
              type="number" 
              value={gap} 
              onChange={(e) => setGap(parseInt(e.target.value) || 0)}
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
