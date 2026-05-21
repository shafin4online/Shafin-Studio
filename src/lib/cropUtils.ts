/**
 * Helper to crop image in client-side using Canvas rendering.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  image.crossOrigin = 'anonymous';

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = (err) => reject(new Error('Failed to load image for cropping: ' + err));
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context available for cropping canvas');
  }

  // Set visual boundaries of the cropped output
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw crop region onto the custom canvas elements
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/png');
}
