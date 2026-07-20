import { useRef, type ChangeEvent } from "react";

type Props = {
  onExport: () => void;
  onImportFile: (file: File) => void;
  onClose: () => void;
};

/** ヘッダー右の「⋯」メニュー。JSONの取り込み・書き出しのみ。 */
export function MenuPanel({ onExport, onImportFile, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onImportFile(file);
    e.target.value = ""; // 同じファイルを続けて選び直せるようにリセット
    onClose();
  }

  return (
    <div className="menu-overlay" onClick={onClose}>
      <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="menu-item" onClick={handleImportClick}>
          JSONを取り込む
        </button>
        <button
          type="button"
          className="menu-item"
          onClick={() => {
            onExport();
            onClose();
          }}
        >
          JSONを書き出す
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden-file-input"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
