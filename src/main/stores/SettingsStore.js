import { promises as fs } from 'fs'
import { join } from 'path'

const DEFAULT_SETTINGS = Object.freeze({
  notificationsEnabled: true,
  notificationSoundEnabled: true,
  notificationVolume: 0.45,
  minimizeToTray: true,
  openAtLogin: false
})

class SettingsStore {
  constructor(userDataPath) {
    this.userDataPath = userDataPath
    this.settingsFilePath = join(userDataPath, 'settings.json')
    this.settings = { ...DEFAULT_SETTINGS }
  }

  async initialize() {
    await fs.mkdir(this.userDataPath, {
      recursive: true
    })

    try {
      const fileContent = await fs.readFile(this.settingsFilePath, 'utf8')
      const savedSettings = JSON.parse(fileContent)

      this.settings = this.normalizeSettings(savedSettings)
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.settings = { ...DEFAULT_SETTINGS }
        await this.save()

        return
      }

      console.error('[Postiva] Ayar dosyası okunamadı:', error)

      await this.backupCorruptedFile()

      this.settings = { ...DEFAULT_SETTINGS }
      await this.save()
    }
  }

  async getAll() {
    return {
      ...this.settings
    }
  }

  async update(settingsPatch = {}) {
    this.settings = this.normalizeSettings({
      ...this.settings,
      ...settingsPatch
    })

    await this.save()

    return this.getAll()
  }

  async reset() {
    this.settings = { ...DEFAULT_SETTINGS }

    await this.save()

    return this.getAll()
  }

  normalizeSettings(settings = {}) {
    const volume = Number(settings.notificationVolume)

    return {
      notificationsEnabled:
        typeof settings.notificationsEnabled === 'boolean'
          ? settings.notificationsEnabled
          : DEFAULT_SETTINGS.notificationsEnabled,

      notificationSoundEnabled:
        typeof settings.notificationSoundEnabled === 'boolean'
          ? settings.notificationSoundEnabled
          : DEFAULT_SETTINGS.notificationSoundEnabled,

      notificationVolume: Number.isFinite(volume)
        ? Math.min(1, Math.max(0, volume))
        : DEFAULT_SETTINGS.notificationVolume,

      minimizeToTray:
        typeof settings.minimizeToTray === 'boolean'
          ? settings.minimizeToTray
          : DEFAULT_SETTINGS.minimizeToTray,

      openAtLogin:
        typeof settings.openAtLogin === 'boolean'
          ? settings.openAtLogin
          : DEFAULT_SETTINGS.openAtLogin
    }
  }

  async save() {
    const temporaryFilePath = `${this.settingsFilePath}.tmp`

    await fs.writeFile(temporaryFilePath, JSON.stringify(this.settings, null, 2), 'utf8')

    await fs.rename(temporaryFilePath, this.settingsFilePath)
  }

  async backupCorruptedFile() {
    try {
      await fs.access(this.settingsFilePath)

      const backupPath = join(this.userDataPath, `settings-corrupted-${Date.now()}.json`)

      await fs.copyFile(this.settingsFilePath, backupPath)
    } catch {
      // Dosya yoksa yedeklenecek bir şey bulunmaz.
    }
  }
}

export { DEFAULT_SETTINGS }
export default SettingsStore
