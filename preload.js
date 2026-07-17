const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ezlauncher', {
    fetchServers: (ip) => ipcRenderer.invoke('fetch-servers', ip),
    checkServer: (params) => ipcRenderer.invoke('check-server', params),
    downloadModpack: (params) => ipcRenderer.invoke('download-modpack', params),
    launchGame: (params) => ipcRenderer.invoke('launch-game', params),
    logConnection: (params) => ipcRenderer.invoke('log-connection', params),
    getHistory: (serverIp) => ipcRenderer.invoke('get-history', serverIp),
    addNotification: (params) => ipcRenderer.invoke('add-notification', params),
    getNotifications: () => ipcRenderer.invoke('get-notifications'),
    markNotificationRead: (id) => ipcRenderer.invoke('mark-notification-read', id)
});
