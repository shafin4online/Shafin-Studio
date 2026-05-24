import { Client } from "@gradio/client";

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
  
  let response: Response | null = null;
  let useFallback = false;
  let serverErrorMsg = "";

  try {
    response = await fetch("/api/enhance", {
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
      if (response.status === 405 || response.status === 404) {
        useFallback = true;
        serverErrorMsg = `Server returned status ${response.status} (likely statically hosted)`;
      } else {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }
    }
  } catch (err: unknown) {
    const errorObject = err as { name?: string; message?: string };
    if (errorObject?.name === 'AbortError' || errorObject?.message === 'AbortError') {
      throw err;
    }
    useFallback = true;
    serverErrorMsg = errorObject?.message || String(err);
  }

  if (useFallback) {
    onProgress('Switching to client-side mode (direct Hugging Face connection)...');
    console.warn(`Server processing unavailable (${serverErrorMsg}). Connecting directly to Hugging Face CDN.`);

    if (signal.aborted) {
      throw new Error('AbortError');
    }

    try {
      onProgress('Connecting directly to Hugging Face space...');
      const client = await Client.connect("rmayormartins/image-enhancer");

      if (signal.aborted) {
        throw new Error('AbortError');
      }

      onProgress('Processing image directly in browser neural interface...');
      const result = await client.predict("/predict", [
        imageBlob,
        true, // enhance / optimize
        enhancerScale,
        enhancerDpi,
        enhancerDpiValue,
        enhancerResize,
        enhancerWidth,
        enhancerHeight
      ]);

      if (signal.aborted) {
        throw new Error('AbortError');
      }

      const outputData = result.data[0];
      const outputUrl = typeof outputData === 'object' && outputData !== null && 'url' in outputData 
        ? (outputData as { url: string }).url 
        : (typeof outputData === 'string' ? outputData : null);

      if (!outputUrl) {
         throw new Error("Hugging Face did not return a valid result file.");
      }

      onProgress('Downloading processed image directly...');
      const hfResponse = await fetch(outputUrl);
      if (!hfResponse.ok) {
        throw new Error(`Failed to fetch processed output from HF: ${hfResponse.statusText}`);
      }

      const outputBlob = await hfResponse.blob();
      const finalBase64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(outputBlob);
      });

      return finalBase64;
    } catch (fallbackErr: unknown) {
      const fbError = fallbackErr as { message?: string };
      console.error("Direct browser enhancement failed too:", fallbackErr);
      throw new Error(`Browser direct enhancement failed: ${fbError.message || String(fallbackErr)}`);
    }
  }

  if (signal.aborted) {
    throw new Error('AbortError');
  }

  onProgress('Finalizing enhanced features...');
  if (!response) {
    throw new Error("No response received from enhancer");
  }
  const data = await response.json();
  
  if (!data.success || !data.image) {
    throw new Error(data.error || "Failed to receive enhanced image data");
  }

  return data.image; // can be dataurl base64
}

