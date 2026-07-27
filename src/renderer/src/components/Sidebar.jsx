function Sidebar({
  boards = [],
  activeView,
  selectedBoardId,
  counts,
  onNavigate,
  onCreateBoard,
  onSelectBoard,
  onEditBoard
}) {
  const navigationItems = [
    {
      id: 'home',
      icon: '🏠',
      label: 'Ana Sayfa',
      count: null
    },
    {
      id: 'today',
      icon: '📅',
      label: 'Bugün',
      count: counts.today
    },
    {
      id: 'overdue',
      icon: '⚠️',
      label: 'Gecikenler',
      count: counts.overdue
    },
    {
      id: 'upcoming',
      icon: '⏰',
      label: 'Yaklaşanlar',
      count: counts.upcoming
    },
    {
      id: 'completed',
      icon: '✅',
      label: 'Tamamlananlar',
      count: counts.completed
    },
    {
      id: 'trash',
      icon: '🗑️',
      label: 'Çöp Kutusu',
      count: counts.trash
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Ayarlar',
      count: null
    }
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">📝</div>

        <div>
          <h1>Postiva</h1>
          <span>Pixel Notes</span>
        </div>
      </div>

      <nav className="main-navigation">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`navigation-item ${activeView === item.id ? 'active' : ''}`}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}

            {item.count !== null && <strong>{item.count}</strong>}
          </button>
        ))}
      </nav>

      <div className="pixel-divider">
        <span>♥</span>
      </div>

      <section className="boards-section">
        <div className="section-title">
          <h2>Panolar</h2>
          <button type="button" onClick={onCreateBoard} aria-label="Yeni pano oluştur">
            +
          </button>
        </div>
        <div className="boards-list">
          {boards.length === 0 ? (
            <p className="boards-empty-text">Henüz pano bulunmuyor.</p>
          ) : (
            boards.map((board) => {
              const isActive = activeView === 'board' && selectedBoardId === board.id

              return (
                <div className="board-list-row" key={board.id}>
                  <button
                    type="button"
                    className={`board-item board-item-${board.color} ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectBoard(board.id)}
                  >
                    <span>{board.icon}</span>

                    <p>{board.name}</p>

                    <strong>{board.noteCount ?? 0}</strong>
                  </button>

                  <button
                    type="button"
                    className="board-edit-button"
                    onClick={() => onEditBoard(board)}
                    aria-label={`${board.name} panosunu düzenle`}
                    title="Panoyu düzenle"
                  >
                    ✎
                  </button>
                </div>
              )
            })
          )}
        </div>
      </section>

      <div className="sidebar-decoration">
        <div className="pixel-cat">ฅ^•ﻌ•^ฅ</div>

        <div className="speech-bubble">Notlarını unutma! ♥</div>
      </div>
    </aside>
  )
}

export default Sidebar
