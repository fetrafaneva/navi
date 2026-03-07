import { app, BrowserWindow, ipcMain, screen } from "electron";
import * as path from "path";
import * as dotenv from "dotenv";

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
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));
  }

  ipcMain.on("move-window", (_event, { x, y }) => {
    mainWindow?.setPosition(x, y);
  });

  ipcMain.on("quit-app", () => {
    app.quit();
  });

  // ✅ Claude appelé ici dans Node.js — zéro CORS
  ipcMain.handle("claude-ask", async (_event, { messages, context }) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.CLAUDE_API_KEY || "",
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 150,
          system: `Tu es Navi, une assistante anime mignonne sur le bureau Windows.
Tu parles en français, de façon courte et amicale (2-3 phrases max).
Utilise des emojis avec modération. Sois utile et positive !
Contexte : ${context || "L'utilisateur utilise son ordinateur."}`,
          messages,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || response.statusText);
      }
      const data = await response.json();
      return { success: true, reply: data.content[0].text };
    } catch (error: any) {
      console.error("[Claude] Erreur :", error.message);
      return { success: false, error: error.message };
    }
  });

  // ✅ ElevenLabs appelé ici dans Node.js — zéro CORS
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
