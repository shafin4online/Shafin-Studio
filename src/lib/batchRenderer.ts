/**
 * Utility helper to apply editorState adjustment presets on a target image source using Canvas.
 */

export interface BatchAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  hue: number;
  rotation: number;
  imageScale: number;
  backgroundColor: string;
  borderEnabled: boolean;
  borderWidth: number;
}

export function renderAdjustedImage(
  imageSrc: string,
  adjustments: BatchAdjustments
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Use the image source (which can be a local blob URL or high-res base64)
    img.src = imageSrc;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get 2D context for image rendering"));
          return;
        }

        // 1. Draw solid custom background if selected and not transparent
        if (adjustments.backgroundColor && adjustments.backgroundColor !== 'transparent') {
          ctx.fillStyle = adjustments.backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Set filters (Brightness, Contrast, Saturation, Hue Shift)
        ctx.filter = `
          brightness(${adjustments.brightness}%) 
          contrast(${adjustments.contrast}%) 
          saturate(${adjustments.saturation}%)
          hue-rotate(${adjustments.hue}deg)
        `;

        // 3. Compute scale and coordinate rotations
        const scaleVal = adjustments.imageScale / 100;
        const w = canvas.width * scaleVal;
        const h = canvas.height * scaleVal;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((adjustments.rotation * Math.PI) / 180);

        // 4. Draw main image/apply Temperature overlay
        if (adjustments.temperature !== 0) {
          const tintColor = adjustments.temperature > 0 ? 'orange' : 'blue';
          const alpha = Math.abs(adjustments.temperature) / 200;
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
          ctx.globalCompositeOperation = adjustments.temperature > 0 ? 'overlay' : 'soft-light';
          ctx.fillStyle = tintColor;
          ctx.globalAlpha = alpha;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        } else {
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }

        ctx.restore();

        // 5. Draw border outlines
        if (adjustments.borderEnabled) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = adjustments.borderWidth * 2;
          ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }

        // Convert back to base64 Data URL
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => {
      reject(new Error("Failed to load source image file for processing."));
    };
  });
}
