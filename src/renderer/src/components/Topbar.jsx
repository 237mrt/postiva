function Topbar({
  onNewNote,
  showNewNote = true,
  searchPlaceholder = 'Notlarda ara...',
  searchQuery = '',
  onSearchChange
}) {
  return (
    <header className="topbar">
      <div className="search-box">
        <span>⌕</span>

        <input
          type="text"
          value={searchQuery}
          placeholder={searchPlaceholder}
          onChange={(event) => onSearchChange?.(event.target.value)}
        />

        {searchQuery && (
          <button
            type="button"
            className="clear-search-button"
            aria-label="Aramayı temizle"
            onClick={() => onSearchChange?.('')}
          >
            ×
          </button>
        )}
      </div>

      {showNewNote && (
        <button className="new-note-button" type="button" onClick={onNewNote}>
          + Yeni Not
        </button>
      )}

      <button className="topbar-icon" type="button" aria-label="Görünümü değiştir">
        ▦
      </button>

      <button className="topbar-icon" type="button" aria-label="Ayarlar">
        ⚙
      </button>
    </header>
  )
}

export default Topbar
