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

import registerNotificationHandlers from './ipc/NotificationHandlers'

let noteStore
let noteService

let boardStore
let boardService

/*
 * Ana pencere ve sistem tepsisi nesnelerini
 * global olarak saklıyoruz.
 *
 * Tray değişkeni global olmazsa JavaScript'in
 * garbage collector sistemi tarafından silinebilir
 * ve tepsi ikonu kaybolabilir.
 */
let mainWindow = null
let tray = null

/*
 * Kullanıcı gerçekten uygulamadan çıkmak istediğinde
 * true yapılır.
 *
 * Böylece pencerenin close olayı uygulamayı
 * tekrar tepsiye gizlemez.
 */
let isQuitting = false

const showMainWindow = () => {
  /*
   * Ana pencere henüz oluşturulmadıysa
   * veya daha önce yok edildiyse yeniden oluştur.
   */
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow()
    return
  }

  /*
   * Pencere küçültülmüş durumdaysa
   * önce eski boyutuna getir.
   */
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

    /*
     * Linux'ta BrowserWindow ikonu için
     * mevcut icon dosyasını kullan.
     */
    ...(process.platform === 'linux' ? { icon } : {}),

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,

      /*
       * Postiva tepsiye gizlendiğinde renderer
       * zamanlayıcılarının yavaşlatılmasını engeller.
       *
       * Böylece not bildirimlerini kontrol eden
       * setInterval çalışmaya devam eder.
       */
      backgroundThrottling: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    /*
     * Uygulama kapanma sürecinde değilse
     * pencereyi kullanıcıya göster.
     */
    if (!isQuitting) {
      mainWindow.show()
    }
  })

  /*
   * Kullanıcı pencerenin X düğmesine bastığında
   * uygulamayı kapatmak yerine tepsiye gizle.
   */
  mainWindow.on('close', (event) => {
    if (isQuitting) {
      return
    }

    event.preventDefault()
    hideMainWindow()
  })

  /*
   * Pencere gerçekten yok edildiğinde
   * eski referansı temizle.
   *
   * Normal X işleminde pencere yok edilmez,
   * sadece gizlenir.
   */
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)

    return {
      action: 'deny'
    }
  })

  /*
   * Geliştirme ortamında Vite sunucusunu,
   * paketlenmiş uygulamada HTML dosyasını yükle.
   */
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const createTray = () => {
  /*
   * Tepsi ikonu daha önce oluşturulduysa
   * tekrar oluşturma.
   */
  if (tray) {
    return
  }

  let trayIcon = nativeImage.createFromPath(icon)

  /*
   * Windows tepsi alanında daha dengeli görünmesi
   * için ikonu 16x16 boyutuna getiriyoruz.
   */
  if (process.platform === 'win32' && !trayIcon.isEmpty()) {
    trayIcon = trayIcon.resize({
      width: 16,
      height: 16
    })
  }

  /*
   * nativeImage oluşturulamazsa doğrudan
   * dosya yolunu kullan.
   */
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
        /*
         * Bu değer true olduğu için BrowserWindow
         * close olayı artık pencereyi gizlemeyecek.
         */
        isQuitting = true

        app.quit()
      }
    }
  ])

  tray.setToolTip('Postiva')
  tray.setContextMenu(trayMenu)

  /*
   * Tepsi ikonuna normal tıklanınca
   * Postiva penceresini aç.
   */
  tray.on('click', () => {
    showMainWindow()
  })
}

if (process.platform === 'win32') {
  app.setName('Postiva')

  app.setAppUserModelId(app.isPackaged ? 'com.237mrt.postiva' : process.execPath)
}

/*
 * app.quit() çağrıldığında pencerelerin
 * gerçekten kapanabilmesi için işareti ayarla.
 */
app.on('before-quit', () => {
  isQuitting = true
})

app.whenReady().then(async () => {
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
   * Masaüstü bildirim sistemi
   */
  registerNotificationHandlers()

  /*
   * Geliştirme kısayollarını etkinleştir.
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

  /*
   * Önce pencereyi, ardından tepsi ikonunu oluştur.
   */
  createWindow()
  createTray()

  /*
   * macOS Dock ikonuna tıklanması veya
   * uygulamanın yeniden etkinleştirilmesi durumunda
   * mevcut pencereyi göster.
   */
  app.on('activate', () => {
    showMainWindow()
  })
})

/*
 * Tüm pencereler kapandığında otomatik app.quit()
 * çağırmıyoruz.
 *
 * Çünkü Postiva sistem tepsisinde çalışmaya
 * devam edecek.
 */
app.on('window-all-closed', () => {
  /*
   * Uygulama yalnızca tepsi menüsündeki
   * "Tamamen Çık" seçeneğiyle kapanır.
   */
})

/*
 * Uygulama gerçekten kapanırken tepsi ikonunu
 * işletim sisteminden temizle.
 */
app.on('will-quit', () => {
  if (tray && !tray.isDestroyed()) {
    tray.destroy()
  }

  tray = null
})
