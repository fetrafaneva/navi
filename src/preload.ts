import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("navi", {
  // Phase 1
  moveWindow: (x: number, y: number) =>
    ipcRenderer.send("move-window", { x, y }),
  quitApp: () => ipcRenderer.send("quit-app"),

  // Phase 2 — TTS via Node.js
  ttsSpeak: (text: string, voiceId?: string) =>
    ipcRenderer.invoke("tts-speak", { text, voiceId }),

  // Phase 3 — Claude via Node.js
  claudeAsk: (messages: any[], context?: string) =>
    ipcRenderer.invoke("claude-ask", { messages, context }),
});
