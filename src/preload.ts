import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("navi", {
  // Phase 1
  moveWindow: (x: number, y: number) =>
    ipcRenderer.send("move-window", { x, y }),
  quitApp: () => ipcRenderer.send("quit-app"),

  // Phase 2
  getVoiceConfig: () => ipcRenderer.invoke("get-voice-config"),

  // Phase 3
  getClaudeConfig: () => ipcRenderer.invoke("get-claude-config"),
});
