import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PRINT_PRESETS } from './PrintSheetDialog';

interface PrintAllDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageCount: number;
  onPrint: (presetIndex: number, page: { widthMm: number, heightMm: number }, gap: number) => void;
}

export function PrintAllDialog({ open, onOpenChange, imageCount, onPrint }: PrintAllDialogProps) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [page, setPage] = useState({ widthMm: 210, heightMm: 297 }); // A4
  const [gap, setGap] = useState(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Print All Images</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            Total {imageCount} image{imageCount !== 1 ? 's' : ''} in the tray. 
            Select a size to fit multiple copies on a sheet.
          </p>

          <div className="space-y-2">
            <Label className="text-xs">Select Size</Label>
            <Select 
              value={presetIndex.toString()} 
              onValueChange={(val) => setPresetIndex(parseInt(val))}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRINT_PRESETS.map((p, i) => (
                  <SelectItem key={i} value={i.toString()}>{p.name} ({p.widthMm}x{p.heightMm}mm)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Page W (mm)</Label>
              <Input 
                type="number" 
                value={page.widthMm} 
                onChange={(e) => setPage({ ...page, widthMm: parseInt(e.target.value) || 0 })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Page H (mm)</Label>
              <Input 
                type="number" 
                value={page.heightMm} 
                onChange={(e) => setPage({ ...page, heightMm: parseInt(e.target.value) || 0 })}
                className="h-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onPrint(presetIndex, page, gap)} className="bg-blue-600 hover:bg-blue-500">
            Generate Print Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
