const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld('fileApi', {
    openDirectory: () => ipcRenderer.invoke('file:openDirectory'),
})
