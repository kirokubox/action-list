import { useState, type FormEvent } from "react";
import { MenuItem } from "../types";

type Props = {
  /** 編集対象。null のときは新規追加。 */
  target: MenuItem | null;
  onSave: (title: string) => void;
  onDelete?: () => void;
  onClose: () => void;
};

/**
 * 定番メニューの新規追加・名称編集・削除シート。
 * 右列では名称を2行までで省略するため、全文はこの入力欄で確認・修正できるようにしている。
 */
export function MenuEditSheet({ target, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(target?.title ?? "");
  const trimmed = title.trim();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed) return;
    onSave(trimmed);
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="sheet-title">{target ? "定番メニューを編集" : "定番メニューを追加"}</h2>
        <input
          className="sheet-input"
          type="text"
          placeholder="行動の名前（例：食器洗い）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div className="sheet-actions sheet-actions-split">
          {target && onDelete && (
            <button type="button" className="btn-danger" onClick={onDelete}>
              定番から削除
            </button>
          )}
          <div className="sheet-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn-primary" disabled={!trimmed}>
              保存
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
