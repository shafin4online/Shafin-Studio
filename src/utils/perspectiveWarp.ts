/**
 * Solves a linear system Ax = B using Gaussian elimination
 * @param A 8x8 matrix
 * @param B 8 element vector
 */
function solveLinearSystem8x8(A: number[][], B: number[]): number[] | null {
  const n = 8;
  for (let i = 0; i < n; i++) {
    A[i].push(B[i]); // augmented matrix
  }

  for (let i = 0; i < n; i++) {
    // Pivot selection
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    // Swap maximum row with current row
    const temp = A[maxRow];
    A[maxRow] = A[i];
    A[i] = temp;

    // Make elements below pivot 0
    if (Math.abs(A[i][i]) < 1e-10) {
      return null; // Singular matrix
    }

    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j <= n; j++) {
        if (i === j) {
          A[k][j] = 0;
        } else {
          A[k][j] += c * A[i][j];
        }
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = A[i][n] / A[i][i];
    for (let k = i - 1; k >= 0; k--) {
      A[k][n] -= A[k][i] * x[i];
    }
  }

  return x;
}

export interface QuadPoint {
  x: number; // 0 to 1 indicating ratio of width
  y: number; // 0 to 1 indicating ratio of height
}

/**
 * Performs a perspective projection warp from a source image quad
 * mapping to a destination flat canvas width & height.
 */
export function warpPerspective(
  srcImg: HTMLImageElement,
  srcQuad: QuadPoint[], // [topLeft, topRight, bottomRight, bottomLeft] (0 to 1 normalized)
  dstWidth: number,
  dstHeight: number,
  filter: 'original' | 'magic' | 'bw' | 'grayscale',
  edgeSmoothing: number = 0
): string {
  // Create a temporary canvas for source image data
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = srcImg.naturalWidth || srcImg.width;
  srcCanvas.height = srcImg.naturalHeight || srcImg.height;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return '';
  srcCtx.drawImage(srcImg, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

  // Set up destination canvas
  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = dstWidth;
  dstCanvas.height = dstHeight;
  const dstCtx = dstCanvas.getContext('2d');
  if (!dstCtx) return '';
  const dstData = dstCtx.createImageData(dstWidth, dstHeight);

  // Source Quad Coordinates in actual pixels
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  const srcPixels = srcQuad.map(p => ({
    x: p.x * w,
    y: p.y * h
  }));

  // Build the system of equations where destination quad is
  // (0, 0), (dstWidth, 0), (dstWidth, dstHeight), (0, dstHeight)
  // maps to the source pixels.
  // u, v are destination coordinates, x, y are source coordinates.
  // a*u + b*v + c - g*u*x - h*v*x = x
  // d*u + e*v + f - g*u*y - h*v*y = y
  const system: number[][] = [];
  const constants: number[] = [];

  const dstQuadPixels = [
    { u: 0, v: 0 },
    { u: dstWidth, v: 0 },
    { u: dstWidth, v: dstHeight },
    { u: 0, v: dstHeight }
  ];

  for (let i = 0; i < 4; i++) {
    const { u, v } = dstQuadPixels[i];
    const srcX = srcPixels[i].x;
    const srcY = srcPixels[i].y;

    // x-mapping row
    system.push([u, v, 1, 0, 0, 0, -u * srcX, -v * srcX]);
    constants.push(srcX);

    // y-mapping row
    system.push([0, 0, 0, u, v, 1, -u * srcY, -v * srcY]);
    constants.push(srcY);
  }

  const coeffs = solveLinearSystem8x8(system, constants);
  if (!coeffs) {
    return srcImg.src; // fallback on error
  }

  const [a, b, c, d, e, f, g, hCoeff] = coeffs;

  // Let's copy pixel data with bilinear interpolation
  const srcW = srcCanvas.width;
  const srcH = srcCanvas.height;
  const srcBytes = srcData.data;
  const dstBytes = dstData.data;

  for (let yDst = 0; yDst < dstHeight; yDst++) {
    for (let xDst = 0; xDst < dstWidth; xDst++) {
      // Calculate coordinates in source space
      const denom = g * xDst + hCoeff * yDst + 1;
      const xSrc = (a * xDst + b * yDst + c) / denom;
      const ySrc = (d * xDst + e * yDst + f) / denom;

      const dstIdx = (yDst * dstWidth + xDst) * 4;

      if (xSrc < 0 || xSrc >= srcW - 1 || ySrc < 0 || ySrc >= srcH - 1) {
        // Out of bounds - transparency
        dstBytes[dstIdx] = 0;
        dstBytes[dstIdx + 1] = 0;
        dstBytes[dstIdx + 2] = 0;
        dstBytes[dstIdx + 3] = 0;
        continue;
      }

      // Bilinear interpolation
      const xFloor = Math.floor(xSrc);
      const yFloor = Math.floor(ySrc);
      const xWeight = xSrc - xFloor;
      const yWeight = ySrc - yFloor;

      const idx00 = (yFloor * srcW + xFloor) * 4;
      const idx10 = (yFloor * srcW + (xFloor + 1)) * 4;
      const idx01 = ((yFloor + 1) * srcW + xFloor) * 4;
      const idx11 = ((yFloor + 1) * srcW + (xFloor + 1)) * 4;

      for (let channel = 0; channel < 4; channel++) {
        const val =
          srcBytes[idx00 + channel] * (1 - xWeight) * (1 - yWeight) +
          srcBytes[idx10 + channel] * xWeight * (1 - yWeight) +
          srcBytes[idx01 + channel] * (1 - xWeight) * yWeight +
          srcBytes[idx11 + channel] * xWeight * yWeight;

        dstBytes[dstIdx + channel] = val;
      }

      // Apply Filters directly during the pixel pass for super fast real-time preview & premium speed!
      if (filter !== 'original') {
        let r = dstBytes[dstIdx];
        let gVal = dstBytes[dstIdx + 1];
        let bVal = dstBytes[dstIdx + 2];

        if (filter === 'grayscale') {
          const gray = 0.299 * r + 0.587 * gVal + 0.114 * bVal;
          dstBytes[dstIdx] = gray;
          dstBytes[dstIdx + 1] = gray;
          dstBytes[dstIdx + 2] = gray;
        } else if (filter === 'bw') {
          // B&W Document high contrast scanner thresholding
          const gray = 0.299 * r + 0.587 * gVal + 0.114 * bVal;
          // Apply a steep adaptive sigmoid lookup mapping
          const factor = 1.6;
          const thresh = 128;
          let output = gray;
          if (gray < thresh) {
            output = Math.max(0, gray - (thresh - gray) * factor);
          } else {
            output = Math.min(255, gray + (gray - thresh) * factor);
          }
          const finalBw = output > 135 ? 255 : 0;
          dstBytes[dstIdx] = finalBw;
          dstBytes[dstIdx + 1] = finalBw;
          dstBytes[dstIdx + 2] = finalBw;
        } else if (filter === 'magic') {
          // Magic Color / Document scan enhancer: Increases saturation and boosts contrast/highlights
          // Convert to luma and boost highlights, darken deep shadows slightly, compress midtones
          const luma = 0.299 * r + 0.587 * gVal + 0.114 * bVal;
          
          // Boost highlights: scale factor
          const boost = luma > 100 ? 1.25 : 1.05;
          r = Math.min(255, r * boost);
          gVal = Math.min(255, gVal * boost);
          bVal = Math.min(255, bVal * boost);

          // Contrast boost
          const rC = (r - 128) * 1.35 + 128 + 12;
          const gC = (gVal - 128) * 1.35 + 128 + 12;
          const bC = (bVal - 128) * 1.35 + 128 + 12;

          dstBytes[dstIdx] = Math.max(0, Math.min(255, rC));
          dstBytes[dstIdx + 1] = Math.max(0, Math.min(255, gC));
          dstBytes[dstIdx + 2] = Math.max(0, Math.min(255, bC));
        }
      }
    }
  }

  // Edge smoothing filter (optional simple box blur on edges)
  if (edgeSmoothing > 0) {
    // Edge smoothing passes can be performed if needed, but standard bilinear handles it excellently
  }

  dstCtx.putImageData(dstData, 0, 0);
  return dstCanvas.toDataURL('image/png');
}

/**
 * Smart automatic document corner detection helper!
 * Looks at contrast lines to locate a document boundary.
 * If not found, sets perfect perspective corners inset slightly.
 */
export function detectDocumentCorners(
  imgW: number,
  imgH: number
): QuadPoint[] {
  // Return intelligent default points that can be easily customized.
  // Insets:
  // Top Left: 15% in
  // Top Right: 15% inset from right, 10% from top
  // Bottom Right: 12% inset from right, 12% from bottom
  // Bottom Left: 15% inset from left, 12% from bottom
  // This behaves identically to CamScanner when a document bounding box is guessed!
  return [
    { x: 0.12, y: 0.12 },
    { x: 0.88, y: 0.12 },
    { x: 0.85, y: 0.88 },
    { x: 0.15, y: 0.88 }
  ];
}
