"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("navi", {
  // Phase 1
  moveWindow: (x, y) => electron.ipcRenderer.send("move-window", { x, y }),
  quitApp: () => electron.ipcRenderer.send("quit-app"),
  // Phase 2 — TTS
  ttsSpeak: (text) => electron.ipcRenderer.invoke("tts-speak", { text }),
  // Phase 3 — Claude
  claudeAsk: (messages, context) => electron.ipcRenderer.invoke("claude-ask", { messages, context })
});
