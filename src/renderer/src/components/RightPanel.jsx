const formatTime = (dateValue) => {
  if (!dateValue) {
    return '--:--'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return '--:--'
  }

  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatShortDate = (dateValue) => {
  if (!dateValue) {
    return ''
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short'
  }).format(date)
}

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'high':
      return '🔥'

    case 'low':
      return '🌱'

    default:
      return '⭐'
  }
}

function RightPanel({
  todayNotes = [],
  upcomingNotes = [],
  onEdit,
  onToggleComplete,
  onShowToday,
  onShowUpcoming
}) {
  const currentDateLabel = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long'
  }).format(new Date())

  const visibleTodayNotes = todayNotes.slice(0, 5)
  const visibleUpcomingNotes = upcomingNotes.slice(0, 4)

  return (
    <aside className="right-panel">
      <section className="today-section">
        <div className="right-panel-heading">
          <h2>Bugün</h2>

          <button type="button" className="right-panel-link" onClick={onShowToday}>
            {currentDateLabel}
          </button>
        </div>

        {visibleTodayNotes.length === 0 ? (
          <div className="right-panel-empty">
            <span>☕</span>
            <p>Bugün için planlanmış bir not yok.</p>
          </div>
        ) : (
          <div className="tasks">
            {visibleTodayNotes.map((note) => (
              <div className={`task ${note.isCompleted ? 'task-completed' : ''}`} key={note.id}>
                <button
                  type="button"
                  className="task-check-button"
                  aria-label={`${note.title} görevini tamamla`}
                  onClick={() => onToggleComplete(note)}
                >
                  {note.isCompleted ? '✓' : ''}
                </button>

                <button type="button" className="task-content-button" onClick={() => onEdit(note)}>
                  <h3>{note.title}</h3>

                  <span>{formatTime(note.dueDate)}</span>
                </button>

                <strong title={`Öncelik: ${note.priority ?? 'normal'}`}>
                  {getPriorityIcon(note.priority)}
                </strong>
              </div>
            ))}
          </div>
        )}

        {todayNotes.length > 5 && (
          <button type="button" className="right-panel-more-button" onClick={onShowToday}>
            +{todayNotes.length - 5} not daha
          </button>
        )}
      </section>

      <section className="upcoming-section">
        <div className="right-panel-heading">
          <h2>Yaklaşanlar</h2>

          <button type="button" className="right-panel-link" onClick={onShowUpcoming}>
            Tümü
          </button>
        </div>

        {visibleUpcomingNotes.length === 0 ? (
          <div className="right-panel-empty">
            <span>🌙</span>
            <p>Yaklaşan tarihli bir not bulunmuyor.</p>
          </div>
        ) : (
          visibleUpcomingNotes.map((note) => (
            <button
              type="button"
              className="upcoming-item"
              key={note.id}
              onClick={() => onEdit(note)}
            >
              <span>{getPriorityIcon(note.priority)}</span>

              <div>
                <h3>{note.title}</h3>

                <p>
                  {note.priority === 'high'
                    ? 'Yüksek öncelik'
                    : note.priority === 'low'
                      ? 'Düşük öncelik'
                      : 'Normal öncelik'}
                </p>
              </div>

              <strong>{formatShortDate(note.dueDate)}</strong>
            </button>
          ))
        )}
      </section>

      <div className="right-panel-developer">
        <span className="right-panel-developer-line" />

        <span className="right-panel-developer-label">DEV BY</span>

        <strong className="right-panel-developer-name">237MRT</strong>
      </div>
    </aside>
  )
}

export default RightPanel
