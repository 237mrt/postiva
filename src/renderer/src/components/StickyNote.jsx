function StickyNote({ note, currentTime, board, onEdit, onToggleComplete, onTogglePin }) {
  const contentItems = Array.isArray(note.content)
    ? note.content
    : String(note.content ?? '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)

  const priorityLabels = {
    low: {
      label: 'Düşük',
      icon: '🌱'
    },

    normal: {
      label: 'Normal',
      icon: '⭐'
    },

    high: {
      label: 'Yüksek',
      icon: '🔥'
    }
  }

  const priority = priorityLabels[note.priority] ?? priorityLabels.normal

  const getFormattedDueDate = () => {
    if (!note.dueDate) {
      return null
    }

    const dueDate = new Date(note.dueDate)

    if (Number.isNaN(dueDate.getTime())) {
      return null
    }

    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dueDate)
  }

  const formattedDueDate = getFormattedDueDate()

  const dueDateTime = note.dueDate ? new Date(note.dueDate).getTime() : null

  const referenceTime = typeof currentTime === 'number' ? currentTime : 0

  const isOverdue =
    !note.isCompleted &&
    dueDateTime !== null &&
    !Number.isNaN(dueDateTime) &&
    dueDateTime < referenceTime

  const handleEdit = (event) => {
    event?.stopPropagation()
    onEdit(note)
  }

  const handleTogglePin = (event) => {
    event.stopPropagation()
    onTogglePin(note)
  }

  const handleToggleComplete = (event) => {
    event.stopPropagation()
    onToggleComplete(note)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onEdit(note)
    }
  }

  return (
    <article
      className={`sticky-note sticky-note-${note.color} ${
        note.isCompleted ? 'sticky-note-completed' : ''
      } ${note.isPinned ? 'sticky-note-pinned' : ''} ${isOverdue ? 'sticky-note-overdue' : ''}`}
      onClick={handleEdit}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="note-tape" />

      <div className="note-header">
        <h3>{note.title}</h3>

        <div className="sticky-note-actions">
          <button
            type="button"
            className={`pin-note-button ${note.isPinned ? 'active' : ''}`}
            onClick={handleTogglePin}
            aria-label={note.isPinned ? 'Notun sabitlemesini kaldır' : 'Notu sabitle'}
            title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Notu sabitle'}
          >
            {note.isPinned ? '📌' : '📍'}
          </button>

          <button
            type="button"
            className="edit-note-button"
            aria-label={`${note.title} notunu düzenle`}
            title="Notu düzenle"
            onClick={handleEdit}
          >
            •••
          </button>
        </div>
      </div>

      <div className="note-meta">
        {board && (
          <div className={`note-board-badge note-board-${board.color}`}>
            <span>{board.icon}</span>
            <p>{board.name}</p>
          </div>
        )}

        <span className={`priority-badge priority-badge-${note.priority ?? 'normal'}`}>
          {priority.icon} {priority.label}
        </span>

        {formattedDueDate && (
          <span className={`due-date-badge ${isOverdue ? 'due-date-badge-overdue' : ''}`}>
            {isOverdue ? '⚠️ Gecikti' : '📅'} {formattedDueDate}
          </span>
        )}
      </div>

      {contentItems.length > 0 ? (
        <ul>
          {contentItems.map((item, index) => (
            <li key={`${note.id}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="empty-note-content">Bu notta açıklama bulunmuyor.</p>
      )}

      <div className="note-footer">
        <button
          type="button"
          className={`complete-note-button ${note.isCompleted ? 'completed' : ''}`}
          onClick={handleToggleComplete}
        >
          {note.isCompleted ? '✓ Tamamlandı' : '○ Tamamla'}
        </button>

        <strong>{note.isCompleted ? '✨' : (note.decoration ?? '✦')}</strong>
      </div>
    </article>
  )
}

export default StickyNote
