import { useState, type FormEvent } from "react";

type Props = {
  onAdd: (title: string, isSingle: boolean) => void;
  onClose: () => void;
};

/** 画面下部「＋ 追加」から開く追加フォーム。タイトルと単発/繰り返しの2択のみ。 */
export function AddForm({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [isSingle, setIsSingle] = useState(true); // 既定=単発

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, isSingle);
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="sheet-title">項目を追加</h2>
        <input
          className="sheet-input"
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div className="segmented" role="group" aria-label="単発・繰り返しの切り替え">
          <button
            type="button"
            className={isSingle ? "segment segment-active" : "segment"}
            onClick={() => setIsSingle(true)}
          >
            単発
          </button>
          <button
            type="button"
            className={!isSingle ? "segment segment-active" : "segment"}
            onClick={() => setIsSingle(false)}
          >
            繰り返し
          </button>
        </div>
        <div className="sheet-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            キャンセル
          </button>
          <button type="submit" className="btn-primary" disabled={!title.trim()}>
            追加
          </button>
        </div>
      </form>
    </div>
  );
}
