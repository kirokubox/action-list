type Props = {
  title: string;
  body?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

/** はい/いいえの確認シート。「新しい流れ」で左側を空にする前の確認に使う。 */
export function ConfirmSheet({ title, body, confirmLabel, onConfirm, onClose }: Props) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2 className="sheet-title">{title}</h2>
        {body && <p className="sheet-body">{body}</p>}
        <div className="sheet-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            やめる
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
