/**
 * Smart client-side image optimizer to compress large photos to a highly performant
 * 300kb - 400kb range while maintaining professional visual fidelity and details.
 */
export async function optimizeUploadImage(file: File): Promise<File> {
  // Defensive guard: Ensure input is a valid Blob/File before calling URL.createObjectURL
  if (!file || typeof file !== 'object' || !(file instanceof Blob)) {
    console.warn('[ImageOptimizer] Argument is not a valid Blob/File. Bypassing compression.');
    return file;
  }

  const targetMax = 420 * 1024; // 420KB max threshold
  const targetMin = 280 * 1024; // 280KB min target

  // If the file is already small (e.g. under 420KB), bypass compression completely to save CPU cycle!
  if (file.size <= targetMax) {
    console.log(`[ImageOptimizer] File is already optimal: ${Math.round(file.size / 1024)}KB. Skipping.`);
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);
      try {
        const resultBlob = await compressToTarget(img, file.type, targetMin, targetMax);
        // Put original name & keep reference
        const optimizedFile = new File([resultBlob], file.name, {
          type: resultBlob.type,
          lastModified: Date.now()
        });
        console.log(`[ImageOptimizer] Compressed successfully: ${Math.round(file.size / 1024)}KB -> ${Math.round(optimizedFile.size / 1024)}KB`);
        resolve(optimizedFile);
      } catch (err) {
        console.error('[ImageOptimizer] Auto compression failed, falling back to original:', err);
        resolve(file); // Safe fallback
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      console.error('[ImageOptimizer] Could not load image file. Using original.');
      resolve(file); // Safe fallback
    };

    img.src = url;
  });
}

async function compressToTarget(
  img: HTMLImageElement,
  originalType: string,
  targetMin: number,
  targetMax: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain Canvas 2D context');

  let width = img.width;
  let height = img.height;

  // Since portrait, visa, or portrait photography files are opaque, we compress them 
  // as JPEG for maximum size savings.
  const targetMime = 'image/jpeg';

  // Step 1: Max width/height limit constraint.
  // 1920px width/height is highly detailed and crisp for studio editing, visa photos, and prints,
  // but prevents browser memory lag from massive multi-megapixel smartphone cameras (5MB - 20MB files).
  const maxDim = 1920;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // Perform iterative checks to get into our range without hurting quality
  let quality = 0.88; // Perfect balance point (visually identical to raw JPEG)
  let currentBlob = await getBlobFromCanvas(canvas, targetMime, quality);

  // If size is still over our limit, dynamically scale down resolution limit & quality
  if (currentBlob.size > targetMax) {
    quality = 0.84;
    currentBlob = await getBlobFromCanvas(canvas, targetMime, quality);

    // If still large, scale max dimensions to 1600px and set quality to 0.81
    if (currentBlob.size > targetMax) {
      const scaleDimension = 1600;
      let newW = width;
      let newH = height;
      if (newW > scaleDimension || newH > scaleDimension) {
        if (newW > newH) {
          newH = Math.round((newH * scaleDimension) / newW);
          newW = scaleDimension;
        } else {
          newW = Math.round((newW * scaleDimension) / newH);
          newH = scaleDimension;
        }
      }

      const canvasScale = document.createElement('canvas');
      const ctxScale = canvasScale.getContext('2d')!;
      canvasScale.width = newW;
      canvasScale.height = newH;
      ctxScale.drawImage(img, 0, 0, newW, newH);

      quality = 0.81;
      currentBlob = await getBlobFromCanvas(canvasScale, targetMime, quality);

      // Final fallback level if details are extremely complex: 1280px max dimension & 0.78 quality
      if (currentBlob.size > targetMax) {
        const finalScaleDim = 1280;
        let finalW = newW;
        let finalH = newH;
        if (finalW > finalScaleDim || finalH > finalScaleDim) {
          if (finalW > finalH) {
            finalH = Math.round((finalH * finalScaleDim) / finalW);
            finalW = finalScaleDim;
          } else {
            finalW = Math.round((finalW * finalScaleDim) / finalH);
            finalH = finalScaleDim;
          }
        }

        const canvasFinal = document.createElement('canvas');
        const ctxFinal = canvasFinal.getContext('2d')!;
        canvasFinal.width = finalW;
        canvasFinal.height = finalH;
        ctxFinal.drawImage(img, 0, 0, finalW, finalH);

        quality = 0.78;
        currentBlob = await getBlobFromCanvas(canvasFinal, targetMime, quality);
      }
    }
  }

  return currentBlob;
}

function getBlobFromCanvas(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas conversion failed'));
      },
      mime,
      quality
    );
  });
}
