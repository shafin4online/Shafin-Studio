import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudioImage } from '@/context/studioTypes';

interface MergeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: StudioImage[];
  defaultImg1: string | null;
  defaultImg2: string | null;
  onMerge: (img1Id: string, img2Id: string, mode: 'side-by-side' | 'top-bottom' | 'overlay', gap: number, opacity: number) => void;
}

export function MergeDialog({ open, onOpenChange }: MergeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Merge Images</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-muted-foreground text-sm">
          Image merging is loading...
        </div>
      </DialogContent>
    </Dialog>
  );
}
