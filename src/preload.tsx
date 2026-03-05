import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("navi", {
  // Phase 1
  moveWindow: (x: number, y: number) =>
    ipcRenderer.send("move-window", { x, y }),
  quitApp: () => ipcRenderer.send("quit-app"),

  // récupère la config voix depuis le main process
  getVoiceConfig: () => ipcRenderer.invoke("get-voice-config"),
});
