import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Client } from "@gradio/client";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set file and body size limits high to support high-resolution photos
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API router for server-side Gradio delegation
  app.post("/api/enhance", async (req, res) => {
    try {
      const {
        image, // Base64 image
        scale = "4x",
        dpi = false,
        dpiValue = 300,
        resize = false,
        width = 512,
        height = 512
      } = req.body;

      if (!image) {
        return res.status(400).json({ error: "No image file provided" });
      }

      console.log(`[Server] Received image to upscale with parameters:`, { scale, dpi, dpiValue, resize, width, height });

      // Clean base64 and extract MIME type
      const [meta, base64Data] = image.split(',');
      const mime = meta.match(/data:([^;]+);/)?.[1] || "image/png";
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: mime });

      console.log(`[Server] Connecting to Hugging Face Space: rmayormartins/image-enhancer...`);
      const client = await Client.connect("rmayormartins/image-enhancer");

      console.log(`[Server] Sending prediction requests with parameters...`);
      const result = await client.predict("/predict", [
        blob,
        true, // enhance / optimize
        scale,
        dpi,
        dpiValue,
        resize,
        width,
        height
      ]);

      const outputData = result.data[0];
      const outputUrl = typeof outputData === 'object' && outputData !== null && 'url' in outputData 
        ? (outputData as { url: string }).url 
        : (typeof outputData === 'string' ? outputData : null);

      if (!outputUrl) {
         throw new Error("Gradio Space did not return a valid result file.");
      }

      console.log(`[Server] Prediction succeeded. Downloading processed image from: ${outputUrl}`);
      const hfResponse = await fetch(outputUrl);
      if (!hfResponse.ok) {
        throw new Error(`Failed to fetch processed output from HF CDN: ${hfResponse.statusText}`);
      }

      const resBuffer = Buffer.from(await hfResponse.arrayBuffer());
      const resMime = hfResponse.headers.get("content-type") || "image/png";
      const finalBase64 = `data:${resMime};base64,${resBuffer.toString("base64")}`;

      console.log(`[Server] Enhancement fully completed. Sending back data URL.`);
      res.json({ success: true, image: finalBase64 });
    } catch (error: unknown) {
      console.error("[Server] Gradio processing failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Gradio predictions failed";
      res.status(500).json({ 
        error: errorMessage,
        details: String(error)
      });
    }
  });

  // Vite middleware in non-production mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
