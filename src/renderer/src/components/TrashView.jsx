import TrashNoteCard from "./TrashNoteCard";

function TrashView({
  notes = [],
  totalCount = 0,
  searchQuery = "",
  isLoading,
  onRestore,
  onPermanentDelete,
}) {
  const safeNotes = Array.isArray(notes) ? notes.filter(Boolean) : [];

  const isSearching = Boolean(searchQuery.trim());

  return (
    <section className="trash-view">
      <div className="trash-heading">
        <div>
          <span>🗑️</span>

          <div>
            <h2>Çöp Kutusu</h2>

            <p>
              Silinen notlarını geri yükleyebilir veya kalıcı olarak
              silebilirsin.
            </p>
          </div>
        </div>

        <strong>
          {isSearching ? `${safeNotes.length} sonuç` : `${totalCount} not`}
        </strong>
      </div>

      {isLoading ? (
        <div className="notes-loading">
          <span>✦</span>
          <p>Çöp Kutusu hazırlanıyor...</p>
        </div>
      ) : safeNotes.length === 0 ? (
        <div className="trash-empty">
          <span>{isSearching ? "🔍" : "✨"}</span>

          <h3>{isSearching ? "Sonuç bulunamadı" : "Çöp Kutusu boş"}</h3>

          <p>
            {isSearching
              ? `“${searchQuery}” ile eşleşen silinmiş bir not yok.`
              : "Silinen notlar burada görünecek."}
          </p>
        </div>
      ) : (
        <div className="notes-grid trash-grid">
          {safeNotes.map((note) => (
            <TrashNoteCard
              key={note.id}
              note={note}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TrashView;
