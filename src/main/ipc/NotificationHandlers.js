import { BrowserWindow, Notification, ipcMain } from 'electron'

const activeNotifications = new Set()

const focusMainWindow = () => {
  const mainWindow = BrowserWindow.getAllWindows()[0]

  if (!mainWindow) {
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  mainWindow.show()
  mainWindow.focus()
}

const registerNotificationHandlers = () => {
  ipcMain.removeHandler('notifications:show')

  ipcMain.handle('notifications:show', async (_event, notificationData = {}) => {
    console.log('[Postiva] Bildirim isteği geldi:', notificationData)

    if (!Notification.isSupported()) {
      console.error('[Postiva] Bildirimler bu cihazda desteklenmiyor.')

      return {
        ok: false,
        error: 'Bu cihaz Electron bildirimlerini desteklemiyor.'
      }
    }

    const title = String(notificationData.title ?? 'Postiva').trim() || 'Postiva'

    const body =
      String(notificationData.body ?? 'Bir notunun zamanı geldi.').trim() ||
      'Bir notunun zamanı geldi.'

    const notification = new Notification({
      title,
      body,
      silent: Boolean(notificationData.silent),
      timeoutType: 'default'
    })

    activeNotifications.add(notification)

    notification.once('show', () => {
      console.log("[Postiva] Bildirim Windows'a gösterildi.")
    })

    notification.once('failed', (_notificationEvent, error) => {
      console.error('[Postiva] Bildirim başarısız:', error)

      activeNotifications.delete(notification)
    })

    notification.once('close', () => {
      activeNotifications.delete(notification)
    })

    notification.on('click', () => {
      focusMainWindow()
    })

    notification.show()

    return {
      ok: true,
      data: true
    }
  })
}

export default registerNotificationHandlers
