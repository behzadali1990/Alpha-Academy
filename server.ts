import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { authRouter } from "./server/auth";
import { fibRouter } from "./server/fib";
import { promoRouter } from "./server/promo";
import { coursesRouter } from "./server/courses";
import { adminRouter } from "./server/admin";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount real Authentication API router (register, login, me, reset-password, logout)
  app.use("/api/auth", authRouter);

  // Mount subscriptions & lessons routers from authRouter
  app.use("/api/subscriptions", authRouter);
  app.use("/api/lessons", authRouter);
  app.use("/api", authRouter);

  // Mount real FIB Payment API router (create-payment, check-status, verify-and-settle)
  app.use("/api/fib", fibRouter);

  // Mount server-authoritative Promo Codes API router
  app.use("/api/promo", promoRouter);

  // Mount course purchases and database access validation API router
  app.use("/api/courses", coursesRouter);

  // Mount server-authoritative Admin API router (strictly verified via requireAdmin middleware)
  app.use("/api/admin", adminRouter);

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", appName: "Alpha Academy", theme: "Arctic Badini" });
  });

  // AI Kurdish Tutor endpoint using Gemini API
  app.post("/api/ai-tutor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY missing",
          message: "کلیلا GEMINI_API_KEY نەهاتیە بکارئینان. تە تکایە ل سێتینگێن AI Studio زێدە بکە."
        });
      }

      const { question, courseTitle, lessonTitle, studentName } = req.body;

      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `
تۆ مامۆستایەکێ ژیر و دۆستانەیی ل ئەکادیمیا ئاڵفا (Alpha Academy Platform).
ئاخفتنا تە ب زمانێ کوردی یێ دەڤۆکا بادینی (Badini Kurdish) دێ بیت.
تۆ ل سەر وانەیا "${lessonTitle || "گشتی"}" ژ کۆرسێ "${courseTitle || "گشتی"}" بەرسڤا قوتابی "${studentName || "قوتابیێ بەڕێز"}" ددەی.
پێویستە بەرسڤێن تە ڕوون، زانستی، هاندەر و ب دیالێکتا بادینی بن ب ئاخفتنێن وەک: (بخێر بێی، زۆر باشە، هەڤالێ هێژا، ئاریشا تە دێ بەرسڤ دەین...).
ئەگەر پرسیار دەرڤەی بابەتێ وانەیێ بوو، بەرسڤەکا کورت بدە و هەوڵبدە قوتابی بزڤڕینی بۆ بابەتێ وانەیێ.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `${systemInstruction}\n\nپرسیارا قوتابی: ${question}` }] }
        ]
      });

      const reply = response.text || "ببوورە، نەشێم بەرسڤێ زوو بگەهینم. دووبارە تاقیبکەڤە.";

      return res.json({ reply });
    } catch (err: any) {
      console.error("Error calling Gemini API:", err);
      return res.status(500).json({
        error: "Failed to generate tutor response",
        reply: "ئاریشەک پەیدابوو د ئاخفتنا مامۆستایێ ژیردا. هیڤیدارین پاشتر تاقیبکەیەوە."
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Alpha Academy Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
