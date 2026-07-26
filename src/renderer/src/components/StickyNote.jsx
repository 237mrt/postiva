function StickyNote({ note, board, onEdit, onToggleComplete }) {
  const contentItems = Array.isArray(note.content)
    ? note.content
    : String(note.content ?? "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

  const priorityLabels = {
    low: {
      label: "Düşük",
      icon: "🌱",
    },
    normal: {
      label: "Normal",
      icon: "⭐",
    },
    high: {
      label: "Yüksek",
      icon: "🔥",
    },
  };

  const priority = priorityLabels[note.priority] ?? priorityLabels.normal;

  const formattedDueDate = note.dueDate
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(note.dueDate))
    : null;

  return (
    <article
      className={`sticky-note sticky-note-${note.color} ${
        note.isCompleted ? "sticky-note-completed" : ""
      }`}
      onClick={() => onEdit(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onEdit(note);
        }
      }}
    >
      <div className="note-tape" />

      <div className="note-header">
        <h3>{note.title}</h3>

        <button
          type="button"
          aria-label={`${note.title} notunu düzenle`}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(note);
          }}
        >
          •••
        </button>
      </div>

      <div className="note-meta">
        {board && (
          <div className={`note-board-badge note-board-${board.color}`}>
            <span>{board.icon}</span>
            <p>{board.name}</p>
          </div>
        )}
        <span
          className={`priority-badge priority-badge-${note.priority ?? "normal"}`}
        >
          {priority.icon} {priority.label}
        </span>

        {formattedDueDate && (
          <span className="due-date-badge">📅 {formattedDueDate}</span>
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
          className={`complete-note-button ${
            note.isCompleted ? "completed" : ""
          }`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleComplete(note);
          }}
        >
          {note.isCompleted ? "✓ Tamamlandı" : "○ Tamamla"}
        </button>

        <strong>{note.isCompleted ? "✨" : note.decoration}</strong>
      </div>
    </article>
  );
}

export default StickyNote;
