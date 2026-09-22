import express from "express";
import { taskRouter, vault, apiSelector } from "./apiManager/index";

export function createApiApp() {
  const app = express();

  // Support high-resolution photos
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API router for server-side Gradio delegation
  app.post("/api/enhance", async (req, res) => {
    try {
      const {
        image,
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

      const [meta, base64Data] = image.split(',');
      const mime = meta.match(/data:([^;]+);/)?.[1] || "image/png";
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: mime });

      const { Client } = await import("@gradio/client");
      const client = await Client.connect("rmayormartins/image-enhancer");
      const result = await client.predict("/predict", [
        blob,
        true,
        scale,
        dpi,
        dpiValue,
        resize,
        width,
        height
      ]);

      const outputData = (result as { data: unknown[] }).data[0];
      const outputUrl = typeof outputData === 'object' && outputData !== null && 'url' in outputData 
        ? (outputData as { url: string }).url 
        : (typeof outputData === 'string' ? outputData : null);

      if (!outputUrl) {
         throw new Error("Gradio Space did not return a valid result file.");
      }

      const hfResponse = await fetch(outputUrl);
      if (!hfResponse.ok) {
        throw new Error(`Failed to fetch processed output from HF CDN: ${hfResponse.statusText}`);
      }

      const resBuffer = Buffer.from(await hfResponse.arrayBuffer());
      const resMime = hfResponse.headers.get("content-type") || "image/png";
      const finalBase64 = `data:${resMime};base64,${resBuffer.toString("base64")}`;

      res.json({ success: true, image: finalBase64 });
    } catch (error: unknown) {
      console.error("[API] Gradio processing failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Gradio predictions failed";
      res.status(500).json({ 
        error: errorMessage,
        details: String(error)
      });
    }
  });

  // Admin API: Get API pool summary & key statistics
  app.get("/api/admin/api-pool", (req, res) => {
    try {
      const summary = apiSelector.getPoolSummary();
      const keys = vault.getMaskedCredentials();
      res.json({ success: true, summary, keys });
    } catch (err: unknown) {
      console.error("[API] Error fetching pool summary:", err);
      res.json({ 
        success: true, 
        summary: { total: 0, active: 0, cooldown: 0, failed: 0, disabled: 0 }, 
        keys: [],
        warning: String(err)
      });
    }
  });

  // Admin API: Reset all cooldowns back to active
  app.post("/api/admin/api-pool/reset-cooldowns", (req, res) => {
    try {
      vault.resetAllCooldowns();
      const summary = apiSelector.getPoolSummary();
      const keys = vault.getMaskedCredentials();
      res.json({ success: true, message: "All cooldowns reset successfully", summary, keys });
    } catch (err: unknown) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Admin API: Add new Google API key to pool at runtime
  app.post("/api/admin/api-pool/key", (req, res) => {
    try {
      const { apiKey, name, priority } = req.body;
      if (!apiKey || typeof apiKey !== "string") {
        return res.status(400).json({ error: "apiKey string is required" });
      }

      const count = vault.getAllCredentials().length + 1;
      const keyName = name?.trim() || `Google Account ${String(count).padStart(2, '0')}`;
      const newCred = vault.addCredential({
        provider: "google",
        name: keyName,
        apiKey: apiKey.trim(),
        priority: priority || 2
      });

      res.json({ 
        success: true, 
        message: `Registered ${newCred.id} successfully`,
        id: newCred.id,
        summary: apiSelector.getPoolSummary(),
        keys: vault.getMaskedCredentials()
      });
    } catch (err: unknown) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Admin API: Toggle key enabled/disabled
  app.post("/api/admin/api-pool/toggle", (req, res) => {
    try {
      const { id, enabled } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Key id is required" });
      }
      vault.toggleEnable(id, Boolean(enabled));
      res.json({ success: true, summary: apiSelector.getPoolSummary(), keys: vault.getMaskedCredentials() });
    } catch (err: unknown) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Admin API: Bulk add multiple keys
  app.post("/api/admin/api-pool/bulk-keys", (req, res) => {
    try {
      const { rawText, keyList } = req.body;
      let addedCount = 0;
      const existingKeys = new Set(vault.getAllCredentials().map(c => c.apiKey));

      const addSingleKey = (key: string, name?: string) => {
        const trimmed = key.trim();
        if (!trimmed || existingKeys.has(trimmed)) return;
        existingKeys.add(trimmed);
        const count = vault.getAllCredentials().length + 1;
        vault.addCredential({
          provider: "google",
          name: name?.trim() || `Account ${String(count).padStart(2, '0')}`,
          apiKey: trimmed,
          priority: 2
        });
        addedCount++;
      };

      if (Array.isArray(keyList)) {
        for (const item of keyList) {
          if (typeof item === 'string') {
            addSingleKey(item);
          } else if (item && item.apiKey) {
            addSingleKey(item.apiKey, item.name);
          }
        }
      } else if (typeof rawText === 'string') {
        const lines = rawText.split(/[\r\n]+/);
        for (const line of lines) {
          const l = line.trim();
          if (!l) continue;
          if (l.includes(':')) {
            const [name, key] = l.split(':');
            addSingleKey(key, name);
          } else if (l.includes('\t')) {
            const [name, key] = l.split('\t');
            addSingleKey(key, name);
          } else {
            addSingleKey(l);
          }
        }
      }

      res.json({
        success: true,
        message: `${addedCount} টি API কী সফলভাবে পুলে যোগ করা হয়েছে`,
        addedCount,
        summary: apiSelector.getPoolSummary(),
        keys: vault.getMaskedCredentials()
      });
    } catch (err: unknown) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Admin API: Delete a key from pool
  app.delete("/api/admin/api-pool/key/:id", (req, res) => {
    try {
      const { id } = req.params;
      const deleted = vault.deleteCredential(id);
      res.json({
        success: deleted,
        message: deleted ? `${id} ডিলিট করা হয়েছে` : 'কী পাওয়া যায়নি',
        summary: apiSelector.getPoolSummary(),
        keys: vault.getMaskedCredentials()
      });
    } catch (err: unknown) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Admin API: Delete all failed keys
  app.post("/api/admin/api-pool/clear-failed", (req, res) => {
    try {
      const all = vault.getAllCredentials();
      let cleared = 0;
      for (const cred of all) {
        if (cred.status === 'FAILED') {
          vault.deleteCredential(cred.id);
          cleared++;
        }
      }
      res.json({
        success: true,
        message: `${cleared} টি ব্যর্থ (Failed) কী রিমুভ করা হয়েছে`,
        cleared,
        summary: apiSelector.getPoolSummary(),
        keys: vault.getMaskedCredentials()
      });
    } catch (err: unknown) {
      res.status(500).json({ error: String(err) });
    }
  });

  // AI Editor endpoint powered by Centralized API Pool & Task Router
  app.post("/api/ai-editor", async (req, res) => {
    try {
      const { image, leftImage, rightImage, prompt, size, task, dressId, bgHex, clientKeys } = req.body;

      if (!image && !leftImage && !rightImage) {
        return res.status(400).json({ error: "No image provided for AI processing" });
      }

      // If client provided keys saved in browser, ensure they are registered in the current function instance
      if (Array.isArray(clientKeys)) {
        const existingKeys = new Set(vault.getAllCredentials().map(c => c.apiKey));
        for (const k of clientKeys) {
          if (typeof k === 'object' && k && k.apiKey) {
            const trimmed = String(k.apiKey).trim();
            if (trimmed && !existingKeys.has(trimmed)) {
              existingKeys.add(trimmed);
              vault.addCredential({
                provider: 'google',
                name: k.name || 'Client Key',
                apiKey: trimmed,
                priority: 1
              });
            }
          }
        }
      }

      const totalPoolKeys = vault.getAllCredentials().length;
      if (totalPoolKeys === 0) {
        console.warn("[API] No API keys in pool. Returning demo status.");
        return res.json({ 
          success: false, 
          configured: false,
          message: "No Gemini API keys are configured in the pool. Please add a key in .env or the API Manager.",
          prompt 
        });
      }

      // Resolve Task Type
      const taskType = taskRouter.resolveTaskType({ task, size, dressId, bgHex });

      // Execute through Task Router with Automatic Failover
      const execution = await taskRouter.executeWithFailover({
        task: taskType,
        image,
        leftImage,
        rightImage,
        prompt,
        size
      });

      if (execution.success && execution.image) {
        return res.json({ 
          success: true, 
          image: execution.image,
          usedApiId: execution.usedApiId,
          attempts: execution.attempts
        });
      }

      return res.status(200).json({ 
        success: false, 
        error: execution.error || "Model completed without returning an image part.",
        message: execution.error || "Model completed without returning an image part.",
        attempts: execution.attempts
      });
    } catch (error: unknown) {
      console.error("[API] AI generation router error:", error);
      const errorMessage = error instanceof Error ? error.message : "AI generation failed";
      res.status(200).json({ 
        success: false, 
        error: errorMessage,
        message: errorMessage
      });
    }
  });

  return app;
}
