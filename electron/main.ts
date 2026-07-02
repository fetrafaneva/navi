import { app, BrowserWindow, ipcMain, screen } from "electron";
import * as path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 220,
    height: 420,
    x: width - 240,
    y: height - 440,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      autoplayPolicy: "no-user-gesture-required",
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    if (process.env.NODE_ENV === "development") {
      mainWindow.loadURL("http://localhost:5173");
      mainWindow.webContents.openDevTools({ mode: "detach" });
    } else {
      mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }

    // Désactive le zoom
    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow?.webContents.setZoomFactor(1);
      mainWindow?.webContents.setVisualZoomLevelLimits(1, 1);
    });
    // Empêche le redimensionnement sur les bords de l'écran
    mainWindow.on("will-resize", (e) => {
      e.preventDefault();
    });
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  ipcMain.on("move-window", (_event, { x, y }) => {
    mainWindow?.setPosition(x, y);
  });

  ipcMain.on("quit-app", () => {
    app.quit();
  });

  // Dans createWindow(), remplace le handler :
  ipcMain.handle("claude-ask", async (_event, { messages, context }) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `Tu es Navi, une assistante anime mignonne.
Tu parles en français, de façon courte et amicale (2-3 phrases max). Sois utile et positive !
Contexte : ${context || "L'utilisateur utilise son ordinateur."}`,
      });

      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const lastMessage = messages[messages.length - 1].content;
      const result = await chat.sendMessage(lastMessage);
      const reply = result.response.text();

      return { success: true, reply };
    } catch (error: any) {
      console.error("[Gemini] Erreur :", error.message);
      return { success: false, error: error.message };
    }
  });

  // ElevenLabs dans Node.js — zéro CORS
  ipcMain.handle("tts-speak", async (_event, { text }) => {
    try {
      const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.8 },
          }),
        }
      );
      if (!response.ok) throw new Error(response.statusText);
      const buffer = Buffer.from(await response.arrayBuffer());
      return { success: true, audio: buffer.toString("base64") };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // NewsAPI dans Node.js — zéro CORS
  ipcMain.handle("fetch-news", async (_event, { query }) => {
    try {
      const q = encodeURIComponent(query || "world");
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
      );
      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();

      if (data.status !== "ok" || !data.articles?.length) {
        return { success: false, error: "No articles found" };
      }

      // Résume les 5 titres
      const headlines = data.articles
        .map((a: any, i: number) => `${i + 1}. ${a.title}`)
        .join("\n");

      return { success: true, headlines };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
