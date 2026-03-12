import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("navi", {
  // window
  moveWindow: (x: number, y: number) =>
    ipcRenderer.send("move-window", { x, y }),
  quitApp: () => ipcRenderer.send("quit-app"),

  // TTS
  ttsSpeak: (text: string) => ipcRenderer.invoke("tts-speak", { text }),

  // Claude
  claudeAsk: (messages: any[], context?: string) =>
    ipcRenderer.invoke("claude-ask", { messages, context }),

  // newsapi
  fetchNews: (query: string) => ipcRenderer.invoke("fetch-news", { query }),
});
