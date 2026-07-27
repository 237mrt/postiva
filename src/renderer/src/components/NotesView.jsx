import StickyNote from './StickyNote'

function NotesView({
  title,
  icon,
  notes,
  boards = [],
  totalCount,
  searchQuery,
  isLoading,
  emptyTitle,
  emptyMessage,
  showNewNoteButton,
  showNightMessage,
  onNewNote,
  onEdit,
  onToggleComplete,
  onTogglePin,
  sortMode,
  onSortChange,
  currentTime
}) {
  const isSearching = Boolean(searchQuery.trim())

  return (
    <section className="board-area">
      <div className="board-heading">
        <div className="board-heading-title">
          <span>{icon}</span>
          <h2>{title}</h2>
        </div>

        <div className="board-heading-controls">
          <p>
            {isLoading
              ? 'Yükleniyor...'
              : isSearching
                ? `${notes.length} sonuç`
                : `${totalCount} post-it`}
          </p>

          <label className="notes-sort-field">
            <span>Sırala</span>

            <select
              value={sortMode}
              onChange={(event) => onSortChange(event.target.value)}
              aria-label="Notları sırala"
            >
              <option value="updated-desc">Son güncellenen</option>

              <option value="created-desc">En yeni oluşturulan</option>

              <option value="due-asc">Son tarihi yaklaşan</option>

              <option value="priority-desc">Önceliği yüksek</option>

              <option value="title-asc">Başlığa göre</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="notes-loading">
          <span>✦</span>
          <p>Notların hazırlanıyor...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="view-empty-state">
          <span>{isSearching ? '🔍' : icon}</span>

          <h3>{isSearching ? 'Sonuç bulunamadı' : emptyTitle}</h3>

          <p>{isSearching ? `“${searchQuery}” ile eşleşen bir not bulunamadı.` : emptyMessage}</p>

          {!isSearching && showNewNoteButton && (
            <button type="button" className="empty-state-new-note" onClick={onNewNote}>
              + İlk Notunu Oluştur
            </button>
          )}
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => {
            const board = boards.find((item) => item.id === note.boardId) ?? null

            return (
              <StickyNote
                key={note.id}
                note={note}
                board={board}
                currentTime={currentTime}
                onEdit={onEdit}
                onToggleComplete={onToggleComplete}
                onTogglePin={onTogglePin}
              />
            )
          })}

          {!isSearching && showNewNoteButton && (
            <button className="empty-note" type="button" onClick={onNewNote}>
              <span>+</span>
              Yeni not ekle
            </button>
          )}
        </div>
      )}

      {showNightMessage && (
        <div className="night-message">
          <span className="moon">☾</span>

          <div>
            <h3>Gece Hatırlatması</h3>

            <p>Yarın daha iyi bir sen için bugün elinden geleni yap.</p>
          </div>

          <span className="stars">✦ ˚ ✧</span>
        </div>
      )}
    </section>
  )
}

export default NotesView
