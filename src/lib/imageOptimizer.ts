/**
 * Automatic Image Optimizer for ShafinBD Studio & AI Editor
 * Enforces automatic 3MB maximum size on any added photo.
 * Maintains pristine studio fidelity while preventing 413 (Content Too Large) errors.
 */

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB strictly
export const SAFE_PAYLOAD_IMAGE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB (Base64 is ~3.3MB, safely below Vercel's 4.5MB limit)

/**
 * Calculates raw byte size of a dataURL string
 */
export function getDataUrlByteSize(dataUrl: string): number {
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return 0;
  const base64Str = dataUrl.slice(commaIdx + 1);
  const padding = base64Str.endsWith('==') ? 2 : base64Str.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.round((base64Str.length * 3) / 4) - padding);
}

/**
 * Formats bytes to human-readable string (e.g. "2.4 MB", "850 KB")
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compresses an HTMLImageElement to ensure it stays below maxBytes.
 */
export async function compressImageElement(
  img: HTMLImageElement,
  maxBytes: number = MAX_IMAGE_BYTES,
  preferredMime: string = 'image/jpeg'
): Promise<{ blob: Blob; dataUrl: string; size: number }> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain Canvas 2D context');

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Level 1: Initial clamp to 2560px for high-resolution clarity
  const maxDim1 = 2560;
  if (width > maxDim1 || height > maxDim1) {
    if (width > height) {
      height = Math.round((height * maxDim1) / width);
      width = maxDim1;
    } else {
      width = Math.round((width * maxDim1) / height);
      height = maxDim1;
    }
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // Compression steps: iterate quality and resolution until size <= maxBytes
  const steps = [
    { scale: 1.0, quality: 0.92 },
    { scale: 1.0, quality: 0.86 },
    { scale: 1.0, quality: 0.80 },
    { scale: 0.85, quality: 0.80 },
    { scale: 0.70, quality: 0.78 },
    { scale: 0.55, quality: 0.75 },
    { scale: 0.40, quality: 0.70 },
  ];

  let bestBlob: Blob | null = null;
  let bestDataUrl: string = '';

  for (const step of steps) {
    let currentCanvas = canvas;
    if (step.scale < 1.0) {
      const stepW = Math.max(300, Math.round(width * step.scale));
      const stepH = Math.max(300, Math.round(height * step.scale));
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = stepW;
      scaledCanvas.height = stepH;
      const sCtx = scaledCanvas.getContext('2d');
      if (sCtx) {
        sCtx.drawImage(img, 0, 0, stepW, stepH);
        currentCanvas = scaledCanvas;
      }
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      currentCanvas.toBlob(resolve, preferredMime, step.quality);
    });

    if (blob) {
      bestBlob = blob;
      if (blob.size <= maxBytes) {
        bestDataUrl = currentCanvas.toDataURL(preferredMime, step.quality);
        return { blob, dataUrl: bestDataUrl, size: blob.size };
      }
    }
  }

  // If still above maxBytes, use the lowest compressed version
  if (!bestBlob) {
    bestBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), preferredMime, 0.70);
    });
  }
  bestDataUrl = canvas.toDataURL(preferredMime, 0.70);
  return { blob: bestBlob, dataUrl: bestDataUrl, size: bestBlob.size };
}

/**
 * Processes any File and ensures the returned File is <= maxBytes (default 3MB).
 */
export async function optimizeUploadImage(
  file: File,
  maxBytes: number = MAX_IMAGE_BYTES
): Promise<File> {
  if (!file || typeof file !== 'object' || !(file instanceof Blob)) {
    console.warn('[ImageOptimizer] Argument is not a valid Blob/File. Bypassing.');
    return file;
  }

  // If file is already <= maxBytes, return directly
  if (file.size <= maxBytes) {
    console.log(`[ImageOptimizer] File is within limit (${formatBytes(file.size)} <= ${formatBytes(maxBytes)}).`);
    return file;
  }

  console.log(`[ImageOptimizer] File exceeds ${formatBytes(maxBytes)} (${formatBytes(file.size)}). Auto-compressing to <= 3MB...`);

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);
      try {
        const { blob, size } = await compressImageElement(img, maxBytes, 'image/jpeg');
        const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        console.log(`[ImageOptimizer] Successfully optimized: ${formatBytes(file.size)} -> ${formatBytes(size)}`);
        resolve(optimizedFile);
      } catch (err) {
        console.error('[ImageOptimizer] Compression error, fallback to original:', err);
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      console.error('[ImageOptimizer] Failed to load image. Using original file.');
      resolve(file);
    };

    img.src = url;
  });
}

export interface OptimizationResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  wasCompressed: boolean;
  name: string;
}

/**
 * Takes any uploaded File and returns an optimized dataURL guaranteed to be <= maxBytes (default 3MB).
 */
export async function fileToOptimizedDataUrl(
  file: File,
  maxBytes: number = MAX_IMAGE_BYTES
): Promise<OptimizationResult> {
  const originalSize = file.size;

  // If already <= maxBytes, read as DataURL directly
  if (originalSize <= maxBytes) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '';
        resolve({
          dataUrl,
          originalSize,
          optimizedSize: originalSize,
          wasCompressed: false,
          name: file.name
        });
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(file);
    });
  }

  console.log(`[ImageOptimizer] Uploaded photo is ${formatBytes(originalSize)}. Automatically compressing to max 3MB...`);

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);
      try {
        const { dataUrl, size } = await compressImageElement(img, maxBytes, 'image/jpeg');
        console.log(`[ImageOptimizer] Auto-compression complete: ${formatBytes(originalSize)} -> ${formatBytes(size)}`);
        resolve({
          dataUrl,
          originalSize,
          optimizedSize: size,
          wasCompressed: true,
          name: file.name
        });
      } catch (err) {
        console.error('[ImageOptimizer] Compression error, reading original:', err);
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            dataUrl: (e.target?.result as string) || '',
            originalSize,
            optimizedSize: originalSize,
            wasCompressed: false,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          dataUrl: (e.target?.result as string) || '',
          originalSize,
          optimizedSize: originalSize,
          wasCompressed: false,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    };

    img.src = url;
  });
}

/**
 * Optimizes an existing dataUrl if its estimated byte size exceeds maxBytes.
 * Essential before sending JSON payloads over Vercel/Cloudflare serverless functions.
 */
export async function optimizeDataUrl(
  dataUrl: string,
  maxBytes: number = SAFE_PAYLOAD_IMAGE_BYTES
): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  
  const currentSize = getDataUrlByteSize(dataUrl);
  if (currentSize <= maxBytes) {
    return dataUrl;
  }

  console.log(`[ImageOptimizer] DataURL exceeds safe threshold (${formatBytes(currentSize)} > ${formatBytes(maxBytes)}). Rescaling for server payload...`);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const { dataUrl: compressedUrl, size } = await compressImageElement(img, maxBytes, 'image/jpeg');
        console.log(`[ImageOptimizer] Payload optimized: ${formatBytes(currentSize)} -> ${formatBytes(size)}`);
        resolve(compressedUrl);
      } catch (err) {
        console.error('[ImageOptimizer] Failed to optimize dataUrl:', err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      console.warn('[ImageOptimizer] Could not load image from dataUrl, sending original.');
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}
