import { useState } from "react";

const boardIcons = ["📌", "📘", "💼", "🚀", "💗", "💡", "🛒", "🎯", "🎨", "💻"];

const boardColors = [
  { value: "purple", label: "Mor" },
  { value: "blue", label: "Mavi" },
  { value: "green", label: "Yeşil" },
  { value: "pink", label: "Pembe" },
  { value: "orange", label: "Turuncu" },
  { value: "yellow", label: "Sarı" },
];

function BoardModal({ board, onClose, onSave, onDelete }) {
  const isEditMode = Boolean(board);

  const [name, setName] = useState(board?.name ?? "");

  const [icon, setIcon] = useState(board?.icon ?? "📌");

  const [color, setColor] = useState(board?.color ?? "purple");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onSave({
      name: trimmedName,
      icon,
      color,
    });
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <section
        className="note-modal board-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="note-modal-heading">
          <div>
            <span>{isEditMode ? "✎" : "📁"}</span>

            <h2>{isEditMode ? "Panoyu Düzenle" : "Yeni Pano"}</h2>
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
            <span>Pano Adı</span>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Örneğin: Yazılım"
              maxLength={40}
              autoFocus
            />

            <small>{name.length}/40</small>
          </label>

          <div className="form-field">
            <span>Simge</span>

            <div className="board-icon-options">
              {boardIcons.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`board-icon-option ${
                    icon === item ? "selected" : ""
                  }`}
                  onClick={() => setIcon(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <span>Renk</span>

            <div className="board-color-options">
              {boardColors.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  title={item.label}
                  className={`board-color-option board-color-${item.value} ${
                    color === item.value ? "selected" : ""
                  }`}
                  onClick={() => setColor(item.value)}
                >
                  {color === item.value ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="board-preview">
            <span className={`board-preview-icon board-preview-${color}`}>
              {icon}
            </span>

            <div>
              <small>Pano önizlemesi</small>

              <strong>{name.trim() || "Yeni Pano"}</strong>
            </div>
          </div>

          <div className="modal-actions">
            {isEditMode && (
              <button
                type="button"
                className="delete-note-button"
                onClick={() => onDelete(board)}
              >
                Panoyu Sil
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
                disabled={!name.trim()}
              >
                {isEditMode ? "Değişiklikleri Kaydet" : "Panoyu Oluştur"}
              </button>
            </div>
          </div>
        </form>

        <div className="modal-decoration">
          <span>✦</span>

          <span>Notlarını düzenli panolarda tut.</span>

          <span>♥</span>
        </div>
      </section>
    </div>
  );
}

export default BoardModal;
