import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  notes: {
    list: () => ipcRenderer.invoke('notes:list'),

    listDeleted: () => ipcRenderer.invoke('notes:list-deleted'),

    create: (noteData) => ipcRenderer.invoke('notes:create', noteData),

    update: (noteId, noteData) => ipcRenderer.invoke('notes:update', noteId, noteData),

    moveToTrash: (noteId) => ipcRenderer.invoke('notes:move-to-trash', noteId),

    restore: (noteId) => ipcRenderer.invoke('notes:restore', noteId),

    permanentlyDelete: (noteId) => ipcRenderer.invoke('notes:permanently-delete', noteId)
  },

  boards: {
    list: () => ipcRenderer.invoke('boards:list'),

    create: (boardData) => ipcRenderer.invoke('boards:create', boardData),

    update: (boardId, boardData) => ipcRenderer.invoke('boards:update', boardId, boardData),

    delete: (boardId) => ipcRenderer.invoke('boards:delete', boardId)
  },

  notifications: {
    show: (notificationData) => ipcRenderer.invoke('notifications:show', notificationData)
  },

  settings: {
    get: () => ipcRenderer.invoke('settings:get'),

    update: (settingsPatch) => ipcRenderer.invoke('settings:update', settingsPatch),

    reset: () => ipcRenderer.invoke('settings:reset')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('[Postiva] Preload API oluşturulamadı:', error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
