import { useState } from "react";

const noteColors = [
  { name: "purple", label: "Mor" },
  { name: "yellow", label: "Sarı" },
  { name: "pink", label: "Pembe" },
  { name: "blue", label: "Mavi" },
  { name: "green", label: "Yeşil" },
  { name: "orange", label: "Turuncu" },
];

const priorities = [
  {
    value: "low",
    label: "Düşük",
    icon: "🌱",
  },
  {
    value: "normal",
    label: "Normal",
    icon: "⭐",
  },
  {
    value: "high",
    label: "Yüksek",
    icon: "🔥",
  },
];

const toDateTimeLocal = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

function NoteModal({
  note,
  boards = [],
  defaultBoardId = null,
  onClose,
  onSave,
  onDelete,
}) {
  const isEditMode = Boolean(note);

  const getInitialContent = () => {
    if (!note?.content) {
      return "";
    }

    if (Array.isArray(note.content)) {
      return note.content.join("\n");
    }

    return String(note.content);
  };

  const [title, setTitle] = useState(note?.title ?? "");

  const [boardId, setBoardId] = useState(note?.boardId ?? defaultBoardId ?? "");

  const [content, setContent] = useState(getInitialContent);

  const [color, setColor] = useState(note?.color ?? "yellow");

  const [priority, setPriority] = useState(note?.priority ?? "normal");

  const [dueDate, setDueDate] = useState(toDateTimeLocal(note?.dueDate));

  const [isCompleted, setIsCompleted] = useState(Boolean(note?.isCompleted));

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      return;
    }

    const contentItems = trimmedContent
      ? trimmedContent
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    onSave({
      title: trimmedTitle,
      content: contentItems,
      boardId: boardId || null,
      color,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      isCompleted,
    });
  };

  const handleDelete = () => {
    if (!note) {
      return;
    }

    onDelete(note);
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <section
        className="note-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="note-modal-heading">
          <div>
            <span>✎</span>

            <h2>{isEditMode ? "Notu Düzenle" : "Yeni Not"}</h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Pencereyi kapat"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Başlık</span>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Not başlığını yaz..."
              maxLength={100}
              autoFocus
            />

            <small>{title.length}/100</small>
          </label>

          <label className="form-field">
            <span>Açıklama</span>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={`Her satıra bir madde yazabilirsin.\nÖrneğin:\nMatematik ödevini bitir\nSoruları kontrol et`}
              maxLength={500}
              rows={7}
            />

            <small>{content.length}/500</small>
          </label>

          <label className="form-field">
            <span>Pano</span>

            <select
              className="board-select"
              value={boardId}
              onChange={(event) => setBoardId(event.target.value)}
            >
              <option value="">Panosuz Not</option>

              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.icon} {board.name}
                </option>
              ))}
            </select>
          </label>

          <div className="form-field">
            <span>Renk</span>

            <div className="color-options">
              {noteColors.map((noteColor) => (
                <button
                  type="button"
                  key={noteColor.name}
                  className={`color-option color-option-${noteColor.name} ${
                    color === noteColor.name ? "selected" : ""
                  }`}
                  onClick={() => setColor(noteColor.name)}
                  aria-label={`${noteColor.label} not rengi`}
                  title={noteColor.label}
                >
                  {color === noteColor.name && "✓"}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <span>Öncelik</span>

            <div className="priority-options">
              {priorities.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={`priority-option priority-${item.value} ${
                    priority === item.value ? "selected" : ""
                  }`}
                  onClick={() => setPriority(item.value)}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="form-field">
            <span>Son Tarih</span>

            <div className="due-date-field">
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />

              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate("")}
                  aria-label="Son tarihi kaldır"
                >
                  ×
                </button>
              )}
            </div>
          </label>

          <label className="completed-checkbox">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(event) => setIsCompleted(event.target.checked)}
            />

            <span className="completed-checkbox-box">
              {isCompleted ? "✓" : ""}
            </span>

            <div>
              <strong>Tamamlandı</strong>

              <small>Notu tamamlanmış olarak işaretle</small>
            </div>
          </label>

          <div className="modal-actions">
            {isEditMode && (
              <button
                type="button"
                className="delete-note-button"
                onClick={handleDelete}
              >
                Notu Sil
              </button>
            )}

            <div className="modal-actions-right">
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={!title.trim()}
              >
                {isEditMode ? "Değişiklikleri Kaydet" : "Notu Oluştur"}
              </button>
            </div>
          </div>
        </form>

        <div className="modal-decoration">
          <span>✦</span>

          <span>Notlarını yakala, fikirlerini sakla.</span>

          <span>♥</span>
        </div>
      </section>
    </div>
  );
}

export default NoteModal;
