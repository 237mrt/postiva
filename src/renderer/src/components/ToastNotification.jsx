import { useEffect } from 'react'

const prioritySettings = {
  low: {
    icon: '🌱',
    label: 'Düşük öncelik'
  },

  normal: {
    icon: '⭐',
    label: 'Normal öncelik'
  },

  high: {
    icon: '🔥',
    label: 'Yüksek öncelik'
  }
}

function ToastNotification({ notification, onClose, onOpen, onComplete }) {
  const note = notification?.note

  const priority = prioritySettings[note?.priority] ?? prioritySettings.normal

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onClose()
    }, 8000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [notification?.key])

  if (!note) {
    return null
  }

  const formattedTime = note.dueDate
    ? new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(note.dueDate))
    : ''

  return (
    <div className="postiva-toast-layer" aria-live="assertive" aria-atomic="true">
      <section className={`postiva-toast postiva-toast-${note.color ?? 'purple'}`}>
        <div className="postiva-toast-header">
          <div className="postiva-toast-brand">
            <span>✦</span>

            <div>
              <strong>POSTIVA</strong>
              <small>Hatırlatma</small>
            </div>
          </div>

          <button
            type="button"
            className="postiva-toast-close"
            onClick={onClose}
            aria-label="Bildirimi kapat"
          >
            ×
          </button>
        </div>

        <div className="postiva-toast-content">
          <div className="postiva-toast-icon">{priority.icon}</div>

          <div className="postiva-toast-message">
            <span>{priority.label}</span>

            <h3>{note.title}</h3>

            <p>
              Bu notun zamanı geldi.
              {formattedTime && (
                <>
                  {' '}
                  Planlanan saat: <strong>{formattedTime}</strong>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="postiva-toast-actions">
          <button type="button" className="postiva-toast-open" onClick={() => onOpen(note)}>
            ✎ Notu Aç
          </button>

          <button type="button" className="postiva-toast-complete" onClick={() => onComplete(note)}>
            ✓ Tamamla
          </button>
        </div>

        <div className="postiva-toast-progress">
          <span />
        </div>

        <div className="postiva-toast-decoration">
          <span>✦</span>
          <span>Görevini unutma!</span>
          <span>♥</span>
        </div>
      </section>
    </div>
  )
}

export default ToastNotification
