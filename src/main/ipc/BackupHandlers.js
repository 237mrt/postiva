import { BrowserWindow, dialog, ipcMain } from 'electron'

import { writeFile } from 'node:fs/promises'

const createSuccessResponse = (data) => {
  return {
    ok: true,
    data
  }
}

const createErrorResponse = (error) => {
  return {
    ok: false,

    error: error instanceof Error ? error.message : 'Yedekleme işlemi tamamlanamadı.'
  }
}

const createBackupFileName = () => {
  const now = new Date()

  const year = now.getFullYear()

  const month = String(now.getMonth() + 1).padStart(2, '0')

  const day = String(now.getDate()).padStart(2, '0')

  const hour = String(now.getHours()).padStart(2, '0')

  const minute = String(now.getMinutes()).padStart(2, '0')

  return `Postiva-Yedek-${year}-${month}-${day}-${hour}-${minute}.json`
}

const registerBackupHandlers = (backupService) => {
  /*
   * Geliştirme sırasında handler'ın tekrar
   * kaydedilmesini engelliyoruz.
   */
  ipcMain.removeHandler('backup:create-data')

  ipcMain.removeHandler('backup:export')

  /*
   * Yalnızca yedek nesnesini oluşturur.
   * Bu mevcut test fonksiyonumuzdur.
   */
  ipcMain.handle('backup:create-data', async () => {
    try {
      const backupData = await backupService.createBackupData()

      return createSuccessResponse(backupData)
    } catch (error) {
      console.error('[Postiva] Yedek verisi oluşturulamadı:', error)

      return createErrorResponse(error)
    }
  })

  /*
   * Yedek verisini oluşturur, kullanıcıya
   * kayıt konumu seçtirir ve JSON dosyasını yazar.
   */
  ipcMain.handle('backup:export', async (event) => {
    try {
      const backupData = await backupService.createBackupData()

      /*
       * İşlemi yapan pencereyi buluyoruz.
       * Böylece kayıt penceresi Postiva'ya bağlı açılır.
       */
      const parentWindow = BrowserWindow.fromWebContents(event.sender)

      const saveResult = await dialog.showSaveDialog(parentWindow, {
        title: 'Postiva yedeğini kaydet',

        defaultPath: createBackupFileName(),

        buttonLabel: 'Yedeği Kaydet',

        filters: [
          {
            name: 'Postiva Yedek Dosyası',

            extensions: ['json']
          }
        ]
      })

      /*
       * Kullanıcı kayıt penceresini kapattıysa
       * bunu hata olarak değerlendirmiyoruz.
       */
      if (saveResult.canceled || !saveResult.filePath) {
        return createSuccessResponse({
          canceled: true,
          filePath: null
        })
      }

      const jsonContent = JSON.stringify(backupData, null, 2)

      await writeFile(saveResult.filePath, jsonContent, 'utf8')

      console.log(`[Postiva] Yedek oluşturuldu: ${saveResult.filePath}`)

      return createSuccessResponse({
        canceled: false,
        filePath: saveResult.filePath
      })
    } catch (error) {
      console.error('[Postiva] Yedek dosyası kaydedilemedi:', error)

      return createErrorResponse(error)
    }
  })
}

export default registerBackupHandlers
