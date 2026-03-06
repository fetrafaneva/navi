import { app, BrowserWindow, ipcMain, screen } from "electron";
import * as path from "path";
import * as dotenv from "dotenv";

// Charge les variables .env
dotenv.config();

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    // ---- Taille de la fenêtre ----
    width: 220,
    height: 420,

    // ---- Position : coin bas-droit ----
    x: width - 240,
    y: height - 440,

    // ---- Fenêtre flottante transparente ----
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

  // ---- Charge l'interface React ----
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));
  }

  // ================================================================
  // Handlers IPC
  // ================================================================

  // Phase 1 — Déplacer la fenêtre par drag & drop
  ipcMain.on("move-window", (_event, { x, y }) => {
    mainWindow?.setPosition(x, y);
  });

  // Phase 1 — Fermer l'application
  ipcMain.on("quit-app", () => {
    app.quit();
  });

  // Phase 2 — Fournir la config ElevenLabs TTS au renderer
  ipcMain.handle("get-voice-config", () => {
    return {
      apiKey: process.env.ELEVENLABS_API_KEY || "",
      voiceId: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
    };
  });

  // Phase 3 — Fournir la config Claude AI au renderer
  ipcMain.handle("get-claude-config", () => {
    return {
      apiKey: process.env.CLAUDE_API_KEY || "",
    };
  });
}

// ---- Démarrage de l'app ----
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ---- Fermeture de l'app ----
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
