const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ezlauncher', {
    fetchServers: () => ipcRenderer.invoke('fetch-servers'),
    checkServer: (params) => ipcRenderer.invoke('check-server', params),
    downloadModpack: (params) => ipcRenderer.invoke('download-modpack', params),
    launchGame: (params) => ipcRenderer.invoke('launch-game', params),
    logConnection: (params) => ipcRenderer.invoke('log-connection', params),
    getSavedServers: () => ipcRenderer.invoke('get-saved-servers'),
    addServer: (params) => ipcRenderer.invoke('add-server', params),
    removeServer: (ip) => ipcRenderer.invoke('remove-server', ip),
    getNotifications: () => ipcRenderer.invoke('get-notifications'),
    markNotificationRead: (id) => ipcRenderer.invoke('mark-notification-read', id),
    addNotification: (params) => ipcRenderer.invoke('add-notification', params)
});
