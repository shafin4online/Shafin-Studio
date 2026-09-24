import type { Request, Response } from "express";
import { createApiApp } from "./apiApp";

const app = createApiApp();

export { app };

export default function handler(req: Request, res: Response) {
  try {
    // If incoming request URL does not start with /api, normalize it for the Express router
    if (req.url && !req.url.startsWith("/api")) {
      req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
    }
    return app(req, res);
  } catch (err: unknown) {
    console.error("[Vercel Function Error]:", err);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Serverless execution exception", 
        details: err instanceof Error ? err.message : String(err) 
      });
    }
  }
}
