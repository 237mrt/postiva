function SettingsView({
  settings,
  isLoading = false,
  onToggleNotifications,
  onToggleNotificationSound,
  onNotificationVolumeChange,
  onToggleMinimizeToTray,
  onToggleOpenAtLogin,
  onResetSettings
}) {
  const notificationsEnabled = settings?.notificationsEnabled ?? true

  const notificationSoundEnabled = settings?.notificationSoundEnabled ?? true

  const notificationVolume = Number(settings?.notificationVolume ?? 0.5)

  const notificationVolumePercent = Math.round(notificationVolume * 100)

  const minimizeToTray = settings?.minimizeToTray ?? true

  const openAtLogin = settings?.openAtLogin ?? true

  return (
    <section className="settings-view">
      <header className="settings-header">
        <div>
          <span className="settings-icon">⚙️</span>

          <div>
            <h2>Ayarlar</h2>
            <p>Postiva deneyimini kendine göre düzenle.</p>
          </div>
        </div>
      </header>

      <div className="settings-content">
        <article className="settings-card settings-card-column">
          <div className="settings-card-heading">
            <div>
              <h3>Bildirimler</h3>

              <p>Notlarının zamanı geldiğinde Postiva sana hatırlatma göndersin.</p>
            </div>

            <span className="settings-card-icon">🔔</span>
          </div>

          <div className="settings-option">
            <div>
              <strong>Bildirimleri etkinleştir</strong>

              <span>Özel Postiva ve Windows bildirimlerini kontrol eder.</span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              aria-label="Bildirimleri aç veya kapat"
              className={`settings-switch ${notificationsEnabled ? 'active' : ''}`}
              disabled={isLoading || !settings}
              onClick={onToggleNotifications}
            >
              <span />
            </button>
          </div>

          <div
            className={`settings-option ${!notificationsEnabled ? 'settings-option-disabled' : ''}`}
          >
            <div>
              <strong>Bildirim sesi</strong>

              <span>Hatırlatma geldiğinde Postiva’nın özel sesi çalsın.</span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notificationSoundEnabled}
              aria-label="Bildirim sesini aç veya kapat"
              className={`settings-switch ${notificationSoundEnabled ? 'active' : ''}`}
              disabled={isLoading || !settings || !notificationsEnabled}
              onClick={onToggleNotificationSound}
            >
              <span />
            </button>
          </div>

          <div
            className={`settings-option settings-volume-option ${
              !notificationsEnabled || !notificationSoundEnabled ? 'settings-option-disabled' : ''
            }`}
          >
            <div>
              <strong>Ses seviyesi</strong>

              <span>Postiva bildirim sesinin yüksekliğini ayarla.</span>
            </div>

            <div className="settings-volume-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={notificationVolume}
                aria-label="Bildirim sesi seviyesi"
                disabled={
                  isLoading || !settings || !notificationsEnabled || !notificationSoundEnabled
                }
                onChange={(event) => {
                  onNotificationVolumeChange(Number(event.target.value))
                }}
              />

              <output>%{notificationVolumePercent}</output>
            </div>
          </div>
        </article>

        <article className="settings-card settings-card-column">
          <div className="settings-card-heading">
            <div>
              <h3>Uygulama</h3>

              <p>Postiva’nın kapanma ve arka planda çalışma davranışını düzenle.</p>
            </div>

            <span className="settings-card-icon">🖥️</span>
          </div>

          <div className="settings-option">
            <div>
              <strong>Sistem tepsisine küçült</strong>

              <span>X düğmesine basıldığında Postiva arka planda çalışmaya devam etsin.</span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={minimizeToTray}
              aria-label="Postiva'yı sistem tepsisine küçült"
              className={`settings-switch ${minimizeToTray ? 'active' : ''}`}
              disabled={isLoading || !settings}
              onClick={onToggleMinimizeToTray}
            >
              <span />
            </button>
          </div>

          <div className="settings-option">
            <div>
              <strong>Windows açılışında çalıştır</strong>

              <span>Bilgisayar açıldığında Postiva otomatik olarak başlatılsın.</span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={openAtLogin}
              aria-label="Postiva'yı Windows açılışında çalıştır"
              className={`settings-switch ${openAtLogin ? 'active' : ''}`}
              disabled={isLoading || !settings}
              onClick={onToggleOpenAtLogin}
            >
              <span />
            </button>
          </div>
        </article>

        <div className="settings-reset-section">
          <div>
            <strong>Varsayılan ayarlara dön</strong>

            <span>Bildirim, ses ve uygulama tercihlerini ilk değerlerine geri getirir.</span>
          </div>

          <button type="button" disabled={isLoading || !settings} onClick={onResetSettings}>
            ↻ Ayarları Sıfırla
          </button>
        </div>
      </div>
    </section>
  )
}

export default SettingsView
