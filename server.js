// ================================
// server.js — Proxy local pour Claude & ElevenLabs
// Ta clé API reste ici, jamais dans le navigateur
// ================================

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// Sert tes fichiers HTML/CSS/JS statiques
app.use(express.static(__dirname));

// ================================================================
// Route proxy — Claude AI
// ================================================================
app.post("/api/claude", async (req, res) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.CLAUDE_API_KEY,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("[Proxy Claude] Erreur :", error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// Route proxy — ElevenLabs TTS
// ================================================================
app.post("/api/tts/:voiceId", async (req, res) => {
  try {
    const { voiceId } = req.params;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify(req.body),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json(err);
    }

    // Renvoie l'audio directement au navigateur
    res.setHeader("Content-Type", "audio/mpeg");
    response.body.pipe(res);
  } catch (error) {
    console.error("[Proxy ElevenLabs] Erreur :", error);
    res.status(500).json({ error: error.message });
  }
});

// ---- Dmarre le serveur ----
app.listen(PORT, () => {
  console.log(`✅ Navi proxy démarré sur http://localhost:${PORT}`);
  console.log(`Ouvre http://localhost:${PORT}/index.html dans ton navigateur`);
});
