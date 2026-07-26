function ConfirmDialog({
  title,
  message,
  hint = "Bu işlemi daha sonra geri alabilirsin.",
  confirmText = "Sil",
  cancelText = "Vazgeç",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="confirm-overlay" onMouseDown={onCancel}>
      <section
        className="confirm-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="confirm-icon">🗑️</div>

        <div className="confirm-content">
          <h2 id="confirm-dialog-title">{title}</h2>

          <p>{message}</p>
        </div>

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-cancel-button"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="confirm-delete-button"
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>

        <div className="confirm-decoration">
          <span>✦</span>
          <span>{hint}</span>
          <span>♥</span>
        </div>
      </section>
    </div>
  );
}

export default ConfirmDialog;
