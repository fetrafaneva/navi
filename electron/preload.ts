import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("navi", {
  // Phase 1
  moveWindow: (x: number, y: number) =>
    ipcRenderer.send("move-window", { x, y }),
  quitApp: () => ipcRenderer.send("quit-app"),

  // Phase 2 — TTS
  ttsSpeak: (text: string) => ipcRenderer.invoke("tts-speak", { text }),

  // Phase 3 — Claude
  claudeAsk: (messages: any[], context?: string) =>
    ipcRenderer.invoke("claude-ask", { messages, context }),
});
