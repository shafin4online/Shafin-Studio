interface EnhanceImageParams {
  imageUrl: string;
  enhancerScale: '2x' | '4x' | '8x';
  enhancerDpi: boolean;
  enhancerDpiValue: number;
  enhancerResize: boolean;
  enhancerWidth: number;
  enhancerHeight: number;
  onProgress: (keyLabel: string) => void;
  signal: AbortSignal;
}

export async function processImageEnhancement({
  imageUrl,
  enhancerScale,
  enhancerDpi,
  enhancerDpiValue,
  enhancerResize,
  enhancerWidth,
  enhancerHeight,
  onProgress,
  signal,
}: EnhanceImageParams): Promise<string> {
  onProgress('Preparing image and setting up proxy connection...');
  const resBlob = await fetch(imageUrl);
  const imageBlob = await resBlob.blob();

  onProgress('Encoding image details...');
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
  reader.readAsDataURL(imageBlob);
  const base64Image = await base64Promise;

  if (signal.aborted) {
    throw new Error('AbortError');
  }

  onProgress('Running server-side AI image-enhancer neural network...');
  
  const response = await fetch("/api/enhance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      image: base64Image,
      scale: enhancerScale,
      dpi: enhancerDpi,
      dpiValue: enhancerDpiValue,
      resize: enhancerResize,
      width: enhancerWidth,
      height: enhancerHeight
    }),
    signal
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || `Server responded with status ${response.status}`);
  }

  if (signal.aborted) {
    throw new Error('AbortError');
  }

  onProgress('Finalizing enhanced features...');
  const data = await response.json();
  
  if (!data.success || !data.image) {
    throw new Error(data.error || "Failed to receive enhanced image data");
  }

  return data.image; // can be dataurl base64
}
