import { app, BrowserWindow, ipcMain, screen } from "electron";
import * as path from "path";
import * as dotenv from "dotenv";

// Charge les variables .env
dotenv.config();

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 220,
    height: 380,
    x: width - 240,
    y: height - 400,
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

  // ---- Handlers IPC ----

  // Déplacer la fenêtre
  ipcMain.on("move-window", (_event, { x, y }) => {
    mainWindow?.setPosition(x, y);
  });

  // Fermer l'app
  ipcMain.on("quit-app", () => {
    app.quit();
  });

  // 🆕 Fournir la config ElevenLabs au renderer (sans exposer les clés dans le HTML)
  ipcMain.handle("get-voice-config", () => {
    return {
      apiKey: process.env.ELEVENLABS_API_KEY || "",
      voiceId: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
    };
  });
}
