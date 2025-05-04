// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getImages: () => ipcRenderer.invoke('get-images'),
  getDonePdfs: () => ipcRenderer.invoke("get-done-pdfs"),
  getImageList: () => ipcRenderer.invoke('get-image-list'),
  searchImages: (query) => ipcRenderer.invoke('search-images', query),
});
