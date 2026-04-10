"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("navi", {
  // window
  moveWindow: (x, y) => electron.ipcRenderer.send("move-window", { x, y }),
  quitApp: () => electron.ipcRenderer.send("quit-app"),
  // TTS
  ttsSpeak: (text) => electron.ipcRenderer.invoke("tts-speak", { text }),
  // Claude
  claudeAsk: (messages, context) => electron.ipcRenderer.invoke("claude-ask", { messages, context }),
  // newsapi
  fetchNews: (query) => electron.ipcRenderer.invoke("fetch-news", { query })
});
