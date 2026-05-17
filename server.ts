import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API setup
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post("/api/inquiry", async (req, res) => {
    const { name, email, message } = req.body;
    console.log(`Inquiry received from ${name} (${email}): ${message}`);
    // In a real app, send an email or save to DB
    res.json({ success: true, message: "Thank you for your inquiry! We will contact you soon." });
  });

  app.post("/api/assistant", async (req, res) => {
    const { prompt } = req.body;
    try {
      const model = "gemini-3-flash-preview";
      const result = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are an AI assistant for Akta Photo Studio. You help clients understand our services (Portrait, Wedding, Commercial, Event) and give photography tips. Keep it professional and elegant.",
        }
      });
      res.json({ response: result.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
