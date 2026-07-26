function TrashNoteCard({ note, onRestore, onPermanentDelete }) {
  if (!note) {
    return null;
  }

  const contentItems = Array.isArray(note.content)
    ? note.content
    : String(note.content ?? "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

  const deletedDate = note.deletedAt
    ? new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(note.deletedAt))
    : "Tarih bulunamadı";

  return (
    <article
      className={`sticky-note sticky-note-${
        note.color ?? "yellow"
      } trash-note-card`}
    >
      <div className="note-tape" />

      <div className="note-header">
        <h3>{note.title ?? "Başlıksız Not"}</h3>

        <span className="trash-icon">🗑️</span>
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

      <p className="trash-deleted-at">Silinme: {deletedDate}</p>

      <div className="trash-note-actions">
        <button
          type="button"
          className="restore-note-button"
          onClick={() => onRestore(note)}
        >
          ↶ Geri Yükle
        </button>

        <button
          type="button"
          className="permanent-delete-button"
          onClick={() => onPermanentDelete(note)}
        >
          Kalıcı Sil
        </button>
      </div>
    </article>
  );
}

export default TrashNoteCard;
