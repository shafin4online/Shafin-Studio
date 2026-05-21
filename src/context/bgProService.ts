import { removeBackground } from '@imgly/background-removal';

interface ProcessBgParams {
  imageUrl: string;
  bgOutputMode: 'transparent' | 'white' | 'black';
  edgeSmoothing: number;
  onProgress: (progressKey: string, progressValue: number) => void;
  signal: AbortSignal;
}

export async function processBackgroundRemoval({
  imageUrl,
  bgOutputMode,
  edgeSmoothing,
  onProgress,
  signal,
}: ProcessBgParams): Promise<string> {
  const resultBlob = await removeBackground(imageUrl, {
    output: {
      format: 'image/png',
      type: 'foreground',
    },
    progress: (key: string, current: number, total: number) => {
      let progressVal = 0;
      if (total && total > 0) {
        progressVal = Math.round((current / total) * 100);
      } else {
        progressVal = current ? Math.min(Math.round(current / 10000), 99) : 0;
      }
      
      let keyLabel = '';
      if (key.includes('fetch')) {
        const part = key.split(':')[1] || '';
        keyLabel = `Downloading neural network model ${part} (${progressVal}%)...`;
      } else if (key.includes('onnx')) {
        keyLabel = 'Compiling WebAssembly AI model runtime...';
      } else if (key === 'processing') {
        keyLabel = 'Analyzing transparency channels and smoothing borders...';
      } else {
        keyLabel = `Processing: ${key}...`;
      }

      onProgress(keyLabel, progressVal);
    },
    signal,
  });

  // Composite the image if solid background or custom feathering required
  if (bgOutputMode === 'transparent' && edgeSmoothing === 0) {
    return URL.createObjectURL(resultBlob);
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = URL.createObjectURL(resultBlob);
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Fill background
  if (bgOutputMode === 'white') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bgOutputMode === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Apply edge smoothing via slight shadow blur or custom composite drawing
  if (edgeSmoothing > 0) {
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = edgeSmoothing;
  }

  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}
