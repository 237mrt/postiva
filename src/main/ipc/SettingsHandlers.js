import { ipcMain } from 'electron'

const createSuccessResponse = (data) => ({
  ok: true,
  data
})

const createErrorResponse = (error) => ({
  ok: false,
  error: error instanceof Error ? error.message : 'Ayar işlemi tamamlanamadı.'
})

const registerSettingsHandlers = (settingsService, { onSettingsChanged } = {}) => {
  ipcMain.removeHandler('settings:get')
  ipcMain.removeHandler('settings:update')
  ipcMain.removeHandler('settings:reset')

  ipcMain.handle('settings:get', async () => {
    try {
      const settings = await settingsService.getSettings()

      return createSuccessResponse(settings)
    } catch (error) {
      console.error('[Postiva] Ayarlar alınamadı:', error)

      return createErrorResponse(error)
    }
  })

  ipcMain.handle('settings:update', async (_event, settingsPatch) => {
    try {
      const settings = await settingsService.updateSettings(settingsPatch)

      onSettingsChanged?.(settings)

      return createSuccessResponse(settings)
    } catch (error) {
      console.error('[Postiva] Ayarlar güncellenemedi:', error)

      return createErrorResponse(error)
    }
  })

  ipcMain.handle('settings:reset', async () => {
    try {
      const settings = await settingsService.resetSettings()

      onSettingsChanged?.(settings)

      return createSuccessResponse(settings)
    } catch (error) {
      console.error('[Postiva] Ayarlar sıfırlanamadı:', error)

      return createErrorResponse(error)
    }
  })
}

export default registerSettingsHandlers
