const ALLOWED_SETTING_KEYS = new Set([
  'notificationsEnabled',
  'notificationSoundEnabled',
  'notificationVolume',
  'minimizeToTray',
  'openAtLogin'
])

class SettingsService {
  constructor(settingsStore, electronApp) {
    this.settingsStore = settingsStore
    this.electronApp = electronApp
  }

  async getSettings() {
    return this.settingsStore.getAll()
  }

  async updateSettings(settingsPatch) {
    this.validateSettingsPatch(settingsPatch)

    const currentSettings = await this.settingsStore.getAll()

    const nextSettings = {
      ...currentSettings,
      ...settingsPatch
    }

    if (Object.prototype.hasOwnProperty.call(settingsPatch, 'openAtLogin')) {
      this.applyOpenAtLogin(Boolean(nextSettings.openAtLogin))
    }

    return this.settingsStore.update(settingsPatch)
  }

  async resetSettings() {
    this.applyOpenAtLogin(false)

    return this.settingsStore.reset()
  }

  async applySavedSystemSettings() {
    const settings = await this.settingsStore.getAll()

    this.applyOpenAtLogin(settings.openAtLogin)

    return settings
  }

  validateSettingsPatch(settingsPatch) {
    if (!settingsPatch || typeof settingsPatch !== 'object' || Array.isArray(settingsPatch)) {
      throw new Error('Geçerli bir ayar nesnesi gönderilmelidir.')
    }

    const settingKeys = Object.keys(settingsPatch)

    for (const key of settingKeys) {
      if (!ALLOWED_SETTING_KEYS.has(key)) {
        throw new Error(`Desteklenmeyen ayar: ${key}`)
      }
    }

    const booleanSettings = [
      'notificationsEnabled',
      'notificationSoundEnabled',
      'minimizeToTray',
      'openAtLogin'
    ]

    for (const key of booleanSettings) {
      if (
        Object.prototype.hasOwnProperty.call(settingsPatch, key) &&
        typeof settingsPatch[key] !== 'boolean'
      ) {
        throw new Error(`${key} ayarı true veya false olmalıdır.`)
      }
    }

    if (Object.prototype.hasOwnProperty.call(settingsPatch, 'notificationVolume')) {
      const volume = Number(settingsPatch.notificationVolume)

      if (!Number.isFinite(volume) || volume < 0 || volume > 1) {
        throw new Error('Bildirim sesi seviyesi 0 ile 1 arasında olmalıdır.')
      }
    }
  }

  applyOpenAtLogin(openAtLogin) {
    /*
     * Geliştirme modunda bu ayarı uygularsak Windows,
     * Postiva yerine electron.exe dosyasını başlangıca
     * ekleyebilir. Bu nedenle gerçek sistem ayarı yalnızca
     * paketlenmiş uygulamada uygulanır.
     */
    if (!this.electronApp.isPackaged) {
      return
    }

    if (process.platform !== 'win32' && process.platform !== 'darwin') {
      return
    }

    this.electronApp.setLoginItemSettings({
      openAtLogin,
      path: process.execPath
    })
  }
}

export default SettingsService
