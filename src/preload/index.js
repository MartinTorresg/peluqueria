import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Define las APIs personalizadas que deseas exponer al proceso del renderizador
const api = {
  send: (channel, data) => {
    // Whitelist de canales para enviar mensajes
    const validSendChannels = ['print-content', 'otroCanalPermitido']
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel, func) => {
    // Whitelist de canales para recibir mensajesa
    const validReceiveChannels = ['fromMain', 'otroCanalPermitido']
    if (validReceiveChannels.includes(channel)) {
      // Elimina cualquier listener existente en este canal para evitar duplicados
      ipcRenderer.removeAllListeners(channel)
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
}

// Verifica si el aislamiento de contexto está habilitado
if (process.contextIsolated) {
  try {
    // Suponiendo que `electronAPI` contiene las funciones que necesitas, lo expones directamente
    contextBridge.exposeInMainWorld('electron', {
      invoke: async (channel, ...args) => {
        return await ipcRenderer.invoke(channel, ...args);
      }
    });
    // Exponer tu API personalizada al mundo principal
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('posPrinter', {
      print: (args) => ipcRenderer.invoke('print', args)
    })
  } catch (error) {
    console.error('Error al exponer las APIs:', error)
  }
} else {
  // Si el aislamiento de contexto no está habilitado, adjunta directamente al objeto window
  window.electron = electronAPI // Asegúrate de que esto es lo que quieres, podría no ser necesario
  window.api = api
}
