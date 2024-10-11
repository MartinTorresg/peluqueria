import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electron', {
  invoke: async (channel, ...args) => {
    console.log(`Invoking IPC channel: ${channel} with args:`, args);
    try {
      const result = await ipcRenderer.invoke(channel, ...args);
      console.log(`IPC response from channel: ${channel}`, result);
      return result;
    } catch (error) {
      console.error(`IPC error from channel: ${channel}`, error);
      throw error;
    }
  },
});
