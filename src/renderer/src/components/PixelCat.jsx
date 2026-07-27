function PixelCat() {
  return (
    <div className="sidebar-cat-container" aria-hidden="true">
      <svg className="sidebar-pixel-cat" viewBox="0 0 72 56" shapeRendering="crispEdges">
        {/* Sol kulak */}
        <rect className="pixel-cat-outline" x="8" y="4" width="18" height="18" />

        <rect className="pixel-cat-fur" x="12" y="8" width="10" height="12" />

        <rect className="pixel-cat-ear" x="14" y="10" width="6" height="8" />

        {/* Sağ kulak */}
        <rect className="pixel-cat-outline" x="46" y="4" width="18" height="18" />

        <rect className="pixel-cat-fur" x="50" y="8" width="10" height="12" />

        <rect className="pixel-cat-ear" x="52" y="10" width="6" height="8" />

        {/* Yüz dışı */}
        <rect className="pixel-cat-outline" x="4" y="16" width="64" height="34" />

        {/* Yüz içi */}
        <rect className="pixel-cat-fur" x="8" y="20" width="56" height="26" />

        {/* Gözler */}
        <rect className="pixel-cat-feature" x="20" y="28" width="6" height="6" />

        <rect className="pixel-cat-feature" x="46" y="28" width="6" height="6" />

        {/* Yanaklar */}
        <rect className="pixel-cat-cheek" x="12" y="36" width="8" height="4" />

        <rect className="pixel-cat-cheek" x="52" y="36" width="8" height="4" />

        {/* Burun */}
        <rect className="pixel-cat-nose" x="34" y="34" width="4" height="4" />

        {/* Ağız */}
        <rect className="pixel-cat-feature" x="30" y="40" width="4" height="4" />

        <rect className="pixel-cat-feature" x="38" y="40" width="4" height="4" />

        <rect className="pixel-cat-feature" x="34" y="38" width="4" height="4" />
      </svg>

      <span className="sidebar-cat-shadow" />
    </div>
  )
}

export default PixelCat
