import { app, shell, BrowserWindow, ipcMain, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'
import { optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import NoteStore from './stores/NoteStore'
import NoteService from './services/NoteService'
import registerNoteHandlers from './ipc/NoteHandlers'

import BoardStore from './stores/BoardStore'
import BoardService from './services/BoardService'
import registerBoardHandlers from './ipc/BoardHandlers'

import SettingsStore, { DEFAULT_SETTINGS } from './stores/SettingsStore'
import SettingsService from './services/SettingsService'
import registerSettingsHandlers from './ipc/SettingsHandlers'

import registerNotificationHandlers from './ipc/NotificationHandlers'

import BackupService from './services/BackupService'
import registerBackupHandlers from './ipc/BackupHandlers'

let noteStore
let noteService

let boardStore
let boardService

let settingsStore
let settingsService
let backupService

/*
 * Ana pencere ve sistem tepsisi nesnelerini
 * global olarak saklıyoruz.
 */
let mainWindow = null
let tray = null

/*
 * Kullanıcı gerçekten uygulamadan çıkmak istediğinde
 * true olur.
 */
let isQuitting = false

/*
 * Ayarlar yüklenene kadar varsayılan değerler kullanılır.
 */
let appSettings = {
  ...DEFAULT_SETTINGS
}

const showMainWindow = () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow()
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  mainWindow.show()
  mainWindow.focus()
}

const hideMainWindow = () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return
  }

  mainWindow.hide()
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,

    ...(process.platform === 'linux'
      ? {
          icon
        }
      : {}),

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,

      /*
       * Pencere tepsiye gizlendiğinde bildirim
       * zamanlayıcılarının çalışmaya devam etmesini sağlar.
       */
      backgroundThrottling: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (!isQuitting) {
      mainWindow.show()
    }
  })

  /*
   * Ayarlarda "tepsiye küçült" açıksa X düğmesi
   * uygulamayı kapatmak yerine gizler.
   */
  mainWindow.on('close', (event) => {
    if (isQuitting) {
      return
    }

    if (appSettings.minimizeToTray) {
      event.preventDefault()
      hideMainWindow()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)

    return {
      action: 'deny'
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const createTray = () => {
  if (tray) {
    return
  }

  let trayIcon = nativeImage.createFromPath(icon)

  if (process.platform === 'win32' && !trayIcon.isEmpty()) {
    trayIcon = trayIcon.resize({
      width: 16,
      height: 16
    })
  }

  tray = new Tray(trayIcon.isEmpty() ? icon : trayIcon)

  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Postiva’yı Aç',

      click: () => {
        showMainWindow()
      }
    },

    {
      type: 'separator'
    },

    {
      label: 'Tamamen Çık',

      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('Postiva')
  tray.setContextMenu(trayMenu)

  tray.on('click', () => {
    showMainWindow()
  })
}

if (process.platform === 'win32') {
  app.setName('Postiva')

  app.setAppUserModelId(app.isPackaged ? 'com.237mrt.postiva' : process.execPath)
}

app.on('before-quit', () => {
  isQuitting = true
})

app.whenReady().then(async () => {
  /*
   * Ayar sistemi
   */
  settingsStore = new SettingsStore(app.getPath('userData'))

  await settingsStore.initialize()

  settingsService = new SettingsService(settingsStore, app)

  appSettings = await settingsService.applySavedSystemSettings()

  registerSettingsHandlers(settingsService, {
    onSettingsChanged: (settings) => {
      appSettings = settings
    }
  })

  /*
   * Not sistemi
   */
  noteStore = new NoteStore(app.getPath('userData'))

  await noteStore.initialize()

  noteService = new NoteService(noteStore)

  registerNoteHandlers(noteService)

  /*
   * Pano sistemi
   */
  boardStore = new BoardStore(app.getPath('userData'))

  await boardStore.initialize()

  boardService = new BoardService(boardStore, noteStore)

  registerBoardHandlers(boardService)

  /*
   * Yedekleme sistemi
   */
  backupService = new BackupService(
    noteStore,
    boardStore,
    settingsStore,
    app.getVersion(),
    app.getPath('userData')
  )
  
  registerBackupHandlers(backupService, {
    onBackupRestored: async (restoredSettings) => {
      appSettings = restoredSettings

      settingsService.applyOpenAtLogin(restoredSettings.openAtLogin)
    }
  })

  /*
   * Masaüstü bildirim sistemi
   */
  registerNotificationHandlers()

  /*
   * Geliştirme kısayolları
   */
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  /*
   * Basit IPC bağlantı testi
   */
  ipcMain.on('ping', () => {
    console.log('pong')
  })

  createWindow()
  createTray()

  app.on('activate', () => {
    showMainWindow()
  })
})

/*
 * "Tepsiye küçült" kapalıysa pencere kapandığında
 * uygulamayı tamamen kapatır.
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !appSettings.minimizeToTray) {
    app.quit()
  }
})

app.on('will-quit', () => {
  if (tray && !tray.isDestroyed()) {
    tray.destroy()
  }

  tray = null
})
